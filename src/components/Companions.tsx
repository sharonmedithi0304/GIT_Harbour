import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DolphinProps {
  position?: [number, number, number];
  scale?: number;
  color?: string;
  speed?: number;
}

export function Dolphin({
  position = [0, -1, 0],
  scale = 1,
  color = '#4a6fa5',
  speed = 1,
}: DolphinProps) {
  const groupRef = useRef<THREE.Group>(null);
  const phaseRef = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (!groupRef.current) return;

    const t = state.clock.elapsedTime * speed * 0.5 + phaseRef.current;

    // Swimming motion - figure-8 pattern
    groupRef.current.position.x = position[0] + Math.sin(t) * 15;
    groupRef.current.position.z = position[2] + Math.sin(t * 2) * 8;
    groupRef.current.position.y = position[1] + Math.sin(t * 3) * 2;

    // Rotate to face direction of movement
    const nextX = position[0] + Math.sin(t + 0.1) * 15;
    const nextZ = position[2] + Math.sin((t + 0.1) * 2) * 8;
    const dx = nextX - groupRef.current.position.x;
    const dz = nextZ - groupRef.current.position.z;
    groupRef.current.rotation.y = Math.atan2(dx, dz);

    // Dive angle
    groupRef.current.rotation.z = Math.cos(t * 3) * 0.2;

    // Body undulation
    if (groupRef.current.children[0]) {
      groupRef.current.children[0].rotation.y = Math.sin(t * 4) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Body */}
      <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <capsuleGeometry args={[0.3, 1.8, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Snout */}
      <mesh position={[0, 0.1, 1.2]} rotation={[Math.PI / 4, 0, 0]}>
        <coneGeometry args={[0.15, 0.6, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>

      {/* Dorsal fin */}
      <mesh position={[0, 0.4, -0.2]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.1, 0.4, 4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>

      {/* Tail flukes */}
      <mesh position={[0, 0, -1.3]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.6, 0.05, 0.3]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>

      {/* Pectoral fins */}
      <mesh position={[0.2, -0.1, 0.5]} rotation={[0.3, 0, -0.5]}>
        <coneGeometry args={[0.08, 0.4, 4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[-0.2, -0.1, 0.5]} rotation={[-0.3, 0, 0.5]}>
        <coneGeometry args={[0.08, 0.4, 4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  );
}

interface BirdProps {
  position?: [number, number, number];
  scale?: number;
  color?: string;
  speed?: number;
  flightRadius?: number;
}

export function Bird({
  position = [0, 20, 0],
  scale = 0.5,
  color = '#f5f5f5',
  speed = 1,
  flightRadius = 30,
}: BirdProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wingRef = useRef<THREE.Mesh>(null);
  const phaseRef = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (!groupRef.current) return;

    const t = state.clock.elapsedTime * speed * 0.3 + phaseRef.current;

    // Circular flight pattern
    groupRef.current.position.x = position[0] + Math.cos(t) * flightRadius;
    groupRef.current.position.z = position[2] + Math.sin(t) * flightRadius;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.5) * 3;

    // Face direction of flight
    groupRef.current.rotation.y = -t + Math.PI / 2;

    // Bank into turns
    groupRef.current.rotation.z = Math.cos(t) * 0.15;

    // Wing flapping
    if (wingRef.current) {
      wingRef.current.rotation.x = Math.sin(t * 8) * 0.4;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Body */}
      <mesh>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.1, 0.15]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>

      {/* Beak */}
      <mesh position={[0, 0.1, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.03, 0.15, 4]} />
        <meshStandardMaterial color="#e8a54b" roughness={0.7} />
      </mesh>

      {/* Wings */}
      <mesh ref={wingRef} position={[0.3, 0.1, 0]}>
        <boxGeometry args={[0.5, 0.02, 0.2]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[-0.3, 0.1, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.02, 0.2]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>

      {/* Tail */}
      <mesh position={[0, 0, -0.25]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.08, 0.2, 4]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  );
}

interface WhaleProps {
  position?: [number, number, number];
  scale?: number;
  visible?: boolean;
}

export function Whale({
  position = [50, -8, -30],
  scale = 3,
  visible = false,
}: WhaleProps) {
  const groupRef = useRef<THREE.Group>(null);
  const phaseRef = useRef(0);

  useFrame((state) => {
    if (!groupRef.current || !visible) return;

    const t = state.clock.elapsedTime * 0.05 + phaseRef.current;

    // Slow, majestic swimming
    groupRef.current.position.x = position[0] + Math.sin(t) * 40;
    groupRef.current.position.z = position[2] + Math.cos(t * 0.5) * 30;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.3) * 5;

    // Face direction
    groupRef.current.rotation.y = Math.atan2(
      Math.cos(t) * 40,
      -Math.sin(t * 0.5) * 30 * 0.5
    );

    // Gentle roll
    groupRef.current.rotation.z = Math.sin(t * 0.8) * 0.05;
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Massive body */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <capsuleGeometry args={[1.5, 6, 12, 24]} />
        <meshStandardMaterial color="#2a3a5a" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.5, 3.5]}>
        <sphereGeometry args={[1.3, 12, 12]} />
        <meshStandardMaterial color="#2a3a5a" roughness={0.7} />
      </mesh>

      {/* Tail */}
      <mesh position={[0, 0, -4]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[3, 0.1, 1]} />
        <meshStandardMaterial color="#2a3a5a" roughness={0.7} />
      </mesh>

      {/* Dorsal fin */}
      <mesh position={[0, 1.5, -1]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[0.3, 1, 4]} />
        <meshStandardMaterial color="#2a3a5a" roughness={0.7} />
      </mesh>

      {/* Eye */}
      <mesh position={[0.8, 0.8, 4]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>
    </group>
  );
}

interface FlockOfBirdsProps {
  count?: number;
  centerPosition?: [number, number, number];
}

export function FlockOfBirds({ count = 8, centerPosition = [0, 25, 0] }: FlockOfBirdsProps) {
  const birds = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      offset: (i / count) * Math.PI * 2,
      radius: 20 + Math.random() * 15,
      height: centerPosition[1] + (Math.random() - 0.5) * 10,
      scale: 0.3 + Math.random() * 0.3,
    }));
  }, [count, centerPosition]);

  return (
    <group>
      {birds.map((bird, i) => (
        <Bird
          key={i}
          position={[centerPosition[0], bird.height, centerPosition[2]]}
          scale={bird.scale}
          flightRadius={bird.radius}
          speed={0.8 + Math.random() * 0.4}
        />
      ))}
    </group>
  );
}

interface DolphinPodProps {
  count?: number;
  centerPosition?: [number, number, number];
}

export function DolphinPod({ count = 5, centerPosition = [0, -1, 20] }: DolphinPodProps) {
  const dolphins = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      offset: (i / count) * Math.PI * 2,
      scale: 0.8 + Math.random() * 0.4,
      speed: 0.6 + Math.random() * 0.4,
      color: i === 0 ? '#5a7fb5' : '#4a6fa5',
    }));
  }, [count]);

  return (
    <group>
      {dolphins.map((dolphin, i) => (
        <Dolphin
          key={i}
          position={[
            centerPosition[0] + (i - count / 2) * 3,
            centerPosition[1],
            centerPosition[2],
          ]}
          scale={dolphin.scale}
          speed={dolphin.speed}
          color={dolphin.color}
        />
      ))}
    </group>
  );
}
