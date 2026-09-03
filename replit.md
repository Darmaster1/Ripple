# RIPPLE — Bengaluru Resilience Twin

RIPPLE is an interactive digital twin for exploring infrastructure dependencies, simulating cascading failures, and planning resilience investments in Indiranagar, Bengaluru.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod 3, `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/ripple/src/` — command-center web app and user-facing simulation flows
- `artifacts/api-server/src/data/ripple.ts` — curated study-area twin data and provenance
- `artifacts/api-server/src/services/ripple-engine.ts` — deterministic cascade, criticality, optimization, and copilot logic
- `artifacts/api-server/src/routes/ripple.ts` — typed REST endpoints
- `lib/api-spec/openapi.yaml` — source of truth for generated API hooks and schemas
- `lib/db/src/schema/ripple.ts` — PostgreSQL-ready digital-twin schema
- `docs/` and `scripts/` — data sources, assumptions, simulation notes, and reproducible OSM pipeline

## Architecture decisions

- The preview keeps the curated sample twin in memory so the demo is portable and deterministic; the Drizzle schema is ready for a database-backed refresh.
- The cascade engine is explicit graph traversal, never an opaque model; every result carries affected IDs, timeline events, and an explanation.
- OpenStreetMap-derived geometry/facility examples are labeled verified; dependencies, capacities, population exposure, and intervention benefits are labeled modeled.
- The study area is represented by environment-configurable bounds and is not spread as hard-coded geography across the application.

## Product

- Explore an Indiranagar digital twin with buildings, mapped roads, and infrastructure assets, including a 3D city-model view.
- Break an asset, animate the dependency ripple, and inspect measurable impact.
- Whole-twin impact calculations include affected buildings, road geometry, dependency edges, service nodes, and population exposure.
- Rank critical nodes, compare what-if interventions, optimize a constrained budget, and ask a grounded copilot.

## User preferences

No additional preferences recorded.

## Gotchas

- Run API codegen after editing `lib/api-spec/openapi.yaml`; generated client and Zod outputs are source-controlled.
- API routes are mounted under `/api`; the web artifact uses the shared proxy and should not hard-code localhost.
- `zod` is currently v3, so the Orval config pins Zod output compatibility to version 3.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
