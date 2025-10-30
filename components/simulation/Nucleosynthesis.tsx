import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Color, InstancedMesh, Matrix4, Quaternion } from 'three';

// Scientifically accurate particle properties
const PARTICLE_TYPES = {
  proton: { 
    color: new Color('#ff2244'), 
    radius: 0.05,
    emissive: new Color('#ff6688'),
    glow: 0.8
  },
  neutron: { 
    color: new Color('#dddddd'), 
    radius: 0.05,
    emissive: new Color('#ffffff'),
    glow: 0.3
  },
  electron: { 
    color: new Color('#00ddff'), 
    radius: 0.02,
    emissive: new Color('#88ffff'),
    glow: 1.0
  },
  deuterium: {
    color: new Color('#ffaa22'),
    radius: 0.08,
    emissive: new Color('#ffcc66'),
    glow: 0.6
  },
  tritium: {
    color: new Color('#ff8833'),
    radius: 0.09,
    emissive: new Color('#ffaa55'),
    glow: 0.7
  },
  helium3: {
    color: new Color('#6699ff'),
    radius: 0.10,
    emissive: new Color('#88bbff'),
    glow: 0.7
  },
  helium4: { 
    color: new Color('#4488ff'), 
    radius: 0.12,
    emissive: new Color('#6699ff'),
    glow: 0.9
  },
  hydrogen: { 
    color: new Color('#ffcc44'), 
    radius: 0.07,
    emissive: new Color('#ffdd88'),
    glow: 0.5
  },
};

interface ParticleData {
  id: number;
  type: keyof typeof PARTICLE_TYPES;
  position: Vector3;
  velocity: Vector3;
  isVisible: boolean;
  age: number;
  energy: number;
  temperature: number;
}

const createInitialParticles = (count: number, boxSize: number): ParticleData[] => {
  const particles: ParticleData[] = [];
  
  // Realistic distribution: 75% protons, 12.5% neutrons, 12.5% electrons
  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    let type: keyof typeof PARTICLE_TYPES;
    
    if (rand < 0.75) type = 'proton';      // 75% - Most abundant
    else if (rand < 0.875) type = 'neutron'; // 12.5%
    else type = 'electron';                 // 12.5%

    // Thermal distribution - hot plasma
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = Math.pow(Math.random(), 0.5) * boxSize * 0.35; // More concentrated
    
    const pos = new Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi)
    );

    // Maxwell-Boltzmann velocity distribution (simplified)
    const speed = (Math.random() + Math.random() + Math.random()) * 0.015; // More realistic
    const velTheta = Math.random() * Math.PI * 2;
    const velPhi = Math.acos(2 * Math.random() - 1);
    
    const vel = new Vector3(
      speed * Math.sin(velPhi) * Math.cos(velTheta),
      speed * Math.sin(velPhi) * Math.sin(velTheta),
      speed * Math.cos(velPhi)
    );

    particles.push({
      id: i,
      type,
      position: pos,
      velocity: vel,
      isVisible: true,
      age: 0,
      energy: Math.random() * 0.5 + 0.5, // Energy level
      temperature: 1.0, // Initial temperature
    });
  }
  return particles;
};

export default function Nucleosynthesis({ 
  isVisible, 
  materialRef 
}: { 
  isVisible: boolean;
  materialRef?: any;
}) {
  const totalParticles = 1000;
  const boxSize = 10;

  const initialParticles = useMemo(
    () => createInitialParticles(totalParticles, boxSize),
    []
  );

  const [particles, setParticles] = useState<ParticleData[]>(initialParticles);
  const instancesRef = useRef<InstancedMesh>(null!);
  const fusionTimer = useRef(0);
  const nextParticleId = useRef(totalParticles);
  const [fusionFlash, setFusionFlash] = useState(0);

  useEffect(() => {
    if (isVisible) {
      setParticles(initialParticles);
      fusionTimer.current = 0;
      nextParticleId.current = totalParticles;
    }
  }, [isVisible, initialParticles]);

  useFrame((state, delta) => {
    if (!instancesRef.current || !isVisible) return;

    const time = state.clock.getElapsedTime();
    fusionTimer.current += delta;

    // Decay fusion flash
    if (fusionFlash > 0) {
      setFusionFlash(prev => Math.max(0, prev - delta * 2));
    }

    const matrix = new Matrix4();
    const quat = new Quaternion();
    const scale = new Vector3();

    setParticles((currentParticles) => {
      const updatedParticles = [...currentParticles];

      // PHASE 1: Particle Motion & Interactions
      updatedParticles.forEach((p) => {
        if (!p.isVisible) return;

        p.age += delta;
        p.temperature = Math.max(0.3, p.temperature - delta * 0.02); // Cooling

        // Active particles move with realistic physics
        if (!['helium4', 'helium3', 'hydrogen', 'deuterium', 'tritium'].includes(p.type)) {
          // Brownian motion + thermal agitation
          const thermalSpeed = 0.3 * delta * p.temperature;
          const noiseX = Math.sin(p.id * 0.1 + time * 0.8) * thermalSpeed;
          const noiseY = Math.cos(p.id * 0.15 + time * 0.9) * thermalSpeed;
          const noiseZ = Math.sin(p.id * 0.12 + time * 0.7) * thermalSpeed;

          p.velocity.add(new Vector3(noiseX, noiseY, noiseZ));
          
          // Damping (energy loss)
          p.velocity.multiplyScalar(0.97);
          p.position.add(p.velocity);

          // Collision with boundary
          const maxDist = boxSize * 0.4;
          const dist = p.position.length();
          if (dist > maxDist) {
            p.position.normalize().multiplyScalar(maxDist);
            p.velocity.reflect(p.position.clone().normalize());
            p.velocity.multiplyScalar(0.7);
          }

          // Gravity-like attraction to center (plasma cohesion)
          const centerForce = p.position.clone().normalize().multiplyScalar(-0.0005 * delta * 60);
          p.velocity.add(centerForce);
        } else {
          // Nuclei drift slowly
          const slowDrift = 0.05 * delta;
          p.position.add(new Vector3(
            Math.sin(time * 0.1 + p.id) * slowDrift,
            Math.cos(time * 0.12 + p.id) * slowDrift,
            Math.sin(time * 0.08 + p.id) * slowDrift
          ));
        }
      });

      // PHASE 2: Fusion Reactions (Realistic sequence)
      if (fusionTimer.current > 1.5) {
        fusionTimer.current = 0;

        const protons = updatedParticles.filter(p => p.type === 'proton' && p.isVisible);
        const neutrons = updatedParticles.filter(p => p.type === 'neutron' && p.isVisible);
        const electrons = updatedParticles.filter(p => p.type === 'electron' && p.isVisible);
        const deuterium = updatedParticles.filter(p => p.type === 'deuterium' && p.isVisible);
        const tritium = updatedParticles.filter(p => p.type === 'tritium' && p.isVisible);
        const helium3 = updatedParticles.filter(p => p.type === 'helium3' && p.isVisible);

        let fusionOccurred = false;

        // REACTION 1: p + n → Deuterium (most common)
        if (protons.length >= 1 && neutrons.length >= 1 && Math.random() < 0.6) {
          const p = protons[Math.floor(Math.random() * protons.length)];
          const n = neutrons[Math.floor(Math.random() * neutrons.length)];

          if (p.position.distanceTo(n.position) < 0.5) {
            const centerPos = new Vector3().addVectors(p.position, n.position).divideScalar(2);

            [p, n].forEach(particle => {
              const index = updatedParticles.findIndex(pp => pp.id === particle.id);
              if (index !== -1) updatedParticles[index].isVisible = false;
            });

            updatedParticles.push({
              id: nextParticleId.current++,
              type: 'deuterium',
              position: centerPos.clone(),
              velocity: new Vector3(0, 0, 0),
              isVisible: true,
              age: 0,
              energy: 1.0,
              temperature: 1.5,
            });
            fusionOccurred = true;
          }
        }

        // REACTION 2: Deuterium + p → Helium-3
        if (deuterium.length >= 1 && protons.length >= 1 && Math.random() < 0.5) {
          const d = deuterium[Math.floor(Math.random() * deuterium.length)];
          const p = protons[Math.floor(Math.random() * protons.length)];

          if (d.position.distanceTo(p.position) < 0.6) {
            const centerPos = new Vector3().addVectors(d.position, p.position).divideScalar(2);

            [d, p].forEach(particle => {
              const index = updatedParticles.findIndex(pp => pp.id === particle.id);
              if (index !== -1) updatedParticles[index].isVisible = false;
            });

            updatedParticles.push({
              id: nextParticleId.current++,
              type: 'helium3',
              position: centerPos.clone(),
              velocity: new Vector3(0, 0, 0),
              isVisible: true,
              age: 0,
              energy: 1.2,
              temperature: 1.8,
            });
            fusionOccurred = true;
          }
        }

        // REACTION 3: Deuterium + n → Tritium
        if (deuterium.length >= 1 && neutrons.length >= 1 && Math.random() < 0.4) {
          const d = deuterium[Math.floor(Math.random() * deuterium.length)];
          const n = neutrons[Math.floor(Math.random() * neutrons.length)];

          if (d.position.distanceTo(n.position) < 0.6) {
            const centerPos = new Vector3().addVectors(d.position, n.position).divideScalar(2);

            [d, n].forEach(particle => {
              const index = updatedParticles.findIndex(pp => pp.id === particle.id);
              if (index !== -1) updatedParticles[index].isVisible = false;
            });

            updatedParticles.push({
              id: nextParticleId.current++,
              type: 'tritium',
              position: centerPos.clone(),
              velocity: new Vector3(0, 0, 0),
              isVisible: true,
              age: 0,
              energy: 1.1,
              temperature: 1.7,
            });
            fusionOccurred = true;
          }
        }

        // REACTION 4: Helium-3 + Helium-3 → Helium-4 + 2p (rare but important)
        if (helium3.length >= 2 && Math.random() < 0.3) {
          const he1 = helium3[Math.floor(Math.random() * helium3.length)];
          const he2 = helium3[Math.floor(Math.random() * helium3.length)];

          if (he1.id !== he2.id && he1.position.distanceTo(he2.position) < 0.7) {
            const centerPos = new Vector3().addVectors(he1.position, he2.position).divideScalar(2);

            [he1, he2].forEach(particle => {
              const index = updatedParticles.findIndex(pp => pp.id === particle.id);
              if (index !== -1) updatedParticles[index].isVisible = false;
            });

            // Create Helium-4
            updatedParticles.push({
              id: nextParticleId.current++,
              type: 'helium4',
              position: centerPos.clone(),
              velocity: new Vector3(0, 0, 0),
              isVisible: true,
              age: 0,
              energy: 1.5,
              temperature: 2.0,
            });

            // Release 2 protons (energy release)
            for (let i = 0; i < 2; i++) {
              const angle = (Math.PI * 2 * i) / 2;
              const offset = new Vector3(
                Math.cos(angle) * 0.3,
                Math.sin(angle) * 0.3,
                (Math.random() - 0.5) * 0.2
              );
              updatedParticles.push({
                id: nextParticleId.current++,
                type: 'proton',
                position: centerPos.clone().add(offset),
                velocity: offset.normalize().multiplyScalar(0.05),
                isVisible: true,
                age: 0,
                energy: 1.5,
                temperature: 2.0,
              });
            }
            fusionOccurred = true;
          }
        }

        // REACTION 5: Tritium + Deuterium → Helium-4 + n (D-T fusion)
        if (tritium.length >= 1 && deuterium.length >= 1 && Math.random() < 0.4) {
          const t = tritium[Math.floor(Math.random() * tritium.length)];
          const d = deuterium[Math.floor(Math.random() * deuterium.length)];

          if (t.position.distanceTo(d.position) < 0.7) {
            const centerPos = new Vector3().addVectors(t.position, d.position).divideScalar(2);

            [t, d].forEach(particle => {
              const index = updatedParticles.findIndex(pp => pp.id === particle.id);
              if (index !== -1) updatedParticles[index].isVisible = false;
            });

            updatedParticles.push({
              id: nextParticleId.current++,
              type: 'helium4',
              position: centerPos.clone(),
              velocity: new Vector3(0, 0, 0),
              isVisible: true,
              age: 0,
              energy: 1.8,
              temperature: 2.2,
            });

            // Release neutron
            updatedParticles.push({
              id: nextParticleId.current++,
              type: 'neutron',
              position: centerPos.clone().add(new Vector3(0.3, 0, 0)),
              velocity: new Vector3(0.05, 0, 0),
              isVisible: true,
              age: 0,
              energy: 1.5,
              temperature: 2.0,
            });
            fusionOccurred = true;
          }
        }

        // REACTION 6: p + e → Hydrogen atom (recombination)
        if (protons.length >= 1 && electrons.length >= 1 && Math.random() < 0.3) {
          const p = protons[Math.floor(Math.random() * protons.length)];
          const e = electrons[Math.floor(Math.random() * electrons.length)];

          if (p.position.distanceTo(e.position) < 0.8) {
            const centerPos = new Vector3().addVectors(p.position, e.position).divideScalar(2);

            [p, e].forEach(particle => {
              const index = updatedParticles.findIndex(pp => pp.id === particle.id);
              if (index !== -1) updatedParticles[index].isVisible = false;
            });

            updatedParticles.push({
              id: nextParticleId.current++,
              type: 'hydrogen',
              position: centerPos.clone(),
              velocity: new Vector3(0, 0, 0),
              isVisible: true,
              age: 0,
              energy: 0.8,
              temperature: 0.5,
            });
            fusionOccurred = true;
          }
        }

        if (fusionOccurred) {
          setFusionFlash(1.0);
        }
      }

      return updatedParticles;
    });

    // PHASE 3: Render particles with effects
    particles.forEach((p, index) => {
      if (index >= instancesRef.current.count) return;

      if (p.isVisible) {
        const particleData = PARTICLE_TYPES[p.type];
        let particleScale = particleData.radius;
        
        // Nuclei growth animation
        if (['helium4', 'helium3', 'hydrogen', 'deuterium', 'tritium'].includes(p.type)) {
          const growthFactor = Math.min(p.age * 3, 1);
          const pulse = 1 + Math.sin(time * 3 + p.id) * 0.05 * p.energy;
          particleScale *= growthFactor * pulse;
        } else {
          // Active particles vibrate with temperature
          const vibration = 1 + Math.sin(time * 10 + p.id * 10) * 0.1 * p.temperature;
          particleScale *= vibration;
        }

        scale.set(particleScale, particleScale, particleScale);
        matrix.compose(p.position, quat, scale);
        instancesRef.current.setMatrixAt(index, matrix);
        
        // Dynamic color based on temperature
        const tempColor = particleData.color.clone();
        if (p.temperature > 1.5) {
          tempColor.lerp(new Color('#ffffff'), (p.temperature - 1.5) * 0.5);
        }
        instancesRef.current.setColorAt(index, tempColor);
      } else {
        scale.set(0, 0, 0);
        matrix.compose(p.position, quat, scale);
        instancesRef.current.setMatrixAt(index, matrix);
      }
    });

    instancesRef.current.instanceMatrix.needsUpdate = true;
    if (instancesRef.current.instanceColor) {
      instancesRef.current.instanceColor.needsUpdate = true;
    }
  });

  if (!isVisible) return null;

  return (
    <group>
      <instancedMesh
        ref={instancesRef}
        args={[undefined, undefined, totalParticles + 500]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial 
          roughness={0.3} 
          metalness={0.1}
          emissive="#ff8844"
          emissiveIntensity={0.4 + fusionFlash * 0.6}
          toneMapped={false}
        />
      </instancedMesh>

      {/* Enhanced Lighting */}
      <ambientLight intensity={0.3} color="#ffeecc" />
      
      {/* Central core light - hot plasma */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={2.0 + fusionFlash * 2.0} 
        color="#ffaa44" 
        distance={15}
        decay={2}
      />
      
      {/* Secondary lights for depth */}
      <pointLight 
        position={[3, 3, 3]} 
        intensity={1.0} 
        color="#aaddff" 
        distance={10}
      />
      <pointLight 
        position={[-3, -3, 3]} 
        intensity={0.8} 
        color="#ff8866" 
        distance={10}
      />
      
      {/* Fusion flash effect */}
      {fusionFlash > 0 && (
        <pointLight 
          position={[0, 0, 0]} 
          intensity={fusionFlash * 5} 
          color="#ffffff" 
          distance={20}
          decay={3}
        />
      )}

      {/* Atmospheric fog effect */}
      <fog attach="fog" args={['#000000', 5, 25]} />
    </group>
  );
}