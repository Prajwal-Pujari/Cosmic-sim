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
import DarkAges from './DarkAges'


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
  const [showDarkAges, setShowDarkAges] = useState(false)

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
      if (!chromaticRef.current) return
      
      // Disable controls immediately for smooth transition
      controlsRef.current.enabled = false

      //  setShowRecombination(false)
  // setShowNucleosynthesis(false)
  // setShowPlasma(false)
      
      const tl = gsap.timeline()

      // 🎬 ACT I: GENTLE RETREAT (0-2.5s)
      // Smoothly pull back from nucleosynthesis - establishing shot
      tl.to(camera.position, {
        x: 0,
        y: 1,
        z: 10,
        duration: 2.5,
        ease: 'power1.inOut'
      }, 0)

      tl.to(camera.rotation, {
        x: -0.05,
        y: 0,
        z: 0,
        duration: 2.5,
        ease: 'power1.inOut'
      }, 0)

      tl.to(camera, {
        fov: 60,
        duration: 2.5,
        ease: 'sine.inOut',
        onUpdate: () => camera.updateProjectionMatrix()
      }, 0)

      tl.to(universeRef.current.scale, {
        x: 1.0,
        y: 1.0,
        z: 1.0,
        duration: 2.5,
        ease: 'power1.inOut'
      }, 0)

      tl.to(universeRef.current.rotation, {
        x: 0,
        y: 0,
        z: 0,
        duration: 2.5,
        ease: 'power1.inOut'
      }, 0)

      // Subtle chromatic hint
      tl.to(chromaticRef.current.offset, {
        x: 0.008,
        y: 0.008,
        duration: 1.0,
        ease: 'power2.in'
      }, 0.5)

      tl.to(chromaticRef.current.offset, {
        x: 0,
        y: 0,
        duration: 1.5,
        ease: 'power2.out'
      }, 1.5)

      tl.call(() => setBloomIntensity(1.8), [], 0)
      tl.call(() => setBloomIntensity(2.0), [], 2.0)

      // 🌟 ACT II: DRAMATIC ASCENT (2.5-6.5s)
      // Epic vertical rise - God's eye view
      tl.to(camera.position, {
        x: 0,
        y: 16,
        z: 28,
        duration: 4.0,
        ease: 'power2.out'
      }, 2.5)

      tl.to(camera.rotation, {
        x: -0.5,
        y: 0,
        z: 0,
        duration: 4.0,
        ease: 'power2.out'
      }, 2.5)

      tl.to(camera, {
        fov: 80,
        duration: 4.0,
        ease: 'power2.out',
        onUpdate: () => camera.updateProjectionMatrix()
      }, 2.5)

      // Enable new elements during ascent
      tl.call(() => {
        setShowRecombination(true)
        setShowCMB(true)
        setEpoch('recombination')
      }, [], 3.5)

      // Universe shrinks slightly for scale
      tl.to(universeRef.current.scale, {
        x: 0.9,
        y: 0.9,
        z: 0.9,
        duration: 4.0,
        ease: 'power2.out'
      }, 2.5)

      // Initial chromatic burst
      tl.to(chromaticRef.current.offset, {
        x: 0.035,
        y: 0.035,
        duration: 0.5,
        ease: 'power4.in'
      }, 3.0)

      tl.to(chromaticRef.current.offset, {
        x: 0.012,
        y: 0.012,
        duration: 1.5,
        ease: 'power2.out'
      }, 3.5)

      tl.call(() => setBloomIntensity(3.0), [], 3.5)
      tl.call(() => setBloomIntensity(2.2), [], 5.5)

      // 🎭 ACT III: SWEEPING ORBITAL ARC (6.5-12.0s)
      // Cinematic right-side sweep with perfect parallax
      tl.to(camera.position, {
        x: 22,
        y: 12,
        z: 18,
        duration: 5.5,
        ease: 'power1.inOut'
      }, 6.5)

      tl.to(camera.rotation, {
        x: -0.45,
        y: Math.PI * 0.5,
        z: 0.12,
        duration: 5.5,
        ease: 'power1.inOut'
      }, 6.5)

      tl.to(camera, {
        fov: 50,
        duration: 5.5,
        ease: 'sine.inOut',
        onUpdate: () => camera.updateProjectionMatrix()
      }, 6.5)

      // Counter-rotate universe for depth
      tl.to(universeRef.current.rotation, {
        x: Math.PI * 0.1,
        y: -Math.PI * 0.3,
        z: Math.PI * 0.03,
        duration: 5.5,
        ease: 'power1.inOut'
      }, 6.5)

      // Expand universe during sweep
      tl.to(universeRef.current.scale, {
        x: 1.3,
        y: 1.3,
        z: 1.3,
        duration: 5.5,
        ease: 'sine.inOut'
      }, 6.5)

      // CMB fades in gently
      tl.to({ value: 0 }, {
        value: 0.2,
        duration: 5.5,
        ease: 'power2.in',
        onUpdate: function() {
          setCmbOpacity(this.targets()[0].value)
        }
      }, 6.5)

      // Mid-sweep chromatic pulse
      tl.to(chromaticRef.current.offset, {
        x: 0.025,
        y: 0.025,
        duration: 0.6,
        ease: 'power3.in'
      }, 8.5)

      tl.to(chromaticRef.current.offset, {
        x: 0.006,
        y: 0.006,
        duration: 2.0,
        ease: 'power2.out'
      }, 9.1)

      tl.call(() => setBloomIntensity(2.7), [], 7.5)
      tl.call(() => setBloomIntensity(2.3), [], 10.0)

      // 🌊 ACT IV: FLOWING DIVE TO REAR (12.0-18.0s)
      // Smooth dive while completing hemisphere - money shot!
      tl.to(camera.position, {
        x: 12,
        y: 8,
        z: -10,
        duration: 6.0,
        ease: 'power2.inOut'
      }, 12.0)

      tl.to(camera.rotation, {
        x: -0.35,
        y: Math.PI * 0.9,
        z: 0.05,
        duration: 6.0,
        ease: 'power2.inOut'
      }, 12.0)

      tl.to(camera, {
        fov: 60,
        duration: 6.0,
        ease: 'power2.inOut',
        onUpdate: () => camera.updateProjectionMatrix()
      }, 12.0)

      // Universe continues counter-rotation
      tl.to(universeRef.current.rotation, {
        x: -Math.PI * 0.08,
        y: Math.PI * 0.2,
        z: -Math.PI * 0.02,
        duration: 6.0,
        ease: 'power2.inOut'
      }, 12.0)

      // Scale pulses
      tl.to(universeRef.current.scale, {
        x: 1.45,
        y: 1.45,
        z: 1.45,
        duration: 6.0,
        ease: 'sine.inOut'
      }, 12.0)

      // CMB intensifies
      tl.to({ value: 0.2 }, {
        value: 0.55,
        duration: 6.0,
        ease: 'power2.out',
        onUpdate: function() {
          setCmbOpacity(this.targets()[0].value)
        }
      }, 12.0)

      // Chromatic wave
      tl.to(chromaticRef.current.offset, {
        x: 0.038,
        y: 0.038,
        duration: 0.8,
        ease: 'power4.in'
      }, 13.5)

      tl.to(chromaticRef.current.offset, {
        x: 0.008,
        y: 0.008,
        duration: 2.5,
        ease: 'power2.out'
      }, 14.3)

      tl.call(() => setBloomIntensity(2.8), [], 13.0)
      tl.call(() => setBloomIntensity(2.1), [], 16.0)

      // 🎆 ACT V: GRAND FINALE - REAR VIEW (18.0-24.0s)
      // Complete 180° and settle into majestic rear view
      tl.to(camera.position, {
        x: 0,
        y: 4,
        z: -26,
        duration: 6.0,
        ease: 'power2.out'
      }, 18.0)

      tl.to(camera.rotation, {
        x: -0.15,
        y: Math.PI,
        z: 0,
        duration: 6.0,
        ease: 'power2.out'
      }, 18.0)

      tl.to(camera, {
        fov: 68,
        duration: 6.0,
        ease: 'power2.out',
        onUpdate: () => camera.updateProjectionMatrix()
      }, 18.0)

      // Universe settles into perfect frame
      tl.to(universeRef.current.rotation, {
        x: 0,
        y: 0,
        z: 0,
        duration: 6.0,
        ease: 'power2.out'
      }, 18.0)

      tl.to(universeRef.current.scale, {
        x: 1.1,
        y: 1.1,
        z: 1.1,
        duration: 6.0,
        ease: 'power2.out'
      }, 18.0)

      // CMB reaches full glory
      tl.to({ value: 0.55 }, {
        value: 0.85,
        duration: 6.0,
        ease: 'power2.out',
        onUpdate: function() {
          setCmbOpacity(this.targets()[0].value)
        }
      }, 18.0)

      // Final chromatic flourish
      tl.to(chromaticRef.current.offset, {
        x: 0.022,
        y: 0.022,
        duration: 0.5,
        ease: 'power4.in'
      }, 18.5)

      tl.to(chromaticRef.current.offset, {
        x: 0,
        y: 0,
        duration: 4.5,
        ease: 'power1.out'
      }, 19.0)

      tl.call(() => setBloomIntensity(2.4), [], 19.0)
      tl.call(() => setBloomIntensity(1.8), [], 21.5)
      tl.call(() => setBloomIntensity(1.4), [], 23.5)

      // 🎮 Enable elegant controls
      tl.call(() => {
        if (controlsRef.current) {
          controlsRef.current.enabled = true
          controlsRef.current.enableDamping = true
          controlsRef.current.dampingFactor = 0.04
          controlsRef.current.minDistance = 16
          controlsRef.current.maxDistance = 50
          controlsRef.current.enablePan = false
          controlsRef.current.maxPolarAngle = Math.PI * 0.8
          controlsRef.current.minPolarAngle = Math.PI * 0.2
        }
      }, [], 24.0)
    },

  
     // Replace your transitionToDarkAges function with this improved version:

transitionToDarkAges() {
  if (!chromaticRef.current) return
  
  setEpoch('darkages')
  controlsRef.current.enabled = false
  
  const tl = gsap.timeline({
    onComplete: () => {
      console.log("🌑 The Dark Ages begin - a silent universe awaits...")
    }
  })

  // 🎬 PROLOGUE: THE FADING (0-5s)
  // CMB slowly dims, recombination particles fade away
  tl.to({ value: 0.85 }, {
    value: 0.3,
    duration: 5.0,
    ease: 'power2.in',
    onUpdate: function() {
      setCmbOpacity(this.targets()[0].value)
    }
  }, 0)

  // Camera begins slow, contemplative drift backward
  tl.to(camera.position, {
    x: 0,
    y: 3,
    z: -28,
    duration: 5.0,
    ease: 'power1.inOut'
  }, 0)

  tl.to(camera.rotation, {
    x: -0.1,
    y: Math.PI,
    z: 0,
    duration: 5.0,
    ease: 'power1.inOut'
  }, 0)

  tl.to(camera, {
    fov: 70,
    duration: 5.0,
    ease: 'sine.in',
    onUpdate: () => camera.updateProjectionMatrix()
  }, 0)

  tl.to(universeRef.current.scale, {
    x: 1.2,
    y: 1.2,
    z: 1.2,
    duration: 5.0,
    ease: 'power1.in'
  }, 0)

  // Subtle chromatic as things fade
  tl.to(chromaticRef.current.offset, {
    x: 0.015,
    y: 0.015,
    duration: 1.5,
    ease: 'power2.in'
  }, 1.0)

  tl.to(chromaticRef.current.offset, {
    x: 0.003,
    y: 0.003,
    duration: 3.5,
    ease: 'power2.out'
  }, 2.5)

  tl.call(() => setBloomIntensity(1.2), [], 0)
  tl.call(() => setBloomIntensity(0.7), [], 2.5)
  tl.call(() => setBloomIntensity(0.3), [], 4.5)

  // 🌑 TRANSITION: Hide recombination, reveal darkness (5-7s)
  tl.call(() => {
    setShowRecombination(false)
    setShowNucleosynthesis(false)
    setShowPlasma(false)
  }, [], 5.0)

  tl.call(() => setShowDarkAges(true), [], 5.5)

  // Camera continues pulling back as darkness emerges
  tl.to(camera.position, {
    x: 0,
    y: 1,
    z: -35,
    duration: 2.0,
    ease: 'power2.in'
  }, 5.0)

  tl.to(camera, {
    fov: 75,
    duration: 2.0,
    ease: 'power2.in',
    onUpdate: () => camera.updateProjectionMatrix()
  }, 5.0)

  tl.to(universeRef.current.scale, {
    x: 1.4,
    y: 1.4,
    z: 1.4,
    duration: 2.0,
    ease: 'power2.out'
  }, 5.0)

  // CMB fades to barely visible
  tl.to({ value: 0.3 }, {
    value: 0.08,
    duration: 2.0,
    ease: 'power3.in',
    onUpdate: function() {
      setCmbOpacity(this.targets()[0].value)
    }
  }, 5.0)

  tl.call(() => setBloomIntensity(0.2), [], 6.0)

  // 🌌 ACT I: DESCENT INTO DARKNESS (7-13s)
  // Dramatic downward dive - feeling the emptiness
  tl.to(camera.position, {
    x: -10,
    y: -20,
    z: -40,
    duration: 6.0,
    ease: 'power2.inOut'
  }, 7.0)

  tl.to(camera.rotation, {
    x: 0.65,
    y: Math.PI * 1.18,
    z: -0.25,
    duration: 6.0,
    ease: 'power2.inOut'
  }, 7.0)

  tl.to(camera, {
    fov: 88,
    duration: 6.0,
    ease: 'power3.out',
    onUpdate: () => camera.updateProjectionMatrix()
  }, 7.0)

  // Universe expands into void
  tl.to(universeRef.current.scale, {
    x: 1.7,
    y: 1.7,
    z: 1.7,
    duration: 6.0,
    ease: 'power2.out'
  }, 7.0)

  tl.to(universeRef.current.rotation, {
    x: Math.PI * 0.18,
    y: -Math.PI * 0.22,
    z: Math.PI * 0.1,
    duration: 6.0,
    ease: 'power1.inOut'
  }, 7.0)

  // CMB nearly gone
  tl.to({ value: 0.08 }, {
    value: 0.02,
    duration: 6.0,
    ease: 'power3.in',
    onUpdate: function() {
      setCmbOpacity(this.targets()[0].value)
    }
  }, 7.0)

  tl.to(chromaticRef.current.offset, {
    x: 0.02,
    y: 0.02,
    duration: 0.8,
    ease: 'power2.in'
  }, 8.5)

  tl.to(chromaticRef.current.offset, {
    x: 0.002,
    y: 0.002,
    duration: 3.0,
    ease: 'power2.out'
  }, 9.3)

  tl.call(() => setBloomIntensity(0.15), [], 9.0)
  tl.call(() => setBloomIntensity(0.1), [], 12.0)

  // 🕳️ ACT II: THE LONELY SPIRAL (13-21s)
  // Haunting lateral spiral around the void
  tl.to(camera.position, {
    x: 30,
    y: -10,
    z: -22,
    duration: 8.0,
    ease: 'sine.inOut'
  }, 13.0)

  tl.to(camera.rotation, {
    x: 0.3,
    y: Math.PI * 1.68,
    z: 0.18,
    duration: 8.0,
    ease: 'sine.inOut'
  }, 13.0)

  tl.to(camera, {
    fov: 55,
    duration: 8.0,
    ease: 'power2.inOut',
    onUpdate: () => camera.updateProjectionMatrix()
  }, 13.0)

  tl.to(universeRef.current.rotation, {
    x: -Math.PI * 0.12,
    y: Math.PI * 0.42,
    z: -Math.PI * 0.06,
    duration: 8.0,
    ease: 'sine.inOut'
  }, 13.0)

  tl.to(universeRef.current.scale, {
    x: 2.0,
    y: 2.0,
    z: 2.0,
    duration: 8.0,
    ease: 'sine.inOut'
  }, 13.0)

  tl.to({ value: 0.02 }, {
    value: 0,
    duration: 8.0,
    ease: 'power3.inOut',
    onUpdate: function() {
      setCmbOpacity(this.targets()[0].value)
    }
  }, 13.0)

  tl.to(chromaticRef.current.offset, {
    x: 0.014,
    y: 0.014,
    duration: 1.2,
    ease: 'power2.in'
  }, 15.0)

  tl.to(chromaticRef.current.offset, {
    x: 0.001,
    y: 0.001,
    duration: 4.0,
    ease: 'power1.out'
  }, 16.2)

  tl.call(() => setBloomIntensity(0.12), [], 15.0)
  tl.call(() => setBloomIntensity(0.08), [], 19.0)

  // 👁️ ACT III: THE OBLIQUE WITNESS (21-29s)
  // Dutch angle - asymmetric, unsettling view
  tl.to(camera.position, {
    x: -38,
    y: -24,
    z: 10,
    duration: 8.0,
    ease: 'power2.inOut'
  }, 21.0)

  tl.to(camera.rotation, {
    x: 0.8,
    y: Math.PI * 0.32,
    z: -0.32,
    duration: 8.0,
    ease: 'power2.inOut'
  }, 21.0)

  tl.to(camera, {
    fov: 98,
    duration: 8.0,
    ease: 'power3.out',
    onUpdate: () => camera.updateProjectionMatrix()
  }, 21.0)

  tl.to(universeRef.current.rotation, {
    x: Math.PI * 0.25,
    y: -Math.PI * 0.18,
    z: Math.PI * 0.15,
    duration: 8.0,
    ease: 'power1.inOut'
  }, 21.0)

  tl.to(universeRef.current.scale, {
    x: 2.4,
    y: 2.4,
    z: 2.4,
    duration: 8.0,
    ease: 'power2.out'
  }, 21.0)

  tl.to(chromaticRef.current.offset, {
    x: 0.01,
    y: 0.01,
    duration: 0.7,
    ease: 'power3.in'
  }, 23.5)

  tl.to(chromaticRef.current.offset, {
    x: 0,
    y: 0,
    duration: 4.0,
    ease: 'power1.out'
  }, 24.2)

  tl.call(() => setBloomIntensity(0.1), [], 23.0)
  tl.call(() => setBloomIntensity(0.06), [], 27.0)

  // 🌀 ACT IV: ASCENT FROM THE ABYSS (29-37s)
  // Rising from below - emergence perspective
  tl.to(camera.position, {
    x: 15,
    y: 35,
    z: 28,
    duration: 8.0,
    ease: 'power2.out'
  }, 29.0)

  tl.to(camera.rotation, {
    x: -0.9,
    y: Math.PI * 0.18,
    z: 0.12,
    duration: 8.0,
    ease: 'power2.out'
  }, 29.0)

  tl.to(camera, {
    fov: 62,
    duration: 8.0,
    ease: 'power2.out',
    onUpdate: () => camera.updateProjectionMatrix()
  }, 29.0)

  tl.to(universeRef.current.rotation, {
    x: -Math.PI * 0.2,
    y: Math.PI * 0.28,
    z: -Math.PI * 0.08,
    duration: 8.0,
    ease: 'power2.out'
  }, 29.0)

  tl.to(universeRef.current.scale, {
    x: 1.8,
    y: 1.8,
    z: 1.8,
    duration: 8.0,
    ease: 'power2.inOut'
  }, 29.0)

  tl.call(() => setBloomIntensity(0.12), [], 31.0)
  tl.call(() => setBloomIntensity(0.18), [], 35.0)

  // 🎭 ACT V: THE GRAND VOID (37-45s)
  // Final establishing shot - far, contemplative, centered
  tl.to(camera.position, {
    x: 0,
    y: 10,
    z: 58,
    duration: 8.0,
    ease: 'power2.inOut'
  }, 37.0)

  tl.to(camera.rotation, {
    x: -0.15,
    y: 0,
    z: 0,
    duration: 8.0,
    ease: 'power2.inOut'
  }, 37.0)

  tl.to(camera, {
    fov: 45,
    duration: 8.0,
    ease: 'power2.inOut',
    onUpdate: () => camera.updateProjectionMatrix()
  }, 37.0)

  tl.to(universeRef.current.rotation, {
    x: 0,
    y: 0,
    z: 0,
    duration: 8.0,
    ease: 'power2.out'
  }, 37.0)

  tl.to(universeRef.current.scale, {
    x: 1.5,
    y: 1.5,
    z: 1.5,
    duration: 8.0,
    ease: 'power2.out'
  }, 37.0)

  tl.call(() => setBloomIntensity(0.15), [], 39.0)
  tl.call(() => setBloomIntensity(0.12), [], 42.0)
  tl.call(() => setBloomIntensity(0.1), [], 44.0)

  // 🎮 Enable contemplative controls
  tl.call(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = true
      controlsRef.current.enableDamping = true
      controlsRef.current.dampingFactor = 0.03
      controlsRef.current.minDistance = 30
      controlsRef.current.maxDistance = 80
      controlsRef.current.enablePan = false
      controlsRef.current.maxPolarAngle = Math.PI * 0.75
      controlsRef.current.minPolarAngle = Math.PI * 0.25
      controlsRef.current.rotateSpeed = 0.3
    }
  }, [], 45.0)
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
              console.log("🌟 180° rotation complete - Viewing from the other side!")
            }}
          />
        )}
        {showDarkAges && (
          <DarkAges
            isVisible={showDarkAges}
            onComplete={() => {
              console.log("🌑 The Dark Ages settle - silence before the first stars...")
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