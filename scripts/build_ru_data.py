#!/usr/bin/env python3
"""Build the Wordfreak Russian core deck.

The generated deck joins a Russian National Corpus frequency ranking with
OpenRussian English glosses. Missing glosses are left blank so the app can
resolve them lazily with the browser translation fallback.
"""

from __future__ import annotations

import csv
import io
import json
import re
import subprocess
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "ru-core.json"

RNC_RAW_URL = (
    "https://en.wiktionary.org/w/index.php?"
    "title=Appendix:Frequency_dictionary_of_the_modern_Russian_language_"
    "(the_Russian_National_Corpus)&action=raw"
)

OPENRUSSIAN_FILES = {
    "others": "https://raw.githubusercontent.com/Badestrand/russian-dictionary/master/others.csv",
    "nouns": "https://raw.githubusercontent.com/Badestrand/russian-dictionary/master/nouns.csv",
    "verbs": "https://raw.githubusercontent.com/Badestrand/russian-dictionary/master/verbs.csv",
    "adjectives": "https://raw.githubusercontent.com/Badestrand/russian-dictionary/master/adjectives.csv",
}

POS_LABELS = {
    "s": "noun",
    "v": "verb",
    "a": "adjective",
    "adv": "adverb",
    "pr": "preposition",
    "conj": "conjunction",
    "part": "particle",
    "spro": "pronoun",
    "apro": "determiner",
    "advpro": "pronominal adverb",
    "anum": "ordinal numeral",
    "num": "numeral",
    "intj": "interjection",
    "praed": "predicative",
    "parenth": "parenthetical",
}

# Small high-frequency patch list for forms that are common in the RNC list but
# absent from the older OpenRussian CSV backup.
MANUAL_GLOSSES = {
    "наш": "our",
    "во": "in; at; into",
    "со": "with; from",
    "должен": "must; should; obliged",
    "ваш": "your",
    "многий": "many; much",
    "значит": "means; therefore",
    "может": "maybe; perhaps; can",
    "кажется": "it seems; apparently",
    "многое": "many things; much",
    "разумеется": "of course",
    "ах": "ah; oh",
    "скажем": "let's say; for example",
    "должно": "should; must; probably",
    "б": "would",
    "какой-либо": "any; some",
    "основное": "main thing; basic",
    "давайте": "let's; please give",
    "говорят": "they say; it is said",
    "другое": "another; other thing",
    "остальные": "the rest; others",
    "вестись": "to be conducted; to be underway",
    "рассматриваться": "to be considered; to be examined",
    "чей-то": "someone's",
    "вправе": "entitled; has the right",
    "ключевой": "key; crucial",
    "штамм": "strain",
    "производиться": "to be produced; to take place",
    "предполагаться": "to be expected; to be supposed",
    "де": "allegedly; so-called",
    "компьютерный": "computer; computing",
    "процессуальный": "procedural",
    "взаимоотношения": "relationships",
    "себе": "to oneself; for oneself",
    "среднее": "average; middle",
    "некоторые": "some; certain",
    "самарский": "Samara; of Samara",
    "общее": "general; common",
    "планироваться": "to be planned",
    "предлагаться": "to be offered; to be proposed",
    "петербургский": "Petersburg; St. Petersburg",
    "христов": "Christ's",
    "пермский": "Perm; of Perm",
    "по-своему": "in one's own way",
    "гастроли": "tour; guest performances",
    "ловко": "skillfully; cleverly",
    "свое": "one's own",
    "угу": "uh-huh",
    "передо": "before; in front of",
    "восприниматься": "to be perceived",
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


def normalize_key(value: str) -> str:
    return value.strip().lower().replace("ё", "е")


def display_from_accented(value: str) -> str:
    return re.sub(r"[`']", "", value or "").strip()


def clean_translation(value: str) -> str:
    text = re.sub(r"\s+", " ", value or "").strip()
    text = text.replace(" ,", ",").replace(" ;", ";")
    return text


def spoken_translation(value: str) -> str:
    text = clean_translation(value)
    if not text:
        return ""
    first = re.split(r";", text, maxsplit=1)[0]
    return re.sub(r"\s+", " ", first).strip()


def parse_rnc(raw: str) -> list[dict]:
    positions: dict[str, int] = {}
    pos_by_word: dict[str, list[str]] = defaultdict(list)

    rank = 0
    for line in raw.splitlines():
        match = re.match(r"# \[\[([^\]|]+)(?:\|[^\]]+)?\]\] \(([^)]+)\)", line)
        if not match:
            continue
        rank += 1
        word, pos = match.groups()
        if word not in positions:
            positions[word] = rank
        if pos not in pos_by_word[word]:
            pos_by_word[word].append(pos)

    entries = []
    for word, first_rank in sorted(positions.items(), key=lambda item: item[1]):
        pos_codes = pos_by_word[word]
        entries.append(
            {
                "rank": first_rank,
                "word": word,
                "pos": pos_codes,
                "posLabel": ", ".join(POS_LABELS.get(code, code) for code in pos_codes),
            }
        )
    return entries


def load_openrussian() -> tuple[dict[str, dict], dict[str, dict], dict[str, int]]:
    exact: dict[str, dict] = {}
    normalized: dict[str, dict] = {}
    counts: dict[str, int] = {}

    for source, url in OPENRUSSIAN_FILES.items():
        rows = csv.DictReader(io.StringIO(fetch_text(url)), delimiter="\t")
        count = 0
        for row in rows:
            bare = (row.get("bare") or "").strip()
            translation = clean_translation(row.get("translations_en") or "")
            if not bare or not translation:
                continue
            count += 1
            accented = (row.get("accented") or "").strip()
            record = {
                "word": bare,
                "display": display_from_accented(accented) or bare,
                "accented": accented,
                "en": translation,
                "sayEn": spoken_translation(translation),
                "source": f"openrussian:{source}",
            }
            exact.setdefault(bare, record)
            normalized.setdefault(normalize_key(bare), record)
        counts[source] = count

    return exact, normalized, counts


def build() -> dict:
    rnc_entries = parse_rnc(fetch_text(RNC_RAW_URL))
    exact, normalized, openrussian_counts = load_openrussian()

    output_entries = []
    translated = 0
    manual = 0

    for entry in rnc_entries:
        word = entry["word"]
        match = exact.get(word) or normalized.get(normalize_key(word))
        if match:
            translated += 1
            display = match["display"] or word
            out = {
                **entry,
                "display": display,
                "accented": match["accented"],
                "en": match["en"],
                "sayEn": match["sayEn"],
                "translationSource": match["source"],
            }
        elif word in MANUAL_GLOSSES:
            translated += 1
            manual += 1
            meaning = MANUAL_GLOSSES[word]
            out = {
                **entry,
                "display": word,
                "accented": "",
                "en": meaning,
                "sayEn": spoken_translation(meaning),
                "translationSource": "wordfreak:manual",
            }
        else:
            out = {
                **entry,
                "display": word,
                "accented": "",
                "en": "",
                "sayEn": "",
                "translationSource": "",
            }
        output_entries.append(out)

    return {
        "meta": {
            "name": "Wordfreak Russian Core",
            "language": "ru",
            "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "totalEntries": len(output_entries),
            "translatedEntries": translated,
            "manualEntries": manual,
            "coverage": round(translated / max(1, len(output_entries)), 4),
            "bands": [500, 1500, 3000, 5000, 10000, 16000, 20000],
            "openRussianRows": openrussian_counts,
            "sources": [
                {
                    "name": "Russian National Corpus frequency dictionary via Wiktionary",
                    "url": "https://en.wiktionary.org/wiki/Appendix:Frequency_dictionary_of_the_modern_Russian_language_(the_Russian_National_Corpus)",
                },
                {
                    "name": "OpenRussian dictionary data",
                    "url": "https://github.com/Badestrand/russian-dictionary",
                    "license": "CC-BY-SA-4.0",
                },
            ],
        },
        "entries": output_entries,
    }


def main() -> int:
    data = build()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(
        f"Wrote {OUT.relative_to(ROOT)}: "
        f"{data['meta']['totalEntries']} entries, "
        f"{data['meta']['translatedEntries']} translated "
        f"({data['meta']['coverage']:.1%})"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
