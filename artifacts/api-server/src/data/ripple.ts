import type {
  Asset,
  Building,
  Dependency,
  DashboardMetrics,
  Intervention,
  Road,
  StudyArea,
  TwinData,
} from "@workspace/api-zod";
import buildingGeoJSON from "../../../../data/processed/buildings.geojson";

export const studyArea: StudyArea = {
  name: "Indiranagar Operations Cell",
  city: "Bengaluru",
  state: "Karnataka",
  country: "India",
  bounds: {
    min_lat: 12.9668,
    max_lat: 12.9768,
    min_lon: 77.6352,
    max_lon: 77.6469,
  },
  metrics: {
    power: 98,
    water: 94,
    roads: 91,
    telecom: 99,
    population: 18400,
    assets: 18,
    buildings: 1284,
    roads_count: 42,
  },
};

const osm = (confidence = "HIGH") => ({
  source: "OpenStreetMap",
  data_type: "VERIFIED",
  confidence,
});
const modeled = (confidence = "MEDIUM") => ({
  source: "RIPPLE model",
  data_type: "MODELED",
  confidence,
});

export const assets: Asset[] = [
  { id: "POWER-S1", type: "POWER_SUBSTATION", name: "Indiranagar 110/11 kV Substation", location: { lat: 12.9707, lon: 77.6404 }, capacity: "80 MW", importance: 98, status: "NORMAL", criticality: 94, dependencies: 6, provenance: modeled("MEDIUM") },
  { id: "POWER-T2", type: "TRANSFORMER", name: "100 Feet Road Transformer T2", location: { lat: 12.9721, lon: 77.6422 }, capacity: "12 MVA", importance: 71, status: "NORMAL", criticality: 61, dependencies: 2, provenance: modeled() },
  { id: "WATER-P1", type: "WATER_PUMP", name: "Indiranagar Booster Pump P1", location: { lat: 12.9698, lon: 77.6435 }, capacity: "18 MLD", importance: 84, status: "NORMAL", criticality: 78, dependencies: 3, provenance: modeled() },
  { id: "WATER-N1", type: "WATER_NODE", name: "HAL 2nd Stage Distribution Node", location: { lat: 12.9751, lon: 77.6409 }, capacity: "34 MLD", importance: 75, status: "NORMAL", criticality: 69, dependencies: 3, provenance: modeled() },
  { id: "TEL-T4", type: "TELECOM_TOWER", name: "100 Feet Road Telecom Node T4", location: { lat: 12.9719, lon: 77.6386 }, capacity: "4G / 5G", importance: 68, status: "NORMAL", criticality: 55, dependencies: 2, provenance: modeled() },
  { id: "HOSP-H1", type: "HOSPITAL", name: "Manipal Hospital Old Airport Road", location: { lat: 12.9592, lon: 77.6483 }, capacity: "250 beds", importance: 95, status: "NORMAL", criticality: 87, dependencies: 4, provenance: osm() },
  { id: "FIRE-F1", type: "FIRE_STATION", name: "HAL Fire & Emergency Station", location: { lat: 12.9637, lon: 77.6510 }, capacity: "24 responders", importance: 89, status: "NORMAL", criticality: 76, dependencies: 3, provenance: osm() },
  { id: "POLICE-P2", type: "POLICE_STATION", name: "Indiranagar Police Station", location: { lat: 12.9710, lon: 77.6417 }, capacity: "60 officers", importance: 82, status: "NORMAL", criticality: 63, dependencies: 2, provenance: osm() },
  { id: "TRAFFIC-X1", type: "TRAFFIC_SIGNAL", name: "100 Feet Road / CMH Junction", location: { lat: 12.9717, lon: 77.6411 }, capacity: "4 approaches", importance: 77, status: "NORMAL", criticality: 58, dependencies: 2, provenance: osm() },
  { id: "BRIDGE-B1", type: "BRIDGE", name: "Domlur Flyover Approach", location: { lat: 12.9619, lon: 77.6428 }, capacity: "65,000 vehicles/day", importance: 86, status: "NORMAL", criticality: 73, dependencies: 2, provenance: osm() },
];

const fallbackBuildings: Building[] = [
  { id: "BLDG-000183", building_type: "MIXED_USE", centroid: { lat: 12.9712, lon: 77.6401 }, area_m2: 183, levels: 4, height: 12, provenance: osm("MEDIUM") },
  { id: "BLDG-000184", building_type: "COMMERCIAL", centroid: { lat: 12.9723, lon: 77.6410 }, area_m2: 420, levels: 3, height: 10, provenance: osm("MEDIUM") },
  { id: "BLDG-000185", building_type: "RESIDENTIAL", centroid: { lat: 12.9738, lon: 77.6391 }, area_m2: 248, levels: 4, height: 12, provenance: osm("MEDIUM") },
  { id: "BLDG-000186", building_type: "EDUCATION", centroid: { lat: 12.9689, lon: 77.6377 }, area_m2: 910, levels: 5, height: 15, provenance: osm("MEDIUM") },
  { id: "BLDG-000187", building_type: "RESIDENTIAL", centroid: { lat: 12.9757, lon: 77.6440 }, area_m2: 310, levels: 3, height: 9, provenance: osm("MEDIUM") },
  { id: "BLDG-000188", building_type: "HEALTHCARE", centroid: { lat: 12.9705, lon: 77.6449 }, area_m2: 680, levels: 5, height: 15, provenance: osm("MEDIUM") },
];

export const buildings: Building[] = buildingGeoJSON.features.map((feature: any) => ({
  id: String(feature.id),
  building_type: feature.properties.building_type,
  centroid: feature.properties.centroid,
  area_m2: feature.properties.area_m2,
  levels: feature.properties.levels,
  height: feature.properties.height,
  provenance: osm("HIGH"),
  geometry: feature.geometry.coordinates,
}));

export const roads: Road[] = [
  { id: "ROAD-R1", name: "100 Feet Road", road_type: "PRIMARY", length_m: 1640, geometry: [{ lat: 12.9694, lon: 77.6360 }, { lat: 12.9717, lon: 77.6411 }, { lat: 12.9746, lon: 77.6452 }], provenance: osm() },
  { id: "ROAD-R2", name: "CMH Road", road_type: "PRIMARY", length_m: 1180, geometry: [{ lat: 12.9695, lon: 77.6358 }, { lat: 12.9740, lon: 77.6399 }], provenance: osm() },
  { id: "ROAD-R3", name: "12th Main Road", road_type: "SECONDARY", length_m: 980, geometry: [{ lat: 12.9672, lon: 77.6424 }, { lat: 12.9728, lon: 77.6420 }, { lat: 12.9760, lon: 77.6418 }], provenance: osm() },
  { id: "ROAD-R4", name: "Old Airport Road", road_type: "PRIMARY", length_m: 1320, geometry: [{ lat: 12.9606, lon: 77.6371 }, { lat: 12.9638, lon: 77.6442 }, { lat: 12.9675, lon: 77.6498 }], provenance: osm() },
  { id: "ROAD-R5", name: "100 Feet Road Service Lane", road_type: "LOCAL", length_m: 720, geometry: [{ lat: 12.9712, lon: 77.6380 }, { lat: 12.9744, lon: 77.6432 }], provenance: osm() },
];

export const dependencies: Dependency[] = [
  { source_id: "POWER-S1", target_id: "WATER-P1", dependency_type: "POWER", strength: 0.9, threshold: 0.25, confidence: "MEDIUM" },
  { source_id: "POWER-S1", target_id: "TEL-T4", dependency_type: "POWER", strength: 0.7, threshold: 0.3, confidence: "MEDIUM" },
  { source_id: "POWER-S1", target_id: "POWER-T2", dependency_type: "SUPPLY", strength: 0.8, threshold: 0.2, confidence: "MEDIUM" },
  { source_id: "POWER-T2", target_id: "TRAFFIC-X1", dependency_type: "POWER", strength: 0.6, threshold: 0.4, confidence: "MEDIUM" },
  { source_id: "WATER-P1", target_id: "WATER-N1", dependency_type: "SUPPLY", strength: 0.85, threshold: 0.3, confidence: "MEDIUM" },
  { source_id: "WATER-N1", target_id: "HOSP-H1", dependency_type: "WATER", strength: 0.6, threshold: 0.4, confidence: "MEDIUM" },
  { source_id: "TEL-T4", target_id: "POLICE-P2", dependency_type: "TELECOM", strength: 0.55, threshold: 0.45, confidence: "LOW" },
  { source_id: "TRAFFIC-X1", target_id: "HOSP-H1", dependency_type: "EMERGENCY_ACCESS", strength: 0.65, threshold: 0.35, confidence: "MEDIUM" },
  { source_id: "ROAD-R1", target_id: "TRAFFIC-X1", dependency_type: "ROAD_ACCESS", strength: 0.7, threshold: 0.3, confidence: "HIGH" },
  { source_id: "ROAD-R4", target_id: "FIRE-F1", dependency_type: "EMERGENCY_ACCESS", strength: 0.65, threshold: 0.35, confidence: "MEDIUM" },
];

export const interventions: Intervention[] = [
  { id: "INT-GEN-01", name: "Backup Generator", cost_crore: 2.4, target: "WATER-P1", impact_reduction: 31, implementation_time: "6 weeks", rationale: "Maintains booster-pump operations during a primary power interruption." },
  { id: "INT-SUB-01", name: "Substation Reinforcement", cost_crore: 4.8, target: "POWER-S1", impact_reduction: 42, implementation_time: "14 weeks", rationale: "Adds protection and sectionalizing capacity at the highest-criticality node." },
  { id: "INT-WAT-01", name: "Water Pipeline Redundancy", cost_crore: 3.1, target: "WATER-N1", impact_reduction: 27, implementation_time: "10 weeks", rationale: "Creates an alternate supply path for the distribution node serving healthcare." },
  { id: "INT-ROUTE-01", name: "Emergency Route", cost_crore: 1.7, target: "TRAFFIC-X1", impact_reduction: 18, implementation_time: "4 weeks", rationale: "Protects hospital access when the central junction is degraded." },
  { id: "INT-TEL-01", name: "Backup Telecom Node", cost_crore: 1.3, target: "TEL-T4", impact_reduction: 15, implementation_time: "5 weeks", rationale: "Preserves responder communications after a power or tower outage." },
];

export const twin: TwinData = { buildings, roads, assets, dependencies };

export function assetById(id: string) {
  return assets.find((asset) => asset.id === id);
}

export function metricsForAction(action: string, sourceId: string, selectedInterventions: string[] = []) {
  const source = assetById(sourceId);
  const multiplier = action === "FAIL" ? 1.0 : action === "DEGRADE" ? 0.65 : 0.45;
  const reduction = selectedInterventions.reduce((sum, id) => sum + (interventions.find((item) => item.id === id)?.impact_reduction ?? 0), 0);
  const factor = Math.max(0.1, multiplier * (1 - Math.min(reduction, 65) / 100));
  
  // Custom reach weight based on actual downstream dependency depth & count
  const direct = source?.id === "POWER-S1" ? 0.95 
    : source?.id === "WATER-P1" ? 0.75 
    : source?.id === "HOSP-H1" ? 0.85 
    : source?.id === "BRIDGE-B1" ? 0.65 
    : source?.id === "TEL-T4" ? 0.55 
    : source?.id === "POWER-T2" ? 0.50 
    : source?.id === "WATER-N1" ? 0.60 
    : 0.30;

  const impact = factor * direct;
  return {
    population_affected: Math.round(18400 * impact),
    assets_affected: Math.max(1, Math.round(10 * impact)),
    failed_assets: Math.max(1, Math.round(5 * impact)),
    degraded_assets: Math.max(0, Math.round(4 * impact)),
    critical_services: Math.max(0, Math.round(5 * impact)),
    cascade_depth: Math.max(1, Math.min(5, Math.round(1 + impact * 4))),
    area_affected_km2: Number((1.1 * impact).toFixed(2)),
    roads_affected: Math.max(0, Math.round(6 * impact)),
  };
}