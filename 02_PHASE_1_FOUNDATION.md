# Phase 1 Prompt — Foundation and First Playable Build

Read `00_MASTER_PROMPT.md` and `12_ACCEPTANCE_TEST_MATRIX.md`. Inspect the repository before acting. This phase is an **audit-and-fill-gaps task**, not permission to discard the existing Mk.II game or start over.

## Goal

Ensure that a browser player can control an original 3D single-seater around a closed, driveable circuit, recover from mistakes, and complete a timed lap on GitHub Pages.

## Required functionality

- Browser game scene and renderer that work in dev and production builds.
- Original fictional open-wheel car with credible proportions, visible wheels and distinguishable bodywork.
- Closed circuit (existing procedural target about 3.5 km, with hairpin, chicane and long back straight, unless documented track data dictates otherwise).
- Throttle, brake, steering and sensible reverse/recovery behavior.
- Speed-sensitive steering, traction/loss-of-grip behavior at a basic level, engine/gearing state if already present.
- Asphalt, kerbs, grass/gravel, runoff and simple barriers distinguishable visually and behaviorally.
- Basic track/barrier collision and off-track speed/grip consequences.
- Start/finish crossing and current/last/best lap time; sector support if already in scope.
- Readable HUD, pause/resume and reset/recovery.
- Keyboard controls and clear on-screen controls/help.
- Low graphics preset, graceful WebGL/audio/storage failure handling and useful error messages.

## Implementation guidance

1. Map the current game loop, vehicle state, track data, collision approach and timing system.
2. Keep a single authoritative track representation wherever possible. Do not create a visually separate track and a contradictory timing track.
3. Use coherent units and stable simulation time steps. Do not make the player drive along a predetermined spline.
4. Treat track data as input to navigation/timing—not as a script that controls the player's car.
5. Ensure a track reset is safe, predictable and documented.
6. Use original or permitted assets. Avoid copied racing logos, copyrighted livery or proprietary circuit models.
7. Handle refresh, pause/resume, window resizing and failed assets.
8. Ensure GitHub Pages repository-base paths are correct.

## Acceptance gate

- [ ] Production build passes.
- [ ] Published/dev entry points do not initialize duplicate renderers or loops.
- [ ] Car and circuit render and are controllable.
- [ ] Throttle/brake/steering each measurably affect the car.
- [ ] Asphalt vs grass/gravel changes behavior.
- [ ] Collision/recovery works without freezing the simulation.
- [ ] Player can complete a valid lap and timing updates correctly.
- [ ] HUD values reflect live simulation state.
- [ ] The game runs without critical console/runtime errors in tested environments.
- [ ] Low mode avoids obviously unnecessary visual costs.
- [ ] The GitHub Pages build loads required assets from its subpath.
- [ ] Actual tests and any untested behavior are recorded.

Do not implement advanced AI, pit strategy or career mode just to make Phase 1 look bigger. When this phase is complete, document evidence, provide a verified preview, list what the owner should test, and stop.
