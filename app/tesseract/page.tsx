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
      <div className="absolute bottom-6 right-6 z-20 text-right space-y-1 pointer-events-auto select-none opacity-40 hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center justify-end gap-2">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Rotate Environment</span>
          <div className="px-1.5 py-0.5 rounded border border-white/20 bg-white/5 text-[9px] font-mono text-gray-300">
            L-Click
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-2">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Zoom In/Out</span>
          <div className="px-1.5 py-0.5 rounded border border-white/20 bg-white/5 text-[9px] font-mono text-gray-300">
            Scroll / Pinch
          </div>
        </div>
      </div>
    </div>
    
  );
}