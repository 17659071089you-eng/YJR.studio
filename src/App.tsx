/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Projects } from './components/Projects';
import { Gallery } from './components/Gallery';
import { Profile } from './components/Profile';
import { ContactFooter } from './components/ContactFooter';
import { Loader } from './components/Loader';
import { ScrollToTop } from './components/ScrollToTop';
import DynamicWaveBackground from './components/DynamicWaveBackground';
import { CustomCursor } from './components/CustomCursor';
import { CanvasRevealEffect } from './components/ui/canvas-reveal-effect';
import { RotateCcw } from 'lucide-react';

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLandscapeMobile, setIsLandscapeMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Attempt to lock screen orientation for mobile devices if supported
    if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
      try {
        window.screen.orientation.lock('portrait').catch((err) => {
          console.log('Screen orientation lock failed/not supported:', err);
        });
      } catch (err) {
        console.log('Screen orientation lock error:', err);
      }
    }

    const handleResize = () => {
      // Check if it's a mobile device in landscape mode
      const isMobileDevice = window.innerWidth <= 900;
      const isLandscape = window.innerWidth > window.innerHeight;
      setIsLandscapeMobile(isMobileDevice && isLandscape);
      setIsMobile(window.innerWidth < 768);
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > window.innerHeight * 0.5);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    handleScroll();
    handleResize();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Show a "rotate device" message on mobile landscape
  if (isLandscapeMobile) {
    return (
      <div className="fixed inset-0 w-full h-full bg-black z-[999999] flex flex-col items-center justify-center p-8 text-center text-white">
        <RotateCcw className="w-12 h-12 mb-6 text-white/50 animate-pulse" />
        <h2 className="text-xl md:text-2xl font-medium mb-4 tracking-wider uppercase font-['Bebas']">
          Please Rotate Device
        </h2>
        <p className="text-white/60 font-light max-w-xs text-sm md:text-base">
          This experience is optimized for portrait viewing on mobile devices.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen w-full overflow-x-hidden text-white selection:bg-white/30 relative">
      <CustomCursor />
      {/* Background for everything except Hero */}
      <div className="global-bg-effect">
        <DynamicWaveBackground />
      </div>
      
      {/* Global Pixel Glow Effect for other sections */}
      <div 
        className={`fixed inset-0 w-full h-full z-[16] pointer-events-none mix-blend-screen transition-opacity duration-1000 global-bg-effect ${isScrolled ? 'opacity-20' : 'opacity-0'}`}
      >
        {isScrolled && (
          <CanvasRevealEffect
            animationSpeed={3}
            colors={[
              [62, 49, 242],
              [120, 0, 255],
            ]}
            dotSize={isMobile ? 4.875 : 6.5}
            totalSize={isMobile ? 24.375 : 32.5}
            showGradient={false}
          />
        )}
      </div>

      {/* Render main content */}
      <div className="relative">
        <Navbar />
        <main>
          <Hero />
          <Projects />
          <Gallery />
          <Profile />
        </main>
        <ContactFooter />
        <ScrollToTop />
      </div>
    </div>
  );
}
