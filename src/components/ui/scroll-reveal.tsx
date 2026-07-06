import { motion, useInView, type Variants, type Transition } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export const revealViewport = {
  once: true,
  amount: 0.2,
  margin: '0px 0px -10% 0px',
} as const;

const isCompactMotionMode = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const createStaggerContainer = (staggerChildren = 0.12, delayChildren = 0) =>
  {
    const compactMotion = isCompactMotionMode();
    const effectiveStagger = compactMotion ? Math.min(0.05, staggerChildren * 0.45) : staggerChildren;
    const effectiveDelay = compactMotion ? delayChildren * 0.35 : delayChildren;

    return ({
      hidden: {},
      visible: {
        transition: {
          staggerChildren: effectiveStagger,
          delayChildren: effectiveDelay,
        },
      },
    }) satisfies Variants;
  };

export const createStaggerItem = (delay = 0, y = 44): Variants => {
  const compactMotion = isCompactMotionMode();
  const effectiveY = compactMotion ? Math.min(18, y * 0.42) : y;
  const effectiveDelay = compactMotion ? delay * 0.45 : delay;
  const effectiveDuration = compactMotion ? 0.56 : 0.78;

  return {
    hidden: {
      opacity: 0,
      y: effectiveY,
      scale: compactMotion ? 1 : 0.992,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: effectiveDelay,
        duration: effectiveDuration,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };
};

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  delay?: number;
  y?: number;
  blur?: number;
  duration?: number;
  amount?: number;
  radius?: string;
  transition?: Transition;
}

export function ScrollReveal({
  children,
  className,
  contentClassName,
  delay = 0,
  y = 72,
  blur = 10,
  duration = 1.1,
  amount = 0.2,
  radius = '20px',
  transition,
}: ScrollRevealProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(contentRef, { ...revealViewport, amount });
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
      const node = contentRef.current;
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

  const effectiveY = isCompactMotion ? Math.min(24, y * 0.45) : y;
  const effectiveDuration = isCompactMotion ? Math.min(0.58, duration * 0.65) : duration;
  const effectiveDelay = isCompactMotion ? delay * 0.5 : delay;

  const hiddenState = {
    opacity: 0,
    y: effectiveY,
  } as const;

  const visibleState = {
    opacity: 1,
    y: 0,
  } as const;

  return (
    <div className={cn('overflow-hidden', className)}>
      <motion.div
        ref={contentRef}
        initial={hiddenState}
        animate={hasRevealed ? visibleState : hiddenState}
        transition={
          transition ?? {
            delay: effectiveDelay,
            duration: effectiveDuration,
            ease: [0.22, 1, 0.36, 1],
          }
        }
        className={cn('will-change-transform', contentClassName)}
      >
        {children}
      </motion.div>
    </div>
  );
}
