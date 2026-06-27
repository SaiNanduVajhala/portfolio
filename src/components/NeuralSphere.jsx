import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * NeuralNetwork — A native R3F component (NOT a nested Canvas).
 * Renders directly inside the main Canvas scene graph for zero-overhead integration.
 */
export default function NeuralNetwork({ count = 50, theme = 'dark' }) {
  const pointsRef = useRef();
  const linesRef = useRef();
  const groupRef = useRef();
  const frameCounter = useRef(0);

  // Generate random particles inside a sphere
  const [particles] = useMemo(() => {
    const tempParticles = [];
    const radius = 2.5;

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);

      const r = radius * (0.6 + 0.4 * Math.random());
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      tempParticles.push({
        pos: new THREE.Vector3(x, y, z),
        origin: new THREE.Vector3(x, y, z),
        speed: 0.2 + Math.random() * 0.4,
        angle: Math.random() * Math.PI * 2,
      });
    }

    return [tempParticles];
  }, [count]);

  const [particlePositions, linePositions] = useMemo(() => {
    const pPos = new Float32Array(count * 3);
    particles.forEach((p, i) => {
      pPos[i * 3] = p.pos.x;
      pPos[i * 3 + 1] = p.pos.y;
      pPos[i * 3 + 2] = p.pos.z;
    });

    const lPos = new Float32Array(80 * 2 * 3);
    return [pPos, lPos];
  }, [particles, count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, time * 0.15, 0.03);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, time * 0.1, 0.03);
    }

    // Particle breathing animation
    const positions = pointsRef.current.geometry.attributes.position.array;
    particles.forEach((p, i) => {
      const offset = Math.sin(time * p.speed + p.angle) * 0.08;
      const currentPos = p.origin.clone().multiplyScalar(1 + offset);

      positions[i * 3] = currentPos.x;
      positions[i * 3 + 1] = currentPos.y;
      positions[i * 3 + 2] = currentPos.z;

      p.pos.copy(currentPos);
    });
    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Throttled line connections (every 3rd frame)
    frameCounter.current++;
    if (frameCounter.current % 3 === 0) {
      let lineIdx = 0;
      const lineArray = linesRef.current.geometry.attributes.position.array;
      lineArray.fill(0);
      const maxDistSq = 1.8 * 1.8;
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const distSq = particles[i].pos.distanceToSquared(particles[j].pos);
          if (distSq < maxDistSq && lineIdx < 80) {
            lineArray[lineIdx * 6] = particles[i].pos.x;
            lineArray[lineIdx * 6 + 1] = particles[i].pos.y;
            lineArray[lineIdx * 6 + 2] = particles[i].pos.z;
            lineArray[lineIdx * 6 + 3] = particles[j].pos.x;
            lineArray[lineIdx * 6 + 4] = particles[j].pos.y;
            lineArray[lineIdx * 6 + 5] = particles[j].pos.z;
            lineIdx++;
          }
        }
      }
      linesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={theme === 'light' ? '#E65F2B' : '#17B26A'}
          size={0.12}
          sizeAttenuation={true}
          transparent={true}
          opacity={theme === 'light' ? 0.8 : 0.9}
          depthWrite={false}
          blending={theme === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </points>

      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={theme === 'light' ? '#1A1715' : '#4285F4'}
          transparent={true}
          opacity={theme === 'light' ? 0.15 : 0.25}
          blending={theme === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      <mesh>
        <sphereGeometry args={[1.5, 12, 12]} />
        <meshBasicMaterial
          color={theme === 'light' ? '#C54A1C' : '#17B26A'}
          wireframe={true}
          transparent={true}
          opacity={theme === 'light' ? 0.15 : 0.08}
          blending={theme === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
