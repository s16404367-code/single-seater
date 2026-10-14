# Research — 2026-10-14
## Inspected with GitHub API
- https://github.com/mrdoob/three.js/blob/dev/LICENSE — MIT, renderer candidate selected; exact installed notice will be bundled.
- https://github.com/vitejs/vite/blob/main/LICENSE — MIT, static bundler selected. Single entry and repository base avoid historical duplicate-bundle risks.
- https://github.com/bacinger/f1-circuits — repository root inspected: GeoJSON circuits, README, LICENSE.md. Exact data permission/format review pending; no data copied. Procedural fictional track is the safe foundation fallback.

## Decisions
A single sampled track drives geometry, projection, surface classification and timing. A fixed 1/120 s simulation separates physics from display. Generated car/environment avoid model download and asset license ambiguity. No source-file fetch inspector: generated build manifest identifies loaded source fingerprint/revision and marks uncommitted work; it cannot prove remote deployment until checked.

## Track review conclusion
Inspected https://github.com/bacinger/f1-circuits/blob/master/LICENSE.md and README.md via API. Repository specifies MIT (Tomislav Bacinger 2019–2025); README credits an initial Google My Maps dataset without an inspected upstream data license. Deferred import because upstream map-derived data rights are not established here and source contains centerlines rather than verified widths, barriers or pits. No external circuit files copied. Fictional procedurally authored circuit avoids accuracy and attribution ambiguity; no real-circuit claim.

## Release verification decisions
Installed direct-package metadata inspected locally (exact versions/licenses in THIRD_PARTY_ASSETS). Renderer package addons mergeGeometries/InstancedMesh reused under the same Three.js MIT notice. Frame-time and draw-call observations, not unsupported60FPS claims, drive explicit Low budgets. Browser tests use packaged Chromium/software SwiftShader from npm because the sandbox has no native browser installation; AL2023 libnss/nspr dependencies extracted from the same package. No browser binary committed or deployed.
No external candidate track imported: README's upstream map provenance remains unresolved. Best-lap ghost and deterministic local threshold engineer selected from innovation backlog; no paid API, multiplayer, fake currency or speculative advanced setup controls added. Full replay and additional tracks deferred.
