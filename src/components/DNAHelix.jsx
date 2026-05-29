import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function DNAHelix({ count = 30 }) {
  const groupRef = useRef();

  // Pre-calculate positions of the DNA base pairs
  const basePairs = useMemo(() => {
    const pairs = [];
    const height = 4.0;
    const turns = 2.0;

    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * height;

      // Outer nodes on Strand A and Strand B
      const r = 1.0;
      const xA = r * Math.sin(angle);
      const zA = r * Math.cos(angle);

      const xB = r * Math.sin(angle + Math.PI);
      const zB = r * Math.cos(angle + Math.PI);

      pairs.push({
        posA: new THREE.Vector3(xA, y, zA),
        posB: new THREE.Vector3(xB, y, zB),
        phase: Math.random() * Math.PI * 2,
      });
    }

    return pairs;
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Rotate the entire helix organically
      groupRef.current.rotation.y = time * 0.4;
      groupRef.current.rotation.x = Math.sin(time * 0.2) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {basePairs.map((pair, idx) => {
        // Line representation for horizontal base connection bars
        const linePositions = new Float32Array([
          pair.posA.x, pair.posA.y, pair.posA.z,
          pair.posB.x, pair.posB.y, pair.posB.z
        ]);

        return (
          <group key={idx}>
            {/* Strand A node (glowing emerald green) */}
            <mesh position={pair.posA}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshBasicMaterial color="#17B26A" />
            </mesh>

            {/* Strand B node (glowing emerald green) */}
            <mesh position={pair.posB}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshBasicMaterial color="#17B26A" />
            </mesh>

            {/* Connecting base bar (thin digital blue path) */}
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[linePositions, 3]}
                />
              </bufferGeometry>
              <lineBasicMaterial
                color="#4285F4"
                transparent={true}
                opacity={0.4}
                blending={THREE.AdditiveBlending}
              />
            </line>
          </group>
        );
      })}
    </group>
  );
}
