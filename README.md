# APEX GP — Single Seater

An original browser-based open-wheel racing **release candidate**, built from scratch with TypeScript, Three.js and Vite. Drive a fictional3.5km circuit, race3/5/8 rivals, tune the car, and compare your laps. No accounts, backend, analytics, paid services or runtime asset CDN.

**Status:** local gameplay/build/browser checks pass; public GitHub Pages publication is **blocked by configuration/permissions**. Physical-device/browser/performance coverage is incomplete. Read [acceptance status](docs/ACCEPTANCE_STATUS.md) before interpreting the historical prompt pack as a list of finished features.

## Play locally

Node.js22 required:

```sh
npm ci
npm run dev
```
Open the displayed URL at `/single-seater/`. For the actual static production artifact:

```sh
npm run build
npm run preview -- --port 4173
```

The Arena live preview serves this production build. Its root redirects to the repository subpath. A modern **WebGL2** browser with hardware acceleration is needed. Start with **Low** graphics on integrated GPUs. No60FPS claim: software SwiftShader rendering in the test sandbox is slow; Intel HD4400 has not been physically tested.

## Implemented modes and systems

- Free Practice, Quick Race, GP Weekend (90s practice →3min qualifying →race), Time Trial, flying Hot Lap and a locally saved3-round championship.
- Championship rounds use **the same original circuit** in day/dusk/rain, not three different tracks.
- Independent input-driven AI, difficulty levels, overtaking/defending/recovery, contacts, grid lights, lap/sector timing, standings and measured gaps.
- Simplified force-based handling,8 automatic gears, four setup packages, compounds/temp/wear, energy-limited ERS, DRS aero, wing damage and progressive wet grip.
- Real pit lane/boxes, tire/repair service, time penalties, yellow flags and a **virtual** safety-car neutralization.
- Day/dusk/night/rain visuals, original car/liveries/scenery, cameras, sound synthesis and Low/Medium/High presets.
- Functional garage trim/brake bias,10Hz bounded telemetry, speed/reference comparison, best-lap ghost, offline rule-based race engineer.
- Remappable keyboard, experimental standard gamepad/touch, contrast/color HUD, size/reduced-motion/volume controls and local save deletion.

These are game approximations, not a professional vehicle or sporting-rule simulator. Full race replay, physical safety car, additional circuits, true suspension/wheel-slip simulation and physical input-device certification are not included. Full details: [architecture](docs/TECHNICAL_ARCHITECTURE.md).

## Default controls

|Control|Action|
|---|---|
|W/↑, S/↓|Throttle, brake|
|A/D or ←/→|Steer|
|X|Hold to reverse (speed limited)|
|Space / Shift|Hold ERS (requires charge)|
|F|Hold DRS (dry straight, >90km/h, not braking)|
|C|Chase / Close / Cockpit camera|
|R|Recover safely; invalidates current lap|
|Esc|Pause/resume|
|M|Mute|
|P|Request pit service|
|L|Toggle80km/h pit limiter|

Remap in Settings; arrow fallbacks remain available. Garage changes apply to the **next session**. At pit entry use the left lane, enable limiter, then stop in the red player box for2.8s. Choose next compound in Settings. Third track-limit excursion, pit speeding or VSC violations add5s under the simplified rules. Starts are locked until lights out; jump-start penalties are not implemented.

## Verification

```sh
npm run check                  # format, 50 unit/simulation checks, TypeScript, build, final asset hashes
# Keep production preview running in another terminal for these:
npm run test:browser           # production UI/graphics/network regression
npm run test:accessibility     # remapping, persistence, touch events, HUD, ghost isolation
npm run test:release           # storage/WebGL failures, manifest, memory and measured performance
npm audit
```

Browser automation uses packaged Linux x64 Chromium with software SwiftShader; it is not hardware certification. Test artifacts are ignored locally and uploaded as CI evidence. Read [the evidence log](docs/TEST_REPORT.md) for exact scenarios, failures fixed, measurements and limitations.

## GitHub deployment

All session source is on **`arena/41d1170c-single-seater`**. Main remains unchanged unless the owner merges a PR.

1. In repository **Settings → Pages**, choose **GitHub Actions** as the source. The agent's create-Pages request returned403; this setting requires owner action.
2. If the `github-pages` environment restricts branches, allow the session branch (or deploy after merging to main).
3. Rerun **Test and deploy APEX GP** in Actions. It installs/tests/builds, runs production browser checks and uploads evidence/static artifacts. Deployment only runs if Pages is available in Actions mode.
4. Use the URL reported by the **successful deploy job**, not an assumed URL. Publication has not been verified from this workspace.

Vite base is `/single-seater/`. No stale root bundle.js, dev stylesheet fallback or second game loop. `dist/` is self-contained and not committed. Build identity includes source fingerprint, Git revision, timestamp/dirty flag and final asset hashes. The footer verifies its matching manifest, **not remote Git synchronization**. No service worker.

## Privacy, credits and project records

Only same-origin bundle/CSS/manifest requests are required. Settings, best laps and championship remain in browser storage, which can be blocked/cleared; no race data uploads. Experimental touch/controller support is labeled because physical devices were unavailable. Original fictional art/branding; no Formula One/FIA/team affiliation. [Three.js MIT notice](public/THIRD_PARTY_NOTICES.txt) ships with the game; [sources and licenses](docs/THIRD_PARTY_ASSETS.md).

[Roadmap](docs/ROADMAP.md) · [Acceptance status](docs/ACCEPTANCE_STATUS.md) · [Tests](docs/TEST_REPORT.md) · [Owner feedback](docs/USER_FEEDBACK.md) · [Changelog](docs/CHANGELOG.md)
