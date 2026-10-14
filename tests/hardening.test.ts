import { it, expect } from 'vitest';
import { seasonValid } from '../src/progression';
import { recordValid, Telemetry } from '../src/telemetry';
import { validBindings, defaults } from '../src/input';
import { Race, sanitizeOptions } from '../src/race';
import { LapTimer } from '../src/timing';
import { track } from '../src/track';
import { makeCar, stepCar, idleInput } from '../src/physics';
import { Driver } from '../src/ai';
it('malformed local records never throw or accept alias conflicts', () => {
  for (const value of [
    null,
    [],
    {},
    { version: 1, id: 'x', results: [null] },
    { version: 1, id: 'x', results: [{}] },
    'bad',
    42,
  ])
    expect(() => seasonValid(value)).not.toThrow();
  expect(seasonValid({ version: 1, id: 'x', results: [null] })).toBe(false);
  expect(validBindings({ ...defaults, brake: 'ArrowUp' })).toBe(false);
  expect(recordValid({ samples: [null] })).toBe(false);
  const o = sanitizeOptions({ laps: Infinity, livery: -99, aeroTrim: 100, opponents: 99 as 3 });
  expect(o.laps).toBe(3);
  expect(o.livery).toBe(0);
  expect(o.aeroTrim).toBe(1.2);
  expect(o.opponents).toBe(5);
});
it('invalid/repeated finish attempts discard samples rather than joining different laps', () => {
  const timer = new LapTimer(track.length - 2),
    data = new Telemetry('test'),
    car = makeCar();
  timer.update(2, 0.1);
  data.update(car, timer, 0.1);
  for (let i = 0; i < 20; i++) {
    timer.current += 0.1;
    data.update(car, timer, 0.1);
  }
  expect(data.samples.length).toBeGreaterThan(0);
  timer.update(track.length - 1, 0.1);
  timer.update(1, 0.1);
  data.update(car, timer, 0.1);
  expect(data.samples.length).toBeLessThan(3);
  expect(data.best).toBeUndefined();
});
it('invalid dt cannot advance race state', () => {
  const r = new Race();
  r.start();
  r.step(NaN);
  r.step(Infinity);
  r.step(0);
  expect(r.time).toBe(0);
  expect(Number.isFinite(r.cars[0].x)).toBe(true);
});
it.each(['Rookie', 'Amateur', 'Pro', 'Expert', 'Alien'] as const)(
  '%s multi-lap race completes, finished timing remains frozen',
  (difficulty) => {
    const r = new Race();
    r.start({ mode: 'race', opponents: 3, laps: 3, difficulty });
    const d = new Driver(0, difficulty);
    for (let i = 0; i < 120 * 600 && r.state !== 'finished'; i++)
      r.step(1 / 120, d.update(r.cars[0], r.cars, 1 / 120, r.time, r.control.flag === 'green'));
    expect(r.state).toBe('finished');
    expect(r.finishTimes.size).toBe(4);
    const times = [...r.finishTimes];
    const penalties = r.control.rules.map((r) => r.penalty);
    for (let i = 0; i < 120; i++) r.step(1 / 120);
    expect([...r.finishTimes]).toEqual(times);
    expect(r.control.rules.map((r) => r.penalty)).toEqual(penalties);
  },
  35000,
);
it('corrupt physical state resets safely instead of propagating NaN', () => {
  const c = makeCar();
  c.vx = NaN;
  c.distance = Infinity;
  c.tires[0].wear = NaN;
  stepCar(c, idleInput(), 1 / 120);
  expect([c.x, c.z, c.vx, c.tires[0].wear].every(Number.isFinite)).toBe(true);
});
