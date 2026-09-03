"""Normalize building features from the raw Overpass extract."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
target = root / "data" / "processed" / "buildings.geojson"
sources = sorted((root / "data" / "raw").glob("buildings_*.json"))
if not sources:
    sources = [root / "data" / "raw" / "indiranagar_overpass.json"]

def read_payload(source):
    text = source.read_text(encoding="utf-8")
    try:
        return json.loads(text)
    except json.JSONDecodeError:
    # Overpass can close a long response early. Recover complete way objects
    # from the elements array rather than discarding the usable prefix.
        decoder = json.JSONDecoder()
        elements_key = text.find('"elements"')
        elements_start = text.find('[', elements_key) + 1
        elements = []
        cursor = elements_start
        while cursor < len(text):
            while cursor < len(text) and text[cursor] in " \n\r\t,":
                cursor += 1
            try:
                element, cursor = decoder.raw_decode(text, cursor)
            except json.JSONDecodeError:
                break
            elements.append(element)
        return {"elements": elements}

payload = {"elements": [element for source in sources for element in read_payload(source).get("elements", [])]}
features = []
for element in payload.get("elements", []):
    if element.get("type") != "way" or "building" not in element.get("tags", {}):
        continue
    geometry = [[point["lon"], point["lat"]] for point in element.get("geometry", [])]
    if len(geometry) < 3:
        continue
    lons = [point[0] for point in geometry]
    lats = [point[1] for point in geometry]
    centroid = {"lat": sum(lats) / len(lats), "lon": sum(lons) / len(lons)}
    area_m2 = max(40, (max(lons) - min(lons)) * 111000 * (max(lats) - min(lats)) * 111000)
    levels = int(element.get("tags", {}).get("building:levels", 2)) if str(element.get("tags", {}).get("building:levels", "2")).isdigit() else 2
    features.append({
        "type": "Feature",
        "id": f"BLDG-{element['id']}",
        "properties": {"building_type": element.get("tags", {}).get("building", "UNKNOWN"), "osm_id": element["id"], "centroid": centroid, "area_m2": area_m2, "levels": levels, "height": levels * 3.2},
        "geometry": {"type": "Polygon", "coordinates": [geometry]},
    })
target.write_text(json.dumps({"type": "FeatureCollection", "features": features}, indent=2), encoding="utf-8")
print(f"Processed {len(features)} buildings")