import * as THREE from 'three';
import * as BufferGeometryUtils from 'three-stdlib';

export const createSteppedBuildingGeometry = () => {
  const geometries: THREE.BufferGeometry[] = [];
  
  // Base
  const base = new THREE.BoxGeometry(1, 1, 1);
  base.translate(0, 0.5, 0);
  geometries.push(base);
  
  // Middle Step
  const mid = new THREE.BoxGeometry(0.8, 0.5, 0.8);
  mid.translate(0, 1.25, 0);
  geometries.push(mid);
  
  // Top Step
  const top = new THREE.BoxGeometry(0.6, 0.5, 0.6);
  top.translate(0, 1.75, 0);
  geometries.push(top);

  const merged = BufferGeometryUtils.mergeBufferGeometries(geometries);
  if (merged) {
    // Center the geometry so scaling works from bottom
    merged.translate(0, -0.5, 0);
  }
  return merged || new THREE.BoxGeometry(1, 1, 1);
};
