# Data sources and licenses

## Study area

The prototype focuses on a roughly 1.1 km² rectangular envelope around Indiranagar / CMH Road / 100 Feet Road in Bengaluru. Boundaries are configuration values in `.env.example`, not repeated throughout the code.

## OpenStreetMap

The building, road, hospital, fire station, police station, junction, and bridge examples are based on the OpenStreetMap data model and are labeled `VERIFIED` with OpenStreetMap as their source. OpenStreetMap data is available under the Open Data Commons Open Database License (ODbL). Attribution should include “© OpenStreetMap contributors” in a public deployment.

The small checked-in dataset is a curated prototype sample for the demo. A production refresh should use the scripts in `scripts/`, preserve the raw download, record the extraction timestamp, and validate the current ODbL terms before redistribution.

## Government and utility information

No confidential infrastructure information is used. The dependency graph, capacities, exposure, and intervention benefits are modeled assumptions for a hackathon prototype and must not be treated as utility operating data.