import { OrbitControls, Stars, Cloud, Environment } from '@react-three/drei';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { LandmarkGeometries } from './Landmarks';
import { createSteppedBuildingGeometry } from './SteppedBuilding';

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

const FrozenLake = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
      <planeGeometry args={[200, 200]} />
      <meshPhysicalMaterial
        color="#aaddff"
        roughness={0.05}
        metalness={0.1}
        transmission={0.6}
        thickness={2}
        ior={1.33}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </mesh>
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

    // Create a rectangular void for Central Park (approx -15 to 15 in X, -40 to 40 in Z)
    // We will place buildings OUTSIDE this box
    
    for (let i = 0; i < 600; i++) {
      const x = (Math.random() - 0.5) * 180;
      const z = (Math.random() - 0.5) * 180;

      // Check if inside Central Park void
      if (Math.abs(x) < 20 && Math.abs(z) < 50) continue;

      // Scale based on distance to center (taller near park)
      const dist = Math.sqrt(x*x + z*z);
      const scaleY = Math.max(2, Math.random() * 20 - dist * 0.1);
      
      // Adjust position for stepped geometry (pivot is different)
      dummy.position.set(x, scaleY / 2, z);
      dummy.rotation.y = 0; // Grid layout
      // Make them slightly wider to look like city blocks
      dummy.scale.set(3 + Math.random() * 2, scaleY / 2, 3 + Math.random() * 2);
      dummy.updateMatrix();
      genericInstances.push(dummy.matrix.clone());

      // Add window lights
      if (Math.random() > 0.3) {
        // Add internal light blocks
        const lightScaleY = scaleY * 0.8;
        dummy.position.set(x, lightScaleY / 2 + 0.5, z);
        dummy.scale.set(1.5, lightScaleY, 1.5);
        dummy.updateMatrix();
        lightInstances.push(dummy.matrix.clone());
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
        <meshPhysicalMaterial
          color="#88ccff"
          metalness={0.1}
          roughness={0.1}
          transmission={0.9}
          thickness={1.5}
          ior={1.5}
          transparent
        />
      </instancedMesh>

      {/* Window Lights */}
      <instancedMesh ref={lightMesh} args={[undefined, undefined, lightData.length]}>
        <boxGeometry />
        <meshBasicMaterial color="#ffaa55" toneMapped={false} />
      </instancedMesh>

      {/* --- Iconic Landmarks (South End / Midtown) --- */}
      
      {/* Empire State Building (South Center) */}
      <mesh ref={empireRef} geometry={empireGeo || undefined} position={[0, 0, 60]} scale={[2, 2, 2]}>
        <meshPhysicalMaterial color="#aaddff" metalness={0.2} roughness={0.1} transmission={0.8} thickness={2} />
      </mesh>

      {/* Chrysler Building (South East) */}
      <mesh ref={chryslerRef} geometry={chryslerGeo || undefined} position={[15, 0, 65]} scale={[1.8, 1.8, 1.8]}>
        <meshPhysicalMaterial color="#ccddff" metalness={0.3} roughness={0.1} transmission={0.8} thickness={2} />
      </mesh>

      {/* 432 Park Avenue (South East, closer) */}
      <mesh ref={park432Ref} geometry={park432Geo || undefined} position={[10, 0, 45]} scale={[1.5, 1.5, 1.5]}>
        <meshPhysicalMaterial color="#ffffff" metalness={0.1} roughness={0.1} transmission={0.9} thickness={1} />
      </mesh>

      {/* One Vanderbilt (South West) */}
      <mesh ref={vanderbiltRef} geometry={vanderbiltGeo || undefined} position={[-12, 0, 55]} scale={[1.8, 1.8, 1.8]}>
        <meshPhysicalMaterial color="#bbddff" metalness={0.2} roughness={0.1} transmission={0.8} thickness={2} />
      </mesh>

    </group>
  );
};

const Trees = () => {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const treeData = useMemo(() => {
    const instances: THREE.Matrix4[] = [];
    // Place trees INSIDE the park void
    for (let i = 0; i < 200; i++) {
      const x = (Math.random() - 0.5) * 30; // Narrower X (width of park)
      const z = (Math.random() - 0.5) * 80; // Longer Z (length of park)
      
      // Avoid center lake area
      if (Math.abs(x) < 8 && Math.abs(z) < 15) continue;

      dummy.position.set(x, 0, z);
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
      <Canvas camera={{ position: [0, 10, -40], fov: 45 }}>
        <color attach="background" args={['#050a15']} />
        
        <OrbitControls 
          enablePan={false} 
          maxPolarAngle={Math.PI / 2 - 0.05} 
          minDistance={10}
          maxDistance={100}
          autoRotate
          autoRotateSpeed={0.5}
        />

        <ambientLight intensity={0.2} />
        <pointLight position={[10, 20, 10]} intensity={1} color="#aaddff" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Environment preset="night" />
        
        <group>
          <City />
          <Trees />
          <FrozenLake />
          <SnowSystem />
        </group>

        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.4} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
          <ToneMapping adaptive={true} resolution={256} middleGrey={0.6} maxLuminance={16.0} averageLuminance={1.0} adaptationRate={1.0} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
