import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {compounds,type Compound} from './setup';
const material=(color:number,metalness=.3,roughness=.45)=>new T.MeshStandardMaterial({color,metalness,roughness});
export function carModel(color:number,compound:Compound){
  const group=new T.Group(),paint=material(color),dark=material(0x16191d,.2,.6),white=material(0xe9eced),rubber=material(0x141619,0,.92),metal=material(0x707780,.75,.3);
  const box=(x:number,y:number,z:number,w:number,h:number,d:number,m:T.Material)=>{const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;};
  box(0,.28,0,1.5,.12,4.3,dark);box(0,.57,-.3,.72,.5,2.1,paint);box(0,.43,1.23,.37,.28,1.75,paint);
  for(const side of [-1,1]){const pod=box(side*.66,.48,-.45,.5,.45,1.65,paint);pod.rotation.y=side*-.07;box(side*.68,.72,-.3,.36,.03,1.25,dark);box(side*.63,.61,.37,.28,.16,.04,dark);}
  const frontWing=box(0,.23,2.02,2.1,.1,.45,dark);box(0,.35,1.98,1.9,.07,.22,paint);for(const x of [-1.03,1.03])box(x,.34,2.03,.055,.3,.5,paint);
  box(0,.85,-1.91,1.87,.12,.5,paint);const flap=box(0,1,-1.97,1.8,.12,.32,paint);for(const x of [-.94,.94])box(x,.79,-1.9,.05,.64,.62,dark);for(const x of [-.36,.36])box(x,.58,-1.9,.06,.55,.1,dark);
  box(0,.86,-.88,.4,.65,.65,paint);box(0,1.19,-.7,.24,.16,.24,dark);box(0,.85,.03,.48,.2,.7,dark);
  const helmet=new T.Mesh(new T.SphereGeometry(.22,16,10),material(0xe5ed31));helmet.position.set(0,1.01,.08);group.add(helmet);box(0,1.02,.265,.31,.07,.04,dark);
  const halo=new T.Mesh(new T.TorusGeometry(.43,.045,6,20,Math.PI),dark);halo.rotation.x=Math.PI/2;halo.position.set(0,1.17,.11);group.add(halo);box(0,.98,.57,.04,.4,.04,dark);
  const wheels:T.Group[]=[];
  for(const z of [-1.36,1.32])for(const x of [-1.03,1.03]){const pivot=new T.Group();pivot.position.set(x,.38,z);const wheel=new T.Mesh(new T.CylinderGeometry(.38,.38,.35,20),rubber);wheel.rotation.z=Math.PI/2;wheel.castShadow=true;pivot.add(wheel);const hub=new T.Mesh(new T.CylinderGeometry(.19,.19,.37,12),metal);hub.rotation.z=Math.PI/2;pivot.add(hub);const stripe=new T.Mesh(new T.TorusGeometry(.31,.015,4,24),material(compounds[compound].color));stripe.rotation.y=Math.PI/2;stripe.position.x=Math.sign(x)*.18;pivot.add(stripe);group.add(pivot);wheels.push(pivot);
    const rod=box(x*.5,.39,z,.95,.04,.055,dark);rod.rotation.y=x>0?.2:-.2;
  }
  const rainLight=box(0,.53,-2.17,.13,.08,.03,new T.MeshBasicMaterial({color:0xff3020}));
  // Original number, not a team mark.
  box(0,.579,1.3,.055,.012,.25,white);
  const batches=new Map<T.Material,T.BufferGeometry[]>();for(const child of [...group.children])if(child instanceof T.Mesh&&child!==flap&&child!==frontWing&&child!==rainLight){child.updateMatrix();const geo=child.geometry.clone().applyMatrix4(child.matrix);const mat=child.material as T.Material;if(!batches.has(mat))batches.set(mat,[]);batches.get(mat)!.push(geo);group.remove(child);child.geometry.dispose();}for(const [mat,geos] of batches){const geo=mergeGeometries(geos);geos.forEach(g=>g.dispose());if(geo){const m=new T.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;group.add(m);}}group.userData={wheels,flap,frontWing,rainLight};return group;
}
