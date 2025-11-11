import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';

interface DarkAgesProps {
  isVisible: boolean;
  onComplete?: () => void;
  fadeIn?: number;
}

const DarkAges = ({ isVisible, onComplete, fadeIn = 1 }: DarkAgesProps) => {
  const darknessRef = useRef<THREE.Points>(null!);
  const brightStarsRef = useRef<THREE.Points>(null!);
  const dustCloudsRef = useRef<THREE.Points>(null!);
  const nebulaCloudsRef = useRef<THREE.Points>(null!);
  const distantStarsRef = useRef<THREE.Points>(null!);
  const protoGalaxiesRef = useRef<THREE.Points>(null!);
  const farFieldRef = useRef<THREE.Points>(null!);
  const deepSpaceRef = useRef<THREE.Points>(null!);
  const timeRef = useRef(0);
  const revealRef = useRef(0);
  const { camera } = useThree();

  const circleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
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


  const darknessParticles = useMemo(() => {
    const count = 15000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 8 + Math.random() * 150;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const depth = radius / 150;
      const darkness = Math.random();
      
      colors[i3] = 0.1 + darkness * 0.06 + depth * 0.03;
      colors[i3 + 1] = 0.015 + darkness * 0.015;
      colors[i3 + 2] = 0.04 + darkness * 0.04 + depth * 0.025;

      sizes[i] = 0.8 + Math.random() * 4.0 + depth * 2.5;
    }
    return { positions, colors, sizes };
  }, []);

  const brightStars = useMemo(() => {
    const count = 2500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const twinkleSpeed = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 20 + Math.random() * 180;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const depth = radius / 180;
      const starType = Math.random();
      
      if (starType > 0.95) {
        colors[i3] = 0.95;
        colors[i3 + 1] = 0.08;
        colors[i3 + 2] = 0.08;
        sizes[i] = 1.8 + Math.random() * 3.0;
        twinkleSpeed[i] = 0.3 + Math.random() * 0.4;
      } else if (starType > 0.85) {
        colors[i3] = 0.7;
        colors[i3 + 1] = 0.18;
        colors[i3 + 2] = 0.06;
        sizes[i] = 1.2 + Math.random() * 2.0;
        twinkleSpeed[i] = 0.4 + Math.random() * 0.5;
      } else if (starType > 0.6) {
        colors[i3] = 0.35 + Math.random() * 0.2;
        colors[i3 + 1] = 0.3 + Math.random() * 0.15;
        colors[i3 + 2] = 0.5 + Math.random() * 0.15;
        sizes[i] = 0.9 + Math.random() * 1.5;
        twinkleSpeed[i] = 0.5 + Math.random() * 0.8;
      } else {
        colors[i3] = 0.15 + Math.random() * 0.1 + depth * 0.08;
        colors[i3 + 1] = 0.1 + Math.random() * 0.08;
        colors[i3 + 2] = 0.12 + Math.random() * 0.1;
        sizes[i] = 0.5 + Math.random() * 1.0;
        twinkleSpeed[i] = 0.6 + Math.random() * 1.0;
      }
      
      phases[i] = Math.random() * Math.PI * 2;
    }
    return { positions, colors, sizes, phases, twinkleSpeed };
  }, []);

  const dustClouds = useMemo(() => {
    const count = 6000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 5 + Math.random() * 120;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const depth = radius / 120;
      const dustShade = Math.random() * 0.08;
      
      colors[i3] = 0.08 + dustShade + depth * 0.03;
      colors[i3 + 1] = 0.03 + dustShade * 0.5;
      colors[i3 + 2] = 0.02 + dustShade * 0.4;

      sizes[i] = 2.5 + Math.random() * 7.0 + depth * 3.0;
    }
    return { positions, colors, sizes };
  }, []);

  const nebulaClouds = useMemo(() => {
    const count = 5000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 10 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const depth = radius / 100;
      const nebulaShade = Math.random() * 0.15;
      
      colors[i3] = 0.2 + nebulaShade * 1.5 + depth * 0.05;
      colors[i3 + 1] = 0.015 + nebulaShade * 0.3;
      colors[i3 + 2] = 0.1 + nebulaShade * 0.8 + depth * 0.04;

      sizes[i] = 4.0 + Math.random() * 10.0 + depth * 4.0;
    }
    return { positions, colors, sizes };
  }, []);

  const distantStars = useMemo(() => {
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 150 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const tint = Math.random();
      colors[i3] = 0.06 + tint * 0.05;
      colors[i3 + 1] = 0.025 + tint * 0.025;
      colors[i3 + 2] = 0.07 + tint * 0.06;

      sizes[i] = 0.2 + Math.random() * 0.6;
    }
    return { positions, colors, sizes };
  }, []);

  const protoGalaxies = useMemo(() => {
    const count = 800;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 30 + Math.random() * 130;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const brightness = 0.18 + Math.random() * 0.2;
      colors[i3] = brightness * 0.9;
      colors[i3 + 1] = brightness * 0.25;
      colors[i3 + 2] = brightness * 0.7;

      sizes[i] = 2.5 + Math.random() * 5.5;
    }
    return { positions, colors, sizes };
  }, []);


  const farField = useMemo(() => {
    const count = 8000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 300 + Math.random() * 400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const darkness = Math.random() * 0.04;
      colors[i3] = 0.03 + darkness;
      colors[i3 + 1] = 0.01 + darkness * 0.5;
      colors[i3 + 2] = 0.025 + darkness * 0.7;

      sizes[i] = 0.3 + Math.random() * 1.5;
    }
    return { positions, colors, sizes };
  }, []);


  const deepSpace = useMemo(() => {
    const count = 10000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 600 + Math.random() * 600;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const intensity = Math.random() * 0.03;
      colors[i3] = 0.02 + intensity;
      colors[i3 + 1] = 0.008 + intensity * 0.4;
      colors[i3 + 2] = 0.015 + intensity * 0.6;

      sizes[i] = 0.2 + Math.random() * 0.8;
    }
    return { positions, colors, sizes };
  }, []);

  useFrame((state, delta) => {
    if (!isVisible) return;
    
    const cappedDelta = Math.min(delta, 0.05);
    timeRef.current += cappedDelta;

    if (revealRef.current < 1) {
      revealRef.current = Math.min(1, revealRef.current + cappedDelta * 0.3);
      
      const progress = revealRef.current;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      camera.position.z = 80 - easeOut * 60;
      camera.position.y = Math.sin(progress * Math.PI * 0.5) * 5;
      
      if (revealRef.current >= 1 && onComplete) {
        onComplete();
      }
    }

    if (darknessRef.current) {
      darknessRef.current.rotation.y += cappedDelta * 0.01;
      darknessRef.current.rotation.x += cappedDelta * 0.004;
      const pulse = Math.sin(timeRef.current * 0.18) * 0.05 + 0.95;
      darknessRef.current.scale.setScalar(pulse);
    }

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

    if (dustCloudsRef.current) {
      dustCloudsRef.current.rotation.y += cappedDelta * 0.008;
      dustCloudsRef.current.rotation.z += cappedDelta * 0.003;
      const dustPulse = Math.sin(timeRef.current * 0.14) * 0.04 + 0.96;
      dustCloudsRef.current.scale.setScalar(dustPulse);
    }

    if (nebulaCloudsRef.current) {
      nebulaCloudsRef.current.rotation.y -= cappedDelta * 0.006;
      nebulaCloudsRef.current.rotation.x += cappedDelta * 0.003;
      const nebulaPulse = Math.sin(timeRef.current * 0.1 + 1.5) * 0.05 + 0.95;
      nebulaCloudsRef.current.scale.setScalar(nebulaPulse);
    }

    if (distantStarsRef.current) {
      distantStarsRef.current.rotation.y += cappedDelta * 0.002;
      distantStarsRef.current.rotation.x -= cappedDelta * 0.001;
    }

    if (protoGalaxiesRef.current) {
      protoGalaxiesRef.current.rotation.y -= cappedDelta * 0.012;
      protoGalaxiesRef.current.rotation.x += cappedDelta * 0.005;
      const protoPulse = Math.sin(timeRef.current * 0.2) * 0.09 + 0.91;
      protoGalaxiesRef.current.scale.setScalar(protoPulse);
    }

    if (farFieldRef.current) {
      farFieldRef.current.rotation.y += cappedDelta * 0.001;
      farFieldRef.current.rotation.z -= cappedDelta * 0.0005;
    }

    if (deepSpaceRef.current) {
      deepSpaceRef.current.rotation.y -= cappedDelta * 0.0005;
      deepSpaceRef.current.rotation.x += cappedDelta * 0.0003;
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
        enablePan={true}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN
        }}
        maxPolarAngle={Math.PI}
        minPolarAngle={0}
        rotateSpeed={0.4}
        minDistance={5}
        maxDistance={800}
        panSpeed={1.5}
      />

      {/* Deep space - infinite background */}
      <points ref={deepSpaceRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[deepSpace.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[deepSpace.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[deepSpace.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.5}
          vertexColors
          transparent
          opacity={0.25 * masterOpacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={circleTexture}
        />
      </points>

      {/* Far field */}
      <points ref={farFieldRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[farField.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[farField.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[farField.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={1.0}
          vertexColors
          transparent
          opacity={0.35 * masterOpacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={circleTexture}
        />
      </points>

      {/* Distant stars */}
      <points ref={distantStarsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[distantStars.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[distantStars.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[distantStars.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.4}
          vertexColors
          transparent
          opacity={0.4 * masterOpacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={circleTexture}
        />
      </points>

      {/* Darkness particles */}
      <points ref={darknessRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[darknessParticles.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[darknessParticles.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[darknessParticles.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={3.0}
          vertexColors
          transparent
          opacity={0.65 * masterOpacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={circleTexture}
        />
      </points>

      {/* Nebula clouds */}
      <points ref={nebulaCloudsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nebulaClouds.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[nebulaClouds.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[nebulaClouds.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={10.0}
          vertexColors
          transparent
          opacity={0.45 * masterOpacity}
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
          size={7.0}
          vertexColors
          transparent
          opacity={0.5 * masterOpacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={circleTexture}
        />
      </points>

      {/* Proto-galaxies */}
      <points ref={protoGalaxiesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[protoGalaxies.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[protoGalaxies.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[protoGalaxies.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={4.0}
          vertexColors
          transparent
          opacity={0.75 * masterOpacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={circleTexture}
        />
      </points>

      {/* Bright stars */}
      <points ref={brightStarsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[brightStars.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[brightStars.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[brightStars.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={1.2}
          vertexColors
          transparent
          opacity={0.9 * masterOpacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={circleTexture}
        />
      </points>

      <ambientLight intensity={0.02} color="#0a0008" />
      
      <pointLight 
        position={[40, 25, -30]} 
        intensity={0.06} 
        color="#1a0a0a" 
        distance={150} 
        decay={2} 
      />
      
      <pointLight 
        position={[-35, -20, 40]} 
        intensity={0.03} 
        color="#0d0510" 
        distance={120} 
        decay={2} 
      />
      
      <fog attach="fog" args={['#000000', 80, 400]} />
    </group>
  );
};

export default DarkAges;