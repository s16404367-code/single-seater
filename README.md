# APEX GP — Single Seater
Original browser-based open-wheel racing, built with TypeScript, Three.js and Vite. No login, backend, tracking or runtime asset CDN. The uploaded prompt pack is preserved as requirements; actual implementation status is in [docs/ROADMAP.md](docs/ROADMAP.md).

## Run
Requires Node.js 22. `npm ci`, then `npm run dev`. Open the displayed URL with `/single-seater/`.

## Verify
`npm run check` runs unit/simulation tests, TypeScript and production build. `npm run preview -- --port 4173` serves the built artifact; in a second terminal `npm run test:browser` runs Chromium software-rendered UI checks. Browser test uses packaged Chromium libraries on Linux x64. This is not a real GPU performance certification.

## Controls
W/↑ throttle, S/↓ brake, A/D or ←/→ steer, X reverse, C camera, R safe recovery (invalidates current lap), Esc pause, M mute. Click Take to the Track first. Keyboard commands do not hijack settings fields. Low mode disables shadows and caps rendering pixel ratio. Sound is procedural synthesis, not an actual engine recording.

## Deployment
GitHub Actions `.github/workflows/pages.yml` builds and deploys the session branch `arena/41d1170c-single-seater` to Pages (source must be GitHub Actions). No root bundle.js or source-style fallback. Output is `dist/`; never commit generated dependencies or build output. The `/single-seater/` base is configured centrally in vite.config.ts.

Build identity includes Git revision, source-content fingerprint, timestamp and dirty state. It identifies loaded content, not proof of remote Git synchronization. No service worker to hide stale builds.

See [tests and limitations](docs/TEST_REPORT.md), [architecture](docs/TECHNICAL_ARCHITECTURE.md), [sources/licenses](docs/THIRD_PARTY_ASSETS.md). Game art is original and fictional; no affiliation with Formula One, FIA or real teams. Third-party notices are shipped with the application.
