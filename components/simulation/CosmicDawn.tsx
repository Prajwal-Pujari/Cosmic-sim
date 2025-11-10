import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';

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
  const cosmicDebrisRef = useRef<THREE.Points>(null!);
  const energyRipplesRef = useRef<THREE.Points>(null!);
  const deepSpaceRef = useRef<THREE.Points>(null!);

  const timeRef = useRef(0);
  const completedRef = useRef(false);
  const { camera } = useThree();

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

  // First stars data - INCREASED COUNT
  const firstStars = useMemo(() => {
    const count = 300;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const ignitionTime = new Float32Array(count);
    const intensities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Create clusters spread across wider space
      const clusterCenter = Math.floor(Math.random() * 10);
      const clusterX = (clusterCenter % 4 - 1.5) * 120;
      const clusterY = ((Math.floor(clusterCenter / 4) % 3) - 1) * 80;
      const clusterZ = (Math.floor(clusterCenter / 12) - 0.5) * 90;

      const localRadius = 15 + Math.random() * 45;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = clusterX + localRadius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = clusterY + localRadius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = clusterZ + localRadius * Math.cos(phi);

      // Diabolical star colors - crimson, violet, electric blue
      const starType = Math.random();
      if (starType > 0.8) {
        // Blood-red supergiants
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.15;
        colors[i3 + 2] = 0.25;
        intensities[i] = 3.5 + Math.random() * 2.0;
      } else if (starType > 0.6) {
        // Electric violet
        colors[i3] = 0.85;
        colors[i3 + 1] = 0.3;
        colors[i3 + 2] = 1.0;
        intensities[i] = 3.0 + Math.random() * 1.8;
      } else if (starType > 0.35) {
        // Sickly green-white
        colors[i3] = 0.6;
        colors[i3 + 1] = 1.0;
        colors[i3 + 2] = 0.7;
        intensities[i] = 2.5 + Math.random() * 1.5;
      } else {
        // Deep cyan-blue
        colors[i3] = 0.3;
        colors[i3 + 1] = 0.7;
        colors[i3 + 2] = 1.0;
        intensities[i] = 2.8 + Math.random() * 1.6;
      }

      sizes[i] = (10.0 + Math.random() * 16.0) * intensities[i];
      phases[i] = Math.random() * Math.PI * 2;

      // Staggered ignition times
      const sequence = i / count;
      ignitionTime[i] = sequence * 18.0 + (Math.random() - 0.5) * 2.5;
    }
    return { positions, colors, sizes, phases, ignitionTime, intensities };
  }, []);

  // Birth clouds - INCREASED
  const birthClouds = useMemo(() => {
    const count = 25000;
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

      const cloudRadius = 8 + Math.random() * 28;
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
      // Dark crimson and purple clouds
      colors[i3] = 0.2 + density * 0.3;
      colors[i3 + 1] = 0.08 + density * 0.15;
      colors[i3 + 2] = 0.25 + density * 0.4;

      sizes[i] = 2.5 + Math.random() * 6.0;
    }
    return { positions, colors, sizes, starIndex, originalOffsets };
  }, [firstStars.positions]);

  // Accretion disks - INCREASED
  const accretionDisks = useMemo(() => {
    const count = 15000;
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

      // Molten core colors - orange, red, white-hot
      const heat = Math.random();
      colors[i3] = 0.95 + heat * 0.05;
      colors[i3 + 1] = 0.4 + heat * 0.4;
      colors[i3 + 2] = 0.2 + heat * 0.3;

      sizes[i] = 3.0 + Math.random() * 7.0;
    }
    return { positions, colors, sizes, starIndex, diskAngle };
  }, [firstStars.positions]);

  // Shockwaves - INCREASED
  const shockwaves = useMemo(() => {
    const count = 8000;
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

      // Violent shockwave colors
      const shockType = Math.random();
      if (shockType > 0.6) {
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.3;
        colors[i3 + 2] = 0.4;
      } else {
        colors[i3] = 0.8;
        colors[i3 + 1] = 0.9;
        colors[i3 + 2] = 1.0;
      }

      sizes[i] = 4.0 + Math.random() * 10.0;
    }
    return { positions, colors, sizes, starIndex, ejectionVector };
  }, [firstStars.positions]);

  // Stellar wind - INCREASED
  const stellarWind = useMemo(() => {
    const count = 12000;
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
      colors[i3 + 1] = 0.5 + Math.random() * 0.4;
      colors[i3 + 2] = 0.9 + Math.random() * 0.1;

      sizes[i] = 2.0 + Math.random() * 5.0;
    }
    return { positions, colors, sizes, starIndex, windPhase };
  }, [firstStars.positions]);

  // NEW: Cosmic debris field
  const cosmicDebris = useMemo(() => {
    const count = 15000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 50 + Math.random() * 250;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const debris = Math.random();
      colors[i3] = 0.15 + debris * 0.25;
      colors[i3 + 1] = 0.08 + debris * 0.15;
      colors[i3 + 2] = 0.2 + debris * 0.3;

      sizes[i] = 1.0 + Math.random() * 3.5;
    }
    return { positions, colors, sizes };
  }, []);

  // NEW: Energy ripples
  const energyRipples = useMemo(() => {
    const count = 8000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 100 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const energy = Math.random();
      colors[i3] = 0.3 + energy * 0.4;
      colors[i3 + 1] = 0.5 + energy * 0.3;
      colors[i3 + 2] = 0.8 + energy * 0.2;

      sizes[i] = 2.0 + Math.random() * 5.0;
    }
    return { positions, colors, sizes };
  }, []);

  // NEW: Deep space background
  const deepSpace = useMemo(() => {
    const count = 12000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 400 + Math.random() * 600;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const dim = Math.random() * 0.04;
      colors[i3] = 0.03 + dim;
      colors[i3 + 1] = 0.02 + dim * 0.8;
      colors[i3 + 2] = 0.05 + dim * 1.2;

      sizes[i] = 0.3 + Math.random() * 1.2;
    }
    return { positions, colors, sizes };
  }, []);

  useFrame((_, delta) => {
    if (!isVisible) return;

    const cappedDelta = Math.min(delta, 0.1);
    timeRef.current += cappedDelta;
    const time = timeRef.current;

    // Rotate deep space slowly
    if (deepSpaceRef.current) {
      deepSpaceRef.current.rotation.y += cappedDelta * 0.0008;
      deepSpaceRef.current.rotation.x -= cappedDelta * 0.0004;
    }

    // Rotate cosmic debris
    if (cosmicDebrisRef.current) {
      cosmicDebrisRef.current.rotation.y -= cappedDelta * 0.003;
      cosmicDebrisRef.current.rotation.z += cappedDelta * 0.001;
    }

    // Pulse energy ripples
    if (energyRipplesRef.current) {
      energyRipplesRef.current.rotation.y += cappedDelta * 0.005;
      const pulse = Math.sin(time * 0.3) * 0.06 + 0.94;
      energyRipplesRef.current.scale.setScalar(pulse);
    }

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
          const drift = Math.sin(time * 0.15 + i * 0.1) * 0.5;
          positions[i3] = starX + dx + drift;
          positions[i3 + 1] = starY + dy + drift * 0.7;
          positions[i3 + 2] = starZ + dz + drift * 0.5;
          sizes[i] = birthClouds.sizes[i] * 0.9 * fadeIn;

        } else if (time >= collapseStartTime && time < starIgnitionTime) {
          const collapseProgress = (time - collapseStartTime) / 4.0;
          const collapseFactor = Math.pow(1.0 - collapseProgress, 2.5);

          const swirlSpeed = Math.pow(collapseProgress, 2.0) * 10.0;
          const angle = time * swirlSpeed;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1.0;
          
          const swirlX = Math.cos(angle) * dx - Math.sin(angle) * dy;
          const swirlY = Math.sin(angle) * dx + Math.cos(angle) * dy;

          positions[i3] = starX + swirlX * collapseFactor;
          positions[i3 + 1] = starY + swirlY * collapseFactor;
          positions[i3 + 2] = starZ + dz * collapseFactor;

          sizes[i] = birthClouds.sizes[i] * (collapseFactor * 0.7 + 0.3) * fadeIn;

          const heat = collapseProgress;
          colors[i3] = birthClouds.colors[i3] * (1 + heat * 4.0);
          colors[i3 + 1] = birthClouds.colors[i3 + 1] * (1 + heat * 2.5);
          colors[i3 + 2] = birthClouds.colors[i3 + 2] * (1 + heat * 0.8);

        } else {
          const blowTime = time - starIgnitionTime;
          const blowFactor = Math.min(1, blowTime * 0.4);
          const speed = 1 + blowFactor * 15;

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

    // Accretion disk
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
          const diskProgress = (time - diskStartTime) / 2.5;
          const radius = 6 * (1 - diskProgress * 0.6);
          const angle = accretionDisks.diskAngle[i] + time * 2.5;

          positions[i3] = starX + Math.cos(angle) * radius;
          positions[i3 + 1] = starY + Math.sin(angle) * radius * 0.3;
          positions[i3 + 2] = starZ + Math.sin(angle) * radius;

          sizes[i] = accretionDisks.sizes[i] * (1 + diskProgress * 1.5) * fadeIn;

          const glow = diskProgress * 2.5;
          colors[i3] = accretionDisks.colors[i3] * (1 + glow);
          colors[i3 + 1] = accretionDisks.colors[i3 + 1] * (1 + glow * 0.8);
          colors[i3 + 2] = accretionDisks.colors[i3 + 2] * (1 + glow * 0.5);

        } else if (time >= starIgnitionTime && time < starIgnitionTime + 1.2) {
          const flashTime = time - starIgnitionTime;
          const flashFade = 1 - flashTime / 1.2;
          
          positions[i3] = starX;
          positions[i3 + 1] = starY;
          positions[i3 + 2] = starZ;

          sizes[i] = accretionDisks.sizes[i] * (4 + flashTime * 8) * flashFade * fadeIn;
          
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

        if (timeSince >= 0 && timeSince < 5.0) {
          const progress = timeSince / 5.0;
          const radius = Math.pow(progress, 0.6) * 70;

          const vx = shockwaves.ejectionVector[i3];
          const vy = shockwaves.ejectionVector[i3 + 1];
          const vz = shockwaves.ejectionVector[i3 + 2];

          positions[i3] = starX + vx * radius;
          positions[i3 + 1] = starY + vy * radius;
          positions[i3 + 2] = starZ + vz * radius;

          const flash = Math.exp(-progress * 5) * 10;
          sizes[i] = shockwaves.sizes[i] * (1 + flash) * (1 - progress * 0.7) * fadeIn;

          const intensity = (1 - progress) * (1 + flash * 0.4);
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

    // Stellar wind
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

        if (timeSince > 0.5 && timeSince < 10.0) {
          const starX = firstStars.positions[linkedStar * 3];
          const starY = firstStars.positions[linkedStar * 3 + 1];
          const starZ = firstStars.positions[linkedStar * 3 + 2];

          const windAge = (time * 0.5 + stellarWind.windPhase[i]) % 1.0;
          const radius = windAge * 45;

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
          const flash = Math.pow(flashProgress, 0.2) * Math.exp(-flashProgress * 5) * 20;

          sizes[i] = firstStars.sizes[i] * flash * fadeIn;

          // White-hot flash
          colors[i3] = 1.0;
          colors[i3 + 1] = 1.0;
          colors[i3 + 2] = 1.0;

        } else if (timeSince < 3.5) {
          // Settling into main sequence
          const settleProgress = (timeSince - 0.8) / 2.7;
          const settle = 1 - Math.exp(-settleProgress * 4);
          const pulse = Math.sin(timeSince * 12) * (1 - settle) * 0.6 + 1;

          sizes[i] = firstStars.sizes[i] * pulse * settle * fadeIn * firstStars.intensities[i];

          // Transition from white to star color
          const colorShift = settle;
          colors[i3] = firstStars.colors[i3] * colorShift + (1 - colorShift);
          colors[i3 + 1] = firstStars.colors[i3 + 1] * colorShift + (1 - colorShift);
          colors[i3 + 2] = firstStars.colors[i3 + 2] * colorShift + (1 - colorShift);

        } else {
          // Stable star with dramatic twinkling
          const age = timeSince - 3.5;
          const twinkle = Math.sin(time * 2.5 + firstStars.phases[i]) * 0.2 + 0.8;
          const breathe = Math.sin(time * 0.8 + firstStars.phases[i] * 0.5) * 0.15 + 0.85;

          sizes[i] = firstStars.sizes[i] * twinkle * breathe * fadeIn * firstStars.intensities[i];

          colors[i3] = firstStars.colors[i3];
          colors[i3 + 1] = firstStars.colors[i3 + 1];
          colors[i3 + 2] = firstStars.colors[i3 + 2];
        }
      }

      geometry.attributes.size.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
    }

    if (time > 20 && !completedRef.current && onComplete) {
      completedRef.current = true;
      onComplete();
    }
  });

  if (!isVisible) return null;

  return (
    <group>
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.2}
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
        rotateSpeed={0.5}
        minDistance={10}
        maxDistance={800}
        panSpeed={2.0}
      />

      {/* Deep space background - infinite depth */}
      <points ref={deepSpaceRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[deepSpace.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[deepSpace.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[deepSpace.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.8}
          vertexColors
          transparent
          opacity={0.3 * fadeIn}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={cloudTexture}
        />
      </points>

      {/* Cosmic debris field */}
      <points ref={cosmicDebrisRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[cosmicDebris.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[cosmicDebris.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[cosmicDebris.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={2.5}
          vertexColors
          transparent
          opacity={0.4 * fadeIn}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={cloudTexture}
        />
      </points>

      {/* Energy ripples */}
      <points ref={energyRipplesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[energyRipples.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[energyRipples.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[energyRipples.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={4.0}
          vertexColors
          transparent
          opacity={0.35 * fadeIn}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={cloudTexture}
        />
      </points>

      {/* Birth clouds */}
      <points ref={birthCloudRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[birthClouds.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[birthClouds.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[birthClouds.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={5.0}
          vertexColors
          transparent
          opacity={0.65 * fadeIn}
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
          size={6.0}
          vertexColors
          transparent
          opacity={0.95 * fadeIn}
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
          size={10.0}
          vertexColors
          transparent
          opacity={0.9 * fadeIn}
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
          size={4.0}
          vertexColors
          transparent
          opacity={0.75 * fadeIn}
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
          size={12.0}
          vertexColors
          transparent
          opacity={1.0 * fadeIn}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={starTexture}
        />
      </points>

      {/* Enhanced dramatic lighting */}
      <ambientLight intensity={0.08 * fadeIn} color="#1a1520" />
      <pointLight position={[80, 50, 60]} intensity={1.8 * fadeIn} color="#ff3366" distance={250} decay={2} />
      <pointLight position={[-90, 40, -50]} intensity={1.5 * fadeIn} color="#6633ff" distance={220} decay={2} />
      <pointLight position={[50, -60, 80]} intensity={1.3 * fadeIn} color="#33ff88" distance={200} decay={2} />
      <pointLight position={[-40, 70, -70]} intensity={1.0 * fadeIn} color="#3388ff" distance={180} decay={2} />

      <fog attach="fog" args={['#000008', 150, 500]} />
    </group>
  );
};

export default CosmicDawn;
