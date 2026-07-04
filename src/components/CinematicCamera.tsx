import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

interface CinematicCameraProps {
  targetPosition?: [number, number, number];
  targetLookAt?: [number, number, number];
  phase: 'hidden' | 'approaching' | 'emerging' | 'assembling' | 'revealing' | 'complete' | 'sailing';
  enabled?: boolean;
}

export function CinematicCamera({
  targetPosition = [0, 10, 40],
  targetLookAt = [0, 0, 0],
  phase,
  enabled = true,
}: CinematicCameraProps) {
  const { camera } = useThree();
  const lookAtRef = useRef(new THREE.Vector3(...targetLookAt));
  const breathingOffset = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (!enabled) return;

    // Cinematic camera movements based on phase
    const duration = phase === 'hidden' ? 0 : 2.5;
    const ease = 'power2.inOut';

    gsap.to(camera.position, {
      x: targetPosition[0],
      y: targetPosition[1],
      z: targetPosition[2],
      duration,
      ease,
    });

    gsap.to(lookAtRef.current, {
      x: targetLookAt[0],
      y: targetLookAt[1],
      z: targetLookAt[2],
      duration,
      ease,
    });
  }, [camera, targetPosition, targetLookAt, phase, enabled]);

  useFrame((state) => {
    if (!enabled) return;

    // Smooth look-at interpolation
    const currentLookAt = new THREE.Vector3();
    camera.getWorldDirection(currentLookAt);
    currentLookAt.multiplyScalar(10).add(camera.position);

    const targetLookAtVec = lookAtRef.current.clone();
    targetLookAtVec.lerp(currentLookAt, 0.95);
    camera.lookAt(lookAtRef.current);

    // Add subtle breathing/wave motion for organic feel
    const breathe = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    const sway = Math.sin(state.clock.elapsedTime * 0.15) * 0.05;

    breathingOffset.current.x = sway;
    breathingOffset.current.y = breathe;
    breathingOffset.current.z = Math.cos(state.clock.elapsedTime * 0.2) * 0.08;

    // Apply breathing only when not in animation
    if (phase === 'complete' || phase === 'sailing') {
      camera.position.x += breathingOffset.current.x * 0.1;
      camera.position.y += breathingOffset.current.y * 0.1;
      camera.position.z += breathingOffset.current.z * 0.1;
    }
  });

  return null;
}

interface OrbitCameraProps {
  center?: [number, number, number];
  radius?: number;
  height?: number;
  speed?: number;
  enabled?: boolean;
}

export function OrbitCamera({
  center = [0, 5, 0],
  radius = 35,
  height = 10,
  speed = 0.05,
  enabled = true,
}: OrbitCameraProps) {
  const { camera } = useThree();
  const angleRef = useRef(0);

  useFrame(() => {
    if (!enabled) return;

    angleRef.current += speed * 0.01;

    const targetX = center[0] + Math.sin(angleRef.current) * radius;
    const targetZ = center[2] + Math.cos(angleRef.current) * radius;
    const targetY = height + Math.sin(angleRef.current * 0.5) * 2;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.02);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.02);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.02);

    camera.lookAt(center[0], center[1], center[2]);
  });

  return null;
}
