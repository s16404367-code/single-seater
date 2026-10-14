import { load, save } from './storage';
import { angle, lerp } from './math';
import type { LapRecord, Sample } from './telemetry';
export const scoring = [25, 18, 15, 12, 10, 8, 6, 4, 2];
export const rounds = [
  { name: 'Valley Sprint', weather: 'sunny' },
  { name: 'Golden Hour', weather: 'dusk' },
  { name: 'Rain Masters', weather: 'rain' },
] as const;
export interface Season {
  version: 1;
  id: string;
  results: { id: string; order: number[]; finishers: number[] }[];
}
export function seasonValid(x: unknown): x is Season {
  if (!x || typeof x !== 'object') return false;
  const s = x as Season;
  return (
    s.version === 1 &&
    typeof s.id === 'string' &&
    s.id.length < 80 &&
    Array.isArray(s.results) &&
    s.results.length <= 3 &&
    s.results.every((r) => r && typeof r === 'object') &&
    new Set(s.results.map((r) => r.id)).size === s.results.length &&
    s.results.every(
      (r) =>
        typeof r.id === 'string' &&
        Array.isArray(r.order) &&
        r.order.length <= 9 &&
        new Set(r.order).size === r.order.length &&
        r.order.every((i) => Number.isInteger(i) && i >= 0 && i <= 8) &&
        Array.isArray(r.finishers) &&
        r.finishers.every((i) => r.order.includes(i)),
    )
  );
}
export class Championship {
  season: Season;
  storageAvailable = true;
  constructor() {
    const raw = load<unknown>('championship', null);
    this.season = seasonValid(raw) ? raw : this.fresh();
  }
  fresh(): Season {
    return {
      version: 1,
      id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
      results: [],
    };
  }
  get round() {
    return this.season.results.length;
  }
  newSeason() {
    this.season = this.fresh();
    this.storageAvailable = save('championship', this.season);
  }
  record(id: string, order: number[], finishers: number[]) {
    if (this.round >= 3 || this.season.results.some((r) => r.id === id)) return false;
    this.season.results.push({ id, order: [...order], finishers: [...finishers] });
    this.storageAvailable = save('championship', this.season);
    return true;
  }
  get table() {
    return Array.from({ length: 9 }, (_, id) => {
      const finishes = this.season.results.map((r) =>
        r.finishers.includes(id) ? r.order.indexOf(id) : 99,
      );
      return { id, points: finishes.reduce((a, p) => a + (scoring[p] ?? 0), 0), finishes };
    }).sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points;
      for (let p = 0; p < 9; p++) {
        const difference =
          b.finishes.filter((f) => f === p).length - a.finishes.filter((f) => f === p).length;
        if (difference) return difference;
      }
      return a.id - b.id;
    });
  }
  get teams() {
    return Array.from({ length: 5 }, (_, id) => ({
      id,
      points: this.table
        .filter((r) => Math.floor(r.id / 2) === id)
        .reduce((a, r) => a + r.points, 0),
    })).sort((a, b) => b.points - a.points || a.id - b.id);
  }
}
export function ghostAt(record: LapRecord | undefined, time: number): Sample | undefined {
  if (!record || time < 0 || time > record.time) return;
  const samples = record.samples;
  const i = samples.findIndex((p) => p.t >= time);
  if (i === 0) return { ...samples[0] };
  if (i < 0) return { ...samples[samples.length - 1] };
  const a = samples[i - 1],
    b = samples[i],
    f = (time - a.t) / (b.t - a.t || 1);
  return {
    ...a,
    t: time,
    x: lerp(a.x, b.x, f),
    z: lerp(a.z, b.z, f),
    heading: a.heading + angle(b.heading - a.heading) * f,
    s: lerp(a.s, b.s, f),
  };
}
export function clearSaves() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith('apex:')) localStorage.removeItem(key);
    }
    return true;
  } catch {
    return false;
  }
}
