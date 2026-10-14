import type { Car } from './physics';
import type { LapTimer } from './timing';
import { compounds } from './setup';
import { load, save } from './storage';
import { track } from './track';
export interface Sample {
  s: number;
  t: number;
  x: number;
  z: number;
  heading: number;
  speed: number;
  gear: number;
  rpm: number;
  throttle: number;
  brake: number;
  temperature: number;
  wear: number;
  battery: number;
}
export interface LapRecord {
  version: 1;
  key: string;
  time: number;
  samples: Sample[];
}
export function recordValid(v: unknown): v is LapRecord {
  if (!v || typeof v !== 'object') return false;
  const r = v as LapRecord;
  return (
    r.version === 1 &&
    typeof r.key === 'string' &&
    r.key.length < 240 &&
    Number.isFinite(r.time) &&
    r.time > 10 &&
    r.time < 600 &&
    Array.isArray(r.samples) &&
    r.samples.length > 10 &&
    r.samples.length <= 6000 &&
    r.samples.every(
      (s, i) =>
        s &&
        (i === 0 || s.t > r.samples[i - 1].t) &&
        (
          [
            's',
            't',
            'x',
            'z',
            'heading',
            'speed',
            'gear',
            'rpm',
            'throttle',
            'brake',
            'temperature',
            'wear',
            'battery',
          ] as (keyof Sample)[]
        ).every((k) => typeof s[k] === 'number' && Number.isFinite(s[k])) &&
        s.s >= 0 &&
        s.s <= track.length &&
        s.t >= 0 &&
        s.t <= 600 &&
        Math.abs(s.x) < 10000 &&
        Math.abs(s.z) < 10000,
    )
  );
}
export class Telemetry {
  samples: Sample[] = [];
  last?: LapRecord;
  best?: LapRecord;
  clock = 0;
  seenLap = 0;
  seenAttempt = 0;
  truncated = false;
  storageAvailable = true;
  constructor(public key: string) {
    const records = load<unknown>('laps', []);
    if (Array.isArray(records))
      this.best = records
        .slice(0, 8)
        .filter(recordValid)
        .find((r) => r.key === key);
  }
  update(c: Car, t: LapTimer, dt: number) {
    if (t.attempt !== this.seenAttempt || t.laps !== this.seenLap) {
      if (t.laps !== this.seenLap && t.lastValid && !this.truncated && this.samples.length > 10) {
        this.last = { version: 1, key: this.key, time: t.last, samples: [...this.samples] };
        if (!this.best || this.last.time < this.best.time) {
          this.best = this.last;
          const raw = load<unknown>('laps', []),
            records = Array.isArray(raw)
              ? raw
                  .slice(0, 8)
                  .filter(recordValid)
                  .filter((r) => r.key !== this.key)
              : [];
          this.storageAvailable = save('laps', [this.best, ...records].slice(0, 8));
        }
      }
      this.samples = [];
      this.seenLap = t.laps;
      this.seenAttempt = t.attempt;
      this.truncated = false;
      this.clock = 0;
    }
    if (!t.started) return;
    this.clock += dt;
    if (this.clock < 0.1) return;
    this.clock %= 0.1;
    this.samples.push({
      s: c.distance,
      t: t.current,
      x: c.x,
      z: c.z,
      heading: c.heading,
      speed: c.speed,
      gear: c.gear,
      rpm: c.rpm,
      throttle: c.input.throttle,
      brake: c.input.brake,
      temperature: c.tires.reduce((a, t) => a + t.temperature, 0) / 4,
      wear: c.tires.reduce((a, t) => a + t.wear, 0) / 4,
      battery: c.battery,
    });
    if (this.samples.length > 6000) {
      this.samples.shift();
      this.truncated = true;
    }
  }
  delta(s: number, time: number) {
    const ref = this.best?.samples;
    if (!ref?.length) return undefined;
    const i = ref.findIndex((p) => p.s >= s);
    if (i < 1) return undefined;
    const a = ref[i - 1],
      b = ref[i];
    if (b.s - a.s <= 0) return undefined;
    return time - (a.t + ((b.t - a.t) * (s - a.s)) / (b.s - a.s));
  }
}
export function engineer(c: Car, elapsed: number): string {
  const temp = c.tires.reduce((a, t) => a + t.temperature, 0) / 4,
    wear = Math.max(...c.tires.map((t) => t.wear));
  if (c.damage > 0.15)
    return `Aero damage ${Math.round(c.damage * 100)}%: downforce reduced. Request pit repair.`;
  if (c.wetness > 0.55 && c.compound !== 'inter')
    return `Track wetness ${Math.round(c.wetness * 100)}% exceeds 55%. Consider intermediates.`;
  if (wear > 0.45) return `Tire wear ${Math.round(wear * 100)}% exceeds 45%. Grip is reduced.`;
  if (temp > 110) return `Tires ${Math.round(temp)}°C exceed 110°C. Reduce sliding to cool them.`;
  if (temp < 65 && elapsed > 20)
    return `Tires ${Math.round(temp)}°C below 65°C. Model optimum: ${compounds[c.compound].optimal}°C.`;
  if (c.battery < 600000)
    return `ERS below 15% (${Math.round(c.battery / 40000)}%). Braking regenerates energy.`;
  if (c.tires.some((t) => Math.abs(t.slipAngle) > 0.25) && c.speed > 12)
    return 'Tire slip angle exceeds 0.25 rad. Reduce entry speed and steering.';
  return '';
}
