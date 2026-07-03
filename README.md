# Wordfreak

Wordfreak is a mobile-first vocabulary player for GitHub Pages. It loads frequency-ranked Russian, Farsi, or Spanish decks, shows the focused source word beside its English meaning, and autoplays source-language text-to-speech followed by English text-to-speech.
https://santismo.github.io/wordfreak/

## Features

- Russian National Corpus-based core deck, about 20k unique words
- Farsi deck from a Persian Wikipedia frequency corpus, 20k words
- Spanish deck from cleaned subtitle-frequency forms, Wiktionary-derived glosses, and machine-translation fallback, 20k words
- English glosses from dictionary data, manual high-frequency patches, and machine-translation cache files
- Live browser translation fallback for missing glosses
- Ordered and shuffle playback
- Language and frequency-band controls in the settings panel
- Dense two-column virtual list for mobile scrolling
- Dual-language book reader with genre filtering, partial title/author search, and favorite shelves
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
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Data

The generated data files are `data/ru-core.json`, `data/fa-core.json`, and `data/es-core.json`.

Sources:

- Russian frequency order: Russian National Corpus frequency dictionary via Wiktionary
- English glosses and stress data: OpenRussian dictionary data
- Farsi frequency order: Persian Words Frequency Database, Persian Wikipedia corpus
- Spanish frequency order and Wiktionary-derived glosses: Doozan Spanish data
- Manual patch list: small Wordfreak-maintained high-frequency fixes
- Machine translation cache files for remaining English glosses

See `NOTICE.md` for attribution and licensing details.
