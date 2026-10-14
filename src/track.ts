import {CatmullRomCurve3,Vector3} from 'three';
import {angle,clamp,lerp,mod,type Vec} from './math';
export interface TrackPoint extends Vec {s:number;heading:number;curvature:number}
export interface Projection extends TrackPoint {offset:number;index:number;distance:number}
export class Track {
  readonly id='apex-valley-v1'; readonly name='Apex Valley'; readonly width=18; readonly boundary=25;
  readonly points:TrackPoint[]; readonly length:number; readonly step:number; readonly count=900;
  constructor(){
    const coords=[[0,0],[0,260],[90,360],[260,320],[310,200],[200,150],[170,70],[285,10],[410,80],[500,200],[590,220],[625,145],[610,-260],[560,-345],[480,-360],[400,-240],[340,-320],[240,-330],[120,-300],[15,-200]];
    let curve=new CatmullRomCurve3(coords.map(([x,z])=>new Vector3(x,0,z)),true,'centripetal');
    curve.arcLengthDivisions=5000;
    const scale=3500/curve.getLength();
    curve=new CatmullRomCurve3(coords.map(([x,z])=>new Vector3(x*scale,0,z*scale)),true,'centripetal'); curve.arcLengthDivisions=5000;
    this.length=curve.getLength(); this.step=this.length/this.count;
    this.points=Array.from({length:this.count},(_,i)=>{const p=curve.getPointAt(i/this.count),t=curve.getTangentAt(i/this.count);return {x:p.x,z:p.z,s:i*this.step,heading:Math.atan2(t.x,t.z),curvature:0};});
    this.points.forEach((p,i)=>p.curvature=angle(this.points[(i+2)%this.count].heading-this.points[mod(i-2,this.count)].heading)/(4*this.step));
  }
  at(s:number,offset=0):TrackPoint {const f=mod(s,this.length)/this.step,i=Math.floor(f),t=f-i,a=this.points[i],b=this.points[(i+1)%this.count]; const h=a.heading+angle(b.heading-a.heading)*t;return {x:lerp(a.x,b.x,t)+Math.cos(h)*offset,z:lerp(a.z,b.z,t)-Math.sin(h)*offset,s:mod(s,this.length),heading:h,curvature:lerp(a.curvature,b.curvature,t)};}
  project(p:Vec):Projection {
    let best=Infinity,idx=0,bt=0;
    for(let i=0;i<this.count;i++){const a=this.points[i],b=this.points[(i+1)%this.count],dx=b.x-a.x,dz=b.z-a.z;const t=clamp(((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz),0,1);const d=(p.x-a.x-t*dx)**2+(p.z-a.z-t*dz)**2;if(d<best){best=d;idx=i;bt=t;}}
    const q=this.at((idx+bt)*this.step);return {...q,index:idx,distance:Math.sqrt(best),offset:(p.x-q.x)*Math.cos(q.heading)-(p.z-q.z)*Math.sin(q.heading)};
  }
  surface(offset:number):'asphalt'|'kerb'|'gravel'|'grass' {const d=Math.abs(offset);return d<9?'asphalt':d<10.2?'kerb':d<17?'gravel':'grass';}
}
export const track=new Track();
