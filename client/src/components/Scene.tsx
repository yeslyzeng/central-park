import { OrbitControls, Stars, Cloud, Environment } from '@react-three/drei';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { BuildingManager } from './BuildingManager';
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

const Trees = () => {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const treeData = useMemo(() => {
    const instances: THREE.Matrix4[] = [];
    // Place trees INSIDE the park void (40x200)
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 18; // Keep within -9 to 9 (park width)
      const z = (Math.random() - 0.5) * 48; // Keep within -24 to 24 (park length)
      
      // Avoid lake area (approx z > 10)
      if (z > 10 && x > 0) continue;

      dummy.position.set(x, 0, z);
      const scale = 0.3 + Math.random() * 0.4;
      dummy.scale.set(scale, scale * (0.8 + Math.random() * 0.4), scale);
      dummy.rotation.y = Math.random() * Math.PI;
      dummy.updateMatrix();
      instances.push(dummy.matrix.clone());
    }
    return instances;
  }, []);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, treeData.length]}>
      <coneGeometry args={[1, 2, 4]} />
      <meshStandardMaterial color="#a0c0a0" roughness={0.8} />
      {treeData.map((matrix, i) => (
        <primitive key={i} object={dummy} /> // React-three-fiber handles instance matrix updates automatically if passed via args, but manual set is better for static
      ))}
    </instancedMesh>
  );
};

// Manual matrix update for trees
const TreeInstances = () => {
   const mesh = useRef<THREE.InstancedMesh>(null!);
   const dummy = useMemo(() => new THREE.Object3D(), []);
   
   const count = 800;
   
   useEffect(() => {
     if (!mesh.current) return;
     
     let idx = 0;
     for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 18; 
        const z = (Math.random() - 0.5) * 48;
        
        // Simple lake exclusion
        if (z > 15 && x > 2) continue; // Pond
        if (z < -15 && x < -2) continue; // Reservoir

        dummy.position.set(x, 0.5, z);
        const s = 0.3 + Math.random() * 0.3;
        dummy.scale.set(s, s + Math.random() * 0.3, s);
        dummy.rotation.y = Math.random() * Math.PI;
        dummy.updateMatrix();
        mesh.current.setMatrixAt(idx++, dummy.matrix);
     }
     mesh.current.instanceMatrix.needsUpdate = true;
   }, []);

   return (
     <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
       <coneGeometry args={[1, 2.5, 5]} />
       <meshStandardMaterial color="#cce0cc" roughness={0.9} />
     </instancedMesh>
   )
}


export default function Scene() {
  return (
    <Canvas shadows camera={{ position: [40, 40, 40], fov: 35, near: 1, far: 1000 }}>
      <color attach="background" args={['#ffdde1']} /> {/* Pastel Pink Sky */}
      
      {/* Isometric Camera Setup */}
      <orthographicCamera args={[-50, 50, 50, -50, 1, 1000]} position={[50, 50, 50]} zoom={10} />
      
      <OrbitControls 
        autoRotate 
        autoRotateSpeed={0.5} 
        enableZoom={true} 
        maxPolarAngle={Math.PI / 2.2} 
        minPolarAngle={0.5}
      />

      {/* Lighting */}
      <ambientLight intensity={0.8} color="#ffffff" />
      <directionalLight 
        position={[50, 100, 50]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        color="#fff0dd"
      />
      <pointLight position={[-20, 10, -20]} intensity={0.5} color="#aaddff" />

      {/* Environment */}
      <fog attach="fog" args={['#ffdde1', 30, 120]} />
      
      {/* World Content */}
      <group position={[0, -5, 0]}>
        <FloatingPlatform />
        <ParkTerrain />
        <TreeInstances />
        <BuildingManager />
        <SnowSystem />
      </group>

      {/* Post Processing */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.8} mipmapBlur intensity={0.5} radius={0.4} />
        <Vignette eskil={false} offset={0.1} darkness={0.3} />
      </EffectComposer>
    </Canvas>
  );
}
