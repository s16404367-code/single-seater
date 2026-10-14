import {makeCar,stepCar,idleInput,recover,type Input, type Car} from './physics';
import {track} from './track';
import {LapTimer} from './timing';
import {Driver,type Difficulty} from './ai';
import {collideCars} from './collision';
export type RaceState='menu'|'countdown'|'driving'|'paused'|'finished';
export interface Options {mode:'practice'|'race';opponents:3|5|8;laps:number;difficulty:Difficulty;}
export const defaultOptions:Options={mode:'practice',opponents:5,laps:3,difficulty:'Pro'};
export const names=['YOU','L. MARIN','K. SATO','A. COSTA','N. SHAW','R. VARGAS','E. NOVAK','J. PARK','S. REED'];
export const colors=[0xf04436,0x37c1c9,0xf0c643,0xc5ccde,0x5d84df,0x63b980,0xdf7847,0xa18ce0,0xe2aabb];
export class Race {
 cars:Car[]=[makeCar(0,track.length-35)];timers:LapTimer[]=[new LapTimer(track.length-35)];drivers:Driver[]=[];state:RaceState='menu';beforePause:RaceState='driving';time=0;message='';countdown=0;finishTimes=new Map<number,number>();options:Options={...defaultOptions};finishAt=0;
 start(options:Partial<Options>={}){this.options={...this.options,...options};const count=this.options.mode==='race'?this.options.opponents+1:1;this.cars=Array.from({length:count},(_,i)=>({...makeCar(i,track.length-12-i*9,count>1?(i%2?3.3:-3.3):0),name:names[i],color:colors[i]}));this.timers=this.cars.map(c=>new LapTimer(c.distance));this.drivers=this.cars.map(c=>new Driver(c.id,this.options.difficulty));this.time=0;this.message='';this.countdown=0;this.finishTimes.clear();this.finishAt=0;this.state=this.options.mode==='race'?'countdown':'driving';}
 pause(){if(this.state==='driving'||this.state==='countdown'){this.beforePause=this.state;this.state='paused';}else if(this.state==='paused')this.state=this.beforePause;}
 reset(){recover(this.cars[0]);this.timers[0].invalidate();this.message='Recovered · current lap invalid';}
 get order(){return this.cars.map((c,i)=>({car:c,timer:this.timers[i],finish:this.finishTimes.get(c.id)})).sort((a,b)=>{if(a.finish!==undefined||b.finish!==undefined)return (a.finish??Infinity)-(b.finish??Infinity);return b.timer.total-a.timer.total;});}
 gap(a:number,b:number){const ta=this.timers[a],tb=this.timers[b],target=tb.total;const sample=ta.crossings.findLast(p=>p.s<=target);return sample?Math.max(0,tb.elapsed-sample.time):undefined;}
 step(dt:number,input:Input=idleInput()){
  if(this.state==='countdown'){this.countdown+=dt;this.message='WAIT FOR LIGHTS OUT';if(this.countdown>=5.7){this.state='driving';this.message='GO';}return;}
  if(this.state!=='driving')return;this.time+=dt;if(this.time>3)this.message='';
  for(let i=0;i<this.cars.length;i++){const c=this.cars[i],control=i===0?input:this.drivers[i].update(c,this.cars,dt,this.time);stepCar(c,control,dt);}
  collideCars(this.cars);
  for(let i=0;i<this.cars.length;i++){const c=this.cars[i],timer=this.timers[i];if(this.finishTimes.has(c.id))continue;timer.update(track.project(c).s,dt,Math.abs(c.offset)<11);if(this.options.mode==='race'&&timer.laps>=this.options.laps){this.finishTimes.set(c.id,this.time);if(c.id===0)this.finishAt=this.time;}}
  if(this.options.mode==='race'&&(this.finishTimes.size===this.cars.length||(this.finishAt>0&&this.time-this.finishAt>60)))this.state='finished';
 }
}
