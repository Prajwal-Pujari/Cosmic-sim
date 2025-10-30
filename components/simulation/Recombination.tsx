// Optimized Recombination with stunning visuals and physics accuracy

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Instance, Instances } from '@react-three/drei';
import { Vector3, Color, Object3D, MathUtils } from 'three';
import { gsap } from 'gsap';

const PARTICLE_TYPES = {
  proton: { color: new Color('#ff4444'), radius: 0.15, charge: 1, mass: 1 },
  helium: { color: new Color('#ffbb00'), radius: 0.22, charge: 2, mass: 4 },
  electron: { color: new Color('#00ddff'), radius: 0.05, charge: -1, mass: 0.0005 },
};

const PROTON_COUNT = 100;
const HELIUM_COUNT = 30;
const BOX_SIZE = 14;
const TEMPERATURE_INITIAL = 3000; // Kelvin
const COULOMB_CONSTANT = 0.15;

interface Nucleus {
  id: number;
  type: 'proton' | 'helium';
  position: Vector3;
  velocity: Vector3;
}

interface Electron {
  id: number;
  position: Vector3;
  velocity: Vector3;
  targetNucleus: number;
  orbitPhase: number;
  orbitRadius: number;
  orbitSpeed: number;
  captured: boolean;
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
  const animationStartedRef = useRef(false);
  const temperatureRef = useRef(TEMPERATURE_INITIAL);
  const phaseRef = useRef(0);

  const nuclei = useMemo<Nucleus[]>(() => {
    const atoms: Nucleus[] = [];
    for (let i = 0; i < PROTON_COUNT + HELIUM_COUNT; i++) {
      const type = i < PROTON_COUNT ? 'proton' : 'helium';
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.random() * BOX_SIZE * 0.4;
      
      atoms.push({
        id: i,
        type,
        position: new Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        ),
        velocity: new Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        )
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
        const distance = 3 + Math.random() * 5;
        elecs.push({
          id: electronId++,
          position: new Vector3(
            nucleus.position.x + Math.cos(angle) * distance,
            nucleus.position.y + Math.sin(angle) * distance,
            nucleus.position.z + (Math.random() - 0.5) * distance
          ),
          velocity: new Vector3(
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 3
          ),
          targetNucleus: nucleusIdx,
          orbitPhase: Math.random() * Math.PI * 2,
          orbitRadius: PARTICLE_TYPES[nucleus.type].radius + 0.3 + (i * 0.2),
          orbitSpeed: 3.0 + Math.random() * 2.0,
          captured: false
        });
      }
    });
    return elecs;
  }, [nuclei]);

  useEffect(() => {
    if (!isVisible || animationStartedRef.current) return;
    
    animationStartedRef.current = true;
    console.log("Starting Recombination sequence...");
    
    const tl = gsap.timeline({
      onComplete: () => {
        console.log("Recombination complete.");
        onComplete?.();
      }
    });

    // Cinematic camera journey
    tl.to(camera.position, { x: -10, y: 8, z: 16, duration: 2.5, ease: 'power2.out' }, 0);
    tl.to(camera.rotation, { x: -0.4, y: -0.5, z: -0.1, duration: 2.5, ease: 'power2.out' }, 0);
    tl.to(camera, { fov: 60, duration: 2.5, ease: 'power2.out', onUpdate: () => camera.updateProjectionMatrix() }, 0);

    tl.call(() => { phaseRef.current = 1; }, [], 1.5);

    tl.to(camera.position, { x: 7, y: 4, z: 12, duration: 3.5, ease: 'power1.inOut' }, 3);
    tl.to(camera.rotation, { x: -0.25, y: 0.4, z: 0.08, duration: 3.5, ease: 'power1.inOut' }, 3);
    tl.to(camera, { fov: 45, duration: 3.5, ease: 'power2.in', onUpdate: () => camera.updateProjectionMatrix() }, 3);

    tl.call(() => { phaseRef.current = 2; }, [], 4);

    tl.to(camera.position, { x: -4, y: -3, z: 14, duration: 3.5, ease: 'power1.inOut' }, 6.5);
    tl.to(camera.rotation, { x: 0.15, y: -0.25, z: -0.05, duration: 3.5, ease: 'power1.inOut' }, 6.5);

    tl.to(camera.position, { x: 0, y: 0, z: 18, duration: 3, ease: 'power2.inOut' }, 10);
    tl.to(camera.rotation, { x: 0, y: 0, z: 0, duration: 3, ease: 'power2.inOut' }, 10);
    tl.to(camera, { fov: 65, duration: 3, ease: 'power2.out', onUpdate: () => camera.updateProjectionMatrix() }, 10);

    tl.call(() => { phaseRef.current = 3; }, [], 10.5);

    if (groupRef.current) {
      tl.to(groupRef.current.rotation, { y: Math.PI * 0.3, x: Math.PI * 0.15, duration: 5, ease: 'power1.inOut' }, 2);
      tl.to(groupRef.current.rotation, { y: Math.PI * 0.6, x: -Math.PI * 0.1, duration: 5, ease: 'power1.inOut' }, 7);
      tl.to(groupRef.current.rotation, { x: 0, y: 0, duration: 3, ease: 'power2.out' }, 11);
    }

    tl.to(temperatureRef, { current: 300, duration: 12, ease: 'power2.inOut' }, 0);

  }, [isVisible, camera, onComplete]);

  useFrame((state, delta) => {
    if (!isVisible || !nucleiRef.current || !electronsRef.current) return;

    const time = state.clock.elapsedTime;
    const dummy = new Object3D();
    const phase = phaseRef.current;
    const temp = temperatureRef.current;
    const coolingFactor = temp / TEMPERATURE_INITIAL;

    // Update nuclei
    nuclei.forEach((nucleus, i) => {
      if (phase < 2) {
        const thermalVelocity = Math.sqrt(temp / 1000) * 0.01;
        nucleus.velocity.x += (Math.random() - 0.5) * thermalVelocity;
        nucleus.velocity.y += (Math.random() - 0.5) * thermalVelocity;
        nucleus.velocity.z += (Math.random() - 0.5) * thermalVelocity;
        nucleus.velocity.multiplyScalar(0.99);
        nucleus.position.add(nucleus.velocity.clone().multiplyScalar(delta));

        if (nucleus.position.length() > BOX_SIZE * 0.5) {
          nucleus.velocity.multiplyScalar(-0.3);
        }
      }

      dummy.position.copy(nucleus.position);
      const glow = 1 + Math.sin(time * 2 + i * 0.5) * 0.15;
      dummy.scale.setScalar(PARTICLE_TYPES[nucleus.type].radius * glow);
      dummy.updateMatrix();
      nucleiRef.current.setMatrixAt(i, dummy.matrix);
    });
    nucleiRef.current.instanceMatrix.needsUpdate = true;

    // Update electrons with Coulomb physics
    electrons.forEach((electron, i) => {
      const nucleus = nuclei[electron.targetNucleus];
      
      if (phase === 0 || (phase === 1 && !electron.captured)) {
        // Free electron motion with thermal energy
        const thermalSpeed = Math.sqrt(temp / 100) * 0.02;
        electron.velocity.x += (Math.random() - 0.5) * thermalSpeed;
        electron.velocity.y += (Math.random() - 0.5) * thermalSpeed;
        electron.velocity.z += (Math.random() - 0.5) * thermalSpeed;
        
        // Coulomb attraction
        const toNucleus = nucleus.position.clone().sub(electron.position);
        const distance = toNucleus.length();
        
        if (phase === 1 && distance < 5) {
          const forceMagnitude = (COULOMB_CONSTANT * PARTICLE_TYPES[nucleus.type].charge) / (distance * distance + 0.1);
          const force = toNucleus.normalize().multiplyScalar(forceMagnitude * (1 - coolingFactor * 0.5));
          electron.velocity.add(force);
          
          if (distance < electron.orbitRadius * 1.5) {
            electron.captured = true;
          }
        }
        
        electron.velocity.multiplyScalar(0.98);
        electron.position.add(electron.velocity.clone().multiplyScalar(delta));

        if (electron.position.length() > BOX_SIZE * 0.6) {
          electron.velocity.multiplyScalar(-0.4);
        }
      } else if (electron.captured || phase >= 2) {
        // Orbital mechanics
        electron.orbitPhase += electron.orbitSpeed * delta * (1 + coolingFactor * 0.5);
        
        const inclination = Math.sin(time * 0.5 + i) * 0.3;
        const offsetX = Math.cos(electron.orbitPhase) * electron.orbitRadius;
        const offsetY = Math.sin(electron.orbitPhase) * electron.orbitRadius * Math.cos(inclination);
        const offsetZ = Math.sin(electron.orbitPhase) * electron.orbitRadius * Math.sin(inclination);
        
        electron.position.set(
          nucleus.position.x + offsetX,
          nucleus.position.y + offsetY,
          nucleus.position.z + offsetZ
        );
      }

      dummy.position.copy(electron.position);
      const pulse = 1 + Math.sin(time * 10 + i * 0.3) * 0.3;
      const trailEffect = electron.captured ? 1.2 : 0.8;
      dummy.scale.setScalar(PARTICLE_TYPES.electron.radius * pulse * trailEffect);
      dummy.updateMatrix();
      electronsRef.current.setMatrixAt(i, dummy.matrix);
    });
    electronsRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!isVisible) return null;

  return (
    <group ref={groupRef}>
      <Instances ref={nucleiRef} limit={nuclei.length} range={nuclei.length}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial
          emissive={PARTICLE_TYPES.proton.color}
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.4}
        />
        {nuclei.map((nucleus) => (
          <Instance
            key={nucleus.id}
            position={nucleus.position}
            color={PARTICLE_TYPES[nucleus.type].color}
          />
        ))}
      </Instances>

      <Instances ref={electronsRef} limit={electrons.length} range={electrons.length}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={PARTICLE_TYPES.electron.color}
          emissive={PARTICLE_TYPES.electron.color}
          emissiveIntensity={1.5}
          roughness={0}
          metalness={1}
          toneMapped={false}
        />
        {electrons.map((electron) => (
          <Instance key={electron.id} position={electron.position} />
        ))}
      </Instances>

      <ambientLight intensity={0.4} color="#fff5e6" />
      <pointLight position={[15, 15, 15]} intensity={2} color="#ffaa66" distance={30} decay={2} />
      <pointLight position={[-15, -15, -15]} intensity={1.8} color="#6699ff" distance={30} decay={2} />
      <pointLight position={[0, 20, 0]} intensity={2.5} color="#ffffff" distance={25} decay={2} />
      <hemisphereLight intensity={0.5} color="#87ceeb" groundColor="#1a1a2e" />
    </group>
  );
}