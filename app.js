(() => {
  const DATA_URL = "data/ru-core.json";
  const STORE_KEY = "wordfreak:v1";
  const TRANSLATION_CACHE_KEY = "wordfreak:ru-en-cache";
  const PIPER_ESM_URL = "https://cdn.jsdelivr.net/npm/@mintplex-labs/piper-tts-web@1.0.4/+esm";
  const PIPER_RU_VOICE_ID = "ru_RU-irina-medium";
  const PIPER_EN_VOICE_ID = "en_US-lessac-medium";

  const els = {
    datasetMeta: document.getElementById("datasetMeta"),
    bandSelect: document.getElementById("bandSelect"),
    settingsToggle: document.getElementById("settingsToggle"),
    settingsPanel: document.getElementById("settingsPanel"),
    rankLabel: document.getElementById("rankLabel"),
    posLabel: document.getElementById("posLabel"),
    ruWord: document.getElementById("ruWord"),
    meaningState: document.getElementById("meaningState"),
    enWord: document.getElementById("enWord"),
    prevBtn: document.getElementById("prevBtn"),
    playBtn: document.getElementById("playBtn"),
    nextBtn: document.getElementById("nextBtn"),
    shuffleBtn: document.getElementById("shuffleBtn"),
    engineSelect: document.getElementById("engineSelect"),
    ruRate: document.getElementById("ruRate"),
    enRate: document.getElementById("enRate"),
    gapMs: document.getElementById("gapMs"),
    wordList: document.getElementById("wordList"),
    listSpacer: document.getElementById("listSpacer"),
    virtualRows: document.getElementById("virtualRows"),
    statusText: document.getElementById("statusText"),
    progressText: document.getElementById("progressText")
  };

  const state = {
    entries: [],
    meta: null,
    order: [],
    currentPos: 0,
    playing: false,
    playToken: 0,
    shuffle: false,
    band: "20000",
    voices: [],
    ttsEngine: "system",
    rowHeight: 42,
    activeAudio: null,
    activeAudioUrl: "",
    audioUnlocked: false,
    unlockAudioContext: null,
    piperModules: new Map(),
    translationCache: loadTranslationCache(),
    scrollTimer: 0,
    programmaticScroll: false,
    raf: 0
  };

  function loadPrefs() {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return;
      const prefs = JSON.parse(raw);
      state.band = String(prefs.band || state.band);
      state.shuffle = Boolean(prefs.shuffle);
      state.currentPos = Number.isFinite(prefs.currentPos) ? prefs.currentPos : 0;
      state.ttsEngine = prefs.ttsEngine || state.ttsEngine;
      els.ruRate.value = prefs.ruRate || els.ruRate.value;
      els.enRate.value = prefs.enRate || els.enRate.value;
      els.gapMs.value = prefs.gapMs || els.gapMs.value;
    } catch (error) {
      console.warn("Preference load failed:", error);
    }
  }

  function savePrefs() {
    const prefs = {
      band: state.band,
      shuffle: state.shuffle,
      currentPos: state.currentPos,
      ttsEngine: state.ttsEngine,
      ruRate: els.ruRate.value,
      enRate: els.enRate.value,
      gapMs: els.gapMs.value
    };
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.warn("Preference save failed:", error);
    }
  }

  function updateShuffleButton() {
    els.shuffleBtn.textContent = state.shuffle ? "Unshuffle" : "Shuffle";
    els.shuffleBtn.setAttribute("aria-pressed", String(state.shuffle));
  }

  function loadTranslationCache() {
    try {
      return JSON.parse(window.localStorage.getItem(TRANSLATION_CACHE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveTranslationCache() {
    try {
      window.localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(state.translationCache));
    } catch (error) {
      console.warn("Translation cache save failed:", error);
    }
  }

  function setStatus(message) {
    els.statusText.textContent = message || "";
  }

  function normalizeSpaces(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function stripForSpeech(value) {
    return normalizeSpaces(String(value || "").replace(/[()]/g, " "));
  }

  function makeSpokenEnglish(value) {
    const clean = stripForSpeech(value);
    return clean.split(";")[0].trim() || clean;
  }

  function currentEntry() {
    return state.entries[state.order[state.currentPos]] || null;
  }

  function bandLimit() {
    return state.band === "all" ? Infinity : Number.parseInt(state.band, 10);
  }

  function buildOrder(preserveWord = "") {
    const limit = bandLimit();
    state.order = state.entries
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => entry.rank <= limit)
      .map(({ index }) => index);

    if (state.shuffle) {
      shuffleArray(state.order);
    }

    if (preserveWord) {
      const found = state.order.findIndex((index) => state.entries[index]?.word === preserveWord);
      state.currentPos = found >= 0 ? found : 0;
    } else {
      state.currentPos = Math.min(Math.max(state.currentPos, 0), Math.max(0, state.order.length - 1));
    }
    updateSpacer();
  }

  function shuffleArray(items) {
    for (let index = items.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [items[index], items[swap]] = [items[swap], items[index]];
    }
  }

  function updateSpacer() {
    els.listSpacer.style.height = `${state.order.length * state.rowHeight}px`;
  }

  function updateFocus() {
    const entry = currentEntry();
    if (!entry) {
      els.ruWord.textContent = "";
      els.enWord.textContent = "";
      els.progressText.textContent = "0 / 0";
      return;
    }

    els.rankLabel.textContent = `#${entry.rank}`;
    els.posLabel.textContent = entry.posLabel || entry.pos?.join(", ") || "";
    els.ruWord.textContent = entry.display || entry.word;
    els.enWord.textContent = entry.en || state.translationCache[entry.word] || "translation pending";
    els.enWord.classList.toggle("missing", !entry.en && !state.translationCache[entry.word]);
    els.meaningState.textContent = entry.translationSource ? "English" : "English pending";
    els.progressText.textContent = `${state.currentPos + 1} / ${state.order.length}`;
    savePrefs();
  }

  function setCurrentPos(pos, options = {}) {
    state.currentPos = Math.min(Math.max(pos, 0), Math.max(0, state.order.length - 1));
    updateFocus();
    renderVisibleRows();
    if (options.scroll !== false) {
      scrollCurrentIntoView(options.align || "near");
    }
  }

  function scrollCurrentIntoView(align = "near") {
    const top = state.currentPos * state.rowHeight;
    const currentTop = els.wordList.scrollTop;
    const currentBottom = currentTop + els.wordList.clientHeight;
    const targetTop = align === "center"
      ? Math.max(0, top - Math.floor(els.wordList.clientHeight / 2))
      : Math.max(0, top - state.rowHeight * 2);

    if (top >= currentTop + state.rowHeight && top + state.rowHeight <= currentBottom - state.rowHeight) {
      return;
    }

    state.programmaticScroll = true;
    els.wordList.scrollTop = targetTop;
    window.setTimeout(() => {
      state.programmaticScroll = false;
    }, 120);
  }

  function renderVisibleRows() {
    if (!state.order.length) return;
    const scrollTop = els.wordList.scrollTop;
    const viewport = els.wordList.clientHeight || 320;
    const overscan = 10;
    const start = Math.max(0, Math.floor(scrollTop / state.rowHeight) - overscan);
    const count = Math.ceil(viewport / state.rowHeight) + overscan * 2;
    const end = Math.min(state.order.length, start + count);
    const rows = [];

    for (let pos = start; pos < end; pos += 1) {
      const entry = state.entries[state.order[pos]];
      const en = entry.en || state.translationCache[entry.word] || "pending";
      const missing = entry.en || state.translationCache[entry.word] ? "" : " missing";
      const current = pos === state.currentPos ? " current" : "";
      rows.push(`
        <button class="word-row${current}" type="button" data-pos="${pos}" style="top:${pos * state.rowHeight}px">
          <span class="word-cell">
            <span class="rank-chip">${entry.rank}</span>
            <span class="ru-text" lang="ru">${escapeHtml(entry.display || entry.word)}</span>
          </span>
          <span class="word-cell">
            <span class="en-text${missing}">${escapeHtml(en)}</span>
          </span>
        </button>
      `);
    }

    els.virtualRows.style.transform = `translateY(${start * state.rowHeight}px)`;
    els.virtualRows.innerHTML = rows.join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function ensureMeaning(entry) {
    if (!entry) return "";
    if (entry.en) return entry.en;
    if (state.translationCache[entry.word]) return state.translationCache[entry.word];

    els.meaningState.textContent = "Translating";
    setStatus(`Translating ${entry.word}`);
    const translated = await translateRuToEn(entry.word);
    if (translated && translated !== entry.word) {
      state.translationCache[entry.word] = translated;
      entry.en = translated;
      entry.sayEn = makeSpokenEnglish(translated);
      entry.translationSource = "live";
      saveTranslationCache();
      updateFocus();
      renderVisibleRows();
      return translated;
    }
    return "";
  }

  async function translateRuToEn(text) {
    const word = normalizeSpaces(text);
    const translators = [
      {
        name: "Lingva",
        run: async () => {
          const url = `https://lingva.ml/api/v1/ru/en/${encodeURIComponent(word)}`;
          const response = await fetch(url, { cache: "no-store" });
          if (!response.ok) throw new Error(`Lingva ${response.status}`);
          const payload = await response.json();
          return normalizeSpaces(payload.translation || "");
        }
      },
      {
        name: "MyMemory",
        run: async () => {
          const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=ru|en`;
          const response = await fetch(url, { cache: "no-store" });
          if (!response.ok) throw new Error(`MyMemory ${response.status}`);
          const payload = await response.json();
          return normalizeSpaces(payload?.responseData?.translatedText || "");
        }
      },
      {
        name: "Google",
        run: async () => {
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ru&tl=en&dt=t&q=${encodeURIComponent(word)}`;
          const response = await fetch(url, { cache: "no-store" });
          if (!response.ok) throw new Error(`Google ${response.status}`);
          const payload = await response.json();
          return Array.isArray(payload?.[0])
            ? normalizeSpaces(payload[0].map((chunk) => chunk?.[0] || "").join(""))
            : "";
        }
      }
    ];

    const failures = [];
    for (const translator of translators) {
      try {
        const translated = await translator.run();
        if (translated) return translated;
      } catch (error) {
        failures.push(`${translator.name}: ${error.message}`);
      }
    }
    console.warn("Translation failed:", failures.join(" | "));
    return "";
  }

  async function ensureAudioUnlocked() {
    if (state.audioUnlocked) return;
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (AudioContextCtor) {
      try {
        if (!state.unlockAudioContext) {
          state.unlockAudioContext = new AudioContextCtor();
        }
        if (state.unlockAudioContext.state === "suspended") {
          await state.unlockAudioContext.resume();
        }
        const sampleRate = state.unlockAudioContext.sampleRate || 22050;
        const buffer = state.unlockAudioContext.createBuffer(1, Math.max(1, Math.floor(sampleRate * 0.03)), sampleRate);
        const source = state.unlockAudioContext.createBufferSource();
        const gain = state.unlockAudioContext.createGain();
        gain.gain.value = 0.0001;
        source.buffer = buffer;
        source.connect(gain);
        gain.connect(state.unlockAudioContext.destination);
        source.start(0);
      } catch (error) {
        console.warn("AudioContext unlock failed:", error);
      }
    }
    state.audioUnlocked = true;
  }

  function stopSpeech() {
    state.playToken += 1;
    state.playing = false;
    els.playBtn.textContent = "Play";
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (state.activeAudio) {
      state.activeAudio.pause();
      state.activeAudio.src = "";
      state.activeAudio = null;
    }
    if (state.activeAudioUrl) {
      URL.revokeObjectURL(state.activeAudioUrl);
      state.activeAudioUrl = "";
    }
  }

  async function speakEntry(entry, token) {
    if (!entry || token !== state.playToken) return;
    const ru = entry.display || entry.word;
    const en = await ensureMeaning(entry);
    if (token !== state.playToken) return;

    setStatus(`#${entry.rank} Russian`);
    await speakText(ru, "ru-RU", Number(els.ruRate.value), token);
    await delay(Number(els.gapMs.value), token);

    const englishSpeech = entry.sayEn || makeSpokenEnglish(en);
    if (englishSpeech && token === state.playToken) {
      setStatus(`#${entry.rank} English`);
      await speakText(englishSpeech, "en-US", Number(els.enRate.value), token);
      await delay(Number(els.gapMs.value), token);
    }
  }

  async function speakText(text, lang, rate, token) {
    if (token !== state.playToken || !text) return;
    if (state.ttsEngine === "piper") {
      try {
        await speakWithPiper(text, lang, token);
        return;
      } catch (error) {
        console.warn("Piper failed, falling back to system TTS:", error);
        setStatus("Piper unavailable, using system voice");
      }
    }
    await speakWithSystemVoice(text, lang, rate, token);
  }

  async function speakWithPiper(text, lang, token) {
    const voiceId = lang.toLowerCase().startsWith("ru") ? PIPER_RU_VOICE_ID : PIPER_EN_VOICE_ID;
    let mod = state.piperModules.get(voiceId);
    if (!mod) {
      mod = await import(`${PIPER_ESM_URL}?voice=${encodeURIComponent(voiceId)}`);
      state.piperModules.set(voiceId, mod);
    }
    if (typeof mod.download === "function") {
      await mod.download(voiceId);
    }
    if (token !== state.playToken) return;
    const wavBlob = await mod.predict({ text: stripForSpeech(text), voiceId });
    if (token !== state.playToken) return;
    await playAudioBlob(wavBlob, token);
  }

  async function playAudioBlob(blob, token) {
    if (state.activeAudioUrl) {
      URL.revokeObjectURL(state.activeAudioUrl);
    }
    const url = URL.createObjectURL(blob);
    const audio = state.activeAudio || new Audio();
    state.activeAudio = audio;
    state.activeAudioUrl = url;
    audio.src = url;
    await audio.play();
    await new Promise((resolve, reject) => {
      audio.onended = resolve;
      audio.onerror = () => reject(new Error("Audio playback failed"));
      const poll = () => {
        if (token !== state.playToken) resolve();
        else window.setTimeout(poll, 80);
      };
      poll();
    });
  }

  async function speakWithSystemVoice(text, lang, rate, token) {
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") {
      throw new Error("Speech synthesis unavailable");
    }
    await refreshVoices();

    return new Promise((resolve, reject) => {
      if (token !== state.playToken) {
        resolve();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(stripForSpeech(text));
      utterance.lang = lang;
      utterance.rate = rate;
      const voice = findVoice(lang);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || lang;
      }
      const timeout = window.setTimeout(() => {
        reject(new Error("Speech did not start"));
      }, 5000);
      utterance.onstart = () => window.clearTimeout(timeout);
      utterance.onend = () => {
        window.clearTimeout(timeout);
        resolve();
      };
      utterance.onerror = (event) => {
        window.clearTimeout(timeout);
        reject(new Error(event.error || "Speech synthesis error"));
      };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    });
  }

  function findVoice(lang) {
    const lower = lang.toLowerCase();
    const prefix = lower.split("-")[0];
    const preferred = state.voices.filter((voice) => {
      const voiceLang = String(voice.lang || "").toLowerCase();
      return voiceLang === lower || voiceLang.startsWith(prefix);
    });
    if (!preferred.length) return null;
    const namePattern = prefix === "ru"
      ? /milena|irina|russian|ru-/i
      : /samantha|ava|alex|english|en-/i;
    return preferred.find((voice) => namePattern.test(voice.name || ""))
      || preferred.find((voice) => voice.localService)
      || preferred[0];
  }

  async function refreshVoices() {
    if (!window.speechSynthesis) return;
    let voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      state.voices = voices;
      return;
    }
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await delayPlain(120);
      voices = window.speechSynthesis.getVoices();
      if (voices.length) {
        state.voices = voices;
        return;
      }
    }
  }

  function delay(ms, token) {
    return new Promise((resolve) => {
      const started = Date.now();
      const tick = () => {
        if (token !== state.playToken || Date.now() - started >= ms) resolve();
        else window.setTimeout(tick, 40);
      };
      tick();
    });
  }

  function delayPlain(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  async function startPlayback() {
    if (state.playing) return;
    await ensureAudioUnlocked();
    state.playing = true;
    const token = state.playToken + 1;
    state.playToken = token;
    els.playBtn.textContent = "Stop";

    try {
      while (state.playing && token === state.playToken && state.currentPos < state.order.length) {
        const entry = currentEntry();
        updateFocus();
        scrollCurrentIntoView("near");
        await speakEntry(entry, token);
        if (token !== state.playToken || !state.playing) break;
        if (state.currentPos >= state.order.length - 1) break;
        setCurrentPos(state.currentPos + 1, { scroll: true });
      }
    } catch (error) {
      setStatus(error.message || "Playback failed");
      console.error(error);
    } finally {
      if (token === state.playToken) {
        state.playing = false;
        els.playBtn.textContent = "Play";
        setStatus("Ready");
      }
    }
  }

  async function loadData() {
    setStatus("Loading Russian deck");
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Data load failed: ${response.status}`);
    const payload = await response.json();
    state.entries = payload.entries || [];
    state.meta = payload.meta || {};
    els.datasetMeta.textContent = `${state.entries.length.toLocaleString()} words`;
    buildOrder();
    updateSpacer();
    updateFocus();
    renderVisibleRows();
    scrollCurrentIntoView("center");
    setStatus("Ready");
  }

  function bindEvents() {
    els.playBtn.addEventListener("click", async () => {
      if (state.playing) {
        stopSpeech();
        setStatus("Paused");
        return;
      }
      await startPlayback();
    });

    els.prevBtn.addEventListener("click", () => {
      stopSpeech();
      setCurrentPos(state.currentPos - 1, { scroll: true });
      setStatus("Ready");
    });

    els.nextBtn.addEventListener("click", () => {
      stopSpeech();
      setCurrentPos(state.currentPos + 1, { scroll: true });
      setStatus("Ready");
    });

    els.shuffleBtn.addEventListener("click", () => {
      const entry = currentEntry();
      state.shuffle = !state.shuffle;
      updateShuffleButton();
      buildOrder(entry?.word || "");
      updateFocus();
      renderVisibleRows();
      scrollCurrentIntoView("center");
      savePrefs();
    });

    els.bandSelect.addEventListener("change", () => {
      const entry = currentEntry();
      state.band = els.bandSelect.value;
      buildOrder(entry?.word || "");
      updateFocus();
      renderVisibleRows();
      scrollCurrentIntoView("center");
      savePrefs();
    });

    els.settingsToggle.addEventListener("click", () => {
      els.settingsPanel.hidden = !els.settingsPanel.hidden;
    });

    els.engineSelect.addEventListener("change", () => {
      state.ttsEngine = els.engineSelect.value;
      savePrefs();
    });

    [els.ruRate, els.enRate, els.gapMs].forEach((input) => {
      input.addEventListener("input", savePrefs);
    });

    els.virtualRows.addEventListener("click", (event) => {
      const row = event.target.closest(".word-row");
      if (!row) return;
      stopSpeech();
      setCurrentPos(Number.parseInt(row.dataset.pos || "0", 10), { scroll: false });
      setStatus("Ready");
    });

    els.wordList.addEventListener("scroll", () => {
      if (state.raf) return;
      state.raf = window.requestAnimationFrame(() => {
        state.raf = 0;
        renderVisibleRows();
      });
      if (state.programmaticScroll || state.playing) return;
      window.clearTimeout(state.scrollTimer);
      state.scrollTimer = window.setTimeout(() => {
        const pos = Math.min(
          Math.max(Math.floor(els.wordList.scrollTop / state.rowHeight), 0),
          Math.max(0, state.order.length - 1)
        );
        setCurrentPos(pos, { scroll: false });
      }, 140);
    });

    window.addEventListener("resize", renderVisibleRows);
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        state.voices = window.speechSynthesis.getVoices();
      };
    }
  }

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    try {
      await navigator.serviceWorker.register("sw.js");
    } catch (error) {
      console.warn("Service worker registration failed:", error);
    }
  }

  async function init() {
    loadPrefs();
    els.bandSelect.value = state.band;
    updateShuffleButton();
    els.engineSelect.value = state.ttsEngine;
    bindEvents();
    await loadData();
    await refreshVoices();
    registerServiceWorker();
  }

  init().catch((error) => {
    setStatus(error.message || "Failed to start");
    console.error(error);
  });
})();
