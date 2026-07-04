import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SkyShader = {
  uniforms: {
    uTime: { value: 0 },
    uTopColor: { value: new THREE.Color('#0a1020') },
    uMiddleColor: { value: new THREE.Color('#1a3050') },
    uBottomColor: { value: new THREE.Color('#2a4060') },
    uSunColor: { value: new THREE.Color('#ff8844') },
    uSunPosition: { value: new THREE.Vector3(100, 20, -200) },
  },
  vertexShader: `
    varying vec3 vWorldPosition;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uTopColor;
    uniform vec3 uMiddleColor;
    uniform vec3 uBottomColor;
    uniform vec3 uSunColor;
    uniform vec3 uSunPosition;

    varying vec3 vWorldPosition;
    varying vec2 vUv;

    void main() {
      // Height-based color gradient
      vec3 color = mix(uBottomColor, uMiddleColor, smoothstep(0.0, 0.5, vUv.y));
      color = mix(color, uTopColor, smoothstep(0.5, 1.0, vUv.y));

      // Sun glow
      vec3 sunDir = normalize(uSunPosition);
      vec3 viewDir = normalize(vWorldPosition - cameraPosition);
      float sunAngle = dot(viewDir, sunDir);
      float sunGlow = pow(max(0.0, sunAngle), 64.0) * 0.5;
      float sunHalo = pow(max(0.0, sunAngle), 8.0) * 0.3;
      color = mix(color, uSunColor, sunGlow + sunHalo);

      // Subtle stars
      float starNoise = fract(sin(dot(vUv * 500.0, vec2(12.9898, 78.233))) * 43758.5453);
      float star = step(0.998, starNoise);
      float starBrightness = star * smoothstep(0.7, 1.0, vUv.y) * 0.8;
      color += vec3(starBrightness);

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

export function Sky() {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    return new THREE.SphereGeometry(400, 32, 32);
  }, []);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      ...SkyShader,
      side: THREE.BackSide,
    });
  }, []);

  useFrame((state) => {
    if (meshRef.current && meshRef.current.material instanceof THREE.ShaderMaterial) {
      meshRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
}
