import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
function files(dir: string): string[] { return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(`${dir}/${e.name}`):[`${dir}/${e.name}`]); }
export default defineConfig(() => {
  const revision = execSync('git rev-parse --short HEAD').toString().trim();
  const fingerprint = createHash('sha256');
  for(const path of ['index.html','package-lock.json',...files('src')].sort()) fingerprint.update(path).update(readFileSync(path));
  const identity = {revision, sourceHash:fingerprint.digest('hex').slice(0,16), builtAt:new Date().toISOString(), dirty:!!execSync('git status --porcelain').toString().trim()};
  return {base:'/single-seater/',define:{__BUILD__:JSON.stringify(identity)},server:{host:'0.0.0.0',allowedHosts:true},preview:{host:'0.0.0.0',allowedHosts:true},plugins:[{name:'build-identity',generateBundle(){this.emitFile({type:'asset',fileName:'build-manifest.json',source:JSON.stringify(identity,null,2)});}}]};
});
