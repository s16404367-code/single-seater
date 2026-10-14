# Evidence log
Use PASS / FAIL / NOT TESTED / BLOCKED. No source-presence-only gameplay claims.
## Audit — 2026-10-14
PASS: read all 17 tracked files. git fetch/ls-tree/log/ls-remote show instructions only, one remote branch, two commits. GitHub repository API: public, has_pages=false, admin/push=true. Pages API 404; no workflows. No existing application build/tests to execute.
Foundation tests pending. Software-rendered headless Chromium is intended for automation; not equivalent to testing Intel HD 4400 or real input devices.

## Phase 1 — foundation
PASS: `npm test`: 6 tests; closed 3500m geometry/projection, control responses, off-track slowing, barrier/recovery, sector-order/reverse-crossing protection, invalid state guard, full valid lap via scripted throttle/brake/steer without position scripting or contact.
PASS: `npm run build`: TypeScript and static production artifact. Initial invalid empty data CSS import removed after build failure; rebuilt successfully.
PASS: `npm run test:browser`: Chromium 141, software Vulkan/SwiftShader, 1440x900 and 390x844. Production `/single-seater/` loads, WebGL renders, actual key throttle accelerates, pause freezes time, resume/camera/recovery, Low disables shadows, resize has no horizontal overflow. Zero page exceptions or HTTP errors. Paddock screenshot inspected. Browser initially blocked on libnss/libnspr; extracted the Chromium package's supplied AL2023 test libraries and retested. Screenshot/raw outputs ignored in test-artifacts.
PASS: npm audit after upgrading vulnerable Vitest dependency to 5.0.4: zero vulnerabilities.
NOT TESTED: real Intel HD 4400 performance, physical mobile/controller devices. Manual full lap not claimed; full lap physics run uses test driver. Existing historical production graphics bug is not reproducible because old code was deleted.
Deployment work follows before phase closure.

## Deployment permission boundary
Source push 8145902 succeeded. POST /repos/s16404367-code/single-seater/pages with build_type=workflow returned 403 Resource not accessible by integration despite repository metadata admin=true. GitHub Actions run 38551189861 failed; logs redirect to a host unavailable from this workspace. No public Pages success claimed. Owner must enable Settings → Pages → GitHub Actions (and if necessary allow session branch in github-pages environment). Local production-subpath verification passed. This external release blocker does not prevent testing independent local phase functionality, but final published acceptance remains BLOCKED.

## Phase 2 — racing
PASS: 12 tests total. Full one-lap races (player driven through the same input interface by a test driver), all 4/6/9 cars finish: 101.94 / 102.75 / 104.69 simulation seconds. Maximum per-step movement ~0.5365m, no AI off-track time in these runs. Contacts counted in traffic, no frozen/embedded cars. Dedicated side/rear contact, overtaking and off-track 180-degree spin recovery tests pass. Start grid does not move for first five seconds. Ordered progress and common-coordinate gap regression pass.
PASS: typecheck/build and production Chromium browser regression, including selecting eight rivals, lights-out and rendered nine-car scene. Browser found keyboard focus retained after settings/resume; fixed global Escape and explicitly restored driving focus, then reran successfully. Screenshots and ignored raw logs in test-artifacts.
Limits: elementary line tactics, equal-mass two-circle contacts, no proprietary human-like race intelligence. Crossings history currently bounded to recent data; unavailable gaps display dash, not fabricated values. Published deployment remains BLOCKED as above.

## Phase 3 — dynamics
PASS: 20 automated tests and production browser regression. 12s straight test speeds: base74.433m/s, ERS80.826m/s, DRS79.248m/s; gear8, bounded energy. Aero square scaling, packages, friction-circle bounds, load transfer and reduced wet grip tested. Controlled valid lap: soft100.917s, medium101.408s, hard102.192s; measured front wear0.00522/0.00338/0.00227. Wet AI complete lap with no barriers; subdivision1/30 vs1/120 agrees. 3/5/8-rival race regressions all cars finished in105.65/108.48/110.93s; bounded contacts/motion.
Initial dynamic model caused acceleration oversteer and off-track stuck AI: reserve rear grip via default traction assist, reduce unrealistic grass rolling resistance, stabilize passing lane choices and following distance. Reran full suite; no gate bypass. Browser wall-time acceleration assertion failed on slow software renderer; now waits for two actual simulation seconds rather than assuming real-time FPS, then asserts speed. Browser successfully retested, zero runtime/HTTP errors. Performance is not certified by this.
Model limitations (especially no exact wheel slip ratio or physical suspension) documented in architecture. Public deployment still blocked by permission.

## Phase 4 — simplified race weekend/control
PASS:27 tests plus production browser regression. Weekend session/grid/setup continuity; limits excursion counting and5s penalty; pit speed limiting; service duration, tire change/repair, exactly-once service; VSC trigger/expiry and overtaking penalty. AI pit approach/service completed through physical input; separate test exits/rejoins without resetting. Prior3/5/8 full-race, physics, lap, collision and browser regression passed. Test driver may incur penalties when not obeying flag hints; final order incorporates actual penalties.
Explicit scope: virtual rather than physical safety car; no red flags or jump-start penalties (grid locked); no fuel. Public deployment permission remains blocked, local production subpath passed. Manual multi-session play and real-device handling still need owner evaluation; no claim of professional simulator fidelity.

## Phase 5 — environment/damage
PASS:30 tests, including gradual wetting/drying/bounds, actual aero loss from substantial damage, and complete wet four-car race on intermediates. Prior regressions pass. Production Chromium selects all four environments; screenshots captured for day/dusk/night/rain and night/driving screenshots inspected. Live car/track visible, night floodlighting works, no page/HTTP errors. Low caps rain300 vs1800 high and nearby floodlights2 vs6; shadows disabled. Small impacts do not cause damage; pit repair verified in Phase4 suite.
Simplifications: aggregate wing damage and globally uniform wetness only; particle spray is visual, not simulated fluid. Real-device GPU performance not certified; no unlicensed imagery/model used.

## Phase 6 — garage/telemetry/engineer
PASS:34 tests; garage trim/bias alter real parameters; bounded6000-sample telemetry; malformed records rejected; unavailable storage does not crash; completed physical lap creates>900 samples and validated reference; distance-aligned delta matches controlled +1s difference. Engineer messages tested against actual threshold conditions, no external service. Browser changes aero trim to110%, starts and verifies actual3.63 downforce coefficient; opens/closes data panel, plus prior browser/graphics regression, zero page/HTTP errors.
Scope: speed trace, last/best and sector comparison with current car stats; no advanced suspension sliders or unverifiable corner-specific time-loss claims.10Hz data, max8 configuration best laps in browser storage; quota failure reported and session remains usable.
