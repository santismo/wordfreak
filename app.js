(() => {
  if (new URLSearchParams(window.location.search).get("layout") === "desktop") {
    document.body.classList.add("desktop-edition");
  }
  const STORE_KEY = "wordfreak:v2";
  const TRANSLATION_CACHE_KEY = "wordfreak:translation-cache";
  const LEGACY_RU_TRANSLATION_CACHE_KEY = "wordfreak:ru-en-cache";
  const BOOK_PROGRESS_KEY = "wordfreak:book-progress:v1";
  const BOOK_FAVORITES_KEY = "wordfreak:book-favorites:v1";
  const BOOK_DIFFICULTY_KEY = "wordfreak:book-difficulty:v1";
  // v3 drops translations saved before reader text decoded entities and normalized diacritics.
  const READER_TRANSLATIONS_KEY = "wordfreak:reader-translations:v3";
  const NEWS_FEED_CACHE_KEY = "wordfreak:news-feeds:v1";
  const KNOWLEDGE_CACHE_KEY = "wordfreak:knowledge-feeds:v1";
  const KNOWLEDGE_HISTORY_KEY = "wordfreak:knowledge-history:v1";
  const KNOWLEDGE_CACHE_LIMIT = 6;
  const KNOWLEDGE_HISTORY_LIMIT = 240;
  const KNOWLEDGE_CACHE_MAX_AGE_MS = 12 * 60 * 60 * 1000;
  const KNOWLEDGE_DOCUMENT_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
  const KNOWLEDGE_BATCH_SIZE = 18;
  const WIKIPEDIA_API_URL = "https://en.wikipedia.org/w/api.php";
  const WIKIPEDIA_ON_THIS_DAY_URL = "https://en.wikipedia.org/api/rest_v1/feed/onthisday/all";
  const KNOWLEDGE_TOPICS = {
    general: { label: "Random encyclopedia" },
    science: { label: "Science & technology", searches: ["science", "technology", "engineering"] },
    history: { label: "History & culture", searches: ["history", "archaeology", "culture"] },
    nature: { label: "Nature & Earth", searches: ["biology", "animals", "Earth science"] },
    arts: { label: "Arts & language", searches: ["art", "music", "linguistics"] },
    onthisday: { label: "On this day", onThisDay: true }
  };
  // v3 drops documents saved before reader text decoded entities and normalized diacritics.
  const READER_DOCUMENT_CACHE_NAME = "wordfreak-reader-documents-v3";
  const STANDARD_EBOOKS_LIST_URL = "https://standardebooks.org/ebooks";
  const USAF_HANDBOOK_ID = "usaf:afh1:2025-02-15";
  const USAF_HANDBOOK_SCHEMA_VERSION = 1;
  const USAF_HANDBOOK_DATA_VERSION = 1;
  const USAF_HANDBOOK_EDITION_DATE = "15 February 2025";
  const USAF_HANDBOOK_SOURCE_URL = "https://static.e-publishing.af.mil/production/1/af_a1/publication/afh1/afh1.pdf";
  const USAF_HANDBOOK_SOURCE_SHA256 = "9f60b97f32240c8db0f19b37c287df7b933ecdcbf39f68133805182c0a48ef59";
  const USAF_HANDBOOK_SOURCE_PAGE_COUNT = 625;
  const USAF_HANDBOOK_SECTION_COUNT = 33;
  const USAF_HANDBOOK_WORD_COUNT = 274706;
  const USAF_HANDBOOK_READER_UNIT_COUNT = 14411;
  const USAF_HANDBOOK_DATA_URL = "./data/books/afh1-airman-2025.json";
  const STANDARD_EBOOKS_PER_PAGE = 48;
  const STANDARD_EBOOKS_RANDOM_PAGE_MAX = 24;
  const BOOK_FETCH_TIMEOUT_MS = 14000;
  const BUNDLED_BOOK_FETCH_TIMEOUT_MS = 30000;
  const BOOK_TRANSLATION_CACHE_LIMIT = 350;
  const READER_DOCUMENT_CACHE_LIMIT = 6;
  const READER_PERSISTENT_DOCUMENT_LIMIT = 12;
  const READER_ALIGNMENT_CACHE_LIMIT = 120;
  const READER_ALIGNMENT_MAX_TARGET_WORDS = 4;
  const READER_SHELF_PREFETCH_LIMIT = 3;
  const NEWS_FEED_CACHE_LIMIT = 12;
  const NEWS_FEED_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
  const NEWS_DOCUMENT_CACHE_MAX_AGE_MS = 12 * 60 * 60 * 1000;
  const BOOK_DOCUMENT_CACHE_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;
  const NEWS_ARTICLE_QUICK_WAIT_MS = 700;
  const BOOK_NEARBY_RADIUS = 3;
  const PIPER_WORKER_URL = "./piper-worker.js?v=1";
  const PIPER_RU_VOICE_ID = "ru_RU-irina-medium";
  const PIPER_FA_VOICE_ID = "fa_IR-gyro-medium";
  const PIPER_ES_VOICE_ID = "es_ES-carlfm-x_low";
  const PIPER_FR_VOICE_ID = "fr_FR-siwis-low";
  const PIPER_EN_VOICE_ID = "en_US-lessac-low";
  const PIPER_FIRST_USE_MEGABYTES = { ru: 89, fa: 89, es: 55, fr: 55, en: 89 };
  const PIPER_MAX_TEXT_CHARS = 320;
  const PIPER_CACHE_TEXT_MAX_CHARS = 120;
  const PIPER_AUDIO_CACHE_MAX_ITEMS = 12;
  const PIPER_AUDIO_CACHE_MAX_BYTES = 6 * 1024 * 1024;
  const PIPER_FIRST_REQUEST_TIMEOUT_MS = 180000;
  const PIPER_PREDICT_TIMEOUT_MS = 45000;
  const PIPER_CLEAR_TIMEOUT_MS = 30000;
  const PIPER_IDLE_TIMEOUT_MS = 90000;
  const PIPER_MAX_LIVE_WORKERS = 2;
  const PIPER_FAILURE_LIMIT = 1;
  const PIPER_FAILURE_COOLDOWN_MS = 5 * 60 * 1000;
  const SPEECH_VOLUME_BOOST_MIN = 0.5;
  const SPEECH_VOLUME_BOOST_MAX = 1.5;
  const SPEECH_VOLUME_BOOST_DEFAULT = 1;
  const STUDY_MUSIC_API_URL = "https://commons.wikimedia.org/w/api.php";
  const STUDY_MUSIC_COLLECTIONS = {
    classical: {
      label: "Classical",
      category: "Classical music from Free Music Archive",
      corpusUrl: "https://commons.wikimedia.org/wiki/Category:Classical_music_from_Free_Music_Archive"
    },
    lofi: {
      label: "Lo-fi",
      category: "Lo-fi music from Free Music Archive",
      corpusUrl: "https://commons.wikimedia.org/wiki/Category:Lo-fi_music_from_Free_Music_Archive"
    }
  };
  const STUDY_MUSIC_VOLUME_DEFAULT = 0.2;
  const STUDY_MUSIC_DUCK_FACTOR = 0.3;
  const STUDY_MUSIC_METADATA_BATCH_SIZE = 20;
  const STUDY_MUSIC_PREFETCH_REMAINING = 5;
  const STUDY_MUSIC_FETCH_TIMEOUT_MS = 12000;
  const STUDY_MUSIC_STALL_TIMEOUT_MS = 12000;
  const STUDY_MUSIC_STABLE_PLAYBACK_MS = 8000;
  const STUDY_MUSIC_MAX_CONSECUTIVE_FAILURES = 3;
  const STUDY_MUSIC_MIN_DURATION_SECONDS = 60;
  const STUDY_MUSIC_MIN_BYTES = 400 * 1024;
  const STUDY_MUSIC_MAX_BYTES = 80 * 1024 * 1024;
  const PIPER_SILENCE_DATA_URL = "data:audio/wav;base64,UklGRjQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YRAAAACAgICAgICAgICAgICAgICA";
  const VOICE_LOAD_TIMEOUT_MS = 3600;
  const VOICE_LOAD_POLL_MS = 120;
  const BOOK_SHELF_KINDS = new Set(["guided", "official", "library", "favorites"]);
  const BOOK_LEVELS = {
    starter: {
      label: "Level 1 · Starter",
      shortLabel: "Starter",
      description: "Very short stories with relatively clear sentence patterns."
    },
    easy: {
      label: "Level 2 · Easy classics",
      shortLabel: "Easy classics",
      description: "Approachable classics with moderate length and measured readability."
    },
    steady: {
      label: "Level 3 · Steady reader",
      shortLabel: "Steady reader",
      description: "Longer books or denser stories for sustained reading practice."
    },
    stretch: {
      label: "Level 4 · Literary stretch",
      shortLabel: "Literary stretch",
      description: "Long, syntactically dense, or more literary English."
    }
  };
  const NEWS_ARTICLE_LIMIT = 60;
  const NEWS_SOURCES = {
    ru: [
      { id: "meduza", label: "Meduza", feed: "https://meduza.io/rss/all", home: "https://meduza.io/" },
      { id: "google", label: "Google News Russian", feed: "https://news.google.com/rss?hl=ru&gl=RU&ceid=RU:ru", home: "https://news.google.com/?hl=ru&gl=RU&ceid=RU:ru" }
    ],
    fa: [
      { id: "voa", label: "VOA Persian", feed: "https://ir.voanews.com/api/zkup_l-vomx-tpejiyy", home: "https://ir.voanews.com/" },
      { id: "radiofarda", label: "Radio Farda", feed: "https://www.radiofarda.com/api/zrttpol-vomx-tpeoogpi", home: "https://www.radiofarda.com/" },
      { id: "google", label: "Google News · Persian only", feed: "https://news.google.com/rss?hl=fa&gl=IR&ceid=IR:fa", home: "https://news.google.com/?hl=fa&gl=IR&ceid=IR:fa" }
    ],
    es: [
      { id: "dw", label: "DW Español", feed: "https://rss.dw.com/rdf/rss-sp-all", home: "https://www.dw.com/es/" },
      { id: "google", label: "Google Noticias", feed: "https://news.google.com/rss?hl=es&gl=US&ceid=US:es", home: "https://news.google.com/?hl=es&gl=US&ceid=US:es" }
    ],
    fr: [
      { id: "rfi", label: "RFI Français", feed: "https://www.rfi.fr/fr/rss", home: "https://www.rfi.fr/fr/" },
      { id: "france24", label: "France 24", feed: "https://www.france24.com/fr/rss", home: "https://www.france24.com/fr/" },
      { id: "google", label: "Google Actualités", feed: "https://news.google.com/rss?hl=fr&gl=FR&ceid=FR:fr", home: "https://news.google.com/?hl=fr&gl=FR&ceid=FR:fr" }
    ],
    hi: [
      { id: "bbc", label: "BBC हिन्दी", feed: "https://feeds.bbci.co.uk/hindi/rss.xml", home: "https://www.bbc.com/hindi" },
      { id: "google", label: "Google समाचार", feed: "https://news.google.com/rss?hl=hi&gl=IN&ceid=IN:hi", home: "https://news.google.com/?hl=hi&gl=IN&ceid=IN:hi" }
    ],
    ja: [
      { id: "nhk", label: "NHK ニュース", feed: "https://www3.nhk.or.jp/rss/news/cat0.xml", home: "https://www3.nhk.or.jp/news/" },
      { id: "google", label: "Google ニュース", feed: "https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja", home: "https://news.google.com/?hl=ja&gl=JP&ceid=JP:ja" }
    ],
    ko: [
      { id: "voa", label: "VOA 한국어", feed: "https://www.voakorea.com/api/zpokyl-vomx-tpe_kjt", home: "https://www.voakorea.com/" },
      { id: "google", label: "Google 뉴스", feed: "https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko", home: "https://news.google.com/?hl=ko&gl=KR&ceid=KR:ko" }
    ]
  };
  const BOOK_GENRES = {
    adventure: "Adventure",
    autobiography: "Autobiography",
    biography: "Biography",
    childrens: "Children's",
    comedy: "Comedy",
    drama: "Drama",
    fantasy: "Fantasy",
    fiction: "Fiction",
    horror: "Horror",
    memoir: "Memoir",
    mystery: "Mystery",
    nonfiction: "Nonfiction",
    philosophy: "Philosophy",
    poetry: "Poetry",
    satire: "Satire",
    "science-fiction": "Science Fiction",
    shorts: "Shorts",
    spirituality: "Spirituality",
    travel: "Travel"
  };
  const PROXY_CANDIDATES = [
    {
      name: "Direct",
      build: (url) => url
    },
    {
      // Gutenberg, VOA Persian, and Radio Farda do not expose CORS headers. This
      // proxy preserves the source response (unlike reader-mode services) and is
      // deliberately tried before the slower fallbacks below.
      name: "CORS.eu",
      build: (url) => `https://cors.eu.org/${url}`
    },
    {
      name: "Jina",
      build: (url) => `https://r.jina.ai/http://${String(url || "").replace(/^https?:\/\//i, "")}`
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
  const GUIDED_BOOKS = [
    { gutenbergId: 14838, title: "The Tale of Peter Rabbit", author: "Beatrix Potter", level: "starter", wordCount: 974, estimatedGrade: 5.3, averageSentenceWords: 13.9, genres: ["childrens", "shorts"] },
    { gutenbergId: 18155, title: "The Story of the Three Little Pigs", author: "L. Leslie Brooke", level: "starter", wordCount: 1035, estimatedGrade: 4.9, averageSentenceWords: 18.5, genres: ["childrens", "shorts"] },
    { gutenbergId: 11757, title: "The Velveteen Rabbit", author: "Margery Williams Bianco", level: "starter", wordCount: 3948, estimatedGrade: 5.4, averageSentenceWords: 16.3, genres: ["childrens", "fantasy", "shorts"] },
    { gutenbergId: 14872, title: "The Tale of Squirrel Nutkin", author: "Beatrix Potter", level: "starter", wordCount: 1180, estimatedGrade: 5.1, averageSentenceWords: 14.1, genres: ["childrens", "shorts"] },
    { gutenbergId: 14407, title: "The Tale of Benjamin Bunny", author: "Beatrix Potter", level: "starter", wordCount: 1050, estimatedGrade: 4.8, averageSentenceWords: 13.5, genres: ["childrens", "shorts"] },
    { gutenbergId: 14814, title: "The Tale of Jemima Puddle-Duck", author: "Beatrix Potter", level: "starter", wordCount: 1250, estimatedGrade: 5.2, averageSentenceWords: 14.4, genres: ["childrens", "shorts"] },
    { gutenbergId: 14837, title: "The Tale of Tom Kitten", author: "Beatrix Potter", level: "starter", wordCount: 900, estimatedGrade: 4.7, averageSentenceWords: 13.2, genres: ["childrens", "shorts"] },
    { gutenbergId: 15137, title: "The Tale of Mrs. Tiggy-Winkle", author: "Beatrix Potter", level: "starter", wordCount: 1200, estimatedGrade: 5.0, averageSentenceWords: 14.0, genres: ["childrens", "shorts"], gitenbergSlug: "The-Tale-of-Mrs.-Tiggy-Winkle" },
    { gutenbergId: 15077, title: "The Tale of Mr. Jeremy Fisher", author: "Beatrix Potter", level: "starter", genres: ["childrens", "shorts"] },
    { gutenbergId: 14220, title: "The Tale of the Flopsy Bunnies", author: "Beatrix Potter", level: "starter", genres: ["childrens", "shorts"] },
    { gutenbergId: 45264, title: "The Tale of Two Bad Mice", author: "Beatrix Potter", level: "starter", genres: ["childrens", "shorts"] },
    { gutenbergId: 14868, title: "The Tailor of Gloucester", author: "Beatrix Potter", level: "starter", genres: ["childrens", "shorts"] },
    { gutenbergId: 19805, title: "The Tale of Mr. Tod", author: "Beatrix Potter", level: "starter", genres: ["childrens", "shorts"] },
    { gutenbergId: 15575, title: "The Tale of Samuel Whiskers", author: "Beatrix Potter", level: "starter", genres: ["childrens", "shorts"] },
    { gutenbergId: 902, title: "The Happy Prince, and Other Tales", author: "Oscar Wilde", level: "easy", wordCount: 16245, estimatedGrade: 5.5, averageSentenceWords: 15.6, genres: ["childrens", "fantasy", "shorts"], gitenbergFile: "902-0.txt" },
    { gutenbergId: 11, title: "Alice's Adventures in Wonderland", author: "Lewis Carroll", level: "easy", wordCount: 26518, estimatedGrade: 5.8, averageSentenceWords: 16.3, genres: ["childrens", "fantasy"] },
    { gutenbergId: 55, title: "The Wonderful Wizard of Oz", author: "L. Frank Baum", level: "easy", wordCount: 39661, estimatedGrade: 6, averageSentenceWords: 17.6, genres: ["adventure", "childrens", "fantasy"] },
    { gutenbergId: 19994, title: "The Aesop for Children", author: "Aesop, illustrated by Milo Winter", level: "easy", wordCount: 14800, estimatedGrade: 5.7, averageSentenceWords: 15.2, genres: ["childrens", "shorts"], gitenbergSlug: "The-Aesop-for-Children--13-With-pictures-by-Milo-Winter" },
    { gutenbergId: 16, title: "Peter Pan", author: "J. M. Barrie", level: "easy", wordCount: 47300, estimatedGrade: 5.8, averageSentenceWords: 16.4, genres: ["adventure", "childrens", "fantasy"] },
    { gutenbergId: 708, title: "The Princess and the Goblin", author: "George MacDonald", level: "easy", wordCount: 53000, estimatedGrade: 6.1, averageSentenceWords: 17.1, genres: ["adventure", "childrens", "fantasy"] },
    { gutenbergId: 236, title: "The Jungle Book", author: "Rudyard Kipling", level: "easy", wordCount: 52000, estimatedGrade: 6.6, averageSentenceWords: 17.4, genres: ["adventure", "childrens", "shorts"] },
    { gutenbergId: 271, title: "Black Beauty", author: "Anna Sewell", level: "easy", wordCount: 59000, estimatedGrade: 5.9, averageSentenceWords: 16.8, genres: ["childrens", "fiction"] },
    { gutenbergId: 21935, title: "Prince Prigio", author: "Andrew Lang", level: "easy", genres: ["childrens", "fantasy", "shorts"] },
    { gutenbergId: 52545, title: "The Princess Nobody", author: "Andrew Lang", level: "easy", genres: ["childrens", "fantasy"] },
    { gutenbergId: 30272, title: "Very Short Stories and Verses for Children", author: "W. K. Clifford", level: "easy", genres: ["childrens", "shorts"] },
    { gutenbergId: 21292, title: "Brave and True", author: "G. M. Fenn and others", level: "easy", genres: ["childrens", "shorts"] },
    { gutenbergId: 1430, title: "Beautiful Stories from Shakespeare", author: "E. Nesbit", level: "easy", genres: ["childrens", "drama", "shorts"] },
    { gutenbergId: 23661, title: "The Book of Dragons", author: "E. Nesbit", level: "easy", genres: ["childrens", "fantasy", "shorts"] },
    { gutenbergId: 27903, title: "The Magic World", author: "E. Nesbit", level: "easy", genres: ["childrens", "fantasy", "shorts"] },
    { gutenbergId: 49913, title: "Nine Unlikely Tales", author: "E. Nesbit", level: "easy", genres: ["childrens", "fantasy", "shorts"] },
    { gutenbergId: 146, title: "A Little Princess", author: "Frances Hodgson Burnett", level: "easy", genres: ["childrens", "fiction"] },
    { gutenbergId: 479, title: "Little Lord Fauntleroy", author: "Frances Hodgson Burnett", level: "easy", genres: ["childrens", "fiction"] },
    { gutenbergId: 35, title: "The Time Machine", author: "H. G. Wells", level: "steady", wordCount: 32578, estimatedGrade: 7.2, averageSentenceWords: 16.7, genres: ["adventure", "science-fiction"] },
    { gutenbergId: 289, title: "The Wind in the Willows", author: "Kenneth Grahame", level: "steady", wordCount: 58836, estimatedGrade: 7, averageSentenceWords: 18.1, genres: ["childrens", "fantasy"] },
    { gutenbergId: 120, title: "Treasure Island", author: "Robert Louis Stevenson", level: "steady", wordCount: 68628, estimatedGrade: 5.5, averageSentenceWords: 16.1, genres: ["adventure", "childrens"] },
    { gutenbergId: 174, title: "The Picture of Dorian Gray", author: "Oscar Wilde", level: "steady", wordCount: 79191, estimatedGrade: 4.7, averageSentenceWords: 11.9, genres: ["fiction", "horror", "philosophy"] },
    { gutenbergId: 17396, title: "The Secret Garden", author: "Frances Hodgson Burnett", level: "steady", wordCount: 81378, estimatedGrade: 4.3, averageSentenceWords: 12.9, genres: ["childrens", "fiction"] },
    { gutenbergId: 1661, title: "The Adventures of Sherlock Holmes", author: "Arthur Conan Doyle", level: "steady", wordCount: 104548, estimatedGrade: 5.5, averageSentenceWords: 14.4, genres: ["mystery", "shorts"] },
    { gutenbergId: 215, title: "The Call of the Wild", author: "Jack London", level: "steady", wordCount: 37000, estimatedGrade: 7.3, averageSentenceWords: 18.4, genres: ["adventure", "fiction"] },
    { gutenbergId: 103, title: "Around the World in Eighty Days", author: "Jules Verne", level: "steady", wordCount: 63000, estimatedGrade: 7.0, averageSentenceWords: 18.0, genres: ["adventure", "travel"], gitenbergSlug: "Around-the-World-in-80-Days" },
    { gutenbergId: 74, title: "The Adventures of Tom Sawyer", author: "Mark Twain", level: "steady", genres: ["adventure", "childrens", "fiction"] },
    { gutenbergId: 244, title: "A Study in Scarlet", author: "Arthur Conan Doyle", level: "steady", genres: ["mystery", "fiction"] },
    { gutenbergId: 2097, title: "The Sign of the Four", author: "Arthur Conan Doyle", level: "steady", genres: ["mystery", "fiction"] },
    { gutenbergId: 2781, title: "Just So Stories", author: "Rudyard Kipling", level: "steady", genres: ["childrens", "shorts"] },
    { gutenbergId: 17314, title: "Five Children and It", author: "E. Nesbit", level: "steady", genres: ["adventure", "childrens", "fantasy"] },
    { gutenbergId: 1874, title: "The Railway Children", author: "E. Nesbit", level: "steady", genres: ["adventure", "childrens", "fiction"] },
    { gutenbergId: 836, title: "The Phoenix and the Carpet", author: "E. Nesbit", level: "steady", genres: ["adventure", "childrens", "fantasy"] },
    { gutenbergId: 770, title: "The Story of the Treasure Seekers", author: "E. Nesbit", level: "steady", genres: ["adventure", "childrens", "fiction"] },
    { gutenbergId: 18857, title: "A Journey to the Centre of the Earth", author: "Jules Verne", level: "steady", genres: ["adventure", "science-fiction"] },
    { gutenbergId: 139, title: "The Lost World", author: "Arthur Conan Doyle", level: "steady", genres: ["adventure", "science-fiction"] },
    { gutenbergId: 2852, title: "The Hound of the Baskervilles", author: "Arthur Conan Doyle", level: "steady", genres: ["mystery", "fiction"] },
    { gutenbergId: 558, title: "The Thirty-Nine Steps", author: "John Buchan", level: "steady", genres: ["adventure", "mystery", "fiction"] },
    { gutenbergId: 421, title: "Kidnapped", author: "Robert Louis Stevenson", level: "steady", genres: ["adventure", "fiction"] },
    { gutenbergId: 175, title: "The Phantom of the Opera", author: "Gaston Leroux", level: "steady", genres: ["horror", "mystery", "fiction"] },
    { gutenbergId: 2591, title: "Grimms' Fairy Tales", author: "Jacob and Wilhelm Grimm", level: "steady", genres: ["childrens", "fantasy", "shorts"] },
    { gutenbergId: 17157, title: "Gulliver's Travels", author: "Jonathan Swift", level: "steady", genres: ["adventure", "satire", "fiction"] },
    { gutenbergId: 21, title: "Three Hundred Aesop's Fables", author: "Aesop, translated by George Fyler Townsend", level: "stretch", wordCount: 43888, estimatedGrade: 9.4, averageSentenceWords: 24.3, genres: ["childrens", "shorts"], gitenbergDisabled: true },
    { gutenbergId: 84, title: "Frankenstein", author: "Mary Shelley", level: "stretch", wordCount: 75089, estimatedGrade: 9.8, averageSentenceWords: 22.3, genres: ["fiction", "horror", "science-fiction"] },
    { gutenbergId: 1342, title: "Pride and Prejudice", author: "Jane Austen", level: "stretch", wordCount: 126819, estimatedGrade: 8.1, averageSentenceWords: 17.5, genres: ["comedy", "fiction"] },
    { gutenbergId: 2701, title: "Moby-Dick", author: "Herman Melville", level: "stretch", wordCount: 214004, estimatedGrade: 8.9, averageSentenceWords: 20.7, genres: ["adventure", "fiction"], gitenbergSlug: "Moby-Dick--Or-The-Whale" },
    { gutenbergId: 1400, title: "Great Expectations", author: "Charles Dickens", level: "stretch", wordCount: 187000, estimatedGrade: 8.0, averageSentenceWords: 19.7, genres: ["fiction"] },
    { gutenbergId: 1260, title: "Jane Eyre", author: "Charlotte Brontë", level: "stretch", wordCount: 190000, estimatedGrade: 8.2, averageSentenceWords: 20.1, genres: ["fiction"] },
    { gutenbergId: 768, title: "Wuthering Heights", author: "Emily Brontë", level: "stretch", wordCount: 119000, estimatedGrade: 8.4, averageSentenceWords: 20.5, genres: ["fiction", "horror"] },
    { gutenbergId: 145, title: "Middlemarch", author: "George Eliot", level: "stretch", wordCount: 316000, estimatedGrade: 9.2, averageSentenceWords: 22.0, genres: ["fiction"] },
    { gutenbergId: 161, title: "Sense and Sensibility", author: "Jane Austen", level: "stretch", genres: ["fiction"] },
    { gutenbergId: 135, title: "Les Misérables", author: "Victor Hugo", level: "stretch", genres: ["fiction"] },
    { gutenbergId: 28054, title: "The Brothers Karamazov", author: "Fyodor Dostoyevsky", level: "stretch", genres: ["fiction", "philosophy"] },
    { gutenbergId: 110, title: "Tess of the d'Urbervilles", author: "Thomas Hardy", level: "stretch", genres: ["fiction"] },
    { gutenbergId: 541, title: "The Age of Innocence", author: "Edith Wharton", level: "stretch", genres: ["fiction"] },
    { gutenbergId: 583, title: "The Woman in White", author: "Wilkie Collins", level: "stretch", genres: ["mystery", "fiction"] },
    { gutenbergId: 2610, title: "The Hunchback of Notre-Dame", author: "Victor Hugo", level: "stretch", genres: ["fiction"] },
    { gutenbergId: 1399, title: "Anna Karenina", author: "Leo Tolstoy", level: "stretch", genres: ["fiction"] },
    { gutenbergId: 2600, title: "War and Peace", author: "Leo Tolstoy", level: "stretch", genres: ["fiction"] },
    { gutenbergId: 4300, title: "Ulysses", author: "James Joyce", level: "stretch", genres: ["fiction"] },
    { gutenbergId: 209, title: "The Turn of the Screw", author: "Henry James", level: "stretch", genres: ["horror", "fiction"] },
    { gutenbergId: 601, title: "The Monk", author: "Matthew Gregory Lewis", level: "stretch", genres: ["horror", "fiction"] },
    { gutenbergId: 6593, title: "The History of Tom Jones", author: "Henry Fielding", level: "stretch", genres: ["comedy", "fiction"] },
    { gutenbergId: 2527, title: "The Sorrows of Young Werther", author: "Johann Wolfgang von Goethe", level: "stretch", genres: ["fiction"] },
    { gutenbergId: 26471, title: "Spoon River Anthology", author: "Edgar Lee Masters", level: "stretch", genres: ["poetry"] },
    { gutenbergId: 1727, title: "The Odyssey", author: "Homer", level: "stretch", genres: ["adventure", "poetry"] }
  ].map((book) => ({
    ...book,
    id: `gutenberg:${book.gutenbergId}`,
    source: "gutenberg",
    guided: true,
    link: `https://www.gutenberg.org/ebooks/${book.gutenbergId}`
  }));
  const OFFICIAL_BOOKS = [{
    id: USAF_HANDBOOK_ID,
    source: "usaf",
    title: "Air Force Handbook 1 — Airman",
    author: "United States Air Force",
    dataVersion: USAF_HANDBOOK_DATA_VERSION,
    editionDate: USAF_HANDBOOK_EDITION_DATE,
    link: USAF_HANDBOOK_SOURCE_URL,
    dataUrl: USAF_HANDBOOK_DATA_URL,
    level: "stretch",
    wordCount: USAF_HANDBOOK_WORD_COUNT,
    genres: ["nonfiction"],
    subjects: ["AFH1", "AFH 1", "United States Air Force", "Airmen", "military profession", "readiness", "leadership", "warfighting", "doctrine"],
    summary: "Official U.S. Air Force handbook covering the profession of arms, Air Force history and heritage, standards, readiness, leadership, warfighting, doctrine, and enlisted promotion study material."
  }];
  const STANDARD_BANDS = [
    { value: "500", label: "500" },
    { value: "1500", label: "1.5k" },
    { value: "3000", label: "3k" },
    { value: "5000", label: "5k" },
    { value: "10000", label: "10k" },
    { value: "16000", label: "16k" },
    { value: "20000", label: "20k" },
    { value: "all", label: "All" }
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
    },
    es: {
      label: "Spanish",
      shortLabel: "ES",
      sourceHead: "Spanish",
      dataUrl: "data/es-core.json",
      speechLang: "es-ES",
      translateSl: "es",
      dir: "ltr"
    },
    fr: {
      label: "French",
      shortLabel: "FR",
      sourceHead: "French",
      dataUrl: "data/fr-core.json",
      speechLang: "fr-FR",
      translateSl: "fr",
      dir: "ltr"
    },
    hi: {
      label: "Hindi",
      shortLabel: "HI",
      sourceHead: "Hindi",
      dataUrl: "data/hi-core.json",
      speechLang: "hi-IN",
      translateSl: "hi",
      dir: "ltr"
    },
    ja: {
      label: "Japanese",
      shortLabel: "JA",
      sourceHead: "Japanese",
      dataUrl: "data/ja-core.json",
      speechLang: "ja-JP",
      translateSl: "ja",
      dir: "ltr"
    },
    ko: {
      label: "Korean",
      shortLabel: "KO",
      sourceHead: "Korean",
      dataUrl: "data/ko-core.json",
      speechLang: "ko-KR",
      translateSl: "ko",
      dir: "ltr"
    },
    en: {
      label: "English Vernacular",
      shortLabel: "EN",
      sourceHead: "Rare word",
      meaningHead: "Definition",
      dataUrl: "data/en-vernacular.json",
      speechLang: "en-US",
      translateSl: "en",
      dir: "ltr",
      mode: "vernacular",
      readerEnabled: false,
      bandLabel: "Collection",
      defaultBand: "all",
      datasetNoun: "curated words",
      listLabel: "English rare-word collection",
      bands: [
        { value: "500", label: "Core · 500" },
        { value: "1500", label: "Expanded · 1.5k" },
        { value: "3000", label: "Deep cuts · 3k" },
        { value: "all", label: "Complete · 3.5k" }
      ]
    }
  };

  const els = {
    datasetMeta: document.getElementById("datasetMeta"),
    languageSelect: document.getElementById("languageSelect"),
    bandLabelText: document.getElementById("bandLabelText"),
    bandSelect: document.getElementById("bandSelect"),
    bookToggle: document.getElementById("bookToggle"),
    newsToggle: document.getElementById("newsToggle"),
    knowledgeToggle: document.getElementById("knowledgeToggle"),
    studyMusicToggle: document.getElementById("studyMusicToggle"),
    studyMusicPanel: document.getElementById("studyMusicPanel"),
    studyMusicStyleSelect: document.getElementById("studyMusicStyleSelect"),
    studyMusicPrevBtn: document.getElementById("studyMusicPrevBtn"),
    studyMusicPlayBtn: document.getElementById("studyMusicPlayBtn"),
    studyMusicNextBtn: document.getElementById("studyMusicNextBtn"),
    studyMusicVolume: document.getElementById("studyMusicVolume"),
    studyMusicVolumeValue: document.getElementById("studyMusicVolumeValue"),
    studyMusicDuck: document.getElementById("studyMusicDuck"),
    studyMusicTitle: document.getElementById("studyMusicTitle"),
    studyMusicSourceLink: document.getElementById("studyMusicSourceLink"),
    studyMusicLicenseLink: document.getElementById("studyMusicLicenseLink"),
    studyMusicCorpusLink: document.getElementById("studyMusicCorpusLink"),
    studyMusicStatus: document.getElementById("studyMusicStatus"),
    studyMusicAudio: document.getElementById("studyMusicAudio"),
    settingsToggle: document.getElementById("settingsToggle"),
    settingsPanel: document.getElementById("settingsPanel"),
    rankLabel: document.getElementById("rankLabel"),
    posLabel: document.getElementById("posLabel"),
    ruWord: document.getElementById("ruWord"),
    meaningState: document.getElementById("meaningState"),
    enWord: document.getElementById("enWord"),
    entryExample: document.getElementById("entryExample"),
    focusSpeechTracks: document.getElementById("focusSpeechTracks"),
    focusSpeechTrack2: document.getElementById("focusSpeechTrack2"),
    focusSpeechTrack2Label: document.getElementById("focusSpeechTrack2Label"),
    focusSpeechTrack2Text: document.getElementById("focusSpeechTrack2Text"),
    focusSpeechTrack3: document.getElementById("focusSpeechTrack3"),
    focusSpeechTrack3Label: document.getElementById("focusSpeechTrack3Label"),
    focusSpeechTrack3Text: document.getElementById("focusSpeechTrack3Text"),
    prevBtn: document.getElementById("prevBtn"),
    playBtn: document.getElementById("playBtn"),
    nextBtn: document.getElementById("nextBtn"),
    shuffleBtn: document.getElementById("shuffleBtn"),
    engineSelect: document.getElementById("engineSelect"),
    speechTrack1Language: document.getElementById("speechTrack1Language"),
    speechTrack2LanguageSelect: document.getElementById("speechTrack2LanguageSelect"),
    speechTrack2EngineSelect: document.getElementById("speechTrack2EngineSelect"),
    speechTrack2Hint: document.getElementById("speechTrack2Hint"),
    speechTrack3LanguageSelect: document.getElementById("speechTrack3LanguageSelect"),
    speechTrack3EngineSelect: document.getElementById("speechTrack3EngineSelect"),
    speechTrack3VoiceLabel: document.getElementById("speechTrack3VoiceLabel"),
    speechTrack3VoiceSelect: document.getElementById("speechTrack3VoiceSelect"),
    speechTrack3Hint: document.getElementById("speechTrack3Hint"),
    speechTrack1Volume: document.getElementById("speechTrack1Volume"),
    speechTrack1VolumeValue: document.getElementById("speechTrack1VolumeValue"),
    speechTrack2Volume: document.getElementById("speechTrack2Volume"),
    speechTrack2VolumeValue: document.getElementById("speechTrack2VolumeValue"),
    speechTrack3Volume: document.getElementById("speechTrack3Volume"),
    speechTrack3VolumeValue: document.getElementById("speechTrack3VolumeValue"),
    speechVolumeHint: document.getElementById("speechVolumeHint"),
    piperResourceWarning: document.getElementById("piperResourceWarning"),
    piperEngineHint: document.getElementById("piperEngineHint"),
    piperClearBtn: document.getElementById("piperClearBtn"),
    sourceVoiceLabel: document.getElementById("sourceVoiceLabel"),
    sourceVoiceSelect: document.getElementById("sourceVoiceSelect"),
    enVoiceLabel: document.getElementById("enVoiceLabel"),
    enVoiceSelect: document.getElementById("enVoiceSelect"),
    enLangSelect: document.getElementById("enLangSelect"),
    sourceRateLabel: document.getElementById("sourceRateLabel"),
    enRateLabel: document.getElementById("enRateLabel"),
    ruRate: document.getElementById("ruRate"),
    ruRateValue: document.getElementById("ruRateValue"),
    enRate: document.getElementById("enRate"),
    enRateValue: document.getElementById("enRateValue"),
    pageVolume: document.getElementById("pageVolume"),
    pageVolumeValue: document.getElementById("pageVolumeValue"),
    gapMs: document.getElementById("gapMs"),
    gapValue: document.getElementById("gapValue"),
    bookView: document.getElementById("bookView"),
    bookModeKicker: document.getElementById("bookModeKicker"),
    bookModeTitle: document.getElementById("bookModeTitle"),
    bookShelfBtn: document.getElementById("bookShelfBtn"),
    bookShelfControls: document.getElementById("bookShelfControls"),
    bookShelfViewSelect: document.getElementById("bookShelfViewSelect"),
    bookRandomBtn: document.getElementById("bookRandomBtn"),
    bookLanguageSelect: document.getElementById("bookLanguageSelect"),
    bookGenreSelect: document.getElementById("bookGenreSelect"),
    bookLevelSelect: document.getElementById("bookLevelSelect"),
    bookSearchInput: document.getElementById("bookSearchInput"),
    bookSearchBtn: document.getElementById("bookSearchBtn"),
    bookPageInput: document.getElementById("bookPageInput"),
    bookPrevPageBtn: document.getElementById("bookPrevPageBtn"),
    bookNextPageBtn: document.getElementById("bookNextPageBtn"),
    newsShelfControls: document.getElementById("newsShelfControls"),
    newsLanguageSelect: document.getElementById("newsLanguageSelect"),
    newsSourceSelect: document.getElementById("newsSourceSelect"),
    newsSearchInput: document.getElementById("newsSearchInput"),
    newsSearchBtn: document.getElementById("newsSearchBtn"),
    newsRefreshBtn: document.getElementById("newsRefreshBtn"),
    newsRandomBtn: document.getElementById("newsRandomBtn"),
    knowledgeShelfControls: document.getElementById("knowledgeShelfControls"),
    knowledgeTopicSelect: document.getElementById("knowledgeTopicSelect"),
    knowledgeTranslationSelect: document.getElementById("knowledgeTranslationSelect"),
    knowledgePeopleFilter: document.getElementById("knowledgePeopleFilter"),
    knowledgeIncludeBirthDeaths: document.getElementById("knowledgeIncludeBirthDeaths"),
    knowledgeRefreshBtn: document.getElementById("knowledgeRefreshBtn"),
    knowledgeRandomBtn: document.getElementById("knowledgeRandomBtn"),
    bookPrevSentenceBtn: document.getElementById("bookPrevSentenceBtn"),
    bookPlayBtn: document.getElementById("bookPlayBtn"),
    bookNextSentenceBtn: document.getElementById("bookNextSentenceBtn"),
    bookAudioSettingsToggle: document.getElementById("bookAudioSettingsToggle"),
    bookAudioPanel: document.getElementById("bookAudioPanel"),
    bookSourceRate: document.getElementById("bookSourceRate"),
    bookSourceRateValue: document.getElementById("bookSourceRateValue"),
    bookEnRate: document.getElementById("bookEnRate"),
    bookEnRateValue: document.getElementById("bookEnRateValue"),
    bookVolume: document.getElementById("bookVolume"),
    bookVolumeValue: document.getElementById("bookVolumeValue"),
    bookReadEnglish: document.getElementById("bookReadEnglish"),
    bookReader: document.getElementById("bookReader"),
    bookReaderMeta: document.getElementById("bookReaderMeta"),
    bookReaderTitle: document.getElementById("bookReaderTitle"),
    bookSourceLink: document.getElementById("bookSourceLink"),
    bookSourceNotice: document.getElementById("bookSourceNotice"),
    bookChapterLabel: document.getElementById("bookChapterLabel"),
    bookChapterSelect: document.getElementById("bookChapterSelect"),
    bookProgressValue: document.getElementById("bookProgressValue"),
    bookProgressRange: document.getElementById("bookProgressRange"),
    bookSourceLabel: document.getElementById("bookSourceLabel"),
    bookSourceSentence: document.getElementById("bookSourceSentence"),
    bookEnglishLabel: document.getElementById("bookEnglishLabel"),
    bookEnglishSentence: document.getElementById("bookEnglishSentence"),
    bookSpeechTracks: document.getElementById("bookSpeechTracks"),
    bookSpeechTrack2: document.getElementById("bookSpeechTrack2"),
    bookSpeechTrack2Label: document.getElementById("bookSpeechTrack2Label"),
    bookSpeechTrack2Sentence: document.getElementById("bookSpeechTrack2Sentence"),
    bookSpeechTrack3: document.getElementById("bookSpeechTrack3"),
    bookSpeechTrack3Label: document.getElementById("bookSpeechTrack3Label"),
    bookSpeechTrack3Sentence: document.getElementById("bookSpeechTrack3Sentence"),
    bookNearbyList: document.getElementById("bookNearbyList"),
    bookShelf: document.getElementById("bookShelf"),
    sourceHead: document.getElementById("sourceHead"),
    meaningHead: document.getElementById("meaningHead"),
    wordList: document.getElementById("wordList"),
    listSpacer: document.getElementById("listSpacer"),
    virtualRows: document.getElementById("virtualRows"),
    statusText: document.getElementById("statusText"),
    progressText: document.getElementById("progressText")
  };

  const bookDifficultyCache = loadBookDifficultyCache();
  const readerTranslationCache = loadReaderTranslationCache();

  const state = {
    entries: [],
    meta: null,
    order: [],
    language: "ru",
    currentPos: 0,
    playDirection: 1,
    playing: false,
    playToken: 0,
    ttsEngine: "system",
    speechTrack2Language: "en",
    speechTrack2Engine: "system",
    speechTrack3Language: "off",
    speechTrack3Engine: "system",
    speechVolumeBoosts: Object.fromEntries(
      Object.keys(LANGUAGES).map((languageKey) => [languageKey, SPEECH_VOLUME_BOOST_DEFAULT])
    ),
    focusSpeechRenderToken: 0,
    shuffle: false,
    band: "20000",
    bandByLanguage: {},
    voices: [],
    voiceRefreshPromise: null,
    voiceLoadSettled: false,
    voicePrefs: {
      ru: "",
      fa: "",
      es: "",
      fr: "",
      hi: "",
      ja: "",
      ko: "",
      en: ""
    },
    enLang: "",
    rowHeight: 42,
    translationCache: loadTranslationCache(),
    bookMode: false,
    contentMode: "books",
    bookViewMode: "shelf",
    bookShelfKind: "guided",
    bookPage: 1,
    bookHasNextPage: true,
    bookHasPreviousPage: false,
    bookSearch: "",
    bookGenre: "",
    bookLevel: "",
    bookBooks: [],
    bookLoadedBook: null,
    bookSentences: [],
    bookChapters: [],
    bookCurrentIndex: 0,
    bookPlaying: false,
    bookPlayDirection: 1,
    bookAudioSettingsOpen: false,
    bookRenderToken: 0,
    bookProgress: loadBookProgress(),
    bookFavorites: loadBookFavorites(),
    bookDifficulty: bookDifficultyCache,
    bookTranslationCache: readerTranslationCache,
    bookTranslationPromises: new Map(),
    readerAlignmentCache: new Map(),
    readerDocumentCache: new Map(),
    readerDocumentPromises: new Map(),
    readerPrefetchTimer: 0,
    readerSentencePrefetchTimer: 0,
    readerTranslationSaveTimer: 0,
    newsSourceByLanguage: {},
    newsFeedCache: loadNewsFeedCache(),
    newsFeedLoadToken: 0,
    newsAllArticles: [],
    newsSearch: "",
    knowledgeTopic: "general",
    knowledgeTranslation: "off",
    knowledgeIncludeBirthDeaths: false,
    knowledgeCache: loadKnowledgeCache(),
    knowledgeHistory: loadKnowledgeHistory(),
    knowledgeLoadToken: 0,
    piperWorkers: new Map(),
    piperRequestId: 0,
    piperAudio: null,
    piperAudioUnlocked: false,
    piperAudioUrl: "",
    piperPlaybackCancel: null,
    piperAudioCache: new Map(),
    piperAudioCacheBytes: 0,
    piperAudioPending: new Map(),
    piperHighlightTimer: 0,
    piperFailures: new Map(),
    piperStorageBusy: false,
    studyMusicStyle: "off",
    studyMusicVolume: STUDY_MUSIC_VOLUME_DEFAULT,
    studyMusicDuckEnabled: true,
    studyMusicMembers: [],
    studyMusicMemberCursor: 0,
    studyMusicTracks: [],
    studyMusicTrackIndex: -1,
    studyMusicLoadToken: 0,
    studyMusicAbortController: null,
    studyMusicLoadPromise: null,
    studyMusicRefillPromise: null,
    studyMusicWantedPlaying: false,
    studyMusicPlaybackToken: 0,
    studyMusicNavigationToken: 0,
    studyMusicPageHidden: false,
    studyMusicConsecutiveFailures: 0,
    studyMusicFailurePending: false,
    studyMusicStallTimer: 0,
    studyMusicStableTimer: 0,
    studyMusicAudioContext: null,
    studyMusicSourceNode: null,
    studyMusicGainNode: null,
    studyMusicDuckOwners: new Set(),
    activeHighlights: [],
    activeCorrespondingHighlights: [],
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
      state.bandByLanguage = prefs.bandByLanguage && typeof prefs.bandByLanguage === "object"
        ? { ...prefs.bandByLanguage }
        : {};
      if (!state.bandByLanguage[state.language] && prefs.band) {
        state.bandByLanguage[state.language] = String(prefs.band);
      }
      state.band = String(
        state.bandByLanguage[state.language]
        || activeLanguage().defaultBand
        || state.band
      );
      state.shuffle = Boolean(prefs.shuffle);
      state.currentPos = Number.isFinite(prefs.currentPos) ? prefs.currentPos : 0;
      state.bookShelfKind = BOOK_SHELF_KINDS.has(prefs.bookShelfKind) ? prefs.bookShelfKind : state.bookShelfKind;
      state.bookGenre = BOOK_GENRES[prefs.bookGenre] ? prefs.bookGenre : "";
      state.bookLevel = BOOK_LEVELS[prefs.bookLevel] ? prefs.bookLevel : "";
      state.newsSourceByLanguage = prefs.newsSourceByLanguage && typeof prefs.newsSourceByLanguage === "object"
        ? { ...prefs.newsSourceByLanguage }
        : {};
      state.knowledgeTopic = KNOWLEDGE_TOPICS[prefs.knowledgeTopic]
        ? prefs.knowledgeTopic
        : state.knowledgeTopic;
      state.knowledgeTranslation = LANGUAGES[prefs.knowledgeTranslation] && prefs.knowledgeTranslation !== "en"
        ? prefs.knowledgeTranslation
        : "off";
      state.knowledgeIncludeBirthDeaths = prefs.knowledgeIncludeBirthDeaths === true;
      if (prefs.voicePrefs && typeof prefs.voicePrefs === "object") {
        state.voicePrefs = { ...state.voicePrefs, ...prefs.voicePrefs };
      }
      state.enLang = typeof prefs.enLang === "string" ? prefs.enLang : state.enLang;
      const savedEngine = prefs.ttsEngine || prefs.desktopTtsEngine;
      state.ttsEngine = savedEngine === "piper" && piperRuntimeAvailable() ? "piper" : "system";
      const savedTrack2Language = normalizeSpeechTrackLanguage(prefs.speechTrack2Language);
      const savedTrack3Language = normalizeSpeechTrackLanguage(prefs.speechTrack3Language);
      if (savedTrack2Language) state.speechTrack2Language = savedTrack2Language;
      if (savedTrack3Language) state.speechTrack3Language = savedTrack3Language;
      state.speechTrack2Engine = normalizeSpeechTrackEngine(prefs.speechTrack2Engine);
      state.speechTrack3Engine = normalizeSpeechTrackEngine(prefs.speechTrack3Engine);
      state.studyMusicStyle = STUDY_MUSIC_COLLECTIONS[prefs.studyMusicStyle]
        ? prefs.studyMusicStyle
        : "off";
      state.studyMusicVolume = clamp(
        prefs.studyMusicVolume ?? STUDY_MUSIC_VOLUME_DEFAULT,
        0,
        1
      );
      state.studyMusicDuckEnabled = prefs.studyMusicDuckEnabled !== false;
      if (prefs.speechVolumeBoosts && typeof prefs.speechVolumeBoosts === "object") {
        Object.keys(LANGUAGES).forEach((languageKey) => {
          state.speechVolumeBoosts[languageKey] = normalizeSpeechVolumeBoost(
            prefs.speechVolumeBoosts[languageKey]
          );
        });
      }
      els.ruRate.value = prefs.ruRate || els.ruRate.value;
      els.enRate.value = prefs.enRate || els.enRate.value;
      els.pageVolume.value = String(clamp(prefs.pageVolume ?? els.pageVolume.value, 0, 1));
      els.bookSourceRate.value = String(clamp(prefs.bookSourceWpm || els.bookSourceRate.value, 10, 200));
      els.bookEnRate.value = String(clamp(prefs.bookEnWpm || els.bookEnRate.value, 10, 200));
      els.bookVolume.value = els.pageVolume.value;
      const readEnglishPreference = typeof prefs.readEnglishAloud === "boolean"
        ? prefs.readEnglishAloud
        : prefs.bookReadEnglish !== false;
      els.bookReadEnglish.checked = readEnglishPreference;
      els.gapMs.value = prefs.gapMs || els.gapMs.value;
    } catch (error) {
      console.warn("Preference load failed:", error);
    }
  }

  function savePrefs() {
    state.bandByLanguage[state.language] = state.band;
    const prefs = {
      language: state.language,
      band: state.band,
      bandByLanguage: state.bandByLanguage,
      shuffle: state.shuffle,
      currentPos: state.currentPos,
      bookShelfKind: state.bookShelfKind,
      bookGenre: state.bookGenre,
      bookLevel: state.bookLevel,
      newsSourceByLanguage: state.newsSourceByLanguage,
      knowledgeTopic: state.knowledgeTopic,
      knowledgeTranslation: state.knowledgeTranslation,
      knowledgeIncludeBirthDeaths: state.knowledgeIncludeBirthDeaths,
      bookReadEnglish: els.bookReadEnglish.checked,
      readEnglishAloud: els.bookReadEnglish.checked,
      speechTrack2Language: state.speechTrack2Language,
      speechTrack2Engine: state.speechTrack2Engine,
      speechTrack3Language: state.speechTrack3Language,
      speechTrack3Engine: state.speechTrack3Engine,
      speechVolumeBoosts: Object.fromEntries(
        Object.keys(LANGUAGES).map((languageKey) => [
          languageKey,
          normalizeSpeechVolumeBoost(state.speechVolumeBoosts[languageKey])
        ])
      ),
      studyMusicStyle: state.studyMusicStyle,
      studyMusicVolume: state.studyMusicVolume,
      studyMusicDuckEnabled: state.studyMusicDuckEnabled,
      bookSourceWpm: els.bookSourceRate.value,
      bookEnWpm: els.bookEnRate.value,
      voicePrefs: state.voicePrefs,
      enLang: state.enLang,
      ttsEngine: state.ttsEngine,
      // Keep the old key for users moving between an older desktop build and
      // this shared browser/Home Screen setting.
      desktopTtsEngine: state.ttsEngine,
      ruRate: els.ruRate.value,
      enRate: els.enRate.value,
      pageVolume: els.pageVolume.value,
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

  function updateSettingLabels() {
    const language = activeLanguage();
    const vernacular = language.mode === "vernacular";
    const primaryTrack = speechTrackConfig(1);
    const track2 = speechTrackConfig(2);
    const track3 = speechTrackConfig(3);
    els.sourceRateLabel.textContent = vernacular ? "Word speed" : `${activeLanguage().shortLabel} speed`;
    els.speechTrack1Language.textContent = language.label;
    els.sourceVoiceLabel.textContent = speechTrackUsesPiper(primaryTrack)
      ? `${language.label} Piper model`
      : `${language.label} system voice`;
    els.enRateLabel.textContent = vernacular ? "Definition speed" : "EN speed";
    els.enVoiceLabel.textContent = track2.language === "off"
      ? "Track 2 voice"
      : `${languageTrackLabel(track2.language)} ${speechTrackUsesPiper(track2) ? "Piper model" : "system voice"}`;
    els.speechTrack3VoiceLabel.textContent = track3.language === "off"
      ? "Track 3 voice"
      : `${languageTrackLabel(track3.language)} ${speechTrackUsesPiper(track3) ? "Piper model" : "system voice"}`;
    els.ruRateValue.textContent = `${Number(els.ruRate.value).toFixed(2)}x`;
    els.enRateValue.textContent = `${Number(els.enRate.value).toFixed(2)}x`;
    els.pageVolumeValue.textContent = `${Math.round(pageVolume() * 100)}%`;
    els.bookSourceRateValue.textContent = `${Math.round(Number(els.bookSourceRate.value))} WPM`;
    els.bookEnRateValue.textContent = `${Math.round(Number(els.bookEnRate.value))} WPM`;
    els.bookVolumeValue.textContent = `${Math.round(pageVolume() * 100)}%`;
    els.gapValue.textContent = `${Number.parseInt(els.gapMs.value, 10)} ms`;
    syncSpeechVolumeControls();
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

  function loadKnowledgeCache() {
    try {
      const value = JSON.parse(window.localStorage.getItem(KNOWLEDGE_CACHE_KEY) || "{}");
      return value && typeof value === "object" ? value : {};
    } catch {
      return {};
    }
  }

  function saveKnowledgeCache() {
    try {
      const entries = Object.entries(state.knowledgeCache)
        .sort((left, right) => Number(right[1]?.savedAt || 0) - Number(left[1]?.savedAt || 0))
        .slice(0, KNOWLEDGE_CACHE_LIMIT);
      state.knowledgeCache = Object.fromEntries(entries);
      window.localStorage.setItem(KNOWLEDGE_CACHE_KEY, JSON.stringify(state.knowledgeCache));
    } catch (error) {
      console.warn("Knowledge cache save failed:", error);
    }
  }

  function loadKnowledgeHistory() {
    try {
      const values = JSON.parse(window.localStorage.getItem(KNOWLEDGE_HISTORY_KEY) || "[]");
      return Array.isArray(values) ? values.filter((value) => typeof value === "string").slice(-KNOWLEDGE_HISTORY_LIMIT) : [];
    } catch {
      return [];
    }
  }

  function rememberKnowledgeItems(items) {
    const seen = new Set(state.knowledgeHistory);
    items.forEach((item) => {
      if (item?.id) seen.add(item.id);
    });
    state.knowledgeHistory = Array.from(seen).slice(-KNOWLEDGE_HISTORY_LIMIT);
    try {
      window.localStorage.setItem(KNOWLEDGE_HISTORY_KEY, JSON.stringify(state.knowledgeHistory));
    } catch (error) {
      console.warn("Knowledge history save failed:", error);
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

  function loadBookDifficultyCache() {
    try {
      const value = JSON.parse(window.localStorage.getItem(BOOK_DIFFICULTY_KEY) || "{}");
      return value && typeof value === "object" ? value : {};
    } catch {
      return {};
    }
  }

  function loadReaderTranslationCache() {
    try {
      const values = JSON.parse(window.localStorage.getItem(READER_TRANSLATIONS_KEY) || "[]");
      return new Map(Array.isArray(values) ? values.slice(-BOOK_TRANSLATION_CACHE_LIMIT) : []);
    } catch {
      return new Map();
    }
  }

  function loadNewsFeedCache() {
    try {
      const value = JSON.parse(window.localStorage.getItem(NEWS_FEED_CACHE_KEY) || "{}");
      return value && typeof value === "object" ? value : {};
    } catch {
      return {};
    }
  }

  function saveNewsFeedCache() {
    try {
      const entries = Object.entries(state.newsFeedCache)
        .sort((left, right) => Number(right[1]?.savedAt || 0) - Number(left[1]?.savedAt || 0))
        .slice(0, NEWS_FEED_CACHE_LIMIT);
      state.newsFeedCache = Object.fromEntries(entries);
      window.localStorage.setItem(NEWS_FEED_CACHE_KEY, JSON.stringify(state.newsFeedCache));
    } catch (error) {
      console.warn("News feed cache save failed:", error);
    }
  }

  function loadBookFavorites() {
    try {
      const value = JSON.parse(window.localStorage.getItem(BOOK_FAVORITES_KEY) || "{}");
      if (!value || typeof value !== "object") return {};
      return Object.values(value).reduce((favorites, rawBook) => {
        if (!rawBook || typeof rawBook !== "object") return favorites;
        const book = normalizeBookRecord(rawBook);
        if (book) {
          favorites[book.id] = {
            ...book,
            favoritedAt: Number(rawBook.favoritedAt) || Date.now()
          };
        }
        return favorites;
      }, {});
    } catch {
      return {};
    }
  }

  function saveBookFavoritesStore() {
    try {
      window.localStorage.setItem(BOOK_FAVORITES_KEY, JSON.stringify(state.bookFavorites));
    } catch (error) {
      console.warn("Book favorites save failed:", error);
    }
  }

  function saveBookProgressStore() {
    try {
      window.localStorage.setItem(BOOK_PROGRESS_KEY, JSON.stringify(state.bookProgress));
    } catch (error) {
      console.warn("Book progress save failed:", error);
    }
  }

  function saveBookDifficultyStore() {
    try {
      window.localStorage.setItem(BOOK_DIFFICULTY_KEY, JSON.stringify(state.bookDifficulty));
    } catch (error) {
      console.warn("Book difficulty save failed:", error);
    }
  }

  function scheduleReaderTranslationSave() {
    window.clearTimeout(state.readerTranslationSaveTimer);
    state.readerTranslationSaveTimer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(READER_TRANSLATIONS_KEY, JSON.stringify(Array.from(state.bookTranslationCache.entries())));
      } catch (error) {
        console.warn("Reader translation cache save failed:", error);
      }
    }, 350);
  }

  function setStatus(message) {
    els.statusText.textContent = message || "";
  }

  function setStudyMusicStatus(message) {
    if (els.studyMusicStatus) els.studyMusicStatus.textContent = message || "";
  }

  function currentStudyMusicCollection() {
    return STUDY_MUSIC_COLLECTIONS[state.studyMusicStyle] || null;
  }

  function currentStudyMusicTrack() {
    return state.studyMusicTracks[state.studyMusicTrackIndex] || null;
  }

  function studyMusicLicenseDisplay(track) {
    if (!track) return "License";
    return track.reviewPending
      ? `${track.licenseName} · Commons review pending`
      : track.licenseName;
  }

  function studyMusicPlainText(value, fallback = "") {
    const withoutMarkup = String(value || "")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]*>/g, " ");
    const clean = normalizeSpaces(decodeHtmlText(withoutMarkup));
    return (clean || fallback).slice(0, 220);
  }

  function studyMusicFileTitle(value) {
    return studyMusicPlainText(value, "Untitled track")
      .replace(/^File:/i, "")
      .replace(/\.(?:flac|m4a|mp3|oga|ogg|opus|wav)$/i, "")
      .replace(/_/g, " ")
      .trim()
      .slice(0, 180) || "Untitled track";
  }

  function studyMusicMetadataText(value) {
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) return value.map(studyMusicMetadataText).join(" ");
    if (typeof value === "object") {
      return Object.entries(value)
        .map(([key, nested]) => `${key} ${studyMusicMetadataText(nested)}`)
        .join(" ");
    }
    return String(value);
  }

  function studyMusicCommonMetadataValue(info, name) {
    const entries = Array.isArray(info?.commonmetadata) ? info.commonmetadata : [];
    const match = entries.find((entry) => String(entry?.name || "").toLowerCase() === name.toLowerCase());
    return match ? studyMusicMetadataText(match.value) : "";
  }

  function studyMusicSafeUrl(value, allowedHosts) {
    try {
      const url = new URL(studyMusicPlainText(value));
      if (url.protocol !== "https:") return "";
      const hostname = url.hostname.toLowerCase();
      if (!allowedHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))) return "";
      return url.href;
    } catch {
      return "";
    }
  }

  function studyMusicLicenseUrl(value) {
    try {
      const raw = studyMusicPlainText(value);
      const url = new URL(raw);
      if (url.protocol !== "https:" && url.protocol !== "http:") return "";
      if (!/^(?:www\.)?creativecommons\.org$/i.test(url.hostname)) return "";
      url.protocol = "https:";
      const path = url.pathname.toLowerCase();
      if (
        !path.startsWith("/licenses/by/")
        && !path.startsWith("/licenses/by-sa/")
        && !path.startsWith("/publicdomain/zero/")
        && !path.startsWith("/publicdomain/mark/")
      ) return "";
      return url.href;
    } catch {
      return "";
    }
  }

  function studyMusicMetadataHasConflict(info, page) {
    const hiddenCategories = (page?.categories || [])
      .map((category) => String(category?.title || ""))
      .join(" ");
    if (
      /copyright violation|possible copyright|deletion request|speedy deletion|without (?:a )?license|no machine-readable license|media without a license/i.test(hiddenCategories)
    ) return true;

    const embeddedEntries = (Array.isArray(info?.commonmetadata) ? info.commonmetadata : [])
      .filter((entry) => /copyright|license|usage\s*terms?/i.test(String(entry?.name || "")));
    const embeddedMetadata = studyMusicMetadataText(embeddedEntries);
    return /(?:by[-_\s]?nc|by[-_\s]?nd|non[-_\s]?commercial|no[-_\s]?derivatives?|all rights reserved)/i.test(embeddedMetadata);
  }

  function studyMusicLicenseFingerprint(value) {
    const text = studyMusicPlainText(value).toLowerCase().replace(/_/g, "-");
    if (!text) return null;
    let match = text.match(/creativecommons\.org\/licenses\/(by-sa|by)\/([\d.]+)/i);
    if (match) return { family: match[1].toLowerCase(), version: match[2].replace(/\.$/, "") };
    match = text.match(/creativecommons\.org\/publicdomain\/(zero|mark)\/([\d.]+)/i);
    if (match) return { family: match[1].toLowerCase() === "zero" ? "cc0" : "pdm", version: match[2].replace(/\.$/, "") };
    match = text.match(/\bcc[-\s]*by(?:[-\s]+(sa))?[-\s]*([\d.]+)?/i);
    if (match) return { family: match[1] ? "by-sa" : "by", version: (match[2] || "").replace(/\.$/, "") };
    match = text.match(/\battribution(?:[-\s]+share[-\s]*alike)?[-\s]*([\d.]+)?/i);
    if (match) return { family: /share[-\s]*alike/i.test(match[0]) ? "by-sa" : "by", version: (match[1] || "").replace(/\.$/, "") };
    match = text.match(/\bcc[-\s]*0[-\s]*([\d.]+)?/i);
    if (match) return { family: "cc0", version: (match[1] || "").replace(/\.$/, "") };
    if (/\bpublic domain\b/i.test(text)) return { family: "pdm", version: "" };
    return null;
  }

  function studyMusicEmbeddedLicenseConflict(info, licenseUrl) {
    const pageLicense = studyMusicLicenseFingerprint(licenseUrl);
    if (!pageLicense) return true;
    const embeddedLicenses = (Array.isArray(info?.commonmetadata) ? info.commonmetadata : [])
      .filter((entry) => /copyright|license|usage\s*terms?/i.test(String(entry?.name || "")))
      .map((entry) => studyMusicLicenseFingerprint(studyMusicMetadataText(entry.value)))
      .filter(Boolean);
    return embeddedLicenses.some((embedded) => (
      embedded.family !== pageLicense.family
      || (
        embedded.version
        && pageLicense.version
        && embedded.version !== pageLicense.version
      )
    ));
  }

  function studyMusicReviewPending(page) {
    return (page?.categories || []).some((category) => (
      /license review needed/i.test(String(category?.title || ""))
    ));
  }

  function studyMusicDuration(info) {
    const direct = Number(info?.duration);
    if (Number.isFinite(direct) && direct > 0) return direct;
    const embedded = studyMusicCommonMetadataValue(info, "Duration");
    const parsed = Number.parseFloat(embedded.match(/\d+(?:\.\d+)?/)?.[0] || "");
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function normalizeStudyMusicTrack(page) {
    const info = page?.imageinfo?.[0];
    if (!info || studyMusicMetadataHasConflict(info, page)) return null;
    const metadata = info.extmetadata || {};
    const mediaUrl = studyMusicSafeUrl(info.url, ["upload.wikimedia.org"]);
    const sourceUrl = studyMusicSafeUrl(info.descriptionurl, ["commons.wikimedia.org"]);
    const licenseUrl = studyMusicLicenseUrl(metadata.LicenseUrl?.value);
    const licenseName = studyMusicPlainText(metadata.LicenseShortName?.value || metadata.UsageTerms?.value);
    const mime = String(info.mime || "").toLowerCase();
    const size = Number(info.size) || 0;
    const duration = studyMusicDuration(info);
    if (!mediaUrl || !sourceUrl || !licenseUrl || !licenseName) return null;
    if (studyMusicEmbeddedLicenseConflict(info, licenseUrl)) return null;
    if (/\b(?:nc|nd)\b|noncommercial|no derivatives/i.test(licenseName)) return null;
    if (!/^audio\//.test(mime) && mime !== "application/ogg") return null;
    if (!/\.(?:m4a|mp3|oga|ogg|opus|wav)(?:$|[?#])/i.test(mediaUrl)) return null;
    if (size < STUDY_MUSIC_MIN_BYTES || size > STUDY_MUSIC_MAX_BYTES) return null;
    if (duration > 0 && duration < STUDY_MUSIC_MIN_DURATION_SECONDS) return null;
    const playableMime = mime === "application/ogg" ? "audio/ogg" : mime;
    if (typeof els.studyMusicAudio?.canPlayType === "function") {
      const support = els.studyMusicAudio.canPlayType(playableMime) || els.studyMusicAudio.canPlayType(mime);
      if (!support) return null;
    }
    const title = studyMusicFileTitle(metadata.ObjectName?.value || page.title);
    if (/\b(?:fuck|shit|cunt|porn|bitch)\b/i.test(title)) return null;
    const artist = studyMusicPlainText(metadata.Artist?.value || metadata.Credit?.value, "Unknown artist");
    return {
      id: String(page.pageid || info.sha1 || mediaUrl),
      title,
      artist,
      mediaUrl,
      mime: playableMime,
      sourceUrl,
      licenseName,
      licenseUrl,
      reviewPending: studyMusicReviewPending(page),
      duration,
      size
    };
  }

  function studyMusicApiUrl(parameters) {
    const url = new URL(STUDY_MUSIC_API_URL);
    Object.entries({ action: "query", format: "json", formatversion: "2", origin: "*", ...parameters })
      .forEach(([key, value]) => url.searchParams.set(key, String(value)));
    return url.href;
  }

  async function fetchStudyMusicJson(parameters, token) {
    if (token !== state.studyMusicLoadToken || !state.studyMusicAbortController) {
      throw new Error("Study music request cancelled");
    }
    const controller = state.studyMusicAbortController;
    const timeout = window.setTimeout(() => controller.abort(), STUDY_MUSIC_FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(studyMusicApiUrl(parameters), {
        cache: "default",
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`Wikimedia Commons returned ${response.status}`);
      return await response.json();
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function shuffledStudyMusicMembers(members) {
    const shuffled = [...members];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  }

  async function refillStudyMusicTracksInner(token, minimumToAdd = 1) {
    let added = 0;
    let attempts = 0;
    const knownIds = new Set(state.studyMusicTracks.map((track) => track.id));
    while (
      token === state.studyMusicLoadToken
      && added < minimumToAdd
      && state.studyMusicMemberCursor < state.studyMusicMembers.length
      && attempts < 4
    ) {
      attempts += 1;
      const members = state.studyMusicMembers.slice(
        state.studyMusicMemberCursor,
        state.studyMusicMemberCursor + STUDY_MUSIC_METADATA_BATCH_SIZE
      );
      state.studyMusicMemberCursor += members.length;
      const pageids = members.map((member) => Number(member.pageid)).filter(Number.isFinite);
      if (!pageids.length) continue;
      const payload = await fetchStudyMusicJson({
        prop: "imageinfo|categories",
        pageids: pageids.join("|"),
        iiprop: "url|mime|size|mediatype|extmetadata|commonmetadata",
        iiextmetadatafilter: "ObjectName|ImageDescription|Artist|Credit|LicenseShortName|LicenseUrl|UsageTerms|AttributionRequired",
        iiextmetadatalanguage: "en",
        iilimit: "1",
        clshow: "hidden",
        cllimit: "max"
      }, token);
      if (token !== state.studyMusicLoadToken) return added;
      for (const page of payload?.query?.pages || []) {
        const track = normalizeStudyMusicTrack(page);
        if (!track || knownIds.has(track.id)) continue;
        knownIds.add(track.id);
        state.studyMusicTracks.push(track);
        added += 1;
      }
    }
    return added;
  }

  function refillStudyMusicTracks(token, minimumToAdd = 1) {
    if (state.studyMusicRefillPromise) return state.studyMusicRefillPromise;
    const pending = refillStudyMusicTracksInner(token, minimumToAdd);
    state.studyMusicRefillPromise = pending;
    return pending.finally(() => {
      if (state.studyMusicRefillPromise === pending) state.studyMusicRefillPromise = null;
    });
  }

  function studyMusicTargetGain() {
    const ducked = state.studyMusicDuckEnabled && state.studyMusicDuckOwners.size > 0;
    return clamp(state.studyMusicVolume * (ducked ? STUDY_MUSIC_DUCK_FACTOR : 1), 0, 1);
  }

  function syncStudyMusicGain() {
    const target = studyMusicTargetGain();
    if (state.studyMusicGainNode) {
      const gain = state.studyMusicGainNode.gain;
      const now = Number(state.studyMusicAudioContext?.currentTime) || 0;
      try {
        gain.cancelScheduledValues(now);
        if (typeof gain.setTargetAtTime === "function") gain.setTargetAtTime(target, now, 0.035);
        else gain.value = target;
      } catch {
        gain.value = target;
      }
      els.studyMusicAudio.volume = 1;
      return;
    }
    try {
      els.studyMusicAudio.volume = target;
    } catch {
      // iPhone ignores media-element volume; the lazy gain node takes over on Play.
    }
  }

  function ensureStudyMusicAudioGraph() {
    if (state.studyMusicGainNode) return state.studyMusicAudioContext;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    let context;
    try {
      context = new AudioContextClass();
      const source = context.createMediaElementSource(els.studyMusicAudio);
      const gain = context.createGain();
      source.connect(gain);
      gain.connect(context.destination);
      state.studyMusicAudioContext = context;
      state.studyMusicSourceNode = source;
      state.studyMusicGainNode = gain;
      syncStudyMusicGain();
      return context;
    } catch (error) {
      try {
        context?.close?.();
      } catch {
        // Fall through to the native element volume path.
      }
      console.warn("Study music mixer unavailable:", error);
      return null;
    }
  }

  function suspendStudyMusicAudioContext() {
    try {
      const suspended = state.studyMusicAudioContext?.suspend?.();
      Promise.resolve(suspended).catch(() => {});
    } catch {
      // The media element is also paused, so this is only an idle-resource guard.
    }
  }

  function acquireStudyMusicDuck(owner) {
    if (!owner) return;
    state.studyMusicDuckOwners.add(owner);
    syncStudyMusicGain();
  }

  function releaseStudyMusicDuck(owner) {
    if (!owner) return;
    state.studyMusicDuckOwners.delete(owner);
    syncStudyMusicGain();
  }

  function clearStudyMusicDucks() {
    if (!state.studyMusicDuckOwners.size) return;
    state.studyMusicDuckOwners.clear();
    syncStudyMusicGain();
  }

  function renderStudyMusic() {
    const collection = currentStudyMusicCollection();
    const track = currentStudyMusicTrack();
    const playing = Boolean(track && !els.studyMusicAudio.paused && !els.studyMusicAudio.ended);
    els.studyMusicStyleSelect.value = state.studyMusicStyle;
    els.studyMusicVolume.value = String(state.studyMusicVolume);
    els.studyMusicVolumeValue.textContent = `${Math.round(state.studyMusicVolume * 100)}%`;
    els.studyMusicVolume.setAttribute("aria-valuetext", `${Math.round(state.studyMusicVolume * 100)}%`);
    els.studyMusicDuck.checked = state.studyMusicDuckEnabled;
    els.studyMusicPlayBtn.disabled = !track;
    els.studyMusicPrevBtn.disabled = !track;
    els.studyMusicNextBtn.disabled = !track;
    els.studyMusicPlayBtn.textContent = playing ? "Pause" : "Play";
    els.studyMusicPlayBtn.setAttribute("aria-pressed", String(playing));
    els.studyMusicToggle.setAttribute("aria-pressed", String(playing));
    els.studyMusicToggle.title = playing ? "Study music playing" : "Study music";
    els.studyMusicTitle.textContent = track
      ? `${track.title} — ${track.artist}`
      : collection
        ? `${collection.label} collection`
        : "Study music off";
    const links = [
      [els.studyMusicSourceLink, track?.sourceUrl, "Wikimedia Commons source"],
      [els.studyMusicLicenseLink, track?.licenseUrl, studyMusicLicenseDisplay(track)],
      [els.studyMusicCorpusLink, collection?.corpusUrl, collection ? `Browse ${collection.label} corpus` : "Browse full corpus"]
    ];
    links.forEach(([link, href, label]) => {
      if (!link) return;
      link.hidden = !href;
      if (href) {
        link.href = href;
        link.textContent = label;
      } else {
        link.removeAttribute("href");
      }
    });
  }

  function clearStudyMusicStallTimer() {
    window.clearTimeout(state.studyMusicStallTimer);
    state.studyMusicStallTimer = 0;
  }

  function clearStudyMusicStableTimer() {
    window.clearTimeout(state.studyMusicStableTimer);
    state.studyMusicStableTimer = 0;
  }

  function releaseStudyMusicSource() {
    clearStudyMusicStallTimer();
    clearStudyMusicStableTimer();
    els.studyMusicAudio.pause();
    els.studyMusicAudio.removeAttribute("src");
    els.studyMusicAudio.load();
  }

  function pauseStudyMusic({ releaseSource = false } = {}) {
    state.studyMusicPlaybackToken += 1;
    state.studyMusicNavigationToken += 1;
    state.studyMusicWantedPlaying = false;
    clearStudyMusicStableTimer();
    els.studyMusicAudio.pause();
    if (releaseSource) releaseStudyMusicSource();
    suspendStudyMusicAudioContext();
    renderStudyMusic();
  }

  function setStudyMusicTrack(index, { autoplay = false } = {}) {
    const track = state.studyMusicTracks[index];
    if (!track) return false;
    clearStudyMusicStallTimer();
    clearStudyMusicStableTimer();
    state.studyMusicPlaybackToken += 1;
    state.studyMusicTrackIndex = index;
    els.studyMusicAudio.pause();
    els.studyMusicAudio.crossOrigin = "anonymous";
    els.studyMusicAudio.src = track.mediaUrl;
    els.studyMusicAudio.load();
    state.studyMusicWantedPlaying = autoplay;
    renderStudyMusic();
    setStudyMusicStatus(`${studyMusicLicenseDisplay(track)} · streamed from Wikimedia Commons`);
    if (
      state.studyMusicTracks.length - index <= STUDY_MUSIC_PREFETCH_REMAINING
      && state.studyMusicMemberCursor < state.studyMusicMembers.length
    ) {
      const token = state.studyMusicLoadToken;
      void refillStudyMusicTracks(token, STUDY_MUSIC_METADATA_BATCH_SIZE / 2).then(renderStudyMusic).catch(() => {});
    }
    return true;
  }

  async function playStudyMusic() {
    const track = currentStudyMusicTrack();
    if (!track || state.studyMusicPageHidden) return;
    const token = state.studyMusicLoadToken;
    const trackId = track.id;
    const playbackToken = state.studyMusicPlaybackToken + 1;
    state.studyMusicPlaybackToken = playbackToken;
    state.studyMusicWantedPlaying = true;
    const context = ensureStudyMusicAudioGraph();
    syncStudyMusicGain();
    let resumePromise = Promise.resolve();
    try {
      if (context && context.state !== "running" && context.state !== "closed") {
        resumePromise = Promise.resolve(context.resume());
      }
      // Both calls occur before the first await so the iPhone user gesture is preserved.
      const playPromise = els.studyMusicAudio.play();
      await Promise.all([resumePromise, Promise.resolve(playPromise)]);
      const stale = (
        playbackToken !== state.studyMusicPlaybackToken
        || token !== state.studyMusicLoadToken
        || currentStudyMusicTrack()?.id !== trackId
      );
      if (stale) {
        if (!state.studyMusicWantedPlaying || state.studyMusicPageHidden) {
          suspendStudyMusicAudioContext();
        }
        return;
      }
      setStudyMusicStatus(`${studyMusicLicenseDisplay(track)} · streamed from Wikimedia Commons`);
    } catch (error) {
      const stale = (
        playbackToken !== state.studyMusicPlaybackToken
        || token !== state.studyMusicLoadToken
        || currentStudyMusicTrack()?.id !== trackId
      );
      if (stale) {
        if (!state.studyMusicWantedPlaying || state.studyMusicPageHidden) {
          suspendStudyMusicAudioContext();
        }
        return;
      }
      state.studyMusicWantedPlaying = false;
      els.studyMusicAudio.pause();
      setStudyMusicStatus(error?.name === "NotAllowedError"
        ? "Tap Play again to allow audio"
        : "This track could not play; try Next");
      console.warn("Study music play failed:", error);
    } finally {
      renderStudyMusic();
    }
  }

  async function moveStudyMusic(direction, { autoplay = null } = {}) {
    if (!currentStudyMusicTrack() || state.studyMusicPageHidden) return;
    const token = state.studyMusicLoadToken;
    const navigationToken = state.studyMusicNavigationToken + 1;
    state.studyMusicNavigationToken = navigationToken;
    const shouldPlay = autoplay === null
      ? state.studyMusicWantedPlaying || !els.studyMusicAudio.paused
      : autoplay;
    let nextIndex = state.studyMusicTrackIndex + direction;
    if (direction > 0 && nextIndex >= state.studyMusicTracks.length) {
      try {
        await refillStudyMusicTracks(token, 1);
      } catch (error) {
        if (token === state.studyMusicLoadToken) console.warn("Study music refill failed:", error);
      }
    }
    if (token !== state.studyMusicLoadToken || navigationToken !== state.studyMusicNavigationToken) return;
    if (nextIndex >= state.studyMusicTracks.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = Math.max(0, state.studyMusicTracks.length - 1);
    if (!setStudyMusicTrack(nextIndex, { autoplay: shouldPlay })) return;
    if (shouldPlay) await playStudyMusic();
  }

  async function handleStudyMusicMediaFailure(message) {
    if (state.studyMusicFailurePending || state.studyMusicPageHidden) return;
    state.studyMusicFailurePending = true;
    clearStudyMusicStallTimer();
    const wasPlaying = state.studyMusicWantedPlaying || !els.studyMusicAudio.paused;
    state.studyMusicConsecutiveFailures += 1;
    try {
      if (
        state.studyMusicConsecutiveFailures <= STUDY_MUSIC_MAX_CONSECUTIVE_FAILURES
        && state.studyMusicTracks.length > 1
      ) {
        setStudyMusicStatus(`${message}; skipping to another track`);
        await moveStudyMusic(1, { autoplay: wasPlaying });
        return;
      }
      pauseStudyMusic();
      setStudyMusicStatus("Music paused after repeated stream errors. Tap Next to retry.");
    } finally {
      state.studyMusicFailurePending = false;
    }
  }

  async function loadStudyMusicCollection(style, { persist = true } = {}) {
    const normalizedStyle = STUDY_MUSIC_COLLECTIONS[style] ? style : "off";
    state.studyMusicLoadToken += 1;
    const token = state.studyMusicLoadToken;
    state.studyMusicAbortController?.abort();
    state.studyMusicAbortController = normalizedStyle === "off" ? null : new AbortController();
    state.studyMusicLoadPromise = null;
    state.studyMusicRefillPromise = null;
    state.studyMusicStyle = normalizedStyle;
    state.studyMusicMembers = [];
    state.studyMusicMemberCursor = 0;
    state.studyMusicTracks = [];
    state.studyMusicTrackIndex = -1;
    state.studyMusicNavigationToken += 1;
    state.studyMusicConsecutiveFailures = 0;
    state.studyMusicFailurePending = false;
    pauseStudyMusic({ releaseSource: true });
    if (persist) savePrefs();
    renderStudyMusic();
    const collection = currentStudyMusicCollection();
    if (!collection) {
      setStudyMusicStatus("Choose a collection to begin.");
      return;
    }
    setStudyMusicStatus(`Loading the open ${collection.label} collection…`);
    const pending = (async () => {
      const payload = await fetchStudyMusicJson({
        list: "categorymembers",
        cmtitle: `Category:${collection.category}`,
        cmnamespace: "6",
        cmtype: "file",
        cmlimit: "max"
      }, token);
      if (token !== state.studyMusicLoadToken) return;
      const members = (payload?.query?.categorymembers || []).filter((member) => (
        Number.isFinite(Number(member.pageid)) && /^File:/i.test(String(member.title || ""))
      ));
      if (!members.length) throw new Error("No audio files were returned");
      state.studyMusicMembers = shuffledStudyMusicMembers(members);
      await refillStudyMusicTracks(token, 8);
      if (token !== state.studyMusicLoadToken) return;
      if (!state.studyMusicTracks.length) throw new Error("No reviewed, compatible tracks were found");
      setStudyMusicTrack(0);
      setStudyMusicStatus(`${state.studyMusicMembers.length} ${collection.label} candidates · tap Play`);
    })();
    state.studyMusicLoadPromise = pending;
    try {
      await pending;
    } catch (error) {
      if (token !== state.studyMusicLoadToken) return;
      setStudyMusicStatus("The Commons music catalog is unavailable. Check your connection and try again.");
      console.warn("Study music catalog failed:", error);
    } finally {
      if (state.studyMusicLoadPromise === pending) state.studyMusicLoadPromise = null;
      renderStudyMusic();
    }
  }

  function initializeStudyMusic() {
    els.studyMusicAudio.crossOrigin = "anonymous";
    els.studyMusicAudio.preload = "none";
    state.studyMusicVolume = clamp(state.studyMusicVolume, 0, 1);
    syncStudyMusicGain();
    renderStudyMusic();
    if (currentStudyMusicCollection()) {
      void loadStudyMusicCollection(state.studyMusicStyle, { persist: false });
    } else {
      setStudyMusicStatus("Choose a collection to begin.");
    }
  }

  function activeLanguage() {
    return LANGUAGES[state.language] || LANGUAGES.ru;
  }

  function normalizeSpeechTrackLanguage(value) {
    const key = String(value || "").toLowerCase();
    if (key === "off") return "off";
    return LANGUAGES[key] ? key : "";
  }

  function normalizeSpeechTrackEngine(value) {
    return value === "piper" ? "piper" : "system";
  }

  function normalizeSpeechVolumeBoost(value) {
    if (
      value === null
      || value === undefined
      || typeof value === "boolean"
      || (typeof value === "string" && !value.trim())
    ) {
      return SPEECH_VOLUME_BOOST_DEFAULT;
    }
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return SPEECH_VOLUME_BOOST_DEFAULT;
    return clamp(numericValue, SPEECH_VOLUME_BOOST_MIN, SPEECH_VOLUME_BOOST_MAX);
  }

  function speechLanguageForKey(languageKey) {
    return LANGUAGES[languageKey]?.speechLang || "";
  }

  function speechTrackConfig(slot) {
    if (slot === 1) {
      return {
        slot,
        id: "primary",
        language: state.language,
        engine: state.ttsEngine
      };
    }
    return {
      slot,
      id: `track${slot}`,
      language: slot === 2 ? state.speechTrack2Language : state.speechTrack3Language,
      engine: slot === 2 ? state.speechTrack2Engine : state.speechTrack3Engine
    };
  }

  function speechVolumeLanguageKey(languageOrLang) {
    const normalized = String(languageOrLang || "").trim().toLowerCase();
    if (LANGUAGES[normalized]) return normalized;
    const prefix = normalized.split(/[-_]/)[0];
    if (!prefix) return "";
    return Object.keys(LANGUAGES).find((languageKey) => (
      speechLanguageForKey(languageKey).toLowerCase().split(/[-_]/)[0] === prefix
    )) || "";
  }

  function speechVolumeBoost(languageOrLang) {
    const languageKey = speechVolumeLanguageKey(languageOrLang);
    if (!languageKey) return SPEECH_VOLUME_BOOST_DEFAULT;
    return normalizeSpeechVolumeBoost(state.speechVolumeBoosts[languageKey]);
  }

  function effectiveSpeechVolume(languageOrLang) {
    return clamp(pageVolume() * speechVolumeBoost(languageOrLang), 0, 1);
  }

  function syncSpeechVolumeControls() {
    const controls = [
      { track: speechTrackConfig(1), input: els.speechTrack1Volume, output: els.speechTrack1VolumeValue },
      { track: speechTrackConfig(2), input: els.speechTrack2Volume, output: els.speechTrack2VolumeValue },
      { track: speechTrackConfig(3), input: els.speechTrack3Volume, output: els.speechTrack3VolumeValue }
    ];
    controls.forEach(({ track, input, output }) => {
      if (!input) return;
      const enabled = Boolean(LANGUAGES[track.language]);
      const boost = enabled ? speechVolumeBoost(track.language) : SPEECH_VOLUME_BOOST_DEFAULT;
      const percent = `${Math.round(boost * 100)}%`;
      input.disabled = !enabled;
      input.value = String(boost);
      input.setAttribute("aria-valuetext", percent);
      if (output) output.textContent = percent;
    });
  }

  function setSpeechTrackVolumeBoost(slot, value) {
    const track = speechTrackConfig(slot);
    if (!LANGUAGES[track.language]) {
      syncSpeechVolumeControls();
      return;
    }
    state.speechVolumeBoosts[track.language] = normalizeSpeechVolumeBoost(value);
    syncSpeechVolumeControls();
    savePrefs();
  }

  function configuredSpeechTracks() {
    const seen = new Set();
    return [1, 2, 3].map(speechTrackConfig).filter((track) => {
      if (!LANGUAGES[track.language] || seen.has(track.language)) return false;
      seen.add(track.language);
      return true;
    });
  }

  function enabledCompanionTracks() {
    return configuredSpeechTracks().filter((track) => track.slot > 1);
  }

  function englishSpeechEnabled() {
    if (!els.bookReadEnglish.checked) return false;
    if (state.language === "en") return true;
    return enabledCompanionTracks().some((track) => track.language === "en");
  }

  function speechTrackIsAudible(track) {
    return Boolean(
      track
      && (track.slot === 1 || track.language !== "en" || els.bookReadEnglish.checked)
    );
  }

  function speechTrackHasSupportedPiper(track) {
    return Boolean(
      LANGUAGES[track?.language]
      && track.engine === "piper"
      && piperVoiceIdForLang(speechLanguageForKey(track.language))
    );
  }

  function normalizeSpeechTrackState() {
    state.speechTrack2Language = normalizeSpeechTrackLanguage(state.speechTrack2Language) || "off";
    state.speechTrack3Language = normalizeSpeechTrackLanguage(state.speechTrack3Language) || "off";
    state.speechTrack2Engine = normalizeSpeechTrackEngine(state.speechTrack2Engine);
    state.speechTrack3Engine = normalizeSpeechTrackEngine(state.speechTrack3Engine);

    const seen = new Set([state.language]);
    [2, 3].forEach((slot) => {
      const languageKey = slot === 2 ? state.speechTrack2Language : state.speechTrack3Language;
      if (languageKey !== "off" && seen.has(languageKey)) {
        if (slot === 2) state.speechTrack2Language = "off";
        else state.speechTrack3Language = "off";
        return;
      }
      if (languageKey !== "off") seen.add(languageKey);
    });

    // Preserve Piper preferences for skipped English and unsupported
    // languages, but cap the voices that can actually speak right now. Prefer
    // the study track and non-English companions; if English is re-enabled
    // beside two foreign Piper tracks, English safely moves to System.
    const activePiperTracks = [1, 2, 3]
      .map(speechTrackConfig)
      .filter((track) => speechTrackIsAudible(track) && speechTrackHasSupportedPiper(track))
      .sort((left, right) => {
        const leftPriority = left.slot === 1 ? 0 : left.language === "en" ? 2 : 1;
        const rightPriority = right.slot === 1 ? 0 : right.language === "en" ? 2 : 1;
        return leftPriority - rightPriority || left.slot - right.slot;
      });
    activePiperTracks.slice(PIPER_MAX_LIVE_WORKERS).forEach((track) => {
      if (track.slot === 1) state.ttsEngine = "system";
      else if (track.slot === 2) state.speechTrack2Engine = "system";
      else state.speechTrack3Engine = "system";
    });
  }

  function speechTrackUsesPiper(track) {
    return Boolean(
      track?.engine === "piper"
      && piperRuntimeAvailable()
      && piperVoiceIdForLang(speechLanguageForKey(track.language))
    );
  }

  function languageTrackLabel(languageKey) {
    if (languageKey === "en") return "English";
    return LANGUAGES[languageKey]?.label || "Off";
  }

  function readerEnabled() {
    return activeLanguage().readerEnabled !== false;
  }

  function populateBandSelect() {
    const language = activeLanguage();
    const bands = language.bands || STANDARD_BANDS;
    const validValues = new Set(bands.map((band) => band.value));
    if (!validValues.has(state.band)) {
      state.band = language.defaultBand || "20000";
    }
    els.bandSelect.replaceChildren();
    bands.forEach((band) => {
      const option = document.createElement("option");
      option.value = band.value;
      option.textContent = band.label;
      els.bandSelect.appendChild(option);
    });
    els.bandSelect.value = state.band;
    els.bandLabelText.textContent = language.bandLabel || "Band";
    els.bandSelect.setAttribute(
      "aria-label",
      language.mode === "vernacular" ? "Vernacular collection depth" : "Word band"
    );
  }

  function syncReaderLanguageSelects() {
    if (!readerEnabled()) return;
    els.bookLanguageSelect.value = state.language;
    els.newsLanguageSelect.value = state.language;
  }

  function updateContentModeAvailability() {
    const available = readerEnabled();
    const explanation = available
      ? ""
      : "Books and news are bilingual modes; choose a study language to use them.";
    [els.bookToggle, els.newsToggle].forEach((button) => {
      button.disabled = !available;
      button.title = available ? button.getAttribute("aria-label") : explanation;
    });
    els.knowledgeToggle.disabled = false;
    els.knowledgeToggle.title = els.knowledgeToggle.getAttribute("aria-label") || "Knowledge";
    if (!available && state.bookMode && !isKnowledgeMode()) {
      setBookMode(false);
    }
  }

  function selectLanguage(languageKey) {
    clearPiperAudioCache();
    const previousLanguage = state.language;
    const nextLanguage = LANGUAGES[languageKey] ? languageKey : "ru";
    state.bandByLanguage[previousLanguage] = state.band;
    state.language = nextLanguage;
    // If the newly selected study language was already an optional track,
    // swap the former study language into that slot. RU + EN therefore becomes
    // EN + RU and switches back cleanly instead of silently losing English.
    [2, 3].forEach((slot) => {
      const current = slot === 2 ? state.speechTrack2Language : state.speechTrack3Language;
      if (current !== nextLanguage) return;
      const other = slot === 2 ? state.speechTrack3Language : state.speechTrack2Language;
      const replacement = previousLanguage !== nextLanguage && other !== previousLanguage
        ? previousLanguage
        : "off";
      if (slot === 2) state.speechTrack2Language = replacement;
      else state.speechTrack3Language = replacement;
    });
    state.band = String(
      state.bandByLanguage[state.language]
      || activeLanguage().defaultBand
      || "20000"
    );
    state.currentPos = 0;
    state.playDirection = 1;
    normalizeSpeechTrackState();
    els.languageSelect.value = state.language;
    populateBandSelect();
    syncReaderLanguageSelects();
    updateContentModeAvailability();
    syncPiperControls();
    updateSettingLabels();
    updateVoiceSelectors();
  }

  function isNewsMode() {
    return state.contentMode === "news";
  }

  function isKnowledgeMode() {
    return state.contentMode === "knowledge";
  }

  function activeKnowledgeTopic() {
    return KNOWLEDGE_TOPICS[state.knowledgeTopic] || KNOWLEDGE_TOPICS.general;
  }

  function activeNewsSources() {
    return NEWS_SOURCES[state.language] || NEWS_SOURCES.ru;
  }

  function activeNewsSource() {
    const sources = activeNewsSources();
    const selectedId = state.newsSourceByLanguage[state.language] || sources[0]?.id;
    return sources.find((source) => source.id === selectedId) || sources[0];
  }

  function populateNewsSourceSelect() {
    const sources = activeNewsSources();
    const selected = activeNewsSource();
    els.newsSourceSelect.replaceChildren();
    sources.forEach((source) => {
      const option = document.createElement("option");
      option.value = source.id;
      option.textContent = source.label;
      els.newsSourceSelect.appendChild(option);
    });
    if (selected) {
      state.newsSourceByLanguage[state.language] = selected.id;
      els.newsSourceSelect.value = selected.id;
    }
  }

  function sourceLangCode() {
    return activeLanguage().speechLang.split("-")[0];
  }

  function langPrefix(lang) {
    return String(lang || "").toLowerCase().split("-")[0];
  }

  function voicePrefKeyForLang(lang) {
    const prefix = langPrefix(lang);
    return Object.prototype.hasOwnProperty.call(LANGUAGES, prefix) ? prefix : "";
  }

  function voiceId(voice) {
    return voice ? `${voice.voiceURI || voice.name}|${voice.lang}` : "";
  }

  function normalizedVoiceLocale(value) {
    return String(value || "").trim().replace(/_/g, "-").toLowerCase();
  }

  function voiceQuality(voice) {
    const name = String(voice?.name || "");
    const uri = String(voice?.voiceURI || "");
    const description = `${name} ${uri}`.toLowerCase();
    if (/(^|[^a-z])premium([^a-z]|$)/.test(description)) {
      return { rank: 5, label: "Premium" };
    }
    if (/(^|[^a-z])enhanced([^a-z]|$)/.test(description)) {
      return { rank: 4, label: "Enhanced" };
    }
    if (/super[\s._-]*compact/.test(description)) {
      return { rank: 1, label: "Supercompact" };
    }
    if (/(^|[^a-z])compact([^a-z]|$)/.test(description)) {
      return { rank: 2, label: "Compact" };
    }
    if (/com\.apple\.|apple[\s._-]*(?:tts|speech|voice)/.test(description)) {
      return { rank: 3, label: "Apple built-in" };
    }
    return { rank: 3, label: "quality unspecified" };
  }

  function voiceLabel(voice) {
    const quality = voiceQuality(voice);
    return `${voice.name} (${voice.lang || "locale unspecified"}, ${quality.label})`;
  }

  function matchingVoices(lang) {
    const requestedLocale = normalizedVoiceLocale(lang);
    const prefix = langPrefix(requestedLocale);
    return state.voices
      .filter((voice) => {
        const voiceLang = normalizedVoiceLocale(voice.lang);
        return voiceLang === requestedLocale || voiceLang === prefix || voiceLang.startsWith(`${prefix}-`);
      })
      .sort((a, b) => {
        const aExact = normalizedVoiceLocale(a.lang) === requestedLocale;
        const bExact = normalizedVoiceLocale(b.lang) === requestedLocale;
        if (aExact !== bExact) return aExact ? -1 : 1;
        const qualityDifference = voiceQuality(b).rank - voiceQuality(a).rank;
        if (qualityDifference) return qualityDifference;
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

  function populatePiperModelSelect(select, languageKey) {
    const option = document.createElement("option");
    option.value = piperVoiceIdForLang(speechLanguageForKey(languageKey));
    option.textContent = `${languageTrackLabel(languageKey)} Piper · downloads on first Play`;
    select.replaceChildren(option);
    select.disabled = true;
  }

  function updateVoiceSelectors() {
    const primary = speechTrackConfig(1);
    const track2 = speechTrackConfig(2);
    const track3 = speechTrackConfig(3);
    if (speechTrackUsesPiper(primary)) {
      populatePiperModelSelect(els.sourceVoiceSelect, primary.language);
    } else {
      populateVoiceSelect(els.sourceVoiceSelect, systemSpeechLang(speechLanguageForKey(primary.language)), "Auto · best match");
      els.sourceVoiceSelect.disabled = false;
    }

    if (track2.language === "off") {
      els.enVoiceSelect.replaceChildren(new Option("Choose a language", ""));
      els.enVoiceSelect.disabled = true;
    } else {
      if (speechTrackUsesPiper(track2)) {
        populatePiperModelSelect(els.enVoiceSelect, track2.language);
      } else {
        populateVoiceSelect(els.enVoiceSelect, systemSpeechLang(speechLanguageForKey(track2.language)), "Auto · best match");
        els.enVoiceSelect.disabled = false;
      }
    }

    if (track3.language === "off") {
      els.speechTrack3VoiceSelect.replaceChildren(new Option("Choose a language", ""));
      els.speechTrack3VoiceSelect.disabled = true;
    } else {
      if (speechTrackUsesPiper(track3)) {
        populatePiperModelSelect(els.speechTrack3VoiceSelect, track3.language);
      } else {
        populateVoiceSelect(
          els.speechTrack3VoiceSelect,
          systemSpeechLang(speechLanguageForKey(track3.language)),
          "Auto · best match"
        );
        els.speechTrack3VoiceSelect.disabled = false;
      }
    }
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

  function decodeHtmlText(value) {
    let decoded = String(value || "");
    const entityPattern = /&(?:#\d+|#x[\da-f]+|[a-z][\da-z]+);/i;
    for (let pass = 0; pass < 2 && entityPattern.test(decoded); pass += 1) {
      const decoder = document.createElement("textarea");
      decoder.innerHTML = decoded;
      const next = decoder.value;
      if (next === decoded) break;
      decoded = next;
    }
    return decoded;
  }

  function normalizeReaderText(value) {
    return normalizeSpaces(decodeHtmlText(value)
      .normalize("NFC")
      .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, ""));
  }

  function hasLinguisticContent(value) {
    return /[\p{L}\p{N}]/u.test(String(value || ""));
  }

  const TRANSLATION_SCRIPT_PATTERNS = {
    en: /\p{Script=Latin}/u,
    es: /\p{Script=Latin}/u,
    fr: /\p{Script=Latin}/u,
    ru: /\p{Script=Cyrillic}/u,
    fa: /\p{Script=Arabic}/u,
    hi: /\p{Script=Devanagari}/u,
    ja: /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u,
    ko: /\p{Script=Hangul}/u
  };

  function translationComparisonValue(value) {
    return normalizeSpaces(normalizeReaderText(value)
      .normalize("NFKC")
      .toLocaleLowerCase()
      .replace(/[\p{P}\p{S}]+/gu, " "));
  }

  function expectedTranslationScriptShare(value, language) {
    const pattern = TRANSLATION_SCRIPT_PATTERNS[language];
    if (!pattern) return 1;
    const letters = Array.from(String(value || "")).filter((character) => /\p{L}/u.test(character));
    if (!letters.length) return 0;
    return letters.filter((character) => pattern.test(character)).length / letters.length;
  }

  function isUsableTranslation(source, translated, targetLanguage) {
    const cleanSource = normalizeReaderText(source);
    const cleanTranslation = normalizeReaderText(translated);
    if (!cleanTranslation || !hasLinguisticContent(cleanTranslation)) return false;
    if (translationComparisonValue(cleanSource) === translationComparisonValue(cleanTranslation)) return false;
    if (/MYMEMORY WARNING|QUERY LENGTH LIMIT|PLEASE SELECT TWO DISTINCT LANGUAGES/i.test(cleanTranslation)) return false;
    return expectedTranslationScriptShare(cleanTranslation, targetLanguage) >= 0.45;
  }

  function stripForSpeech(value) {
    const clean = normalizeReaderText(value)
      .normalize("NFKC")
      // Directional and zero-width characters are not words, but can make a
      // voice spell or name nearby punctuation.
      .replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, "")
      // Decorative symbols can make a system voice announce their names. Keep
      // linguistic punctuation, though: commas, stops, dashes, quotes, and the
      // Persian/Arabic/Japanese equivalents give a phrase its natural prosody.
      .replace(/[\p{S}]+/gu, " ")
      .replace(/[\\/_#@*^=+<>|~`]+/g, " ")
      .replace(/\s+([,.;:!?…،؛؟。！？।॥])/gu, "$1");
    return hasLinguisticContent(clean) ? normalizeSpaces(clean) : "";
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(Number(value) || 0, min), max);
  }

  function pageVolume() {
    return clamp(els.pageVolume.value, 0, 1);
  }

  function piperRuntimeAvailable() {
    return Boolean(
      els.engineSelect
      && window.isSecureContext !== false
      && typeof Worker !== "undefined"
      && typeof WebAssembly !== "undefined"
      && typeof Audio !== "undefined"
      && window.URL?.createObjectURL
      && navigator.storage?.getDirectory
    );
  }

  function isPiperAvailable() {
    return piperRuntimeAvailable() && Boolean(piperVoiceIdForLang(activeLanguage().speechLang));
  }

  function isPiperEnabled() {
    return isPiperAvailable() && state.ttsEngine === "piper";
  }

  function piperLanguageKey(lang = activeLanguage().speechLang) {
    return String(lang || "").toLowerCase().split(/[-_]/)[0];
  }

  function speechTrackHint(track) {
    if (!LANGUAGES[track.language]) return "Choose another language or leave this track Off.";
    if (track.language === "en" && !els.bookReadEnglish.checked && track.slot > 1) {
      return "English is configured but currently skipped by Read English aloud.";
    }
    const speechLang = speechLanguageForKey(track.language);
    if (track.engine === "piper") {
      if (!piperRuntimeAvailable()) {
        return "Piper needs WebAssembly and persistent browser storage on this device.";
      }
      if (!piperVoiceIdForLang(speechLang)) {
        return "Piper is unavailable for this language; use a System / iPhone voice.";
      }
      const megabytes = PIPER_FIRST_USE_MEGABYTES[track.language] || 89;
      return `First Play downloads about ${megabytes} MB for ${languageTrackLabel(track.language)}; sentences stay continuous.`;
    }
    return `Uses the selected ${languageTrackLabel(track.language)} voice installed on this device.`;
  }

  function syncSpeechTrackLanguageOptions(select, slot) {
    const otherLanguage = slot === 2 ? state.speechTrack3Language : state.speechTrack2Language;
    Array.from(select.options).forEach((option) => {
      option.disabled = option.value !== "off"
        && (option.value === state.language || option.value === otherLanguage);
    });
  }

  function syncPiperControls() {
    if (!els.engineSelect) return;
    normalizeSpeechTrackState();
    const runtimeAvailable = piperRuntimeAvailable();
    const tracks = [speechTrackConfig(1), speechTrackConfig(2), speechTrackConfig(3)];
    const controls = [
      { track: tracks[0], engine: els.engineSelect, hint: els.piperEngineHint },
      { track: tracks[1], engine: els.speechTrack2EngineSelect, hint: els.speechTrack2Hint },
      { track: tracks[2], engine: els.speechTrack3EngineSelect, hint: els.speechTrack3Hint }
    ];
    const selectedPiperCount = tracks.filter((track) => (
      speechTrackIsAudible(track) && speechTrackHasSupportedPiper(track)
    )).length;

    els.speechTrack2LanguageSelect.value = state.speechTrack2Language;
    els.speechTrack3LanguageSelect.value = state.speechTrack3Language;
    syncSpeechTrackLanguageOptions(els.speechTrack2LanguageSelect, 2);
    syncSpeechTrackLanguageOptions(els.speechTrack3LanguageSelect, 3);

    controls.forEach(({ track, engine, hint }) => {
      const enabled = Boolean(LANGUAGES[track.language]);
      const supported = enabled && Boolean(piperVoiceIdForLang(speechLanguageForKey(track.language)));
      const piperOption = engine.querySelector('option[value="piper"]');
      if (piperOption) {
        piperOption.disabled = !runtimeAvailable
          || !supported
          || (
            speechTrackIsAudible(track)
            && track.engine !== "piper"
            && selectedPiperCount >= PIPER_MAX_LIVE_WORKERS
          );
      }
      engine.disabled = !enabled;
      engine.value = supported && runtimeAvailable ? track.engine : "system";
      hint.textContent = speechTrackHint(track);
    });

    if (els.piperClearBtn) {
      els.piperClearBtn.hidden = !runtimeAvailable;
    }
    if (els.piperResourceWarning) {
      const piperTracks = tracks.filter((track) => (
        speechTrackIsAudible(track) && speechTrackHasSupportedPiper(track)
      ));
      const totalMegabytes = piperTracks.reduce(
        (total, track) => total + (PIPER_FIRST_USE_MEGABYTES[track.language] || 89),
        0
      );
      els.piperResourceWarning.textContent = piperTracks.length
        ? `${piperTracks.length} of 2 Piper voices selected${totalMegabytes ? ` · up to about ${totalMegabytes} MB across first-use downloads` : ""}. Other tracks use System / iPhone voices.`
        : "Piper supports at most two active voices. Each voice needs a one-time download of about 55–89 MB; System / iPhone remains the lightest option.";
    }
  }

  function syncBookAudioControlsFromSettings() {
    els.bookVolume.value = els.pageVolume.value;
  }

  function syncSettingsAudioControlsFromBook() {
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

  function makeSpokenEnglish(value, entry = null) {
    const clean = stripForSpeech(entry?.sayEn || value);
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
      els.entryExample.hidden = true;
      els.entryExample.textContent = "";
      resetEnglishFocusWord();
      clearFocusSpeechTracks();
      els.progressText.textContent = "0 / 0";
      return;
    }

    const language = activeLanguage();
    els.rankLabel.textContent = language.mode === "vernacular"
      ? `${entry.rarity || "Vernacular"} · ${entry.tier || `#${entry.rank}`}`
      : `#${entry.rank}`;
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
    const meaningLabel = language.meaningHead || "English";
    els.meaningState.textContent = meaning
      ? `${meaningLabel}${englishSpeechEnabled() ? "" : " · display only"}`
      : `${meaningLabel} pending`;
    const example = language.mode === "vernacular" ? String(entry.example || "") : "";
    els.entryExample.textContent = example ? `“${example}”` : "";
    els.entryExample.hidden = !example;
    els.progressText.textContent = `${state.currentPos + 1} / ${state.order.length}`;
    fitRussianFocusWord({ immediate: true });
    fitEnglishFocusWord({ immediate: true });
    renderFocusSpeechTracks(entry, meaning).catch((error) => {
      console.warn("Additional focus translation failed:", error);
    });
    savePrefs();
  }

  function focusSpeechTrackElements(slot) {
    return slot === 2
      ? { pane: els.focusSpeechTrack2, label: els.focusSpeechTrack2Label, text: els.focusSpeechTrack2Text }
      : { pane: els.focusSpeechTrack3, label: els.focusSpeechTrack3Label, text: els.focusSpeechTrack3Text };
  }

  function bookSpeechTrackElements(slot) {
    return slot === 2
      ? { pane: els.bookSpeechTrack2, label: els.bookSpeechTrack2Label, text: els.bookSpeechTrack2Sentence }
      : { pane: els.bookSpeechTrack3, label: els.bookSpeechTrack3Label, text: els.bookSpeechTrack3Sentence };
  }

  function setSupplementalSpeechTrack(elements, track, text) {
    const language = LANGUAGES[track.language];
    const visible = Boolean(language && track.language !== "en" && track.language !== state.language);
    elements.pane.hidden = !visible;
    if (!visible) {
      elements.text.textContent = "";
      return false;
    }
    elements.label.textContent = `Track ${track.slot} · ${language.label}`;
    elements.text.lang = langPrefix(language.speechLang);
    elements.text.dir = language.dir;
    elements.text.textContent = text;
    elements.pane.dataset.trackLanguage = track.language;
    return true;
  }

  function clearFocusSpeechTracks() {
    state.focusSpeechRenderToken += 1;
    [2, 3].forEach((slot) => {
      const elements = focusSpeechTrackElements(slot);
      elements.pane.hidden = true;
      elements.text.textContent = "";
    });
    els.focusSpeechTracks.hidden = true;
  }

  async function renderFocusSpeechTracks(entry, englishAnchor) {
    const renderToken = state.focusSpeechRenderToken + 1;
    state.focusSpeechRenderToken = renderToken;
    const tracks = enabledCompanionTracks();
    let visibleCount = 0;
    tracks.forEach((track) => {
      if (setSupplementalSpeechTrack(
        focusSpeechTrackElements(track.slot),
        track,
        englishAnchor ? "Translating…" : "Waiting for English translation…"
      )) visibleCount += 1;
    });
    [2, 3].filter((slot) => !tracks.some((track) => track.slot === slot)).forEach((slot) => {
      setSupplementalSpeechTrack(focusSpeechTrackElements(slot), { slot, language: "off" }, "");
    });
    els.focusSpeechTracks.hidden = visibleCount === 0;
    if (!entry || !englishAnchor || !visibleCount) return;

    await Promise.all(tracks.map(async (track) => {
      if (track.language === "en" || track.language === state.language) return;
      const translated = await ensureBookSourceSentence(englishAnchor, track.language);
      if (renderToken !== state.focusSpeechRenderToken || entry !== currentEntry()) return;
      const elements = focusSpeechTrackElements(track.slot);
      elements.text.textContent = translated || `${languageTrackLabel(track.language)} translation unavailable.`;
    }));
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
      const rankText = String(entry.rank);
      rows.push(`
        <button class="word-row${current}" type="button" data-pos="${pos}" style="top:${pos * state.rowHeight}px">
          <span class="word-cell">
            <span class="rank-chip">${escapeHtml(rankText)}</span>
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

  function wordRanges(text, locale = undefined) {
    const clean = String(text || "");
    if (typeof Intl.Segmenter === "function") {
      try {
        const segmenter = new Intl.Segmenter(locale, { granularity: "word" });
        const segmented = Array.from(segmenter.segment(clean))
          .filter((part) => part.isWordLike || /[\p{L}\p{N}]/u.test(part.segment))
          .map((part) => ({
            start: part.index,
            end: part.index + part.segment.length,
            text: part.segment
          }));
        if (segmented.length) return segmented;
      } catch {
        // Fall through to Unicode word matching.
      }
    }
    const ranges = [];
    const wordPattern = /[\p{L}\p{N}]+(?:[-'][\p{L}\p{N}]+)*/gu;
    let match = null;
    while ((match = wordPattern.exec(clean)) !== null) {
      ranges.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0]
      });
    }
    return ranges;
  }

  function activeWordIndexForChar(text, charIndex, ranges = wordRanges(text)) {
    if (!ranges.length) return -1;
    const index = Math.max(0, Number(charIndex) || 0);
    const found = ranges.findIndex((range) => index >= range.start && index < range.end);
    if (found >= 0) return found;
    for (let rangeIndex = ranges.length - 1; rangeIndex >= 0; rangeIndex -= 1) {
      if (index >= ranges[rangeIndex].start) return rangeIndex;
    }
    return 0;
  }

  function highlightedTextHtml(text, activeIndexes, activeClass = "active", ranges = wordRanges(text)) {
    const clean = String(text || "");
    const indexes = new Set(Array.isArray(activeIndexes) ? activeIndexes : [activeIndexes]);
    if (!ranges.length || !Array.from(indexes).some((index) => index >= 0)) {
      return escapeHtml(clean);
    }

    let html = "";
    let cursor = 0;
    ranges.forEach((range, index) => {
      html += escapeHtml(clean.slice(cursor, range.start));
      const className = indexes.has(index) ? `speech-word ${activeClass}` : "speech-word";
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

  function readerHighlightLayer(node) {
    const pane = node?.closest?.(".reader-pane");
    if (!pane) return null;
    let layer = pane.querySelector(":scope > .reader-highlight-layer");
    if (!layer) {
      layer = document.createElement("div");
      layer.className = "reader-highlight-layer";
      layer.setAttribute("aria-hidden", "true");
      pane.appendChild(layer);
    }
    return layer;
  }

  function clearReaderHighlightLayer(node) {
    const pane = node?.closest?.(".reader-pane");
    const layer = pane?.querySelector?.(":scope > .reader-highlight-layer");
    if (layer) layer.replaceChildren();
  }

  function renderReaderHighlight(node, text, activeIndexes, activeClass, ranges) {
    if (!node) return;
    const clean = String(text || "");
    const indexes = [...new Set((Array.isArray(activeIndexes) ? activeIndexes : [activeIndexes])
      .filter((index) => Number.isInteger(index) && index >= 0 && ranges[index]))];
    if (node.textContent !== clean || node.childNodes.length !== 1 || node.firstChild?.nodeType !== Node.TEXT_NODE) {
      node.textContent = clean;
    }
    const layer = readerHighlightLayer(node);
    if (layer) layer.replaceChildren();
    const textNode = node.firstChild;
    const pane = node.closest?.(".reader-pane");
    const canPosition = Boolean(
      indexes.length
      && layer
      && pane
      && textNode
      && typeof document.createRange === "function"
    );
    if (!canPosition) return;

    const probe = document.createRange();
    if (typeof probe.getClientRects !== "function") {
      node.innerHTML = highlightedTextHtml(clean, indexes, activeClass, ranges);
      return;
    }
    const paneRect = pane.getBoundingClientRect();
    indexes.forEach((index) => {
      const word = ranges[index];
      const range = document.createRange();
      range.setStart(textNode, word.start);
      range.setEnd(textNode, word.end);
      Array.from(range.getClientRects()).forEach((rect) => {
        if (!rect.width || !rect.height) return;
        const block = document.createElement("span");
        block.className = `reader-highlight-block ${activeClass}`;
        block.dataset.wordIndex = String(index);
        block.style.left = `${rect.left - paneRect.left - 1}px`;
        block.style.top = `${rect.top - paneRect.top + 1}px`;
        block.style.width = `${rect.width + 2}px`;
        block.style.height = `${Math.max(1, rect.height - 2)}px`;
        layer.appendChild(block);
      });
    });
  }

  function clearSpeechHighlights(targets = state.activeHighlights) {
    const normalizedTargets = normalizeHighlightTargets(targets, "");
    normalizedTargets.forEach((target) => {
      clearReaderHighlightLayer(target.node);
      target.node.textContent = target.text || "";
    });
    const activeNodes = new Set(state.activeHighlights.map((target) => target.node));
    const clearedActiveNodes = normalizedTargets.some((target) => activeNodes.has(target.node));
    if (targets === state.activeHighlights || clearedActiveNodes) {
      state.activeHighlights = [];
    }
  }

  function applyCorrespondingHighlight(targets) {
    clearCorrespondingHighlights();
    const normalizedTargets = normalizeHighlightTargets(targets, "");
    state.activeCorrespondingHighlights = normalizedTargets;
    normalizedTargets.forEach((target) => {
      target.node.classList.add("corresponding-active");
    });
  }

  function clearCorrespondingHighlights(targets = state.activeCorrespondingHighlights) {
    const normalizedTargets = normalizeHighlightTargets(targets, "");
    normalizedTargets.forEach((target) => {
      target.node.classList.remove("corresponding-active");
    });
    if (targets === state.activeCorrespondingHighlights) {
      state.activeCorrespondingHighlights = [];
    }
  }

  function normalizeAlignmentText(value, language = "") {
    let normalized = String(value || "")
      .normalize("NFKD")
      .replace(/[\p{M}\u0640]/gu, "")
      .toLocaleLowerCase()
      .replace(/[يى]/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/[ۀة]/g, "ه")
      .replace(/ё/g, "е");
    if (language === "en") {
      normalized = normalized.replace(/[’']s\b/gu, "");
    }
    return normalized.replace(/[^\p{L}\p{N}]+/gu, "").trim();
  }

  function bestGuessWordMap(fromCount, toCount) {
    if (!fromCount || !toCount) return Array.from({ length: fromCount }, () => []);
    return Array.from({ length: fromCount }, (_, index) => {
      // This is a monotonic, one-word estimate. It makes both columns move in
      // sync immediately while contextual translation looks for a better match.
      const position = ((index + 0.5) * toCount) / fromCount - 0.5;
      const targetIndex = Math.min(toCount - 1, Math.max(0, Math.round(position)));
      return [targetIndex];
    });
  }

  function invertWordMap(wordMap, targetCount, fallbackMap = []) {
    const inverted = Array.from({ length: targetCount }, () => []);
    wordMap.forEach((targets, sourceIndex) => {
      targets.forEach((targetIndex) => {
        if (inverted[targetIndex] && !inverted[targetIndex].includes(sourceIndex)) {
          inverted[targetIndex].push(sourceIndex);
        }
      });
    });
    return inverted.map((values, index) => (
      values.length ? values.slice(0, READER_ALIGNMENT_MAX_TARGET_WORDS) : (fallbackMap[index] || [])
    ));
  }

  function alignmentSimilarity(left, right, language = "") {
    const a = normalizeAlignmentText(left, language);
    const b = normalizeAlignmentText(right, language);
    if (!a || !b) return 0;
    if (a === b) return 1;
    if (a.includes(b) || b.includes(a)) return Math.min(a.length, b.length) / Math.max(a.length, b.length);
    const grams = (value) => {
      if (value.length < 2) return [value];
      return Array.from({ length: value.length - 1 }, (_, index) => value.slice(index, index + 2));
    };
    const leftGrams = grams(a);
    const rightGrams = grams(b);
    const remaining = [...rightGrams];
    let matches = 0;
    leftGrams.forEach((gram) => {
      const index = remaining.indexOf(gram);
      if (index < 0) return;
      matches += 1;
      remaining.splice(index, 1);
    });
    return (2 * matches) / Math.max(1, leftGrams.length + rightGrams.length);
  }

  function locateAlignedPhrase(text, ranges, phrase, expectedIndexes = [], language = "") {
    const cleanPhrase = String(phrase || "").trim();
    const normalizedPhrase = normalizeAlignmentText(cleanPhrase, language);
    if (!normalizedPhrase || !ranges.length) return { indexes: [], confidence: 0 };
    const expected = expectedIndexes[0] ?? 0;
    const phraseWordCount = Math.max(1, wordRanges(cleanPhrase, language).length);
    let best = { confidence: 0, similarity: 0, indexes: [] };
    for (let start = 0; start < ranges.length; start += 1) {
      for (let length = 1; length <= READER_ALIGNMENT_MAX_TARGET_WORDS && start + length <= ranges.length; length += 1) {
        const endRange = ranges[start + length - 1];
        const candidate = String(text || "").slice(ranges[start].start, endRange.end);
        const exact = normalizeAlignmentText(candidate, language) === normalizedPhrase;
        const similarity = exact ? 1 : alignmentSimilarity(candidate, cleanPhrase, language);
        const distancePenalty = Math.abs(start - expected) * 0.012;
        const lengthPenalty = Math.abs(length - phraseWordCount) * 0.035;
        const confidence = similarity - distancePenalty - lengthPenalty;
        if (confidence > best.confidence) {
          best = {
            confidence,
            similarity,
            indexes: Array.from({ length }, (value, offsetIndex) => start + offsetIndex)
          };
        }
      }
    }
    // Do not pretend an uncertain proportional guess is a word translation.
    // Very short translated fragments need a higher bar because they repeat often.
    const minimumConfidence = normalizedPhrase.length < 3 ? 0.88 : 0.68;
    return best.confidence >= minimumConfidence
      ? best
      : { indexes: [], confidence: best.confidence };
  }

  async function fetchContextualAlignmentPhrases(text, ranges, sourceLanguage, targetLanguage) {
    if (!text || !ranges.length || sourceLanguage === targetLanguage) return [];
    const variants = ranges.map((range) => (
      `${text.slice(0, range.start)}⟦${text.slice(range.start, range.end)}⟧${text.slice(range.end)}`
    ));
    const batches = [];
    for (let index = 0; index < variants.length; index += 18) {
      batches.push(variants.slice(index, index + 18));
    }
    const translatedBatches = await Promise.all(batches.map(async (batch) => {
      const body = new URLSearchParams({
        client: "gtx",
        sl: sourceLanguage,
        tl: targetLanguage,
        dt: "t",
        q: batch.join("\n")
      });
      const response = await withTimeout(fetch("https://translate.googleapis.com/translate_a/single", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body,
        cache: "no-store"
      }), 12000, "word alignment");
      if (!response.ok) throw new Error(`Word alignment ${response.status}`);
      const payload = await response.json();
      const translated = Array.isArray(payload?.[0])
        ? payload[0].map((chunk) => chunk?.[0] || "").join("")
        : "";
      return translated.split("\n");
    }));
    const lines = translatedBatches.flat();
    return ranges.map((range, index) => {
      const match = String(lines[index] || "").match(/⟦([\s\S]*?)⟧/u);
      return normalizeSpaces(match?.[1] || "");
    });
  }

  function readerAlignmentKey(pair, newsMode, language) {
    return `${newsMode ? "news" : "book"}:${language}:${bookHash(pair.source)}:${pair.source.length}:${bookHash(pair.english)}:${pair.english.length}`;
  }

  function buildReaderAlignment(pair, newsMode, language) {
    const sourceLanguage = LANGUAGES[language]?.translateSl || activeLanguage().translateSl;
    const sourceRanges = wordRanges(pair.source, sourceLanguage);
    const englishRanges = wordRanges(pair.english, "en");
    const fromRanges = newsMode ? sourceRanges : englishRanges;
    const toRanges = newsMode ? englishRanges : sourceRanges;
    const forwardBestGuess = bestGuessWordMap(fromRanges.length, toRanges.length);
    const reverseBestGuess = invertWordMap(
      forwardBestGuess,
      toRanges.length,
      bestGuessWordMap(toRanges.length, fromRanges.length)
    );
    return {
      sourceText: pair.source,
      englishText: pair.english,
      sourceLanguage,
      sourceRanges,
      englishRanges,
      sourceToEnglish: newsMode ? forwardBestGuess : reverseBestGuess,
      englishToSource: newsMode ? reverseBestGuess : forwardBestGuess,
      newsMode,
      contextual: false,
      alignedWordCount: 0
    };
  }

  function mapContextualPhrases(toText, toRanges, phrases, fallback, targetLanguage) {
    let matchedWordCount = 0;
    const matched = [];
    const map = fallback.map((indexes, index) => {
      const located = locateAlignedPhrase(toText, toRanges, phrases[index], indexes, targetLanguage);
      matched[index] = Boolean(located.indexes.length);
      if (!matched[index]) return indexes;
      const alignedIndexes = targetLanguage === "en"
        ? expandEnglishAlignedPhrase(toText, toRanges, located.indexes)
        : located.indexes;
      matchedWordCount += alignedIndexes.length;
      return alignedIndexes;
    });
    return { map, matched, matchedWordCount };
  }

  function expandEnglishAlignedPhrase(text, ranges, indexes) {
    if (indexes.length !== 1 || indexes[0] <= 0) return indexes;
    const index = indexes[0];
    const previous = normalizeAlignmentText(
      String(text || "").slice(ranges[index - 1].start, ranges[index - 1].end),
      "en"
    );
    const auxiliaries = new Set([
      "am", "is", "are", "was", "were", "be", "been", "being",
      "have", "has", "had", "do", "does", "did", "will", "would",
      "shall", "should", "can", "could", "may", "might", "must",
      "im", "youre", "hes", "shes", "its", "theyre", "ive", "youve",
      "weve", "theyve", "ill", "youll", "hell", "shell", "well", "theyll"
    ]);
    return auxiliaries.has(previous) ? [index - 1, index] : indexes;
  }

  function reconcileBidirectionalMap(direct, reverseMap, fallback) {
    const reverseEvidence = invertWordMap(reverseMap, direct.map.length);
    return direct.map.map((targets, index) => {
      if (!direct.matched[index]) return reverseEvidence[index]?.length ? reverseEvidence[index] : fallback[index];
      const mutuallySupported = targets.filter((targetIndex) => reverseMap[targetIndex]?.includes(index));
      return mutuallySupported.length ? mutuallySupported : targets;
    });
  }

  async function enrichReaderAlignment(alignment) {
    const sourceFallback = bestGuessWordMap(alignment.sourceRanges.length, alignment.englishRanges.length);
    const englishFallback = bestGuessWordMap(alignment.englishRanges.length, alignment.sourceRanges.length);
    const bidirectional = ["ru", "fa"].includes(alignment.sourceLanguage);
    const directions = bidirectional
      ? [
          {
            key: "source",
            fromText: alignment.sourceText,
            fromRanges: alignment.sourceRanges,
            sourceLanguage: alignment.sourceLanguage,
            targetLanguage: "en",
            toText: alignment.englishText,
            toRanges: alignment.englishRanges,
            fallback: sourceFallback
          },
          {
            key: "english",
            fromText: alignment.englishText,
            fromRanges: alignment.englishRanges,
            sourceLanguage: "en",
            targetLanguage: alignment.sourceLanguage,
            toText: alignment.sourceText,
            toRanges: alignment.sourceRanges,
            fallback: englishFallback
          }
        ]
      : [{
          key: alignment.newsMode ? "source" : "english",
          fromText: alignment.newsMode ? alignment.sourceText : alignment.englishText,
          fromRanges: alignment.newsMode ? alignment.sourceRanges : alignment.englishRanges,
          sourceLanguage: alignment.newsMode ? alignment.sourceLanguage : "en",
          targetLanguage: alignment.newsMode ? "en" : alignment.sourceLanguage,
          toText: alignment.newsMode ? alignment.englishText : alignment.sourceText,
          toRanges: alignment.newsMode ? alignment.englishRanges : alignment.sourceRanges,
          fallback: alignment.newsMode ? sourceFallback : englishFallback
        }];

    const settled = await Promise.allSettled(directions.map(async (direction) => {
      const phrases = await fetchContextualAlignmentPhrases(
        direction.fromText,
        direction.fromRanges,
        direction.sourceLanguage,
        direction.targetLanguage
      );
      return {
        key: direction.key,
        ...mapContextualPhrases(
          direction.toText,
          direction.toRanges,
          phrases,
          direction.fallback,
          direction.targetLanguage
        )
      };
    }));
    const results = Object.fromEntries(settled
      .filter((result) => result.status === "fulfilled")
      .map((result) => [result.value.key, result.value]));

    if (results.source && results.english) {
      alignment.sourceToEnglish = reconcileBidirectionalMap(results.source, results.english.map, sourceFallback);
      alignment.englishToSource = reconcileBidirectionalMap(results.english, results.source.map, englishFallback);
    } else if (results.source) {
      alignment.sourceToEnglish = results.source.map;
      alignment.englishToSource = invertWordMap(results.source.map, alignment.englishRanges.length, englishFallback);
    } else if (results.english) {
      alignment.englishToSource = results.english.map;
      alignment.sourceToEnglish = invertWordMap(results.english.map, alignment.sourceRanges.length, sourceFallback);
    }

    alignment.alignedWordCount = (results.source?.matchedWordCount || 0) + (results.english?.matchedWordCount || 0);
    alignment.contextual = alignment.alignedWordCount > 0;
    return alignment;
  }

  function ensureReaderAlignment(
    pair,
    language = state.language,
    newsMode = isNewsMode() || state.bookLoadedBook?.kind === "news"
  ) {
    const key = readerAlignmentKey(pair, newsMode, language);
    if (state.readerAlignmentCache.has(key)) return state.readerAlignmentCache.get(key);
    const alignment = buildReaderAlignment(pair, newsMode, language);
    state.readerAlignmentCache.set(key, alignment);
    while (state.readerAlignmentCache.size > READER_ALIGNMENT_CACHE_LIMIT) {
      state.readerAlignmentCache.delete(state.readerAlignmentCache.keys().next().value);
    }
    alignment.enrichmentPromise = enrichReaderAlignment(alignment).catch((error) => {
      console.warn("Contextual word alignment unavailable:", error);
      return alignment;
    });
    return alignment;
  }

  function applyReaderWordHighlight(
    alignment,
    speakingPane,
    charIndex,
    spokenText = "",
    forcedWordIndex = null
  ) {
    if (!alignment) return;
    const speakingRanges = speakingPane === "source" ? alignment.sourceRanges : alignment.englishRanges;
    const renderedText = speakingPane === "source" ? alignment.sourceText : alignment.englishText;
    const boundaryRanges = wordRanges(spokenText || renderedText, speakingPane === "source" ? alignment.sourceLanguage : "en");
    const localWordIndex = Math.max(0, activeWordIndexForChar(spokenText || renderedText, charIndex, boundaryRanges));
    const activeIndex = Number.isInteger(forcedWordIndex)
      ? clamp(forcedWordIndex, 0, Math.max(0, speakingRanges.length - 1))
      : clamp(localWordIndex, 0, Math.max(0, speakingRanges.length - 1));
    const mappedIndexes = speakingPane === "source"
      ? alignment.sourceToEnglish[activeIndex] || []
      : alignment.englishToSource[activeIndex] || [];
    const sourceIndexes = speakingPane === "source" ? [activeIndex] : mappedIndexes;
    const englishIndexes = speakingPane === "english" ? [activeIndex] : mappedIndexes;
    const targets = normalizeHighlightTargets([
      { id: "bookSourceSentence", text: alignment.sourceText },
      { id: "bookEnglishSentence", text: alignment.englishText }
    ], "");
    clearCorrespondingHighlights();
    state.activeHighlights = targets;
    renderReaderHighlight(
      els.bookSourceSentence,
      alignment.sourceText,
      sourceIndexes,
      speakingPane === "source" ? "active" : "translation-active",
      alignment.sourceRanges
    );
    renderReaderHighlight(
      els.bookEnglishSentence,
      alignment.englishText,
      englishIndexes,
      speakingPane === "english" ? "active" : "translation-active",
      alignment.englishRanges
    );
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

  async function translateToEn(text, language = state.language) {
    const word = normalizeSpaces(text);
    if (!word || !hasLinguisticContent(word)) return "";
    const source = LANGUAGES[language]?.translateSl || activeLanguage().translateSl;
    const translators = [
      {
        name: "Google",
        run: async () => {
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=en&dt=t&q=${encodeURIComponent(word)}`;
          const response = await withTimeout(fetch(url, { cache: "no-store" }), 12000, "Google translation");
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
          const url = `https://lingva.ml/api/v1/${source}/en/${encodeURIComponent(word)}`;
          const response = await withTimeout(fetch(url, { cache: "no-store" }), 12000, "Lingva translation");
          if (!response.ok) throw new Error(`Lingva ${response.status}`);
          const payload = await response.json();
          return normalizeSpaces(payload.translation || "");
        }
      },
      {
        name: "MyMemory",
        run: async () => {
          const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${source}|en`;
          const response = await withTimeout(fetch(url, { cache: "no-store" }), 12000, "MyMemory translation");
          if (!response.ok) throw new Error(`MyMemory ${response.status}`);
          const payload = await response.json();
          return normalizeSpaces(payload?.responseData?.translatedText || "");
        }
      }
    ];

    const failures = [];
    for (const translator of translators) {
      try {
        const translated = normalizeReaderText(await translator.run());
        if (isUsableTranslation(word, translated, "en")) return translated;
        failures.push(`${translator.name}: unchanged or wrong-language response`);
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

  function genreLabel(value = state.bookGenre) {
    return BOOK_GENRES[value] || "All";
  }

  function bookLevelInfo(bookOrLevel) {
    const level = typeof bookOrLevel === "string" ? bookOrLevel : bookOrLevel?.level;
    return BOOK_LEVELS[level] || null;
  }

  function bookLevelLabel(bookOrLevel) {
    return bookLevelInfo(bookOrLevel)?.label || "Not rated";
  }

  function bookSourceLabel(book) {
    if (book?.source === "usaf") return "Official USAF";
    return book?.source === "gutenberg" ? "Project Gutenberg" : "Standard Ebooks";
  }

  function formatBookWordCount(value) {
    const count = Math.max(0, Number(value) || 0);
    if (!count) return "";
    if (count < 1000) return `${Math.round(count)} words`;
    const digits = count < 10000 ? 1 : 0;
    return `~${(count / 1000).toFixed(digits)}k words`;
  }

  function bookDifficultySummary(book) {
    const values = [];
    const wordCount = formatBookWordCount(book?.wordCount);
    if (wordCount) values.push(wordCount);
    const grade = optionalBookNumber(book?.estimatedGrade);
    if (grade !== null) {
      values.push(`English grade ${grade.toFixed(1)}`);
    }
    return values.join(" · ");
  }

  function bookMatchesLevel(book, level = state.bookLevel) {
    return !BOOK_LEVELS[level] || book?.level === level;
  }

  function bookMatchesGenre(book, genre = state.bookGenre) {
    if (!BOOK_GENRES[genre]) return true;
    if (Array.isArray(book?.genres) && book.genres.includes(genre)) return true;
    const haystack = normalizeBookSearchValue([
      ...(Array.isArray(book?.subjects) ? book.subjects : []),
      ...(Array.isArray(book?.bookshelves) ? book.bookshelves : [])
    ].join(" "));
    const terms = normalizeBookSearchValue(`${genre} ${BOOK_GENRES[genre]}`).split(/\s+/).filter(Boolean);
    return terms.some((term) => haystack.includes(term));
  }

  function favoriteBooks() {
    return Object.values(state.bookFavorites)
      .sort((left, right) => (right.favoritedAt || 0) - (left.favoritedAt || 0));
  }

  function isBookFavorite(book) {
    const id = normalizeBookRecord(book)?.id || "";
    return Boolean(id && state.bookFavorites[id]);
  }

  function toggleBookFavorite(book) {
    const normalized = normalizeBookRecord(book);
    if (!normalized) return false;
    if (state.bookFavorites[normalized.id]) {
      delete state.bookFavorites[normalized.id];
      saveBookFavoritesStore();
      return false;
    }
    state.bookFavorites[normalized.id] = {
      ...normalized,
      favoritedAt: Date.now()
    };
    saveBookFavoritesStore();
    return true;
  }

  function normalizeBookSearchValue(value) {
    return normalizeSpaces(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, " and ")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function bookSearchHaystack(book) {
    let pathText = "";
    try {
      pathText = new URL(book?.link || "").pathname.replace(/^\/ebooks\//, "").replace(/[/-]+/g, " ");
    } catch {
      pathText = "";
    }
    const metadata = [
      ...(Array.isArray(book?.subjects) ? book.subjects : []),
      ...(Array.isArray(book?.bookshelves) ? book.bookshelves : []),
      ...(Array.isArray(book?.genres) ? book.genres.map((genre) => BOOK_GENRES[genre] || genre) : [])
    ].join(" ");
    return normalizeBookSearchValue(`${book?.title || ""} ${book?.author || ""} ${book?.summary || ""} ${metadata} ${pathText}`);
  }

  function bookMatchesSearch(book, query) {
    const terms = normalizeBookSearchValue(query).split(/\s+/).filter(Boolean);
    if (!terms.length) return true;
    const haystack = bookSearchHaystack(book);
    return terms.every((term) => haystack.includes(term));
  }

  function visibleFavoriteBooks() {
    const cleanQuery = normalizeSpaces(state.bookSearch);
    return favoriteBooks().filter((book) => bookMatchesSearch(book, cleanQuery) && bookMatchesLevel(book));
  }

  function visibleGuidedBooks() {
    const cleanQuery = normalizeSpaces(state.bookSearch);
    return dedupeBooks(GUIDED_BOOKS).filter((book) => (
      bookMatchesSearch(book, cleanQuery)
      && bookMatchesGenre(book)
      && bookMatchesLevel(book)
    ));
  }

  function visibleOfficialBooks() {
    const cleanQuery = normalizeSpaces(state.bookSearch);
    return dedupeBooks(OFFICIAL_BOOKS).filter((book) => bookMatchesSearch(book, cleanQuery));
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
    scheduleReaderTranslationSave();
  }

  async function sharedBookTranslation(key, run, validate = hasLinguisticContent) {
    if (state.bookTranslationCache.has(key)) {
      const cached = normalizeReaderText(state.bookTranslationCache.get(key));
      if (validate(cached)) return cached;
      state.bookTranslationCache.delete(key);
      scheduleReaderTranslationSave();
    }
    if (state.bookTranslationPromises.has(key)) return state.bookTranslationPromises.get(key);
    const promise = Promise.resolve()
      .then(run)
      .then((value) => {
        const cleanValue = normalizeReaderText(value);
        if (!validate(cleanValue)) return "";
        rememberBookTranslation(key, cleanValue);
        return cleanValue;
      })
      .finally(() => state.bookTranslationPromises.delete(key));
    state.bookTranslationPromises.set(key, promise);
    return promise;
  }

  async function translateFromEn(text, targetLanguage = state.language) {
    const clean = normalizeSpaces(text);
    const target = LANGUAGES[targetLanguage]?.translateSl || "ru";
    if (!clean || !hasLinguisticContent(clean)) return "";

    const translators = [
      {
        name: "Google",
        run: async () => {
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${target}&dt=t&q=${encodeURIComponent(clean)}`;
          const response = await withTimeout(fetch(url, { cache: "no-store" }), 12000, "Google translation");
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
          const response = await withTimeout(fetch(url, { cache: "no-store" }), 12000, "Lingva translation");
          if (!response.ok) throw new Error(`Lingva ${response.status}`);
          const payload = await response.json();
          return normalizeSpaces(payload.translation || "");
        }
      },
      {
        name: "MyMemory",
        run: async () => {
          const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=en|${target}`;
          const response = await withTimeout(fetch(url, { cache: "no-store" }), 12000, "MyMemory translation");
          if (!response.ok) throw new Error(`MyMemory ${response.status}`);
          const payload = await response.json();
          return normalizeSpaces(payload?.responseData?.translatedText || "");
        }
      }
    ];

    const failures = [];
    for (const translator of translators) {
      try {
        const translated = normalizeReaderText(await translator.run());
        if (isUsableTranslation(clean, translated, target)) return translated;
        failures.push(`${translator.name}: unchanged or wrong-language response`);
      } catch (error) {
        failures.push(`${translator.name}: ${error.message}`);
      }
    }
    console.warn("Book translation failed:", failures.join(" | "));
    return "";
  }

  async function ensureBookSourceSentence(english, language = state.language) {
    const key = bookTranslationKey(english, language);
    const target = LANGUAGES[language]?.translateSl || "ru";
    return sharedBookTranslation(
      key,
      () => translateFromEn(english, language),
      (value) => isUsableTranslation(english, value, target)
    );
  }

  async function ensureNewsEnglishSentence(sourceText, language = state.language) {
    const key = `en:${bookTranslationKey(sourceText, language)}`;
    return sharedBookTranslation(
      key,
      () => translateToEn(sourceText, language),
      (value) => isUsableTranslation(sourceText, value, "en")
    );
  }

  async function readerSentencePair(
    sentence,
    language = state.language,
    newsMode = isNewsMode() || state.bookLoadedBook?.kind === "news"
  ) {
    if (!sentence) return { source: "", english: "" };
    if (newsMode) {
      return {
        source: sentence.text,
        english: await ensureNewsEnglishSentence(sentence.text, language)
      };
    }
    return {
      source: await ensureBookSourceSentence(sentence.text, language),
      english: sentence.text
    };
  }

  async function readerTextForSpeechTrack(pair, track) {
    if (!pair || !track || !LANGUAGES[track.language]) return "";
    if (track.language === state.language) return pair.source;
    if (track.language === "en") return pair.english;
    return ensureBookSourceSentence(pair.english, track.language);
  }

  function clearBookSpeechTracks() {
    [2, 3].forEach((slot) => {
      const elements = bookSpeechTrackElements(slot);
      elements.pane.hidden = true;
      elements.text.textContent = "";
    });
    els.bookSpeechTracks.hidden = true;
  }

  async function renderBookSpeechTracks(pair, renderToken = state.bookRenderToken) {
    const tracks = enabledCompanionTracks();
    let visibleCount = 0;
    tracks.forEach((track) => {
      if (setSupplementalSpeechTrack(bookSpeechTrackElements(track.slot), track, "Translating…")) {
        visibleCount += 1;
      }
    });
    [2, 3].filter((slot) => !tracks.some((track) => track.slot === slot)).forEach((slot) => {
      setSupplementalSpeechTrack(bookSpeechTrackElements(slot), { slot, language: "off" }, "");
    });
    els.bookSpeechTracks.hidden = visibleCount === 0;
    if (!pair?.english || !visibleCount) return;

    await Promise.all(tracks.map(async (track) => {
      if (track.language === "en" || track.language === state.language) return;
      const translated = await readerTextForSpeechTrack(pair, track);
      if (renderToken !== state.bookRenderToken) return;
      const elements = bookSpeechTrackElements(track.slot);
      elements.text.textContent = translated || `${languageTrackLabel(track.language)} translation unavailable.`;
    }));
  }

  function standardEbooksPageUrl(page, query = state.bookSearch, genre = state.bookGenre) {
    const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
    const params = new URLSearchParams({ "per-page": String(STANDARD_EBOOKS_PER_PAGE) });
    if (safePage > 1) params.set("page", String(safePage));
    const cleanQuery = normalizeSpaces(query);
    if (cleanQuery) params.set("query", cleanQuery);
    const root = BOOK_GENRES[genre]
      ? `https://standardebooks.org/subjects/${encodeURIComponent(genre)}`
      : STANDARD_EBOOKS_LIST_URL;
    return `${root}?${params.toString()}`;
  }

  async function fetchTextCandidate(proxy, url, label, signal, cacheMode = "no-store") {
    const response = await withTimeout(
      fetch(proxy.build(url), { cache: cacheMode, signal }),
      BOOK_FETCH_TIMEOUT_MS,
      `${proxy.name} ${label}`
    );
    if (!response.ok) throw new Error(`${response.status}`);
    let text = await withTimeout(response.text(), BOOK_FETCH_TIMEOUT_MS, `${proxy.name} body`);
    if (proxy.unwrap) text = proxy.unwrap(text);
    if (!normalizeSpaces(text)) throw new Error("empty response");
    return { text, proxy: proxy.name };
  }

  async function fetchTextWithProxies(url, label, options = {}) {
    const failures = [];
    const cacheMode = options.cache || "no-store";
    // Keep full-page CORS access ahead of reader-mode and best-effort services.
    // Reader-mode responses can be fast but may omit later paragraphs.
    const waves = [PROXY_CANDIDATES.slice(0, 2), PROXY_CANDIDATES.slice(2)];
    for (const wave of waves) {
      const controllers = wave.map(() => new AbortController());
      try {
        const result = await Promise.any(wave.map((proxy, index) => (
          fetchTextCandidate(proxy, url, label, controllers[index].signal, cacheMode).catch((error) => {
            failures.push(`${proxy.name}: ${error.message}`);
            throw error;
          })
        )));
        controllers.forEach((controller) => controller.abort());
        return result;
      } catch {
        controllers.forEach((controller) => controller.abort());
        // Try the less reliable fallback services only if the fast wave fails.
      }
    }
    throw new Error(`${label} failed: ${failures.slice(0, 3).join(" | ")}`);
  }

  function feedChild(node, names) {
    const wanted = names.map((name) => name.toLowerCase());
    return Array.from(node?.children || []).find((child) => wanted.includes(String(child.localName || child.tagName || "").toLowerCase())) || null;
  }

  function feedChildText(node, names) {
    return normalizeSpaces(feedChild(node, names)?.textContent || "");
  }

  function stripNewsMarkup(value) {
    const doc = new DOMParser().parseFromString(String(value || ""), "text/html");
    return cleanBookText(doc.body?.textContent || value || "");
  }

  function normalizeNewsLink(value, baseUrl = "") {
    try {
      const url = new URL(value, baseUrl || window.location.href);
      if (!/^https?:$/.test(url.protocol)) return "";
      url.hash = "";
      return url.href;
    } catch {
      return "";
    }
  }

  function normalizeNewsRecord(rawArticle, source) {
    const link = normalizeNewsLink(rawArticle.link, source?.home || source?.feed || "");
    const title = cleanBookText(rawArticle.title);
    if (!link || !title) return null;
    const publishedTime = Date.parse(rawArticle.publishedAt || "");
    return {
      id: link,
      kind: "news",
      link,
      title,
      author: cleanBookText(rawArticle.author || source?.label || "News"),
      sourceLabel: cleanBookText(rawArticle.sourceLabel || rawArticle.author || source?.label || "News"),
      publishedAt: Number.isFinite(publishedTime) ? new Date(publishedTime).toISOString() : "",
      summary: stripNewsMarkup(rawArticle.summary || ""),
      feedSourceId: source?.id || "",
      feedSourceLabel: source?.label || "News"
    };
  }

  function isPersianGoogleSource(source) {
    return source?.id === "google" && /[?&]hl=fa(?:&|$)/i.test(source?.feed || "");
  }

  function newsArticleMatchesSourceLanguage(article, source) {
    if (!isPersianGoogleSource(source)) return true;
    const title = String(article?.title || "");
    const letters = title.match(/\p{L}/gu) || [];
    const persianLetters = title.match(/[\u0600-\u06ff]/g) || [];
    return persianLetters.length >= 4 && persianLetters.length / Math.max(1, letters.length) >= 0.45;
  }

  function parseNewsFeed(text, source) {
    const doc = new DOMParser().parseFromString(text, "application/xml");
    if (doc.querySelector("parsererror")) {
      throw new Error("News feed returned invalid XML");
    }
    const records = [];
    const seen = new Set();
    const entries = Array.from(doc.querySelectorAll("item, entry"));
    entries.forEach((entry) => {
      const linkNode = feedChild(entry, ["link"]);
      const rawLink = linkNode?.getAttribute("href") || normalizeSpaces(linkNode?.textContent || "") || feedChildText(entry, ["guid", "id"]);
      const sourceNode = feedChild(entry, ["source"]);
      const sourceLabel = normalizeSpaces(sourceNode?.textContent || "");
      let title = feedChildText(entry, ["title"]);
      if (sourceLabel && title.endsWith(` - ${sourceLabel}`)) {
        title = title.slice(0, -(` - ${sourceLabel}`.length)).trim();
      }
      const article = normalizeNewsRecord({
        link: rawLink,
        title,
        author: feedChildText(entry, ["author", "creator"]) || sourceLabel,
        sourceLabel,
        publishedAt: feedChildText(entry, ["pubdate", "published", "updated", "date"]),
        summary: feedChildText(entry, ["description", "summary", "content", "encoded"])
      }, source);
      if (!article || !newsArticleMatchesSourceLanguage(article, source) || seen.has(article.id)) return;
      seen.add(article.id);
      records.push(article);
    });
    return records
      .sort((left, right) => Date.parse(right.publishedAt || 0) - Date.parse(left.publishedAt || 0))
      .slice(0, NEWS_ARTICLE_LIMIT);
  }

  function parseNewsFeedJson(payload, source) {
    if (payload?.status !== "ok" || !Array.isArray(payload.items)) {
      throw new Error(payload?.message || "News service returned invalid data");
    }
    const seen = new Set();
    return payload.items
      .map((item) => normalizeNewsRecord({
        link: item.link || item.guid,
        title: item.title,
        author: item.author || payload.feed?.title || source.label,
        sourceLabel: item.author || source.label,
        publishedAt: item.pubDate,
        summary: item.description || item.content || item.thumbnail || ""
      }, source))
      .filter((article) => {
        if (!article || !newsArticleMatchesSourceLanguage(article, source) || seen.has(article.id)) return false;
        seen.add(article.id);
        return true;
      })
      .sort((left, right) => Date.parse(right.publishedAt || 0) - Date.parse(left.publishedAt || 0))
      .slice(0, NEWS_ARTICLE_LIMIT);
  }

  function parseNewsFeedMarkdown(text, source) {
    const records = [];
    const seen = new Set();
    String(text || "").split(/^###\s+/m).slice(1).forEach((block) => {
      const heading = block.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
      if (!heading) return;
      const lines = block.split(/\n+/).map((line) => normalizeSpaces(line)).filter(Boolean);
      const publishedAt = lines.find((line) => /^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s/i.test(line)) || "";
      const summary = lines.find((line, index) => (
        index > 0
        && !/^\[https?:/i.test(line)
        && !/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s/i.test(line)
      )) || "";
      const article = normalizeNewsRecord({
        title: heading[1],
        link: heading[2],
        author: source.label,
        sourceLabel: source.label,
        publishedAt,
        summary
      }, source);
      if (!article || !newsArticleMatchesSourceLanguage(article, source) || seen.has(article.id)) return;
      seen.add(article.id);
      records.push(article);
    });
    return records.slice(0, NEWS_ARTICLE_LIMIT);
  }

  async function fetchNewsArticles(source) {
    const rssServiceUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.feed)}`;
    const failures = [];
    const viaRssService = async () => {
      const response = await withTimeout(
        fetch(rssServiceUrl, { cache: "no-store" }),
        BOOK_FETCH_TIMEOUT_MS,
        "news service"
      );
      if (!response.ok) throw new Error(`${response.status}`);
      const articles = parseNewsFeedJson(await response.json(), source);
      if (!articles.length) throw new Error("no articles");
      return { articles, proxy: "live RSS" };
    };
    const viaFeedProxy = async () => {
      const { text, proxy } = await fetchTextWithProxies(source.feed, "news feed");
      let articles = [];
      try {
        articles = parseNewsFeed(text, source);
      } catch {
        articles = parseNewsFeedMarkdown(text, source);
      }
      if (!articles.length) throw new Error("no articles");
      return { articles, proxy };
    };
    try {
      return await Promise.any([
        viaRssService().catch((error) => {
          failures.push(`RSS service: ${error.message}`);
          throw error;
        }),
        viaFeedProxy().catch((error) => {
          failures.push(error.message);
          throw error;
        })
      ]);
    } catch {
      if (isPersianGoogleSource(source)) {
        throw new Error("Google returned no Persian-language headlines; try VOA Persian or Radio Farda");
      }
      throw new Error(`News feed failed: ${failures.join(" | ")}`);
    }
  }

  function newsSearchHaystack(article) {
    return normalizeSpaces(`${article?.title || ""} ${article?.author || ""} ${article?.summary || ""}`)
      .toLocaleLowerCase(state.language);
  }

  function applyNewsFilter() {
    const query = normalizeSpaces(state.newsSearch).toLocaleLowerCase(state.language);
    const terms = query.split(/\s+/).filter(Boolean);
    state.bookBooks = terms.length
      ? state.newsAllArticles.filter((article) => {
        const haystack = newsSearchHaystack(article);
        return terms.every((term) => haystack.includes(term));
      })
      : [...state.newsAllArticles];
    renderBookShelf();
    setStatus(terms.length
      ? `Showing ${state.bookBooks.length} matching current articles`
      : `${state.bookBooks.length} current articles`);
  }

  async function loadNewsFeed() {
    const source = activeNewsSource();
    if (!source) throw new Error(`No news source for ${activeLanguage().label}`);
    const loadToken = state.newsFeedLoadToken + 1;
    state.newsFeedLoadToken = loadToken;
    const language = state.language;
    state.newsSourceByLanguage[state.language] = source.id;
    state.newsSearch = normalizeSpaces(els.newsSearchInput.value);
    const cacheKey = `${state.language}:${source.id}:${bookHash(source.feed)}`;
    const cached = state.newsFeedCache[cacheKey];
    const cachedArticles = Array.isArray(cached?.articles)
      ? cached.articles.filter((article) => newsArticleMatchesSourceLanguage(article, source))
      : [];
    const cacheFresh = cachedArticles.length && Date.now() - Number(cached.savedAt || 0) < NEWS_FEED_CACHE_MAX_AGE_MS;
    if (cacheFresh) {
      state.newsAllArticles = cachedArticles;
      applyNewsFilter();
      setStatus(`Showing cached ${source.label} headlines · updating`);
    } else {
      setStatus(`Updating ${source.label}`);
    }
    try {
      const { articles, proxy } = await fetchNewsArticles(source);
      if (loadToken !== state.newsFeedLoadToken || language !== state.language || activeNewsSource()?.id !== source.id) return;
      state.newsAllArticles = articles;
      state.newsFeedCache[cacheKey] = { savedAt: Date.now(), articles };
      saveNewsFeedCache();
      applyNewsFilter();
      savePrefs();
      setStatus(`Updated ${articles.length} articles from ${source.label} via ${proxy}`);
    } catch (error) {
      if (!cacheFresh) throw error;
      setStatus(`Showing cached ${source.label} headlines; refresh unavailable`);
    }
  }

  function knowledgePageUrl(title) {
    return `https://en.wikipedia.org/wiki/${encodeURIComponent(String(title || "").replace(/ /g, "_"))}`;
  }

  function knowledgeCategories(rawCategories) {
    return (rawCategories || [])
      .map((category) => normalizeSpaces(String(category?.title || "").replace(/^Category:/i, "")))
      .filter((category) => category && !/^(Articles|Pages|Wikipedia|CS1|All stub|Use )/i.test(category))
      .slice(0, 3);
  }

  function normalizeKnowledgeRecord(page, topic = activeKnowledgeTopic()) {
    const title = cleanBookTitle(page?.title || "");
    const extract = cleanBookText(page?.extract || "");
    if (
      !title
      || !extract
      || page?.missing !== undefined
      || page?.pageprops?.disambiguation !== undefined
      || /^(?:List of|Index of|Outline of|Timeline of)/i.test(title)
    ) return null;
    const sentences = splitBookSentences(extract).slice(0, 18);
    const summary = sentences.join(" ");
    if (summary.length < 90) return null;
    const pageId = String(page?.pageid || title.toLowerCase());
    return {
      id: `knowledge:wikipedia:${pageId}`,
      kind: "knowledge",
      source: "wikipedia",
      link: page?.fullurl || knowledgePageUrl(title),
      title,
      author: "Wikipedia",
      sourceLabel: topic?.onThisDay ? "Wikipedia · On this day" : "Wikipedia",
      summary,
      categories: knowledgeCategories(page?.categories),
      thumbnail: page?.thumbnail?.source || ""
    };
  }

  async function fetchWikipediaKnowledgeBatch(topic, generator, query = "") {
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      formatversion: "2",
      origin: "*",
      generator,
      prop: "extracts|info|pageprops|categories|pageimages",
      exintro: "1",
      explaintext: "1",
      inprop: "url",
      piprop: "thumbnail",
      pithumbsize: "600",
      cllimit: "8",
      redirects: "1"
    });
    if (generator === "search") {
      params.set("gsrnamespace", "0");
      params.set("gsrlimit", "20");
      params.set("gsrsearch", query);
    } else {
      params.set("grnnamespace", "0");
      params.set("grnlimit", String(KNOWLEDGE_BATCH_SIZE));
    }
    const response = await withTimeout(
      fetch(`${WIKIPEDIA_API_URL}?${params.toString()}`, { cache: "no-store" }),
      BOOK_FETCH_TIMEOUT_MS,
      "Wikipedia"
    );
    if (!response.ok) throw new Error(`Wikipedia ${response.status}`);
    const payload = await response.json();
    const pages = Array.isArray(payload?.query?.pages)
      ? payload.query.pages
      : Object.values(payload?.query?.pages || {});
    return pages
      .map((page) => normalizeKnowledgeRecord(page, topic))
      .filter(Boolean);
  }

  async function fetchWikipediaKnowledge(topic) {
    const searches = Array.isArray(topic?.searches) ? topic.searches.filter(Boolean) : [];
    let batches = [];
    if (searches.length) {
      const settled = await Promise.allSettled(
        searches.map((query) => fetchWikipediaKnowledgeBatch(topic, "search", query))
      );
      batches = settled
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);
      if (!batches.length) {
        const failure = settled.find((result) => result.status === "rejected");
        throw failure?.reason || new Error("Wikipedia topic search failed");
      }
    } else {
      batches = [await fetchWikipediaKnowledgeBatch(topic, "random")];
    }
    const seen = new Set();
    return batches.flat()
      .filter((item) => {
        if (!item || seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      })
      .sort(() => Math.random() - 0.5)
      .slice(0, KNOWLEDGE_BATCH_SIZE);
  }

  async function fetchOnThisDayKnowledge() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const response = await withTimeout(
      fetch(`${WIKIPEDIA_ON_THIS_DAY_URL}/${month}/${day}`, { cache: "no-store" }),
      BOOK_FETCH_TIMEOUT_MS,
      "Wikipedia history"
    );
    if (!response.ok) throw new Error(`Wikipedia history ${response.status}`);
    const payload = await response.json();
    const sourceGroups = state.knowledgeIncludeBirthDeaths
      ? ["selected", "events", "births", "deaths"]
      : ["selected", "events"];
    const records = [];
    sourceGroups.forEach((group) => {
      (payload?.[group] || []).forEach((entry) => {
        const page = entry?.pages?.[0] || {};
        const title = cleanBookTitle(page?.titles?.normalized || page?.titles?.display || "");
        const summary = cleanBookText(entry?.text || "");
        if (!title || summary.length < 35) return;
        records.push({
          id: `knowledge:onthisday:${entry?.year || "date"}:${title.toLowerCase()}`,
          kind: "knowledge",
          source: "wikipedia",
          link: page?.content_urls?.desktop?.page || knowledgePageUrl(title),
          title: entry?.year ? `${entry.year} · ${title}` : title,
          author: "Wikipedia",
          sourceLabel: "Wikipedia · On this day",
          summary,
          categories: ["On this day", group === "births" ? "Birth" : group === "deaths" ? "Death" : "History"],
          thumbnail: page?.thumbnail?.source || ""
        });
      });
    });
    return records.sort(() => Math.random() - 0.5).slice(0, KNOWLEDGE_BATCH_SIZE);
  }

  async function fetchKnowledgeItems(topic = activeKnowledgeTopic()) {
    const records = topic?.onThisDay
      ? await fetchOnThisDayKnowledge()
      : await fetchWikipediaKnowledge(topic);
    const history = new Set(state.knowledgeHistory);
    const unseen = records.filter((record) => !history.has(record.id));
    return unseen.length ? unseen : records;
  }

  async function loadKnowledgeFeed(options = {}) {
    const topic = activeKnowledgeTopic();
    const cacheKey = `${state.knowledgeTopic}:${state.knowledgeIncludeBirthDeaths ? "people" : "events"}`;
    const cached = state.knowledgeCache[cacheKey];
    const cachedItems = Array.isArray(cached?.items) ? cached.items.filter((item) => item?.kind === "knowledge") : [];
    const cacheFresh = cachedItems.length && Date.now() - Number(cached?.savedAt || 0) < KNOWLEDGE_CACHE_MAX_AGE_MS;
    const token = state.knowledgeLoadToken + 1;
    state.knowledgeLoadToken = token;
    if (cacheFresh && !options.force) {
      state.bookBooks = cachedItems;
      renderBookShelf();
      setStatus(`Showing cached ${topic.label.toLowerCase()} · updating`);
    } else {
      state.bookBooks = [];
      renderBookShelf();
      setStatus(`Finding ${topic.label.toLowerCase()}`);
    }
    try {
      const items = await fetchKnowledgeItems(topic);
      const currentCacheKey = `${state.knowledgeTopic}:${state.knowledgeIncludeBirthDeaths ? "people" : "events"}`;
      if (token !== state.knowledgeLoadToken || !isKnowledgeMode() || currentCacheKey !== cacheKey) return;
      if (!items.length) throw new Error("Wikipedia returned no readable knowledge cards");
      state.bookBooks = items;
      rememberKnowledgeItems(items);
      state.knowledgeCache[cacheKey] = { savedAt: Date.now(), items };
      saveKnowledgeCache();
      renderBookShelf();
      setStatus(`Loaded ${items.length} ${topic.label.toLowerCase()} cards`);
    } catch (error) {
      if (cachedItems.length) {
        state.bookBooks = cachedItems;
        renderBookShelf();
        setStatus(`Showing cached ${topic.label.toLowerCase()}; refresh unavailable`);
        return;
      }
      throw error;
    }
  }

  function knowledgeSummaryDocument(item) {
    const paragraphs = [item?.summary].filter(Boolean);
    const sentences = [];
    let paragraphIndex = 0;
    paragraphs.forEach((paragraph) => {
      const values = splitBookSentences(paragraph);
      values.forEach((text) => {
        sentences.push({ text, paragraphIndex, chapterIndex: 0 });
      });
      if (values.length) paragraphIndex += 1;
    });
    const parsed = finalizeBookParse(sentences, [{ title: "Knowledge", start: 0 }]);
    if (!parsed.sentences.length) throw new Error("Knowledge card has no readable text");
    return { ...parsed, sourceUrl: item?.link || "", proxy: "Wikipedia API" };
  }

  async function renderKnowledgeTranslation(sentence, renderToken) {
    const language = state.knowledgeTranslation;
    if (!sentence || !LANGUAGES[language] || language === "en") {
      clearBookSpeechTracks();
      return;
    }
    els.bookSpeechTracks.hidden = false;
    els.bookSpeechTrack2.hidden = false;
    els.bookSpeechTrack2Label.textContent = `${languageTrackLabel(language)} translation`;
    els.bookSpeechTrack2Sentence.textContent = "Translating…";
    els.bookSpeechTrack3.hidden = true;
    els.bookSpeechTrack3Sentence.textContent = "";
    const translated = await ensureBookSourceSentence(sentence.text, language);
    if (renderToken !== state.bookRenderToken) return;
    els.bookSpeechTrack2Sentence.textContent = translated || `${languageTrackLabel(language)} translation unavailable.`;
  }

  async function loadNextKnowledgeArticle(options = {}) {
    if (!state.bookBooks.length) await loadKnowledgeFeed();
    let items = state.bookBooks.filter((item) => item?.kind === "knowledge");
    if (!items.length) throw new Error("No knowledge cards found");
    const currentId = state.bookLoadedBook?.id;
    let currentIndex = items.findIndex((item) => item.id === currentId);
    if (currentIndex < 0) currentIndex = -1;
    if (currentIndex >= items.length - 1) {
      await loadKnowledgeFeed({ force: true });
      items = state.bookBooks.filter((item) => item?.kind === "knowledge");
      if (!items.length) throw new Error("No new knowledge cards found");
      currentIndex = items.findIndex((item) => item.id === currentId);
    }
    const next = items[(currentIndex + 1) % items.length];
    if (!next) throw new Error("No next knowledge card found");
    await loadBook(next, { index: 0, preservePlayback: Boolean(options.preservePlayback) });
    setStatus(`Opened ${next.title} · ${next.sourceLabel || "Wikipedia"}`);
  }

  async function loadRandomKnowledgeArticle() {
    stopSpeech();
    if (!state.bookBooks.length) await loadKnowledgeFeed();
    const item = state.bookBooks[Math.floor(Math.random() * state.bookBooks.length)];
    if (!item) throw new Error("No knowledge card found");
    await loadBook(item, { random: true });
    setStatus(`Random knowledge extract from ${item.sourceLabel || "Wikipedia"}`);
  }

  function formatNewsDate(value) {
    const time = Date.parse(value || "");
    if (!Number.isFinite(time)) return "Latest";
    try {
      return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }).format(new Date(time));
    } catch {
      return new Date(time).toLocaleString();
    }
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

  function normalizeGutenbergId(rawBook) {
    const directId = Number.parseInt(rawBook?.gutenbergId ?? rawBook?.id, 10);
    if (Number.isFinite(directId) && directId > 0) return directId;
    try {
      const url = new URL(rawBook?.link || "");
      if (!/(^|\.)gutenberg\.org$/i.test(url.hostname)) return 0;
      const match = url.pathname.match(/\/ebooks\/(\d+)/i);
      return Number.parseInt(match?.[1] || "0", 10) || 0;
    } catch {
      return 0;
    }
  }

  function gutenbergLandingPage(id) {
    const safeId = Math.max(0, Number.parseInt(id, 10) || 0);
    return safeId ? `https://www.gutenberg.org/ebooks/${safeId}` : "";
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

  function cleanBookStringList(value) {
    return Array.isArray(value) ? value.map((item) => normalizeSpaces(item)).filter(Boolean) : [];
  }

  function optionalBookNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function normalizeBookRecord(rawBook) {
    if (!rawBook || typeof rawBook !== "object") return null;
    if (rawBook.source === "usaf") {
      const id = normalizeSpaces(rawBook.id);
      const link = normalizeSpaces(rawBook.link);
      const dataUrl = normalizeSpaces(rawBook.dataUrl);
      const editionDate = normalizeSpaces(rawBook.editionDate);
      if (
        id !== USAF_HANDBOOK_ID
        || link !== USAF_HANDBOOK_SOURCE_URL
        || dataUrl !== USAF_HANDBOOK_DATA_URL
        || Number(rawBook.dataVersion) !== USAF_HANDBOOK_DATA_VERSION
        || editionDate !== USAF_HANDBOOK_EDITION_DATE
      ) return null;
      const cachedDifficulty = bookDifficultyCache[id] || {};
      return {
        ...rawBook,
        id,
        source: "usaf",
        link,
        dataUrl,
        dataVersion: USAF_HANDBOOK_DATA_VERSION,
        editionDate,
        title: cleanBookTitle(rawBook.title) || "Air Force Handbook 1 — Airman",
        author: normalizeSpaces(rawBook.author) || "United States Air Force",
        level: BOOK_LEVELS[rawBook.level] ? rawBook.level : (BOOK_LEVELS[cachedDifficulty.level] ? cachedDifficulty.level : ""),
        wordCount: Math.max(0, Number(rawBook.wordCount) || Number(cachedDifficulty.wordCount) || 0),
        estimatedGrade: optionalBookNumber(rawBook.estimatedGrade) ?? optionalBookNumber(cachedDifficulty.estimatedGrade),
        averageSentenceWords: optionalBookNumber(rawBook.averageSentenceWords) ?? optionalBookNumber(cachedDifficulty.averageSentenceWords),
        genres: cleanBookStringList(rawBook.genres).filter((genre) => BOOK_GENRES[genre]),
        subjects: cleanBookStringList(rawBook.subjects),
        bookshelves: cleanBookStringList(rawBook.bookshelves),
        summary: normalizeSpaces(rawBook.summary)
      };
    }
    const gutenbergId = normalizeGutenbergId(rawBook);
    if (rawBook.source === "gutenberg" || gutenbergId) {
      if (!gutenbergId) return null;
      const cachedDifficulty = bookDifficultyCache[`gutenberg:${gutenbergId}`] || {};
      return {
        ...rawBook,
        id: `gutenberg:${gutenbergId}`,
        source: "gutenberg",
        gutenbergId,
        link: gutenbergLandingPage(gutenbergId),
        title: cleanBookTitle(rawBook.title) || `Project Gutenberg #${gutenbergId}`,
        author: normalizeSpaces(rawBook.author) || "Unknown author",
        level: BOOK_LEVELS[rawBook.level] ? rawBook.level : (BOOK_LEVELS[cachedDifficulty.level] ? cachedDifficulty.level : ""),
        wordCount: Math.max(0, Number(rawBook.wordCount) || Number(cachedDifficulty.wordCount) || 0),
        estimatedGrade: optionalBookNumber(rawBook.estimatedGrade) ?? optionalBookNumber(cachedDifficulty.estimatedGrade),
        averageSentenceWords: optionalBookNumber(rawBook.averageSentenceWords) ?? optionalBookNumber(cachedDifficulty.averageSentenceWords),
        genres: cleanBookStringList(rawBook.genres).filter((genre) => BOOK_GENRES[genre]),
        subjects: cleanBookStringList(rawBook.subjects),
        bookshelves: cleanBookStringList(rawBook.bookshelves),
        textUrls: cleanBookStringList(rawBook.textUrls).filter((url) => /^https?:\/\//i.test(url)),
        summary: normalizeSpaces(rawBook.summary)
      };
    }
    const link = normalizeStandardEbookLink(rawBook.link);
    if (!isStandardEbookWorkLink(link)) return null;
    const cachedDifficulty = bookDifficultyCache[link] || {};
    return {
      ...rawBook,
      id: link,
      source: "standard",
      link,
      title: cleanBookTitle(rawBook.title) || bookTitleFromUrl(link),
      author: normalizeSpaces(rawBook.author) || bookAuthorFromUrl(link),
      level: BOOK_LEVELS[rawBook.level] ? rawBook.level : (BOOK_LEVELS[cachedDifficulty.level] ? cachedDifficulty.level : ""),
      wordCount: Math.max(0, Number(rawBook.wordCount) || Number(cachedDifficulty.wordCount) || 0),
      estimatedGrade: optionalBookNumber(rawBook.estimatedGrade) ?? optionalBookNumber(cachedDifficulty.estimatedGrade),
      averageSentenceWords: optionalBookNumber(rawBook.averageSentenceWords) ?? optionalBookNumber(cachedDifficulty.averageSentenceWords),
      genres: cleanBookStringList(rawBook.genres).filter((genre) => BOOK_GENRES[genre]),
      subjects: cleanBookStringList(rawBook.subjects),
      bookshelves: cleanBookStringList(rawBook.bookshelves)
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

  async function fetchBookCatalogPage(page = state.bookPage, query = state.bookSearch, genre = state.bookGenre) {
    const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
    const { text, proxy } = await fetchTextWithProxies(standardEbooksPageUrl(safePage, query, genre), "book shelf");
    const fromHtml = extractCatalogBooksFromHtml(text);
    const books = fromHtml.length ? fromHtml : extractCatalogBooksFromMarkdown(text);
    if (!books.length) throw new Error("No books found on the shelf page");
    const htmlDoc = fromHtml.length ? new DOMParser().parseFromString(text, "text/html") : null;
    const hasNext = htmlDoc
      ? Boolean(htmlDoc.querySelector('a[rel="next"]'))
      : new RegExp(`[?&]page=${safePage + 1}(?:&|\\)|\\s|$)`, "i").test(text);
    const hasPrevious = htmlDoc
      ? Boolean(htmlDoc.querySelector('a[rel="prev"]')) || safePage > 1
      : safePage > 1;
    return { books, proxy, page: safePage, hasNext, hasPrevious };
  }

  async function loadBookCatalogPage(page = state.bookPage) {
    const cleanQuery = normalizeSpaces(state.bookSearch);
    if (state.bookShelfKind === "guided") {
      state.bookBooks = visibleGuidedBooks();
      state.bookPage = 1;
      els.bookPageInput.value = "1";
      renderBookShelf();
      const filters = [
        state.bookLevel ? bookLevelInfo(state.bookLevel)?.shortLabel : "",
        state.bookGenre ? genreLabel() : "",
        cleanQuery ? `“${cleanQuery}”` : ""
      ].filter(Boolean);
      setStatus(`${state.bookBooks.length} guided books${filters.length ? ` · ${filters.join(" · ")}` : ""}`);
      return;
    }
    if (state.bookShelfKind === "official") {
      state.bookBooks = visibleOfficialBooks();
      state.bookPage = 1;
      els.bookPageInput.value = "1";
      renderBookShelf();
      setStatus(`${state.bookBooks.length} official handbook${state.bookBooks.length === 1 ? "" : "s"}${cleanQuery ? ` · “${cleanQuery}”` : ""}`);
      return;
    }
    if (state.bookShelfKind === "favorites") {
      state.bookBooks = visibleFavoriteBooks();
      els.bookPageInput.value = "1";
      renderBookShelf();
      const levelText = state.bookLevel ? ` at ${bookLevelInfo(state.bookLevel)?.shortLabel}` : "";
      setStatus(cleanQuery
        ? `Searched ${state.bookBooks.length} favorite books${levelText}`
        : `${state.bookBooks.length} favorite books${levelText}`);
      return;
    }

    const genreText = state.bookGenre ? `${genreLabel()} ` : "";
    setStatus(cleanQuery
      ? `Searching ${genreText}Standard Ebooks for "${cleanQuery}"`
      : `Loading ${genreText}Standard Ebooks page ${page}`);
    try {
      let books = [];
      let proxy = "";
      let safePage = Math.max(1, Number.parseInt(page, 10) || 1);
      const result = await fetchBookCatalogPage(safePage, cleanQuery, state.bookGenre);
      books = result.books;
      proxy = result.proxy;
      safePage = result.page;
      if (!books.length) {
        throw new Error("No matching books found");
      }
      state.bookPage = safePage;
      state.bookHasPreviousPage = result.hasPrevious;
      state.bookHasNextPage = result.hasNext;
      state.bookBooks = books;
      els.bookPageInput.value = String(safePage);
      renderBookShelf();
      setStatus(cleanQuery
        ? `Found ${books.length} ${state.bookGenre ? `${genreLabel()} ` : ""}books via ${proxy}`
        : `Loaded ${books.length} ${state.bookGenre ? `${genreLabel()} ` : ""}books via ${proxy}`);
    } catch (error) {
      if (cleanQuery || state.bookGenre) {
        state.bookBooks = [];
        renderBookShelf();
        setStatus(cleanQuery
          ? `No ${state.bookGenre ? `${genreLabel()} ` : ""}Standard Ebooks found for "${cleanQuery}"`
          : `${genreLabel()} Standard Ebooks could not be loaded`);
        return;
      }
      state.bookBooks = dedupeBooks(FALLBACK_BOOKS);
      renderBookShelf();
      setStatus(`Shelf fallback loaded (${error.message})`);
    }
  }

  async function ensureBookShelfLoaded() {
    if (state.bookBooks.length) return;
    await loadBookCatalogPage(state.bookPage);
  }

  function updateBookShelfControlState() {
    if (isKnowledgeMode()) {
      const onThisDay = Boolean(activeKnowledgeTopic().onThisDay);
      els.knowledgeTopicSelect.value = state.knowledgeTopic;
      els.knowledgeTranslationSelect.value = state.knowledgeTranslation;
      els.knowledgePeopleFilter.hidden = !onThisDay;
      els.knowledgeIncludeBirthDeaths.checked = state.knowledgeIncludeBirthDeaths;
      return;
    }
    if (isNewsMode()) {
      els.newsLanguageSelect.value = state.language;
      populateNewsSourceSelect();
      return;
    }
    const paged = state.bookShelfKind === "library";
    const levelsAvailable = state.bookShelfKind === "guided" || state.bookShelfKind === "favorites";
    els.bookShelfViewSelect.value = state.bookShelfKind;
    els.bookGenreSelect.value = state.bookGenre;
    els.bookLevelSelect.value = state.bookLevel;
    els.bookPageInput.disabled = !paged;
    els.bookPrevPageBtn.disabled = !paged || !state.bookHasPreviousPage;
    els.bookNextPageBtn.disabled = !paged || !state.bookHasNextPage;
    els.bookGenreSelect.disabled = state.bookShelfKind === "favorites" || state.bookShelfKind === "official";
    els.bookLevelSelect.disabled = !levelsAvailable;
  }

  function bookShelfTitle() {
    if (isKnowledgeMode()) {
      return activeKnowledgeTopic().label;
    }
    if (isNewsMode()) {
      const source = activeNewsSource();
      return state.newsSearch
        ? `${source?.label || "News"} · filtered`
        : `${source?.label || "News"} · latest`;
    }
    const cleanQuery = normalizeSpaces(state.bookSearch);
    if (state.bookShelfKind === "favorites") {
      const levelText = state.bookLevel ? `${bookLevelInfo(state.bookLevel)?.shortLabel} ` : "";
      return cleanQuery ? `${levelText}Favorites "${cleanQuery}"` : `${levelText}Favorites`;
    }
    if (state.bookShelfKind === "guided") {
      const levelText = state.bookLevel ? `${bookLevelInfo(state.bookLevel)?.shortLabel} · ` : "";
      const genreText = state.bookGenre ? `${genreLabel()} · ` : "";
      return cleanQuery
        ? `${levelText}${genreText}Guided "${cleanQuery}"`
        : `${levelText}${genreText}Guided levels`;
    }
    if (state.bookShelfKind === "official") {
      return cleanQuery
        ? `Official handbooks "${cleanQuery}"`
        : "Official handbooks";
    }
    const genreText = state.bookGenre ? `${genreLabel()} ` : "";
    const sourceText = "Fast public-domain library";
    return cleanQuery
      ? `${genreText}${sourceText} "${cleanQuery}"`
      : `${genreText}${sourceText} page ${state.bookPage}`;
  }

  function renderBookShelf() {
    if (!els.bookShelf) return;
    updateBookShelfControlState();
    if (isKnowledgeMode()) {
      if (state.bookViewMode === "shelf") {
        els.bookModeTitle.textContent = bookShelfTitle();
      }
      if (!state.bookBooks.length) {
        els.bookShelf.innerHTML = `<div class="book-empty">Finding fresh English knowledge…</div>`;
        return;
      }
      els.bookShelf.innerHTML = state.bookBooks.map((item, index) => {
        const category = item.categories?.[0] || activeKnowledgeTopic().label;
        return `
          <article class="book-card knowledge-card" data-book-index="${index}">
            <button class="book-open-btn" type="button" data-book-index="${index}">
              <span class="book-card-title">${escapeHtml(item.title)}</span>
              <span class="book-card-author">${escapeHtml(item.summary)}</span>
              <span class="book-card-badges">
                <span class="book-level-badge">${escapeHtml(category)}</span>
                <span class="book-source-badge">${escapeHtml(item.sourceLabel || "Wikipedia")}</span>
              </span>
            </button>
          </article>
        `;
      }).join("");
      return;
    }
    if (isNewsMode()) {
      if (state.bookViewMode === "shelf") {
        els.bookModeTitle.textContent = bookShelfTitle();
      }
      if (!state.bookBooks.length) {
        els.bookShelf.innerHTML = `<div class="book-empty">${state.newsSearch ? "No current articles match this filter." : "Refresh to load current news articles."}</div>`;
        scheduleShelfReaderPrefetch();
        return;
      }
      els.bookShelf.innerHTML = state.bookBooks.map((article, index) => {
        const date = formatNewsDate(article.publishedAt);
        return `
          <article class="book-card news-card" data-book-index="${index}">
            <button class="book-open-btn" type="button" data-book-index="${index}">
              <span class="book-card-title">${escapeHtml(article.title)}</span>
            </button>
            <span class="book-card-meta">${escapeHtml(date)}</span>
          </article>
        `;
      }).join("");
      scheduleShelfReaderPrefetch();
      return;
    }
    const cleanQuery = normalizeSpaces(state.bookSearch);
    if (state.bookViewMode === "shelf") {
      els.bookModeTitle.textContent = bookShelfTitle();
    }
    if (!state.bookBooks.length) {
      const emptyText = state.bookShelfKind === "favorites"
        ? (cleanQuery ? "No matching favorite books found." : "Favorite books will appear here.")
        : state.bookShelfKind === "guided"
          ? "No guided books match these filters. Try another level or genre."
          : state.bookShelfKind === "official"
            ? "No official handbooks match this search."
            : (cleanQuery ? "No matching books found." : "Load the public-domain library to begin.");
      els.bookShelf.innerHTML = `<div class="book-empty">${emptyText}</div>`;
      scheduleShelfReaderPrefetch();
      return;
    }

    els.bookShelf.innerHTML = state.bookBooks.map((book, index) => {
      const percent = bookProgressPercent(book);
      const progressLabel = percent ? `${percent}% read` : "Not started";
      const favorite = isBookFavorite(book);
      const level = bookLevelInfo(book);
      const difficulty = bookDifficultySummary(book);
      return `
        <article class="book-card" data-book-index="${index}">
          <button class="book-open-btn" type="button" data-book-index="${index}">
            <span class="book-card-title">${escapeHtml(book.title)}</span>
            <span class="book-card-author">${escapeHtml(book.author || "Unknown author")}</span>
            <span class="book-card-badges">
              ${level ? `<span class="book-level-badge" title="${escapeHtml(level.description)}">${escapeHtml(level.label)}</span>` : ""}
              <span class="book-source-badge">${escapeHtml(bookSourceLabel(book))}</span>
            </span>
            ${difficulty ? `<span class="book-card-meta">${escapeHtml(difficulty)}</span>` : ""}
          </button>
          <button class="book-favorite-btn${favorite ? " active" : ""}" type="button" data-book-index="${index}" aria-pressed="${favorite}" aria-label="${favorite ? "Remove favorite" : "Add favorite"}" title="${favorite ? "Remove favorite" : "Add favorite"}">${favorite ? "&#9733;" : "&#9734;"}</button>
          <span class="book-card-progress">
            <span class="book-progress-track"><span class="book-progress-fill" style="width:${percent}%"></span></span>
            <span class="book-card-meta">${progressLabel}</span>
          </span>
        </article>
      `;
    }).join("");
    scheduleShelfReaderPrefetch();
  }

  async function bookTextCandidates(book) {
    if (book?.source === "gutenberg" || book?.gutenbergId) {
      const gutenbergId = normalizeGutenbergId(book);
      if (!gutenbergId) return [];
      // GITenberg mirrors expose CORS headers, unlike Gutenberg itself. The
      // title-derived name is tried first because a missing GitHub file fails
      // quickly; the canonical Gutenberg URLs remain the fallback.
      const derivedGitenbergSlug = String(book?.title || "")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Za-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const gitenbergSlug = normalizeSpaces(book.gitenbergSlug || derivedGitenbergSlug);
      const gitenbergFile = book.gitenbergFile || `${gutenbergId}.txt`;
      return [...new Set([
        ...(book.guided && !book.gitenbergDisabled && gitenbergSlug
          ? [`direct:https://raw.githubusercontent.com/GITenberg/${gitenbergSlug}_${gutenbergId}/master/${gitenbergFile}`]
          : []),
        ...(Array.isArray(book.textUrls) ? book.textUrls : []),
        `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.txt`,
        `https://www.gutenberg.org/ebooks/${gutenbergId}.txt.utf-8`
      ])];
    }
    const root = normalizeStandardEbookLink(book?.link || "");
    return [
      `${root}/text/single-page`,
      `${root}/text`
    ];
  }

  function cleanBookText(raw) {
    return normalizeReaderText(raw)
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
      .filter((sentence) => (
        sentence.length >= 2
        && sentence.length <= 520
        && hasLinguisticContent(sentence)
        && !isBookNoise(sentence)
      ));
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

  function estimateEnglishSyllables(word) {
    const clean = String(word || "").toLowerCase().replace(/[^a-z]/g, "");
    if (!clean) return 0;
    if (clean.length <= 3) return 1;
    const trimmed = clean.replace(/(?:es|ed|e)$/i, "").replace(/^y/i, "");
    return Math.max(1, (trimmed.match(/[aeiouy]{1,2}/g) || []).length);
  }

  function measuredBookLevel(grade, wordCount) {
    if (grade <= 7 && wordCount <= 5000) return "starter";
    if (grade <= 7 && wordCount <= 45000) return "easy";
    if (grade <= 8 && wordCount <= 110000) return "steady";
    return "stretch";
  }

  function measureBookDifficulty(sentences) {
    let wordCount = 0;
    let syllableCount = 0;
    let sentenceCount = 0;
    for (const sentence of sentences || []) {
      const words = String(sentence?.text || "").match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) || [];
      if (!words.length) continue;
      sentenceCount += 1;
      wordCount += words.length;
      syllableCount += words.reduce((sum, word) => sum + estimateEnglishSyllables(word), 0);
    }
    if (!wordCount || !sentenceCount) return null;
    const averageSentenceWords = wordCount / sentenceCount;
    const estimatedGrade = 0.39 * averageSentenceWords + 11.8 * (syllableCount / wordCount) - 15.59;
    const safeGrade = Math.max(0, Math.min(18, estimatedGrade));
    return {
      level: measuredBookLevel(safeGrade, wordCount),
      wordCount,
      estimatedGrade: Number(safeGrade.toFixed(1)),
      averageSentenceWords: Number(averageSentenceWords.toFixed(1)),
      measuredAt: Date.now()
    };
  }

  function rememberMeasuredBookDifficulty(book, sentences) {
    if (!book?.id || book.kind === "news" || book.kind === "knowledge") return;
    if (bookLevelInfo(book) && book.wordCount && optionalBookNumber(book.estimatedGrade) !== null) return;
    const difficulty = measureBookDifficulty(sentences);
    if (!difficulty) return;
    Object.assign(book, difficulty);
    state.bookDifficulty[book.id] = difficulty;
    if (state.bookFavorites[book.id]) {
      Object.assign(state.bookFavorites[book.id], difficulty);
      saveBookFavoritesStore();
    }
    saveBookDifficultyStore();
  }

  function isNewsNoise(text) {
    const clean = normalizeSpaces(text);
    if (!clean || clean.length < 2) return true;
    const lower = clean.toLowerCase();
    return /^(share|subscribe|sign up|log in|read more|copy link|comments?|advertisement|follow us)$/i.test(clean)
      || lower.includes("javascript is disabled")
      || lower.includes("enable javascript")
      || lower.includes("cookie policy")
      || lower.includes("all rights reserved");
  }

  function splitNewsSentences(text) {
    const clean = cleanBookText(text);
    if (!clean || isNewsNoise(clean)) return [];
    let values = [];
    if (typeof Intl.Segmenter === "function") {
      try {
        const segmenter = new Intl.Segmenter(sourceLangCode(), { granularity: "sentence" });
        values = Array.from(segmenter.segment(clean), (part) => part.segment);
      } catch {
        values = [];
      }
    }
    if (!values.length) {
      values = clean.match(/[^.!?。！？؟]+(?:[.!?。！？؟]+["'”’»）\]]*|$)/gu) || [clean];
    }
    return values
      .map(cleanBookText)
      .filter((sentence) => (
        sentence.length >= 2
        && sentence.length <= 700
        && hasLinguisticContent(sentence)
        && !isNewsNoise(sentence)
      ));
  }

  function finalizeNewsParagraphs(paragraphs) {
    const sentences = [];
    let paragraphIndex = 0;
    paragraphs.forEach((paragraph) => {
      const paragraphSentences = splitNewsSentences(paragraph);
      paragraphSentences.forEach((sentence) => {
        sentences.push({ text: sentence, paragraphIndex, chapterIndex: 0 });
      });
      if (paragraphSentences.length) paragraphIndex += 1;
    });
    return finalizeBookParse(sentences, [{ title: "Article", start: 0 }]);
  }

  function parseNewsArticleHtml(raw) {
    const doc = new DOMParser().parseFromString(raw, "text/html");
    doc.querySelectorAll("script,style,noscript,nav,footer,header,aside,form,button,figure,figcaption,video,audio").forEach((node) => node.remove());
    const candidates = Array.from(doc.querySelectorAll('[data-testid*="article-body"], .article-body, .wsw, article, main'));
    const container = candidates
      .map((node) => ({ node, score: Array.from(node.querySelectorAll("p")).reduce((sum, paragraph) => sum + normalizeSpaces(paragraph.textContent).length, 0) }))
      .sort((left, right) => right.score - left.score)[0]?.node
      || doc.body;
    const seen = new Set();
    const paragraphs = Array.from(container?.querySelectorAll("p") || [])
      .map((node) => cleanBookText(node.textContent || ""))
      .filter((text) => {
        if (text.length < 20 || isNewsNoise(text) || seen.has(text)) return false;
        seen.add(text);
        return true;
      });
    return finalizeNewsParagraphs(paragraphs);
  }

  function parsePangeaPersianNewsArticleHtml(raw) {
    const doc = new DOMParser().parseFromString(raw, "text/html");
    const container = doc.querySelector("#article-content > .wsw, #article-content .wsw, #article-content");
    if (!container) return { sentences: [], chapters: [] };
    const seen = new Set();
    const paragraphs = Array.from(container.querySelectorAll("p"))
      .filter((node) => !node.closest(".wsw__embed, .media-pholder, figure, figcaption"))
      .map((node) => cleanBookText(node.textContent || ""))
      .filter((text) => {
        if (text.length < 20 || isNewsNoise(text) || seen.has(text)) return false;
        seen.add(text);
        return true;
      });
    return finalizeNewsParagraphs(paragraphs);
  }

  function parseNewsArticlePlain(raw) {
    let source = String(raw || "");
    const markdownStart = source.indexOf("Markdown Content:");
    if (markdownStart >= 0) {
      source = source.slice(markdownStart + "Markdown Content:".length);
    }
    const clean = source
      .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^[-*]\s+/gm, "")
      .replace(/^(Title|URL Source|Published Time|Markdown Content|Warning):.*$/gim, "")
      .replace(/\r/g, "");
    const seen = new Set();
    const paragraphs = clean.split(/\n\s*\n+|\n(?=\S)/)
      .map(cleanBookText)
      .filter((text) => {
        if (text.length < 20 || isNewsNoise(text) || seen.has(text)) return false;
        seen.add(text);
        return true;
      });
    return finalizeNewsParagraphs(paragraphs);
  }

  function isPangeaPersianArticle(article) {
    return state.language === "fa" && ["voa", "radiofarda"].includes(article?.feedSourceId);
  }

  function parseNewsArticleText(raw, article = null) {
    const looksHtml = /<html|<article|<main|<p[\s>]/i.test(raw);
    if (looksHtml && isPangeaPersianArticle(article)) {
      const parsed = parsePangeaPersianNewsArticleHtml(raw);
      if (parsed.sentences.length) return parsed;
    }
    return looksHtml ? parseNewsArticleHtml(raw) : parseNewsArticlePlain(raw);
  }

  function newsFeedSummaryDocument(article) {
    const fallbackText = [article?.title, article?.summary].filter(Boolean).join(". ");
    const parsed = finalizeNewsParagraphs([fallbackText]);
    return parsed.sentences.length
      ? { ...parsed, sourceUrl: article?.link || "", proxy: "feed summary" }
      : null;
  }

  async function fetchAndParseNewsArticle(article) {
    let lastError = null;
    try {
      const { text, proxy } = await fetchTextWithProxies(article.link, "news article", { cache: "default" });
      const parsed = parseNewsArticleText(text, article);
      if (!parsed.sentences.length) throw new Error("no readable article sentences");
      return { ...parsed, sourceUrl: article.link, proxy };
    } catch (error) {
      lastError = error;
    }
    const fallback = newsFeedSummaryDocument(article);
    if (fallback) return fallback;
    throw lastError || new Error("News article text failed");
  }

  async function fetchDirectReaderText(url, label) {
    const response = await withTimeout(
      fetch(url, { cache: "force-cache" }),
      10000,
      label
    );
    if (!response.ok) throw new Error(`${response.status}`);
    const text = await withTimeout(response.text(), 10000, `${label} body`);
    if (!normalizeSpaces(text)) throw new Error("empty response");
    return { text, proxy: "GITenberg CDN" };
  }

  function parseBundledBook(payload, book) {
    if (!payload || typeof payload !== "object") throw new Error("invalid bundled handbook data");
    const publication = payload.publication;
    if (!publication || typeof publication !== "object") {
      throw new Error("bundled handbook publication metadata is missing");
    }
    if (
      Number(payload.schemaVersion) !== USAF_HANDBOOK_SCHEMA_VERSION
      || Number(publication.sourcePageCount) !== USAF_HANDBOOK_SOURCE_PAGE_COUNT
      || normalizeSpaces(publication.sourcePdfSha256) !== USAF_HANDBOOK_SOURCE_SHA256
      || Number(publication.sectionCount) !== USAF_HANDBOOK_SECTION_COUNT
      || Number(publication.wordCount) !== USAF_HANDBOOK_WORD_COUNT
      || Number(publication.readerUnitCount) !== USAF_HANDBOOK_READER_UNIT_COUNT
      || Number(publication.dataVersion) !== book.dataVersion
      || normalizeSpaces(publication.id) !== book.id
      || normalizeSpaces(publication.editionDate) !== book.editionDate
      || normalizeSpaces(publication.sourceUrl) !== book.link
    ) throw new Error("bundled handbook metadata mismatch");
    if (!Array.isArray(payload.chapters) || payload.chapters.length !== USAF_HANDBOOK_SECTION_COUNT) {
      throw new Error("bundled handbook section count is invalid");
    }

    const sentences = [];
    const chapters = [];
    let paragraphIndex = 0;
    payload.chapters.forEach((rawChapter) => {
      if (!rawChapter || !Array.isArray(rawChapter.paragraphs)) {
        throw new Error("bundled handbook chapter is invalid");
      }
      const start = sentences.length;
      rawChapter.paragraphs.forEach((rawParagraph) => {
        if (!Array.isArray(rawParagraph)) {
          throw new Error("bundled handbook paragraph is not sentence-tokenized");
        }
        const paragraphStart = sentences.length;
        rawParagraph.forEach((rawSentence) => {
          if (typeof rawSentence !== "string") {
            throw new Error("bundled handbook sentence is invalid");
          }
          const sentence = normalizeReaderText(rawSentence);
          if (!sentence || sentence.length > 500) {
            throw new Error("bundled handbook sentence length is invalid");
          }
          sentences.push({
            text: sentence,
            paragraphIndex,
            chapterIndex: chapters.length
          });
        });
        if (sentences.length > paragraphStart) paragraphIndex += 1;
      });
      if (sentences.length > start) {
        chapters.push({
          title: cleanChapterTitle(rawChapter.title, `Chapter ${chapters.length + 1}`),
          start
        });
      } else throw new Error("bundled handbook chapter has no readable sentences");
    });
    if (
      chapters.length !== USAF_HANDBOOK_SECTION_COUNT
      || sentences.length !== USAF_HANDBOOK_READER_UNIT_COUNT
    ) throw new Error("bundled handbook content count mismatch");
    return finalizeBookParse(sentences, chapters);
  }

  async function fetchAndParseBundledBook(book) {
    const response = await withTimeout(
      fetch(book.dataUrl, { cache: "force-cache" }),
      BUNDLED_BOOK_FETCH_TIMEOUT_MS,
      "bundled USAF handbook"
    );
    if (!response.ok) throw new Error(`bundled USAF handbook ${response.status}`);
    const payload = await withTimeout(
      response.json(),
      BUNDLED_BOOK_FETCH_TIMEOUT_MS,
      "bundled USAF handbook body"
    );
    const parsed = parseBundledBook(payload, book);
    if (!parsed.sentences.length) throw new Error("bundled USAF handbook has no readable sentences");
    return {
      ...parsed,
      sourceUrl: book.link,
      proxy: "bundled official USAF handbook"
    };
  }

  async function fetchAndParseBookUncached(book) {
    if (book?.kind === "knowledge") {
      return knowledgeSummaryDocument(book);
    }
    if (book?.kind === "news") {
      return fetchAndParseNewsArticle(book);
    }
    if (book?.source === "usaf") {
      return fetchAndParseBundledBook(book);
    }
    let lastError = null;
    const candidates = await bookTextCandidates(book);
    for (const candidate of candidates) {
      try {
        const direct = String(candidate).startsWith("direct:");
        const candidateUrl = direct ? String(candidate).slice("direct:".length) : candidate;
        const { text, proxy } = direct
          ? await fetchDirectReaderText(candidateUrl, "GITenberg book text")
          : await fetchTextWithProxies(candidateUrl, "book text", { cache: "force-cache" });
        const parsed = parseBookText(text);
        if (!parsed.sentences.length) throw new Error("no readable sentences");
        return { ...parsed, sourceUrl: candidateUrl, proxy };
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("Book text failed");
  }

  function readerDocumentKey(book) {
    const identity = book?.id || book?.link || "";
    const kind = book?.kind === "news" ? "news" : book?.kind === "knowledge" ? "knowledge" : "book";
    return identity ? `${kind}:${identity}` : "";
  }

  function rememberReaderDocument(key, parsed) {
    if (!key || !parsed) return;
    state.readerDocumentCache.delete(key);
    state.readerDocumentCache.set(key, parsed);
    while (state.readerDocumentCache.size > READER_DOCUMENT_CACHE_LIMIT) {
      state.readerDocumentCache.delete(state.readerDocumentCache.keys().next().value);
    }
  }

  function persistentReaderDocumentUrl(key) {
    const token = `${bookHash(key)}-${String(key || "").length}`;
    return new URL(`./.reader-cache/${token}.json`, window.location.href).href;
  }

  async function readPersistentReaderDocument(key) {
    if (!key || !window.caches) return null;
    try {
      const cache = await window.caches.open(READER_DOCUMENT_CACHE_NAME);
      const response = await cache.match(persistentReaderDocumentUrl(key));
      if (!response) return null;
      const payload = await response.json();
      const maxAge = key.startsWith("news:")
        ? NEWS_DOCUMENT_CACHE_MAX_AGE_MS
        : key.startsWith("knowledge:")
          ? KNOWLEDGE_DOCUMENT_CACHE_MAX_AGE_MS
          : BOOK_DOCUMENT_CACHE_MAX_AGE_MS;
      if (payload?.key !== key || !payload?.parsed || Date.now() - Number(payload.savedAt || 0) > maxAge) {
        await cache.delete(persistentReaderDocumentUrl(key));
        return null;
      }
      return payload.parsed;
    } catch (error) {
      console.warn("Reader document cache read failed:", error);
      return null;
    }
  }

  async function writePersistentReaderDocument(key, parsed) {
    if (!key || !parsed || !window.caches || typeof window.Response !== "function") return;
    try {
      const cache = await window.caches.open(READER_DOCUMENT_CACHE_NAME);
      const response = new window.Response(JSON.stringify({ key, savedAt: Date.now(), parsed }), {
        headers: { "Content-Type": "application/json" }
      });
      await cache.put(persistentReaderDocumentUrl(key), response);
      const requests = await cache.keys();
      while (requests.length > READER_PERSISTENT_DOCUMENT_LIMIT) {
        await cache.delete(requests.shift());
      }
    } catch (error) {
      console.warn("Reader document cache write failed:", error);
    }
  }

  async function fetchAndParseBook(book) {
    const key = readerDocumentKey(book);
    const persistParsedDocument = book?.source !== "usaf";
    if (key && state.readerDocumentCache.has(key)) {
      const parsed = state.readerDocumentCache.get(key);
      state.readerDocumentCache.delete(key);
      state.readerDocumentCache.set(key, parsed);
      return parsed;
    }
    if (key && state.readerDocumentPromises.has(key)) {
      return state.readerDocumentPromises.get(key);
    }
    const promise = (async () => {
      // The bundled handbook JSON is already cached by the service worker after
      // its first load. Persisting its expanded sentence model would store a
      // second, substantially larger copy of the same document.
      const persisted = persistParsedDocument ? await readPersistentReaderDocument(key) : null;
      if (persisted) {
        rememberReaderDocument(key, persisted);
        return persisted;
      }
      const parsed = await fetchAndParseBookUncached(book);
      if (parsed) {
        rememberReaderDocument(key, parsed);
        if (persistParsedDocument) writePersistentReaderDocument(key, parsed);
      }
      return parsed;
    })()
      .finally(() => state.readerDocumentPromises.delete(key));
    if (key) state.readerDocumentPromises.set(key, promise);
    return promise;
  }

  function prefetchBookDocument(book) {
    if (!book?.link) return Promise.resolve();
    return fetchAndParseBook(book).catch((error) => {
      console.warn(`Reader prefetch failed for ${book.title || "item"}:`, error);
    });
  }

  function scheduleShelfReaderPrefetch() {
    window.clearTimeout(state.readerPrefetchTimer);
    const mode = state.contentMode;
    const books = (mode === "news" || state.bookShelfKind === "guided")
      ? state.bookBooks.slice(0, READER_SHELF_PREFETCH_LIMIT)
      : [];
    if (!books.length) return;
    state.readerPrefetchTimer = window.setTimeout(() => {
      if (state.contentMode !== mode || state.bookViewMode !== "shelf") return;
      (async () => {
        for (const book of books) {
          if (state.contentMode !== mode || state.bookViewMode !== "shelf") return;
          await prefetchBookDocument(book);
          await delayPlain(180);
        }
      })();
    }, 250);
  }

  function bookModeKickerText() {
    if (isKnowledgeMode()) return "Fresh English knowledge";
    if (isNewsMode()) return "Live text news";
    if (state.bookShelfKind === "guided") return "Curated public-domain levels";
    if (state.bookShelfKind === "official") return "Official source editions";
    if (state.bookShelfKind === "favorites") return "Saved books";
    return "Fast public-domain library";
  }

  function renderBookReaderShell() {
    const book = state.bookLoadedBook;
    if (!book) {
      els.bookReader.hidden = true;
      return;
    }
    els.bookReader.hidden = state.bookViewMode !== "reader";
    els.bookReaderTitle.textContent = book.title;
    const bookMeta = [
      book.author || "Unknown author",
      book.editionDate ? `${book.editionDate} edition` : "",
      bookLevelInfo(book)?.label || "",
      bookDifficultySummary(book)
    ].filter(Boolean).join(" · ");
    els.bookReaderMeta.textContent = book.kind === "knowledge"
      ? [book.sourceLabel || "Wikipedia", ...(book.categories || []).slice(0, 2)].filter(Boolean).join(" · ")
      : book.kind === "news"
        ? `${book.sourceLabel || book.author || "News"} · ${formatNewsDate(book.publishedAt)}`
        : bookMeta;
    els.bookSourceLink.href = book.link || STANDARD_EBOOKS_LIST_URL;
    els.bookSourceLink.textContent = book.kind === "knowledge"
      ? (book.sourceLabel || "Wikipedia")
      : book.kind === "news"
        ? "Original article"
        : book.source === "usaf"
          ? "Official USAF PDF"
          : bookSourceLabel(book);
    els.bookSourceLink.title = book.source === "usaf"
      ? "Official Air Force Handbook 1 source PDF"
      : "Open the original source";
    els.bookSourceNotice.hidden = book.source !== "usaf";
    els.bookChapterLabel.textContent = book.kind === "news" || book.kind === "knowledge" ? "Section" : "Chapter";
    const englishLabel = book.kind === "knowledge" ? "English knowledge" : book.kind === "news" ? "English translation" : "English original";
    els.bookEnglishLabel.textContent = `${englishLabel}${englishSpeechEnabled() ? "" : " · display only"}`;
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

  function scheduleReaderSentencePrefetch(startIndex = state.bookCurrentIndex + 1, count = 2) {
    window.clearTimeout(state.readerSentencePrefetchTimer);
    const language = state.language;
    const newsMode = isNewsMode() || state.bookLoadedBook?.kind === "news";
    const loadedKey = readerDocumentKey(state.bookLoadedBook);
    const sentences = Array.from({ length: count }, (value, offset) => (
      state.bookSentences[startIndex + offset]
    )).filter(Boolean);
    if (!sentences.length) return;
    state.readerSentencePrefetchTimer = window.setTimeout(() => {
      if (state.language !== language || readerDocumentKey(state.bookLoadedBook) !== loadedKey) return;
      sentences.forEach((sentence) => {
        readerSentencePair(sentence, language, newsMode)
          .then((pair) => {
            if (!pair.source || !pair.english) return null;
            const work = [ensureReaderAlignment(pair, language, newsMode).enrichmentPromise];
            enabledCompanionTracks().forEach((track) => {
              if (track.language !== "en" && track.language !== language) {
                work.push(readerTextForSpeechTrack(pair, track));
              }
            });
            return Promise.allSettled(work);
          })
          .catch((error) => console.warn("Sentence prefetch failed:", error));
      });
    }, 220);
  }

  async function renderBookSentence() {
    const sentence = currentBookSentence();
    const language = activeLanguage();
    const languageKey = state.language;
    const knowledgeMode = isKnowledgeMode() || state.bookLoadedBook?.kind === "knowledge";
    const newsMode = isNewsMode() || state.bookLoadedBook?.kind === "news";
    if (knowledgeMode) {
      const renderToken = state.bookRenderToken + 1;
      state.bookRenderToken = renderToken;
      els.bookSourceLabel.textContent = "English knowledge";
      els.bookSourceSentence.lang = "en";
      els.bookSourceSentence.dir = "ltr";
      els.bookEnglishLabel.textContent = "Source";
      els.bookEnglishSentence.textContent = state.bookLoadedBook?.sourceLabel || "Wikipedia";
      if (!sentence) {
        els.bookSourceSentence.textContent = "Select a knowledge card to begin.";
        clearBookSpeechTracks();
        updateBookProgressControls();
        renderBookNearby();
        return;
      }
      els.bookSourceSentence.textContent = sentence.text;
      updateBookProgressControls();
      renderBookNearby();
      await renderKnowledgeTranslation(sentence, renderToken);
      return;
    }
    els.bookSourceLabel.textContent = language.label;
    els.bookSourceSentence.lang = sourceLangCode();
    els.bookSourceSentence.dir = language.dir;
    if (!sentence) {
      els.bookSourceSentence.textContent = isNewsMode() ? "Select a news article to begin." : "Select a book to begin.";
      els.bookEnglishSentence.textContent = isNewsMode() ? "The English translation will appear here." : "The English original will appear here.";
      clearBookSpeechTracks();
      updateBookProgressControls();
      renderBookNearby();
      return;
    }

    const renderToken = state.bookRenderToken + 1;
    state.bookRenderToken = renderToken;
    if (isNewsMode() || state.bookLoadedBook?.kind === "news") {
      els.bookSourceSentence.textContent = sentence.text;
      els.bookEnglishSentence.textContent = "Translating...";
    } else {
      els.bookEnglishSentence.textContent = sentence.text;
      els.bookSourceSentence.textContent = "Translating...";
    }
    updateBookProgressControls();
    renderBookNearby();

    const pair = await readerSentencePair(sentence, languageKey, newsMode);
    if (renderToken !== state.bookRenderToken) return;
    const translationMissing = !pair.source || !pair.english;
    els.bookSourceSentence.textContent = pair.source || `${language.label} translation unavailable. Select this sentence to retry.`;
    els.bookEnglishSentence.textContent = pair.english || "English translation unavailable. Select this sentence to retry.";
    if (translationMissing) {
      clearBookSpeechTracks();
      setStatus("Translation unavailable. Check your connection and select the sentence to retry.");
      scheduleReaderSentencePrefetch();
      return;
    }
    ensureReaderAlignment(pair, languageKey, newsMode);
    await renderBookSpeechTracks(pair, renderToken);
    scheduleReaderSentencePrefetch();
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
    if (!book?.link) throw new Error(isKnowledgeMode() ? "Missing knowledge source link" : isNewsMode() ? "Missing article link" : "Missing book link");
    if (!options.preservePlayback) stopSpeech();
    state.bookLoadedBook = book;
    state.bookSentences = [];
    state.bookChapters = [];
    state.bookCurrentIndex = 0;
    renderBookReaderShell();
    els.bookSourceSentence.textContent = book.kind === "knowledge"
      ? "Loading knowledge..."
      : book.kind === "news"
        ? "Loading current article..."
        : "Loading book text...";
    els.bookEnglishSentence.textContent = book.title;
    setStatus(`Loading ${book.title}`);

    let parsed = null;
    let pendingFullDocument = null;
    if (book.kind === "knowledge") {
      parsed = knowledgeSummaryDocument(book);
    } else if (book.kind === "news") {
      const preview = newsFeedSummaryDocument(book);
      const fullDocumentPromise = fetchAndParseBook(book);
      if (preview) {
        const quickResult = await Promise.race([
          fullDocumentPromise.then((document) => ({ document, pending: null })),
          delayPlain(NEWS_ARTICLE_QUICK_WAIT_MS).then(() => ({ document: preview, pending: fullDocumentPromise }))
        ]);
        parsed = quickResult.document;
        pendingFullDocument = quickResult.pending;
      } else {
        parsed = await fullDocumentPromise;
      }
    } else {
      parsed = await fetchAndParseBook(book);
    }
    state.bookSentences = parsed.sentences;
    state.bookChapters = parsed.chapters;
    rememberMeasuredBookDifficulty(book, parsed.sentences);
    showBookReader();
    renderBookReaderShell();

    const saved = getBookProgress(book);
    const index = options.random
      ? randomBookSentenceIndex()
      : clamp(options.index ?? saved?.index ?? 0, 0, state.bookSentences.length - 1);
    setBookIndex(index, { save: true });
    setStatus(pendingFullDocument
      ? `Opened ${book.title} from the feed · loading full article`
      : `Loaded ${book.title} (${state.bookSentences.length.toLocaleString()} sentences via ${parsed.proxy})`);
    if (pendingFullDocument) {
      const loadedKey = readerDocumentKey(book);
      pendingFullDocument.then((fullDocument) => {
        if (
          readerDocumentKey(state.bookLoadedBook) !== loadedKey
          || state.bookPlaying
          || !fullDocument?.sentences?.length
          || fullDocument.proxy === "feed summary"
        ) return;
        const currentIndex = clamp(state.bookCurrentIndex, 0, fullDocument.sentences.length - 1);
        state.bookSentences = fullDocument.sentences;
        state.bookChapters = fullDocument.chapters;
        renderBookReaderShell();
        setBookIndex(currentIndex, { save: true });
        setStatus(`Full article ready (${fullDocument.sentences.length.toLocaleString()} sentences via ${fullDocument.proxy})`);
      }).catch((error) => console.warn("Full article background load failed:", error));
    }
  }

  async function loadRandomNewsArticle() {
    stopSpeech();
    if (!state.bookBooks.length) {
      await loadNewsFeed();
    }
    const article = state.bookBooks[Math.floor(Math.random() * state.bookBooks.length)];
    if (!article) throw new Error("No current news articles found");
    await loadBook(article, { random: true });
    setStatus(`Random current article from ${article.sourceLabel || article.author || "news"}`);
  }

  async function loadRandomBookParagraph() {
    stopSpeech();
    if (state.bookShelfKind !== "library") {
      await loadBookCatalogPage(state.bookPage);
      const book = state.bookBooks[Math.floor(Math.random() * state.bookBooks.length)];
      if (!book) throw new Error(state.bookShelfKind === "favorites" ? "No favorite books found" : "No books match these filters");
      await loadBook(book, { random: true });
      const shelfLabel = state.bookShelfKind === "guided"
        ? "guided"
        : state.bookShelfKind === "official"
          ? "official handbook"
          : "favorite";
      setStatus(`Random ${shelfLabel} paragraph from ${book.title}`);
      return;
    }

    state.bookSearch = "";
    els.bookSearchInput.value = "";
    const page = Math.floor(Math.random() * STANDARD_EBOOKS_RANDOM_PAGE_MAX) + 1;
    await loadBookCatalogPage(page);
    const book = state.bookBooks[Math.floor(Math.random() * state.bookBooks.length)];
    if (!book) throw new Error("No random book found");
    await loadBook(book, { random: true });
    setStatus(`Random paragraph from ${book.title}`);
  }

  function setBookAudioPanel(open) {
    state.bookAudioSettingsOpen = Boolean(open);
    els.bookAudioPanel.hidden = !state.bookAudioSettingsOpen;
    els.bookAudioSettingsToggle.setAttribute("aria-expanded", String(state.bookAudioSettingsOpen));
  }

  function showBookShelf() {
    state.bookViewMode = "shelf";
    state.bookRenderToken += 1;
    els.bookModeKicker.textContent = bookModeKickerText();
    els.bookModeTitle.textContent = bookShelfTitle();
    els.bookShelfControls.hidden = isNewsMode() || isKnowledgeMode();
    els.newsShelfControls.hidden = !isNewsMode();
    els.knowledgeShelfControls.hidden = !isKnowledgeMode();
    els.bookShelf.hidden = false;
    els.bookReader.hidden = true;
    els.bookShelfBtn.hidden = true;
    els.bookPrevSentenceBtn.hidden = true;
    els.bookPlayBtn.hidden = true;
    els.bookNextSentenceBtn.hidden = true;
    els.bookAudioSettingsToggle.hidden = true;
    setBookAudioPanel(false);
    renderBookShelf();
  }

  function showBookReader() {
    state.bookViewMode = "reader";
    els.bookModeKicker.textContent = bookModeKickerText();
    els.bookModeTitle.textContent = isNewsMode() ? "Current article" : "Current book";
    els.bookShelfControls.hidden = true;
    els.newsShelfControls.hidden = true;
    els.knowledgeShelfControls.hidden = true;
    els.bookShelf.hidden = true;
    els.bookReader.hidden = false;
    els.bookShelfBtn.hidden = false;
    els.bookPrevSentenceBtn.hidden = false;
    els.bookPlayBtn.hidden = false;
    els.bookNextSentenceBtn.hidden = false;
    els.bookAudioSettingsToggle.hidden = false;
  }

  function setBookMode(enabled, contentMode = state.contentMode) {
    const requestedKnowledge = contentMode === "knowledge";
    if (enabled && !requestedKnowledge && !readerEnabled()) {
      setStatus("Choose a study language to use books or news");
      return;
    }
    const nextMode = contentMode === "news" ? "news" : requestedKnowledge ? "knowledge" : "books";
    const modeChanged = nextMode !== state.contentMode;
    state.contentMode = nextMode;
    state.bookMode = Boolean(enabled);
    if (modeChanged) {
      state.bookBooks = [];
      state.bookLoadedBook = null;
      state.bookSentences = [];
      state.bookChapters = [];
      state.bookCurrentIndex = 0;
      state.newsAllArticles = [];
      state.bookRenderToken += 1;
    }
    els.bookView.hidden = !state.bookMode;
    document.body.classList.toggle("book-mode", state.bookMode);
    document.body.classList.toggle("knowledge-reader", state.bookMode && isKnowledgeMode());
    els.bookToggle.setAttribute("aria-pressed", String(state.bookMode && !isNewsMode() && !isKnowledgeMode()));
    els.newsToggle.setAttribute("aria-pressed", String(state.bookMode && isNewsMode()));
    els.knowledgeToggle.setAttribute("aria-pressed", String(state.bookMode && isKnowledgeMode()));
    if (state.bookMode) {
      els.bookLanguageSelect.value = state.language;
      els.newsLanguageSelect.value = state.language;
      els.knowledgeTopicSelect.value = state.knowledgeTopic;
      els.knowledgeTranslationSelect.value = state.knowledgeTranslation;
      els.knowledgePeopleFilter.hidden = !activeKnowledgeTopic().onThisDay;
      els.knowledgeIncludeBirthDeaths.checked = state.knowledgeIncludeBirthDeaths;
      populateNewsSourceSelect();
      syncBookAudioControlsFromSettings();
      updateSettingLabels();
      showBookShelf();
      const loadShelf = isKnowledgeMode()
        ? loadKnowledgeFeed()
        : isNewsMode()
          ? loadNewsFeed()
          : ensureBookShelfLoaded();
      loadShelf.catch((error) => {
        setStatus(error.message || (isKnowledgeMode() ? "Knowledge feed failed" : isNewsMode() ? "News feed failed" : "Book shelf failed"));
        console.error(error);
        renderBookShelf();
      });
    } else {
      stopSpeech();
      setBookAudioPanel(false);
    }
  }

  async function speakBookSentence(sentence, token) {
    if (!sentence || token !== state.playToken) return;
    if (isKnowledgeMode() || state.bookLoadedBook?.kind === "knowledge") {
      setStatus(`Knowledge · English · sentence ${state.bookCurrentIndex + 1}`);
      await speakTextWithWordPacing(
        sentence.text,
        "en-US",
        Number(els.bookEnRate.value),
        token,
        {
          engine: speechTrackConfig(1).engine,
          highlightTargets: [{ id: "bookSourceSentence", text: sentence.text }]
        }
      );
      if (token !== state.playToken || !state.bookPlaying) return;
      const translationLanguage = state.knowledgeTranslation;
      if (!LANGUAGES[translationLanguage] || translationLanguage === "en") return;
      const translation = await ensureBookSourceSentence(sentence.text, translationLanguage);
      if (token !== state.playToken || !state.bookPlaying || !translation) return;
      const translationTrack = state.speechTrack2Language === translationLanguage
        ? speechTrackConfig(2)
        : { engine: "system" };
      setStatus(`Knowledge · ${languageTrackLabel(translationLanguage)} · sentence ${state.bookCurrentIndex + 1}`);
      await speakTextWithWordPacing(
        translation,
        speechLanguageForKey(translationLanguage),
        Number(els.bookSourceRate.value),
        token,
        {
          engine: translationTrack.engine,
          highlightTargets: [{ id: "bookSpeechTrack2Sentence", text: translation }]
        }
      );
      return;
    }
    const language = activeLanguage();
    const languageKey = state.language;
    const newsMode = isNewsMode() || state.bookLoadedBook?.kind === "news";
    const pair = await readerSentencePair(sentence, languageKey, newsMode);
    if (token !== state.playToken || !state.bookPlaying) return;
    if (!pair.source || !pair.english) {
      throw new Error("Translation unavailable. Check your connection and press Play to retry.");
    }

    els.bookSourceSentence.textContent = pair.source;
    els.bookEnglishSentence.textContent = pair.english;
    await renderBookSpeechTracks(pair, state.bookRenderToken);
    const alignment = ensureReaderAlignment(pair, languageKey, newsMode);
    await Promise.race([alignment.enrichmentPromise, delayPlain(700)]);
    if (token !== state.playToken || !state.bookPlaying) return;

    for (const track of configuredSpeechTracks()) {
      if (track.language === "en" && !els.bookReadEnglish.checked) continue;
      const text = await readerTextForSpeechTrack(pair, track);
      if (token !== state.playToken || !state.bookPlaying) return;
      if (!text) {
        setStatus(`${languageTrackLabel(track.language)} translation unavailable; skipping track ${track.slot}`);
        continue;
      }
      const isPrimary = track.language === languageKey;
      const isEnglish = track.language === "en";
      const options = {
        engine: track.engine,
        highlightTargets: isPrimary || isEnglish
          ? null
          : [{ id: `bookSpeechTrack${track.slot}Sentence`, text }]
      };
      if (isPrimary || isEnglish) {
        options.alignment = alignment;
        options.speakingPane = isPrimary ? "source" : "english";
      }
      setStatus(`${languageTrackLabel(track.language)} · track ${track.slot} · sentence ${state.bookCurrentIndex + 1}`);
      await speakTextWithWordPacing(
        text,
        speechLanguageForKey(track.language),
        Number(isEnglish ? els.bookEnRate.value : els.bookSourceRate.value),
        token,
        options
      );
      await delay(Number(els.gapMs.value), token);
      if (token !== state.playToken || !state.bookPlaying) return;
    }
  }

  async function startBookPlayback() {
    if (state.bookPlaying) return;
    if (state.piperStorageBusy) {
      setStatus("Wait for Piper storage cleanup to finish");
      return;
    }
    if (!state.bookSentences.length) {
      setStatus(isKnowledgeMode() ? "Load a knowledge card first" : isNewsMode() ? "Load a news article first" : "Load a book first");
      return;
    }
    state.bookPlaying = true;
    const token = state.playToken + 1;
    state.playToken = token;
    els.bookPlayBtn.textContent = "Stop";
    let failed = false;

    try {
      await prepareSpeechEngine();
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
        if (nextIndex < 0 || nextIndex >= state.bookSentences.length) {
          if (
            (isKnowledgeMode() || state.bookLoadedBook?.kind === "knowledge")
            && (state.bookPlayDirection || 1) > 0
          ) {
            await loadNextKnowledgeArticle({ preservePlayback: true });
            if (token !== state.playToken || !state.bookPlaying) break;
            continue;
          }
          break;
        }
        setBookIndex(nextIndex, { render: false, save: true });
      }
    } catch (error) {
      failed = true;
      setStatus(playbackErrorMessage(error, isKnowledgeMode() ? "Knowledge playback failed" : isNewsMode() ? "News playback failed" : "Book playback failed"));
      console.error(error);
    } finally {
      if (token === state.playToken) {
        state.bookPlaying = false;
        els.bookPlayBtn.textContent = "Play";
        clearSpeechHighlights();
        clearCorrespondingHighlights();
        saveCurrentBookProgress();
        if (!failed) {
          setStatus("Ready");
        }
      }
    }
  }

  function stopSpeech() {
    state.playToken += 1;
    state.playing = false;
    state.bookPlaying = false;
    els.playBtn.textContent = "Play";
    els.bookPlayBtn.textContent = "Play";
    clearSpeechHighlights();
    clearCorrespondingHighlights();
    stopPiperAudio();
    clearStudyMusicDucks();
    terminateAllPiperWorkers(new Error("Piper stopped"));
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
      } catch (error) {
        console.warn("Speech stop failed:", error);
      }
    }
  }

  async function speakEntry(entry, token) {
    if (!entry || token !== state.playToken) return;
    const language = activeLanguage();
    const source = entry.display || entry.word;
    const meaningPromise = ensureMeaning(entry);

    const entryStatus = language.mode === "vernacular"
      ? `${entry.rarity || "Vernacular"} · ${entry.tier || entry.rank}`
      : `#${entry.rank} ${language.label}`;
    const primaryTrack = speechTrackConfig(1);
    setStatus(entryStatus);
    await speakText(source, language.speechLang, Number(els.ruRate.value), token, {
      engine: primaryTrack.engine,
      highlightTargets: [{ id: "ruWord", text: source }]
    });
    await delay(Number(els.gapMs.value), token);
    const en = await meaningPromise;
    if (token !== state.playToken) return;

    const englishSpeech = makeSpokenEnglish(en, entry);
    if (language.mode === "vernacular" && els.bookReadEnglish.checked && englishSpeech) {
      setStatus(language.mode === "vernacular" ? "Definition" : `#${entry.rank} English`);
      await speakText(englishSpeech, "en-US", Number(els.enRate.value), token, {
        engine: primaryTrack.engine,
        highlightTargets: [{ id: "enWord", text: en }]
      });
      await delay(Number(els.gapMs.value), token);
    }

    for (const track of enabledCompanionTracks()) {
      if (track.language === "en" && !els.bookReadEnglish.checked) continue;
      const trackText = track.language === "en"
        ? englishSpeech
        : await ensureBookSourceSentence(en, track.language);
      if (token !== state.playToken) return;
      if (!trackText) {
        setStatus(`${languageTrackLabel(track.language)} translation unavailable; skipping track ${track.slot}`);
        continue;
      }
      setStatus(`#${entry.rank} ${languageTrackLabel(track.language)} · track ${track.slot}`);
      await speakText(
        trackText,
        speechLanguageForKey(track.language),
        Number(track.language === "en" ? els.enRate.value : els.ruRate.value),
        token,
        {
          engine: track.engine,
          highlightTargets: [{
            id: track.language === "en" ? "enWord" : `focusSpeechTrack${track.slot}Text`,
            text: track.language === "en" ? en : trackText
          }]
        }
      );
      await delay(Number(els.gapMs.value), token);
    }
  }

  async function speakText(text, lang, rate, token, options = {}) {
    if (token !== state.playToken || !text || options.engine === "off") return;
    const piperVoiceId = piperVoiceIdForLang(lang);
    if (shouldUsePiperForRequest(text, lang, options)) {
      try {
        await speakWithPiper(text, lang, rate, token, options);
        recordPiperSuccess(piperVoiceId);
        return;
      } catch (error) {
        if (token !== state.playToken) return;
        recordPiperFailure(error, piperVoiceId);
        console.warn("Piper failed, using the system voice:", error);
        setStatus(piperCircuitOpen(piperVoiceId)
          ? "Piper paused after an error; using system voice"
          : "Piper unavailable, using system voice");
      }
    }
    await speakWithSystemVoice(text, lang, rate, token, options);
  }

  function readerSystemRateFromWpm(wordsPerMinute) {
    const wpm = clamp(wordsPerMinute, 10, 200);
    // Keep each sentence continuous and approximate the WPM control with the
    // voice's native rate. This natural range avoids the long artificial gaps
    // created by splitting a sentence into several short utterances.
    if (wpm <= 120) return 0.55 + (((wpm - 10) / 110) * 0.45);
    return 1 + (((wpm - 120) / 80) * 0.45);
  }

  async function speakTextWithWordPacing(text, lang, wordsPerMinute, token, options = {}) {
    const spokenText = stripForSpeech(text);
    const ranges = wordRanges(spokenText, lang);
    if (token !== state.playToken || !ranges.length) return;

    // Both engines receive one complete sentence so prosody stays continuous.
    // Piper inference per word is especially costly and creates audible gaps.
    await speakText(spokenText, lang, readerSystemRateFromWpm(wordsPerMinute), token, options);
  }

  async function prepareSpeechEngine(options = {}) {
    const requestedTracks = options.engine
      ? [{
        language: Object.keys(LANGUAGES).find(
          (key) => langPrefix(speechLanguageForKey(key)) === langPrefix(options.lang)
        ) || state.language,
        engine: options.engine
      }]
      : configuredSpeechTracks().filter((track) => (
        track.slot === 1 || track.language !== "en" || els.bookReadEnglish.checked
      ));
    const piperVoiceIds = requestedTracks
      .filter((track) => track.engine === "piper")
      .map((track) => piperVoiceIdForLang(speechLanguageForKey(track.language)))
      .filter((voiceId) => voiceId && !piperCircuitOpen(voiceId));
    const systemRequested = requestedTracks.some((track) => track.engine !== "piper");
    let piperReady = false;
    if (piperVoiceIds.length && piperRuntimeAvailable()) {
      try {
        // This call reaches audio.play() before its first await, preserving the
        // user gesture required by iPhone browser and Home Screen playback.
        // The same unlocked player serves both Piper workers sequentially.
        await ensurePiperAudioUnlocked();
        piperReady = true;
      } catch (error) {
        piperVoiceIds.forEach((voiceId) => recordPiperFailure(error, voiceId));
        stopPiperAudio();
        console.warn("Piper audio unlock failed; using the system voice:", error);
        setStatus("Piper audio was blocked; using system voice");
      }
    }
    if (piperReady && !systemRequested) return;
    try {
      await prepareSystemSpeechEngine();
    } catch (error) {
      if (!piperReady) throw error;
      console.warn("System speech preparation failed; Piper tracks remain available:", error);
    }
  }

  async function prepareSystemSpeechEngine() {
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") {
      throw new Error("Speech synthesis unavailable");
    }
    // Safari can return an empty list initially and populate it asynchronously.
    // Wait for voiceschanged or the polling window before the first utterance.
    await refreshVoices();
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
    } catch (error) {
      console.warn("Speech preparation failed:", error);
    }
    await delayPlain(40);
  }

  function playbackErrorMessage(error, fallback) {
    const message = String(error?.message || "");
    if (/not-allowed/i.test(message)) {
      return "Speech blocked; tap Play again";
    }
    if (/speech did not start/i.test(message)) {
      return "Speech stalled; tap Play again";
    }
    return message || fallback;
  }

  async function speakWithSystemVoice(text, lang, rate, token, options = {}) {
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") {
      throw new Error("Speech synthesis unavailable");
    }
    await refreshVoices();
    const spokenText = stripForSpeech(text);
    if (!spokenText || token !== state.playToken) return;

    let lastError = null;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        await speakWithSystemVoiceOnce(spokenText, lang, rate, token, options);
        return;
      } catch (error) {
        if (token !== state.playToken) return;
        lastError = error;
        console.warn(`Speech attempt ${attempt + 1} failed:`, error);
        try {
          window.speechSynthesis.cancel();
          window.speechSynthesis.resume();
        } catch {
          // Keep the original speech error.
        }
        await delayPlain(120);
      }
    }
    throw lastError || new Error("Speech synthesis error");
  }

  async function speakWithSystemVoiceOnce(spokenText, lang, rate, token, options = {}) {
    return new Promise((resolve, reject) => {
      if (token !== state.playToken) {
        resolve();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.rate = rate;
      utterance.volume = effectiveSpeechVolume(lang);
      const speechLang = systemSpeechLang(lang) || lang;
      const voice = findVoice(speechLang);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || speechLang;
      } else if (shouldSetSystemLanguage(speechLang)) {
        utterance.lang = speechLang;
      }
      const timeout = window.setTimeout(() => {
        releaseStudyMusicDuck(utterance);
        reject(new Error("Speech did not start"));
      }, 5000);
      const applyHighlight = (charIndex) => {
        if (options.alignment) {
          applyReaderWordHighlight(
            options.alignment,
            options.speakingPane,
            charIndex,
            spokenText,
            Number.isInteger(options.readerWordIndex) ? options.readerWordIndex : null
          );
          return;
        }
        applySpeechHighlight(options.highlightTargets, options.highlightText || spokenText, charIndex);
      };
      const clearHighlight = () => {
        if (options.alignment) {
          clearSpeechHighlights();
          return;
        }
        clearSpeechHighlights(options.highlightTargets);
      };
      utterance.onstart = () => {
        window.clearTimeout(timeout);
        if (token !== state.playToken) {
          releaseStudyMusicDuck(utterance);
          resolve();
          return;
        }
        acquireStudyMusicDuck(utterance);
        applyHighlight(0);
        if (!options.alignment) applyCorrespondingHighlight(options.correspondingTargets);
      };
      utterance.onboundary = (event) => {
        if (event.name && event.name !== "word") return;
        applyHighlight(event.charIndex || 0);
      };
      utterance.onend = () => {
        window.clearTimeout(timeout);
        releaseStudyMusicDuck(utterance);
        clearHighlight();
        clearCorrespondingHighlights();
        resolve();
      };
      utterance.onerror = (event) => {
        window.clearTimeout(timeout);
        releaseStudyMusicDuck(utterance);
        clearHighlight();
        clearCorrespondingHighlights();
        reject(new Error(event.error || "Speech synthesis error"));
      };
      window.speechSynthesis.speak(utterance);
    });
  }

  async function speakWithPiper(text, lang, rate, token, options = {}) {
    const clip = await getPiperClip(text, lang);
    if (token !== state.playToken || !clip) return;
    await playPiperClip(clip, lang, rate, token, options);
  }

  function piperEngineRequested(options = {}) {
    if (options.engine === "system" || options.engine === "off") return false;
    if (options.engine === "piper") return true;
    // Keep the existing global-engine contract until each caller has its own
    // track setting. New callers can opt any supported language into Piper by
    // passing { engine: "piper" }.
    return options.piperSource === true && isPiperEnabled();
  }

  function piperWorkerCapacityAvailable(voiceId) {
    return Boolean(
      voiceId
      && (state.piperWorkers.has(voiceId) || state.piperWorkers.size < PIPER_MAX_LIVE_WORKERS)
    );
  }

  function shouldUsePiperForRequest(text, lang, options) {
    const clean = stripForSpeech(text);
    const voiceId = piperVoiceIdForLang(lang);
    return Boolean(
      piperEngineRequested(options)
      && piperRuntimeAvailable()
      && !piperCircuitOpen(voiceId)
      && clean
      && clean.length <= PIPER_MAX_TEXT_CHARS
      && voiceId
      && (
        state.piperAudioCache.has(`${voiceId}:${clean}`)
        || piperWorkerCapacityAvailable(voiceId)
      )
    );
  }

  function piperVoiceIdForLang(lang) {
    const lower = String(lang || "").toLowerCase();
    if (lower.startsWith("ru")) return PIPER_RU_VOICE_ID;
    if (lower.startsWith("fa")) return PIPER_FA_VOICE_ID;
    if (lower.startsWith("es")) return PIPER_ES_VOICE_ID;
    if (lower.startsWith("fr")) return PIPER_FR_VOICE_ID;
    if (lower.startsWith("en")) return PIPER_EN_VOICE_ID;
    return "";
  }

  function piperFailureKey(langOrVoice = activeLanguage().speechLang) {
    return piperVoiceIdForLang(langOrVoice) || String(langOrVoice || "");
  }

  function piperCircuitOpen(langOrVoice = activeLanguage().speechLang) {
    const key = piperFailureKey(langOrVoice);
    const failure = key ? state.piperFailures.get(key) : null;
    if (!failure) return false;
    if (Date.now() < failure.openUntil) return true;
    state.piperFailures.delete(key);
    return false;
  }

  function recordPiperSuccess(langOrVoice = activeLanguage().speechLang) {
    const key = piperFailureKey(langOrVoice);
    if (key) state.piperFailures.delete(key);
  }

  function recordPiperFailure(error, langOrVoice = activeLanguage().speechLang) {
    // Capacity is an expected bounded-resource fallback, not a broken voice.
    if (error?.code === "PIPER_WORKER_LIMIT") return;
    const key = piperFailureKey(langOrVoice);
    if (!key) return;
    const failure = state.piperFailures.get(key) || { count: 0, openUntil: 0 };
    failure.count += 1;
    if (failure.count >= PIPER_FAILURE_LIMIT) {
      failure.openUntil = Date.now() + PIPER_FAILURE_COOLDOWN_MS;
    }
    state.piperFailures.set(key, failure);
    terminatePiperWorker(key, error instanceof Error ? error : new Error("Piper failed"));
  }

  function ensurePiperAudioUnlocked() {
    if (state.piperAudio && state.piperAudioUnlocked) return Promise.resolve(state.piperAudio);
    const audio = state.piperAudio || new Audio();
    state.piperAudio = audio;
    audio.preload = "auto";
    audio.playsInline = true;
    audio.setAttribute?.("playsinline", "");
    audio.setAttribute?.("webkit-playsinline", "");
    audio.volume = 0;
    audio.src = PIPER_SILENCE_DATA_URL;

    let playPromise;
    try {
      // Keep this synchronous with the Play click. Awaiting model work before
      // blessing an Audio element causes iOS to reject the eventual playback.
      playPromise = audio.play();
    } catch (error) {
      return Promise.reject(error);
    }
    return Promise.resolve(playPromise).then(() => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audio.volume = pageVolume();
      state.piperAudioUnlocked = true;
      return audio;
    });
  }

  function piperVoiceLabel(voiceId) {
    const key = piperLanguageKey(voiceId);
    const labels = { ru: "Russian", fa: "Farsi", es: "Spanish", fr: "French", en: "English" };
    return labels[key] || "Piper";
  }

  function handlePiperWorkerMessage(event, context) {
    if (state.piperWorkers.get(context.voiceId) !== context) return;
    const message = event.data || {};
    const request = context.requests.get(Number(message.id));
    if (!request) return;
    if (message.type === "progress") {
      const loaded = Math.max(0, Number(message.loaded) || 0);
      const total = Math.max(0, Number(message.total) || 0);
      if (total > 0) {
        setStatus(`Downloading ${piperVoiceLabel(context.voiceId)} Piper voice · ${Math.min(100, Math.round((loaded / total) * 100))}%`);
      } else if (loaded > 0) {
        setStatus(`Downloading ${piperVoiceLabel(context.voiceId)} Piper voice · ${(loaded / (1024 * 1024)).toFixed(1)} MB`);
      }
      return;
    }
    window.clearTimeout(request.timer);
    context.requests.delete(Number(message.id));
    if (!context.requests.size) schedulePiperWorkerIdle(context.voiceId);
    if (message.type === "result") {
      if (!(message.blob instanceof Blob) || !message.blob.size) {
        request.reject(new Error("Piper returned no audio"));
        return;
      }
      context.ready = true;
      request.resolve(message.blob);
      return;
    }
    if (message.type === "cleared") {
      request.resolve(true);
      return;
    }
    request.reject(new Error(message.message || "Piper worker failed"));
  }

  function terminatePiperWorker(voiceId, reason = new Error("Piper worker closed")) {
    const context = state.piperWorkers.get(voiceId);
    if (!context) return;
    state.piperWorkers.delete(voiceId);
    window.clearTimeout(context.idleTimer);
    context.idleTimer = 0;
    context.worker.terminate();
    context.requests.forEach((request) => {
      window.clearTimeout(request.timer);
      request.reject(reason);
    });
    context.requests.clear();
  }

  function terminateAllPiperWorkers(reason = new Error("Piper workers closed")) {
    Array.from(state.piperWorkers.keys()).forEach((voiceId) => {
      terminatePiperWorker(voiceId, reason);
    });
  }

  function ensurePiperWorker(voiceId) {
    const existing = state.piperWorkers.get(voiceId);
    if (existing) {
      window.clearTimeout(existing.idleTimer);
      existing.idleTimer = 0;
      return existing;
    }
    if (state.piperWorkers.size >= PIPER_MAX_LIVE_WORKERS) {
      const error = new Error("Piper is already using the maximum of two voice workers");
      error.code = "PIPER_WORKER_LIMIT";
      throw error;
    }
    const worker = new Worker(PIPER_WORKER_URL, {
      type: "module",
      name: `wordfreak-piper-${piperLanguageKey(voiceId) || "voice"}`
    });
    const context = {
      voiceId,
      worker,
      ready: false,
      requests: new Map(),
      idleTimer: 0
    };
    state.piperWorkers.set(voiceId, context);
    worker.addEventListener("message", (event) => handlePiperWorkerMessage(event, context));
    worker.addEventListener("error", (event) => {
      if (state.piperWorkers.get(voiceId) !== context) return;
      event.preventDefault();
      terminatePiperWorker(voiceId, new Error(event.message || "Piper worker failed"));
    });
    worker.addEventListener("messageerror", () => {
      if (state.piperWorkers.get(voiceId) === context) {
        terminatePiperWorker(voiceId, new Error("Piper worker returned unreadable data"));
      }
    });
    return context;
  }

  function requestPiperWorker(voiceId, message, timeoutMs, label) {
    let context;
    try {
      context = ensurePiperWorker(voiceId);
    } catch (error) {
      return Promise.reject(error);
    }
    const id = state.piperRequestId + 1;
    state.piperRequestId = id;
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => {
        if (!context.requests.has(id)) return;
        terminatePiperWorker(voiceId, timeoutError(label, timeoutMs));
      }, timeoutMs);
      context.requests.set(id, { resolve, reject, timer });
      try {
        context.worker.postMessage({ ...message, id });
      } catch (error) {
        window.clearTimeout(timer);
        context.requests.delete(id);
        reject(error);
      }
    });
  }

  function schedulePiperWorkerIdle(voiceId) {
    const context = state.piperWorkers.get(voiceId);
    if (!context) return;
    window.clearTimeout(context.idleTimer);
    context.idleTimer = window.setTimeout(() => {
      terminatePiperWorker(voiceId, new Error("Piper worker idle"));
    }, PIPER_IDLE_TIMEOUT_MS);
  }

  function takeCachedPiperClip(key) {
    const clip = state.piperAudioCache.get(key);
    if (!clip) return null;
    state.piperAudioCache.delete(key);
    state.piperAudioCache.set(key, clip);
    return clip;
  }

  function cachePiperClip(key, clip) {
    if (clip.text.length > PIPER_CACHE_TEXT_MAX_CHARS || clip.bytes > PIPER_AUDIO_CACHE_MAX_BYTES) return;
    const existing = state.piperAudioCache.get(key);
    if (existing) state.piperAudioCacheBytes -= existing.bytes;
    state.piperAudioCache.delete(key);
    state.piperAudioCache.set(key, clip);
    state.piperAudioCacheBytes += clip.bytes;
    while (
      state.piperAudioCache.size > PIPER_AUDIO_CACHE_MAX_ITEMS
      || state.piperAudioCacheBytes > PIPER_AUDIO_CACHE_MAX_BYTES
    ) {
      const oldestKey = state.piperAudioCache.keys().next().value;
      const oldest = state.piperAudioCache.get(oldestKey);
      state.piperAudioCache.delete(oldestKey);
      state.piperAudioCacheBytes = Math.max(0, state.piperAudioCacheBytes - (oldest?.bytes || 0));
    }
  }

  function clearPiperAudioCache() {
    state.piperAudioCache.clear();
    state.piperAudioPending.clear();
    state.piperAudioCacheBytes = 0;
  }

  async function getPiperClip(text, lang) {
    const clean = stripForSpeech(text);
    const voiceId = piperVoiceIdForLang(lang);
    if (!clean || !voiceId || clean.length > PIPER_MAX_TEXT_CHARS) return null;
    const key = `${voiceId}:${clean}`;
    const cached = takeCachedPiperClip(key);
    if (cached) return cached;
    if (state.piperAudioPending.has(key)) return state.piperAudioPending.get(key);

    const pending = (async () => {
      const timeoutMs = state.piperWorkers.get(voiceId)?.ready
        ? PIPER_PREDICT_TIMEOUT_MS
        : PIPER_FIRST_REQUEST_TIMEOUT_MS;
      const blob = await requestPiperWorker(
        voiceId,
        { type: "synthesize", voiceId, text: clean },
        timeoutMs,
        "Piper speech"
      );
      const clip = { blob, text: clean, voiceId, bytes: blob.size };
      cachePiperClip(key, clip);
      return clip;
    })();
    state.piperAudioPending.set(key, pending);
    try {
      return await pending;
    } finally {
      state.piperAudioPending.delete(key);
    }
  }

  function applyPiperHighlight(options, text, lang, charIndex) {
    if (options.alignment) {
      applyReaderWordHighlight(
        options.alignment,
        options.speakingPane,
        charIndex,
        text,
        Number.isInteger(options.readerWordIndex) ? options.readerWordIndex : null
      );
      return;
    }
    applySpeechHighlight(options.highlightTargets, options.highlightText || text, charIndex);
    applyCorrespondingHighlight(options.correspondingTargets);
  }

  function clearPiperHighlight(options) {
    window.clearTimeout(state.piperHighlightTimer);
    state.piperHighlightTimer = 0;
    if (options.alignment) {
      clearSpeechHighlights();
    } else {
      clearSpeechHighlights(options.highlightTargets);
    }
    clearCorrespondingHighlights();
  }

  function startPiperWordHighlights(text, lang, durationMs, token, options) {
    window.clearTimeout(state.piperHighlightTimer);
    const ranges = wordRanges(text, lang);
    if (!ranges.length) return;
    const weights = ranges.map((range) => Math.max(1, Array.from(range.text).length));
    const totalWeight = weights.reduce((total, weight) => total + weight, 0);
    const speakWord = (index) => {
      if (token !== state.playToken || index >= ranges.length) return;
      applyPiperHighlight(options, text, lang, ranges[index].start);
      const stepMs = Math.max(70, (durationMs * weights[index]) / Math.max(1, totalWeight));
      state.piperHighlightTimer = window.setTimeout(() => speakWord(index + 1), stepMs);
    };
    speakWord(0);
  }

  function stopPiperAudio({ releasePlayer = false } = {}) {
    window.clearTimeout(state.piperHighlightTimer);
    state.piperHighlightTimer = 0;
    if (state.piperPlaybackCancel) {
      const cancel = state.piperPlaybackCancel;
      state.piperPlaybackCancel = null;
      cancel();
    }
    if (state.piperAudio) {
      state.piperAudio.pause();
      state.piperAudio.onloadedmetadata = null;
      state.piperAudio.onended = null;
      state.piperAudio.onerror = null;
      state.piperAudio.removeAttribute("src");
      state.piperAudio.load();
    }
    if (state.piperAudioUrl) {
      URL.revokeObjectURL(state.piperAudioUrl);
      state.piperAudioUrl = "";
    }
    if (releasePlayer) {
      state.piperAudio = null;
      state.piperAudioUnlocked = false;
    }
  }

  async function playPiperClip(clip, lang, rate, token, options = {}) {
    stopPiperAudio();
    if (token !== state.playToken) return;
    if (!state.piperAudio || !state.piperAudioUnlocked) {
      throw new Error("Piper audio is not unlocked; tap Play again");
    }
    const audio = state.piperAudio;
    const url = URL.createObjectURL(clip.blob);
    const playbackRate = clamp(rate || 1, 0.5, 2);
    state.piperAudioUrl = url;
    audio.src = url;
    audio.playbackRate = playbackRate;
    audio.preservesPitch = true;
    if ("webkitPreservesPitch" in audio) audio.webkitPreservesPitch = true;
    audio.volume = effectiveSpeechVolume(lang);
    const playbackFinished = new Promise((resolve, reject) => {
      let settled = false;
      const finish = (error = null) => {
        if (settled) return;
        settled = true;
        state.piperPlaybackCancel = null;
        if (error) reject(error);
        else resolve();
      };
      state.piperPlaybackCancel = () => finish();
      audio.onended = () => finish();
      audio.onerror = () => finish(new Error("Piper audio playback failed"));
    });
    audio.onloadedmetadata = () => {
      if (token === state.playToken && Number.isFinite(audio.duration)) {
        startPiperWordHighlights(clip.text, lang, (audio.duration / playbackRate) * 1000, token, options);
      }
    };
    const musicDuckOwner = {};
    try {
      acquireStudyMusicDuck(musicDuckOwner);
      const playStarted = audio.play();
      await Promise.all([Promise.resolve(playStarted), playbackFinished]);
    } finally {
      releaseStudyMusicDuck(musicDuckOwner);
      if (state.piperAudioUrl === url) {
        state.piperPlaybackCancel = null;
        audio.pause();
        audio.onloadedmetadata = null;
        audio.onended = null;
        audio.onerror = null;
        audio.removeAttribute("src");
        audio.load();
        URL.revokeObjectURL(url);
        state.piperAudioUrl = "";
      }
      clearPiperHighlight(options);
      schedulePiperWorkerIdle(clip.voiceId);
    }
  }

  async function clearDownloadedPiperVoices() {
    if (!piperRuntimeAvailable()) {
      setStatus("Piper storage controls are unavailable on this device");
      return;
    }
    stopSpeech();
    clearPiperAudioCache();
    state.piperStorageBusy = true;
    const button = els.piperClearBtn;
    if (button) button.disabled = true;
    els.playBtn.disabled = true;
    els.bookPlayBtn.disabled = true;
    setStatus("Clearing downloaded Piper voices");
    try {
      await requestPiperWorker(
        "__storage__",
        { type: "clear" },
        PIPER_CLEAR_TIMEOUT_MS,
        "Piper storage cleanup"
      );
      state.piperFailures.clear();
      setStatus("Downloaded Piper voices cleared");
    } catch (error) {
      setStatus(error.message || "Could not clear Piper voices");
      console.warn("Piper storage cleanup failed:", error);
    } finally {
      terminatePiperWorker("__storage__", new Error("Piper storage cleanup finished"));
      state.piperStorageBusy = false;
      if (button) button.disabled = false;
      els.playBtn.disabled = false;
      els.bookPlayBtn.disabled = false;
    }
  }

  function shouldSetSystemLanguage(lang) {
    return Boolean(systemSpeechLang(lang));
  }

  function systemSpeechLang(lang) {
    if (langPrefix(lang) === "en") {
      return state.enLang || lang || "en-US";
    }
    return lang;
  }

  function findVoice(lang) {
    const speechLang = systemSpeechLang(lang) || lang;
    const prefKey = voicePrefKeyForLang(speechLang);
    const selected = prefKey ? state.voicePrefs[prefKey] : "";
    if (selected) {
      // A user's explicit voice always wins, even if a browser reports its
      // locale in an unusual form that would miss the normal matching filter.
      const selectedVoice = state.voices.find((voice) => voiceId(voice) === selected);
      if (selectedVoice) return selectedVoice;
    }
    return matchingVoices(speechLang)[0] || null;
  }

  function syncAvailableVoices() {
    if (!window.speechSynthesis) return false;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return false;
    state.voices = voices;
    state.voiceLoadSettled = true;
    updateVoiceSelectors();
    return true;
  }

  async function refreshVoices() {
    if (!window.speechSynthesis) return [];
    if (syncAvailableVoices() || state.voiceLoadSettled) return state.voices;
    if (state.voiceRefreshPromise) return state.voiceRefreshPromise;

    const synthesis = window.speechSynthesis;
    const pending = new Promise((resolve) => {
      let pollTimer = 0;
      let timeoutTimer = 0;
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        state.voiceLoadSettled = true;
        window.clearInterval(pollTimer);
        window.clearTimeout(timeoutTimer);
        if (typeof synthesis.removeEventListener === "function") {
          synthesis.removeEventListener("voiceschanged", check);
        }
        resolve(state.voices);
      };
      const check = () => {
        if (syncAvailableVoices()) finish();
      };

      if (typeof synthesis.addEventListener === "function") {
        synthesis.addEventListener("voiceschanged", check);
      }
      pollTimer = window.setInterval(check, VOICE_LOAD_POLL_MS);
      timeoutTimer = window.setTimeout(finish, VOICE_LOAD_TIMEOUT_MS);
      check();
    });
    state.voiceRefreshPromise = pending;
    try {
      return await pending;
    } finally {
      if (state.voiceRefreshPromise === pending) {
        state.voiceRefreshPromise = null;
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
    if (state.piperStorageBusy) {
      setStatus("Wait for Piper storage cleanup to finish");
      return;
    }
    state.playing = true;
    const token = state.playToken + 1;
    state.playToken = token;
    els.playBtn.textContent = "Stop";
    let failed = false;

    try {
      await prepareSpeechEngine();
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
      failed = true;
      setStatus(playbackErrorMessage(error, "Playback failed"));
      console.error(error);
    } finally {
      if (token === state.playToken) {
        state.playing = false;
        els.playBtn.textContent = "Play";
        if (!failed) {
          setStatus("Ready");
        }
      }
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
    els.datasetMeta.textContent = `${language.label} ${state.entries.length.toLocaleString()} ${language.datasetNoun || "words"}`;
    els.sourceHead.textContent = language.sourceHead;
    els.meaningHead.textContent = language.meaningHead || "English";
    els.wordList.setAttribute("aria-label", language.listLabel || `${language.label} frequency list`);
    buildOrder();
    updateSpacer();
    updateFocus();
    renderVisibleRows();
    scrollCurrentIntoView("center");
    setStatus("Ready");
  }

  function refreshSpeechTrackPresentation() {
    syncPiperControls();
    updateSettingLabels();
    updateVoiceSelectors();
    updateFocus();
    if (state.bookMode && state.bookLoadedBook) {
      renderBookReaderShell();
      renderBookSentence().catch((error) => {
        console.warn("Reader track refresh failed:", error);
      });
    }
  }

  function setSpeechTrackLanguage(slot, requestedLanguage) {
    const language = normalizeSpeechTrackLanguage(requestedLanguage) || "off";
    if (slot === 2) state.speechTrack2Language = language;
    else state.speechTrack3Language = language;
    normalizeSpeechTrackState();
    stopSpeech();
    clearPiperAudioCache();
    refreshSpeechTrackPresentation();
    savePrefs();
    const selected = speechTrackConfig(slot);
    setStatus(selected.language === "off"
      ? `Track ${slot} turned off`
      : `Track ${slot} set to ${languageTrackLabel(selected.language)}`);
  }

  function setSpeechTrackEngine(slot, requestedEngine) {
    const nextEngine = normalizeSpeechTrackEngine(requestedEngine);
    const track = speechTrackConfig(slot);
    if (!LANGUAGES[track.language]) return;
    const otherPiperCount = [1, 2, 3]
      .filter((otherSlot) => otherSlot !== slot)
      .map(speechTrackConfig)
      .filter((otherTrack) => speechTrackIsAudible(otherTrack) && speechTrackHasSupportedPiper(otherTrack))
      .length;
    const speechLang = speechLanguageForKey(track.language);
    let engine = nextEngine;
    let message = "";
    if (engine === "piper" && !piperVoiceIdForLang(speechLang)) {
      engine = "system";
      message = `Piper is unavailable for ${languageTrackLabel(track.language)}; using System / iPhone`;
    } else if (engine === "piper" && !piperRuntimeAvailable()) {
      engine = "system";
      message = "Piper is unavailable on this device; using System / iPhone";
    } else if (
      engine === "piper"
      && speechTrackIsAudible(track)
      && otherPiperCount >= PIPER_MAX_LIVE_WORKERS
    ) {
      engine = "system";
      message = "Two Piper voices are already selected; this track will use System / iPhone";
    }

    if (slot === 1) state.ttsEngine = engine;
    else if (slot === 2) state.speechTrack2Engine = engine;
    else state.speechTrack3Engine = engine;
    stopSpeech();
    clearPiperAudioCache();
    state.piperFailures.clear();
    if (!configuredSpeechTracks().some(speechTrackUsesPiper)) {
      stopPiperAudio({ releasePlayer: true });
    }
    refreshSpeechTrackPresentation();
    savePrefs();
    setStatus(message || `${languageTrackLabel(track.language)} will use ${engine === "piper" ? "Piper" : "System / iPhone"}`);
  }

  function bindEvents() {
    els.studyMusicToggle.addEventListener("click", () => {
      els.studyMusicPanel.hidden = !els.studyMusicPanel.hidden;
      els.studyMusicToggle.setAttribute("aria-expanded", String(!els.studyMusicPanel.hidden));
    });

    els.studyMusicStyleSelect.addEventListener("change", () => {
      void loadStudyMusicCollection(els.studyMusicStyleSelect.value);
    });

    els.studyMusicPlayBtn.addEventListener("click", () => {
      if (!els.studyMusicAudio.paused && !els.studyMusicAudio.ended) {
        pauseStudyMusic();
        setStudyMusicStatus("Music paused");
        return;
      }
      void playStudyMusic();
    });

    els.studyMusicPrevBtn.addEventListener("click", () => {
      state.studyMusicConsecutiveFailures = 0;
      void moveStudyMusic(-1);
    });

    els.studyMusicNextBtn.addEventListener("click", () => {
      state.studyMusicConsecutiveFailures = 0;
      void moveStudyMusic(1);
    });

    els.studyMusicVolume.addEventListener("input", () => {
      state.studyMusicVolume = clamp(els.studyMusicVolume.value, 0, 1);
      syncStudyMusicGain();
      renderStudyMusic();
      savePrefs();
    });

    els.studyMusicDuck.addEventListener("change", () => {
      state.studyMusicDuckEnabled = els.studyMusicDuck.checked;
      syncStudyMusicGain();
      savePrefs();
    });

    els.studyMusicAudio.addEventListener("playing", () => {
      clearStudyMusicStallTimer();
      if (state.studyMusicPageHidden || !state.studyMusicWantedPlaying) {
        els.studyMusicAudio.pause();
        renderStudyMusic();
        return;
      }
      state.studyMusicWantedPlaying = true;
      clearStudyMusicStableTimer();
      const token = state.studyMusicLoadToken;
      const trackId = currentStudyMusicTrack()?.id;
      state.studyMusicStableTimer = window.setTimeout(() => {
        if (
          !state.studyMusicPageHidden
          && token === state.studyMusicLoadToken
          && trackId
          && currentStudyMusicTrack()?.id === trackId
          && !els.studyMusicAudio.paused
        ) {
          state.studyMusicConsecutiveFailures = 0;
        }
      }, STUDY_MUSIC_STABLE_PLAYBACK_MS);
      renderStudyMusic();
    });
    els.studyMusicAudio.addEventListener("pause", renderStudyMusic);
    els.studyMusicAudio.addEventListener("ended", () => {
      clearStudyMusicStallTimer();
      clearStudyMusicStableTimer();
      if (!state.studyMusicWantedPlaying || state.studyMusicPageHidden) return;
      void moveStudyMusic(1, { autoplay: true });
    });
    els.studyMusicAudio.addEventListener("error", () => {
      if (!currentStudyMusicTrack() || state.studyMusicPageHidden) return;
      void handleStudyMusicMediaFailure("Music stream failed");
    });
    const watchForStudyMusicStall = () => {
      if (state.studyMusicPageHidden || !state.studyMusicWantedPlaying || els.studyMusicAudio.paused) return;
      clearStudyMusicStallTimer();
      state.studyMusicStallTimer = window.setTimeout(() => {
        void handleStudyMusicMediaFailure("Music stream stalled");
      }, STUDY_MUSIC_STALL_TIMEOUT_MS);
    };
    els.studyMusicAudio.addEventListener("waiting", watchForStudyMusicStall);
    els.studyMusicAudio.addEventListener("stalled", watchForStudyMusicStall);
    els.studyMusicAudio.addEventListener("canplay", clearStudyMusicStallTimer);
    els.studyMusicAudio.addEventListener("timeupdate", clearStudyMusicStallTimer);

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
      savePrefs();
    });

    els.bandSelect.addEventListener("change", () => {
      const entry = currentEntry();
      state.band = els.bandSelect.value;
      state.bandByLanguage[state.language] = state.band;
      buildOrder(entry?.word || "");
      updateFocus();
      renderVisibleRows();
      scrollCurrentIntoView("center");
      savePrefs();
    });

    els.languageSelect.addEventListener("change", async () => {
      stopSpeech();
      selectLanguage(els.languageSelect.value);
      savePrefs();
      try {
        await loadData();
        if (state.bookMode && isNewsMode()) {
          populateNewsSourceSelect();
          state.newsSearch = "";
          els.newsSearchInput.value = "";
          await loadNewsFeed();
        } else if (state.bookMode && state.bookLoadedBook) {
          await renderBookSentence();
        }
      } catch (error) {
        setStatus(error.message || "Language load failed");
        console.error(error);
      }
    });

    els.settingsToggle.addEventListener("click", () => {
      els.settingsPanel.hidden = !els.settingsPanel.hidden;
      els.settingsToggle.setAttribute("aria-expanded", String(!els.settingsPanel.hidden));
    });

    els.bookToggle.addEventListener("click", () => {
      stopSpeech();
      const active = state.bookMode && !isNewsMode();
      setBookMode(!active, "books");
    });

    els.newsToggle.addEventListener("click", () => {
      stopSpeech();
      const active = state.bookMode && isNewsMode();
      setBookMode(!active, "news");
    });

    els.knowledgeToggle.addEventListener("click", () => {
      stopSpeech();
      const active = state.bookMode && isKnowledgeMode();
      setBookMode(!active, "knowledge");
    });

    els.bookShelfBtn.addEventListener("click", () => {
      setBookMode(true, state.contentMode);
      stopSpeech();
      showBookShelf();
    });

    els.bookRandomBtn.addEventListener("click", async () => {
      setBookMode(true, "books");
      try {
        await loadRandomBookParagraph();
      } catch (error) {
        setStatus(error.message || "Random paragraph failed");
        console.error(error);
      }
    });

    els.newsShelfControls.addEventListener("submit", (event) => {
      event.preventDefault();
      state.newsSearch = normalizeSpaces(els.newsSearchInput.value);
      applyNewsFilter();
    });

    els.newsRefreshBtn.addEventListener("click", async () => {
      try {
        await loadNewsFeed();
      } catch (error) {
        setStatus(error.message || "News refresh failed");
        console.error(error);
      }
    });

    els.newsRandomBtn.addEventListener("click", async () => {
      try {
        await loadRandomNewsArticle();
      } catch (error) {
        setStatus(error.message || "Random article failed");
        console.error(error);
      }
    });

    els.knowledgeRefreshBtn.addEventListener("click", async () => {
      try {
        await loadKnowledgeFeed({ force: true });
      } catch (error) {
        setStatus(error.message || "Knowledge refresh failed");
        console.error(error);
      }
    });

    els.knowledgeRandomBtn.addEventListener("click", async () => {
      try {
        await loadRandomKnowledgeArticle();
      } catch (error) {
        setStatus(error.message || "Random knowledge fact failed");
        console.error(error);
      }
    });

    els.knowledgeTopicSelect.addEventListener("change", () => {
      state.knowledgeTopic = KNOWLEDGE_TOPICS[els.knowledgeTopicSelect.value]
        ? els.knowledgeTopicSelect.value
        : "general";
      state.bookBooks = [];
      savePrefs();
      setBookMode(true, "knowledge");
    });

    els.knowledgeTranslationSelect.addEventListener("change", () => {
      state.knowledgeTranslation = LANGUAGES[els.knowledgeTranslationSelect.value]
        && els.knowledgeTranslationSelect.value !== "en"
        ? els.knowledgeTranslationSelect.value
        : "off";
      savePrefs();
      if (isKnowledgeMode() && state.bookLoadedBook?.kind === "knowledge") {
        stopSpeech();
        void renderBookSentence();
      }
    });

    els.knowledgeIncludeBirthDeaths.addEventListener("change", async () => {
      state.knowledgeIncludeBirthDeaths = els.knowledgeIncludeBirthDeaths.checked;
      savePrefs();
      if (!isKnowledgeMode() || !activeKnowledgeTopic().onThisDay) return;
      state.bookBooks = [];
      try {
        await loadKnowledgeFeed({ force: true });
      } catch (error) {
        setStatus(error.message || "On this day refresh failed");
        console.error(error);
      }
    });

    els.newsSourceSelect.addEventListener("change", async () => {
      state.newsSourceByLanguage[state.language] = els.newsSourceSelect.value;
      state.newsSearch = "";
      els.newsSearchInput.value = "";
      savePrefs();
      try {
        await loadNewsFeed();
      } catch (error) {
        setStatus(error.message || "News source failed");
        console.error(error);
      }
    });

    els.newsLanguageSelect.addEventListener("change", async () => {
      stopSpeech();
      selectLanguage(els.newsLanguageSelect.value);
      state.newsSearch = "";
      els.newsSearchInput.value = "";
      populateNewsSourceSelect();
      savePrefs();
      try {
        await loadData();
        await loadNewsFeed();
      } catch (error) {
        setStatus(error.message || "News language failed");
        console.error(error);
      }
    });

    els.bookShelfControls.addEventListener("submit", async (event) => {
      event.preventDefault();
      state.bookShelfKind = BOOK_SHELF_KINDS.has(els.bookShelfViewSelect.value) ? els.bookShelfViewSelect.value : "guided";
      state.bookGenre = BOOK_GENRES[els.bookGenreSelect.value] ? els.bookGenreSelect.value : "";
      state.bookLevel = BOOK_LEVELS[els.bookLevelSelect.value] ? els.bookLevelSelect.value : "";
      state.bookSearch = normalizeSpaces(els.bookSearchInput.value);
      state.bookPage = Math.max(1, Number.parseInt(els.bookPageInput.value || "1", 10) || 1);
      setBookMode(true, "books");
      try {
        await loadBookCatalogPage(state.bookPage);
      } catch (error) {
        setStatus(error.message || "Book shelf failed");
        console.error(error);
      }
    });

    els.bookShelfViewSelect.addEventListener("change", async () => {
      state.bookShelfKind = BOOK_SHELF_KINDS.has(els.bookShelfViewSelect.value) ? els.bookShelfViewSelect.value : "guided";
      state.bookSearch = normalizeSpaces(els.bookSearchInput.value);
      state.bookPage = 1;
      state.bookBooks = [];
      els.bookPageInput.value = "1";
      savePrefs();
      setBookMode(true, "books");
      try {
        await loadBookCatalogPage(1);
      } catch (error) {
        setStatus(error.message || "Book shelf failed");
        console.error(error);
      }
    });

    els.bookGenreSelect.addEventListener("change", async () => {
      state.bookGenre = BOOK_GENRES[els.bookGenreSelect.value] ? els.bookGenreSelect.value : "";
      state.bookSearch = normalizeSpaces(els.bookSearchInput.value);
      state.bookPage = 1;
      els.bookPageInput.value = "1";
      savePrefs();
      setBookMode(true, "books");
      try {
        await loadBookCatalogPage(1);
      } catch (error) {
        setStatus(error.message || "Book shelf failed");
        console.error(error);
      }
    });

    els.bookLevelSelect.addEventListener("change", async () => {
      state.bookLevel = BOOK_LEVELS[els.bookLevelSelect.value] ? els.bookLevelSelect.value : "";
      state.bookSearch = normalizeSpaces(els.bookSearchInput.value);
      state.bookPage = 1;
      els.bookPageInput.value = "1";
      savePrefs();
      setBookMode(true, "books");
      try {
        await loadBookCatalogPage(1);
      } catch (error) {
        setStatus(error.message || "Difficulty filter failed");
        console.error(error);
      }
    });

    els.bookPageInput.addEventListener("change", async () => {
      if (state.bookShelfKind !== "library") return;
      state.bookSearch = normalizeSpaces(els.bookSearchInput.value);
      setBookMode(true, "books");
      try {
        await loadBookCatalogPage(els.bookPageInput.value);
      } catch (error) {
        setStatus(error.message || "Book shelf failed");
        console.error(error);
      }
    });

    els.bookPrevPageBtn.addEventListener("click", async () => {
      if (state.bookShelfKind !== "library") return;
      state.bookSearch = normalizeSpaces(els.bookSearchInput.value);
      setBookMode(true, "books");
      try {
        await loadBookCatalogPage(Math.max(1, state.bookPage - 1));
      } catch (error) {
        setStatus(error.message || "Book shelf failed");
        console.error(error);
      }
    });

    els.bookNextPageBtn.addEventListener("click", async () => {
      if (state.bookShelfKind !== "library") return;
      state.bookSearch = normalizeSpaces(els.bookSearchInput.value);
      setBookMode(true, "books");
      try {
        await loadBookCatalogPage(state.bookPage + 1);
      } catch (error) {
        setStatus(error.message || "Book shelf failed");
        console.error(error);
      }
    });

    els.bookPlayBtn.addEventListener("click", async () => {
      if (state.bookPlaying) {
        stopSpeech();
        setStatus("Paused");
        return;
      }
      await startBookPlayback();
    });

    els.bookAudioSettingsToggle.addEventListener("click", () => {
      setBookAudioPanel(!state.bookAudioSettingsOpen);
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
      if (isKnowledgeMode() || state.bookLoadedBook?.kind === "knowledge") {
        try {
          await loadNextKnowledgeArticle();
          if (wasPlaying) await startBookPlayback();
        } catch (error) {
          setStatus(error.message || "Next knowledge fact failed");
          console.error(error);
        }
        return;
      }
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
      selectLanguage(els.bookLanguageSelect.value);
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
        savePrefs();
      });
    });

    els.bookReadEnglish.addEventListener("change", () => {
      stopSpeech();
      const englishPiperWasSelected = enabledCompanionTracks().some((track) => (
        track.language === "en" && track.engine === "piper"
      ));
      syncPiperControls();
      updateFocus();
      if (state.bookLoadedBook) renderBookReaderShell();
      savePrefs();
      const englishPiperStillSelected = enabledCompanionTracks().some((track) => (
        track.language === "en" && track.engine === "piper"
      ));
      setStatus(
        els.bookReadEnglish.checked && englishPiperWasSelected && !englishPiperStillSelected
          ? "English enabled with System / iPhone so the two foreign Piper voices stay active"
          : els.bookReadEnglish.checked && !englishSpeechEnabled()
            ? "English speech is allowed, but no English companion track is selected"
          : els.bookReadEnglish.checked
            ? "English translations and definitions will be read"
            : "English translations and definitions will be skipped"
      );
    });

    const prefetchShelfCard = (event) => {
      const card = event.target.closest(".book-card");
      if (!card) return;
      const book = state.bookBooks[Number.parseInt(card.dataset.bookIndex || "0", 10)];
      prefetchBookDocument(book);
    };
    els.bookShelf.addEventListener("pointerover", prefetchShelfCard, { passive: true });
    els.bookShelf.addEventListener("pointerdown", prefetchShelfCard, { passive: true });

    els.bookShelf.addEventListener("click", async (event) => {
      const favoriteButton = event.target.closest(".book-favorite-btn");
      if (favoriteButton) {
        const book = state.bookBooks[Number.parseInt(favoriteButton.dataset.bookIndex || "0", 10)];
        if (!book) return;
        const favorite = toggleBookFavorite(book);
        if (state.bookShelfKind === "favorites") {
          state.bookBooks = visibleFavoriteBooks();
        }
        renderBookShelf();
        setStatus(favorite ? `Favorited ${book.title}` : `Removed ${book.title} from favorites`);
        return;
      }
      const card = event.target.closest(".book-card");
      if (!card) return;
      const book = state.bookBooks[Number.parseInt(card.dataset.bookIndex || "0", 10)];
      if (!book) return;
      try {
        await loadBook(book);
      } catch (error) {
        setStatus(error.message || (isNewsMode() ? "News article load failed" : "Book load failed"));
        console.error(error);
      }
    });

    els.bookNearbyList.addEventListener("click", (event) => {
      const row = event.target.closest("[data-book-sentence-index]");
      if (!row) return;
      stopSpeech();
      setBookIndex(Number.parseInt(row.dataset.bookSentenceIndex || "0", 10), { save: true });
    });

    els.sourceVoiceSelect.addEventListener("change", () => {
      const key = voicePrefKeyForLang(activeLanguage().speechLang);
      if (key) {
        state.voicePrefs[key] = els.sourceVoiceSelect.value;
        savePrefs();
      }
    });

    els.enVoiceSelect.addEventListener("change", () => {
      const key = voicePrefKeyForLang(speechLanguageForKey(state.speechTrack2Language));
      if (key) {
        state.voicePrefs[key] = els.enVoiceSelect.value;
        savePrefs();
      }
    });

    els.speechTrack3VoiceSelect.addEventListener("change", () => {
      const key = voicePrefKeyForLang(speechLanguageForKey(state.speechTrack3Language));
      if (key) {
        state.voicePrefs[key] = els.speechTrack3VoiceSelect.value;
        savePrefs();
      }
    });

    els.enLangSelect.addEventListener("change", () => {
      state.enLang = els.enLangSelect.value;
      state.voicePrefs.en = "";
      updateVoiceSelectors();
      savePrefs();
    });

    els.speechTrack2LanguageSelect.addEventListener("change", () => {
      setSpeechTrackLanguage(2, els.speechTrack2LanguageSelect.value);
    });

    els.speechTrack3LanguageSelect.addEventListener("change", () => {
      setSpeechTrackLanguage(3, els.speechTrack3LanguageSelect.value);
    });

    els.engineSelect.addEventListener("change", () => {
      setSpeechTrackEngine(1, els.engineSelect.value);
    });

    els.speechTrack2EngineSelect.addEventListener("change", () => {
      setSpeechTrackEngine(2, els.speechTrack2EngineSelect.value);
    });

    els.speechTrack3EngineSelect.addEventListener("change", () => {
      setSpeechTrackEngine(3, els.speechTrack3EngineSelect.value);
    });

    [
      [1, els.speechTrack1Volume],
      [2, els.speechTrack2Volume],
      [3, els.speechTrack3Volume]
    ].forEach(([slot, input]) => {
      input?.addEventListener("input", () => {
        setSpeechTrackVolumeBoost(slot, input.value);
      });
    });

    if (els.piperClearBtn) {
      els.piperClearBtn.addEventListener("click", clearDownloadedPiperVoices);
    }

    [els.ruRate, els.enRate, els.pageVolume, els.gapMs].forEach((input) => {
      input.addEventListener("input", () => {
        if (input === els.ruRate || input === els.enRate || input === els.pageVolume) {
          syncBookAudioControlsFromSettings();
        }
        updateSettingLabels();
        savePrefs();
      });
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
      clearReaderHighlightLayer(els.bookSourceSentence);
      clearReaderHighlightLayer(els.bookEnglishSentence);
      renderVisibleRows();
      fitRussianFocusWord();
      fitEnglishFocusWord();
    });
    window.addEventListener("pagehide", (event) => {
      state.studyMusicPageHidden = true;
      stopSpeech();
      stopPiperAudio({ releasePlayer: true });
      pauseStudyMusic({ releaseSource: !event.persisted });
      state.studyMusicLoadToken += 1;
      state.studyMusicAbortController?.abort();
      state.studyMusicLoadPromise = null;
      state.studyMusicRefillPromise = null;
      suspendStudyMusicAudioContext();
      savePrefs();
    });
    window.addEventListener("pageshow", () => {
      state.studyMusicPageHidden = false;
      renderStudyMusic();
      if (!currentStudyMusicCollection()) return;
      if (state.studyMusicAbortController && !state.studyMusicAbortController.signal.aborted) return;
      if (!currentStudyMusicTrack()) {
        void loadStudyMusicCollection(state.studyMusicStyle, { persist: false });
        return;
      }
      state.studyMusicAbortController = new AbortController();
      state.studyMusicLoadPromise = null;
      state.studyMusicRefillPromise = null;
      setStudyMusicStatus("Music paused · tap Play to resume");
    });
    if (window.speechSynthesis) {
      const handleVoicesChanged = () => syncAvailableVoices();
      if (typeof window.speechSynthesis.addEventListener === "function") {
        window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
      } else {
        window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
      }
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
    normalizeSpeechTrackState();
    els.languageSelect.value = state.language;
    populateBandSelect();
    syncReaderLanguageSelects();
    updateContentModeAvailability();
    if (readerEnabled()) {
      populateNewsSourceSelect();
    }
    els.bookShelfViewSelect.value = state.bookShelfKind;
    els.knowledgeTopicSelect.value = state.knowledgeTopic;
    els.knowledgeTranslationSelect.value = state.knowledgeTranslation;
    els.knowledgePeopleFilter.hidden = !activeKnowledgeTopic().onThisDay;
    els.knowledgeIncludeBirthDeaths.checked = state.knowledgeIncludeBirthDeaths;
    els.bookGenreSelect.value = state.bookGenre;
    els.bookLevelSelect.value = state.bookLevel;
    els.enLangSelect.value = state.enLang;
    if (els.engineSelect) {
      els.engineSelect.value = state.ttsEngine;
    }
    syncPiperControls();
    syncBookAudioControlsFromSettings();
    initializeStudyMusic();
    updateShuffleButton();
    updateSettingLabels();
    updateVoiceSelectors();
    bindEvents();
    await loadData();
    // Do not spend the bounded async-voice wait during startup. If Safari has
    // not populated its list yet, the first user-triggered playback will wait
    // for it while the voiceschanged listener continues to update the picker.
    syncAvailableVoices();
    updateVoiceSelectors();
    registerServiceWorker();
  }

  init().catch((error) => {
    setStatus(error.message || "Failed to start");
    console.error(error);
  });
})();
