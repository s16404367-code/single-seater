# Phase 5 Prompt — Weather, Damage and Track Environment

Read the master prompt, current project docs and acceptance matrix. Preserve all working Mk.II modes and the existing renderer. Avoid replacing working materials or physics just to make the scene look different.

## Goal

Make environment variation meaningful: weather must influence driving and damage must influence performance. Improve visual quality without destroying frame rate on lower-end machines.

## Weather and time of day

Audit and preserve reported modes:

- Sunset Dusk.
- Night GP.
- Sunny Day.
- Wet Rain.

Where not already complete, implement a consistent state shared by renderer and physics. Include appropriate sky/lighting transitions, visible rain where enabled, head/flood lights in night mode, wet-road appearance, spray and rear rain light. Control particle counts and avoid heavy real-time reflection costs on Low mode.

## Track surface and wetting

Implement progressive wetting only when its model can be made coherent. A simplified track-wetness state may evolve over time from rain intensity and drying conditions. It must affect actual grip/braking and the performance of soft/medium/hard/intermediate/wet compounds if those compounds are supported. Avoid a binary visual-only “rain = shiny road” switch.

Use the physics model consistently. If the track surface is only one global wetness value instead of per-sector state, document that limitation. Do not fabricate puddle physics or aquaplaning if absent.

## Damage

Implement a small, testable damage model where practical:

- Front-wing damage affecting front aero balance.
- Rear-wing damage affecting rear aero/stability.
- Suspension damage affecting handling only if adequately represented.
- Tire puncture only if it can safely affect motion and recovery.
- Engine/overheat effects only if engine temperature is actually simulated.

Collision geometry should not allow tiny bumps to create catastrophic damage. Display damage only if actual car state changes. Provide reset/repair or race consequences consistently. Do not show a damage percentage that has no behavioral consequence.

## Environment design

Improve the track with licensed or original:

- Road/asphalt detail and markings.
- Kerbs, runoff, grass, gravel and barriers.
- Grandstands, lights, trees, track buildings, marshal posts and signage.
- Shadows, fog, sky, ambient occlusion/reflection only where cost-appropriate.

Use LODs, instancing, culling and sensible asset sizes. Do not use copyrighted logos/sponsorship in trackside assets without permission. Preserve third-party asset attribution.

## Acceptance gate

- [ ] Every displayed weather/time mode exists and can be selected.
- [ ] Lighting and environment respond without renderer failure.
- [ ] Wet state changes traction/braking and not only appearance.
- [ ] Tire compound selection interacts coherently with wetness.
- [ ] Damage, when displayed, changes actual simulation performance.
- [ ] Collision and reset/recovery remain stable.
- [ ] Low mode caps particle/shadow/material costs.
- [ ] Track assets have verified licensing and required notices.
- [ ] No major regressions to AI, race control, timing, setup or deployment.

Document simplified weather/damage models. Stop for owner testing; do not start Phase 6 automatically.
