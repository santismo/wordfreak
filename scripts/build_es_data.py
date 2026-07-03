#!/usr/bin/env python3
"""Build the Wordfreak Spanish core deck."""

from __future__ import annotations

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
OUT = ROOT / "data" / "es-core.json"
MACHINE_TRANSLATIONS = ROOT / "data" / "es-machine-translations.json"
FREQUENCY_URL = (
    "https://raw.githubusercontent.com/doozan/spanish_data/master/es_merged_50k.txt"
)
LEMMA_FREQUENCY_URL = "https://raw.githubusercontent.com/doozan/spanish_data/master/frequency.csv"
DICTIONARY_URL = "https://raw.githubusercontent.com/doozan/spanish_data/master/es-en.data"

SPANISH_WORD = re.compile(r"^[a-záéíóúüñ]+$", re.IGNORECASE)

POS_LABELS = {
    "adj": "adjective",
    "adv": "adverb",
    "art": "article",
    "conj": "conjunction",
    "contraction": "contraction",
    "determiner": "determiner",
    "interj": "interjection",
    "n": "noun",
    "none": "",
    "num": "numeral",
    "prep": "preposition",
    "pron": "pronoun",
    "prop": "proper noun",
    "v": "verb",
}

MANUAL_GLOSSES = {
    "a": "to; at",
    "aquí": "here",
    "ahora": "now",
    "al": "to the",
    "algo": "something",
    "así": "like this; so",
    "bien": "well; good",
    "bueno": "good",
    "como": "as; like; how",
    "con": "with",
    "cuando": "when",
    "de": "of; from",
    "decir": "to say; to tell",
    "del": "of the; from the",
    "dos": "two",
    "el": "the",
    "él": "he",
    "ella": "she",
    "en": "in; on",
    "era": "was; era",
    "es": "is",
    "esa": "that",
    "ese": "that",
    "eso": "that",
    "esta": "this",
    "estaba": "was",
    "está": "is; is located",
    "estamos": "we are",
    "están": "are",
    "estás": "you are",
    "este": "this",
    "esto": "this",
    "estoy": "I am",
    "favor": "favor; please",
    "fue": "was; went",
    "gracias": "thanks",
    "ha": "has; have",
    "hacer": "to do; to make",
    "hay": "there is; there are",
    "he": "I have",
    "la": "the; her",
    "las": "the; them",
    "le": "to him; to her",
    "lo": "it; the",
    "los": "the; them",
    "más": "more",
    "me": "me",
    "mi": "my",
    "muy": "very",
    "nada": "nothing",
    "ni": "nor; neither",
    "no": "not; no",
    "nos": "us; ourselves",
    "o": "or",
    "para": "for; to",
    "pero": "but",
    "porque": "because",
    "por": "by; for",
    "puede": "can; may",
    "puedo": "I can",
    "que": "that; what",
    "qué": "what",
    "quiero": "I want; I love",
    "sé": "I know",
    "se": "oneself; himself; herself; itself",
    "ser": "to be",
    "si": "if",
    "sí": "yes",
    "sin": "without",
    "sobre": "about; on",
    "solo": "only; alone",
    "sólo": "only",
    "son": "are; they are",
    "soy": "I am",
    "su": "his; her; your; their",
    "sus": "their; his; her; your",
    "también": "also; too",
    "tan": "so; as",
    "te": "you",
    "tengo": "I have",
    "tiene": "has",
    "tienes": "you have",
    "tiempo": "time; weather",
    "todo": "all; everything",
    "todos": "all; everyone",
    "tu": "your",
    "tú": "you",
    "un": "a; one",
    "una": "a; one",
    "uno": "one",
    "usted": "you",
    "va": "goes",
    "vamos": "let's go; we go",
    "verdad": "truth; right",
    "vez": "time; instance",
    "voy": "I go",
    "y": "and",
    "ya": "already; now",
    "yo": "I",
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


def normalize_es(value: str) -> str:
    return unicodedata.normalize("NFC", (value or "").strip().lower())


def clean_translation(value: str) -> str:
    text = re.sub(r"\s+", " ", value or "").strip()
    return text.replace(" ,", ",").replace(" ;", ";")


def clean_dictionary_gloss(value: str) -> str:
    text = clean_translation(value)
    if not text:
        return ""
    text = re.sub(r"^\([^)]*\)\s*", "", text)
    text = re.sub(r'^inflection of "[^"]+":\s*', "", text)
    text = re.sub(r"^(?:smart )?inflection of [^;]+;\s*", "", text)
    text = re.sub(r'^contraction of "[^"]+"$', "", text)
    if re.match(r"^(feminine|masculine|neuter|plural|singular) of [A-Za-záéíóúüñ]+$", text):
        return ""

    match = re.search(r'of "[^"]+"\s*\(([^)]+)\)', text)
    if match:
        text = match.group(1)

    if ";" in text:
        parts = [part.strip() for part in text.split(";") if part.strip()]
        if len(parts) > 1 and re.search(r"\b(article|plural|singular|masculine|feminine|form)\b", parts[0]):
            text = parts[-1]

    text = text.replace('"', "")
    return clean_translation(text)


def spoken_translation(value: str) -> str:
    text = clean_translation(value)
    if not text:
        return ""
    first = re.split(r"[;,]", text, maxsplit=1)[0]
    words = re.findall(r"[A-Za-z]+(?:[-'][A-Za-z]+)?|\d+", first)
    return " ".join(words) if words else first


def parse_frequency(raw: str, limit: int = 20000) -> list[dict]:
    entries = []
    seen = set()

    for line in raw.splitlines():
        parts = line.split()
        if len(parts) != 2:
            continue
        word = normalize_es(parts[0])
        if not word or word in seen:
            continue
        if not SPANISH_WORD.match(word):
            continue
        seen.add(word)
        entries.append(
            {
                "rank": len(entries) + 1,
                "word": word,
                "frequency": int(parts[1]) if parts[1].isdigit() else 0,
                "pos": [],
                "posLabel": "",
            }
        )
        if len(entries) >= limit:
            break

    return entries


def parse_dictionary(raw: str) -> dict[str, dict]:
    dictionary: dict[str, dict] = {}

    for block in raw.split("_____\n"):
        lines = block.splitlines()
        if not lines:
            continue
        word = normalize_es(lines[0])
        if not word or not SPANISH_WORD.match(word):
            continue
        pos_codes = []
        glosses = []
        for line in lines[1:]:
            if line.startswith("pos: "):
                pos = line.removeprefix("pos: ").strip()
                if pos and pos not in pos_codes:
                    pos_codes.append(pos)
            elif line.startswith("  gloss: "):
                gloss = clean_dictionary_gloss(line.removeprefix("  gloss: "))
                if gloss and gloss not in glosses:
                    glosses.append(gloss)
            if len(glosses) >= 3:
                break
        if glosses:
            dictionary[word] = {
                "en": clean_translation("; ".join(glosses[:3])),
                "pos": pos_codes,
            }

    return dictionary


def parse_form_lemmas(raw: str) -> dict[str, dict]:
    forms: dict[str, dict] = {}
    for row in csv.DictReader(io.StringIO(raw)):
        lemma = normalize_es(row.get("spanish", ""))
        pos = (row.get("pos") or "").strip()
        usage = row.get("usage") or ""
        if not lemma or not usage:
            continue
        for item in usage.split("|"):
            if ":" not in item:
                continue
            count_text, form_text = item.split(":", 1)
            form = normalize_es(form_text)
            if not form or not SPANISH_WORD.match(form):
                continue
            count = int(count_text) if count_text.isdigit() else 0
            current = forms.get(form)
            if not current or count > current["count"]:
                forms[form] = {"lemma": lemma, "pos": pos, "count": count}
    return forms


def load_machine_translations() -> dict[str, str]:
    if not MACHINE_TRANSLATIONS.exists():
        return {}
    payload = json.loads(MACHINE_TRANSLATIONS.read_text(encoding="utf-8"))
    translations = payload.get("translations", payload)
    return {
        normalize_es(word): clean_translation(translation)
        for word, translation in translations.items()
        if clean_translation(translation)
    }


def pos_label(pos_codes: list[str]) -> str:
    labels = [POS_LABELS.get(code, code) for code in pos_codes]
    return ", ".join(label for label in labels if label)


def resolve_translation(
    word: str,
    dictionary: dict[str, dict],
    form_lemmas: dict[str, dict],
    machine_translations: dict[str, str],
) -> tuple[str, list[str], str]:
    if word in MANUAL_GLOSSES:
        return MANUAL_GLOSSES[word], [], "wordfreak:manual"

    if word in dictionary:
        record = dictionary[word]
        return record["en"], record["pos"], "doozan:wiktionary"

    lemma = form_lemmas.get(word)
    if lemma and lemma["lemma"] in dictionary:
        record = dictionary[lemma["lemma"]]
        pos = [lemma["pos"]] if lemma["pos"] and lemma["pos"] != "none" else record["pos"]
        return record["en"], pos, f"doozan:wiktionary:{lemma['lemma']}"

    if word in machine_translations:
        return machine_translations[word], [], "machine:google-translate"

    return "", [], ""


def build() -> dict:
    frequency_entries = parse_frequency(fetch_text(FREQUENCY_URL), 50000)
    dictionary = parse_dictionary(fetch_text(DICTIONARY_URL))
    form_lemmas = parse_form_lemmas(fetch_text(LEMMA_FREQUENCY_URL))
    machine_translations = load_machine_translations()
    translated = 0
    manual = 0
    dictionary_count = 0
    machine = 0

    output_entries = []
    seen = set()
    for source_entry in frequency_entries:
        word = source_entry["word"]
        if word in seen:
            continue
        seen.add(word)
        meaning, pos_codes, source = resolve_translation(word, dictionary, form_lemmas, machine_translations)
        if not meaning:
            continue

        translated += 1
        if source == "wordfreak:manual":
            manual += 1
        elif source.startswith("doozan:"):
            dictionary_count += 1
        elif source.startswith("machine:"):
            machine += 1

        output_entries.append(
            {
                **source_entry,
                "rank": len(output_entries) + 1,
                "sourceRank": source_entry["rank"],
                "display": word,
                "accented": "",
                "en": meaning,
                "sayEn": spoken_translation(meaning),
                "pos": pos_codes,
                "posLabel": pos_label(pos_codes),
                "translationSource": source,
            }
        )
        if len(output_entries) >= 20000:
            break

    return {
        "meta": {
            "name": "Wordfreak Spanish Core",
            "language": "es",
            "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "totalEntries": len(output_entries),
            "translatedEntries": translated,
            "manualEntries": manual,
            "dictionaryEntries": dictionary_count,
            "machineEntries": machine,
            "coverage": round(translated / max(1, len(output_entries)), 4),
            "bands": [500, 1500, 3000, 5000, 10000, 16000, 20000],
            "sources": [
                {
                    "name": "Doozan Spanish cleaned frequency forms",
                    "url": FREQUENCY_URL,
                    "license": "CC-BY-4.0; source frequency data CC-BY-SA-3.0",
                },
                {
                    "name": "Doozan Spanish-English Wiktionary data",
                    "url": DICTIONARY_URL,
                    "license": "CC-BY-SA",
                },
                {
                    "name": "Doozan Spanish lemma frequency and form map",
                    "url": LEMMA_FREQUENCY_URL,
                    "license": "CC-BY-4.0; source frequency data CC-BY-SA-3.0",
                },
                {
                    "name": "Machine translations for English glosses",
                    "url": "data/es-machine-translations.json",
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
