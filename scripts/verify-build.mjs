import { readFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const html = await readFile('dist/index.html', 'utf8'),
  manifest = JSON.parse(await readFile('dist/build-manifest.json', 'utf8'));
assert(html.includes('/single-seater/assets/'));
assert(!html.includes('src/main.ts'));
assert(!html.includes('bundle.js'));
assert.equal((html.match(/<script[^>]*type="module"/g) || []).length, 1);
for (const [file, expected] of Object.entries(manifest.assets)) {
  assert.equal(
    createHash('sha256')
      .update(await readFile('dist/' + file))
      .digest('hex'),
    expected,
    `hash mismatch ${file}`,
  );
}
const jsFiles = (await readdir('dist/assets')).filter((f) => f.endsWith('.js'));
assert(jsFiles.length > 0);
let bytes = 0;
for (const name of await readdir('dist/assets')) bytes += (await stat('dist/assets/' + name)).size;
assert(bytes < 1500000, `asset budget exceeded ${bytes}`);
assert((await readFile('dist/THIRD_PARTY_NOTICES.txt', 'utf8')).includes('MIT'));
console.log(
  `PASS artifact: one entry, repository base, ${Object.keys(manifest.assets).length} content hashes, ${(bytes / 1024).toFixed(1)} KiB assets, license present; source ${manifest.sourceHash}`,
);
