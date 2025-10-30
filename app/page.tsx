'use client'

import { useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing'
import Scene from '@/components/simulation/Scene'

export default function Home() {
  const [epoch, setEpoch] = useState('planck')
  const [isClient, setIsClient] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [bloomIntensity, setBloomIntensity] = useState(1.0)
  const sceneRef = useRef<any>(null!)
  const chromaticRef = useRef<any>(null!)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleBeginInflation = () => {
    setIsTransitioning(true)
    sceneRef.current?.beginInflation()
    
    setTimeout(() => {
      setIsTransitioning(false)
    }, 8000)
  }

  const handleTransitionToNucleosynthesis = () => {
    setIsTransitioning(true)
    sceneRef.current?.transitionToNucleosynthesis()
    
    setTimeout(() => {
      setIsTransitioning(false)
    }, 10000)
  }

  const handleTransitionToRecombination = () => {
    setIsTransitioning(true)
    sceneRef.current?.transitionToRecombination()
    
    setTimeout(() => {
      setIsTransitioning(false)
    }, 13000)
  }

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      
      <div className={`absolute top-5 left-5 text-white z-10 p-4 bg-black rounded-lg font-mono
                       transition-all duration-500 ${isTransitioning ? 'bg-opacity-70 scale-105' : 'bg-opacity-50'}`}>
        {epoch === 'planck' && ( 
          <div className="opacity-0 animate-fadeIn"> 
            <h2 className="text-xl font-bold mb-1 bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Event: Planck Epoch
            </h2> 
            <p className="text-gray-300">Time: t = 0s</p> 
            <p className="text-gray-300">Temp: ∞</p>
            <p className="mt-2 text-xs text-gray-400">The universe begins...</p>
          </div> 
        )}
        {epoch === 'inflation' && ( 
          <div className="animate-pulseSlow"> 
            <h2 className="text-xl font-bold mb-1 bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Event: Cosmic Inflation
            </h2> 
            <p className="text-blue-300">Time: t = 10<sup>-36</sup>s</p> 
            <p className="text-blue-200 mt-1">The universe expands exponentially.</p>
            <div className="mt-2 h-1 bg-linear-to-r from-blue-500 to-purple-500 rounded animate-pulse"></div>
          </div> 
        )}
        {epoch === 'plasma' && ( 
          <div className="opacity-0 animate-fadeIn"> 
            <h2 className="text-xl font-bold mb-1 bg-linear-to-r from-orange-400 via-red-500 to-yellow-400 bg-clip-text text-transparent">
              Event: Quark-Gluon Plasma
            </h2> 
            <p className="text-orange-300">Time: t = 10<sup>-12</sup>s</p> 
            <p className="text-red-400 font-semibold">Temp: ~2 trillion K</p>
            <p className="mt-2 text-sm text-yellow-200">A soup of quarks and gluons, too hot for protons to form.</p>
            <div className="mt-2 h-1 bg-linear-to-r from-orange-500 via-red-500 to-yellow-500 rounded animate-pulseFast"></div>
          </div> 
        )}
        {epoch === 'nucleosynthesis' && (
          <div className="opacity-0 animate-fadeIn">
            <h2 className="text-xl font-bold mb-1 bg-linear-to-r from-yellow-400 via-orange-500 to-red-400 bg-clip-text text-transparent">
              Event: Big Bang Nucleosynthesis
            </h2>
            <p className="text-yellow-300">Time: t = 3-20 minutes</p>
            <p className="text-orange-400 font-semibold">Temp: ~1 billion K</p>
            <p className="mt-2 text-sm text-yellow-200">Protons and neutrons fuse to form the first atomic nuclei.</p>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                <span className="text-gray-300">Protons</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-gray-300 animate-pulse"></span>
                <span className="text-gray-300">Neutrons</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="text-gray-300">Electrons</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                <span className="text-gray-300">Helium-4</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                <span className="text-gray-300">Hydrogen</span>
              </div>
            </div>
            <div className="mt-2 h-1 bg-linear-to-r from-yellow-500 via-orange-500 to-red-500 rounded animate-pulse"></div>
          </div>
        )}
        {epoch === 'recombination' && (
          <div className="opacity-0 animate-fadeIn">
            <h2 className="text-xl font-bold mb-1 bg-linear-to-r from-cyan-400 via-blue-500 to-purple-400 bg-clip-text text-transparent">
              Event: Recombination Era
            </h2>
            <p className="text-cyan-300">Time: t = 380,000 years</p>
            <p className="text-blue-400 font-semibold">Temp: ~3,000 K</p>
            <p className="mt-2 text-sm text-cyan-200">Electrons combine with nuclei to form the first neutral atoms.</p>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                <span className="text-gray-300">Protons (H nuclei)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                <span className="text-gray-300">Helium nuclei</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="text-gray-300">Electrons (capturing)</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-purple-300 italic">
              The universe becomes transparent. Light can now travel freely.
            </p>
            <div className="mt-2 h-1 bg-linear-to-r from-cyan-500 via-blue-500 to-purple-500 rounded animate-pulse"></div>
          </div>
        )}
      </div>
      
      {isClient && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex gap-4">
          
          {epoch === 'planck' && (
            <button 
              onClick={handleBeginInflation}
              disabled={isTransitioning}
              className="relative text-white text-lg border-2 border-white px-8 py-4 rounded-lg font-mono
                         hover:bg-white hover:text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]
                         transition-all duration-300 transform hover:scale-105
                         disabled:opacity-50 disabled:cursor-not-allowed
                         before:absolute before:inset-0 before:rounded-lg before:bg-white before:opacity-0
                         hover:before:opacity-10 before:transition-opacity"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
                [ Begin Inflation ]
                <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
              </span>
            </button>
          )}

          {epoch === 'plasma' && (
            <button 
              onClick={handleTransitionToNucleosynthesis}
              disabled={isTransitioning}
              className="relative text-white text-lg border-2 border-orange-400 px-8 py-4 rounded-lg font-mono
                         hover:bg-orange-400 hover:text-black hover:shadow-[0_0_30px_rgba(251,146,60,0.5)]
                         transition-all duration-300 transform hover:scale-105
                         disabled:opacity-50 disabled:cursor-not-allowed
                         before:absolute before:inset-0 before:rounded-lg before:bg-orange-400 before:opacity-0
                         hover:before:opacity-10 before:transition-opacity"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                [ Begin Nucleosynthesis ]
                <span className="inline-block w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
              </span>
            </button>
          )}

          {epoch === 'nucleosynthesis' && (
            <button 
              onClick={handleTransitionToRecombination}
              disabled={isTransitioning}
              className="relative text-white text-lg border-2 border-cyan-400 px-8 py-4 rounded-lg font-mono
                         hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]
                         transition-all duration-300 transform hover:scale-105
                         disabled:opacity-50 disabled:cursor-not-allowed
                         before:absolute before:inset-0 before:rounded-lg before:bg-cyan-400 before:opacity-0
                         hover:before:opacity-10 before:transition-opacity"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                [ Begin Recombination ]
                <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
              </span>
            </button>
          )}

        </div>
      )}

      {/* Transition overlay effect */}
      {isTransitioning && (
        <div className="absolute inset-0 pointer-events-none z-20">
          <div className="absolute inset-0 animate-pulseSlow" 
               style={{
                 background: epoch === 'recombination' 
                   ? 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, rgba(147,51,234,0.05) 50%, transparent 100%)'
                   : 'radial-gradient(circle, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)'
               }}>
          </div>
        </div>
      )}

      {/* Canvas with Enhanced Post-Processing */}
      <Canvas 
        camera={{ fov: 75, position: [0, 0, 5] }}
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true
        }}
        frameloop="always"
        dpr={[1, 2]}
      >
        <Scene 
          ref={sceneRef} 
          setEpoch={setEpoch} 
          chromaticRef={chromaticRef}
          setBloomIntensity={setBloomIntensity}
        />
        
        <EffectComposer multisampling={4}>
          <Bloom 
            intensity={bloomIntensity}
            luminanceThreshold={epoch === 'recombination' ? 0.3 : 0.5}
            luminanceSmoothing={epoch === 'recombination' ? 0.9 : 0.8}
            mipmapBlur 
          />
          <ChromaticAberration 
            ref={chromaticRef}
            offset={[0, 0]}
          />
          <Noise opacity={epoch === 'recombination' ? 0.02 : 0.03} />
          <Vignette 
            eskil={false} 
            offset={
              epoch === 'recombination' ? 0.15 : 
              epoch === 'nucleosynthesis' ? 0.08 : 
              epoch === 'plasma' ? 0.05 : 0.1
            } 
            darkness={
              epoch === 'recombination' ? 0.8 : 
              epoch === 'nucleosynthesis' ? 0.7 : 
              epoch === 'plasma' ? 0.6 : 0.5
            } 
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}