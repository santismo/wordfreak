#!/usr/bin/env python3
"""Fill machine-translation cache files used by Wordfreak deck builders."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path
from urllib.parse import urlencode

import build_fa_data


ROOT = Path(__file__).resolve().parents[1]
GOOGLE_TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single"


def normalize_ru(value: str) -> str:
    return value.strip().lower().replace("ё", "е")


def clean_translation(value: str) -> str:
    return " ".join((value or "").replace(" ,", ",").replace(" ;", ";").split())


def load_cache(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    payload = json.loads(path.read_text(encoding="utf-8"))
    return dict(payload.get("translations", payload))


def write_cache(path: Path, source_language: str, translations: dict[str, str]) -> None:
    payload = {
        "sourceLanguage": source_language,
        "targetLanguage": "en",
        "source": "Google Translate web endpoint",
        "translations": dict(sorted(translations.items())),
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def google_translate_batch(words: list[str], source_language: str) -> list[str]:
    query = "\n".join(words)
    params = urlencode(
        {
            "client": "gtx",
            "sl": source_language,
            "tl": "en",
            "dt": "t",
            "q": query,
        }
    )
    raw = subprocess.check_output(
        ["curl", "-G", "-s", "--max-time", "45", f"{GOOGLE_TRANSLATE_URL}?{params}"],
        text=True,
        errors="replace",
    )
    payload = json.loads(raw)
    text = "".join(chunk[0] or "" for chunk in payload[0])
    lines = [clean_translation(line) for line in text.splitlines()]
    if len(lines) != len(words):
        raise ValueError(f"expected {len(words)} translations, got {len(lines)}")
    return lines


def translate_words(words: list[str], source_language: str, batch_size: int) -> dict[str, str]:
    results: dict[str, str] = {}
    for start in range(0, len(words), batch_size):
        batch = words[start : start + batch_size]
        try:
            translated = google_translate_batch(batch, source_language)
        except Exception:
            translated = []
            for word in batch:
                translated.extend(google_translate_batch([word], source_language))
                time.sleep(0.08)
        for word, meaning in zip(batch, translated):
            if meaning and meaning != word:
                results[word] = meaning
        print(f"{source_language}: {min(start + batch_size, len(words))}/{len(words)}")
        time.sleep(0.12)
    return results


def ru_missing_words() -> list[str]:
    data = json.loads((ROOT / "data" / "ru-core.json").read_text(encoding="utf-8"))
    words = []
    seen = set()
    for entry in data["entries"]:
        if entry.get("en"):
            continue
        key = normalize_ru(entry["word"])
        if key not in seen:
            seen.add(key)
            words.append(entry["word"])
    return words


def fa_words(limit: int) -> list[str]:
    raw = build_fa_data.fetch_text(build_fa_data.PERSIAN_WIKIPEDIA_URL)
    return [entry["word"] for entry in build_fa_data.parse_frequency(raw, limit)]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("language", choices=["ru", "fa"])
    parser.add_argument("--limit", type=int, default=20000)
    parser.add_argument("--batch-size", type=int, default=80)
    args = parser.parse_args()

    if args.language == "ru":
        path = ROOT / "data" / "ru-machine-translations.json"
        existing = load_cache(path)
        words = [word for word in ru_missing_words() if normalize_ru(word) not in existing]
        translated = translate_words(words, "ru", args.batch_size)
        existing.update({normalize_ru(word): meaning for word, meaning in translated.items()})
        write_cache(path, "ru", existing)
    else:
        path = ROOT / "data" / "fa-machine-translations.json"
        existing = load_cache(path)
        words = [word for word in fa_words(args.limit) if word not in existing]
        translated = translate_words(words, "fa", args.batch_size)
        existing.update(translated)
        write_cache(path, "fa", existing)

    print(f"Wrote {path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
