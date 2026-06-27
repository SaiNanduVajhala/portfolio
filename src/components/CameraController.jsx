import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function CameraController({ activeSector, sectorCoordinates, hasEntered }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 4, 30));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));
  const currentLook = useRef(new THREE.Vector3(0, 0, 0));
  const globalPointer = useRef({ x: 0, y: 0 });

  // Pre-position camera closer before entry
  useEffect(() => {
    if (!hasEntered) {
      camera.position.set(0, 4, 30);
      currentLook.current.set(0, 0, 0);
      camera.lookAt(currentLook.current);
    }
  }, [hasEntered, camera]);

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
    if (!hasEntered) {
      targetPos.current.set(0, 4, 30);
      targetLook.current.set(0, 0, 0);
      return;
    }

    const coord = sectorCoordinates[activeSector] || [0, 0, 0];

    // Shift camera target downward dynamically to clear the fixed 56px top navbar
    const yOffset = activeSector === 'hero' ? -0.2 : -0.8;

    // Use 7.2 instead of 9 to bring the camera closer (less zoomed out) at rest
    targetPos.current.set(coord[0], coord[1] + yOffset, coord[2] + 9);
    targetLook.current.set(coord[0], coord[1] + yOffset, coord[2]);
  }, [activeSector, sectorCoordinates, hasEntered]);

  useFrame(() => {
    const pointer = globalPointer.current;

    // 1. Add interactive cursor offset for dynamic 3D depth parallax (only active after entering)
    const parallaxOffset = hasEntered
      ? new THREE.Vector3(pointer.x * 0.8, pointer.y * 0.8, 0)
      : new THREE.Vector3(0, 0, 0);

    const localTargetPos = targetPos.current.clone().add(parallaxOffset);

    // 2. Distance-adaptive lerp — snappy fly-in from deep space, high precision when settled
    const dist = camera.position.distanceTo(localTargetPos);
    const lerpSpeed = dist > 10 ? 0.20 : (dist > 2 ? 0.12 : 0.06);

    camera.position.lerp(localTargetPos, lerpSpeed);

    // 3. Smoothly interpolate camera look-at vector
    const lookParallax = hasEntered
      ? new THREE.Vector3(pointer.x * 0.4, pointer.y * 0.4, 0)
      : new THREE.Vector3(0, 0, 0);

    const localTargetLook = targetLook.current.clone().add(lookParallax);
    currentLook.current.lerp(localTargetLook, lerpSpeed);
    camera.lookAt(currentLook.current);
  });

  return null;
}
