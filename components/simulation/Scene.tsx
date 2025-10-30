import { useRef, forwardRef, useImperativeHandle, RefObject, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Group, MeshBasicMaterial } from 'three'
import { gsap } from 'gsap'
import PlanckPoint from './PlanckPoint'
import QuantumFoam from './QuantumFoam'
import QuarkGluonPlasma from './QuarkGluonPlasma'
import Nucleosynthesis from './Nucleosynthesis'
import Recombination from './Recombination'
import CosmicMicrowaveBackground from './CosmicMicrowaveBackground'

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
  const [showNucleosynthesis, setShowNucleosynthesis] = useState(false)
  const [showRecombination, setShowRecombination] = useState(false)
  const [showCMB, setShowCMB] = useState(false)
  const [cmbOpacity, setCmbOpacity] = useState(0)

  useImperativeHandle(ref, () => ({
    beginInflation() {
      if (!universeRef.current || !controlsRef.current || !pointMaterialRef.current || !foamMaterialRef.current || !distantFoamMaterialRef.current || !chromaticRef.current) return

      setEpoch('inflation')
      controlsRef.current.enabled = false
      
      const startPos = { ...camera.position }
      
      const tl = gsap.timeline({
        onComplete: () => {
          setTimeout(() => {
            this.transitionToPlasma()
          }, 500)
        }
      })
      
      tl.to(camera.position, { 
        z: startPos.z - 1, 
        duration: 0.8, 
        ease: 'power1.in' 
      }, 0)
      
      tl.to(camera.position, { 
        z: 0.5, 
        duration: 0.4, 
        ease: 'power4.in' 
      }, 0.8)
      
      tl.to(camera, { 
        fov: 140, 
        duration: 0.6, 
        ease: 'power4.out', 
        onUpdate: () => camera.updateProjectionMatrix() 
      }, 0.8)
      
      tl.to(camera.position, { 
        z: 15, 
        duration: 1.2, 
        ease: 'power3.out' 
      }, 1.2)
      
      tl.to(camera.position, { 
        z: 8, 
        duration: 1.0, 
        ease: 'power2.inOut' 
      }, 2.4)
      
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

      tl.to(universeRef.current.scale, { 
        x: 150, 
        y: 150, 
        z: 150, 
        duration: 2.0, 
        ease: 'expo.out' 
      }, 1.2)

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
      
      tl.call(() => setBloomIntensity(3.0), [], 0.8)
      tl.call(() => setBloomIntensity(1.0), [], 2.6)

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

        tl.to(camera, { 
          fov: 45,
          duration: 0.4,
          ease: 'power4.out', 
          onUpdate: () => camera.updateProjectionMatrix() 
        }, 0)

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

        tl.to(camera, { 
          fov: 40,
          duration: 2.0, 
          ease: 'power2.in', 
          onUpdate: () => camera.updateProjectionMatrix() 
        }, 0.6)

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

        tl.to(camera, { 
          fov: 65,
          duration: 2.5, 
          ease: 'power2.out', 
          onUpdate: () => camera.updateProjectionMatrix() 
        }, 7.6)

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
        
        tl.call(() => setBloomIntensity(2.5), [], 0)
        tl.call(() => setBloomIntensity(1.8), [], 2.6)
        tl.call(() => setBloomIntensity(2.0), [], 5.1)
        tl.call(() => setBloomIntensity(1.5), [], 9.0)

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
    },

    transitionToNucleosynthesis() {
      setShowNucleosynthesis(true)

      setTimeout(() => {
        if (!chromaticRef.current) return

        setEpoch('nucleosynthesis')
        controlsRef.current.enabled = false

        const tl = gsap.timeline()

        tl.to(camera.position, {
          x: 0,
          y: 6,
          z: 18,
          duration: 2.0,
          ease: 'power2.out'
        }, 0)

        tl.to(camera.rotation, {
          x: -0.3,
          y: 0,
          duration: 2.0,
          ease: 'power2.out'
        }, 0)

        tl.to(camera, {
          fov: 70,
          duration: 2.0,
          ease: 'power2.out',
          onUpdate: () => camera.updateProjectionMatrix()
        }, 0)

        tl.to(universeRef.current.scale, {
          x: 1.4,
          y: 1.4,
          z: 1.4,
          duration: 2.0,
          ease: 'power2.out'
        }, 0)

        tl.to(universeRef.current.rotation, {
          x: Math.PI * 0.1,
          y: Math.PI * 0.15,
          duration: 2.0,
          ease: 'power2.inOut'
        }, 0)

        if (plasmaMaterialRef.current) {
          tl.to(plasmaMaterialRef.current.uniforms.uScale, {
            value: 3.0,
            duration: 1.5,
            ease: 'power3.in'
          }, 0)
          tl.to(plasmaMaterialRef.current.uniforms.uScale, {
            value: 0,
            duration: 0.5,
            ease: 'power4.in'
          }, 1.5)
        }

        tl.to(camera.position, {
          x: -6,
          y: 4,
          z: 11,
          duration: 2.0,
          ease: 'power1.inOut'
        }, 2.0)

        tl.to(camera.rotation, {
          x: -0.25,
          y: -0.3,
          z: -0.05,
          duration: 2.0,
          ease: 'power1.inOut'
        }, 2.0)

        tl.to(camera, {
          fov: 50,
          duration: 2.0,
          ease: 'power2.in',
          onUpdate: () => camera.updateProjectionMatrix()
        }, 2.0)

        tl.to(universeRef.current.rotation, {
          x: -Math.PI * 0.05,
          y: Math.PI * 0.4,
          duration: 2.0,
          ease: 'power1.inOut'
        }, 2.0)

        tl.to(universeRef.current.scale, {
          x: 1.1,
          y: 1.1,
          z: 1.1,
          duration: 2.0,
          ease: 'power2.inOut'
        }, 2.0)

        tl.to(camera.position, {
          x: 4,
          y: 1,
          z: 9,
          duration: 2.5,
          ease: 'power1.inOut'
        }, 4.0)

        tl.to(camera.rotation, {
          x: -0.1,
          y: 0.25,
          z: 0.03,
          duration: 2.5,
          ease: 'power1.inOut'
        }, 4.0)

        tl.to(camera, {
          fov: 55,
          duration: 2.5,
          ease: 'sine.inOut',
          onUpdate: () => camera.updateProjectionMatrix()
        }, 4.0)

        tl.to(camera.position, {
          x: 0,
          y: 0,
          z: 7,
          duration: 2.5,
          ease: 'power2.inOut'
        }, 6.5)

        tl.to(camera.rotation, {
          x: 0,
          y: 0,
          z: 0,
          duration: 2.5,
          ease: 'power2.inOut'
        }, 6.5)

        tl.to(camera, {
          fov: 60,
          duration: 2.5,
          ease: 'power2.out',
          onUpdate: () => camera.updateProjectionMatrix()
        }, 6.5)

        tl.to(universeRef.current.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 2.5,
          ease: 'power2.out'
        }, 6.5)

        tl.to(universeRef.current.rotation, {
          x: 0,
          y: 0,
          duration: 2.5,
          ease: 'power2.out'
        }, 6.5)

        tl.to(chromaticRef.current.offset, {
          x: 0.04,
          y: 0.04,
          duration: 0.3,
          ease: 'power4.in'
        }, 0.8)
        tl.to(chromaticRef.current.offset, {
          x: 0.012,
          y: 0.012,
          duration: 0.8,
          ease: 'power2.out'
        }, 1.1)
        tl.to(chromaticRef.current.offset, {
          x: 0.025,
          y: 0.025,
          duration: 0.4,
          ease: 'power3.in'
        }, 2.5)
        tl.to(chromaticRef.current.offset, {
          x: 0.006,
          y: 0.006,
          duration: 1.2,
          ease: 'power2.out'
        }, 2.9)
        tl.to(chromaticRef.current.offset, {
          x: 0,
          y: 0,
          duration: 2.5,
          ease: 'power1.out'
        }, 6.5)

        tl.call(() => setBloomIntensity(2.8), [], 0.5)
        tl.call(() => setBloomIntensity(1.5), [], 2.0)
        tl.call(() => setBloomIntensity(2.5), [], 3.5)
        tl.call(() => setBloomIntensity(2.0), [], 5.0)
        tl.call(() => setBloomIntensity(1.8), [], 7.0)
        tl.call(() => setBloomIntensity(1.6), [], 9.0)

        tl.call(() => {
          if (controlsRef.current) {
            controlsRef.current.enabled = true
            controlsRef.current.enableDamping = true
            controlsRef.current.dampingFactor = 0.05
            controlsRef.current.minDistance = 4
            controlsRef.current.maxDistance = 18
            controlsRef.current.enablePan = false
          }
        }, [], 9.0)
      }, 100)
    },

    transitionToRecombination() {
      setShowRecombination(true)
      setShowCMB(true)

      setTimeout(() => {
        if (!chromaticRef.current) return

        setEpoch('recombination')
        controlsRef.current.enabled = false

        const tl = gsap.timeline()

        tl.to(universeRef.current.scale, {
          x: 1.2,
          y: 1.2,
          z: 1.2,
          duration: 3.0,
          ease: 'power2.inOut'
        }, 0)

        // Fade in CMB gradually as atoms form
        tl.to({ value: 0 }, {
          value: 0.6,
          duration: 8.0,
          ease: 'power2.in',
          onUpdate: function() {
            setCmbOpacity(this.targets()[0].value)
          }
        }, 4.0)

        // Chromatic aberration for the clearing
        tl.to(chromaticRef.current.offset, {
          x: 0.02,
          y: 0.02,
          duration: 0.5,
          ease: 'power2.in'
        }, 8.0)
        tl.to(chromaticRef.current.offset, {
          x: 0,
          y: 0,
          duration: 2.0,
          ease: 'power2.out'
        }, 8.5)

        // Bloom intensity journey
        tl.call(() => setBloomIntensity(2.2), [], 1.0)
        tl.call(() => setBloomIntensity(1.8), [], 4.0)
        tl.call(() => setBloomIntensity(1.5), [], 8.0)
        tl.call(() => setBloomIntensity(1.2), [], 11.0)

        // Enable controls at end
        tl.call(() => {
          if (controlsRef.current) {
            controlsRef.current.enabled = true
            controlsRef.current.enableDamping = true
            controlsRef.current.dampingFactor = 0.05
            controlsRef.current.minDistance = 10
            controlsRef.current.maxDistance = 40
            controlsRef.current.enablePan = false
          }
        }, [], 12.0)
      }, 100)
    }
  }))

  return (
    <>
      {showCMB && <CosmicMicrowaveBackground opacity={cmbOpacity} showFluctuations={true} animated={true} />}
      
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
        {showNucleosynthesis && <Nucleosynthesis isVisible={showNucleosynthesis} />}
        {showRecombination && (
          <Recombination 
            isVisible={showRecombination}
            onComplete={() => {
              console.log("Recombination phase complete - CMB is visible")
            }}
          />
        )}
      </group>
      <OrbitControls ref={controlsRef} />
    </>
  )
})
Scene.displayName = 'Scene'

export default Scene