import { useMemo, RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import '../shaders/PlasmaMaterial';

export default function QuarkGluonPlasma({ materialRef }: { materialRef: RefObject<any> }) {
  const particleCount = 20000;
  const boxSize = 10;

  // Memoize particle positions with more realistic distribution
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      // Create more density in the center (using gaussian-like distribution)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = Math.pow(Math.random(), 0.5) * boxSize * 0.5; // Concentrate in center
      
      positions[i * 3 + 0] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    return positions;
  }, []);

  // Update the shader's time uniform every frame for the boiling animation
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particlePositions, 3]}
        />
      </bufferGeometry>
      <plasmaMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
      />
    </points>
  );
}