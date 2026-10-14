import { angle, clamp } from './math';
import { type Track, track } from './track';
import { pit } from './pit';
import { packages, compounds, type Setup, type Compound } from './setup';
export interface Input {
  throttle: number;
  brake: number;
  steer: number;
  reverse: boolean;
  ers: boolean;
  drs: boolean;
}
export const idleInput = (): Input => ({
  throttle: 0,
  brake: 0,
  steer: 0,
  reverse: false,
  ers: false,
  drs: false,
});
export interface Tire {
  temperature: number;
  wear: number;
  normal: number;
  lateral: number;
  longitudinal: number;
  slipAngle: number;
  slipDemand: number;
}
export interface Car {
  id: number;
  name: string;
  color: number;
  x: number;
  z: number;
  heading: number;
  vx: number;
  vz: number;
  speed: number;
  steer: number;
  gear: number;
  rpm: number;
  distance: number;
  offset: number;
  surface: string;
  contacts: number;
  lastImpact: number;
  input: Input;
  yawRate: number;
  ax: number;
  ay: number;
  setup: Setup;
  compound: Compound;
  tires: Tire[];
  battery: number;
  ersActive: boolean;
  drsActive: boolean;
  wetness: number;
  damage: number;
}
export function makeCar(id = 0, s = 0, offset = 0): Car {
  const p = track.at(s, offset);
  return {
    id,
    name: id ? 'Rival ' + id : 'YOU',
    color: 0xf04436,
    x: p.x,
    z: p.z,
    heading: p.heading,
    vx: 0,
    vz: 0,
    speed: 0,
    steer: 0,
    gear: 1,
    rpm: 4000,
    distance: p.s,
    offset,
    surface: 'asphalt',
    contacts: 0,
    lastImpact: 0,
    input: idleInput(),
    yawRate: 0,
    ax: 0,
    ay: 0,
    setup: { ...packages.balanced },
    compound: 'medium',
    tires: Array.from({ length: 4 }, () => ({
      temperature: 80,
      wear: 0,
      normal: 0,
      lateral: 0,
      longitudinal: 0,
      slipAngle: 0,
      slipDemand: 0,
    })),
    battery: 4000000,
    ersActive: false,
    drsActive: false,
    wetness: 0,
    damage: 0,
  };
}
export function recover(car: Car, t: Track = track) {
  const p = t.at(Number.isFinite(car.distance) ? car.distance : 0);
  Object.assign(car, {
    x: p.x,
    z: p.z,
    heading: p.heading,
    vx: 0,
    vz: 0,
    speed: 0,
    steer: 0,
    yawRate: 0,
    ax: 0,
    ay: 0,
  });
}
const MASS = 800,
  INERTIA = 1450,
  RHO = 1.225,
  AREA = 1.5,
  LF = 1.7,
  LR = 1.6;
const ratios = [0, 3.1, 2.4, 1.9, 1.58, 1.34, 1.17, 1.04, 0.92];
export function aero(c: Car, speed: number, drs = c.drsActive) {
  const q = 0.5 * RHO * speed * speed * AREA;
  return {
    drag: q * c.setup.drag * (drs ? 0.72 : 1),
    downforce: q * c.setup.downforce * (drs ? 0.76 : 1) * (1 - c.damage * 0.55),
  };
}
export function stepCar(c: Car, input: Input, dt: number, t: Track = track) {
  if (!(dt > 0 && dt <= 0.05)) return;
  if (dt > 1 / 120 + 0.00001) {
    const n = Math.ceil(dt * 120);
    for (let i = 0; i < n; i++) stepCar(c, input, dt / n, t);
    return;
  }
  if (
    ![
      c.x,
      c.z,
      c.heading,
      c.vx,
      c.vz,
      c.yawRate,
      c.battery,
      c.damage,
      c.wetness,
      ...c.tires.flatMap((t) => [t.temperature, t.wear]),
    ].every(Number.isFinite)
  ) {
    recover(c, t);
    c.battery = 4000000;
    c.damage = 0;
    c.wetness = 0;
    c.tires = makeCar().tires;
    return;
  }
  c.input = {
    throttle: clamp(Number.isFinite(input.throttle) ? input.throttle : 0, 0, 1),
    brake: clamp(Number.isFinite(input.brake) ? input.brake : 0, 0, 1),
    steer: clamp(Number.isFinite(input.steer) ? input.steer : 0, -1, 1),
    reverse: input.reverse,
    ers: input.ers,
    drs: input.drs,
  };
  input = c.input;
  const p = t.project(c);
  c.distance = p.s;
  c.offset = p.offset;
  c.surface = pit.contains(p.s, p.offset) ? 'asphalt' : t.surface(p.offset);
  c.lastImpact = 0;
  const sn = Math.sin(c.heading),
    cs = Math.cos(c.heading);
  let u = c.vx * sn + c.vz * cs,
    v = c.vx * cs - c.vz * sn;
  const speed = Math.abs(u),
    road = c.surface === 'asphalt' || c.surface === 'kerb';
  c.steer += ((input.steer * 0.48) / (1 + speed * 0.028) - c.steer) * Math.min(1, dt * 9);
  c.drsActive =
    input.drs &&
    speed > 25 &&
    Math.abs(p.curvature) < 0.0025 &&
    Math.abs(p.offset) < 8 &&
    input.brake < 0.1 &&
    c.wetness < 0.25;
  c.ersActive = input.ers && input.throttle > 0.1 && c.battery > 1000 && !input.reverse;
  const boost = c.ersActive ? 120000 : 0;
  c.battery = clamp(c.battery - boost * dt, 0, 4000000);
  const wheelRpm = ((speed / 0.38) * 60) / (2 * Math.PI);
  c.rpm = clamp(wheelRpm * ratios[c.gear] * 6.4, 4000, 13500);
  if (c.rpm > 12100 && c.gear < 8) c.gear++;
  else if (c.rpm < 7200 && c.gear > 1) c.gear--;
  c.rpm = clamp(wheelRpm * ratios[c.gear] * 6.4, 4000, 13500);
  const power =
    c.setup.power * (0.65 + 0.35 * Math.sin(clamp((c.rpm - 4000) / 9500, 0, 1) * Math.PI * 0.85));
  const engine = input.reverse
    ? u > -8
      ? -MASS * 5
      : 0
    : input.throttle *
      Math.min(13000, (power + boost) / Math.max(15, speed)) *
      (c.rpm >= 13450 ? 0 : 1);
  const drag = aero(c, speed);
  const totalLoad = MASS * 9.81 + drag.downforce;
  const frontStatic =
    (MASS * 9.81 * LR) / (LF + LR) + drag.downforce * c.setup.frontBalance * (1 - c.damage * 0.35);
  const frontLoad = clamp(
    frontStatic - (MASS * c.ax * 0.32) / (LF + LR),
    totalLoad * 0.18,
    totalLoad * 0.8,
  );
  const rearLoad = totalLoad - frontLoad;
  const transfer = clamp((MASS * c.ay * 0.32) / 1.85, -totalLoad * 0.22, totalLoad * 0.22);
  const compound = compounds[c.compound];
  let fx = 0,
    fy = 0,
    moment = 0;
  for (let i = 0; i < 4; i++) {
    const front = i < 2,
      side = i % 2 === 0 ? -1 : 1,
      tire = c.tires[i],
      normal = Math.max(150, (front ? frontLoad : rearLoad) * 0.5 + side * transfer * 0.5);
    tire.normal = normal;
    const tempGrip = clamp(1 - Math.abs(tire.temperature - compound.optimal) * 0.0035, 0.67, 1),
      mu =
        compound.grip *
        tempGrip *
        (1 - tire.wear * 0.4) *
        (1 - c.wetness * (1 - compound.wet)) *
        (road ? 1 : 0.38);
    const alpha =
      (front ? c.steer : 0) - Math.atan2(v + c.yawRate * (front ? LF : -LR), Math.max(3, speed));
    tire.slipAngle = alpha;
    const lateral = mu * normal * Math.tanh(alpha * 6.5);
    const brake =
      input.brake *
      MASS *
      20 *
      (front ? c.setup.brakeBias : 1 - c.setup.brakeBias) *
      0.5 *
      Math.sign(u);
    const tractionReserve = Math.sqrt(Math.max(0, (mu * normal) ** 2 - lateral * lateral));
    // Default traction assist reduces drive demand before the combined-force limit.
    const drive = front ? 0 : clamp(engine * 0.5, -tractionReserve, tractionReserve);
    const longitudinal = drive - brake - (input.throttle < 0.1 ? Math.sign(u) * 120 : 0);
    const limit = mu * normal;
    const scale = Math.min(1, limit / Math.max(1, Math.hypot(lateral, longitudinal)));
    const tx = longitudinal * scale,
      ty = lateral * scale;
    tire.longitudinal = tx;
    tire.lateral = ty;
    tire.slipDemand = Math.max(0, Math.abs(longitudinal) / Math.max(1, limit) - 1);
    const steer = front ? c.steer : 0;
    fx += tx * Math.cos(steer) - ty * Math.sin(steer);
    fy += ty * Math.cos(steer) + tx * Math.sin(steer);
    moment += (ty * Math.cos(steer) + tx * Math.sin(steer)) * (front ? LF : -LR);
    const heat =
      Math.abs(ty * speed * Math.sin(alpha)) * 0.00017 +
      Math.abs(tx) * speed * 0.000008 +
      input.brake * 0.8;
    tire.temperature = clamp(
      tire.temperature +
        (heat - (tire.temperature - (25 - c.wetness * 5)) * (0.013 + c.wetness * 0.03)) * dt,
      20,
      155,
    );
    tire.wear = clamp(
      tire.wear +
        compound.wear *
          (speed / 35) *
          (1 + Math.abs(alpha) * 5 + tire.slipDemand) *
          (tire.temperature > 110 ? 1.8 : 1) *
          dt,
      0,
      1,
    );
  }
  const brakingForce =
    input.brake > 0
      ? Math.max(0, -Math.sign(u) * c.tires.reduce((sum, t) => sum + t.longitudinal, 0))
      : 0;
  c.battery = clamp(c.battery + Math.min(55000, brakingForce * speed * 0.6) * dt, 0, 4000000);
  fx -= Math.sign(u) * (drag.drag + (road ? 90 : 300 + speed * 25));
  if (input.throttle === 0 && !input.reverse && speed < 0.5) fx = (-u * MASS) / dt;
  c.ax = clamp(fx / MASS, -25, 25);
  c.ay = fy / MASS;
  // Forces are applied in world axes; rotation does not directly rotate velocity.
  c.vx += ((sn * fx + cs * fy) / MASS) * dt;
  c.vz += ((cs * fx - sn * fy) / MASS) * dt;
  c.yawRate = clamp(c.yawRate + (moment / INERTIA - c.yawRate * 1.2) * dt, -2.5, 2.5);
  if (speed < 2)
    c.yawRate += ((u * Math.tan(c.steer)) / (LF + LR) - c.yawRate) * Math.min(1, dt * 12);
  // Stable reverse uses low-speed bicycle yaw with tire lateral damping.
  if (u < 0) {
    c.yawRate = (u * Math.tan(c.steer)) / (LF + LR);
    c.vx -= cs * v * Math.min(1, dt * 6);
    c.vz += sn * v * Math.min(1, dt * 6);
  }
  c.heading = angle(c.heading + c.yawRate * dt);
  c.x += c.vx * dt;
  c.z += c.vz * dt;
  c.speed = c.vx * Math.sin(c.heading) + c.vz * Math.cos(c.heading);
  if (Math.abs(p.offset) > t.boundary) {
    const side = Math.sign(p.offset),
      nx = Math.cos(p.heading) * side,
      nz = -Math.sin(p.heading) * side,
      impact = c.vx * nx + c.vz * nz,
      q = t.at(p.s, side * (t.boundary - 0.2));
    c.x = q.x;
    c.z = q.z;
    if (impact > 0) {
      c.vx -= nx * impact * 1.2;
      c.vz -= nz * impact * 1.2;
      c.lastImpact = impact;
      c.contacts++;
    }
    c.yawRate *= 0.8;
  }
  if (![c.x, c.z, c.heading, c.vx, c.vz, c.yawRate].every(Number.isFinite)) recover(c, t);
}
