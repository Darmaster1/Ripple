# Assumptions and provenance

RIPPLE never silently turns a model into a fact. Each object carries:

- `VERIFIED`: directly sourced from an openly licensed dataset.
- `DERIVED`: calculated from verified geometry or attributes.
- `MODELED`: created for the prototype's deterministic simulation.

The demo uses modeled capacity for power, water, telecom, and responder assets; modeled downstream dependencies; and a modeled study-area population of 18,400. Buildings show sample OSM-style footprints and levels. Where height is not sourced, the UI should describe height as estimated from levels.

Population exposure is a proportional estimate, not a census count. The prototype does not make emergency dispatch decisions, does not expose sensitive asset details, and does not attempt hydraulic, electric-load, traffic microsimulation, or physical flood modeling.