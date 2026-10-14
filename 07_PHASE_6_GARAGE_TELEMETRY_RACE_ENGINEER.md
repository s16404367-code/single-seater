# Phase 6 Prompt — Functional Garage, Telemetry and Local Race Engineer

Read the master prompt, architecture and feedback. Preserve current setup packages, tire selection, ERS/DRS, timing and weather. Audit what exists; do not add cosmetic gauges that do not reflect simulation state.

## Goal

Let the player understand what the car is doing, adjust a few real parameters and compare outcomes without a backend or paid API.

## Garage and setup

Preserve the existing packages:

- Stage 1 Balanced.
- Monza Low-Drag.
- Monaco High-Aero.
- Apex Mk.II Pro.

Expose supported setup parameters gradually, for example front/rear aero, brake bias, gearing, differential, ride height or tire pressure only if each parameter is actually modeled. Every control must change the real physics configuration. Provide plain-language trade-offs and reset-to-default. Save settings locally when storage is available.

Do not add an advanced slider merely to fill the garage page. Mark unavailable parameters as not implemented rather than pretending they work.

## Telemetry

Where data exists, show:

- Lap and sector times.
- Lap delta versus best/reference lap.
- Speed trace.
- Gear and RPM.
- Braking and throttle traces.
- Tire compound, temperature and wear.
- ERS charge/use.
- DRS state.
- Weather and track state.
- Damage state.

Choose a limited sampling rate and storage window to avoid unbounded memory usage. Correctly label units. Do not claim a trace measures throttle/brake input if it measures only estimated force or speed.

## Lap comparison

Add a practical side-by-side comparison of a new lap with a saved best lap if feasible. Explain differences using actual sampled telemetry; avoid unsupported conclusions about exact lost time at a corner. Store a compact local record rather than every simulation object forever.

## Local Race Engineer (innovative but grounded)

Create an optional, offline/local “Race Engineer” panel that derives short tips from actual state and recent telemetry, such as:

- Tire temperatures consistently above/below the model's configured window.
- Tire wear high enough to change grip.
- ERS battery low.
- Excessive wheel slip during acceleration.
- Braking that repeatedly starts late for a particular corner, if measured data supports that conclusion.
- A close car ahead/behind.
- Wet conditions with a currently selected dry-oriented setup.

Each message must be explainable by the actual measured threshold or rule. Show why it appeared, and do not present it as real-world professional race engineering. No external AI API, internet request, login or paid service is necessary. Give the player an option to turn it off.

## Acceptance gate

- [ ] Existing setup packages still function and alter the car.
- [ ] Every enabled setup parameter has a real effect.
- [ ] Telemetry derives from actual simulation state and labels units.
- [ ] Lap comparison is reproducible and uses a clearly defined reference.
- [ ] Engineer tips map to actual sampled data and explain their trigger.
- [ ] No external data upload or surprise tracking is introduced.
- [ ] Local persistence handles unavailable/cleared storage gracefully.
- [ ] Memory remains bounded during long sessions.
- [ ] Core racing, production build and low graphics mode pass regression tests.

Stop after reporting results. Do not start Phase 7 without the owner's `next phase` instruction.
