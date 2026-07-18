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
- Sixteen measured public-domain starter-to-stretch selections, including short stories and children's classics
- Full Standard Ebooks and Project Gutenberg catalog browsing, with Gutendex providing Gutenberg metadata and live text formats
- Automatic English readability estimates for newly opened catalog books; levels combine sentence/word complexity with total length and are not formal CEFR ratings
- Current text-news reader using Meduza, VOA Persian, DW Español, RFI, France 24, BBC Hindi, NHK, VOA Korean, and optional Google News feeds
- News headline filtering, source selection, refresh, random article loading, and full article text browsing without favorites
- Synchronized English sentence highlighting during target-language book and news playback
- Optional English TTS skip setting shared by the book and news readers
- System TTS with selectable voices, page volume, speed, and gap controls
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
