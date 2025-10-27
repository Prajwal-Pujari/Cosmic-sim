import { useRef, forwardRef, useImperativeHandle, RefObject, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Group, MeshBasicMaterial } from 'three'
import { gsap } from 'gsap'
import PlanckPoint from './PlanckPoint'
import QuantumFoam from './QuantumFoam'
import QuarkGluonPlasma from './QuarkGluonPlasma'

const Scene = forwardRef(({ 
  setEpoch,
  chromaticRef,
  setBloomIntensity
}: { 
  setEpoch: (epoch: string) => void,
  chromaticRef: RefObject<any>,
  setBloomIntensity: (intensity: number) => void
}, ref) => {
  const { camera } = useThree()
  const universeRef = useRef<Group>(null!)
  const controlsRef = useRef<any>(null!)

  const pointMaterialRef = useRef<MeshBasicMaterial>(null!)
  const foamMaterialRef = useRef<any>(null!)
  const distantFoamMaterialRef = useRef<any>(null!)
  const plasmaMaterialRef = useRef<any>(null!)

  const [showPlasma, setShowPlasma] = useState(false)

  useImperativeHandle(ref, () => ({
    beginInflation() {
      if (!universeRef.current || !controlsRef.current || !pointMaterialRef.current || !foamMaterialRef.current || !distantFoamMaterialRef.current || !chromaticRef.current) return

      setEpoch('inflation')
      controlsRef.current.enabled = false
      
      // Save current camera position for dramatic effect
      const startPos = { ...camera.position }
      
      const tl = gsap.timeline({
        onComplete: () => {
          this.transitionToPlasma()
        }
      })
      
      // 0. Pre-explosion tension - zoom in slowly
      tl.to(camera.position, { 
        z: startPos.z - 1, 
        duration: 0.8, 
        ease: 'power1.in' 
      }, 0)
      
      // 1. EXPLOSION - Camera rushes forward into the singularity
      tl.to(camera.position, { 
        z: 0.5, 
        duration: 0.4, 
        ease: 'power4.in' 
      }, 0.8)
      
      // 2. Massive FOV expansion (tunnel vision effect)
      tl.to(camera, { 
        fov: 140, 
        duration: 0.6, 
        ease: 'power4.out', 
        onUpdate: () => camera.updateProjectionMatrix() 
      }, 0.8)
      
      // 3. Camera gets BLASTED backwards by the expansion
      tl.to(camera.position, { 
        z: 15, 
        duration: 1.2, 
        ease: 'power3.out' 
      }, 1.2)
      
      // 4. Settle camera position
      tl.to(camera.position, { 
        z: 8, 
        duration: 1.0, 
        ease: 'power2.inOut' 
      }, 2.4)
      
      // 5. Camera rotation for dynamic feel
      tl.to(camera.rotation, {
        z: 0.1,
        duration: 1.0,
        ease: 'power2.inOut'
      }, 1.2)
      tl.to(camera.rotation, {
        z: 0,
        duration: 1.2,
        ease: 'power2.out'
      }, 2.2)

      // 6. Universe Scale explosion
      tl.to(universeRef.current.scale, { 
        x: 150, 
        y: 150, 
        z: 150, 
        duration: 2.0, 
        ease: 'expo.out' 
      }, 1.2)

      // 7. Planck Point - flash bright then fade
      tl.to(pointMaterialRef.current, { 
        opacity: 2.0, 
        duration: 0.3, 
        ease: 'power2.in' 
      }, 0.8)
      tl.to(pointMaterialRef.current, { 
        opacity: 0.0, 
        duration: 0.8, 
        ease: 'power2.out' 
      }, 1.1)
      
      // 8. MASSIVE Chromatic Aberration shockwave
      tl.to(chromaticRef.current.offset, {
        x: 0.05,
        y: 0.05,
        duration: 0.2,
        ease: 'power4.in',
      }, 1.0)
      tl.to(chromaticRef.current.offset, {
        x: 0,
        y: 0,
        duration: 2.0,
        ease: 'power2.out',
      }, 1.2)
      
      // 9. Bloom intensity spike using callback
      tl.call(() => setBloomIntensity(3.0), [], 0.8)
      tl.call(() => setBloomIntensity(1.0), [], 2.6)

      // 10. Animate BOTH particle shaders with stagger
      tl.to(foamMaterialRef.current.uniforms.uInflation, {
        value: 1.0,
        duration: 1.8,
        ease: 'power3.out'
      }, 1.2)
      
      tl.to(distantFoamMaterialRef.current.uniforms.uInflation, {
        value: 1.0,
        duration: 2.0,
        ease: 'power3.out'
      }, 1.3)
    },

    transitionToPlasma() {
      setShowPlasma(true)

      setTimeout(() => {
        if (!plasmaMaterialRef.current || !foamMaterialRef.current || !distantFoamMaterialRef.current || !chromaticRef.current) return

        setEpoch('plasma')
        
        const tl = gsap.timeline()

        // 1. Camera swoops around dramatically
        tl.to(camera.position, { 
          x: -5, 
          y: 3,
          z: 12, 
          duration: 2.5, 
          ease: 'power2.inOut' 
        }, 0)
        
        // 2. Camera looks at center while moving
        tl.to(camera.rotation, {
          x: -0.2,
          y: -0.3,
          duration: 2.5,
          ease: 'power2.inOut'
        }, 0)
        
        // 3. Then settle into final position
        tl.to(camera.position, { 
          x: 0, 
          y: 0, 
          z: 7, 
          duration: 2.0, 
          ease: 'power2.inOut' 
        }, 2.5)
        
        tl.to(camera.rotation, {
          x: 0,
          y: 0,
          duration: 2.0,
          ease: 'power2.inOut'
        }, 2.5)

        // 4. FOV transitions smoothly
        tl.to(camera, { 
          fov: 50, 
          duration: 3.0, 
          ease: 'power2.inOut', 
          onUpdate: () => camera.updateProjectionMatrix() 
        }, 0)
        
        tl.to(camera, { 
          fov: 60, 
          duration: 1.5, 
          ease: 'power1.out', 
          onUpdate: () => camera.updateProjectionMatrix() 
        }, 3.0)

        // 5. Universe scale with rotation
        tl.to(universeRef.current.scale, { 
          x: 0.3, 
          y: 0.3, 
          z: 0.3, 
          duration: 2.0, 
          ease: 'power2.in' 
        }, 0)
        
        tl.to(universeRef.current.rotation, {
          y: Math.PI * 0.5,
          duration: 3.0,
          ease: 'power1.inOut'
        }, 0)
        
        tl.to(universeRef.current.scale, { 
          x: 1, 
          y: 1, 
          z: 1, 
          duration: 2.0, 
          ease: 'power2.out' 
        }, 2.0)
        
        tl.to(universeRef.current.rotation, {
          y: 0,
          duration: 2.0,
          ease: 'power2.out'
        }, 2.5)

        // 6. Fade out foam with acceleration
        tl.to(foamMaterialRef.current.uniforms.uInflation, { 
          value: 3.0, 
          duration: 2.0, 
          ease: 'power3.in' 
        }, 0)
        tl.to(distantFoamMaterialRef.current.uniforms.uInflation, { 
          value: 3.0, 
          duration: 2.0, 
          ease: 'power3.in' 
        }, 0)

        // 7. Chromatic aberration pulse for phase change
        tl.to(chromaticRef.current.offset, {
          x: 0.025,
          y: 0.025,
          duration: 0.6,
          ease: 'power3.in',
        }, 1.0)
        tl.to(chromaticRef.current.offset, {
          x: 0.004,
          y: 0.004,
          duration: 1.5,
          ease: 'power2.out',
        }, 1.6)
        tl.to(chromaticRef.current.offset, {
          x: 0,
          y: 0,
          duration: 2.0,
          ease: 'power1.out',
        }, 3.1)
        
        // 8. Bloom surge for plasma heat using callbacks
        tl.call(() => setBloomIntensity(2.5), [], 1.0)
        tl.call(() => setBloomIntensity(1.8), [], 3.8)

        // 9. Plasma fade in with pulse
        tl.fromTo(plasmaMaterialRef.current.uniforms.uScale, 
          { value: 0 },
          { value: 0.5, duration: 0.8, ease: 'power2.out' },
          1.5
        )
        tl.to(plasmaMaterialRef.current.uniforms.uScale, 
          { value: 2.0, duration: 2.5, ease: 'elastic.out(1, 0.5)' },
          2.3
        )

        // 10. Enable controls after the show
        tl.call(() => {
          if (controlsRef.current) {
            controlsRef.current.enabled = true
            controlsRef.current.enableDamping = true
            controlsRef.current.dampingFactor = 0.05
          }
        }, [], 4.5)
      }, 50)
    }
  }))

  return (
    <>
      <group ref={universeRef}>
        <PlanckPoint materialRef={pointMaterialRef} />
        <QuantumFoam 
          materialRef={foamMaterialRef} 
          count={10000}
          radius={2}
          size={0.015}
          baseColor="#aaa"
        />
        <QuantumFoam 
          materialRef={distantFoamMaterialRef} 
          count={5000}
          radius={5}
          size={0.01}
          baseColor="#555"
        />
        {showPlasma && <QuarkGluonPlasma materialRef={plasmaMaterialRef} />}
      </group>
      <OrbitControls ref={controlsRef} />
    </>
  )
})
Scene.displayName = 'Scene'

export default Scene