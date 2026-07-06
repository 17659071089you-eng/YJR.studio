import { motion } from 'motion/react';
import { useEffect } from 'react';
import { videoMedia } from '../lib/media';

export function Loader({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    // Fail closed quickly if the intro media cannot play.
    const timer = setTimeout(() => {
      onComplete();
    }, 15000);
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
        preload="metadata"
        src={videoMedia.loaderIntro}
      />
    </motion.div>
  );
}
