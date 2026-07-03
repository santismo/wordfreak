#!/usr/bin/env python3
"""Build machine-glossed Wordfreak frequency decks for additional languages."""

from __future__ import annotations

import argparse
import csv
import io
import json
import re
import subprocess
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
BASE_WORD_URL = (
    "https://raw.githubusercontent.com/orgtre/top-open-subtitles-sentences/main/"
    "bld/top_words/{language}_top_words.csv"
)
HINDI_WORD_URL = "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/hi/hi_full.txt"

LANGUAGE_CONFIGS = {
    "fr": {
        "label": "French",
        "name": "Wordfreak French Core",
        "sourceUrl": BASE_WORD_URL.format(language="fr"),
        "sourceName": "Top OpenSubtitles cleaned French word frequency list",
        "sourceLicense": "Same as OpenSubtitles2018 corpus; project code CC-BY-3.0",
        "sourceFormat": "csv",
        "wordPattern": re.compile(r"^[a-zàâæçéèêëîïôœùûüÿ'-]+$", re.IGNORECASE),
        "manual": {
            "de": "of; from",
            "je": "I",
            "est": "is",
            "pas": "not",
            "le": "the",
            "vous": "you",
            "que": "that; what",
            "la": "the",
            "tu": "you",
            "un": "a; one",
            "il": "he; it",
            "c'": "it; this",
            "à": "to; at",
            "et": "and",
            "a": "has",
            "l'": "the",
            "ne": "not",
            "ce": "this; it",
            "les": "the",
            "en": "in; of it",
            "j'": "I",
            "on": "we; one",
            "ça": "that",
            "une": "a; one",
            "d'": "of; from",
            "qu'": "that; what",
            "pour": "for",
            "ai": "have",
            "n'": "not",
            "des": "some; of the",
            "qui": "who; which",
            "moi": "me",
            "nous": "we; us",
            "mais": "but",
            "dans": "in",
            "elle": "she",
            "me": "me",
            "bien": "well; good",
            "si": "if; yes",
            "du": "of the; some",
            "y": "there",
            "mon": "my",
            "non": "no",
            "oui": "yes",
        },
    },
    "hi": {
        "label": "Hindi",
        "name": "Wordfreak Hindi Core",
        "sourceUrl": HINDI_WORD_URL,
        "sourceName": "FrequencyWords Hindi OpenSubtitles 2018 list",
        "sourceLicense": "CC-BY-SA-4.0",
        "sourceFormat": "space",
        "wordPattern": re.compile(r"^[\u0900-\u0950\u0953-\u0963\u0971-\u097F]+$"),
        "manual": {
            "है": "is",
            "के": "of",
            "मैं": "I",
            "नहीं": "not; no",
            "हैं": "are",
            "में": "in",
            "एक": "one; a",
            "आप": "you",
            "लिए": "for",
            "और": "and",
            "यह": "this; it",
            "से": "from; by",
            "की": "of; did",
            "क्या": "what",
            "कि": "that",
            "तुम": "you",
            "हो": "are",
            "कर": "do",
            "मुझे": "me",
            "को": "to",
            "हम": "we",
            "था": "was",
            "वह": "he; she; that",
            "पर": "on; at",
            "हूँ": "am",
            "भी": "also",
            "का": "of",
            "कुछ": "some; something",
            "तो": "then; so",
            "हाँ": "yes",
            "लेकिन": "but",
            "यहाँ": "here",
            "कोई": "someone; any",
            "अब": "now",
            "बहुत": "very; much",
            "क्यों": "why",
            "अच्छा": "good",
        },
    },
    "ja": {
        "label": "Japanese",
        "name": "Wordfreak Japanese Core",
        "sourceUrl": BASE_WORD_URL.format(language="ja"),
        "sourceName": "Top OpenSubtitles cleaned Japanese word frequency list",
        "sourceLicense": "Same as OpenSubtitles2018 corpus; project code CC-BY-3.0",
        "sourceFormat": "csv",
        "wordPattern": re.compile(r"^[ぁ-ゖァ-ヺー一-龯々〆〤]+$"),
        "manual": {
            "の": "of; possessive particle",
            "は": "topic marker",
            "に": "to; in; at",
            "た": "past marker",
            "を": "object marker",
            "て": "and; -te form",
            "だ": "is",
            "が": "subject marker; but",
            "で": "at; by; with",
            "ない": "not",
            "か": "question marker; or",
            "し": "and; do",
            "と": "and; with",
            "も": "also",
            "な": "adjective marker; don't",
            "よ": "sentence emphasis",
            "ん": "contraction; explanatory particle",
            "私": "I; me",
            "てる": "is doing",
            "何": "what",
            "から": "from; because",
            "です": "is; polite copula",
            "ね": "right?; isn't it?",
            "それ": "that",
            "わ": "sentence particle",
            "する": "to do",
            "こと": "thing; matter",
            "彼": "he; boyfriend",
            "いる": "to be; to exist",
            "あなた": "you",
            "そう": "so; like that",
            "ます": "polite verb ending",
            "いい": "good",
            "これ": "this",
            "もう": "already; anymore",
            "ある": "there is; to have",
            "何": "what",
            "人": "person",
            "行く": "to go",
            "来る": "to come",
            "見": "to see",
            "今": "now",
            "大丈夫": "okay; all right",
        },
    },
    "ko": {
        "label": "Korean",
        "name": "Wordfreak Korean Core",
        "sourceUrl": BASE_WORD_URL.format(language="ko"),
        "sourceName": "Top OpenSubtitles cleaned Korean word frequency list",
        "sourceLicense": "Same as OpenSubtitles2018 corpus; project code CC-BY-3.0",
        "sourceFormat": "csv",
        "wordPattern": re.compile(r"^[가-힣]+$"),
        "manual": {
            "내가": "I",
            "난": "I",
            "그": "that; he",
            "안": "not",
            "내": "my",
            "수": "way; ability",
            "이": "this; subject marker",
            "네": "yes; your",
            "거야": "will; going to",
            "좀": "a little; please",
            "그래": "yes; right",
            "있어": "there is; have",
            "왜": "why",
            "더": "more",
            "그리고": "and",
            "우리": "we; our",
            "다": "all",
            "한": "one; a",
            "하지만": "but; however",
            "무슨": "what kind of",
            "할": "to do; will do",
            "잘": "well",
            "어떻게": "how",
            "그냥": "just",
            "게": "thing; so that",
            "정말": "really",
            "있어요": "there is; have",
            "그럼": "then",
            "것": "thing",
            "있는": "existing; having",
            "해": "do",
            "여기": "here",
            "제가": "I",
            "넌": "you",
            "날": "me; day",
            "우리가": "we",
            "건": "thing; matter",
            "전": "I; before",
            "이제": "now",
            "지금": "now",
        },
    },
}


def fetch_text(url: str) -> str:
    request = Request(url, headers={"User-Agent": "wordfreak-data-builder/1.0"})
    try:
        with urlopen(request, timeout=45) as response:
            return response.read().decode("utf-8", errors="replace")
    except (OSError, URLError):
        return subprocess.check_output(
            ["curl", "-L", "--max-time", "45", "-s", url],
            text=True,
            errors="replace",
        )


def normalize_word(value: str, language: str) -> str:
    text = unicodedata.normalize("NFC", (value or "").strip())
    if language == "fr":
        text = text.lower()
    return text


def clean_translation(value: str) -> str:
    text = re.sub(r"\s+", " ", value or "").strip()
    return text.replace(" ,", ",").replace(" ;", ";")


def spoken_translation(value: str) -> str:
    text = clean_translation(value)
    if not text:
        return ""
    first = re.split(r"[;,]", text, maxsplit=1)[0]
    words = re.findall(r"[A-Za-z]+(?:[-'][A-Za-z]+)?|\d+", first)
    return " ".join(words) if words else first


def parse_frequency(raw: str, language: str, limit: int = 20000) -> list[dict]:
    config = LANGUAGE_CONFIGS[language]
    entries = []
    seen = set()

    if config["sourceFormat"] == "csv":
        rows = (
            {"word": row.get("word", ""), "count": row.get("count", "")}
            for row in csv.DictReader(io.StringIO(raw))
        )
    else:
        rows = (
            {"word": parts[0], "count": parts[1]}
            for parts in (line.split() for line in raw.splitlines())
            if len(parts) == 2
        )

    for row in rows:
        word = normalize_word(row.get("word", ""), language)
        if not word or word in seen:
            continue
        if not config["wordPattern"].match(word):
            continue
        seen.add(word)
        count = row.get("count", "")
        entries.append(
            {
                "rank": len(entries) + 1,
                "word": word,
                "frequency": int(count) if count.isdigit() else 0,
                "pos": [],
                "posLabel": "",
            }
        )
        if len(entries) >= limit:
            break

    return entries


def load_machine_translations(language: str) -> dict[str, str]:
    path = ROOT / "data" / f"{language}-machine-translations.json"
    if not path.exists():
        return {}
    payload = json.loads(path.read_text(encoding="utf-8"))
    translations = payload.get("translations", payload)
    return {
        normalize_word(word, language): clean_translation(translation)
        for word, translation in translations.items()
        if clean_translation(translation)
    }


def build(language: str) -> dict:
    config = LANGUAGE_CONFIGS[language]
    frequency_url = config["sourceUrl"]
    entries = parse_frequency(fetch_text(frequency_url), language, 20000)
    translations = load_machine_translations(language)
    manual = config["manual"]
    translated = 0
    manual_count = 0
    machine_count = 0

    output_entries = []
    for entry in entries:
        word = entry["word"]
        if word in manual:
            meaning = manual[word]
            source = "wordfreak:manual"
            manual_count += 1
        else:
            meaning = translations.get(word, "")
            source = "machine:google-translate" if meaning else ""
            if meaning:
                machine_count += 1
        if meaning:
            translated += 1
        output_entries.append(
            {
                **entry,
                "display": word,
                "accented": "",
                "en": meaning,
                "sayEn": spoken_translation(meaning),
                "translationSource": source,
            }
        )

    return {
        "meta": {
            "name": config["name"],
            "language": language,
            "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "totalEntries": len(output_entries),
            "translatedEntries": translated,
            "manualEntries": manual_count,
            "machineEntries": machine_count,
            "coverage": round(translated / max(1, len(output_entries)), 4),
            "bands": [500, 1500, 3000, 5000, 10000, 16000, 20000],
            "sources": [
                {
                    "name": config["sourceName"],
                    "url": frequency_url,
                    "license": config["sourceLicense"],
                },
                {
                    "name": "Machine translations for English glosses",
                    "url": f"data/{language}-machine-translations.json",
                },
            ],
        },
        "entries": output_entries,
    }


def write(language: str) -> dict:
    data = build(language)
    out = ROOT / "data" / f"{language}-core.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(
        f"Wrote {out.relative_to(ROOT)}: "
        f"{data['meta']['totalEntries']} entries, "
        f"{data['meta']['translatedEntries']} translated "
        f"({data['meta']['coverage']:.1%})"
    )
    return data


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("language", choices=sorted(LANGUAGE_CONFIGS) + ["all"])
    args = parser.parse_args()

    languages = sorted(LANGUAGE_CONFIGS) if args.language == "all" else [args.language]
    for language in languages:
        write(language)
    return 0


if __name__ == "__main__":
    sys.exit(main())
