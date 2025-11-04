import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CosmicDawnProps {
  isVisible: boolean;
  fadeIn?: number;
  onComplete?: () => void;
}

const CosmicDawn = ({ isVisible, fadeIn = 1, onComplete }: CosmicDawnProps) => {
  const firstStarsRef = useRef<THREE.Points>(null!);
  const reionizationRef = useRef<THREE.Points>(null!);
  const stellarHalosRef = useRef<THREE.Points>(null!);
  const protoGalaxiesRef = useRef<THREE.Points>(null!);
  const cosmicWebRef = useRef<THREE.Points>(null!);
  const supernovaRemnantRef = useRef<THREE.Points>(null!);
  const timeRef = useRef(0);
  const completedRef = useRef(false);

  // Enhanced circle texture with softer glow
  const circleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.15, 'rgba(255,255,255,0.95)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.7)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.4)');
    gradient.addColorStop(0.7, 'rgba(255,255,255,0.15)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  // Soft glow texture for halos
  const haloTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255,255,255,0.6)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.3)');
    gradient.addColorStop(0.6, 'rgba(255,255,255,0.1)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  // First stars - Population III massive stars (ENHANCED)
  const firstStars = useMemo(() => {
    const count = 250;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const ignitionTime = new Float32Array(count);
    const intensities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Clustered distribution - stars form in groups
      const clusterCenter = Math.floor(Math.random() * 8);
      const clusterX = (clusterCenter % 3 - 1) * 30;
      const clusterY = (Math.floor(clusterCenter / 3) % 3 - 1) * 30;
      const clusterZ = (Math.floor(clusterCenter / 9) - 1) * 30;
      
      const localRadius = 8 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = clusterX + localRadius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = clusterY + localRadius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = clusterZ + localRadius * Math.cos(phi);

      // More varied stellar colors
      const starType = Math.random();
      if (starType > 0.85) {
        // Brilliant blue-white O-type giants
        colors[i3] = 0.6 + Math.random() * 0.2;
        colors[i3 + 1] = 0.75 + Math.random() * 0.15;
        colors[i3 + 2] = 1.0;
        intensities[i] = 1.5 + Math.random() * 0.8;
      } else if (starType > 0.6) {
        // Pure white supergiants
        colors[i3] = 0.9 + Math.random() * 0.1;
        colors[i3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i3 + 2] = 1.0;
        intensities[i] = 1.2 + Math.random() * 0.6;
      } else {
        // Blue-tinted massive stars
        colors[i3] = 0.75 + Math.random() * 0.2;
        colors[i3 + 1] = 0.85 + Math.random() * 0.15;
        colors[i3 + 2] = 1.0;
        intensities[i] = 1.0 + Math.random() * 0.5;
      }

      sizes[i] = (1.5 + Math.random() * 3.5) * intensities[i];
      phases[i] = Math.random() * Math.PI * 2;
      ignitionTime[i] = Math.random() * 10.0;
    }
    return { positions, colors, sizes, phases, ignitionTime, intensities };
  }, []);

  // Reionization bubbles - ENHANCED with layers
  const reionizationBubbles = useMemo(() => {
    const count = 12000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const expansionPhase = new Float32Array(count);
    const bubbleLayer = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 8 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const layer = Math.random();
      bubbleLayer[i] = layer;
      
      const intensity = Math.random() * 0.4;
      
      if (layer > 0.7) {
        // Inner hot bubbles - bright blue-violet
        colors[i3] = 0.5 + intensity;
        colors[i3 + 1] = 0.6 + intensity * 0.7;
        colors[i3 + 2] = 0.95 + intensity * 0.3;
      } else if (layer > 0.4) {
        // Mid layer - purple-blue
        colors[i3] = 0.4 + intensity;
        colors[i3 + 1] = 0.5 + intensity * 0.8;
        colors[i3 + 2] = 0.85 + intensity * 0.5;
      } else {
        // Outer layer - soft blue
        colors[i3] = 0.35 + intensity;
        colors[i3 + 1] = 0.45 + intensity * 0.9;
        colors[i3 + 2] = 0.75 + intensity * 0.6;
      }

      sizes[i] = 0.8 + Math.random() * 4.5;
      expansionPhase[i] = Math.random() * Math.PI * 2;
    }
    return { positions, colors, sizes, expansionPhase, bubbleLayer };
  }, []);

  // Stellar halos - ENHANCED with multiple layers
  const stellarHalos = useMemo(() => {
    const count = 8000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const haloTypes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 10 + Math.random() * 75;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const haloType = Math.random();
      haloTypes[i] = haloType;
      
      const glow = Math.random() * 0.5;
      
      if (haloType > 0.7) {
        // Warm golden halos
        colors[i3] = 0.7 + glow;
        colors[i3 + 1] = 0.6 + glow * 0.8;
        colors[i3 + 2] = 0.8 + glow * 0.5;
      } else if (haloType > 0.4) {
        // Cool blue-white halos
        colors[i3] = 0.6 + glow;
        colors[i3 + 1] = 0.7 + glow * 0.9;
        colors[i3 + 2] = 0.9 + glow * 0.6;
      } else {
        // Soft purple-blue halos
        colors[i3] = 0.55 + glow;
        colors[i3 + 1] = 0.65 + glow * 0.85;
        colors[i3 + 2] = 0.85 + glow * 0.7;
      }

      sizes[i] = 2.5 + Math.random() * 7.0;
    }
    return { positions, colors, sizes, haloTypes };
  }, []);

  // Proto-galaxies - ENHANCED
  const protoGalaxies = useMemo(() => {
    const count = 1800;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const galaxyTypes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 25 + Math.random() * 70;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const galaxyType = Math.random();
      galaxyTypes[i] = galaxyType;
      
      const brightness = 0.15 + Math.random() * 0.4;
      
      if (galaxyType > 0.7) {
        // Active forming regions - blue-white
        colors[i3] = brightness * 0.85;
        colors[i3 + 1] = brightness * 0.9;
        colors[i3 + 2] = brightness * 1.1;
      } else {
        // Normal proto-galaxies
        colors[i3] = brightness * 0.75;
        colors[i3 + 1] = brightness * 0.8;
        colors[i3 + 2] = brightness;
      }

      sizes[i] = 2.0 + Math.random() * 5.5;
    }
    return { positions, colors, sizes, galaxyTypes };
  }, []);

  // NEW: Cosmic web structure
  const cosmicWeb = useMemo(() => {
    const count = 3500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Create filament-like structures
      const filament = Math.floor(Math.random() * 12);
      const t = Math.random();
      const radius = 40 + Math.random() * 45;
      
      const angle = (filament / 12) * Math.PI * 2;
      positions[i3] = Math.cos(angle) * radius * t + (Math.random() - 0.5) * 8;
      positions[i3 + 1] = Math.sin(angle) * radius * t + (Math.random() - 0.5) * 8;
      positions[i3 + 2] = (Math.random() - 0.5) * 60;

      const dim = 0.1 + Math.random() * 0.15;
      colors[i3] = dim * 0.6;
      colors[i3 + 1] = dim * 0.65;
      colors[i3 + 2] = dim * 0.8;

      sizes[i] = 0.8 + Math.random() * 2.0;
    }
    return { positions, colors, sizes };
  }, []);

  // NEW: Supernova remnants
  const supernovaRemnants = useMemo(() => {
    const count = 15;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const expansionRates = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 20 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Vibrant supernova colors
      const colorType = Math.random();
      if (colorType > 0.6) {
        colors[i3] = 0.9;
        colors[i3 + 1] = 0.3;
        colors[i3 + 2] = 0.2;
      } else if (colorType > 0.3) {
        colors[i3] = 0.2;
        colors[i3 + 1] = 0.6;
        colors[i3 + 2] = 0.9;
      } else {
        colors[i3] = 0.9;
        colors[i3 + 1] = 0.9;
        colors[i3 + 2] = 0.3;
      }

      sizes[i] = 8.0 + Math.random() * 12.0;
      expansionRates[i] = 0.5 + Math.random() * 1.5;
    }
    return { positions, colors, sizes, expansionRates };
  }, []);

  useFrame((state, delta) => {
    if (!isVisible) return;
    
    const cappedDelta = Math.min(delta, 0.1);
    timeRef.current += cappedDelta;

    // First stars - CINEMATIC sequential ignition
    if (firstStarsRef.current) {
      const geometry = firstStarsRef.current.geometry;
      const sizes = geometry.attributes.size.array as Float32Array;
      const colors = geometry.attributes.color.array as Float32Array;

      for (let i = 0; i < firstStars.ignitionTime.length; i++) {
        const ignitionDelay = firstStars.ignitionTime[i];
        const timeSinceIgnition = Math.max(0, timeRef.current - ignitionDelay);
        
        // Dramatic ignition sequence
        const ignitionProgress = Math.min(1, timeSinceIgnition * 0.4);
        const burst = Math.exp(-timeSinceIgnition * 0.6) * 4.0;
        
        // Complex pulsing pattern
        const mainPulse = Math.sin(timeRef.current * 1.5 + firstStars.phases[i]) * 0.35 + 0.65;
        const twinkle = Math.sin(timeRef.current * 3.5 + firstStars.phases[i] * 2.3) * 0.2 + 0.8;
        const breathe = Math.sin(timeRef.current * 0.5 + firstStars.phases[i] * 0.7) * 0.15 + 0.85;
        
        const finalSize = firstStars.sizes[i] * ignitionProgress * (1 + burst) * 
                         mainPulse * twinkle * breathe * fadeIn * firstStars.intensities[i];
        
        sizes[i] = finalSize;
        
        // Color intensity pulsing
        const i3 = i * 3;
        const colorPulse = 0.85 + mainPulse * 0.15;
        colors[i3] = firstStars.colors[i3] * colorPulse;
        colors[i3 + 1] = firstStars.colors[i3 + 1] * colorPulse;
        colors[i3 + 2] = firstStars.colors[i3 + 2] * colorPulse;
      }
      geometry.attributes.size.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      
      firstStarsRef.current.rotation.y += cappedDelta * 0.008;
      firstStarsRef.current.rotation.x += cappedDelta * 0.003;
    }

    // Reionization bubbles - ENHANCED expansion
    if (reionizationRef.current) {
      const geometry = reionizationRef.current.geometry;
      const sizes = geometry.attributes.size.array as Float32Array;
      const colors = geometry.attributes.color.array as Float32Array;

      for (let i = 0; i < reionizationBubbles.expansionPhase.length; i++) {
        const wave1 = Math.sin(timeRef.current * 0.25 + reionizationBubbles.expansionPhase[i]) * 0.5 + 0.5;
        const wave2 = Math.sin(timeRef.current * 0.15 + reionizationBubbles.expansionPhase[i] * 1.3) * 0.3 + 0.7;
        const expansion = Math.min(1, timeRef.current * 0.12);
        
        const layerFactor = reionizationBubbles.bubbleLayer[i];
        const layerExpansion = 1 + expansion * (1.5 + layerFactor * 1.5);
        
        sizes[i] = reionizationBubbles.sizes[i] * layerExpansion * wave1 * wave2 * fadeIn;
        
        // Dynamic color shifts
        const i3 = i * 3;
        const colorShift = 0.9 + wave1 * 0.1;
        colors[i3] = reionizationBubbles.colors[i3] * colorShift;
        colors[i3 + 1] = reionizationBubbles.colors[i3 + 1] * colorShift;
        colors[i3 + 2] = reionizationBubbles.colors[i3 + 2] * colorShift;
      }
      geometry.attributes.size.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      
      reionizationRef.current.rotation.y -= cappedDelta * 0.006;
      reionizationRef.current.rotation.z += cappedDelta * 0.002;
      
      const breathe = Math.sin(timeRef.current * 0.18) * 0.12 + 0.88;
      reionizationRef.current.scale.setScalar(breathe);
    }

    // Stellar halos - ENHANCED glow
    if (stellarHalosRef.current) {
      stellarHalosRef.current.rotation.y += cappedDelta * 0.005;
      stellarHalosRef.current.rotation.x -= cappedDelta * 0.002;
      
      const glow = Math.sin(timeRef.current * 0.12) * 0.08 + 0.92;
      const pulse = Math.sin(timeRef.current * 0.25) * 0.05 + 0.95;
      stellarHalosRef.current.scale.setScalar(glow * pulse);
    }

    // Proto-galaxies - ENHANCED rotation
    if (protoGalaxiesRef.current) {
      protoGalaxiesRef.current.rotation.y -= cappedDelta * 0.01;
      protoGalaxiesRef.current.rotation.x += cappedDelta * 0.004;
      protoGalaxiesRef.current.rotation.z -= cappedDelta * 0.002;
      
      const pulse = Math.sin(timeRef.current * 0.08) * 0.1 + 0.9;
      protoGalaxiesRef.current.scale.setScalar(pulse);
    }

    // Cosmic web - subtle movement
    if (cosmicWebRef.current) {
      cosmicWebRef.current.rotation.y += cappedDelta * 0.003;
      const drift = Math.sin(timeRef.current * 0.1) * 0.06 + 0.94;
      cosmicWebRef.current.scale.setScalar(drift);
    }

    // Supernova remnants - expanding rings
    if (supernovaRemnantRef.current) {
      const geometry = supernovaRemnantRef.current.geometry;
      const sizes = geometry.attributes.size.array as Float32Array;

      for (let i = 0; i < supernovaRemnants.expansionRates.length; i++) {
        const expansion = timeRef.current * supernovaRemnants.expansionRates[i];
        const pulse = Math.sin(expansion * 0.5) * 0.5 + 0.5;
        const fade = Math.max(0, 1 - expansion * 0.1);
        
        sizes[i] = supernovaRemnants.sizes[i] * (1 + expansion * 0.3) * pulse * fade * fadeIn;
      }
      geometry.attributes.size.needsUpdate = true;
    }

    // Call onComplete
    if (timeRef.current > 12 && !completedRef.current && onComplete) {
      completedRef.current = true;
      onComplete();
    }
  });

  if (!isVisible) return null;

  return (
    <group>
      {/* Background cosmic web */}
      <points ref={cosmicWebRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[cosmicWeb.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[cosmicWeb.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[cosmicWeb.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={2.0}
          vertexColors
          transparent
          opacity={0.25 * fadeIn}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={circleTexture}
        />
      </points>

      {/* Reionization bubbles - background layer */}
      <points ref={reionizationRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[reionizationBubbles.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[reionizationBubbles.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[reionizationBubbles.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={4.5}
          vertexColors
          transparent
          opacity={0.45 * fadeIn}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={haloTexture}
        />
      </points>

      {/* Stellar halos - mid layer */}
      <points ref={stellarHalosRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[stellarHalos.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[stellarHalos.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[stellarHalos.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={6.0}
          vertexColors
          transparent
          opacity={0.55 * fadeIn}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={haloTexture}
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
          opacity={0.7 * fadeIn}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={circleTexture}
        />
      </points>

      {/* Supernova remnants */}
      <points ref={supernovaRemnantRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[supernovaRemnants.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[supernovaRemnants.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[supernovaRemnants.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={10.0}
          vertexColors
          transparent
          opacity={0.4 * fadeIn}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={haloTexture}
        />
      </points>

      {/* First stars - foreground brilliant points */}
      <points ref={firstStarsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[firstStars.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[firstStars.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[firstStars.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={3.5}
          vertexColors
          transparent
          opacity={1.0 * fadeIn}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={circleTexture}
        />
      </points>

      {/* Enhanced atmospheric lighting */}
      <ambientLight intensity={0.12 * fadeIn} color="#d0d8ff" />
      
      {/* Multiple dynamic point lights for cinematic effect */}
      <pointLight 
        position={[25, 18, 12]} 
        intensity={0.6 * fadeIn} 
        color="#b0c8ff" 
        distance={120} 
        decay={2} 
      />
      <pointLight 
        position={[-30, 12, -18]} 
        intensity={0.5 * fadeIn} 
        color="#c8d8ff" 
        distance={110} 
        decay={2} 
      />
      <pointLight 
        position={[18, -25, 25]} 
        intensity={0.45 * fadeIn} 
        color="#a8c0ff" 
        distance={100} 
        decay={2} 
      />
      <pointLight 
        position={[-12, 22, -22]} 
        intensity={0.4 * fadeIn} 
        color="#c0d0ff" 
        distance={95} 
        decay={2} 
      />
      <pointLight 
        position={[0, -18, 15]} 
        intensity={0.35 * fadeIn} 
        color="#b8d0ff" 
        distance={85} 
        decay={2} 
      />
      
      {/* Subtle directional rim light */}
      <directionalLight
        position={[50, 30, -40]}
        intensity={0.15 * fadeIn}
        color="#e0e8ff"
      />
      
      {/* Enhanced fog for depth */}
      <fog attach="fog" args={['#030308', 40, 200]} />
    </group>
  );
};

export default CosmicDawn;