// ENHANCED Recombination - Cinematic Physics & Visuals

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Instance, Instances } from '@react-three/drei';
import { Vector3, Color, Object3D } from 'three';
import { gsap } from 'gsap';

const PARTICLE_TYPES = {
  proton: { color: new Color('#ff3355'), radius: 0.18, charge: 1, mass: 1, glow: '#ff6688' },
  helium: { color: new Color('#ffcc00'), radius: 0.25, charge: 2, mass: 4, glow: '#ffee66' },
  electron: { color: new Color('#00eeff'), radius: 0.06, charge: -1, mass: 0.0005, glow: '#88ffff' },
};

const PROTON_COUNT = 120;
const HELIUM_COUNT = 35;
const BOX_SIZE = 18;
const TEMPERATURE_START = 3000;
const TEMPERATURE_END = 2725;
const COULOMB_K = 0.22;

interface Nucleus {
  id: number;
  type: 'proton' | 'helium';
  position: Vector3;
  velocity: Vector3;
  capturedElectrons: number;
  maxElectrons: number;
}

interface Electron {
  id: number;
  position: Vector3;
  velocity: Vector3;
  targetNucleus: number;
  orbitPhase: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitAxis: Vector3;
  orbitTilt: Vector3;
  captured: boolean;
  captureProgress: number;
  energyLevel: number;
}

export default function Recombination({
  isVisible,
  onComplete
}: {
  isVisible: boolean;
  onComplete?: () => void;
}) {
  const { camera } = useThree();
  const groupRef = useRef<any>(null);
  const nucleiRef = useRef<any>(null);
  const electronsRef = useRef<any>(null);
  const glowNucleiRef = useRef<any>(null);
  const glowElectronsRef = useRef<any>(null);
  const animationStartedRef = useRef(false);
  const temperatureRef = useRef(TEMPERATURE_START);
  const phaseRef = useRef(0);
  const timeRef = useRef(0);

  const nuclei = useMemo<Nucleus[]>(() => {
    const atoms: Nucleus[] = [];
    for (let i = 0; i < PROTON_COUNT + HELIUM_COUNT; i++) {
      const type = i < PROTON_COUNT ? 'proton' : 'helium';
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.pow(Math.random(), 0.6) * BOX_SIZE * 0.38;
      
      atoms.push({
        id: i,
        type,
        position: new Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        ),
        velocity: new Vector3(
          (Math.random() - 0.5) * 0.7,
          (Math.random() - 0.5) * 0.7,
          (Math.random() - 0.5) * 0.7
        ),
        capturedElectrons: 0,
        maxElectrons: type === 'proton' ? 1 : 2
      });
    }
    return atoms;
  }, []);

  const electrons = useMemo<Electron[]>(() => {
    const elecs: Electron[] = [];
    let electronId = 0;
    
    nuclei.forEach((nucleus, nucleusIdx) => {
      const numElectrons = nucleus.type === 'proton' ? 1 : 2;
      for (let i = 0; i < numElectrons; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 5 + Math.random() * 7;
        const orbitAxis = new Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        ).normalize();
        
        const orbitTilt = new Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        ).normalize();
        
        elecs.push({
          id: electronId++,
          position: new Vector3(
            nucleus.position.x + Math.cos(angle) * distance,
            nucleus.position.y + Math.sin(angle) * distance,
            nucleus.position.z + (Math.random() - 0.5) * distance
          ),
          velocity: new Vector3(
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5
          ),
          targetNucleus: nucleusIdx,
          orbitPhase: Math.random() * Math.PI * 2,
          orbitRadius: PARTICLE_TYPES[nucleus.type].radius + 0.4 + (i * 0.3),
          orbitSpeed: 4.0 + Math.random() * 3.0,
          orbitAxis,
          orbitTilt,
          captured: false,
          captureProgress: 0,
          energyLevel: 1.0
        });
      }
    });
    return elecs;
  }, [nuclei]);

  useEffect(() => {
    if (!isVisible || animationStartedRef.current) return;
    
    animationStartedRef.current = true;
    console.log("🌌 Starting Recombination Era - Universe becomes transparent...");
    
    const tl = gsap.timeline({
      onComplete: () => {
        console.log("✨ Recombination complete - First light can travel freely!");
        onComplete?.();
      }
    });

    // PHASE 1: Hot Chaos (0-4s)
    tl.to(camera.position, { x: -14, y: 12, z: 20, duration: 3.5, ease: 'power2.out' }, 0);
    tl.to(camera.rotation, { x: -0.5, y: -0.6, z: -0.15, duration: 3.5, ease: 'power2.out' }, 0);
    tl.to(camera, { fov: 58, duration: 3.5, ease: 'power2.out', onUpdate: () => camera.updateProjectionMatrix() }, 0);

    tl.call(() => { phaseRef.current = 1; }, [], 2.5);

    // PHASE 2: Attraction Begins (4-9s)
    tl.to(camera.position, { x: 10, y: 6, z: 16, duration: 5, ease: 'power1.inOut' }, 4);
    tl.to(camera.rotation, { x: -0.32, y: 0.5, z: 0.12, duration: 5, ease: 'power1.inOut' }, 4);
    tl.to(camera, { fov: 42, duration: 5, ease: 'power2.in', onUpdate: () => camera.updateProjectionMatrix() }, 4);

    tl.call(() => { phaseRef.current = 2; }, [], 6);

    // PHASE 3: Atom Formation (9-14s)
    tl.to(camera.position, { x: -6, y: -5, z: 18, duration: 5, ease: 'power1.inOut' }, 9);
    tl.to(camera.rotation, { x: 0.22, y: -0.32, z: -0.08, duration: 5, ease: 'power1.inOut' }, 9);
    tl.to(camera, { fov: 52, duration: 5, ease: 'sine.inOut', onUpdate: () => camera.updateProjectionMatrix() }, 9);

    // PHASE 4: Transparency Emerges (14-19s)
    tl.to(camera.position, { x: 0, y: 0, z: 24, duration: 5, ease: 'power2.inOut' }, 14);
    tl.to(camera.rotation, { x: 0, y: 0, z: 0, duration: 5, ease: 'power2.inOut' }, 14);
    tl.to(camera, { fov: 72, duration: 5, ease: 'power2.out', onUpdate: () => camera.updateProjectionMatrix() }, 14);

    tl.call(() => { phaseRef.current = 3; }, [], 15);

    // Universe rotation
    if (groupRef.current) {
      tl.to(groupRef.current.rotation, { y: Math.PI * 0.4, x: Math.PI * 0.2, duration: 7, ease: 'power1.inOut' }, 2);
      tl.to(groupRef.current.rotation, { y: Math.PI * 0.8, x: -Math.PI * 0.15, duration: 6, ease: 'power1.inOut' }, 9);
      tl.to(groupRef.current.rotation, { x: 0, y: 0, duration: 4, ease: 'power2.out' }, 15);
    }

    // Temperature evolution
    tl.to(temperatureRef, { current: TEMPERATURE_END, duration: 19, ease: 'power1.out' }, 0);

  }, [isVisible, camera, onComplete]);

  useFrame((state, delta) => {
    if (!isVisible || !nucleiRef.current || !electronsRef.current) return;

    const time = state.clock.elapsedTime;
    timeRef.current = time;
    const dummy = new Object3D();
    const phase = phaseRef.current;
    const temp = temperatureRef.current;
    const coolingFactor = (temp - TEMPERATURE_END) / (TEMPERATURE_START - TEMPERATURE_END);

    // Update nuclei
    nuclei.forEach((nucleus, i) => {
      if (phase < 3) {
        const thermalV = Math.sqrt(temp / 1000) * 0.014;
        nucleus.velocity.x += (Math.random() - 0.5) * thermalV;
        nucleus.velocity.y += (Math.random() - 0.5) * thermalV;
        nucleus.velocity.z += (Math.random() - 0.5) * thermalV;
        nucleus.velocity.multiplyScalar(0.983);
        nucleus.position.add(nucleus.velocity.clone().multiplyScalar(delta));

        const dist = nucleus.position.length();
        if (dist > BOX_SIZE * 0.47) {
          const force = nucleus.position.clone().normalize().multiplyScalar(-0.025);
          nucleus.velocity.add(force);
        }
      }

      // Render nucleus
      dummy.position.copy(nucleus.position);
      const completionGlow = (nucleus.capturedElectrons / nucleus.maxElectrons);
      const breathe = 1 + Math.sin(time * 2.2 + i * 0.8) * (0.15 - completionGlow * 0.08);
      const scale = PARTICLE_TYPES[nucleus.type].radius * breathe * (1 + completionGlow * 0.2);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      nucleiRef.current.setMatrixAt(i, dummy.matrix);

      // Glow layer
      dummy.scale.setScalar(scale * (1.9 + completionGlow * 0.3));
      dummy.updateMatrix();
      glowNucleiRef.current.setMatrixAt(i, dummy.matrix);
    });
    nucleiRef.current.instanceMatrix.needsUpdate = true;
    glowNucleiRef.current.instanceMatrix.needsUpdate = true;

    // Update electrons
    electrons.forEach((electron, i) => {
      const nucleus = nuclei[electron.targetNucleus];
      
      if (!electron.captured && phase >= 1) {
        // Free electron thermal motion
        const thermalV = Math.sqrt(temp / 120) * 0.028;
        electron.velocity.x += (Math.random() - 0.5) * thermalV;
        electron.velocity.y += (Math.random() - 0.5) * thermalV;
        electron.velocity.z += (Math.random() - 0.5) * thermalV;
        
        // Coulomb attraction
        const toNucleus = nucleus.position.clone().sub(electron.position);
        const distance = toNucleus.length();
        
        if (distance < 10) {
          const charge = PARTICLE_TYPES[nucleus.type].charge;
          const forceMag = (COULOMB_K * charge) / (distance * distance + 0.18);
          const coolingEffect = 1 - coolingFactor * 0.7;
          const force = toNucleus.normalize().multiplyScalar(forceMag * coolingEffect);
          electron.velocity.add(force);
          
          // Capture mechanics
          const captureThreshold = electron.orbitRadius * (2.0 - coolingFactor * 0.6);
          if (distance < captureThreshold && phase >= 2 && nucleus.capturedElectrons < nucleus.maxElectrons) {
            electron.captured = true;
            electron.captureProgress = 0;
            nucleus.capturedElectrons++;
            electron.energyLevel = 1.5;
          }
        }
        
        electron.velocity.multiplyScalar(0.972);
        electron.position.add(electron.velocity.clone().multiplyScalar(delta));

        const dist = electron.position.length();
        if (dist > BOX_SIZE * 0.65) {
          const bounce = electron.position.clone().normalize().multiplyScalar(-0.06);
          electron.velocity.add(bounce);
        }
      } else if (electron.captured || phase >= 3) {
        // Captured electron orbital motion
        if (!electron.captured) {
          electron.captured = true;
          electron.captureProgress = 0;
        }
        
        electron.captureProgress = Math.min(1, electron.captureProgress + delta * 0.8);
        electron.energyLevel = Math.max(0.3, electron.energyLevel - delta * 0.3);
        
        electron.orbitPhase += electron.orbitSpeed * delta * (1 + coolingFactor * 0.4);
        
        // 3D orbital with precession
        const axis = electron.orbitAxis;
        const tilt = electron.orbitTilt;
        const precession = time * 0.3 + i * 0.4;
        const wobble = Math.sin(time * 0.6 + i * 0.6) * 0.25;
        
        const perpAxis = new Vector3().crossVectors(axis, tilt).normalize();
        
        const radiusMod = electron.orbitRadius * (1 + electron.energyLevel * 0.2);
        const offsetX = Math.cos(electron.orbitPhase) * radiusMod;
        const offsetY = Math.sin(electron.orbitPhase) * radiusMod;
        const offsetZ = Math.sin(electron.orbitPhase * 2 + precession) * radiusMod * 0.3;
        
        const orbitPos = new Vector3()
          .addScaledVector(perpAxis, offsetX)
          .addScaledVector(axis, offsetY * (0.65 + wobble))
          .addScaledVector(tilt, offsetZ);
        
        const targetPos = nucleus.position.clone().add(orbitPos);
        electron.position.lerp(targetPos, 0.15 * electron.captureProgress);
      }

      // Render electron
      dummy.position.copy(electron.position);
      const energyPulse = 1 + Math.sin(time * 14 + i * 0.5) * (0.4 * electron.energyLevel);
      const captureScale = electron.captured ? (1.2 + electron.captureProgress * 0.2) : 0.8;
      const scale = PARTICLE_TYPES.electron.radius * energyPulse * captureScale;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      electronsRef.current.setMatrixAt(i, dummy.matrix);

      // Glow layer
      const glowIntensity = electron.captured ? (2.8 + electron.energyLevel * 0.8) : 2.3;
      dummy.scale.setScalar(scale * glowIntensity);
      dummy.updateMatrix();
      glowElectronsRef.current.setMatrixAt(i, dummy.matrix);
    });
    electronsRef.current.instanceMatrix.needsUpdate = true;
    glowElectronsRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!isVisible) return null;

  return (
    <group ref={groupRef}>
      {/* Nuclei - Main */}
      <Instances ref={nucleiRef} limit={nuclei.length} range={nuclei.length}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          emissive={PARTICLE_TYPES.proton.color}
          emissiveIntensity={0.9}
          roughness={0.12}
          metalness={0.6}
        />
        {nuclei.map((n) => (
          <Instance key={n.id} position={n.position} color={PARTICLE_TYPES[n.type].color} />
        ))}
      </Instances>

      {/* Nuclei - Glow */}
      <Instances ref={glowNucleiRef} limit={nuclei.length} range={nuclei.length}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial transparent opacity={0.35} depthWrite={false} blending={2} />
        {nuclei.map((n) => (
          <Instance key={`glow-${n.id}`} position={n.position} color={PARTICLE_TYPES[n.type].glow} />
        ))}
      </Instances>

      {/* Electrons - Main */}
      <Instances ref={electronsRef} limit={electrons.length} range={electrons.length}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial
          color={PARTICLE_TYPES.electron.color}
          emissive={PARTICLE_TYPES.electron.color}
          emissiveIntensity={2.2}
          roughness={0}
          metalness={1}
          toneMapped={false}
        />
        {electrons.map((e) => (
          <Instance key={e.id} position={e.position} />
        ))}
      </Instances>

      {/* Electrons - Glow */}
      <Instances ref={glowElectronsRef} limit={electrons.length} range={electrons.length}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial
          color={PARTICLE_TYPES.electron.glow}
          transparent
          opacity={0.45}
          depthWrite={false}
          blending={2}
        />
        {electrons.map((e) => (
          <Instance key={`glow-${e.id}`} position={e.position} />
        ))}
      </Instances>

      {/* Enhanced Lighting */}
      <ambientLight intensity={0.55} color="#fff9f2" />
      <pointLight position={[22, 22, 22]} intensity={3.5} color="#ffb588" distance={45} decay={2} />
      <pointLight position={[-22, -22, -22]} intensity={3} color="#88bbff" distance={45} decay={2} />
      <pointLight position={[0, 28, 0]} intensity={4} color="#ffffff" distance={40} decay={2} />
      <pointLight position={[18, -18, 18]} intensity={2.5} color="#ff99bb" distance={35} decay={2} />
      <pointLight position={[-15, 20, -15]} intensity={2.8} color="#99ddff" distance={38} decay={2} />
      <hemisphereLight intensity={0.7} color="#b5e5ff" groundColor="#3a2050" />
      <spotLight position={[0, 35, 0]} angle={0.45} penumbra={1} intensity={2.5} color="#fffffa" distance={55} decay={2} />
      <spotLight position={[25, 15, -20]} angle={0.5} penumbra={0.8} intensity={2} color="#ffd5aa" distance={50} decay={2} />
    </group>
  );
}