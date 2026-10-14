# Phase 4 Prompt — Race Weekend, Pit Stops and Race Control

Read the master prompt, the current architecture, feedback log, research notes and acceptance matrix. Preserve earlier driving, AI, tire, aero, ERS/DRS and track systems. Implement only missing functionality; do not duplicate working race systems.

## Goal

Provide understandable, consistent race progression beyond a simple sprint: practice, qualifying, grid formation, race control, penalties, pit stops and race results.

## Sessions

Where not already implemented, support:

- Practice (free driving with valid lap/timing collection).
- Qualifying (lap-time-based classification with session end).
- Race (grid and selected lap count).
- Session transitions with clear menus and persistent setup/driver state.

Ensure session state transitions are explicit, testable and not triggered multiple times by one event.

## Grid and start

- Generate safe grid locations from track data.
- Avoid cars overlapping, inside barriers or facing incorrect directions.
- Preserve start lights and delay AI launch until the proper signal.
- Add false-start detection only if it can be tested and explained.
- Ensure pause, reset and restart do not duplicate race timers or leave the input locked.

## Penalties and flags

Add appropriate simplified forms of:

- Track-limits warning and escalating penalty.
- Pit-lane speeding.
- Jump start where supported.
- Unsafe or invalid race behavior only where it can be measured from game state.
- Yellow flag and double-yellow zones/states.
- Safety-car state, reduced speeds, no-overtaking behavior and restart.
- Red flag only if a coherent session restart/termination behavior is implemented.

Do not display an official-sounding penalty with no rule or triggering condition. Explain the game rules in the interface. Avoid trying to emulate proprietary or trademarked race-control systems exactly.

## Pit lane and pit stops

Implement only with valid track/pit geometry:

- Pit entry/exit detection.
- Pit lane speed limit and limiter.
- Pit box selection/stop condition.
- Time actually spent stationary or servicing.
- Tire compound change that updates the car's real tire state.
- Optional repair if damage exists.
- Fuel only if the game rules and model support it; do not add a fuel UI without fuel simulation.
- AI pit decisions based on wear/weather/session rules when those data exist.

A pit stop must cost time and preserve race-order correctness. If no usable pit lane exists on a selected circuit, clearly disable pit stops for that circuit instead of teleporting cars to an imaginary lane.

## Results and rules consistency

Use the same lap classification, tire and track-progress system for player and AI. Account for lapped cars. Keep finished/DNF states stable. Do not allow a finished car to restart timing unexpectedly. Store local results only if the current privacy model supports it.

## Acceptance gate

- [ ] Session state and transitions are reliable.
- [ ] Practice and qualifying produce correct timing/classification.
- [ ] Grid and race start work consistently.
- [ ] Each implemented penalty has a real trigger and understandable behavior.
- [ ] Flags affect race behavior appropriately.
- [ ] Safety-car/restart state works without AI pileups or instant teleportation.
- [ ] Pit entry/exit/speed control work on supported tracks.
- [ ] Pit stops consume time and update tire/repair state correctly.
- [ ] AI strategy does not violate its own constraints.
- [ ] Classification and standings remain valid after penalties, pits and lapping.
- [ ] Production build, prior physics, AI and graphics pass regression tests.

Document simplified rules and unavailable features. Stop for owner testing; do not auto-start Phase 5.
