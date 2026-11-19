#!/usr/bin/env python3
"""Fail if any file or text names a ride, taxi, delivery or mobility company.

Usage:
  python3 scripts/check-names.py              scan every text file in the repo
  python3 scripts/check-names.py --text "msg" scan a commit message or other text
  python3 scripts/check-names.py --self-test  run the built-in checks

Run it before every commit. Exit code 1 means a name was found.
"""
import pathlib
import re
import sys

# Matched in any case. These words have no common English meaning.
DENY_ANY_CASE = [
    "uber", "lyft", "didi", "gojek", "careem", "cabify", "gett", "juno",
    "hailo", "blablacar", "waymo", "zoox", "doordash", "instacart",
    "postmates", "deliveroo", "grubhub", "seamless", "gopuff", "shipt",
    "rappi", "glovo", "wolt", "citibike", "citi bike", "ubereats",
]
# Matched only when capitalized. In lower case these are ordinary words.
DENY_CAPITALIZED = ["Grab", "Bolt", "Ola", "Via", "Curb", "Lime", "Bird", "Revel", "Cruise", "Arro"]

PATTERN = re.compile(
    r"\b(?:" + "|".join(re.escape(w) for w in DENY_ANY_CASE) + r")\b", re.IGNORECASE
)
PATTERN_CAP = re.compile(r"\b(?:" + "|".join(DENY_CAPITALIZED) + r")\b")

ROOT = pathlib.Path(__file__).resolve().parent.parent
SELF = pathlib.Path(__file__).resolve()
SKIP_DIRS = {".git", "node_modules", ".venv", "venv", "__pycache__", "dist", "build"}
TEXT_SUFFIXES = {".md", ".html", ".css", ".js", ".ts", ".tsx", ".jsx", ".py", ".json",
                 ".txt", ".yml", ".yaml", ".toml", ".csv", ".svg", ".sh"}


def find(text):
    return [m.group(0) for m in PATTERN.finditer(text)] + [m.group(0) for m in PATTERN_CAP.finditer(text)]


def scan_repo():
    hits = []
    for path in ROOT.rglob("*"):
        if path.resolve() == SELF or any(p in SKIP_DIRS for p in path.parts):
            continue
        # The file name counts as well as the content.
        for name in find(path.name):
            hits.append(f"{path.relative_to(ROOT)}: file name contains '{name}'")
        if not path.is_file() or path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        for n, line in enumerate(path.read_text(encoding="utf-8", errors="ignore").splitlines(), 1):
            for name in find(line):
                hits.append(f"{path.relative_to(ROOT)}:{n}: '{name}'")
    return hits


def self_test():
    assert find("We beat Uber here") == ["Uber"]
    assert find("a LYFT style app") == ["LYFT"]
    assert find("Grab the slider") == ["Grab"]
    assert find("grab the slider and bolt the door, via the menu") == []
    assert find("a ride marketplace and the platform") == []
    print("self-test passed")


def main(argv):
    if argv[:1] == ["--self-test"]:
        self_test()
        return 0
    if argv[:1] == ["--text"]:
        hits = [f"text: '{n}'" for n in find(" ".join(argv[1:]))]
    else:
        hits = scan_repo()
    if hits:
        print("Company names found. Replace them with 'a ride marketplace' or 'the platform'.")
        print("\n".join(hits))
        return 1
    print("No company names found.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
