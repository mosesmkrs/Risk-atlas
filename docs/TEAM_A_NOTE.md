# Team A — Nairobi Urban Flood CAT

Written note required by the problem statement: data sources, assumptions, AI feature.

## Data sources

| Input | Provenance | Use |
|---|---|---|
| `data/exposure_nairobi_with_hazard.csv` | **SYNTHETIC** starter kit | 600 buildings: location, housing class, TIV, pre-attached 0–1 hazard scores |
| `data/nairobi_hotspots_geocoded.csv` | **REAL** coordinates for 24 of 37 county-named flood-prone neighbourhoods | Validation of the proxy; siting of the drainage AI and free-text rows |
| Five-tier hazard scores on the exposure file | **PROXY** (terrain 45%, depressions 20%, slope 15%, OSM rivers 20%) | Not measured flood depth. The kit states this proxy flags 12 of 24 hotspots |
| Huizinga, de Moel & Szewczyk (2017) JRC EUR 28552 EN | **SOURCED** published Africa residential anchors | 0.1 m → 5% damage; 1.0 m → 40% damage |

No real client portfolio, claims, or Kenya-specific depth-damage curve is used.

## Assumptions (every one is labelled in the interface)

1. **Score → depth.** `depth_m = score × 4.0`. This is the worked example in Step 1 of the brief. It is not observed water depth.
2. **Return periods on the five unnamed tiers.** common=5y, occasional=10y, moderate=25y, severe=100y, extreme=250y. Chosen so the EP curve answers the brief’s 1-in-100 and 1-in-250 questions. The rasters do not carry years.
3. **Construction adaptations of JRC.** Informal, semi-permanent, masonry and RCC use k-multipliers and caps in `config/model_parameters.yaml`. No Kenya claims calibration exists (stated constraint).
4. **Damage ceiling.** 70–95% of TIV depending on class, matching the brief that land and foundation usually remain.
5. **Loss.** Ground-up = damage ratio × TIV. Treaty layers and net-of-reinsurance are **out of scope**.
6. **Free-text parser defaults.** If a clause omits count, TIV, construction or place, the parser records an assumption (10 buildings / KES 2m / semi-permanent / Kibera).

## AI feature (required differentiator)

Two stages **change modelled loss**, they do not only describe it.

1. **Hazard-layer improvement (Team A’s known gap).** The brief states the proxy misses drainage-driven flooding, including Kibera, Westlands and Lavington. A distance kernel around those named misses, plus empirically unflagged hotspots, raises susceptibility. That changes depth, damage ratio, and the EP curve. Toggle the correction off to see the 1-in-100 delta in KES.
2. **Free-text exposure ingestion.** Plain English is parsed into extra synthetic rows in the starter-kit schema. Those rows inherit nearest-neighbour proxy scores, pass through the same vulnerability function, and add TIV — so the loss curve moves.

A short underwriter briefing is generated from the **new** numbers. SHAP explains a surrogate of location AAL for transparency; it is not the loss engine.

## Pipeline

Hazard (proxy score → assumed depth) → vulnerability (JRC-adapted matrix) → exposure (synthetic TIV) → financial engine (ground-up sum by tier) → EP / return-period curve.
