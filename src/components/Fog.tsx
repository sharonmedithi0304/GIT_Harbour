import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FogProps {
  density?: number;
  opacity?: number;
}

const FogShader = {
  uniforms: {
    uTime: { value: 0 },
    uOpacity: { value: 1.0 },
    uFogColor1: { value: new THREE.Color('#1a2a3a') },
    uFogColor2: { value: new THREE.Color('#2d3a4f') },
    uNoiseScale: { value: 3.0 },
    uSpeed: { value: 0.1 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uOpacity;
    uniform vec3 uFogColor1;
    uniform vec3 uFogColor2;
    uniform float uNoiseScale;
    uniform float uSpeed;

    varying vec2 vUv;
    varying vec3 vWorldPosition;

    // Simplex noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);

      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);

      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;

      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));

      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;

      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);

      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);

      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);

      vec4 s0 = floor(b0) * 2.0 + 1.0;
      vec4 s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);

      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      // Multi-layered fog effect
      float noise1 = snoise(vec3(vUv * uNoiseScale, uTime * uSpeed));
      float noise2 = snoise(vec3(vUv * uNoiseScale * 2.0, uTime * uSpeed * 1.5)) * 0.5;
      float noise3 = snoise(vec3(vUv * uNoiseScale * 4.0, uTime * uSpeed * 2.0)) * 0.25;

      float combinedNoise = (noise1 + noise2 + noise3) * 0.5 + 0.5;

      // Color mixing
      vec3 color = mix(uFogColor1, uFogColor2, combinedNoise);

      // Edge fade for volumetric feel
      float edgeFade = smoothstep(0.0, 0.3, vUv.x) * smoothstep(0.0, 0.3, vUv.y);
      edgeFade *= smoothstep(1.0, 0.7, vUv.x) * smoothstep(1.0, 0.7, vUv.y);

      // Height-based fade (bottom fog)
      float heightFade = smoothstep(-0.5, 2.0, vWorldPosition.y);

      float alpha = uOpacity * edgeFade * heightFade * (0.3 + combinedNoise * 0.4);

      gl_FragColor = vec4(color, alpha);
    }
  `,
};

export function Fog({ density: _density = 1.0 }: FogProps) {
  const groupRef = useRef<THREE.Group>(null);
  const layers = useRef<THREE.Mesh[]>([]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      ...FogShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }, []);

  useFrame((state) => {
    layers.current.forEach((mesh, index) => {
      if (mesh.material instanceof THREE.ShaderMaterial) {
        mesh.material.uniforms.uTime.value = state.clock.elapsedTime + index * 10;
      }
    });
  });

  // Create multiple fog layers at different heights and positions
  const fogLayers = useMemo(() => {
    const layers = [];
    for (let i = 0; i < 8; i++) {
      layers.push({
        position: [
          Math.cos(i * Math.PI * 0.25) * 15,
          1 + i * 2,
          Math.sin(i * Math.PI * 0.25) * 15,
        ] as [number, number, number],
        scale: [40 + i * 10, 20 + i * 5, 40 + i * 10] as [number, number, number],
        rotation: [0, i * Math.PI * 0.125, 0] as [number, number, number],
      });
    }
    return layers;
  }, []);

  return (
    <group ref={groupRef}>
      {fogLayers.map((layer, index) => (
        <mesh
          key={index}
          ref={(el) => {
            if (el) layers.current[index] = el;
          }}
          position={layer.position}
          scale={layer.scale}
          rotation={layer.rotation}
        >
          <planeGeometry />
          <primitive object={material.clone()} attach="material" />
        </mesh>
      ))}
    </group>
  );
}
