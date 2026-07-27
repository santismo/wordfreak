#!/usr/bin/env python3
"""Build Wordfreak's curated English vernacular deck.

The deck intentionally is not a general English frequency list. WordNet
provides definitions and examples, while wordfreq is used only as a guardrail
to keep the collection uncommon without filling it with unusably obscure
technical tokens.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import re
from collections import defaultdict
from pathlib import Path
from typing import Any

try:
    import nltk
    from nltk.corpus import wordnet as wn
    from wordfreq import zipf_frequency
except ImportError as error:
    raise SystemExit(
        "Install the builder dependencies first: pip install nltk wordfreq"
    ) from error


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "data" / "en-vernacular.json"
TARGET_SIZE = 3500
POS_TARGETS = {
    "adjective": 1300,
    "noun": 1450,
    "verb": 650,
    "adverb": 100,
}
POS_LABELS = {
    "a": "adjective",
    "s": "adjective",
    "n": "noun",
    "v": "verb",
    "r": "adverb",
}
POS_SHORT = {
    "adjective": "adj.",
    "noun": "noun",
    "verb": "verb",
    "adverb": "adv.",
}

WORD_RE = re.compile(r"^[a-z]+$")
TECHNICAL_DEFINITION_RE = re.compile(
    r"\b("
    r"amino acid|atomic number|bacteria|bacterial|bird|chemical|chromosome|"
    r"compound|enzyme|fish|fungus|genus|herb|insect|isotope|larva|mammal|"
    r"mineral|molecule|parasite|plant|protein|reptile|species|taxonomic|tree|"
    r"vascular|vertebrate"
    r")\b",
    re.IGNORECASE,
)
TECHNICAL_STARTS = (
    "a genus ",
    "a member of ",
    "a species ",
    "any of several ",
    "any of various ",
    "large genus ",
    "small genus ",
    "type genus ",
)
RELATIONAL_DEFINITION_RE = re.compile(
    r"^(?:in |of |pertaining |relating ).{0,24}(?:relating to|characteristic of|pertaining to)",
    re.IGNORECASE,
)
PERSON_CATEGORY_RE = re.compile(
    r"\b(?:a native or inhabitant|an inhabitant|member of (?:an? )?(?:ethnic|religious)|"
    r"of or relating to or characteristic of .{0,45}(?:people|inhabitants|language))\b",
    re.IGNORECASE,
)
INFLECTION_RE = re.compile(r"(?:ed|ing|ings|nesses|s)$")
EVOCATIVE_ENDING_RE = re.compile(
    r"(?:acious|arian|escence|escent|iferous|iloquent|ineffable|itious|"
    r"mancy|phile|phobia|scent|tudinous|ulent|uous)$"
)

ABSTRACT_LEXNAMES = {
    "noun.act",
    "noun.attribute",
    "noun.cognition",
    "noun.communication",
    "noun.event",
    "noun.feeling",
    "noun.motive",
    "noun.relation",
    "noun.state",
    "noun.time",
}
AUTO_NOUN_LEXNAMES = {
    "noun.act",
    "noun.attribute",
    "noun.cognition",
    "noun.communication",
    "noun.event",
    "noun.feeling",
    "noun.motive",
    "noun.relation",
    "noun.state",
    "noun.time",
}
DISALLOWED_LEXNAMES = {
    "noun.animal",
    "noun.body",
    "noun.food",
    "noun.location",
    "noun.object",
    "noun.plant",
    "noun.substance",
}

# An editorial spine for the first collection depth. Definitions and examples
# still come from WordNet; this list simply ensures the core feels literary and
# useful rather than like a random sample of low-frequency dictionary tokens.
FEATURED_WORDS = [
    "abstemious", "absquatulate", "adumbrate", "aegis", "alacrity",
    "anachronistic", "anfractuous", "apocryphal", "apodictic", "apotheosis",
    "asperity", "assiduous", "avuncular", "baleful", "bellicose", "bilious",
    "bloviate", "bombastic", "borborygmus", "bowdlerize", "bromide", "calumny",
    "canard", "capricious", "cathexis", "chthonic", "circumlocution", "clepsydra",
    "compunction", "concupiscence", "contumacious", "coruscate", "crepuscular",
    "defenestrate", "desuetude", "didactic", "diffident", "dilatory", "disabuse",
    "disquisition", "ebullient", "effervescent", "efflorescence", "effulgent",
    "elegiac", "encomium", "enervate", "ennui", "ephemeral", "equanimity",
    "equivocate", "erudite", "ersatz", "esoteric", "etiolated", "evanescent",
    "execrable", "exigent", "exiguous", "expatiate", "expurgate", "extirpate",
    "factotum", "fatuous", "flagitious", "fulsome", "garrulous",
    "grandiloquent", "hebetude", "hermetic", "heterodox", "hubris", "iconoclast",
    "ignominious", "imbroglio", "impecunious", "impetuous", "importune",
    "incorrigible", "indefatigable", "ineffable", "insouciant", "interregnum",
    "inveigle", "irascible", "jejune", "lachrymose", "laconic", "legerdemain",
    "liminal", "logorrhea", "lugubrious", "machination", "magnanimous",
    "malapropism", "malinger", "mendacious", "meretricious", "metanoia",
    "milquetoast", "mordant", "munificent", "myrmidon", "nascent", "neologism",
    "noisome", "nonplussed", "nugatory", "numinous", "obdurate", "obfuscate",
    "obsequious", "obstreperous", "oneiric", "opprobrium", "palimpsest",
    "panacea", "panegyric", "parsimonious", "peccadillo", "pellucid",
    "penurious", "perfidious", "peripatetic", "perspicacious", "phantasmagoria",
    "philippic", "phlegmatic", "portentous", "probity", "prolix", "propinquity",
    "protean", "punctilious", "quotidian", "recalcitrant", "recondite",
    "recrudescence", "redolent", "reify", "reticent", "rococo", "sagacious",
    "salubrious", "sanguine", "saturnine", "sesquipedalian", "sibylline",
    "simulacrum", "solipsism", "somnolent", "supercilious", "sybaritic",
    "synecdoche", "taciturn", "tergiversate", "thaumaturgy", "timorous",
    "trenchant", "truculent", "ubiquitous", "ululate", "uxorious", "vicissitude",
    "vituperative", "vociferous", "widdershins", "wistful", "zeitgeist",
]
FEATURED_INDEX = {word: index for index, word in enumerate(FEATURED_WORDS)}
BLOCKED_WORDS = {
    "chinaman", "chink", "coon", "dyke", "fag", "faggot", "gook", "gypsy",
    "kike", "mongoloid", "nigger", "retard", "spic", "wetback",
}

# These lead the deck because they capture the intended range: literary,
# philosophical, playful, dialectal, and adopted words used in English.
MANUAL_ENTRIES: list[dict[str, Any]] = [
    {
        "word": "florid",
        "posLabel": "adj.",
        "en": "Elaborately ornate in style; also, conspicuously flushed or rosy.",
        "sayEn": "Elaborately ornate in style.",
        "example": "The critic found the novel's florid prose exhausting.",
        "rarity": "Uncommon",
    },
    {
        "word": "corpulent",
        "posLabel": "adj.",
        "en": "Large or bulky in body; stout.",
        "example": "The portrait shows a corpulent magistrate in ceremonial robes.",
        "rarity": "Uncommon",
    },
    {
        "word": "notgeil",
        "posLabel": "adj.",
        "en": "Borrowed German slang for sexually frustrated or indiscriminately eager from deprivation.",
        "sayEn": "Sexually frustrated from deprivation.",
        "rarity": "Arcane",
    },
    {
        "word": "incede",
        "posLabel": "verb",
        "en": "To advance or walk forward, especially with a measured or stately gait.",
        "rarity": "Arcane",
    },
    {
        "word": "tatterdemalion",
        "posLabel": "noun",
        "en": "A person dressed in ragged or disreputable clothes.",
        "example": "A cheerful tatterdemalion appeared at the garden gate.",
        "rarity": "Obscure",
    },
    {
        "word": "coprophilia",
        "posLabel": "noun",
        "en": "An abnormal fascination with excrement.",
        "rarity": "Obscure",
    },
    {
        "word": "omi-polone",
        "display": "omi-polone",
        "posLabel": "noun",
        "en": "In Polari, an effeminate or gay man.",
        "sayEn": "A Polari term for an effeminate or gay man.",
        "rarity": "Arcane",
    },
    {
        "word": "seraphic",
        "posLabel": "adj.",
        "en": "Angelic in appearance, character, or expression.",
        "example": "Her seraphic calm steadied the room.",
        "rarity": "Rare",
    },
    {
        "word": "puckish",
        "posLabel": "adj.",
        "en": "Playfully mischievous.",
        "example": "A puckish grin betrayed his part in the prank.",
        "rarity": "Uncommon",
    },
    {
        "word": "quidnuncery",
        "posLabel": "noun",
        "en": "The practice or habit of busy, meddlesome gossip.",
        "rarity": "Arcane",
    },
    {
        "word": "ataraxia",
        "posLabel": "noun",
        "en": "A state of serene calm and freedom from emotional disturbance.",
        "example": "The philosopher sought ataraxia rather than excitement.",
        "rarity": "Obscure",
    },
    {
        "word": "winsome",
        "posLabel": "adj.",
        "en": "Attractive or appealing in a fresh, innocent way.",
        "example": "His winsome candor disarmed the skeptical audience.",
        "rarity": "Uncommon",
    },
    {
        "word": "tabagie",
        "posLabel": "noun",
        "en": "A smoking party or gathering at which tobacco is used.",
        "rarity": "Arcane",
    },
    {
        "word": "zephyr",
        "posLabel": "noun",
        "en": "A soft, gentle breeze.",
        "example": "A zephyr stirred the curtains.",
        "rarity": "Uncommon",
    },
    {
        "word": "autochthonous",
        "posLabel": "adj.",
        "en": "Indigenous to the place where found; originating in its present location.",
        "rarity": "Obscure",
    },
    {
        "word": "opaline",
        "posLabel": "adj.",
        "en": "Resembling opal in its milky iridescence.",
        "example": "Opaline light shimmered over the harbor.",
        "rarity": "Rare",
    },
    {
        "word": "prevaricate",
        "posLabel": "verb",
        "en": "To speak or act evasively instead of telling the truth plainly.",
        "example": "Asked for a date, the minister continued to prevaricate.",
        "rarity": "Uncommon",
    },
    {
        "word": "philomeirakion",
        "posLabel": "noun",
        "en": "A person who is especially fond of young men.",
        "rarity": "Arcane",
    },
    {
        "word": "mellisonant",
        "posLabel": "adj.",
        "en": "Sweet or pleasing to the ear.",
        "example": "The actor's mellisonant voice carried through the hall.",
        "rarity": "Obscure",
    },
    {
        "word": "ineluctable",
        "posLabel": "adj.",
        "en": "Impossible to avoid or escape; inevitable.",
        "example": "The ineluctable conclusion emerged from the evidence.",
        "rarity": "Rare",
    },
    {
        "word": "nidificate",
        "posLabel": "verb",
        "en": "To build a nest.",
        "rarity": "Arcane",
    },
    {
        "word": "diaphanous",
        "posLabel": "adj.",
        "en": "Light, delicate, and almost transparent.",
        "example": "Diaphanous curtains softened the afternoon sun.",
        "rarity": "Rare",
    },
]


def ensure_wordnet() -> None:
    """Locate WordNet or download it into the configured NLTK data path."""
    try:
        wn.ensure_loaded()
        return
    except LookupError:
        pass

    download_dir = os.environ.get("NLTK_DATA")
    if download_dir:
        Path(download_dir).mkdir(parents=True, exist_ok=True)
    nltk.download("wordnet", download_dir=download_dir or None, quiet=False)
    wn.ensure_loaded()


def clean_text(value: str) -> str:
    text = " ".join(str(value or "").replace("_", " ").split())
    text = re.sub(r"\s*;\s*-\s*[A-Z].*$", "", text)
    return re.sub(r"(?:\s*;\s*)+$", "", text).strip()


def display_word(word: str) -> str:
    return word


def useful_definition(definition: str, lexname: str) -> bool:
    lowered = definition.lower()
    if lexname in DISALLOWED_LEXNAMES:
        return False
    if len(definition) < 18 or len(definition) > 180:
        return False
    if lowered.startswith(TECHNICAL_STARTS):
        return False
    if RELATIONAL_DEFINITION_RE.search(definition):
        return False
    if PERSON_CATEGORY_RE.search(definition):
        return False
    if TECHNICAL_DEFINITION_RE.search(definition):
        return False
    if re.search(r"\b(?:family|order) [A-Z][a-z]+", definition):
        return False
    return True


def lemma_is_headword(lemma: Any, word: str) -> bool:
    return lemma.name().lower().replace("_", "-") == word


def choose_sense(word: str, synsets: list[Any]) -> tuple[Any, Any] | None:
    ranked: list[tuple[float, Any, Any]] = []
    for sense_index, synset in enumerate(synsets):
        pos = POS_LABELS.get(synset.pos())
        if not pos:
            continue
        definition = clean_text(synset.definition())
        lexname = synset.lexname()
        if not useful_definition(definition, lexname):
            continue
        matching = [lemma for lemma in synset.lemmas() if lemma_is_headword(lemma, word)]
        if not matching:
            continue
        lemma = max(matching, key=lambda item: item.count())
        sense_score = min(lemma.count(), 12) * 0.5
        sense_score += 1.5 if synset.examples() else 0
        sense_score += 1.2 if lexname in ABSTRACT_LEXNAMES else 0
        sense_score -= sense_index * 0.16
        ranked.append((sense_score, synset, lemma))
    if not ranked:
        return None
    _, synset, lemma = max(ranked, key=lambda item: item[0])
    return synset, lemma


def candidate_score(
    word: str,
    zipf: float,
    definition: str,
    example: str,
    lexname: str,
    lemma_count: int,
) -> float:
    score = 10.5 - abs(zipf - 2.4) * 2.35
    score += 2.2 if lexname in ABSTRACT_LEXNAMES else 0
    score += 1.4 if example else 0
    score += min(math.log1p(max(0, lemma_count)), 2.0)
    score += 1.2 if 7 <= len(word) <= 14 else 0
    score += 0.8 if 35 <= len(definition) <= 110 else 0
    score += 1.2 if EVOCATIVE_ENDING_RE.search(word) else 0
    score -= 1.1 if INFLECTION_RE.search(word) else 0
    if word.endswith("ly"):
        base_zipf = float(zipf_frequency(word[:-2], "en", wordlist="large"))
        score -= max(0.0, base_zipf - 2.9) * 1.8
    score -= 1.0 if len(word) > 17 else 0
    return round(score, 5)


def rarity_label(zipf: float) -> str:
    if zipf >= 3.25:
        return "Uncommon"
    if zipf >= 2.55:
        return "Rare"
    if zipf >= 1.9:
        return "Obscure"
    return "Arcane"


def collect_candidates() -> dict[str, list[dict[str, Any]]]:
    synsets_by_word: dict[str, list[Any]] = defaultdict(list)
    for synset in wn.all_synsets():
        if synset.pos() not in POS_LABELS:
            continue
        for lemma in synset.lemmas():
            word = lemma.name().lower().replace("_", "-")
            if WORD_RE.fullmatch(word) and 5 <= len(word) <= 20:
                synsets_by_word[word].append(synset)

    manual_words = {entry["word"] for entry in MANUAL_ENTRIES}
    candidates: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for word, synsets in synsets_by_word.items():
        if word in manual_words or word in BLOCKED_WORDS:
            continue
        is_featured = word in FEATURED_INDEX
        zipf = round(float(zipf_frequency(word, "en", wordlist="large")), 2)
        if not is_featured and (zipf < 1.45 or zipf > 3.05):
            continue
        useful_synsets = synsets if is_featured else [
            synset
            for synset in synsets
            if not synset.lexname().startswith("noun.")
            or synset.lexname() in AUTO_NOUN_LEXNAMES
        ]
        selected = choose_sense(word, useful_synsets)
        if not selected:
            continue
        synset, lemma = selected
        definition = clean_text(synset.definition())
        if not is_featured and definition.lower().startswith(
            ("of ", "(of ", "relating ", "related ", "pertaining ")
        ):
            continue
        example = clean_text(synset.examples()[0]) if synset.examples() else ""
        pos = POS_LABELS[synset.pos()]
        entry = {
            "word": word,
            "display": display_word(word),
            "pos": [pos],
            "posLabel": POS_SHORT[pos],
            "en": definition[0].upper() + definition[1:],
            "sayEn": definition,
            "rarity": rarity_label(zipf),
            "_score": candidate_score(
                word,
                zipf,
                definition,
                example,
                synset.lexname(),
                lemma.count(),
            ),
            "_zipf": zipf,
        }
        if is_featured:
            entry["_score"] += 1000 - FEATURED_INDEX[word]
        if example and len(example) <= 170:
            entry["example"] = example[0].upper() + example[1:]
        candidates[pos].append(entry)

    for values in candidates.values():
        values.sort(key=lambda entry: (-entry["_score"], -entry["_zipf"], entry["word"]))
    return candidates


def tier_label(rank: int) -> str:
    if rank <= 500:
        return "Core"
    if rank <= 1500:
        return "Expanded"
    if rank <= 3000:
        return "Deep cuts"
    return "Outer reaches"


def build_entries() -> list[dict[str, Any]]:
    candidates = collect_candidates()
    selected: list[dict[str, Any]] = []

    for entry in MANUAL_ENTRIES:
        pos = {
            "adj.": "adjective",
            "noun": "noun",
            "verb": "verb",
            "adv.": "adverb",
        }.get(entry["posLabel"], "noun")
        normalized = {
            "word": entry["word"],
            "display": entry.get("display", entry["word"]),
            "pos": [pos],
            **entry,
        }
        selected.append(normalized)

    used = {entry["word"] for entry in selected}
    manual_counts = defaultdict(int)
    for entry in selected:
        label = entry["posLabel"]
        pos = {
            "adj.": "adjective",
            "noun": "noun",
            "verb": "verb",
            "adv.": "adverb",
        }.get(label, "noun")
        manual_counts[pos] += 1

    # Round-robin across parts of speech to keep every collection depth varied.
    queues: dict[str, list[dict[str, Any]]] = {}
    for pos, target in POS_TARGETS.items():
        needed = target - manual_counts[pos]
        queues[pos] = [entry for entry in candidates[pos] if entry["word"] not in used][:needed]
        if len(queues[pos]) != needed:
            raise RuntimeError(f"Only found {len(queues[pos])} of {needed} required {pos} entries")

    ratios = {
        pos: POS_TARGETS[pos] / TARGET_SIZE
        for pos in POS_TARGETS
    }
    emitted = defaultdict(int)
    while any(queues.values()):
        available = [pos for pos, queue in queues.items() if queue]
        pos = min(
            available,
            key=lambda item: (emitted[item] + 1) / ratios[item],
        )
        entry = queues[pos].pop(0)
        selected.append(entry)
        used.add(entry["word"])
        emitted[pos] += 1

    if len(selected) != TARGET_SIZE:
        raise RuntimeError(f"Expected {TARGET_SIZE} entries, produced {len(selected)}")

    output: list[dict[str, Any]] = []
    for rank, entry in enumerate(selected, start=1):
        clean_entry = {
            key: value
            for key, value in entry.items()
            if not key.startswith("_") and value not in ("", None, [])
        }
        clean_entry["rank"] = rank
        clean_entry["tier"] = tier_label(rank)
        output.append(clean_entry)
    return output


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"JSON output path (default: {DEFAULT_OUTPUT})",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    ensure_wordnet()
    entries = build_entries()
    payload = {
        "meta": {
            "language": "en",
            "name": "English Vernacular",
            "count": len(entries),
            "ranking": "curated learning order, not word frequency",
            "sources": [
                "Princeton WordNet 3.0 definitions and examples",
                "wordfreq rarity guardrails",
                "Wordfreak manual editorial seed list",
            ],
            "licenseNote": "See NOTICE.md for source attribution and data terms.",
        },
        "entries": entries,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(f"Wrote {len(entries):,} curated English entries to {args.output}")


if __name__ == "__main__":
    main()
