# Data pipeline

The data directory is split into:

- `raw/` — downloaded source files, never modified in place.
- `processed/` — normalized GeoJSON/CSV ready for validation and seeding.
- `README.md` — this pipeline note.

Run the scripts in order:

```bash
python scripts/download_osm.py
python scripts/process_buildings.py
python scripts/process_roads.py
python scripts/process_infrastructure.py
python scripts/seed_database.py
```

The checked-in application uses a small curated sample so the demo works offline. The scripts remain reproducible and accept the study-area bounds through environment variables.