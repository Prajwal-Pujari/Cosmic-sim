// components/simulation/FirstLight.tsx
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Define the boundaries for the particle stream
const STREAM_WIDTH = 80; // Total width in X-axis (e.g., -40 to 40)
const STREAM_HEIGHT = 50; // Total height in Y-axis
const STREAM_DEPTH = 50;  // Total depth in Z-axis
const STREAM_START_X = -STREAM_WIDTH / 2;
const STREAM_END_X = STREAM_WIDTH / 2;

export default function FirstLight({
  isVisible,
  intensity = 1.0,
}: {
  isVisible: boolean;
  intensity?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null!);
  const lightRaysRef = useRef<THREE.Points>(null!);
  const glowRef = useRef<THREE.Points>(null!);

  // --- Particle Data ---
  // All three systems (photons, rays, glow) are now streams.

  const { photons, photonVelocities } = useMemo(() => {
    const positions = new Float32Array(8000 * 3);
    const velocities = new Float32Array(8000 * 3);
    const colors = new Float32Array(8000 * 3);
    const sizes = new Float32Array(8000);

    for (let i = 0; i < 8000; i++) {
      const i3 = i * 3;

      // Start in a "curtain" on the left side
      positions[i3] = STREAM_START_X - Math.random() * 20; // Start just off-screen left
      positions[i3 + 1] = (Math.random() - 0.5) * STREAM_HEIGHT;
      positions[i3 + 2] = (Math.random() - 0.5) * STREAM_DEPTH;

      // Velocity: Slow movement from left-to-right
      velocities[i3] = 1.5 + Math.random() * 2.0; // Speed in +X direction
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.05; // Gentle Y drift
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.05; // Gentle Z drift

      // Colors (CMB-inspired, as before)
      const colorChoice = Math.random();
      if (colorChoice < 0.3) {
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.6 + Math.random() * 0.4;
        colors[i3 + 2] = 0.2 + Math.random() * 0.3;
      } else if (colorChoice < 0.6) {
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i3 + 2] = 0.7 + Math.random() * 0.3;
      } else {
        colors[i3] = 0.3 + Math.random() * 0.4;
        colors[i3 + 1] = 0.7 + Math.random() * 0.3;
        colors[i3 + 2] = 1.0;
      }

      sizes[i] = 0.15 + Math.random() * 0.35;
    }
    return { photons: { positions, colors, sizes }, photonVelocities: velocities };
  }, []);

  const { lightRays, rayVelocities } = useMemo(() => {
    const positions = new Float32Array(3000 * 3);
    const velocities = new Float32Array(3000 * 3);
    const colors = new Float32Array(3000 * 3);
    const sizes = new Float32Array(3000);

    for (let i = 0; i < 3000; i++) {
      const i3 = i * 3;
      
      positions[i3] = STREAM_START_X - Math.random() * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * STREAM_HEIGHT;
      positions[i3 + 2] = (Math.random() - 0.5) * STREAM_DEPTH;

      // Velocity: Faster streaks
      velocities[i3] = 4.0 + Math.random() * 3.0; // Faster +X speed
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.1;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;

      // Colors (Bright, as before)
      const brightness = 0.8 + Math.random() * 0.2;
      colors[i3] = brightness;
      colors[i3 + 1] = brightness * (0.9 + Math.random() * 0.1);
      colors[i3 + 2] = brightness * (0.7 + Math.random() * 0.2);

      sizes[i] = 0.3 + Math.random() * 0.5;
    }
    return { lightRays: { positions, colors, sizes }, rayVelocities: velocities };
  }, []);

  const { glowParticles, glowVelocities } = useMemo(() => {
    const positions = new Float32Array(4000 * 3);
    const velocities = new Float32Array(4000 * 3);
    const colors = new Float32Array(4000 * 3);
    const sizes = new Float32Array(4000);

    for (let i = 0; i < 4000; i++) {
      const i3 = i * 3;

      positions[i3] = STREAM_START_X - Math.random() * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * (STREAM_HEIGHT + 10); // Wider glow
      positions[i3 + 2] = (Math.random() - 0.5) * (STREAM_DEPTH + 10); // Deeper glow

      // Velocity: Very slow ambient drift
      velocities[i3] = 0.5 + Math.random() * 0.5; // Very slow +X speed
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

      // Colors (Soft, as before)
      const hue = Math.random();
      if (hue < 0.33) {
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i3 + 2] = 0.6 + Math.random() * 0.2;
      } else if (hue < 0.66) {
        colors[i3] = 0.6 + Math.random() * 0.2;
        colors[i3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i3 + 2] = 1.0;
      } else {
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i3 + 2] = 1.0;
      }

      sizes[i] = 1.0 + Math.random() * 2.0;
    }
    return { glowParticles: { positions, colors, sizes }, glowVelocities: velocities };
  }, []);

  // --- Geometries ---
  const photonGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(photons.positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(photons.colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(photons.sizes, 1));
    return geometry;
  }, [photons]);

  const rayGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(lightRays.positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(lightRays.colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(lightRays.sizes, 1));
    return geometry;
  }, [lightRays]);

  const glowGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(glowParticles.positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(glowParticles.colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(glowParticles.sizes, 1));
    return geometry;
  }, [glowParticles]);

  // --- Animation Loop ---
  useFrame((state, delta) => {
    if (!isVisible || !pointsRef.current || !lightRaysRef.current || !glowRef.current) return;

    const photonPos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const rayPos = lightRaysRef.current.geometry.attributes.position.array as Float32Array;
    const glowPos = glowRef.current.geometry.attributes.position.array as Float32Array;

    // Animate photons
    for (let i = 0; i < 8000; i++) {
      const i3 = i * 3;
      photonPos[i3] += photonVelocities[i3] * delta;
      photonPos[i3 + 1] += photonVelocities[i3 + 1] * delta;
      photonPos[i3 + 2] += photonVelocities[i3 + 2] * delta;

      // Respawn on the left if it goes too far right
      if (photonPos[i3] > STREAM_END_X) {
        photonPos[i3] = STREAM_START_X - Math.random() * 5;
        photonPos[i3 + 1] = (Math.random() - 0.5) * STREAM_HEIGHT;
        photonPos[i3 + 2] = (Math.random() - 0.5) * STREAM_DEPTH;
      }
    }

    // Animate light rays
    for (let i = 0; i < 3000; i++) {
      const i3 = i * 3;
      rayPos[i3] += rayVelocities[i3] * delta;
      rayPos[i3 + 1] += rayVelocities[i3 + 1] * delta;
      rayPos[i3 + 2] += rayVelocities[i3 + 2] * delta;

      if (rayPos[i3] > STREAM_END_X) {
        rayPos[i3] = STREAM_START_X - Math.random() * 10;
        rayPos[i3 + 1] = (Math.random() - 0.5) * STREAM_HEIGHT;
        rayPos[i3 + 2] = (Math.random() - 0.5) * STREAM_DEPTH;
      }
    }

    // Animate glow particles
    for (let i = 0; i < 4000; i++) {
      const i3 = i * 3;
      glowPos[i3] += glowVelocities[i3] * delta;
      glowPos[i3 + 1] += glowVelocities[i3 + 1] * delta;
      glowPos[i3 + 2] += glowVelocities[i3 + 2] * delta;

      if (glowPos[i3] > STREAM_END_X) {
        glowPos[i3] = STREAM_START_X - Math.random() * 2;
        glowPos[i3 + 1] = (Math.random() - 0.5) * (STREAM_HEIGHT + 10);
        glowPos[i3 + 2] = (Math.random() - 0.5) * (STREAM_DEPTH + 10);
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    lightRaysRef.current.geometry.attributes.position.needsUpdate = true;
    glowRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Internal rotations are removed - camera will handle the movement.
  });

  if (!isVisible) return null;

  return (
    <group>
      {/* Main photon stream */}
      <points ref={pointsRef} geometry={photonGeometry}>
        <pointsMaterial
          size={0.5}
          vertexColors
          transparent
          opacity={0.8 * intensity}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Light rays */}
      <points ref={lightRaysRef} geometry={rayGeometry}>
        <pointsMaterial
          size={0.8}
          vertexColors
          transparent
          opacity={0.6 * intensity}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Ambient glow */}
      <points ref={glowRef} geometry={glowGeometry}>
        <pointsMaterial
          size={3.0}
          vertexColors
          transparent
          opacity={0.15 * intensity}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Point lights are removed from this component.
        It's better to place ambient/scene lighting in your main
        <Scene /> component so it can affect other objects,
        like your CMB sphere. The <pointLight>s you had
        were good, just move them up to scene.tsx if you haven't.
      */}
    </group>
  );
}