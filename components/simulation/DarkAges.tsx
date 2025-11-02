import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface DarkAgesProps {
  isVisible: boolean
  onComplete?: () => void
}

const DarkAges = ({ isVisible }: DarkAgesProps) => {
  const darknessRef = useRef<THREE.Points>(null!)
  const tinyStarsRef = useRef<THREE.Points>(null!)
  const dustCloudsRef = useRef<THREE.Points>(null!)
  const nebulaCloudsRef = useRef<THREE.Points>(null!)
  const timeRef = useRef(0)

  // Create custom circular sprite texture for soft, round particles
  const createCircleTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)')
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.3)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }

  const circleTexture = useMemo(() => createCircleTexture(), [])

  // Ultra-dark void particles - the emptiness itself
  const darknessParticles = useMemo(() => {
    const count = 12000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const opacity = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const radius = 5 + Math.random() * 35
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)

      // Extremely dark - nearly invisible particles
      const darkness = Math.random() * 0.03
      colors[i3] = 0.01 + darkness * 0.2      // Hint of blue
      colors[i3 + 1] = 0.005 + darkness * 0.1  // Almost no green
      colors[i3 + 2] = 0.015 + darkness * 0.3  // Slight purple

      sizes[i] = 0.4 + Math.random() * 1.8
      opacity[i] = 0.15 + Math.random() * 0.25
    }
    return { positions, colors, sizes, opacity }
  }, [])

  // Rare, distant proto-stars - pinpricks of hope
  const tinyStars = useMemo(() => {
    const count = 800  // Fewer stars = more isolation
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const phases = new Float32Array(count)
    const baseOpacity = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const radius = 15 + Math.random() * 30
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)

      const warmth = Math.random()
      if (warmth > 0.85) {
        // Very rare warm spots - nascent hydrogen clouds
        colors[i3] = 0.6 + Math.random() * 0.3
        colors[i3 + 1] = 0.3 + Math.random() * 0.2
        colors[i3 + 2] = 0.15 + Math.random() * 0.15
        baseOpacity[i] = 0.5 + Math.random() * 0.3
      } else if (warmth > 0.7) {
        // Rare medium glow
        colors[i3] = 0.25 + Math.random() * 0.2
        colors[i3 + 1] = 0.18 + Math.random() * 0.15
        colors[i3 + 2] = 0.2 + Math.random() * 0.15
        baseOpacity[i] = 0.3 + Math.random() * 0.2
      } else {
        // Most are extremely faint
        colors[i3] = 0.08 + Math.random() * 0.1
        colors[i3 + 1] = 0.05 + Math.random() * 0.08
        colors[i3 + 2] = 0.1 + Math.random() * 0.12
        baseOpacity[i] = 0.15 + Math.random() * 0.15
      }
      
      sizes[i] = 0.2 + Math.random() * 0.6
      phases[i] = Math.random() * Math.PI * 2
    }
    return { positions, colors, sizes, phases, baseOpacity }
  }, [])

  // Ethereal dust clouds - cosmic fog
  const dustClouds = useMemo(() => {
    const count = 5000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const opacity = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const radius = 4 + Math.random() * 25
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)

      const dustShade = Math.random() * 0.02
      colors[i3] = 0.02 + dustShade
      colors[i3 + 1] = 0.01 + dustShade * 0.6
      colors[i3 + 2] = 0.025 + dustShade * 0.8

      sizes[i] = 2.0 + Math.random() * 4.0
      opacity[i] = 0.08 + Math.random() * 0.12
    }
    return { positions, colors, sizes, opacity }
  }, [])

  // Wispy nebula clouds - adding depth and beauty
  const nebulaClouds = useMemo(() => {
    const count = 3000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const opacity = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const radius = 8 + Math.random() * 20
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)

      // Deep blue-purple nebula wisps
      const nebulaShade = Math.random() * 0.04
      colors[i3] = 0.015 + nebulaShade * 0.5
      colors[i3 + 1] = 0.008 + nebulaShade * 0.3
      colors[i3 + 2] = 0.03 + nebulaShade * 1.2

      sizes[i] = 3.0 + Math.random() * 6.0
      opacity[i] = 0.05 + Math.random() * 0.08
    }
    return { positions, colors, sizes, opacity }
  }, [])

  useFrame((state, delta) => {
    if (!isVisible) return
    
    timeRef.current += delta

    // Ultra-slow, organic rotation for darkness
    if (darknessRef.current) {
      darknessRef.current.rotation.y += delta * 0.008
      darknessRef.current.rotation.x += delta * 0.003
      darknessRef.current.rotation.z += delta * 0.002
    }

    // Gentle pulsing for rare stars - like breathing
    if (tinyStarsRef.current) {
      const geometry = tinyStarsRef.current.geometry
      const sizes = geometry.attributes.size.array as Float32Array
      const phases = tinyStars.phases

      for (let i = 0; i < phases.length; i++) {
        const pulse = Math.sin(timeRef.current * 0.3 + phases[i]) * 0.5 + 0.5
        const breathe = Math.sin(timeRef.current * 0.15 + phases[i] * 0.5) * 0.3 + 0.7
        sizes[i] = tinyStars.sizes[i] * (0.7 + pulse * 0.5) * breathe
      }
      geometry.attributes.size.needsUpdate = true
      tinyStarsRef.current.rotation.y -= delta * 0.012
      tinyStarsRef.current.rotation.x += delta * 0.004
    }

    // Ethereal drift for dust
    if (dustCloudsRef.current) {
      dustCloudsRef.current.rotation.y += delta * 0.006
      dustCloudsRef.current.rotation.z += delta * 0.002
      dustCloudsRef.current.rotation.x -= delta * 0.001
    }

    // Nebula slow swirl
    if (nebulaCloudsRef.current) {
      nebulaCloudsRef.current.rotation.y -= delta * 0.004
      nebulaCloudsRef.current.rotation.x += delta * 0.002
      nebulaCloudsRef.current.rotation.z += delta * 0.003
    }
  })

  if (!isVisible) return null

  return (
    <group>
      {/* The void - ultra-dark particles */}
      <points ref={darknessRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[darknessParticles.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[darknessParticles.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[darknessParticles.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={1.2}
          vertexColors
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={circleTexture}
        />
      </points>

      {/* Rare proto-stars - pinpricks of light */}
      <points ref={tinyStarsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[tinyStars.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[tinyStars.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[tinyStars.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.4}
          vertexColors
          transparent
          opacity={0.8}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={circleTexture}
        />
      </points>

      {/* Ethereal dust clouds */}
      <points ref={dustCloudsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dustClouds.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[dustClouds.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[dustClouds.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={3.5}
          vertexColors
          transparent
          opacity={0.25}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={circleTexture}
        />
      </points>

      {/* Wispy nebula clouds */}
      <points ref={nebulaCloudsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nebulaClouds.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[nebulaClouds.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[nebulaClouds.sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={5.0}
          vertexColors
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          map={circleTexture}
        />
      </points>

      {/* Deep darkness ambient light */}
      <ambientLight intensity={0.02} color="#050510" />
      <pointLight position={[0, 0, 0]} intensity={0.05} color="#0a0a1a" distance={60} decay={2} />
      
      {/* Subtle rim light for depth */}
      <pointLight position={[30, 20, -30]} intensity={0.03} color="#0d0d25" distance={80} decay={2} />
      <pointLight position={[-30, -20, 30]} intensity={0.02} color="#0a0a1f" distance={80} decay={2} />
    </group>
  )
}

export default DarkAges