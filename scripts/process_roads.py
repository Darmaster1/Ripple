"""Normalize highway ways from the raw Overpass extract."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = root / "data" / "raw" / "indiranagar_overpass.json"
target = root / "data" / "processed" / "roads.geojson"
payload = json.loads(source.read_text(encoding="utf-8"))
features = []
for element in payload.get("elements", []):
    if element.get("type") != "way" or "highway" not in element.get("tags", {}):
        continue
    geometry = [[point["lon"], point["lat"]] for point in element.get("geometry", [])]
    if len(geometry) < 2:
        continue
    tags = element.get("tags", {})
    features.append({
        "type": "Feature",
        "id": f"ROAD-{element['id']}",
        "properties": {"name": tags.get("name", "Unnamed road"), "road_type": tags["highway"], "osm_id": element["id"]},
        "geometry": {"type": "LineString", "coordinates": geometry},
    })
target.write_text(json.dumps({"type": "FeatureCollection", "features": features}, indent=2), encoding="utf-8")
print(f"Processed {len(features)} roads")