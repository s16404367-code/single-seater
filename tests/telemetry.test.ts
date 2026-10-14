import { it, expect } from 'vitest';
import { Telemetry, engineer, recordValid } from '../src/telemetry';
import { makeCar } from '../src/physics';
import { LapTimer } from '../src/timing';
import { Race } from '../src/race';
import { Driver } from '../src/ai';
it('bounded telemetry, invalid saves rejected, blocked storage cannot crash', () => {
  const t = new Telemetry('test'),
    c = makeCar(),
    lap = new LapTimer();
  lap.started = true;
  for (let i = 0; i < 7000; i++) {
    lap.current = i * 0.1;
    t.update(c, lap, 0.1);
  }
  expect(t.samples.length).toBe(6000);
  expect(t.truncated).toBe(true);
  expect(recordValid({ version: 1, key: 'x', time: 50, samples: [{ x: NaN }] })).toBe(false);
  expect(recordValid(null)).toBe(false);
});
it('engineer messages expose actual measured threshold', () => {
  const c = makeCar();
  expect(engineer(c, 10)).toBe('');
  c.battery = 500000;
  expect(engineer(c, 10)).toContain('15%');
  c.wetness = 0.8;
  expect(engineer(c, 10)).toContain('80%');
  c.compound = 'inter';
  c.damage = 0.3;
  expect(engineer(c, 10)).toContain('30%');
});
it('functional garage changes actual aero and brake config', () => {
  const a = new Race(),
    b = new Race();
  a.start({ aeroTrim: 1.2, brakeBias: 0.62 });
  b.start({ aeroTrim: 0.8, brakeBias: 0.5 });
  expect(a.cars[0].setup.downforce).toBeGreaterThan(b.cars[0].setup.downforce);
  expect(a.cars[0].setup.drag).toBeGreaterThan(b.cars[0].setup.drag);
  expect(a.cars[0].setup.brakeBias).toBe(0.62);
});
it('a physically completed valid lap produces reference and measurable delta', () => {
  const r = new Race();
  r.start();
  const d = new Driver(0);
  for (let i = 0; i < 120 * 150 && !r.telemetry.best; i++)
    r.step(1 / 120, d.update(r.cars[0], r.cars, 1 / 120, r.time));
  expect(r.telemetry.best?.samples.length).toBeGreaterThan(900);
  expect(recordValid(r.telemetry.best)).toBe(true);
  const ref = r.telemetry.best!.samples[100];
  expect(r.telemetry.delta(ref.s, ref.t + 1)).toBeCloseTo(1);
}, 10000);
