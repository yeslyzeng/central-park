import { Environment, Float, OrbitControls, PerspectiveCamera, Stars, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// --- Snow Particle System ---
function Snow({ count = 2000 }) {
  const mesh = useRef<THREE.Points>(null!);
  
  // Create particles with random positions and velocities
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 50;
      const y = Math.random() * 30;
      const z = (Math.random() - 0.5) * 50;
      const speed = 0.02 + Math.random() * 0.05;
      const factor = 0.2 + Math.random() * 0.8; // Size variation
      temp.push({ x, y, z, speed, factor });
    }
    return temp;
  }, [count]);

  // Convert to Float32Array for BufferGeometry
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
      // Update Y position (falling down)
      positions[i * 3 + 1] -= particles[i].speed;
      
      // Add some wind drift (X and Z)
      positions[i * 3] += Math.sin(Date.now() * 0.001 + i) * 0.002;
      
      // Reset if below ground
      if (positions[i * 3 + 1] < -2) {
        positions[i * 3 + 1] = 20 + Math.random() * 10;
        positions[i * 3] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
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
        size={0.15}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// --- Background Skyline ---
function Skyline() {
  const texture = useTexture("/images/nyc-skyline-winter.jpg");
  
  return (
    <mesh position={[0, 8, -30]} scale={[80, 40, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={texture} transparent opacity={1} toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

// --- Snow Covered Tree ---
function SnowTree({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
  const texture = useTexture("/images/snow-tree.png");
  
  return (
    <mesh position={position} scale={[scale * 4, scale * 4, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={texture} transparent alphaTest={0.2} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

// --- Snowman ---
function Snowman({ position }: { position: [number, number, number] }) {
  const texture = useTexture("/images/snowman.png");
  
  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
      <mesh position={position} scale={[2, 2, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={texture} transparent alphaTest={0.2} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </Float>
  );
}

// --- Ground Plane ---
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial 
        color="#e0f7fa" 
        roughness={1} 
        metalness={0}
      />
    </mesh>
  );
}

// --- Fog & Atmosphere ---
function Atmosphere() {
  return (
    <>
      <fog attach="fog" args={['#e0f7fa', 10, 50]} />
      <ambientLight intensity={0.8} color="#b2ebf2" />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </>
  );
}

export default function Scene() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="w-full h-screen absolute top-0 left-0 -z-10 bg-gradient-to-b from-[#cfd8dc] to-[#eceff1]">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 2, 10]} fov={50} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          maxPolarAngle={Math.PI / 2 - 0.1}
          minPolarAngle={Math.PI / 3}
          autoRotate
          autoRotateSpeed={0.5}
        />
        
        <Atmosphere />
        
        <group position={[0, 0, 0]}>
          <Skyline />
          <Ground />
          
          {/* Trees scattered around */}
          <SnowTree position={[-8, 0, -5]} scale={1.5} />
          <SnowTree position={[8, 0, -8]} scale={1.8} />
          <SnowTree position={[-12, 0, -10]} scale={2} />
          <SnowTree position={[5, 0, -2]} scale={1.2} />
          <SnowTree position={[-4, 0, 2]} scale={1} />
          
          {/* Hero Snowman */}
          <Snowman position={[2, -1, 3]} />
          
          <Snow count={3000} />
        </group>
      </Canvas>
    </div>
  );
}
