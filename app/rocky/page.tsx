'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import AstrophageScene from '@/components/simulation/Astrophage'

import './rocky.css'

const AUTO_IGNITION_DELAY = 8

export default function RockyPage() {
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<'cold' | 'igniting' | 'active'>('cold')
  const [countdown, setCountdown] = useState(AUTO_IGNITION_DELAY)
  const [hasAutoIgnited, setHasAutoIgnited] = useState(false)
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    startTimeRef.current = Date.now()
    const tick = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const remaining = Math.max(0, AUTO_IGNITION_DELAY - elapsed)
      setCountdown(remaining)
      if (remaining <= 0 && !hasAutoIgnited) {
        setHasAutoIgnited(true)
        setIsActive(true)
        clearInterval(tick)
      }
    }, 50)
    return () => clearInterval(tick)
  }, [hasAutoIgnited])

  const handleToggle = useCallback(() => {
    setIsActive(prev => !prev)
    setHasAutoIgnited(true)
  }, [])

  const handlePhaseChange = useCallback((p: 'cold' | 'igniting' | 'active') => setPhase(p), [])

  return (
    <div className="rocky-container">
      {/* Title */}
      <div className="rocky-header">
        <p className="rocky-eyebrow">PETROVASCOPE VIEW — TAU CETI SYSTEM</p>
        <h1 className={`rocky-title ${isActive ? 'active' : ''}`}>The Petrova Line</h1>
        <p className={`rocky-subtitle ${isActive ? 'active' : ''}`}>
          Infrared Radiation · Astrophage Colony
        </p>
      </div>

      {/* Phase */}
      <div className="phase-indicator">
        <p className={`phase-status ${phase}`}>
          {phase === 'cold' && '◇ IR SCAN DORMANT'}
          {phase === 'igniting' && '◈ IR SIGNATURE DETECTED'}
          {phase === 'active' && '◆ PETROVA RADIATION ACTIVE'}
        </p>
      </div>

      {/* Countdown */}
      {!hasAutoIgnited && (
        <div
          className="countdown-bar"
          style={{ width: `${((AUTO_IGNITION_DELAY - countdown) / AUTO_IGNITION_DELAY) * 100}%` }}
        />
      )}

      {/* 3D Canvas — lightweight config */}
      <Canvas
        camera={{ fov: 55, near: 0.1, far: 400, position: [0, 3, 22] }}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        frameloop="always"
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <AstrophageScene isActive={isActive} onPhaseChange={handlePhaseChange} />
        </Suspense>
      </Canvas>

      {/* Ignition button */}
      <div className="ignition-zone">
        <button className={`ignition-btn ${isActive ? 'active' : ''}`} onClick={handleToggle}>
          <div className={`ignition-core ${isActive ? 'active' : ''}`} />
          <div className={`ignition-ring ${isActive ? 'active' : ''}`} />
        </button>
        <span className={`ignition-label ${isActive ? 'active' : ''}`}>
          {isActive ? 'Deactivate IR' : !hasAutoIgnited ?
            `IR Scan in ${Math.ceil(countdown)}s` : 'Activate IR'}
        </span>
      </div>

      {/* Controls */}
      <div className="controls-hint">
        <span className="hint-text">Drag to orbit · Scroll to zoom</span>
      </div>
    </div>
  )
}
