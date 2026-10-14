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
