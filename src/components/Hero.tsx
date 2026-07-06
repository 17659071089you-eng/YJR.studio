import { motion, AnimatePresence } from 'motion/react';
import Marquee from 'react-fast-marquee';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { videoMedia } from '../lib/media';
import { PixelGridOverlay } from './ui/pixel-grid-overlay';

const LightRays = lazy(() => import('./LightRays'));

const ROLES = ['Creative', 'Designer', 'Developer', 'Artist', 'Thinker', 'Creator'];

export function Hero() {
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [roleIndex, setRoleIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showLightRays, setShowLightRays] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

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

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;

    video.muted = true;
    video.preload = 'auto';
    video.load();
    const tryPlay = () => video.play().catch(() => {});
    tryPlay();
    const timer = window.setTimeout(tryPlay, 500);

    if (!video.paused) {
      tryPlay();
    }

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (isMobile || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShowLightRays(false);
      return;
    }

    const timer = window.setTimeout(() => setShowLightRays(true), 1200);
    return () => window.clearTimeout(timer);
  }, [isMobile]);

  return (
    <section id="home" className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 w-full h-full z-0 bg-black"
        style={{
          maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
        }}
      />

      <div
        className="absolute inset-0 w-full h-full z-10 flex items-center justify-center pointer-events-none"
        style={{
          maskImage: 'linear-gradient(to bottom, black 65%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 65%, transparent 100%)',
        }}
      >
        <motion.video
          ref={heroVideoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          className="w-full md:w-[57%] max-h-[71vh] md:max-h-[53vh] object-contain mix-blend-screen translate-y-[calc(-10%-80px)] md:translate-y-[-6%] md:translate-x-[-2%] pointer-events-none scale-[1.14] md:scale-100"
          src={videoMedia.heroLoop}
          onLoadedData={() => setIsVideoReady(true)}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isVideoReady ? 1 : 0, y: isVideoReady ? 0 : 30 }}
          transition={{ duration: 0.45, delay: 0, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <div
          id="hero-colored-area"
          className="absolute w-[81%] md:w-[40%] h-[57vh] md:h-[38vh] translate-y-[calc(-10%-80px)] md:translate-y-[-6%] md:translate-x-[-2%] pointer-events-auto"
        />
      </div>

      <div
        className="absolute inset-0 w-full h-full z-30 pointer-events-none [&_*]:!pointer-events-none opacity-20 md:opacity-20 mix-blend-screen global-bg-effect"
        style={{
          maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
        }}
      >
        {!isScrolled && (
          <PixelGridOverlay
            colors={[
              [62, 49, 242],
              [120, 0, 255],
            ]}
            dotSize={isMobile ? 5 : 7}
            totalSize={isMobile ? 20 : 28}
            showGradient={false}
            opacity={0.28}
          />
        )}
      </div>

      <div
        className="absolute inset-0 w-full h-full z-20 pointer-events-none [&_*]:!pointer-events-none mix-blend-screen opacity-70 global-bg-effect"
        style={{
          maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
        }}
      >
        {!isScrolled && showLightRays && (
          <Suspense fallback={null}>
            <LightRays
              raysColor="#3e31f2"
              raysOrigin="top-center"
              raysSpeed={1}
              lightSpread={1}
              rayLength={2}
              pulsating={false}
              fadeDistance={1}
              saturation={1}
              followMouse
              mouseInfluence={0.1}
              noiseAmount={0}
              distortion={0}
              className="w-full h-full"
            />
          </Suspense>
        )}
      </div>

      <div className="relative z-40 flex flex-col items-center justify-center w-full h-full mt-12 md:mt-16 translate-y-[-100px] md:translate-y-0 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isScrolled ? 0 : 1, y: isScrolled ? -10 : 0 }}
          transition={{ duration: 0.8, delay: isScrolled ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="z-20 mt-[calc(32vh+49px)] md:mt-[calc(52vh-180px)] mb-4 text-white/75 text-lg md:text-2xl font-light tracking-wide flex flex-col md:flex-row items-center text-center pointer-events-auto"
        >
          <div className="flex items-center mb-1 md:mb-0">
            A
            <span
              className="inline-flex justify-center w-[120px] md:w-[150px] text-white/75 mx-3 md:mx-6 overflow-hidden text-[10px] md:text-base"
              style={{ fontFamily: '"BitcountGridDouble", monospace' }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={ROLES[roleIndex]}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: 'backOut' }}
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
                  ease: 'easeInOut',
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-full z-40 pb-4 md:pb-8 opacity-40 grayscale pointer-events-none h-10 md:h-auto">
        <Marquee gradient={false} speed={30} autoFill>
          <div
            className="flex items-center space-x-8 md:space-x-16 pr-8 md:pr-16 text-xs md:text-xl tracking-widest uppercase text-white"
            style={{ fontFamily: '"BitcountGridDouble", monospace' }}
          >
            <span>VISUAL DESIGN</span>
            <span className="w-1.5 h-1.5 md:w-3 md:h-3 rounded-full bg-white" />
            <span>AIGC</span>
            <span className="w-1.5 h-1.5 md:w-3 md:h-3 rounded-full bg-white" />
            <span>IP</span>
            <span className="w-1.5 h-1.5 md:w-3 md:h-3 rounded-full bg-white" />
            <span>PERSONAL PRACTICE</span>
            <span className="w-1.5 h-1.5 md:w-3 md:h-3 rounded-full bg-white" />
          </div>
        </Marquee>
      </div>
    </section>
  );
}
