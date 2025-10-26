import { useMemo, RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color } from 'three'
import '@/components/shaders/FoamMaterial'

export default function QuantumFoam({ 
  materialRef,
  count = 10000,
  radius = 2,
  size = 0.015,
  baseColor = "#aaa"
}: { 
  materialRef: RefObject<any>,
  count?: number,
  radius?: number,
  size?: number,
  baseColor?: string,
}) {
  // Generate points within a sphere with color variation
  const [particlePositions, particleColors] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const base = new Color(baseColor)

    for (let i = 0; i < count; i++) {
      // Generate random angles (phi, theta)
      const phi = Math.acos(-1 + (2 * Math.random()))
      const theta = Math.random() * 2 * Math.PI

      // Generate a random radius within the sphere (cubed for even distribution)
      const r = Math.cbrt(Math.random()) * radius

      // Convert spherical to Cartesian coordinates
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)

      positions[i * 3 + 0] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      // Add subtle color variation based on position
      const variation = Math.random() * 0.2 - 0.1
      colors[i * 3 + 0] = base.r + variation
      colors[i * 3 + 1] = base.g + variation
      colors[i * 3 + 2] = base.b + variation
    }
    return [positions, colors]
  }, [count, radius, baseColor])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
    }
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particlePositions, 3]} 
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particleColors, 3]} 
        />
      </bufferGeometry>
      <foamMaterial 
        ref={materialRef}
        uSize={size}
        transparent 
        depthWrite={false} 
        vertexColors
      />
    </points>
  )
}