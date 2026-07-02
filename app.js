(() => {
  const STORE_KEY = "wordfreak:v2";
  const TRANSLATION_CACHE_KEY = "wordfreak:translation-cache";
  const LEGACY_RU_TRANSLATION_CACHE_KEY = "wordfreak:ru-en-cache";
  const BOOK_PROGRESS_KEY = "wordfreak:book-progress:v1";
  const STANDARD_EBOOKS_LIST_URL = "https://standardebooks.org/ebooks";
  const STANDARD_EBOOKS_PER_PAGE = 48;
  const STANDARD_EBOOKS_RANDOM_PAGE_MAX = 24;
  const BOOK_FETCH_TIMEOUT_MS = 22000;
  const BOOK_TRANSLATION_CACHE_LIMIT = 350;
  const BOOK_NEARBY_RADIUS = 3;
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
  const PROXY_CANDIDATES = [
    {
      name: "Direct",
      build: (url) => url
    },
    {
      name: "CodeTabs",
      build: (url) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(url)}`
    },
    {
      name: "AllOrigins raw",
      build: (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    },
    {
      name: "AllOrigins get",
      build: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      unwrap: (text) => {
        const payload = JSON.parse(text);
        return String(payload?.contents || "");
      }
    },
    {
      name: "Jina",
      build: (url) => `https://r.jina.ai/http://${String(url || "").replace(/^https?:\/\//i, "")}`
    }
  ];
  const FALLBACK_BOOKS = [
    { title: "Pride and Prejudice", author: "Jane Austen", link: "https://standardebooks.org/ebooks/jane-austen/pride-and-prejudice" },
    { title: "The Adventures of Sherlock Holmes", author: "Arthur Conan Doyle", link: "https://standardebooks.org/ebooks/arthur-conan-doyle/the-adventures-of-sherlock-holmes" },
    { title: "Dracula", author: "Bram Stoker", link: "https://standardebooks.org/ebooks/bram-stoker/dracula" },
    { title: "Frankenstein", author: "Mary Shelley", link: "https://standardebooks.org/ebooks/mary-shelley/frankenstein" },
    { title: "The Time Machine", author: "H. G. Wells", link: "https://standardebooks.org/ebooks/h-g-wells/the-time-machine" },
    { title: "The Picture of Dorian Gray", author: "Oscar Wilde", link: "https://standardebooks.org/ebooks/oscar-wilde/the-picture-of-dorian-gray" },
    { title: "Moby-Dick", author: "Herman Melville", link: "https://standardebooks.org/ebooks/herman-melville/moby-dick" },
    { title: "Little Women", author: "Louisa May Alcott", link: "https://standardebooks.org/ebooks/louisa-may-alcott/little-women" }
  ];
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
    bookToggle: document.getElementById("bookToggle"),
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
    sourceVoiceLabel: document.getElementById("sourceVoiceLabel"),
    sourceVoiceSelect: document.getElementById("sourceVoiceSelect"),
    enVoiceSelect: document.getElementById("enVoiceSelect"),
    enLangSelect: document.getElementById("enLangSelect"),
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
    bookView: document.getElementById("bookView"),
    bookModeTitle: document.getElementById("bookModeTitle"),
    bookShelfBtn: document.getElementById("bookShelfBtn"),
    bookRandomBtn: document.getElementById("bookRandomBtn"),
    bookLanguageSelect: document.getElementById("bookLanguageSelect"),
    bookPageInput: document.getElementById("bookPageInput"),
    bookLoadPageBtn: document.getElementById("bookLoadPageBtn"),
    bookPrevPageBtn: document.getElementById("bookPrevPageBtn"),
    bookNextPageBtn: document.getElementById("bookNextPageBtn"),
    bookPrevSentenceBtn: document.getElementById("bookPrevSentenceBtn"),
    bookPlayBtn: document.getElementById("bookPlayBtn"),
    bookNextSentenceBtn: document.getElementById("bookNextSentenceBtn"),
    bookSourceRate: document.getElementById("bookSourceRate"),
    bookSourceRateValue: document.getElementById("bookSourceRateValue"),
    bookEnRate: document.getElementById("bookEnRate"),
    bookEnRateValue: document.getElementById("bookEnRateValue"),
    bookVolume: document.getElementById("bookVolume"),
    bookVolumeValue: document.getElementById("bookVolumeValue"),
    bookReader: document.getElementById("bookReader"),
    bookReaderMeta: document.getElementById("bookReaderMeta"),
    bookReaderTitle: document.getElementById("bookReaderTitle"),
    bookSourceLink: document.getElementById("bookSourceLink"),
    bookChapterSelect: document.getElementById("bookChapterSelect"),
    bookProgressValue: document.getElementById("bookProgressValue"),
    bookProgressRange: document.getElementById("bookProgressRange"),
    bookSourceLabel: document.getElementById("bookSourceLabel"),
    bookSourceSentence: document.getElementById("bookSourceSentence"),
    bookEnglishSentence: document.getElementById("bookEnglishSentence"),
    bookNearbyList: document.getElementById("bookNearbyList"),
    bookShelf: document.getElementById("bookShelf"),
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
    voicePrefs: {
      ru: "",
      fa: "",
      en: ""
    },
    enLang: "",
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
    bookMode: false,
    bookPage: 1,
    bookBooks: [],
    bookLoadedBook: null,
    bookSentences: [],
    bookChapters: [],
    bookCurrentIndex: 0,
    bookPlaying: false,
    bookPlayDirection: 1,
    bookRenderToken: 0,
    bookProgress: loadBookProgress(),
    bookTranslationCache: new Map(),
    activeHighlights: [],
    highlightTimer: 0,
    scrollTimer: 0,
    programmaticScroll: false,
    ruFitRaf: 0,
    enFitRaf: 0,
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
      if (prefs.voicePrefs && typeof prefs.voicePrefs === "object") {
        state.voicePrefs = { ...state.voicePrefs, ...prefs.voicePrefs };
      }
      state.enLang = typeof prefs.enLang === "string" ? prefs.enLang : state.enLang;
      els.ruRate.value = prefs.ruRate || els.ruRate.value;
      els.enRate.value = prefs.enRate || els.enRate.value;
      els.pageVolume.value = prefs.pageVolume || els.pageVolume.value;
      els.bookSourceRate.value = els.ruRate.value;
      els.bookEnRate.value = els.enRate.value;
      els.bookVolume.value = els.pageVolume.value;
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
      voicePrefs: state.voicePrefs,
      enLang: state.enLang,
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
    els.sourceVoiceLabel.textContent = `${activeLanguage().shortLabel} voice`;
    els.ruRateValue.textContent = `${Number(els.ruRate.value).toFixed(2)}x`;
    els.enRateValue.textContent = `${Number(els.enRate.value).toFixed(2)}x`;
    els.pageVolumeValue.textContent = `${Math.round(pageVolume() * 100)}%`;
    els.bookSourceRateValue.textContent = `${Number(els.bookSourceRate.value).toFixed(2)}x`;
    els.bookEnRateValue.textContent = `${Number(els.bookEnRate.value).toFixed(2)}x`;
    els.bookVolumeValue.textContent = `${Math.round(pageVolume() * 100)}%`;
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

  function loadBookProgress() {
    try {
      const value = JSON.parse(window.localStorage.getItem(BOOK_PROGRESS_KEY) || "{}");
      return value && typeof value === "object" ? value : {};
    } catch {
      return {};
    }
  }

  function saveBookProgressStore() {
    try {
      window.localStorage.setItem(BOOK_PROGRESS_KEY, JSON.stringify(state.bookProgress));
    } catch (error) {
      console.warn("Book progress save failed:", error);
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

  function langPrefix(lang) {
    return String(lang || "").toLowerCase().split("-")[0];
  }

  function voicePrefKeyForLang(lang) {
    const prefix = langPrefix(lang);
    return prefix === "fa" || prefix === "ru" || prefix === "en" ? prefix : "";
  }

  function voiceId(voice) {
    return voice ? `${voice.voiceURI || voice.name}|${voice.lang}` : "";
  }

  function voiceLabel(voice) {
    const quality = voice.localService ? "local" : "network";
    return `${voice.name} (${voice.lang}, ${quality})`;
  }

  function matchingVoices(lang) {
    const lower = String(lang || "").toLowerCase();
    const prefix = langPrefix(lang);
    const exactLang = lower.includes("-");
    return state.voices
      .filter((voice) => {
        const voiceLang = String(voice.lang || "").toLowerCase();
        return voiceLang === lower || (!exactLang && voiceLang.startsWith(prefix));
      })
      .sort((a, b) => {
        const aLang = String(a.lang || "").toLowerCase();
        const bLang = String(b.lang || "").toLowerCase();
        if (aLang === lower && bLang !== lower) return -1;
        if (aLang !== lower && bLang === lower) return 1;
        if (a.localService !== b.localService) return a.localService ? -1 : 1;
        return String(a.name || "").localeCompare(String(b.name || ""));
      });
  }

  function populateVoiceSelect(select, lang, emptyLabel) {
    const key = voicePrefKeyForLang(lang);
    const selected = key ? state.voicePrefs[key] || "" : "";
    const voices = matchingVoices(lang);
    select.replaceChildren();

    const auto = document.createElement("option");
    auto.value = "";
    auto.textContent = emptyLabel;
    select.appendChild(auto);

    voices.forEach((voice) => {
      const option = document.createElement("option");
      option.value = voiceId(voice);
      option.textContent = voiceLabel(voice);
      select.appendChild(option);
    });

    if (selected && voices.some((voice) => voiceId(voice) === selected)) {
      select.value = selected;
    } else {
      select.value = "";
    }
  }

  function updateVoiceSelectors() {
    populateVoiceSelect(els.sourceVoiceSelect, activeLanguage().speechLang, "Auto default");
    populateVoiceSelect(els.enVoiceSelect, state.enLang || "en", "Auto default");
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

  function syncBookAudioControlsFromSettings() {
    els.bookSourceRate.value = els.ruRate.value;
    els.bookEnRate.value = els.enRate.value;
    els.bookVolume.value = els.pageVolume.value;
  }

  function syncSettingsAudioControlsFromBook() {
    els.ruRate.value = els.bookSourceRate.value;
    els.enRate.value = els.bookEnRate.value;
    els.pageVolume.value = els.bookVolume.value;
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

  function makeSpokenEnglish(value, entry = null) {
    const clean = stripForSpeech(value);
    const firstSense = clean.split(/[;,]/)[0].trim();
    const words = firstSense.match(/[A-Za-z]+(?:[-'][A-Za-z]+)?|\d+/g) || [];
    return words.length ? words.join(" ") : firstSense || clean;
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
      resetEnglishFocusWord();
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
    const enText = meaning || "translation pending";
    prepareEnglishFocusWord(enText);
    els.enWord.textContent = enText;
    els.enWord.classList.toggle("missing", !meaning);
    els.meaningState.textContent = meaning ? "English" : "English pending";
    els.progressText.textContent = `${state.currentPos + 1} / ${state.order.length}`;
    fitRussianFocusWord({ immediate: true });
    fitEnglishFocusWord({ immediate: true });
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

  function isSingleEnglishToken(text) {
    const clean = normalizeSpaces(text);
    return Boolean(clean) && !/\s/.test(clean);
  }

  function resetEnglishFocusWord() {
    const node = els.enWord;
    node.style.whiteSpace = "";
    node.style.overflowWrap = "";
    node.style.wordBreak = "";
    node.style.overflow = "";
    node.style.textOverflow = "";
    node.style.fontSize = "";
  }

  function prepareEnglishFocusWord(text) {
    if (!isSingleEnglishToken(text)) {
      resetEnglishFocusWord();
      return;
    }

    const node = els.enWord;
    node.style.whiteSpace = "nowrap";
    node.style.overflowWrap = "normal";
    node.style.wordBreak = "normal";
    node.style.overflow = "hidden";
    node.style.textOverflow = "clip";
    node.style.fontSize = estimateEnglishFocusFontSize(text);
  }

  function estimateEnglishFocusFontSize(text) {
    const length = Array.from(String(text || "")).length;
    if (length <= 9) return "";
    if (length <= 13) return "clamp(1.35rem, 5.2vw, 3rem)";
    if (length <= 17) return "clamp(1.1rem, 4.4vw, 2.35rem)";
    if (length <= 22) return "clamp(0.92rem, 3.5vw, 1.85rem)";
    return "clamp(0.78rem, 2.8vw, 1.35rem)";
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

  function fitEnglishFocusWord(options = {}) {
    if (state.enFitRaf) {
      window.cancelAnimationFrame(state.enFitRaf);
      state.enFitRaf = 0;
    }

    const run = () => {
      state.enFitRaf = 0;
      const node = els.enWord;
      if (!node.textContent || !isSingleEnglishToken(node.textContent)) return;

      const maxSize = Number.parseFloat(window.getComputedStyle(node).fontSize) || 36;
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
    state.enFitRaf = window.requestAnimationFrame(run);
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

  function wordRanges(text) {
    const ranges = [];
    const clean = String(text || "");
    const wordPattern = /[\p{L}\p{N}]+(?:[-'][\p{L}\p{N}]+)*/gu;
    let match = null;
    while ((match = wordPattern.exec(clean)) !== null) {
      ranges.push({
        start: match.index,
        end: match.index + match[0].length
      });
    }
    return ranges;
  }

  function activeWordIndexForChar(text, charIndex) {
    const ranges = wordRanges(text);
    if (!ranges.length) return -1;
    const index = Math.max(0, Number(charIndex) || 0);
    const found = ranges.findIndex((range) => index >= range.start && index < range.end);
    if (found >= 0) return found;
    for (let rangeIndex = ranges.length - 1; rangeIndex >= 0; rangeIndex -= 1) {
      if (index >= ranges[rangeIndex].start) return rangeIndex;
    }
    return 0;
  }

  function highlightedTextHtml(text, activeIndex) {
    const clean = String(text || "");
    const ranges = wordRanges(clean);
    if (!ranges.length || activeIndex < 0) {
      return escapeHtml(clean);
    }

    let html = "";
    let cursor = 0;
    ranges.forEach((range, index) => {
      html += escapeHtml(clean.slice(cursor, range.start));
      const className = index === activeIndex ? "speech-word active" : "speech-word";
      html += `<span class="${className}">${escapeHtml(clean.slice(range.start, range.end))}</span>`;
      cursor = range.end;
    });
    html += escapeHtml(clean.slice(cursor));
    return html;
  }

  function normalizeHighlightTargets(targets, fallbackText) {
    return (Array.isArray(targets) ? targets : [])
      .map((target) => {
        const node = target?.node || document.getElementById(target?.id || "");
        if (!node) return null;
        return {
          node,
          text: String(target?.text || fallbackText || "")
        };
      })
      .filter(Boolean);
  }

  function applySpeechHighlight(targets, text, charIndex) {
    const normalizedTargets = normalizeHighlightTargets(targets, text);
    if (!normalizedTargets.length) return;
    const clean = String(text || "");
    const activeIndex = activeWordIndexForChar(clean, charIndex);
    state.activeHighlights = normalizedTargets;
    normalizedTargets.forEach((target) => {
      target.node.innerHTML = highlightedTextHtml(target.text || clean, activeIndex);
    });
  }

  function clearSpeechHighlights(targets = state.activeHighlights) {
    window.clearInterval(state.highlightTimer);
    state.highlightTimer = 0;
    const normalizedTargets = normalizeHighlightTargets(targets, "");
    normalizedTargets.forEach((target) => {
      target.node.textContent = target.text || "";
    });
    const activeNodes = new Set(state.activeHighlights.map((target) => target.node));
    const clearedActiveNodes = normalizedTargets.some((target) => activeNodes.has(target.node));
    if (targets === state.activeHighlights || clearedActiveNodes) {
      state.activeHighlights = [];
    }
  }

  function startApproximateHighlight(text, targets, durationMs, token) {
    const clean = String(text || "");
    const ranges = wordRanges(clean);
    if (!ranges.length || !targets?.length || durationMs <= 0) return;
    const started = performance.now();
    applySpeechHighlight(targets, clean, 0);
    window.clearInterval(state.highlightTimer);
    state.highlightTimer = window.setInterval(() => {
      if (token !== state.playToken) {
        clearSpeechHighlights(targets);
        return;
      }
      const elapsed = performance.now() - started;
      const ratio = clamp(elapsed / durationMs, 0, 1);
      const activeIndex = Math.min(ranges.length - 1, Math.floor(ratio * ranges.length));
      applySpeechHighlight(targets, clean, ranges[activeIndex].start);
      if (ratio >= 1) {
        window.clearInterval(state.highlightTimer);
        state.highlightTimer = 0;
      }
    }, 110);
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

  function bookProgressKey(book = state.bookLoadedBook) {
    if (!book?.id) return "";
    return book.id;
  }

  function getBookProgress(book, language = state.language) {
    const key = bookProgressKey(book);
    if (!key) return null;
    return state.bookProgress[key]
      || state.bookProgress[`${language}:${key}`]
      || state.bookProgress[`ru:${key}`]
      || state.bookProgress[`fa:${key}`]
      || null;
  }

  function saveCurrentBookProgress() {
    const book = state.bookLoadedBook;
    if (!book || !state.bookSentences.length) return;
    const key = bookProgressKey(book);
    if (!key) return;
    state.bookProgress[key] = {
      id: book.id,
      title: book.title,
      author: book.author || "",
      link: book.link,
      language: state.language,
      index: state.bookCurrentIndex,
      total: state.bookSentences.length,
      updatedAt: Date.now()
    };
    saveBookProgressStore();
    renderBookShelf();
  }

  function bookProgressPercent(book) {
    const record = getBookProgress(book);
    if (!record?.total) return 0;
    return clamp(Math.round(((record.index + 1) / record.total) * 100), 0, 100);
  }

  function bookHash(text) {
    let hash = 2166136261;
    const value = String(text || "");
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function bookTranslationKey(text, language = state.language) {
    return `${language}:${bookHash(text)}:${String(text || "").length}`;
  }

  function rememberBookTranslation(key, value) {
    if (!key || !value) return;
    state.bookTranslationCache.set(key, value);
    while (state.bookTranslationCache.size > BOOK_TRANSLATION_CACHE_LIMIT) {
      state.bookTranslationCache.delete(state.bookTranslationCache.keys().next().value);
    }
  }

  async function translateFromEn(text, targetLanguage = state.language) {
    const clean = normalizeSpaces(text);
    const target = LANGUAGES[targetLanguage]?.translateSl || "ru";
    if (!clean) return "";

    const translators = [
      {
        name: "Google",
        run: async () => {
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${target}&dt=t&q=${encodeURIComponent(clean)}`;
          const response = await fetch(url, { cache: "no-store" });
          if (!response.ok) throw new Error(`Google ${response.status}`);
          const payload = await response.json();
          return Array.isArray(payload?.[0])
            ? normalizeSpaces(payload[0].map((chunk) => chunk?.[0] || "").join(""))
            : "";
        }
      },
      {
        name: "Lingva",
        run: async () => {
          const url = `https://lingva.ml/api/v1/en/${target}/${encodeURIComponent(clean)}`;
          const response = await fetch(url, { cache: "no-store" });
          if (!response.ok) throw new Error(`Lingva ${response.status}`);
          const payload = await response.json();
          return normalizeSpaces(payload.translation || "");
        }
      },
      {
        name: "MyMemory",
        run: async () => {
          const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=en|${target}`;
          const response = await fetch(url, { cache: "no-store" });
          if (!response.ok) throw new Error(`MyMemory ${response.status}`);
          const payload = await response.json();
          return normalizeSpaces(payload?.responseData?.translatedText || "");
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
    console.warn("Book translation failed:", failures.join(" | "));
    return "";
  }

  async function ensureBookSourceSentence(english, language = state.language) {
    const key = bookTranslationKey(english, language);
    if (state.bookTranslationCache.has(key)) {
      return state.bookTranslationCache.get(key);
    }
    const translated = await translateFromEn(english, language);
    const finalText = translated || english;
    rememberBookTranslation(key, finalText);
    return finalText;
  }

  function standardEbooksPageUrl(page) {
    const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
    return `${STANDARD_EBOOKS_LIST_URL}?page=${safePage}&per-page=${STANDARD_EBOOKS_PER_PAGE}`;
  }

  async function fetchTextWithProxies(url, label) {
    const failures = [];
    for (const proxy of PROXY_CANDIDATES) {
      try {
        const requestUrl = proxy.build(url);
        const response = await withTimeout(
          fetch(requestUrl, { cache: "no-store" }),
          BOOK_FETCH_TIMEOUT_MS,
          `${proxy.name} ${label}`
        );
        if (!response.ok) throw new Error(`${response.status}`);
        let text = await withTimeout(response.text(), BOOK_FETCH_TIMEOUT_MS, `${proxy.name} body`);
        if (proxy.unwrap) {
          text = proxy.unwrap(text);
        }
        if (!normalizeSpaces(text)) throw new Error("empty response");
        return { text, proxy: proxy.name };
      } catch (error) {
        failures.push(`${proxy.name}: ${error.message}`);
      }
    }
    throw new Error(`${label} failed: ${failures.slice(0, 3).join(" | ")}`);
  }

  function normalizeStandardEbookLink(href) {
    try {
      const url = new URL(href, STANDARD_EBOOKS_LIST_URL);
      const host = url.hostname.toLowerCase();
      if (host !== "standardebooks.org" && host !== "www.standardebooks.org") {
        return "";
      }
      url.hash = "";
      url.search = "";
      url.pathname = url.pathname.replace(/\/+$/, "");
      return `${url.origin}${url.pathname}`;
    } catch {
      return "";
    }
  }

  function isStandardEbookWorkLink(link) {
    try {
      const url = new URL(link);
      const segments = url.pathname.split("/").filter(Boolean);
      return segments[0] === "ebooks" && segments.length >= 3 && !segments.includes("search");
    } catch {
      return false;
    }
  }

  function titleCaseSlug(slug) {
    return String(slug || "")
      .replace(/[_-]+/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function bookTitleFromUrl(link) {
    try {
      const segments = new URL(link).pathname.split("/").filter(Boolean);
      return titleCaseSlug(segments[2] || "Selected Book");
    } catch {
      return "Selected Book";
    }
  }

  function bookAuthorFromUrl(link) {
    try {
      const segments = new URL(link).pathname.split("/").filter(Boolean);
      return titleCaseSlug(segments[1] || "");
    } catch {
      return "";
    }
  }

  function cleanBookTitle(raw) {
    return normalizeSpaces(raw)
      .replace(/\s+-\s+Standard Ebooks.*$/i, "")
      .replace(/\s+Read Online.*$/i, "")
      .replace(/^Ebooks$/i, "")
      .trim();
  }

  function normalizeBookRecord(rawBook) {
    const link = normalizeStandardEbookLink(rawBook.link);
    if (!isStandardEbookWorkLink(link)) return null;
    return {
      id: link,
      link,
      title: cleanBookTitle(rawBook.title) || bookTitleFromUrl(link),
      author: normalizeSpaces(rawBook.author) || bookAuthorFromUrl(link)
    };
  }

  function dedupeBooks(books) {
    const seen = new Set();
    return books
      .map(normalizeBookRecord)
      .filter((book) => {
        if (!book || seen.has(book.id)) return false;
        seen.add(book.id);
        return true;
      });
  }

  function extractCatalogBooksFromHtml(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const books = [];
    const items = Array.from(doc.querySelectorAll('li[typeof*="schema:Book"], .ebooks-list li'));

    items.forEach((item) => {
      const titleAnchor = item.querySelector('a[property="schema:url"] span[property="schema:name"]')?.closest("a")
        || item.querySelector('a[href*="/ebooks/"]');
      const link = normalizeStandardEbookLink(titleAnchor?.getAttribute("href") || "");
      if (!isStandardEbookWorkLink(link)) return;
      const title = cleanBookTitle(
        titleAnchor?.querySelector('[property="schema:name"]')?.textContent
        || titleAnchor?.textContent
        || ""
      );
      const authors = Array.from(item.querySelectorAll('.author [property="schema:name"]'))
        .map((node) => normalizeSpaces(node.textContent))
        .filter(Boolean);
      books.push({
        link,
        title,
        author: authors.join(", ")
      });
    });

    if (books.length) return dedupeBooks(books);

    Array.from(doc.querySelectorAll('a[href*="/ebooks/"]')).forEach((anchor) => {
      const link = normalizeStandardEbookLink(anchor.getAttribute("href") || "");
      if (!isStandardEbookWorkLink(link)) return;
      books.push({
        link,
        title: cleanBookTitle(anchor.textContent || ""),
        author: ""
      });
    });
    return dedupeBooks(books);
  }

  function extractCatalogBooksFromMarkdown(markdown) {
    const books = [];
    const pattern = /\[([^\]]{2,180})\]\((https?:\/\/standardebooks\.org\/ebooks\/[^)\s]+|\/ebooks\/[^)\s]+)\)/gi;
    let match = null;
    while ((match = pattern.exec(markdown)) !== null) {
      const link = normalizeStandardEbookLink(match[2]);
      if (!isStandardEbookWorkLink(link)) continue;
      books.push({
        link,
        title: cleanBookTitle(match[1]),
        author: ""
      });
    }
    return dedupeBooks(books);
  }

  async function fetchBookCatalogPage(page = state.bookPage) {
    const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
    const { text, proxy } = await fetchTextWithProxies(standardEbooksPageUrl(safePage), "book shelf");
    const fromHtml = extractCatalogBooksFromHtml(text);
    const books = fromHtml.length ? fromHtml : extractCatalogBooksFromMarkdown(text);
    if (!books.length) throw new Error("No books found on the shelf page");
    return { books, proxy, page: safePage };
  }

  async function loadBookCatalogPage(page = state.bookPage) {
    setStatus(`Loading Standard Ebooks page ${page}`);
    try {
      const { books, proxy, page: safePage } = await fetchBookCatalogPage(page);
      state.bookPage = safePage;
      state.bookBooks = books;
      els.bookPageInput.value = String(safePage);
      renderBookShelf();
      setStatus(`Loaded ${books.length} books via ${proxy}`);
    } catch (error) {
      state.bookBooks = dedupeBooks(FALLBACK_BOOKS);
      renderBookShelf();
      setStatus(`Shelf fallback loaded (${error.message})`);
    }
  }

  async function ensureBookShelfLoaded() {
    if (state.bookBooks.length) return;
    await loadBookCatalogPage(state.bookPage);
  }

  function renderBookShelf() {
    if (!els.bookShelf) return;
    if (!state.bookBooks.length) {
      els.bookShelf.innerHTML = '<div class="book-empty">Load a Standard Ebooks shelf page to begin.</div>';
      return;
    }

    els.bookModeTitle.textContent = `Library page ${state.bookPage}`;
    els.bookShelf.innerHTML = state.bookBooks.map((book, index) => {
      const percent = bookProgressPercent(book);
      const progressLabel = percent ? `${percent}% read` : "Not started";
      return `
        <button class="book-card" type="button" data-book-index="${index}">
          <span>
            <span class="book-card-title">${escapeHtml(book.title)}</span>
            <span class="book-card-author">${escapeHtml(book.author || "Unknown author")}</span>
          </span>
          <span class="book-card-progress">
            <span class="book-progress-track"><span class="book-progress-fill" style="width:${percent}%"></span></span>
            <span class="book-card-meta">${progressLabel}</span>
          </span>
        </button>
      `;
    }).join("");
  }

  function bookTextCandidates(book) {
    const root = normalizeStandardEbookLink(book?.link || "");
    return [
      `${root}/text/single-page`,
      `${root}/text`
    ];
  }

  function cleanBookText(raw) {
    return normalizeSpaces(raw)
      .replace(/\u00a0/g, " ")
      .replace(/\u200b/g, "")
      .replace(/\s+([,.;:!?])/g, "$1")
      .replace(/([([{])\s+/g, "$1")
      .replace(/\s+([)\]}])/g, "$1");
  }

  function isBookNoise(text) {
    const lower = normalizeSpaces(text).toLowerCase();
    if (!lower || lower.length < 2) return true;
    if (/^(table of contents|imprint|uncopyright|titlepage)$/i.test(lower)) return true;
    return lower.includes("standard ebooks")
      || lower.includes("project gutenberg")
      || lower.includes("public domain")
      || lower.includes("creative commons")
      || lower.includes("download this and other ebooks");
  }

  function protectSentenceAbbreviations(text) {
    const values = [];
    const protectedText = String(text || "").replace(
      /\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|Mt|Capt|Col|Gen|Rev|Hon|etc|e\.g|i\.e)\./gi,
      (match) => {
        const token = `__abbr_${values.length}__`;
        values.push(match);
        return token;
      }
    );
    return { protectedText, values };
  }

  function restoreSentenceAbbreviations(text, values) {
    return String(text || "").replace(/__abbr_(\d+)__/g, (match, index) => values[Number(index)] || match);
  }

  function splitBookSentences(text) {
    const clean = cleanBookText(text);
    if (!clean || isBookNoise(clean)) return [];
    const { protectedText, values } = protectSentenceAbbreviations(clean);
    const sentences = [];
    let start = 0;
    const boundaryPattern = /[.!?][)"'\u201d\u2019]*\s+(?=[A-Z0-9"'\u201c\u2018])/g;
    let match = null;
    while ((match = boundaryPattern.exec(protectedText)) !== null) {
      const end = match.index + match[0].trimEnd().length;
      sentences.push(protectedText.slice(start, end));
      start = match.index + match[0].length;
    }
    sentences.push(protectedText.slice(start));

    return sentences
      .flatMap((sentence) => restoreSentenceAbbreviations(sentence, values).split(/;\s+(?=[A-Z"'\u201c\u2018])/))
      .map(cleanBookText)
      .filter((sentence) => sentence.length >= 2 && sentence.length <= 520 && !isBookNoise(sentence));
  }

  function cleanChapterTitle(value, fallback) {
    const title = cleanBookText(value)
      .replace(/^chapter\s+/i, "Chapter ")
      .replace(/^part\s+/i, "Part ");
    return title || fallback;
  }

  function finalizeBookParse(sentences, chapters) {
    if (!sentences.length) {
      return { sentences: [], chapters: [] };
    }

    const realChapters = chapters.filter((chapter) => chapter.start < sentences.length);
    const finalChapters = realChapters.length ? realChapters : [{ title: "Book", start: 0 }];
    finalChapters.forEach((chapter, index) => {
      chapter.index = index;
      chapter.end = index + 1 < finalChapters.length ? finalChapters[index + 1].start - 1 : sentences.length - 1;
    });
    sentences.forEach((sentence, index) => {
      sentence.index = index;
      let chapter = finalChapters[0];
      for (let chapterIndex = 0; chapterIndex < finalChapters.length; chapterIndex += 1) {
        if (finalChapters[chapterIndex].start <= index) {
          chapter = finalChapters[chapterIndex];
        }
      }
      sentence.chapterIndex = chapter.index;
    });
    return { sentences, chapters: finalChapters };
  }

  function parseBookHtml(raw) {
    const doc = new DOMParser().parseFromString(raw, "text/html");
    const sections = Array.from(doc.querySelectorAll("section"));
    const bodySections = sections.filter((section) => {
      const type = `${section.getAttribute("epub:type") || ""} ${section.getAttribute("type") || ""}`;
      return /bodymatter|chapter|z3998:fiction|drama|poem/i.test(type)
        && !/frontmatter|imprint|colophon|toc|titlepage|endnotes/i.test(type);
    });
    const containers = bodySections.length ? bodySections : [doc.querySelector("main") || doc.body];
    const sentences = [];
    const chapters = [];
    let paragraphIndex = 0;

    containers.forEach((section) => {
      const heading = section.querySelector("h1,h2,h3,h4,h5,h6");
      const chapter = {
        title: cleanChapterTitle(heading?.textContent || "", `Chapter ${chapters.length + 1}`),
        start: sentences.length
      };
      chapters.push(chapter);
      const chapterIndex = chapters.length - 1;
      Array.from(section.querySelectorAll("p, li")).forEach((node) => {
        const paragraph = cleanBookText(node.textContent || "");
        if (!paragraph || isBookNoise(paragraph)) return;
        const paragraphSentences = splitBookSentences(paragraph);
        paragraphSentences.forEach((sentence) => {
          sentences.push({
            text: sentence,
            paragraphIndex,
            chapterIndex
          });
        });
        if (paragraphSentences.length) paragraphIndex += 1;
      });
      if (chapter.start === sentences.length) {
        chapters.pop();
      }
    });

    return finalizeBookParse(sentences, chapters);
  }

  function stripPlainBookBoilerplate(raw) {
    let text = String(raw || "");
    text = text.replace(/\r/g, "");
    const startMatch = text.match(/\*\*\*\s*START OF (THE|THIS) PROJECT GUTENBERG EBOOK[\s\S]*?\*\*\*/i);
    if (startMatch) {
      text = text.slice((startMatch.index || 0) + startMatch[0].length);
    }
    const endIndex = text.search(/\*\*\*\s*END OF (THE|THIS) PROJECT GUTENBERG EBOOK/i);
    if (endIndex >= 0) {
      text = text.slice(0, endIndex);
    }
    return text;
  }

  function parseBookPlain(raw) {
    const text = stripPlainBookBoilerplate(raw);
    const paragraphs = text.split(/\n\s*\n+/).map(cleanBookText).filter(Boolean);
    const sentences = [];
    const chapters = [{ title: "Book", start: 0 }];
    let paragraphIndex = 0;

    paragraphs.forEach((paragraph) => {
      if (/^(chapter|part|book)\b/i.test(paragraph) && paragraph.length < 80) {
        if (sentences.length > chapters[chapters.length - 1].start) {
          chapters.push({ title: cleanChapterTitle(paragraph, `Chapter ${chapters.length + 1}`), start: sentences.length });
        }
        return;
      }
      const paragraphSentences = splitBookSentences(paragraph);
      paragraphSentences.forEach((sentence) => {
        sentences.push({
          text: sentence,
          paragraphIndex,
          chapterIndex: chapters.length - 1
        });
      });
      if (paragraphSentences.length) paragraphIndex += 1;
    });

    return finalizeBookParse(sentences, chapters);
  }

  function parseBookText(raw) {
    const looksHtml = /<html|<section|<p[\s>]/i.test(raw);
    return looksHtml ? parseBookHtml(raw) : parseBookPlain(raw);
  }

  async function fetchAndParseBook(book) {
    let lastError = null;
    for (const candidate of bookTextCandidates(book)) {
      try {
        const { text, proxy } = await fetchTextWithProxies(candidate, "book text");
        const parsed = parseBookText(text);
        if (!parsed.sentences.length) throw new Error("no readable sentences");
        return { ...parsed, sourceUrl: candidate, proxy };
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("Book text failed");
  }

  function renderBookReaderShell() {
    const book = state.bookLoadedBook;
    if (!book) {
      els.bookReader.hidden = true;
      return;
    }
    els.bookReader.hidden = false;
    els.bookReaderTitle.textContent = book.title;
    els.bookReaderMeta.textContent = book.author || "Unknown author";
    els.bookSourceLink.href = book.link || STANDARD_EBOOKS_LIST_URL;
    els.bookProgressRange.max = String(Math.max(0, state.bookSentences.length - 1));
    els.bookProgressRange.value = String(state.bookCurrentIndex);
    els.bookChapterSelect.replaceChildren();
    state.bookChapters.forEach((chapter) => {
      const option = document.createElement("option");
      option.value = String(chapter.index);
      option.textContent = chapter.title;
      els.bookChapterSelect.appendChild(option);
    });
  }

  function currentBookSentence() {
    return state.bookSentences[state.bookCurrentIndex] || null;
  }

  function currentBookChapter() {
    const sentence = currentBookSentence();
    return state.bookChapters[sentence?.chapterIndex || 0] || state.bookChapters[0] || null;
  }

  function updateBookProgressControls() {
    const total = state.bookSentences.length;
    const index = state.bookCurrentIndex;
    const percent = total ? Math.round(((index + 1) / total) * 100) : 0;
    els.bookProgressRange.max = String(Math.max(0, total - 1));
    els.bookProgressRange.value = String(index);
    els.bookProgressValue.textContent = total ? `${percent}% (${index + 1}/${total})` : "0%";
    const chapter = currentBookChapter();
    if (chapter) {
      els.bookChapterSelect.value = String(chapter.index);
    }
  }

  function renderBookNearby() {
    if (!state.bookSentences.length) {
      els.bookNearbyList.innerHTML = "";
      return;
    }
    const start = Math.max(0, state.bookCurrentIndex - BOOK_NEARBY_RADIUS);
    const end = Math.min(state.bookSentences.length, state.bookCurrentIndex + BOOK_NEARBY_RADIUS + 1);
    const rows = [];
    for (let index = start; index < end; index += 1) {
      const sentence = state.bookSentences[index];
      const current = index === state.bookCurrentIndex ? " current" : "";
      rows.push(`
        <button class="nearby-row${current}" type="button" data-book-sentence-index="${index}">
          <span class="nearby-index">${index + 1}</span>
          <span class="nearby-text">${escapeHtml(sentence.text)}</span>
        </button>
      `);
    }
    els.bookNearbyList.innerHTML = rows.join("");
  }

  async function renderBookSentence() {
    const sentence = currentBookSentence();
    const language = activeLanguage();
    els.bookSourceLabel.textContent = language.label;
    els.bookSourceSentence.lang = sourceLangCode();
    els.bookSourceSentence.dir = language.dir;
    if (!sentence) {
      els.bookSourceSentence.textContent = "Select a book to begin.";
      els.bookEnglishSentence.textContent = "The English original will appear here.";
      updateBookProgressControls();
      renderBookNearby();
      return;
    }

    const renderToken = state.bookRenderToken + 1;
    state.bookRenderToken = renderToken;
    els.bookEnglishSentence.textContent = sentence.text;
    els.bookSourceSentence.textContent = "Translating...";
    updateBookProgressControls();
    renderBookNearby();

    const source = await ensureBookSourceSentence(sentence.text, state.language);
    if (renderToken !== state.bookRenderToken) return;
    els.bookSourceSentence.textContent = source;
  }

  function setBookIndex(index, options = {}) {
    if (!state.bookSentences.length) return;
    state.bookCurrentIndex = Math.min(Math.max(Number.parseInt(index, 10) || 0, 0), state.bookSentences.length - 1);
    if (options.save !== false) {
      saveCurrentBookProgress();
    }
    if (options.render !== false) {
      renderBookSentence().catch((error) => {
        setStatus(error.message || "Book render failed");
        console.error(error);
      });
    } else {
      updateBookProgressControls();
    }
  }

  function randomBookSentenceIndex() {
    if (!state.bookSentences.length) return 0;
    const paragraphIds = Array.from(new Set(state.bookSentences.map((sentence) => sentence.paragraphIndex)));
    const paragraphId = paragraphIds[Math.floor(Math.random() * paragraphIds.length)];
    const paragraphSentences = state.bookSentences.filter((sentence) => sentence.paragraphIndex === paragraphId);
    return paragraphSentences[0]?.index || 0;
  }

  async function loadBook(book, options = {}) {
    if (!book?.link) throw new Error("Missing book link");
    stopSpeech();
    state.bookLoadedBook = book;
    state.bookSentences = [];
    state.bookChapters = [];
    state.bookCurrentIndex = 0;
    renderBookReaderShell();
    els.bookSourceSentence.textContent = "Loading book text...";
    els.bookEnglishSentence.textContent = book.title;
    setStatus(`Loading ${book.title}`);

    const parsed = await fetchAndParseBook(book);
    state.bookSentences = parsed.sentences;
    state.bookChapters = parsed.chapters;
    renderBookReaderShell();

    const saved = getBookProgress(book);
    const index = options.random
      ? randomBookSentenceIndex()
      : clamp(options.index ?? saved?.index ?? 0, 0, state.bookSentences.length - 1);
    setBookIndex(index, { save: true });
    setStatus(`Loaded ${book.title} (${state.bookSentences.length.toLocaleString()} sentences via ${parsed.proxy})`);
  }

  async function loadRandomBookParagraph() {
    stopSpeech();
    const page = Math.floor(Math.random() * STANDARD_EBOOKS_RANDOM_PAGE_MAX) + 1;
    await loadBookCatalogPage(page);
    const book = state.bookBooks[Math.floor(Math.random() * state.bookBooks.length)];
    if (!book) throw new Error("No random book found");
    await loadBook(book, { random: true });
    setStatus(`Random paragraph from ${book.title}`);
  }

  function setBookMode(enabled) {
    state.bookMode = Boolean(enabled);
    els.bookView.hidden = !state.bookMode;
    document.body.classList.toggle("book-mode", state.bookMode);
    els.bookToggle.setAttribute("aria-pressed", String(state.bookMode));
    if (state.bookMode) {
      els.bookLanguageSelect.value = state.language;
      syncBookAudioControlsFromSettings();
      updateSettingLabels();
      ensureBookShelfLoaded().catch((error) => {
        setStatus(error.message || "Book shelf failed");
        console.error(error);
        renderBookShelf();
      });
    }
  }

  async function speakBookSentence(sentence, token) {
    if (!sentence || token !== state.playToken) return;
    const language = activeLanguage();
    const source = await ensureBookSourceSentence(sentence.text, state.language);
    if (token !== state.playToken || !state.bookPlaying) return;

    els.bookSourceSentence.textContent = source;
    setStatus(`${language.label} sentence ${state.bookCurrentIndex + 1}`);
    await speakText(source, language.speechLang, Number(els.bookSourceRate.value), token, {
      highlightText: source,
      highlightTargets: [{ id: "bookSourceSentence", text: source }]
    });
    await delay(Number(els.gapMs.value), token);
    if (token !== state.playToken || !state.bookPlaying) return;

    els.bookEnglishSentence.textContent = sentence.text;
    setStatus(`English sentence ${state.bookCurrentIndex + 1}`);
    await speakText(sentence.text, "en-US", Number(els.bookEnRate.value), token, {
      highlightText: sentence.text,
      highlightTargets: [{ id: "bookEnglishSentence", text: sentence.text }]
    });
    await delay(Number(els.gapMs.value), token);
  }

  async function startBookPlayback() {
    if (state.bookPlaying) return;
    if (!state.bookSentences.length) {
      setStatus("Load a book first");
      return;
    }
    await ensureAudioUnlocked();
    state.bookPlaying = true;
    const token = state.playToken + 1;
    state.playToken = token;
    els.bookPlayBtn.textContent = "Stop";

    try {
      while (
        state.bookPlaying
        && token === state.playToken
        && state.bookCurrentIndex >= 0
        && state.bookCurrentIndex < state.bookSentences.length
      ) {
        await renderBookSentence();
        const sentence = currentBookSentence();
        await speakBookSentence(sentence, token);
        if (token !== state.playToken || !state.bookPlaying) break;
        const nextIndex = state.bookCurrentIndex + (state.bookPlayDirection || 1);
        if (nextIndex < 0 || nextIndex >= state.bookSentences.length) break;
        setBookIndex(nextIndex, { render: false, save: true });
      }
    } catch (error) {
      setStatus(error.message || "Book playback failed");
      console.error(error);
    } finally {
      if (token === state.playToken) {
        state.bookPlaying = false;
        els.bookPlayBtn.textContent = "Play";
        clearSpeechHighlights();
        saveCurrentBookProgress();
        setStatus("Ready");
      }
    }
  }

  async function ensureAudioUnlocked() {
    if (state.audioUnlocked) return;
    try {
      const audioContext = await withTimeout(getAudioContext(), 1800, "Audio unlock");
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
    state.bookPlaying = false;
    els.playBtn.textContent = "Play";
    els.bookPlayBtn.textContent = "Play";
    clearSpeechHighlights();
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

  async function speakText(text, lang, rate, token, options = {}) {
    if (token !== state.playToken || !text) return;
    if (state.ttsEngine === "piper" && piperVoiceIdForLang(lang)) {
      try {
        await speakWithPiper(text, lang, rate, token, options);
        return;
      } catch (error) {
        console.warn("Piper failed, falling back to system TTS:", error);
        setStatus("Piper unavailable, using system voice");
      }
    }
    await speakWithSystemVoice(text, lang, rate, token, options);
  }

  async function speakWithPiper(text, lang, rate, token, options = {}) {
    const clip = await getPiperClip(text, lang);
    if (token !== state.playToken || !clip) return;
    await playPiperClip(clip, token, rate, options);
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

  async function playPiperClip(clip, token, rate, options = {}) {
    if (token !== state.playToken) return;
    if (!clip.buffer) {
      await playAudioBlob(clip.blob, token, rate, Math.min(1, clip.gain), options);
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
    if (options.highlightTargets?.length) {
      const durationMs = (clip.buffer.duration / Math.max(0.5, source.playbackRate.value)) * 1000;
      startApproximateHighlight(options.highlightText || clip.text, options.highlightTargets, durationMs, token);
    }

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
    clearSpeechHighlights(options.highlightTargets);
  }

  async function playAudioBlob(blob, token, rate = 1, volume = 1, options = {}) {
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
    if (options.highlightTargets?.length) {
      audio.onloadedmetadata = () => {
        if (Number.isFinite(audio.duration)) {
          startApproximateHighlight(
            options.highlightText || "",
            options.highlightTargets,
            (audio.duration / Math.max(0.5, audio.playbackRate)) * 1000,
            token
          );
        }
      };
    }
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
    clearSpeechHighlights(options.highlightTargets);
  }

  async function speakWithSystemVoice(text, lang, rate, token, options = {}) {
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") {
      throw new Error("Speech synthesis unavailable");
    }
    await refreshVoices();

    return new Promise((resolve, reject) => {
      if (token !== state.playToken) {
        resolve();
        return;
      }
      const spokenText = stripForSpeech(text);
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.rate = rate;
      utterance.volume = pageVolume();
      const voice = findVoice(lang);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || lang;
      } else if (shouldSetSystemLanguage(lang)) {
        utterance.lang = systemSpeechLang(lang);
      }
      const timeout = window.setTimeout(() => {
        reject(new Error("Speech did not start"));
      }, 5000);
      utterance.onstart = () => {
        window.clearTimeout(timeout);
        applySpeechHighlight(options.highlightTargets, options.highlightText || spokenText, 0);
      };
      utterance.onboundary = (event) => {
        if (event.name && event.name !== "word") return;
        applySpeechHighlight(options.highlightTargets, options.highlightText || spokenText, event.charIndex || 0);
      };
      utterance.onend = () => {
        window.clearTimeout(timeout);
        clearSpeechHighlights(options.highlightTargets);
        resolve();
      };
      utterance.onerror = (event) => {
        window.clearTimeout(timeout);
        clearSpeechHighlights(options.highlightTargets);
        reject(new Error(event.error || "Speech synthesis error"));
      };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    });
  }

  function shouldSetSystemLanguage(lang) {
    return Boolean(systemSpeechLang(lang));
  }

  function systemSpeechLang(lang) {
    if (langPrefix(lang) === "en") {
      return state.voicePrefs.en ? lang : state.enLang;
    }
    return lang;
  }

  function findVoice(lang) {
    const prefKey = voicePrefKeyForLang(lang);
    const selected = prefKey ? state.voicePrefs[prefKey] : "";
    if (selected) {
      const selectedVoice = state.voices.find((voice) => voiceId(voice) === selected);
      if (selectedVoice) return selectedVoice;
    }
    return null;
  }

  async function refreshVoices() {
    if (!window.speechSynthesis) return;
    let voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      state.voices = voices;
      updateVoiceSelectors();
      return;
    }
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await delayPlain(120);
      voices = window.speechSynthesis.getVoices();
      if (voices.length) {
        state.voices = voices;
        updateVoiceSelectors();
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
      els.bookLanguageSelect.value = state.language;
      updateSettingLabels();
      updateVoiceSelectors();
      savePrefs();
      try {
        await loadData();
        if (state.bookMode && state.bookLoadedBook) {
          await renderBookSentence();
        }
      } catch (error) {
        setStatus(error.message || "Language load failed");
        console.error(error);
      }
    });

    els.settingsToggle.addEventListener("click", () => {
      els.settingsPanel.hidden = !els.settingsPanel.hidden;
    });

    els.bookToggle.addEventListener("click", () => {
      stopSpeech();
      setBookMode(!state.bookMode);
    });

    els.bookShelfBtn.addEventListener("click", () => {
      setBookMode(true);
      els.bookShelf.scrollIntoView({ block: "nearest" });
    });

    els.bookRandomBtn.addEventListener("click", async () => {
      setBookMode(true);
      try {
        await loadRandomBookParagraph();
      } catch (error) {
        setStatus(error.message || "Random paragraph failed");
        console.error(error);
      }
    });

    els.bookLoadPageBtn.addEventListener("click", async () => {
      setBookMode(true);
      try {
        await loadBookCatalogPage(els.bookPageInput.value);
      } catch (error) {
        setStatus(error.message || "Book shelf failed");
        console.error(error);
      }
    });

    els.bookPrevPageBtn.addEventListener("click", async () => {
      setBookMode(true);
      await loadBookCatalogPage(Math.max(1, state.bookPage - 1));
    });

    els.bookNextPageBtn.addEventListener("click", async () => {
      setBookMode(true);
      await loadBookCatalogPage(state.bookPage + 1);
    });

    els.bookPlayBtn.addEventListener("click", async () => {
      if (state.bookPlaying) {
        stopSpeech();
        setStatus("Paused");
        return;
      }
      await startBookPlayback();
    });

    els.bookPrevSentenceBtn.addEventListener("click", async () => {
      const wasPlaying = state.bookPlaying;
      stopSpeech();
      state.bookPlayDirection = -1;
      setBookIndex(state.bookCurrentIndex - 1, { save: true });
      if (wasPlaying) {
        await startBookPlayback();
      }
    });

    els.bookNextSentenceBtn.addEventListener("click", async () => {
      const wasPlaying = state.bookPlaying;
      stopSpeech();
      state.bookPlayDirection = 1;
      setBookIndex(state.bookCurrentIndex + 1, { save: true });
      if (wasPlaying) {
        await startBookPlayback();
      }
    });

    els.bookChapterSelect.addEventListener("change", () => {
      const chapter = state.bookChapters[Number.parseInt(els.bookChapterSelect.value || "0", 10)];
      if (chapter) {
        stopSpeech();
        setBookIndex(chapter.start, { save: true });
      }
    });

    els.bookProgressRange.addEventListener("input", () => {
      stopSpeech();
      setBookIndex(els.bookProgressRange.value, { save: true });
    });

    els.bookLanguageSelect.addEventListener("change", async () => {
      stopSpeech();
      state.language = LANGUAGES[els.bookLanguageSelect.value] ? els.bookLanguageSelect.value : "ru";
      els.languageSelect.value = state.language;
      state.currentPos = 0;
      state.playDirection = 1;
      updateSettingLabels();
      updateVoiceSelectors();
      savePrefs();
      try {
        await loadData();
        await renderBookSentence();
      } catch (error) {
        setStatus(error.message || "Language load failed");
        console.error(error);
      }
    });

    [els.bookSourceRate, els.bookEnRate, els.bookVolume].forEach((input) => {
      input.addEventListener("input", () => {
        syncSettingsAudioControlsFromBook();
        updateSettingLabels();
        els.backgroundAudioPlayer.volume = pageVolume();
        savePrefs();
      });
    });

    els.bookShelf.addEventListener("click", async (event) => {
      const card = event.target.closest(".book-card");
      if (!card) return;
      const book = state.bookBooks[Number.parseInt(card.dataset.bookIndex || "0", 10)];
      if (!book) return;
      try {
        await loadBook(book);
      } catch (error) {
        setStatus(error.message || "Book load failed");
        console.error(error);
      }
    });

    els.bookNearbyList.addEventListener("click", (event) => {
      const row = event.target.closest("[data-book-sentence-index]");
      if (!row) return;
      stopSpeech();
      setBookIndex(Number.parseInt(row.dataset.bookSentenceIndex || "0", 10), { save: true });
    });

    els.engineSelect.addEventListener("change", () => {
      state.ttsEngine = els.engineSelect.value;
      savePrefs();
      warmPiperQueue(state.currentPos);
    });

    els.sourceVoiceSelect.addEventListener("change", () => {
      const key = voicePrefKeyForLang(activeLanguage().speechLang);
      if (key) {
        state.voicePrefs[key] = els.sourceVoiceSelect.value;
        savePrefs();
      }
    });

    els.enVoiceSelect.addEventListener("change", () => {
      state.voicePrefs.en = els.enVoiceSelect.value;
      savePrefs();
    });

    els.enLangSelect.addEventListener("change", () => {
      state.enLang = els.enLangSelect.value;
      state.voicePrefs.en = "";
      updateVoiceSelectors();
      savePrefs();
    });

    [els.ruRate, els.enRate, els.pageVolume, els.gapMs, els.piperAhead, els.backgroundBatch].forEach((input) => {
      input.addEventListener("input", () => {
        if (input === els.ruRate || input === els.enRate || input === els.pageVolume) {
          syncBookAudioControlsFromSettings();
        }
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
      fitEnglishFocusWord();
    });
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        state.voices = window.speechSynthesis.getVoices();
        updateVoiceSelectors();
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
    els.bookLanguageSelect.value = state.language;
    els.bandSelect.value = state.band;
    els.enLangSelect.value = state.enLang;
    syncBookAudioControlsFromSettings();
    updateShuffleButton();
    els.engineSelect.value = state.ttsEngine;
    updateSettingLabels();
    updateVoiceSelectors();
    els.backgroundAudioPlayer.volume = pageVolume();
    bindEvents();
    await loadData();
    await refreshVoices();
    updateVoiceSelectors();
    registerServiceWorker();
  }

  init().catch((error) => {
    setStatus(error.message || "Failed to start");
    console.error(error);
  });
})();
