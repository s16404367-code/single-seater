# Reusable Prompt — Bug Fixes, User Feedback and Regression Control

Use this prompt whenever the owner says the game looks wrong, controls feel wrong, a feature is broken, GitHub differs from the sandbox, or a previous change needs revising.

## First rule

A user-reported bug is an instruction to investigate and fix, **not** permission to advance to another phase. Read `00_MASTER_PROMPT.md`, inspect `docs/USER_FEEDBACK.md`, and work in the existing repository.

## Procedure

1. Restate the reported behavior precisely in the feedback log, without changing its meaning.
2. Identify expected versus actual behavior.
3. Reproduce the problem if possible in the preview, browser, unit test or minimal repeatable harness.
4. Inspect the actual relevant source and recent diff. Do not guess a fix from symptom alone.
5. Find the root cause and write a small regression test where practical.
6. Implement the minimal robust correction; avoid unrelated refactors.
7. Test the corrected feature and its dependencies.
8. Run type checks/build and inspect console/network output where available.
9. Test the corresponding production deployment if the problem involves GitHub Pages.
10. Update documentation, test results and feedback status with evidence.
11. Commit/deploy via authorized integration and provide a verified preview.
12. Stop for owner feedback.

## Regression map

After vehicle/physics changes, recheck steering, brakes, tire grip, setup effects, ERS/DRS, AI driving, collision, reset and lap timing.

After track changes, recheck geometry, start/finish, sectors, track progress, minimap, boundaries, AI, pits and asset licensing.

After rendering/build changes, recheck canvas, CSS, materials, models, textures, shadows, camera, resize handling, asset paths, bundle identity, GitHub Pages subpath and duplicate initialization.

After UI changes, recheck keyboard focus, controls, HUD state, pause, resize, settings, high contrast and accessibility.

After persistence changes, recheck cleared/unavailable storage, repeated races, duplicate scoring and bounded memory.

After AI changes, recheck independent navigation, corner speed, passing/defending, recovery, collisions, starts, standings, timing and performance.

## Reporting format

- Reported issue.
- Reproduction/environment.
- Root cause and evidence (or state if unknown).
- Exact files changed.
- Fix implemented.
- Regression tests run and results.
- Production/preview verification and any limit.
- Whether feedback item is fixed, partially fixed or blocked.
- Next owner test.

Never claim a bug is fixed merely because the code compiles or a status label changed. Do not erase old feedback. Keep historical closed items with closure evidence.
