"""Extract mapped amenities and utility points into a generic asset feed."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = root / "data" / "raw" / "indiranagar_overpass.json"
target = root / "data" / "processed" / "infrastructure.json"
payload = json.loads(source.read_text(encoding="utf-8"))
assets = []
for element in payload.get("elements", []):
    if element.get("type") != "node":
        continue
    tags = element.get("tags", {})
    kind = tags.get("amenity") or tags.get("power")
    if not kind:
        continue
    assets.append({
        "osm_id": element["id"],
        "type": kind.upper(),
        "name": tags.get("name", f"Mapped {kind}"),
        "location": {"lat": element["lat"], "lon": element["lon"]},
        "provenance": {"source": "OpenStreetMap", "data_type": "VERIFIED", "confidence": "HIGH"},
    })
target.write_text(json.dumps(assets, indent=2), encoding="utf-8")
print(f"Processed {len(assets)} infrastructure points")