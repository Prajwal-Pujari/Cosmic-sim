'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

// ─── Scene Constants ─────────────────────────────────────────────────────────
const STREAM_COUNT = 15000       // Streaming particles flying toward camera
const FIELD_COUNT = 10000        // Static/slow bokeh field (the Petrova Line body)
const TAIL_COUNT = 15000         // Far tail of the Petrova Line structure
const CLOSE_BOKEH_COUNT = 300    // Large foreground bokeh
const STAR_COUNT = 5000          // Background stars

// Streaming tunnel — particles fly from far away toward camera
const STREAM_DEPTH = 80          // How far back particles spawn
const STREAM_RADIUS = 25         // Spread of the streaming tunnel

// Infrared palette
const IR_PINK = new THREE.Color('#FF2060')
const IR_WARM = new THREE.Color('#FF4070')
const IR_DEEP = new THREE.Color('#CC1040')

interface AstrophageSceneProps {
  isActive: boolean
  onPhaseChange?: (phase: 'cold' | 'igniting' | 'active') => void
}

// ─── Surge / decay ───────────────────────────────────────────────────────────
function surgeCurve(t: number): number {
  if (t < 0) return 0
  if (t > 1) return 1
  // Very slow start → explosive ramp → overwhelming peak
  if (t < 0.15) return Math.pow(t / 0.15, 4) * 0.1        // Barely visible spark
  if (t < 0.3) return 0.1 + Math.pow((t - 0.15) / 0.15, 2) * 0.15 // Building...
  if (t < 0.7) return 0.25 + (1 - Math.exp(-5 * Math.pow((t - 0.3) / 0.4, 2))) * 0.55 // SURGE
  const s = (t - 0.7) / 0.3
  return 0.8 + s * 0.2 * (1 + Math.sin(s * Math.PI * 3) * 0.04 * (1 - s)) // Peak bloom
}
function decayCurve(t: number): number {
  if (t < 0) return 1
  if (t > 1) return 0
  return Math.max(0, (1 - Math.pow(t, 1.5)) + (t < 0.2 ? Math.sin(t * Math.PI * 6) * 0.03 : 0))
}

// ─── Bokeh Vertex Shader ─────────────────────────────────────────────────────
const bokehVertexShader = /* glsl */`
  attribute float aSize;
  attribute float aPhase;
  attribute float aBrightness;

  uniform float uTime;
  uniform float uIntensity;

  varying float vBrightness;
  varying float vPhase;

  void main() {
    vBrightness = aBrightness;
    vPhase = aPhase;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // Shimmer/twinkle
    float twinkle = 0.65 + 0.35 * sin(uTime * 1.8 + aPhase * 6.28);
    float intensityScale = 0.05 + uIntensity * 0.95;

    gl_PointSize = aSize * intensityScale * twinkle * (250.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

// ─── Bokeh Fragment Shader ───────────────────────────────────────────────────
const bokehFragmentShader = /* glsl */`
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;

  varying float vBrightness;
  varying float vPhase;

  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;

    // Soft bokeh: bright center → gentle fade → subtle bright ring at edge
    float core = 1.0 - smoothstep(0.0, 0.35, dist);
    float ring = smoothstep(0.3, 0.38, dist) * (1.0 - smoothstep(0.38, 0.5, dist)) * 0.25;
    float alpha = core * 0.85 + ring;

    // Color variation per particle
    float hueShift = sin(vPhase * 3.14) * 0.12;
    vec3 color = uColor;
    color.r = clamp(color.r + hueShift * 0.15, 0.0, 1.0);
    color.g = clamp(color.g - abs(hueShift) * 0.05, 0.0, 1.0);

    // Brightness shimmer
    float brightness = vBrightness * (0.6 + 0.4 * sin(uTime * 2.5 + vPhase * 12.0));

    float finalAlpha = alpha * uIntensity * brightness;
    gl_FragColor = vec4(color * (1.0 + finalAlpha * 0.6), finalAlpha);
  }
`

// ─── STREAMING PARTICLES (fly toward camera continuously) ────────────────────
// These create the "rushing through the Petrova Line" feeling
function StreamingParticles({ transitionProgress }: { transitionProgress: number }) {
  const pointsRef = useRef<THREE.Points>(null!)
  const materialRef = useRef<THREE.ShaderMaterial>(null!)
  const positionsRef = useRef<Float32Array>(null!)

  // Per-particle velocities and data
  const particleData = useMemo(() => {
    const p = new Float32Array(STREAM_COUNT * 3)
    const sizes = new Float32Array(STREAM_COUNT)
    const phases = new Float32Array(STREAM_COUNT)
    const brightnesses = new Float32Array(STREAM_COUNT)
    const speeds = new Float32Array(STREAM_COUNT) // Individual speeds

    for (let i = 0; i < STREAM_COUNT; i++) {
      // Distribute in a cylinder/tunnel stretching behind camera
      const angle = Math.random() * Math.PI * 2
      const r = STREAM_RADIUS * Math.pow(Math.random(), 0.5)
      const x = Math.cos(angle) * r
      const y = Math.sin(angle) * r * 0.6 // Slightly flattened band

      // Start at random depth along the tunnel
      const z = -Math.random() * STREAM_DEPTH

      p[i * 3] = x
      p[i * 3 + 1] = y
      p[i * 3 + 2] = z

      // Varied sizes — mostly small with some large bokeh
      const sizeR = Math.random()
      sizes[i] = sizeR < 0.85 ? 0.3 + Math.random() * 1.5 : 2.5 + Math.random() * 5.0
      phases[i] = Math.random()
      brightnesses[i] = 0.3 + Math.random() * 0.7
      speeds[i] = 3 + Math.random() * 8 // Units per second
    }

    positionsRef.current = p
    return { positions: p, sizes, phases, brightnesses, speeds }
  }, [])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: IR_PINK.clone() },
    uIntensity: { value: 0 },
  }), [])

  useFrame((state, delta) => {
    if (!materialRef.current || !pointsRef.current || !positionsRef.current) return
    const t = state.clock.elapsedTime
    const p = transitionProgress
    const positions = positionsRef.current

    materialRef.current.uniforms.uTime.value = t
    materialRef.current.uniforms.uIntensity.value = p

    // Color: deeper red at low intensity, brighter pink at peak
    const col = materialRef.current.uniforms.uColor.value as THREE.Color
    col.lerpColors(IR_DEEP, IR_PINK, Math.min(1, p * 1.3))

    // Stream particles TOWARD the camera (positive Z direction)
    const speed = p * 1.0 + 0.05 // Faint drift even when dormant, fast when active
    for (let i = 0; i < STREAM_COUNT; i++) {
      const idx = i * 3 + 2
      positions[idx] += particleData.speeds[i] * delta * speed

      // When particle passes camera (z > 10), respawn it far behind
      if (positions[idx] > 15) {
        positions[idx] = -STREAM_DEPTH + Math.random() * 5
        // Randomize X/Y slightly for variation
        const angle = Math.random() * Math.PI * 2
        const r = STREAM_RADIUS * Math.pow(Math.random(), 0.5)
        positions[i * 3] = Math.cos(angle) * r
        positions[i * 3 + 1] = Math.sin(angle) * r * 0.6
      }
    }

    // Update buffer
    const geo = pointsRef.current.geometry
    geo.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particleData.positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[particleData.sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[particleData.phases, 1]} />
        <bufferAttribute attach="attributes-aBrightness" args={[particleData.brightnesses, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={bokehVertexShader}
        fragmentShader={bokehFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// ─── Static Bokeh Field (the dense Petrova Line body) ────────────────────────
function PetrovaField({ transitionProgress }: { transitionProgress: number }) {
  const pointsRef = useRef<THREE.Points>(null!)
  const materialRef = useRef<THREE.ShaderMaterial>(null!)

  const { positions, sizes, phases, brightnesses } = useMemo(() => {
    const p = new Float32Array(FIELD_COUNT * 3)
    const s = new Float32Array(FIELD_COUNT)
    const ph = new Float32Array(FIELD_COUNT)
    const b = new Float32Array(FIELD_COUNT)

    for (let i = 0; i < FIELD_COUNT; i++) {
      // Dense spherical cluster
      const r = 22 * Math.pow(Math.random(), 0.4)
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      p[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.5
      p[i * 3 + 2] = r * Math.cos(phi)

      const sizeR = Math.random()
      s[i] = sizeR < 0.88 ? 0.2 + Math.random() * 1.0 : 1.8 + Math.random() * 4.5
      ph[i] = Math.random()
      b[i] = 0.25 + Math.random() * 0.75
    }
    return { positions: p, sizes: s, phases: ph, brightnesses: b }
  }, [])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: IR_PINK.clone() },
    uIntensity: { value: 0 },
  }), [])

  useFrame((state) => {
    if (!materialRef.current) return
    const t = state.clock.elapsedTime

    materialRef.current.uniforms.uTime.value = t
    materialRef.current.uniforms.uIntensity.value = transitionProgress

    const col = materialRef.current.uniforms.uColor.value as THREE.Color
    col.lerpColors(IR_DEEP, IR_WARM, Math.min(1, transitionProgress * 1.2))

    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.006
      pointsRef.current.rotation.x = Math.sin(t * 0.004) * 0.015
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
        <bufferAttribute attach="attributes-aBrightness" args={[brightnesses, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={bokehVertexShader}
        fragmentShader={bokehFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// ─── Close Bokeh (large soft foreground circles — depth feel) ─────────────────
function CloseBokeh({ transitionProgress }: { transitionProgress: number }) {
  const pointsRef = useRef<THREE.Points>(null!)
  const materialRef = useRef<THREE.ShaderMaterial>(null!)
  const positionsRef = useRef<Float32Array>(null!)

  const particleData = useMemo(() => {
    const p = new Float32Array(CLOSE_BOKEH_COUNT * 3)
    const s = new Float32Array(CLOSE_BOKEH_COUNT)
    const ph = new Float32Array(CLOSE_BOKEH_COUNT)
    const b = new Float32Array(CLOSE_BOKEH_COUNT)
    const speeds = new Float32Array(CLOSE_BOKEH_COUNT)

    for (let i = 0; i < CLOSE_BOKEH_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = 3 + Math.random() * 15
      p[i * 3] = Math.cos(angle) * r
      p[i * 3 + 1] = Math.sin(angle) * r * 0.5
      p[i * 3 + 2] = -Math.random() * 40

      // Large, soft bokeh circles
      s[i] = 5.0 + Math.random() * 15.0
      ph[i] = Math.random()
      b[i] = 0.06 + Math.random() * 0.15
      speeds[i] = 1 + Math.random() * 4
    }
    positionsRef.current = p
    return { positions: p, sizes: s, phases: ph, brightnesses: b, speeds }
  }, [])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: IR_WARM.clone() },
    uIntensity: { value: 0 },
  }), [])

  useFrame((state, delta) => {
    if (!materialRef.current || !positionsRef.current || !pointsRef.current) return
    const t = state.clock.elapsedTime
    const p = transitionProgress
    const positions = positionsRef.current

    materialRef.current.uniforms.uTime.value = t
    materialRef.current.uniforms.uIntensity.value = p * 0.8

    // Large bokeh also stream toward camera (slowly)
    const speed = p * 0.5
    for (let i = 0; i < CLOSE_BOKEH_COUNT; i++) {
      const idx = i * 3 + 2
      positions[idx] += particleData.speeds[i] * delta * speed

      if (positions[idx] > 12) {
        positions[idx] = -35 - Math.random() * 10
        const angle = Math.random() * Math.PI * 2
        const r = 3 + Math.random() * 15
        positions[i * 3] = Math.cos(angle) * r
        positions[i * 3 + 1] = Math.sin(angle) * r * 0.5
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particleData.positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[particleData.sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[particleData.phases, 1]} />
        <bufferAttribute attach="attributes-aBrightness" args={[particleData.brightnesses, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={bokehVertexShader}
        fragmentShader={bokehFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// ─── Petrova Tail (sweeping macro structure visible from afar) ─────────────────
function PetrovaTail({ transitionProgress }: { transitionProgress: number }) {
  const pointsRef = useRef<THREE.Points>(null!)
  const materialRef = useRef<THREE.ShaderMaterial>(null!)

  const { positions, sizes, phases, brightnesses } = useMemo(() => {
    const p = new Float32Array(TAIL_COUNT * 3)
    const s = new Float32Array(TAIL_COUNT)
    const ph = new Float32Array(TAIL_COUNT)
    const b = new Float32Array(TAIL_COUNT)

    for (let i = 0; i < TAIL_COUNT; i++) {
      // The Astrophage forms a braided, sweeping line across the system
      const t = Math.random()
      const x = (t - 0.5) * 450 // Spans very wide (-225 to 225)
      
      // Main sweeping curve: Parabolic arc
      // Base path for the line
      let z = -0.002 * x * x + 30 
      let y = Math.sin(x * 0.02) * 15

      // Braid / Twist effect (two main interwoven strands)
      const strand = Math.random() > 0.5 ? 1 : -1
      const twistRadius = 8 + Math.abs(x) * 0.02
      y += Math.sin(x * 0.03) * twistRadius * strand
      z += Math.cos(x * 0.03) * twistRadius * strand

      // Volume / Dispersion — denser near center, scattered at edges
      const spread = Math.max(3, 20 - Math.abs(x) * 0.05)
      
      p[i * 3] = x + (Math.random() - 0.5) * spread
      p[i * 3 + 1] = y + (Math.random() - 0.5) * spread * 0.6
      p[i * 3 + 2] = z + (Math.random() - 0.5) * spread

      const sizeR = Math.random()
      s[i] = sizeR < 0.95 ? 0.3 + Math.random() * 1.5 : 2.0 + Math.random() * 3.5
      ph[i] = Math.random()
      
      // Fade out brightness heavily toward the very far edges
      const fadeEdge = 1.0 - Math.pow(Math.abs(x) / 225, 2)
      b[i] = (0.1 + Math.random() * 0.4) * fadeEdge
    }
    return { positions: p, sizes: s, phases: ph, brightnesses: b }
  }, [])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: IR_PINK.clone() },
    uIntensity: { value: 0 },
  }), [])

  useFrame((state) => {
    if (!materialRef.current || !pointsRef.current) return
    const t = state.clock.elapsedTime
    
    // Tail is dimmer overall than the core field
    materialRef.current.uniforms.uTime.value = t
    materialRef.current.uniforms.uIntensity.value = transitionProgress * 0.6 
    
    const col = materialRef.current.uniforms.uColor.value as THREE.Color
    col.lerpColors(IR_DEEP, IR_WARM, Math.min(1, transitionProgress * 1.0))
    
    pointsRef.current.rotation.y = t * 0.001
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
        <bufferAttribute attach="attributes-aBrightness" args={[brightnesses, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={bokehVertexShader}
        fragmentShader={bokehFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// ─── Star Shader (soft circular points, no blocky squares) ───────────────────
const starVertexShader = /* glsl */`
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  varying float vPhase;
  void main() {
    vPhase = aPhase;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // Subtle twinkle
    float twinkle = 0.8 + 0.2 * sin(uTime * 1.2 + aPhase * 6.28);
    gl_PointSize = aSize * twinkle * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const starFragmentShader = /* glsl */`
  varying float vPhase;
  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;
    
    // Soft core falloff
    float alpha = pow(1.0 - (dist * 2.0), 1.5);
    
    // Slight color/temperature variation per star
    vec3 baseColor = vec3(1.0);
    if (mod(vPhase * 100.0, 3.0) < 1.0) {
      baseColor = vec3(0.85, 0.9, 1.0); // Blue-white
    } else if (mod(vPhase * 100.0, 3.0) < 2.0) {
      baseColor = vec3(1.0, 0.95, 0.85); // Warm yellow
    }
    
    gl_FragColor = vec4(baseColor, alpha);
  }
`

// ─── Starfield ───────────────────────────────────────────────────────────────
function Starfield() {
  const starsRef = useRef<THREE.Points>(null!)
  const materialRef = useRef<THREE.ShaderMaterial>(null!)

  const { positions, sizes, phases } = useMemo(() => {
    const p = new Float32Array(STAR_COUNT * 3)
    const s = new Float32Array(STAR_COUNT)
    const ph = new Float32Array(STAR_COUNT)

    for (let i = 0; i < STAR_COUNT; i++) {
      // Placed on a huge sphere around the camera, avoiding the immediate center
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 120 + Math.random() * 150

      p[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      p[i * 3 + 2] = r * Math.cos(phi)

      // Vast majority of stars should be tiny pinpricks. Very few large ones.
      const sizeRandom = Math.random()
      if (sizeRandom < 0.93) {
        s[i] = 0.5 + Math.random() * 0.8  // Tiny, faint background
      } else if (sizeRandom < 0.99) {
        s[i] = 1.5 + Math.random() * 1.5  // Mid-sized
      } else {
        s[i] = 3.0 + Math.random() * 2.0  // Large, bright anchor stars
      }

      ph[i] = Math.random()
    }
    return { positions: p, sizes: s, phases: ph }
  }, [])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 }
  }), [])

  useFrame((state) => {
    if (!materialRef.current || !starsRef.current) return
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    starsRef.current.rotation.y = state.clock.elapsedTime * 0.0005 // Very slow rotation
  })

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={starVertexShader}
        fragmentShader={starFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// ─── Ambient Dust ────────────────────────────────────────────────────────────
function AmbientDust({ transitionProgress }: { transitionProgress: number }) {
  const ref = useRef<THREE.Points>(null!)

  const positions = useMemo(() => {
    const p = new Float32Array(4000 * 3)
    for (let i = 0; i < 4000; i++) {
      const r = 35 * Math.cbrt(Math.random())
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      p[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      p[i * 3 + 2] = r * Math.cos(phi)
    }
    return p
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.003
    const mat = ref.current.material as THREE.PointsMaterial
    const col = new THREE.Color()
    col.lerpColors(new THREE.Color('#080810'), new THREE.Color('#200818'), transitionProgress)
    mat.color.copy(col)
    mat.opacity = 0.04 + transitionProgress * 0.15
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} transparent opacity={0.04} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  )
}

// ─── Main Scene ──────────────────────────────────────────────────────────────
export default function AstrophageScene({ isActive, onPhaseChange }: AstrophageSceneProps) {
  const transitionRef = useRef({ progress: 0, startTime: -1, direction: 0, duration: 6.0 })
  const [transitionProgress, setTransitionProgress] = useState(0)
  const [bloomParams, setBloomParams] = useState({ intensity: 0.8, threshold: 0.3, radius: 0.8 })

  const prevActive = useRef(isActive)
  useEffect(() => {
    if (isActive !== prevActive.current) {
      prevActive.current = isActive
      transitionRef.current.startTime = -1
      transitionRef.current.direction = isActive ? 1 : -1
      onPhaseChange?.(isActive ? 'igniting' : 'cold')
    }
  }, [isActive, onPhaseChange])

  useFrame((state) => {
    const tr = transitionRef.current
    const time = state.clock.elapsedTime
    if (tr.direction !== 0) {
      if (tr.startTime < 0) tr.startTime = time
      const elapsed = time - tr.startTime
      const t = Math.min(1, elapsed / tr.duration)
      const newP = tr.direction > 0 ? surgeCurve(t) : decayCurve(t)
      tr.progress = newP
      setTransitionProgress(newP)
      // Bloom ramps hard — from subtle glow to overwhelming IR flood
      setBloomParams({
        intensity: 0.8 + newP * 5.0,
        threshold: THREE.MathUtils.lerp(0.3, 0.02, newP),
        radius: THREE.MathUtils.lerp(0.8, 1.0, newP),
      })
      if (t >= 1) {
        tr.direction = 0
        onPhaseChange?.(newP > 0.5 ? 'active' : 'cold')
      }
    }
  })

  return (
    <>
      <color attach="background" args={['#020204']} />

      {/* Streaming particles — fly TOWARD camera through the Petrova Line */}
      <StreamingParticles transitionProgress={transitionProgress} />

      {/* Static/slow bokeh field — the dense body of the Petrova Line */}
      <PetrovaField transitionProgress={transitionProgress} />
      
      {/* Distant tail of the Petrova Line spreading across the star system */}
      <PetrovaTail transitionProgress={transitionProgress} />

      {/* Large foreground bokeh — out-of-focus depth feel */}
      <CloseBokeh transitionProgress={transitionProgress} />

      {/* Ambient dust — faint spatial presence */}
      <AmbientDust transitionProgress={transitionProgress} />

      {/* Starfield */}
      <Starfield />

      {/* Camera controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.04}
        rotateSpeed={0.4}
        zoomSpeed={0.6}
        minDistance={1}
        maxDistance={250}
        autoRotate
        autoRotateSpeed={0.15}
        enablePan={false}
      />

      {/* Post-processing */}
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={bloomParams.intensity}
          luminanceThreshold={bloomParams.threshold}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Noise opacity={0.01} />
        <Vignette eskil={false} offset={0.15} darkness={0.75} />
      </EffectComposer>
    </>
  )
}
