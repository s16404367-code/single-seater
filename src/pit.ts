import { clamp } from './math';
import { track } from './track';
export const pit = {
  entry: track.length - 150,
  exit: 210,
  boxStart: 30,
  speed: 22.22,
  width: 5,
  offset(s: number) {
    if (s > track.length - 150) return -15 * clamp((s - (track.length - 150)) / 80, 0, 1);
    if (s < 150) return -15;
    return -15 * clamp((210 - s) / 60, 0, 1);
  },
  contains(s: number, o: number) {
    return (s > track.length - 130 || s < 195) && Math.abs(o - this.offset(s)) < 2.6 && o < -10;
  },
};
