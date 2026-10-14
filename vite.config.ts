import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(`${dir}/${e.name}`) : [`${dir}/${e.name}`],
  );
}
export default defineConfig(() => {
  const revision = execSync('git rev-parse --short HEAD').toString().trim();
  const fingerprint = createHash('sha256');
  for (const path of [
    'index.html',
    'package.json',
    'package-lock.json',
    'vite.config.ts',
    'tsconfig.json',
    ...files('src'),
    ...files('public'),
  ].sort())
    fingerprint.update(path).update(readFileSync(path));
  const identity = {
    revision,
    sourceHash: fingerprint.digest('hex').slice(0, 16),
    builtAt: new Date().toISOString(),
    dirty: !!execSync('git status --porcelain').toString().trim(),
  };
  return {
    base: '/single-seater/',
    build: { rollupOptions: { output: { manualChunks: { three: ['three'] } } } },
    define: { __BUILD__: JSON.stringify(identity) },
    server: { host: '0.0.0.0', allowedHosts: true },
    preview: { host: '0.0.0.0', allowedHosts: true },
    plugins: [
      {
        name: 'build-identity',
        writeBundle(options) {
          // Hash final bytes: later Vite plugins can still transform assets in generateBundle.
          const dir = options.dir ?? 'dist';
          const assets = Object.fromEntries(
            files(dir)
              .filter((path) => !path.endsWith('/build-manifest.json'))
              .map((path) => [
                path.slice(dir.length + 1),
                createHash('sha256').update(readFileSync(path)).digest('hex'),
              ]),
          );
          writeFileSync(
            `${dir}/build-manifest.json`,
            JSON.stringify({ ...identity, assets }, null, 2),
          );
        },
      },
    ],
  };
});
