import {type Car} from './physics';
/** Two overlapping chassis circles per car. Equal mass, low restitution; no mesh tests. */
export function collideCars(cars:Car[]){
 for(let iteration=0;iteration<3;iteration++)for(let i=0;i<cars.length;i++)for(let j=i+1;j<cars.length;j++){
  const a=cars[i],b=cars[j];if(Math.hypot(a.x-b.x,a.z-b.z)>6)continue;
  for(const za of [-1.15,1.15])for(const zb of [-1.15,1.15]){
   const ax=a.x+Math.sin(a.heading)*za,az=a.z+Math.cos(a.heading)*za,bx=b.x+Math.sin(b.heading)*zb,bz=b.z+Math.cos(b.heading)*zb;let dx=bx-ax,dz=bz-az,dist=Math.hypot(dx,dz);if(dist>=2.1)continue;if(dist<.001){dx=1;dz=0;dist=1;}
   const nx=dx/dist,nz=dz/dist,overlap=(2.1-dist)*.51;a.x-=nx*overlap;a.z-=nz*overlap;b.x+=nx*overlap;b.z+=nz*overlap;
   const closing=(b.vx-a.vx)*nx+(b.vz-a.vz)*nz;if(closing<0){const impulse=-closing*.53;a.vx-=nx*impulse;a.vz-=nz*impulse;b.vx+=nx*impulse;b.vz+=nz*impulse;if(iteration===0&&closing<-.3){a.contacts++;b.contacts++;a.lastImpact=Math.max(a.lastImpact,-closing);b.lastImpact=Math.max(b.lastImpact,-closing);}}
  }
 }
}
