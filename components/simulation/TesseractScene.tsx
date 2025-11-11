'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import { OrbitControls, shaderMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';


const BookshelfMaterial = shaderMaterial(
  {
    uTime: 0,
    uOpacity: 0.6,
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
    uniform float uOpacity;
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      // Create grid pattern (bookshelf effect)
      float gridX = step(0.95, fract(vUv.x * 10.0));
      float gridY = step(0.95, fract(vUv.y * 10.0));
      float grid = max(gridX, gridY);
      
      // Subtle glow
      vec3 color = vec3(0.4, 0.5, 0.6) * 0.3;
      color += grid * vec3(0.5, 0.6, 0.8) * 0.4;
      
      // Depth fade
      float fade = 1.0 - smoothstep(0.0, 1.0, length(vUv - 0.5) * 1.5);
      
      gl_FragColor = vec4(color, fade * uOpacity);
    }
  `
);
extend({ BookshelfMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    bookshelfMaterial: any;
  }
}

const TimeStrandMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color(0.8, 0.85, 0.9),
  },
  `
    varying vec3 vPosition;
    
    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec3 vPosition;
    
    void main() {
      float glow = sin(vPosition.y * 2.0 + uTime * 2.0) * 0.3 + 0.7;
      vec3 finalColor = uColor * glow;
      gl_FragColor = vec4(finalColor, 0.8);
    }
  `
);
extend({ TimeStrandMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    timeStrandMaterial: any;
  }
}

const DustParticleMaterial = shaderMaterial(
  {
    uTime: 0,
  },
  `
    uniform float uTime;
    
    attribute float aSpeed;
    attribute float aOffset;
    attribute float aSize;
    
    varying float vAlpha;
    
    void main() {
      vec3 pos = position;
      
      // Slow floating motion
      pos.y += sin(uTime * aSpeed + aOffset) * 2.0;
      pos.x += cos(uTime * aSpeed * 0.5 + aOffset) * 1.0;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Size attenuation
      float dist = length(mvPosition.xyz);
      gl_PointSize = aSize * (300.0 / dist);
      
      vAlpha = 1.0 - smoothstep(5.0, 20.0, dist);
    }
  `,
  `
    varying float vAlpha;
    
    void main() {
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      
      if (dist > 0.5) discard;
      
      float alpha = (1.0 - dist * 2.0) * vAlpha * 0.4;
      
      gl_FragColor = vec4(vec3(0.9, 0.92, 0.95), alpha);
    }
  `
);
extend({ DustParticleMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    dustParticleMaterial: any;
  }
}


function generateTesseract() {
  const vertices: number[][] = [];
  for (let i = 0; i < 16; i++) {
    vertices.push([
      (i & 1) ? 1 : -1,
      (i & 2) ? 1 : -1,
      (i & 4) ? 1 : -1,
      (i & 8) ? 1 : -1,
    ]);
  }
  
  const edges: [number, number][] = [];
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      let diff = 0;
      for (let k = 0; k < 4; k++) {
        if (vertices[i][k] !== vertices[j][k]) diff++;
      }
      if (diff === 1) edges.push([i, j]);
    }
  }
  
  return { vertices, edges };
}

function project4D(vertex: number[], time: number) {
  let [x, y, z, w] = vertex;
  
  const angle = time * 0.2;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  
  // Simple 4D rotation
  const x1 = x * cosA - w * sinA;
  const w1 = x * sinA + w * cosA;
  
  // Perspective
  const distance = 4.0;
  const scale = distance / (distance + w1);
  
  return new THREE.Vector3(x1 * scale * 1.8, y * scale * 1.8, z * scale * 1.8);
}


function BookshelfPlanes() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });
  
  const planes = useMemo(() => {
    const count = 24;
    const radius = 8;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return {
        position: [
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 4,
          Math.sin(angle) * radius,
        ] as [number, number, number],
        rotation: [0, -angle + Math.PI / 2, 0] as [number, number, number],
      };
    });
  }, []);
  
  return (
    <group ref={groupRef}>
      {planes.map((plane, i) => (
        <mesh key={i} position={plane.position} rotation={plane.rotation}>
          <planeGeometry args={[4, 8, 1, 1]} />
          <bookshelfMaterial transparent side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}


function TesseractWireframe() {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments[]>([]);
  const { vertices, edges } = useMemo(() => generateTesseract(), []);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    linesRef.current.forEach((line, i) => {
      const edge = edges[i];
      const p1 = project4D(vertices[edge[0]], time);
      const p2 = project4D(vertices[edge[1]], time);
      
      const positions = line.geometry.attributes.position.array as Float32Array;
      positions[0] = p1.x;
      positions[1] = p1.y;
      positions[2] = p1.z;
      positions[3] = p2.x;
      positions[4] = p2.y;
      positions[5] = p2.z;
      
      line.geometry.attributes.position.needsUpdate = true;
    });
  });
  
  return (
    <group ref={groupRef}>
      {edges.map((edge, i) => {
        const p1 = project4D(vertices[edge[0]], 0);
        const p2 = project4D(vertices[edge[1]], 0);
        const geometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        
        return (
          <lineSegments
            key={i}
            ref={(el) => {
              if (el) linesRef.current[i] = el;
            }}
            geometry={geometry}
          >
            <timeStrandMaterial
              transparent
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </lineSegments>
        );
      })}
      
      {/* Vertices */}
      {vertices.map((vertex, i) => {
        const pos = project4D(vertex, 0);
        return (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color="#a0b0c0" />
          </mesh>
        );
      })}
    </group>
  );
}


function DustParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const geometry = useMemo(() => {
    const count = 3000;
    const geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const offsets = new Float32Array(count);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      const radius = 2 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = (Math.random() - 0.5) * 15;
      positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      
      speeds[i] = 0.1 + Math.random() * 0.2;
      offsets[i] = Math.random() * Math.PI * 2;
      sizes[i] = 2 + Math.random() * 4;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    geometry.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    
    return geometry;
  }, []);
  
  useFrame((state) => {
    if (pointsRef.current && pointsRef.current.material) {
      (pointsRef.current.material as any).uniforms.uTime.value = state.clock.elapsedTime;
    }
  });
  
  return (
    <points ref={pointsRef} geometry={geometry}>
      <dustParticleMaterial transparent blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}


export default function TesseractScene() {
  return (
    <>
      {/* Dark background like Interstellar */}
      <color attach="background" args={['#0a0a0f']} />
      
      {/* Subtle, soft lighting */}
      <ambientLight intensity={0.3} color="#b0b8c0" />
      <directionalLight position={[5, 5, 5]} intensity={0.4} color="#d0d8e0" />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} color="#a0b0c0" />
      <pointLight position={[0, 0, 0]} intensity={0.8} color="#c0d0e0" distance={15} decay={2} />
      
      {/* Main Elements */}
      {/* <BookshelfPlanes /> */}
      <TesseractWireframe />
      {/* <DustParticles /> */}
      
      {/* Subtle Post Processing */}
      <EffectComposer>
        <Bloom
          intensity={0.3}
          luminanceThreshold={0.7}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
      
      {/* Camera Controls */}
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.3}
        enableZoom
        enablePan={false}
        minDistance={3}
        maxDistance={30}
        maxPolarAngle={Math.PI * 0.9}
        minPolarAngle={Math.PI * 0.1}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}