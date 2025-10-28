import { useMemo, RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import '../shaders/PlasmaMaterial';

export default function QuarkGluonPlasma({ materialRef }: { materialRef: RefObject<any> }) {
  // Optimized particle count - still visually dense
  const particleCount = 12000;
  const boxSize = 10;

  // Create multiple particle layers for depth and realism
  const { corePositions, mediumPositions, outerPositions } = useMemo(() => {
    // CORE LAYER: Dense, hot center (4000 particles)
    const core = new Float32Array(4000 * 3);
    for (let i = 0; i < 4000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      // Very concentrated in center (0-30% radius)
      const radius = Math.pow(Math.random(), 1.5) * boxSize * 0.15;
      
      core[i * 3 + 0] = radius * Math.sin(phi) * Math.cos(theta);
      core[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      core[i * 3 + 2] = radius * Math.cos(phi);
    }

    // MEDIUM LAYER: Active plasma zone (5000 particles)
    const medium = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      // Medium density (20-60% radius)
      const radius = (0.2 + Math.pow(Math.random(), 0.8) * 0.4) * boxSize * 0.5;
      
      medium[i * 3 + 0] = radius * Math.sin(phi) * Math.cos(theta);
      medium[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      medium[i * 3 + 2] = radius * Math.cos(phi);
    }

    // OUTER LAYER: Cooling edge particles (3000 particles)
    const outer = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      // Sparse outer shell (60-100% radius)
      const radius = (0.6 + Math.random() * 0.4) * boxSize * 0.5;
      
      outer[i * 3 + 0] = radius * Math.sin(phi) * Math.cos(theta);
      outer[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      outer[i * 3 + 2] = radius * Math.cos(phi);
    }

    return { corePositions: core, mediumPositions: medium, outerPositions: outer };
  }, []);

  // Realistic turbulent motion update
  let frameCount = 0;
  useFrame((state) => {
    frameCount++;
    // Update every other frame for performance
    if (materialRef.current && frameCount % 2 === 0) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <group>
      {/* CORE: Ultra-hot white-blue center (highest energy quarks) */}
      <points frustumCulled={true}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[corePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color="#ffffff"
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={2}
          sizeAttenuation={true}
        />
      </points>

      {/* MEDIUM LAYER: Active quark-gluon plasma with color fields */}
      <points frustumCulled={true}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[mediumPositions, 3]}
          />
        </bufferGeometry>
        <plasmaMaterial
          ref={materialRef}
          transparent
          depthWrite={false}
        />
      </points>

      {/* GREEN GLUON FIELD: Representing strong force carriers */}
      <points frustumCulled={true}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[mediumPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.025}
          color="#00ff88"
          transparent
          opacity={0.4}
          depthWrite={false}
          blending={2}
          sizeAttenuation={true}
        />
      </points>

      {/* OUTER LAYER: Cooling plasma edge (red-shifted, lower energy) */}
      <points frustumCulled={true}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[outerPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.015}
          color="#ff6b35"
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={2}
          sizeAttenuation={true}
        />
      </points>

      {/* AMBER/YELLOW FIELD: Represents thermal radiation */}
      <points frustumCulled={true}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[outerPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color="#ffaa00"
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={2}
          sizeAttenuation={true}
        />
      </points>
    </group>
  );
}