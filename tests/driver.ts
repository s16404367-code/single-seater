import {angle,clamp} from '../src/math';
import {track} from '../src/track';
import {type Car,idleInput} from '../src/physics';
export function testDriver(c:Car){const p=track.project(c),look=12+Math.abs(c.speed)*.45,target=track.at(p.s+look),error=angle(Math.atan2(target.x-c.x,target.z-c.z)-c.heading),steer=clamp(Math.atan(2*3.3*Math.sin(error)/Math.max(3,Math.hypot(target.x-c.x,target.z-c.z)))/(.48/(1+Math.abs(c.speed)*.028)),-1,1);let speed=70;for(let d=0;d<=170;d+=10){const k=Math.abs(track.at(p.s+d).curvature),corner=Math.sqrt(7.5/Math.max(.001,k));speed=Math.min(speed,Math.sqrt(corner*corner+2*7*d));}return {...idleInput(),steer,throttle:clamp((speed-c.speed)*.4,0,1),brake:clamp((c.speed-speed)*.3,0,1)};}
