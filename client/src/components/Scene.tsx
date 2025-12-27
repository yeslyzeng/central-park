import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, Outline } from '@react-three/postprocessing';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { BuildingManager } from './BuildingManager';
import { ParkTerrain } from './ParkTerrain';
import { FloatingPlatform } from './FloatingPlatform';
import { UndergroundLayer, DeepLayer } from './Layers';

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
       <meshStandardMaterial color="#d0d0d0" roughness={0.9} /> {/* Grey trees for architectural look */}
     </instancedMesh>
   )
}

// --- ANIMATED LAYER GROUPS ---
const AnimatedLayer = ({ targetY, children }: { targetY: number, children: React.ReactNode }) => {
  const groupRef = useRef<THREE.Group>(null!);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Smooth lerp to target Y position
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * 3);
    }
  });

  return <group ref={groupRef}>{children}</group>;
};


interface SceneProps {
  activeLayer: 'surface' | 'underground' | 'deep';
}

export default function Scene({ activeLayer }: SceneProps) {
  
  // Calculate target Y positions based on active layer
  // Surface: 0 (default), 15 (underground), 30 (deep)
  // Underground: -15 (default), 0 (underground), 15 (deep)
  // Deep: -30 (default), -15 (underground), 0 (deep)
  
  let surfaceY = 0;
  let undergroundY = -20;
  let deepY = -40;

  if (activeLayer === 'underground') {
    surfaceY = 20;
    undergroundY = 0;
    deepY = -20;
  } else if (activeLayer === 'deep') {
    surfaceY = 40;
    undergroundY = 20;
    deepY = 0;
  }

  return (
    <Canvas shadows camera={{ position: [40, 40, 40], fov: 35, near: 1, far: 1000 }}>
      <color attach="background" args={['#f5f5f5']} /> {/* Architectural White/Grey Background */}
      
      {/* Isometric Camera Setup */}
      <orthographicCamera args={[-50, 50, 50, -50, 1, 1000]} position={[50, 50, 50]} zoom={10} />
      
      <OrbitControls 
        autoRotate 
        autoRotateSpeed={0.5} 
        enableZoom={true} 
        maxPolarAngle={Math.PI / 2.2} 
        minPolarAngle={0.5}
      />

      {/* Lighting - Clean Studio Lighting */}
      <ambientLight intensity={0.6} color="#ffffff" />
      <directionalLight 
        position={[50, 100, 50]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        color="#ffffff"
      />
      <directionalLight position={[-50, 50, -50]} intensity={0.4} color="#e0e0ff" /> {/* Fill light */}

      {/* Environment */}
      <fog attach="fog" args={['#f5f5f5', 40, 150]} />
      
      {/* --- LAYERS --- */}
      
      {/* SURFACE LAYER (City) */}
      <AnimatedLayer targetY={surfaceY}>
        <group position={[0, -5, 0]}>
          <FloatingPlatform />
          <ParkTerrain />
          <TreeInstances />
          <BuildingManager />
          <SnowSystem />
        </group>
      </AnimatedLayer>

      {/* UNDERGROUND LAYER (Subway) */}
      <AnimatedLayer targetY={undergroundY}>
         <group position={[0, -5, 0]}>
            <UndergroundLayer />
         </group>
      </AnimatedLayer>

      {/* DEEP INFRA LAYER (Pipes) */}
      <AnimatedLayer targetY={deepY}>
         <group position={[0, -5, 0]}>
            <DeepLayer />
         </group>
      </AnimatedLayer>

      {/* Post Processing */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.9} mipmapBlur intensity={0.3} radius={0.4} />
        <Vignette eskil={false} offset={0.1} darkness={0.2} />
        <Outline 
          blur
          edgeStrength={2.5} 
          width={500} 
          visibleEdgeColor={0x000000} 
          hiddenEdgeColor={0x000000} 
        />
      </EffectComposer>
    </Canvas>
  );
}
