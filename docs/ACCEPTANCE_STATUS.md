# Acceptance status — 0.8.0 release candidate

This is an original implementation, not restoration of the deleted Mk.II source. The historical prompt pack is preserved. `PASS` below means the specified tests ran, not certification on every browser/device. Detailed chronological results are in TEST_REPORT.md.

| Area | Status | Evidence / boundary |
|---|---|---|
| Audit and requirements reconciliation | PASS | All 17 initial Markdown files read; owner authorized new build and removed approval pauses |
| Static build/type safety | PASS | Node22, `npm ci`, TypeScript, Vite, formatting and artifact checks |
| Repository subpath / asset identity | PASS locally | `/single-seater/`, one entry, final-byte SHA-256 manifest, browser manifest match; no source-bundle sync fiction |
| Public GitHub Pages release | BLOCKED | Pages disabled at audit; creation API403. Owner Pages configuration required; no published URL verified |
| Player, original circuit, surfaces and barriers | PASS tested scenarios | Rendered keyboard driving, full valid input-driven lap, off-track slowing, contact and recovery |
| Lap timing / standings / gaps | PASS tested scenarios | Ordered sectors, forward/full-progress gates, invalid/repeated crossing regressions, common unwrapped progress, real time-gap samples; unavailable gaps show dash |
| AI / contacts / starts | PASS tested scenarios | 3/5/8-rival full races, all five difficulties across3laps, passing/recovery, side/rear contacts, lights-out and finish freeze |
| Vehicle dynamics | PASS simplified model | Force/yaw integration, combined tire-force constraints, algebraic loads, aero, engine/gears, energy, compound/temp/wear; no exact wheel slip ratio, suspension or proprietary tire fidelity |
| ERS/DRS / setup | PASS | Measured acceleration/force comparisons, charge bound, stationary-regeneration regression, modeled trim/brake bias; simplified DRS zones, not official1-second rule |
| Practice / qualifying / race weekend | PASS simulation / basic browser regression | Explicit transitions, best-lap grid, setup preserved; manual end-to-end weekend play not certified |
| Pit service and simplified rules | PASS tested scenarios | Real pit ribbon/boxes, physical AI entry/service/exit,2.8s stop, tires/repair/limiter, time penalties. Starts locked (no jump starts). No fuel model |
| Safety car / flags | PARTIAL by documented design | Working virtual safety-car neutralization, incident yellow, speed/no-pass rules/restart. No physical safety-car vehicle, double-yellow or red-flag system |
| Weather/damage | PASS simplified model | All four modes selected/rendered; rain particles/spray/light; global progressive wetness affects grip; aggregate aero damage affects force. No puddle/suspension/puncture/engine damage model |
| Garage / telemetry / engineer | PASS | Real configuration effect, bounded10Hz reference traces/sectors/delta, actual-lap capture, explainable local thresholds; no external AI service |
| Time Trial / Hot Lap / championship | PASS tested scenarios | Solo session differences; three actual championship rounds, once-only scoring/tie-breaks and local persistence. Same circuit with three weather variations, not three circuits |
| Ghost / replay | PARTIAL | Validated10Hz ghost, heading interpolation and render-only isolation tested. Full race replay deferred (optional prompt item) |
| Keyboard / accessible HUD | PASS tested browser | Remapping/conflicts, focus handling, persisted contrast/color options, HUD scale, reduced motion, mute/volume |
| Touch / gamepad | NOT DEVICE-VERIFIED | Pointer and standard analog adapter tests pass; physical hardware not available, labeled experimental; no tilt or steering-wheel promise |
| Failure resilience | PASS injected scenarios | Malformed/blocked storage, WebGL unavailable/context loss, missing manifest, blur pause, repeated restart allocations |
| Performance | MEASURED, not hardware-certified | Software SwiftShader benchmark is slow (~5.6FPS in the recorded Low-mode run); geometry batching reduces draw calls, Low uses diffuse-only materials,0.85 pixel ratio, no shadows, particle/light caps. No60FPS claim; Intel HD4400 not tested |
| Asset licensing / privacy | PASS inspected scope | Original procedural art, Three.js MIT notice shipped, no imported uncertain map-derived circuits, no runtime CDN/analytics/upload; observed page requests are same-origin assets/manifest only |
| Release readiness | PARTIAL | Local tests and artifact verification passed; public hosting and physical/browser/device coverage remain external release gates |

## Explicitly deferred / not included
Additional circuits pending clear source-data permissions; physical safety car and fuller race-control rulebook; full-race replay; exact longitudinal tire-slip/suspension simulation; physical gamepad/touch/wheel certification; Safari/Firefox/mobile hardware tests; real-GPU performance qualification. No multiplayer/backend/payment systems by design.

No six-hour unattended execution is claimed. Elapsed time is not substituted for test evidence. This should be treated as a testable release candidate, not an assertion that every aspirational item in the prompt pack is finished.
