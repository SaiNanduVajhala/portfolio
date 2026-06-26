import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function CameraController({ activeSector, sectorCoordinates }) {
  const { camera } = useThree();
<<<<<<< HEAD
  const targetPos = useRef(new THREE.Vector3(0, 0, 6));
=======
  const targetPos = useRef(new THREE.Vector3(0, 0, 6.8));
>>>>>>> lightmode
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));
  const currentLook = useRef(new THREE.Vector3(0, 0, 0));
  const globalPointer = useRef({ x: 0, y: 0 });

  // Listen to mousemove globally on window to prevent HTML overlays from blocking Canvas pointer events
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      globalPointer.current = { x, y };
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  useEffect(() => {
    const coord = sectorCoordinates[activeSector] || [0, 0, 0];
<<<<<<< HEAD
    
    // Shift camera target downward dynamically to clear the fixed 56px top navbar
    const yOffset = activeSector === 'hero' ? -0.2 : -0.8;
    
    targetPos.current.set(coord[0], coord[1] + yOffset, coord[2] + 6);
=======

    // Shift camera target downward dynamically to clear the fixed 56px top navbar
    const yOffset = activeSector === 'hero' ? -0.2 : -0.8;

    targetPos.current.set(coord[0], coord[1] + yOffset, coord[2] + 9);
>>>>>>> lightmode
    targetLook.current.set(coord[0], coord[1] + yOffset, coord[2]);
  }, [activeSector, sectorCoordinates]);

  useFrame(() => {
    const pointer = globalPointer.current;

    // 1. Add interactive cursor offset for dynamic 3D depth parallax
    const localTargetPos = targetPos.current.clone().add(
      new THREE.Vector3(pointer.x * 0.8, pointer.y * 0.8, 0)
    );

    // 2. Distance-adaptive lerp — fast for long flights, smooth when settled
    const dist = camera.position.distanceTo(localTargetPos);
    const lerpSpeed = dist > 2 ? 0.12 : 0.06;

    camera.position.lerp(localTargetPos, lerpSpeed);

    // 3. Smoothly interpolate camera look-at vector
    const localTargetLook = targetLook.current.clone().add(
      new THREE.Vector3(pointer.x * 0.4, pointer.y * 0.4, 0)
    );
    currentLook.current.lerp(localTargetLook, lerpSpeed);
    camera.lookAt(currentLook.current);
  });

  return null;
}
