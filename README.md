# Wordfreak

Wordfreak is a mobile-first Russian vocabulary player for GitHub Pages. It loads a frequency-ranked Russian deck, shows the focused Russian word beside its English meaning, and autoplays Russian text-to-speech followed by English text-to-speech.
https://santismo.github.io/wordfreak/

## Features

- Russian National Corpus-based core deck, about 20k unique words
- English glosses from OpenRussian where available
- Live browser translation fallback for missing glosses
- Ordered and shuffle playback
- Frequency bands: 500, 1.5k, 3k, 5k, 10k, 16k, 20k
- Dense two-column virtual list for mobile scrolling
- System TTS by default, optional Piper web TTS
- PWA manifest and service worker for home-screen use

## Local Use

```bash
python3 scripts/build_ru_data.py
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Data

The generated data file is `data/ru-core.json`.

Sources:

- Russian frequency order: Russian National Corpus frequency dictionary via Wiktionary
- English glosses and stress data: OpenRussian dictionary data
- Manual patch list: small Wordfreak-maintained high-frequency fixes

See `NOTICE.md` for attribution and licensing details.
