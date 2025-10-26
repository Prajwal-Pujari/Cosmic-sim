import { useRef, RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, MeshBasicMaterial } from 'three'

export default function PlanckPoint({ materialRef }: { materialRef: RefObject<MeshBasicMaterial> }) {
  const meshRef = useRef<Mesh>(null!)
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    const pulse = 1 + Math.sin(time * 50) * 0.05
    if(meshRef.current) {
      meshRef.current.scale.set(pulse, pulse, pulse)
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.1, 32, 32]} />
      <meshBasicMaterial 
        ref={materialRef} 
        color="white" 
        transparent 
        toneMapped={false} 
      />
    </mesh>
  )
}