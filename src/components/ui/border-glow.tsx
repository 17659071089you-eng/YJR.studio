import React from 'react';
import { motion } from 'motion/react';

interface BorderGlowProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  glowColor?: string;
  borderWidth?: number;
}

export function BorderGlow({ 
  children, 
  className = '',
  containerClassName = '',
  glowColor = 'conic-gradient(from 180deg at 50% 50%, #2a8af6 0deg, #a853ba 180deg, #e92a67 360deg)',
  borderWidth = 1
}: BorderGlowProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl group ${containerClassName}`} style={{ padding: borderWidth }}>
      {/* The rotating gradient background */}
      <div 
        className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
        style={{ background: glowColor }} 
      />
      
      {/* The inner content container */}
      <div className={`relative h-full w-full rounded-2xl bg-black ${className}`}>
        {children}
      </div>
    </div>
  );
}
