import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Color, InstancedMesh, Matrix4, Quaternion } from 'three';

const PARTICLE_TYPES = {
  proton: { color: new Color('#ff3366'), radius: 0.06 },
  neutron: { color: new Color('#cccccc'), radius: 0.06 },
  electron: { color: new Color('#00ffff'), radius: 0.03 },
  helium: { color: new Color('#4488ff'), radius: 0.12 },
  hydrogen: { color: new Color('#ffaa44'), radius: 0.08 },
};

interface ParticleData {
  id: number;
  type: keyof typeof PARTICLE_TYPES;
  position: Vector3;
  velocity: Vector3;
  isVisible: boolean;
  age: number;
}

const createInitialParticles = (count: number, boxSize: number): ParticleData[] => {
  const particles: ParticleData[] = [];
  
  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    let type: keyof typeof PARTICLE_TYPES;
    
    if (rand < 0.35) type = 'proton';
    else if (rand < 0.70) type = 'neutron';
    else type = 'electron';

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = Math.pow(Math.random(), 0.6) * boxSize * 0.4;
    
    const pos = new Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi)
    );

    const vel = new Vector3(
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02
    );

    particles.push({
      id: i,
      type,
      position: pos,
      velocity: vel,
      isVisible: true,
      age: 0,
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
  const totalParticles = 800;
  const boxSize = 8;

  const initialParticles = useMemo(
    () => createInitialParticles(totalParticles, boxSize),
    []
  );

  const [particles, setParticles] = useState<ParticleData[]>(initialParticles);
  const instancesRef = useRef<InstancedMesh>(null!);
  const fusionTimer = useRef(0);
  const nextParticleId = useRef(totalParticles);

  useEffect(() => {
    if (isVisible) {
      setParticles(initialParticles);
      fusionTimer.current = 0;
      nextParticleId.current = totalParticles;
    }
  }, [isVisible]);

  useFrame((state, delta) => {
    if (!instancesRef.current || !isVisible) return;

    const time = state.clock.getElapsedTime();
    fusionTimer.current += delta;

    const matrix = new Matrix4();
    const quat = new Quaternion();
    const scale = new Vector3();

    setParticles((currentParticles) => {
      const updatedParticles = [...currentParticles];

      updatedParticles.forEach((p) => {
        if (!p.isVisible) return;

        p.age += delta;

        if (p.type !== 'helium' && p.type !== 'hydrogen') {
          const drift = 0.5 * delta;
          const noiseX = Math.sin(p.id * 0.1 + time * 0.5) * drift;
          const noiseY = Math.cos(p.id * 0.15 + time * 0.6) * drift;
          const noiseZ = Math.sin(p.id * 0.12 + time * 0.4) * drift;

          p.velocity.add(new Vector3(noiseX, noiseY, noiseZ));
          p.velocity.multiplyScalar(0.98);
          p.position.add(p.velocity);

          const maxDist = boxSize * 0.45;
          if (p.position.length() > maxDist) {
            p.position.normalize().multiplyScalar(maxDist);
            p.velocity.multiplyScalar(-0.5);
          }
        }
      });

      if (fusionTimer.current > 2.0) {
        fusionTimer.current = 0;

        const protons = updatedParticles.filter(p => p.type === 'proton' && p.isVisible);
        const neutrons = updatedParticles.filter(p => p.type === 'neutron' && p.isVisible);
        const electrons = updatedParticles.filter(p => p.type === 'electron' && p.isVisible);

        if (protons.length >= 2 && neutrons.length >= 2 && Math.random() < 0.7) {
          const p1 = protons[Math.floor(Math.random() * protons.length)];
          const p2 = protons[Math.floor(Math.random() * protons.length)];
          const n1 = neutrons[Math.floor(Math.random() * neutrons.length)];
          const n2 = neutrons[Math.floor(Math.random() * neutrons.length)];

          if (p1.id !== p2.id && n1.id !== n2.id) {
            const centerPos = new Vector3()
              .add(p1.position).add(p2.position)
              .add(n1.position).add(n2.position)
              .divideScalar(4);

            [p1, p2, n1, n2].forEach(particle => {
              const index = updatedParticles.findIndex(p => p.id === particle.id);
              if (index !== -1) updatedParticles[index].isVisible = false;
            });

            updatedParticles.push({
              id: nextParticleId.current++,
              type: 'helium',
              position: centerPos.clone(),
              velocity: new Vector3(0, 0, 0),
              isVisible: true,
              age: 0,
            });
          }
        }

        if (protons.length >= 1 && electrons.length >= 1 && Math.random() < 0.5) {
          const p = protons[Math.floor(Math.random() * protons.length)];
          const e = electrons[Math.floor(Math.random() * electrons.length)];

          if (p.position.distanceTo(e.position) < 1.0) {
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
            });
          }
        }
      }

      return updatedParticles;
    });

    particles.forEach((p, index) => {
      if (index >= instancesRef.current.count) return;

      if (p.isVisible) {
        const particleScale = PARTICLE_TYPES[p.type].radius;
        
        if (p.type === 'helium' || p.type === 'hydrogen') {
          const growthFactor = Math.min(p.age * 2, 1);
          scale.set(
            particleScale * growthFactor,
            particleScale * growthFactor,
            particleScale * growthFactor
          );
        } else {
          scale.set(particleScale, particleScale, particleScale);
        }

        matrix.compose(p.position, quat, scale);
        instancesRef.current.setMatrixAt(index, matrix);
        instancesRef.current.setColorAt(index, PARTICLE_TYPES[p.type].color);
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
        args={[undefined, undefined, totalParticles + 300]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial 
          roughness={0.4} 
          metalness={0.2}
          emissive="#222222"
          emissiveIntensity={0.3}
        />
      </instancedMesh>

      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={1.5} color="#ffddaa" />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#aaddff" />
    </group>
  );
}