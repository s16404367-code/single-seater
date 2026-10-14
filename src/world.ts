import * as T from 'three';
import {track} from './track';
import {rng} from './math';
import {carModel} from './car-model';
import {type Car} from './physics';
export type Quality='low'|'medium'|'high';
export class World {
  scene=new T.Scene();camera=new T.PerspectiveCamera(58,1,.15,2600);renderer:T.WebGLRenderer;models=new Map<number,T.Group>();cameraMode=0;quality:Quality='high';sun:T.DirectionalLight;ambient:T.HemisphereLight; sky:T.Mesh; frame=0; reducedMotion=false;
  constructor(public container:HTMLElement){
    this.renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});this.renderer.setClearColor(0xb1c4ce);this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.15;this.renderer.shadowMap.type=T.PCFSoftShadowMap;container.append(this.renderer.domElement);
    this.scene.fog=new T.FogExp2(0xb5c8d0,.00043);this.ambient=new T.HemisphereLight(0xc8e3ff,0x556343,2.2);this.scene.add(this.ambient);
    this.sun=new T.DirectionalLight(0xffe0ba,3.3);this.sun.position.set(-250,420,180);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);Object.assign(this.sun.shadow.camera,{left:-110,right:110,top:110,bottom:-110,near:1,far:900});this.sun.shadow.bias=-.00025;this.sun.shadow.normalBias=.035;this.scene.add(this.sun,this.sun.target);
    this.sky=new T.Mesh(new T.SphereGeometry(2400,24,12),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{top:{value:new T.Color(0x448abc)},bottom:{value:new T.Color(0xd9dbd0)}},vertexShader:'varying vec3 v; void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 v;uniform vec3 top;uniform vec3 bottom;void main(){float h=clamp(normalize(v).y,0.,1.);gl_FragColor=vec4(mix(bottom,top,pow(h,.6)),1.);}' }));this.scene.add(this.sky);
    const ground=new T.Mesh(new T.PlaneGeometry(6500,6500),new T.MeshStandardMaterial({color:0x71835a,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.035;ground.receiveShadow=true;this.scene.add(ground);
    this.ribbon(-25,25,0x83817a,.002);this.ribbon(-17,17,0xb4aa90,.008);this.ribbon(-10.2,10.2,0xd9dcce,.018);this.ribbon(-9,9,0x32393d,.03);
    this.ribbon(-8.85,-8.65,0xf1edd8,.045);this.ribbon(8.65,8.85,0xf1edd8,.045);
    const curbMats=[new T.MeshStandardMaterial({color:0xef4135}),new T.MeshStandardMaterial({color:0xf3ede0})];
    for(let i=0;i<track.count;i+=3)for(const side of [-1,1])this.segment(i,3,side*9,side*10.2,.07,curbMats[Math.floor(i/3)%2]);
    const railMat=new T.MeshStandardMaterial({color:0xa9aead,metalness:.6,roughness:.6});
    const rails=new T.InstancedMesh(new T.BoxGeometry(.3,.8,track.step*3+1),railMat,600);const d=new T.Object3D();let ri=0;
    for(let i=0;i<track.count;i+=3)for(const side of [-1,1]){const p=track.at((i+1.5)*track.step,side*25);d.position.set(p.x,.6,p.z);d.rotation.set(0,p.heading,0);d.updateMatrix();rails.setMatrixAt(ri++,d.matrix);}rails.receiveShadow=true;this.scene.add(rails);
    const random=rng(42);const tree=new T.InstancedMesh(new T.ConeGeometry(4,15,7),new T.MeshStandardMaterial({color:0x304b38,roughness:1}),420);let n=0;
    for(let attempt=0;n<420&&attempt<4000;attempt++){const x=random()*1900-450,z=random()*1700-800;if(track.project({x,z}).distance<50)continue;d.position.set(x,6,z);d.rotation.set(0,random()*6,0);d.scale.setScalar(.65+random()*.65);d.updateMatrix();tree.setMatrixAt(n++,d.matrix);}tree.count=n;tree.castShadow=true;this.scene.add(tree);
    for(let i=0;i<35;i++){const theta=i/35*Math.PI*2;const mountain=new T.Mesh(new T.ConeGeometry(180+random()*170,170+random()*220,5),new T.MeshStandardMaterial({color:new T.Color().setHSL(.27,.12,.32+random()*.1),flatShading:true,roughness:1}));mountain.position.set(450+Math.sin(theta)*1900,30,Math.cos(theta)*1800);mountain.rotation.y=random()*6;this.scene.add(mountain);}
    this.startFinish();this.buildings();this.setQuality('high');this.resize();window.addEventListener('resize',()=>this.resize());
  }
  ribbon(a:number,b:number,color:number,y:number){const verts:number[]=[];for(let i=0;i<track.count;i++){const p=track.at(i*track.step,a),q=track.at(i*track.step,b),r=track.at((i+1)*track.step,a),s=track.at((i+1)*track.step,b);for(const v of [p,r,q,q,r,s])verts.push(v.x,y,v.z);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.computeVertexNormals();const mesh=new T.Mesh(geo,new T.MeshStandardMaterial({color,roughness:.94,side:T.DoubleSide}));mesh.receiveShadow=true;this.scene.add(mesh);}
  segment(i:number,n:number,a:number,b:number,y:number,mat:T.Material){const p=track.at(i*track.step,a),q=track.at(i*track.step,b),r=track.at((i+n)*track.step,a),s=track.at((i+n)*track.step,b);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([p.x,y,p.z,r.x,y,r.z,q.x,y,q.z,q.x,y,q.z,r.x,y,r.z,s.x,y,s.z],3));g.computeVertexNormals();const m=new T.Mesh(g,mat);m.receiveShadow=true;this.scene.add(m);}
  textBoard(text:string,width=10,height=2,bg='#121a20',fg='#f4f3e9'){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;const ctx=canvas.getContext('2d')!;ctx.fillStyle=bg;ctx.fillRect(0,0,1024,128);ctx.font='italic 900 65px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=fg;ctx.fillText(text,512,66);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;return new T.Mesh(new T.PlaneGeometry(width,height),new T.MeshBasicMaterial({map:texture,side:T.DoubleSide}));}
  startFinish(){const base=track.at(0);const group=new T.Group();group.position.set(base.x,0,base.z);group.rotation.y=base.heading;for(let x=-9;x<9;x++)for(let z=0;z<2;z++){const square=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshStandardMaterial({color:(x+z)%2===0?0xf4eee0:0x1b2225,roughness:.8}));square.rotation.x=-Math.PI/2;square.position.set(x+.5,.065,z-.5);group.add(square);}for(const x of [-12,12]){const post=new T.Mesh(new T.BoxGeometry(.5,7,.5),new T.MeshStandardMaterial({color:0x414c51}));post.position.set(x,3.5,0);group.add(post);}const board=this.textBoard('APEX  /  GRAND PRIX',25,2);board.position.y=7;group.add(board);this.scene.add(group);
    for(let i=0;i<10;i++){const p=track.at(track.length-10-i*8,(i%2?1:-1)*4);const mark=new T.Mesh(new T.PlaneGeometry(2.7,.12),new T.MeshBasicMaterial({color:0xe0ddd1}));mark.rotation.set(-Math.PI/2,0,-p.heading);mark.position.set(p.x,.06,p.z);this.scene.add(mark);}
  }
  buildings(){const p=track.at(70,-48),group=new T.Group();group.position.set(p.x,0,p.z);group.rotation.y=p.heading;
    const box=(x:number,y:number,z:number,w:number,h:number,d:number,c:number)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color:c,roughness:.65}));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);};
    box(0,3,0,20,6,95,0xc5c7bd);box(0,6.5,0,22,.8,100,0xe4e6df);box(2,9,0,16,4,85,0x899c9e);box(2,11,0,18,.6,87,0xdde1d9);
    for(let z=-38;z<44;z+=12){box(10.05,2.2,z,.08,4.2,9,0x2a343c);box(10.1,4.9,z,.1,.5,9,0xe74734);}
    const b=this.textBoard('APEX VALLEY  /  MOTORSPORT PARK',60,3);b.position.set(2,13,0);b.rotation.y=Math.PI/2;group.add(b);this.scene.add(group);
    for(const s of [140,400,1550,2650]){const at=track.at(s,48),stand=new T.Group();stand.position.set(at.x,0,at.z);stand.rotation.y=at.heading;for(let row=0;row<8;row++){const mesh=new T.Mesh(new T.BoxGeometry(2,1,65),new T.MeshStandardMaterial({color:row%2?0xa62d2c:0xebe6d9}));mesh.position.set(row*1.8,row*.85+1,0);mesh.castShadow=true;stand.add(mesh);}const roof=new T.Mesh(new T.BoxGeometry(22,.35,72),new T.MeshStandardMaterial({color:0xdfe4de,metalness:.5,roughness:.5}));roof.position.set(7,10,0);stand.add(roof);this.scene.add(stand);}
    for(let s=250;s<track.length;s+=160){const at=track.at(s,20);const board=this.textBoard(s%320===250?'APEX GP':'PURE RACING',12,1.8);board.position.set(at.x,1.4,at.z);board.rotation.y=at.heading;this.scene.add(board);}
  }
  setCars(cars:Car[]){for(const [id,model] of this.models){if(!cars.some(c=>c.id===id)){this.scene.remove(model);model.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});this.models.delete(id);}}for(const c of cars){if(!this.models.has(c.id)){const model=carModel(c.color);this.models.set(c.id,model);this.scene.add(model);}}}
  setQuality(q:Quality){this.quality=q;this.renderer.setPixelRatio(Math.min(devicePixelRatio,q==='low'?1:q==='medium'?1.5:2));this.renderer.shadowMap.enabled=q!=='low';this.sun.shadow.mapSize.setScalar(q==='high'?2048:1024);this.sun.shadow.map?.dispose();this.sun.shadow.map=null;this.resize();}
  resize(){const w=window.innerWidth,h=window.innerHeight;this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h);}
  render(cars:Car[],dt:number,menu=false){this.frame++;for(const c of cars){const model=this.models.get(c.id);if(model){model.position.set(c.x,.06,c.z);model.rotation.y=c.heading;const wheels=model.userData.wheels as T.Group[];wheels.slice(2).forEach(w=>w.rotation.y=c.steer);wheels.forEach(w=>w.children.forEach(m=>m.rotation.x+=c.speed*dt/.38));}}
    const c=cars[0],sn=Math.sin(c.heading),cs=Math.cos(c.heading);let pos:T.Vector3,target:T.Vector3;
    if(menu){pos=new T.Vector3(c.x+14,c.z?7:7,c.z+17);target=new T.Vector3(c.x,1,c.z);}
    else if(this.cameraMode===2){pos=new T.Vector3(c.x+sn*.5,1.36,c.z+cs*.5);target=new T.Vector3(c.x+sn*60,1.3,c.z+cs*60);}
    else {const back=this.cameraMode===1?6:10;pos=new T.Vector3(c.x-sn*back, this.cameraMode===1?2.9:5.4,c.z-cs*back);target=new T.Vector3(c.x+sn*12,1.15,c.z+cs*12);}
    this.camera.position.lerp(pos,menu?1:1-Math.exp(-dt*(this.reducedMotion?18:9)));this.camera.lookAt(target);this.camera.fov=58+(menu||this.reducedMotion?0:Math.min(10,Math.abs(c.speed)*.09));this.camera.updateProjectionMatrix();this.sky.position.copy(this.camera.position);this.sun.position.set(c.x-180,350,c.z+160);this.sun.target.position.set(c.x,0,c.z);this.renderer.render(this.scene,this.camera);
  }
}
