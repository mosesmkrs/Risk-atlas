# Team A — Nairobi Urban Flood CAT

Short written note for judges: data sources, assumptions, and the AI feature.

## Data sources

| Item | Provenance | File / source |
|---|---|---|
| 600 buildings, TIV, construction | **SYNTHETIC** | `data/team_a_nairobi/exposure_nairobi_with_hazard.csv` |
| Hazard scores (five tiers, 0–1) | **PROXY** | Same file (pre-attached). Built from terrain elevation, depressions, slope, OSM rivers. Not measured flood depth. |
| 24 named neighbourhoods | **REAL** (geocoded government hotspots) | `data/team_a_nairobi/nairobi_hotspots_geocoded.csv` |
| Depth-damage anchors | **SOURCED** | Huizinga, de Moel & Szewczyk (2017), JRC EUR 28552 EN, Africa residential: 0.1 m → 5%, 1.0 m → 40% |
| County hotspot list (context) | **REAL** | Nairobi County mapping, March 2026 (The Star); 37 areas, 24 in the kit |

The proxy, as stated in the problem statement, correctly flags 12 of the 24 named hotspots. Drainage-driven flooding (including Kibera, Westlands, Lavington) is a known miss.

## Assumptions (not observations)

1. **Score → depth.** `depth_m = score × 4.0`, using the worked example in Step 1 of the brief. Not observed water depth.
2. **Return periods on the five tiers.** common=5, occasional=10, moderate=25, severe=100, extreme=250. The rasters carry no years. This mapping is chosen so the EP curve can answer the brief’s 1-in-100 and 1-in-250 questions.
3. **Construction adaptations.** No Kenya-specific curve exists. Informal / semi-permanent / masonry / RCC use k-multipliers and caps in `config/model_parameters.yaml`. Caps 70–95% follow the brief (land and foundation remain).
4. **Loss.** Ground-up = damage ratio × TIV. Treaty layers and net-of-reinsurance are **out of scope**.
5. **Free-text defaults.** If a description omits count, TIV, place or construction, the parser records the default it used.

## Pipeline

Hazard (proxy score → assumed depth) → vulnerability (JRC exponential, class-adapted) → exposure (synthetic book) → financial engine (per-building loss, summed by tier) → EP curve.

## AI feature (required differentiator)

Two components **change modelled loss**, they do not only describe it.

1. **Drainage-gap hazard correction.** A distance kernel around proxy-missed hotspots (named in the brief, plus sites whose nearby max score is below 0.15) increases 0–1 susceptibility. Toggle it off in the UI: the 1-in-100 loss falls back to the raw proxy. The delta is shown on the dashboard.
2. **Free-text exposure ingestion.** Plain English such as “20 informal houses in Kibera, KES 800,000 each” becomes extra synthetic rows, inherits nearest-building hazard, and is run through the same engine. Total TIV and the EP curve move.

A TreeSHAP surrogate then explains location AAL after those steps. SHAP is explainability, not the loss engine.

## Limitations

No Kenya claims calibration. No full pluvial hydrology. Hazard remains a proxy. Drainage correction is a documented gap-fill, not a drainage network model. Results must not be quoted as a live Kenya Re or cedant figure.
