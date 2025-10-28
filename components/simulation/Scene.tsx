import { useRef, forwardRef, useImperativeHandle, RefObject, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Group, MeshBasicMaterial } from 'three'
import { gsap } from 'gsap'
import PlanckPoint from './PlanckPoint'
import QuantumFoam from './QuantumFoam'
import QuarkGluonPlasma from './QuarkGluonPlasma'
import Nucleosynthesis from './Nucleosynthesis';

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
      
      const startPos = { ...camera.position }
      
      const tl = gsap.timeline({
        onComplete: () => {
          this.transitionToPlasma()
        }
      })
      
      // Pre-explosion tension
      tl.to(camera.position, { 
        z: startPos.z - 1, 
        duration: 0.8, 
        ease: 'power1.in' 
      }, 0)
      
      // EXPLOSION
      tl.to(camera.position, { 
        z: 0.5, 
        duration: 0.4, 
        ease: 'power4.in' 
      }, 0.8)
      
      // FOV expansion
      tl.to(camera, { 
        fov: 140, 
        duration: 0.6, 
        ease: 'power4.out', 
        onUpdate: () => camera.updateProjectionMatrix() 
      }, 0.8)
      
      // Camera blast backwards
      tl.to(camera.position, { 
        z: 15, 
        duration: 1.2, 
        ease: 'power3.out' 
      }, 1.2)
      
      // Settle camera
      tl.to(camera.position, { 
        z: 8, 
        duration: 1.0, 
        ease: 'power2.inOut' 
      }, 2.4)
      
      // Camera rotation
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

      // Universe Scale explosion
      tl.to(universeRef.current.scale, { 
        x: 150, 
        y: 150, 
        z: 150, 
        duration: 2.0, 
        ease: 'expo.out' 
      }, 1.2)

      // Planck Point flash
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
      
      // Chromatic aberration shockwave
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
      
      // Bloom intensity spike
      tl.call(() => setBloomIntensity(3.0), [], 0.8)
      tl.call(() => setBloomIntensity(1.0), [], 2.6)

      // Particle shader animation
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

        // PHASE 1: DIRECTED CUT - Sharp camera snap to new angle (like a film cut)
        tl.to(camera.position, { 
          x: -8, 
          y: 5,
          z: 16,
          duration: 0.4,
          ease: 'power4.out'
        }, 0)
        
        tl.to(camera.rotation, {
          x: -0.25,
          y: -0.4,
          duration: 0.4,
          ease: 'power4.out'
        }, 0)

        // Quick FOV snap for dramatic effect
        tl.to(camera, { 
          fov: 45,
          duration: 0.4,
          ease: 'power4.out', 
          onUpdate: () => camera.updateProjectionMatrix() 
        }, 0)

        // PHASE 2: CINEMATIC ZOOM IN - Moving closer to the plasma
        tl.to(camera.position, { 
          x: -4, 
          y: 2,
          z: 8,
          duration: 2.0, 
          ease: 'power1.inOut' 
        }, 0.6)
        
        tl.to(camera.rotation, {
          x: -0.15,
          y: -0.2,
          duration: 2.0,
          ease: 'power1.inOut'
        }, 0.6)

        // Dramatic FOV tighten (zoom in feel)
        tl.to(camera, { 
          fov: 40,
          duration: 2.0, 
          ease: 'power2.in', 
          onUpdate: () => camera.updateProjectionMatrix() 
        }, 0.6)

        // PHASE 3: ORBITAL CAMERA MOVEMENT - Circling the plasma
        tl.to(camera.position, { 
          x: 0, 
          y: 3,
          z: 11,
          duration: 2.5, 
          ease: 'power1.inOut' 
        }, 2.6)
        
        tl.to(camera.rotation, {
          x: -0.2,
          y: 0,
          duration: 2.5,
          ease: 'power1.inOut'
        }, 2.6)

        // Continue orbit to the right side
        tl.to(camera.position, { 
          x: 6, 
          y: 2,
          z: 10,
          duration: 2.5, 
          ease: 'power1.inOut' 
        }, 5.1)
        
        tl.to(camera.rotation, {
          x: -0.12,
          y: 0.35,
          duration: 2.5,
          ease: 'power1.inOut'
        }, 5.1)

        // PHASE 4: ZOOM OUT TO FINAL POSITION - Revealing the full plasma
        tl.to(camera.position, { 
          x: 0, 
          y: 0, 
          z: 12,
          duration: 2.5, 
          ease: 'power2.inOut' 
        }, 7.6)
        
        tl.to(camera.rotation, {
          x: 0,
          y: 0,
          duration: 2.5,
          ease: 'power2.inOut'
        }, 7.6)

        // Final FOV - wide and comfortable
        tl.to(camera, { 
          fov: 65,
          duration: 2.5, 
          ease: 'power2.out', 
          onUpdate: () => camera.updateProjectionMatrix() 
        }, 7.6)

        // Universe scale transformations
        tl.to(universeRef.current.scale, { 
          x: 0.4,
          y: 0.4, 
          z: 0.4, 
          duration: 1.5, 
          ease: 'power2.in' 
        }, 0)
        
        tl.to(universeRef.current.rotation, {
          y: Math.PI * 0.3,
          duration: 2.0,
          ease: 'power1.inOut'
        }, 0.6)
        
        tl.to(universeRef.current.scale, { 
          x: 0.8, 
          y: 0.8, 
          z: 0.8, 
          duration: 2.0, 
          ease: 'power2.out' 
        }, 2.6)

        tl.to(universeRef.current.rotation, {
          y: -Math.PI * 0.2,
          duration: 3.0,
          ease: 'power1.inOut'
        }, 4.6)
        
        tl.to(universeRef.current.scale, { 
          x: 1, 
          y: 1, 
          z: 1, 
          duration: 2.0, 
          ease: 'power1.out' 
        }, 7.6)
        
        tl.to(universeRef.current.rotation, {
          y: 0,
          duration: 2.5,
          ease: 'power2.out'
        }, 7.6)

        // Fade out foam with stagger
        tl.to(foamMaterialRef.current.uniforms.uInflation, { 
          value: 3.0, 
          duration: 1.8, 
          ease: 'power3.in' 
        }, 0)
        tl.to(distantFoamMaterialRef.current.uniforms.uInflation, { 
          value: 3.0, 
          duration: 2.0, 
          ease: 'power3.in' 
        }, 0.2)

        // Chromatic aberration for phase transition
        tl.to(chromaticRef.current.offset, {
          x: 0.03,
          y: 0.03,
          duration: 0.4,
          ease: 'power4.in',
        }, 0)
        tl.to(chromaticRef.current.offset, {
          x: 0.005,
          y: 0.005,
          duration: 1.5,
          ease: 'power2.out',
        }, 0.4)
        tl.to(chromaticRef.current.offset, {
          x: 0,
          y: 0,
          duration: 3.0,
          ease: 'power1.out',
        }, 6.0)
        
        // Bloom intensity waves
        tl.call(() => setBloomIntensity(2.5), [], 0)
        tl.call(() => setBloomIntensity(1.8), [], 2.6)
        tl.call(() => setBloomIntensity(2.0), [], 5.1)
        tl.call(() => setBloomIntensity(1.5), [], 9.0)

        // Plasma materialization sequence
        tl.fromTo(plasmaMaterialRef.current.uniforms.uScale, 
          { value: 0 },
          { value: 0.3, duration: 0.6, ease: 'power2.out' },
          0.8
        )
        tl.to(plasmaMaterialRef.current.uniforms.uScale, 
          { value: 1.5, duration: 2.0, ease: 'back.out(1.2)' },
          1.4
        )
        tl.to(plasmaMaterialRef.current.uniforms.uScale, 
          { value: 2.0, duration: 2.5, ease: 'elastic.out(1, 0.4)' },
          3.4
        )

        // Enable controls at the end with safe limits
        tl.call(() => {
          if (controlsRef.current) {
            controlsRef.current.enabled = true
            controlsRef.current.enableDamping = true
            controlsRef.current.dampingFactor = 0.05
            controlsRef.current.minDistance = 8
            controlsRef.current.maxDistance = 30
            controlsRef.current.enablePan = false
          }
        }, [], 10.1)
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