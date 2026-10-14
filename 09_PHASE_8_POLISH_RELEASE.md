# Phase 8 Prompt — Optimization, Hardening and Release

Read the master contract and all current project docs. This phase is a release-readiness pass, not a license to add large new feature systems. Focus on reliability, performance, privacy, correct assets and reproducible deployment.

## Build and deployment integrity

- Verify a clean production install/build using the project's documented command.
- Verify GitHub Pages base path and asset paths from the real repository subdirectory.
- Confirm the deployed commit/build identity corresponds to the intended source.
- Avoid stale `bundle.js`, CSS, public assets or misleading file-change state.
- Check that development and production entry points do not double-initialize the game.
- Verify the fallback behavior is intentional and documented.
- Check case-sensitive file paths and missing assets.
- Record actual deployment evidence and URL.

## Performance

Measure using available browser tools/hardware; do not invent FPS. Create or refine Low/Medium/High presets that change real settings. Optimize where measurements identify bottlenecks:

- Geometry detail and LOD.
- Instanced repeated objects.
- Frustum culling.
- Shadow quality/resolution.
- Rain/sparks/particles.
- Texture and bundle size.
- Collision query cost.
- AI decision update frequency.
- HUD/render updates.
- Memory allocated by telemetry, replay and effects.

Aim for smooth play at 60 FPS on capable machines, but document observed performance and system limitations. Include the reported low-spec fallback target (i3-4005U/8 GB/Intel HD 4400) as an intended compatibility profile, not guaranteed capability.

## Reliability and resilience

Test:

- Refresh and reload.
- Pause/resume.
- Window resize and focus changes.
- Missing/failed asset.
- WebGL unavailable or context lost where feasible.
- Audio blocked until user interaction.
- Local storage blocked/full/cleared.
- Long session with multiple races.
- Reset/restart and repeated session transitions.
- AI recovery and collision edge cases.
- Empty/unusual track or missing optional data.

Provide useful error text rather than silent failure. Avoid logging private or secret data.

## Security and privacy

- No credentials/secrets committed.
- No surprise analytics or tracking.
- No requests that upload local race data without explicit owner approval.
- No remote assets required for basic boot unless documented and resilient.
- Third-party licenses and attribution complete.
- No copyrighted brand asset included without permission.
- Input and storage handling are defensive.

## Visual and accessibility review

Verify in actual browser where possible: contrast, legibility, camera clipping, HUD obstruction, color modes, controls, no flicker/black screen, scale/resizing, day/night modes and low-preset behavior. Do not claim visual quality was tested if no browser inspection was possible.

## Release acceptance gate

- [ ] Clean production build succeeds.
- [ ] Published bundle/revision verified.
- [ ] All essential assets load from GitHub Pages subpath.
- [ ] No critical console/runtime errors in tested browsers.
- [ ] Full race and all core modes tested.
- [ ] AI, collision, timing, setup, tires and weather regressions pass.
- [ ] Performance/memory results recorded where measurable.
- [ ] Asset licenses and credits complete.
- [ ] Privacy/data flows documented.
- [ ] Controls, known limitations and deployment instructions updated.
- [ ] No known critical issue remains unreported.

Conclude with release notes, test evidence, verified URL and outstanding limitations. Stop; do not silently create a new phase.
