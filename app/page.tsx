// In: app/page.tsx

'use client' 

import { 
  useRef, 
  useState, 
  useEffect, 
  useMemo, 
  forwardRef, 
  useImperativeHandle,
  RefObject
} from 'react'
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber'
import { OrbitControls, shaderMaterial } from '@react-three/drei'
// NEW: Import more post-processing effects
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing'
import { 
  Mesh, 
  Group, 
  BufferGeometry, 
  MeshBasicMaterial,
  Color,
  ShaderMaterial
} from 'three' 
import { gsap } from 'gsap' 


// --- 1. FoamShaderMaterial ---
// We're adding the props as default uniforms
const FoamMaterial = shaderMaterial(
  // Uniforms
  { 
    uTime: 0, 
    uInflation: 0,
    uSize: 0.015,
    uColor: new Color("#aaa")
  },
  // Vertex Shader (no changes)
  `
    uniform float uTime;
    uniform float uInflation;
    uniform float uSize;

    float rand(vec2 co){
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
      vec3 pos = position;
      float vibrate = sin(pos.x + uTime * 0.5 + rand(pos.xy) * 10.0) * 0.02;
      pos.y += vibrate;
      pos.x += vibrate;
      pos *= (1.0 + uInflation * 5.0);
      float pointSize = uSize * (1.0 + uInflation * 10.0);
      
      vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectionPosition = projectionMatrix * viewPosition;

      gl_Position = projectionPosition;
      gl_PointSize = pointSize * (300.0 / -viewPosition.z);
    }
  `,
  // Fragment Shader (no changes)
  `
    uniform vec3 uColor;
    uniform float uInflation;

    void main() {
      float opacity = (1.0 - uInflation) * 0.5;
      if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
      gl_FragColor = vec4(uColor, opacity);
    }
  `
)

extend({ FoamMaterial })

// --- This declaration is the "escape hatch" that works ---
declare module '@react-three/fiber' {
  interface ThreeElements {
    foamMaterial: any
  }
}

// --- 2. PlanckPoint component (no changes) ---
function PlanckPoint({ materialRef }: { materialRef: RefObject<MeshBasicMaterial> }) {
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

// --- 3. UPDATED: QuantumFoam component ---
// Now accepts props to customize it
function QuantumFoam({ 
  materialRef,
  count = 10000,
  radius = 2,
  size = 0.015,
  color = "#aaa"
}: { 
  materialRef: RefObject<any>,
  count?: number,
  radius?: number,
  size?: number,
  color?: string,
}) {
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * radius
    }
    return positions
  }, [count, radius])

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
      </bufferGeometry>
      <foamMaterial 
        ref={materialRef}
        // Pass props directly to the shader uniforms
        uSize={size}
        uColor={color}
        transparent 
        depthWrite={false} 
      />
    </points>
  )
}

// --- 4. UPDATED: Scene component ---
// Now has two particle layers and animates the distortion
const Scene = forwardRef(({ 
  setEpoch,
  chromaticRef // NEW: Pass in ref for distortion
}: { 
  setEpoch: (epoch: string) => void,
  chromaticRef: RefObject<any>
}, ref) => {
  const { camera } = useThree()
  const universeRef = useRef<Group>(null!)
  const controlsRef = useRef<any>(null!)

  const pointMaterialRef = useRef<MeshBasicMaterial>(null!)
  const foamMaterialRef = useRef<any>(null!)
  // NEW: Ref for the second particle layer
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
      
      // 5. NEW: Chromatic Aberration Shockwave
      // Spike the distortion, then fade it out
      tl.to(chromaticRef.current.offset, {
        x: 0.02, // Spike value
        y: 0.02,
        duration: 0.3, // Very fast spike
        ease: 'power3.in',
      }, 0)
      tl.to(chromaticRef.current.offset, {
        x: 0,
        y: 0,
        duration: 1.5, // Fade out
        ease: 'power2.out',
      }, 0.3) // Start fading after the spike

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
          color="#aaa"
        />
        {/* NEW: The distant, sparser foam for parallax */}
        <QuantumFoam 
          materialRef={distantFoamMaterialRef} 
          count={5000} // Fewer particles
          radius={5} // Spread out more
          size={0.01} // Smaller
          color="#555" // Darker
        />
      </group>
      <OrbitControls ref={controlsRef} />
    </>
  )
})
Scene.displayName = 'Scene'

// --- 5. Main Home component (updated) ---
export default function Home() {
  const [epoch, setEpoch] = useState('planck')
  const [isClient, setIsClient] = useState(false)
  const sceneRef = useRef<any>(null!)
  // NEW: Ref for the effect
  const chromaticRef = useRef<any>(null!)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleBeginInflation = () => {
    sceneRef.current?.beginInflation()
  }

  return (
    <div className="relative w-screen h-screen bg-black">
      
      {/* --- UI (no changes) --- */}
      <div className="absolute top-5 left-5 text-white z-10 p-4 bg-black bg-opacity-50 rounded-lg font-mono">
        {epoch === 'planck' && ( <> <h2 className="text-xl font-bold">Event: Planck Epoch</h2> <p>Time: t = 0s</p> <p>Temp: ∞</p> </> )}
        {epoch === 'inflation' && ( <> <h2 className="text-xl font-bold">Event: Cosmic Inflation</h2> <p>Time: t = 10<sup>-36</sup>s</p> <p>The universe expands exponentially.</p> </> )}
      </div>
      
      {/* --- Button (no changes) --- */}
      {isClient && epoch === 'planck' && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
          <button 
            onClick={handleBeginInflation}
            className="text-white text-lg border-2 border-white px-6 py-3 rounded-lg font-mono
                       hover:bg-white hover:text-black transition-colors duration-300"
          >
            [ Begin Inflation ]
          </button>
        </div>
      )}

      {/* --- UPDATED: Canvas with more Post-Processing --- */}
      <Canvas camera={{ fov: 75, position: [0, 0, 5] }}>
        <Scene 
          ref={sceneRef} 
          setEpoch={setEpoch} 
          chromaticRef={chromaticRef} // Pass the ref down
        />
        
        <EffectComposer>
          <Bloom 
            intensity={1.0}
            luminanceThreshold={0.5}
            mipmapBlur 
          />
          {/* NEW: Our animatable distortion effect */}
          <ChromaticAberration 
            ref={chromaticRef}
            offset={[0, 0]} // Start with no distortion
          />
          {/* NEW: Subtle film grain for texture */}
          <Noise opacity={0.05} />
          {/* NEW: Darkens corners to focus the eye */}
          <Vignette eskil={false} offset={0.1} darkness={0.5} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}