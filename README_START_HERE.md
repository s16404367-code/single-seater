# APEX GP Racing Game — Agent Prompt Pack

This folder contains the persistent master instructions, the current task prompt, eight phase prompts, a bug-fix workflow, research/licensing instructions, a test matrix, and a backlog of useful innovations for the existing **APEX GP v2.0 Mk.II** single-seater racing game.

The pack is designed for a coding agent that already has access to the GitHub repository. It is not game source code and does not deploy anything by itself.

## Known project context

- Repository: <https://github.com/s16404367-code/single-seater>
- Previously reported GitHub Pages URL: <https://s16404367-code.github.io/single-seater/> — the agent must verify it is still correct and live before relying on it.
- Hosting goal: static GitHub Pages; no backend, paid APIs, mandatory login, or paid services.
- Existing project has been reported to use Vite and TypeScript and to include `index.html`, `vite.config.ts`, `package.json`, `bundle.js`, `src/main.ts`, `src/car.ts`, `src/physics.ts`, `src/world.ts`, `src/audio.ts`, `src/style.css`, and `src/upgrades.ts`. The agent must inspect actual files; these names may have changed.
- Existing reported game: 3.5 km procedural circuit with hairpin, chicane and long back straight; 3D open-wheel single-seater; selectable 3/5/8 AI rivals; start lights; lap/sector timing; standings; gap to car ahead; speed, gear and RPM; minimap; barrier and off-track effects; dusk scene; shadows, fog, grandstands and trees.
- Reported controls: W/A/S/D or arrow keys; C changes camera; M toggles sound; Esc pauses. Space or Shift was reported for ERS; on-screen ERS/DRS controls were also reported. Verify conflicts and publish the actual control map in the README and settings.
- Reported v2.0 Mk.II items: Stage 1 Balanced, Monza Low-Drag, Monaco High-Aero and Apex Mk.II Pro setups; Soft C5, Medium C3 and Hard C1 compounds; ERS boost; active DRS; Sunset Dusk, Night GP, Sunny Day and Wet Rain modes; five fictional team liveries; Chase, Close and Cockpit/Halo T-Cam views; file-change inspector claiming 8/8 source files reflected.
- These are **reported features, not verified facts**. Do not assume a feature works just because it has a menu, label, slider, animation, or code file.
- A reported gap: the earlier agent said cars did not collide with each other; gamepad/touch controls were absent; sound was only a basic engine synth. Recheck these.
- Project owner's performance target includes a low-spec desktop profile: Intel Core i3-4005U, 8 GB RAM, integrated Intel HD Graphics 4400. Treat this as a design/test target, not as a detected machine or guaranteed performance result.

## Correct way to use the pack

1. Give the coding agent `00_MASTER_PROMPT.md` first, or add it to the project instructions if the agent supports persistent instruction files.
2. For the immediate task, give it `01_CURRENT_PRIORITY_BOOTSTRAP.md`. This prompt audits the actual repository, fixes the outstanding GitHub Pages/graphics issue, researches and legally integrates tracks where possible, audits/finishes Phase 2, and advances to Phase 3 only if its explicit gates pass.
3. For later work, give the agent the relevant phase prompt plus `00_MASTER_PROMPT.md`. Phase files are standalone enough to direct the work but defer to the master contract for workflow, safety, memory, and reporting.
4. Send `next phase` only after personally testing the preview and deciding to proceed. Do not send it while critical fixes from the previous phase remain unresolved.
5. For any correction, use `10_BUGFIX_REGRESSION_USER_FEEDBACK.md` or simply report the bug and tell the agent to follow that workflow. Fixes take priority over new features.
6. Use `12_ACCEPTANCE_TEST_MATRIX.md` as the shared completion checklist.
7. The agent must not claim it visually tested or deployed the game unless it actually did so.

### Suggested first message to the coding agent

> Read `00_MASTER_PROMPT.md` and `01_CURRENT_PRIORITY_BOOTSTRAP.md` completely. Inspect the connected repository and make actual changes. Follow the required priority order. Do not rebuild working systems, do not invent browser or deployment test results, and do not begin a later phase until the specified acceptance gate has passed. Save your findings and changes in the repository documentation, provide a verified preview URL, and stop for my feedback.

## Prompt inventory

| File | Purpose |
|---|---|
| `00_MASTER_PROMPT.md` | Always-on contract, complete vision, architecture expectations and phase gates |
| `01_CURRENT_PRIORITY_BOOTSTRAP.md` | Current urgent work: graphics/deployment, Mk.II verification, track research, Phase 2 gate and Phase 3 if authorized by the gate |
| `02_PHASE_1_FOUNDATION.md` | Audit/fix the first playable build without rebuilding what already works |
| `03_PHASE_2_AI_RACING.md` | Real AI racing, overtakes, car collisions, race starts, timing and minimap |
| `04_PHASE_3_VEHICLE_DYNAMICS.md` | Tire forces, weight transfer, aero, engine, ERS/DRS and coherent physics |
| `05_PHASE_4_RACE_WEEKEND_CONTROL.md` | Practice, qualifying, grid starts, penalties, pit stops, flags and safety car |
| `06_PHASE_5_WEATHER_DAMAGE_ENVIRONMENT.md` | Weather, surface evolution, damage, lighting and environments |
| `07_PHASE_6_GARAGE_TELEMETRY_RACE_ENGINEER.md` | Functional setups, telemetry, comparisons and evidence-based race engineer tips |
| `08_PHASE_7_MODES_PROGRESSION_ACCESSIBILITY.md` | Time trial, championship, saves, ghosts/replays, remappable controls and accessibility |
| `09_PHASE_8_POLISH_RELEASE.md` | Performance, security, accessibility, licensing and final deployment gate |
| `10_BUGFIX_REGRESSION_USER_FEEDBACK.md` | Bug reports, persistent feedback and regression workflow |
| `11_RESEARCH_TRACKS_ASSETS_LICENSES.md` | Research standards, reusable track integration and attribution |
| `12_ACCEPTANCE_TEST_MATRIX.md` | Shared evidence-based acceptance checks |
| `13_INNOVATION_BACKLOG.md` | Useful, optional innovations to prioritize only after core systems are stable |

## Important operating rule

This pack is a staged development system, not permission to implement everything at once. The current task is determined by the owner's most recent explicit instruction, the existing repository, documented blockers and the phase gate. The coding agent must not use a new phase as an excuse to ignore prior defects.
