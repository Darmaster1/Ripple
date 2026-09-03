# RIPPLE architecture

RIPPLE has two connected models:

1. **Geographic model** — buildings, roads, and facilities in the configurable study area.
2. **Dependency model** — directed weighted relationships such as `POWER`, `SUPPLY`, `ROAD_ACCESS`, `TELECOM`, and `EMERGENCY_ACCESS`.

The browser consumes typed hooks generated from `lib/api-spec/openapi.yaml`. The shared API service exposes the read-only twin and deterministic planning endpoints. The current hackathon build keeps the curated dataset in memory for a fast, reproducible demo while `lib/db` contains the PostgreSQL/PostGIS-ready schema.

The service boundary is intentionally small:

```text
React/Vite → generated API client → /api → twin data + ripple engine
                                      ├─ graph propagation
                                      ├─ impact metrics
                                      ├─ criticality ranking
                                      └─ greedy budget optimizer
```

The geographic layer is extensible because an asset is represented by generic fields (`id`, `type`, `location`, `capacity`, `status`, and provenance). New types can be added without changing the simulation algorithm.