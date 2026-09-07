# RIPPLE — Bengaluru Resilience Twin

RIPPLE is a digital copy of a real urban area of Bengaluru (**Indiranagar Operations Cell**) that models interconnected infrastructure dependencies. It takes real GIS data—buildings, roads, power grid nodes, water distribution networks, telecom towers, hospitals, and emergency services—and links them into a dynamic dependency graph.

RIPPLE lets city administrators and emergency planners **break** a digital version of the city, watch failure **cascade** through interconnected infrastructure, analyze **criticality**, simulate **what-if interventions**, and optimize **capital budget allocation** to prevent real-world infrastructure collapse.

---

## 🚀 One-Click Local Setup (Windows / npm)

RIPPLE is fully converted to run on standard `npm` without `pnpm` constraints.

### 1. Launch automatically (Recommended)
Double-click **[`start-ripple.bat`](file:///c:/Users/mohni/Downloads/Project%20Moneypal/ripple-bengaluru-resilience-twin/start-ripple.bat)** in the root folder. It will:
1. Verify node dependencies (`npm install --legacy-peer-deps` if needed).
2. Start the Express API server on `http://localhost:3001`.
3. Start the Vite React Web Command Center on `http://localhost:5173`.
4. Automatically open your web browser directly to the dashboard.

### 2. Manual Command Line Startup
```bash
# Install monorepo dependencies
npm install --legacy-peer-deps

# Run frontend client & backend API concurrently
npm run dev
```

---

## 🌟 Key Features & Capabilities

### 1. 3D Interactive Map Twin (`MapLibre GL JS`)
- **Real-Time 3D Building Extrusions**: Extruded 3D building geometry colored by facility type (Healthcare, Commercial, Residential, Education).
- **Interactive Camera Controls**: Toggle between 2D Top-Down View and 3D Perspective View (52° pitch tilt, 360° rotation, zoom in/out, reset view).
- **Asset Pins & Popups**: Clickable map markers for 10 core infrastructure nodes with detailed hover popups and auto-focus camera zooming.

### 2. Deterministic Graph Cascade Engine
- Dynamic Breadth-First Traversal (BFS) across directed dependency edges.
- Evaluates edge failure thresholds based on dependency strength, failure severity, and depth decay.
- **Population Impact Range**: Accurately scales population exposure per node across a **245,000 resident study area**:
  - ⚡ *Indiranagar Substation*: ~215,600 affected
  - 💧 *Booster Pump P1*: ~127,400 affected
  - 🏥 *Manipal Hospital*: ~110,250 affected
  - 🚰 *Water Distribution Node*: ~93,100 affected
  - 🌉 *Domlur Flyover Approach*: ~78,400 affected
  - 📡 *Telecom Node T4*: ~68,600 affected
  - 🚓 *Police Station*: ~29,400 affected
- **Clean Reset State**: Resetting workspace restores baseline numbers (`0 (Baseline)`) instead of empty dashes.

### 3. Exposure Intelligence & Criticality Rank
- Ranks assets by topological centrality, dependency depth, and population exposure.
- **Click-to-Expand Score Rationale**: Click any row in the criticality list to expand a detailed breakdown explaining why the asset scored high, its downstream links, and failure impact trails.

### 4. What-If Intervention Studio (Full CRUD + Persistence)
- **Computer-Calculated What-If Engine**: Pick any asset failure and any domain-specific intervention (Auxiliary Generators, Microgrids, Sectionalizing, Dual Pipelines, Traffic Green Corridors, Cell-on-Wheels). The engine dynamically calculates the before/after population exposure and net percentage reduction.
- **Context-Aware Options**: Dropdowns automatically filter to show domain-specific interventions relevant to the selected failure node.
- **Intervention Rationale Callouts**: Displays detailed explanations ("How this intervention helps") for every selected intervention.
- **Full CRUD Controls**: Add, view, edit, and delete What-If scenarios.
- **Persistent LocalStorage**: All custom scenarios created or modified are automatically saved to browser `localStorage` and persist across page navigation and reloads.

### 5. Constrained Capital Budget Optimizer
- Slider-based resilience budget allocation (₹1 Cr – ₹20 Cr).
- Ranks candidate interventions using a greedy resilience-gain-to-cost ratio.
- Renders total selected spend, unallocated reserve, and percentage reduction in cascade impact.

### 6. Grounded RIPPLE Copilot
- Plain-language decision support assistant.
- Translates user queries into deterministic graph queries and links model reasoning directly to simulation outputs.

---

## 🛠️ Tech Stack & Workspace Architecture

- **Frontend**: React 18, TypeScript, Tailwind CSS, MapLibre GL JS, Lucide Icons, Wouter Router, TanStack Query (React Query).
- **Backend Service**: Node.js, Express 5, TypeScript.
- **Database**: PostgreSQL with Drizzle ORM schema (`lib/db`).
- **Shared Packages**: `@workspace/api-zod`, `@workspace/api-client-react`.

---

## 📊 Data Provenance & Boundary

- **Geometry & Facilities**: openStreetMap (`VERIFIED`).
- **Dependencies & Failure Thresholds**: `MODELED` structural graph topology.
- **Population Extent**: `MODELED` spatial footprint grounded in Indiranagar ward density (~245,000 residents).

---

*RIPPLE is an urban resilience twin prototype for planning, simulation, and decision support.*