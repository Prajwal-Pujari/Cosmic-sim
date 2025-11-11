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
import CosmicDawn from './CosmicDawn'


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
  const [darkAgesFadeIn, setDarkAgesFadeIn] = useState(0);
   const [showCosmicDawn, setShowCosmicDawn] = useState(false)
  const [cosmicDawnFadeIn, setCosmicDawnFadeIn] = useState(0);
  

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

  
   

transitionToDarkAges() {
  if (!chromaticRef.current) return
  
  setEpoch('darkages')
  controlsRef.current.enabled = false
  
 
  
  
  const tl = gsap.timeline({
    onComplete: () => {
      console.log("🌑 The Dark Ages - a universe waiting in silence")
    }
  })

 
  tl.to({ value: 0.85 }, {
    value: 0.35,
    duration: 4.0,
    ease: 'power1.inOut',
    onUpdate: function() {
      setCmbOpacity(this.targets()[0].value)
    }
  }, 0)

  // Camera pulls back smoothly - no sudden movements
  tl.to(camera.position, {
    x: 0,
    y: 3,
    z: -28,
    duration: 4.0,
    ease: 'power1.inOut'
  }, 0)

  tl.to(camera.rotation, {
    x: -0.08,
    y: Math.PI,
    z: 0,
    duration: 4.0,
    ease: 'power1.inOut'
  }, 0)

  tl.to(camera, {
    fov: 65,
    duration: 4.0,
    ease: 'power1.inOut',
    onUpdate: () => camera.updateProjectionMatrix()
  }, 0)

  tl.to(universeRef.current.scale, {
    x: 1.15,
    y: 1.15,
    z: 1.15,
    duration: 4.0,
    ease: 'power1.inOut'
  }, 0)

  // Subtle chromatic
  tl.to(chromaticRef.current.offset, {
    x: 0.01,
    y: 0.01,
    duration: 1.2,
    ease: 'power2.in'
  }, 1.0)

  tl.to(chromaticRef.current.offset, {
    x: 0.002,
    y: 0.002,
    duration: 2.8,
    ease: 'power1.out'
  }, 2.2)

  tl.call(() => setBloomIntensity(1.4), [], 0)
  tl.call(() => setBloomIntensity(0.8), [], 2.0)
  tl.call(() => setBloomIntensity(0.4), [], 3.5)

  // 🌑 TRANSITION: HIDE OLD, PREPARE NEW (4-5s)
  // Clean swap - hide everything at once
  tl.call(() => {
    setShowRecombination(false)
    setShowNucleosynthesis(false)
    setShowPlasma(false)
  }, [], 4.0)

  // Enable Dark Ages but with fadeIn=0 (invisible)
  tl.call(() => {
    setShowDarkAges(true)
    setDarkAgesFadeIn(0) // Start invisible
  }, [], 4.2)

  // CMB fades significantly
  tl.to({ value: 0.35 }, {
    value: 0.1,
    duration: 1.0,
    ease: 'power2.in',
    onUpdate: function() {
      setCmbOpacity(this.targets()[0].value)
    }
  }, 4.0)

  tl.call(() => setBloomIntensity(0.25), [], 4.5)


  tl.to(camera.position, {
    x: 0,
    y: -8,
    z: -38,
    duration: 5.0,
    ease: 'power1.inOut'
  }, 5.0)

  tl.to(camera.rotation, {
    x: 0.25,
    y: Math.PI,
    z: 0,
    duration: 5.0,
    ease: 'power1.inOut'
  }, 5.0)

  tl.to(camera, {
    fov: 72,
    duration: 5.0,
    ease: 'power1.out',
    onUpdate: () => camera.updateProjectionMatrix()
  }, 5.0)

  // Gradually reveal Dark Ages scene (0 to 1 over 5 seconds)
  tl.to({ value: 0 }, {
    value: 1,
    duration: 5.0,
    ease: 'power2.out',
    onUpdate: function() {
      setDarkAgesFadeIn(this.targets()[0].value)
    }
  }, 5.0)

  tl.to(universeRef.current.scale, {
    x: 1.4,
    y: 1.4,
    z: 1.4,
    duration: 5.0,
    ease: 'power1.out'
  }, 5.0)

  tl.to(universeRef.current.rotation, {
    x: Math.PI * 0.08,
    y: -Math.PI * 0.1,
    z: 0,
    duration: 5.0,
    ease: 'power1.inOut'
  }, 5.0)

  // CMB nearly invisible
  tl.to({ value: 0.1 }, {
    value: 0.03,
    duration: 5.0,
    ease: 'power2.in',
    onUpdate: function() {
      setCmbOpacity(this.targets()[0].value)
    }
  }, 5.0)

  tl.call(() => setBloomIntensity(0.2), [], 6.0)
  tl.call(() => setBloomIntensity(0.15), [], 9.0)


  tl.to(camera.position, {
    x: 25,
    y: -5,
    z: -28,
    duration: 8.0,
    ease: 'sine.inOut'
  }, 10.0)

  tl.to(camera.rotation, {
    x: 0.15,
    y: Math.PI * 1.35,
    z: 0.08,
    duration: 8.0,
    ease: 'sine.inOut'
  }, 10.0)

  tl.to(camera, {
    fov: 58,
    duration: 8.0,
    ease: 'sine.inOut',
    onUpdate: () => camera.updateProjectionMatrix()
  }, 10.0)

  tl.to(universeRef.current.rotation, {
    x: -Math.PI * 0.05,
    y: Math.PI * 0.25,
    z: -Math.PI * 0.03,
    duration: 8.0,
    ease: 'sine.inOut'
  }, 10.0)

  tl.to(universeRef.current.scale, {
    x: 1.7,
    y: 1.7,
    z: 1.7,
    duration: 8.0,
    ease: 'sine.inOut'
  }, 10.0)

  // CMB completely gone
  tl.to({ value: 0.03 }, {
    value: 0,
    duration: 8.0,
    ease: 'power1.in',
    onUpdate: function() {
      setCmbOpacity(this.targets()[0].value)
    }
  }, 10.0)

  tl.to(chromaticRef.current.offset, {
    x: 0.008,
    y: 0.008,
    duration: 0.8,
    ease: 'power2.in'
  }, 12.0)

  tl.to(chromaticRef.current.offset, {
    x: 0.001,
    y: 0.001,
    duration: 3.0,
    ease: 'power1.out'
  }, 12.8)

  tl.call(() => setBloomIntensity(0.12), [], 13.0)
  tl.call(() => setBloomIntensity(0.1), [], 17.0)

 
  tl.to(camera.position, {
    x: 8,
    y: 32,
    z: 22,
    duration: 8.0,
    ease: 'power2.out'
  }, 18.0)

  tl.to(camera.rotation, {
    x: -0.85,
    y: Math.PI * 0.22,
    z: 0.15,
    duration: 8.0,
    ease: 'power2.out'
  }, 18.0)

  tl.to(camera, {
    fov: 62,
    duration: 8.0,
    ease: 'power2.out',
    onUpdate: () => camera.updateProjectionMatrix()
  }, 18.0)

  tl.to(universeRef.current.rotation, {
    x: -Math.PI * 0.15,
    y: Math.PI * 0.18,
    z: -Math.PI * 0.08,
    duration: 8.0,
    ease: 'power2.out'
  }, 18.0)

  tl.to(universeRef.current.scale, {
    x: 1.9,
    y: 1.9,
    z: 1.9,
    duration: 8.0,
    ease: 'power2.out'
  }, 18.0)

  tl.call(() => setBloomIntensity(0.14), [], 20.0)
  tl.call(() => setBloomIntensity(0.18), [], 24.0)

 
  tl.to(camera.position, {
    x: 0,
    y: 8,
    z: 52,
    duration: 8.0,
    ease: 'power2.inOut'
  }, 26.0)

  tl.to(camera.rotation, {
    x: -0.12,
    y: 0,
    z: 0,
    duration: 8.0,
    ease: 'power2.inOut'
  }, 26.0)

  tl.to(camera, {
    fov: 48,
    duration: 8.0,
    ease: 'power2.inOut',
    onUpdate: () => camera.updateProjectionMatrix()
  }, 26.0)

  tl.to(universeRef.current.rotation, {
    x: 0,
    y: 0,
    z: 0,
    duration: 8.0,
    ease: 'power2.out'
  }, 26.0)

  tl.to(universeRef.current.scale, {
    x: 1.5,
    y: 1.5,
    z: 1.5,
    duration: 8.0,
    ease: 'power2.out'
  }, 26.0)

  // Final chromatic reset
  tl.to(chromaticRef.current.offset, {
    x: 0,
    y: 0,
    duration: 4.0,
    ease: 'power1.out'
  }, 30.0)

  tl.call(() => setBloomIntensity(0.15), [], 28.0)
  tl.call(() => setBloomIntensity(0.12), [], 31.0)
  tl.call(() => setBloomIntensity(0.1), [], 33.0)

  // 🎮 Enable smooth controls
  tl.call(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = true
      controlsRef.current.enableDamping = true
      controlsRef.current.dampingFactor = 0.04
      controlsRef.current.minDistance = 35
      controlsRef.current.maxDistance = 75
      controlsRef.current.enablePan = false
      controlsRef.current.maxPolarAngle = Math.PI * 0.75
      controlsRef.current.minPolarAngle = Math.PI * 0.25
      controlsRef.current.rotateSpeed = 0.4
    }
  }, [], 34.0)
} , 
 transitionToCosmicDawn() {
  if (!chromaticRef.current) return
  
  setEpoch('cosmicdawn')
  setShowPlasma(false)
  setShowRecombination(false)
  setShowNucleosynthesis(false)
  
  controlsRef.current.enabled = false
  
  const tl = gsap.timeline({
    onComplete: () => {
      console.log("🌟 Cosmic Dawn - Let there be light!")
    }
  })

 
 
  tl.to(camera.position, {
    x: 0,
    y: 120,
    z: 500,
    duration: 5.0,
    ease: 'power1.out'
  }, 0)

  tl.to(camera.rotation, {
    x: -0.3,
    y: 0,
    z: 0,
    duration: 5.0,
    ease: 'power1.out'
  }, 0)

  tl.to(camera, {
    fov: 55,
    duration: 5.0,
    ease: 'power1.out',
    onUpdate: () => camera.updateProjectionMatrix()
  }, 0)

  tl.to(universeRef.current.scale, {
    x: 1.0,
    y: 1.0,
    z: 1.0,
    duration: 5.0,
    ease: 'power1.out'
  }, 0)
  
  tl.call(() => setBloomIntensity(0.05), [], 0)

  
  // 🌫️ ACT I: BIRTH CLOUDS GATHER (5-8s)
  // Clouds appear in the darkness
  tl.call(() => {
    setShowCosmicDawn(true)
    setCosmicDawnFadeIn(0)
  }, [], 5.0)

  tl.to({ value: 0 }, {
    value: 1,
    duration: 3.0,
    ease: 'power2.in',
    onUpdate: function() {
      setCosmicDawnFadeIn(this.targets()[0].value)
    }
  }, 5.0)

  // Camera drifts closer to witness the clouds
  tl.to(camera.position, {
    x: -40,
    y: 60,
    z: 200,
    duration: 3.0,
    ease: 'sine.inOut'
  }, 5.0)

  tl.to(camera.rotation, {
    x: -0.28,
    y: -0.15,
    z: -0.05,
    duration: 3.0,
    ease: 'sine.inOut'
  }, 5.0)

  tl.call(() => setBloomIntensity(0.08), [], 6.0)
  tl.call(() => setBloomIntensity(0.12), [], 7.5)

 
  tl.to(camera.position, {
    x: -30,
    y: 50,
    z: 160,
    duration: 4.0,
    ease: 'power2.inOut'
  }, 8.0)

  tl.to(camera.rotation, {
    x: -0.3,
    y: -0.12,
    z: -0.03,
    duration: 4.0,
    ease: 'power2.inOut'
  }, 8.0)

  tl.to(camera, {
    fov: 58,
    duration: 4.0,
    ease: 'sine.inOut',
    onUpdate: () => camera.updateProjectionMatrix()
  }, 8.0)

  tl.call(() => setBloomIntensity(0.18), [], 8.5)
  tl.call(() => setBloomIntensity(0.25), [], 10.0)
  tl.call(() => setBloomIntensity(0.35), [], 11.5)


  

  tl.call(() => setBloomIntensity(5.5), [], 12.0)
  tl.to(chromaticRef.current.offset, {
    x: 0.08,
    y: 0.08,
    duration: 0.1,
    ease: 'power4.in'
  }, 12.0)

  // Camera BLOWN BACK by the explosion force
  tl.to(camera.position, {
    x: 0,
    y: 100,
    z: 550,  // BLOWN WAY BACK!
    duration: 2.0,
    ease: 'power4.out'  // Explosive pushback
  }, 12.0)

  tl.to(camera.rotation, {
    x: -0.18,
    y: 0,
    z: 0,
    duration: 2.0,
    ease: 'power4.out'
  }, 12.0)

  tl.to(camera, {
    fov: 65,  // Wider FOV from the blast
    duration: 2.0,
    ease: 'power4.out',
    onUpdate: () => camera.updateProjectionMatrix()
  }, 12.0)

  // Bloom starts falling immediately after peak
  tl.call(() => setBloomIntensity(3.5), [], 12.2)
  tl.call(() => setBloomIntensity(2.5), [], 12.8)
  tl.call(() => setBloomIntensity(1.8), [], 13.5)

  tl.to(chromaticRef.current.offset, {
    x: 0.015,
    y: 0.015,
    duration: 2.0,
    ease: 'power2.out'
  }, 12.1)

 
  tl.to(camera.position, {
    x: 60,
    y: 70,
    z: 220,  // Coming back but still far
    duration: 8.0,
    ease: 'power2.inOut'
  }, 16.0)

  tl.to(camera.rotation, {
    x: -0.35,
    y: Math.PI * 0.2,
    z: 0.08,
    duration: 8.0,
    ease: 'power2.inOut'
  }, 16.0)

  tl.to(camera, {
    fov: 58,
    duration: 8.0,
    ease: 'power2.inOut',
    onUpdate: () => camera.updateProjectionMatrix()
  }, 16.0)

  tl.to(universeRef.current.rotation, {
    x: Math.PI * 0.08,
    y: -Math.PI * 0.15,
    z: Math.PI * 0.03,
    duration: 8.0,
    ease: 'power1.inOut'
  }, 16.0)

  // Multiple secondary ignition waves
  tl.call(() => setBloomIntensity(2.8), [], 17.5)
  tl.to(chromaticRef.current.offset, {
    x: 0.028,
    y: 0.028,
    duration: 0.5,
    ease: 'power3.in'
  }, 18.0)
  tl.to(chromaticRef.current.offset, {
    x: 0.008,
    y: 0.008,
    duration: 1.8,
    ease: 'power2.out'
  }, 18.5)

  tl.call(() => setBloomIntensity(3.2), [], 19.5)
  tl.to(chromaticRef.current.offset, {
    x: 0.035,
    y: 0.035,
    duration: 0.6,
    ease: 'power3.in'
  }, 20.0)
  tl.to(chromaticRef.current.offset, {
    x: 0.01,
    y: 0.01,
    duration: 2.0,
    ease: 'power2.out'
  }, 20.6)

  tl.call(() => setBloomIntensity(2.6), [], 22.0)

 
  tl.to(camera.position, {
    x: -80,
    y: 60,
    z: 180,
    duration: 8.0,
    ease: 'power1.inOut'
  }, 24.0)

  tl.to(camera.rotation, {
    x: -0.32,
    y: -Math.PI * 0.28,
    z: -0.08,
    duration: 8.0,
    ease: 'power1.inOut'
  }, 24.0)

  tl.to(camera, {
    fov: 56,
    duration: 8.0,
    ease: 'sine.inOut',
    onUpdate: () => camera.updateProjectionMatrix()
  }, 24.0)

  tl.to(universeRef.current.rotation, {
    x: -Math.PI * 0.1,
    y: Math.PI * 0.22,
    z: -Math.PI * 0.05,
    duration: 8.0,
    ease: 'power1.inOut'
  }, 24.0)

  // Peak cluster ignitions
  tl.call(() => setBloomIntensity(3.5), [], 25.5)
  tl.to(chromaticRef.current.offset, {
    x: 0.038,
    y: 0.038,
    duration: 0.7,
    ease: 'power4.in'
  }, 26.0)
  tl.to(chromaticRef.current.offset, {
    x: 0.01,
    y: 0.01,
    duration: 2.5,
    ease: 'power2.out'
  }, 26.7)

  tl.call(() => setBloomIntensity(3.0), [], 28.0)
  tl.call(() => setBloomIntensity(2.5), [], 30.0)


  tl.to(camera.position, {
    x: 0,
    y: 90,
    z: 200,  // Final comfortable viewing distance
    duration: 10.0,
    ease: 'power2.out'
  }, 32.0)

  tl.to(camera.rotation, {
    x: -0.42,
    y: 0,
    z: 0,
    duration: 10.0,
    ease: 'power2.out'
  }, 32.0)

  tl.to(camera, {
    fov: 60,
    duration: 10.0,
    ease: 'power2.out',
    onUpdate: () => camera.updateProjectionMatrix()
  }, 32.0)

  tl.to(universeRef.current.rotation, {
    x: 0,
    y: 0,
    z: 0,
    duration: 10.0,
    ease: 'power2.out'
  }, 32.0)

  tl.to(universeRef.current.scale, {
    x: 1.2,
    y: 1.2,
    z: 1.2,
    duration: 10.0,
    ease: 'power2.out'
  }, 32.0)

  // Final chromatic cleanup
  tl.to(chromaticRef.current.offset, {
    x: 0,
    y: 0,
    duration: 6.0,
    ease: 'power1.out'
  }, 34.0)

  // Bloom settles
  tl.call(() => setBloomIntensity(2.2), [], 34.0)
  tl.call(() => setBloomIntensity(2.0), [], 37.0)
  tl.call(() => setBloomIntensity(1.8), [], 40.0)

  // 🎮 Enable elegant controls
  tl.call(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = true
      controlsRef.current.enableDamping = true
      controlsRef.current.dampingFactor = 0.05
      controlsRef.current.minDistance = 100
      controlsRef.current.maxDistance = 350
      controlsRef.current.enablePan = false
      controlsRef.current.maxPolarAngle = Math.PI * 0.7
      controlsRef.current.minPolarAngle = Math.PI * 0.3
      controlsRef.current.rotateSpeed = 0.4
    }
  }, [], 42.0)
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
            fadeIn={darkAgesFadeIn}
            onComplete={() => {
              console.log("🌑 The Dark Ages settle - silence before the first stars...")
            }}
          />
        )}
        {showCosmicDawn && (
          <CosmicDawn
            isVisible={showCosmicDawn}
            fadeIn={cosmicDawnFadeIn}
            onComplete={() => {
              console.log("🌟 Cosmic Dawn complete - The first stars illuminate the universe!")
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