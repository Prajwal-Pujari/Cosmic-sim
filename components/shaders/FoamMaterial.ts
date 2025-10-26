import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

// FoamShaderMaterial with vertex colors
export const FoamMaterial = shaderMaterial(
  // Uniforms
  { 
    uTime: 0, 
    uInflation: 0,
    uSize: 0.015,
  },
  // Vertex Shader
  `
    uniform float uTime;
    uniform float uInflation;
    uniform float uSize;

    varying vec3 vColor;

    float rand(vec2 co){ return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453); }

    void main() {
      vColor = color;
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
  // Fragment Shader
  `
    uniform float uInflation;
    varying vec3 vColor;

    void main() {
      float opacity = (1.0 - uInflation) * 0.5;
      if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
      gl_FragColor = vec4(vColor, opacity);
    }
  `
)

// Extend for JSX usage
extend({ FoamMaterial })

// TypeScript declaration
declare module '@react-three/fiber' {
  interface ThreeElements { 
    foamMaterial: any 
  }
}