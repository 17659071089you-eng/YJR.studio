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

export function SplitTextReveal({
  text,
  className,
  style,
  tag = 'div',
  delay = 0,
  duration = 0.95,
  stagger = 0.035,
  amount = 0.2,
  y = '110%',
  blur = 6,
  textAlign,
  highlightWords = [],
  highlightGradient = 'linear-gradient(45deg, #3b82f6, #a855f7)',
}: SplitTextRevealProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(containerRef, { ...revealViewport, amount });
  const [hasRevealed, setHasRevealed] = useState(false);

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
    window.addEventListener('scroll', checkViewportPosition, { passive: true });
    window.addEventListener('resize', checkViewportPosition);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', checkViewportPosition);
      window.removeEventListener('resize', checkViewportPosition);
    };
  }, [amount, hasRevealed]);

  const words = text.split(' ');
  const totalChars = words.reduce((sum, word) => sum + word.length, 0);
  let globalCharIndex = 0;
  const Tag = tag as ElementType;

  return (
    <Tag
      ref={containerRef}
      className={cn(className)}
      style={{ textAlign, ...style }}
      aria-label={text}
    >
      {words.map((word, wordIndex) => {
        const isHighlighted = highlightWords.some((highlightWord) => normalizeWord(highlightWord) === normalizeWord(word));

        return (
          <span
            key={`${word}-${wordIndex}`}
            className="inline-flex whitespace-nowrap align-bottom mr-[0.18em] last:mr-0"
            aria-hidden="true"
          >
            {word.split('').map((char, charIndex) => {
              const currentIndex = globalCharIndex;
              globalCharIndex += 1;

              return (
                <span
                  key={`${word}-${char}-${charIndex}`}
                  className="inline-flex overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]"
                >
                  <motion.span
                    initial={{
                      opacity: 0,
                      y,
                      filter: `blur(${blur}px)`,
                    }}
                    animate={
                      hasRevealed
                        ? {
                            opacity: 1,
                            y: 0,
                            filter: 'blur(0px)',
                          }
                        : {
                            opacity: 0,
                            y,
                            filter: `blur(${blur}px)`,
                          }
                    }
                    transition={{
                      duration,
                      delay: delay + currentIndex * stagger,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="inline-block will-change-transform"
                    style={
                      isHighlighted
                        ? {
                            backgroundImage: highlightGradient,
                            backgroundSize: `${Math.max(word.length, 1) * 100}% 100%`,
                            backgroundPosition: `${word.length > 1 ? (charIndex / (word.length - 1)) * 100 : 0}% 0%`,
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
