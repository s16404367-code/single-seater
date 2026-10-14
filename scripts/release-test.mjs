import { chromium as playwright } from 'playwright-core';
import chromium from '@sparticuz/chromium';
import { inflate } from '../node_modules/@sparticuz/chromium/build/cjs/lambdafs.cjs';
import { writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
await inflate('./node_modules/@sparticuz/chromium/bin/al2023.tar.br');
process.env.LD_LIBRARY_PATH = '/tmp/al2023/lib:' + (process.env.LD_LIBRARY_PATH || '');
await mkdir('test-artifacts', { recursive: true });
const browser = await playwright.launch({
  executablePath: await chromium.executablePath(),
  args: chromium.args,
  headless: true,
});
const url = process.env.TEST_URL || 'http://127.0.0.1:4173/single-seater/';
const errors = [],
  requests = [];
const context = await browser.newContext({ viewport: { width: 960, height: 640 } });
const page = await context.newPage();
page.on('pageerror', (e) => errors.push(e.message));
page.on('request', (r) => requests.push(r.url()));
await page.addInitScript(() => {
  localStorage.setItem('apex:quality', '"low"');
  localStorage.setItem(
    'apex:championship',
    JSON.stringify({ version: 1, id: 'bad', results: [null] }),
  );
});
await page.goto(url + '?test=1', { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__APEX__?.world.frame > 4);
assert.equal(await page.locator('#error').isVisible(), false);
assert((await page.locator('#build-id').textContent()).includes('ARTIFACT MATCH'));
// Warm up then measure actual renderer frames, not an advertised target.
await page.click('[data-mode="race"]');
await page.selectOption('#opponents', '8');
await page.click('#start');
await page.waitForFunction(() => window.__APEX__.race.state === 'driving', {}, { timeout: 60000 });
const perf = await page.evaluate(async () => {
  const times = [];
  let last = performance.now();
  for (let i = 0; i < 80; i++) {
    await new Promise(requestAnimationFrame);
    const now = performance.now();
    if (i >= 20) times.push(now - last);
    last = now;
  }
  times.sort((a, b) => a - b);
  const a = window.__APEX__;
  return {
    frames: times.length,
    meanMs: times.reduce((a, b) => a + b, 0) / times.length,
    p95Ms: times[Math.floor(times.length * 0.95)],
    drawCalls: a.world.renderer.info.render.calls,
    triangles: a.world.renderer.info.render.triangles,
    geometries: a.world.renderer.info.memory.geometries,
    textures: a.world.renderer.info.memory.textures,
    pixelRatio: a.world.renderer.getPixelRatio(),
    renderer: a.world.renderer.getContext().getParameter(a.world.renderer.getContext().RENDERER),
  };
});
console.log('Measured software-renderer benchmark', perf);
const memory = [];
for (let i = 0; i < 7; i++) {
  memory.push(
    await page.evaluate(async () => {
      const a = window.__APEX__;
      a.race.start({ mode: 'race', opponents: 8 });
      a.world.setCars(a.race.cars);
      await new Promise(requestAnimationFrame);
      return a.world.renderer.info.memory.geometries;
    }),
  );
}
assert(
  Math.max(...memory.slice(-4)) - Math.min(...memory.slice(-4)) < 3,
  `geometry leak ${memory}`,
);
await page.evaluate(() => {
  window.__APEX__.race.state = 'driving';
  window.dispatchEvent(new Event('blur'));
});
assert.equal(await page.evaluate(() => window.__APEX__.race.state), 'paused');
await page.evaluate(() =>
  window.__APEX__.world.renderer.getContext().getExtension('WEBGL_lose_context').loseContext(),
);
await page.waitForFunction(() => !document.getElementById('error').hidden);
assert((await page.locator('#error').textContent()).includes('context lost'));
assert(
  requests.every((r) => r.startsWith(url) || r.startsWith('data:')),
  `unexpected remote requests ${requests}`,
);
assert.deepEqual(errors, []);
const blocked = await context.newPage();
const blockedErrors = [];
blocked.on('pageerror', (e) => blockedErrors.push(e.message));
await blocked.addInitScript(() => {
  Object.defineProperty(window, 'localStorage', {
    get() {
      throw new DOMException('blocked', 'SecurityError');
    },
  });
});
await blocked.goto(url + '?test=1');
await blocked.waitForFunction(() => window.__APEX__?.world.frame > 1);
assert.equal(await blocked.locator('#error').isVisible(), false);
assert.deepEqual(blockedErrors, []);
await blocked.close();
const unavailable = await context.newPage();
await unavailable.addInitScript(() => {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...args) {
    return String(type).includes('webgl') ? null : original.call(this, type, ...args);
  };
});
await unavailable.goto(url);
await unavailable.waitForSelector('#error:not([hidden])');
assert((await unavailable.locator('#error').textContent()).includes('WebGL2'));
await unavailable.close();
const manifestFailure = await context.newPage();
await manifestFailure.addInitScript(() => localStorage.setItem('apex:quality', '"low"'));
await manifestFailure.route('**/build-manifest.json', (r) =>
  r.fulfill({ status: 503, body: 'Unavailable' }),
);
await manifestFailure.goto(url + '?test=1');
await manifestFailure.waitForFunction(() => window.__APEX__?.world.frame > 1);
assert((await manifestFailure.locator('#build-id').textContent()).includes('MANIFEST UNVERIFIED'));
assert.equal(await manifestFailure.locator('#error').isVisible(), false);
await manifestFailure.close();
await writeFile(
  'test-artifacts/release-report.json',
  JSON.stringify(
    {
      environment:
        'Linux x64 / packaged Chromium 141 / software SwiftShader / 960x640 Low / 9 cars',
      build: await page.evaluate(() => window.__APEX__.build),
      perf,
      memory,
      networkRequests: requests,
      errors,
      checks: [
        'malformed save',
        'artifact match',
        'bounded restart geometry',
        'blur pause',
        'context loss',
        'blocked storage',
        'WebGL unavailable',
        'manifest failure',
      ],
    },
    null,
    2,
  ),
);
await browser.close();
console.log('PASS release resilience, privacy, memory and measured benchmark:', perf);
