# Research, Tracks, Assets and Licensing Protocol

Use this document whenever researching technical decisions, importing a track, model, texture, font, shader, sound or other external material.

## Research standard

1. Turn the question into a specific technical decision.
2. Prefer official documentation, primary engineering sources, source repositories and license texts.
3. Inspect source material rather than relying only on a repository title or screenshot.
4. Compare alternatives when cost, license, file size, physical compatibility or performance materially differ.
5. Record direct URLs, access date, key findings, the decision and its limitations in `docs/RESEARCH.md`.
6. Clearly distinguish verified facts, engineering assumptions and game approximations.
7. If web/repository access is unavailable, say so and do not invent a source or pretend to have inspected it.

## Track-search targets

Look for licensed, technically compatible:

- Track centerline and coordinates.
- SVG circuit layouts.
- JSON or structured circuit geometry.
- 3D circuit mesh and terrain assets.
- Track generation libraries.
- Example algorithms for track width, surface, collision and sector progress.

Evaluate file formats, axis/units, scaling, track width, closed/open state, barriers, run-off, pit lane, start/finish, sector data, AI line suitability, performance and redistribution permission. A visual image/outline is not a driveable track.

## Track integration contract

Each track should use one shared representation wherever practical for rendering, collision boundaries, lap progress, sectors, minimap, AI path and pit geometry. A track manifest may describe:

- Unique ID and display name.
- Source/provenance/license.
- Coordinate system and units.
- Centerline or mesh data.
- Driveable surface width and boundaries.
- Sector/start-finish locations.
- Pit entry/exit and speed limits, if present.
- Generated/estimated parts.
- Required credits.

Do not claim real-world length/accuracy unless the source supports it. Preserve the procedural 3.5 km hairpin/chicane/back-straight circuit as fallback. Validate complete laps, track limits, timing, minimap and AI path before exposing a selectable track.

## License checks

- Public access is not a license.
- Check the exact asset file/model/data license, which may differ from repository code.
- If no applicable permission is discoverable, do not redistribute that asset.
- Record license name, source, author, required text, files copied, changes, and obligations.
- Keep required copyright/license texts.
- Add an in-game credits notice if required.
- Do not strip notices or suggest the game owns third-party work.
- Ensure the license is compatible with public hosting and any intended redistribution.

Create/update `docs/THIRD_PARTY_ASSETS.md`; include links and notices. For code dependencies, also inspect the package license and compatibility. Avoid copying proprietary racing-team logos, sponsor marks, branded car models or engine recordings without permission. Use fictional identity and properly usable content.

## Asset performance and fallback

Bundle required licensed assets where practical rather than depending on external URLs. Keep sizes reasonable, provide LOD/quality fallback, and handle missing optional assets cleanly. A failed texture should not cause a black screen or crash. Do not use an external asset server for core startup if the game must remain available from static GitHub Pages.

## Report requirements

For every candidate considered, state whether it was imported, rejected or deferred, and why. Never imply a track was integrated if only research occurred. Document generated geometry separately from source geometry. Preserve required disclosures in the deployed product.
