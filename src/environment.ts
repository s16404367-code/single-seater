import { clamp } from './math';
import type { Car } from './physics';
export type WeatherMode = 'sunny' | 'dusk' | 'night' | 'rain';
export class Environment {
  wetness = 0;
  rain = 0;
  mode: WeatherMode = 'sunny';
  set(mode: WeatherMode) {
    this.mode = mode;
    this.rain = mode === 'rain' ? 0.85 : 0;
    this.wetness = mode === 'rain' ? 0.35 : 0;
  }
  step(dt: number) {
    this.wetness = clamp(this.wetness + (this.rain * 0.004 - (1 - this.rain) * 0.001) * dt, 0, 1);
  }
  apply(c: Car) {
    c.wetness = this.wetness;
  }
}
export function applyDamage(c: Car) {
  if (c.lastImpact > 8) c.damage = clamp(c.damage + (c.lastImpact - 8) * 0.006, 0, 1);
}
