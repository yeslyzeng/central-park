import { OrbitControls, Stars, Cloud, Environment } from '@react-three/drei';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { LandmarkGeometries } from './Landmarks';
import { createSteppedBuildingGeometry } from './SteppedBuilding';
import { ParkTerrain } from './ParkTerrain';
import { FloatingPlatform } from './FloatingPlatform';

// --- Shaders ---
const snowVertexShader = `
  uniform float uTime;
  uniform float uSize;
  attribute float aSpeed;
  attribute float aSize;
  attribute vec3 aRandom;
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    
    // Fall down
    pos.y = mod(pos.y - uTime * aSpeed, 40.0) - 5.0;
    
    // Horizontal drift (turbulence)
    pos.x += sin(uTime * aSpeed * 0.5 + aRandom.x * 10.0) * 0.5;
    pos.z += cos(uTime * aSpeed * 0.3 + aRandom.z * 10.0) * 0.5;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = (uSize * aSize) * (20.0 / -mvPosition.z);
    
    // Fade out at bottom
    vAlpha = smoothstep(-5.0, 0.0, pos.y);
  }
`;

const snowFragmentShader = `
  varying float vAlpha;
  
  void main() {
    // Circular particle
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;
    
    // Soft edge
    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * vAlpha * 0.8);
  }
`;

// --- Components ---

const SnowSystem = () => {
  const count = 15000;
  const mesh = useRef<THREE.Points>(null!);
  const material = useRef<THREE.ShaderMaterial>(null!);

  const { positions, speeds, sizes, randoms } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    const randoms = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 150; // x
      positions[i * 3 + 1] = Math.random() * 40 - 5; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 150; // z

      speeds[i] = 1 + Math.random() * 3;
      sizes[i] = 0.5 + Math.random() * 1.5;
      
      randoms[i * 3] = Math.random();
      randoms[i * 3 + 1] = Math.random();
      randoms[i * 3 + 2] = Math.random();
    }
    return { positions, speeds, sizes, randoms };
  }, []);

  useFrame((state) => {
    if (material.current) {
      material.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSize: { value: 2.0 }
  }), []);

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
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};



const City = () => {
  const genericMesh = useRef<THREE.InstancedMesh>(null!);
  const lightMesh = useRef<THREE.InstancedMesh>(null!);
  
  // Landmark refs
  const empireRef = useRef<THREE.Mesh>(null!);
  const chryslerRef = useRef<THREE.Mesh>(null!);
  const park432Ref = useRef<THREE.Mesh>(null!);
  const vanderbiltRef = useRef<THREE.Mesh>(null!);

  const { genericData, lightData } = useMemo(() => {
    const genericInstances: THREE.Matrix4[] = [];
    const lightInstances: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();

    // Central Park Dimensions: 40 wide (X), 200 long (Z)
    // Park X range: -20 to 20
    // Park Z range: -100 to 100
    
    // 1. Central Park South (Midtown) - Z > 100
    // High density, supertalls
    for (let x = -60; x <= 60; x += 6) {
      for (let z = 105; z <= 150; z += 6) {
        if (Math.random() > 0.8) continue; // Some gaps
        
        const scaleY = 20 + Math.random() * 40; // Tall buildings
        dummy.position.set(x, scaleY / 2, z);
        dummy.rotation.y = 0;
        dummy.scale.set(4, scaleY / 2, 4);
        dummy.updateMatrix();
        genericInstances.push(dummy.matrix.clone());
        
        // Lights
        if (Math.random() > 0.2) {
          dummy.scale.set(3, scaleY * 0.8, 3);
          dummy.updateMatrix();
          lightInstances.push(dummy.matrix.clone());
        }
      }
    }

    // 2. Central Park West (Residential) - X < -20
    // Twin towers, uniform height wall
    for (let z = -100; z <= 100; z += 8) {
      // Front row (The Wall)
      const scaleY = 15 + Math.random() * 10;
      dummy.position.set(-25, scaleY / 2, z);
      dummy.rotation.y = 0;
      dummy.scale.set(5, scaleY / 2, 6);
      dummy.updateMatrix();
      genericInstances.push(dummy.matrix.clone());
      
      // Lights
      if (Math.random() > 0.3) {
        dummy.scale.set(4, scaleY * 0.8, 5);
        dummy.updateMatrix();
        lightInstances.push(dummy.matrix.clone());
      }

      // Back rows
      for (let x = -35; x >= -80; x -= 8) {
        if (Math.random() > 0.6) continue;
        const h = 10 + Math.random() * 15;
        dummy.position.set(x, h / 2, z);
        dummy.scale.set(5, h / 2, 5);
        dummy.updateMatrix();
        genericInstances.push(dummy.matrix.clone());
      }
    }

    // 3. Fifth Avenue (Museum Mile) - X > 20
    // Continuous limestone wall, lower height
    for (let z = -100; z <= 100; z += 8) {
      // Front row
      const scaleY = 12 + Math.random() * 5; // Lower, uniform
      dummy.position.set(25, scaleY / 2, z);
      dummy.rotation.y = 0;
      dummy.scale.set(5, scaleY / 2, 6);
      dummy.updateMatrix();
      genericInstances.push(dummy.matrix.clone());
      
      // Lights
      if (Math.random() > 0.3) {
        dummy.scale.set(4, scaleY * 0.8, 5);
        dummy.updateMatrix();
        lightInstances.push(dummy.matrix.clone());
      }

      // Back rows (Upper East Side)
      for (let x = 35; x <= 80; x += 8) {
        if (Math.random() > 0.6) continue;
        const h = 8 + Math.random() * 12;
        dummy.position.set(x, h / 2, z);
        dummy.scale.set(5, h / 2, 5);
        dummy.updateMatrix();
        genericInstances.push(dummy.matrix.clone());
      }
    }
    
    return { 
      genericData: genericInstances,
      lightData: lightInstances
    };
  }, []);

  useEffect(() => {
    if (genericMesh.current) {
      genericData.forEach((matrix, i) => genericMesh.current.setMatrixAt(i, matrix));
      genericMesh.current.instanceMatrix.needsUpdate = true;
    }
    if (lightMesh.current) {
      lightData.forEach((matrix, i) => lightMesh.current.setMatrixAt(i, matrix));
      lightMesh.current.instanceMatrix.needsUpdate = true;
    }
  }, [genericData, lightData]);

  // Geometries
  const steppedGeo = useMemo(() => createSteppedBuildingGeometry(), []);
  const empireGeo = useMemo(() => LandmarkGeometries.EmpireState(), []);
  const chryslerGeo = useMemo(() => LandmarkGeometries.Chrysler(), []);
  const park432Geo = useMemo(() => LandmarkGeometries.Park432(), []);
  const vanderbiltGeo = useMemo(() => LandmarkGeometries.OneVanderbilt(), []);

  return (
    <group>
      {/* Generic City Grid */}
      <instancedMesh ref={genericMesh} args={[undefined, undefined, genericData.length]}>
        <primitive object={steppedGeo} />
        <meshStandardMaterial color="#b0c4de" roughness={0.6} metalness={0.1} />
      </instancedMesh>

      {/* Window Lights */}
      <instancedMesh ref={lightMesh} args={[undefined, undefined, lightData.length]}>
        <boxGeometry />
        <meshBasicMaterial color="#ffd700" />
      </instancedMesh>

      {/* --- Iconic Landmarks (South End / Midtown) --- */}
      
      {/* Empire State Building (South Center, further back) */}
      <mesh ref={empireRef} geometry={empireGeo || undefined} position={[0, 0, 130]} scale={[3, 3, 3]}>
        <meshStandardMaterial color="#ff99aa" roughness={0.8} metalness={0} />
      </mesh>

      {/* Chrysler Building (South East) */}
      <mesh ref={chryslerRef} geometry={chryslerGeo || undefined} position={[30, 0, 140]} scale={[2.5, 2.5, 2.5]}>
        <meshStandardMaterial color="#aaddff" roughness={0.8} metalness={0} />
      </mesh>

      {/* 432 Park Avenue (South East, prominent) */}
      <mesh ref={park432Ref} geometry={park432Geo || undefined} position={[15, 0, 110]} scale={[2, 2, 2]}>
        <meshStandardMaterial color="#eeeeee" roughness={0.8} metalness={0} />
      </mesh>

      {/* One Vanderbilt (South West) */}
      <mesh ref={vanderbiltRef} geometry={vanderbiltGeo || undefined} position={[-20, 0, 120]} scale={[2.5, 2.5, 2.5]}>
        <meshStandardMaterial color="#99ccff" roughness={0.8} metalness={0} />
      </mesh>

    </group>
  );
};

const Trees = () => {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const treeData = useMemo(() => {
    const instances: THREE.Matrix4[] = [];
    // Place trees INSIDE the park void (40x200)
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 36; // Keep inside -18 to 18
      const z = (Math.random() - 0.5) * 190; // Keep inside -95 to 95
      
      // Avoid Reservoir (North)
      const reservoirDist = Math.sqrt(Math.pow(x * 1.5, 2) + Math.pow((z + 50) * 0.8, 2));
      if (reservoirDist < 16) continue;

      // Avoid Lake (South)
      const lakeDist = Math.sqrt(Math.pow(x, 2) + Math.pow((z - 30), 2));
      if (lakeDist < 12) continue;

      dummy.position.set(x, 0.5, z); // Slightly raised on terrain
      const scale = 0.5 + Math.random() * 0.5;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      instances.push(dummy.matrix.clone());
    }
    return instances;
  }, []);

  useEffect(() => {
    if (mesh.current) {
      treeData.forEach((matrix, i) => mesh.current.setMatrixAt(i, matrix));
      mesh.current.instanceMatrix.needsUpdate = true;
    }
  }, [treeData]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, treeData.length]}>
      <coneGeometry args={[1, 4, 8]} />
      <meshStandardMaterial color="#ddeeff" roughness={0.8} />
    </instancedMesh>
  );
};

export default function Scene() {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas orthographic camera={{ position: [100, 100, 100], zoom: 10, near: -200, far: 500 }}>
        {/* Pastel Gradient Background */}
        <color attach="background" args={['#ffd1dc']} />
        
        <OrbitControls 
          enablePan={true} 
          maxPolarAngle={Math.PI / 2.2} 
          minZoom={5}
          maxZoom={20}
          autoRotate
          autoRotateSpeed={0.5}
        />

        {/* Soft, Warm Lighting for Pastel Look */}
        <ambientLight intensity={0.8} color="#ffffff" />
        <directionalLight position={[50, 100, 50]} intensity={1.2} color="#fff0dd" castShadow shadow-mapSize={[2048, 2048]} />
        <pointLight position={[-50, 50, -50]} intensity={0.5} color="#dbeeff" />
        
        <Environment preset="night" />
        
        <group>
          <group position={[0, 5, 0]}>
            <City />
            <Trees />
            <ParkTerrain />
            <SnowSystem />
          </group>
          <FloatingPlatform />
        </group>

        {/* Removed heavy post-processing for clean vector/toy look */}
      </Canvas>
    </div>
  );
}
