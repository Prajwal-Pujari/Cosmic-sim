// app/tesseract/page.tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import TesseractScene from '@/components/simulation/TesseractScene'; // Adjust path if needed

export default function TesseractPage() {
  return (
    <div className="w-screen h-screen bg-black">
      <Suspense fallback={<div>Loading Tesseract...</div>}>
        <Canvas 
          camera={{ 
            fov: 75, 
            position: [0, 0, 5], // Start closer to the Tesseract
            near: 0.1, 
            far: 1000 
          }}
          gl={{
            powerPreference: "high-performance", // Request high performance
            antialias: true,
            stencil: false,
            depth: true,
            alpha: true
          }}
        >
          <TesseractScene />
        </Canvas>
      </Suspense>
    </div>
  );
}