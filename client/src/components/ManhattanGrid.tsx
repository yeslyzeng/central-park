import * as THREE from 'three';
import { useMemo } from 'react';

// Manhattan Grid Constants
// 1 unit = 10 meters approx
const BLOCK_WIDTH = 8; // Avenue to Avenue (long blocks)
const BLOCK_HEIGHT = 2.5; // Street to Street (short blocks)
const STREET_WIDTH = 0.6;
const AVE_WIDTH = 1.0;

// Central Park Bounds (approx 59th to 110th St, 5th to 8th Ave)
const PARK_START_ST = 59;
const PARK_END_ST = 110;
const PARK_WIDTH_BLOCKS = 3; // 5th, 6th, 7th, 8th (3 blocks wide)

export const ManhattanGrid = () => {
  const gridGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];

    // Generate Grid from 50th St to 120th St, 3rd Ave to 10th Ave
    for (let st = 50; st <= 120; st++) {
      for (let ave = 3; ave <= 10; ave++) {
        
        // Check if block is inside Central Park
        const isInPark = (st >= PARK_START_ST && st < PARK_END_ST) && (ave >= 5 && ave < 8);
        
        if (!isInPark) {
          // Create City Block Base
          const width = (ave === 5 || ave === 8) ? BLOCK_WIDTH : BLOCK_WIDTH; // Simplified
          const height = BLOCK_HEIGHT;
          
          const x = (ave - 6.5) * (BLOCK_WIDTH + AVE_WIDTH);
          const z = -(st - 85) * (BLOCK_HEIGHT + STREET_WIDTH); // Center around 85th St
          
          const blockGeo = new THREE.BoxGeometry(BLOCK_WIDTH, 1, BLOCK_HEIGHT);
          blockGeo.translate(x, 0.5, z);
          geometries.push(blockGeo);
        }
      }
    }
    
    // Merge all blocks into one mesh for performance
    // Note: In a real app we'd use BufferGeometryUtils, but for this snippet we return array
    // We will use InstancedMesh in the main component for better perf
    return geometries;
  }, []);

  return null; // Logic moved to Scene for Instancing
};

// Helper to get position for a specific address
export const getAddressPosition = (street: number, avenue: number) => {
  const x = (avenue - 6.5) * (BLOCK_WIDTH + AVE_WIDTH);
  const z = -(street - 85) * (BLOCK_HEIGHT + STREET_WIDTH);
  return [x, 0, z];
};
