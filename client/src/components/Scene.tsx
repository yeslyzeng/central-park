import { Cloud, Environment, OrbitControls, Stars, Float } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette, ToneMapping } from "@react-three/postprocessing";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// --- Cinematic Snow System ---
function Snow({ count = 8000 }) {
  const mesh = useRef<THREE.Points>(null!);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 150;
      const y = Math.random() * 80;
      const z = (Math.random() - 0.5) * 150;
      const speed = 0.02 + Math.random() * 0.1;
      const size = Math.random() * 0.3;
      temp.push({ x, y, z, speed, size });
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

  useFrame((state) => {
    if (!mesh.current) return;
    const positions = mesh.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.getElapsedTime();
    
    for (let i = 0; i < count; i++) {
      // Fall down
      positions[i * 3 + 1] -= particles[i].speed;
      
      // Complex turbulence
      positions[i * 3] += Math.sin(time * 0.5 + particles[i].y) * 0.02;
      positions[i * 3 + 2] += Math.cos(time * 0.3 + particles[i].x) * 0.02;
      
      // Reset loop
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = 80;
        positions[i * 3] = (Math.random() - 0.5) * 150;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 150;
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
      <pointsMaterial 
        size={0.2} 
        color="#ffffff" 
        transparent 
        opacity={0.8} 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// --- Futuristic Ice City ---
function IceCity() {
  const buildings = useMemo(() => {
    const items = [];
    // Create a majestic skyline curve
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2;
      // Irregular placement for organic city feel
      const radius = 60 + Math.random() * 30; 
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius * 0.6; // Elliptical layout
      
      const width = 8 + Math.random() * 10;
      const depth = 8 + Math.random() * 10;
      const height = 40 + Math.random() * 100; // Very tall skyscrapers
      
      items.push({ position: [x, height / 2 - 5, z], args: [width, height, depth] });
    }
    return items;
  }, []);

  return (
    <group>
      {buildings.map((b, i) => (
        <mesh key={i} position={b.position as [number, number, number]}>
          <boxGeometry args={b.args as [number, number, number]} />
          {/* Ice/Glass Material */}
          <meshPhysicalMaterial 
            color="#e0f7fa"
            transmission={0.9} // Glass-like transmission
            opacity={1}
            metalness={0.1}
            roughness={0.1}
            ior={1.5} // Index of refraction for glass
            thickness={5} // Volume thickness
            envMapIntensity={1.5}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
          {/* Internal glowing core for futuristic look */}
          <mesh scale={[0.8, 0.98, 0.8]}>
            <boxGeometry args={b.args as [number, number, number]} />
            <meshBasicMaterial color="#4fc3f7" transparent opacity={0.1} blending={THREE.AdditiveBlending} />
          </mesh>
        </mesh>
      ))}
    </group>
  );
}

// --- Frozen Lake Surface ---
function FrozenLake() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]} receiveShadow>
      <circleGeometry args={[120, 64]} />
      <meshPhysicalMaterial 
        color="#b3e5fc"
        metalness={0.2}
        roughness={0.15}
        transmission={0.2}
        clearcoat={1}
        clearcoatRoughness={0.05}
        envMapIntensity={1.2}
      />
    </mesh>
  );
}

// --- Abstract Ice Sculpture (Centerpiece) ---
function IceSculpture() {
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group position={[0, 4, 0]}>
        <mesh castShadow>
          <octahedronGeometry args={[3, 0]} />
          <meshPhysicalMaterial 
            color="#ffffff"
            transmission={0.95}
            roughness={0}
            metalness={0.1}
            ior={2.0} // Diamond-like
            thickness={10}
            envMapIntensity={2}
          />
        </mesh>
        {/* Inner glow */}
        <pointLight color="#00e5ff" intensity={2} distance={20} decay={2} />
      </group>
    </Float>
  );
}

// --- Crystal Trees ---
function CrystalTrees() {
  const trees = useMemo(() => {
    const items = [];
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 15 + Math.random() * 35;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const scale = 0.5 + Math.random() * 1;
      items.push({ pos: [x, 0, z], scale });
    }
    return items;
  }, []);

  return (
    <group>
      {trees.map((t, i) => (
        <group key={i} position={t.pos as [number, number, number]} scale={[t.scale, t.scale, t.scale]}>
          <mesh position={[0, 2, 0]} castShadow>
            <coneGeometry args={[1, 4, 4]} />
            <meshPhysicalMaterial 
              color="#e1f5fe"
              transmission={0.6}
              roughness={0.2}
              metalness={0.5}
              thickness={2}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function Scene() {
  return (
    <Canvas shadows camera={{ position: [0, 5, 25], fov: 45 }}>
      {/* Environment for reflections */}
      <Environment preset="city" />
      
      <color attach="background" args={['#0a192f']} />
      <fog attach="fog" args={['#0a192f', 20, 100]} />
      
      <OrbitControls 
        maxPolarAngle={Math.PI / 2 - 0.02}
        minDistance={10}
        maxDistance={80}
        autoRotate
        autoRotateSpeed={0.2}
        enableDamping
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} color="#4fc3f7" />
      <directionalLight 
        position={[-30, 50, -30]} 
        intensity={3} 
        color="#e0f7fa"
        castShadow 
        shadow-bias={-0.0001}
      />
      <pointLight position={[0, 10, 0]} intensity={1} color="#00bcd4" />

      <Stars radius={150} depth={50} count={7000} factor={4} saturation={0} fade speed={0.5} />
      <Cloud opacity={0.3} speed={0.1} segments={10} position={[0, 40, -50]} color="#eceff1" />

      <group>
        <IceCity />
        <FrozenLake />
        <IceSculpture />
        <CrystalTrees />
        <Snow count={10000} />
      </group>

      <EffectComposer>
        <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.8} height={300} intensity={1.2} />
        <Vignette eskil={false} offset={0.1} darkness={0.6} />
        <ToneMapping />
      </EffectComposer>
    </Canvas>
  );
}
