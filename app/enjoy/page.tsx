"use client";

import { useState, useEffect, useRef } from "react";

const formatWavelength = (freqHz: number) => {
  if (!freqHz || freqHz <= 0) return "∞ m";
  const speedOfSound = 343; // m/s in dry air at 20°C
  const meters = speedOfSound / freqHz;
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  } else if (meters >= 1) {
    return `${meters.toFixed(2)} m`;
  } else if (meters >= 0.01) {
    return `${(meters * 100).toFixed(1)} cm`;
  } else {
    return `${(meters * 1000).toFixed(1)} mm`;
  }
};

const generateSquareWaveSVG = (freq: number) => {
  const numCycles = Math.max(1, Math.min(25, Math.ceil(Math.pow(Math.max(1, freq) / 10, 0.35) * 2)));
  const w = 400;
  const cw = w / numCycles;
  let d = `M 0 25`;
  for (let i = 0; i < numCycles; i++) {
    const x = i * cw;
    d += ` L ${x} 5 L ${x + cw / 2} 5 L ${x + cw / 2} 25 L ${x + cw} 25`;
  }
  return d;
};

const generateSineWaveSVG = (freq: number) => {
  const numCycles = Math.max(1, Math.min(25, Math.ceil(Math.pow(Math.max(1, freq) / 10, 0.35) * 2)));
  const w = 400;
  let d = `M 0 15`;
  for (let x = 0; x <= w; x += 4) {
    const angle = (x / w) * numCycles * Math.PI * 2;
    const y = 15 - Math.sin(angle) * 11;
    d += ` L ${x} ${y.toFixed(1)}`;
  }
  return d;
};

export default function EnjoyPage() {
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [manualSpeed, setManualSpeed] = useState<number>(2.0);
  const [trailPersistence, setTrailPersistence] = useState<number>(0.85);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [audioLayer, setAudioLayer] = useState<"layered" | "square" | "circle">("layered");
  const [pathMode, setPathMode] = useState<"square" | "oscilloscope">(
    "oscilloscope"
  );
  const [dimensionMode, setDimensionMode] = useState<"2D" | "3D">("3D");
  const dimensionModeRef = useRef<"2D" | "3D">("3D");
  const tunnelOffsetRef = useRef<number>(0);
  const [autoRotate3D, setAutoRotate3D] = useState<boolean>(true);
  const autoRotate3DRef = useRef<boolean>(true);
  const cameraRotXRef = useRef<number>(0.15);
  const cameraRotYRef = useRef<number>(-0.25);
  const cameraZoomRef = useRef<number>(1.0);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showSpecs, setShowSpecs] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);

  // Geometry & Visibility Controls
  const [showSquareBox, setShowSquareBox] = useState<boolean>(true);
  const [squareScale, setSquareScale] = useState<number>(1.0);
  const [squareSpeedMult, setSquareSpeedMult] = useState<number>(1.0);
  const [showCircleRing, setShowCircleRing] = useState<boolean>(true);
  const [circleScale, setCircleScale] = useState<number>(1.0);

  // Frequency Controls (Channel X & Channel Y) and 1:1 Synchronization
  const [squareFreq, setSquareFreq] = useState<number>(2.0);
  const squareFreqRef = useRef<number>(2.0);
  const [syncFreqs, setSyncFreqs] = useState<boolean>(false);
  const syncFreqsRef = useRef<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const speedValueRef = useRef<HTMLSpanElement | null>(null);
  const speedBarRef = useRef<HTMLDivElement | null>(null);
  const squareReadoutRef = useRef<HTMLElement | null>(null);
  const circleReadoutRef = useRef<HTMLElement | null>(null);
  const circleSliderRef1 = useRef<HTMLInputElement | null>(null);
  const circleSliderRef2 = useRef<HTMLInputElement | null>(null);

  const modeRef = useRef<"auto" | "manual">("auto");
  const manualSpeedRef = useRef<number>(2.0);
  const trailRef = useRef<number>(0.85);
  const pathModeRef = useRef<"square" | "oscilloscope">("oscilloscope");
  const phaseXRef = useRef<number>(0);
  const phaseYRef = useRef<number>(0);

  const showSquareBoxRef = useRef<boolean>(true);
  const squareScaleRef = useRef<number>(1.0);
  const squareSpeedMultRef = useRef<number>(1.0);
  const showCircleRingRef = useRef<boolean>(true);
  const circleScaleRef = useRef<number>(1.0);

  // Web Audio API references
  const audioContextRef = useRef<AudioContext | null>(null);
  const circleOscRef = useRef<OscillatorNode | null>(null);
  const circleGainRef = useRef<GainNode | null>(null);
  const squareOscRef = useRef<OscillatorNode | null>(null);
  const squareGainRef = useRef<GainNode | null>(null);
  const audioEnabledRef = useRef<boolean>(false);
  const audioLayerRef = useRef<"layered" | "square" | "circle">("layered");

  const handleModeChange = (newMode: "auto" | "manual") => {
    setMode(newMode);
    modeRef.current = newMode;
  };

  const handleSpeedChange = (speed: number) => {
    setManualSpeed(speed);
    manualSpeedRef.current = speed;
    if (syncFreqsRef.current) {
      setSquareFreq(speed);
      squareFreqRef.current = speed;
    }
    if (modeRef.current !== "manual") {
      setMode("manual");
      modeRef.current = "manual";
    }
  };

  const handleSquareFreqChange = (freq: number) => {
    setSquareFreq(freq);
    squareFreqRef.current = freq;
    if (syncFreqsRef.current) {
      setManualSpeed(freq);
      manualSpeedRef.current = freq;
    }
    if (modeRef.current !== "manual") {
      setMode("manual");
      modeRef.current = "manual";
    }
  };

  const handleSyncFreqsToggle = (val: boolean) => {
    setSyncFreqs(val);
    syncFreqsRef.current = val;
    if (val) {
      setSquareFreq(manualSpeedRef.current);
      squareFreqRef.current = manualSpeedRef.current;
    }
  };

  const handleTrailChange = (persistence: number) => {
    setTrailPersistence(persistence);
    trailRef.current = persistence;
  };

  const handlePathModeChange = (newPathMode: "square" | "oscilloscope") => {
    setPathMode(newPathMode);
    pathModeRef.current = newPathMode;
  };

  const handleDimensionModeChange = (newDimMode: "2D" | "3D") => {
    setDimensionMode(newDimMode);
    dimensionModeRef.current = newDimMode;
  };

  const handleAutoRotate3DToggle = (val: boolean) => {
    setAutoRotate3D(val);
    autoRotate3DRef.current = val;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dimensionModeRef.current !== "3D") return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || dimensionModeRef.current !== "3D") return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    cameraRotYRef.current += deltaX * 0.006;
    cameraRotXRef.current += deltaY * 0.006;
    cameraRotXRef.current = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, cameraRotXRef.current));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (dimensionModeRef.current !== "3D") return;
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    cameraZoomRef.current = Math.max(0.2, Math.min(4.5, cameraZoomRef.current * zoomFactor));
  };

  const handleDoubleClick = () => {
    if (dimensionModeRef.current !== "3D") return;
    cameraRotXRef.current = 0.15;
    cameraRotYRef.current = -0.25;
    cameraZoomRef.current = 1.0;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (dimensionModeRef.current !== "3D" || e.touches.length === 0) return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || dimensionModeRef.current !== "3D" || e.touches.length === 0) return;
    const deltaX = e.touches[0].clientX - dragStartRef.current.x;
    const deltaY = e.touches[0].clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

    cameraRotYRef.current += deltaX * 0.006;
    cameraRotXRef.current += deltaY * 0.006;
    cameraRotXRef.current = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, cameraRotXRef.current));
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const handleSquareBoxToggle = (val: boolean) => {
    setShowSquareBox(val);
    showSquareBoxRef.current = val;
  };
  const handleSquareScaleChange = (val: number) => {
    setSquareScale(val);
    squareScaleRef.current = val;
  };
  const handleSquareSpeedChange = (val: number) => {
    setSquareSpeedMult(val);
    squareSpeedMultRef.current = val;
  };
  const handleCircleRingToggle = (val: boolean) => {
    setShowCircleRing(val);
    showCircleRingRef.current = val;
  };
  const handleCircleScaleChange = (val: number) => {
    setCircleScale(val);
    circleScaleRef.current = val;
  };

  const toggleAudio = () => {
    if (!audioEnabledRef.current) {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        // Square Fundamental & Odd Harmonics: True square wave synthesizing odd harmonics (n=1,3,5...) at fundamental frequency
        const sqOsc = ctx.createOscillator();
        const sqGain = ctx.createGain();
        sqOsc.type = "square";
        sqOsc.frequency.setValueAtTime(110, ctx.currentTime);
        const sqVal = (audioLayerRef.current === "layered" || audioLayerRef.current === "square") ? 0.045 : 0;
        sqGain.gain.setValueAtTime(sqVal, ctx.currentTime);
        sqOsc.connect(sqGain);
        sqGain.connect(ctx.destination);
        sqOsc.start();
        squareOscRef.current = sqOsc;
        squareGainRef.current = sqGain;

        // Circle Fundamental Frequency: Dynamic Sine tone gliding with orbital velocity
        const circOsc = ctx.createOscillator();
        const circGain = ctx.createGain();
        circOsc.type = "sine";
        circOsc.frequency.setValueAtTime(110, ctx.currentTime);
        const circVal = (audioLayerRef.current === "layered" || audioLayerRef.current === "circle") ? 0.09 : 0;
        circGain.gain.setValueAtTime(circVal, ctx.currentTime);
        circOsc.connect(circGain);
        circGain.connect(ctx.destination);
        circOsc.start();
        circleOscRef.current = circOsc;
        circleGainRef.current = circGain;

        setAudioEnabled(true);
        audioEnabledRef.current = true;
      } catch (err) {
        console.error("Failed to initialize Web Audio API:", err);
      }
    } else {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setAudioEnabled(false);
      audioEnabledRef.current = false;
    }
  };

  const handleAudioLayerChange = (newLayer: "layered" | "square" | "circle") => {
    setAudioLayer(newLayer);
    audioLayerRef.current = newLayer;
    if (audioContextRef.current && squareGainRef.current && circleGainRef.current) {
      const now = audioContextRef.current.currentTime;
      const sqTarget = (newLayer === "layered" || newLayer === "square") ? 0.045 : 0;
      const circTarget = (newLayer === "layered" || newLayer === "circle") ? 0.09 : 0;
      squareGainRef.current.gain.setTargetAtTime(sqTarget, now, 0.04);
      circleGainRef.current.gain.setTargetAtTime(circTarget, now, 0.04);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let cycleTime = 0;
    let u = 0; // Perimeter parameter [0, 4)

    const CYCLE_DURATION = 180; // 180 seconds (3 minutes) slow meditative climb through each frequency number!
    const V_MIN = 0.5;
    const V_MAX = 10000.0; // 10 kHz (actual audio oscilloscope range!)

    const freqSteps = [
      0.5, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0,
      12.0, 15.0, 16.0, 20.0, 24.0, 25.0, 30.0, 32.0, 40.0, 44.0,
      50.0, 60.0, 64.0, 80.0, 88.0, 100.0, 110.0, 120.0, 150.0,
      200.0, 220.0, 250.0, 300.0, 330.0, 400.0, 440.0,
      500.0, 800.0, 1000.0, 2000.0, 5000.0, 10000.0,
    ];

    // Compute velocity given normalized cycle time tau in [0, 1)
    const getVelocity = (tau: number): number => {
      if (tau < 0.88) {
        // Phase 1: Step cleanly through each frequency number (1, 2, 3... up to 440 and 10,000 Hz)
        const progress = tau / 0.88;
        const totalSteps = freqSteps.length;
        const stepPos = progress * (totalSteps - 1);
        const index = Math.floor(stepPos);
        const nextIndex = Math.min(totalSteps - 1, index + 1);
        const frac = stepPos - index;

        // Hold on the exact frequency number for 80% of the step time so you clearly see the pattern, transition smoothly in the last 20%
        if (frac < 0.8) {
          return freqSteps[index];
        } else {
          const transFrac = (frac - 0.8) / 0.2;
          const smooth = 0.5 * (1 - Math.cos(Math.PI * transFrac));
          return freqSteps[index] + (freqSteps[nextIndex] - freqSteps[index]) * smooth;
        }
      } else {
        // Phase 2: Smooth deceleration looping back from 10,000 Hz down to 0.5 Hz
        const r = (tau - 0.88) / 0.12;
        const smooth = 0.5 * (1 + Math.cos(Math.PI * r));
        return freqSteps[0] + (freqSteps[freqSteps.length - 1] - freqSteps[0]) * smooth;
      }
    };

    const render = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      let currentVelocity = 0;
      if (modeRef.current === "auto") {
        cycleTime = (cycleTime + dt) % CYCLE_DURATION;
        const tau = cycleTime / CYCLE_DURATION;
        currentVelocity = getVelocity(tau);
        manualSpeedRef.current = currentVelocity;
      } else {
        currentVelocity = manualSpeedRef.current;
      }

      // If 1:1 synchronization is enabled, both Square and Circle increase and decrease together samely!
      if (syncFreqsRef.current) {
        squareFreqRef.current = currentVelocity;
      }

      // Update UI readouts directly without React re-render overhead
      const currentSquareFreq = squareFreqRef.current || 1;
      if (speedValueRef.current) {
        speedValueRef.current.textContent = `${(currentVelocity / currentSquareFreq).toFixed(2)} : 1`;
      }
      if (speedBarRef.current) {
        const percentage = Math.min(100, (currentVelocity / 10000.0) * 100);
        speedBarRef.current.style.width = `${percentage}%`;
      }
      if (squareReadoutRef.current) {
        squareReadoutRef.current.textContent = currentSquareFreq >= 1000 ? `${(currentSquareFreq / 1000).toFixed(1)} kHz` : `${currentSquareFreq.toFixed(1)} Hz`;
      }
      if (circleReadoutRef.current) {
        circleReadoutRef.current.textContent = currentVelocity >= 1000 ? `${(currentVelocity / 1000).toFixed(1)} kHz` : `${currentVelocity.toFixed(1)} Hz`;
      }
      if (modeRef.current === "auto") {
        if (circleSliderRef1.current) circleSliderRef1.current.value = currentVelocity.toString();
        if (circleSliderRef2.current) circleSliderRef2.current.value = currentVelocity.toString();
      }

      const squareSoundFreq = Math.max(0.5, currentSquareFreq); // Channel X audio freq
      const circleSoundFreq = Math.max(0.5, currentVelocity); // Channel Y audio freq
      let freqRatio = circleSoundFreq / squareSoundFreq; // Exact ratio connecting sound to visual oscillation

      // Update Web Audio API oscillators in real time
      if (
        audioEnabledRef.current &&
        audioContextRef.current &&
        circleOscRef.current &&
        squareOscRef.current
      ) {
        const now = audioContextRef.current.currentTime;
        circleOscRef.current.frequency.setTargetAtTime(
          circleSoundFreq,
          now,
          0.04
        );
        squareOscRef.current.frequency.setTargetAtTime(
          squareSoundFreq,
          now,
          0.04
        );
      }

      // Handle resize and retina scaling dynamically
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      let didResize = false;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        didResize = true;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Pure ivory background wash (#FFFFF0) with trail persistence
      if (didResize || trailRef.current <= 0.01) {
        ctx.fillStyle = "#FFFFF0";
        ctx.fillRect(0, 0, width, height);
      } else {
        const alpha = Math.max(0.0, 1 - trailRef.current);
        ctx.fillStyle = `rgba(255, 255, 240, ${alpha})`;
        ctx.fillRect(0, 0, width, height);
      }

      // Calculate square path geometry
      const size = Math.min(width, height) * 0.46;
      const half = (size / 2) * squareScaleRef.current;
      const centerX = width / 2;
      const centerY = height / 2;

      // Calculate how far u advances this frame (controlled directly by Square Frequency!)
      const totalDeltaU = squareFreqRef.current * 4 * dt * squareSpeedMultRef.current;

      // Sub-frame multi-sampling to eliminate stroboscopic freezing and create smooth continuous geometric patterns
      const steps = Math.max(1, Math.min(80, Math.ceil(totalDeltaU * 18)));
      const stepDeltaU = totalDeltaU / steps;
      const stepDt = dt / steps;
      const radius = (size / 2) * circleScaleRef.current; // Independent Circle Size scale

      let phaseX = phaseXRef.current;
      let phaseY = phaseYRef.current;
      let prevX: number | null = null;
      let prevY: number | null = null;

      if (dimensionModeRef.current === "3D") {
        // 1. Advance continuous clocks for 3D Hyperspace
        const omega = 2 * Math.PI * currentVelocity;
        const prevU = u;
        u = (u - stepDeltaU * steps) % 4;
        if (u < 0) u += 4;
        phaseX = (phaseX + omega * dt) % (Math.PI * 2);
        phaseXRef.current = phaseX;

        // Audio chime check for 90-degree corner crossing
        if (Math.floor(prevU) !== Math.floor(u) && audioEnabledRef.current && audioContextRef.current) {
          try {
            const ctxAudio = audioContextRef.current;
            const chimeOsc = ctxAudio.createOscillator();
            const chimeGain = ctxAudio.createGain();
            chimeOsc.type = "sine";
            const chord = [220, 277.18, 329.63, 440];
            chimeOsc.frequency.setValueAtTime(chord[Math.floor(u) % 4], ctxAudio.currentTime);
            chimeGain.gain.setValueAtTime(0.045, ctxAudio.currentTime);
            chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctxAudio.currentTime + 0.22);
            chimeOsc.connect(chimeGain);
            chimeGain.connect(ctxAudio.destination);
            chimeOsc.start();
            chimeOsc.stop(ctxAudio.currentTime + 0.23);
          } catch (_e) { }
        }

        // 2. 3D Deep Tunnel Perspective Extrusion & Camera Navigation
        if (autoRotate3DRef.current && !isDraggingRef.current) {
          cameraRotYRef.current += dt * 0.18; // Smooth gentle rotation in 3D space when not dragging!
        }

        const rotX = cameraRotXRef.current;
        const rotY = cameraRotYRef.current;
        const zoom = cameraZoomRef.current;
        const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
        const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
        const pivotZ = 650; // Orbit around the center of the visible tunnel

        const focalLength = 450;

        // 3D rotation and projection helper
        const project3D = (x3d: number, y3d: number, z3d: number) => {
          const zShift = z3d - pivotZ;
          const x1 = x3d * cosY + zShift * sinY;
          const z1 = -x3d * sinY + zShift * cosY;
          const y2 = y3d * cosX - z1 * sinX;
          const z2 = y3d * sinX + z1 * cosX;
          const zFinal = z2 + pivotZ;

          if (zFinal < 15) return null;
          const scale = (focalLength * zoom) / (zFinal + focalLength);
          return {
            x: centerX + x1 * scale,
            y: centerY + y2 * scale,
            scale,
            z: zFinal
          };
        };

        const numSlices = 48;
        const zSpacing = 36;
        const zMax = numSlices * zSpacing; // 1728 depth into deep space

        // Animate forward flight through the tunnel at speed proportional to velocity!
        const travelSpeed = Math.max(20, Math.min(350, currentVelocity * 6));
        tunnelOffsetRef.current = (tunnelOffsetRef.current + travelSpeed * dt) % zSpacing;

        let prevPointer3D: { x: number; y: number } | null = null;
        let prevCorners3D: ({ x: number; y: number; scale: number } | null)[] | null = null;

        // Render from deep space (back) to camera plane (front) for clean depth layering
        for (let i = numSlices - 1; i >= 0; i--) {
          const Z = i * zSpacing - tunnelOffsetRef.current;
          if (Z < 5) continue;

          const alpha3D = Math.pow(Math.max(0, 1 - Z / zMax), 1.4); // Atmospheric depth fog

          // Calculate wave phase and perimeter progress at this depth in history
          const trailVal = trailRef.current;
          const max3DDelay = 0.8 + trailVal * 15.0; // Up to 15.8 seconds of 3D depth history!
          const timeDelay = (Z / zMax) * max3DDelay;
          const slicePhaseX = phaseX - timeDelay * 2 * Math.PI * Math.max(0.5, currentVelocity * 0.25);
          let sliceU = (u - timeDelay * (squareFreqRef.current || 1) * 2 + 4000) % 4;
          if (sliceU < 0) sliceU += 4;

          let sx = 0;
          let sy = 0;
          if (sliceU < 1) {
            sx = -half + sliceU * (2 * half);
            sy = -half;
          } else if (sliceU < 2) {
            sx = half;
            sy = -half + (sliceU - 1) * (2 * half);
          } else if (sliceU < 3) {
            sx = half - (sliceU - 2) * (2 * half);
            sy = half;
          } else {
            sx = -half;
            sy = half - (sliceU - 3) * (2 * half);
          }

          // In oscilloscope mode, the entire 3D tunnel undulates and twists in 3D space!
          let undX = 0;
          let undY = 0;
          if (pathModeRef.current === "oscilloscope") {
            undX = half * 0.45 * Math.sin(slicePhaseX);
            undY = half * 0.45 * Math.cos(slicePhaseX * 1.3);
          }

          const sHalf = half * squareScaleRef.current;
          const currCorners = [
            project3D(undX - sHalf, undY - sHalf, Z), // TL
            project3D(undX + sHalf, undY - sHalf, Z), // TR
            project3D(undX + sHalf, undY + sHalf, Z), // BR
            project3D(undX - sHalf, undY + sHalf, Z), // BL
          ];

          // A. Draw 3D Perspective Square Tunnel Walls & Boxes when Square Box is ON
          if (showSquareBoxRef.current && currCorners.every(c => c !== null)) {
            ctx.beginPath();
            ctx.moveTo(currCorners[0]!.x, currCorners[0]!.y);
            ctx.lineTo(currCorners[1]!.x, currCorners[1]!.y);
            ctx.lineTo(currCorners[2]!.x, currCorners[2]!.y);
            ctx.lineTo(currCorners[3]!.x, currCorners[3]!.y);
            ctx.closePath();
            ctx.lineWidth = Math.max(0.8, (width * 0.0018) * currCorners[0]!.scale);
            ctx.strokeStyle = `rgba(17, 17, 17, ${0.35 * alpha3D})`;
            ctx.stroke();

            // Connect longitudinal corner lines to form 3D perspective sci-fi corridor!
            if (prevCorners3D && prevCorners3D.every(c => c !== null)) {
              for (let c = 0; c < 4; c++) {
                ctx.beginPath();
                ctx.moveTo(prevCorners3D[c]!.x, prevCorners3D[c]!.y);
                ctx.lineTo(currCorners[c]!.x, currCorners[c]!.y);
                ctx.lineWidth = Math.max(0.6, (width * 0.0012) * currCorners[c]!.scale);
                ctx.strokeStyle = `rgba(17, 17, 17, ${0.22 * alpha3D})`;
                ctx.stroke();
              }
            }
          }
          prevCorners3D = currCorners;

          // B. Draw 3D Circular Rings floating in space when Circle Ring is ON
          const circRad = radius * circleScaleRef.current;
          const circCenterProj = project3D(undX + sx, undY + sy, Z);
          if (showCircleRingRef.current && circCenterProj) {
            const rx = Math.max(0.5, circRad * circCenterProj.scale * Math.max(0.18, Math.abs(cosY)));
            const ry = Math.max(0.5, circRad * circCenterProj.scale * Math.max(0.18, Math.abs(cosX)));
            ctx.beginPath();
            ctx.ellipse(circCenterProj.x, circCenterProj.y, rx, ry, 0, 0, Math.PI * 2);
            ctx.lineWidth = Math.max(1.2, (width * 0.003) * circCenterProj.scale);
            ctx.strokeStyle = `rgba(17, 17, 17, ${0.8 * alpha3D})`;
            ctx.stroke();

            // Inner concentric ring
            ctx.beginPath();
            ctx.ellipse(circCenterProj.x, circCenterProj.y, rx * 0.88, ry * 0.88, 0, 0, Math.PI * 2);
            ctx.lineWidth = Math.max(0.6, (width * 0.0014) * circCenterProj.scale);
            ctx.strokeStyle = `rgba(17, 17, 17, ${0.35 * alpha3D})`;
            ctx.stroke();
          }

          // C. Draw 3D Helical Lissajous Ribbon weaving through the center of all rings!
          let pxWorld = undX + sx;
          let pyWorld = undY + sy;
          if (pathModeRef.current === "oscilloscope") {
            pxWorld = undX + sx + circRad * Math.cos(slicePhaseX);
            pyWorld = undY + sy + circRad * Math.sin(slicePhaseX);
          }
          const pProj = project3D(pxWorld, pyWorld, Z);

          if (pProj) {
            if (prevPointer3D) {
              ctx.beginPath();
              ctx.moveTo(prevPointer3D.x, prevPointer3D.y);
              ctx.lineTo(pProj.x, pProj.y);
              ctx.lineWidth = Math.max(2.0, (width * 0.005) * pProj.scale);
              ctx.strokeStyle = `rgba(17, 17, 17, ${0.95 * alpha3D})`;
              ctx.stroke();
            }
            prevPointer3D = { x: pProj.x, y: pProj.y };
          }
        }
      } else {
        // --- Standard 2D Flat Simulation Mode ---
        for (let s = 1; s <= steps; s++) {
          const prevCorner = Math.floor(u);
          u = (u - stepDeltaU) % 4; // Anticlockwise movement
          if (u < 0) u += 4;
          const nextCorner = Math.floor(u);

          // If integer boundary changed, circle turned a 90-degree corner
          if (
            prevCorner !== nextCorner &&
            audioEnabledRef.current &&
            audioContextRef.current
          ) {
            try {
              const ctxAudio = audioContextRef.current;
              const chimeOsc = ctxAudio.createOscillator();
              const chimeGain = ctxAudio.createGain();
              chimeOsc.type = "sine";
              // Harmonic A Major sequence (A3, C#4, E4, A4) representing the 4 corners of the square
              const chord = [220, 277.18, 329.63, 440];
              chimeOsc.frequency.setValueAtTime(
                chord[nextCorner % 4],
                ctxAudio.currentTime
              );
              chimeGain.gain.setValueAtTime(0.045, ctxAudio.currentTime);
              chimeGain.gain.exponentialRampToValueAtTime(
                0.0001,
                ctxAudio.currentTime + 0.22
              );
              chimeOsc.connect(chimeGain);
              chimeGain.connect(ctxAudio.destination);
              chimeOsc.start();
              chimeOsc.stop(ctxAudio.currentTime + 0.23);
            } catch (_e) {
              // ignore
            }
          }

          let x = 0;
          let y = 0;

          let x_square = 0;
          let y_square = 0;
          if (u < 1) {
            x_square = -half + u * (2 * half);
            y_square = -half;
          } else if (u < 2) {
            x_square = half;
            y_square = -half + (u - 1) * (2 * half);
          } else if (u < 3) {
            x_square = half - (u - 2) * (2 * half);
            y_square = half;
          } else {
            x_square = -half;
            y_square = half - (u - 3) * (2 * half);
          }

          if (pathModeRef.current === "oscilloscope") {
            // Accumulate pointer orbital angle controlled directly by Circle Frequency!
            const omega = 2 * Math.PI * currentVelocity; // Exact orbital frequency
            phaseX = (phaseX + omega * stepDt) % (Math.PI * 2);
            prevX = x_square;
            prevY = y_square;
            x = x_square;
            y = y_square;
          } else {
            x = x_square;
            y = y_square;

            // Draw rings with sub-step alpha compensation
            const subAlpha = steps > 1 ? Math.max(0.14, 1 / Math.sqrt(steps)) : 1.0;
            ctx.strokeStyle = `rgba(17, 17, 17, ${subAlpha})`;

            // Draw primary outer hollow ring
            ctx.beginPath();
            ctx.arc(centerX + x, centerY + y, radius, 0, Math.PI * 2);
            ctx.lineWidth = Math.max(2.0, Math.min(width, height) * 0.004);
            ctx.stroke();

            // Draw secondary inner concentric ring
            ctx.beginPath();
            ctx.arc(centerX + x, centerY + y, radius * 0.88, 0, Math.PI * 2);
            ctx.lineWidth = Math.max(1.0, Math.min(width, height) * 0.0018);
            ctx.stroke();
          }
        }

        if (pathModeRef.current === "oscilloscope" && prevX !== null && prevY !== null) {
          phaseXRef.current = phaseX;

          // 1. Static outline of the square box on screen when Square Box is ON
          if (showSquareBoxRef.current) {
            ctx.beginPath();
            ctx.rect(centerX - half, centerY - half, half * 2, half * 2);
            ctx.lineWidth = Math.max(1.0, Math.min(width, height) * 0.0018);
            ctx.strokeStyle = "rgba(17, 17, 17, 0.22)";
            ctx.stroke();
          }

          // 2. Draw the continuous 2D Lissajous Oscilloscope Ribbon across history!
          const trailVal = trailRef.current;
          const numHistory = Math.floor(250 + trailVal * 950); // Up to 1200 points of resolution!
          const maxDelay = 0.5 + trailVal * 30.0; // Up to 30.5 seconds of glowing trail history!
          let prevOsc: { x: number; y: number } | null = null;
          for (let i = numHistory; i >= 0; i--) {
            const timeDelay = (i / numHistory) * maxDelay;
            let histU = (u - timeDelay * (squareFreqRef.current || 1) * 2 + 4000) % 4;
            if (histU < 0) histU += 4;
            const histPhase = phaseX - timeDelay * 2 * Math.PI * currentVelocity;

            let sx = 0, sy = 0;
            if (histU < 1) { sx = -half + histU * (2 * half); sy = -half; }
            else if (histU < 2) { sx = half; sy = -half + (histU - 1) * (2 * half); }
            else if (histU < 3) { sx = half - (histU - 2) * (2 * half); sy = half; }
            else { sx = -half; sy = half - (histU - 3) * (2 * half); }

            const px = centerX + sx + radius * Math.cos(histPhase);
            const py = centerY + sy + radius * Math.sin(histPhase);

            if (prevOsc) {
              const trailAlpha = Math.pow(Math.max(0, 1 - i / numHistory), 1.3);
              ctx.beginPath();
              ctx.moveTo(prevOsc.x, prevOsc.y);
              ctx.lineTo(px, py);
              ctx.lineWidth = Math.max(2.0, Math.min(width, height) * 0.0035);
              ctx.strokeStyle = `rgba(17, 17, 17, ${0.95 * trailAlpha})`;
              ctx.stroke();
            }
            prevOsc = { x: px, y: py };
          }

          // 3. Always show the SINGLE FULL COMPLETED PERFECT CIRCLE at the current oscillating position when Circle Ring is ON
          if (showCircleRingRef.current && prevOsc) {
            ctx.beginPath();
            ctx.arc(
              prevOsc.x,
              prevOsc.y,
              radius,
              0,
              Math.PI * 2
            );
            ctx.lineWidth = Math.max(2.2, Math.min(width, height) * 0.0035);
            ctx.strokeStyle = "#111111";
            ctx.stroke();

            // Inner concentric circle for premium aesthetic
            ctx.beginPath();
            ctx.arc(
              prevOsc.x,
              prevOsc.y,
              radius * 0.88,
              0,
              Math.PI * 2
            );
            ctx.lineWidth = Math.max(1.0, Math.min(width, height) * 0.0018);
            ctx.strokeStyle = "rgba(17, 17, 17, 0.4)";
            ctx.stroke();
          }
        }
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <main className="fixed inset-0 w-full h-full overflow-hidden bg-[#FFFFF0] select-none">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        className={`block w-full h-full touch-none ${dimensionMode === "3D" ? "cursor-grab active:cursor-grabbing" : ""}`}
      />

      {dimensionMode === "3D" && (
        <div className="absolute top-4 left-4 right-4 sm:top-auto sm:right-auto sm:bottom-8 sm:left-8 z-10 pointer-events-none font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-[#111111]/70 bg-[#FFFFF0]/90 backdrop-blur-sm px-3 sm:px-3.5 py-1.5 rounded-full border border-[#111111]/15 shadow-sm animate-fadeIn flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 max-w-[calc(100%-2rem)] sm:max-w-md mx-auto sm:mx-0 text-center sm:text-left">
          <span className="w-2 h-2 rounded-full bg-[#111111] animate-pulse shrink-0" />
          <span>3D Space: Drag/Touch to rotate • Scroll/Pinch to zoom • Double-tap to reset</span>
        </div>
      )}

      {/* Physics & Specs Modal */}
      {showSpecs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/40 backdrop-blur-md p-6 select-text animate-fadeIn">
          <div className="bg-[#FFFFF0] border border-[#111111]/20 rounded-2xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl font-mono text-[#111111] relative">
            <button
              onClick={() => setShowSpecs(false)}
              className="absolute top-6 right-6 px-3 py-1 text-xs uppercase tracking-widest border border-[#111111]/20 rounded-full hover:bg-[#111111] hover:text-[#FFFFF0] transition-all cursor-pointer"
            >
              ✕ Close
            </button>

            <h2 className="text-xl font-light uppercase tracking-[0.2em] mb-2 border-b border-[#111111]/10 pb-3">
              Oscillation &amp; Frame Rate Physics
            </h2>
            <p className="text-xs text-[#111111]/60 mb-6 leading-relaxed">
              How frame rate, waveform capture, and phosphor persistence operate
              across analogue hardware, digital instruments, and our interactive
              UI simulation.
            </p>

            <div className="space-y-6 text-xs leading-relaxed">
              <section className="bg-[#111111]/[0.03] p-4 rounded-xl border border-[#111111]/10">
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-2 text-[#111111]">
                  1. Real Analogue Oscilloscopes (CROs)
                </h3>
                <p className="mb-2">
                  <strong className="font-medium underline">
                    Infinite Frame Rate (Continuous Beam):
                  </strong>{" "}
                  Traditional analogue oscilloscopes do not have pixels, frames,
                  or a digital &ldquo;frame rate.&rdquo; They steer a
                  continuous physical electron beam across a phosphor-coated
                  glass screen. Because the beam moves smoothly without discrete
                  digital steps, its spatial resolution and movement resolution
                  are effectively infinite.
                </p>
                <p>
                  <strong className="font-medium underline">
                    Phosphor Persistence:
                  </strong>{" "}
                  What you see depends on how fast the signal repeats and the
                  chemical persistence of the phosphor screen (typically fading
                  over tens of milliseconds to seconds). When a waveform repeats
                  at 60 Hz or faster, human persistence of vision blends the
                  glowing beam into a solid, motionless geometric sculpture.
                </p>
              </section>

              <section className="bg-[#111111]/[0.03] p-4 rounded-xl border border-[#111111]/10">
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-2 text-[#111111]">
                  2. Modern Digital Oscilloscopes (DSOs)
                </h3>
                <p className="mb-2">
                  <strong className="font-medium underline">
                    Waveform Capture Rate:
                  </strong>{" "}
                  Digital oscilloscopes measure performance in{" "}
                  <em className="not-italic font-semibold">
                    Waveforms Per Second (wfms/s)
                  </em>{" "}
                  rather than video FPS. Typical digital oscilloscopes capture
                  10,000 to 100,000+ waveforms per second (with high-end models
                  exceeding 1,000,000 wfms/s).
                </p>
                <p>
                  <strong className="font-medium underline">
                    Screen Refresh:
                  </strong>{" "}
                  While the internal processing engine captures tens of
                  thousands of traces per second, the physical LCD/OLED screen
                  typically refreshes at 60 Hz or 120 Hz, layering thousands of
                  captured sweeps into each video frame with intensity grading
                  to mimic analogue phosphor glow.
                </p>
              </section>

              <section className="bg-[#111111]/[0.05] p-4 rounded-xl border border-[#111111]/20 shadow-inner">
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-2 text-[#111111] flex items-center justify-between">
                  <span>
                    3. Our Web UI Simulation (
                    <code className="text-[11px] bg-[#111111]/10 px-1.5 py-0.5 rounded">
                      app/enjoy/page.tsx
                    </code>
                    )
                  </span>
                  <span className="text-[10px] bg-[#111111] text-[#FFFFF0] px-2 py-0.5 rounded-full">
                    Active Engine
                  </span>
                </h3>
                <p className="mb-3 text-[#111111]/80">
                  In our web application, we combine your monitor&rsquo;s display
                  refresh rate with high-density mathematical oversampling to
                  replicate the smooth analogue beam:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-[#111111]/90">
                  <li>
                    <strong className="font-medium">
                      Display Refresh Rate (60–240 FPS):
                    </strong>{" "}
                    Our animation engine uses{" "}
                    <code className="bg-[#111111]/10 px-1 rounded">
                      requestAnimationFrame
                    </code>
                    , which automatically locks to your monitor&rsquo;s native
                    hardware refresh rate (e.g., 60 FPS on standard displays,
                    120 FPS on ProMotion/MacBooks, or 144/240 FPS on gaming
                    monitors).
                  </li>
                  <li>
                    <strong className="font-medium">
                      Sub-Frame Multi-Sampling (4,800–9,600 Samples/Sec):
                    </strong>{" "}
                    To prevent digital gaps or stroboscopic flickering at high
                    frequencies (22 Hz–44 Hz), our engine calculates up to 80
                    intermediate sub-steps inside every single video frame:
                    <div className="mt-1.5 ml-2 pl-3 border-l-2 border-[#111111]/30 font-mono text-[11px] space-y-0.5 text-[#111111]/80">
                      <div>
                        • At 60 FPS × 80 sub-steps ={" "}
                        <strong>
                          4,800 continuous line calculations/sec (4.8 kHz)
                        </strong>
                        .
                      </div>
                      <div>
                        • At 120 FPS × 80 sub-steps ={" "}
                        <strong>
                          9,600 continuous line calculations/sec (9.6 kHz)
                        </strong>
                        .
                      </div>
                    </div>
                  </li>
                  <li>
                    <strong className="font-medium">
                      Phosphor Trail Simulation:
                    </strong>{" "}
                    By drawing continuous line strokes between those thousands
                    of sub-samples and applying our semi-transparent ivory
                    background wash (
                    <code className="bg-[#111111]/10 px-1 rounded">
                      trailPersistence = {(trailPersistence * 100).toFixed(1)}%
                    </code>
                    ), we recreate the exact visual decay of a classic analogue
                    phosphor screen!
                  </li>
                </ul>
              </section>

              <section className="bg-[#111111]/[0.05] p-5 rounded-xl border border-[#111111]/20 shadow-inner space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#111111]">
                    4. X-Y Oscilloscope Waveform Synthesis &amp; Harmonic Physics
                  </h3>
                  <span className="text-[10px] bg-[#111111] text-[#FFFFF0] px-2.5 py-0.5 rounded-full font-mono">
                    Live Mathematical Readouts
                  </span>
                </div>

                {/* Part A: Circle — One Clean Formula, One Frequency */}
                <div className="bg-[#FFFFF0] p-4 rounded-xl border border-[#111111]/15 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center justify-between border-b border-[#111111]/10 pb-1.5">
                    <span>● Circle — One Clean Formula, One Frequency</span>
                    <span className="text-[10px] font-mono text-[#111111]/60">Degree-1 Harmonic</span>
                  </h4>
                  <p className="text-[11px] text-[#111111]/80 leading-relaxed">
                    A circle in X-Y mode is the simplest possible Lissajous curve: two pure sine waves at the exact same frequency, <strong className="font-semibold">90° (π/2) out of phase</strong>. There is only one frequency involved because a circle is degree-1 harmonic content on both axes—no overtones, no corners, just a single sine each:
                  </p>

                  {/* Live Formula Readout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px] bg-[#111111]/5 p-3 rounded-lg border border-[#111111]/10">
                    <div>
                      <span className="text-[#111111]/50">x(t) =</span> A · cos(2π · f · t)<br />
                      <strong className="text-[#111111]">x(t) = {circleScale.toFixed(2)} · cos(2π · {manualSpeed >= 1000 ? `${(manualSpeed / 1000).toFixed(1)}k` : manualSpeed} · t)</strong>
                    </div>
                    <div>
                      <span className="text-[#111111]/50">y(t) =</span> A · sin(2π · f · t)<br />
                      <strong className="text-[#111111]">y(t) = {circleScale.toFixed(2)} · sin(2π · {manualSpeed >= 1000 ? `${(manualSpeed / 1000).toFixed(1)}k` : manualSpeed} · t)</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#111111]/70 leading-relaxed">
                    Here <strong className="font-mono text-[#111111]">f = {manualSpeed} Hz</strong> is literally <em className="font-semibold">&quot;loops per second&quot;</em>—the exact pitch you hear when Audio is enabled. For it to actually look like a circle (and not an ellipse or diagonal line) three things must match exactly: same amplitude <strong className="font-mono">A = {circleScale.toFixed(2)}</strong> on both axes, same frequency <strong className="font-mono">f = {manualSpeed} Hz</strong> on both axes, and exactly <strong className="font-semibold">90° phase offset</strong>. Drift any of those and you get an ellipse (amplitude mismatch), a slanted line (0° or 180° phase), or a spiral/rosette (frequency mismatch)!
                  </p>
                </div>

                {/* Part B: Square — A Sum of Harmonics (Fourier Series Synthesis) */}
                <div className="bg-[#FFFFF0] p-4 rounded-xl border border-[#111111]/15 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center justify-between border-b border-[#111111]/10 pb-1.5">
                    <span>◼ Square — A Sum of Odd Harmonics (Fourier Series)</span>
                    <span className="text-[10px] font-mono text-[#111111]/60">Harmonic Stack</span>
                  </h4>
                  <p className="text-[11px] text-[#111111]/80 leading-relaxed">
                    A square shape (or square wave in audio terms) isn&apos;t one single frequency—it is a fundamental frequency plus a specific mathematical stack of <strong className="font-semibold">odd harmonics</strong>, each quieter than the last:
                  </p>

                  {/* Fourier Series Formula */}
                  <div className="font-mono text-[11px] bg-[#111111]/5 p-3 rounded-lg border border-[#111111]/10 overflow-x-auto text-center">
                    <div className="font-semibold text-sm mb-1">
                      square(t) = (4 / π) · Σ (1 / n) · sin(2π · n · f · t) <span className="text-[10px] font-normal text-[#111111]/60">for n = 1, 3, 5, 7, ...</span>
                    </div>
                    <div className="text-[10px] text-[#111111]/70 pt-1 border-t border-[#111111]/10">
                      Live Fundamental <strong className="text-[#111111]">f = {squareFreq} Hz</strong> • Audio synthesized natively via Web Audio API square wave!
                    </div>
                  </div>

                  {/* Live Harmonic Breakdown Table */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[#111111]/60">
                      Live Odd-Harmonic Convergence Stack for {squareFreq} Hz:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-mono text-[10px]">
                      {[
                        { n: 1, name: "Fundamental", vol: "1.000", frac: "1/1" },
                        { n: 3, name: "3rd Harmonic", vol: "0.333", frac: "1/3" },
                        { n: 5, name: "5th Harmonic", vol: "0.200", frac: "1/5" },
                        { n: 7, name: "7th Harmonic", vol: "0.143", frac: "1/7" },
                        { n: 9, name: "9th Harmonic", vol: "0.111", frac: "1/9" },
                        { n: 11, name: "11th Harmonic", vol: "0.091", frac: "1/11" },
                      ].map((item) => (
                        <div key={item.n} className="bg-[#111111]/[0.03] p-1.5 rounded border border-[#111111]/10 flex flex-col justify-between">
                          <div className="flex justify-between items-baseline text-[9px] text-[#111111]/60">
                            <span>n = {item.n} ({item.name})</span>
                            <span>amp: {item.frac}</span>
                          </div>
                          <div className="font-bold text-[#111111] text-[11px] mt-0.5">
                            {(squareFreq * item.n) >= 1000 ? `${((squareFreq * item.n) / 1000).toFixed(2)} kHz` : `${(squareFreq * item.n).toFixed(1)} Hz`} <span className="font-normal text-[9px] text-[#111111]/50">({(parseFloat(item.vol) * 100).toFixed(0)}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-[#111111]/70 leading-relaxed pt-1">
                    So <strong className="font-mono">n=1</strong> is the fundamental at amplitude 1, <strong className="font-mono">n=3</strong> is the 3rd harmonic at 1/3 the volume, <strong className="font-mono">n=5</strong> at 1/5, and so on! When you toggle your Square Box ON, you are visually observing the geometric boundary where these odd harmonics converge!
                  </p>
                </div>

                {/* Interactive Modal Controls Matching Main UI */}
                <div className="bg-[#FFFFF0] p-4 rounded-xl border border-[#111111]/20 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#111111]/10 pb-2 flex-wrap gap-2">
                    <span className="text-xs uppercase tracking-widest font-semibold">Live Lissajous Readout:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSyncFreqsToggle(!syncFreqs)}
                        className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full border transition-all cursor-pointer ${syncFreqs
                          ? "bg-[#111111] text-[#FFFFF0] border-[#111111]"
                          : "bg-transparent text-[#111111]/70 border-[#111111]/30 hover:border-[#111111]"
                          }`}
                        title="Synchronize Square and Circle frequencies 1:1"
                      >
                        {syncFreqs ? "Sync 1:1: ON" : "Sync: OFF"}
                      </button>
                      {audioEnabled && (
                        <button
                          onClick={() => {
                            const nextLayer = audioLayer === "layered" ? "circle" : (audioLayer === "circle" ? "square" : "layered");
                            handleAudioLayerChange(nextLayer);
                          }}
                          className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full border transition-all cursor-pointer bg-[#111111] text-[#FFFFF0] border-[#111111]"
                          title="Toggle audio layering"
                        >
                          {audioLayer === "layered" ? "Layer: Circle + Square" : (audioLayer === "circle" ? "Layer: Circle Only" : "Layer: Square Only")}
                        </button>
                      )}
                      <span className="text-sm font-bold bg-[#111111] text-[#FFFFF0] px-3 py-1 rounded-full">
                        Ratio = {(manualSpeed / (squareFreq || 1)).toFixed(2)} : 1
                      </span>
                    </div>
                  </div>

                  {/* Square Frequency Modal Control */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span>◼ Square Frequency (Channel X):</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-[#111111]/60 font-normal">
                          λ = <strong className="text-[#111111] font-mono">{formatWavelength(squareFreq)}</strong>
                        </span>
                        <span className="bg-[#111111] text-[#FFFFF0] px-2 py-0.5 rounded text-[11px] font-mono">
                          {squareFreq >= 1000 ? `${(squareFreq / 1000).toFixed(1)} kHz` : `${squareFreq} Hz`}
                        </span>
                      </div>
                    </div>

                    {/* Visual Square Waveform Wavelength Bar */}
                    <div className="w-full h-8 bg-[#111111]/[0.03] border border-[#111111]/15 rounded-lg overflow-hidden flex items-center px-1 shadow-inner" title={`Wavelength: ${formatWavelength(squareFreq)}`}>
                      <svg className="w-full h-5 stroke-[#111111] fill-none" viewBox="0 0 400 30" preserveAspectRatio="none">
                        <path
                          d={generateSquareWaveSVG(squareFreq)}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <input
                      type="range"
                      min="0.5"
                      max="1000"
                      step="0.5"
                      value={squareFreq}
                      onChange={(e) => handleSquareFreqChange(parseFloat(e.target.value))}
                      className="w-full accent-[#111111] cursor-pointer h-1.5 bg-[#111111]/15 rounded-lg appearance-none"
                    />
                    <div className="flex gap-1 flex-wrap justify-end pt-0.5">
                      {[0.5, 1, 2, 3, 5, 10, 44, 110, 440, 1000].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => handleSquareFreqChange(preset)}
                          className={`px-2 py-0.5 text-[9px] font-medium border rounded transition-colors cursor-pointer ${Math.abs(squareFreq - preset) < 0.2
                            ? "border-[#111111] bg-[#111111] text-[#FFFFF0]"
                            : "border-[#111111]/20 text-[#111111]/60 hover:border-[#111111]"
                            }`}
                        >
                          {preset >= 1000 ? `${preset / 1000}kHz` : `${preset}Hz`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Circle Frequency Modal Control */}
                  <div className="space-y-2 pt-3 border-t border-[#111111]/10">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span>● Circle Frequency (Channel Y):</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-[#111111]/60 font-normal">
                          λ = <strong className="text-[#111111] font-mono">{formatWavelength(manualSpeed)}</strong>
                        </span>
                        <span className="bg-[#111111] text-[#FFFFF0] px-2 py-0.5 rounded text-[11px] font-mono">
                          {manualSpeed >= 1000 ? `${(manualSpeed / 1000).toFixed(1)} kHz` : `${manualSpeed} Hz`}
                        </span>
                      </div>
                    </div>

                    {/* Visual Sine Waveform Wavelength Bar */}
                    <div className="w-full h-8 bg-[#111111]/[0.03] border border-[#111111]/15 rounded-lg overflow-hidden flex items-center px-1 shadow-inner" title={`Wavelength: ${formatWavelength(manualSpeed)}`}>
                      <svg className="w-full h-5 stroke-[#111111] fill-none" viewBox="0 0 400 30" preserveAspectRatio="none">
                        <path
                          d={generateSineWaveSVG(manualSpeed)}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <input
                      ref={circleSliderRef1}
                      type="range"
                      min="0"
                      max="10000"
                      step="1"
                      value={manualSpeed}
                      onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                      className="w-full accent-[#111111] cursor-pointer h-1.5 bg-[#111111]/15 rounded-lg appearance-none"
                    />
                    <div className="flex gap-1 flex-wrap justify-end pt-0.5">
                      {[1, 2, 3, 8, 44, 440, 1000, 5000, 10000].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => handleSpeedChange(preset)}
                          className={`px-2 py-0.5 text-[9px] font-medium border rounded transition-colors cursor-pointer ${mode === "manual" && Math.abs(manualSpeed - preset) < preset * 0.05
                            ? "border-[#111111] bg-[#111111] text-[#FFFFF0]"
                            : "border-[#111111]/20 text-[#111111]/60 hover:border-[#111111]"
                            }`}
                        >
                          {preset >= 1000 ? `${preset / 1000}kHz` : `${preset}Hz`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pattern Trail & Phosphor Persistence Modal Control */}
                  <div className="space-y-2 pt-3 border-t border-[#111111]/10">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span>◈ Phosphor Trail Persistence (History):</span>
                      <span className="bg-[#111111] text-[#FFFFF0] px-2 py-0.5 rounded text-[11px] font-mono">
                        {(trailPersistence * 100).toFixed(1)}% ({trailPersistence >= 0.99 ? "Infinite" : `${(0.5 + trailPersistence * 30.0).toFixed(1)}s Trail`})
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1.0"
                      step="0.01"
                      value={trailPersistence}
                      onChange={(e) => handleTrailChange(parseFloat(e.target.value))}
                      className="w-full accent-[#111111] cursor-pointer h-1.5 bg-[#111111]/15 rounded-lg appearance-none"
                    />
                    <div className="flex gap-1 flex-wrap justify-end pt-0.5">
                      {[
                        { label: "OFF (0s)", val: 0 },
                        { label: "SHORT (5s)", val: 0.15 },
                        { label: "MED (15s)", val: 0.5 },
                        { label: "LONG (25s)", val: 0.85 },
                        { label: "INFINITE (∞)", val: 1.0 },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => handleTrailChange(item.val)}
                          className={`px-2 py-0.5 text-[9px] font-medium border rounded transition-colors cursor-pointer ${Math.abs(trailPersistence - item.val) < 0.04
                            ? "border-[#111111] bg-[#111111] text-[#FFFFF0]"
                            : "border-[#111111]/20 text-[#111111]/60 hover:border-[#111111]"
                            }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 5: 3D Hyperspace Tunnel & Orbital Camera Navigation */}
              <section className="space-y-3 pt-6 border-t border-[#111111]/15">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#111111]">
                    5. 3D Hyperspace Tunnel &amp; Orbital Camera Navigation
                  </h3>
                  <span className="text-[10px] bg-[#111111] text-[#FFFFF0] px-2.5 py-0.5 rounded-full font-mono">
                    Interactive 3D Space
                  </span>
                </div>
                <div className="bg-[#FFFFF0] p-4 rounded-xl border border-[#111111]/15 space-y-3 text-[11px] leading-relaxed">
                  <p>
                    In <strong>◈ 3D Deep Tunnel mode</strong>, the oscilloscope waveform is projected across <strong>48 continuous depth slices</strong> stretching over 1,700 units into deep space with perspective projection and atmospheric fog.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[10px] bg-[#111111]/5 p-3 rounded-lg border border-[#111111]/10">
                    <div>
                      <strong className="text-[#111111] block mb-0.5">Orbital Drag</strong>
                      <span>Click &amp; drag anywhere on the canvas to pitch and yaw the entire 3D cathedral of sound in space!</span>
                    </div>
                    <div>
                      <strong className="text-[#111111] block mb-0.5">Scroll Zoom</strong>
                      <span>Scroll your mouse wheel up/down to zoom deep into the hyperspace corridor or zoom out.</span>
                    </div>
                    <div>
                      <strong className="text-[#111111] block mb-0.5">Auto-Rotate</strong>
                      <span>When enabled, the 3D structure gently rotates in deep space automatically when you aren&apos;t dragging.</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Open/Close Control Panel & Live HUD */}
      <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:right-6 sm:left-auto md:bottom-8 md:right-8 flex flex-col items-end gap-2.5 font-mono z-20 select-none max-w-full sm:max-w-md pointer-events-auto transition-all duration-300">

        {/* Closed/Minimized State: Compact HUD & Open Button */}
        {!showControls ? (
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-2 w-full sm:w-auto animate-fadeIn">
            {/* Compact HUD Pill */}
            <div className="bg-[#FFFFF0]/90 backdrop-blur-md px-4 py-2 rounded-full border border-[#111111]/15 shadow-md flex items-center gap-3 text-[10px] sm:text-xs text-[#111111]/85 w-full sm:w-auto justify-center">
              <span className="uppercase tracking-wider">Sq: <strong className="text-[#111111]">{squareFreq >= 1000 ? `${(squareFreq / 1000).toFixed(1)}kHz` : `${squareFreq}Hz`}</strong></span>
              <span className="text-[#111111]/30">•</span>
              <span className="uppercase tracking-wider">Circ: <strong className="text-[#111111]">{manualSpeed >= 1000 ? `${(manualSpeed / 1000).toFixed(1)}kHz` : `${manualSpeed}Hz`}</strong></span>
              <span className="text-[#111111]/30">•</span>
              <span className="font-bold text-[#111111]">{(manualSpeed / (squareFreq || 1)).toFixed(2)} : 1</span>
            </div>

            {/* Open Button */}
            <button
              onClick={() => setShowControls(true)}
              className="bg-[#111111] text-[#FFFFF0] px-5 py-2 rounded-full border border-[#111111] shadow-xl hover:bg-[#111111]/90 transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest w-full sm:w-auto shrink-0"
            >
              <span>◈ Open Controls</span>
            </button>
          </div>
        ) : (
          /* Opened/Maximized State: Full Controls Panel */
          <div className="bg-[#FFFFF0]/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[#111111]/20 shadow-2xl w-full space-y-3.5 overflow-y-auto max-h-[82vh] text-[#111111] animate-fadeIn">

            {/* Header & Minimize Button */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#111111]/15">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#111111] animate-pulse" />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#111111]">
                  ◈ Interactive Controls
                </span>
              </div>
              <button
                onClick={() => setShowControls(false)}
                className="px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-widest bg-[#111111] text-[#FFFFF0] rounded-full hover:bg-[#111111]/80 transition-all cursor-pointer shadow-sm flex items-center gap-1 shrink-0"
                title="Minimize controls for full screen view"
              >
                <span>✕ Minimize</span>
              </button>
            </div>

            {/* Frequency & Lissajous Readouts */}
            <div className="flex flex-col gap-1.5 bg-[#111111]/[0.03] p-3 rounded-xl border border-[#111111]/10">
              <div className="flex items-center justify-between gap-2 flex-wrap text-[10px] sm:text-xs">
                <span className="uppercase tracking-widest text-[#111111]/60">
                  Square: <strong ref={squareReadoutRef} className="text-[#111111]">{squareFreq >= 1000 ? `${(squareFreq / 1000).toFixed(1)} kHz` : `${squareFreq} Hz`}</strong>
                </span>
                <span className="uppercase tracking-widest text-[#111111]/60">
                  Circle: <strong ref={circleReadoutRef} className="text-[#111111]">{manualSpeed >= 1000 ? `${(manualSpeed / 1000).toFixed(1)} kHz` : `${manualSpeed} Hz`}</strong>
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-[9px] text-[#111111]/50 uppercase tracking-widest flex-wrap">
                <span>λ<sub>sq</sub>: <strong className="text-[#111111] font-mono">{formatWavelength(squareFreq)}</strong></span>
                <span>λ<sub>circ</sub>: <strong className="text-[#111111] font-mono">{formatWavelength(manualSpeed)}</strong></span>
              </div>
              <div className="flex items-baseline justify-between pt-1 border-t border-[#111111]/10 mt-0.5 flex-wrap gap-1">
                <span className="text-[10px] uppercase tracking-widest text-[#111111]/60 font-semibold">
                  Lissajous Ratio
                </span>
                <span
                  ref={speedValueRef}
                  className="text-2xl sm:text-3xl font-light tracking-tight text-[#111111] tabular-nums"
                >
                  {(manualSpeed / (squareFreq || 1)).toFixed(2)} : 1
                </span>
              </div>
              <div className="w-full h-[3px] bg-[#111111]/10 mt-1 rounded-full overflow-hidden">
                <div
                  ref={speedBarRef}
                  className="h-full bg-[#111111] transition-none w-0"
                />
              </div>
            </div>

            {/* Mode & Sound & Path Buttons Header */}
            <div className="flex items-center gap-1.5 justify-end w-full flex-wrap pt-0.5">
              <button
                onClick={() => setShowSpecs(true)}
                className="px-2.5 py-1 text-[9px] sm:text-[10px] uppercase tracking-widest rounded-full transition-all cursor-pointer border bg-transparent text-[#111111]/60 border-[#111111]/20 hover:border-[#111111] hover:text-[#111111]"
              >
                ? Physics &amp; Specs
              </button>

              <button
                onClick={() =>
                  handlePathModeChange(
                    pathMode === "oscilloscope" ? "square" : "oscilloscope"
                  )
                }
                className={`px-2.5 py-1 text-[9px] sm:text-[10px] uppercase tracking-widest rounded-full transition-all cursor-pointer border ${pathMode === "oscilloscope"
                  ? "bg-[#111111] text-[#FFFFF0] border-[#111111]"
                  : "bg-transparent text-[#111111]/60 border-[#111111]/20 hover:border-[#111111] hover:text-[#111111]"
                  }`}
              >
                {pathMode === "oscilloscope" ? "◈ Oscilloscope" : "◇ Square Path"}
              </button>

              <button
                onClick={() =>
                  handleDimensionModeChange(
                    dimensionMode === "3D" ? "2D" : "3D"
                  )
                }
                className={`px-2.5 py-1 text-[9px] sm:text-[10px] uppercase tracking-widest rounded-full transition-all cursor-pointer border ${dimensionMode === "3D"
                  ? "bg-[#111111] text-[#FFFFF0] border-[#111111] shadow-sm font-semibold"
                  : "bg-transparent text-[#111111]/60 border-[#111111]/20 hover:border-[#111111] hover:text-[#111111]"
                  }`}
                title="Fly deep inside the 3D extruded hyperspace tunnel!"
              >
                {dimensionMode === "3D" ? "◈ 3D Deep Tunnel" : "◇ 2D Flat"}
              </button>

              {dimensionMode === "3D" && (
                <button
                  onClick={() => handleAutoRotate3DToggle(!autoRotate3D)}
                  className={`px-2.5 py-1 text-[9px] sm:text-[10px] uppercase tracking-widest rounded-full transition-all cursor-pointer border ${autoRotate3D
                    ? "bg-[#111111] text-[#FFFFF0] border-[#111111]"
                    : "bg-transparent text-[#111111]/60 border-[#111111]/20 hover:border-[#111111] hover:text-[#111111]"
                    }`}
                  title="Gently auto-rotate the 3D cathedral in space when you are not dragging"
                >
                  {autoRotate3D ? "Auto-Rotate: ON" : "Auto-Rotate: OFF"}
                </button>
              )}

              <button
                onClick={toggleAudio}
                className={`px-2.5 py-1 text-[9px] sm:text-[10px] uppercase tracking-widest rounded-full transition-all cursor-pointer border ${audioEnabled
                  ? "bg-[#111111] text-[#FFFFF0] border-[#111111]"
                  : "bg-transparent text-[#111111]/60 border-[#111111]/20 hover:border-[#111111] hover:text-[#111111]"
                  }`}
              >
                {audioEnabled ? "◈ Audio On" : "◇ Audio Off"}
              </button>

              {audioEnabled && (
                <button
                  onClick={() => {
                    const nextLayer = audioLayer === "layered" ? "circle" : (audioLayer === "circle" ? "square" : "layered");
                    handleAudioLayerChange(nextLayer);
                  }}
                  className="px-2.5 py-1 text-[9px] sm:text-[10px] uppercase tracking-widest rounded-full transition-all cursor-pointer border bg-[#111111] text-[#FFFFF0] border-[#111111]"
                  title="Toggle audio layering: Circle over Square (Layered), Circle sine wave only, or Square wave only"
                >
                  {audioLayer === "layered" ? "Layer: Circle + Square" : (audioLayer === "circle" ? "Layer: Circle Only" : "Layer: Square Only")}
                </button>
              )}

              <button
                onClick={() => handleSyncFreqsToggle(!syncFreqs)}
                className={`px-2.5 py-1 text-[9px] sm:text-[10px] uppercase tracking-widest rounded-full transition-all cursor-pointer border ${syncFreqs
                  ? "bg-[#111111] text-[#FFFFF0] border-[#111111]"
                  : "bg-transparent text-[#111111]/60 border-[#111111]/20 hover:border-[#111111] hover:text-[#111111]"
                  }`}
                title="When enabled, both Square and Circle frequencies increase and decrease together simultaneously (1:1)"
              >
                {syncFreqs ? "Sync: 1:1 ON" : "Sync: OFF"}
              </button>

              <div className="flex items-center gap-1 bg-[#111111]/5 p-1 rounded-full border border-[#111111]/10">
                <button
                  onClick={() => handleModeChange("auto")}
                  className={`px-3 py-1 text-[9px] sm:text-[10px] uppercase tracking-widest rounded-full transition-all cursor-pointer ${mode === "auto"
                    ? "bg-[#111111] text-[#FFFFF0] shadow-sm"
                    : "text-[#111111]/60 hover:text-[#111111]"
                    }`}
                >
                  Auto Cycle
                </button>
                <button
                  onClick={() => handleModeChange("manual")}
                  className={`px-3 py-1 text-[9px] sm:text-[10px] uppercase tracking-widest rounded-full transition-all cursor-pointer ${mode === "manual"
                    ? "bg-[#111111] text-[#FFFFF0] shadow-sm"
                    : "text-[#111111]/60 hover:text-[#111111]"
                    }`}
                >
                  Manual
                </button>
              </div>
            </div>

            {/* Interactive Independent Frequency Controls (Square & Circle) */}
            <div className="flex flex-col gap-3 w-full pt-2 border-t border-[#111111]/15">
              {/* Square Frequency (Ch X) */}
              <div className="flex flex-col gap-1.5 w-full">
                <div className="flex items-center justify-between w-full text-[10px] sm:text-xs text-[#111111]/70">
                  <span className="uppercase tracking-widest font-semibold">◼ Square Freq (X)</span>
                  <span className="font-bold text-[#111111]">{squareFreq >= 1000 ? `${(squareFreq / 1000).toFixed(1)} kHz` : `${squareFreq} Hz`}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1000"
                  step="0.5"
                  value={squareFreq}
                  onChange={(e) => handleSquareFreqChange(parseFloat(e.target.value))}
                  className="w-full accent-[#111111] cursor-pointer h-2 bg-[#111111]/15 rounded-lg appearance-none"
                />
                <div className="flex gap-1 justify-end flex-wrap pt-0.5">
                  {[0.5, 1, 2, 3, 5, 10, 44, 110, 440, 1000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleSquareFreqChange(preset)}
                      className={`px-1.5 py-0.5 text-[8px] sm:text-[9px] font-medium tracking-wider border rounded transition-colors cursor-pointer ${Math.abs(squareFreq - preset) < 0.2
                        ? "border-[#111111] bg-[#111111] text-[#FFFFF0]"
                        : "border-[#111111]/20 text-[#111111]/60 hover:border-[#111111]"
                        }`}
                    >
                      {preset >= 1000 ? `${preset / 1000}kHz` : `${preset}Hz`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Circle Frequency (Ch Y) */}
              <div className="flex flex-col gap-1.5 w-full pt-2 border-t border-[#111111]/10">
                <div className="flex items-center justify-between w-full text-[10px] sm:text-xs text-[#111111]/70">
                  <span className="uppercase tracking-widest font-semibold">● Circle Freq (Y)</span>
                  <span className="font-bold text-[#111111]">{manualSpeed >= 1000 ? `${(manualSpeed / 1000).toFixed(1)} kHz` : `${manualSpeed} Hz`}</span>
                </div>
                <input
                  ref={circleSliderRef2}
                  type="range"
                  min="0"
                  max="10000"
                  step="1"
                  value={manualSpeed}
                  onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                  className="w-full accent-[#111111] cursor-pointer h-2 bg-[#111111]/15 rounded-lg appearance-none"
                />
                <div className="flex gap-1 justify-end flex-wrap pt-0.5">
                  {[1, 2, 3, 8, 44, 440, 1000, 5000, 10000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleSpeedChange(preset)}
                      className={`px-1.5 py-0.5 text-[8px] sm:text-[9px] font-medium tracking-wider border rounded transition-colors cursor-pointer ${mode === "manual" && Math.abs(manualSpeed - preset) < preset * 0.05
                        ? "border-[#111111] bg-[#111111] text-[#FFFFF0]"
                        : "border-[#111111]/20 text-[#111111]/60 hover:border-[#111111]"
                        }`}
                    >
                      {preset >= 1000 ? `${preset / 1000}kHz` : `${preset}Hz`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Oscilloscope Geometry Controls */}
            <div className="flex flex-col gap-2.5 pt-2.5 border-t border-[#111111]/15 w-full">
              {/* Square Box Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full bg-[#111111]/[0.02] p-2 rounded-lg border border-[#111111]/10">
                <button
                  onClick={() => handleSquareBoxToggle(!showSquareBox)}
                  className={`px-2.5 py-1 text-[9px] sm:text-[10px] uppercase tracking-widest rounded transition-all cursor-pointer border font-semibold ${showSquareBox
                    ? "bg-[#111111] text-[#FFFFF0] border-[#111111]"
                    : "bg-transparent text-[#111111]/50 border-[#111111]/20 hover:border-[#111111]"
                    }`}
                >
                  {showSquareBox ? "◼ Square Box ON" : "◻ Square Box OFF"}
                </button>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-[#111111]/60 uppercase">Size</span>
                    <input
                      type="range"
                      min="0.3"
                      max="2.0"
                      step="0.05"
                      value={squareScale}
                      onChange={(e) => handleSquareScaleChange(parseFloat(e.target.value))}
                      className="w-16 accent-[#111111] cursor-pointer h-1.5 bg-[#111111]/15 rounded-lg appearance-none"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-[#111111]/60 uppercase">Speed</span>
                    <input
                      type="range"
                      min="0.1"
                      max="5.0"
                      step="0.1"
                      value={squareSpeedMult}
                      onChange={(e) => handleSquareSpeedChange(parseFloat(e.target.value))}
                      className="w-16 accent-[#111111] cursor-pointer h-1.5 bg-[#111111]/15 rounded-lg appearance-none"
                    />
                  </div>
                </div>
              </div>

              {/* Circle Ring Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full bg-[#111111]/[0.02] p-2 rounded-lg border border-[#111111]/10">
                <button
                  onClick={() => handleCircleRingToggle(!showCircleRing)}
                  className={`px-2.5 py-1 text-[9px] sm:text-[10px] uppercase tracking-widest rounded transition-all cursor-pointer border font-semibold ${showCircleRing
                    ? "bg-[#111111] text-[#FFFFF0] border-[#111111]"
                    : "bg-transparent text-[#111111]/50 border-[#111111]/20 hover:border-[#111111]"
                    }`}
                >
                  {showCircleRing ? "● Circle Ring ON" : "○ Circle Ring OFF"}
                </button>
                <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-[9px] text-[#111111]/60 uppercase">Size</span>
                  <input
                    type="range"
                    min="0.3"
                    max="2.0"
                    step="0.05"
                    value={circleScale}
                    onChange={(e) => handleCircleScaleChange(parseFloat(e.target.value))}
                    className="w-36 accent-[#111111] cursor-pointer h-1.5 bg-[#111111]/15 rounded-lg appearance-none"
                  />
                </div>
              </div>
            </div>

            {/* Pattern Trails Control */}
            <div className="flex flex-col gap-2 pt-2.5 border-t border-[#111111]/15 w-full">
              <div className="flex items-center justify-between w-full flex-wrap gap-1">
                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#111111]/70 font-semibold">
                  ◈ Pattern Trails Persistence
                </span>
                <div className="flex gap-1 flex-wrap">
                  {[
                    { label: "OFF", val: 0 },
                    { label: "MED", val: 0.5 },
                    { label: "LONG", val: 0.85 },
                    { label: "INFINITE", val: 1.0 },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleTrailChange(item.val)}
                      className={`px-2 py-0.5 text-[8px] sm:text-[9px] font-medium tracking-wider border rounded transition-colors cursor-pointer ${Math.abs(trailPersistence - item.val) < 0.04
                        ? "border-[#111111] bg-[#111111] text-[#FFFFF0]"
                        : "border-[#111111]/20 text-[#111111]/60 hover:border-[#111111]/50 hover:text-[#111111]"
                        }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full justify-end">
                <span className="text-[9px] sm:text-[10px] tracking-wider text-[#111111]/50">
                  0%
                </span>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.01"
                  value={trailPersistence}
                  onChange={(e) => handleTrailChange(parseFloat(e.target.value))}
                  className="w-full accent-[#111111] cursor-pointer h-2 bg-[#111111]/15 rounded-lg appearance-none"
                />
                <span className="text-[9px] sm:text-[10px] tracking-wider text-[#111111]/50">
                  100%
                </span>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
