import * as THREE from 'three';
import * as BufferGeometryUtils from 'three-stdlib';

// Reusable geometry builders for iconic buildings (Toy Versions)

const createEmpireState = () => {
  const geometries: THREE.BufferGeometry[] = [];
  
  // Base - Chunky
  const base = new THREE.BoxGeometry(5, 10, 5);
  base.translate(0, 5, 0);
  geometries.push(base);
  
  // Mid section - Simple Step
  const mid = new THREE.BoxGeometry(3.5, 12, 3.5);
  mid.translate(0, 16, 0);
  geometries.push(mid);
  
  // Top section
  const top = new THREE.BoxGeometry(2, 8, 2);
  top.translate(0, 26, 0);
  geometries.push(top);
  
  // Spire - Thick and cute
  const spire = new THREE.CylinderGeometry(0.5, 1, 6, 8);
  spire.translate(0, 33, 0);
  geometries.push(spire);

  const merged = BufferGeometryUtils.mergeBufferGeometries(geometries);
  if (merged) merged.translate(0, 0, 0);
  return merged || new THREE.BoxGeometry(1, 1, 1);
};

const createChrysler = () => {
  const geometries: THREE.BufferGeometry[] = [];
  
  // Base
  const base = new THREE.BoxGeometry(4.5, 18, 4.5);
  base.translate(0, 9, 0);
  geometries.push(base);
  
  // Crown - Scalloped look with stacked cylinders
  for(let i=0; i<4; i++) {
    const size = 4.5 - i*1.0;
    const crown = new THREE.CylinderGeometry(size*0.6, size, 2.5, 16);
    crown.translate(0, 19.25 + i*2.5, 0);
    geometries.push(crown);
  }
  
  // Spire
  const spire = new THREE.CylinderGeometry(0.2, 0.8, 8, 8);
  spire.translate(0, 33, 0);
  geometries.push(spire);

  const merged = BufferGeometryUtils.mergeBufferGeometries(geometries);
  if (merged) merged.translate(0, 0, 0);
  return merged || new THREE.BoxGeometry(1, 1, 1);
};

const create432Park = () => {
  // Super tall, thin, square - Toy block style
  const geo = new THREE.BoxGeometry(2.5, 35, 2.5);
  geo.translate(0, 17.5, 0);
  return geo;
};

const createOneVanderbilt = () => {
  const geometries: THREE.BufferGeometry[] = [];
  
  // Tapered base - Chunky
  const base = new THREE.BoxGeometry(5, 15, 5);
  base.translate(0, 7.5, 0);
  geometries.push(base);
  
  // Tapered top
  const top = new THREE.BoxGeometry(3.5, 10, 3.5);
  top.translate(0, 20, 0);
  geometries.push(top);
  
  // Spire
  const spire = new THREE.BoxGeometry(1, 6, 1);
  spire.translate(0, 28, 0);
  geometries.push(spire);

  const merged = BufferGeometryUtils.mergeBufferGeometries(geometries);
  if (merged) merged.translate(0, 0, 0);
  return merged || new THREE.BoxGeometry(1, 1, 1);
};

export const LandmarkGeometries = {
  EmpireState: createEmpireState,
  Chrysler: createChrysler,
  Park432: create432Park,
  OneVanderbilt: createOneVanderbilt,
};
