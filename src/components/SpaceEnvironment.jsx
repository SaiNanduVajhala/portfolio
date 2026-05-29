import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Starfield({ count = 2000, theme = 'dark' }) {
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
        color={theme === 'light' ? '#E65F2B' : '#FCFCFD'}
        size={0.06}
        sizeAttenuation={true}
        transparent={true}
        opacity={theme === 'light' ? 0.4 : 0.3}
        blending={theme === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function ConnectingPath({ start, end, theme = 'dark' }) {
  const color = theme === 'light' ? '#C54A1C' : '#17B26A';
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
        opacity={theme === 'light' ? 0.25 : 0.12}
        blending={theme === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending}
        depthWrite={false}
      />
    </line>
  );
}

export default function SpaceEnvironment({ sectorCoordinates, theme }) {
  // Connect Hero [0,0,0] to all other coordinate sectors
  const connections = useMemo(() => {
    const otherSectors = Object.keys(sectorCoordinates).filter(k => k !== 'hero');

    return otherSectors.map((sectorKey) => (
      <ConnectingPath 
        key={sectorKey} 
        start={sectorCoordinates.hero} 
        end={sectorCoordinates[sectorKey]}
        theme={theme}
      />
    ));
  }, [sectorCoordinates, theme]);

  return (
    <group>
      <Starfield count={2200} theme={theme} />
      {connections}
    </group>
  );
}
