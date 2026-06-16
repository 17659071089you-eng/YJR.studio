import { motion } from 'motion/react';
import { useEffect } from 'react';

export function Loader({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    // Fallback timer in case the video fails to load or play (increased to 60s to ensure long videos aren't cut off)
    const timer = setTimeout(() => {
      onComplete();
    }, 60000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
      exit={{ opacity: 0 }}
      transition={{ duration: 0 }}
    >
      <video
        autoPlay
        muted
        playsInline
        onEnded={onComplete}
        onError={onComplete}
        className="w-full h-full object-cover"
        src="https://raw.githubusercontent.com/17659071089you-eng/portfolio/main/%E5%8A%A8%E7%94%BB1.1.mp4"
      />
    </motion.div>
  );
}
