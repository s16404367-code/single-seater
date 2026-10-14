import {makeCar,stepCar,idleInput,recover,type Input, type Car} from './physics';
import {track} from './track';
import {LapTimer} from './timing';
export type RaceState='menu'|'driving'|'paused'|'finished';
export class Race {
  cars:Car[]=[makeCar(0,track.length-35)];timers:LapTimer[]=[new LapTimer(track.length-35)];state:RaceState='menu';time=0;message='';
  start(){this.cars=[makeCar(0,track.length-35)];this.timers=[new LapTimer(track.length-35)];this.time=0;this.state='driving';}
  pause(){if(this.state==='driving')this.state='paused';else if(this.state==='paused')this.state='driving';}
  reset(){recover(this.cars[0]);this.timers[0].invalidate();this.message='Recovered · current lap invalid';}
  step(dt:number,input:Input=idleInput()){if(this.state!=='driving')return;this.time+=dt;stepCar(this.cars[0],input,dt);this.timers[0].update(this.cars[0].distance,dt,Math.abs(this.cars[0].offset)<11);}
}
