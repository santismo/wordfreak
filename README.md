# Wordfreak

Wordfreak is a mobile-first vocabulary player for GitHub Pages. It pairs frequency-ranked Russian, Farsi, Spanish, French, Hindi, Japanese, and Korean decks with a curated English Vernacular mode for rare, expressive words. The focused word appears beside its meaning, and autoplay reads the word followed by its English definition.
https://santismo.github.io/wordfreak/

Offline vocabulary edition for SPCK and airplane-mode use:

https://santismo.github.io/wordfreak/wordfreak-offline/

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
- Current text-news reader using Meduza, VOA Persian, Radio Farda, DW Español, RFI, France 24, BBC Hindi, NHK, VOA Korean, and optional Google News feeds
- News headline filtering, source selection, refresh, random article loading, and full article text browsing without favorites
- Immediate word-by-word pairing during book and news playback: each spoken word gets a monotonic best-guess counterpart right away, then contextual translation refines it to a one-to-four-word phrase when it finds a stronger match
- Layout-stable reader highlights use positioned overlays, with bidirectional contextual alignment and English auxiliary grouping for Russian and Farsi
- Speech and translation skip punctuation-only fragments, including Persian/Arabic punctuation, so a voice never reads a symbol as a word
- Reader translations reject unchanged or wrong-script provider responses and never cache the original sentence as a successful translation
- Three ordered speech tracks with a visible English/definition skip, available in vocabulary, book, and news playback
- Book and news speed from 10–200 WPM maps to an approximate continuous voice rate, keeping each sentence in one uninterrupted utterance for natural prosody
- News cards omit redundant source labels after the feed is selected, and reader text decodes HTML entities and removes stray Arabic/Persian combining marks
- Faster reader startup through a full-page CORS route ahead of fallback readers, persistent document/translation caching, shelf/sentence preloading, and quick news previews while full articles load
- Canonical Standard Ebooks subject pages for reliable genre filtering; Google Persian results are restricted to Persian-script headlines
- Per-track System/iPhone or Piper selection, with remembered system voices, page volume, speed, and gap controls
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

## Optional Piper voices

System voices remain the default. Each of the three ordered speech tracks can use an installed System/iPhone voice or Piper, and optional tracks can be turned Off. Choosing Piper makes the first Play lazily download that track's voice and speech runtime: about 89 MB for Russian, Farsi, or English, and about 55 MB for Spanish or French. The model files persist in that browser's private storage so later sessions do not repeat the model download; use **Clear downloaded Piper voices** in Settings to remove them. Hindi, Japanese, and Korean continue to use system voices.

Wordfreak allows at most two Piper tracks at once; a third track can still use a System/iPhone voice. This limit keeps model memory bounded while permitting combinations such as Russian Piper, English Piper, and Farsi on an iPhone voice. Reader sentences are synthesized whole for fluid prosody; text longer than 320 characters falls back to the system voice. Each active Piper voice runs in its own disposable worker, while all voices share a 6 MB in-memory audio cache. Workers are released on Stop, language/engine changes, page exit, timeout, or 90 seconds idle.

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
- English rarity guardrails: wordfreq; the final order is curated and is not presented as a frequency ranking
- Air Force Handbook 1 reader text: official U.S. Air Force e-Publishing PDF dated 15 February 2025
- Manual patch list: small Wordfreak-maintained high-frequency fixes
- Machine translation cache files for remaining English glosses

See `NOTICE.md` for attribution and licensing details.
