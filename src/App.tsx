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

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > window.innerHeight * 0.5);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            dotSize={6.5}
            totalSize={32.5}
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
