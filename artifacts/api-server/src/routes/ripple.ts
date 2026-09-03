import { Router, type IRouter } from "express";
import {
  AskCopilotBody,
  AskCopilotResponse,
  CreateSimulationBody,
  CreateSimulationResponse,
  GetAssetResponse,
  GetDependenciesResponse,
  GetStudyAreaResponse,
  GetTwinResponse,
  ListAssetsResponse,
  ListCriticalityResponse,
  OptimizeResilienceBody,
  OptimizeResilienceResponse,
} from "@workspace/api-zod";
import { assets, dependencies, interventions, studyArea, twin, assetById } from "../data/ripple";
import { answerCopilot, optimize, rankCriticality, simulate } from "../services/ripple-engine";

const router: IRouter = Router();

router.get("/study-area", (_req, res) => {
  res.json(GetStudyAreaResponse.parse(studyArea));
});

router.get("/twin", (_req, res) => {
  res.json(GetTwinResponse.parse(twin));
});

router.get("/assets", (req, res) => {
  const type = typeof req.query.type === "string" ? req.query.type : undefined;
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const result = assets.filter((asset) => (!type || asset.type === type) && (!status || asset.status === status));
  res.json(ListAssetsResponse.parse(result));
});

router.get("/assets/:assetId", (req, res) => {
  const asset = assetById(req.params.assetId);
  if (!asset) return res.status(404).json({ error: "Asset not found" });
  return res.json(GetAssetResponse.parse(asset));
});

router.get("/dependencies/:assetId", (req, res) => {
  const asset = assetById(req.params.assetId);
  if (!asset) return res.status(404).json({ error: "Asset not found" });
  const connected = new Set([asset.id]);
  for (const edge of dependencies) {
    if (edge.source_id === asset.id || edge.target_id === asset.id) {
      connected.add(edge.source_id);
      connected.add(edge.target_id);
    }
  }
  return res.json(GetDependenciesResponse.parse({
    nodes: assets.filter((item) => connected.has(item.id)),
    edges: dependencies.filter((edge) => connected.has(edge.source_id) || connected.has(edge.target_id)),
  }));
});

router.get("/criticality", (_req, res) => {
  res.json(ListCriticalityResponse.parse(rankCriticality()));
});

router.post("/simulations", (req, res) => {
  const input = CreateSimulationBody.parse(req.body);
  try {
    return res.json(CreateSimulationResponse.parse(simulate(input.asset_id, input.action, input.interventions ?? [])));
  } catch {
    return res.status(404).json({ error: "Asset not found" });
  }
});

router.post("/optimize", (req, res) => {
  const input = OptimizeResilienceBody.parse(req.body);
  return res.json(OptimizeResilienceResponse.parse(optimize(input.budget_crore)));
});

router.post("/copilot", (req, res) => {
  const input = AskCopilotBody.parse(req.body);
  return res.json(AskCopilotResponse.parse(answerCopilot(input.question)));
});

export default router;