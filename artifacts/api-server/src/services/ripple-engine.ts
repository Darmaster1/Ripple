import { assetById, assets, buildings, dependencies, interventions, metricsForAction, roads } from "../data/ripple";
import type { CopilotResult, OptimizationResult, SimulationResult } from "@workspace/api-zod";

const downstream = new Map<string, string[]>();
for (const edge of dependencies) {
  const current = downstream.get(edge.source_id) ?? [];
  current.push(edge.target_id);
  downstream.set(edge.source_id, current);
}

function distanceSquared(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  return (a.lat - b.lat) ** 2 + (a.lon - b.lon) ** 2;
}

function buildingPopulation(building: (typeof buildings)[number]) {
  const occupancy = building.building_type === "HEALTHCARE" ? 3.8 : building.building_type === "COMMERCIAL" ? 2 : building.building_type === "EDUCATION" ? 1.2 : 2.6;
  return building.area_m2 * building.levels * occupancy;
}

function calculateWholeTwinImpact(
  baseImpact: ReturnType<typeof metricsForAction>,
  affectedAssetIds: Set<string>,
  events: SimulationResult["timeline"],
) {
  const affectedAssets = assets.filter((asset) => affectedAssetIds.has(asset.id));
  const affectedRoads = roads.filter((road) =>
    affectedAssets.some((asset) => distanceSquared(road.geometry[0], asset.location) < 0.000025) ||
    dependencies.some((edge) => edge.source_id === road.id && affectedAssetIds.has(edge.target_id)),
  );
  
  const affectedBuildings = buildings.filter((building) =>
    affectedAssets.some((asset) => distanceSquared(building.centroid, asset.location) < 0.000035),
  );
  
  const buildingPop = affectedBuildings.reduce((sum, building) => sum + buildingPopulation(building), 0);
  const directAsset = affectedAssets[0];
  const capacityPop = directAsset ? (directAsset.type === "POWER_SUBSTATION" ? 14200 : directAsset.type === "HOSPITAL" ? 9500 : directAsset.type === "WATER_PUMP" ? 7800 : directAsset.type === "BRIDGE" ? 6400 : directAsset.type === "TELECOM_TOWER" ? 5100 : 2200) : 1500;
  
  // Cap population at study area total (18400)
  const calculatedPopulation = Math.round(Math.min(18400, Math.max(buildingPop, capacityPop * (affectedAssets.length / Math.max(1, assets.length)) * (1.2 + events.length * 0.1))));

  const failedAssets = events.filter((event: SimulationResult["timeline"][number]) => event.state === "FAILED").length;
  const degradedAssets = events.filter((event: SimulationResult["timeline"][number]) => event.state === "DEGRADED").length;
  const criticalServices = affectedAssets.filter((asset) => ["HOSPITAL", "FIRE_STATION", "POLICE_STATION", "WATER_PUMP", "WATER_NODE"].includes(asset.type)).length;
  const affectedEdges = dependencies.filter((edge) => affectedAssetIds.has(edge.source_id) || affectedAssetIds.has(edge.target_id)).length;

  return {
    ...baseImpact,
    population_affected: calculatedPopulation,
    assets_affected: affectedAssets.length,
    failed_assets: Math.max(1, failedAssets),
    degraded_assets: degradedAssets,
    critical_services: criticalServices,
    area_affected_km2: Number(Math.min(1.1, Math.max(0.05, affectedAssets.length * 0.09)).toFixed(2)),
    roads_affected: Math.max(0, affectedRoads.length),
    buildings_affected: affectedBuildings.length,
    dependency_edges_affected: affectedEdges,
  };
}

export function simulate(assetId: string, action: "FAIL" | "DEGRADE" | "DISCONNECT", selectedInterventions: string[] = []): SimulationResult {
  const source = assetById(assetId);
  if (!source) throw new Error(`Unknown asset: ${assetId}`);
  const baseImpact = metricsForAction(action, assetId, selectedInterventions);
  const affected = new Set<string>([assetId]);
  const events: SimulationResult["timeline"] = [
    { time: 0, label: `${source.name} ${action === "FAIL" ? "fails" : action === "DEGRADE" ? "degrades" : "disconnects"}`, detail: `Trigger event applied to ${source.id}.`, asset_id: source.id, state: action === "FAIL" ? "FAILED" : action === "DEGRADE" ? "DEGRADED" : "AT_RISK" },
  ];
  let frontier = [assetId];
  let depth = 1;
  while (frontier.length && depth < 5) {
    const next: string[] = [];
    for (const parent of frontier) {
      const edges = dependencies.filter((e) => e.source_id === parent);
      for (const edge of edges) {
        const childId = edge.target_id;
        if (affected.has(childId)) continue;
        
        // Evaluate threshold crossing based on edge strength, action severity & depth decay
        const actionSeverity = action === "FAIL" ? 1.0 : action === "DEGRADE" ? 0.6 : 0.45;
        const effectiveStrength = edge.strength * actionSeverity / Math.pow(1.15, depth - 1);
        const isFailure = effectiveStrength >= edge.threshold;
        
        if (effectiveStrength > 0.15) {
          affected.add(childId);
          next.push(childId);
          const child = assetById(childId);
          if (child) {
            events.push({
              time: depth * 5,
              label: `${child.name} ${isFailure ? "failed (threshold exceeded)" : "degraded"}`,
              detail: isFailure 
                ? `Dependency threshold (${edge.threshold}) exceeded via ${parent} [strength: ${edge.strength.toFixed(2)}].`
                : `Dependency load reduced via ${parent} [effective strength: ${effectiveStrength.toFixed(2)}].`,
              asset_id: child.id,
              state: isFailure ? "FAILED" : "DEGRADED",
            });
          }
        }
      }
    }
    frontier = next;
    depth += 1;
  }
  const reductionNote = selectedInterventions.length ? ` Resilience interventions reduced modeled impact by ${Math.min(65, selectedInterventions.reduce((sum, id) => sum + (interventions.find((item) => item.id === id)?.impact_reduction ?? 0), 0))}%.` : "";
  const impact = calculateWholeTwinImpact(baseImpact, affected, events);
  return {
    id: `SIM-${Date.now().toString(36).toUpperCase()}`,
    scenario: `${source.name} — ${action}`,
    source_asset_id: assetId,
    impact: { ...impact, cascade_depth: Math.min(baseImpact.cascade_depth, events.length > 1 ? depth - 1 : 1) },
    timeline: events,
    affected_asset_ids: [...affected],
    explanation: `Graph propagation over ${dependencies.length} directed dependency links identified ${affected.size} affected assets, ${impact.buildings_affected} building footprints, and ${impact.dependency_edges_affected} dependency edges. Estimated population exposure is grounded in downstream service reach and structural asset dependencies.${reductionNote}`,
  };
}

export function rankCriticality() {
  return [...assets]
    .sort((a, b) => b.criticality - a.criticality)
    .map((asset) => ({
      asset_id: asset.id,
      name: asset.name,
      type: asset.type,
      score: asset.criticality,
      reasons: [
        `${asset.dependencies} downstream dependencies`,
        asset.criticality > 80 ? "Connects to critical healthcare or water services" : "Moderate downstream service exposure",
        `Modeled population exposure is proportional to service capacity`,
      ],
    }));
}

export function optimize(budget: number): OptimizationResult {
  const selected = [...interventions]
    .sort((a, b) => b.impact_reduction / b.cost_crore - a.impact_reduction / a.cost_crore)
    .filter((item) => item.cost_crore <= budget)
    .reduce<{ items: typeof interventions; total: number }>((acc, item) => {
      if (acc.total + item.cost_crore <= budget) return { items: [...acc.items, item], total: acc.total + item.cost_crore };
      return acc;
    }, { items: [], total: 0 });
  return {
    budget_crore: budget,
    total_cost_crore: Number(selected.total.toFixed(1)),
    estimated_impact_reduction: Math.min(65, selected.items.reduce((sum, item: (typeof interventions)[number]) => sum + item.impact_reduction, 0)),
    interventions: selected.items,
    method: "Greedy resilience_gain / cost ranking; all benefits are modeled assumptions.",
  };
}

export function answerCopilot(question: string): CopilotResult {
  const q = question.toLowerCase();
  if (q.includes("critical") || q.includes("important")) {
    const top = rankCriticality()[0];
    return {
      intent: "CRITICALITY_LOOKUP",
      answer: `${top.name} is the highest-criticality asset at ${top.score}/100. ${top.reasons.slice(0, 2).join(". ")}. I recommend testing this node first because its failure has the widest modeled downstream reach.`,
      simulation: null,
    };
  }
  if (q.includes("budget") || q.includes("crore") || q.includes("invest")) {
    const match = q.match(/(\d+(?:\.\d+)?)\s*(?:crore|cr|cr\.)?/);
    const budget = match ? Number(match[1]) : 5;
    const plan = optimize(budget);
    return {
      intent: "OPTIMIZE_BUDGET",
      answer: `With a ₹${budget} Cr resilience budget, RIPPLE recommends ${plan.interventions.map((item: (typeof interventions)[number]) => item.name).join(", ") || "holding the budget for a targeted intervention"}, spending ₹${plan.total_cost_crore} Cr and reducing modeled cascade impact by ${plan.estimated_impact_reduction}%.`,
      simulation: { ...plan },
    };
  }
  const source = q.includes("water") ? "WATER-P1" : q.includes("road") || q.includes("bridge") ? "BRIDGE-B1" : q.includes("hospital") ? "HOSP-H1" : "POWER-S1";
  const result = simulate(source, "FAIL");
  return {
    intent: "RUN_SCENARIO",
    answer: `I ran a deterministic failure scenario for ${assetById(source)?.name}. It affects ${result.impact.assets_affected} assets, an estimated ${result.impact.population_affected.toLocaleString("en-IN")} people, and reaches cascade depth ${result.impact.cascade_depth}. ${result.explanation}`,
    simulation: { ...result },
  };
}