# Research — 2026-10-14
## Inspected with GitHub API
- https://github.com/mrdoob/three.js/blob/dev/LICENSE — MIT, renderer candidate selected; exact installed notice will be bundled.
- https://github.com/vitejs/vite/blob/main/LICENSE — MIT, static bundler selected. Single entry and repository base avoid historical duplicate-bundle risks.
- https://github.com/bacinger/f1-circuits — repository root inspected: GeoJSON circuits, README, LICENSE.md. Exact data permission/format review pending; no data copied. Procedural fictional track is the safe foundation fallback.

## Decisions
A single sampled track drives geometry, projection, surface classification and timing. A fixed 1/120 s simulation separates physics from display. Generated car/environment avoid model download and asset license ambiguity. No source-file fetch inspector: generated build manifest identifies loaded source fingerprint/revision and marks uncommitted work; it cannot prove remote deployment until checked.

## Track review conclusion
Inspected https://github.com/bacinger/f1-circuits/blob/master/LICENSE.md and README.md via API. Repository specifies MIT (Tomislav Bacinger 2019–2025); README credits an initial Google My Maps dataset without an inspected upstream data license. Deferred import because upstream map-derived data rights are not established here and source contains centerlines rather than verified widths, barriers or pits. No external circuit files copied. Fictional procedurally authored circuit avoids accuracy and attribution ambiguity; no real-circuit claim.
