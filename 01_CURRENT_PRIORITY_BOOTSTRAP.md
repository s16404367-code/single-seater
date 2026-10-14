# Current Task — GitHub Graphics, Mk.II Audit, Licensed Tracks, Phase 2 Gate and Phase 3 If Ready

## Authorization

The owner has reported the following latest implementation: relative Vite base, direct stylesheet link, generated `bundle.js`, fallback loader; a top “APEX GP v2.0 MK.II” bar; an eight-file FNV-1a inspector; car setup packages; tire compounds; ERS and active DRS; weather/time-of-day modes; five fictional liveries; and three camera views. The owner then requested the next phase.

Read `00_MASTER_PROMPT.md` first. Work in the actual connected repository. Treat all reported capabilities as unverified until tested. The earlier reported GitHub graphics issue and track-source/license task remain outstanding unless the repository proves otherwise.

## Exact execution order

### 1. Inspect the repo, protect existing work

- Check git status, current branch, latest commit and deployment workflow.
- Read relevant source and project docs before editing.
- Preserve unrelated and working code.
- Add missing persistent docs if necessary.

### 2. Diagnose and fix production graphics/deployment

Inspect `index.html`, `vite.config.ts`, `package.json`, `bundle.js`, styles, source modules, public assets, build output and Pages workflow as they actually exist.

Compare the dev preview, production preview and actual Pages build. Test:

- The exact publishing branch/folder or Actions artifact.
- Correct repository base path, including `/single-seater/` when still applicable.
- Relative path resolution for JS, CSS, models, textures, fonts, environment maps, shaders, audio and dynamically imported data.
- Filename case sensitivity.
- HTTP 404s, MIME errors, runtime exceptions and missing assets.
- Renderer/canvas initialization, size, camera, shaders, material loading, color/exposure, lights, shadows, fog and CSS stacking.
- Whether `index.html` loading `./src/style.css` and a prebuilt `./bundle.js` fallback introduces duplicate entry points, stale styles/bundles or duplicate animation loops.
- Whether the build process regenerates and publishes every required file in the same revision.

Do not simply turn up brightness or lower quality to hide the defect. Fix the actual cause and retain the working sandbox experience.

Build and serve the production artifact under the same path structure as GitHub Pages. Deploy through the current configured workflow. Open the actual page in a browser if available. If browser access is blocked, run all other checks and explicitly state that visual inspection remains unverified.

### 3. Make the file-change inspector truthful

The reported inspector fetches `index.html`, `src/main.ts`, `src/car.ts`, `src/physics.ts`, `src/world.ts`, `src/audio.ts`, `src/style.css`, and `src/upgrades.ts` with `cache: 'no-store'`, hashes bytes using FNV-1a, and displays 8/8 files reflected.

Inspect whether this design actually proves what it claims. A source-file hash cannot by itself prove that the deployed bundle was built from those files. Improve it, without overengineering, to distinguish:

- Files fetched successfully.
- Expected fingerprints/build identity.
- Current development source state.
- Bundle/build revision loaded by the page.
- Deployed revision only if it can genuinely be verified.
- Mismatch requiring rebuild/redeploy.

Prefer a generated build manifest containing revision/build metadata. Ensure no false “fully synced” success state appears if the bundle does not match the expected build. Ensure reload does not create duplicate game loops or listeners. Document the limits if some source-to-deployed verification is impossible on static hosting.

### 4. Audit reported Mk.II features

Test each existing feature, only repairing what is missing/broken:

- Four setups: Stage 1 Balanced, Monza Low-Drag, Monaco High-Aero, Apex Mk.II Pro.
- Soft C5, Medium C3 and Hard C1 tires; visual stripe, wear, temperature and grip.
- ERS activation by Space/Shift or UI, battery use, power, HUD, sound and effects.
- DRS eligibility, rear-wing flap and actual aerodynamic behavior.
- Sunset Dusk, Night GP, Sunny Day, Wet Rain; headlights/floodlights, rain particles, wet visuals, spray and rear rain light.
- Five fictional liveries.
- Chase, Close and Cockpit/Halo T-Cam views.
- Controls W/A/S/D or arrows, C camera, M sound, Esc pause.

A label/animation is not proof of functional physics. Correct inconsistent UI or controls and document simple models honestly.

### 5. Research and integrate suitable external tracks — only where permission is clear

Use available GitHub search/browsing/repository-inspection tools. Find actual candidates for track centerlines, SVG/JSON layouts, 3D circuit geometry or track generation. Verify the exact asset's license, not just the repository's code license. Publicly visible does not mean reusable.

Choose the best-compatible permitted candidate, not the largest number of circuits. Preserve the procedural 3.5 km track as fallback. Build real driveable geometry where the source permits and connect the track to the shared progress/timing/AI/minimap/collision representation. Do not show a flat outline and call it playable. If only a centerline is supplied, document estimated width/boundaries.

Update `docs/THIRD_PARTY_ASSETS.md` with creator, exact source URL/file, license, required attribution, modifications and notices. Include all legally required license files and any in-game credits. If permissions are unclear, do not copy the asset; report the decision and use procedural geometry instead.

### 6. Verify and complete Phase 2

Read `03_PHASE_2_AI_RACING.md` and `12_ACCEPTANCE_TEST_MATRIX.md`. Check the actual project and complete outstanding items only. Especially recheck the previously reported missing player/AI and AI/AI car collisions.

Phase 2 must pass its critical acceptance tests: AI navigate without teleporting; slow down for corners; recover; overtake/defend where safe; start after lights-out; maintain standings from lap progress; accurately time laps/sectors; show correct gaps/minimap; handle actual vehicle collisions without embedding/sticking; complete a race with 3/5/8 competitors.

If Phase 2 fails, fix it and STOP for owner testing. Do not jump over failures.

### 7. Continue to Phase 3 only when the Phase 2 gate passes

The owner requested the next phase and previous instruction authorized moving into Phase 3 after Phase 2 is verified. Read and execute `04_PHASE_3_VEHICLE_DYNAMICS.md` only if the Phase 2 acceptance gate passes. Preserve and integrate the Mk.II tires, setups, ERS, DRS and weather; do not build parallel systems.

If all Phase 3 acceptance tests pass, stop. If Phase 3 is blocked by a prerequisite, report the blocker and do not fake completeness.

## Final report

Report:

1. Exact graphics root cause and evidence.
2. Source files changed and what was corrected.
3. Build identity and deployment status; verified preview URL only.
4. Which Mk.II features were tested and their results.
5. Repositories/assets examined, license findings, tracks actually integrated and disclosures preserved.
6. Phase 2 acceptance results, including collision behavior.
7. Phase 3 physics implemented/tested if reached.
8. Actual build, unit, gameplay, browser and network checks; mark unavailable tests honestly.
9. Remaining bugs/deferred requirements.
10. Simple steps for the owner to test in the preview.

Update project docs and feedback records, commit/deploy using authorized tools, then stop and wait for the owner.
