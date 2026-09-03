import { createInsertSchema } from "drizzle-zod";
import { doublePrecision, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

const provenance = jsonb("provenance").$type<{
  source: string;
  data_type: "VERIFIED" | "DERIVED" | "MODELED";
  confidence: "HIGH" | "MEDIUM" | "LOW";
}>();

export const buildingsTable = pgTable("buildings", {
  id: text("id").primaryKey(),
  osmId: text("osm_id"),
  buildingType: text("building_type").notNull(),
  centroidLat: doublePrecision("centroid_lat").notNull(),
  centroidLon: doublePrecision("centroid_lon").notNull(),
  areaM2: doublePrecision("area_m2"),
  levels: integer("levels"),
  height: doublePrecision("height"),
  provenance,
});

export const roadsTable = pgTable("roads", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  roadType: text("road_type").notNull(),
  geometry: jsonb("geometry").notNull(),
  lengthM: doublePrecision("length_m"),
  provenance,
});

export const infrastructureAssetsTable = pgTable("infrastructure_assets", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  capacity: text("capacity"),
  importance: integer("importance"),
  status: text("status").notNull().default("NORMAL"),
  provenance,
});

export const dependenciesTable = pgTable("dependencies", {
  id: serial("id").primaryKey(),
  sourceId: text("source_id").notNull(),
  targetId: text("target_id").notNull(),
  dependencyType: text("dependency_type").notNull(),
  strength: doublePrecision("strength").notNull(),
  threshold: doublePrecision("threshold").notNull(),
  confidence: text("confidence").notNull(),
});

export const scenariosTable = pgTable("scenarios", {
  id: text("id").primaryKey(),
  assetId: text("asset_id").notNull(),
  action: text("action").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const simulationResultsTable = pgTable("simulation_results", {
  id: text("id").primaryKey(),
  scenarioId: text("scenario_id").notNull(),
  impact: jsonb("impact").notNull(),
  timeline: jsonb("timeline").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interventionsTable = pgTable("interventions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  costCrore: doublePrecision("cost_crore").notNull(),
  target: text("target").notNull(),
  impactReduction: integer("impact_reduction").notNull(),
  implementationTime: text("implementation_time").notNull(),
});

export const insertBuildingSchema = createInsertSchema(buildingsTable);
export const insertRoadSchema = createInsertSchema(roadsTable);
export const insertInfrastructureAssetSchema = createInsertSchema(infrastructureAssetsTable);
export const insertDependencySchema = createInsertSchema(dependenciesTable);
export const insertScenarioSchema = createInsertSchema(scenariosTable);
export const insertSimulationResultSchema = createInsertSchema(simulationResultsTable);
export const insertInterventionSchema = createInsertSchema(interventionsTable);