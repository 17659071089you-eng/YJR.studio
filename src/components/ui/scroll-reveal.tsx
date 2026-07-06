import { motion, useInView, type Variants, type Transition } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export const revealViewport = {
  once: true,
  amount: 0.2,
  margin: '0px 0px -10% 0px',
} as const;

export const createStaggerContainer = (staggerChildren = 0.12, delayChildren = 0) =>
  ({
    hidden: {},
    visible: {
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  }) satisfies Variants;

export const createStaggerItem = (delay = 0, y = 44): Variants => ({
  hidden: {
    opacity: 0,
    y,
    scale: 0.985,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      delay,
      duration: 0.95,
      ease: [0.22, 1, 0.36, 1],
    },
  },
});

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

  useEffect(() => {
    if (isInView) {
      setHasRevealed(true);
      return;
    }

    const fallbackTimer = window.setTimeout(() => {
      setHasRevealed(true);
    }, 1600);

    return () => window.clearTimeout(fallbackTimer);
  }, [isInView]);

  const hiddenState = {
    opacity: 0,
    y,
    filter: `blur(${blur}px)`,
    clipPath: `inset(0 0 100% 0 round ${radius})`,
  } as const;

  const visibleState = {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    clipPath: `inset(0 0 0% 0 round ${radius})`,
  } as const;

  return (
    <div className={cn('overflow-hidden', className)}>
      <motion.div
        ref={contentRef}
        initial={hiddenState}
        animate={hasRevealed ? visibleState : hiddenState}
        transition={
          transition ?? {
            delay,
            duration,
            ease: [0.22, 1, 0.36, 1],
          }
        }
        className={contentClassName}
      >
        {children}
      </motion.div>
    </div>
  );
}
