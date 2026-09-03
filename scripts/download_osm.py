"""Download an openly licensed OSM Overpass extract for the configured study area."""
import json
import os
from pathlib import Path
from urllib.request import Request, urlopen

root = Path(__file__).resolve().parents[1]
raw = root / "data" / "raw"
raw.mkdir(parents=True, exist_ok=True)
bounds = (
    float(os.getenv("MIN_LAT", "12.9668")),
    float(os.getenv("MIN_LON", "77.6352")),
    float(os.getenv("MAX_LAT", "12.9768")),
    float(os.getenv("MAX_LON", "77.6469")),
)
south, west, north, east = bounds
query = f"""[out:json][timeout:60];(
  way["building"]({south},{west},{north},{east});
  way["highway"]({south},{west},{north},{east});
  node["amenity"]({south},{west},{north},{east});
  node["power"]({south},{west},{north},{east});
);out body geom;"""
request = Request(
    "https://overpass-api.de/api/interpreter",
    data=query.encode(),
    headers={"User-Agent": "RIPPLE-hackathon-prototype/1.0"},
)
with urlopen(request, timeout=90) as response:
    payload = json.load(response)
(raw / "indiranagar_overpass.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")
print(f"Saved {len(payload.get('elements', []))} OSM elements")