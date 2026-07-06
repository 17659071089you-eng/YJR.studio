/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { RotateCcw } from 'lucide-react';
import { PixelGridOverlay } from './components/ui/pixel-grid-overlay';

const Projects = lazy(() => import('./components/Projects').then((module) => ({ default: module.Projects })));
const Gallery = lazy(() => import('./components/Gallery').then((module) => ({ default: module.Gallery })));
const Profile = lazy(() => import('./components/Profile').then((module) => ({ default: module.Profile })));
const ContactFooter = lazy(() => import('./components/ContactFooter').then((module) => ({ default: module.ContactFooter })));
const ScrollToTop = lazy(() => import('./components/ScrollToTop').then((module) => ({ default: module.ScrollToTop })));
const DynamicWaveBackground = lazy(() => import('./components/DynamicWaveBackground'));
const CustomCursor = lazy(() => import('./components/CustomCursor').then((module) => ({ default: module.CustomCursor })));

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLandscapeMobile, setIsLandscapeMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Attempt to lock screen orientation for mobile devices if supported
    const orientation = window.screen?.orientation as ScreenOrientation & {
      lock?: (orientation: 'portrait' | 'landscape') => Promise<void>;
    };

    if (orientation?.lock) {
      try {
        orientation.lock('portrait').catch((err) => {
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
      <div className="fixed inset-0 w-full h-full bg-[#0a0a0a] z-[999999] flex flex-col items-center justify-center p-8 text-center text-white">
        <RotateCcw className="w-12 h-12 mb-6 text-white/50 animate-pulse" />
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
          Please Rotate Device
        </h2>
        <p className="text-white/40 text-xs md:text-sm font-mono mt-1 uppercase max-w-xs">
          This experience is optimized for portrait viewing
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#000] min-h-screen w-full overflow-x-hidden text-white selection:bg-white/30 relative">
      <Suspense fallback={null}>
        <CustomCursor />
      </Suspense>

      <div
        className="fixed inset-0 z-[1] pointer-events-none mix-blend-screen"
        style={{
          background:
            'radial-gradient(circle at 50% 18%, rgba(62,49,242,0.28), transparent 22%), radial-gradient(circle at 48% 32%, rgba(120,0,255,0.18), transparent 28%), linear-gradient(180deg, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.82) 45%, rgba(0,0,0,1) 100%)',
        }}
      />

      <div className="global-bg-effect">
        <Suspense fallback={null}>
          <DynamicWaveBackground />
        </Suspense>
      </div>

      <div className="global-grid-pattern fixed inset-0 z-[15] pointer-events-none" />
      
      {/* Global Pixel Glow Effect for other sections */}
      <div 
        className={`fixed inset-0 w-full h-full z-[16] pointer-events-none mix-blend-screen transition-opacity duration-1000 global-bg-effect ${isScrolled ? 'opacity-20' : 'opacity-0'}`}
      >
        {isScrolled && (
          <PixelGridOverlay
            colors={[
              [62, 49, 242],
              [120, 0, 255],
            ]}
            dotSize={isMobile ? 5 : 7}
            totalSize={isMobile ? 22 : 30}
            showGradient={false}
            opacity={0.24}
          />
        )}
      </div>

      <Navbar />

      {/* Render main content */}
      <div className="relative z-[10]">
        <main>
          <Hero />
          <div className="relative z-[20] bg-[#050505]">
            <Suspense fallback={null}>
              <Projects />
              <Gallery />
              <Profile />
            </Suspense>
            <Suspense fallback={null}>
              <ContactFooter />
            </Suspense>
          </div>
        </main>
      </div>

      <Suspense fallback={null}>
        <ScrollToTop />
      </Suspense>
    </div>
  );
}
