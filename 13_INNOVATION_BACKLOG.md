# Useful Innovation Backlog — Prioritize Only After Core Racing Works

This file proposes distinctive, practical improvements. These are ideas, **not claims that they have been implemented**, and not permission to expand the current phase. Add items to the roadmap only when the core game is stable and the owner authorizes their phase.

## 1. Local Race Engineer (high utility, no backend)

A local deterministic helper that explains observations derived from actual telemetry: tire temperature outside configured range, excessive wheel slip, repeated early/late braking, low ERS reserve, poor exit speed, traffic ahead/behind or dry setup under wet conditions. Every tip must expose the measurements/threshold that triggered it. No paid AI service, no data upload, no invented analysis. Suggested fit: Phase 6.

## 2. Reproducible Race Seed and Bug Report Export

Allow the game to record a seed for AI variation, starting conditions, weather and session setup, where those systems can be deterministic. Add an optional “Copy diagnostic report” button that exports version/build ID, track ID, settings, selected car/tire, recent lap summary, current known error state and reproduction steps—never secrets or personal files. This makes bugs actionable for the coding agent. Clearly label what cannot be reproduced because physics is frame-dependent. Suggested fit: after Phase 2 and during release hardening.

## 3. Ghost Lap and Delta Coach

Record compact lap samples and show a non-colliding transparent best-lap ghost. Compute delta against a stable distance/progress reference on the same track/configuration. A simple segment comparison can show “lost time between markers 4–5”; do not invent exact causes from speed alone. Suggested fit: Phase 6/7.

## 4. Track Manifest and Track Validator

Use a data manifest for each circuit, with source/license, units, centerline/mesh, width/boundaries, start/finish, sectors, pit entry/exit, AI path and minimap projection. A validation tool should detect an open loop, duplicate points, broken boundaries, missing sectors or path data. This enables legal future community tracks without duplicating systems. Suggested fit: Phase 0/track system and Phase 7.

## 5. Physics Test Lab / Setup A-B Test

Add a developer-only deterministic test scene for straight acceleration, braking distance, constant-radius corner, aero comparison and tire compound comparisons. Show raw measurements and setup differences. This is more useful than claiming “realistic physics” without evidence. Keep it outside normal race UI and turn off in production unless intentionally enabled. Suggested fit: Phase 3/8.

## 6. Performance Benchmark and Auto Quality Suggestion

Measure average frame time/FPS over a short scene and offer a one-click recommendation for shadows, particles and resolution. Never secretly lower settings or promise a fixed FPS. Include a manual Low preset for older integrated graphics. Suggested fit: Phase 8.

## 7. Accessible Racing HUD

Add scalable text, customizable HUD placement where feasible, high-contrast/color-vision-friendly palettes, reduced motion/camera shake, remappable keyboard keys, mute and clear control prompts. Don't communicate tire or flag state by color alone; use text/icons as well. Suggested fit: Phase 7/8.

## 8. Race Strategy Explainability

When pit/tire strategy is implemented, show why the game recommends a tire or pit window using actual wear, weather, remaining laps and known rule assumptions. Do not label arbitrary random decisions as “AI strategy.” Suggested fit: Phase 4/6.

## 9. Trackside Reference and Practice Overlay

Optional off-by-default brake marker boards, corner numbers and racing-line overlay to help learn a circuit. The line is guidance only and must not control player physics. Permit disabling aids for time trials. Suggested fit: Phase 7.

## 10. Offline-First Self-Contained Play

Where practical, bundle required assets and provide a service-worker/offline shell only if cache update/version behavior is tested. Do not let stale caches create a second deployment mismatch. Prefer correct cache invalidation and clear build ID over adding a service worker prematurely. Suggested fit: Phase 8.

## 11. Physics-Based Camera Assist

Smooth chase-camera behavior based on actual speed/yaw, with user control for camera lag and shake. Prevent camera clipping and motion sickness. Do not let camera filters hide actual car state. Suggested fit: Phase 5/8.

## 12. Smart Scope Rule

Reject innovation work if it destabilizes core driving, increases startup asset failures, requires paid infrastructure, violates licenses, uploads user data, or prevents static GitHub Pages deployment. A small tested feature is preferable to a large unfinished system.
