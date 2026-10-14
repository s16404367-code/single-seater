import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { compounds, type Compound } from './setup';
const material = (color: number, metalness = 0.3, roughness = 0.45) =>
  new T.MeshStandardMaterial({ color, metalness, roughness });
export function carModel(color: number, compound: Compound) {
  const group = new T.Group(),
    paint = material(color),
    dark = material(0x16191d, 0.2, 0.6),
    white = material(0xe9eced),
    rubber = material(0x141619, 0, 0.92),
    metal = material(0x707780, 0.75, 0.3);
  const box = (x: number, y: number, z: number, w: number, h: number, d: number, m: T.Material) => {
    const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };
  box(0, 0.28, 0, 1.5, 0.12, 4.3, dark);
  box(0, 0.57, -0.3, 0.72, 0.5, 2.1, paint);
  box(0, 0.43, 1.23, 0.37, 0.28, 1.75, paint);
  for (const side of [-1, 1]) {
    const pod = box(side * 0.66, 0.48, -0.45, 0.5, 0.45, 1.65, paint);
    pod.rotation.y = side * -0.07;
    box(side * 0.68, 0.72, -0.3, 0.36, 0.03, 1.25, dark);
    box(side * 0.63, 0.61, 0.37, 0.28, 0.16, 0.04, dark);
  }
  const frontWing = box(0, 0.23, 2.02, 2.1, 0.1, 0.45, dark);
  box(0, 0.35, 1.98, 1.9, 0.07, 0.22, paint);
  for (const x of [-1.03, 1.03]) box(x, 0.34, 2.03, 0.055, 0.3, 0.5, paint);
  box(0, 0.85, -1.91, 1.87, 0.12, 0.5, paint);
  const flap = box(0, 1, -1.97, 1.8, 0.12, 0.32, paint);
  for (const x of [-0.94, 0.94]) box(x, 0.79, -1.9, 0.05, 0.64, 0.62, dark);
  for (const x of [-0.36, 0.36]) box(x, 0.58, -1.9, 0.06, 0.55, 0.1, dark);
  box(0, 0.86, -0.88, 0.4, 0.65, 0.65, paint);
  box(0, 1.19, -0.7, 0.24, 0.16, 0.24, dark);
  box(0, 0.85, 0.03, 0.48, 0.2, 0.7, dark);
  const helmet = new T.Mesh(new T.SphereGeometry(0.22, 16, 10), material(0xe5ed31));
  helmet.position.set(0, 1.01, 0.08);
  group.add(helmet);
  box(0, 1.02, 0.265, 0.31, 0.07, 0.04, dark);
  const halo = new T.Mesh(new T.TorusGeometry(0.43, 0.045, 6, 20, Math.PI), dark);
  halo.rotation.x = Math.PI / 2;
  halo.position.set(0, 1.17, 0.11);
  group.add(halo);
  box(0, 0.98, 0.57, 0.04, 0.4, 0.04, dark);
  const wheels: T.Object3D[] = [];
  const wheelParts = [
    new T.InstancedMesh(
      new T.CylinderGeometry(0.38, 0.38, 0.35, 20).rotateZ(Math.PI / 2),
      rubber,
      4,
    ),
    new T.InstancedMesh(
      new T.CylinderGeometry(0.19, 0.19, 0.37, 12).rotateZ(Math.PI / 2),
      metal,
      4,
    ),
    new T.InstancedMesh(
      new T.TorusGeometry(0.31, 0.015, 4, 24).rotateY(Math.PI / 2),
      material(compounds[compound].color),
      4,
    ),
  ];
  for (const z of [-1.36, 1.32])
    for (const x of [-1.03, 1.03]) {
      const pivot = new T.Object3D();
      pivot.position.set(x, 0.38, z);
      pivot.rotation.order = 'YXZ';
      pivot.updateMatrix();
      const i = wheels.length;
      wheelParts[0].setMatrixAt(i, pivot.matrix);
      wheelParts[1].setMatrixAt(i, pivot.matrix);
      wheelParts[2].setMatrixAt(
        i,
        pivot.matrix.clone().multiply(new T.Matrix4().makeTranslation(Math.sign(x) * 0.18, 0, 0)),
      );
      wheels.push(pivot);
      const rod = box(x * 0.5, 0.39, z, 0.95, 0.04, 0.055, dark);
      rod.rotation.y = x > 0 ? 0.2 : -0.2;
    }
  const rainLight = box(
    0,
    0.53,
    -2.17,
    0.13,
    0.08,
    0.03,
    new T.MeshBasicMaterial({ color: 0xff3020 }),
  );
  // Original number, not a team mark.
  box(0, 0.579, 1.3, 0.055, 0.012, 0.25, white);
  const batches = new Map<T.Material, T.BufferGeometry[]>();
  for (const child of [...group.children])
    if (child instanceof T.Mesh && child !== flap && child !== frontWing && child !== rainLight) {
      child.updateMatrix();
      const geo = child.geometry.clone().applyMatrix4(child.matrix);
      const mat = child.material as T.Material;
      if (!batches.has(mat)) batches.set(mat, []);
      batches.get(mat)!.push(geo);
      group.remove(child);
      child.geometry.dispose();
    }
  for (const [mat, geos] of batches) {
    const geo = mergeGeometries(geos);
    geos.forEach((g) => g.dispose());
    if (geo) {
      const m = new T.Mesh(geo, mat);
      m.castShadow = true;
      m.receiveShadow = true;
      group.add(m);
    }
  }
  wheelParts.forEach((part) => {
    part.castShadow = true;
    group.add(part);
  });
  group.userData = { wheels, wheelParts, flap, frontWing, rainLight };
  return group;
}
