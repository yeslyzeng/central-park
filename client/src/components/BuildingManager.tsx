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

// Helper to map real-world location to game coordinates
// Game world assumptions (based on previous version):
// Center (0,0) is roughly middle of park
// Park width (East-West) is approx 20 units (-10 to 10)
// Park length (North-South) is approx 50 units (-25 to 25)
// 59th St = z: 25 (South)
// 110th St = z: -25 (North)
// 5th Ave = x: 10 (East)
// 8th Ave (CPW) = x: -10 (West)

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

const BuildingGeometry = ({ style, height, color }: { style: string, height: number, color: string }) => {
  // Simplified geometries for different styles
  // In a real implementation, we might use different meshes for different styles
  // For now, we'll use scale and color to differentiate
  
  // Base scale unit
  const scaleY = Math.max(1, height * 0.15); 
  
  return (
    <group>
      <mesh position={[0, scaleY / 2, 0]}>
        <boxGeometry args={[1.5, scaleY, 1.5]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      {/* Roof detail based on style */}
      {style.includes('twin') && (
        <>
           <mesh position={[-0.4, scaleY + 0.5, 0]}>
            <boxGeometry args={[0.5, 1, 0.5]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0.4, scaleY + 0.5, 0]}>
            <boxGeometry args={[0.5, 1, 0.5]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </>
      )}
      {style.includes('supertall') && (
         <mesh position={[0, scaleY + 2, 0]}>
            <coneGeometry args={[0.5, 4, 4]} />
            <meshStandardMaterial color={color} />
          </mesh>
      )}
       {style.includes('chateau') && (
         <mesh position={[0, scaleY + 0.75, 0]}>
            <coneGeometry args={[1.0, 1.5, 4]} />
            <meshStandardMaterial color="#506070" /> 
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
            <BuildingGeometry style={b.style} height={b.height} color={b.color} />
            {/* Optional: Text label for debugging or interaction */}
          </group>
        );
      })}
    </group>
  );
};
