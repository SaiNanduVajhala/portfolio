import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Starfield({ count = 2000 }) {
  const pointsRef = useRef();

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const range = 45;

    for (let i = 0; i < count; i++) {
      // Scatter stars widely in 3D coordinate universe
      pos[i * 3] = (Math.random() - 0.5) * range * 2;
      pos[i * 3 + 1] = (Math.random() - 0.5) * range * 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * range * 1.5 - 15; // deeper background focus
    }

    return [pos];
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (pointsRef.current) {
      // Subtle ambient orbital drift
      pointsRef.current.rotation.y = time * 0.008;
      pointsRef.current.rotation.x = time * 0.003;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#FCFCFD"
        size={0.06}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.3}
        depthWrite={false}
      />
    </points>
  );
}

function ConnectingPath({ start, end, color = "#17B26A" }) {
  const curve = useMemo(() => {
    // Generate curved arched path between sectors
    const midPoint = new THREE.Vector3()
      .addVectors(new THREE.Vector3(...start), new THREE.Vector3(...end))
      .multiplyScalar(0.5);
    
    // Push the midpoint upward/outward to create a beautiful arch
    midPoint.y += 2.0;
    midPoint.z -= 1.5;

    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(...start),
      midPoint,
      new THREE.Vector3(...end),
    ]);
  }, [start, end]);

  const points = useMemo(() => curve.getPoints(40), [curve]);
  const linePositions = useMemo(() => {
    const arr = new Float32Array(points.length * 3);
    points.forEach((p, i) => {
      arr[i * 3] = p.x;
      arr[i * 3 + 1] = p.y;
      arr[i * 3 + 2] = p.z;
    });
    return arr;
  }, [points]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[linePositions, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={color}
        transparent={true}
        opacity={0.12}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </line>
  );
}

export default function SpaceEnvironment({ sectorCoordinates }) {
  // Connect Hero [0,0,0] to all other coordinate sectors
  const connections = useMemo(() => {
    const coords = { ...sectorCoordinates };
    delete coords.hero; // don't connect hero to itself

    return Object.entries(coords).map(([key, value]) => {
      // Alternating colors between Emerald Green and digital blue
      const color = key === 'about' || key === 'skills' ? '#17B26A' : '#4285F4';
      return (
        <ConnectingPath
          key={key}
          start={[0, 0, 0]}
          end={value}
          color={color}
        />
      );
    });
  }, [sectorCoordinates]);

  return (
    <group>
      <Starfield count={2200} />
      {connections}
    </group>
  );
}
