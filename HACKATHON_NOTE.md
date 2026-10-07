# Team A — Nairobi Urban Flood CAT

Short written note for judges (data sources, assumptions, AI feature).

## Data sources

| Item | Provenance | File / citation |
|---|---|---|
| 600 buildings, TIV, housing class | **Synthetic** | `data/exposure_nairobi_with_hazard.csv` |
| Five 0–1 susceptibility tiers | **Proxy** (terrain 45%, depressions 20%, slope 15%, OSM rivers 20%) | columns `hazard_score_*` on that file |
| 24 named flood neighbourhoods | **Real** geocodes of the county list | `data/nairobi_hotspots_geocoded.csv` |
| Depth-damage anchors | **Sourced** | Huizinga, de Moel & Szewczyk (2017), JRC EUR 28552 EN, Africa residential: 0.1 m → 5%, 1.0 m → 40% |
| Background (not ingested as rasters) | Public | Nairobi 37 hotspots (The Star, 2026-03-15); Diagnostic of Urban Flooding in Nairobi (2024) |

No GeoTIFF lookup is required because the recommended starter file already attaches hazard scores.

## Assumptions (not observations)

1. **Score → depth.** `depth_m = score × 4 m`, using the worked example in the problem statement. The kit does not contain flood depth.
2. **Return periods on the five tiers.** common=5, occasional=10, moderate=25, severe=100, extreme=250 years. The rasters have no years. This mapping is so the EP curve can answer 1-in-100 and 1-in-250 questions. AAL is the trapezoid of that assumed EP curve.
3. **Construction adaptations.** No Kenya claims curve exists. Informal / semi-permanent / masonry / RCC use k-multipliers and caps on the JRC exponential. Caps are 70–95% of TIV (land/foundation remain).
4. **Loss.** Ground-up = damage ratio × TIV. Reinsurance layers are out of scope.

Every result screen labels synthetic / proxy / assumption.

## Pipeline

Hazard (proxy score → assumed depth) → JRC-adapted vulnerability → synthetic exposure → financial engine (location loss, portfolio loss by tier, EP curve).

## AI feature (required differentiator)

Two steps **change modelled loss**, they do not only describe it:

1. **Drainage-gap hazard correction.** The kit states the proxy misses drainage-driven flooding (including Kibera, Westlands, Lavington) and flags only 12 of 24 hotspots. A distance kernel around those misses **raises susceptibility**, then depth, damage and the EP curve. Toggle it off to see the 1-in-100 delta versus the raw proxy.
2. **Free-text exposure ingest.** Plain English such as “25 informal houses in Kibera, KES 800,000 each” is parsed into extra **synthetic** rows, attached to nearest-neighbour hazard, and run through the same engine. TIV and the EP curve change.

A generated underwriter briefing summarises the run. TreeSHAP explains a surrogate of location AAL; the physics engine remains the source of truth.

## Limitations (honest)

- Not a hydrological model. Proxy cannot see blocked drains.
- Depth and return periods are assumptions.
- Vulnerability is not calibrated to Kenyan claims.
- Portfolio is synthetic. Do not quote as a cedant or Kenya Re result.
