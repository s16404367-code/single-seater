import {clamp,mod,angle} from './math';
import {track} from './track';
import {type Car,type Input,idleInput} from './physics';
import type {Compound} from './setup';
import {pit} from './pit';
export {pit} from './pit';
export interface CarRules {warnings:number;penalty:number;outside:number;excursion:boolean;pitRequested:boolean;inPit:boolean;service:number;stops:number;compound:Compound;speeding:boolean;limiter:boolean;vscViolation:number;vscPass:boolean;}
export class RaceControl {
 rules:CarRules[]=[];flag:'green'|'yellow'|'vsc'='green';flagUntil=0;incident=0;lastVsc=-100;vscOrder:number[]=[];
 reset(cars:Car[]){this.rules=cars.map(c=>({warnings:0,penalty:0,outside:0,excursion:false,pitRequested:false,inPit:false,service:0,stops:0,compound:c.compound,speeding:false,limiter:false,vscViolation:0,vscPass:false}));this.flag='green';this.flagUntil=0;this.lastVsc=-100;this.vscOrder=[];}
 request(id:number){const r=this.rules[id];r.pitRequested=!r.pitRequested;}
 trigger(time:number,s:number,order:number[],severe=false){if(this.flag==='vsc')return;this.incident=s;if(severe&&time-this.lastVsc>45){this.flag='vsc';this.flagUntil=time+18;this.lastVsc=time;this.vscOrder=[...order];this.rules.forEach(r=>r.vscPass=false);}else {this.flag='yellow';this.flagUntil=Math.max(this.flagUntil,time+5);}}
 update(cars:Car[],dt:number,time:number,order:number[],competitive:boolean){
  if(time>this.flagUntil)this.flag='green';
  for(const c of cars){const r=this.rules[c.id];r.inPit=pit.contains(c.distance,c.offset);
   if(!r.inPit&&Math.abs(c.offset)>11){r.outside+=dt;if(r.outside>1.2&&!r.excursion){r.warnings++;if(competitive&&r.warnings%3===0)r.penalty+=5;r.excursion=true;}}else {r.outside=0;r.excursion=false;}
   if(r.inPit){if(c.speed>pit.speed+1&&!r.speeding){if(competitive)r.penalty+=5;r.speeding=true;}if(r.pitRequested&&Math.abs(c.distance-(pit.boxStart+c.id*12))<5&&Math.abs(c.speed)<.7){r.service+=dt;if(r.service>=2.8){c.compound=r.compound;c.tires.forEach(t=>{t.wear=0;t.temperature=80;});c.damage=0;r.stops++;r.pitRequested=false;r.service=0;}}else r.service=0;}else {r.speeding=false;r.service=0;}
   if(c.lastImpact>14)this.trigger(time,c.distance,order,true);else if(c.lastImpact>6)this.trigger(time,c.distance,order,false);
   if(this.flag==='vsc'&&competitive){if(order.indexOf(c.id)<this.vscOrder.indexOf(c.id)&&!r.vscPass){r.penalty+=5;r.vscPass=true;}r.vscViolation=c.speed>24?r.vscViolation+dt:0;if(r.vscViolation>3){r.penalty+=5;r.vscViolation=-100;}}
  }
 }
 control(c:Car,input:Input,cars:Car[],ai:boolean):Input {
  const r=this.rules[c.id];let result={...input};
  if(ai&&(c.tires.some(t=>t.wear>.6)||(c.wetness>.6&&c.compound!=='inter'))){r.pitRequested=true;r.compound=c.wetness>.6?'inter':'medium';}
  const approaching=c.distance>track.length-220||c.distance<215;
  if(ai&&r.pitRequested&&approaching){const look=10+Math.abs(c.speed)*.3,target=track.at(c.distance+look,pit.offset(mod(c.distance+look,track.length)));const error=angle(Math.atan2(target.x-c.x,target.z-c.z)-c.heading);result.steer=clamp(Math.atan(2*3.3*Math.sin(error)/Math.max(3,Math.hypot(target.x-c.x,target.z-c.z)))/(.48/(1+Math.abs(c.speed)*.028)),-1,1);let targetSpeed=pit.speed-2;const box=pit.boxStart+c.id*12,dist=mod(box-c.distance,track.length);if(dist<90)targetSpeed=Math.min(targetSpeed,Math.sqrt(Math.max(0,dist-1)*8));if(r.inPit&&Math.abs(c.distance-box)<5)targetSpeed=0;result.throttle=clamp((targetSpeed-c.speed)*.4,0,1);result.brake=clamp((c.speed-targetSpeed)*.4,0,1);}
  if(ai&&r.inPit&&!r.pitRequested){const target=track.at(c.distance+12,pit.offset(c.distance+12)),error=angle(Math.atan2(target.x-c.x,target.z-c.z)-c.heading);result.steer=clamp(error*1.6,-1,1);}
  if(r.service>0)result={...idleInput(),brake:1};
  let cap=Infinity;if(r.limiter||ai&&r.inPit)cap=pit.speed-.5;
  if(this.flag==='vsc'){cap=Math.min(cap,22);if(ai){const ix=this.vscOrder.indexOf(c.id),ahead=cars.find(o=>o.id===this.vscOrder[ix-1]);if(ahead){const gap=mod(ahead.distance-c.distance,track.length);if(gap<18)cap=Math.min(cap,Math.max(0,ahead.speed+(gap-9)*.5));}}}
  if(this.flag==='yellow'&&mod(this.incident-c.distance,track.length)<160)cap=Math.min(cap,28);
  // The player receives rules/warnings, not automatic VSC braking. Pit limiter is a real driver assist.
  if((ai||r.limiter)&&c.speed>cap){result.throttle=0;result.brake=Math.max(result.brake,clamp((c.speed-cap)*.25,0,1));}return result;
 }
}
