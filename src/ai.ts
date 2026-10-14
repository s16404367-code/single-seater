import { angle, clamp, mod, lerp } from './math';
import { track } from './track';
import { type Car, idleInput, type Input } from './physics';
export type Difficulty = 'Rookie' | 'Amateur' | 'Pro' | 'Expert' | 'Alien';
export const skills: Record<Difficulty, { grip: number; reaction: number; consistency: number }> = {
  Rookie: { grip: 5.6, reaction: 0.25, consistency: 0.12 },
  Amateur: { grip: 6.5, reaction: 0.18, consistency: 0.08 },
  Pro: { grip: 7.5, reaction: 0.12, consistency: 0.05 },
  Expert: { grip: 8.5, reaction: 0.08, consistency: 0.03 },
  Alien: { grip: 9, reaction: 0.06, consistency: 0.01 },
};
export class Driver {
  lane = 0;
  desiredLane = 0;
  decision = 0;
  input = idleInput();
  pace = 60;
  stuck = 0;
  reverseFor = 0;
  passes = 0;
  passTarget = -1;
  attempts = 0;
  recoveries = 0;
  offTrack = 0;
  lastS = 0;
  state = 'racing';
  constructor(
    public id: number,
    public difficulty: Difficulty = 'Pro',
  ) {}
  update(c: Car, cars: Car[], dt: number, time: number, allowPassing = true): Input {
    const p = track.project(c),
      skill = skills[this.difficulty],
      speed = Math.abs(c.speed);
    if (Math.abs(p.offset) > 10) this.offTrack += dt;
    if (speed < 1.5 && time > 9) this.stuck += dt;
    else this.stuck = 0;
    if (this.stuck > 2.5 && this.reverseFor <= 0) {
      this.reverseFor = 1.6;
      this.stuck = 0;
      this.recoveries++;
    }
    if (this.reverseFor > 0) {
      this.reverseFor -= dt;
      this.state = 'recovering';
      return { ...idleInput(), reverse: true, steer: -Math.sign(angle(p.heading - c.heading)) };
    }
    if (!allowPassing) {
      this.desiredLane = 0;
      this.passTarget = -1;
    }
    this.decision -= dt;
    if (this.decision <= 0) {
      this.decision = skill.reaction;
      this.desiredLane = this.passTarget >= 0 ? this.desiredLane : 0;
      this.state = 'racing';
      let ahead: Car | undefined,
        near = Infinity;
      for (const other of cars) {
        if (other.id === c.id) continue;
        const diff = mod(other.distance - p.s + track.length / 2, track.length) - track.length / 2;
        if (diff > 0 && diff < 55 && diff < near) {
          ahead = other;
          near = diff;
        }
      }
      if (
        allowPassing &&
        ahead &&
        near < 48 &&
        (c.speed > ahead.speed + 0.5 || near < 22) &&
        Math.abs(p.curvature) < 0.008
      ) {
        const side =
            this.passTarget === ahead.id
              ? Math.sign(this.desiredLane) || 1
              : ahead.offset >= 0
                ? -1
                : 1,
          lane = side * 3.6,
          blocked = cars.some(
            (o) =>
              o.id !== c.id &&
              o.id !== ahead!.id &&
              Math.abs(mod(o.distance - p.s + track.length / 2, track.length) - track.length / 2) <
                16 &&
              Math.abs(o.offset - lane) < 2.8,
          );
        if (!blocked) {
          this.desiredLane = lane;
          this.state = 'passing';
          if (this.passTarget !== ahead.id) {
            this.passTarget = ahead.id;
            this.attempts++;
          }
        }
      }
      if (allowPassing && !ahead && Math.abs(p.curvature) < 0.008) {
        const behind = cars.find(
          (o) =>
            o.id !== c.id && mod(p.s - o.distance, track.length) < 22 && o.speed > c.speed + 0.5,
        );
        if (behind) {
          this.desiredLane = clamp(behind.offset, -1.5, 1.5);
          this.state = 'defending';
        }
      }
      if (this.passTarget >= 0) {
        const target = cars.find((o) => o.id === this.passTarget);
        if (target && mod(p.s - target.distance, track.length) < 15) {
          this.passes++;
          this.passTarget = -1;
          this.desiredLane = 0;
        }
      }
      const variation =
        1 - skill.consistency * (0.5 + 0.5 * Math.sin(time * 0.37 + this.id * 2.31));
      let target = 76;
      for (let d = 0; d <= 180; d += 10) {
        const k = Math.abs(track.at(p.s + d).curvature);
        const corner = Math.sqrt(
          (skill.grip * variation * (1 - c.wetness * 0.57) * (1 - c.tires[0].wear * 0.4)) /
            Math.max(0.001, k),
        );
        target = Math.min(target, Math.sqrt(corner * corner + 2 * 6.5 * d));
      }
      if (Math.abs(p.offset) > 9) target = Math.min(target, 18);
      if (Math.abs(angle(p.heading - c.heading)) > 1) target = Math.min(target, 9);
      if (ahead && Math.abs(this.lane - ahead.offset) < 2.8 && near < 30)
        target = Math.min(target, Math.max(0, ahead.speed + (near - 12) * 0.6));
      this.pace = target;
    }
    this.lane = lerp(this.lane, this.desiredLane, Math.min(1, dt * 1.4));
    const look = 12 + speed * 0.45,
      target = track.at(p.s + look, this.lane),
      error = angle(Math.atan2(target.x - c.x, target.z - c.z) - c.heading),
      steer = clamp(
        Math.atan(
          (2 * 3.3 * Math.sin(error)) / Math.max(3, Math.hypot(target.x - c.x, target.z - c.z)),
        ) /
          (0.48 / (1 + speed * 0.028)),
        -1,
        1,
      );
    this.input = {
      ...idleInput(),
      steer,
      throttle: clamp((this.pace - c.speed) * 0.45, 0, 1),
      brake: clamp((c.speed - this.pace) * 0.32, 0, 1),
    };
    return this.input;
  }
}
