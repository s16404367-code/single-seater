# Phase 3 Prompt — Coherent Vehicle Dynamics and Tire Physics

Read `00_MASTER_PROMPT.md`, `03_PHASE_2_AI_RACING.md`, the architecture/research/test docs and `12_ACCEPTANCE_TEST_MATRIX.md`. Do not start Phase 3 until Phase 2's critical acceptance gate has passed. Preserve the Mk.II game and upgrade packages; extend existing physics rather than creating competing systems.

## Goal

Make throttle, braking, cornering, tire grip, aero, setup, ERS, DRS and wet conditions interact through one coherent, stable, documented vehicle model.

## 1. Audit and model contract

Document the current physics, units, coordinate directions, timestep, vehicle mass/inertia assumptions, wheel placement, tire parameters, aerodynamic parameters and data flow. Identify duplicate or inconsistent calculations before editing. Use a stable fixed timestep and interpolation where appropriate. Guard against NaN/Infinity, huge frame gaps, excessive impulses and invalid positions.

## 2. Engine and transmission

Where needed, implement/improve:

- Torque/power relationship versus RPM or a documented simplified curve.
- Gear ratios/final drive and shift rules.
- Engine braking and rev limiter.
- Traction-limited engine force.
- Braking force and brake-lock behavior.
- Engine response and sound pitch derived from actual RPM.

The speed, gear and RPM HUD must reflect the actual vehicle state. No static/stat-only indicators.

## 3. Tires and force limits

Implement a suitable browser-friendly approximation for each wheel. Where appropriate include:

- Normal load.
- Longitudinal slip ratio.
- Lateral slip angle.
- Longitudinal and lateral forces.
- Combined force saturation or another documented constraint.
- Front/rear balance.
- Grip limits, wheel lock and loss of traction.
- Stable recovery from excessive slip.

A tire cannot produce unlimited combined braking and cornering force. Avoid merely steering the front mesh while the chassis motion ignores tire forces. Keep CPU cost suitable for the target browser.

## 4. Weight transfer

Add a documented approximation of longitudinal and lateral load transfer if the existing model lacks it. Braking, acceleration and cornering should affect wheel loads and therefore grip. Do not claim a fully simulated suspension if using a simplified chassis-load formula.

## 5. Aerodynamics

Use coherent force calculations and clear units. A suitable simplified magnitude is:

`force = 0.5 × airDensity × speed² × coefficient × referenceArea`

Model drag opposite motion and downforce toward the road. Apply downforce to available tire normal load without double-counting it, gravity or another existing force. Validate direction, units, low-speed behavior and high-speed scaling.

## 6. Integrate current Mk.II systems

Preserve and connect the existing packages:

- Stage 1 Balanced.
- Monza Low-Drag.
- Monaco High-Aero.
- Apex Mk.II Pro.

Preserve ERS boost (reported on Space/Shift and UI), battery energy, active DRS, wing-flap animation, and car telemetry. DRS must change aerodynamic parameters and ERS must change available power/energy, not just visuals or an unbounded speed multiplier. Do not double-apply effects in both the package and physics module.

## 7. Tire compounds, temperature and wear

Preserve Soft C5, Medium C3 and Hard C1 selection and sidewall indicators. Implement or improve a simple, explicit tire-state model based on load, slip, braking, driving time and environmental conditions as appropriate. Temperature should be bounded and should affect grip according to documented windows. Wear should evolve during driving and reduce performance. The displayed compound, temperature and health/wear must match the actual model state. Do not claim proprietary real racing tire fidelity; state approximations.

## 8. Weather links

Keep all existing environment modes. Ensure wet track grip/braking changes in physics, not just rain particles and reflective asphalt. If progressive track wetting exists, retain it and connect it to tires consistently. Do not build parallel weather/tire grip calculators.

## 9. Required repeatable tests

- Straight acceleration/braking, gear change and drag response.
- Compare DRS active/inactive under comparable straight-line conditions.
- Compare ERS active/inactive while respecting charge limits.
- Compare low-drag and high-aero packages at low/high speed.
- Compare tire compounds on the same controlled lap.
- Compare dry and wet grip/braking.
- Corner entry, apex and exit; oversteer/understeer; recovery.
- Check invalid states over long and short frame steps.

Record actual measurements if a repeatable harness is available; never invent lap-time gains or performance numbers.

## Acceptance gate

- [ ] Coherent documented units and stable time integration.
- [ ] Tire forces and grip limits affect actual chassis motion.
- [ ] Braking/turning and traction interactions are plausible.
- [ ] Drag/downforce scale sensibly and have correct directions.
- [ ] Setup packages measurably alter physics.
- [ ] ERS/DRS effects are integrated and bounded.
- [ ] Tire compound, temperature and wear state match displayed values.
- [ ] Wet conditions affect driving behavior.
- [ ] AI remains stable under the revised constraints.
- [ ] Timing, collision, camera, HUD, minimap and production deployment regressions pass.
- [ ] Assumptions and simplifications are documented.

Stop after Phase 3. Provide the actual tests, known limits, verified preview, and specific owner testing steps. Do not begin Phase 4 without authorization.
