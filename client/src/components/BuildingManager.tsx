import React, { useMemo } from 'react';
import { Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';
import buildingsData from '../data/buildings.json';

// Type definition for our building data
type BuildingData = {
  name: string;
  street?: number;
  avenue?: number;
  height: number;
  style: string;
  color: string;
  side: 'West' | 'East' | 'South' | 'North';
};

const STREET_TO_Z = (street: number) => {
  // Map 59-110 to 25 to -25
  const pct = (street - 59) / (110 - 59);
  return 25 - (pct * 50);
};

const AVENUE_TO_X = (avenue: number) => {
  // Map 5th (5) to 8th (8) -> 10 to -10
  // Note: Avenue numbers increase going West
  const pct = (avenue - 5) / (8 - 5);
  return 10 - (pct * 20);
};

// Architectural Material - Clean White/Grey
const ARCH_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#f0f0f0', // Very light grey/white
  roughness: 0.7,   // Matte finish
  metalness: 0.1,
});

const ACCENT_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#e0e0e0', // Slightly darker for details
  roughness: 0.7,
  metalness: 0.1,
});

const BuildingGeometry = ({ style, height }: { style: string, height: number }) => {
  // Base scale unit
  const scaleY = Math.max(1, height * 0.15); 
  
  return (
    <group>
      <mesh position={[0, scaleY / 2, 0]} castShadow receiveShadow material={ARCH_MATERIAL}>
        <boxGeometry args={[1.5, scaleY, 1.5]} />
      </mesh>
      
      {/* Roof detail based on style */}
      {style.includes('twin') && (
        <>
           <mesh position={[-0.4, scaleY + 0.5, 0]} castShadow receiveShadow material={ACCENT_MATERIAL}>
            <boxGeometry args={[0.5, 1, 0.5]} />
          </mesh>
          <mesh position={[0.4, scaleY + 0.5, 0]} castShadow receiveShadow material={ACCENT_MATERIAL}>
            <boxGeometry args={[0.5, 1, 0.5]} />
          </mesh>
        </>
      )}
      {style.includes('supertall') && (
         <mesh position={[0, scaleY + 2, 0]} castShadow receiveShadow material={ACCENT_MATERIAL}>
            <coneGeometry args={[0.5, 4, 4]} />
          </mesh>
      )}
       {style.includes('chateau') && (
         <mesh position={[0, scaleY + 0.75, 0]} castShadow receiveShadow material={ACCENT_MATERIAL}>
            <coneGeometry args={[1.0, 1.5, 4]} />
          </mesh>
      )}
    </group>
  );
};

export const BuildingManager: React.FC = () => {
  const buildings = buildingsData as BuildingData[];

  return (
    <group>
      {buildings.map((b, i) => {
        let x = 0;
        let z = 0;
        let rotY = 0;

        if (b.side === 'West') {
          x = -12; // Slightly outside the park boundary
          z = STREET_TO_Z(b.street || 72);
          rotY = Math.PI / 2;
        } else if (b.side === 'East') {
          x = 12;
          z = STREET_TO_Z(b.street || 72);
          rotY = -Math.PI / 2;
        } else if (b.side === 'South') {
          z = 27;
          x = AVENUE_TO_X(b.avenue || 6.5);
          rotY = 0;
        } else if (b.side === 'North') {
          z = -27;
          x = AVENUE_TO_X(b.avenue || 6.5);
          rotY = Math.PI;
        }

        return (
          <group key={`${b.name}-${i}`} position={[x, 0, z]} rotation={[0, rotY, 0]}>
            {/* Ignore the pastel color from JSON, use architectural material */}
            <BuildingGeometry style={b.style} height={b.height} />
          </group>
        );
      })}
    </group>
  );
};
