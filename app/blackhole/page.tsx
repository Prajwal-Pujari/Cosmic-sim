'use client'

import { Canvas } from '@react-three/fiber';
import BlackHoleScene from '@/components/simulation/BlackHole';
import { Suspense, useState } from 'react';
// import { Settings, X } from 'lucide-react';
import './BlackHoleControls.css';

export default function BlackHolePage() {
  const [controlsOpen, setControlsOpen] = useState(true);
  const [showPhotonSphere, setShowPhotonSphere] = useState(true);
  const [showAccretionDisk, setShowAccretionDisk] = useState(true);
  const [showStars, setShowStars] = useState(true);
  const [showNebula, setShowNebula] = useState(true);
  const [diskIntensity, setDiskIntensity] = useState(1.8);
  const [bloomIntensity, setBloomIntensity] = useState(5.0);
  const [lightingPreset, setLightingPreset] = useState<'realistic' | 'cinematic' | 'ethereal'>('cinematic');
  const [autoRotate, setAutoRotate] = useState(true);

  return (
    <div className="blackhole-container">
      <Canvas camera={{ fov: 60, position: [0, 8, 25] }}>
        <Suspense fallback={null}>
          <BlackHoleScene 
            showPhotonSphere={showPhotonSphere}
            showAccretionDisk={showAccretionDisk}
            showStars={showStars}
            showNebula={showNebula}
            diskIntensity={diskIntensity}
            bloomIntensity={bloomIntensity}
            lightingPreset={lightingPreset}
            autoRotate={autoRotate}
          />
        </Suspense>
      </Canvas>

      {/* Control Button */}
      {!controlsOpen && (
        <button
          onClick={() => setControlsOpen(true)}
          className="control-trigger"
          aria-label="Open controls"
        >
          {/* <Settings className="icon" /> */}S
        </button>
      )}

      {/* Control Panel */}
      {controlsOpen && (
        <div className="control-panel">
          <div className="panel-header">
            <h2 className="panel-title">Black Hole Controls</h2>
            <button
              onClick={() => setControlsOpen(false)}
              className="close-btn"
              aria-label="Close controls"
            >
              X
            </button>
          </div>

          <div className="controls-content">
            {/* Lighting Presets */}
            {/* <div className="control-group">
              <label className="control-label">Lighting Preset</label>
              <div className="preset-buttons">
                {(['realistic', 'cinematic', 'ethereal'] as const).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setLightingPreset(preset)}
                    className={`preset-btn ${lightingPreset === preset ? 'active' : ''}`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div> */}

            {/* Toggles */}
            <div className="control-group">
              <div className="toggle-row">
                <label className="toggle-label">Photon Sphere</label>
                <div 
                  className={`custom-toggle ${showPhotonSphere ? 'active' : ''}`}
                  onClick={() => setShowPhotonSphere(!showPhotonSphere)}
                  role="switch"
                  aria-checked={showPhotonSphere}
                  tabIndex={0}
                >
                  <div className="toggle-thumb" />
                </div>
              </div>

              <div className="toggle-row">
                <label className="toggle-label">Accretion Disk</label>
                <div 
                  className={`custom-toggle ${showAccretionDisk ? 'active' : ''}`}
                  onClick={() => setShowAccretionDisk(!showAccretionDisk)}
                  role="switch"
                  aria-checked={showAccretionDisk}
                  tabIndex={0}
                >
                  <div className="toggle-thumb" />
                </div>
              </div>

              <div className="toggle-row">
                <label className="toggle-label">Stars</label>
                <div 
                  className={`custom-toggle ${showStars ? 'active' : ''}`}
                  onClick={() => setShowStars(!showStars)}
                  role="switch"
                  aria-checked={showStars}
                  tabIndex={0}
                >
                  <div className="toggle-thumb" />
                </div>
              </div>

              {/* <div className="toggle-row">
                <label className="toggle-label">Nebula Clouds</label>
                <div 
                  className={`custom-toggle ${showNebula ? 'active' : ''}`}
                  onClick={() => setShowNebula(!showNebula)}
                  role="switch"
                  aria-checked={showNebula}
                  tabIndex={0}
                >
                  <div className="toggle-thumb" />
                </div>
              </div> */}

              <div className="toggle-row">
                <label className="toggle-label">Auto Rotate</label>
                <div 
                  className={`custom-toggle ${autoRotate ? 'active' : ''}`}
                  onClick={() => setAutoRotate(!autoRotate)}
                  role="switch"
                  aria-checked={autoRotate}
                  tabIndex={0}
                >
                  <div className="toggle-thumb" />
                </div>
              </div>
            </div>

            {/* Sliders */}
            <div className="control-group">
              <div className="slider-row">
                <div className="slider-header">
                  <label className="slider-label">Disk Intensity</label>
                  <span className="slider-value">{diskIntensity.toFixed(1)}</span>
                </div>
                <div className="slider-container">
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={diskIntensity}
                    onChange={(e) => setDiskIntensity(parseFloat(e.target.value))}
                    className="custom-slider"
                    style={{
                      background: `linear-gradient(to right, 
                        hsl(190, 95%, 55%) 0%, 
                        hsl(190, 95%, 55%) ${((diskIntensity - 0.5) / 2.5) * 100}%, 
                        rgba(255,255,255,0.1) ${((diskIntensity - 0.5) / 2.5) * 100}%, 
                        rgba(255,255,255,0.1) 100%)`
                    }}
                  />
                </div>
              </div>

              <div className="slider-row">
                <div className="slider-header">
                  <label className="slider-label">Bloom Intensity</label>
                  <span className="slider-value">{bloomIntensity.toFixed(1)}</span>
                </div>
                <div className="slider-container">
                  <input
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.5"
                    value={bloomIntensity}
                    onChange={(e) => setBloomIntensity(parseFloat(e.target.value))}
                    className="custom-slider"
                    style={{
                      background: `linear-gradient(to right, 
                        hsl(25, 95%, 60%) 0%, 
                        hsl(25, 95%, 60%) ${((bloomIntensity - 1) / 9) * 100}%, 
                        rgba(255,255,255,0.1) ${((bloomIntensity - 1) / 9) * 100}%, 
                        rgba(255,255,255,0.1) 100%)`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="info-section">
              <p className="info-text">
                Drag to rotate • Scroll to zoom • Pan with right-click
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
