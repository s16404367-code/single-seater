# Architecture
Coordinates: world X/Z horizontal, Y vertical; heading 0 points +Z, positive heading turns toward +X. SI units: m, s, kg, N, rad, W, J; HUD converts m/s to km/h. Fixed 120 Hz simulation; max frame backlog capped to avoid focus-return explosions. Input, simulation, race control, renderer, audio and UI are separate modules. Track is a closed sampled centerline with estimated widths; projection is shared by surfaces, boundaries, lap timing and AI. Player motion is free-world, never spline-constrained.

No network during gameplay. Build dependencies are installed at build time; static output contains required runtime resources. Preferences and race records remain in browser storage. No external fonts, images or tracking.
