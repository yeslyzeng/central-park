import { Cloud, Environment, OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// --- Procedural 3D Snow ---
function Snow({ count = 4000 }) {
  const mesh = useRef<THREE.Points>(null!);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 120;
      const y = Math.random() * 60;
      const z = (Math.random() - 0.5) * 120;
      const speed = 0.05 + Math.random() * 0.15;
      temp.push({ x, y, z, speed });
    }
    return temp;
  }, [count]);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    particles.forEach((p, i) => {
      pos[i * 3] = p.x;
      pos[i * 3 + 1] = p.y;
      pos[i * 3 + 2] = p.z;
    });
    return pos;
  }, [particles, count]);

  useFrame(() => {
    if (!mesh.current) return;
    const positions = mesh.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] -= particles[i].speed; // Fall down
      positions[i * 3] += Math.sin(Date.now() * 0.001 + i) * 0.02; // Drift X
      
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = 60;
        positions[i * 3] = (Math.random() - 0.5) * 120;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
      }
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.25} color="#ffffff" transparent opacity={0.9} />
    </points>
  );
}

// --- 3D Procedural City ---
function City() {
  const buildings = useMemo(() => {
    const items = [];
    // Create a dense ring of buildings
    for (let i = 0; i < 80; i++) {
      const angle = (i / 80) * Math.PI * 2;
      const radius = 45 + Math.random() * 25; // Distance from center
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const width = 5 + Math.random() * 8;
      const depth = 5 + Math.random() * 8;
      const height = 30 + Math.random() * 50;
      const color = Math.random() > 0.5 ? "#1a202c" : "#2d3748"; // Dark slate/blueish greys
      items.push({ position: [x, height / 2, z], args: [width, height, depth], color });
    }
    return items;
  }, []);

  return (
    <group>
      {buildings.map((b, i) => (
        <mesh key={i} position={b.position as [number, number, number]}>
          <boxGeometry args={b.args as [number, number, number]} />
          <meshStandardMaterial color={b.color} roughness={0.1} metalness={0.6} />
          {/* Windows (emissive specks) */}
          <mesh position={[0, 0, 0]} scale={[1.01, 1.01, 1.01]}>
             <boxGeometry args={b.args as [number, number, number]} />
             <meshBasicMaterial color="#ffeb3b" wireframe transparent opacity={0.03} />
          </mesh>
        </mesh>
      ))}
    </group>
  );
}

// --- 3D Tree ---
function Tree({ position }: { position: [number, number, number] }) {
  const scale = 0.8 + Math.random() * 0.6;
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.4, 2, 8]} />
        <meshStandardMaterial color="#3e2723" roughness={1} />
      </mesh>
      {/* Leaves (Snow covered cones) */}
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
        <coneGeometry args={[1.8, 2.5, 8]} />
        <meshStandardMaterial color="#e0f7fa" roughness={0.8} />
      </mesh>
      <mesh position={[0, 4.0, 0]} castShadow receiveShadow>
        <coneGeometry args={[1.4, 2.2, 8]} />
        <meshStandardMaterial color="#e0f7fa" roughness={0.8} />
      </mesh>
      <mesh position={[0, 5.2, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.9, 1.8, 8]} />
        <meshStandardMaterial color="#e0f7fa" roughness={0.8} />
      </mesh>
    </group>
  );
}

// --- 3D Snowman ---
function Snowman({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Body Bottom */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      {/* Body Middle */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 2.2, 0.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.06, 0.25, 8]} />
        <meshStandardMaterial color="#ff6f00" />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.12, 2.3, 0.28]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#212121" />
      </mesh>
      <mesh position={[0.12, 2.3, 0.28]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#212121" />
      </mesh>
      {/* Arms */}
      <mesh position={[0.45, 1.6, 0]} rotation={[0, 0, -Math.PI / 3]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.9]} />
        <meshStandardMaterial color="#3e2723" />
      </mesh>
      <mesh position={[-0.45, 1.6, 0]} rotation={[0, 0, Math.PI / 3]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.9]} />
        <meshStandardMaterial color="#3e2723" />
      </mesh>
    </group>
  );
}

// --- Ground ---
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[300, 300]} />
      <meshStandardMaterial color="#eceff1" roughness={0.9} />
    </mesh>
  );
}

export default function Scene() {
  // Generate random tree positions
  const trees = useMemo(() => {
    const items = [];
    for (let i = 0; i < 60; i++) {
      const x = (Math.random() - 0.5) * 70;
      const z = (Math.random() - 0.5) * 70;
      // Keep center clear for the snowman
      if (Math.abs(x) < 8 && Math.abs(z) < 8) continue;
      items.push([x, 0, z]);
    }
    return items;
  }, []);

  return (
    <Canvas shadows camera={{ position: [0, 6, 18], fov: 55 }}>
      <color attach="background" args={['#b0bec5']} />
      <fog attach="fog" args={['#b0bec5', 15, 70]} />
      
      <OrbitControls 
        maxPolarAngle={Math.PI / 2 - 0.05} // Prevent going below ground
        minDistance={5}
        maxDistance={60}
        autoRotate
        autoRotateSpeed={0.3}
        enableDamping
      />

      <ambientLight intensity={0.4} color="#cfd8dc" />
      <directionalLight 
        position={[20, 30, 10]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Cloud opacity={0.4} speed={0.2} segments={20} position={[0, 25, -10]} />

      <group>
        <City />
        <Ground />
        {trees.map((pos, i) => (
          <Tree key={i} position={pos as [number, number, number]} />
        ))}
        <Snowman position={[0, 0, 0]} />
        <Snow count={6000} />
      </group>

      <EffectComposer>
        <Bloom luminanceThreshold={0.8} luminanceSmoothing={0.9} height={300} intensity={0.5} />
        <Vignette eskil={false} offset={0.1} darkness={0.5} />
      </EffectComposer>
    </Canvas>
  );
}
