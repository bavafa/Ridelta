#!/usr/bin/env python3
"""Fail if UI text in src/ breaks the PRD writing rules: no em dashes and no contractions.
Semicolons are legal in code, so they are not checked here. Run: python3 scripts/check-writing.py"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTRACTION = re.compile(r"\b(?:don|doesn|didn|isn|aren|wasn|weren|can|couldn|won|wouldn|shouldn|hasn|haven|hadn)['’]t\b|\b(?:it|that|there|here|what|let|he|she)['’]s\b|\b(?:you|we|they)['’](?:re|ve|ll|d)\b|\bI['’](?:m|ve|ll|d)\b", re.I)
bad = []
for f in sorted((ROOT / "src").rglob("*")):
    if f.suffix not in {".tsx", ".ts"} or f.name.endswith(".test.ts"):
        continue
    for n, line in enumerate(f.read_text().splitlines(), 1):
        code = line.strip().startswith(("//", "*", "/*"))
        if "—" in line and not code:
            bad.append(f"{f.relative_to(ROOT)}:{n}: em dash")
        # a contraction inside quotes or JSX text, not a code comment
        if CONTRACTION.search(line) and not code:
            bad.append(f"{f.relative_to(ROOT)}:{n}: contraction: {CONTRACTION.search(line).group(0)}")
print("\n".join(bad) or "Writing rules OK.")
sys.exit(1 if bad else 0)
