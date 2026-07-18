(() => {
  const STORE_KEY = "wordfreak:v2";
  const TRANSLATION_CACHE_KEY = "wordfreak:translation-cache";
  const LEGACY_RU_TRANSLATION_CACHE_KEY = "wordfreak:ru-en-cache";
  const BOOK_PROGRESS_KEY = "wordfreak:book-progress:v1";
  const BOOK_FAVORITES_KEY = "wordfreak:book-favorites:v1";
  const BOOK_DIFFICULTY_KEY = "wordfreak:book-difficulty:v1";
  const READER_TRANSLATIONS_KEY = "wordfreak:reader-translations:v1";
  const NEWS_FEED_CACHE_KEY = "wordfreak:news-feeds:v1";
  // v2 drops documents that may have been saved from incomplete proxy responses.
  const READER_DOCUMENT_CACHE_NAME = "wordfreak-reader-documents-v2";
  const STANDARD_EBOOKS_LIST_URL = "https://standardebooks.org/ebooks";
  const GUTENDEX_BOOKS_URL = "https://gutendex.com/books/";
  const STANDARD_EBOOKS_PER_PAGE = 48;
  const STANDARD_EBOOKS_RANDOM_PAGE_MAX = 24;
  const BOOK_FETCH_TIMEOUT_MS = 14000;
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
  const BOOK_SHELF_KINDS = new Set(["guided", "library", "gutenberg", "favorites"]);
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
    }
  };

  const els = {
    datasetMeta: document.getElementById("datasetMeta"),
    languageSelect: document.getElementById("languageSelect"),
    bandSelect: document.getElementById("bandSelect"),
    bookToggle: document.getElementById("bookToggle"),
    newsToggle: document.getElementById("newsToggle"),
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
    bookLevelNote: document.getElementById("bookLevelNote"),
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
    bookChapterLabel: document.getElementById("bookChapterLabel"),
    bookChapterSelect: document.getElementById("bookChapterSelect"),
    bookProgressValue: document.getElementById("bookProgressValue"),
    bookProgressRange: document.getElementById("bookProgressRange"),
    bookSourceLabel: document.getElementById("bookSourceLabel"),
    bookSourceSentence: document.getElementById("bookSourceSentence"),
    bookEnglishLabel: document.getElementById("bookEnglishLabel"),
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
    shuffle: false,
    band: "20000",
    voices: [],
    voicePrefs: {
      ru: "",
      fa: "",
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
      state.band = String(prefs.band || state.band);
      state.shuffle = Boolean(prefs.shuffle);
      state.currentPos = Number.isFinite(prefs.currentPos) ? prefs.currentPos : 0;
      state.bookShelfKind = BOOK_SHELF_KINDS.has(prefs.bookShelfKind) ? prefs.bookShelfKind : state.bookShelfKind;
      state.bookGenre = BOOK_GENRES[prefs.bookGenre] ? prefs.bookGenre : "";
      state.bookLevel = BOOK_LEVELS[prefs.bookLevel] ? prefs.bookLevel : "";
      state.newsSourceByLanguage = prefs.newsSourceByLanguage && typeof prefs.newsSourceByLanguage === "object"
        ? { ...prefs.newsSourceByLanguage }
        : {};
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
      els.bookReadEnglish.checked = prefs.bookReadEnglish !== false;
      els.gapMs.value = prefs.gapMs || els.gapMs.value;
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
      bookShelfKind: state.bookShelfKind,
      bookGenre: state.bookGenre,
      bookLevel: state.bookLevel,
      newsSourceByLanguage: state.newsSourceByLanguage,
      bookReadEnglish: els.bookReadEnglish.checked,
      voicePrefs: state.voicePrefs,
      enLang: state.enLang,
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
    els.sourceRateLabel.textContent = `${activeLanguage().shortLabel} speed`;
    els.sourceVoiceLabel.textContent = `${activeLanguage().shortLabel} voice`;
    els.ruRateValue.textContent = `${Number(els.ruRate.value).toFixed(2)}x`;
    els.enRateValue.textContent = `${Number(els.enRate.value).toFixed(2)}x`;
    els.pageVolumeValue.textContent = `${Math.round(pageVolume() * 100)}%`;
    els.bookSourceRateValue.textContent = `${Number(els.bookSourceRate.value).toFixed(2)}x`;
    els.bookEnRateValue.textContent = `${Number(els.bookEnRate.value).toFixed(2)}x`;
    els.bookVolumeValue.textContent = `${Math.round(pageVolume() * 100)}%`;
    els.gapValue.textContent = `${Number.parseInt(els.gapMs.value, 10)} ms`;
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

  function activeLanguage() {
    return LANGUAGES[state.language] || LANGUAGES.ru;
  }

  function isNewsMode() {
    return state.contentMode === "news";
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
    return normalizeSpaces(
      String(value || "")
        // Some iOS voices pronounce escaped book punctuation literally.
        .replace(/[\\/"“”„‟«»‹›()[\]{}<>|*_~^#=+]/g, " ")
        .replace(/[—–―]/g, " ")
        .replace(/\.\.\.|…/g, " ")
        .replace(/[;:]/g, ",")
        .replace(/\s+([,.!?])/g, "$1")
    );
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

  function clearSpeechHighlights(targets = state.activeHighlights) {
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

  function normalizeAlignmentText(value) {
    return String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "")
      .trim();
  }

  function proportionalWordMap(fromCount, toCount) {
    if (!fromCount || !toCount) return Array.from({ length: fromCount }, () => []);
    return Array.from({ length: fromCount }, (_, index) => {
      const start = Math.min(toCount - 1, Math.floor((index * toCount) / fromCount));
      const naturalEnd = Math.max(start + 1, Math.ceil(((index + 1) * toCount) / fromCount));
      const end = Math.min(toCount, start + 2, naturalEnd);
      return Array.from({ length: Math.max(1, end - start) }, (value, offset) => start + offset);
    });
  }

  function invertWordMap(wordMap, targetCount, options = {}) {
    const useFallback = Boolean(options.fallback);
    const inverted = Array.from({ length: targetCount }, () => []);
    wordMap.forEach((targets, sourceIndex) => {
      targets.forEach((targetIndex) => {
        if (inverted[targetIndex] && !inverted[targetIndex].includes(sourceIndex)) {
          inverted[targetIndex].push(sourceIndex);
        }
      });
    });
    const fallback = useFallback ? proportionalWordMap(targetCount, wordMap.length) : [];
    return inverted.map((values, index) => (values.length ? values.slice(0, 3) : (fallback[index] || [])));
  }

  function alignmentSimilarity(left, right) {
    const a = normalizeAlignmentText(left);
    const b = normalizeAlignmentText(right);
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

  function locateAlignedPhrase(text, ranges, phrase, expectedIndexes = []) {
    const cleanPhrase = String(phrase || "").trim();
    const normalizedPhrase = normalizeAlignmentText(cleanPhrase);
    if (!normalizedPhrase || !ranges.length) return { indexes: [], confidence: 0 };
    const expected = expectedIndexes[0] ?? 0;
    const phraseWordCount = Math.max(1, wordRanges(cleanPhrase).length);
    let best = { confidence: 0, similarity: 0, indexes: [] };
    for (let start = 0; start < ranges.length; start += 1) {
      for (let length = 1; length <= READER_ALIGNMENT_MAX_TARGET_WORDS && start + length <= ranges.length; length += 1) {
        const endRange = ranges[start + length - 1];
        const candidate = String(text || "").slice(ranges[start].start, endRange.end);
        const exact = normalizeAlignmentText(candidate) === normalizedPhrase;
        const similarity = exact ? 1 : alignmentSimilarity(candidate, cleanPhrase);
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
    return {
      sourceText: pair.source,
      englishText: pair.english,
      sourceLanguage,
      sourceRanges,
      englishRanges,
      sourceToEnglish: Array.from({ length: sourceRanges.length }, () => []),
      englishToSource: Array.from({ length: englishRanges.length }, () => []),
      newsMode,
      contextual: false,
      alignedWordCount: 0
    };
  }

  async function enrichReaderAlignment(alignment) {
    const fromText = alignment.newsMode ? alignment.sourceText : alignment.englishText;
    const toText = alignment.newsMode ? alignment.englishText : alignment.sourceText;
    const fromRanges = alignment.newsMode ? alignment.sourceRanges : alignment.englishRanges;
    const toRanges = alignment.newsMode ? alignment.englishRanges : alignment.sourceRanges;
    const sourceLanguage = alignment.newsMode ? alignment.sourceLanguage : "en";
    const targetLanguage = alignment.newsMode ? "en" : alignment.sourceLanguage;
    const fallback = proportionalWordMap(fromRanges.length, toRanges.length);
    const phrases = await fetchContextualAlignmentPhrases(fromText, fromRanges, sourceLanguage, targetLanguage);
    const contextualMap = fallback.map((indexes, index) => {
      const located = locateAlignedPhrase(toText, toRanges, phrases[index], indexes);
      return located.indexes;
    });
    const inverse = invertWordMap(contextualMap, toRanges.length);
    if (alignment.newsMode) {
      alignment.sourceToEnglish = contextualMap;
      alignment.englishToSource = inverse;
    } else {
      alignment.englishToSource = contextualMap;
      alignment.sourceToEnglish = inverse;
    }
    alignment.alignedWordCount = contextualMap.reduce((count, indexes) => count + indexes.length, 0);
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

  function applyReaderWordHighlight(alignment, speakingPane, charIndex, spokenText = "") {
    if (!alignment) return;
    const speakingRanges = speakingPane === "source" ? alignment.sourceRanges : alignment.englishRanges;
    const renderedText = speakingPane === "source" ? alignment.sourceText : alignment.englishText;
    const boundaryRanges = wordRanges(spokenText || renderedText, speakingPane === "source" ? alignment.sourceLanguage : "en");
    const activeIndex = activeWordIndexForChar(spokenText || renderedText, charIndex, boundaryRanges);
    const mappedIndexes = speakingPane === "source"
      ? alignment.sourceToEnglish[activeIndex] || []
      : alignment.englishToSource[activeIndex] || [];
    const sourceIndexes = speakingPane === "source" ? [activeIndex] : mappedIndexes;
    const englishIndexes = speakingPane === "english" ? [activeIndex] : mappedIndexes;
    const targets = normalizeHighlightTargets([
      { id: "bookSourceSentence", text: alignment.sourceText },
      { id: "bookEnglishSentence", text: alignment.englishText }
    ], "");
    state.activeHighlights = targets;
    els.bookSourceSentence.innerHTML = highlightedTextHtml(
      alignment.sourceText,
      sourceIndexes,
      speakingPane === "source" ? "active" : "translation-active",
      alignment.sourceRanges
    );
    els.bookEnglishSentence.innerHTML = highlightedTextHtml(
      alignment.englishText,
      englishIndexes,
      speakingPane === "english" ? "active" : "translation-active",
      alignment.englishRanges
    );
    if (mappedIndexes.length) {
      clearCorrespondingHighlights();
    } else {
      applyCorrespondingHighlight([
        { id: speakingPane === "source" ? "bookEnglishSentence" : "bookSourceSentence" }
      ]);
    }
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

  async function sharedBookTranslation(key, run) {
    if (state.bookTranslationCache.has(key)) return state.bookTranslationCache.get(key);
    if (state.bookTranslationPromises.has(key)) return state.bookTranslationPromises.get(key);
    const promise = Promise.resolve()
      .then(run)
      .then((value) => {
        if (value) rememberBookTranslation(key, value);
        return value;
      })
      .finally(() => state.bookTranslationPromises.delete(key));
    state.bookTranslationPromises.set(key, promise);
    return promise;
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
    return sharedBookTranslation(key, async () => {
      const translated = await translateFromEn(english, language);
      return translated || english;
    });
  }

  async function ensureNewsEnglishSentence(sourceText, language = state.language) {
    const key = `en:${bookTranslationKey(sourceText, language)}`;
    return sharedBookTranslation(key, async () => {
      const translated = await translateToEn(sourceText, language);
      return translated || sourceText;
    });
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

  function formatGutenbergAuthorName(value) {
    const clean = normalizeSpaces(value);
    const parts = clean.split(",").map((part) => part.trim()).filter(Boolean);
    if (parts.length !== 2 || /\(|\)/.test(clean)) return clean;
    return `${parts[1]} ${parts[0]}`;
  }

  function inferBookGenres(values) {
    const haystack = normalizeBookSearchValue(cleanBookStringList(values).join(" "));
    const keywordMap = {
      adventure: ["adventure", "pirate", "sea stories"],
      autobiography: ["autobiograph"],
      biography: ["biograph"],
      childrens: ["children", "juvenile"],
      comedy: ["comedy", "humorous"],
      drama: ["drama", "plays"],
      fantasy: ["fantasy", "fairy tale"],
      fiction: ["fiction", "novels"],
      horror: ["horror", "gothic"],
      memoir: ["memoir"],
      mystery: ["mystery", "detective", "crime"],
      nonfiction: ["nonfiction", "non fiction"],
      philosophy: ["philosoph"],
      poetry: ["poetry", "poems"],
      satire: ["satire", "satirical"],
      "science-fiction": ["science fiction"],
      shorts: ["short stories", "fables"],
      spirituality: ["spiritual", "religion"],
      travel: ["travel"]
    };
    return Object.entries(keywordMap)
      .filter(([, keywords]) => keywords.some((keyword) => haystack.includes(normalizeBookSearchValue(keyword))))
      .map(([genre]) => genre);
  }

  function gutenbergTextUrls(formats) {
    if (!formats || typeof formats !== "object") return [];
    const entries = Object.entries(formats)
      .filter(([format, url]) => /^https?:\/\//i.test(url) && /^text\/(plain|html)/i.test(format));
    const rank = ([format]) => {
      if (/text\/plain.*utf-8/i.test(format)) return 0;
      if (/text\/plain/i.test(format)) return 1;
      return 2;
    };
    return entries.sort((left, right) => rank(left) - rank(right)).map(([, url]) => url);
  }

  function guidedBookForGutenbergId(id) {
    return GUIDED_BOOKS.find((book) => book.gutenbergId === Number(id)) || null;
  }

  function normalizeGutendexBook(rawBook) {
    const gutenbergId = Number.parseInt(rawBook?.id, 10) || 0;
    if (!gutenbergId || rawBook?.media_type !== "Text") return null;
    const guided = guidedBookForGutenbergId(gutenbergId);
    const subjects = cleanBookStringList(rawBook.subjects);
    const bookshelves = cleanBookStringList(rawBook.bookshelves);
    const author = cleanBookStringList(rawBook.authors?.map((person) => formatGutenbergAuthorName(person?.name)))
      .join(", ");
    return normalizeBookRecord({
      source: "gutenberg",
      gutenbergId,
      title: normalizeSpaces(rawBook.title),
      author,
      summary: normalizeSpaces(rawBook.summaries?.[0]),
      subjects,
      bookshelves,
      genres: guided?.genres?.length ? guided.genres : inferBookGenres([...subjects, ...bookshelves]),
      textUrls: gutenbergTextUrls(rawBook.formats),
      level: guided?.level || "",
      wordCount: guided?.wordCount || 0,
      estimatedGrade: guided?.estimatedGrade ?? null,
      averageSentenceWords: guided?.averageSentenceWords ?? null
    });
  }

  async function fetchJsonWithProxies(url, label) {
    const failures = [];
    const candidates = PROXY_CANDIDATES.filter((candidate) => candidate.name !== "Jina");
    const waves = [candidates.slice(0, 2), candidates.slice(2)];
    const fetchCandidate = async (proxy, signal) => {
      const response = await withTimeout(
        fetch(proxy.build(url), { cache: "no-store", signal }),
        BOOK_FETCH_TIMEOUT_MS,
        `${proxy.name} ${label}`
      );
      if (!response.ok) throw new Error(`${response.status}`);
      let text = await withTimeout(response.text(), BOOK_FETCH_TIMEOUT_MS, `${proxy.name} body`);
      if (proxy.unwrap) text = proxy.unwrap(text);
      const payload = JSON.parse(text);
      if (!payload || typeof payload !== "object") throw new Error("invalid JSON");
      return { payload, proxy: proxy.name };
    };
    for (const wave of waves) {
      const controllers = wave.map(() => new AbortController());
      try {
        const result = await Promise.any(wave.map((proxy, index) => (
          fetchCandidate(proxy, controllers[index].signal).catch((error) => {
            failures.push(`${proxy.name}: ${error.message}`);
            throw error;
          })
        )));
        controllers.forEach((controller) => controller.abort());
        return result;
      } catch {
        controllers.forEach((controller) => controller.abort());
        // Continue to the fallback proxy wave.
      }
    }
    throw new Error(`${label} failed: ${failures.slice(0, 3).join(" | ")}`);
  }

  function gutenbergCatalogUrl(page = state.bookPage, query = state.bookSearch, genre = state.bookGenre) {
    const params = new URLSearchParams({
      languages: "en",
      copyright: "false",
      mime_type: "text/",
      sort: "popular",
      page: String(Math.max(1, Number.parseInt(page, 10) || 1))
    });
    const cleanQuery = normalizeSpaces(query);
    if (cleanQuery) params.set("search", cleanQuery);
    if (BOOK_GENRES[genre]) params.set("topic", BOOK_GENRES[genre]);
    return `${GUTENDEX_BOOKS_URL}?${params.toString()}`;
  }

  async function fetchGutenbergCatalogPage(page = state.bookPage, query = state.bookSearch, genre = state.bookGenre) {
    const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
    const { payload, proxy } = await fetchJsonWithProxies(
      gutenbergCatalogUrl(safePage, query, genre),
      "Project Gutenberg catalog"
    );
    const books = dedupeBooks((Array.isArray(payload.results) ? payload.results : []).map(normalizeGutendexBook).filter(Boolean));
    if (!books.length) throw new Error("No Project Gutenberg books found");
    return {
      books,
      proxy: `Gutendex via ${proxy}`,
      page: safePage,
      hasNext: Boolean(payload.next),
      hasPrevious: Boolean(payload.previous)
    };
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

    if (state.bookShelfKind === "gutenberg") {
      const genreText = state.bookGenre ? `${genreLabel()} ` : "";
      setStatus(cleanQuery
        ? `Searching ${genreText}Project Gutenberg for "${cleanQuery}"`
        : `Loading ${genreText}Project Gutenberg page ${page}`);
      try {
        const result = await fetchGutenbergCatalogPage(page, cleanQuery, state.bookGenre);
        state.bookPage = result.page;
        state.bookHasNextPage = result.hasNext;
        state.bookHasPreviousPage = result.hasPrevious;
        state.bookBooks = result.books;
        els.bookPageInput.value = String(result.page);
        renderBookShelf();
        setStatus(cleanQuery
          ? `Found ${result.books.length} Project Gutenberg books via ${result.proxy}`
          : `Loaded ${result.books.length} Project Gutenberg books via ${result.proxy}`);
      } catch (error) {
        state.bookBooks = [];
        renderBookShelf();
        setStatus(cleanQuery ? `No Project Gutenberg books found for "${cleanQuery}"` : error.message);
      }
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
    if (isNewsMode()) {
      els.newsLanguageSelect.value = state.language;
      populateNewsSourceSelect();
      return;
    }
    const paged = state.bookShelfKind === "library" || state.bookShelfKind === "gutenberg";
    const levelsAvailable = state.bookShelfKind === "guided" || state.bookShelfKind === "favorites";
    els.bookShelfViewSelect.value = state.bookShelfKind;
    els.bookGenreSelect.value = state.bookGenre;
    els.bookLevelSelect.value = state.bookLevel;
    els.bookPageInput.disabled = !paged;
    els.bookPrevPageBtn.disabled = !paged || !state.bookHasPreviousPage;
    els.bookNextPageBtn.disabled = !paged || !state.bookHasNextPage;
    els.bookGenreSelect.disabled = state.bookShelfKind === "favorites";
    els.bookLevelSelect.disabled = !levelsAvailable;
    els.bookLevelNote.hidden = !levelsAvailable;
  }

  function bookShelfTitle() {
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
    const genreText = state.bookGenre ? `${genreLabel()} ` : "";
    const sourceText = state.bookShelfKind === "gutenberg" ? "Project Gutenberg" : "Standard Ebooks";
    return cleanQuery
      ? `${genreText}${sourceText} "${cleanQuery}"`
      : `${genreText}${sourceText} page ${state.bookPage}`;
  }

  function renderBookShelf() {
    if (!els.bookShelf) return;
    updateBookShelfControlState();
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
              <span class="book-card-author">${escapeHtml(article.sourceLabel || article.author || "News")}</span>
            </button>
            <span class="book-card-meta">${escapeHtml(date)} · current article</span>
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
          : state.bookShelfKind === "gutenberg"
            ? (cleanQuery ? "No Project Gutenberg books match this search." : "Load the Project Gutenberg catalog to begin.")
            : (cleanQuery ? "No matching books found." : "Load a Standard Ebooks shelf page to begin.");
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
    if (!book?.id || book.kind === "news") return;
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
      .filter((sentence) => sentence.length >= 2 && sentence.length <= 700 && !isNewsNoise(sentence));
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

  async function fetchAndParseBookUncached(book) {
    if (book?.kind === "news") {
      return fetchAndParseNewsArticle(book);
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
    return identity ? `${book?.kind === "news" ? "news" : "book"}:${identity}` : "";
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
      const persisted = await readPersistentReaderDocument(key);
      if (persisted) {
        rememberReaderDocument(key, persisted);
        return persisted;
      }
      const parsed = await fetchAndParseBookUncached(book);
      if (parsed) {
        rememberReaderDocument(key, parsed);
        writePersistentReaderDocument(key, parsed);
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
    if (isNewsMode()) return "Live text news";
    if (state.bookShelfKind === "guided") return "Curated public-domain levels";
    if (state.bookShelfKind === "gutenberg") return "Project Gutenberg via Gutendex";
    if (state.bookShelfKind === "favorites") return "Saved books";
    return "Standard Ebooks";
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
      bookLevelInfo(book)?.label || "",
      bookDifficultySummary(book)
    ].filter(Boolean).join(" · ");
    els.bookReaderMeta.textContent = book.kind === "news"
      ? `${book.sourceLabel || book.author || "News"} · ${formatNewsDate(book.publishedAt)}`
      : bookMeta;
    els.bookSourceLink.href = book.link || STANDARD_EBOOKS_LIST_URL;
    els.bookSourceLink.textContent = book.kind === "news" ? "Original article" : bookSourceLabel(book);
    els.bookChapterLabel.textContent = book.kind === "news" ? "Section" : "Chapter";
    els.bookEnglishLabel.textContent = book.kind === "news" ? "English translation" : "English original";
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
          .then((pair) => ensureReaderAlignment(pair, language, newsMode))
          .catch((error) => console.warn("Sentence prefetch failed:", error));
      });
    }, 220);
  }

  async function renderBookSentence() {
    const sentence = currentBookSentence();
    const language = activeLanguage();
    const languageKey = state.language;
    const newsMode = isNewsMode() || state.bookLoadedBook?.kind === "news";
    els.bookSourceLabel.textContent = language.label;
    els.bookSourceSentence.lang = sourceLangCode();
    els.bookSourceSentence.dir = language.dir;
    if (!sentence) {
      els.bookSourceSentence.textContent = isNewsMode() ? "Select a news article to begin." : "Select a book to begin.";
      els.bookEnglishSentence.textContent = isNewsMode() ? "The English translation will appear here." : "The English original will appear here.";
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
    els.bookSourceSentence.textContent = pair.source;
    els.bookEnglishSentence.textContent = pair.english;
    ensureReaderAlignment(pair, languageKey, newsMode);
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
    if (!book?.link) throw new Error(isNewsMode() ? "Missing article link" : "Missing book link");
    stopSpeech();
    state.bookLoadedBook = book;
    state.bookSentences = [];
    state.bookChapters = [];
    state.bookCurrentIndex = 0;
    renderBookReaderShell();
    els.bookSourceSentence.textContent = book.kind === "news" ? "Loading current article..." : "Loading book text...";
    els.bookEnglishSentence.textContent = book.title;
    setStatus(`Loading ${book.title}`);

    let parsed = null;
    let pendingFullDocument = null;
    if (book.kind === "news") {
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
        : state.bookShelfKind === "gutenberg"
          ? "Project Gutenberg"
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
    els.bookShelfControls.hidden = isNewsMode();
    els.newsShelfControls.hidden = !isNewsMode();
    els.bookLevelNote.hidden = isNewsMode() || !["guided", "favorites"].includes(state.bookShelfKind);
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
    els.bookLevelNote.hidden = true;
    els.bookShelf.hidden = true;
    els.bookReader.hidden = false;
    els.bookShelfBtn.hidden = false;
    els.bookPrevSentenceBtn.hidden = false;
    els.bookPlayBtn.hidden = false;
    els.bookNextSentenceBtn.hidden = false;
    els.bookAudioSettingsToggle.hidden = false;
  }

  function setBookMode(enabled, contentMode = state.contentMode) {
    const nextMode = contentMode === "news" ? "news" : "books";
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
    els.bookToggle.setAttribute("aria-pressed", String(state.bookMode && !isNewsMode()));
    els.newsToggle.setAttribute("aria-pressed", String(state.bookMode && isNewsMode()));
    if (state.bookMode) {
      els.bookLanguageSelect.value = state.language;
      els.newsLanguageSelect.value = state.language;
      populateNewsSourceSelect();
      syncBookAudioControlsFromSettings();
      updateSettingLabels();
      showBookShelf();
      const loadShelf = isNewsMode() ? loadNewsFeed() : ensureBookShelfLoaded();
      loadShelf.catch((error) => {
        setStatus(error.message || (isNewsMode() ? "News feed failed" : "Book shelf failed"));
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
    const language = activeLanguage();
    const languageKey = state.language;
    const newsMode = isNewsMode() || state.bookLoadedBook?.kind === "news";
    const pair = await readerSentencePair(sentence, languageKey, newsMode);
    if (token !== state.playToken || !state.bookPlaying) return;

    els.bookSourceSentence.textContent = pair.source;
    els.bookEnglishSentence.textContent = pair.english;
    const alignment = ensureReaderAlignment(pair, languageKey, newsMode);
    await Promise.race([alignment.enrichmentPromise, delayPlain(700)]);
    if (token !== state.playToken || !state.bookPlaying) return;
    setStatus(`${language.label} sentence ${state.bookCurrentIndex + 1}`);
    await speakText(pair.source, language.speechLang, Number(els.bookSourceRate.value), token, {
      alignment,
      speakingPane: "source"
    });
    await delay(Number(els.gapMs.value), token);
    if (token !== state.playToken || !state.bookPlaying) return;

    if (!els.bookReadEnglish.checked) return;
    setStatus(`English sentence ${state.bookCurrentIndex + 1}`);
    await speakText(pair.english, "en-US", Number(els.bookEnRate.value), token, {
      alignment,
      speakingPane: "english"
    });
    await delay(Number(els.gapMs.value), token);
  }

  async function startBookPlayback() {
    if (state.bookPlaying) return;
    if (!state.bookSentences.length) {
      setStatus(isNewsMode() ? "Load a news article first" : "Load a book first");
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
        if (nextIndex < 0 || nextIndex >= state.bookSentences.length) break;
        setBookIndex(nextIndex, { render: false, save: true });
      }
    } catch (error) {
      failed = true;
      setStatus(playbackErrorMessage(error, isNewsMode() ? "News playback failed" : "Book playback failed"));
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

    setStatus(`#${entry.rank} ${language.label}`);
    await speakText(source, language.speechLang, Number(els.ruRate.value), token);
    await delay(Number(els.gapMs.value), token);
    const en = await meaningPromise;
    if (token !== state.playToken) return;

    const englishSpeech = makeSpokenEnglish(en, entry);
    if (englishSpeech && token === state.playToken) {
      setStatus(`#${entry.rank} English`);
      await speakText(englishSpeech, "en-US", Number(els.enRate.value), token);
      await delay(Number(els.gapMs.value), token);
    }
  }

  async function speakText(text, lang, rate, token, options = {}) {
    if (token !== state.playToken || !text) return;
    await speakWithSystemVoice(text, lang, rate, token, options);
  }

  async function prepareSpeechEngine() {
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") {
      throw new Error("Speech synthesis unavailable");
    }
    if (!syncAvailableVoices()) {
      refreshVoices().catch((error) => {
        console.warn("Voice refresh failed:", error);
      });
    }
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
    if (!syncAvailableVoices()) {
      refreshVoices().catch((error) => {
        console.warn("Voice refresh failed:", error);
      });
    }
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
      const applyHighlight = (charIndex) => {
        if (options.alignment) {
          applyReaderWordHighlight(options.alignment, options.speakingPane, charIndex, spokenText);
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
        applyHighlight(0);
        if (!options.alignment) applyCorrespondingHighlight(options.correspondingTargets);
      };
      utterance.onboundary = (event) => {
        if (event.name && event.name !== "word") return;
        applyHighlight(event.charIndex || 0);
      };
      utterance.onend = () => {
        window.clearTimeout(timeout);
        clearHighlight();
        clearCorrespondingHighlights();
        resolve();
      };
      utterance.onerror = (event) => {
        window.clearTimeout(timeout);
        clearHighlight();
        clearCorrespondingHighlights();
        reject(new Error(event.error || "Speech synthesis error"));
      };
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
      window.setTimeout(() => window.speechSynthesis.resume(), 0);
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

  function syncAvailableVoices() {
    if (!window.speechSynthesis) return false;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return false;
    state.voices = voices;
    updateVoiceSelectors();
    return true;
  }

  async function refreshVoices() {
    if (!window.speechSynthesis) return;
    if (syncAvailableVoices()) return;
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await delayPlain(120);
      if (syncAvailableVoices()) return;
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

    els.languageSelect.addEventListener("change", async () => {
      stopSpeech();
      state.language = LANGUAGES[els.languageSelect.value] ? els.languageSelect.value : "ru";
      state.currentPos = 0;
      state.playDirection = 1;
      els.bookLanguageSelect.value = state.language;
      els.newsLanguageSelect.value = state.language;
      updateSettingLabels();
      updateVoiceSelectors();
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
      state.language = LANGUAGES[els.newsLanguageSelect.value] ? els.newsLanguageSelect.value : "ru";
      els.languageSelect.value = state.language;
      els.bookLanguageSelect.value = state.language;
      state.currentPos = 0;
      state.playDirection = 1;
      state.newsSearch = "";
      els.newsSearchInput.value = "";
      populateNewsSourceSelect();
      updateSettingLabels();
      updateVoiceSelectors();
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
      if (!["library", "gutenberg"].includes(state.bookShelfKind)) return;
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
      if (!["library", "gutenberg"].includes(state.bookShelfKind)) return;
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
      if (!["library", "gutenberg"].includes(state.bookShelfKind)) return;
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
        savePrefs();
      });
    });

    els.bookReadEnglish.addEventListener("change", () => {
      savePrefs();
      setStatus(els.bookReadEnglish.checked ? "English TTS enabled" : "English TTS skipped");
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
      state.voicePrefs.en = els.enVoiceSelect.value;
      savePrefs();
    });

    els.enLangSelect.addEventListener("change", () => {
      state.enLang = els.enLangSelect.value;
      state.voicePrefs.en = "";
      updateVoiceSelectors();
      savePrefs();
    });

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
    els.newsLanguageSelect.value = state.language;
    populateNewsSourceSelect();
    els.bookShelfViewSelect.value = state.bookShelfKind;
    els.bookGenreSelect.value = state.bookGenre;
    els.bookLevelSelect.value = state.bookLevel;
    els.bandSelect.value = state.band;
    els.enLangSelect.value = state.enLang;
    syncBookAudioControlsFromSettings();
    updateShuffleButton();
    updateSettingLabels();
    updateVoiceSelectors();
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
