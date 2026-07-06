import { motion, useInView } from 'motion/react';
import { useEffect, useRef, useState, type CSSProperties, type ElementType } from 'react';
import { cn } from '../../lib/utils';
import { revealViewport } from './scroll-reveal';

interface SplitTextRevealProps {
  text: string;
  className?: string;
  style?: CSSProperties;
  tag?: ElementType;
  delay?: number;
  duration?: number;
  stagger?: number;
  amount?: number;
  y?: number | string;
  blur?: number;
  textAlign?: CSSProperties['textAlign'];
  highlightWords?: string[];
  highlightGradient?: string;
}

const normalizeWord = (word: string) => word.replace(/\s+/g, '').toUpperCase();

const isCompactMotionMode = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export function SplitTextReveal({
  text,
  className,
  style,
  tag = 'div',
  delay = 0,
  duration = 0.82,
  stagger = 0.028,
  amount = 0.2,
  y = '102%',
  blur = 0,
  textAlign,
  highlightWords = [],
  highlightGradient = 'linear-gradient(45deg, #3b82f6, #a855f7)',
}: SplitTextRevealProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(containerRef, { ...revealViewport, amount });
  const [hasRevealed, setHasRevealed] = useState(false);
  const [isCompactMotion, setIsCompactMotion] = useState(false);

  useEffect(() => {
    const updateCompactMotion = () => {
      setIsCompactMotion(isCompactMotionMode());
    };

    updateCompactMotion();
    window.addEventListener('resize', updateCompactMotion);

    return () => {
      window.removeEventListener('resize', updateCompactMotion);
    };
  }, []);

  useEffect(() => {
    if (isInView) {
      setHasRevealed(true);
    }
  }, [isInView]);

  useEffect(() => {
    if (hasRevealed) {
      return;
    }

    const checkViewportPosition = () => {
      const node = containerRef.current;
      if (!node) {
        return;
      }

      const rect = node.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const triggerLine = viewportHeight * (1 - amount);

      if (rect.top <= triggerLine && rect.bottom >= 0) {
        setHasRevealed(true);
      }
    };

    const frameId = window.requestAnimationFrame(checkViewportPosition);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [amount, hasRevealed]);

  const words = text.split(' ');
  let globalCharIndex = 0;
  const Tag = tag as ElementType;
  const effectiveY = isCompactMotion ? '28%' : y;
  const effectiveDuration = isCompactMotion ? Math.min(0.62, duration * 0.72) : duration;
  const effectiveStagger = isCompactMotion ? Math.min(0.018, stagger * 0.45) : stagger;

  return (
    <Tag
      ref={containerRef}
      className={cn(className)}
      style={{
        textAlign,
        display: 'inline-block',
        overflow: 'visible',
        paddingTop: '0.22em',
        paddingBottom: '0.26em',
        marginTop: '-0.22em',
        marginBottom: '-0.26em',
        ...style,
      }}
      aria-label={text}
    >
      {words.map((word, wordIndex) => {
        const isHighlighted = highlightWords.some((highlightWord) => normalizeWord(highlightWord) === normalizeWord(word));

        return (
          <span
            key={`${word}-${wordIndex}`}
            className="inline-flex whitespace-nowrap align-bottom overflow-hidden pt-[0.24em] pb-[0.28em] -mt-[0.24em] -mb-[0.28em] mr-[0.18em] last:mr-0"
            aria-hidden="true"
          >
            {(isCompactMotion ? [word] : word.split('')).map((char, charIndex) => {
              const currentIndex = globalCharIndex;
              globalCharIndex += isCompactMotion ? 1 : 1;

              return (
                <span
                  key={`${word}-${char}-${charIndex}`}
                  className="inline-flex align-bottom"
                >
                  <motion.span
                    initial={{
                      opacity: 0,
                      y: effectiveY,
                    }}
                    animate={
                      hasRevealed
                        ? {
                            opacity: 1,
                            y: 0,
                          }
                        : {
                            opacity: 0,
                            y: effectiveY,
                          }
                    }
                    transition={{
                      duration: effectiveDuration,
                      delay: delay + currentIndex * effectiveStagger,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="inline-block will-change-transform"
                    style={
                      isHighlighted
                        ? {
                            backgroundImage: highlightGradient,
                            backgroundSize: `${Math.max(word.length, 1) * 100}% 100%`,
                            backgroundPosition: `${word.length > 1 && !isCompactMotion ? (charIndex / (word.length - 1)) * 100 : 50}% 0%`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            color: 'transparent',
                          }
                        : undefined
                    }
                  >
                    {char}
                  </motion.span>
                </span>
              );
            })}
          </span>
        );
      })}
      <span className="sr-only">{text}</span>
    </Tag>
  );
}
