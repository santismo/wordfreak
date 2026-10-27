# Wordfreak

Wordfreak is a mobile-first vocabulary player for GitHub Pages. It pairs frequency-ranked Russian, Farsi, Spanish, French, Hindi, Japanese, and Korean decks with a curated English Vernacular mode for rare, expressive words. The focused word appears beside its meaning, and autoplay reads the word followed by its English definition.
https://santismo.github.io/wordfreak/

Offline vocabulary edition for SPCK and airplane-mode use:

https://santismo.github.io/wordfreak/wordfreak-offline/

## Word Freak Improved

Open [Improved Reader](https://santismo.github.io/wordfreak/improved.html) for the new book-focused reading page. [Classic](https://santismo.github.io/wordfreak/) stays available at its original address, with its vocabulary, audio, news and knowledge modes.

- Continuous vertical reading, with Times New Roman by default; Georgia, Palatino and system sans; adjustable type size and line spacing; Paper, Sepia, Night and Black themes, with Black as the default.
- Separate **Read in** and **Translate into** settings for English, Farsi, Russian, Spanish, French, Hindi, Japanese and Korean. Read full translated passages with proper right-to-left Farsi; use the lens for English or any other supported second language, including Farsi → Russian.
- Tap a word to place the magnifying glass, drag its discreet 44px touch handle to move it, and hold still for 480ms to fade into translation. The clear glass lens glides between words and stays within the selected word’s footprint; translations shrink to fit. Tap inside the glass, or hold over final punctuation, for the full sentence in a panel that reserves space below the page instead of covering text. Individual word translations shrink and wrap inside the glass; only sentences use the black liquid-glass bottom panel, without a visible language heading. The larger grip sits below the lens to keep your thumb clear, and navigation keeps the selected text above the sentence panel. Tap outside to dismiss. Arrow buttons move sequentially; a focused handle supports arrow keys, Enter for the word, and Shift+Enter for the sentence.
- Optional bottom controls: hold either arrow to advance at the speed slider’s rate (up to 300 steps/minute); tap the center to translate; hold it to toggle locked word translation; double-tap to switch to sentence navigation. Nearby translations preload through a single background worker. The lens has an edge-only refraction effect with a clear-rim fallback on browsers without SVG backdrop filters.
- Paragraph-sized translation requests preserve more context than isolated sentences. Nearby passages preload with a two-request concurrency limit. Direct source-to-target translation tries Google, Lingva, then MyMemory for short requests. Completed translations persist in the existing cache; invalid responses and failures are never cached, and failed passages have a Retry button.
- Existing book sources, favorites, document cache and progress are shared with Classic on the same browser/origin. Improved also remembers its last book and appearance settings. It loads no vocabulary deck or speech engine.
- Distraction-free mode fills the reading viewport on iPhone and requests browser fullscreen where supported. Native iPhone browser chrome is controlled by Safari; add the page to the Home Screen for the most immersive view.

Translations are machine-generated and need connectivity for uncached passages. Proper names, literary phrasing and ambiguous individual words can be imperfect; sentence translation provides context. Improved is a reading-focused mode; Classic retains the existing audio tools.

## Features

- English Vernacular mode with 3,500 rare, expressive, and precise words, definitions, available usage examples, and spoken study cues
- Four English collection depths—Core, Expanded, Deep cuts, and Complete—ordered editorially rather than by raw frequency
- Russian National Corpus-based core deck, about 20k unique words
- Farsi deck from a Persian Wikipedia frequency corpus, 20k words
- Spanish deck from cleaned subtitle-frequency forms, Wiktionary-derived glosses, and machine-translation fallback, 20k words
- French, Japanese, and Korean decks from cleaned OpenSubtitles frequency lists, 20k words each
- Hindi deck from a FrequencyWords Hindi subtitle-frequency list, about 19.7k words
- English glosses from dictionary data, manual high-frequency patches, and machine-translation cache files
- Live browser translation fallback for missing glosses
- Ordered and shuffle playback
- Language controls with frequency bands for study languages and collection-depth controls for English
- Dense two-column virtual list for mobile scrolling
- Dual-language book reader with guided difficulty levels, genre filtering, partial title/author search, and favorite shelves
- Eighty fast curated Project Gutenberg selections across four guided levels, plus a searchable, paginated Standard Ebooks public-domain library
- Official-handbooks shelf with the current Air Force Handbook 1, *Airman* (15 February 2025), bundled for reliable sentence navigation and linked to its official USAF PDF
- English Knowledge reader with continuous fact-to-fact playback, English-first optional translation speech, enriched topic discovery, adjustable On-this-day births/deaths, and attributed Wikipedia extracts
- Current text-news reader using Meduza, VOA Persian, Radio Farda, DW Español, RFI, France 24, BBC Hindi, NHK, VOA Korean, and optional Google News feeds
- News headline filtering, source selection, refresh, random article loading, and full article text browsing without favorites
- Optional Classical or Lo-fi study music across frequency/vocabulary, English Vernacular, book, and news modes, with its own transport, volume, and automatic speech ducking
- Live Wikimedia Commons collections with more than 500 Classical and Lo-fi source files as of 6 August 2026, strict per-track review/license checks, and visible source and Creative Commons attribution
- Immediate word-by-word pairing during book and news playback: each spoken word gets a monotonic best-guess counterpart right away, then contextual translation refines it to a one-to-four-word phrase when it finds a stronger match
- Layout-stable reader highlights use positioned overlays, with bidirectional contextual alignment and English auxiliary grouping for Russian and Farsi
- Speech and translation skip punctuation-only fragments, including Persian/Arabic punctuation, so a voice never reads a symbol as a word
- Reader translations reject unchanged or wrong-script provider responses and never cache the original sentence as a successful translation
- Three ordered speech tracks with a visible English/definition skip, available in vocabulary, book, and news playback
- Book and news speed from 10–200 WPM maps to an approximate continuous voice rate, keeping each sentence in one uninterrupted utterance for natural prosody
- News cards omit redundant source labels after the feed is selected, and reader text decodes HTML entities and removes stray Arabic/Persian combining marks
- Faster reader startup through a full-page CORS route ahead of fallback readers, persistent document/translation caching, shelf/sentence preloading, and quick news previews while full articles load
- Canonical Standard Ebooks subject pages for reliable genre filtering; Google Persian results are restricted to Persian-script headlines
- Per-track System/iPhone or Piper selection, with remembered system voices and per-language volume boosts alongside master volume, speed, and gap controls
- Opt-in Piper TTS for Russian, Farsi, Spanish, French, and English in normal browsers, the iPhone Home Screen app, and the desktop view
- Dedicated GitHub Pages desktop view with a wider reading layout and the same speech-engine controls as mobile
- First-tap speech preparation and a retry when browser speech synthesis stalls before starting
- Prev during playback switches into reverse through the current selected or shuffled order
- Concise English speech cues while still displaying full definitions
- PWA manifest and service worker for home-screen use

## Local Use

```bash
python3 scripts/build_ru_data.py
python3 scripts/build_fa_data.py
python3 scripts/build_es_data.py
python3 scripts/build_frequency_data.py all
python3 scripts/build_en_vernacular.py
# Optional: rebuild the bundled handbook from the pinned official PDF.
python3 scripts/build_afh1_data.py /path/to/afh1.pdf
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Optional study music

The music-note control opens an independent background player in every Wordfreak mode, including the frequency decks. Music is Off by default. Choose **Classical** or **Lo-fi**, then use the dedicated Previous, Play/Pause, Next, volume, and **Lower during speech** controls. Ducking temporarily lowers only the music while a System/iPhone or Piper track speaks.

Wordfreak discovers its study catalog through the Wikimedia Commons categories [Classical music from Free Music Archive](https://commons.wikimedia.org/wiki/Category:Classical_music_from_Free_Music_Archive) and [Lo-fi music from Free Music Archive](https://commons.wikimedia.org/wiki/Category:Lo-fi_music_from_Free_Music_Archive). Together they listed more than 500 source files on 6 August 2026. Commons is live, so availability can change. Before a track can enter the player, Wordfreak checks its media type, duration, Commons warning categories, and requires a recognized license on its file page; when recognizable embedded license metadata is present, it must agree with the page. Contradictory, noncommercial, and derivative-restricted entries are skipped. When Commons still marks a recording's license review as pending, Wordfreak says so beside the license instead of presenting it as independently verified. The current track always exposes its Commons source page and individual license; those per-track terms govern reuse.

Study music is online streaming. Remote Commons API responses and audio are not bundled with Wordfreak or added to its service-worker precache. Playback uses one HTML media element, with a small Web Audio gain path used only for the music-volume control and speech ducking; it does not load a second music engine or decode a whole collection into memory. Wordfreak is not affiliated with or endorsed by the Wikimedia Foundation, Free Music Archive, or the contributing artists.

## Optional Piper voices

System voices remain the default. Each of the three ordered speech tracks can use an installed System/iPhone voice or Piper, and optional tracks can be turned Off. Choosing Piper makes the first Play lazily download that track's voice and speech runtime: about 89 MB for Russian, Farsi, or English, and about 55 MB for Spanish or French. The model files persist in that browser's private storage so later sessions do not repeat the model download; use **Clear downloaded Piper voices** in Settings to remove them. Hindi, Japanese, and Korean continue to use system voices.

Wordfreak allows at most two Piper tracks at once; a third track can still use a System/iPhone voice. This limit keeps model memory bounded while permitting combinations such as Russian Piper, English Piper, and Farsi on an iPhone voice. Reader sentences are synthesized whole for fluid prosody; text longer than 320 characters falls back to the system voice. Each active Piper voice runs in its own disposable worker, while all voices share a 6 MB in-memory audio cache. Workers are released on Stop, language/engine changes, page exit, timeout, or 90 seconds idle.

Each language remembers its own 50–150% volume boost as it moves between speech tracks or engines. The boost multiplies the master volume at playback time, so it does not duplicate Piper clips or model work. Browser speech volume is capped at the device maximum; values above 100% raise a quieter track relative to a lower master setting but cannot exceed the iPhone's own maximum output.

Piper needs an internet connection on first use, WebAssembly, a secure page, and persistent Origin Private File System storage. GitHub Pages supplies the secure page; browser storage can still be evicted by the operating system. A failed Piper voice immediately falls back to the matching system voice and pauses retries for that model, avoiding repeated expensive starts on a constrained phone.

## Desktop GitHub Pages view

Open [`desktop.html`](desktop.html) for the wider desktop layout. It uses the same system/Piper engine setting and resource safeguards as the normal browser and Home Screen page.

## Data

The generated data files are `data/ru-core.json`, `data/fa-core.json`, `data/es-core.json`, `data/fr-core.json`, `data/hi-core.json`, `data/ja-core.json`, `data/ko-core.json`, `data/en-vernacular.json`, and `data/books/afh1-airman-2025.json`.

Sources:

- Russian frequency order: Russian National Corpus frequency dictionary via Wiktionary
- English glosses and stress data: OpenRussian dictionary data
- Farsi frequency order: Persian Words Frequency Database, Persian Wikipedia corpus
- Spanish frequency order and Wiktionary-derived glosses: Doozan Spanish data
- French, Japanese, and Korean frequency order: Top OpenSubtitles cleaned word frequency lists
- Hindi frequency order: FrequencyWords Hindi OpenSubtitles list
- English Vernacular definitions and examples: Princeton WordNet 3.0
- Knowledge reader: Wikimedia projects via the English Wikipedia Action API and "On this day" feed; individual cards link to their source page
- English rarity guardrails: wordfreq; the final order is curated and is not presented as a frequency ranking
- Air Force Handbook 1 reader text: official U.S. Air Force e-Publishing PDF dated 15 February 2025
- Manual patch list: small Wordfreak-maintained high-frequency fixes
- Machine translation cache files for remaining English glosses

See `NOTICE.md` for attribution and licensing details.

### Expanded Improved library

The Improved library supports combined genre/topic search and an In Word Freak / External libraries filter. Eight additional Gutenberg horror records include Machen, Blackwood, Hodgson, Chambers, Le Fanu, M. R. James and Lovecraft (existing titles are deduplicated). Clive Barker and Shirley Jackson entries open verified OverDrive borrowing pages; availability depends on the reader’s library. External entries have their own saved favorites.

Science and telecommunications resources include the IntechOpen 5G book and subject collections, 3GPP’s GSM/LTE/5G specifications index, the ETSI Release 18 TS 21.205 PDF, arXiv’s engineering archive and OpenStax science textbooks. These are explicitly external publisher/standards readers, not full texts imported into Word Freak. Sources were checked October 27, 2026. The glass lens only operates on books opened inside Word Freak.

### Sentence glass and external publications

Sentence mode outlines the actual inline sentence fragments, including wrapped and RTL lines. It hides the word lens and handle and keeps only the translation in the black glass dock. Colored edge highlights and RGB-separated SVG displacement enrich the word lens while keeping central glyphs clear; unsupported backdrop filters retain the CSS rim. Design references: https://github.com/dpawlikowski/liquid-glass and https://github.com/eirasmx/webglass (conceptual references; no third-party source copied).

The five chapters of IntechOpen’s *The Fifth Generation (5G) of Wireless Communication* (Ahmed Kishk, ed., 2019) now open as an attributed CC BY 3.0 text edition. Every chapter carries its author, source and license; the original is linked for diagrams, tables and equation layout. Rebuild the text snapshot with `python3 scripts/import-intechopen.py`.

Import PDF/TXT/Markdown/HTML from Library. Text and metadata persist in IndexedDB on the current device, with source-language selection and existing reading progress. PDF.js 6.4.299 is loaded on demand from jsDelivr; the first PDF import requires internet. Scanned, password-protected and DRM files are not supported, and mathematical/multicolumn layout may not survive text extraction. The ETSI PDF has a direct-read attempt with file-import fallback if the publisher blocks cross-origin access. Protected library loans still use the provider’s reader. Imported files remain local; requested translations send passages to the existing translation services.

### Sentence word pairs
Tap a word in the selected source sentence or its translation to highlight the matching word/phrase on both sides. Tapping either highlighted side clears the pair; selecting another word replaces it. Sentence navigation, dismissal and language/book changes clear both highlights and invalidate pending matches. Touch scrolling does not select a word. Source and translated tokens also support Enter/Space.

Matching uses direct word translation, limited language-aware inflection matching, and a bounded reverse-translation fallback. It does not assume equal word order or invent a pair by position. Some idioms and omitted words have no direct lexical counterpart; those leave only the tapped word marked and announce that no direct match was found. Matches and word lookups are cached in memory, with at most two reverse lookups in each batch.
