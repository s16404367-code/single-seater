import { it, expect } from 'vitest';
import { makeCar, stepCar, idleInput, aero } from '../src/physics';
import { packages } from '../src/setup';
import { track } from '../src/track';
function straight(boost = false, drs = false) {
  const c = makeCar();
  const length = track.length;
  const fake = {
    ...track,
    project: () => ({ ...track.at(0), offset: 0, index: 0, distance: 0 }),
    surface: () => 'asphalt',
    at: track.at.bind(track),
    length,
    boundary: 25,
  } as typeof track;
  for (let i = 0; i < 120 * 12; i++)
    stepCar(c, { ...idleInput(), throttle: 1, ers: boost, drs }, 1 / 120, fake);
  return c;
}
it('engine/gears, bounded ERS and DRS alter acceleration', () => {
  const plain = straight(),
    ers = straight(true),
    drs = straight(false, true);
  console.log({ plain: plain.speed, ers: ers.speed, drs: drs.speed, gear: plain.gear });
  expect(plain.speed).toBeGreaterThan(45);
  expect(plain.gear).toBeGreaterThan(3);
  expect(ers.speed).toBeGreaterThan(plain.speed);
  expect(ers.battery).toBeLessThan(4000000);
  expect(drs.speed).toBeGreaterThan(plain.speed);
});
it('aero scales with square of speed and different packages change forces', () => {
  const c = makeCar();
  expect(aero(c, 40).downforce / aero(c, 20).downforce).toBeCloseTo(4);
  const base = aero(c, 50);
  c.setup = { ...packages.highAero };
  expect(aero(c, 50).downforce).toBeGreaterThan(base.downforce);
  c.setup = { ...packages.lowDrag };
  expect(aero(c, 50).drag).toBeLessThan(base.drag);
});
it('combined forces remain limited; braking transfers weight forward, wet reduces grip', () => {
  const c = makeCar();
  c.vz = 40;
  stepCar(c, { ...idleInput(), brake: 1, steer: 1 }, 1 / 120);
  stepCar(c, { ...idleInput(), brake: 1, steer: 1 }, 1 / 120);
  expect(c.tires[0].normal + c.tires[1].normal).toBeGreaterThan(
    c.tires[2].normal + c.tires[3].normal,
  );
  for (const t of c.tires)
    expect(Math.hypot(t.longitudinal, t.lateral)).toBeLessThanOrEqual(t.normal * 1.4 + 0.01);
  const wet = makeCar();
  wet.vz = 40;
  wet.wetness = 1;
  stepCar(wet, { ...idleInput(), brake: 1 }, 1 / 120);
  expect(Math.abs(wet.ax)).toBeLessThan(Math.abs(c.ax));
});
it('tire states bounded and distinct; ERS cannot run empty, rain prevents DRS', () => {
  const c = makeCar();
  c.battery = 0;
  c.wetness = 1;
  c.vz = 50;
  stepCar(c, { ...idleInput(), throttle: 1, ers: true, drs: true }, 1 / 120);
  expect(c.ersActive).toBe(false);
  expect(c.drsActive).toBe(false);
  c.tires[0].temperature = 120;
  c.tires[0].wear = 0.8;
  for (let i = 0; i < 120; i++) stepCar(c, { ...idleInput(), throttle: 1, steer: 1 }, 1 / 120);
  expect(c.tires[0].temperature).toBeLessThan(155);
  expect(c.tires[0].wear).toBeGreaterThan(0.8);
});
import { Driver } from '../src/ai';
import { LapTimer } from '../src/timing';
it.each(['soft', 'medium', 'hard'] as const)(
  '%s compound completes controlled lap; wear and temperature evolve',
  (compound) => {
    const c = makeCar(0, track.length - 12);
    c.compound = compound;
    const d = new Driver(0),
      t = new LapTimer(c.distance);
    for (let i = 0; i < 120 * 180 && t.laps < 1; i++) {
      stepCar(c, d.update(c, [c], 1 / 120, i / 120), 1 / 120);
      t.update(c.distance, 1 / 120, Math.abs(c.offset) < 11);
    }
    console.log(compound, t.last, c.tires[0].temperature, c.tires[0].wear);
    expect(t.laps).toBe(1);
    expect(Number.isFinite(t.best)).toBe(true);
    expect(c.tires[0].wear).toBeGreaterThan(0);
  },
  10000,
);
it('wet AI remains stable and timestep subdivisions agree', () => {
  const c = makeCar(0, track.length - 12);
  c.wetness = 0.7;
  const d = new Driver(0),
    t = new LapTimer(c.distance);
  for (let i = 0; i < 120 * 200 && t.laps < 1; i++) {
    stepCar(c, d.update(c, [c], 1 / 120, i / 120), 1 / 120);
    t.update(c.distance, 1 / 120, Math.abs(c.offset) < 11);
  }
  expect(t.laps).toBe(1);
  expect(c.contacts).toBe(0);
  const a = makeCar(),
    b = makeCar();
  for (let i = 0; i < 100; i++) stepCar(a, { ...idleInput(), throttle: 1 }, 1 / 30);
  for (let i = 0; i < 400; i++) stepCar(b, { ...idleInput(), throttle: 1 }, 1 / 120);
  expect(a.speed).toBeCloseTo(b.speed, 6);
}, 10000);
it('brake regeneration requires actual motion/energy and reverse is speed limited', () => {
  const c = makeCar();
  c.battery = 1000000;
  for (let i = 0; i < 120; i++) stepCar(c, { ...idleInput(), brake: 1 }, 1 / 120);
  expect(c.battery).toBe(1000000);
  c.vx = Math.sin(c.heading) * 30;
  c.vz = Math.cos(c.heading) * 30;
  stepCar(c, { ...idleInput(), brake: 1 }, 1 / 120);
  expect(c.battery).toBeGreaterThan(1000000);
  for (let i = 0; i < 120 * 10; i++) stepCar(c, { ...idleInput(), reverse: true }, 1 / 120);
  expect(c.speed).toBeGreaterThan(-8.2);
});
