#!/usr/bin/env python3
"""Build Wordfreak's readable AFH 1 data from the pinned official PDF.

Usage:
    python3 scripts/build_afh1_data.py /path/to/afh1.pdf

The PDF itself is not committed. The generated JSON keeps the prose and chapter
structure while removing repeated page furniture and promotion-testing matrices
that do not linearize usefully for speech.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path


SOURCE_URL = "https://static.e-publishing.af.mil/production/1/af_a1/publication/afh1/afh1.pdf"
EXPECTED_SHA256 = "9f60b97f32240c8db0f19b37c287df7b933ecdcbf39f68133805182c0a48ef59"
EXPECTED_PAGES = 625
EDITION_DATE = "15 February 2025"

# Physical PDF pages, not printed page labels. The title page is physical page 1,
# so these values also match the visible page numbers in this edition.
CHAPTERS = [
    (2, "Front Matter — Introduction and Study Guidance"),
    (18, "Chapter 1 — Professionalism"),
    (27, "Chapter 2 — Aviation History"),
    (48, "Chapter 3 — Air Force Heritage"),
    (74, "Chapter 4 — Air and Cyberpower"),
    (89, "Chapter 5 — Military Organization and Command"),
    (109, "Chapter 6 — Doctrine and Joint Force"),
    (125, "Chapter 7 — Enlisted Force Development"),
    (152, "Chapter 8 — Assessments and Recognition"),
    (171, "Chapter 9 — Enlisted Promotions"),
    (181, "Chapter 10 — Assignments and Occupational Codes"),
    (202, "Chapter 11 — Personnel Programs and Benefits"),
    (225, "Chapter 12 — Finance, Manpower, and Resources"),
    (246, "Chapter 13 — Developing Organizations"),
    (260, "Chapter 14 — Developing Others"),
    (279, "Chapter 15 — Developing Self"),
    (304, "Chapter 16 — Developing Ideas"),
    (321, "Chapter 17 — Emergency Management"),
    (342, "Chapter 18 — Security"),
    (362, "Chapter 19 — Standards of Conduct"),
    (377, "Chapter 20 — Enforcing Military Standards"),
    (399, "Chapter 21 — Military Justice"),
    (414, "Chapter 22 — Fitness and Readiness"),
    (440, "Chapter 23 — Dress and Appearance"),
    (543, "Chapter 24 — Military Customs and Courtesies"),
    (566, "Attachment 1 — Glossary of References and Supporting Information"),
    (593, "Attachment 2 — The Roundel"),
    (594, "Attachment 3 — Department of the Air Force Leadership"),
    (597, "Attachment 4 — Chief Master Sergeants of the Air Force"),
    (617, "Attachment 5 — DAF Ribbons and Medals"),
    (619, "Attachment 6 — Devices"),
    (621, "Attachment 7 — USAF Medal of Honor Recipients"),
    (625, "Attachment 8 — The USAF Song"),
]

SKIP_PAGES = {5, 6, 7, 8, 9, 12, 13, 14, 575}

HEADER = "AFH 1, AIRMAN 15 February 2025"
MATRIX_MARKER = "REQUIRED LEVEL OF COMPREHENSION"
CONTENT_HEADING = re.compile(r"^\d{1,2}\.\d+(?:\.\d+)*\.(?:\s|$)")
WORD = re.compile(r"[A-Za-z0-9]+(?:[’'-][A-Za-z0-9]+)*")
SENTENCE_BOUNDARY = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9\"'“‘])")
ABBREVIATION = re.compile(
    r"\b(?i:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|Mt|Capt|Col|Gen|Rev|Hon|Sgt|Lt|Maj|Cpl|Pvt|Adm|Cmdr|No|Nos|Vol|Ed|Eds|Fig|Figs|Sec|Secs|Dept|Inc|Co|vs|etc|e\.g|i\.e)\."
    r"|(?:\b[A-Z]\.)+|\b\d{1,2}\.\d+(?:\.\d+)*\."
)
MAX_READER_UNIT = 500
NUMBERED_HEADING = re.compile(r"^\d{1,2}\.\d+(?:\.\d+)*\.$")
DELETION_MARKER = re.compile(
    r"(?:\bPARAGRAPH\s+|\bSection\s+\d+[A-Z]?[—-]|\b\d{1,2}\.\d+(?:\.\d+)*\.\s+)?DELETED\.?"
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def extract_pages(pdf_path: Path) -> list[str]:
    result = subprocess.run(
        ["pdftotext", "-enc", "UTF-8", str(pdf_path), "-"],
        check=True,
        capture_output=True,
    )
    return result.stdout.decode("utf-8").split("\f")[:EXPECTED_PAGES]


def join_wrapped_lines(lines: list[str]) -> str:
    value = ""
    for raw_line in lines:
        line = re.sub(r"\s+", " ", raw_line.strip())
        if not line:
            continue
        if not value:
            value = line
        elif value.endswith("-") and line[:1].islower():
            value += line
        else:
            value += f" {line}"
    return re.sub(r"\s+", " ", value).strip()


def split_oversized(value: str) -> list[str]:
    chunks: list[str] = []
    remaining = value.strip()
    while len(remaining) > MAX_READER_UNIT:
        window = remaining[: MAX_READER_UNIT + 1]
        minimum = min(160, len(window) // 2)
        cut = 0
        for pattern in (r"[.!?][\"'”’)]*\s+", r"[;:]\s+", r",\s+", r"\s+"):
            matches = list(re.finditer(pattern, window))
            valid = [match.end() for match in matches if match.end() >= minimum]
            if valid:
                cut = valid[-1]
                break
        if not cut:
            cut = MAX_READER_UNIT
        chunks.append(remaining[:cut].strip())
        remaining = remaining[cut:].strip()
    if remaining:
        chunks.append(remaining)
    return chunks


def split_reader_sentences(paragraph: str) -> list[str]:
    protected: list[str] = []

    def protect(match: re.Match[str]) -> str:
        token = f"__AFH_ABBR_{len(protected)}__"
        protected.append(match.group(0))
        return token

    safe = ABBREVIATION.sub(protect, paragraph)
    parts = SENTENCE_BOUNDARY.split(safe)
    result: list[str] = []
    for part in parts:
        for chunk in split_oversized(part):
            restored = re.sub(
                r"__AFH_ABBR_(\d+)__",
                lambda match: protected[int(match.group(1))],
                chunk,
            ).strip()
            if restored:
                result.append(restored)
    return result


def merge_numbered_headings(paragraphs: list[str]) -> list[str]:
    merged: list[str] = []
    index = 0
    while index < len(paragraphs):
        paragraph = paragraphs[index]
        if NUMBERED_HEADING.fullmatch(paragraph) and index + 1 < len(paragraphs):
            paragraph = f"{paragraph} {paragraphs[index + 1]}"
            index += 1
            title = paragraphs[index]
            if (
                len(title) <= 120
                and not re.search(r"[.!?]$", title)
                and index + 1 < len(paragraphs)
            ):
                paragraph = f"{paragraph} {paragraphs[index + 1]}"
                index += 1
        merged.append(paragraph)
        index += 1
    return merged


def clean_page(page_text: str, page_number: int, opening_label: str | None) -> list[str]:
    lines = page_text.replace("\r", "").replace("ﬁ", "fi").replace("ﬂ", "fl").splitlines()

    # Remove the exact running header and the standalone printed page number.
    # Some image-heavy pages place the page number in the middle of extracted
    # text, so limiting this to the header/footer edge leaks speech noise.
    lines = ["" if line.strip() == HEADER else line for line in lines]
    for index in range(len(lines)):
        if lines[index].strip() == str(page_number):
            lines[index] = ""

    if opening_label and opening_label.startswith(("Chapter", "Attachment")):
        kind, number = ("Chapter", re.search(r"Chapter (\d+)", opening_label).group(1)) \
            if opening_label.startswith("Chapter") \
            else ("Attachment", re.search(r"Attachment (\d+)", opening_label).group(1))
        marker = f"{kind} {number}"
        for index, line in enumerate(lines):
            if line.strip() != marker:
                continue
            lines[index] = ""
            next_index = index + 1
            while next_index < len(lines) and not lines[next_index].strip():
                next_index += 1
            if next_index < len(lines):
                lines[next_index] = ""
            break

    # Each promotion matrix is a visual table. Preserve its preceding section
    # title and the numbered prose heading that follows, but omit the matrix.
    while True:
        marker_index = next(
            (index for index, line in enumerate(lines) if MATRIX_MARKER in line),
            None,
        )
        if marker_index is None:
            break
        content_index = next(
            (
                index
                for index in range(marker_index + 1, len(lines))
                if CONTENT_HEADING.match(lines[index].strip())
            ),
            None,
        )
        if content_index is None:
            raise ValueError(f"page {page_number}: promotion matrix has no following prose heading")
        lines[marker_index:content_index] = [""]

    blocks: list[list[str]] = []
    block: list[str] = []
    for line in lines:
        if line.strip():
            block.append(line)
        elif block:
            blocks.append(block)
            block = []
    if block:
        blocks.append(block)

    paragraphs = [
        re.sub(r"\s+", " ", DELETION_MARKER.sub("", join_wrapped_lines(block))).strip()
        for block in blocks
    ]
    return [paragraph for paragraph in paragraphs if paragraph]


def build_document(pages: list[str]) -> dict[str, object]:
    chapters: list[dict[str, object]] = []
    for index, (start_page, title) in enumerate(CHAPTERS):
        end_page = CHAPTERS[index + 1][0] - 1 if index + 1 < len(CHAPTERS) else EXPECTED_PAGES
        raw_paragraphs: list[str] = []
        for page_number in range(start_page, end_page + 1):
            if page_number in SKIP_PAGES:
                continue
            raw_paragraphs.extend(clean_page(
                pages[page_number - 1],
                page_number,
                title if page_number == start_page else None,
            ))

        paragraphs = [
            sentences
            for paragraph in merge_numbered_headings(raw_paragraphs)
            if (sentences := split_reader_sentences(paragraph))
        ]

        # The song was written outside the federal government and may retain
        # third-party copyright. Keep the chapter/source pointer, not its lyrics.
        if start_page == 625:
            paragraphs = [["Song lyrics are available in the official PDF linked from this reader."]]

        if not paragraphs:
            raise ValueError(f"{title}: no readable paragraphs")
        chapters.append({
            "title": title,
            "startPage": start_page,
            "endPage": end_page,
            "paragraphs": paragraphs,
        })

    word_count = sum(
        len(WORD.findall(sentence))
        for chapter in chapters
        for paragraph in chapter["paragraphs"]
        for sentence in paragraph
    )
    reader_unit_count = sum(
        len(paragraph)
        for chapter in chapters
        for paragraph in chapter["paragraphs"]
    )
    return {
        "schemaVersion": 1,
        "publication": {
            "id": "usaf:afh1:2025-02-15",
            "dataVersion": 1,
            "title": "Air Force Handbook 1 — Airman",
            "editionDate": EDITION_DATE,
            "publisher": "United States Air Force",
            "sourceUrl": SOURCE_URL,
            "sourcePdfSha256": EXPECTED_SHA256,
            "sourcePageCount": EXPECTED_PAGES,
            "wordCount": word_count,
            "readerUnitCount": reader_unit_count,
            "sectionCount": len(chapters),
            "adaptation": "Readable text extracted from the official PDF; repeated page furniture and promotion-testing matrices removed.",
            "disclaimer": "Unofficial reader; not endorsed by the U.S. Department of Defense or U.S. Air Force. Consult the official publication.",
        },
        "chapters": chapters,
    }


def validate(document: dict[str, object]) -> None:
    chapters = document["chapters"]
    if len(chapters) != 33:
        raise ValueError(f"expected front matter plus 32 chapters/attachments, got {len(chapters)}")
    word_count = document["publication"]["wordCount"]
    if not 180_000 <= word_count <= 300_000:
        raise ValueError(f"unexpected cleaned word count: {word_count}")
    all_text = "\n".join(
        sentence
        for chapter in chapters
        for paragraph in chapter["paragraphs"]
        for sentence in paragraph
    )
    forbidden = [HEADER, MATRIX_MARKER, "DELETED", "Off we go into the wild blue yonder"]
    for value in forbidden:
        if value in all_text:
            raise ValueError(f"unremoved reader noise or excluded text: {value}")
    units = [
        sentence
        for chapter in chapters
        for paragraph in chapter["paragraphs"]
        for sentence in paragraph
    ]
    if not units or max(map(len, units)) > MAX_READER_UNIT:
        raise ValueError("reader unit length validation failed")
    if len(units) != document["publication"]["readerUnitCount"]:
        raise ValueError("reader unit count metadata mismatch")
    required_text = [
        "This handbook does not apply to the United States Space Force.",
        "AFH 1 is the sole source reference for the Enlisted Promotion Study Guides.",
        "Benjamin O. Davis, Jr.",
        "Richard L. Etchberger",
        "Staff Sgt. Esther McGowin Blake",
        "Signal Corps No. 1",
        "DoDM 1348.33 Vol. 2",
    ]
    for value in required_text:
        if value not in all_text:
            raise ValueError(f"required source text or abbreviation continuity missing: {value}")
    if any(re.search(r"(?:^|\s)[A-Z]\.$", unit) for unit in units):
        raise ValueError("reader unit ends with a split middle initial")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", type=Path, help="Official AFH 1 PDF")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "data/books/afh1-airman-2025.json",
    )
    args = parser.parse_args()

    actual_sha256 = sha256(args.pdf)
    if actual_sha256 != EXPECTED_SHA256:
        raise ValueError(
            "AFH 1 PDF does not match the pinned 15 February 2025 source: "
            f"expected {EXPECTED_SHA256}, got {actual_sha256}"
        )
    pages = extract_pages(args.pdf)
    if len(pages) != EXPECTED_PAGES:
        raise ValueError(f"expected {EXPECTED_PAGES} pages, got {len(pages)}")

    document = build_document(pages)
    validate(document)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(document, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    size = args.output.stat().st_size
    words = document["publication"]["wordCount"]
    print(f"Wrote {args.output} ({size:,} bytes, {words:,} words, {len(document['chapters'])} sections)")


if __name__ == "__main__":
    main()
