'use client'

import { useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing'
import Scene from '@/components/simulation/Scene'

export default function Home() {
  const [epoch, setEpoch] = useState('planck')
  const [isClient, setIsClient] = useState(false)
  const sceneRef = useRef<any>(null!)
  const chromaticRef = useRef<any>(null!)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleBeginInflation = () => {
    sceneRef.current?.beginInflation()
  }

  return (
    <div className="relative w-screen h-screen bg-black">
      
      {/* UI */}
      <div className="absolute top-5 left-5 text-white z-10 p-4 bg-black bg-opacity-50 rounded-lg font-mono">
        {epoch === 'planck' && ( 
          <> 
            <h2 className="text-xl font-bold">Event: Planck Epoch</h2> 
            <p>Time: t = 0s</p> 
            <p>Temp: ∞</p> 
          </> 
        )}
        {epoch === 'inflation' && ( 
          <> 
            <h2 className="text-xl font-bold">Event: Cosmic Inflation</h2> 
            <p>Time: t = 10<sup>-36</sup>s</p> 
            <p>The universe expands exponentially.</p> 
          </> 
        )}
      </div>
      
      {/* Button */}
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

      {/* Canvas with Post-Processing */}
      <Canvas camera={{ fov: 75, position: [0, 0, 5] }}>
        <Scene 
          ref={sceneRef} 
          setEpoch={setEpoch} 
          chromaticRef={chromaticRef}
        />
        
        <EffectComposer>
          <Bloom 
            intensity={1.0}
            luminanceThreshold={0.5}
            mipmapBlur 
          />
          <ChromaticAberration 
            ref={chromaticRef}
            offset={[0, 0]}
          />
          <Noise opacity={0.05} />
          <Vignette eskil={false} offset={0.1} darkness={0.5} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}