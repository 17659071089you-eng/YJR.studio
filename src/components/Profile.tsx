import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, useSpring } from 'motion/react';
import Marquee from 'react-fast-marquee';

const experiences = [
  {
    id: 1,
    year: '2025.06 - PRESENT',
    company: 'AI设计工作流与技术探索',
    role: '独立实践 / AIGC高效工作流构建',
    tags: ['AIGC', 'VIBE CODING'],
    details: '',
    color: 'rgba(255, 255, 255, 0.1)',
  },
  {
    id: 2,
    year: '2025.02 - 2025.06',
    company: '快手 (KUAISHOU)',
    role: '视觉设计实习生 / 商业化营销业务部',
    tags: ['视觉KV', 'BANNER设计', '长图'],
    details: '',
    color: 'rgba(255, 255, 255, 0.1)',
  },
  {
    id: 3,
    year: 'EDUCATION & INFO',
    company: '南昌大学',
    role: '视觉传达设计/ 全日制',
    tags: ['211', '双一流'],
    details: '',
    color: 'rgba(255, 255, 255, 0.1)',
  },
];

export function Profile() {
  const [selectedExp, setSelectedExp] = useState<typeof experiences[0] | null>(null);
  
  const sectionRef = useRef<HTMLElement>(null);
  
  // Track mouse position relative to the center of the section
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth the mouse values
  const smoothX = useSpring(mouseX, { damping: 30, stiffness: 200, mass: 0.5 });
  const smoothY = useSpring(mouseY, { damping: 30, stiffness: 200, mass: 0.5 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    // Avoid getBoundingClientRect on mousemove. Use window dimensions since section is full screen width/height ish.
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Normalize values between -1 and 1
    const normalizedX = (e.clientX - width / 2) / (width / 2);
    const normalizedY = (e.clientY - height / 2) / (height / 2);
    
    mouseX.set(normalizedX);
    mouseY.set(normalizedY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Portrait gets a stronger 3D rotation
  const portraitRotateX = useTransform(smoothY, [-1, 1], [15, -15]);
  const portraitRotateY = useTransform(smoothX, [-1, 1], [-15, 15]);

  return (
    <section 
      id="profile" 
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative pt-16 pb-32 md:pt-24 md:pb-32 px-6 md:px-12 -mt-32 md:-mt-48 overflow-hidden min-h-[90vh] flex items-center perspective-1000 z-20"
    >
      {/* Background Marquee - Single Line Centered, reduced font size */}
      <div className="absolute inset-0 flex flex-col justify-center opacity-[0.07] pointer-events-none z-0">
        <Marquee speed={30} direction="left">
          <span className="text-[18vw] font-bold whitespace-nowrap px-8 leading-none tracking-tighter text-white">
            About Me About Me
          </span>
        </Marquee>
      </div>

      {/* Increased max-w to allow cards to be wider */}
      <div className="max-w-[1440px] mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">
          
          {/* Left: 3D Portrait - Enlarged */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start perspective-1000 w-full">
            <motion.div
              style={{ rotateX: portraitRotateX, rotateY: portraitRotateY, transformStyle: 'preserve-3d' }}
              className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden group cursor-pointer lg:max-w-[500px]"
            >
              <img
                src="https://wsrv.nl/?url=https%3A%2F%2Fpub-09c21faf928f44ddb7f174a2fc18cfc9.r2.dev%2Fself.jpg&output=webp"
                alt="Portrait"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>

          {/* Right: Timeline Cards - Widened and fixed hover */}
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-center w-full">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">EXPERIENCE</h2>
            
            {experiences.map((exp) => (
              <motion.div
                key={exp.id}
                className="bg-[#0a0a0a] border border-white/10 p-8 rounded-2xl cursor-pointer group relative overflow-hidden transition-colors duration-300 hover:bg-white/5"
                // Removed the 3D rotation from cards as it causes weird jittering on hover
                // Replaced with a simple, smooth scale and subtle Y translation
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                onClick={() => setSelectedExp(exp)}
              >
                <div className="relative z-10 flex flex-col">
                  <span className="text-white/40 font-mono text-xs tracking-widest uppercase mb-4 block">{exp.year}</span>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-3xl font-bold text-white mb-2 tracking-tight">{exp.company}</h4>
                      <p className="text-white/60 text-lg">{exp.role}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {exp.tags.map(tag => (
                        <span key={tag} className="px-4 py-1.5 border border-white/20 rounded-full text-xs text-white/80 font-mono uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Experience Modal */}
      <AnimatePresence>
        {selectedExp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12"
          >
            <div className="absolute inset-0 bg-black/95" onClick={() => setSelectedExp(null)}></div>
            
            {/* Ambient Glow */}
            <div 
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{ background: `radial-gradient(circle at center, ${selectedExp.color} 0%, transparent 50%)` }}
            ></div>

            <motion.div
              initial={{ rotateX: 90, scale: 0.8, opacity: 0 }}
              animate={{ rotateX: 0, scale: 1, opacity: 1 }}
              exit={{ rotateX: -90, scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="relative w-full max-w-3xl glass p-8 md:p-16 rounded-3xl z-10"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <button 
                onClick={() => setSelectedExp(null)}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                ✕
              </button>
              
              <span className="text-white/50 font-mono text-sm mb-4 block">{selectedExp.year}</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">{selectedExp.company}</h2>
              <h3 className="text-2xl text-white/80 mb-8">{selectedExp.role}</h3>
              
              <p className="text-lg text-white/70 leading-relaxed mb-8">
                {selectedExp.details}
              </p>
              
              <div className="flex flex-wrap gap-3">
                {selectedExp.tags.map(tag => (
                  <span key={tag} className="px-4 py-2 bg-white/10 rounded-full text-sm text-white uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
