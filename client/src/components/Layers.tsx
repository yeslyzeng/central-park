import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';

// --- UNDERGROUND LAYER (Subways) ---
export const UndergroundLayer = () => {
  // Generate subway lines (simplified for visual effect)
  const subwayLines = useMemo(() => {
    const lines = [];
    
    // 8th Ave Line (Blue/Orange) - West Side
    lines.push({
      points: [[-12, 0, -30], [-12, 0, 30]].map(p => new THREE.Vector3(...p)),
      color: '#0039A6' // A/C/E Blue
    });
    
    // Broadway Line (Red) - Diagonal
    lines.push({
      points: [[-15, 0, 30], [10, 0, -30]].map(p => new THREE.Vector3(...p)),
      color: '#EE352E' // 1/2/3 Red
    });

    // 6th Ave Line (Orange)
    lines.push({
      points: [[0, 0, 30], [0, 0, -30]].map(p => new THREE.Vector3(...p)),
      color: '#FF6319' // B/D/F/M Orange
    });

    // Lexington Line (Green) - East Side
    lines.push({
      points: [[15, 0, 30], [15, 0, -30]].map(p => new THREE.Vector3(...p)),
      color: '#00933C' // 4/5/6 Green
    });

    // Crosstown lines
    lines.push({
      points: [[-20, 0, 25], [20, 0, 25]].map(p => new THREE.Vector3(...p)), // 59th St
      color: '#FCCC0A' // N/Q/R/W Yellow
    });

    return lines;
  }, []);

  return (
    <group>
      {/* Subway Tunnels/Tracks */}
      {subwayLines.map((line, i) => (
        <group key={i}>
          <Line 
            points={line.points} 
            color={line.color} 
            lineWidth={4} 
            opacity={0.8}
            transparent
          />
          {/* Stations as glowing dots */}
          {line.points.map((p, j) => (
             j === 0 || j === line.points.length - 1 ? null : // Skip ends if needed, or add intermediate points
             <mesh key={j} position={p}>
               <sphereGeometry args={[0.4, 16, 16]} />
               <meshBasicMaterial color="white" />
             </mesh>
          ))}
        </group>
      ))}
      
      {/* Grid/Floor for context */}
      <gridHelper args={[60, 20, 0x444444, 0x222222]} position={[0, -0.1, 0]} />
    </group>
  );
};

// --- DEEP INFRA LAYER (Pipes, Bedrock) ---
export const DeepLayer = () => {
  const pipes = useMemo(() => {
    const p = [];
    for (let i = 0; i < 15; i++) {
      const x = (Math.random() - 0.5) * 40;
      const z1 = -30;
      const z2 = 30;
      p.push({
        points: [[x, 0, z1], [x + (Math.random()-0.5)*5, 0, z2]].map(pt => new THREE.Vector3(...pt)),
        color: Math.random() > 0.5 ? '#00A4CC' : '#FFB900', // Water vs Gas
        width: Math.random() * 3 + 1
      });
    }
    return p;
  }, []);

  return (
    <group>
      {/* Bedrock visualization - stylized wireframe terrain */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[60, 80, 20, 20]} />
        <meshBasicMaterial color="#333" wireframe transparent opacity={0.2} />
      </mesh>

      {/* Infrastructure Pipes */}
      {pipes.map((pipe, i) => (
        <Line 
          key={i}
          points={pipe.points} 
          color={pipe.color} 
          lineWidth={pipe.width} 
          dashed
          dashScale={2}
          gapSize={1}
          opacity={0.6}
          transparent
        />
      ))}
    </group>
  );
};
