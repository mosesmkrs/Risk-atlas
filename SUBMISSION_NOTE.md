# Team A submission note

## Data sources

- `exposure_nairobi_with_hazard.csv` — 600 **synthetic** buildings with five-tier proxy scores already attached (brief Option 1; no raster lookup).
- `nairobi_hotspots_geocoded.csv` — **real** coordinates for 24 of Nairobi County’s 37 named flood-prone neighbourhoods (March 2026 mapping, as cited in the brief).
- Hazard scores in the CSV are the starter-kit **proxy** (terrain elevation, depressions, slope/flatness, OSM rivers). They are not measured flood depths and are not a calibrated hydrological model. The brief states the proxy flags 12 of 24 hotspots.
- Vulnerability reference: Huizinga, de Moel & Szewczyk (2017), JRC EUR 28552 EN, Africa residential anchors (0.1 m → 5%, 1.0 m → 40%). No Kenya claims curve exists (constraint in the brief).

## Assumptions (all labelled in the interface)

- **Depth:** `depth_m = susceptibility_score × 4.0`, following the problem statement’s own example. Not observed water.
- **Return periods on tiers:** common 5y, occasional 10y, moderate 25y, severe 100y, extreme 250y. The five rasters/columns have no years attached; this mapping is chosen so an underwriter can read 1-in-100 and 1-in-250 losses.
- **AAL:** trapezoidal integral of that assumed discrete EP curve.
- **Construction adaptations:** informal / semi-permanent / masonry / RCC use k-multipliers and caps around the JRC Africa residential exponential. Caps 70–95% because land and foundation usually remain (brief). Differences from JRC are written next to each class.
- **Financials:** `loss = damage_ratio × TIV`. Treaty layers and net-of-reinsurance are **out of scope**.
- **Free-text parser defaults** (if the sentence is incomplete): 10 buildings, KES 2,000,000 TIV, semi-permanent, sited at Kibera.

Placeholder numbers are **not** presented as observations.

## AI feature

The required AI stage **changes modelled loss**, it does not only describe it.

1. **Hazard-layer improvement (Team A’s known gap).** The proxy cannot see drainage failure. The model finds government hotspots that stay below a low hazard threshold, always including the brief’s named misses (Kibera, Westlands, Lavington), and adds a Gaussian distance kernel to the 0–1 scores. That increases depth, damage ratio, and portfolio loss. The UI toggle is the evidence: 1-in-100 loss with correction vs the uncorrected baseline is returned as `ai.loss_delta_severe_kes`.
2. **Free-text exposure ingestion.** An underwriter sentence is parsed into extra **synthetic** rows (count, housing class, TIV, named hotspot). Hazard is inherited from the nearest starter-kit building, then the drainage kernel can still uplift it. Adding text increases TIV and moves the EP curve.
3. **Risk briefing** is generated from the run’s own statistics so a non-modeller can read the result in under two minutes.
4. **TreeSHAP** is an extra explainability layer on location AAL. It is not the financial engine.

## Limitations (honest)

- Synthetic book, not a cedant portfolio.
- Proxy hazard; drainage correction is a documented kernel, not hydrology.
- Depth and return periods are assumptions.
- Vulnerability is global JRC, locally adapted, not calibrated to Kenyan claims.
- 13 of the county’s 37 hotspots are not in the geocoded file.
- No secondary modifiers, contents split, or business interruption.
