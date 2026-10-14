import './style.css';
import { Telemetry } from './telemetry';
import { Race } from './race';
import { World, type Quality } from './world';
import { ghostAt, clearSaves } from './progression';
import { Controls, type Action } from './input';
import { EngineAudio } from './audio';
import { el, updateHUD, updateRacingHUD, showResults, drawTelemetry } from './ui';
import type { WeatherMode } from './environment';
import type { Package, Compound } from './setup';
import type { Difficulty } from './ai';
import { load, save } from './storage';
declare const __BUILD__: { revision: string; sourceHash: string; builtAt: string; dirty: boolean };
const race = new Race(),
  controls = new Controls(),
  audio = new EngineAudio();
let world: World;
let mode: 'practice' | 'race' | 'qualifying' | 'weekend' | 'timeTrial' | 'hotlap' | 'championship' =
  'practice';
let previous = performance.now(),
  accumulator = 0,
  uiTime = 0;
el('build-id').textContent =
  `BUILD ${__BUILD__.sourceHash.slice(0, 8)} / ${__BUILD__.revision}${__BUILD__.dirty ? ' + LOCAL CHANGES' : ''}`;
function showState() {
  if (race.state === 'menu' && world)
    world.setWeather(el<HTMLSelectElement>('weather').value as WeatherMode);
  if (race.state === 'driving' || race.state === 'countdown')
    (document.activeElement as HTMLElement)?.blur();
  el('menu').hidden = race.state !== 'menu';
  el('hud').hidden = race.state === 'menu';
  el('pause').hidden = race.state !== 'paused';
  el('session-label').textContent = race.state === 'menu' ? 'PADDOCK' : 'ON TRACK';
}
function start() {
  audio.start();
  controls.clear();
  race.start({
    mode,
    opponents: Number(el<HTMLSelectElement>('opponents').value) as 3 | 5 | 8,
    laps: Number(el<HTMLSelectElement>('laps').value),
    difficulty: el<HTMLSelectElement>('difficulty').value as Difficulty,
    package: el<HTMLSelectElement>('package').value as Package,
    compound: el<HTMLSelectElement>('compound').value as Compound,
    livery: Number(el<HTMLSelectElement>('livery').value),
    weather: el<HTMLSelectElement>('weather').value as WeatherMode,
    aeroTrim: Number(el<HTMLInputElement>('aero-trim').value) / 100,
    brakeBias: Number(el<HTMLInputElement>('brake-bias').value) / 100,
  });
  race.control.rules[0].compound = el<HTMLSelectElement>('pit-compound').value as Compound;
  world.setCars(race.cars);
  world.setWeather(race.options.weather);
  showState();
  el('start').blur();
}
function setQuality(q: string) {
  if (!['low', 'medium', 'high'].includes(q)) q = 'medium';
  world.setQuality(q as Quality);
  el<HTMLSelectElement>('quality').value = q;
  el<HTMLSelectElement>('settings-quality').value = q;
  save('quality', q);
}
window.addEventListener('error', (event) => {
  race.state = 'paused';
  controls.clear();
  el('error').hidden = false;
  el('error').textContent =
    'The session stopped safely after an unexpected error. Reload to try again. ' + event.message;
});
try {
  if (import.meta.env.PROD)
    fetch(import.meta.env.BASE_URL + 'build-manifest.json', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('Manifest unavailable');
        return r.json();
      })
      .then((m) => {
        el('build-id').textContent +=
          m.sourceHash === __BUILD__.sourceHash && m.revision === __BUILD__.revision
            ? ' / ARTIFACT MATCH'
            : ' / BUILD MISMATCH — RELOAD';
      })
      .catch(() => {
        el('build-id').textContent += ' / MANIFEST UNVERIFIED';
      });
  world = new World(el('scene'));
  world.setCars(race.cars);
  setQuality(load('quality', 'high'));
  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(
    (button) =>
      (button.onclick = () => {
        mode = button.dataset.mode as typeof mode;
        document
          .querySelectorAll('[data-mode]')
          .forEach((b) => b.classList.toggle('selected', b === button));
        el('race-options').hidden = !['race', 'weekend', 'championship'].includes(mode);
        el('mode-description').textContent =
          mode === 'championship'
            ? '3 rounds at Apex Valley: day, dusk, rain. Local championship resumes here.'
            : mode === 'weekend'
              ? '90s practice → 3-minute qualifying → race.'
              : mode === 'hotlap'
                ? 'One flying lap. Track limits invalidate your result.'
                : mode === 'timeTrial'
                  ? 'Unlimited solo laps. Race your local best-lap ghost.'
                  : mode === 'race'
                    ? 'Choose your grid, difficulty and race distance.'
                    : 'Learn the circuit. No session time limit.';
      }),
  );
  el('next-session').onclick = () => {
    if (race.options.mode === 'championship') race.start();
    else race.nextSession();
    world.setCars(race.cars);
    world.setWeather(race.options.weather);
    el('results').hidden = true;
    showState();
  };
  el('results-exit').onclick = () => {
    race.state = 'menu';
    el('results').hidden = true;
    showState();
  };

  const savedTrim = load<unknown>('trim', {});
  if (savedTrim && typeof savedTrim === 'object') {
    const v = savedTrim as { aero?: number; bias?: number };
    if (typeof v.aero === 'number' && v.aero >= 80 && v.aero <= 120)
      el<HTMLInputElement>('aero-trim').value = String(v.aero);
    if (typeof v.bias === 'number' && v.bias >= 48 && v.bias <= 64)
      el<HTMLInputElement>('brake-bias').value = String(v.bias);
  }
  function trimLabels() {
    el('aero-value').textContent = el<HTMLInputElement>('aero-trim').value + '%';
    el('bias-value').textContent = el<HTMLInputElement>('brake-bias').value + '%';
  }
  trimLabels();
  el('aero-trim').oninput = trimLabels;
  el('brake-bias').oninput = trimLabels;
  el('garage-reset').onclick = () => {
    el<HTMLInputElement>('aero-trim').value = '100';
    el<HTMLInputElement>('brake-bias').value = '56';
    trimLabels();
  };
  for (const name of ['garage', 'telemetry']) {
    let resume = false;
    el(name + '-open').onclick = () => {
      resume = race.state === 'driving' || race.state === 'countdown';
      if (resume) race.pause();
      controls.clear();
      showState();
      el(name).hidden = false;
      if (name === 'telemetry') drawTelemetry(race);
    };
    el(name + '-close').onclick = () => {
      if (name === 'garage')
        save('trim', {
          aero: Number(el<HTMLInputElement>('aero-trim').value),
          bias: Number(el<HTMLInputElement>('brake-bias').value),
        });
      el(name).hidden = true;
      if (resume) race.pause();
      showState();
    };
  }

  const prefs = load<Record<string, unknown>>('preferences', {});
  const prefIds = [
    'ghost-enabled',
    'engineer-enabled',
    'high-contrast',
    'color-friendly',
    'reduced-motion',
    'touch-enabled',
    'gamepad-enabled',
  ];
  function preferences() {
    document.body.classList.toggle('high-contrast', el<HTMLInputElement>('high-contrast').checked);
    document.body.classList.toggle(
      'color-friendly',
      el<HTMLInputElement>('color-friendly').checked,
    );
    world.reducedMotion = el<HTMLInputElement>('reduced-motion').checked;
    controls.gamepad = el<HTMLInputElement>('gamepad-enabled').checked;
    el('touch-controls').hidden = !el<HTMLInputElement>('touch-enabled').checked;
    document.body.classList.toggle('touch-active', el<HTMLInputElement>('touch-enabled').checked);
    el('hud').style.setProperty('--hud-scale', el<HTMLSelectElement>('hud-scale').value);
    const value = Object.fromEntries(prefIds.map((id) => [id, el<HTMLInputElement>(id).checked]));
    save('preferences', {
      ...value,
      scale: el<HTMLSelectElement>('hud-scale').value,
      volume: el<HTMLInputElement>('volume').value,
      muted: audio.muted,
      deadzone: controls.deadzone,
    });
  }
  for (const id of prefIds) {
    if (prefs && typeof prefs[id] === 'boolean')
      el<HTMLInputElement>(id).checked = prefs[id] as boolean;
    el(id).addEventListener('change', preferences);
  }
  if (prefs?.scale === '1.15') el<HTMLSelectElement>('hud-scale').value = '1.15';
  el('hud-scale').onchange = preferences;
  if (
    prefs &&
    typeof prefs.volume === 'string' &&
    Number(prefs.volume) >= 0 &&
    Number(prefs.volume) <= 100
  )
    el<HTMLInputElement>('volume').value = prefs.volume;
  audio.volume = (Number(el<HTMLInputElement>('volume').value) / 100) * 0.35;
  audio.muted = prefs?.muted === true;
  el('sound').textContent = audio.muted ? 'SOUND OFF' : 'SOUND ON';
  if (typeof prefs?.deadzone === 'number' && prefs.deadzone >= 0.05 && prefs.deadzone <= 0.35) {
    controls.deadzone = prefs.deadzone;
    el<HTMLInputElement>('deadzone').value = String(controls.deadzone * 100);
  }
  preferences();
  el('deadzone').oninput = (e) => {
    controls.deadzone = Number((e.target as HTMLInputElement).value) / 100;
    preferences();
  };
  document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((button) => {
    const action = button.dataset.action as Action;
    button.textContent = controls.mapping[action];
    button.onclick = () => {
      controls.clear();
      el('binding-status').textContent = 'Press the new key for ' + action;
      controls.capture = {
        action,
        done: (message) => {
          button.textContent = controls.mapping[action];
          el('binding-status').textContent = message;
        },
      };
    };
  });
  let deleteArmed = false;
  el('delete-save').onclick = () => {
    if (!deleteArmed) {
      deleteArmed = true;
      el('delete-save').textContent = 'CONFIRM DELETE — CANNOT UNDO';
      return;
    }
    const cleared = clearSaves();
    el('save-status').textContent = cleared
      ? 'Saved progress deleted; session ended. Reload to reset active preferences.'
      : 'Storage unavailable.';
    if (cleared) {
      race.state = 'menu';
      race.championship.season = race.championship.fresh();
      race.telemetry = new Telemetry('cleared');
      showState();
    }
    deleteArmed = false;
    el('delete-save').textContent = 'DELETE LOCAL SAVES';
  };
  document.querySelectorAll<HTMLButtonElement>('[data-touch]').forEach((button) => {
    const type = button.dataset.touch!;
    button.onpointerdown = (e) => {
      e.preventDefault();
      button.setPointerCapture(e.pointerId);
      if (type === 'left' || type === 'right') controls.touch.steer = type === 'left' ? -1 : 1;
      else if (type === 'throttle' || type === 'brake') controls.touch[type] = 1;
    };
    const release = () => {
      if (type === 'left' || type === 'right') controls.touch.steer = 0;
      else if (type === 'throttle' || type === 'brake') controls.touch[type] = 0;
    };
    button.onpointerup = release;
    button.onpointercancel = release;
    button.onlostpointercapture = release;
  });
  el('touch-pause').onclick = () => {
    race.pause();
    controls.clear();
    showState();
  };
  el('start').onclick = start;
  el('restart').onclick = start;
  el('resume').onclick = () => {
    race.pause();
    controls.clear();
    showState();
  };
  el('exit').onclick = () => {
    race.state = 'menu';
    showState();
  };
  el('weather').onchange = (e) => {
    const mode = (e.target as HTMLSelectElement).value as WeatherMode;
    world.setWeather(mode);
    el('condition-value').textContent = mode === 'rain' ? 'WET' : 'DRY';
  };
  el('quality').onchange = (e) => setQuality((e.target as HTMLSelectElement).value);
  el('settings-quality').onchange = (e) => setQuality((e.target as HTMLSelectElement).value);
  let resumeAfterSettings = false;
  el('settings-open').onclick = () => {
    resumeAfterSettings = race.state === 'driving' || race.state === 'countdown';
    if (resumeAfterSettings) race.pause();
    controls.clear();
    showState();
    el('settings').hidden = false;
  };
  el('settings-close').onclick = () => {
    el('settings').hidden = true;
    controls.capture = undefined;
    controls.clear();
    if (resumeAfterSettings) race.pause();
    showState();
  };
  el('sound').onclick = () => {
    audio.muted = !audio.muted;
    el('sound').textContent = audio.muted ? 'SOUND OFF' : 'SOUND ON';
    preferences();
  };
  el('pit-compound').onchange = (e) => {
    if (race.control.rules[0])
      race.control.rules[0].compound = (e.target as HTMLSelectElement).value as Compound;
  };
  el('volume').oninput = (e) => {
    audio.volume = (Number((e.target as HTMLInputElement).value) / 100) * 0.35;
    preferences();
  };
  el('reduced-motion').onchange = (e) =>
    (world.reducedMotion = (e.target as HTMLInputElement).checked);
  document.querySelectorAll<HTMLElement>('.modal-overlay').forEach((overlay) => {
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', overlay.querySelector('h2')?.textContent || 'Dialog');
  });
  window.addEventListener('keydown', (e) => {
    const overlays = Array.from(document.querySelectorAll<HTMLElement>('.modal-overlay')).filter(
        (o) => !o.hidden,
      ),
      modal = overlays.at(-1);
    if (!modal || controls.capture) return;
    if (e.key === 'Tab') {
      const nodes = Array.from(
        modal.querySelectorAll<HTMLElement>('button:not([disabled]),a,input,select,summary'),
      ).filter((e) => e.getClientRects().length);
      const first = nodes[0],
        last = nodes.at(-1);
      if (
        e.shiftKey &&
        (!modal.contains(document.activeElement) || document.activeElement === first)
      ) {
        e.preventDefault();
        last?.focus();
      } else if (
        !e.shiftKey &&
        (!modal.contains(document.activeElement) || document.activeElement === last)
      ) {
        e.preventDefault();
        first?.focus();
      }
    }
  });
  controls.onAction = (key) => {
    if (!el('settings').hidden || !el('garage').hidden || !el('telemetry').hidden) return;
    if (key === 'Escape') {
      race.pause();
      controls.clear();
      showState();
    }
    if (key === 'KeyR' && race.state === 'driving') race.reset();
    if (key === 'KeyC') world.cameraMode = (world.cameraMode + 1) % 3;
    if (key === 'KeyP' && race.state === 'driving') race.control.request(0);
    if (key === 'KeyL' && race.state === 'driving')
      race.control.rules[0].limiter = !race.control.rules[0].limiter;
    if (key === 'KeyM') el('sound').click();
  };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && (race.state === 'driving' || race.state === 'countdown')) {
      race.pause();
      controls.clear();
      showState();
    }
  });
  window.addEventListener('blur', () => {
    if (race.state === 'driving' || race.state === 'countdown') {
      race.pause();
      showState();
    }
  });
  world.renderer.domElement.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    race.state = 'paused';
    el('error').hidden = false;
    el('error').textContent =
      'Graphics context lost. Reload the page to recover. Try Low graphics if this repeats.';
    showState();
  });
  if (new URLSearchParams(location.search).has('test'))
    (window as unknown as { __APEX__: unknown }).__APEX__ = {
      race,
      world,
      controls,
      build: __BUILD__,
    };
  function loop(now: number) {
    if (!el('error').hidden) return;
    const dt = Math.min(0.1, Math.max(0, (now - previous) / 1000));
    previous = now;
    accumulator += dt;
    while (accumulator >= 1 / 120) {
      const was = race.state;
      race.step(1 / 120, controls.read());
      if (was !== 'finished' && race.state === 'finished') {
        showResults(race);
        showState();
      }
      accumulator -= 1 / 120;
    }
    world.setGhost(
      el<HTMLInputElement>('ghost-enabled').checked &&
        race.state === 'driving' &&
        ['practice', 'timeTrial', 'hotlap'].includes(race.options.mode) &&
        race.timers[0].started
        ? ghostAt(race.telemetry.best, race.timers[0].current)
        : undefined,
    );
    world.render(race.cars, dt, race.state === 'menu', race.state === 'driving');
    uiTime += dt;
    if (uiTime > 0.06) {
      updateHUD(race);
      updateRacingHUD(race);
      uiTime = 0;
    }
    audio.update(race.cars[0].rpm, race.cars[0].input.throttle, race.state === 'driving');
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
} catch (error) {
  el('error').hidden = false;
  el('error').textContent =
    'Unable to start 3D graphics. A WebGL2-capable browser is required. Try updating your browser or enabling hardware acceleration. ' +
    (error instanceof Error ? error.message : '');
  console.error(error);
}
