// ULTIMATE CMB - Planck Satellite Quality Visualization

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function CosmicMicrowaveBackground({ 
  opacity = 1.0,
  showFluctuations = true,
  animated = true 
}: { 
  opacity?: number;
  showFluctuations?: boolean;
  animated?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [mainTexture, setMainTexture] = useState<THREE.Texture | null>(null);
  
  // Ultra-high quality procedural CMB
 // Ultra-high quality procedural CMB with advanced noise
  const fallbackTexture = useMemo(() => {
    const size = 2048; // Higher resolution
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Perlin-like noise function
    const noise2D = (x: number, y: number, scale: number) => {
      const X = Math.floor(x * scale);
      const Y = Math.floor(y * scale);
      const fx = (x * scale) - X;
      const fy = (y * scale) - Y;
      
      // Smooth interpolation
      const u = fx * fx * (3 - 2 * fx);
      const v = fy * fy * (3 - 2 * fy);
      
      const hash = (n: number) => {
        const sin = Math.sin(n) * 43758.5453123;
        return sin - Math.floor(sin);
      };
      
      const a = hash(X + Y * 57.0);
      const b = hash(X + 1 + Y * 57.0);
      const c = hash(X + (Y + 1) * 57.0);
      const d = hash(X + 1 + (Y + 1) * 57.0);
      
      return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
    };
    
    if (ctx) {
      const imageData = ctx.createImageData(size, size);
      const data = imageData.data;
      
      // Multi-scale noise for realistic CMB anisotropies
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          const nx = x / size;
          const ny = y / size;
          
          // Large scale structure (dipole + quadrupole) - l = 2-10
          const largeScale = noise2D(nx, ny, 2.5) * 0.018 +
                            noise2D(nx + 100, ny, 3.5) * 0.014 +
                            Math.sin(nx * Math.PI * 2) * Math.cos(ny * Math.PI * 2) * 0.012;
          
          // Medium scale (acoustic peaks) - l = 200-800
          const mediumScale = noise2D(nx, ny, 15) * 0.010 +
                             noise2D(nx + 50, ny + 50, 25) * 0.008 +
                             (Math.sin(x / 40) * Math.cos(y / 40)) * 0.007;
          
          // Small scale fluctuations - l > 1000
          const smallScale = noise2D(nx, ny, 80) * 0.005 +
                            noise2D(nx + 200, ny + 200, 150) * 0.004 +
                            (Math.random() - 0.5) * 0.003;
          
          // Silk damping at small scales
          const dampingFactor = Math.exp(-((noise2D(nx, ny, 100) * 0.5 + 0.5) * 0.2));
          
          // Combine scales - ΔT/T ≈ 10^-5
          const fluctuation = (largeScale + mediumScale + smallScale * dampingFactor);
          const base = 0.86 + fluctuation;
          
          // Enhanced color mapping for dramatic visual
          const temp = 2.725 * (1 + fluctuation);
          const normalized = (temp - 2.725) / (2.725 * 0.02); // Normalize fluctuations
          
          let r, g, b;
          if (normalized > 0) {
            // Hot spots - warm amber/orange
            r = base * (1.0 + normalized * 0.25);
            g = base * (0.85 + normalized * 0.15);
            b = base * (0.70 - normalized * 0.05);
          } else {
            // Cold spots - cool blue/cyan
            r = base * (0.75 + normalized * 0.15);
            g = base * (0.85 + normalized * 0.10);
            b = base * (1.0 - normalized * 0.20);
          }
          
          data[idx] = Math.min(255, Math.max(0, r * 255));
          data[idx + 1] = Math.min(255, Math.max(0, g * 255));
          data[idx + 2] = Math.min(255, Math.max(0, b * 255));
          data[idx + 3] = 255;
        }
      }
      
      // Apply subtle gaussian blur for smoothness
      ctx.putImageData(imageData, 0, 0);
      ctx.filter = 'blur(0.5px)';
      ctx.drawImage(canvas, 0, 0);
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.x = -1;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    tex.needsUpdate = true;
    return tex;
  }, []);
  
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      '/cmb_map.jpg',
      (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.repeat.x = -1;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = 16;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        setMainTexture(tex);
      },
      undefined,
      () => {
        console.log('🌌 Using procedural CMB (Planck-style)');
        setMainTexture(fallbackTexture);
      }
    );
  }, [fallbackTexture]);

  const activeTexture = mainTexture || fallbackTexture;

  const uniforms = useMemo(() => ({
    uTexture: { value: activeTexture },
    uOpacity: { value: opacity },
    uTime: { value: 0.0 },
    uFluctuationIntensity: { value: showFluctuations ? 0.00003 : 0.0 },
    uGlowIntensity: { value: 0.2 },
    uTemperature: { value: 2.725 },
    uResolution: { value: new THREE.Vector2(1024, 1024) }
  }), [activeTexture, opacity, showFluctuations]);

  useEffect(() => {
    if (materialRef.current && activeTexture) {
      materialRef.current.uniforms.uTexture.value = activeTexture;
      materialRef.current.needsUpdate = true;
    }
  }, [activeTexture]);

  useFrame((state) => {
    if (materialRef.current && animated) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uOpacity.value = opacity;
      
      const pulse = Math.sin(state.clock.elapsedTime * 0.15) * 0.015;
      materialRef.current.uniforms.uFluctuationIntensity.value = showFluctuations 
        ? 0.00003 + pulse * 0.000008
        : 0.0;
    }
  });

  return (
    <mesh ref={meshRef} scale={[1, 1, 1]}>
      <sphereGeometry args={[120, 192, 96]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vPosition;
          varying vec3 vWorldPosition;
          
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform sampler2D uTexture;
          uniform float uOpacity;
          uniform float uTime;
          uniform float uFluctuationIntensity;
          uniform float uGlowIntensity;
          uniform float uTemperature;
          uniform vec2 uResolution;
          
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vPosition;
          varying vec3 vWorldPosition;
          
          // Accurate Planck blackbody spectrum visualization
          vec3 temperatureToColor(float temp) {
            float normalized = temp / 2.725;
            
            // Hot spots (overdense regions) - warmer colors
            vec3 hot = vec3(1.0, 0.75, 0.55);
            // Cold spots (underdense regions) - cooler colors
            vec3 cold = vec3(0.55, 0.7, 1.0);
            // Neutral temperature
            vec3 neutral = vec3(0.92, 0.88, 0.82);
            
            if (normalized > 1.0) {
              float hotness = (normalized - 1.0) * 100.0;
              return mix(neutral, hot, clamp(hotness, 0.0, 1.0));
            } else {
              float coldness = (1.0 - normalized) * 100.0;
              return mix(neutral, cold, clamp(coldness, 0.0, 1.0));
            }
          }
          
          // Quantum fluctuation noise
          float noise3D(vec3 p) {
            return fract(sin(dot(p, vec3(12.9898, 78.233, 45.5432))) * 43758.5453);
          }
          
          void main() {
            vec4 texColor = texture2D(uTexture, vUv);
            
            // Multi-scale quantum fluctuations
            float largeFluct = sin(vWorldPosition.x * 0.05 + uTime * 0.1) * 
                              cos(vWorldPosition.y * 0.05 + uTime * 0.08) * 
                              sin(vWorldPosition.z * 0.05 + uTime * 0.12);
            
            float mediumFluct = sin(vWorldPosition.x * 0.3 + uTime * 0.3) * 
                               cos(vWorldPosition.y * 0.3 + uTime * 0.25);
            
            float smallFluct = noise3D(vWorldPosition * 2.0 + uTime * 0.1);
            
            float shimmer = (largeFluct * 0.5 + mediumFluct * 0.3 + smallFluct * 0.2) * 
                           uFluctuationIntensity;
            
            // Temperature variation (acoustic peaks & troughs)
            float luma = texColor.r * 0.299 + texColor.g * 0.587 + texColor.b * 0.114;
            float tempVariation = (luma - 0.5) * 2.0;
            
            // Apply physics: T = T₀(1 + ΔT/T)
            float localTemp = uTemperature * (1.0 + tempVariation * uFluctuationIntensity * 150.0);
            vec3 tempColor = temperatureToColor(localTemp);
            
            // Blend texture with temperature mapping
            vec3 finalColor = mix(texColor.rgb, tempColor, 0.4);
            
            // Atmospheric depth glow
            float fresnel = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.5);
            vec3 glowColor = vec3(0.85, 0.88, 1.0);
            finalColor += glowColor * fresnel * uGlowIntensity * (0.5 + shimmer * 2.0);
            
            // Add quantum shimmer
            finalColor += vec3(shimmer * 0.8);
            
            // Distance fog for depth
            float depth = length(vWorldPosition) / 120.0;
            float fog = smoothstep(0.8, 1.0, depth);
            finalColor = mix(finalColor, vec3(0.1, 0.12, 0.15), fog * 0.2);
            
            gl_FragColor = vec4(finalColor, uOpacity);
          }
        `}
        side={THREE.BackSide}
        transparent={true}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

