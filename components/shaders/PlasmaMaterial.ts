import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import { Color } from 'three'

// --- PlasmaShaderMaterial Definition ---
export const PlasmaMaterial = shaderMaterial(
  // Uniforms
  {
    uTime: 0,
    uScale: 0.1, // Start small for fade-in
    uColor1: new Color('#ff8000'), // Orange
    uColor2: new Color('#ff0000'), // Red
    uColor3: new Color('#ffff00'), // Yellow for more variation
  },
  // Vertex Shader (Includes Perlin noise function)
  `
    uniform float uTime;
    uniform float uScale;
    varying float vNoise;
    varying vec3 vPosition;

    // Perlin noise function
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857; vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy; vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y); vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw); vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0; vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy,h.x); vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z); vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m; return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      vPosition = position;
      float noiseFreq = 0.8;
      float noiseAmp = 0.8 * uScale;
      
      // Multi-layered noise for more chaotic movement
      vec3 noisePos1 = vec3(position.x * noiseFreq + uTime * 0.3, position.y * noiseFreq + uTime * 0.2, position.z * noiseFreq);
      vec3 noisePos2 = vec3(position.x * noiseFreq * 2.0 - uTime * 0.15, position.y * noiseFreq * 2.0, position.z * noiseFreq * 2.0 + uTime * 0.1);
      
      float noise1 = snoise(noisePos1);
      float noise2 = snoise(noisePos2) * 0.5;
      vNoise = noise1 + noise2;
      
      vec3 displacement = vec3(vNoise, vNoise * 0.8, vNoise * 1.2) * noiseAmp;
      vec3 newPosition = position + displacement;
      
      vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectionPosition = projectionMatrix * viewPosition;
      gl_Position = projectionPosition;
      
      // Dynamic point size based on noise
      float sizeVariation = 0.5 + abs(vNoise) * 0.5;
      gl_PointSize = (1.5 * uScale * sizeVariation) * (150.0 / -viewPosition.z);
    }
  `,
  // Fragment Shader
  `
    uniform float uScale;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    varying float vNoise;
    varying vec3 vPosition;

    void main() {
      // Create more dynamic color mixing
      float mixFactor = smoothstep(-0.5, 0.5, vNoise);
      vec3 color1 = mix(uColor1, uColor2, mixFactor);
      vec3 finalColor = mix(color1, uColor3, abs(sin(vNoise * 3.14159)));
      
      // Add hot spots based on position
      float hotSpot = smoothstep(0.3, 0.0, length(vPosition) / 5.0);
      finalColor = mix(finalColor, uColor3, hotSpot * 0.5);
      
      // Circular point with soft edge
      float dist = length(gl_PointCoord - vec2(0.5));
      float strength = 1.0 - smoothstep(0.3, 0.5, dist);
      
      // Add glow effect
      float glow = exp(-dist * 4.0) * 0.5;
      strength = max(strength, glow);
      
      float alpha = strength * uScale * (0.6 + abs(vNoise) * 0.4);
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
);

// Extend Three.js with this material
extend({ PlasmaMaterial });

// TypeScript declaration for JSX
declare module '@react-three/fiber' {
  interface ThreeElements {
    plasmaMaterial: any;
  }
}