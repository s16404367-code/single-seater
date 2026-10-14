import {makeCar,stepCar,idleInput,recover,type Input, type Car} from './physics';
import {track} from './track';
import {LapTimer} from './timing';
import {Telemetry} from './telemetry';
import {Environment,applyDamage,type WeatherMode} from './environment';
import {RaceControl,pit} from './race-control';
import {Driver,type Difficulty} from './ai';
import {packages,type Package,type Compound} from './setup';
import {collideCars} from './collision';
export type RaceState='menu'|'countdown'|'driving'|'paused'|'finished';
export interface Options {mode:'practice'|'race'|'qualifying'|'weekend';opponents:3|5|8;laps:number;difficulty:Difficulty;package:Package;compound:Compound;livery:number;weather:WeatherMode;aeroTrim:number;brakeBias:number;}
export const defaultOptions:Options={mode:'practice',opponents:5,laps:3,difficulty:'Pro',package:'balanced',compound:'medium',livery:0,weather:'sunny',aeroTrim:1,brakeBias:.56};
export const names=['YOU','L. MARIN','K. SATO','A. COSTA','N. SHAW','R. VARGAS','E. NOVAK','J. PARK','S. REED'];
export const colors=[0xf04436,0x37c1c9,0xf0c643,0xc5ccde,0x5d84df,0x63b980,0xdf7847,0xa18ce0,0xe2aabb];
export class Race {
 cars:Car[]=[makeCar(0,track.length-35)];timers:LapTimer[]=[new LapTimer(track.length-35)];drivers:Driver[]=[];state:RaceState='menu';beforePause:RaceState='driving';time=0;message='';countdown=0;finishTimes=new Map<number,number>();options:Options={...defaultOptions};finishAt=0;control=new RaceControl();environment=new Environment();telemetry=new Telemetry('preview');session:'practice'|'qualifying'|'race'='practice';grid:number[]=[];
 start(options:Partial<Options>={},session?:'practice'|'qualifying'|'race'){this.options={...this.options,...options};this.session=session??(this.options.mode==='race'?'race':this.options.mode==='qualifying'?'qualifying':'practice');const count=this.options.mode!=='practice'?this.options.opponents+1:1;this.cars=Array.from({length:count},(_,i)=>({...makeCar(i,track.length-12-(this.session==='race'&&this.grid.length===count?this.grid.indexOf(i):i)*9,count>1?(i%2?3.3:-3.3):0),name:names[i],color:colors[i]}));this.cars.forEach((c,i)=>{c.setup={...packages[this.options.package]};c.compound=this.options.compound;if(i===0){c.color=colors[this.options.livery];c.setup.downforce*=this.options.aeroTrim;c.setup.drag*=this.options.aeroTrim**.65;c.setup.brakeBias=this.options.brakeBias;}});this.timers=this.cars.map(c=>new LapTimer(c.distance));this.drivers=this.cars.map(c=>new Driver(c.id,this.options.difficulty));this.time=0;this.message='';this.countdown=0;this.finishTimes.clear();this.finishAt=0;this.telemetry=new Telemetry(`${track.id}|physics-v3|${this.options.package}|${this.options.compound}|${this.options.weather}|${this.options.aeroTrim}|${this.options.brakeBias}`);this.control.reset(this.cars);this.environment.set(this.options.weather);this.state=this.session==='race'?'countdown':'driving';}
 pause(){if(this.state==='driving'||this.state==='countdown'){this.beforePause=this.state;this.state='paused';}else if(this.state==='paused')this.state=this.beforePause;}
 reset(){recover(this.cars[0]);this.timers[0].invalidate();this.message='Recovered · current lap invalid';}
 nextSession(){if(this.session==='qualifying')this.grid=this.order.map(e=>e.car.id);this.start({},this.session==='practice'?'qualifying':'race');}
 get order(){return this.cars.map((c,i)=>({car:c,timer:this.timers[i],finish:this.finishTimes.get(c.id)})).sort((a,b)=>{if(this.session==='qualifying')return a.timer.best-b.timer.best;if(a.finish!==undefined||b.finish!==undefined)return (a.finish!==undefined?a.finish+this.control.rules[a.car.id].penalty:Infinity)-(b.finish!==undefined?b.finish+this.control.rules[b.car.id].penalty:Infinity);return b.timer.total-a.timer.total;});}
 gap(a:number,b:number){const ta=this.timers[a],tb=this.timers[b],target=tb.total;const sample=ta.crossings.findLast(p=>p.s<=target);return sample?Math.max(0,tb.elapsed-sample.time):undefined;}
 step(dt:number,input:Input=idleInput()){
  if(this.state==='countdown'){this.countdown+=dt;this.message='WAIT FOR LIGHTS OUT';if(this.countdown>=5.7){this.state='driving';this.message='GO';}return;}
  if(this.state!=='driving')return;this.time+=dt;this.environment.step(dt);if(this.time>3)this.message='';
  for(let i=0;i<this.cars.length;i++){const c=this.cars[i];this.environment.apply(c);const control=i===0?input:this.drivers[i].update(c,this.cars,dt,this.time,this.control.flag==='green');stepCar(c,this.control.control(c,control,this.cars,i>0),dt);}
  collideCars(this.cars);this.cars.forEach(applyDamage);this.control.update(this.cars,dt,this.time,this.order.map(e=>e.car.id),this.session==='race');if(this.control.flag!=='green')this.message=this.control.flag==='vsc'?'VIRTUAL SAFETY CAR · 80 KM/H · NO PASSING':'YELLOW FLAG · INCIDENT AHEAD';if(this.control.rules[0].service>0)this.message=`PIT SERVICE ${(2.8-this.control.rules[0].service).toFixed(1)}s`;
  for(let i=0;i<this.cars.length;i++){const c=this.cars[i],timer=this.timers[i];if(this.finishTimes.has(c.id))continue;timer.update(track.project(c).s,dt,Math.abs(c.offset)<11||pit.contains(c.distance,c.offset));if(this.session==='race'&&timer.laps>=this.options.laps){this.finishTimes.set(c.id,this.time);if(c.id===0)this.finishAt=this.time;}}
  this.telemetry.update(this.cars[0],this.timers[0],dt);
  if((this.session==='qualifying'&&this.time>=180)||(this.options.mode==='weekend'&&this.session==='practice'&&this.time>=90))this.state='finished';
  if(this.session==='race'&&(this.finishTimes.size===this.cars.length||(this.finishAt>0&&this.time-this.finishAt>60)))this.state='finished';
 }
}
