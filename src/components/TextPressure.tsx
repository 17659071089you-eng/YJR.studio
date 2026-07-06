import { Fragment, useEffect, useRef, type CSSProperties } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useAnimationFrame, MotionValue } from 'motion/react';

interface TextPressureProps {
  text: string;
  className?: string;
  style?: CSSProperties;
  highlightWords?: string[];
  highlightGradient?: string;
  disableHover?: boolean;
}

interface PressureCharProps {
  char: string;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  isHighlighted?: boolean;
  charIndex?: number;
  wordLength?: number;
  highlightGradient?: string;
  disableHover?: boolean;
}

export function TextPressure({ text, className = '', style, highlightWords = [], highlightGradient = 'linear-gradient(45deg, #3b82f6, #a855f7)', disableHover = false }: TextPressureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initialize far off-screen so it doesn't affect text before mouse moves
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.pageX);
      mouseY.set(e.pageY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const words = text.split(' ');

  return (
    <div 
      ref={containerRef} 
      className={`flex flex-wrap ${className}`}
      style={style}
    >
      {words.map((word, wordIndex) => {
        const isHighlighted = highlightWords.includes(word.toUpperCase()) || highlightWords.includes(word);
        return (
          <div 
            key={wordIndex} 
            className="flex mr-[0.3em]"
          >
            {word.split('').map((char, charIndex) => (
              <Fragment key={`${wordIndex}-${charIndex}`}>
                <PressureChar 
                  char={char} 
                  mouseX={mouseX} 
                  mouseY={mouseY} 
                  isHighlighted={isHighlighted}
                  charIndex={charIndex}
                  wordLength={word.length}
                  highlightGradient={highlightGradient}
                  disableHover={disableHover}
                />
              </Fragment>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function PressureChar({ 
  char, 
  mouseX, 
  mouseY,
  isHighlighted,
  charIndex = 0,
  wordLength = 1,
  highlightGradient = 'linear-gradient(45deg, #3b82f6, #a855f7)',
  disableHover = false
}: PressureCharProps) {
  const charRef = useRef<HTMLSpanElement>(null);
  const charCenter = useRef({ x: 0, y: 0 });
  
  // Use MotionValues to bypass React state and re-renders completely
  const pressure = useMotionValue(0);
  const springPressure = useSpring(pressure, { stiffness: 300, damping: 20, mass: 0.5 });

  useEffect(() => {
    const updatePosition = () => {
      if (charRef.current) {
        const rect = charRef.current.getBoundingClientRect();
        charCenter.current = {
          x: rect.left + window.scrollX + rect.width / 2,
          y: rect.top + window.scrollY + rect.height / 2
        };
      }
    };
    
    // Initial update
    updatePosition();
    
    // Small delay to ensure layout is complete (fonts loaded etc)
    const timeoutId = setTimeout(updatePosition, 500);
    
    window.addEventListener('resize', updatePosition);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updatePosition);
    };
  }, []);

  useAnimationFrame(() => {
    if (disableHover || !charRef.current || charCenter.current.x === 0) return;
    
    // Completely disable calculation when modal is open to save CPU/GPU rendering resources.
    if (document.body.classList.contains('modal-open')) {
        // Slowly reset pressure to 0 when modal opens so text doesn't freeze in expanded state
        if (pressure.get() > 0) {
            pressure.set(pressure.get() * 0.9);
        }
        return;
    }
    
    const distX = mouseX.get() - charCenter.current.x;
    const distY = mouseY.get() - charCenter.current.y;
    const dist = Math.sqrt(distX * distX + distY * distY);
    
    const maxDist = 120; // Adjusted for smoother interaction
    let newPressure = Math.max(0, 1 - dist / maxDist);
    newPressure = Math.pow(newPressure, 1.5); // Ease-in curve
    
    pressure.set(newPressure);
  });

  // Map pressure to font variations and styles directly via useTransform
  const fontVariationSettings = useTransform(springPressure, (p) => `"wght" ${300 + p * 600}, "wdth" ${100 + p * 50}`);
  const scaleY = useTransform(springPressure, (p) => 1 + p * 0.2);
  const color = useTransform(springPressure, (p) => p > 0.5 ? '#ffffff' : 'rgba(255,255,255,0.9)');

  const gradientStyle = isHighlighted ? {
    backgroundImage: highlightGradient,
    backgroundSize: `${wordLength * 100}% 100%`,
    backgroundPosition: `${wordLength > 1 ? (charIndex / (wordLength - 1)) * 100 : 0}% 0%`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent',
    padding: '0.25em',
    margin: '-0.25em',
  } : {};

  return (
    <motion.span
      ref={charRef}
      className="inline-block origin-bottom"
      style={{
        fontVariationSettings,
        scaleY,
        ...(isHighlighted ? gradientStyle : { color })
      }}
    >
      {char}
    </motion.span>
  );
}
