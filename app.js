(() => {
  const STORE_KEY = "wordfreak:v2";
  const TRANSLATION_CACHE_KEY = "wordfreak:translation-cache";
  const LEGACY_RU_TRANSLATION_CACHE_KEY = "wordfreak:ru-en-cache";
  const PIPER_ESM_URL = "https://cdn.jsdelivr.net/npm/@mintplex-labs/piper-tts-web@1.0.4/+esm";
  const PIPER_ESM_FALLBACK_URL = "https://esm.sh/@mintplex-labs/piper-tts-web@1.0.4";
  const PIPER_RU_VOICE_ID = "ru_RU-irina-medium";
  const PIPER_EN_VOICE_ID = "en_US-lessac-medium";
  const PIPER_TARGET_RMS = 0.13;
  const PIPER_MAX_GAIN = 2.4;
  const PIPER_MIN_GAIN = 0.45;
  const PIPER_CACHE_LIMIT = 96;
  const PIPER_IMPORT_TIMEOUT_MS = 20000;
  const PIPER_DOWNLOAD_TIMEOUT_MS = 90000;
  const PIPER_PREDICT_TIMEOUT_MS = 45000;
  const BACKGROUND_WAV_SAMPLE_RATE = 24000;
  const LANGUAGES = {
    ru: {
      label: "Russian",
      shortLabel: "RU",
      sourceHead: "Russian",
      dataUrl: "data/ru-core.json",
      speechLang: "ru-RU",
      translateSl: "ru",
      dir: "ltr"
    },
    fa: {
      label: "Farsi",
      shortLabel: "FA",
      sourceHead: "Farsi",
      dataUrl: "data/fa-core.json",
      speechLang: "fa-IR",
      translateSl: "fa",
      dir: "rtl"
    }
  };

  const els = {
    datasetMeta: document.getElementById("datasetMeta"),
    languageSelect: document.getElementById("languageSelect"),
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
    sourceRateLabel: document.getElementById("sourceRateLabel"),
    ruRate: document.getElementById("ruRate"),
    ruRateValue: document.getElementById("ruRateValue"),
    enRate: document.getElementById("enRate"),
    enRateValue: document.getElementById("enRateValue"),
    pageVolume: document.getElementById("pageVolume"),
    pageVolumeValue: document.getElementById("pageVolumeValue"),
    gapMs: document.getElementById("gapMs"),
    gapValue: document.getElementById("gapValue"),
    piperAhead: document.getElementById("piperAhead"),
    piperAheadValue: document.getElementById("piperAheadValue"),
    backgroundAudio: document.getElementById("backgroundAudio"),
    backgroundAudioValue: document.getElementById("backgroundAudioValue"),
    backgroundBatch: document.getElementById("backgroundBatch"),
    backgroundBatchValue: document.getElementById("backgroundBatchValue"),
    backgroundAudioPlayer: document.getElementById("backgroundAudioPlayer"),
    sourceHead: document.getElementById("sourceHead"),
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
    language: "ru",
    currentPos: 0,
    playDirection: 1,
    playing: false,
    playToken: 0,
    shuffle: false,
    band: "20000",
    voices: [],
    ttsEngine: "system",
    rowHeight: 42,
    activeAudio: null,
    activeAudioUrl: "",
    activeBackgroundUrl: "",
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
      if (LANGUAGES[prefs.language]) {
        state.language = prefs.language;
      }
      state.band = String(prefs.band || state.band);
      state.shuffle = Boolean(prefs.shuffle);
      state.currentPos = Number.isFinite(prefs.currentPos) ? prefs.currentPos : 0;
      state.ttsEngine = prefs.ttsEngine || state.ttsEngine;
      els.ruRate.value = prefs.ruRate || els.ruRate.value;
      els.enRate.value = prefs.enRate || els.enRate.value;
      els.pageVolume.value = prefs.pageVolume || els.pageVolume.value;
      els.gapMs.value = prefs.gapMs || els.gapMs.value;
      els.piperAhead.value = prefs.piperAhead || els.piperAhead.value;
      els.backgroundAudio.checked = Boolean(prefs.backgroundAudio);
      els.backgroundBatch.value = prefs.backgroundBatch || els.backgroundBatch.value;
    } catch (error) {
      console.warn("Preference load failed:", error);
    }
  }

  function savePrefs() {
    const prefs = {
      language: state.language,
      band: state.band,
      shuffle: state.shuffle,
      currentPos: state.currentPos,
      ttsEngine: state.ttsEngine,
      ruRate: els.ruRate.value,
      enRate: els.enRate.value,
      pageVolume: els.pageVolume.value,
      gapMs: els.gapMs.value,
      piperAhead: els.piperAhead.value,
      backgroundAudio: els.backgroundAudio.checked,
      backgroundBatch: els.backgroundBatch.value
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
    els.sourceRateLabel.textContent = `${activeLanguage().shortLabel} speed`;
    els.ruRateValue.textContent = `${Number(els.ruRate.value).toFixed(2)}x`;
    els.enRateValue.textContent = `${Number(els.enRate.value).toFixed(2)}x`;
    els.pageVolumeValue.textContent = `${Math.round(pageVolume() * 100)}%`;
    els.gapValue.textContent = `${Number.parseInt(els.gapMs.value, 10)} ms`;
    els.piperAheadValue.textContent = els.piperAhead.value;
    els.backgroundAudioValue.textContent = els.backgroundAudio.checked ? "On" : "Off";
    els.backgroundBatchValue.textContent = els.backgroundBatch.value;
  }

  function loadTranslationCache() {
    try {
      const cache = JSON.parse(window.localStorage.getItem(TRANSLATION_CACHE_KEY) || "{}");
      const legacyRu = JSON.parse(window.localStorage.getItem(LEGACY_RU_TRANSLATION_CACHE_KEY) || "{}");
      Object.entries(legacyRu).forEach(([word, meaning]) => {
        const key = translationCacheKey(word, "ru");
        if (!cache[key] && meaning) {
          cache[key] = meaning;
        }
      });
      return cache;
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

  function activeLanguage() {
    return LANGUAGES[state.language] || LANGUAGES.ru;
  }

  function sourceLangCode() {
    return activeLanguage().speechLang.split("-")[0];
  }

  function normalizeCacheWord(value, language = state.language) {
    const word = normalizeSpaces(value);
    return language === "ru" ? word.toLowerCase().replace(/ё/g, "е") : word;
  }

  function translationCacheKey(value, language = state.language) {
    return `${language}:${normalizeCacheWord(value, language)}`;
  }

  function cachedMeaning(entry) {
    if (!entry) return "";
    return state.translationCache[translationCacheKey(entry.word)]
      || state.translationCache[entry.word]
      || "";
  }

  function setCachedMeaning(entry, meaning) {
    if (!entry || !meaning) return;
    state.translationCache[translationCacheKey(entry.word)] = meaning;
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

  function pageVolume() {
    return clamp(els.pageVolume.value, 0, 1);
  }

  function timeoutError(label, ms) {
    return new Error(`${label} timed out after ${Math.round(ms / 1000)}s`);
  }

  function withTimeout(promise, ms, label) {
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => reject(timeoutError(label, ms)), ms);
      promise.then(
        (value) => {
          window.clearTimeout(timer);
          resolve(value);
        },
        (error) => {
          window.clearTimeout(timer);
          reject(error);
        }
      );
    });
  }

  async function retryAsync(label, attempts, run) {
    let lastError = null;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        return await run(attempt);
      } catch (error) {
        lastError = error;
        console.warn(`${label} attempt ${attempt + 1} failed:`, error);
        if (attempt < attempts - 1) {
          await delayPlain(350 * (attempt + 1));
        }
      }
    }
    throw lastError || new Error(`${label} failed`);
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

    const language = activeLanguage();
    els.rankLabel.textContent = `#${entry.rank}`;
    els.posLabel.textContent = entry.posLabel || entry.pos?.join(", ") || "";
    const sourceText = entry.display || entry.word;
    const meaning = entry.en || cachedMeaning(entry);
    prepareRussianFocusWord(sourceText);
    els.ruWord.lang = sourceLangCode();
    els.ruWord.dir = language.dir;
    els.ruWord.textContent = sourceText;
    els.enWord.textContent = meaning || "translation pending";
    els.enWord.classList.toggle("missing", !meaning);
    els.meaningState.textContent = meaning ? "English" : "English pending";
    els.progressText.textContent = `${state.currentPos + 1} / ${state.order.length}`;
    fitRussianFocusWord({ immediate: true });
    savePrefs();
  }

  function prepareRussianFocusWord(text) {
    const node = els.ruWord;
    node.style.whiteSpace = "nowrap";
    node.style.overflowWrap = "normal";
    node.style.wordBreak = "normal";
    node.style.overflow = "hidden";
    node.style.textOverflow = "clip";
    node.style.fontSize = estimateRussianFocusFontSize(text);
  }

  function estimateRussianFocusFontSize(text) {
    const length = Array.from(String(text || "")).length;
    if (length <= 6) return "";
    if (length <= 9) return "clamp(2rem, 9.5vw, 4.6rem)";
    if (length <= 12) return "clamp(1.65rem, 7.4vw, 3.5rem)";
    if (length <= 15) return "clamp(1.35rem, 6vw, 2.8rem)";
    return "clamp(1.05rem, 4.8vw, 2.25rem)";
  }

  function fitRussianFocusWord(options = {}) {
    if (state.ruFitRaf) {
      window.cancelAnimationFrame(state.ruFitRaf);
      state.ruFitRaf = 0;
    }

    const run = () => {
      state.ruFitRaf = 0;
      const node = els.ruWord;
      if (!node.textContent) return;

      const maxSize = Number.parseFloat(window.getComputedStyle(node).fontSize) || 48;
      const minSize = 8;
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
    };

    if (options.immediate) {
      run();
      return;
    }
    state.ruFitRaf = window.requestAnimationFrame(run);
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
    const language = activeLanguage();
    const langCode = sourceLangCode();
    const scrollTop = els.wordList.scrollTop;
    const viewport = els.wordList.clientHeight || 320;
    const overscan = 10;
    const start = Math.max(0, Math.floor(scrollTop / state.rowHeight) - overscan);
    const count = Math.ceil(viewport / state.rowHeight) + overscan * 2;
    const end = Math.min(state.order.length, start + count);
    const rows = [];

    for (let pos = start; pos < end; pos += 1) {
      const entry = state.entries[state.order[pos]];
      const en = entry.en || cachedMeaning(entry) || "pending";
      const missing = entry.en || cachedMeaning(entry) ? "" : " missing";
      const current = pos === state.currentPos ? " current" : "";
      rows.push(`
        <button class="word-row${current}" type="button" data-pos="${pos}" style="top:${pos * state.rowHeight}px">
          <span class="word-cell">
            <span class="rank-chip">${entry.rank}</span>
            <span class="ru-text" lang="${langCode}" dir="${language.dir}">${escapeHtml(entry.display || entry.word)}</span>
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
    const cached = cachedMeaning(entry);
    if (cached) return cached;

    els.meaningState.textContent = "Translating";
    setStatus(`Translating ${entry.word}`);
    const translated = await translateToEn(entry.word);
    if (translated && translated !== entry.word) {
      setCachedMeaning(entry, translated);
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

  async function translateToEn(text) {
    const word = normalizeSpaces(text);
    const source = activeLanguage().translateSl;
    const translators = [
      {
        name: "Lingva",
        run: async () => {
          const url = `https://lingva.ml/api/v1/${source}/en/${encodeURIComponent(word)}`;
          const response = await fetch(url, { cache: "no-store" });
          if (!response.ok) throw new Error(`Lingva ${response.status}`);
          const payload = await response.json();
          return normalizeSpaces(payload.translation || "");
        }
      },
      {
        name: "MyMemory",
        run: async () => {
          const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${source}|en`;
          const response = await fetch(url, { cache: "no-store" });
          if (!response.ok) throw new Error(`MyMemory ${response.status}`);
          const payload = await response.json();
          return normalizeSpaces(payload?.responseData?.translatedText || "");
        }
      },
      {
        name: "Google",
        run: async () => {
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=en&dt=t&q=${encodeURIComponent(word)}`;
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
    if (els.backgroundAudioPlayer) {
      els.backgroundAudioPlayer.pause();
      els.backgroundAudioPlayer.removeAttribute("src");
      els.backgroundAudioPlayer.load();
    }
    if (state.activeBackgroundUrl) {
      URL.revokeObjectURL(state.activeBackgroundUrl);
      state.activeBackgroundUrl = "";
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
    const language = activeLanguage();
    const source = entry.display || entry.word;
    const en = await ensureMeaning(entry);
    if (token !== state.playToken) return;

    setStatus(`#${entry.rank} ${language.label}`);
    await speakText(source, language.speechLang, Number(els.ruRate.value), token);
    warmPiperQueue(state.currentPos + state.playDirection);
    await delay(Number(els.gapMs.value), token);

    const englishSpeech = makeSpokenEnglish(en, entry);
    if (englishSpeech && token === state.playToken) {
      setStatus(`#${entry.rank} English`);
      await speakText(englishSpeech, "en-US", Number(els.enRate.value), token);
      warmPiperQueue(state.currentPos + state.playDirection);
      await delay(Number(els.gapMs.value), token);
    }
  }

  async function speakText(text, lang, rate, token) {
    if (token !== state.playToken || !text) return;
    if (state.ttsEngine === "piper" && piperVoiceIdForLang(lang)) {
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
    const voiceId = piperVoiceIdForLang(lang);
    if (!voiceId) {
      throw new Error(`No Piper voice for ${lang}`);
    }
    return voiceId;
  }

  function piperVoiceIdForLang(lang) {
    const lower = String(lang || "").toLowerCase();
    if (lower.startsWith("ru")) return PIPER_RU_VOICE_ID;
    if (lower.startsWith("en")) return PIPER_EN_VOICE_ID;
    return "";
  }

  function piperCacheKey(voiceId, text) {
    return `${voiceId}:${text}`;
  }

  async function loadPiperModule(voiceId) {
    const cached = state.piperModules.get(voiceId);
    if (cached) return cached;

    const urls = [
      `${PIPER_ESM_URL}?voice=${encodeURIComponent(voiceId)}`,
      `${PIPER_ESM_FALLBACK_URL}?bundle&voice=${encodeURIComponent(voiceId)}`
    ];
    const mod = await retryAsync(`Piper ${voiceId} load`, urls.length, async (attempt) => {
      const url = urls[attempt] || urls[0];
      const loaded = await withTimeout(import(url), PIPER_IMPORT_TIMEOUT_MS, "Piper module load");
      if (typeof loaded.download === "function") {
        await withTimeout(loaded.download(voiceId), PIPER_DOWNLOAD_TIMEOUT_MS, "Piper voice download");
      }
      return loaded;
    });
    state.piperModules.set(voiceId, mod);
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
      const wavBlob = await retryAsync(`Piper ${voiceId} speech`, 2, () => (
        withTimeout(mod.predict({ text: clean, voiceId }), PIPER_PREDICT_TIMEOUT_MS, "Piper speech")
      ));
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
    const language = activeLanguage();
    const sourceVoiceId = piperVoiceIdForLang(language.speechLang);
    const ahead = Math.max(0, Number.parseInt(els.piperAhead.value, 10) || 0);
    const direction = state.playDirection || 1;
    let pos = Math.min(Math.max(0, startPos), Math.max(0, state.order.length - 1));

    for (let queued = 0; queued <= ahead && pos >= 0 && pos < state.order.length; queued += 1, pos += direction) {
      const entry = state.entries[state.order[pos]];
      if (!entry) continue;
      const source = entry.display || entry.word;
      const en = makeSpokenEnglish(entry.en || cachedMeaning(entry) || "", entry);
      if (sourceVoiceId) queuePiperClip(source, language.speechLang);
      if (en) queuePiperClip(en, "en-US");
    }
  }

  function queuePiperClip(text, lang) {
    if (!text) return;
    getPiperClip(text, lang).catch((error) => {
      console.warn("Piper queue failed:", error);
    });
  }

  async function buildBackgroundBatch(startPos, token) {
    const batchSize = clamp(Number.parseInt(els.backgroundBatch.value, 10) || 32, 8, 96);
    const language = activeLanguage();
    if (!piperVoiceIdForLang(language.speechLang)) {
      throw new Error("Lock audio needs a Piper voice for the selected language");
    }
    const direction = state.playDirection || 1;
    const positions = [];
    for (
      let pos = startPos;
      positions.length < batchSize && pos >= 0 && pos < state.order.length;
      pos += direction
    ) {
      positions.push(pos);
    }
    const chunks = [];
    const timeline = [];
    let cursor = 0;

    for (const pos of positions) {
      if (token !== state.playToken || !state.playing) break;
      const entry = state.entries[state.order[pos]];
      if (!entry) continue;
      const entryStart = cursor;
      setStatus(`Building audio #${entry.rank}`);

      const source = entry.display || entry.word;
      const en = await ensureMeaning(entry);
      const sourceClip = await getPiperClip(source, language.speechLang);
      cursor += appendClipChunk(chunks, sourceClip, Number(els.ruRate.value));
      cursor += appendSilenceChunk(chunks, Number(els.gapMs.value));

      const englishSpeech = makeSpokenEnglish(en, entry);
      if (englishSpeech) {
        const enClip = await getPiperClip(englishSpeech, "en-US");
        cursor += appendClipChunk(chunks, enClip, Number(els.enRate.value));
        cursor += appendSilenceChunk(chunks, Number(els.gapMs.value));
      }
      timeline.push({ pos, start: entryStart, end: cursor });
    }

    if (!chunks.length || !timeline.length) return null;
    return {
      blob: encodeWav(chunks, BACKGROUND_WAV_SAMPLE_RATE),
      timeline,
      nextPos: timeline[timeline.length - 1].pos + direction
    };
  }

  function appendClipChunk(chunks, clip, rate) {
    if (!clip?.buffer) {
      throw new Error("Lock audio needs decoded Piper audio");
    }
    const rendered = renderClipToMono(clip.buffer, rate, clip.gain);
    chunks.push(rendered);
    return rendered.length / BACKGROUND_WAV_SAMPLE_RATE;
  }

  function appendSilenceChunk(chunks, ms) {
    const frames = Math.max(0, Math.round(BACKGROUND_WAV_SAMPLE_RATE * Math.max(0, ms) / 1000));
    if (!frames) return 0;
    chunks.push(new Float32Array(frames));
    return frames / BACKGROUND_WAV_SAMPLE_RATE;
  }

  function renderClipToMono(buffer, rate, gain) {
    const playbackRate = clamp(rate || 1, 0.5, 2);
    const outputFrames = Math.max(1, Math.ceil((buffer.duration / playbackRate) * BACKGROUND_WAV_SAMPLE_RATE));
    const output = new Float32Array(outputFrames);
    const channels = [];
    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      channels.push(buffer.getChannelData(channel));
    }

    for (let outIndex = 0; outIndex < outputFrames; outIndex += 1) {
      const sourceFrame = (outIndex / BACKGROUND_WAV_SAMPLE_RATE) * playbackRate * buffer.sampleRate;
      const left = Math.floor(sourceFrame);
      const right = Math.min(left + 1, buffer.length - 1);
      const mix = sourceFrame - left;
      let sample = 0;
      for (const data of channels) {
        sample += data[left] + (data[right] - data[left]) * mix;
      }
      output[outIndex] = clamp((sample / Math.max(1, channels.length)) * gain, -0.98, 0.98);
    }
    return output;
  }

  function encodeWav(chunks, sampleRate) {
    const frameCount = chunks.reduce((total, chunk) => total + chunk.length, 0);
    const buffer = new ArrayBuffer(44 + frameCount * 2);
    const view = new DataView(buffer);
    writeAscii(view, 0, "RIFF");
    view.setUint32(4, 36 + frameCount * 2, true);
    writeAscii(view, 8, "WAVE");
    writeAscii(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeAscii(view, 36, "data");
    view.setUint32(40, frameCount * 2, true);

    let offset = 44;
    for (const chunk of chunks) {
      for (let index = 0; index < chunk.length; index += 1) {
        const sample = clamp(chunk[index], -1, 1);
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }
    return new Blob([view], { type: "audio/wav" });
  }

  function writeAscii(view, offset, text) {
    for (let index = 0; index < text.length; index += 1) {
      view.setUint8(offset + index, text.charCodeAt(index));
    }
  }

  async function playBackgroundBatch(batch, token) {
    if (!batch || token !== state.playToken) return;
    if (state.activeBackgroundUrl) {
      URL.revokeObjectURL(state.activeBackgroundUrl);
    }

    const audio = els.backgroundAudioPlayer;
    state.activeBackgroundUrl = URL.createObjectURL(batch.blob);
    audio.src = state.activeBackgroundUrl;
    audio.volume = pageVolume();
    audio.playbackRate = 1;

    let lastPos = -1;
    const syncPosition = () => {
      const current = audio.currentTime;
      const segment = batch.timeline.find((item) => current >= item.start && current < item.end)
        || batch.timeline[batch.timeline.length - 1];
      if (segment && segment.pos !== lastPos && token === state.playToken) {
        lastPos = segment.pos;
        setCurrentPos(segment.pos, { scroll: true });
      }
    };
    audio.ontimeupdate = syncPosition;
    audio.onplay = syncPosition;

    await audio.play();
    await new Promise((resolve, reject) => {
      audio.onended = resolve;
      audio.onerror = () => reject(new Error("Lock audio playback failed"));
      const poll = () => {
        if (token !== state.playToken || !state.playing) resolve();
        else window.setTimeout(poll, 250);
      };
      poll();
    });

    audio.ontimeupdate = null;
    audio.onplay = null;
    audio.onended = null;
    audio.onerror = null;
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
    gain.gain.value = clip.gain * pageVolume();
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
    audio.volume = clamp(volume * pageVolume(), 0, 1);
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
      utterance.volume = pageVolume();
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
      : prefix === "fa"
        ? /persian|farsi|fa-/i
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
      if (els.backgroundAudio.checked && piperVoiceIdForLang(activeLanguage().speechLang)) {
        await startBackgroundPlayback(token);
        return;
      }
      if (els.backgroundAudio.checked) {
        setStatus("Lock audio unavailable for this language");
        await delay(500, token);
      }

      while (
        state.playing
        && token === state.playToken
        && state.currentPos >= 0
        && state.currentPos < state.order.length
      ) {
        const entry = currentEntry();
        updateFocus();
        scrollCurrentIntoView("near");
        await speakEntry(entry, token);
        if (token !== state.playToken || !state.playing) break;
        const nextPos = state.currentPos + (state.playDirection || 1);
        if (nextPos < 0 || nextPos >= state.order.length) break;
        setCurrentPos(nextPos, { scroll: true });
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

  async function startBackgroundPlayback(token) {
    state.ttsEngine = "piper";
    els.engineSelect.value = "piper";
    savePrefs();

    while (
      state.playing
      && token === state.playToken
      && state.currentPos >= 0
      && state.currentPos < state.order.length
    ) {
      setStatus("Preparing lock audio");
      const batch = await buildBackgroundBatch(state.currentPos, token);
      if (!batch || token !== state.playToken || !state.playing) break;
      setStatus("Playing lock audio");
      await playBackgroundBatch(batch, token);
      if (token !== state.playToken || !state.playing) break;
      if (batch.nextPos < 0 || batch.nextPos >= state.order.length) break;
      setCurrentPos(batch.nextPos, { scroll: true });
    }
  }

  async function loadData() {
    const language = activeLanguage();
    setStatus(`Loading ${language.label} deck`);
    const response = await fetch(language.dataUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`Data load failed: ${response.status}`);
    const payload = await response.json();
    state.entries = payload.entries || [];
    state.meta = payload.meta || {};
    els.datasetMeta.textContent = `${language.label} ${state.entries.length.toLocaleString()} words`;
    els.sourceHead.textContent = language.sourceHead;
    els.wordList.setAttribute("aria-label", `${language.label} frequency list`);
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

    els.prevBtn.addEventListener("click", async () => {
      const wasPlaying = state.playing;
      stopSpeech();
      state.playDirection = -1;
      setCurrentPos(state.currentPos - 1, { scroll: true });
      if (wasPlaying) {
        await startPlayback();
        return;
      }
      setStatus("Ready");
    });

    els.nextBtn.addEventListener("click", async () => {
      const wasPlaying = state.playing;
      stopSpeech();
      state.playDirection = 1;
      setCurrentPos(state.currentPos + 1, { scroll: true });
      if (wasPlaying) {
        await startPlayback();
        return;
      }
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

    els.languageSelect.addEventListener("change", async () => {
      stopSpeech();
      state.language = LANGUAGES[els.languageSelect.value] ? els.languageSelect.value : "ru";
      state.currentPos = 0;
      state.playDirection = 1;
      updateSettingLabels();
      savePrefs();
      try {
        await loadData();
      } catch (error) {
        setStatus(error.message || "Language load failed");
        console.error(error);
      }
    });

    els.settingsToggle.addEventListener("click", () => {
      els.settingsPanel.hidden = !els.settingsPanel.hidden;
    });

    els.engineSelect.addEventListener("change", () => {
      state.ttsEngine = els.engineSelect.value;
      savePrefs();
      warmPiperQueue(state.currentPos);
    });

    [els.ruRate, els.enRate, els.pageVolume, els.gapMs, els.piperAhead, els.backgroundBatch].forEach((input) => {
      input.addEventListener("input", () => {
        updateSettingLabels();
        els.backgroundAudioPlayer.volume = pageVolume();
        savePrefs();
        if (input === els.piperAhead) {
          warmPiperQueue(state.currentPos);
        }
      });
    });

    els.backgroundAudio.addEventListener("change", () => {
      updateSettingLabels();
      savePrefs();
    });

    els.virtualRows.addEventListener("click", (event) => {
      const row = event.target.closest(".word-row");
      if (!row) return;
      stopSpeech();
      state.playDirection = 1;
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
    els.languageSelect.value = state.language;
    els.bandSelect.value = state.band;
    updateShuffleButton();
    els.engineSelect.value = state.ttsEngine;
    updateSettingLabels();
    els.backgroundAudioPlayer.volume = pageVolume();
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
