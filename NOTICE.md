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

Book and news sentence translations and moving word/phrase alignments are also generated live through public machine-translation endpoints and cached in the browser. Because languages do not map word-for-word, counterpart highlights are contextual study estimates and can occasionally be approximate or group two words together.

## Generated Deck

`data/ru-core.json`, `data/fa-core.json`, `data/es-core.json`, `data/fr-core.json`, `data/hi-core.json`, `data/ja-core.json`, and `data/ko-core.json` combine and adapt the sources above. Treat the generated data as CC-BY-SA-compatible material and preserve this notice when sharing modified versions.

## TTS

The app uses the browser Web Speech API.

## Live News

News mode reads current public feeds from Meduza, VOA Persian, Radio Farda, DW Español, RFI, France 24, BBC Hindi, NHK, VOA Korean, and Google News. Article text is fetched live in the user's browser, is not bundled with Wordfreak, and remains subject to each publisher's terms; every reader view links to the original article. Google Persian headlines are filtered by script because that locale can return English-language results.

## Public-Domain Books

Book mode links to public-domain editions from Standard Ebooks and Project Gutenberg. Standard Ebooks dedicates its ebook productions to the public domain under CC0. Project Gutenberg determines public-domain status under United States law; a work's status may differ elsewhere. Wordfreak links every reader view to its source edition and does not bundle book text.

Project Gutenberg catalog metadata and current text-format URLs are retrieved through the open-source Gutendex API. Gutendex is an independent catalog service and recommends self-hosting for long-term production use.

Book difficulty levels are Wordfreak study estimates based on English Flesch-Kincaid-style sentence and word measurements, total word count, and light curation for literary complexity. They are not CEFR classifications or guarantees that a machine translation will have the same difficulty.

Sources:

- https://standardebooks.org/about
- https://www.gutenberg.org/policy/permission.html
- https://gutendex.com/
