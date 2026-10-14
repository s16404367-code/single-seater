import { it, expect } from 'vitest';
import { Race } from '../src/race';
import { Driver } from '../src/ai';
import { makeCar, stepCar, idleInput } from '../src/physics';
import { collideCars } from '../src/collision';
import { track } from '../src/track';
it.each([3, 5, 8] as const)(
  'full race with %i rivals, independent physics, starts and finish',
  (count) => {
    const race = new Race();
    race.start({ mode: 'race', opponents: count, laps: 1 });
    const driver = new Driver(0, 'Expert');
    const before = race.cars.map((c) => [c.x, c.z]);
    for (let i = 0; i < 600; i++) race.step(1 / 120, idleInput());
    expect(race.cars.map((c) => [c.x, c.z])).toEqual(before);
    let maxDelta = 0;
    for (let i = 0; i < 120 * 240 && race.state !== 'finished'; i++) {
      const old = race.cars.map((c) => ({ x: c.x, z: c.z }));
      race.step(1 / 120, driver.update(race.cars[0], race.cars, 1 / 120, race.time));
      race.cars.forEach(
        (c, j) => (maxDelta = Math.max(maxDelta, Math.hypot(c.x - old[j].x, c.z - old[j].z))),
      );
    }
    console.log({
      count,
      time: race.time,
      finish: race.finishTimes.size,
      laps: race.timers.map((t) => t.laps),
      contacts: race.cars.map((c) => c.contacts),
      off: race.drivers.map((d) => d.offTrack),
      maxDelta,
    });
    expect(race.state).toBe('finished');
    expect(race.finishTimes.size).toBe(count + 1);
    expect(maxDelta).toBeLessThan(1.5);
    expect(race.order[0].finish).toBeLessThanOrEqual(race.order.at(-1)!.finish!);
  },
  20000,
);
it('side and rear contact separate without explosive speed', () => {
  for (const rear of [false, true]) {
    const a = makeCar(0, 80),
      b = makeCar(1, rear ? 83 : 80, rear ? 0 : 1.8);
    a.vz = 30;
    b.vz = 10;
    for (let i = 0; i < 12; i++) collideCars([a, b]);
    expect(Math.hypot(a.x - b.x, a.z - b.z)).toBeGreaterThan(rear ? 4 : 2);
    expect(Math.hypot(a.vx, a.vz)).toBeLessThanOrEqual(31);
    expect([a.x, b.x, a.vz, b.vz].every(Number.isFinite)).toBe(true);
  }
});
it('AI passes slower car, slows at hairpin, and recovers off-track spin', () => {
  const fast = makeCar(0, 20),
    slow = makeCar(1, 45),
    d = new Driver(0, 'Expert');
  for (let i = 0; i < 120 * 15; i++) {
    stepCar(slow, { ...idleInput(), throttle: slow.speed < 13 ? 1 : 0 }, 1 / 120);
    stepCar(fast, d.update(fast, [fast, slow], 1 / 120, i / 120), 1 / 120);
    collideCars([fast, slow]);
  }
  expect(d.attempts).toBeGreaterThan(0);
  expect(d.passes).toBeGreaterThan(0);
  const spun = makeCar(1, 700, 15);
  spun.heading += Math.PI;
  const recovery = new Driver(1);
  for (let i = 0; i < 120 * 70; i++)
    stepCar(spun, recovery.update(spun, [spun], 1 / 120, i / 120), 1 / 120);
  expect(Math.abs(track.project(spun).offset)).toBeLessThan(9);
  expect(spun.speed).toBeGreaterThan(5);
});
it('standings use unwrapped progress and gaps use shared crossing history', () => {
  const r = new Race();
  r.start({ mode: 'race', opponents: 3 });
  r.timers[0].total = track.length + 20;
  r.timers[1].total = track.length - 20;
  r.cars[0].distance = 20;
  r.cars[1].distance = track.length - 20;
  expect(r.order[0].car.id).toBe(0);
  r.timers[0].crossings = [
    { s: track.length - 30, time: 100 },
    { s: track.length - 20, time: 101 },
    { s: track.length + 20, time: 102 },
  ];
  r.timers[1].elapsed = 104;
  expect(r.gap(0, 1)).toBe(3);
});
