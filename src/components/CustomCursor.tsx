import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useScroll, useVelocity, useAnimationFrame } from 'motion/react';

export function CustomCursor() {
  const [isHoveringVideo, setIsHoveringVideo] = useState(false);
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Smooth spring physics for the cursor
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // Scroll-based rotation
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });
  const textRotation = useMotionValue(0);

  // Use a ref to track the currently hovered magnetic target
  let magneticTargetRef = null as HTMLElement | null;

  useAnimationFrame((t, delta) => {
    // Base speed: 45 degrees per second (8s full rotation)
    const baseSpeed = 45 * (delta / 1000);
    // Extra speed based on scroll velocity
    const scrollSpeed = Math.abs(smoothVelocity.get()) * 0.25 * (delta / 1000);
    textRotation.set(textRotation.get() + baseSpeed + scrollSpeed);
  });

  useEffect(() => {
    let lastTarget: Element | null = null;
    let isVideoFrame = false;
    let isBtnFrame = false;
    let currentMagnetic: HTMLElement | null = null;

    const moveCursor = (e: MouseEvent) => {
      const targetEl = e.target as Element;
      if (!targetEl) return;

      // Only perform DOM queries when the hovered element actually changes
      if (lastTarget !== targetEl) {
        lastTarget = targetEl;
        
        isBtnFrame = !!targetEl.closest('a, button, [role="button"]');
        setIsHoveringButton(isBtnFrame);
        
        const navTarget = targetEl.closest('nav a, nav button, nav [role="button"]');
        currentMagnetic = navTarget as HTMLElement | null;
        magneticTargetRef = currentMagnetic;
        
        isVideoFrame = !!targetEl.closest('#hero-colored-area');
        setIsHoveringVideo(isVideoFrame);
      }

      // Fast, simple coordinate update
      if (currentMagnetic) {
        const rect = currentMagnetic.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;
        
        cursorX.set(centerX + distanceX * 0.3);
        cursorY.set(centerY + distanceY * 0.3);
      } else {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    
    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, [cursorX, cursorY]);

  // Hide default cursor globally when this component mounts
  useEffect(() => {
    document.body.style.cursor = 'none';
    
    // Also hide cursor on interactive elements to prevent default pointer from showing
    const style = document.createElement('style');
    style.innerHTML = `
      * { cursor: none !important; }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.body.style.cursor = 'auto';
      document.head.removeChild(style);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 z-[100000] pointer-events-none flex items-center justify-center transform-gpu"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        translateX: '-50%',
        translateY: '-50%',
      }}
    >
      <motion.div
        animate={{
          scale: isHoveringButton ? 0.4 : (isHoveringVideo ? 2.5 : 1),
          opacity: isHoveringButton ? 0.2 : 1
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex items-center justify-center transform-gpu"
      >
        <motion.div 
          animate={{ scale: isHoveringButton ? 1 : (isHoveringVideo ? 0.5 : 1) }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute w-[95px] h-[95px] bg-[#111111]/80 border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-full -z-10 transform-gpu" 
        />
        
        <motion.svg
          animate={{ opacity: (isHoveringVideo || isHoveringButton) ? 0 : 1, scale: (isHoveringVideo || isHoveringButton) ? 0.8 : 1 }}
          transition={{ duration: 0.3 }}
          style={{ rotate: textRotation }}
          className="w-24 h-24 transform-gpu"
          viewBox="0 0 100 100"
        >
          <path
            id="textPath"
            d="M 50, 50 m -32, 0 a 32,32 0 1,1 64,0 a 32,32 0 1,1 -64,0"
            fill="none"
          />
          <text className="text-[10.5px] font-bold uppercase fill-white" style={{ letterSpacing: '0.18em' }}>
            <textPath href="#textPath" startOffset="0%">
              SCROLL • SCROLL • SCROLL •
            </textPath>
          </text>
        </motion.svg>
        <motion.div 
          animate={{ opacity: (isHoveringVideo || isHoveringButton) ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          className="absolute w-1.5 h-1.5 bg-white rounded-full transform-gpu" 
        />
      </motion.div>
    </motion.div>
  );
}
