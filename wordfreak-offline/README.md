# Wordfreak Offline

Wordfreak Offline is a separate, vocabulary-focused edition designed to run from SPCK Editor without an internet connection after the repository has been cloned.

Live page: [santismo.github.io/wordfreak/wordfreak-offline/](https://santismo.github.io/wordfreak/wordfreak-offline/)

## Included offline

- Russian, Farsi, Spanish, French, Hindi, Japanese, and Korean frequency decks
- 139,496 total vocabulary entries with English meanings already embedded in the local deck files
- ordered and shuffled playback, frequency bands, search/scroll list, saved preferences, and system text-to-speech
- a separate storage namespace that does not overwrite the regular Wordfreak settings
- optional service-worker caching for the GitHub Pages edition

## Offline boundaries

- Standard Ebooks and live translation are disabled because both depend on remote websites.
- Speech uses iPhone system voices. Download the desired language voices in iOS while connected to the internet before relying on them offline. Voice availability is controlled by iOS, not Wordfreak.
- The complete repository is roughly 32 MB before Git compression because it contains all seven local decks. Let SPCK finish cloning before disconnecting.

## SPCK Editor setup

1. While connected to the internet, install SPCK Editor and clone `https://github.com/santismo/wordfreak.git`.
2. Keep the entire repository on the iPhone; the offline page reads the shared deck files from the parent `data` folder.
3. In SPCK, open `wordfreak-offline/index.html`.
4. Open the file menu and choose **Launch Default** for that file.
5. Tap the Play/Launch button and confirm that the selected deck appears.
6. Open Settings, select every language you plan to use once, and confirm its installed iPhone voice speaks correctly.
7. Turn on Airplane Mode, relaunch `wordfreak-offline/index.html` from SPCK, and use it normally.

An external Safari window does not live-reload after edits. Save the file and refresh Safari manually. If Safari loses the local page after iOS suspends SPCK, return to SPCK and tap Launch again.
