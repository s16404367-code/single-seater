import {type Track,track} from './track';
import {mod} from './math';
export class LapTimer {
  laps=0; elapsed=0;current=0;last=0;lastValid=false;best=Infinity;total=0;lastS:number; nextGate=1; valid=true;started=false;sectors:number[]=[];lastSectors:number[]=[];sectorAt=0;crossings:{s:number;time:number}[]=[];
  constructor(s=0,public t:Track=track){this.lastS=s;this.total=s>t.length*.9?s-t.length:s;}
  invalidate(){this.valid=false;}
  update(s:number,dt:number,onTrack=true){
    this.elapsed+=dt; if(this.started)this.current+=dt;
    const delta=mod(s-this.lastS+this.t.length/2,this.t.length)-this.t.length/2;
    const old=this.lastS;this.lastS=s;
    if(Math.abs(delta)>120){this.invalidate();return false;}
    this.total+=delta;
    if(!onTrack)this.valid=false;
    if(delta<=0)return false;
    const finish=old>this.t.length*.9&&s<this.t.length*.1;
    if(!this.started&&finish){this.started=true;this.current=0;this.valid=true;this.nextGate=1;this.sectorAt=0;return false;}
    if(!this.started)return false;
    const gate=this.t.length*this.nextGate/3;
    if(this.nextGate<3&&old<gate&&s>=gate){this.sectors.push(this.current-this.sectorAt);this.sectorAt=this.current;this.nextGate++;}
    this.crossings.push({s:this.total,time:this.elapsed});if(this.crossings.length>1000)this.crossings.shift();
    if(finish){const complete=this.nextGate===3;if(complete){this.laps++;this.last=this.current;this.lastValid=this.valid;this.lastSectors=[...this.sectors,this.current-this.sectorAt];if(this.valid)this.best=Math.min(this.best,this.last);}this.current=0;this.sectorAt=0;this.sectors=[];this.nextGate=1;this.valid=true;return complete;}
    return false;
  }
}
export function timeText(s:number){if(!Number.isFinite(s)||s<=0)return '—:—.———';const m=Math.floor(s/60);return `${m}:${(s%60).toFixed(3).padStart(6,'0')}`;}
