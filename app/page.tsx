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
    }, 25000)
  }

  const handleTransitionToDarkAges = () => {
    setIsTransitioning(true)
    sceneRef.current?.transitionToDarkAges()
    
    setTimeout(() => {
      setIsTransitioning(false)
    }, 46000)
  }

  const handleTransitionToCosmicDawn = () => {
    setIsTransitioning(true)
    sceneRef.current?.transitionToCosmicDawn()
    
    setTimeout(() => {
      setIsTransitioning(false)
    }, 15000) // Cosmic Dawn animation duration
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
            <p className="mt-2 text-sm text-yellow-200">Nuclear fusion creates the first light elements.</p>
            
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                <span className="text-gray-300 font-medium">Protons (H⁺)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.4)]"></span>
                <span className="text-gray-300 font-medium">Neutrons</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.7)]"></span>
                <span className="text-gray-300 font-medium">Electrons (e⁻)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-orange-400 animate-pulse shadow-[0_0_10px_rgba(251,146,60,0.6)]"></span>
                <span className="text-gray-300 font-medium">Deuterium (²H)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.6)]"></span>
                <span className="text-gray-300 font-medium">Tritium (³H)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3.5 h-3.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.6)]"></span>
                <span className="text-gray-300 font-medium">Helium-3 (³He)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full bg-blue-600 animate-pulse shadow-[0_0_12px_rgba(37,99,235,0.7)]"></span>
                <span className="text-gray-300 font-medium">Helium-4 (⁴He)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.6)]"></span>
                <span className="text-gray-300 font-medium">Hydrogen (H)</span>
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-400 italic border-l-2 border-orange-500 pl-2">
              Fusion reactions: D + p → ³He | D + n → ³T | ³He + ³He → ⁴He + 2p
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
            <p className="text-blue-400 font-semibold">Temp: 3,000 K → 2,725 K</p>
            <p className="mt-2 text-sm text-cyan-200">Electrons orbit nuclei, forming the first neutral atoms.</p>
            
            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse shadow-[0_0_8px_rgba(248,113,113,0.6)]"></span>
                <span className="text-gray-300 font-medium">Protons (H⁺)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.6)]"></span>
                <span className="text-gray-300 font-medium">He nuclei (α)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]"></span>
                <span className="text-gray-300 font-medium">Free electrons</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative inline-block">
                  <span className="absolute w-3 h-3 rounded-full bg-cyan-400 opacity-30 animate-ping"></span>
                  <span className="relative inline-block w-2 h-2 rounded-full bg-cyan-300"></span>
                </div>
                <span className="text-gray-300 font-medium">Orbital e⁻</span>
              </div>
            </div>

            <div className="mt-3 p-2 bg-linear-to-r from-cyan-900/30 to-blue-900/30 rounded border border-cyan-500/30">
              <p className="text-xs text-cyan-200 font-medium mb-1">⚛️ Atomic Formation:</p>
              <div className="text-xs text-gray-300 space-y-0.5">
                <div>• p⁺ + e⁻ → H (Hydrogen)</div>
                <div>• α + 2e⁻ → He (Helium)</div>
              </div>
            </div>

            <p className="mt-3 text-xs text-purple-300 italic border-l-2 border-purple-500 pl-2">
              🌟 Universe becomes transparent - photons decouple and travel freely!
            </p>
            
            <div className="mt-2 h-1 bg-linear-to-r from-cyan-500 via-blue-500 to-purple-500 rounded animate-pulse"></div>
          </div>
        )}
        {epoch === 'darkages' && (
          <div className="opacity-0 animate-fadeIn">
            <h2 className="text-xl font-bold mb-1 bg-linear-to-r from-gray-600 via-gray-800 to-black bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(100,100,100,0.5)]">
              Event: The Dark Ages
            </h2>
            <p className="text-gray-500">Time: t = 380,000 - 150 million years</p>
            <p className="text-gray-600 font-semibold">Temp: 2,725 K → 60 K (cooling)</p>
            <p className="mt-2 text-sm text-gray-400">The universe enters a period of darkness and silence.</p>
            
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-gray-700 animate-pulse shadow-[0_0_6px_rgba(75,85,99,0.4)]"></span>
                <span className="text-gray-400 font-medium">H atoms</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-gray-800 animate-pulse shadow-[0_0_6px_rgba(31,41,55,0.3)]"></span>
                <span className="text-gray-400 font-medium">He atoms</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-600 opacity-50"></span>
                <span className="text-gray-500 font-medium">Dark matter</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-1 h-1 rounded-full bg-gray-900 opacity-30"></span>
                <span className="text-gray-500 font-medium">Void</span>
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-500 italic border-l-2 border-gray-700 pl-2">
              ⏳ The cosmic dark ages - a silent universe waiting for the first stars to ignite...
            </p>
            
            <div className="mt-2 h-1 bg-linear-to-r from-gray-800 via-gray-900 to-black rounded opacity-50"></div>
          </div>
        )}
        {epoch === 'cosmicdawn' && (
          <div className="opacity-0 animate-fadeIn">
            <h2 className="text-xl font-bold mb-1 bg-linear-to-r from-blue-300 via-white to-purple-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(200,220,255,0.8)]">
              Event: Cosmic Dawn
            </h2>
            <p className="text-blue-300">Time: t = 150 - 1,000 million years</p>
            <p className="text-white font-semibold">Temp: 60 K → 10,000 K (reheating)</p>
            <p className="mt-2 text-sm text-blue-200">The first stars ignite, breaking the cosmic silence!</p>
            
            <div className="mt-3 p-2.5 bg-blue-950/30 rounded border border-blue-500/40">
              <p className="text-xs text-blue-200 mb-2 font-medium">✨ Dawn of Light:</p>
              <div className="text-xs text-gray-300 space-y-1">
                <div className="flex items-start gap-2">
                  <span className="text-blue-400">⭐</span>
                  <span>Population III stars (100-1000 M☉)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400">💫</span>
                  <span>Reionization begins - bubbles expand</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-white">🌟</span>
                  <span>Proto-galaxies start to form</span>
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              {/* <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-400 animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.8)]"></span>
                <span className="text-gray-300 font-medium">First stars</span>
              </div> */}
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_rgba(192,132,252,0.6)]"></span>
                <span className="text-gray-300 font-medium">Ionized gas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_12px_rgba(255,255,255,0.9)]"></span>
                <span className="text-gray-300 font-medium">Stellar halos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-300 opacity-70 animate-pulse"></span>
                <span className="text-gray-300 font-medium">Proto-galaxies</span>
              </div>
            </div>

            <p className="mt-3 text-xs text-purple-300 italic border-l-2 border-blue-500 pl-2">
              🌅 Let there be light - the universe awakens from darkness!
            </p>
            
            <div className="mt-2 h-1 bg-linear-to-r from-blue-500 via-white to-purple-500 rounded animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
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

          {epoch === 'recombination' && (
            <button 
              onClick={handleTransitionToDarkAges}
              disabled={isTransitioning}
              className="relative text-white text-lg border-2 border-gray-600 px-8 py-4 rounded-lg font-mono
                         hover:bg-gray-800 hover:text-gray-300 hover:shadow-[0_0_30px_rgba(75,85,99,0.5)]
                         transition-all duration-300 transform hover:scale-105
                         disabled:opacity-50 disabled:cursor-not-allowed
                         before:absolute before:inset-0 before:rounded-lg before:bg-gray-700 before:opacity-0
                         hover:before:opacity-10 before:transition-opacity"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-pulse"></span>
                [ Enter the Dark Ages ]
                <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-pulse"></span>
              </span>
            </button>
          )}

          {epoch === 'darkages' && (
            <button 
              onClick={handleTransitionToCosmicDawn}
              disabled={isTransitioning}
              className="relative text-white text-lg border-2 border-blue-400 px-8 py-4 rounded-lg font-mono
                         hover:bg-blue-400 hover:text-black hover:shadow-[0_0_30px_rgba(96,165,250,0.8)]
                         transition-all duration-300 transform hover:scale-105
                         disabled:opacity-50 disabled:cursor-not-allowed
                         before:absolute before:inset-0 before:rounded-lg before:bg-blue-400 before:opacity-0
                         hover:before:opacity-10 before:transition-opacity
                         shadow-[0_0_20px_rgba(96,165,250,0.3)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-blue-300 rounded-full animate-pulse shadow-[0_0_8px_rgba(147,197,253,0.8)]"></span>
                [ Witness the First Stars ]
                <span className="inline-block w-2 h-2 bg-blue-300 rounded-full animate-pulse shadow-[0_0_8px_rgba(147,197,253,0.8)]"></span>
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
                 background: epoch === 'cosmicdawn'
                   ? 'radial-gradient(circle, rgba(96,165,250,0.15) 0%, rgba(147,51,234,0.08) 50%, transparent 100%)'
                   : epoch === 'darkages'
                   ? 'radial-gradient(circle, rgba(0,0,0,0.8) 0%, rgba(20,20,30,0.6) 50%, transparent 100%)'
                   : epoch === 'recombination' 
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
            luminanceThreshold={
              epoch === 'cosmicdawn' ? 0.4 :
              epoch === 'darkages' ? 0.9 :
              epoch === 'recombination' ? 0.3 : 0.5
            }
            luminanceSmoothing={
              epoch === 'cosmicdawn' ? 0.85 :
              epoch === 'darkages' ? 0.95 :
              epoch === 'recombination' ? 0.9 : 0.8
            }
            mipmapBlur 
          />
          <ChromaticAberration 
            ref={chromaticRef}
            offset={[0, 0]}
          />
          <Noise opacity={
            epoch === 'cosmicdawn' ? 0.015 :
            epoch === 'darkages' ? 0.05 :
            epoch === 'recombination' ? 0.02 : 0.03
          } />
          <Vignette 
            eskil={false} 
            offset={
              epoch === 'cosmicdawn' ? 0.12 :
              epoch === 'darkages' ? 0.3 :
              epoch === 'recombination' ? 0.15 : 
              epoch === 'nucleosynthesis' ? 0.08 : 
              epoch === 'plasma' ? 0.05 : 0.1
            } 
            darkness={
              epoch === 'cosmicdawn' ? 0.6 :
              epoch === 'darkages' ? 1.2 :
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