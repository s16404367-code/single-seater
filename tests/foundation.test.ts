import { describe, it, expect } from 'vitest';
import { track } from '../src/track';
import { makeCar, stepCar, idleInput, recover } from '../src/physics';
import { LapTimer } from '../src/timing';
describe('Phase 1 foundation', () => {
  it('closed 3.5km track, consistent projection and widths', () => {
    expect(track.length).toBeCloseTo(3500, 0);
    for (let s = 0; s < track.length; s += 17) {
      const p = track.at(s, 5),
        q = track.project(p);
      expect(Math.abs(q.offset - 5)).toBeLessThan(0.1);
      expect(Math.abs(q.s - s)).toBeLessThan(1);
    }
    expect(track.at(0)).toEqual(track.at(track.length));
  });
  it('throttle, brake, steer and reverse change motion', () => {
    const c = makeCar();
    for (let i = 0; i < 360; i++) stepCar(c, { ...idleInput(), throttle: 1 }, 1 / 120);
    expect(c.speed).toBeGreaterThan(20);
    const h = c.heading;
    for (let i = 0; i < 30; i++) stepCar(c, { ...idleInput(), steer: 1 }, 1 / 120);
    expect(c.heading).not.toBe(h);
    const speed = c.speed;
    for (let i = 0; i < 120; i++) stepCar(c, { ...idleInput(), brake: 1 }, 1 / 120);
    expect(c.speed).toBeLessThan(speed);
    recover(c);
    for (let i = 0; i < 120; i++) stepCar(c, { ...idleInput(), reverse: true }, 1 / 120);
    expect(c.speed).toBeLessThan(0);
  });
  it('off-track drag is measurable and barrier recovery remains finite', () => {
    const road = makeCar(0, 100),
      grass = makeCar(1, 100, 20);
    for (const c of [road, grass]) {
      c.vx = Math.sin(c.heading) * 20;
      c.vz = Math.cos(c.heading) * 20;
      for (let i = 0; i < 60; i++) stepCar(c, idleInput(), 1 / 120);
    }
    expect(road.speed).toBeGreaterThan(grass.speed);
    const c = makeCar(0, 0, 30);
    stepCar(c, idleInput(), 1 / 120);
    expect(Math.abs(track.project(c).offset)).toBeLessThan(25);
    recover(c);
    expect(Number.isFinite(c.x)).toBe(true);
  });
  it('requires forward full lap with ordered sectors; repeated crossing cannot create laps', () => {
    const t = new LapTimer(track.length - 5);
    t.update(2, 0.1);
    for (let s = 10; s < track.length; s += 10) t.update(s, 0.1);
    expect(t.update(1, 0.1)).toBe(true);
    expect(t.laps).toBe(1);
    expect(t.lastSectors.length).toBe(3);
    expect(t.best).toBeGreaterThan(30);
    for (let i = 0; i < 20; i++) {
      t.update(track.length - 1, 0.1);
      t.update(1, 0.1);
    }
    expect(t.laps).toBe(1);
  });
  it('cuts invalidate best laps and huge dt cannot corrupt state', () => {
    const t = new LapTimer(track.length - 1);
    t.update(0, 0.1);
    t.update(200, 0.1);
    expect(t.valid).toBe(false);
    const c = makeCar();
    stepCar(c, idleInput(), 9);
    expect(c.speed).toBe(0);
  });
});
import { testDriver } from './driver';
it('scripted keyboard-equivalent controls complete valid timed lap in free-world physics', () => {
  const c = makeCar(0, track.length - 35),
    timer = new LapTimer(c.distance);
  for (let i = 0; i < 120 * 180 && timer.laps < 1; i++) {
    stepCar(c, testDriver(c), 1 / 120);
    timer.update(c.distance, 1 / 120, Math.abs(c.offset) < 11);
  }
  expect(timer.laps).toBe(1);
  expect(timer.best).toBeLessThan(150);
  expect(c.contacts).toBe(0);
});
