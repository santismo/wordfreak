# Notices

Wordfreak code is MIT licensed. The generated vocabulary data has separate source licenses and attribution requirements.

## Russian Frequency Ranking

The core ranking is derived from the Wiktionary appendix:

https://en.wiktionary.org/wiki/Appendix:Frequency_dictionary_of_the_modern_Russian_language_(the_Russian_National_Corpus)

The appendix cites:

O. N. Lyashevskaya and S. A. Sharov, Frequency list of lemmata.

Wiktionary text is available under Creative Commons Attribution-ShareAlike and GFDL terms. See Wiktionary for full terms.

## OpenRussian

English glosses and stress-marked forms are derived from OpenRussian dictionary CSV data:

https://github.com/Badestrand/russian-dictionary

OpenRussian data is licensed under Creative Commons Attribution-ShareAlike 4.0 International.

## Farsi Frequency Ranking

The Farsi ranking is derived from the Persian Words Frequency Database, using its Persian Wikipedia corpus:

https://github.com/behnam/persian-words-frequency

The Persian Words Frequency Database is licensed under Creative Commons Attribution-ShareAlike 3.0.

## Machine Translation Cache

Some English glosses are generated through the Google Translate web endpoint and stored in:

- `data/ru-machine-translations.json`
- `data/fa-machine-translations.json`

Treat these glosses as convenience study aids, not authoritative dictionary entries.

## Generated Deck

`data/ru-core.json` and `data/fa-core.json` combine and adapt the sources above. Treat the generated data as CC-BY-SA-compatible material and preserve this notice when sharing modified versions.

## TTS

The app uses the browser Web Speech API by default. Optional Piper web TTS loads from:

https://www.npmjs.com/package/@mintplex-labs/piper-tts-web
