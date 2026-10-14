# Phase 2 Prompt — Competitive AI and Proper Racing

Read `00_MASTER_PROMPT.md`, `12_ACCEPTANCE_TEST_MATRIX.md`, the current architecture docs and feedback log. Preserve all working Mk.II systems. Determine what actually exists before adding anything.

## Goal

Turn the playable driving prototype into an actual race: independent AI vehicles, believable cornering/braking, safe overtaking, race starts, correct progress/timing, stable contact physics and meaningful results.

## Opponents and difficulty

Maintain selections for 3, 5 or 8 AI rivals. AI cars must operate their own vehicle state, not teleport between waypoints, follow a fixed speed, or ignore the car physics. Implement or improve:

- Track-relative progress and racing-line look-ahead.
- Corner speed targets, braking zones, acceleration and throttle modulation.
- Reasonable steering and line choice.
- Recovery after spins/off-track excursions.
- Different Rookie/Amateur/Pro/Expert/Alien behavior through actual control parameters, reaction delays, consistency and mistakes—not arbitrary speed cheats.
- Sensible spacing, nearby-car awareness and no endless steering oscillation.

## Passing and defending

Add basic tactical behavior when not already present:

- Identify a car ahead and relative speed.
- Attempt passes on straights and appropriate braking zones.
- Select an alternative line if space permits.
- Defend without instant lateral movement or impossible blocking.
- Abort unsafe attempts and recover to a sensible line.
- Avoid repeated rear-end contact and dangerous overlaps where practical.

The AI is not required to be a perfect human-like strategy engine; it must be consistent, physically constrained and fun to race.

## Vehicle-to-vehicle interaction

A previous status report said cars did not collide with each other. Verify this defect directly. Add stable player-vs-AI and AI-vs-AI contact handling if still missing. Use efficient collision shapes, not expensive visual-mesh collision every frame. Contact must affect position/velocity/speed; HUD-only “impact” effects are not collisions. Avoid cars remaining embedded, infinite repeated impulses, dramatic pinball response and stuck states. Test side-to-side and front-to-rear contacts.

## Starts, standings and timing

- Set up a collision-free starting grid using track data.
- Keep the start-light sequence; AI must not launch before lights out.
- Implement false-start handling if supportable without destabilizing the game; document any simplification.
- Compute order from completed laps plus circuit progress, not just Euclidean distance (the track may loop close to itself).
- Correctly handle start/finish crossing direction, cars on different laps and repeated/reverse crossings.
- Use one consistent race-progress source for standings, sector/lap timing and minimap positions.
- Gaps must be based on measured progress/time and not fixed invented constants.
- Retain a timing tower with position, driver/team, gaps and relevant implemented tire/pit state.
- Maintain a minimap accurately aligned to each supported circuit.

## Diagnostics

Provide a developer option or reproducible test harness that can report AI state, lap time, off-track incidents, spin/recovery, collision count and successful passing when feasible. Avoid continuous heavy logging in release mode. Measure comparable lap pace on the same circuit and conditions; a prior report cited a roughly 15-second difference versus autopilot, but that is only an unverified diagnostic, not a required performance number. Do not make AI faster through teleportation or physics bypasses.

## Acceptance gate

- [ ] 3/5/8 opponent settings work.
- [ ] AI cars independently navigate and complete laps.
- [ ] AI slows for corners, brakes and accelerates sensibly.
- [ ] Off-track/spin recovery works without teleporting.
- [ ] Overtaking/defending occurs when the situation permits.
- [ ] Player-AI and AI-AI contact physically affect vehicles and recover stably.
- [ ] Grid and start sequence work; AI launches at the right time.
- [ ] Standings remain correct when track sections pass near each other.
- [ ] Lap/sector times resist invalid reverse/repeated crossings.
- [ ] Gap and timing-tower values derive from actual race state.
- [ ] Minimap matches every supported track.
- [ ] Full race completes without critical runtime/physics errors.
- [ ] GitHub production build and the graphics fix still work.

If any critical requirement fails, fix it and stop for owner testing. Do not proceed to Phase 3 until this gate passes. Report tested results, limitations, actual preview URL and simple test steps.
