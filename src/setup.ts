export type Package = 'balanced' | 'lowDrag' | 'highAero' | 'pro';
export type Compound = 'soft' | 'medium' | 'hard' | 'inter';
export interface Setup {
  name: string;
  drag: number;
  downforce: number;
  power: number;
  frontBalance: number;
  brakeBias: number;
}
export const packages: Record<Package, Setup> = {
  balanced: {
    name: 'Stage 1 Balanced',
    drag: 0.95,
    downforce: 3.3,
    power: 470000,
    frontBalance: 0.46,
    brakeBias: 0.56,
  },
  lowDrag: {
    name: 'Monza Low-Drag',
    drag: 0.7,
    downforce: 2.2,
    power: 470000,
    frontBalance: 0.46,
    brakeBias: 0.56,
  },
  highAero: {
    name: 'Monaco High-Aero',
    drag: 1.2,
    downforce: 4.6,
    power: 470000,
    frontBalance: 0.48,
    brakeBias: 0.57,
  },
  pro: {
    name: 'Apex Mk.II Pro',
    drag: 1.02,
    downforce: 3.9,
    power: 490000,
    frontBalance: 0.47,
    brakeBias: 0.55,
  },
};
export const compounds: Record<
  Compound,
  { name: string; grip: number; wear: number; optimal: number; color: number; wet: number }
> = {
  soft: { name: 'Soft C5', grip: 1.48, wear: 0.000042, optimal: 90, color: 0xed483c, wet: 0.45 },
  medium: { name: 'Medium C3', grip: 1.4, wear: 0.000027, optimal: 85, color: 0xe9ca36, wet: 0.48 },
  hard: { name: 'Hard C1', grip: 1.32, wear: 0.000018, optimal: 80, color: 0xe4e9ec, wet: 0.5 },
  inter: {
    name: 'Intermediate',
    grip: 1.12,
    wear: 0.000035,
    optimal: 65,
    color: 0x64c47f,
    wet: 0.86,
  },
};
