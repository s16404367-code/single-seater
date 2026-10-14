import './style.css';
import {Race} from './race';
import {World,type Quality} from './world';
import {Controls} from './input';
import {EngineAudio} from './audio';
import {el,updateHUD,updateRacingHUD,showResults} from './ui';
import type {Package,Compound} from './setup';
import type {Difficulty} from './ai';
import {load,save} from './storage';
declare const __BUILD__:{revision:string;sourceHash:string;builtAt:string;dirty:boolean};
const race=new Race(),controls=new Controls(),audio=new EngineAudio();let world:World;let mode:'practice'|'race'='practice';let previous=performance.now(),accumulator=0,uiTime=0;
el('build-id').textContent=`BUILD ${__BUILD__.sourceHash.slice(0,8)} / ${__BUILD__.revision}${__BUILD__.dirty?' + LOCAL CHANGES':''}`;
function showState(){if(race.state==='driving'||race.state==='countdown')(document.activeElement as HTMLElement)?.blur();el('menu').hidden=race.state!=='menu';el('hud').hidden=race.state==='menu';el('pause').hidden=race.state!=='paused';el('session-label').textContent=race.state==='menu'?'PADDOCK':'ON TRACK';}
function start(){audio.start();controls.clear();race.start({mode,opponents:Number(el<HTMLSelectElement>('opponents').value) as 3|5|8,laps:Number(el<HTMLSelectElement>('laps').value),difficulty:el<HTMLSelectElement>('difficulty').value as Difficulty,package:el<HTMLSelectElement>('package').value as Package,compound:el<HTMLSelectElement>('compound').value as Compound,livery:Number(el<HTMLSelectElement>('livery').value)});world.setCars(race.cars);showState();el('start').blur();}
function setQuality(q:string){if(!['low','medium','high'].includes(q))q='medium';world.setQuality(q as Quality);el<HTMLSelectElement>('quality').value=q;el<HTMLSelectElement>('settings-quality').value=q;save('quality',q);}
try {
  world=new World(el('scene'));world.setCars(race.cars);setQuality(load('quality','high'));
  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button=>button.onclick=()=>{mode=button.dataset.mode as typeof mode;document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('selected',b===button));el('race-options').hidden=mode!=='race';});
  el('results-exit').onclick=()=>{race.state='menu';el('results').hidden=true;showState();};
  el('start').onclick=start;el('restart').onclick=start;el('resume').onclick=()=>{race.pause();controls.clear();showState();};el('exit').onclick=()=>{race.state='menu';showState();};
  el('quality').onchange=e=>setQuality((e.target as HTMLSelectElement).value);el('settings-quality').onchange=e=>setQuality((e.target as HTMLSelectElement).value);
  let resumeAfterSettings=false;el('settings-open').onclick=()=>{resumeAfterSettings=race.state==='driving'||race.state==='countdown';if(resumeAfterSettings)race.pause();controls.clear();showState();el('settings').hidden=false;};el('settings-close').onclick=()=>{el('settings').hidden=true;if(resumeAfterSettings)race.pause();showState();};
  el('sound').onclick=()=>{audio.muted=!audio.muted;el('sound').textContent=audio.muted?'SOUND OFF':'SOUND ON';};el('volume').oninput=e=>audio.volume=Number((e.target as HTMLInputElement).value)/100*.35;el('reduced-motion').onchange=e=>world.reducedMotion=(e.target as HTMLInputElement).checked;
  controls.onAction=key=>{if(!el('settings').hidden)return;if(key==='Escape'){race.pause();controls.clear();showState();}if(key==='KeyR'&&race.state==='driving')race.reset();if(key==='KeyC')world.cameraMode=(world.cameraMode+1)%3;if(key==='KeyM')el('sound').click();};
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&race.state==='driving'){race.pause();controls.clear();showState();}});
  window.addEventListener('blur',()=>{if(race.state==='driving'){race.pause();showState();}});
  world.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();race.state='paused';el('error').hidden=false;el('error').textContent='Graphics context lost. Reload the page to recover. Try Low graphics if this repeats.';showState();});
  if(new URLSearchParams(location.search).has('test'))(window as unknown as {__APEX__:unknown}).__APEX__={race,world,controls,build:__BUILD__};
  function loop(now:number){const dt=Math.min(.1,Math.max(0,(now-previous)/1000));previous=now;accumulator+=dt;while(accumulator>=1/120){const was=race.state;race.step(1/120,controls.read());if(was!=='finished'&&race.state==='finished'){showResults(race);showState();}accumulator-=1/120;}world.render(race.cars,dt,race.state==='menu');uiTime+=dt;if(uiTime>.06){updateHUD(race);updateRacingHUD(race);uiTime=0;}audio.update(race.cars[0].rpm,race.cars[0].input.throttle,race.state==='driving');requestAnimationFrame(loop);}requestAnimationFrame(loop);
}catch(error){el('error').hidden=false;el('error').textContent='Unable to start 3D graphics. A WebGL2-capable browser is required. Try updating your browser or enabling hardware acceleration. '+(error instanceof Error?error.message:'');console.error(error);}
