import { useRef, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { OrbitControls, shaderMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';


const AccretionDiskMaterial = shaderMaterial(
  {
    uTime: 0,
    uIntensity: 1.0,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying float vDistanceToCenter;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      vDistanceToCenter = length(position.xy);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform float uIntensity;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying float vDistanceToCenter;

    // Simplex noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m;
      m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      float radialDist = vDistanceToCenter;
      float normalizedDist = (radialDist - 6.0) / 20.0;
      
      float orbitalSpeed = 2.8 / sqrt(max(normalizedDist, 0.01) + 0.05);
      float angle = atan(vPosition.y, vPosition.x);
      
      float turb1 = snoise(vec2(angle * 12.0 + uTime * orbitalSpeed, normalizedDist * 25.0));
      float turb2 = snoise(vec2(angle * 6.0 - uTime * orbitalSpeed * 0.7, normalizedDist * 15.0));
      float turb3 = snoise(vec2(angle * 24.0 + uTime * orbitalSpeed * 1.9, normalizedDist * 35.0));
      
      float turbulence = (turb1 * 0.4 + turb2 * 0.35 + turb3 * 0.25);
      turbulence = smoothstep(0.15, 0.85, turbulence);
      
      vec2 diskNormal = normalize(vPosition.xy);
      float velocityComponent = dot(diskNormal, vec2(cos(uTime * 0.5), sin(uTime * 0.5)));
      
      float dopplerFactor = 1.0;
      vec3 dopplerTint = vec3(1.0);
      
      if (velocityComponent > 0.0) {
        dopplerFactor = 2.5 + velocityComponent * 2.0;
        dopplerTint = vec3(0.75, 0.85, 1.3);
      } else {
        dopplerFactor = 0.35 + abs(velocityComponent) * 0.4;
        dopplerTint = vec3(1.3, 0.65, 0.4);
      }
      
      float temp = 1.0 - smoothstep(0.0, 0.85, normalizedDist);
      temp = pow(temp, 2.0);
      
      vec3 color;
      if (temp > 0.85) {
        color = mix(vec3(0.7, 0.8, 1.4), vec3(1.2, 1.2, 1.3), (temp - 0.85) * 6.67);
      } else if (temp > 0.65) {
        color = mix(vec3(1.3, 1.1, 0.7), vec3(0.7, 0.8, 1.4), (temp - 0.65) * 5.0);
      } else if (temp > 0.45) {
        color = mix(vec3(1.4, 0.9, 0.4), vec3(1.3, 1.1, 0.7), (temp - 0.45) * 5.0);
      } else if (temp > 0.25) {
        color = mix(vec3(1.5, 0.6, 0.25), vec3(1.4, 0.9, 0.4), (temp - 0.25) * 5.0);
      } else {
        color = mix(vec3(0.8, 0.2, 0.1), vec3(1.5, 0.6, 0.25), temp * 4.0);
      }
      
      vec3 turbColor = vec3(
        1.0 + turbulence * 0.6,
        1.0 + turbulence * 0.4 * sin(uTime * 0.35 + angle * 4.5),
        1.0 + turbulence * 0.35 * cos(uTime * 0.28 + angle * 3.5)
      );
      color *= turbColor;
      
      float synchrotron = sin(uTime * 3.0 + angle * 15.0 + normalizedDist * 25.0) * 0.15 + 0.85;
      color *= synchrotron;
      
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.5);
      vec3 glowColor = mix(
        vec3(1.0, 0.5, 0.2),
        vec3(0.5, 0.7, 1.2),
        temp
      ) * (1.0 + sin(uTime * 2.0 + angle * 6.0) * 0.3);
      color += glowColor * fresnel * temp * 1.8;
      
      color *= dopplerTint;
      
      float alpha = (turbulence * 0.7 + 0.3) * (0.3 + temp * 0.7);
      alpha *= smoothstep(0.0, 0.3, normalizedDist) * smoothstep(1.0, 0.7, normalizedDist);
      
      if (normalizedDist < 0.22) {
        color *= 3.5;
        alpha = max(alpha, 0.9);
      }
      
      gl_FragColor = vec4(color * dopplerFactor * uIntensity, alpha);
    }
  `
);

// Gravitational Lensing Material
const LensingMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color('#ff8844'),
    uIntensity: 1.0,
  },
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uIntensity;
    varying vec2 vUv;
    varying vec3 vPosition;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m;
      m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      float angle = atan(vPosition.y, vPosition.x);
      float radius = length(vPosition.xy);
      
      float noise1 = snoise(vec2(angle * 14.0 + uTime * 1.2, radius * 0.5));
      float noise2 = snoise(vec2(angle * 8.0 - uTime * 0.8, radius * 1.2));
      
      float noise = smoothstep(0.2, 0.8, (noise1 * 0.6 + noise2 * 0.4));
      
      vec3 colorShift = vec3(
        sin(uTime * 2.5 + angle * 4.0 + radius * 0.5) * 0.25,
        sin(uTime * 2.0 + angle * 3.0 + radius * 0.4) * 0.2,
        cos(uTime * 2.2 + angle * 3.5 + radius * 0.45) * 0.2
      );
      
      vec3 color = (uColor + colorShift) * (1.2 + noise * 0.6);
      
      float pulse = sin(uTime * 1.5 + angle * 2.0) * 0.2 + 0.8;
      float alpha = noise * 0.6 * uIntensity * pulse;
      
      alpha *= smoothstep(0.0, 0.4, vUv.x) * smoothstep(1.0, 0.6, vUv.x);
      alpha *= smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.65, vUv.y);
      
      gl_FragColor = vec4(color, alpha);
    }
  `
);

extend({ AccretionDiskMaterial, LensingMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    accretionDiskMaterial: any;
    lensingMaterial: any;
  }
}

// Enhanced realistic stars
function Stars({ visible = true }: { visible?: boolean }) {
  const starsData = useMemo(() => {
    const count = 80000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    const starTypes = [
      { color: [0.8, 1.0, 2.5], size: 1.8, prob: 0.08 },     // Blue giants
      { color: [0.85, 1.1, 2.2], size: 1.5, prob: 0.12 },    // Blue-white
      { color: [1.8, 1.8, 1.9], size: 1.3, prob: 0.15 },     // White
      { color: [2.0, 1.6, 0.9], size: 1.2, prob: 0.18 },     // Yellow-white
      { color: [2.2, 1.4, 0.6], size: 1.1, prob: 0.20 },     // Yellow (Sun-like)
      { color: [2.4, 1.2, 0.5], size: 1.0, prob: 0.15 },     // Orange
      { color: [2.5, 0.9, 0.4], size: 0.9, prob: 0.12 },     // Red dwarfs
    ];
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      const layer = Math.random();
      let radius;
      if (layer < 0.3) {
        radius = 400 + Math.random() * 600;
      } else if (layer < 0.6) {
        radius = 1000 + Math.random() * 1500;
      } else if (layer < 0.85) {
        radius = 2500 + Math.random() * 2500;
      } else {
        radius = 5000 + Math.random() * 5000;
      }
      
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      const rand = Math.random();
      let cumProb = 0;
      let selectedType = starTypes[starTypes.length - 1];
      
      for (const type of starTypes) {
        cumProb += type.prob;
        if (rand <= cumProb) {
          selectedType = type;
          break;
        }
      }
      
      const colorVar = 0.85 + Math.random() * 0.3;
      colors[i3] = selectedType.color[0] * colorVar;
      colors[i3 + 1] = selectedType.color[1] * colorVar;
      colors[i3 + 2] = selectedType.color[2] * colorVar;
      
      const distanceFactor = 1.0 - Math.min((radius - 400) / 9600, 1.0);
      const sizeMultiplier = 0.7 + Math.random() * 0.8;
      sizes[i] = selectedType.size * sizeMultiplier * (0.4 + distanceFactor * 2.5);
    }
    
    return { positions, colors, sizes };
  }, []);

  if (!visible) return null;

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[starsData.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[starsData.colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[starsData.sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial 
        size={1.5}
        vertexColors={true}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.95}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Nebula clouds
function NebulaClouds({ visible = true }: { visible?: boolean }) {
  const cloudRef = useRef<any>(null);
  
  const cloudGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const count = 8000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    const nebulaColors = [
      [1.2, 0.3, 0.6],
      [0.6, 0.3, 1.2],
      [0.3, 0.8, 1.3],
      [1.3, 0.7, 0.3],
      [0.4, 1.0, 0.7],
    ];
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 800 + Math.random() * 3000;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      const colorChoice = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
      const brightness = 0.3 + Math.random() * 0.5;
      colors[i3] = colorChoice[0] * brightness;
      colors[i3 + 1] = colorChoice[1] * brightness;
      colors[i3 + 2] = colorChoice[2] * brightness;
      
      sizes[i] = 12 + Math.random() * 40;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    return geometry;
  }, []);
  
  useFrame(() => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y += 0.00005;
      cloudRef.current.rotation.x += 0.00003;
    }
  });

  if (!visible) return null;
  
  return (
    <points ref={cloudRef} geometry={cloudGeometry}>
      <pointsMaterial
        size={20}
        vertexColors={true}
        transparent={true}
        opacity={0.18}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={true}
      />
    </points>
  );
}

export interface BlackHoleSceneProps {
  showPhotonSphere?: boolean;
  showAccretionDisk?: boolean;
  showStars?: boolean;
  showNebula?: boolean;
  diskIntensity?: number;
  bloomIntensity?: number;
  lightingPreset?: 'realistic' | 'cinematic' | 'ethereal';
  autoRotate?: boolean;
}

export default function BlackHoleScene({ 
  showPhotonSphere = true,
  showAccretionDisk = true,
  showStars = true,
  showNebula = true,
  diskIntensity = 1.8,
  bloomIntensity = 5.0,
  lightingPreset = 'cinematic',
  autoRotate = true,
}: BlackHoleSceneProps) {
  const diskRef = useRef<any>(null);
  const lensingRefs = useRef<any[]>([]);

  useFrame((state, delta) => {
    if (diskRef.current) {
      diskRef.current.uniforms.uTime.value += delta;
      diskRef.current.uniforms.uIntensity.value = diskIntensity;
    }
    lensingRefs.current.forEach((ref) => {
      if (ref) {
        ref.uniforms.uTime.value += delta * 0.95;
      }
    });
  });

  const lightingConfig = {
    realistic: {
      ambient: 0.1,
      point1: { intensity: 8.0, color: '#ffffff' },
      point2: { intensity: 4.0, color: '#ffaa55' },
      point3: { intensity: 3.5, color: '#ff5533' },
    },
    cinematic: {
      ambient: 0.15,
      point1: { intensity: 10.0, color: '#ffffff' },
      point2: { intensity: 6.0, color: '#ff9944' },
      point3: { intensity: 5.0, color: '#ff6633' },
    },
    ethereal: {
      ambient: 0.2,
      point1: { intensity: 12.0, color: '#e8f4ff' },
      point2: { intensity: 7.0, color: '#ffccaa' },
      point3: { intensity: 6.0, color: '#ff88cc' },
    },
  };

  const lighting = lightingConfig[lightingPreset];

  return (
    <>
      <color attach="background" args={['#000000']} />
      
      {/* <NebulaClouds visible={showNebula} /> */}
      <Stars visible={showStars} />

      <ambientLight intensity={lighting.ambient} />
      <pointLight 
        position={[0, 0, 0]} 
        intensity={lighting.point1.intensity} 
        color={lighting.point1.color} 
        distance={100} 
        decay={2} 
      />
      <pointLight 
        position={[40, 20, 40]} 
        intensity={lighting.point2.intensity} 
        color={lighting.point2.color} 
        distance={150} 
        decay={2} 
      />
      <pointLight 
        position={[-35, -18, 35]} 
        intensity={lighting.point3.intensity} 
        color={lighting.point3.color} 
        distance={130} 
        decay={2} 
      />

      {/* Event Horizon */}
      <mesh>
        <sphereGeometry args={[6, 256, 256]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Shadow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.0, 6.7, 256]} />
        <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={0.92} 
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Photon Sphere */}
      {showPhotonSphere && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[6.85, 0.12, 112, 512]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>

          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[7.05, 0.16, 96, 448]} />
            <meshBasicMaterial color="#ffeecc" transparent opacity={0.9} toneMapped={false} />
          </mesh>
          
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[7.3, 0.20, 80, 384]} />
            <meshBasicMaterial color="#ffddaa" transparent opacity={0.75} toneMapped={false} />
          </mesh>
        </>
      )}

      {/* Accretion disk */}
      {showAccretionDisk && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[7.5, 29, 896]} />
            <accretionDiskMaterial 
              ref={diskRef}
              transparent
              toneMapped={false}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>

          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.4, 0]}>
            <ringGeometry args={[9.2, 27, 768]} />
            <accretionDiskMaterial 
              transparent
              toneMapped={false}
              side={THREE.DoubleSide}
              uIntensity={diskIntensity * 0.75}
              depthWrite={false}
            />
          </mesh>

          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
            <ringGeometry args={[10.2, 26, 768]} />
            <accretionDiskMaterial 
              transparent
              toneMapped={false}
              side={THREE.DoubleSide}
              uIntensity={diskIntensity * 0.6}
              depthWrite={false}
            />
          </mesh>
        </>
      )}

      {/* Gravitational lensing */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[15.5, 7.0, 144, 896]} />
        <lensingMaterial 
          ref={(el: any) => (lensingRefs.current[0] = el)}
          transparent
          side={THREE.DoubleSide}
          toneMapped={false}
          uIntensity={1.2}
          uColor={new THREE.Color('#ff7733')}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[23.5, 4.0, 112, 896]} />
        <lensingMaterial 
          ref={(el: any) => (lensingRefs.current[1] = el)}
          transparent
          side={THREE.DoubleSide}
          toneMapped={false}
          uIntensity={0.8}
          uColor={new THREE.Color('#ff9944')}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation={[Math.PI * 0.43, 0, 0]} position={[0, 5.5, 0]}>
        <torusGeometry args={[17.0, 6.5, 128, 896]} />
        <lensingMaterial 
          ref={(el: any) => (lensingRefs.current[2] = el)}
          transparent
          side={THREE.DoubleSide}
          toneMapped={false}
          uIntensity={1.0}
          uColor={new THREE.Color('#ff6633')}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation={[Math.PI * 0.57, 0, 0]} position={[0, -5.5, 0]}>
        <torusGeometry args={[17.0, 6.5, 128, 896]} />
        <lensingMaterial 
          ref={(el: any) => (lensingRefs.current[3] = el)}
          transparent
          side={THREE.DoubleSide}
          toneMapped={false}
          uIntensity={1.0}
          uColor={new THREE.Color('#ff6633')}
          depthWrite={false}
        />
      </mesh>

      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={0.35}
        enableZoom
        enablePan
        minDistance={20}
        maxDistance={5000}
        zoomSpeed={1.2}
        rotateSpeed={0.75}
        panSpeed={0.75}
      />
      
      <EffectComposer>
        <Bloom 
          intensity={bloomIntensity}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.6}
          mipmapBlur
        />
        <ChromaticAberration
          offset={new THREE.Vector2(0.002, 0.002)}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette
          offset={0.2}
          darkness={0.7}
        />
      </EffectComposer>
    </>
  );
}
