import { useRef, forwardRef, useImperativeHandle, RefObject } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Group, MeshBasicMaterial } from 'three'
import { gsap } from 'gsap'
import PlanckPoint from './PlanckPoint'
import QuantumFoam from './QuantumFoam'

const Scene = forwardRef(({ 
  setEpoch,
  chromaticRef
}: { 
  setEpoch: (epoch: string) => void,
  chromaticRef: RefObject<any>
}, ref) => {
  const { camera } = useThree()
  const universeRef = useRef<Group>(null!)
  const controlsRef = useRef<any>(null!)

  const pointMaterialRef = useRef<MeshBasicMaterial>(null!)
  const foamMaterialRef = useRef<any>(null!)
  const distantFoamMaterialRef = useRef<any>(null!)

  useImperativeHandle(ref, () => ({
    beginInflation() {
      if (!universeRef.current || !controlsRef.current || !pointMaterialRef.current || !foamMaterialRef.current || !distantFoamMaterialRef.current || !chromaticRef.current) return

      setEpoch('inflation')
      controlsRef.current.enabled = false
      
      const tl = gsap.timeline()
      
      // 1. Camera Position
      tl.to(camera.position, { z: 2, duration: 1.5, ease: 'power2.in' }, 0)
      
      // 2. Camera FOV
      tl.to(camera, { fov: 120, duration: 1.5, ease: 'power2.in', onUpdate: () => camera.updateProjectionMatrix() }, 0)

      // 3. Universe Scale
      tl.to(universeRef.current.scale, { x: 100, y: 100, z: 100, duration: 2.5, ease: 'power3.inOut' }, 0.2)

      // 4. Planck Point fade out
      tl.to(pointMaterialRef.current, { opacity: 0.0, duration: 1, ease: 'power1.out' }, 0.5)
      
      // 5. Chromatic Aberration Shockwave
      tl.to(chromaticRef.current.offset, {
        x: 0.02,
        y: 0.02,
        duration: 0.3,
        ease: 'power3.in',
      }, 0)
      tl.to(chromaticRef.current.offset, {
        x: 0,
        y: 0,
        duration: 1.5,
        ease: 'power2.out',
      }, 0.3)

      // 6. Animate BOTH particle shaders
      const materials = [foamMaterialRef.current, distantFoamMaterialRef.current]
      materials.forEach(material => {
        tl.to(material.uniforms.uInflation, {
          value: 1.0,
          duration: 2.0,
          ease: 'power2.in'
        }, 0.2)
      })
    }
  }))

  return (
    <>
      <group ref={universeRef}>
        <PlanckPoint materialRef={pointMaterialRef} />
        {/* The close, dense foam */}
        <QuantumFoam 
          materialRef={foamMaterialRef} 
          count={10000}
          radius={2}
          size={0.015}
          baseColor="#aaa"
        />
        {/* The distant, sparser foam for parallax */}
        <QuantumFoam 
          materialRef={distantFoamMaterialRef} 
          count={5000}
          radius={5}
          size={0.01}
          baseColor="#555"
        />
      </group>
      <OrbitControls ref={controlsRef} />
    </>
  )
})
Scene.displayName = 'Scene'

export default Scene