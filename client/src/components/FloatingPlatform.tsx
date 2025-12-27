import * as THREE from 'three';

export const FloatingPlatform = () => {
  return (
    <group position={[0, -5, 0]}>
      {/* Main Platform Block */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[100, 10, 100]} />
        <meshStandardMaterial color="#f0e6d2" roughness={1} />
      </mesh>
      
      {/* Waterfall / Ice Flow Effect (Sides) */}
      <mesh position={[0, -8, 0]}>
        <cylinderGeometry args={[60, 20, 20, 4]} />
        <meshStandardMaterial color="#aaddff" transparent opacity={0.4} />
      </mesh>
    </group>
  );
};
