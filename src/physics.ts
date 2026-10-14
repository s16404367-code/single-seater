import {angle,clamp} from './math';
import {type Track,track} from './track';
export interface Input {throttle:number;brake:number;steer:number;reverse:boolean;ers:boolean;drs:boolean}
export const idleInput=():Input=>({throttle:0,brake:0,steer:0,reverse:false,ers:false,drs:false});
export interface Car {
  id:number;name:string;color:number;x:number;z:number;heading:number;vx:number;vz:number;speed:number;steer:number;gear:number;rpm:number;distance:number;offset:number;surface:string;contacts:number;lastImpact:number;input:Input;
}
export function makeCar(id=0,s=0,offset=0):Car {const p=track.at(s,offset);return {id,name:id?'Rival '+id:'YOU',color:0xf04436,x:p.x,z:p.z,heading:p.heading,vx:0,vz:0,speed:0,steer:0,gear:1,rpm:4000,distance:p.s,offset,surface:'asphalt',contacts:0,lastImpact:0,input:idleInput()};}
export function recover(car:Car,t:Track=track){const p=t.at(car.distance);Object.assign(car,{x:p.x,z:p.z,heading:p.heading,vx:0,vz:0,speed:0,steer:0});}
export function stepCar(c:Car,input:Input,dt:number,t:Track=track){
  if(!(dt>0&&dt<=.05))return;
  c.input={...input}; const p=t.project(c);c.distance=p.s;c.offset=p.offset;c.surface=t.surface(p.offset);
  const sn=Math.sin(c.heading),cs=Math.cos(c.heading);let forward=c.vx*sn+c.vz*cs,lateral=c.vx*cs-c.vz*sn;
  const road=c.surface==='asphalt'||c.surface==='kerb',grip=road?1.4:.48;
  c.steer+=(clamp(input.steer,-1,1)*.48/(1+Math.abs(forward)*.028)-c.steer)*Math.min(1,dt*9);
  const desired=forward*Math.tan(c.steer)/3.3;
  c.heading=angle(c.heading+clamp(desired,-grip*9.81/Math.max(3,Math.abs(forward)),grip*9.81/Math.max(3,Math.abs(forward)))*dt);
  const engine=input.reverse?-5:input.throttle*Math.min(13,470/Math.max(20,Math.abs(forward)));
  const brake=Math.sign(forward)*Math.min(Math.abs(forward)/dt,input.brake*grip*9.81);
  forward+=(engine-brake-forward*Math.abs(forward)*.0014-(road?.25:2.2)*Math.sign(forward))*dt;
  if(!input.throttle&&!input.reverse&&Math.abs(forward)<.1)forward=0;
  forward=clamp(forward,-8,100); lateral*=Math.exp(-grip*5*dt);
  c.vx=Math.sin(c.heading)*forward+Math.cos(c.heading)*lateral;c.vz=Math.cos(c.heading)*forward-Math.sin(c.heading)*lateral;
  c.x+=c.vx*dt;c.z+=c.vz*dt;c.speed=forward;c.gear=Math.min(8,Math.max(1,Math.floor(Math.abs(forward)/12)+1));c.rpm=5000+(Math.abs(forward)%12)/12*7000;c.lastImpact=0;
  if(Math.abs(p.offset)>t.boundary){const side=Math.sign(p.offset),normalX=Math.cos(p.heading)*side,normalZ=-Math.sin(p.heading)*side;const v=c.vx*normalX+c.vz*normalZ;const q=t.at(p.s,side*(t.boundary-.2));c.x=q.x;c.z=q.z;if(v>0){c.vx-=normalX*v*1.2;c.vz-=normalZ*v*1.2;c.lastImpact=v;c.contacts++;}}
  if(![c.x,c.z,c.heading,c.vx,c.vz].every(Number.isFinite))recover(c,t);
}
