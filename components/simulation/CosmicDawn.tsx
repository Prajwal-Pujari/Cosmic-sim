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
  const birthCloudRef = useRef<THREE.Points>(null!);
  const shockwaveRef = useRef<THREE.Points>(null!);
  const accretionDiskRef = useRef<THREE.Points>(null!);
  const stellarWindRef = useRef<THREE.Points>(null!);

  const timeRef = useRef(0);
  const completedRef = useRef(false);

  // Enhanced star glow texture
  const starTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.9)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.6)');
    gradient.addColorStop(0.7, 'rgba(255,255,255,0.2)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  // Soft cloud texture
  const cloudTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255,255,255,0.5)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  // First stars data
  const firstStars = useMemo(() => {
    const count = 180;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const ignitionTime = new Float32Array(count);
    const intensities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Create clusters spread across space
      const clusterCenter = Math.floor(Math.random() * 6);
      const clusterX = (clusterCenter % 3 - 1) * 80;
      const clusterY = ((Math.floor(clusterCenter / 3) % 2) - 0.5) * 50;
      const clusterZ = (Math.floor(clusterCenter / 6) - 0.5) * 60;

      const localRadius = 15 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = clusterX + localRadius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = clusterY + localRadius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = clusterZ + localRadius * Math.cos(phi);

      // Star color types (blue-white hot stars)
      const starType = Math.random();
      if (starType > 0.7) {
        colors[i3] = 0.7;
        colors[i3 + 1] = 0.85;
        colors[i3 + 2] = 1.0;
        intensities[i] = 2.5 + Math.random() * 1.5;
      } else if (starType > 0.4) {
        colors[i3] = 0.85;
        colors[i3 + 1] = 0.9;
        colors[i3 + 2] = 1.0;
        intensities[i] = 2.0 + Math.random() * 1.2;
      } else {
        colors[i3] = 0.8;
        colors[i3 + 1] = 0.88;
        colors[i3 + 2] = 1.0;
        intensities[i] = 1.8 + Math.random() * 1.0;
      }

      sizes[i] = (8.0 + Math.random() * 12.0) * intensities[i];
      phases[i] = Math.random() * Math.PI * 2;

      // Staggered ignition times (0-15 seconds)
      const sequence = i / count;
      ignitionTime[i] = sequence * 15.0 + (Math.random() - 0.5) * 2.0;
    }
    return { positions, colors, sizes, phases, ignitionTime, intensities };
  }, []);

  // Birth clouds
  const birthClouds = useMemo(() => {
    const count = 15000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const starIndex = new Float32Array(count);
    const originalOffsets = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const linkedStar = Math.floor((Math.random() * firstStars.positions.length) / 3);
      starIndex[i] = linkedStar;

      const starX = firstStars.positions[linkedStar * 3];
      const starY = firstStars.positions[linkedStar * 3 + 1];
      const starZ = firstStars.positions[linkedStar * 3 + 2];

      const cloudRadius = 8 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const dx = cloudRadius * Math.sin(phi) * Math.cos(theta);
      const dy = cloudRadius * Math.sin(phi) * Math.sin(theta);
      const dz = cloudRadius * Math.cos(phi);

      positions[i3] = starX + dx;
      positions[i3 + 1] = starY + dy;
      positions[i3 + 2] = starZ + dz;

      originalOffsets[i3] = dx;
      originalOffsets[i3 + 1] = dy;
      originalOffsets[i3 + 2] = dz;

      const density = Math.random();
      colors[i3] = 0.12 + density * 0.2;
      colors[i3 + 1] = 0.18 + density * 0.25;
      colors[i3 + 2] = 0.35 + density * 0.35;

      sizes[i] = 2.5 + Math.random() * 5.0;
    }
    return { positions, colors, sizes, starIndex, originalOffsets };
  }, [firstStars.positions]);

  // Accretion disks (visible core forming)
  const accretionDisks = useMemo(() => {
    const count = 8000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const starIndex = new Float32Array(count);
    const diskAngle = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const linkedStar = Math.floor((Math.random() * firstStars.positions.length) / 3);
      starIndex[i] = linkedStar;

      positions[i3] = firstStars.positions[linkedStar * 3];
      positions[i3 + 1] = firstStars.positions[linkedStar * 3 + 1];
      positions[i3 + 2] = firstStars.positions[linkedStar * 3 + 2];

      diskAngle[i] = Math.random() * Math.PI * 2;

      // Hot glowing core colors
      const heat = Math.random();
      colors[i3] = 0.9 + heat * 0.1;
      colors[i3 + 1] = 0.7 + heat * 0.2;
      colors[i3 + 2] = 0.4 + heat * 0.3;

      sizes[i] = 3.0 + Math.random() * 6.0;
    }
    return { positions, colors, sizes, starIndex, diskAngle };
  }, [firstStars.positions]);

  // Shockwaves
  const shockwaves = useMemo(() => {
    const count = 4000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const starIndex = new Float32Array(count);
    const ejectionVector = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const linkedStar = Math.floor((Math.random() * firstStars.positions.length) / 3);
      starIndex[i] = linkedStar;

      const starX = firstStars.positions[linkedStar * 3];
      const starY = firstStars.positions[linkedStar * 3 + 1];
      const starZ = firstStars.positions[linkedStar * 3 + 2];

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      ejectionVector[i3] = Math.sin(phi) * Math.cos(theta);
      ejectionVector[i3 + 1] = Math.sin(phi) * Math.sin(theta);
      ejectionVector[i3 + 2] = Math.cos(phi);

      positions[i3] = starX;
      positions[i3 + 1] = starY;
      positions[i3 + 2] = starZ;

      colors[i3] = 0.9;
      colors[i3 + 1] = 0.95;
      colors[i3 + 2] = 1.0;

      sizes[i] = 4.0 + Math.random() * 8.0;
    }
    return { positions, colors, sizes, starIndex, ejectionVector };
  }, [firstStars.positions]);

  // Stellar wind particles
  const stellarWind = useMemo(() => {
    const count = 6000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const starIndex = new Float32Array(count);
    const windPhase = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const linkedStar = Math.floor((Math.random() * firstStars.positions.length) / 3);
      starIndex[i] = linkedStar;

      positions[i3] = firstStars.positions[linkedStar * 3];
      positions[i3 + 1] = firstStars.positions[linkedStar * 3 + 1];
      positions[i3 + 2] = firstStars.positions[linkedStar * 3 + 2];

      windPhase[i] = Math.random();

      colors[i3] = 0.7 + Math.random() * 0.3;
      colors[i3 + 1] = 0.8 + Math.random() * 0.2;
      colors[i3 + 2] = 1.0;

      sizes[i] = 2.0 + Math.random() * 4.0;
    }
    return { positions, colors, sizes, starIndex, windPhase };
  }, [firstStars.positions]);

  useFrame((_, delta) => {
    if (!isVisible) return;

    const cappedDelta = Math.min(delta, 0.1);
    timeRef.current += cappedDelta;
    const time = timeRef.current;

    // Birth clouds - gravitational collapse
    if (birthCloudRef.current) {
      const geometry = birthCloudRef.current.geometry;
      const positions = geometry.attributes.position.array as Float32Array;
      const sizes = geometry.attributes.size.array as Float32Array;
      const colors = geometry.attributes.color.array as Float32Array;

      for (let i = 0; i < birthClouds.starIndex.length; i++) {
        const linkedStar = birthClouds.starIndex[i];
        const starIgnitionTime = firstStars.ignitionTime[linkedStar];
        const collapseStartTime = starIgnitionTime - 4.0;

        const i3 = i * 3;
        const starX = firstStars.positions[linkedStar * 3];
        const starY = firstStars.positions[linkedStar * 3 + 1];
        const starZ = firstStars.positions[linkedStar * 3 + 2];

        const dx = birthClouds.originalOffsets[i3];
        const dy = birthClouds.originalOffsets[i3 + 1];
        const dz = birthClouds.originalOffsets[i3 + 2];

        if (time < collapseStartTime) {
          // Pre-collapse: drifting clouds
          const drift = Math.sin(time * 0.15 + i * 0.1) * 0.5;
          positions[i3] = starX + dx + drift;
          positions[i3 + 1] = starY + dy + drift * 0.7;
          positions[i3 + 2] = starZ + dz + drift * 0.5;
          sizes[i] = birthClouds.sizes[i] * 0.9 * fadeIn;

        } else if (time >= collapseStartTime && time < starIgnitionTime) {
          // Collapse phase - swirling inward
          const collapseProgress = (time - collapseStartTime) / 4.0;
          const collapseFactor = Math.pow(1.0 - collapseProgress, 2.5);

          // Increasing rotation as it collapses
          const swirlSpeed = Math.pow(collapseProgress, 2.0) * 10.0;
          const angle = time * swirlSpeed;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1.0;
          
          const swirlX = Math.cos(angle) * dx - Math.sin(angle) * dy;
          const swirlY = Math.sin(angle) * dx + Math.cos(angle) * dy;

          positions[i3] = starX + swirlX * collapseFactor;
          positions[i3 + 1] = starY + swirlY * collapseFactor;
          positions[i3 + 2] = starZ + dz * collapseFactor;

          sizes[i] = birthClouds.sizes[i] * (collapseFactor * 0.7 + 0.3) * fadeIn;

          // Heating up - turning orange/red
          const heat = collapseProgress;
          colors[i3] = birthClouds.colors[i3] * (1 + heat * 3.0);
          colors[i3 + 1] = birthClouds.colors[i3 + 1] * (1 + heat * 2.0);
          colors[i3 + 2] = birthClouds.colors[i3 + 2] * (1 + heat * 0.5);

        } else {
          // Post-ignition: blown away
          const blowTime = time - starIgnitionTime;
          const blowFactor = Math.min(1, blowTime * 0.4);
          const speed = 1 + blowFactor * 12;

          positions[i3] = starX + dx * speed;
          positions[i3 + 1] = starY + dy * speed;
          positions[i3 + 2] = starZ + dz * speed;

          sizes[i] = birthClouds.sizes[i] * (1 - blowFactor * 0.9) * fadeIn;
          
          const fade = 1 - blowFactor;
          colors[i3] = birthClouds.colors[i3] * fade;
          colors[i3 + 1] = birthClouds.colors[i3 + 1] * fade;
          colors[i3 + 2] = birthClouds.colors[i3 + 2] * fade;
        }
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.size.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
    }

    // Accretion disk - visible core formation
    if (accretionDiskRef.current) {
      const geometry = accretionDiskRef.current.geometry;
      const positions = geometry.attributes.position.array as Float32Array;
      const sizes = geometry.attributes.size.array as Float32Array;
      const colors = geometry.attributes.color.array as Float32Array;

      for (let i = 0; i < accretionDisks.starIndex.length; i++) {
        const linkedStar = accretionDisks.starIndex[i];
        const starIgnitionTime = firstStars.ignitionTime[linkedStar];
        const diskStartTime = starIgnitionTime - 2.5;

        const i3 = i * 3;
        const starX = firstStars.positions[linkedStar * 3];
        const starY = firstStars.positions[linkedStar * 3 + 1];
        const starZ = firstStars.positions[linkedStar * 3 + 2];

        if (time >= diskStartTime && time < starIgnitionTime) {
          // Forming accretion disk
          const diskProgress = (time - diskStartTime) / 2.5;
          const radius = 5 * (1 - diskProgress * 0.6);
          const angle = accretionDisks.diskAngle[i] + time * 2.0;

          positions[i3] = starX + Math.cos(angle) * radius;
          positions[i3 + 1] = starY + Math.sin(angle) * radius * 0.3;
          positions[i3 + 2] = starZ + Math.sin(angle) * radius;

          sizes[i] = accretionDisks.sizes[i] * (1 + diskProgress) * fadeIn;

          // Glowing brighter as core forms
          const glow = diskProgress * 2.0;
          colors[i3] = accretionDisks.colors[i3] * (1 + glow);
          colors[i3 + 1] = accretionDisks.colors[i3 + 1] * (1 + glow * 0.8);
          colors[i3 + 2] = accretionDisks.colors[i3 + 2] * (1 + glow * 0.5);

        } else if (time >= starIgnitionTime && time < starIgnitionTime + 1.0) {
          // Ignition flash - disk consumed
          const flashTime = time - starIgnitionTime;
          const flashFade = 1 - flashTime;
          
          positions[i3] = starX;
          positions[i3 + 1] = starY;
          positions[i3 + 2] = starZ;

          sizes[i] = accretionDisks.sizes[i] * (3 + flashTime * 5) * flashFade * fadeIn;
          
          colors[i3] = 1.0;
          colors[i3 + 1] = 1.0;
          colors[i3 + 2] = 1.0;

        } else {
          sizes[i] = 0;
        }
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.size.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
    }

    // Shockwaves
    if (shockwaveRef.current) {
      const geometry = shockwaveRef.current.geometry;
      const positions = geometry.attributes.position.array as Float32Array;
      const sizes = geometry.attributes.size.array as Float32Array;
      const colors = geometry.attributes.color.array as Float32Array;

      for (let i = 0; i < shockwaves.starIndex.length; i++) {
        const linkedStar = shockwaves.starIndex[i];
        const starIgnitionTime = firstStars.ignitionTime[linkedStar];
        const timeSince = time - starIgnitionTime;

        const i3 = i * 3;
        const starX = firstStars.positions[linkedStar * 3];
        const starY = firstStars.positions[linkedStar * 3 + 1];
        const starZ = firstStars.positions[linkedStar * 3 + 2];

        if (timeSince >= 0 && timeSince < 4.0) {
          const progress = timeSince / 4.0;
          const radius = Math.pow(progress, 0.6) * 50;

          const vx = shockwaves.ejectionVector[i3];
          const vy = shockwaves.ejectionVector[i3 + 1];
          const vz = shockwaves.ejectionVector[i3 + 2];

          positions[i3] = starX + vx * radius;
          positions[i3 + 1] = starY + vy * radius;
          positions[i3 + 2] = starZ + vz * radius;

          const flash = Math.exp(-progress * 6) * 8;
          sizes[i] = shockwaves.sizes[i] * (1 + flash) * (1 - progress * 0.8) * fadeIn;

          const intensity = (1 - progress) * (1 + flash * 0.3);
          colors[i3] = shockwaves.colors[i3] * intensity;
          colors[i3 + 1] = shockwaves.colors[i3 + 1] * intensity;
          colors[i3 + 2] = shockwaves.colors[i3 + 2] * intensity;
        } else {
          sizes[i] = 0;
        }
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.size.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
    }

    // Stellar wind (post-ignition)
    if (stellarWindRef.current) {
      const geometry = stellarWindRef.current.geometry;
      const positions = geometry.attributes.position.array as Float32Array;
      const sizes = geometry.attributes.size.array as Float32Array;
      const colors = geometry.attributes.color.array as Float32Array;

      for (let i = 0; i < stellarWind.starIndex.length; i++) {
        const linkedStar = stellarWind.starIndex[i];
        const starIgnitionTime = firstStars.ignitionTime[linkedStar];
        const timeSince = time - starIgnitionTime;

        const i3 = i * 3;

        if (timeSince > 0.5 && timeSince < 8.0) {
          const starX = firstStars.positions[linkedStar * 3];
          const starY = firstStars.positions[linkedStar * 3 + 1];
          const starZ = firstStars.positions[linkedStar * 3 + 2];

          const windAge = (time * 0.5 + stellarWind.windPhase[i]) % 1.0;
          const radius = windAge * 35;

          const theta = stellarWind.windPhase[i] * Math.PI * 2;
          const phi = stellarWind.windPhase[i] * Math.PI;

          positions[i3] = starX + Math.sin(phi) * Math.cos(theta) * radius;
          positions[i3 + 1] = starY + Math.sin(phi) * Math.sin(theta) * radius;
          positions[i3 + 2] = starZ + Math.cos(phi) * radius;

          const fade = Math.sin(windAge * Math.PI);
          sizes[i] = stellarWind.sizes[i] * fade * fadeIn;

          colors[i3] = stellarWind.colors[i3] * fade;
          colors[i3 + 1] = stellarWind.colors[i3 + 1] * fade;
          colors[i3 + 2] = stellarWind.colors[i3 + 2] * fade;
        } else {
          sizes[i] = 0;
        }
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.size.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
    }

    // First stars - birth sequence
    if (firstStarsRef.current) {
      const geometry = firstStarsRef.current.geometry;
      const sizes = geometry.attributes.size.array as Float32Array;
      const colors = geometry.attributes.color.array as Float32Array;

      for (let i = 0; i < firstStars.ignitionTime.length; i++) {
        const ignitionTime = firstStars.ignitionTime[i];
        const timeSince = time - ignitionTime;

        const i3 = i * 3;

        if (timeSince < 0) {
          sizes[i] = 0;
        } else if (timeSince < 0.8) {
          // IGNITION FLASH - the moment of birth
          const flashProgress = timeSince / 0.8;
          const flash = Math.pow(flashProgress, 0.2) * Math.exp(-flashProgress * 5) * 15;

          sizes[i] = firstStars.sizes[i] * flash * fadeIn;

          // White-hot flash
          colors[i3] = 1.0;
          colors[i3 + 1] = 1.0;
          colors[i3 + 2] = 1.0;

        } else if (timeSince < 3.0) {
          // Settling into main sequence
          const settleProgress = (timeSince - 0.8) / 2.2;
          const settle = 1 - Math.exp(-settleProgress * 4);
          const pulse = Math.sin(timeSince * 10) * (1 - settle) * 0.5 + 1;

          sizes[i] = firstStars.sizes[i] * pulse * settle * fadeIn * firstStars.intensities[i];

          // Transition from white to blue
          const colorShift = settle;
          colors[i3] = firstStars.colors[i3] * colorShift + (1 - colorShift);
          colors[i3 + 1] = firstStars.colors[i3 + 1] * colorShift + (1 - colorShift);
          colors[i3 + 2] = 1.0;

        } else {
          // Stable star
          const age = timeSince - 3.0;
          const twinkle = Math.sin(time * 2 + firstStars.phases[i]) * 0.15 + 0.85;

          sizes[i] = firstStars.sizes[i] * twinkle * fadeIn * firstStars.intensities[i];

          colors[i3] = firstStars.colors[i3];
          colors[i3 + 1] = firstStars.colors[i3 + 1];
          colors[i3 + 2] = firstStars.colors[i3 + 2];
        }
      }

      geometry.attributes.size.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
    }

    if (time > 18 && !completedRef.current && onComplete) {
      completedRef.current = true;
      onComplete();
    }
  });

  if (!isVisible) return null;

  return (
    <group>
      {/* Birth clouds */}
      <points ref={birthCloudRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[birthClouds.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[birthClouds.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[birthClouds.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={4.0}
          vertexColors
          transparent
          opacity={0.6 * fadeIn}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={cloudTexture}
        />
      </points>

      {/* Accretion disks - the forming core */}
      <points ref={accretionDiskRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[accretionDisks.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[accretionDisks.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[accretionDisks.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={5.0}
          vertexColors
          transparent
          opacity={0.9 * fadeIn}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={starTexture}
        />
      </points>

      {/* Shockwaves */}
      <points ref={shockwaveRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[shockwaves.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[shockwaves.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[shockwaves.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={8.0}
          vertexColors
          transparent
          opacity={0.85 * fadeIn}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={cloudTexture}
        />
      </points>

      {/* Stellar wind */}
      <points ref={stellarWindRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[stellarWind.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[stellarWind.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[stellarWind.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={3.0}
          vertexColors
          transparent
          opacity={0.7 * fadeIn}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={cloudTexture}
        />
      </points>

      {/* First stars - THE MAIN EVENT */}
      <points ref={firstStarsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[firstStars.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[firstStars.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[firstStars.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={10.0}
          vertexColors
          transparent
          opacity={1.0 * fadeIn}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={starTexture}
        />
      </points>

      {/* Enhanced lighting */}
      <ambientLight intensity={0.1 * fadeIn} color="#d8e0ff" />
      <pointLight position={[50, 30, 40]} intensity={1.2 * fadeIn} color="#b8d0ff" distance={200} decay={2} />
      <pointLight position={[-60, 25, -30]} intensity={1.0 * fadeIn} color="#d0d8ff" distance={180} decay={2} />
      <pointLight position={[30, -40, 50]} intensity={0.9 * fadeIn} color="#c0d8ff" distance={160} decay={2} />

      <fog attach="fog" args={['#000005', 120, 350]} />
    </group>
  );
};

export default CosmicDawn;