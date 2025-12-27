import * as THREE from 'three';
import { useMemo } from 'react';

export const ParkTerrain = () => {
  // Central Park is roughly 4km x 0.8km (5:1 ratio)
  // We'll scale it to 200 x 40 units in our scene
  
  const terrainGeo = useMemo(() => {
    // Create a plane with segments for terrain detail
    const geo = new THREE.PlaneGeometry(40, 200, 40, 200);
    geo.rotateX(-Math.PI / 2);
    
    const posAttribute = geo.attributes.position;
    const vertex = new THREE.Vector3();
    
    for (let i = 0; i < posAttribute.count; i++) {
      vertex.fromBufferAttribute(posAttribute, i);
      
      // Add rolling hills (Perlin-like noise)
      let height = Math.sin(vertex.x * 0.2) * Math.cos(vertex.z * 0.1) * 1.5;
      height += Math.sin(vertex.x * 0.5 + vertex.z * 0.5) * 0.5;
      
      // Flatten areas for water bodies
      
      // The Reservoir (North, large oval)
      // Approx Z range: -80 to -20
      const reservoirDist = Math.sqrt(Math.pow(vertex.x * 1.5, 2) + Math.pow((vertex.z + 50) * 0.8, 2));
      if (reservoirDist < 15) {
        height = -2; // Deep depression for water
      }
      
      // The Lake (South, irregular)
      // Approx Z range: 20 to 40
      const lakeDist = Math.sqrt(Math.pow(vertex.x, 2) + Math.pow((vertex.z - 30), 2));
      if (lakeDist < 10) {
        height = -1.5;
      }
      
      // Great Lawn (Center, flat)
      if (Math.abs(vertex.z + 10) < 10 && Math.abs(vertex.x) < 10) {
        height = 0.5; // Slightly raised flat area
      }

      posAttribute.setY(i, height);
    }
    
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group>
      {/* Snow-covered Terrain */}
      <mesh geometry={terrainGeo} receiveShadow>
        <meshStandardMaterial 
          color="#ffffff" 
          roughness={0.9} 
          metalness={0.1}
        />
      </mesh>
      
      {/* The Reservoir Water (Frozen) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -50]}>
        <planeGeometry args={[30, 40]} />
        <meshPhysicalMaterial
          color="#aaddff"
          roughness={0.05}
          metalness={0.1}
          transmission={0.6}
          thickness={2}
          ior={1.33}
        />
      </mesh>

      {/* The Lake Water (Frozen) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 30]}>
        <planeGeometry args={[25, 25]} />
        <meshPhysicalMaterial
          color="#aaddff"
          roughness={0.05}
          metalness={0.1}
          transmission={0.6}
          thickness={2}
          ior={1.33}
        />
      </mesh>
    </group>
  );
};
