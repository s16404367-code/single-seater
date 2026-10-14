# Phase 7 Prompt — Game Modes, Progression, Ghosts and Accessible Controls

Read the master prompt, existing save architecture and acceptance matrix. Preserve all working driving, AI, telemetry, setup and race systems. No backend or user account is required.

## Game modes

Audit current implementation and add only missing modes:

- Quick Race.
- Time Trial.
- Hot Lap.
- Grand Prix weekend where Phase 4 provides it.
- A multi-round Championship with player/team points and race history.

Use explicit session state and reliable result classification. Do not let a restart duplicate points or count the same race twice. Write rules and scoring into a single source of truth. Avoid pretending the game has online championships.

## Local save/persistence

Store only useful game data locally: settings, chosen controls, best lap, compact lap samples/ghost, championship progress and setup presets. Handle missing or blocked localStorage. Provide a reset/delete-save option and explain that browser storage may be cleared. Do not collect data from other applications or upload telemetry externally.

## Ghost lap and replay

A useful innovation is a deterministic, local ghost lap:

- Record a bounded sequence of position/orientation and lap progress for a best or reference lap.
- Play it as a transparent ghost that does not collide.
- Compare lap delta at meaningful track progress points.
- Verify interpolation and timing; do not let ghost playback affect physics or positions.

For replay, record sampled vehicle state and relevant race events rather than retaining all physics states. Include limits and avoid unbounded memory. Replay may be a later stretch if deterministic replay cannot be achieved without destabilizing the game.

## Controls and accessibility

Implement when browser support and scope permit:

- Remappable keyboard controls with conflict detection.
- Gamepad support using standard browser APIs, with a calibration/dead-zone setting.
- Touch controls or tilt steering only if they can be implemented reliably and do not degrade desktop play.
- Clear control help and pause-safe input.
- Color-vision-aware HUD option and a high-contrast option.
- Scalable interface/legible timing tower.
- Reduced camera shake/motion effects.
- Volume controls and mute.
- Optional assists or difficulty adjustments where physics supports them.

Desktop keyboard remains the primary fallback. Do not promise steering-wheel support without testing relevant browsers and devices.

## Championship and rewards

Create a coherent scoring table and tie-break logic, stored centrally. Retain wins, podiums, fastest lap only if the game rules actually award them. Do not add fake progression currencies or pay-to-win systems.

## Acceptance gate

- [ ] Each visible mode starts the correct type of session.
- [ ] Results/classification are stable and scored once.
- [ ] Local saves persist and fail gracefully if storage is unavailable.
- [ ] Best lap/ghost timing compares the same circuit/configuration appropriately.
- [ ] Replay, if implemented, does not change race state.
- [ ] Gamepad/touch controls are tested on supported devices or clearly marked unsupported.
- [ ] Remappable controls handle conflicts and pause state correctly.
- [ ] Accessibility options produce visible/usable effects.
- [ ] No external login, tracking or server is required.
- [ ] Build and core race regressions pass.

Stop and wait for owner feedback after testing. Do not start Phase 8 automatically.
