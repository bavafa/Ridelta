#!/usr/bin/env python3
"""Build public/data/target.json from the public Hillstrom randomized email test (S3.1, S3.2).

Run: .venv/bin/python data/prepare_target.py
An email stands in for a ride offer. A site visit stands in for a ride.
Treated = either email. Control = no email. The test is randomized, so on a held-out half
the visit rate of treated minus control inside any group of riders is an unbiased uplift.
"""
import json
import pathlib
import urllib.request

import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier as GB
from sklearn.metrics import roc_auc_score

ROOT = pathlib.Path(__file__).resolve().parent.parent
RAW = ROOT / "data/raw/hillstrom.csv"
URL = "http://www.minethatdata.com/Kevin_Hillstrom_MineThatData_E-MailAnalytics_DataMiningChallenge_2008.03.20.csv"
SEED = 7
STEPS = np.arange(0.05, 1.0001, 0.05)

if not RAW.exists():
    RAW.parent.mkdir(parents=True, exist_ok=True)
    urllib.request.urlretrieve(URL, RAW)
df = pd.read_csv(RAW)
df["treated"] = (df.segment != "No E-Mail").astype(int)
# Row counts of the published file.
assert len(df) == 64000 and df.treated.sum() == 42694, "row counts differ from the published file"

X = pd.get_dummies(df[["recency", "history", "mens", "womens", "zip_code", "newbie", "channel"]], dtype=float)
rng = np.random.default_rng(SEED)
test = rng.random(len(df)) < 0.5
Xtr, Xte, dtr, dte = X[~test], X[test], df[~test], df[test].reset_index(drop=True)

fit = lambda m: GB(max_iter=150, max_depth=3, learning_rate=0.05, random_state=SEED).fit(Xtr[m.values], dtr.visit[m.values])
m1, m0 = fit(dtr.treated == 1), fit(dtr.treated == 0)
mp = GB(max_iter=150, max_depth=3, learning_rate=0.05, random_state=SEED).fit(Xtr, dtr.visit)
scores = {
    "uplift": m1.predict_proba(Xte)[:, 1] - m0.predict_proba(Xte)[:, 1],
    "propensity": mp.predict_proba(Xte)[:, 1],
}


def curve(order):
    """Cumulative points: share of riders reached, uplift (treated rate minus control rate), treated visit rate."""
    d = dte.iloc[order]
    pts = []
    for s in STEPS:
        g = d.head(int(round(s * len(d))))
        tr, ct = g[g.treated == 1].visit, g[g.treated == 0].visit
        pts.append({"s": round(float(s), 2), "u": float(tr.mean() - ct.mean()), "t": float(tr.mean())})
    return pts


curves = {k: curve(np.argsort(-v, kind="stable")) for k, v in scores.items()}
overall = curves["uplift"][-1]  # share 1.0 is the whole held-out set, same for every ordering
# Random: any group has the overall uplift on average, so the curve is flat in u and t.
curves["random"] = [{"s": p["s"], "u": overall["u"], "t": overall["t"]} for p in curves["uplift"]]

# S3.2: the model must beat random on the held-out curve (cumulative extra visits per rider, at 30%).
gain = lambda k: next(p for p in curves[k] if p["s"] == 0.3)["u"]
assert gain("uplift") > gain("random"), "uplift model does not beat random"

out = {
    "source": "Hillstrom MineThatData E-Mail Analytics and Data Mining Challenge, 2008-03-20",
    "url": URL,
    "riders": int(len(df)),
    "treated": int(df.treated.sum()),
    "control": int((1 - df.treated).sum()),
    "holdout_riders": int(test.sum()),
    "seed": SEED,
    "model": "Two-model uplift: gradient boosting on treated and on control, scored on a held-out half.",
    "propensity_auc": float(roc_auc_score(dte.visit, scores["propensity"])),
    "curves": curves,
}
dest = ROOT / "public/data/target.json"
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(json.dumps(out, separators=(",", ":")))
print(f"wrote {dest}  uplift@30%={gain('uplift'):.4f} propensity@30%={gain('propensity'):.4f} random={gain('random'):.4f} all={overall['u']:.4f}")
