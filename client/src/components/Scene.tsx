import { Canvas } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { getAddressPosition } from './ManhattanGrid';
import { landmarkData } from './AccurateLandmarks';

// --- Pink Map Aesthetic Constants ---
const COLORS = {
  bg: '#f0f2f5', // Light grey/white background
  park: '#e64980', // Deep Pink for Park (Reference style)
  block: '#ffffff', // White blocks
  blockOutline: '#dee2e6', // Light grey outlines
  landmark: '#d6336c', // Pink accent for landmarks
  water: '#faa2c1', // Light pink for water
};

const CityGrid = () => {
  const { blockGeo, blockPos } = useMemo(() => {
    const positions: number[] = [];
    const geometries: THREE.BufferGeometry[] = [];
    
    // Generate Grid: 59th to 110th St (Park length) + buffer
    for (let st = 55; st <= 115; st++) {
      for (let ave = 4; ave <= 9; ave++) { // 5th to 8th + buffer
        
        // Check if inside Central Park (59-110, 5th-8th Ave)
        const isPark = (st >= 59 && st < 110) && (ave >= 5 && ave < 8);
        
        if (!isPark) {
          const [x, y, z] = getAddressPosition(st, ave);
          positions.push(x, 0, z);
        }
      }
    }
    return { blockGeo: new THREE.BoxGeometry(8, 2, 2.5), blockPos: positions };
  }, []);

  // Use ref to update instance matrices
  const meshRef = useMemo(() => {
    return (node: THREE.InstancedMesh | null) => {
      if (node) {
        const tempObject = new THREE.Object3D();
        for (let i = 0; i < blockPos.length / 3; i++) {
          tempObject.position.set(blockPos[i * 3], blockPos[i * 3 + 1], blockPos[i * 3 + 2]);
          tempObject.updateMatrix();
          node.setMatrixAt(i, tempObject.matrix);
        }
        node.instanceMatrix.needsUpdate = true;
      }
    };
  }, [blockPos]);

  return (
    <instancedMesh ref={meshRef} args={[blockGeo, undefined, blockPos.length / 3]}>
      <meshBasicMaterial color={COLORS.block} />
      <Edges color={COLORS.blockOutline} threshold={15} />
    </instancedMesh>
  );
};

const AccurateLandmarks = () => {
  return (
    <group>
      {landmarkData.map((l, i) => {
        const [x, y, z] = getAddressPosition(l.address.st, l.address.ave);
        
        // Simple geometry mapping based on shape type
        let geo;
        if (l.shape === 'spiral') geo = <cylinderGeometry args={[2, 2, l.height, 16]} />;
        else if (l.shape === 'thin') geo = <boxGeometry args={[2, l.height, 2]} />;
        else geo = <boxGeometry args={[6, l.height, 6]} />;

        return (
          <mesh key={i} position={[x, l.height/2, z]}>
            {geo}
            <meshBasicMaterial color={l.color} transparent opacity={0.9} />
            <Edges color="#ffffff" />
          </mesh>
        );
      })}
    </group>
  );
};

const ParkZone = () => {
  // Central Park Rectangle (approx dimensions in grid units)
  // Width: 3 blocks (approx 24 units)
  // Length: 51 blocks (approx 127 units)
  return (
    <group position={[0, 0.1, -10]}> {/* Centered approx */}
      {/* Main Park Base */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[26, 130]} />
        <meshBasicMaterial color={COLORS.park} />
      </mesh>
      
      {/* The Reservoir (Abstract shape) */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.2, -30]}>
        <circleGeometry args={[8, 32]} />
        <meshBasicMaterial color={COLORS.water} />
      </mesh>
      
      {/* The Lake */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.2, 30]}>
        <circleGeometry args={[5, 32]} />
        <meshBasicMaterial color={COLORS.water} />
      </mesh>
    </group>
  );
};

export default function Scene() {
  return (
    <div className="w-full h-screen bg-[#f0f2f5]">
      <Canvas orthographic camera={{ position: [100, 100, 100], zoom: 5, near: -200, far: 500 }}>
        <color attach="background" args={[COLORS.bg]} />
        
        <OrbitControls 
          enableRotate={false} // Lock rotation for pure map view (optional)
          enablePan={true}
          minZoom={2}
          maxZoom={20}
        />

        <group rotation={[0, -Math.PI/4, 0]}> {/* Rotate to align with screen */}
          <CityGrid />
          <AccurateLandmarks />
          <ParkZone />
        </group>

      </Canvas>
      
      {/* Map Legend / UI Overlay */}
      <div className="absolute bottom-8 left-8 bg-white/90 p-6 rounded-none border border-pink-200 backdrop-blur-sm">
        <h1 className="text-2xl font-serif text-pink-900 mb-2">Central Park</h1>
        <p className="text-xs font-sans text-pink-700 uppercase tracking-widest mb-4">Accessibility & Amenities</p>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-[#e64980]"></div>
          <span className="text-xs text-gray-600">Park Zone</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#d6336c]"></div>
          <span className="text-xs text-gray-600">Landmarks</span>
        </div>
      </div>
    </div>
  );
}
