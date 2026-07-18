# Wordfreak

Wordfreak is a mobile-first vocabulary player for GitHub Pages. It loads frequency-ranked Russian, Farsi, Spanish, French, Hindi, Japanese, or Korean decks, shows the focused source word beside its English meaning, and autoplays source-language text-to-speech followed by English text-to-speech.
https://santismo.github.io/wordfreak/

Offline vocabulary edition for SPCK and airplane-mode use:

https://santismo.github.io/wordfreak/wordfreak-offline/

## Features

- Russian National Corpus-based core deck, about 20k unique words
- Farsi deck from a Persian Wikipedia frequency corpus, 20k words
- Spanish deck from cleaned subtitle-frequency forms, Wiktionary-derived glosses, and machine-translation fallback, 20k words
- French, Japanese, and Korean decks from cleaned OpenSubtitles frequency lists, 20k words each
- Hindi deck from a FrequencyWords Hindi subtitle-frequency list, about 19.7k words
- English glosses from dictionary data, manual high-frequency patches, and machine-translation cache files
- Live browser translation fallback for missing glosses
- Ordered and shuffle playback
- Language and frequency-band controls in the settings panel
- Dense two-column virtual list for mobile scrolling
- Dual-language book reader with guided difficulty levels, genre filtering, partial title/author search, and favorite shelves
- Eighty fast curated Project Gutenberg selections across four guided levels, plus a searchable, paginated Standard Ebooks public-domain library
- Current text-news reader using Meduza, VOA Persian, Radio Farda, DW Español, RFI, France 24, BBC Hindi, NHK, VOA Korean, and optional Google News feeds
- News headline filtering, source selection, refresh, random article loading, and full article text browsing without favorites
- Immediate word-by-word pairing during book and news playback: each spoken word gets a monotonic best-guess counterpart right away, then contextual translation refines it to a one-to-four-word phrase when it finds a stronger match
- Layout-stable reader highlights use positioned overlays, with bidirectional contextual alignment and English auxiliary grouping for Russian and Farsi
- Speech and translation skip punctuation-only fragments, including Persian/Arabic punctuation, so a voice never reads a symbol as a word
- Reader translations reject unchanged or wrong-script provider responses and never cache the original sentence as a successful translation
- Optional English TTS skip setting shared by the book and news readers
- Book and news pacing from 10–200 WPM keeps each word at a natural voice rate and changes the pause between words
- News cards omit redundant source labels after the feed is selected, and reader text decodes HTML entities and removes stray Arabic/Persian combining marks
- Faster reader startup through a full-page CORS route ahead of fallback readers, persistent document/translation caching, shelf/sentence preloading, and quick news previews while full articles load
- Canonical Standard Ebooks subject pages for reliable genre filtering; Google Persian results are restricted to Persian-script headlines
- System TTS with selectable voices, page volume, speed, and gap controls
- Dedicated GitHub Pages desktop view with a wider reading layout, language-matched system voices, and optional browser-Piper TTS where a matching model exists
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
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Desktop GitHub Pages view

Open [`desktop.html`](desktop.html) for the wider desktop layout. Its settings include an optional Piper browser engine for Russian, Farsi, Spanish, French, Hindi, and English; the matching model is downloaded only after selecting it. Japanese and Korean, plus the normal mobile page, use their matching system voices.

## Data

The generated data files are `data/ru-core.json`, `data/fa-core.json`, `data/es-core.json`, `data/fr-core.json`, `data/hi-core.json`, `data/ja-core.json`, and `data/ko-core.json`.

Sources:

- Russian frequency order: Russian National Corpus frequency dictionary via Wiktionary
- English glosses and stress data: OpenRussian dictionary data
- Farsi frequency order: Persian Words Frequency Database, Persian Wikipedia corpus
- Spanish frequency order and Wiktionary-derived glosses: Doozan Spanish data
- French, Japanese, and Korean frequency order: Top OpenSubtitles cleaned word frequency lists
- Hindi frequency order: FrequencyWords Hindi OpenSubtitles list
- Manual patch list: small Wordfreak-maintained high-frequency fixes
- Machine translation cache files for remaining English glosses

See `NOTICE.md` for attribution and licensing details.
