#!/usr/bin/env python3
"""Build public/data/sponsor.json (S4.1).

Run: .venv/bin/python data/prepare_sponsor.py
Sources, all public:
  - NYC for-hire trip records, high-volume file, one month, all operators combined (no operator column is read).
  - NYC taxi zones (boundaries and names).
  - Overture Maps Places, stores and shopping centers in New York City.
Output: weekly trips from each starting zone to each zone that holds an exported store, zone shapes and the store list.
"""
import io
import json
import pathlib
import urllib.request
import zipfile

import duckdb
import shapefile
from pyproj import Transformer
from shapely.geometry import Point, shape
from shapely.strtree import STRtree

ROOT = pathlib.Path(__file__).resolve().parent.parent
TLC = "https://d37ci6vzurychx.cloudfront.net"
MONTH, DAYS = "2025-09", 30
OVERTURE = "2026-10-21.0"
STORE_CATS = ["supermarket", "grocery_store", "department_store", "bookstore", "clothing_store", "electronics_store",
              "furniture_store", "pharmacy", "sporting_goods_store", "shoe_store"]
MALL_CATS = ["shopping_center", "shopping_mall"]
PER_CAT = 15

# 1. Zones: reproject to longitude and latitude, simplify for the map.
z = zipfile.ZipFile(io.BytesIO(urllib.request.urlopen(f"{TLC}/misc/taxi_zones.zip").read()))
z.extractall(ROOT / "data/raw/zones")
sf = shapefile.Reader(str(ROOT / "data/raw/zones/taxi_zones/taxi_zones"))
tf = Transformer.from_crs("EPSG:2263", "EPSG:4326", always_xy=True)
zones, polys = {}, {}
for rec, sh in zip(sf.records(), sf.shapes()):
    d = rec.as_dict()
    zid = int(d["LocationID"])
    geom = shape(sh.__geo_interface__)
    parts = [shape({"type": "Polygon", "coordinates": [[tf.transform(x, y) for x, y in ring] for ring in p.__geo_interface__["coordinates"]]}) for p in (geom.geoms if geom.geom_type == "MultiPolygon" else [geom])]
    g = parts[0] if len(parts) == 1 else shape({"type": "MultiPolygon", "coordinates": [p.__geo_interface__["coordinates"] for p in parts]})
    g = g.simplify(0.0006)
    polys[zid] = g
    c = g.centroid
    rings = [[[round(x, 4), round(y, 4)] for x, y in poly.exterior.coords] for poly in (g.geoms if g.geom_type == "MultiPolygon" else [g])]
    zones[zid] = {"id": zid, "name": d["zone"], "borough": d["borough"], "lon": round(c.x, 4), "lat": round(c.y, 4), "rings": rings}
print("zones", len(zones))

# 2. Stores from Overture Places. Only the columns needed are read.
con = duckdb.connect()
con.execute("INSTALL httpfs; LOAD httpfs; SET s3_region='us-west-2';")
places = f"s3://overturemaps-us-west-2/release/{OVERTURE}/theme=places/type=place/*"
cats = ",".join(f"'{c}'" for c in STORE_CATS + MALL_CATS)
rows = con.execute(f"""
  SELECT id, names.primary AS name, taxonomy.primary AS cat, confidence, bbox.xmin AS lon, bbox.ymin AS lat
  FROM read_parquet('{places}', hive_partitioning=1)
  WHERE bbox.xmin BETWEEN -74.05 AND -73.70 AND bbox.ymin BETWEEN 40.49 AND 40.92
    AND taxonomy.primary IN ({cats}) AND names.primary IS NOT NULL AND confidence >= 0.9
  ORDER BY confidence DESC, name
""").fetchall()
print("places", len(rows))
tree = STRtree(list(polys.values()))
zid_of = {id(g): k for k, g in polys.items()}
stores, seen, count = [], set(), {}
for pid, name, cat, conf, lon, lat in rows:
    if name.lower() in seen or count.get(cat, 0) >= (40 if cat in MALL_CATS else PER_CAT):
        continue
    hit = [i for i in tree.query(Point(lon, lat)) if polys[list(polys)[i]].contains(Point(lon, lat))]
    if not hit:
        continue
    seen.add(name.lower())
    count[cat] = count.get(cat, 0) + 1
    stores.append({"id": pid, "name": name, "cat": cat, "kind": "mall" if cat in MALL_CATS else "store",
                   "lon": round(lon, 5), "lat": round(lat, 5), "zone": list(polys)[hit[0]]})
dest = sorted({s["zone"] for s in stores})
print("stores", len(stores), "destination zones", len(dest))

# 3. Weekly trips from every starting zone to each destination zone. Only two columns are read.
url = f"{TLC}/trip-data/fhvhv_tripdata_{MONTH}.parquet"
t = con.execute(f"""
  SELECT DOLocationID AS d, PULocationID AS o, count(*) AS n FROM read_parquet('{url}')
  WHERE DOLocationID IN ({','.join(map(str, dest))}) GROUP BY 1, 2
""").fetchall()
weeks = DAYS / 7
trips = {}
for d, o, n in t:
    w = n / weeks
    if w >= 1 and o in zones:
        trips.setdefault(str(d), {})[str(o)] = round(w, 1)

out = {
    "sources": {
        "trips": f"NYC TLC high-volume for-hire vehicle trip records, {MONTH}, all operators combined",
        "zones": "NYC TLC taxi zones",
        "stores": f"Overture Maps Places, release {OVERTURE}, confidence 0.9 or higher",
    },
    "weeks": round(weeks, 2),
    "zones": [zones[k] for k in sorted(zones)],
    "stores": stores,
    "trips": trips,
}
dest_file = ROOT / "public/data/sponsor.json"
dest_file.write_text(json.dumps(out, separators=(",", ":")))
print("wrote", dest_file, dest_file.stat().st_size // 1024, "KB")
