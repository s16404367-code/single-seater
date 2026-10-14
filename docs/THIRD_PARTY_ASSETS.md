# Sources and notices
All car meshes, circuit centerline, signage and environment geometry are created in this repository. Fictional teams and track, no licensed Formula One branding or claims of affiliation. No external track data imported yet.
Three.js runtime: MIT, https://github.com/mrdoob/three.js ; installed LICENSE is copied to public/THIRD_PARTY_NOTICES.txt for distribution. Vite/TypeScript/Vitest/Playwright/Chromium are build/test tools, not shipped in game runtime. Exact package licenses retained in node_modules and package-lock pins versions.

## Exact installed direct dependencies inspected at release
- three0.180.0:MIT, runtime; LICENSE included in public/THIRD_PARTY_NOTICES.txt (also covers addons used here).
- @types/three0.180.0:MIT, development only.
- vite7.3.7:MIT, development/build only.
- typescript5.9.3:Apache-2.0, development only.
- vitest5.0.4:MIT, testing only.
- playwright-core1.64.0:Apache-2.0, testing only.
- @sparticuz/chromium141.0.0 wrapper:MIT, testing only; packaged Chromium carries its own upstream third-party licenses and is not shipped in dist.
- prettier3.9.10:MIT, development only.
Versions are locked in package-lock.json; metadata read directly from installed package.json files. No third-party racing asset redistribution. No original-project license has been imposed on the owner's code beyond retaining required dependency notices.
