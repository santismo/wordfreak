(() => {
  const DATA_URL = "data/ru-core.json";
  const STORE_KEY = "wordfreak:v2";
  const TRANSLATION_CACHE_KEY = "wordfreak:ru-en-cache";
  const PIPER_ESM_URL = "https://cdn.jsdelivr.net/npm/@mintplex-labs/piper-tts-web@1.0.4/+esm";
  const PIPER_RU_VOICE_ID = "ru_RU-irina-medium";
  const PIPER_EN_VOICE_ID = "en_US-lessac-medium";
  const PIPER_TARGET_RMS = 0.13;
  const PIPER_MAX_GAIN = 2.4;
  const PIPER_MIN_GAIN = 0.45;
  const PIPER_CACHE_LIMIT = 96;

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
    ruRateValue: document.getElementById("ruRateValue"),
    enRate: document.getElementById("enRate"),
    enRateValue: document.getElementById("enRateValue"),
    gapMs: document.getElementById("gapMs"),
    gapValue: document.getElementById("gapValue"),
    piperAhead: document.getElementById("piperAhead"),
    piperAheadValue: document.getElementById("piperAheadValue"),
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
    activeSource: null,
    activeGain: null,
    audioUnlocked: false,
    audioContext: null,
    piperModules: new Map(),
    piperAudioCache: new Map(),
    piperAudioPending: new Map(),
    translationCache: loadTranslationCache(),
    scrollTimer: 0,
    programmaticScroll: false,
    ruFitRaf: 0,
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
      els.piperAhead.value = prefs.piperAhead || els.piperAhead.value;
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
      gapMs: els.gapMs.value,
      piperAhead: els.piperAhead.value
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

  function updateSettingLabels() {
    els.ruRateValue.textContent = `${Number(els.ruRate.value).toFixed(2)}x`;
    els.enRateValue.textContent = `${Number(els.enRate.value).toFixed(2)}x`;
    els.gapValue.textContent = `${Number.parseInt(els.gapMs.value, 10)} ms`;
    els.piperAheadValue.textContent = els.piperAhead.value;
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

  function clamp(value, min, max) {
    return Math.min(Math.max(Number(value) || 0, min), max);
  }

  function isVerbEntry(entry) {
    return Array.isArray(entry?.pos) && entry.pos.includes("v");
  }

  function makeSpokenEnglish(value, entry = null) {
    const clean = stripForSpeech(value);
    const firstSense = clean.split(/[;,]/)[0].trim();
    const words = firstSense.match(/[A-Za-z]+(?:[-'][A-Za-z]+)?|\d+/g) || [];
    if (!words.length) return firstSense || clean;

    const first = words[0].toLowerCase();
    if (first === "to" && words[1] && isVerbEntry(entry)) {
      const second = words[1].toLowerCase();
      if (["be", "have", "get", "become"].includes(second) && words[2]) {
        return words.slice(0, 3).join(" ");
      }
      return words.slice(0, 2).join(" ");
    }
    return words[0];
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
      els.ruWord.style.fontSize = "";
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
    fitRussianFocusWord();
    savePrefs();
  }

  function fitRussianFocusWord() {
    if (state.ruFitRaf) {
      window.cancelAnimationFrame(state.ruFitRaf);
    }

    state.ruFitRaf = window.requestAnimationFrame(() => {
      state.ruFitRaf = 0;
      const node = els.ruWord;
      if (!node.textContent) return;

      node.style.fontSize = "";
      const maxSize = Number.parseFloat(window.getComputedStyle(node).fontSize) || 48;
      const minSize = 10;
      if (node.scrollWidth <= node.clientWidth) return;

      let low = minSize;
      let high = maxSize;
      let best = minSize;
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const size = (low + high) / 2;
        node.style.fontSize = `${size}px`;
        if (node.scrollWidth <= node.clientWidth) {
          best = size;
          low = size;
        } else {
          high = size;
        }
      }
      node.style.fontSize = `${Math.floor(best)}px`;
    });
  }

  function setCurrentPos(pos, options = {}) {
    state.currentPos = Math.min(Math.max(pos, 0), Math.max(0, state.order.length - 1));
    updateFocus();
    renderVisibleRows();
    if (options.scroll !== false) {
      scrollCurrentIntoView(options.align || "near");
    }
    warmPiperQueue(state.currentPos);
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
      entry.sayEn = makeSpokenEnglish(translated, entry);
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
    try {
      const audioContext = await getAudioContext();
      const sampleRate = audioContext.sampleRate || 22050;
      const buffer = audioContext.createBuffer(1, Math.max(1, Math.floor(sampleRate * 0.03)), sampleRate);
      const source = audioContext.createBufferSource();
      const gain = audioContext.createGain();
      gain.gain.value = 0.0001;
      source.buffer = buffer;
      source.connect(gain);
      gain.connect(audioContext.destination);
      source.start(0);
    } catch (error) {
      console.warn("AudioContext unlock failed:", error);
    }
    state.audioUnlocked = true;
  }

  async function getAudioContext() {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) {
      throw new Error("Web Audio unavailable");
    }
    if (!state.audioContext) {
      state.audioContext = new AudioContextCtor();
    }
    if (state.audioContext.state === "suspended") {
      await state.audioContext.resume();
    }
    return state.audioContext;
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
    if (state.activeSource) {
      try {
        state.activeSource.stop(0);
      } catch {
        // The source may already have ended.
      }
      state.activeSource = null;
    }
    if (state.activeGain) {
      try {
        state.activeGain.disconnect();
      } catch {
        // The gain node may already be disconnected.
      }
      state.activeGain = null;
    }
  }

  async function speakEntry(entry, token) {
    if (!entry || token !== state.playToken) return;
    warmPiperQueue(state.currentPos);
    const ru = entry.display || entry.word;
    const en = await ensureMeaning(entry);
    if (token !== state.playToken) return;

    setStatus(`#${entry.rank} Russian`);
    await speakText(ru, "ru-RU", Number(els.ruRate.value), token);
    warmPiperQueue(state.currentPos + 1);
    await delay(Number(els.gapMs.value), token);

    const englishSpeech = makeSpokenEnglish(en, entry);
    if (englishSpeech && token === state.playToken) {
      setStatus(`#${entry.rank} English`);
      await speakText(englishSpeech, "en-US", Number(els.enRate.value), token);
      warmPiperQueue(state.currentPos + 1);
      await delay(Number(els.gapMs.value), token);
    }
  }

  async function speakText(text, lang, rate, token) {
    if (token !== state.playToken || !text) return;
    if (state.ttsEngine === "piper") {
      try {
        await speakWithPiper(text, lang, rate, token);
        return;
      } catch (error) {
        console.warn("Piper failed, falling back to system TTS:", error);
        setStatus("Piper unavailable, using system voice");
      }
    }
    await speakWithSystemVoice(text, lang, rate, token);
  }

  async function speakWithPiper(text, lang, rate, token) {
    const clip = await getPiperClip(text, lang);
    if (token !== state.playToken || !clip) return;
    await playPiperClip(clip, token, rate);
  }

  function piperVoiceId(lang) {
    return String(lang || "").toLowerCase().startsWith("ru") ? PIPER_RU_VOICE_ID : PIPER_EN_VOICE_ID;
  }

  function piperCacheKey(voiceId, text) {
    return `${voiceId}:${text}`;
  }

  async function loadPiperModule(voiceId) {
    let mod = state.piperModules.get(voiceId);
    if (!mod) {
      mod = await import(`${PIPER_ESM_URL}?voice=${encodeURIComponent(voiceId)}`);
      state.piperModules.set(voiceId, mod);
    }
    if (typeof mod.download === "function") {
      await mod.download(voiceId);
    }
    return mod;
  }

  async function getPiperClip(text, lang) {
    const clean = stripForSpeech(text);
    if (!clean) return null;
    const voiceId = piperVoiceId(lang);
    const key = piperCacheKey(voiceId, clean);
    if (state.piperAudioCache.has(key)) {
      return state.piperAudioCache.get(key);
    }
    if (state.piperAudioPending.has(key)) {
      return state.piperAudioPending.get(key);
    }

    const pending = (async () => {
      const mod = await loadPiperModule(voiceId);
      const wavBlob = await mod.predict({ text: clean, voiceId });
      const clip = await preparePiperClip(wavBlob, voiceId, clean);
      state.piperAudioCache.set(key, clip);
      prunePiperCache();
      return clip;
    })();

    state.piperAudioPending.set(key, pending);
    try {
      return await pending;
    } finally {
      state.piperAudioPending.delete(key);
    }
  }

  async function preparePiperClip(blob, voiceId, text) {
    const clip = {
      blob,
      voiceId,
      text,
      buffer: null,
      gain: 1
    };
    try {
      const audioContext = await getAudioContext();
      const arrayBuffer = await blob.arrayBuffer();
      clip.buffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
      clip.gain = calculatePiperGain(measureAudioStats(clip.buffer));
    } catch (error) {
      console.warn("Piper audio normalization unavailable:", error);
    }
    return clip;
  }

  function measureAudioStats(buffer) {
    let peak = 0;
    let sumSquares = 0;
    let samples = 0;
    let voicedSumSquares = 0;
    let voicedSamples = 0;
    const voicedFloor = 0.012;

    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      const data = buffer.getChannelData(channel);
      for (let index = 0; index < data.length; index += 1) {
        const value = Math.abs(data[index]);
        peak = Math.max(peak, value);
        sumSquares += value * value;
        samples += 1;
        if (value > voicedFloor) {
          voicedSumSquares += value * value;
          voicedSamples += 1;
        }
      }
    }

    const rms = Math.sqrt(sumSquares / Math.max(1, samples));
    const voicedRms = Math.sqrt(voicedSumSquares / Math.max(1, voicedSamples));
    return { peak, rms, voicedRms: voicedSamples ? voicedRms : rms };
  }

  function calculatePiperGain(stats) {
    const rms = stats.voicedRms || stats.rms || PIPER_TARGET_RMS;
    const loudnessGain = PIPER_TARGET_RMS / Math.max(0.001, rms);
    const peakLimit = stats.peak ? 0.98 / stats.peak : PIPER_MAX_GAIN;
    return clamp(Math.min(loudnessGain, peakLimit), PIPER_MIN_GAIN, PIPER_MAX_GAIN);
  }

  function prunePiperCache() {
    while (state.piperAudioCache.size > PIPER_CACHE_LIMIT) {
      const oldestKey = state.piperAudioCache.keys().next().value;
      state.piperAudioCache.delete(oldestKey);
    }
  }

  function warmPiperQueue(startPos = state.currentPos) {
    if (state.ttsEngine !== "piper" || !state.order.length) return;
    const ahead = Math.max(0, Number.parseInt(els.piperAhead.value, 10) || 0);
    const end = Math.min(state.order.length, Math.max(0, startPos) + ahead + 1);

    for (let pos = Math.max(0, startPos); pos < end; pos += 1) {
      const entry = state.entries[state.order[pos]];
      if (!entry) continue;
      const ru = entry.display || entry.word;
      const en = makeSpokenEnglish(entry.en || state.translationCache[entry.word] || "", entry);
      queuePiperClip(ru, "ru-RU");
      if (en) queuePiperClip(en, "en-US");
    }
  }

  function queuePiperClip(text, lang) {
    if (!text) return;
    getPiperClip(text, lang).catch((error) => {
      console.warn("Piper queue failed:", error);
    });
  }

  async function playPiperClip(clip, token, rate) {
    if (token !== state.playToken) return;
    if (!clip.buffer) {
      await playAudioBlob(clip.blob, token, rate, Math.min(1, clip.gain));
      return;
    }

    const audioContext = await getAudioContext();
    if (token !== state.playToken) return;
    const source = audioContext.createBufferSource();
    const gain = audioContext.createGain();
    source.buffer = clip.buffer;
    source.playbackRate.value = clamp(rate || 1, 0.5, 2);
    gain.gain.value = clip.gain;
    source.connect(gain);
    gain.connect(audioContext.destination);
    state.activeSource = source;
    state.activeGain = gain;

    await new Promise((resolve) => {
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        resolve();
      };
      source.onended = finish;
      source.start(0);
      const poll = () => {
        if (token !== state.playToken) finish();
        else window.setTimeout(poll, 60);
      };
      poll();
    });

    if (state.activeSource === source) {
      state.activeSource = null;
    }
    if (state.activeGain === gain) {
      try {
        gain.disconnect();
      } catch {
        // Already disconnected.
      }
      state.activeGain = null;
    }
  }

  async function playAudioBlob(blob, token, rate = 1, volume = 1) {
    if (state.activeAudioUrl) {
      URL.revokeObjectURL(state.activeAudioUrl);
    }
    const url = URL.createObjectURL(blob);
    const audio = state.activeAudio || new Audio();
    state.activeAudio = audio;
    state.activeAudioUrl = url;
    audio.src = url;
    audio.playbackRate = clamp(rate || 1, 0.5, 2);
    audio.volume = clamp(volume, 0, 1);
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
    warmPiperQueue(state.currentPos);

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
      warmPiperQueue(state.currentPos);
      savePrefs();
    });

    els.bandSelect.addEventListener("change", () => {
      const entry = currentEntry();
      state.band = els.bandSelect.value;
      buildOrder(entry?.word || "");
      updateFocus();
      renderVisibleRows();
      scrollCurrentIntoView("center");
      warmPiperQueue(state.currentPos);
      savePrefs();
    });

    els.settingsToggle.addEventListener("click", () => {
      els.settingsPanel.hidden = !els.settingsPanel.hidden;
    });

    els.engineSelect.addEventListener("change", () => {
      state.ttsEngine = els.engineSelect.value;
      savePrefs();
      warmPiperQueue(state.currentPos);
    });

    [els.ruRate, els.enRate, els.gapMs, els.piperAhead].forEach((input) => {
      input.addEventListener("input", () => {
        updateSettingLabels();
        savePrefs();
        if (input === els.piperAhead) {
          warmPiperQueue(state.currentPos);
        }
      });
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

    window.addEventListener("resize", () => {
      renderVisibleRows();
      fitRussianFocusWord();
    });
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
    updateSettingLabels();
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
