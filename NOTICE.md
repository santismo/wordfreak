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

## Spanish Frequency Ranking And Glosses

The Spanish ranking and dictionary fallback are derived from Doozan Spanish data:

https://github.com/doozan/spanish_data

Wordfreak uses the cleaned Spanish frequency forms, the Spanish-English Wiktionary data, and the lemma frequency form map. Doozan Spanish data is licensed under Creative Commons Attribution 4.0. Its README credits the frequency source data to FrequencyWords under Creative Commons Attribution-ShareAlike 3.0, and the Spanish-English dictionary data to Wiktionary under Creative Commons Attribution-ShareAlike terms.

## French, Japanese, And Korean Frequency Ranking

The French, Japanese, and Korean rankings are derived from the Top OpenSubtitles Sentences cleaned word frequency lists:

https://github.com/orgtre/top-open-subtitles-sentences

These lists are built from the OpenSubtitles2018 corpus. The project README states that its code is licensed under Creative Commons Attribution 3.0 Unported and that the generated sentence and word lists come with the same license as the underlying corpus.

## Hindi Frequency Ranking

The Hindi ranking is derived from FrequencyWords:

https://github.com/hermitdave/FrequencyWords

Wordfreak uses the Hindi OpenSubtitles 2018 `hi_full.txt` list, filtered to clean Devanagari entries. The FrequencyWords README states MIT License for code and CC-BY-SA-4.0 for content.

## Machine Translation Cache

Some English glosses are generated through the Google Translate web endpoint and stored in:

- `data/ru-machine-translations.json`
- `data/fa-machine-translations.json`
- `data/es-machine-translations.json`
- `data/fr-machine-translations.json`
- `data/hi-machine-translations.json`
- `data/ja-machine-translations.json`
- `data/ko-machine-translations.json`

Treat these glosses as convenience study aids, not authoritative dictionary entries.

## English Vernacular Collection

Definitions and examples in `data/en-vernacular.json` are derived from Princeton WordNet 3.0:

https://wordnet.princeton.edu/

WordNet 3.0 Copyright 2006 by Princeton University. All rights reserved. WordNet 3.0 permits use, copying, modification, and distribution provided its copyright notice and license statements appear in copies. The software and database are provided “as is,” without express or implied warranties or representations, including merchantability, fitness for a particular purpose, and non-infringement. Princeton University’s name may not be used to advertise or publicize a distribution. Title to the WordNet copyright remains with Princeton University and must be preserved. The full license is available at:

https://wordnet.princeton.edu/license-and-commercial-use

The builder uses wordfreq only as a rarity guardrail; Wordfreak's displayed collection order is editorial and is not a frequency ranking:

https://github.com/rspeer/wordfreq

wordfreq software is Apache-2.0 licensed, and its included frequency data is distributed under Creative Commons Attribution-ShareAlike 4.0. Credit: Robyn Speer, *wordfreq* v3.0 (2022), DOI 10.5281/zenodo.7199437. wordfreq also credits the SUBTLEX authors and identifies SUBTLEX as freely available data. The Wordfreak manual seed list supplies the collection's leading editorial examples. Preserve this notice when redistributing the generated English deck.

Book and news sentence translations and moving word/phrase alignments are also generated live through public machine-translation endpoints and cached in the browser. Because languages do not map word-for-word, counterpart highlights are contextual study estimates and can occasionally be approximate or group two words together.

## Generated Deck

`data/ru-core.json`, `data/fa-core.json`, `data/es-core.json`, `data/fr-core.json`, `data/hi-core.json`, `data/ja-core.json`, and `data/ko-core.json` combine and adapt the sources above. Treat those generated decks as CC-BY-SA-compatible material and preserve this notice when sharing modified versions. The English deck additionally contains WordNet-derived text and is subject to the English Vernacular Collection notice above.

## TTS

System speech uses the browser Web Speech API and remains the default. Optional Piper speech lazily imports `@mintplex-labs/piper-tts-web` 1.0.4, which uses ONNX Runtime Web and Piper's WebAssembly phonemization/synthesis support:

- https://github.com/Mintplex-Labs/piper-tts-web
- https://github.com/microsoft/onnxruntime
- https://github.com/rhasspy/piper

The Piper web package and ONNX Runtime are MIT licensed. The optional voice models are fetched from the diffusionstudio Piper voice collection only after the user selects Piper and presses Play:

- Russian: `ru_RU-irina-medium`
- Farsi: `fa_IR-gyro-medium`
- Spanish: `es_ES-carlfm-x_low`
- French: `fr_FR-siwis-low`
- English: `en_US-lessac-low`

https://huggingface.co/diffusionstudio/piper-voices

Voice model cards and their upstream training-dataset notices are part of that collection and can carry terms distinct from Wordfreak's code license. Preserve the applicable model and dataset notices when redistributing a model; Wordfreak does not bundle those model files.

Downloaded voice files persist in the browser's Origin Private File System under the package's `piper` directory. The Settings control labeled **Clear downloaded Piper voices** removes that voice-storage directory, including all downloaded language models. Wordfreak permits no more than two active Piper voices. Their runtime sessions stay in disposable module workers and are not retained across Stop, language/engine changes, page exit, timeout, or idle cleanup.

## Live News

News mode reads current public feeds from Meduza, VOA Persian, Radio Farda, DW Español, RFI, France 24, BBC Hindi, NHK, VOA Korean, and Google News. Article text is fetched live in the user's browser, is not bundled with Wordfreak, and remains subject to each publisher's terms; every reader view links to the original article. Google Persian headlines are filtered by script because that locale can return English-language results.

## Public-Domain Books

Book mode links to public-domain editions from Standard Ebooks and Project Gutenberg. Standard Ebooks dedicates its ebook productions to the public domain under CC0. Project Gutenberg determines public-domain status under United States law; a work's status may differ elsewhere. Wordfreak links every reader view to its source edition and does not bundle book text.

Sources:

- https://standardebooks.org/about
- https://www.gutenberg.org/policy/permission.html

## Air Force Handbook 1

`data/books/afh1-airman-2025.json` is a speech-friendly text adaptation of *Air Force Handbook 1 — Airman*, dated 15 February 2025, published by the United States Air Force:

https://static.e-publishing.af.mil/production/1/af_a1/publication/afh1/afh1.pdf

The builder pins the 625-page source PDF by SHA-256 (`9f60b97f32240c8db0f19b37c287df7b933ecdcbf39f68133805182c0a48ef59`). It removes repeated page headers, visual promotion-testing matrices, deletion placeholders, and material that does not safely linearize for speech. Attachment 8's song lyrics and all seals, emblems, illustrations, and other artwork are not bundled; consult the linked official PDF for the complete publication.

The publication states that it has no releasability restrictions. Under 17 U.S.C. § 105, copyright protection is generally unavailable for works of the United States Government, although third-party material within a government publication can have separate rights:

https://www.copyright.gov/title17/92chap1.html#105

Wordfreak is an unofficial study reader. Its inclusion of this publication does not imply endorsement by the U.S. Department of Defense or U.S. Air Force.
