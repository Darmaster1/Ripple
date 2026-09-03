# Simulation, criticality, and optimization

## Cascade engine

The cascade engine is deterministic:

1. Mark the selected source asset as `FAILED`, `DEGRADED`, or `AT_RISK`.
2. Traverse outgoing dependency edges.
3. Add each downstream node once.
4. Emit a timeline event at five-minute increments.
5. Stop when there are no new nodes or the maximum demo depth is reached.

The impact engine traverses the dependency graph and then evaluates the whole twin: affected infrastructure assets, nearby building footprints, mapped road geometry, affected dependency edges, service-critical nodes, and estimated population exposure derived from building area, levels, and use type. Scenario action, source type, and optional intervention reductions adjust severity. The result includes the affected IDs, expanded whole-twin metrics, and a human-readable explanation.

## Criticality

Each asset is temporarily considered as a failure source. The ranked score combines downstream reach, critical service exposure, and modeled capacity/population exposure. The UI shows reasons rather than presenting a score as an unexplained prediction.

## Optimization

The prototype sorts interventions by `impact_reduction / cost_crore` and greedily selects items that fit the available budget. This is a transparent baseline for the hackathon. A future implementation can compare it against integer programming while keeping the same response contract.

## Copilot boundary

The copilot only interprets the question into one of three intents—criticality lookup, budget optimization, or run scenario—and then calls the same deterministic engine. It does not invent simulation values.