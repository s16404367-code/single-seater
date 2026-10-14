import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { Sample } from './telemetry';
import type { WeatherMode } from './environment';
import { pit } from './pit';
import { track } from './track';
import { rng } from './math';
import { compounds } from './setup';
import { carModel } from './car-model';
import { type Car } from './physics';
export type Quality = 'low' | 'medium' | 'high';
export class World {
  scene = new T.Scene();
  camera = new T.PerspectiveCamera(58, 1, 0.15, 2600);
  renderer: T.WebGLRenderer;
  models = new Map<number, T.Group>();
  cameraMode = 0;
  quality: Quality = 'high';
  sun: T.DirectionalLight;
  ambient: T.HemisphereLight;
  sky: T.Mesh;
  frame = 0;
  lowMaterials = new WeakMap<T.Material, T.MeshLambertMaterial>();
  wheelMatrix = new T.Matrix4();
  wheelOffset = new T.Matrix4();
  reducedMotion = false;
  weather: WeatherMode = 'sunny';
  ghost?: T.Group;
  batches = new Map<T.Material, T.BufferGeometry[]>();
  road?: T.MeshStandardMaterial;
  rain: T.Points;
  rainPositions = new Float32Array(1800 * 3);
  spray?: T.Points;
  sprayPositions = new Float32Array(360 * 3);
  floods: T.PointLight[] = [];
  lamps: T.Mesh[] = [];
  constructor(public container: HTMLElement) {
    this.renderer = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0xb1c4ce);
    this.renderer.outputColorSpace = T.SRGBColorSpace;
    this.renderer.toneMapping = T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.type = T.PCFSoftShadowMap;
    container.append(this.renderer.domElement);
    this.scene.fog = new T.FogExp2(0xb5c8d0, 0.00043);
    this.ambient = new T.HemisphereLight(0xc8e3ff, 0x556343, 2.2);
    this.scene.add(this.ambient);
    this.sun = new T.DirectionalLight(0xffe0ba, 3.3);
    this.sun.position.set(-250, 420, 180);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    Object.assign(this.sun.shadow.camera, {
      left: -110,
      right: 110,
      top: 110,
      bottom: -110,
      near: 1,
      far: 900,
    });
    this.sun.shadow.bias = -0.00025;
    this.sun.shadow.normalBias = 0.035;
    this.scene.add(this.sun, this.sun.target);
    this.sky = new T.Mesh(
      new T.SphereGeometry(2400, 24, 12),
      new T.ShaderMaterial({
        side: T.BackSide,
        depthWrite: false,
        uniforms: {
          top: { value: new T.Color(0x448abc) },
          bottom: { value: new T.Color(0xd9dbd0) },
        },
        vertexShader:
          'varying vec3 v; void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader:
          'varying vec3 v;uniform vec3 top;uniform vec3 bottom;void main(){float h=clamp(normalize(v).y,0.,1.);gl_FragColor=vec4(mix(bottom,top,pow(h,.6)),1.);}',
      }),
    );
    this.scene.add(this.sky);
    const ground = new T.Mesh(
      new T.PlaneGeometry(6500, 6500),
      new T.MeshStandardMaterial({ color: 0x71835a, roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.035;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.ribbon(-25, 25, 0x83817a, 0.002);
    this.ribbon(-17, 17, 0xb4aa90, 0.008);
    this.ribbon(-10.2, 10.2, 0xd9dcce, 0.018);
    this.ribbon(-9, 9, 0x32393d, 0.03);
    this.ribbon(-8.85, -8.65, 0xf1edd8, 0.045);
    this.ribbon(8.65, 8.85, 0xf1edd8, 0.045);
    const curbMats = [
      new T.MeshStandardMaterial({ color: 0xef4135 }),
      new T.MeshStandardMaterial({ color: 0xf3ede0 }),
    ];
    for (let i = 0; i < track.count; i += 3)
      for (const side of [-1, 1])
        this.segment(i, 3, side * 9, side * 10.2, 0.07, curbMats[Math.floor(i / 3) % 2]);
    const railMat = new T.MeshStandardMaterial({ color: 0xa9aead, metalness: 0.6, roughness: 0.6 });
    const rails = new T.InstancedMesh(
      new T.BoxGeometry(0.3, 0.8, track.step * 3 + 1),
      railMat,
      600,
    );
    const d = new T.Object3D();
    let ri = 0;
    for (let i = 0; i < track.count; i += 3)
      for (const side of [-1, 1]) {
        const p = track.at((i + 1.5) * track.step, side * 25);
        d.position.set(p.x, 0.6, p.z);
        d.rotation.set(0, p.heading, 0);
        d.updateMatrix();
        rails.setMatrixAt(ri++, d.matrix);
      }
    rails.receiveShadow = true;
    this.scene.add(rails);
    const random = rng(42);
    const tree = new T.InstancedMesh(
      new T.ConeGeometry(4, 15, 7),
      new T.MeshStandardMaterial({ color: 0x304b38, roughness: 1 }),
      420,
    );
    let n = 0;
    for (let attempt = 0; n < 420 && attempt < 4000; attempt++) {
      const x = random() * 1900 - 450,
        z = random() * 1700 - 800;
      if (track.project({ x, z }).distance < 50) continue;
      d.position.set(x, 6, z);
      d.rotation.set(0, random() * 6, 0);
      d.scale.setScalar(0.65 + random() * 0.65);
      d.updateMatrix();
      tree.setMatrixAt(n++, d.matrix);
    }
    tree.count = n;
    tree.castShadow = true;
    this.scene.add(tree);
    for (let i = 0; i < 35; i++) {
      const theta = (i / 35) * Math.PI * 2;
      const mountain = new T.Mesh(
        new T.ConeGeometry(180 + random() * 170, 170 + random() * 220, 5),
        new T.MeshStandardMaterial({
          color: new T.Color().setHSL(0.27, 0.12, 0.32 + random() * 0.1),
          flatShading: true,
          roughness: 1,
        }),
      );
      mountain.position.set(450 + Math.sin(theta) * 1900, 30, Math.cos(theta) * 1800);
      mountain.rotation.y = random() * 6;
      this.scene.add(mountain);
    }
    this.startFinish();
    this.buildings();
    this.pitLane();
    this.flushBatches();
    for (let s = 0; s < track.length; s += 140) {
      const p = track.at(s, 21);
      const pole = new T.Mesh(
        new T.CylinderGeometry(0.15, 0.22, 13, 5),
        new T.MeshStandardMaterial({ color: 0x77828a, metalness: 0.6, roughness: 0.5 }),
      );
      pole.position.set(p.x, 6.5, p.z);
      this.scene.add(pole);
      const light = new T.Mesh(
        new T.BoxGeometry(2, 0.3, 1),
        new T.MeshBasicMaterial({ color: 0xf5e6bc }),
      );
      light.position.set(p.x, 13, p.z);
      this.scene.add(light);
      this.lamps.push(light);
    }
    for (let i = 0; i < 6; i++) this.floods.push(new T.PointLight(0xcce1ff, 15000, 170, 2));
    const rainGeo = new T.BufferGeometry();
    const randomRain = rng(12);
    for (let i = 0; i < this.rainPositions.length; i += 3) {
      this.rainPositions[i] = (randomRain() - 0.5) * 130;
      this.rainPositions[i + 1] = randomRain() * 55;
      this.rainPositions[i + 2] = (randomRain() - 0.5) * 130;
    }
    rainGeo.setAttribute('position', new T.BufferAttribute(this.rainPositions, 3));
    this.rain = new T.Points(
      rainGeo,
      new T.PointsMaterial({
        color: 0xcce3eb,
        size: 0.18,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
      }),
    );
    this.rain.frustumCulled = false;
    this.scene.add(this.rain);
    const sprayGeo = new T.BufferGeometry();
    sprayGeo.setAttribute('position', new T.BufferAttribute(this.sprayPositions, 3));
    this.spray = new T.Points(
      sprayGeo,
      new T.PointsMaterial({
        color: 0xc2d2db,
        size: 1,
        transparent: true,
        opacity: 0.11,
        depthWrite: false,
      }),
    );
    this.spray.frustumCulled = false;
    this.scene.add(this.spray);
    this.batchStatic();
    this.setWeather('sunny');
    this.setQuality('high');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }
  ribbon(a: number, b: number, color: number, y: number) {
    const verts: number[] = [];
    for (let i = 0; i < track.count; i++) {
      const p = track.at(i * track.step, a),
        q = track.at(i * track.step, b),
        r = track.at((i + 1) * track.step, a),
        s = track.at((i + 1) * track.step, b);
      for (const v of [p, r, q, q, r, s]) verts.push(v.x, y, v.z);
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(verts, 3));
    geo.computeVertexNormals();
    const mesh = new T.Mesh(
      geo,
      new T.MeshStandardMaterial({ color, roughness: 0.94, side: T.DoubleSide }),
    );
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    if (color === 0x32393d) this.road = mesh.material as T.MeshStandardMaterial;
  }
  segment(i: number, n: number, a: number, b: number, y: number, mat: T.Material) {
    const p = track.at(i * track.step, a),
      q = track.at(i * track.step, b),
      r = track.at((i + n) * track.step, a),
      s = track.at((i + n) * track.step, b);
    const g = new T.BufferGeometry();
    g.setAttribute(
      'position',
      new T.Float32BufferAttribute(
        [p.x, y, p.z, r.x, y, r.z, q.x, y, q.z, q.x, y, q.z, r.x, y, r.z, s.x, y, s.z],
        3,
      ),
    );
    g.computeVertexNormals();
    if (!this.batches.has(mat)) this.batches.set(mat, []);
    this.batches.get(mat)!.push(g);
  }
  flushBatches() {
    for (const [mat, list] of this.batches) {
      const geo = mergeGeometries(list);
      list.forEach((g) => g.dispose());
      if (geo) {
        const m = new T.Mesh(geo, mat);
        m.receiveShadow = true;
        this.scene.add(m);
      }
    }
    this.batches.clear();
  }
  textBoard(text: string, width = 10, height = 2, bg = '#121a20', fg = '#f4f3e9') {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1024, 128);
    ctx.font = 'italic 900 65px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = fg;
    ctx.fillText(text, 512, 66);
    const texture = new T.CanvasTexture(canvas);
    texture.colorSpace = T.SRGBColorSpace;
    return new T.Mesh(
      new T.PlaneGeometry(width, height),
      new T.MeshBasicMaterial({ map: texture, side: T.DoubleSide }),
    );
  }
  startFinish() {
    const base = track.at(0);
    const group = new T.Group();
    group.position.set(base.x, 0, base.z);
    group.rotation.y = base.heading;
    for (let x = -9; x < 9; x++)
      for (let z = 0; z < 2; z++) {
        const square = new T.Mesh(
          new T.PlaneGeometry(1, 1),
          new T.MeshStandardMaterial({
            color: (x + z) % 2 === 0 ? 0xf4eee0 : 0x1b2225,
            roughness: 0.8,
          }),
        );
        square.rotation.x = -Math.PI / 2;
        square.position.set(x + 0.5, 0.065, z - 0.5);
        group.add(square);
      }
    for (const x of [-12, 12]) {
      const post = new T.Mesh(
        new T.BoxGeometry(0.5, 7, 0.5),
        new T.MeshStandardMaterial({ color: 0x414c51 }),
      );
      post.position.set(x, 3.5, 0);
      group.add(post);
    }
    const board = this.textBoard('APEX  /  GRAND PRIX', 25, 2);
    board.position.y = 7;
    group.add(board);
    this.scene.add(group);
    for (let i = 0; i < 10; i++) {
      const p = track.at(track.length - 10 - i * 8, (i % 2 ? 1 : -1) * 4);
      const mark = new T.Mesh(
        new T.PlaneGeometry(2.7, 0.12),
        new T.MeshBasicMaterial({ color: 0xe0ddd1 }),
      );
      mark.rotation.set(-Math.PI / 2, 0, -p.heading);
      mark.position.set(p.x, 0.06, p.z);
      this.scene.add(mark);
    }
  }
  buildings() {
    const p = track.at(70, -48),
      group = new T.Group();
    group.position.set(p.x, 0, p.z);
    group.rotation.y = p.heading;
    const box = (x: number, y: number, z: number, w: number, h: number, d: number, c: number) => {
      const m = new T.Mesh(
        new T.BoxGeometry(w, h, d),
        new T.MeshStandardMaterial({ color: c, roughness: 0.65 }),
      );
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      group.add(m);
    };
    box(0, 3, 0, 20, 6, 95, 0xc5c7bd);
    box(0, 6.5, 0, 22, 0.8, 100, 0xe4e6df);
    box(2, 9, 0, 16, 4, 85, 0x899c9e);
    box(2, 11, 0, 18, 0.6, 87, 0xdde1d9);
    for (let z = -38; z < 44; z += 12) {
      box(10.05, 2.2, z, 0.08, 4.2, 9, 0x2a343c);
      box(10.1, 4.9, z, 0.1, 0.5, 9, 0xe74734);
    }
    const b = this.textBoard('APEX VALLEY  /  MOTORSPORT PARK', 60, 3);
    b.position.set(2, 13, 0);
    b.rotation.y = Math.PI / 2;
    group.add(b);
    this.scene.add(group);
    for (const s of [140, 400, 1550, 2650]) {
      const at = track.at(s, 48),
        stand = new T.Group();
      stand.position.set(at.x, 0, at.z);
      stand.rotation.y = at.heading;
      for (let row = 0; row < 8; row++) {
        const mesh = new T.Mesh(
          new T.BoxGeometry(2, 1, 65),
          new T.MeshStandardMaterial({ color: row % 2 ? 0xa62d2c : 0xebe6d9 }),
        );
        mesh.position.set(row * 1.8, row * 0.85 + 1, 0);
        mesh.castShadow = true;
        stand.add(mesh);
      }
      const roof = new T.Mesh(
        new T.BoxGeometry(22, 0.35, 72),
        new T.MeshStandardMaterial({ color: 0xdfe4de, metalness: 0.5, roughness: 0.5 }),
      );
      roof.position.set(7, 10, 0);
      stand.add(roof);
      this.scene.add(stand);
    }
    for (let s = 250; s < track.length; s += 160) {
      const at = track.at(s, 20);
      const board = this.textBoard(s % 320 === 250 ? 'APEX GP' : 'PURE RACING', 12, 1.8);
      board.position.set(at.x, 1.4, at.z);
      board.rotation.y = at.heading;
      this.scene.add(board);
    }
  }

  pitLane() {
    const mat = new T.MeshStandardMaterial({ color: 0x3e4548, roughness: 0.9, side: T.DoubleSide });
    for (let s = track.length - 150; s < track.length + 210; s += track.step) {
      const off = pit.offset(s % track.length);
      this.segment(s / track.step, 1, off - 2.5, off + 2.5, 0.08, mat);
    }
    for (let i = 0; i < 9; i++) {
      const p = track.at(pit.boxStart + i * 12, -15);
      const mark = new T.Mesh(
        new T.PlaneGeometry(4, 6),
        new T.MeshStandardMaterial({ color: i === 0 ? 0xc24935 : 0xbbb892, roughness: 0.9 }),
      );
      mark.position.set(p.x, 0.085, p.z);
      mark.rotation.set(-Math.PI / 2, 0, -p.heading);
      this.scene.add(mark);
    }
    const p = track.at(track.length - 130, -20),
      sign = this.textBoard('PIT  /  80', 8, 1.8);
    sign.position.set(p.x, 2, p.z);
    sign.rotation.y = p.heading;
    this.scene.add(sign);
  }
  batchStatic() {
    this.scene.updateMatrixWorld(true);
    const groups = new Map<
      string,
      {
        material: T.MeshStandardMaterial;
        geometries: T.BufferGeometry[];
        cast: boolean;
        receive: boolean;
      }
    >();
    const meshes: T.Mesh[] = [];
    this.scene.traverse((o) => {
      if (
        o instanceof T.Mesh &&
        !(o instanceof T.InstancedMesh) &&
        o.material instanceof T.MeshStandardMaterial &&
        o.material !== this.road &&
        !o.material.map
      )
        meshes.push(o);
    });
    const oldMaterials = new Set<T.Material>();
    for (const mesh of meshes) {
      const material = mesh.material as T.MeshStandardMaterial;
      const key = [
        material.roughness,
        material.metalness,
        material.side,
        material.flatShading,
        mesh.castShadow,
        mesh.receiveShadow,
      ].join('|');
      if (!groups.has(key))
        groups.set(key, {
          material: new T.MeshStandardMaterial({
            color: 0xffffff,
            roughness: material.roughness,
            metalness: material.metalness,
            side: material.side,
            flatShading: material.flatShading,
            vertexColors: true,
          }),
          geometries: [],
          cast: mesh.castShadow,
          receive: mesh.receiveShadow,
        });
      const g = (
        mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone()
      ).applyMatrix4(mesh.matrixWorld);
      g.deleteAttribute('uv');
      const colors = new Float32Array(g.attributes.position.count * 3);
      for (let i = 0; i < colors.length; i += 3) {
        colors[i] = material.color.r;
        colors[i + 1] = material.color.g;
        colors[i + 2] = material.color.b;
      }
      g.setAttribute('color', new T.BufferAttribute(colors, 3));
      groups.get(key)!.geometries.push(g);
      mesh.removeFromParent();
      mesh.geometry.dispose();
      oldMaterials.add(material);
    }
    oldMaterials.forEach((m) => m.dispose());
    for (const group of groups.values()) {
      const geometry = mergeGeometries(group.geometries);
      group.geometries.forEach((g) => g.dispose());
      if (geometry) {
        const mesh = new T.Mesh(geometry, group.material);
        mesh.castShadow = group.cast;
        mesh.receiveShadow = group.receive;
        this.scene.add(mesh);
      }
    }
  }
  applyQualityMaterials(root: T.Object3D = this.scene) {
    root.traverse((o) => {
      if (!(o instanceof T.Mesh)) return;
      const original = (o.userData.originalMaterial ?? o.material) as T.Material;
      if (!(original instanceof T.MeshStandardMaterial)) return;
      o.userData.originalMaterial = original;
      if (this.quality === 'low') {
        let low = this.lowMaterials.get(original);
        if (!low) {
          low = new T.MeshLambertMaterial({
            color: original.color,
            side: original.side,
            vertexColors: original.vertexColors,
            flatShading: original.flatShading,
            transparent: original.transparent,
            opacity: original.opacity,
            depthWrite: original.depthWrite,
          });
          low.color = original.color;
          this.lowMaterials.set(original, low);
        }
        o.material = low;
      } else o.material = original;
    });
  }
  setCars(cars: Car[]) {
    for (const [id, model] of this.models) {
      {
        this.scene.remove(model);
        model.traverse((o) => {
          if (o instanceof T.Mesh) {
            if (o instanceof T.InstancedMesh) o.dispose();
            o.geometry.dispose();
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            mats.forEach((m) => m.dispose());
            if (o.userData.originalMaterial && o.userData.originalMaterial !== o.material)
              o.userData.originalMaterial.dispose();
          }
        });
        this.models.delete(id);
      }
    }
    for (const c of cars) {
      if (!this.models.has(c.id)) {
        const model = carModel(c.color, c.compound);
        this.models.set(c.id, model);
        this.scene.add(model);
      }
    }
    this.applyQualityMaterials();
  }
  setWeather(mode: WeatherMode) {
    this.weather = mode;
    const night = mode === 'night',
      rain = mode === 'rain',
      dusk = mode === 'dusk';
    const sky = this.sky.material as T.ShaderMaterial;
    sky.uniforms.top.value.set(night ? 0x061020 : rain ? 0x566975 : dusk ? 0x344970 : 0x448abc);
    sky.uniforms.bottom.value.set(night ? 0x182839 : rain ? 0xa0adb0 : dusk ? 0xf3b584 : 0xd9dbd0);
    this.ambient.intensity = night ? 0.8 : rain ? 1.6 : 2;
    this.ambient.color.set(dusk ? 0x9cadce : 0xc8e3ff);
    this.sun.intensity = night ? 0.35 : rain ? 0.8 : dusk ? 2.8 : 3.3;
    this.sun.color.set(dusk ? 0xffab63 : 0xffe0ba);
    (this.scene.fog as T.FogExp2).color.copy(sky.uniforms.bottom.value);
    (this.scene.fog as T.FogExp2).density = rain ? 0.0012 : night ? 0.0009 : 0.00043;
    this.renderer.toneMappingExposure = night ? 1.6 : 1.15;
    if (this.road) {
      this.road.roughness = rain ? 0.32 : 0.94;
      this.road.color.set(rain ? 0x222d35 : 0x32393d);
    }
    if (this.rain) this.rain.visible = rain;
    if (this.spray) this.spray.visible = rain;
    this.floods.forEach((l, i) => {
      this.scene.remove(l);
      if (night && i < (this.quality === 'low' ? 2 : 6)) this.scene.add(l);
    });
  }
  setGhost(sample: Sample | undefined) {
    if (!sample) {
      if (this.ghost) this.ghost.visible = false;
      return;
    }
    if (!this.ghost) {
      this.ghost = carModel(0x86f8eb, 'medium');
      this.ghost.traverse((o) => {
        if (o instanceof T.Mesh) {
          const m = (o.material as T.Material).clone();
          m.transparent = true;
          m.opacity = 0.28;
          m.depthWrite = false;
          o.material = m;
          o.castShadow = false;
        }
      });
      this.scene.add(this.ghost);
      this.applyQualityMaterials(this.ghost);
    }
    this.ghost.visible = true;
    this.ghost.position.set(sample.x, 0.09, sample.z);
    this.ghost.rotation.y = sample.heading;
  }
  setQuality(q: Quality) {
    this.quality = q;
    this.applyQualityMaterials();
    this.renderer.setPixelRatio(
      Math.min(devicePixelRatio, q === 'low' ? 0.85 : q === 'medium' ? 1.5 : 2),
    );
    this.renderer.shadowMap.enabled = q !== 'low';
    this.sun.shadow.mapSize.setScalar(q === 'high' ? 2048 : 1024);
    this.sun.shadow.map?.dispose();
    this.sun.shadow.map = null;
    if (this.rain)
      this.rain.geometry.setDrawRange(0, q === 'low' ? 300 : q === 'medium' ? 800 : 1800);
    this.setWeather(this.weather);
    this.resize();
  }
  resize() {
    const w = window.innerWidth,
      h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
  render(cars: Car[], dt: number, menu = false, active = true) {
    this.frame++;
    for (const c of cars) {
      const model = this.models.get(c.id);
      if (model) {
        model.position.set(c.x, 0.06, c.z);
        model.rotation.y = c.heading;
        (model.userData.flap as T.Mesh).rotation.x = c.drsActive ? -0.48 : 0;
        (model.userData.frontWing as T.Mesh).scale.x = 1 - c.damage * 0.3;
        (model.userData.rainLight as T.Mesh).visible =
          c.wetness > 0.2 && Math.floor(performance.now() / 350) % 2 === 0;
        const wheels = model.userData.wheels as T.Object3D[],
          parts = model.userData.wheelParts as T.InstancedMesh[];
        (parts[2].material as T.MeshStandardMaterial).color.set(compounds[c.compound].color);
        wheels.forEach((w, i) => {
          w.rotation.y = i >= 2 ? c.steer : 0;
          if (active) w.rotation.x += (c.speed * dt) / 0.38;
          w.updateMatrix();
          parts[0].setMatrixAt(i, w.matrix);
          parts[1].setMatrixAt(i, w.matrix);
          this.wheelMatrix
            .copy(w.matrix)
            .multiply(this.wheelOffset.makeTranslation(Math.sign(w.position.x) * 0.18, 0, 0));
          parts[2].setMatrixAt(i, this.wheelMatrix);
        });
        parts.forEach((p) => (p.instanceMatrix.needsUpdate = true));
      }
    }
    const c = cars[0],
      sn = Math.sin(c.heading),
      cs = Math.cos(c.heading);
    let pos: T.Vector3, target: T.Vector3;
    if (menu) {
      pos = new T.Vector3(c.x + 11, 5, c.z + 13);
      target = new T.Vector3(c.x, 1, c.z);
    } else if (this.cameraMode === 2) {
      pos = new T.Vector3(c.x + sn * 0.5, 1.36, c.z + cs * 0.5);
      target = new T.Vector3(c.x + sn * 60, 1.3, c.z + cs * 60);
    } else {
      const back = this.cameraMode === 1 ? 6 : 10;
      pos = new T.Vector3(c.x - sn * back, this.cameraMode === 1 ? 2.9 : 5.4, c.z - cs * back);
      target = new T.Vector3(c.x + sn * 12, 1.15, c.z + cs * 12);
    }
    this.camera.position.lerp(pos, menu ? 1 : 1 - Math.exp(-dt * (this.reducedMotion ? 18 : 9)));
    this.camera.lookAt(target);
    this.camera.fov =
      58 + (menu || this.reducedMotion ? 0 : Math.min(10, Math.abs(c.speed) * 0.09));
    this.camera.updateProjectionMatrix();
    this.sky.position.copy(this.camera.position);
    this.sun.position.set(c.x - 180, this.weather === 'dusk' ? 110 : 350, c.z + 160);
    this.sun.target.position.set(c.x, 0, c.z);
    this.floods.forEach((light, i) => {
      const p = track.at(Math.floor(c.distance / 140) * 140 + (i - 1) * 140, 21);
      light.position.set(p.x, 13, p.z);
    });
    if (this.rain.visible) {
      this.rain.position.set(c.x, 0, c.z);
      for (let i = 1; i < this.rainPositions.length; i += 3) {
        this.rainPositions[i] -= dt * 27;
        if (this.rainPositions[i] < 0) this.rainPositions[i] = 55;
      }
      this.rain.geometry.attributes.position.needsUpdate = true;
    }
    if (this.spray?.visible) {
      let n = 0;
      for (const car of cars) {
        if (Math.abs(car.speed) < 8 || car.wetness < 0.1) continue;
        for (let j = 0; j < (this.quality === 'low' ? 8 : 40); j++) {
          const age = (this.frame * 0.017 + j * 0.17) % 1,
            back = 2 + age * 12;
          this.sprayPositions[n++] =
            car.x - Math.sin(car.heading) * back + Math.sin(j * 23) * age * 3;
          this.sprayPositions[n++] = 0.4 + age * 1.8;
          this.sprayPositions[n++] =
            car.z - Math.cos(car.heading) * back + Math.cos(j * 13) * age * 3;
        }
      }
      this.spray.geometry.setDrawRange(0, n / 3);
      this.spray.geometry.attributes.position.needsUpdate = true;
    }
    this.renderer.render(this.scene, this.camera);
  }
}
