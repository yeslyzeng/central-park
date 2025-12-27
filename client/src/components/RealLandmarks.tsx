import * as THREE from 'three';
import * as BufferGeometryUtils from 'three-stdlib';

// --- Central Park West Icons ---

export const SanRemo = () => {
  const geometries: THREE.BufferGeometry[] = [];
  
  // Main Base (U-shape approx)
  const base = new THREE.BoxGeometry(8, 12, 6);
  base.translate(0, 6, 0);
  geometries.push(base);

  // Twin Towers
  const towerGeo = new THREE.BoxGeometry(2.5, 10, 2.5);
  
  // North Tower
  const t1 = towerGeo.clone();
  t1.translate(-2, 17, 0);
  geometries.push(t1);
  
  // South Tower
  const t2 = towerGeo.clone();
  t2.translate(2, 17, 0);
  geometries.push(t2);

  // Temples on top (Cylinders)
  const templeGeo = new THREE.CylinderGeometry(1, 1, 2, 8);
  const temple1 = templeGeo.clone();
  temple1.translate(-2, 23, 0);
  geometries.push(temple1);
  
  const temple2 = templeGeo.clone();
  temple2.translate(2, 23, 0);
  geometries.push(temple2);

  const merged = BufferGeometryUtils.mergeBufferGeometries(geometries);
  return merged || new THREE.BoxGeometry(1, 1, 1);
};

export const TheDakota = () => {
  const geometries: THREE.BufferGeometry[] = [];
  
  // Main Block (Square with courtyard hint)
  const base = new THREE.BoxGeometry(6, 6, 6);
  base.translate(0, 3, 0);
  geometries.push(base);

  // Gabled Roofs (Pyramids/Prisms)
  // Corner 1
  const roof = new THREE.ConeGeometry(1.5, 3, 4);
  roof.rotateY(Math.PI/4);
  
  const r1 = roof.clone(); r1.translate(-2, 7.5, -2); geometries.push(r1);
  const r2 = roof.clone(); r2.translate(2, 7.5, -2); geometries.push(r2);
  const r3 = roof.clone(); r3.translate(-2, 7.5, 2); geometries.push(r3);
  const r4 = roof.clone(); r4.translate(2, 7.5, 2); geometries.push(r4);

  const merged = BufferGeometryUtils.mergeBufferGeometries(geometries);
  return merged || new THREE.BoxGeometry(1, 1, 1);
};

// --- Fifth Avenue Icons ---

export const Guggenheim = () => {
  const geometries: THREE.BufferGeometry[] = [];
  
  // The Spiral (Stacked cylinders getting wider)
  for(let i=0; i<4; i++) {
    const radius = 2 + (i * 0.5); // Getting wider at top
    const ring = new THREE.CylinderGeometry(radius, radius*0.95, 1.5, 16);
    ring.translate(0, 1 + (i*1.5), 0);
    geometries.push(ring);
  }
  
  // Annex building (Rectangular)
  const annex = new THREE.BoxGeometry(3, 8, 3);
  annex.translate(4, 4, 0);
  geometries.push(annex);

  const merged = BufferGeometryUtils.mergeBufferGeometries(geometries);
  return merged || new THREE.BoxGeometry(1, 1, 1);
};

export const ThePlaza = () => {
  const geometries: THREE.BufferGeometry[] = [];
  
  // Main Block (L-shape or U-shape)
  const base = new THREE.BoxGeometry(8, 10, 6);
  base.translate(0, 5, 0);
  geometries.push(base);

  // Green Roof (Mansard style - approximated with truncated pyramid)
  const roof = new THREE.CylinderGeometry(3, 5, 3, 4); // Pyramid-ish
  roof.rotateY(Math.PI/4);
  roof.translate(0, 11.5, 0);
  geometries.push(roof);

  const merged = BufferGeometryUtils.mergeBufferGeometries(geometries);
  return merged || new THREE.BoxGeometry(1, 1, 1);
};

export const TheMet = () => {
  const geometries: THREE.BufferGeometry[] = [];
  
  // Main Facade (Long, low)
  const main = new THREE.BoxGeometry(12, 4, 5);
  main.translate(0, 2, 0);
  geometries.push(main);

  // Central Dome/Entrance
  const entrance = new THREE.BoxGeometry(4, 5, 6);
  entrance.translate(0, 2.5, 0.5);
  geometries.push(entrance);

  const merged = BufferGeometryUtils.mergeBufferGeometries(geometries);
  return merged || new THREE.BoxGeometry(1, 1, 1);
};
