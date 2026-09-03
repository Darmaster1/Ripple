# RIPPLE — Bengaluru Resilience Twin

RIPPLE is a dependency-aware urban infrastructure digital twin for the Indiranagar Operations Cell in Bengaluru, Karnataka. It helps a decision-maker move from **understanding** a real place to **breaking**, **simulating**, **analyzing**, **intervening**, and **optimizing** a resilient response.

## What is included

- A React + TypeScript command-center interface with a geographic twin, layer controls, asset inspection, cascade timeline, what-if comparison, criticality ranking, budget optimizer, and grounded copilot.
- A FastAPI-shaped API surface implemented in the shared Express service for the Replit workspace.
- Deterministic and explainable graph propagation for failures, degradation, and disconnect scenarios.
- PostgreSQL + Drizzle schema for the core digital-twin tables.
- Reproducible OSM ingestion scripts and documentation of provenance, licenses, assumptions, simulation, criticality, and optimization.

## Run locally in this workspace

```bash
pnpm install
pnpm --filter @workspace/api-spec run codegen
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/ripple run dev
```

The preview uses the workspace workflows, which provide `PORT` and `BASE_PATH`. The client calls the API through `/api`.

## Demo script

1. Open the command center and click **DEMO**.
2. Start the prepared **Major power substation failure** scenario.
3. Use **PLAY** or **STEP** to show the ripple from power to water, telecom, traffic, healthcare, and emergency access.
4. Open **Criticality** to explain why the substation ranks first.
5. Open **Optimize**, set a budget such as ₹5 Cr, and apply the recommended interventions.
6. Re-run the scenario with the selected intervention IDs to compare modeled impact.

## Data boundary

Mapped geometry and facility locations are labeled `VERIFIED` when sourced from OpenStreetMap. Calculated measures are `DERIVED`, and dependency relationships, capacity estimates, population exposure, and intervention benefits are `MODELED`. RIPPLE is a planning prototype, not an operational control system.

See `docs/` for the technical and data notes.