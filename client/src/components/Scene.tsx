import { Cloud, Environment, OrbitControls, Stars, Float, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette, ToneMapping } from "@react-three/postprocessing";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// --- Cinematic Snow System ---
function Snow({ count = 12000 }) {
  const mesh = useRef<THREE.Points>(null!);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 300;
      const y = Math.random() * 100;
      const z = (Math.random() - 0.5) * 300;
      const speed = 0.05 + Math.random() * 0.2;
      const size = Math.random() * 0.4;
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
      positions[i * 3] += Math.sin(time * 0.5 + particles[i].y) * 0.03;
      positions[i * 3 + 2] += Math.cos(time * 0.3 + particles[i].x) * 0.03;
      
      // Reset loop
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = 100;
        positions[i * 3] = (Math.random() - 0.5) * 300;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 300;
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
        opacity={0.9} 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// --- Central Park City Layout ---
function CentralParkCity() {
  const buildings = useMemo(() => {
    const items = [];
    const parkWidth = 60;
    const parkLength = 150;
    
    // Generate grid of buildings around the park
    for (let x = -150; x <= 150; x += 15) {
      for (let z = -150; z <= 150; z += 15) {
        // Create the "Central Park" void
        if (Math.abs(x) < parkWidth / 2 && Math.abs(z) < parkLength / 2) continue;
        
        // Randomize position slightly
        const posX = x + (Math.random() - 0.5) * 5;
        const posZ = z + (Math.random() - 0.5) * 5;
        
        const width = 8 + Math.random() * 6;
        const depth = 8 + Math.random() * 6;
        
        // Taller buildings closer to the park edge
        const distToPark = Math.min(Math.abs(Math.abs(x) - parkWidth/2), Math.abs(Math.abs(z) - parkLength/2));
        const heightBase = Math.max(20, 120 - distToPark * 0.8);
        const height = heightBase + Math.random() * 60;
        
        items.push({ position: [posX, height / 2 - 2, posZ], args: [width, height, depth] });
      }
    }
    return items;
  }, []);

  return (
    <group>
      {buildings.map((b, i) => (
        <group key={i} position={b.position as [number, number, number]}>
          {/* Glass Shell */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={b.args as [number, number, number]} />
            <meshPhysicalMaterial 
              color="#90caf9" // Slightly deeper blue
              transmission={0.9} 
              opacity={1}
              metalness={0.2}
              roughness={0.05}
              ior={1.5} 
              thickness={5} 
              envMapIntensity={2.5}
              clearcoat={1}
              attenuationColor="#e3f2fd"
              attenuationDistance={5}
            />
          </mesh>
          
          {/* Warm Interior Lights (Windows) */}
          <mesh scale={[0.95, 0.99, 0.95]}>
            <boxGeometry args={b.args as [number, number, number]} />
            <meshBasicMaterial 
              color="#ffb74d" // Warm orange
              transparent 
              opacity={0.3} 
              blending={THREE.AdditiveBlending} 
            />
          </mesh>
          
          {/* Random bright windows */}
          {Math.random() > 0.7 && (
             <pointLight 
                position={[0, (Math.random() - 0.5) * b.args[1], 0]} 
                color="#ff9800" 
                intensity={2} 
                distance={30} 
                decay={2} 
             />
          )}
        </group>
      ))}
    </group>
  );
}

// --- Frozen Lake Surface ---
function FrozenLake() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]} receiveShadow>
      <planeGeometry args={[50, 120]} />
      <meshPhysicalMaterial 
        color="#81d4fa"
        metalness={0.1}
        roughness={0.05}
        transmission={0.4}
        clearcoat={1}
        clearcoatRoughness={0}
        envMapIntensity={1.5}
        ior={1.33}
      />
    </mesh>
  );
}

// --- Crystal Trees ---
function CrystalTrees() {
  const trees = useMemo(() => {
    const items = [];
    // Scatter trees in the park area
    for (let i = 0; i < 100; i++) {
      const x = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 100;
      const scale = 0.5 + Math.random() * 0.8;
      items.push({ pos: [x, 0, z], scale });
    }
    return items;
  }, []);

  return (
    <group>
      {trees.map((t, i) => (
        <group key={i} position={t.pos as [number, number, number]} scale={[t.scale, t.scale, t.scale]}>
          <mesh position={[0, 2, 0]} castShadow>
            <coneGeometry args={[1.2, 4, 6]} />
            <meshPhysicalMaterial 
              color="#e1f5fe"
              transmission={0.8}
              roughness={0.3}
              metalness={0.2}
              thickness={1}
              envMapIntensity={1.5}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// --- Abstract Ice Sculpture ---
function IceSculpture() {
  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group position={[0, 5, 0]}>
        <mesh castShadow>
          <dodecahedronGeometry args={[4, 0]} />
          <meshPhysicalMaterial 
            color="#ffffff"
            transmission={1}
            roughness={0}
            metalness={0}
            ior={2.4} // Diamond
            thickness={5}
            envMapIntensity={3}
            dispersion={5} // Rainbow dispersion
          />
        </mesh>
        <pointLight color="#00e5ff" intensity={5} distance={20} decay={2} />
      </group>
    </Float>
  );
}

// --- Ground ---
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[500, 500]} />
      <meshStandardMaterial color="#eceff1" roughness={0.8} />
    </mesh>
  );
}

export default function Scene() {
  return (
    <Canvas shadows camera={{ position: [0, 10, 40], fov: 50 }}>
      {/* High Quality Environment */}
      <Environment preset="city" background blur={0.8} />
      
      <OrbitControls 
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={5}
        maxDistance={100}
        autoRotate
        autoRotateSpeed={0.1}
        enableDamping
      />

      {/* Cinematic Lighting */}
      <ambientLight intensity={0.2} color="#0d47a1" />
      
      {/* Moon Light (Cold) */}
      <directionalLight 
        position={[-50, 80, -50]} 
        intensity={3} 
        color="#e1f5fe"
        castShadow 
        shadow-mapSize={[4096, 4096]}
        shadow-bias={-0.0001}
      />
      
      {/* City Glow (Warm) */}
      <pointLight position={[0, 20, 0]} intensity={1} color="#ffcc80" distance={100} />

      <Stars radius={200} depth={50} count={8000} factor={4} saturation={0} fade speed={0.2} />
      <Cloud opacity={0.2} speed={0.1} segments={20} position={[0, 60, -100]} color="#90caf9" />

      <group>
        <CentralParkCity />
        <FrozenLake />
        <IceSculpture />
        <CrystalTrees />
        <Ground />
        <Snow count={15000} />
      </group>

      <EffectComposer>
        <Bloom luminanceThreshold={0.8} luminanceSmoothing={0.5} height={300} intensity={1.5} />
        <Vignette eskil={false} offset={0.1} darkness={0.5} />
        <ToneMapping />
      </EffectComposer>
    </Canvas>
  );
}
