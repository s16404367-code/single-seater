import { rounds } from './progression';
import { defaults } from './input';
import { engineer } from './telemetry';
import { track } from './track';
import { timeText } from './timing';
import type { Race } from './race';
export const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `<div id="scene" aria-label="3D racing circuit"></div>
<div id="error" role="alert" hidden></div>
<header><a class="brand" href="#" aria-label="APEX GP home"><span class="brand-mark">A</span> APEX<span class="brand-light">GP</span><small>THE PURSUIT OF PACE</small></a><div class="header-right"><span class="status-dot"></span><span id="session-label">PADDOCK</span><button class="icon-button" id="sound" aria-label="Toggle sound">SOUND ON</button><button class="icon-button" id="garage-open">GARAGE</button><button class="icon-button" id="telemetry-open">DATA</button><button class="icon-button" id="settings-open">SETTINGS</button></div></header>
<main id="menu"><div class="menu-content"><div class="eyebrow"><span></span> ORIGINAL OPEN-WHEEL RACING</div><h1>EVERY<br>SECOND<br><em>COUNTS.</em></h1><p class="intro">One seat. No second chances.<br>Find your line. Make it yours.</p><div class="mode-selector" id="mode-selector"><button class="selected" data-mode="practice">FREE PRACTICE</button><button data-mode="race">QUICK RACE</button><button data-mode="weekend">GP WEEKEND</button><button data-mode="timeTrial">TIME TRIAL</button><button data-mode="hotlap">HOT LAP</button><button data-mode="championship">CHAMPIONSHIP</button></div><p id="mode-description">Learn the circuit. No session time limit.</p><div id="config" class="config"><label>YOUR CIRCUIT<strong>APEX VALLEY <span>↗</span></strong><small>3.50 KM &nbsp; / &nbsp; FICTIONAL CIRCUIT</small></label><label>GRAPHICS<select id="quality"><option value="high">High · full detail</option><option value="medium">Medium · balanced</option><option value="low">Low · integrated GPU</option></select></label><div class="extra-row"><label>CAR PACKAGE<select id="package"><option value="balanced">Stage 1 Balanced</option><option value="lowDrag">Monza Low-Drag</option><option value="highAero">Monaco High-Aero</option><option value="pro">Apex Mk.II Pro</option></select></label><label>COMPOUND<select id="compound"><option value="soft">Soft C5</option><option value="medium" selected>Medium C3</option><option value="hard">Hard C1</option><option value="inter">Intermediate</option></select></label><label>CONDITIONS<select id="weather"><option value="sunny">Sunny Day</option><option value="dusk">Sunset Dusk</option><option value="night">Night GP</option><option value="rain">Wet Rain</option></select></label><label>FICTIONAL TEAM<select id="livery"><option value="0">APEX / Vermilion</option><option value="1">TIDAL / Cyan</option><option value="2">SOLAR / Gold</option><option value="3">NOVA / Silver</option><option value="4">VECTOR / Blue</option></select></label></div><div class="extra-row" id="race-options" hidden><label>RIVALS<select id="opponents"><option>3</option><option selected>5</option><option>8</option></select></label><label>DIFFICULTY<select id="difficulty"><option>Rookie</option><option>Amateur</option><option selected>Pro</option><option>Expert</option><option>Alien</option></select></label><label>LAPS<select id="laps"><option>1</option><option selected>3</option><option>5</option><option>10</option></select></label></div></div><button class="primary" id="start">TAKE TO THE TRACK <span>↗</span></button><div class="menu-hint"><kbd>W A S D</kbd> DRIVE <span>·</span><kbd>C</kbd> CAMERA <span>·</span><kbd>ESC</kbd> PAUSE</div></div><aside class="track-card"><div class="eyebrow">THE CIRCUIT <span class="red">01 / 01</span></div><svg id="track-preview" viewBox="0 0 300 210" aria-label="Apex Valley track layout"></svg><div class="track-card-title">APEX VALLEY <span>↗</span></div><div class="track-stats"><span><strong>3.50</strong>KM LENGTH</span><span><strong>18</strong>M WIDTH</span><span><strong id="condition-value">DRY</strong>CONDITIONS</span></div><p>An original technical circuit. Flowing esses,<br>a tight hairpin, and a flat-out back straight.</p></aside><div class="scene-caption"><span class="status-dot"></span> LIVE IN-ENGINE <span>/</span> ORIGINAL APEX CHASSIS</div></main>
<div id="hud" hidden><div class="timing-panel"><div class="eyebrow" id="race-label">FREE PRACTICE</div><div class="lap-heading"><span>LAP <b id="lap">01</b></span><span id="position">SOLO</span></div><div class="lap-current" id="current">0:00.000</div><div class="timing-row"><span>LAST</span><b id="last">—</b></div><div class="timing-row"><span>BEST</span><b id="best">—</b></div><div id="standings"></div></div><div id="race-banner" aria-live="polite"></div><div id="start-lights"></div><div class="minimap-panel"><canvas id="minimap" width="300" height="220" aria-label="Live circuit minimap"></canvas><small>APEX VALLEY <span>3.50 KM</span></small></div><div class="speed-panel"><div id="rpm-bar"></div><div class="speed-main"><div class="gear"><span id="gear">1</span><small>GEAR</small></div><div class="speed"><strong id="speed">000</strong><small>KM/H</small></div></div><div class="pedals"><span>THR</span><i><b id="throttle-bar"></b></i><span>BRK</span><i><b id="brake-bar"></b></i></div><div id="car-status">ASPHALT · READY</div><div id="telemetry-summary"></div></div><div class="drive-help"><kbd>C</kbd> CAMERA <kbd>R</kbd> RECOVER <kbd>ESC</kbd> PAUSE</div><div id="engineer"></div><div id="touch-controls" hidden><button data-touch="left" aria-label="Steer left">◀</button><button data-touch="right" aria-label="Steer right">▶</button><button data-touch="brake">BRAKE</button><button data-touch="throttle">THROTTLE</button><button id="touch-pause">Ⅱ</button></div></div>
<div class="modal-overlay" id="pause" hidden><section class="modal"><div class="eyebrow">TAKE A BREATH</div><h2>SESSION PAUSED</h2><p>The clock is stopped. Your next apex can wait.</p><button class="primary" id="resume">BACK ON TRACK ↗</button><button class="secondary" id="restart">RESTART SESSION</button><button class="secondary" id="exit">RETURN TO PADDOCK</button></section></div>
<div class="modal-overlay" id="settings" hidden><section class="modal settings-modal"><div class="eyebrow">MAKE IT YOURS</div><h2>SETTINGS & CONTROLS</h2><div class="control-grid"><span>Throttle / brake</span><kbd>W / S or ↑ / ↓</kbd><span>Steer left / right</span><kbd>A / D or ← / →</kbd><span>Reverse (hold)</span><kbd>X</kbd><span>Camera / recover</span><kbd>C / R</kbd><span>ERS / DRS (hold)</span><kbd>Space or Shift / F</kbd><span>Pit request / limiter</span><kbd>P / L</kbd><span>Pause / mute</span><kbd>ESC / M</kbd></div><label class="setting">Graphics<select id="settings-quality"><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label><label class="setting">Master volume<input id="volume" type="range" min="0" max="100" value="45"></label><label class="setting">Reduced camera motion<input id="reduced-motion" type="checkbox"></label><label class="setting">Next pit compound<select id="pit-compound"><option value="soft">Soft C5</option><option value="medium" selected>Medium C3</option><option value="hard">Hard C1</option><option value="inter">Intermediate</option></select></label><p class="small">Pit: press P, enter the left-hand lane before the finish line, press L for the 80 km/h limiter, then stop in the red box for 2.8s. Three track-limit excursions: +5s. Pit speeding and VSC overspeed/overtaking: +5s. Starts are locked until lights out.</p><label class="setting">Local race engineer<input id="engineer-enabled" type="checkbox" checked></label><div id="extra-settings"><label class="setting">Show best-lap ghost<input id="ghost-enabled" type="checkbox" checked></label><label class="setting">High contrast<input id="high-contrast" type="checkbox"></label><label class="setting">Color-vision-friendly HUD<input id="color-friendly" type="checkbox"></label><label class="setting">HUD size<select id="hud-scale"><option value="1">Standard</option><option value="1.15">Large</option></select></label><label class="setting">Touch controls (experimental)<input id="touch-enabled" type="checkbox"></label><label class="setting">Gamepad (experimental, standard mapping)<input id="gamepad-enabled" type="checkbox" checked></label><label class="setting">Gamepad dead zone<input id="deadzone" type="range" min="5" max="35" value="12"></label><p class="small">Gamepad: left stick steer, RT throttle, LT brake, A ERS, RB DRS, B reverse, Start pause. Physical devices not certified. Keyboard remains the fallback.</p><details><summary>Remap keyboard controls</summary><div id="bindings" class="control-grid">${Object.entries(
  defaults,
)
  .map(
    ([action, code]) =>
      `<span>${action.toUpperCase()}</span><button class="binding" data-action="${action}">${code}</button>`,
  )
  .join(
    '',
  )}</div><p id="binding-status" role="status">Click a key, then press a replacement. Arrow-key fallbacks remain available.</p></details><button class="secondary" id="delete-save">DELETE LOCAL SAVES</button><p id="save-status" role="status"></p></div><p class="small">Original fictional cars and circuit. Not affiliated with Formula One or any team. Audio is synthesized. Preferences stay on this device; no tracking.</p><a href="./THIRD_PARTY_NOTICES.txt" target="_blank" rel="noopener">Open-source notices ↗</a><button class="primary" id="settings-close">DONE</button></section></div>
<div class="modal-overlay" id="results" hidden><section class="modal"><div class="eyebrow">CHEQUERED FLAG</div><h2 id="result-title">SESSION COMPLETE</h2><div id="result-content"></div><button class="primary" id="next-session" hidden>NEXT SESSION ↗</button><button class="primary" id="results-exit">BACK TO PADDOCK ↗</button></section></div>
<div class="modal-overlay" id="garage" hidden><section class="modal"><div class="eyebrow">SMALL CHANGES. REAL CONSEQUENCES.</div><h2>CAR SETUP</h2><p>Applied when you start your next session. Choose the base package in the paddock. Only modeled adjustments are offered.</p><label class="setting">Aero trim <output id="aero-value">100%</output><input id="aero-trim" type="range" min="80" max="120" value="100"></label><p class="small">Higher trim increases downforce and drag. Lower trim favors straight-line speed.</p><label class="setting">Front brake bias <output id="bias-value">56%</output><input id="brake-bias" type="range" min="48" max="64" value="56"></label><p class="small">More front bias sends more braking force to the front tires. Combined cornering grip remains limited.</p><button class="secondary" id="garage-reset">RESET TO BALANCED TRIM</button><button class="primary" id="garage-close">SAVE & CLOSE ↗</button></section></div><div class="modal-overlay" id="telemetry" hidden><section class="modal data-modal"><div class="eyebrow">LOCAL DATA · 10 HZ</div><h2>FIND YOUR NEXT TENTH.</h2><p id="data-summary">Complete a valid lap to compare it with your best.</p><canvas id="trace" width="700" height="230" aria-label="Speed trace of current or last lap against best lap"></canvas><div class="trace-legend"><span>━ CURRENT / LAST</span><span>━ BEST REFERENCE</span></div><div id="data-sectors"></div><p class="small">Distance-aligned speed in km/h. Same circuit, physics version, setup, compound and weather preset only. Approximate 10 Hz sampling, not professional telemetry. Only 8 recent configuration best laps are saved locally. No upload.</p><button class="primary" id="telemetry-close">BACK ↗</button></section></div><footer><span>APEX GP <b>/</b> ENGINEERING THE DRIVE</span><span id="build-id"></span></footer>`;
export const el = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const xs = track.points.map((p) => p.x),
  zs = track.points.map((p) => p.z),
  minX = Math.min(...xs),
  maxX = Math.max(...xs),
  minZ = Math.min(...zs),
  maxZ = Math.max(...zs);
const scale = Math.min(260 / (maxX - minX), 175 / (maxZ - minZ));
export function mapPoint(x: number, z: number) {
  return [20 + (x - minX) * scale, 190 - (z - minZ) * scale];
}
const path =
  track.points
    .filter((_, i) => i % 3 === 0)
    .map((p, i) => `${i ? 'L' : 'M'}${mapPoint(p.x, p.z).join(',')}`)
    .join(' ') + 'Z';
el('track-preview').innerHTML =
  `<path d="${path}" fill="none" stroke="#ffffff18" stroke-width="12"/><path d="${path}" fill="none" stroke="#e0e7e4" stroke-width="3" stroke-linejoin="round"/><circle cx="${mapPoint(0, 0)[0]}" cy="${mapPoint(0, 0)[1]}" r="5" fill="#f44537"/>`;
const map = el<HTMLCanvasElement>('minimap').getContext('2d')!;
export function updateHUD(race: Race) {
  const c = race.cars[0],
    t = race.timers[0];
  el('speed').textContent = Math.round(Math.abs(c.speed) * 3.6)
    .toString()
    .padStart(3, '0');
  el('gear').textContent = c.speed < -0.5 ? 'R' : String(c.gear);
  el('current').textContent = t.started ? timeText(t.current) : 'OUT LAP';
  el('current').classList.toggle('invalid', !t.valid);
  el('last').textContent = timeText(t.last);
  el('best').textContent = timeText(t.best);
  el('lap').textContent = String(
    race.session === 'race' ? Math.min(race.options.laps, t.laps + 1) : t.laps + 1,
  ).padStart(2, '0');
  el('rpm-bar').style.setProperty('--rpm', `${Math.min(100, (c.rpm / 13000) * 100)}%`);
  el('throttle-bar').style.width = c.input.throttle * 100 + '%';
  el('brake-bar').style.width = c.input.brake * 100 + '%';
  el('car-status').textContent =
    c.surface.toUpperCase() +
    ' · ' +
    (!t.valid ? 'LAP INVALID' : Math.abs(c.offset) > 9 ? 'OFF TRACK' : 'ON LINE');
  map.clearRect(0, 0, 300, 220);
  map.strokeStyle = '#b9c5c355';
  map.lineWidth = 6;
  map.beginPath();
  track.points.forEach((p, i) => {
    const [x, y] = mapPoint(p.x, p.z);
    i ? map.lineTo(x, y) : map.moveTo(x, y);
  });
  map.closePath();
  map.stroke();
  for (const car of [...race.cars].reverse()) {
    const [x, y] = mapPoint(car.x, car.z);
    map.beginPath();
    map.arc(x, y, car.id === 0 ? 5 : 3, 0, Math.PI * 2);
    map.fillStyle = car.id === 0 ? '#f94b39' : '#f2f0df';
    map.fill();
  }
  el('race-banner').textContent = race.message;
  const rules = race.control.rules[0];
  if (rules?.pitRequested && !race.message)
    el('race-banner').textContent = 'PIT REQUESTED · LEFT LANE · STOP AT RED BOX · L: LIMITER';
  el('engineer').textContent = el<HTMLInputElement>('engineer-enabled').checked
    ? engineer(c, race.time)
    : '';
  el('telemetry-summary').textContent =
    `ERS ${Math.round(c.battery / 40000)}% ${c.ersActive ? 'BOOST' : ''} · DRS ${c.drsActive ? 'OPEN' : 'CLOSED'} | ${c.compound.toUpperCase()} ${Math.round(c.tires.reduce((a, t) => a + t.temperature, 0) / 4)}°C · ${Math.round(100 - c.tires.reduce((a, t) => a + t.wear, 0) * 25)}% HEALTH · WET ${Math.round(c.wetness * 100)}% · AERO DAMAGE ${Math.round(c.damage * 100)}%${rules ? ` · WARN ${rules.warnings} / +${rules.penalty}s` : ''}`;
}

export function updateRacingHUD(race: Race) {
  const order = race.order,
    place = order.findIndex((o) => o.car.id === 0) + 1;
  const delta = race.telemetry.delta(race.cars[0].distance, race.timers[0].current);
  el('position').textContent =
    race.session === 'race'
      ? `P${place} / ${race.cars.length}`
      : delta !== undefined
        ? `${delta >= 0 ? '+' : ''}${delta.toFixed(2)}s`
        : 'SOLO';
  el('race-label').textContent =
    race.session === 'race'
      ? `${race.options.mode === 'championship' ? rounds[Math.min(2, race.championship.round)].name.toUpperCase() : 'QUICK RACE'} · ${race.options.laps} LAPS`
      : race.session === 'qualifying'
        ? 'QUALIFYING · 3 MIN'
        : race.options.mode === 'timeTrial'
          ? 'TIME TRIAL · BEST LAP GHOST'
          : race.options.mode === 'hotlap'
            ? 'HOT LAP · ONE FLYING LAP'
            : `PRACTICE ${race.options.mode === 'weekend' ? Math.max(0, Math.ceil(90 - race.time)) + 's' : ''}`;
  el('standings').innerHTML =
    race.session === 'race'
      ? order
          .map((entry, i) => {
            const gap = i ? race.gap(order[0].car.id, entry.car.id) : 0;
            return `<div class="standing-row ${entry.car.id === 0 ? 'you' : ''}"><b>${i + 1}</b><span>${entry.car.name} ${race.control.rules[entry.car.id]?.inPit ? 'PIT' : ''}</span><span>${entry.finish !== undefined ? 'FIN' : i === 0 ? 'LEADER' : gap !== undefined ? '+' + gap.toFixed(1) : '—'}</span></div>`;
          })
          .join('')
      : '';
  el('start-lights').innerHTML =
    race.state === 'countdown'
      ? Array.from(
          { length: 5 },
          (_, i) => `<i class="light ${race.countdown > i + 0.5 ? 'on' : ''}"></i>`,
        ).join('')
      : '';
}
export function showResults(race: Race) {
  el('next-session').hidden = !(
    (race.options.mode === 'weekend' && race.session !== 'race') ||
    (race.options.mode === 'championship' && race.championship.round < 3)
  );
  el('next-session').textContent =
    race.options.mode === 'championship' ? 'NEXT CHAMPIONSHIP ROUND ↗' : 'NEXT SESSION ↗';
  el('result-title').textContent =
    `P${race.order.findIndex((o) => o.car.id === 0) + 1} · ${race.session.toUpperCase()} COMPLETE`;
  el('result-content').innerHTML = race.order
    .map(
      (entry, i) =>
        `<div class="result-row ${entry.car.id === 0 ? 'you' : ''}"><b>${i + 1}. ${entry.car.name}</b><span>${race.session !== 'race' ? timeText(entry.timer.best) : entry.finish !== undefined ? timeText(entry.finish + race.control.rules[entry.car.id].penalty) + (race.control.rules[entry.car.id].penalty ? ' (PENALTY)' : '') : 'NOT FINISHED'}</span></div>`,
    )
    .join('');
  if (race.options.mode === 'championship')
    el('result-content').innerHTML +=
      `<h3>CHAMPIONSHIP · ${race.championship.round}/3</h3>` +
      race.championship.table
        .filter((e) => race.cars.some((c) => c.id === e.id))
        .map(
          (e) =>
            `<div class="result-row"><span>${race.cars.find((c) => c.id === e.id)!.name}</span><b>${e.points} PTS</b></div>`,
        )
        .join('') +
      `<p>Team totals: ${race.championship.teams.map((t) => 'T' + (t.id + 1) + ' ' + t.points).join(' · ')}</p>`;
  if (race.options.mode === 'hotlap')
    el('result-title').textContent = race.timers[0].lastValid
      ? 'HOT LAP COMPLETE'
      : 'HOT LAP INVALID';
  el('results').hidden = false;
}

export function drawTelemetry(race: Race) {
  const data = race.telemetry,
    last = data.last,
    best = data.best,
    ctx = el<HTMLCanvasElement>('trace').getContext('2d')!;
  ctx.clearRect(0, 0, 700, 230);
  ctx.font = '10px Arial';
  ctx.fillStyle = '#9aafb7';
  for (let n = 0; n <= 4; n++) {
    const y = 200 - n * 45;
    ctx.strokeStyle = '#ffffff15';
    ctx.beginPath();
    ctx.moveTo(35, y);
    ctx.lineTo(695, y);
    ctx.stroke();
    ctx.fillText(String(n * 90), 1, y + 3);
  }
  for (const [record, color] of [
    [best?.samples, '#a7d7d0'],
    [last?.samples ?? data.samples, '#f34635'],
  ] as const) {
    if (!record?.length) continue;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    record.forEach((p, i) => {
      const x = 35 + (p.s / track.length) * 650,
        y = 200 - ((p.speed * 3.6) / 360) * 180;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.stroke();
  }
  el('data-summary').textContent =
    `LAST ${timeText(last?.time ?? 0)} / BEST ${timeText(best?.time ?? 0)} · ${data.storageAvailable ? 'Saved locally when available' : 'Storage unavailable — session only'}`;
  el('data-sectors').textContent = race.timers[0].lastSectors
    .map((s, i) => `S${i + 1} ${timeText(s)}`)
    .join('  /  ');
}
