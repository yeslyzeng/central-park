import { Cloud, Environment, OrbitControls, Stars, Float } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette, ToneMapping } from "@react-three/postprocessing";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";

// --- GPU Optimized Snow Shader ---
const snowVertexShader = `
  uniform float uTime;
  uniform float uHeight;
  attribute float aSpeed;
  attribute float aSize;
  attribute vec3 aRandom;
  
  void main() {
    vec3 pos = position;
    
    // Fall down based on time and speed
    pos.y = position.y - uTime * aSpeed;
    
    // Wrap around height
    pos.y = mod(pos.y, uHeight);
    
    // Add turbulence
    pos.x += sin(uTime * 0.5 + aRandom.y) * 0.5;
    pos.z += cos(uTime * 0.3 + aRandom.x) * 0.5;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const snowFragmentShader = `
  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    float alpha = 1.0 - (r * 2.0);
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * 0.8);
  }
`;

function Snow({ count = 15000 }) {
  const mesh = useRef<THREE.Points>(null!);
  const material = useRef<THREE.ShaderMaterial>(null!);
  
  const [positions, speeds, sizes, randoms] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const sz = new Float32Array(count);
    const rnd = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 300;
      pos[i * 3 + 1] = Math.random() * 100;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 300;
      
      spd[i] = 2.0 + Math.random() * 5.0; // Faster fall speed for shader
      sz[i] = 0.5 + Math.random() * 1.5;
      
      rnd[i * 3] = Math.random() * 10;
      rnd[i * 3 + 1] = Math.random() * 10;
      rnd[i * 3 + 2] = Math.random() * 10;
    }
    return [pos, spd, sz, rnd];
  }, [count]);

  useFrame((state) => {
    if (material.current) {
      material.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSpeed" count={count} array={speeds} itemSize={1} args={[speeds, 1]} />
        <bufferAttribute attach="attributes-aSize" count={count} array={sizes} itemSize={1} args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aRandom" count={count} array={randoms} itemSize={3} args={[randoms, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={snowVertexShader}
        fragmentShader={snowFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uHeight: { value: 100 }
        }}
      />
    </points>
  );
}

// --- Instanced City Layout ---
function CentralParkCity() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const lightMeshRef = useRef<THREE.InstancedMesh>(null!);
  const count = 600; // Total max buildings
  
  const { buildings, lightTransforms } = useMemo(() => {
    const items = [];
    const lights = [];
    const parkWidth = 60;
    const parkLength = 150;
    const dummy = new THREE.Object3D();
    const dummyLight = new THREE.Object3D();
    
    let idx = 0;
    // Generate grid of buildings around the park
    for (let x = -150; x <= 150; x += 12) {
      for (let z = -150; z <= 150; z += 12) {
        if (idx >= count) break;
        
        // Create the "Central Park" void
        if (Math.abs(x) < parkWidth / 2 && Math.abs(z) < parkLength / 2) continue;
        
        // Randomize position slightly
        const posX = x + (Math.random() - 0.5) * 4;
        const posZ = z + (Math.random() - 0.5) * 4;
        
        const width = 6 + Math.random() * 5;
        const depth = 6 + Math.random() * 5;
        
        // Taller buildings closer to the park edge
        const distToPark = Math.min(Math.abs(Math.abs(x) - parkWidth/2), Math.abs(Math.abs(z) - parkLength/2));
        const heightBase = Math.max(20, 120 - distToPark * 0.8);
        const height = heightBase + Math.random() * 60;
        
        dummy.position.set(posX, height / 2 - 2, posZ);
        dummy.scale.set(width, height, depth);
        dummy.updateMatrix();
        items.push(dummy.matrix.clone());
        
        // Interior light mesh (slightly smaller)
        dummyLight.position.set(posX, height / 2 - 2, posZ);
        dummyLight.scale.set(width * 0.9, height * 0.98, depth * 0.9);
        dummyLight.updateMatrix();
        lights.push(dummyLight.matrix.clone());
        
        idx++;
      }
    }
    return { buildings: items, lightTransforms: lights };
  }, []);

  useEffect(() => {
    if (meshRef.current) {
      buildings.forEach((matrix, i) => {
        meshRef.current.setMatrixAt(i, matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
    if (lightMeshRef.current) {
      lightTransforms.forEach((matrix, i) => {
        lightMeshRef.current.setMatrixAt(i, matrix);
      });
      lightMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [buildings, lightTransforms]);

  return (
    <group>
      {/* Glass Shell Instances */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, buildings.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial 
          color="#90caf9"
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
      </instancedMesh>
      
      {/* Warm Interior Lights Instances */}
      <instancedMesh ref={lightMeshRef} args={[undefined, undefined, lightTransforms.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial 
          color="#ffb74d"
          transparent 
          opacity={0.3} 
          blending={THREE.AdditiveBlending} 
        />
      </instancedMesh>
    </group>
  );
}

// --- Instanced Crystal Trees ---
function CrystalTrees() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const count = 150;

  const transforms = useMemo(() => {
    const items = [];
    const dummy = new THREE.Object3D();
    
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 100;
      const scale = 0.5 + Math.random() * 0.8;
      
      dummy.position.set(x, scale * 2, z); // Adjust y based on scale/height
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      items.push(dummy.matrix.clone());
    }
    return items;
  }, []);

  useEffect(() => {
    if (meshRef.current) {
      transforms.forEach((matrix, i) => {
        meshRef.current.setMatrixAt(i, matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [transforms]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow>
      <coneGeometry args={[1.2, 4, 6]} />
      <meshPhysicalMaterial 
        color="#e1f5fe"
        transmission={0.8}
        roughness={0.3}
        metalness={0.2}
        thickness={1}
        envMapIntensity={1.5}
      />
    </instancedMesh>
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
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 10, 40], fov: 50 }}>
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

      {/* Cinematic Lighting - Optimized Shadow Map */}
      <ambientLight intensity={0.2} color="#0d47a1" />
      
      <directionalLight 
        position={[-50, 80, -50]} 
        intensity={3} 
        color="#e1f5fe"
        castShadow 
        shadow-mapSize={[2048, 2048]} // Reduced from 4096 for performance
        shadow-bias={-0.0001}
      />
      
      {/* City Glow (Warm) */}
      <pointLight position={[0, 20, 0]} intensity={1} color="#ffcc80" distance={100} />

      <Stars radius={200} depth={50} count={5000} factor={4} saturation={0} fade speed={0.2} />
      <Cloud opacity={0.2} speed={0.1} segments={10} position={[0, 60, -100]} color="#90caf9" />

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
