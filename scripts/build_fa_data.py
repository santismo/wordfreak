#!/usr/bin/env python3
"""Build the Wordfreak Farsi core deck."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "fa-core.json"
MACHINE_TRANSLATIONS = ROOT / "data" / "fa-machine-translations.json"
PERSIAN_WIKIPEDIA_URL = (
    "https://raw.githubusercontent.com/behnam/persian-words-frequency/master/persian-wikipedia.txt"
)

PERSIAN_LETTERS = re.compile(r"^[آ-یءٔ‌]+$")
DIACRITICS = re.compile(r"[\u064b-\u065f\u0670]")


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


def normalize_fa(value: str) -> str:
    text = (value or "").strip()
    text = text.replace("ي", "ی").replace("ك", "ک")
    text = text.replace("\u200c", "‌")
    text = DIACRITICS.sub("", text)
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
    return words[0] if words else first


def parse_frequency(raw: str, limit: int = 20000) -> list[dict]:
    entries = []
    seen = set()

    for line in raw.splitlines():
        if not line or line.startswith("#"):
            continue
        parts = line.split()
        if len(parts) < 2:
            continue
        word = normalize_fa(parts[0])
        if not word or word in seen:
            continue
        if not PERSIAN_LETTERS.match(word):
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


def load_machine_translations() -> dict[str, str]:
    if not MACHINE_TRANSLATIONS.exists():
        return {}
    payload = json.loads(MACHINE_TRANSLATIONS.read_text(encoding="utf-8"))
    translations = payload.get("translations", payload)
    return {
        normalize_fa(word): clean_translation(translation)
        for word, translation in translations.items()
        if clean_translation(translation)
    }


def build() -> dict:
    entries = parse_frequency(fetch_text(PERSIAN_WIKIPEDIA_URL))
    translations = load_machine_translations()
    translated = 0

    output_entries = []
    for entry in entries:
        meaning = translations.get(entry["word"], "")
        if meaning:
            translated += 1
        output_entries.append(
            {
                **entry,
                "display": entry["word"],
                "accented": "",
                "en": meaning,
                "sayEn": spoken_translation(meaning),
                "translationSource": "machine:google-translate" if meaning else "",
            }
        )

    return {
        "meta": {
            "name": "Wordfreak Farsi Core",
            "language": "fa",
            "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "totalEntries": len(output_entries),
            "translatedEntries": translated,
            "manualEntries": 0,
            "machineEntries": translated,
            "coverage": round(translated / max(1, len(output_entries)), 4),
            "bands": [500, 1500, 3000, 5000, 10000, 16000, 20000],
            "sources": [
                {
                    "name": "Persian Words Frequency Database, Persian Wikipedia corpus",
                    "url": "https://github.com/behnam/persian-words-frequency",
                    "license": "CC-BY-SA-3.0",
                },
                {
                    "name": "Machine translations for English glosses",
                    "url": "data/fa-machine-translations.json",
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
