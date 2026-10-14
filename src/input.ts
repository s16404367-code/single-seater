import { idleInput, type Input } from './physics';
import { clamp } from './math';
import { load, save } from './storage';
export const defaults = {
  throttle: 'KeyW',
  brake: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
  reverse: 'KeyX',
  ers: 'Space',
  drs: 'KeyF',
  camera: 'KeyC',
  recover: 'KeyR',
  pause: 'Escape',
  mute: 'KeyM',
  pit: 'KeyP',
  limiter: 'KeyL',
};
export type Action = keyof typeof defaults;
const aliases: Partial<Record<Action, string[]>> = {
  throttle: ['ArrowUp'],
  brake: ['ArrowDown'],
  left: ['ArrowLeft'],
  right: ['ArrowRight'],
  ers: ['ShiftLeft', 'ShiftRight'],
};
export function validBindings(x: unknown): x is typeof defaults {
  return (
    !!x &&
    typeof x === 'object' &&
    Object.keys(x).length === Object.keys(defaults).length &&
    (Object.keys(defaults) as Action[]).every(
      (a) =>
        !(Object.keys(aliases) as Action[]).some(
          (b) => a !== b && aliases[b]?.includes((x as typeof defaults)[a]),
        ),
    ) &&
    Object.keys(defaults).every(
      (k) =>
        typeof (x as Record<string, unknown>)[k] === 'string' &&
        /^(Key[A-Z]|Digit[0-9]|Space|Escape|Arrow(Up|Down|Left|Right))$/.test(
          (x as Record<string, string>)[k],
        ),
    ) &&
    new Set(Object.values(x)).size === Object.keys(defaults).length
  );
}
export function gamepadInput(pad: Pick<Gamepad, 'axes' | 'buttons'>, deadzone: number): Input {
  const v = pad.axes[0] ?? 0,
    steer = Math.abs(v) > deadzone ? (Math.sign(v) * (Math.abs(v) - deadzone)) / (1 - deadzone) : 0;
  return {
    ...idleInput(),
    steer: clamp(steer, -1, 1),
    throttle: clamp(pad.buttons[7]?.value ?? 0, 0, 1),
    brake: clamp(pad.buttons[6]?.value ?? 0, 0, 1),
    ers: !!pad.buttons[0]?.pressed,
    drs: !!pad.buttons[5]?.pressed,
    reverse: !!pad.buttons[1]?.pressed,
  };
}
export class Controls {
  keys = new Set<string>();
  touch = idleInput();
  mapping = { ...defaults };
  deadzone = 0.12;
  gamepad = true;
  onAction: (key: string) => void = () => {};
  capture?: { action: Action; done: (message: string) => void };
  lastPadPause = false;
  constructor() {
    const raw = load<unknown>('bindings', null);
    if (validBindings(raw)) this.mapping = raw;
    window.addEventListener('keydown', (e) => {
      if (this.capture) {
        e.preventDefault();
        const { action, done } = this.capture;
        this.capture = undefined;
        if (e.code === 'Escape' && action !== 'pause') {
          done('Cancelled');
          return;
        }
        const conflict = (Object.keys(this.mapping) as Action[]).find(
          (k) => k !== action && (this.mapping[k] === e.code || aliases[k]?.includes(e.code)),
        );
        if (conflict) {
          done('Already used by ' + conflict);
          return;
        }
        const next = { ...this.mapping, [action]: e.code };
        if (!validBindings(next)) {
          done('Use a letter, number, arrow or Space.');
          return;
        }
        this.mapping = next;
        save('bindings', next);
        done('Saved');
        return;
      }
      if ((e.target as HTMLElement).matches('input,select,textarea,button') && e.code !== 'Escape')
        return;
      const actions = (Object.keys(this.mapping) as Action[]).filter(
        (a) => this.mapping[a] === e.code || aliases[a]?.includes(e.code),
      );
      if (actions.length) e.preventDefault();
      if (!e.repeat) for (const a of actions) this.onAction(defaults[a]);
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.clear());
  }
  clear() {
    this.keys.clear();
    this.touch = idleInput();
  }
  read(): Input {
    const has = (a: Action) =>
      this.keys.has(this.mapping[a]) || aliases[a]?.some((k) => this.keys.has(k));
    let input: Input = {
      throttle: has('throttle') ? 1 : 0,
      brake: has('brake') ? 1 : 0,
      steer: (has('right') ? 1 : 0) - (has('left') ? 1 : 0),
      reverse: !!has('reverse'),
      ers: !!has('ers'),
      drs: !!has('drs'),
    };
    try {
      const pad = this.gamepad
        ? navigator.getGamepads?.().find((p) => p?.connected && p.mapping === 'standard')
        : undefined;
      if (pad) {
        const p = gamepadInput(pad, this.deadzone);
        input = {
          throttle: Math.max(input.throttle, p.throttle),
          brake: Math.max(input.brake, p.brake),
          steer: Math.abs(input.steer) > Math.abs(p.steer) ? input.steer : p.steer,
          reverse: input.reverse || p.reverse,
          ers: input.ers || p.ers,
          drs: input.drs || p.drs,
        };
        const pause = !!pad.buttons[9]?.pressed;
        if (pause && !this.lastPadPause) this.onAction('Escape');
        this.lastPadPause = pause;
      } else this.lastPadPause = false;
    } catch {
      /* Keyboard remains available. */
    }
    return {
      ...input,
      throttle: Math.max(input.throttle, this.touch.throttle),
      brake: Math.max(input.brake, this.touch.brake),
      steer: this.touch.steer || input.steer,
      ers: input.ers || this.touch.ers,
      drs: input.drs || this.touch.drs,
    };
  }
}
