# Changelog
## Audit — 2026-10-14
Read uploaded pack, reconciled absent historical game with owner, preserved all instruction files. Started original implementation after explicit authorization. Added persistent project records and reproducible toolchain.

## Phase 1 — foundation
Original car/circuit/world, fixed-step physics, freely controlled player, lap/sector validation, recovery, keyboard input, quality settings, audio, responsive HUD/paddock and isolated browser diagnostics. Vite subpath/static build and build-identity manifest; GitHub Actions Pages workflow.

## Phase 2 — racing
Added independent input-driven AI with corner braking, traffic/passing/defending and non-teleport recovery; Rookie through Alien control parameters; 3/5/8 rivals; stable simple contact; grid/lights; standings and measured common-progress gaps; bounded timings and classification/results. Fixed focus regression exposed by browser checks. Deployment permission failure documented separately from local functional gates.

## Phase 3 — dynamics
Replaced foundation steering approximation with force/yaw integration, four tire loads, combined force limits, transfer, automatic engine/gear model, functional setup/compound/livery selections, bounded ERS and eligible DRS flap/aero. Published numerical/model limitations; fixed AI regressions before advancing.

## Phase 4
GP weekend with qualifying grid, time penalties, flags/virtual safety car, shared-geometry pit lane, limiter/service/compound changes and tested AI pit entry/exit. Published simplified rules in settings and architecture.

## Phase 5
Four lighting/weather modes, progressive shared wetness and meaningful aero damage, rain/spray/rear light, low-quality budgets, original track floodlights. Batch static meshes to reduce draw overhead. Verified wet-race regression and browser views.

## Phase 6
Functional saved garage trim/bias, bounded/validated local lap telemetry, speed/reference and sector panel, measured delta utility and optional explainable rule-based engineer. Tested actual completed lap records and storage failure.

## Phase 7
Time Trial/Hot Lap, three-round locally saved championship, deterministic score/tie-break rules, ghost playback, configurable keyboard controls, standard gamepad adapter and experimental touch, visible accessibility controls and scoped confirmed save deletion. Tested physical simulation through all championship rounds, input remapping in browser and ghost isolation.
