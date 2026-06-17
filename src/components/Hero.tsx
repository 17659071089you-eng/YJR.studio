import { motion, AnimatePresence } from 'motion/react';
import Marquee from 'react-fast-marquee';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import LightRays from './LightRays';
import { CanvasRevealEffect } from './ui/canvas-reveal-effect';

const ROLES = ['Creative', 'Designer', 'Developer', 'Artist', 'Thinker', 'Creator'];

export function Hero() {
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [roleIndex, setRoleIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % ROLES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Highly precise seamless looping using requestAnimationFrame
  useEffect(() => {
    const setupSeamlessLoop = (video: HTMLVideoElement | null, threshold = 0.04) => {
      if (!video) return () => {};
      let frameId: number;

      const checkLoop = () => {
        if (video.duration && video.currentTime >= video.duration - threshold) {
          video.currentTime = 0;
          video.play().catch(() => {});
        }
        frameId = requestAnimationFrame(checkLoop);
      };

      const onPlay = () => {
        frameId = requestAnimationFrame(checkLoop);
      };

      const onPause = () => {
        cancelAnimationFrame(frameId);
      };

      video.addEventListener('play', onPlay);
      video.addEventListener('pause', onPause);

      if (!video.paused) {
        frameId = requestAnimationFrame(checkLoop);
      }

      return () => {
        video.removeEventListener('play', onPlay);
        video.removeEventListener('pause', onPause);
        cancelAnimationFrame(frameId);
      };
    };

    const cleanupBg = setupSeamlessLoop(bgVideoRef.current);
    const cleanupHero = setupSeamlessLoop(heroVideoRef.current, 2.0); // Reset 2 seconds early to avoid stutter

    return () => {
      cleanupBg();
      cleanupHero();
    };
  }, []);

  return (
    <section id="home" className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Base black background that fades out at the bottom to reveal the wave background */}
      <div 
        className="absolute inset-0 w-full h-full z-0 bg-black"
        style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}
      ></div>

      {/* Video Background */}
      <div 
        className="absolute inset-0 w-full h-full z-0"
        style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}
      >
        <video
          ref={bgVideoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover opacity-80"
          src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        />
      </div>

      {/* Center Looping Video (z-10, under dynamic effects) */}
      <div 
        className="absolute inset-0 w-full h-full z-10 flex items-center justify-center pointer-events-none"
        style={{ maskImage: 'linear-gradient(to bottom, black 65%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 65%, transparent 100%)' }}
      >
        {/* Invisible Hitbox scaled down by ~30% to fit the actual core visible animation */}
        <div 
          id="hero-colored-area"
          className="absolute z-20 w-[81%] md:w-[53%] h-[57vh] md:h-[50vh] translate-y-[calc(-10%-80px)] md:translate-y-[-6%] md:translate-x-[-2%] pointer-events-auto"
        />

        <motion.video
          ref={heroVideoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full md:w-[76%] max-h-[71vh] object-contain mix-blend-screen translate-y-[calc(-10%-80px)] md:translate-y-[-6%] md:translate-x-[-2%] pointer-events-none scale-[1.14] md:scale-100"
          src="https://raw.githubusercontent.com/17659071089you-eng/portfolio/main/%E5%8A%A8%E7%94%BB2.1.mp4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Canvas Reveal Effect Background */}
      <div 
        className="absolute inset-0 w-full h-full z-30 pointer-events-none [&_*]:!pointer-events-none opacity-[0.45] mix-blend-screen global-bg-effect"
        style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}
      >
        {!isScrolled && (
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

      {/* Light Rays Background Effect */}
      <div 
        className="absolute inset-0 w-full h-full z-20 pointer-events-none [&_*]:!pointer-events-none mix-blend-screen opacity-70 global-bg-effect"
        style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}
      >
        {!isScrolled && (
          <LightRays
            raysColor="#3e31f2"
            raysOrigin="top-center"
            raysSpeed={1}
            lightSpread={1}
            rayLength={2}
            pulsating={false}
            fadeDistance={1}
            saturation={1}
            followMouse={true}
            mouseInfluence={0.1}
            noiseAmount={0}
            distortion={0}
            className="w-full h-full"
          />
        )}
      </div>

      {/* Hero Content */}
      <div className="relative z-40 flex flex-col items-center justify-center w-full h-full mt-12 md:mt-16 translate-y-[-40px] md:translate-y-0 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isScrolled ? 0 : 1, y: isScrolled ? -10 : 0 }}
          transition={{ duration: 0.8, delay: isScrolled ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="z-20 mt-[calc(32vh+49px)] md:mt-[52vh] mb-4 text-white/75 text-lg md:text-2xl font-light tracking-wide flex flex-col md:flex-row items-center text-center pointer-events-auto"
        >
          <div className="flex items-center mb-1 md:mb-0">
            A<span 
              className="inline-flex justify-center w-[120px] md:w-[150px] text-white/75 mx-3 md:mx-6 overflow-hidden text-[10px] md:text-base"
              style={{ fontFamily: '"Press Start 2P", cursive' }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={ROLES[roleIndex]}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "backOut" }}
                  className="inline-block uppercase"
                >
                  {ROLES[roleIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>
          <span className="mt-1 md:mt-0 text-sm md:text-xl">Focusing On Visual Design.</span>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isScrolled ? 0 : 1, y: isScrolled ? -10 : 0 }}
          transition={{ duration: 0.8, delay: isScrolled ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-50 mt-4 md:mt-5 pointer-events-auto"
        >
          <button 
            className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-full px-6 py-3 md:px-8 md:py-4 text-xs md:text-sm font-medium uppercase tracking-widest text-white hover:bg-white/20 transition-colors cursor-pointer"
            onClick={() => {
              document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            EXPLORE WORKS
          </button>

          {/* Mobile Downward Arrows Animation */}
          <div 
            className="md:hidden flex flex-col items-center justify-center -space-y-4 opacity-70 cursor-pointer"
            onClick={() => {
              document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Marquee */}
      <div className="absolute bottom-0 left-0 w-full z-10 pb-4 md:pb-8 opacity-40 grayscale pointer-events-none h-10 md:h-auto">
        <Marquee gradient={false} speed={30} autoFill={true}>
          <div 
            className="flex items-center space-x-8 md:space-x-16 pr-8 md:pr-16 text-xs md:text-xl tracking-widest uppercase text-white"
            style={{ fontFamily: '"Press Start 2P", cursive' }}
          >
            <span>VISUAL DESIGN</span>
            <span className="w-1.5 h-1.5 md:w-3 md:h-3 rounded-full bg-white"></span>
            <span>AIGC</span>
            <span className="w-1.5 h-1.5 md:w-3 md:h-3 rounded-full bg-white"></span>
            <span>IP</span>
            <span className="w-1.5 h-1.5 md:w-3 md:h-3 rounded-full bg-white"></span>
            <span>PERSONAL PRACTICE</span>
            <span className="w-1.5 h-1.5 md:w-3 md:h-3 rounded-full bg-white"></span>
          </div>
        </Marquee>
      </div>
    </section>
  );
}
