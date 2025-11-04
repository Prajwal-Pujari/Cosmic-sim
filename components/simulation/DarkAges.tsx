import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';

interface DarkAgesProps {
  isVisible: boolean;
  onComplete?: () => void;
  fadeIn?: number; // 0-1 for gradual reveal
}

const DarkAges = ({ isVisible, onComplete, fadeIn = 1 }: DarkAgesProps) => {
  const darknessRef = useRef<THREE.Points>(null!);
  const brightStarsRef = useRef<THREE.Points>(null!);
  const dustCloudsRef = useRef<THREE.Points>(null!);
  const nebulaCloudsRef = useRef<THREE.Points>(null!);
  const distantStarsRef = useRef<THREE.Points>(null!);
  const protoGalaxiesRef = useRef<THREE.Points>(null!);
  const timeRef = useRef(0);
  const revealRef = useRef(0);
  const { camera } = useThree();

  // Optimized circle texture with soft glow
  const circleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64; // Reduced from 128
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.15, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.4)');
    gradient.addColorStop(0.7, 'rgba(255,255,255,0.1)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  // OPTIMIZED: Reduced darkness particles from 25000 to 8000
  const darknessParticles = useMemo(() => {
    const count = 8000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 8 + Math.random() * 92;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const depth = radius / 92;
      const darkness = Math.random();
      
      // Richer cosmic colors - deep blues and purples
      colors[i3] = 0.03 + darkness * 0.06 + depth * 0.04;
      colors[i3 + 1] = 0.02 + darkness * 0.04 + depth * 0.03;
      colors[i3 + 2] = 0.08 + darkness * 0.15 + depth * 0.06;

      sizes[i] = 0.8 + Math.random() * 3.0 + depth * 1.5;
    }
    return { positions, colors, sizes };
  }, []);

  // OPTIMIZED: Reduced from 3000 to 1200 with better variety
  const brightStars = useMemo(() => {
    const count = 1200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const twinkleSpeed = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 20 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const depth = radius / 80;
      const starType = Math.random();
      
      if (starType > 0.95) {
        // Rare bright red giants
        colors[i3] = 0.95;
        colors[i3 + 1] = 0.25;
        colors[i3 + 2] = 0.1;
        sizes[i] = 1.8 + Math.random() * 2.2;
        twinkleSpeed[i] = 0.3 + Math.random() * 0.4;
      } else if (starType > 0.85) {
        // Orange-yellow stars
        colors[i3] = 0.9;
        colors[i3 + 1] = 0.6;
        colors[i3 + 2] = 0.2;
        sizes[i] = 1.2 + Math.random() * 1.5;
        twinkleSpeed[i] = 0.4 + Math.random() * 0.5;
      } else if (starType > 0.6) {
        // Blue-white stars
        colors[i3] = 0.6 + Math.random() * 0.3;
        colors[i3 + 1] = 0.7 + Math.random() * 0.2;
        colors[i3 + 2] = 0.9 + Math.random() * 0.1;
        sizes[i] = 0.8 + Math.random() * 1.2;
        twinkleSpeed[i] = 0.5 + Math.random() * 0.8;
      } else {
        // Dim distant stars
        colors[i3] = 0.2 + Math.random() * 0.2 + depth * 0.1;
        colors[i3 + 1] = 0.15 + Math.random() * 0.15 + depth * 0.08;
        colors[i3 + 2] = 0.25 + Math.random() * 0.25 + depth * 0.12;
        sizes[i] = 0.4 + Math.random() * 0.8;
        twinkleSpeed[i] = 0.6 + Math.random() * 1.0;
      }
      
      phases[i] = Math.random() * Math.PI * 2;
    }
    return { positions, colors, sizes, phases, twinkleSpeed };
  }, []);

  // OPTIMIZED: Reduced dust from 12000 to 3500
  const dustClouds = useMemo(() => {
    const count = 3500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 5 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const depth = radius / 60;
      const dustShade = Math.random() * 0.05;
      
      // Cosmic dust colors - violet-blue tints
      colors[i3] = 0.04 + dustShade + depth * 0.025;
      colors[i3 + 1] = 0.025 + dustShade * 0.8 + depth * 0.015;
      colors[i3 + 2] = 0.1 + dustShade * 1.5 + depth * 0.04;

      sizes[i] = 2.5 + Math.random() * 5.5 + depth * 2.0;
    }
    return { positions, colors, sizes };
  }, []);

  // OPTIMIZED: Reduced nebula from 10000 to 3000
  const nebulaClouds = useMemo(() => {
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 10 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const depth = radius / 50;
      const nebulaShade = Math.random() * 0.1;
      
      // Nebula colors - rich purples and blues
      colors[i3] = 0.06 + nebulaShade * 0.8 + depth * 0.03;
      colors[i3 + 1] = 0.03 + nebulaShade * 0.5 + depth * 0.015;
      colors[i3 + 2] = 0.15 + nebulaShade * 2.0 + depth * 0.06;

      sizes[i] = 4.0 + Math.random() * 8.0 + depth * 3.0;
    }
    return { positions, colors, sizes };
  }, []);

  // OPTIMIZED: Reduced distant stars from 4000 to 1500
  const distantStars = useMemo(() => {
    const count = 1500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 90 + Math.random() * 110;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const tint = Math.random();
      colors[i3] = 0.1 + tint * 0.08;
      colors[i3 + 1] = 0.06 + tint * 0.05;
      colors[i3 + 2] = 0.15 + tint * 0.12;

      sizes[i] = 0.2 + Math.random() * 0.4;
    }
    return { positions, colors, sizes };
  }, []);

  // OPTIMIZED: Reduced proto-galaxies from 800 to 400
  const protoGalaxies = useMemo(() => {
    const count = 400;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 30 + Math.random() * 65;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const brightness = 0.2 + Math.random() * 0.25;
      colors[i3] = brightness * 0.6;
      colors[i3 + 1] = brightness * 0.4;
      colors[i3 + 2] = brightness * 1.2;

      sizes[i] = 2.5 + Math.random() * 4.5;
    }
    return { positions, colors, sizes };
  }, []);

  // OPTIMIZED: Reduced update frequency and calculations
  useFrame((state, delta) => {
    if (!isVisible) return;
    
    const cappedDelta = Math.min(delta, 0.05);
    timeRef.current += cappedDelta;

    // Cinematic reveal animation
    if (revealRef.current < 1) {
      revealRef.current = Math.min(1, revealRef.current + cappedDelta * 0.3);
      
      // Dramatic camera pull-back
      const progress = revealRef.current;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      camera.position.z = 80 - easeOut * 60;
      camera.position.y = Math.sin(progress * Math.PI * 0.5) * 5;
      
      if (revealRef.current >= 1 && onComplete) {
        onComplete();
      }
    }

    // Darkness particles - subtle drift
    if (darknessRef.current) {
      darknessRef.current.rotation.y += cappedDelta * 0.01;
      darknessRef.current.rotation.x += cappedDelta * 0.004;
      const pulse = Math.sin(timeRef.current * 0.18) * 0.04 + 0.96;
      darknessRef.current.scale.setScalar(pulse);
    }

    // Stars - OPTIMIZED: Update every 4 frames instead of 2
    if (brightStarsRef.current && Math.floor(timeRef.current * 60) % 4 === 0) {
      const geometry = brightStarsRef.current.geometry;
      const sizes = geometry.attributes.size.array as Float32Array;
      const { phases, twinkleSpeed } = brightStars;

      for (let i = 0; i < phases.length; i++) {
        const pulse = Math.sin(timeRef.current * twinkleSpeed[i] + phases[i]) * 0.5 + 0.5;
        const breathe = Math.sin(timeRef.current * 0.15 + phases[i] * 0.3) * 0.25 + 0.75;
        sizes[i] = brightStars.sizes[i] * (0.7 + pulse * 0.6) * breathe;
      }
      geometry.attributes.size.needsUpdate = true;
      brightStarsRef.current.rotation.y -= cappedDelta * 0.015;
      brightStarsRef.current.rotation.x += cappedDelta * 0.006;
    }

    // Dust clouds
    if (dustCloudsRef.current) {
      dustCloudsRef.current.rotation.y += cappedDelta * 0.008;
      dustCloudsRef.current.rotation.z += cappedDelta * 0.003;
      const dustPulse = Math.sin(timeRef.current * 0.14) * 0.03 + 0.97;
      dustCloudsRef.current.scale.setScalar(dustPulse);
    }

    // Nebula clouds
    if (nebulaCloudsRef.current) {
      nebulaCloudsRef.current.rotation.y -= cappedDelta * 0.006;
      nebulaCloudsRef.current.rotation.x += cappedDelta * 0.003;
      const nebulaPulse = Math.sin(timeRef.current * 0.1 + 1.5) * 0.04 + 0.96;
      nebulaCloudsRef.current.scale.setScalar(nebulaPulse);
    }

    // Distant stars
    if (distantStarsRef.current) {
      distantStarsRef.current.rotation.y += cappedDelta * 0.002;
    }

    // Proto-galaxies with dramatic pulsing
    if (protoGalaxiesRef.current) {
      protoGalaxiesRef.current.rotation.y -= cappedDelta * 0.012;
      protoGalaxiesRef.current.rotation.x += cappedDelta * 0.005;
      const protoPulse = Math.sin(timeRef.current * 0.2) * 0.08 + 0.92;
      protoGalaxiesRef.current.scale.setScalar(protoPulse);
    }
  });

  if (!isVisible) return null;

  const masterOpacity = fadeIn;

  return (
    <group>
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.15}
        enableDamping={true}
        dampingFactor={0.08}
        enablePan={false}
        maxPolarAngle={Math.PI * 0.75}
        minPolarAngle={Math.PI * 0.25}
        rotateSpeed={0.4}
        minDistance={15}
        maxDistance={50}
      />

      {/* Distant stars - furthest back */}
      <points ref={distantStarsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[distantStars.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[distantStars.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[distantStars.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.25}
          vertexColors
          transparent
          opacity={0.4 * masterOpacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={circleTexture}
        />
      </points>

      {/* Darkness particles - primary atmosphere */}
      <points ref={darknessRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[darknessParticles.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[darknessParticles.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[darknessParticles.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={2.5}
          vertexColors
          transparent
          opacity={0.5 * masterOpacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={circleTexture}
        />
      </points>

      {/* Nebula clouds - deeper structure */}
      <points ref={nebulaCloudsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nebulaClouds.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[nebulaClouds.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[nebulaClouds.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={8.0}
          vertexColors
          transparent
          opacity={0.35 * masterOpacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={circleTexture}
        />
      </points>

      {/* Dust clouds */}
      <points ref={dustCloudsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dustClouds.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[dustClouds.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[dustClouds.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={6.0}
          vertexColors
          transparent
          opacity={0.4 * masterOpacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={circleTexture}
        />
      </points>

      {/* Proto-galaxies - seeds of future */}
      <points ref={protoGalaxiesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[protoGalaxies.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[protoGalaxies.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[protoGalaxies.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={3.5}
          vertexColors
          transparent
          opacity={0.75 * masterOpacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={circleTexture}
        />
      </points>

      {/* Bright stars - foreground details */}
      <points ref={brightStarsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[brightStars.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[brightStars.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[brightStars.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.9}
          vertexColors
          transparent
          opacity={0.95 * masterOpacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={circleTexture}
        />
      </points>

      {/* Cinematic lighting - reduced from 6 to 3 lights */}
      <ambientLight intensity={0.025} color="#0a0a1a" />
      
      {/* Single dramatic key light */}
      <pointLight 
        position={[40, 25, -30]} 
        intensity={0.08} 
        color="#1a1a40" 
        distance={100} 
        decay={2} 
      />
      
      {/* Rim light for depth */}
      <pointLight 
        position={[-35, -20, 40]} 
        intensity={0.04} 
        color="#0d0d28" 
        distance={90} 
        decay={2} 
      />
      
      {/* Atmospheric fog */}
      <fog attach="fog" args={['#000000', 50, 160]} />
    </group>
  );
};

export default DarkAges;
