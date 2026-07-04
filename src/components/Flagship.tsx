import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import type { ShipPart } from '../types';

interface FlagshipProps {
  assembledParts: ShipPart[];
  opacity: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

const WOOD_COLOR = '#5c3d2e';
const DARK_WOOD = '#3a2518';
const GOLD_COLOR = '#c9a962';
const SAIL_COLOR = '#e8dcc4';
const LANTERN_COLOR = '#ffcc44';

function Hull({ assembled, opacity }: { assembled: boolean; progress?: number; opacity: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const hullShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-8, 0);
    shape.bezierCurveTo(-8, -1, -7, -2, -5, -2.5);
    shape.lineTo(7, -2.5);
    shape.bezierCurveTo(9, -2, 10, -1, 10, 0);
    shape.lineTo(10, 3);
    shape.lineTo(-8, 3);
    shape.closePath();
    return shape;
  }, []);

  const extrudeSettings = { depth: 6, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.1 };

  const targetY = assembled ? 0 : -10;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
    }
  });

  return (
    <group ref={groupRef} position={[0, assembled ? 0 : -10, 0]}>
      {/* Main hull */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, Math.PI]} castShadow receiveShadow>
        <extrudeGeometry args={[hullShape, extrudeSettings]} />
        <meshStandardMaterial color={WOOD_COLOR} roughness={0.8} metalness={0.1} transparent opacity={opacity} />
      </mesh>

      {/* Hull details - planks */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`plank-${i}`} position={[1 + i * 1.1 - 4.5, 0.5 - i * 0.2, 3]} rotation={[0, 0, 0]} castShadow>
          <boxGeometry args={[1, 0.1, 5.8]} />
          <meshStandardMaterial color={i % 2 === 0 ? WOOD_COLOR : DARK_WOOD} roughness={0.9} transparent opacity={opacity} />
        </mesh>
      ))}

      {/* Keel */}
      <mesh position={[1, -2.5, 3]} castShadow>
        <boxGeometry args={[0.3, 0.5, 20]} />
        <meshStandardMaterial color={DARK_WOOD} roughness={0.9} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

function Bow({ assembled, opacity }: { assembled: boolean; progress?: number; opacity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotZ = assembled ? 0 : Math.PI / 2;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotZ, 0.08);
    }
  });

  return (
    <group ref={groupRef} position={[-15, 0, 3]}>
      {/* Curved bow extension */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 12]} castShadow>
        <boxGeometry args={[5, 2.5, 5]} />
        <meshStandardMaterial color={WOOD_COLOR} roughness={0.8} transparent opacity={opacity} />
      </mesh>

      {/* Decorative bow rail */}
      <mesh position={[-2, 1.5, 0]} rotation={[0, 0, -Math.PI / 8]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 4, 8]} />
        <meshStandardMaterial color={GOLD_COLOR} roughness={0.3} metalness={0.8} transparent opacity={opacity} />
      </mesh>

      {/* Bowsprit */}
      <mesh position={[-4, 2, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <cylinderGeometry args={[0.15, 0.25, 8, 8]} />
        <meshStandardMaterial color={WOOD_COLOR} roughness={0.7} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

function Stern({ assembled, opacity }: { assembled: boolean; progress?: number; opacity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const targetX = assembled ? 0 : 15;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.06);
    }
  });

  return (
    <group ref={groupRef} position={[15, 0, 3]}>
      {/* Stern castle */}
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 4, 5]} />
        <meshStandardMaterial color={WOOD_COLOR} roughness={0.8} transparent opacity={opacity} />
      </mesh>

      {/* Upper stern */}
      <mesh position={[0.5, 5, 0]} castShadow>
        <boxGeometry args={[2.5, 2, 4]} />
        <meshStandardMaterial color={DARK_WOOD} roughness={0.7} transparent opacity={opacity} />
      </mesh>

      {/* Decorative transom */}
      <mesh position={[1.5, 3, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.2, 3, 4.5]} />
        <meshStandardMaterial color={GOLD_COLOR} roughness={0.4} metalness={0.6} transparent opacity={opacity} />
      </mesh>

      {/* Stern lanterns */}
      {[-1.5, 1.5].map((z, i) => (
        <mesh key={`stern-lantern-${i}`} position={[1.8, 4.5, z]}>
          <cylinderGeometry args={[0.15, 0.2, 0.5, 6]} />
          <meshStandardMaterial color={GOLD_COLOR} emissive={LANTERN_COLOR} emissiveIntensity={assembled ? 0.8 : 0} roughness={0.3} metalness={0.7} transparent opacity={opacity} />
        </mesh>
      ))}
    </group>
  );
}

function Deck({ assembled, opacity }: { assembled: boolean; progress?: number; opacity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const targetY = assembled ? 0 : -5;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
    }
  });

  return (
    <group ref={groupRef} position={[0, 3, 3]}>
      {/* Main deck */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[18, 0.3, 5.5]} />
        <meshStandardMaterial color={WOOD_COLOR} roughness={0.85} transparent opacity={opacity} />
      </mesh>

      {/* Deck planks */}
      {Array.from({ length: 16 }).map((_, i) => (
        <mesh key={`deck-plank-${i}`} position={[-8 + i * 1.1, 0.16, 0]}>
          <boxGeometry args={[1, 0.05, 5.2]} />
          <meshStandardMaterial color={i % 2 === 0 ? WOOD_COLOR : DARK_WOOD} roughness={0.9} transparent opacity={opacity} />
        </mesh>
      ))}

      {/* Cap rail */}
      <mesh position={[0, 0.2, 2.8]}>
        <boxGeometry args={[18, 0.15, 0.15]} />
        <meshStandardMaterial color={DARK_WOOD} roughness={0.7} transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, 0.2, -2.8]}>
        <boxGeometry args={[18, 0.15, 0.15]} />
        <meshStandardMaterial color={DARK_WOOD} roughness={0.7} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

function Mast({ assembled, opacity }: { assembled: boolean; progress?: number; opacity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const targetScaleY = assembled ? 1 : 0.01;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, targetScaleY, 0.08);
    }
  });

  return (
    <group ref={groupRef} position={[-3, 3.2, 3]} scale={[1, 0.01, 1]}>
      {/* Main mast */}
      <mesh position={[0, 10, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.4, 20, 12]} />
        <meshStandardMaterial color={WOOD_COLOR} roughness={0.7} transparent opacity={opacity} />
      </mesh>

      {/* Crow's nest */}
      <mesh position={[0, 16, 0]} castShadow>
        <cylinderGeometry args={[1, 0.8, 1.5, 8]} />
        <meshStandardMaterial color={DARK_WOOD} roughness={0.8} transparent opacity={opacity} />
      </mesh>

      {/* Top */}
      <mesh position={[0, 18, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.15, 2, 6]} />
        <meshStandardMaterial color={GOLD_COLOR} roughness={0.4} metalness={0.6} transparent opacity={opacity} />
      </mesh>

      {/* Yards (horizontal beams) */}
      {[
        { y: 12, length: 14 },
        { y: 16, length: 10 },
        { y: 19, length: 6 },
      ].map((yard, i) => (
        <mesh key={`yard-${i}`} position={[0, yard.y, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.12, yard.length, 8]} />
          <meshStandardMaterial color={WOOD_COLOR} roughness={0.75} transparent opacity={opacity} />
        </mesh>
      ))}
    </group>
  );
}

function Sails({ assembled, opacity }: { assembled: boolean; progress?: number; opacity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const sailRefs = useRef<THREE.Mesh[]>([]);
  const targetScale = assembled ? 1 : 0.01;

  useFrame((state) => {
    sailRefs.current.forEach((sail, i) => {
      if (sail) {
        sail.scale.y = THREE.MathUtils.lerp(sail.scale.y, targetScale, 0.06);
        // Subtle sail billowing animation
        if (sail.material instanceof THREE.MeshStandardMaterial) {
          sail.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + i * 0.5) * 0.02;
        }
      }
    });
  });

  const sailPositions = [
    { x: -3, y: 12, z: 3, width: 12, height: 8 },
    { x: -3, y: 16, z: 3, width: 8, height: 5 },
    { x: -3, y: 19, z: 3, width: 5, height: 3 },
  ];

  return (
    <group ref={groupRef}>
      {sailPositions.map((sail, i) => (
        <mesh
          key={`sail-${i}`}
          ref={(el) => {
            if (el) sailRefs.current[i] = el;
          }}
          position={[sail.x, sail.y, sail.z]}
          scale={[1, 0.01, 1]}
          castShadow
        >
          <planeGeometry args={[sail.width, sail.height]} />
          <meshStandardMaterial
            color={SAIL_COLOR}
            roughness={0.95}
            side={THREE.DoubleSide}
            transparent
            opacity={opacity}
          />
        </mesh>
      ))}
    </group>
  );
}

function Wheel({ assembled, opacity }: { assembled: boolean; progress?: number; opacity: number }) {
  const wheelRef = useRef<THREE.Group>(null);
  const targetRotX = assembled ? 0 : Math.PI;

  useFrame((state) => {
    if (wheelRef.current) {
      wheelRef.current.rotation.x = THREE.MathUtils.lerp(wheelRef.current.rotation.x, targetRotX, 0.05);
      // Slow wheel rotation
      if (assembled) {
        wheelRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      }
    }
  });

  const spokes = 8;

  return (
    <group ref={wheelRef} position={[10, 3.8, 3]} rotation={[Math.PI / 2, 0, 0]}>
      {/* Wheel rim */}
      <mesh>
        <torusGeometry args={[0.6, 0.08, 8, 24]} />
        <meshStandardMaterial color={WOOD_COLOR} roughness={0.7} transparent opacity={opacity} />
      </mesh>

      {/* Hub */}
      <mesh>
        <cylinderGeometry args={[0.1, 0.1, 0.15, 8]} />
        <meshStandardMaterial color={GOLD_COLOR} roughness={0.4} metalness={0.6} transparent opacity={opacity} />
      </mesh>

      {/* Spokes */}
      {Array.from({ length: spokes }).map((_, i) => (
        <mesh key={`spoke-${i}`} position={[0, 0, 0]} rotation={[0, 0, (i * Math.PI * 2) / spokes]}>
          <boxGeometry args={[1.1, 0.06, 0.04]} />
          <meshStandardMaterial color={WOOD_COLOR} roughness={0.75} transparent opacity={opacity} />
        </mesh>
      ))}

      {/* Handles */}
      {Array.from({ length: spokes }).map((_, i) => (
        <mesh key={`handle-${i}`} position={[Math.cos((i * Math.PI * 2) / spokes) * 0.65, Math.sin((i * Math.PI * 2) / spokes) * 0.65, 0.1]}>
          <cylinderGeometry args={[0.03, 0.03, 0.12, 6]} />
          <meshStandardMaterial color={WOOD_COLOR} roughness={0.6} transparent opacity={opacity} />
        </mesh>
      ))}
    </group>
  );
}

function Anchor({ assembled, opacity }: { assembled: boolean; progress?: number; opacity: number }) {
  const anchorRef = useRef<THREE.Group>(null);
  const targetY = assembled ? 0 : 5;

  useFrame(() => {
    if (anchorRef.current) {
      anchorRef.current.position.y = THREE.MathUtils.lerp(anchorRef.current.position.y, targetY, 0.05);
      // Gentle swaying when assembled
      if (assembled) {
        anchorRef.current.rotation.z = Math.sin(Date.now() * 0.0005) * 0.05;
      }
    }
  });

  return (
    <group ref={anchorRef} position={[-12, 0, 5]}>
      {/* Shank */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.1, 2, 8]} />
        <meshStandardMaterial color={DARK_WOOD} roughness={0.5} metalness={0.3} transparent opacity={opacity} />
      </mesh>

      {/* Crown */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.3, 8]} />
        <meshStandardMaterial color={GOLD_COLOR} roughness={0.4} metalness={0.6} transparent opacity={opacity} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.4, -1.2, 0]} rotation={[0, 0, Math.PI / 3]}>
        <boxGeometry args={[0.8, 0.08, 0.1]} />
        <meshStandardMaterial color={DARK_WOOD} roughness={0.5} transparent opacity={opacity} />
      </mesh>
      <mesh position={[0.4, -1.2, 0]} rotation={[0, 0, -Math.PI / 3]}>
        <boxGeometry args={[0.8, 0.08, 0.1]} />
        <meshStandardMaterial color={DARK_WOOD} roughness={0.5} transparent opacity={opacity} />
      </mesh>

      {/* Stock */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.6, 0.1, 0.08]} />
        <meshStandardMaterial color={WOOD_COLOR} roughness={0.7} transparent opacity={opacity} />
      </mesh>

      {/* Ring */}
      <mesh position={[0, 1.3, 0]}>
        <torusGeometry args={[0.12, 0.03, 8, 16]} />
        <meshStandardMaterial color={GOLD_COLOR} roughness={0.35} metalness={0.7} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

function Lanterns({ assembled, opacity }: { assembled: boolean; progress?: number; opacity: number }) {
  const lanternRefs = useRef<THREE.Mesh[]>([]);

  useFrame(() => {
    lanternRefs.current.forEach((lantern) => {
      if (lantern && lantern.material instanceof THREE.MeshStandardMaterial) {
        // Flickering effect
        const flicker = 0.7 + Math.random() * 0.3;
        lantern.material.emissiveIntensity = assembled ? flicker : 0;
      }
    });
  });

  const lanternPositions: [number, number, number][] = [
    [-8, 4, 5.5], // Port bow
    [-8, 4, 0.5], // Starboard bow
    [8, 6, 5.5],  // Port stern
    [8, 6, 0.5],  // Starboard stern
    [-2, 3.5, 5.7], // Port midship
    [-2, 3.5, 0.3], // Starboard midship
  ];

  return (
    <group>
      {lanternPositions.map((pos, i) => (
        <mesh
          key={`lantern-${i}`}
          ref={(el) => {
            if (el) lanternRefs.current[i] = el;
          }}
          position={pos}
        >
          <cylinderGeometry args={[0.1, 0.15, 0.4, 6]} />
          <meshStandardMaterial
            color={GOLD_COLOR}
            emissive={LANTERN_COLOR}
            emissiveIntensity={assembled ? 0.8 : 0}
            roughness={0.3}
            metalness={0.6}
            transparent
            opacity={opacity}
          />
        </mesh>
      ))}

      {/* Point lights for glow effect */}
      {assembled && lanternPositions.slice(0, 4).map((pos, i) => (
        <pointLight
          key={`light-${i}`}
          position={pos}
          color={LANTERN_COLOR}
          intensity={0.5}
          distance={8}
          decay={2}
        />
      ))}
    </group>
  );
}

function Rigging({ assembled, opacity }: { assembled: boolean; opacity: number }) {
  const groupRef = useRef<THREE.Group>(null);

  // Create rope lines
  const ropes = useMemo(() => {
    const lines: [number, number, number][][] = [];

    // Shrouds (side ropes to mast)
    for (let i = 0; i < 4; i++) {
      const height = 6 + i * 3;
      lines.push([
        [-3, height + 3, 3],
        [-3 + (i + 1) * 0.5, 3.2, 5.5],
      ]);
      lines.push([
        [-3, height + 3, 3],
        [-3 + (i + 1) * 0.5, 3.2, 0.5],
      ]);
    }

    // Stays (fore and aft ropes)
    lines.push([[-3, 18, 3], [-15, 3, 3]]);
    lines.push([[-3, 15, 3], [10, 6, 3]]);

    // Halyards
    lines.push([[-3, 20, 3], [-2, 3.2, 3]]);

    return lines;
  }, []);

  return (
    <group ref={groupRef}>
      {ropes.map((rope, i) => (
        <Line
          key={`rope-${i}`}
          points={rope}
          color="#3a2518"
          lineWidth={1}
          transparent
          opacity={assembled ? opacity * 0.6 : 0}
        />
      ))}
    </group>
  );
}

function Figurehead({ assembled, opacity }: { assembled: boolean; progress?: number; opacity: number }) {
  const figureheadRef = useRef<THREE.Group>(null);
  const targetScale = assembled ? 1 : 0.01;

  useFrame(() => {
    if (figureheadRef.current) {
      figureheadRef.current.scale.setScalar(THREE.MathUtils.lerp(figureheadRef.current.scale.x, targetScale, 0.06));
    }
  });

  return (
    <group ref={figureheadRef} position={[-17, 1, 3]} scale={[1, 0.01, 1]}>
      {/* Stylized figurehead - abstract elegant form */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 3]}>
        <coneGeometry args={[0.5, 3, 6]} />
        <meshStandardMaterial color={GOLD_COLOR} roughness={0.3} metalness={0.7} transparent opacity={opacity} />
      </mesh>

      {/* Decorative wings/details */}
      <mesh position={[-0.3, -0.5, 0.5]} rotation={[0, 0.3, Math.PI / 2.5]}>
        <coneGeometry args={[0.3, 2, 4]} />
        <meshStandardMaterial color={GOLD_COLOR} roughness={0.35} metalness={0.6} transparent opacity={opacity} />
      </mesh>
      <mesh position={[-0.3, -0.5, -0.5]} rotation={[0, -0.3, Math.PI / 2.5]}>
        <coneGeometry args={[0.3, 2, 4]} />
        <meshStandardMaterial color={GOLD_COLOR} roughness={0.35} metalness={0.6} transparent opacity={opacity} />
      </mesh>

      {/* Glowing effect when assembled */}
      {assembled && (
        <pointLight position={[0, 0, 0]} color={GOLD_COLOR} intensity={0.5} distance={5} decay={2} />
      )}
    </group>
  );
}

function Windows({ assembled, opacity }: { assembled: boolean; progress?: number; opacity: number }) {
  const windowRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    windowRefs.current.forEach((win) => {
      if (win.material instanceof THREE.MeshStandardMaterial) {
        // Subtle warm glow pulsing
        const pulse = 0.3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        win.material.emissiveIntensity = assembled ? pulse : 0;
      }
    });
  });

  return (
    <group>
      {/* Stern gallery windows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh
          key={`stern-window-${i}`}
          ref={(el) => { if (el) windowRefs.current[i] = el; }}
          position={[11, 4 + Math.floor(i / 3) * 1.5, 3 + (i % 3 - 1) * 1.5]}
        >
          <planeGeometry args={[0.4, 0.6]} />
          <meshStandardMaterial
            color="#ffcc88"
            emissive="#ffaa44"
            emissiveIntensity={assembled ? 0.5 : 0}
            transparent
            opacity={opacity}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Cabin side windows */}
      {[-5.5, 5.5].map((z) => (
        <mesh
          key={`cabin-window-${z}`}
          ref={(el) => { if (el) windowRefs.current.push(el); }}
          position={[9, 5.5, z]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <planeGeometry args={[0.5, 0.8]} />
          <meshStandardMaterial
            color="#ffcc88"
            emissive="#ffaa44"
            emissiveIntensity={assembled ? 0.5 : 0}
            transparent
            opacity={opacity}
          />
        </mesh>
      ))}
    </group>
  );
}

function Ornaments({ opacity }: { assembled?: boolean; progress?: number; opacity: number }) {
  return (
    <group>
      {/* Stern decorations */}
      <mesh position={[10, 2.5, 3]}>
        <torusGeometry args={[0.3, 0.05, 8, 16]} />
        <meshStandardMaterial color={GOLD_COLOR} roughness={0.35} metalness={0.7} transparent opacity={opacity} />
      </mesh>

      {/* Hull trim */}
      <mesh position={[0, 1.5, 5.7]}>
        <boxGeometry args={[16, 0.1, 0.1]} />
        <meshStandardMaterial color={GOLD_COLOR} roughness={0.4} metalness={0.6} transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, 1.5, 0.3]}>
        <boxGeometry args={[16, 0.1, 0.1]} />
        <meshStandardMaterial color={GOLD_COLOR} roughness={0.4} metalness={0.6} transparent opacity={opacity} />
      </mesh>

      {/* Bow decoration */}
      <mesh position={[-14, 2.5, 3]} rotation={[0, 0, Math.PI / 3]}>
        <octahedronGeometry args={[0.25]} />
        <meshStandardMaterial color={GOLD_COLOR} roughness={0.3} metalness={0.8} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

function ShipName({ name, assembled, opacity }: { name: string; assembled: boolean; opacity: number }) {
  const canvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.font = 'bold 48px serif';
    ctx.fillStyle = '#c9a962';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, c.width / 2, c.height / 2);
    return c;
  }, [name]);

  const texture = useMemo(() => new THREE.CanvasTexture(canvas), [canvas]);

  return (
    <mesh position={[1, 1.8, 5.8]} rotation={[Math.PI, 0, 0]}>
      <planeGeometry args={[4, 1]} />
      <meshBasicMaterial map={texture} transparent opacity={assembled ? opacity : 0} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function Flagship({
  assembledParts,
  opacity,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: FlagshipProps) {
  const groupRef = useRef<THREE.Group>(null);
  const isPartAssembled = (part: ShipPart) => assembledParts.includes(part);

  // Subtle floating animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.02;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.01;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <Hull assembled={isPartAssembled('hull')} opacity={opacity} />
      <Bow assembled={isPartAssembled('bow')} opacity={opacity} />
      <Stern assembled={isPartAssembled('stern')} opacity={opacity} />
      <Deck assembled={isPartAssembled('deck')} opacity={opacity} />
      <Mast assembled={isPartAssembled('mast')} opacity={opacity} />
      <Sails assembled={isPartAssembled('sails')} opacity={opacity} />
      <Rigging assembled={isPartAssembled('rigging')} opacity={opacity} />
      <Wheel assembled={isPartAssembled('wheel')} opacity={opacity} />
      <Anchor assembled={isPartAssembled('anchor')} opacity={opacity} />
      <Lanterns assembled={isPartAssembled('lanterns')} opacity={opacity} />
      <Figurehead assembled={isPartAssembled('figurehead')} opacity={opacity} />
      <Windows assembled={isPartAssembled('windows')} opacity={opacity} />
      <Ornaments opacity={opacity} />
      <ShipName name="Flagship" assembled={isPartAssembled('name')} opacity={opacity} />
    </group>
  );
}
