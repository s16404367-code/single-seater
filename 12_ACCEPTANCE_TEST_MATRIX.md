# Shared Acceptance Test Matrix — Evidence, Not Checkbox Theater

Use this matrix after any phase or change. Update `docs/TEST_REPORT.md` with actual results. Mark `PASS`, `FAIL`, `NOT TESTED` or `BLOCKED`; add evidence/environment. Never mark a feature passing merely because source code exists.

## A. Repository/build/deployment

- [ ] Working tree inspected; unrelated changes preserved.
- [ ] Type check passes (if configured).
- [ ] Unit/integration tests pass (where configured).
- [ ] Production build passes.
- [ ] Production artifact can be served independently of the dev server.
- [ ] GitHub Pages base path is correct for the repository subdirectory.
- [ ] Assets resolve with exact filename capitalization.
- [ ] No critical 404/MIME/runtime failures in tests performed.
- [ ] Deployed build/revision is identified when technically possible.
- [ ] Development and production entry points do not create duplicate game loops.
- [ ] Published URL and deployment status are verified, not guessed.

## B. Rendering and UI

- [ ] Canvas has correct dimensions and remains visible on resize.
- [ ] Car, circuit, track surface, environment and HUD render.
- [ ] Materials, lighting, camera, shadows/fog and time modes are checked in browser where possible.
- [ ] Camera views are functional and do not break movement.
- [ ] HUD values change with actual simulation state.
- [ ] UI does not block essential controls or become unreadable.
- [ ] Low graphics preset reduces real rendering costs.
- [ ] WebGL failure or asset failure results in clear handling.

## C. Driving and physics

- [ ] Throttle, brake, steer and reverse/recovery work.
- [ ] Asphalt vs grass/gravel changes behavior.
- [ ] Kerbs behave according to implementation.
- [ ] Vehicle state remains finite/stable after spins and resets.
- [ ] Tire grip limits influence chassis motion.
- [ ] Drag/downforce directions and scaling are sensible.
- [ ] Setup choices affect actual physics.
- [ ] ERS charge/power is bounded and coherent.
- [ ] DRS changes aero and follows its stated rules.
- [ ] Tire compound/temperature/wear UI matches model state.
- [ ] Wet conditions affect traction/braking.
- [ ] Displayed damage affects vehicle behavior.

## D. Track/timing

- [ ] Track is driveable, not just a picture.
- [ ] Start/finish is detected in correct direction.
- [ ] Reverse/repeated crossing does not grant false laps.
- [ ] Sector markers correspond to actual track progress.
- [ ] Standings account for laps plus progress.
- [ ] Gap uses real progress/time.
- [ ] Minimap aligns with selected circuit.
- [ ] Boundaries/off-track behavior are consistent.
- [ ] Pit features, if enabled, use real track geometry.
- [ ] Track source, accuracy assumptions and license are recorded.

## E. AI/racing

- [ ] 3/5/8 opponent counts work.
- [ ] AI navigates without teleportation.
- [ ] AI brakes for corners and accelerates on straights.
- [ ] AI recovers from spin/off-track events.
- [ ] AI difficulty changes driving behavior, not arbitrary cheats.
- [ ] Passing/defending occurs where safe and possible.
- [ ] Player-AI and AI-AI contact produce a stable physical response.
- [ ] AI does not launch before lights out.
- [ ] Race completes with correct finishing order/classification.
- [ ] Repeatable lap test and diagnostics are recorded where possible.

## F. Race systems

- [ ] Pause/resume and restart do not duplicate timers/events.
- [ ] Practice/qualifying/race transitions are correct if implemented.
- [ ] Penalties have identifiable triggers and consequences.
- [ ] Flags change behavior according to their rules.
- [ ] Pit stop consumes time and updates car state.
- [ ] Safety-car/restart state works if implemented.
- [ ] Session finish and result scoring occur exactly once.

## G. Save/accessibility/privacy

- [ ] Settings/save persist when storage works.
- [ ] Unavailable/cleared storage does not crash the game.
- [ ] No data from other applications is collected.
- [ ] No hidden external upload/analytics was introduced.
- [ ] Controls and keyboard focus are usable.
- [ ] Gamepad/touch claims are backed by tests on supported devices.
- [ ] High-contrast/color options visibly work if offered.
- [ ] Memory is bounded for telemetry/replay.

## H. Licensing and docs

- [ ] Asset/dependency license checked.
- [ ] Required attribution and notices present.
- [ ] Third-party files listed with exact source and modification details.
- [ ] Research sources are actual inspected sources.
- [ ] Feedback log updated.
- [ ] Changelog and roadmap reflect reality.
- [ ] Known defects/unverified tests are explicit.

## Evidence requirements

For each test, record the tested commit/build, environment, exact action or command, result and relevant console/network errors. For a failed test, include a reproducible description and owner-facing workaround if available. For a test blocked by browser availability or permission, write `BLOCKED` and why. Do not convert `NOT TESTED` to `PASS` to close a phase.
