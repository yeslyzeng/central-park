import { useMemo } from 'react';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three-stdlib';

// Reusable geometry builders for iconic buildings
const createEmpireState = () => {
  const geometries: THREE.BufferGeometry[] = [];
  
  // Base
  const base = new THREE.BoxGeometry(2, 5, 1.5);
  base.translate(0, 2.5, 0);
  geometries.push(base);
  
  // Mid section
  const mid = new THREE.BoxGeometry(1.5, 4, 1.2);
  mid.translate(0, 6, 0);
  geometries.push(mid);
  
  // Top section
  const top = new THREE.BoxGeometry(1, 3, 1);
  top.translate(0, 9, 0);
  geometries.push(top);
  
  // Spire
  const spire = new THREE.ConeGeometry(0.2, 3, 8);
  spire.translate(0, 12, 0);
  geometries.push(spire);

  return BufferGeometryUtils.mergeBufferGeometries(geometries);
};

const createChrysler = () => {
  const geometries: THREE.BufferGeometry[] = [];
  
  // Base
  const base = new THREE.BoxGeometry(1.8, 6, 1.8);
  base.translate(0, 3, 0);
  geometries.push(base);
  
  // Crown (approximated with stacked cylinders)
  for(let i = 0; i < 5; i++) {
    const size = 1.8 - (i * 0.3);
    const crown = new THREE.CylinderGeometry(size * 0.8, size, 1, 8);
    crown.translate(0, 6.5 + i, 0);
    geometries.push(crown);
  }
  
  // Spire
  const spire = new THREE.ConeGeometry(0.1, 4, 8);
  spire.translate(0, 13, 0);
  geometries.push(spire);

  return BufferGeometryUtils.mergeBufferGeometries(geometries);
};

const create432Park = () => {
  // Super tall, thin, square
  const geo = new THREE.BoxGeometry(1, 14, 1);
  geo.translate(0, 7, 0);
  return geo;
};

const createOneVanderbilt = () => {
  const geometries: THREE.BufferGeometry[] = [];
  
  // Tapered base
  const base = new THREE.BoxGeometry(2, 8, 2);
  base.translate(0, 4, 0);
  geometries.push(base);
  
  // Tapered top
  const top = new THREE.BoxGeometry(1.5, 4, 1.5);
  top.translate(0, 10, 0);
  geometries.push(top);
  
  // Spire
  const spire = new THREE.BoxGeometry(0.5, 3, 0.5);
  spire.translate(0, 13.5, 0);
  geometries.push(spire);

  return BufferGeometryUtils.mergeBufferGeometries(geometries);
};

export const LandmarkGeometries = {
  EmpireState: createEmpireState,
  Chrysler: createChrysler,
  Park432: create432Park,
  OneVanderbilt: createOneVanderbilt,
};
