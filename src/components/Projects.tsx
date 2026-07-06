import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { projectMedia } from '../lib/media';
import { ScrollReveal, createStaggerContainer, createStaggerItem, revealViewport } from './ui/scroll-reveal';
import { SplitTextReveal } from './ui/split-text-reveal';

const projects = [
  {
    id: '01',
    title: 'Toy Adventure',
    category: 'Cinema4D & Octane Render',
    year: '2026',
    link: '#',
    image: projectMedia.toyStory,
    detailsImage: projectMedia.toyStoryDetail,
  },
  {
    id: '02',
    title: 'Christmas Gift Project',
    category: 'Cinema4D & 3D VIsuals',
    year: '2025',
    link: '#',
    image: projectMedia.christmas,
    detailsImage: projectMedia.christmasDetail,
  },
  {
    id: '03',
    title: 'Quantum Leap Plan',
    category: 'AIGC & toB',
    year: '2026',
    link: '#',
    image: projectMedia.quantumLeap,
    detailsImage: projectMedia.quantumLeapDetail,
  },
  {
    id: '04',
    title: 'Taobao Holiday KV',
    category: 'AIGC& Holiday Marketing',
    year: '2026',
    link: '#',
    image: projectMedia.tbCampaign,
    detailsImage: projectMedia.springFestivalDetail,
  },
];

export function Projects() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (selectedProject) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.body.classList.add('modal-open');
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.classList.remove('modal-open');
    }
  }, [selectedProject]);

  useEffect(() => {
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const animate = () => {
      setSmoothPosition((prev) => ({
        x: lerp(prev.x, mousePosition.x, 0.15),
        y: lerp(prev.y, mousePosition.y, 0.15),
      }));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mousePosition]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setIsVisible(false);
  };

  return (
    <>
      <section id="projects" className="py-24 px-6 md:px-12 relative z-20 cursor-default" ref={containerRef} onMouseMove={handleMouseMove}>
      <div className="max-w-[1440px] mx-auto relative z-10 w-full">
        <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="flex flex-col space-y-2 md:space-y-4">
            <SplitTextReveal
              text="Selected"
              className="tracking-tight text-white text-left whitespace-nowrap"
              style={{
                fontFamily: 'JosefinSansBold, system-ui',
                fontSize: 'min(106px, 21.5vw)',
                fontWeight: 'normal',
                fontStyle: 'normal',
                textDecorationLine: 'none',
                lineHeight: '0.9',
                textTransform: 'none',
                transform: 'scaleY(0.85)',
                transformOrigin: 'bottom left'
              }}
              y="108%"
              blur={4}
              duration={0.92}
              stagger={0.038}
            />
            <SplitTextReveal
              text="Works"
              className="tracking-tight text-white text-left whitespace-nowrap"
              style={{
                fontFamily: 'JosefinSansBold, system-ui',
                fontSize: 'min(106px, 21.5vw)',
                fontWeight: 'normal',
                fontStyle: 'normal',
                textDecorationLine: 'none',
                lineHeight: '0.9',
                textTransform: 'none',
                transform: 'scaleY(0.85)',
                transformOrigin: 'top left'
              }}
              delay={0.08}
              y="108%"
              blur={4}
              duration={0.92}
              stagger={0.038}
              highlightWords={['Works']}
            />
          </div>
          <ScrollReveal
            className="max-w-xs md:max-w-sm w-full md:w-auto"
            contentClassName="text-white/80 text-base md:text-lg font-light tracking-wide leading-relaxed pb-4 md:pb-6 text-left"
            y={48}
            delay={0.18}
            duration={0.9}
            radius="18px"
          >
            Visual Design. & AIGC.
          </ScrollReveal>
        </div>

        {/* Floating preview image portal */}
        <div
          className="pointer-events-none fixed z-[60] overflow-hidden rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 hidden md:block"
          style={{
            left: 0,
            top: 0,
            transform: `translate3d(${smoothPosition.x + 30}px, ${smoothPosition.y - 180}px, 0)`,
            opacity: isVisible ? 1 : 0,
            scale: isVisible ? 1 : 0.8,
            transition: "opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1), scale 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div className="relative w-[480px] h-[300px] lg:w-[600px] lg:h-[340px] bg-[#111] overflow-hidden">
            {projects.map((project, index) => (
              <img
                key={`preview-${project.id}`}
                src={project.image}
                alt={project.title}
                decoding="async"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  opacity: hoveredIndex === index ? 1 : 0,
                  scale: hoveredIndex === index ? 1 : 1.08,
                  filter: hoveredIndex === index ? "none" : "blur(8px)",
                }}
                referrerPolicy="no-referrer"
              />
            ))}
            {/* Subtle gradient overlay to enhance edges */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </div>

        {/* Project List */}
        <motion.div
          className="space-y-0 w-full mt-10 md:mt-24"
          variants={createStaggerContainer(0.12, 0.04)}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
        >
          {projects.map((project, index) => (
            <motion.button
              key={project.id}
              onClick={() => project.detailsImage && setSelectedProject(project)}
              className="group block w-full text-left cursor-pointer"
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              variants={createStaggerItem(index * 0.03, 52)}
            >
              <div className="relative py-8 md:py-10 border-t border-white/10 transition-all duration-300 ease-out hover:border-white/30">
                {/* Background highlight on hover */}
                <div
                  className={`
                    absolute inset-0 -mx-6 px-6 bg-white/[0.02] rounded-2xl
                    transition-all duration-300 ease-out
                    ${hoveredIndex === index ? "opacity-100 scale-100" : "opacity-0 scale-95"}
                  `}
                />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-10 px-0 sm:px-4">
                  {/* Mobile Preview Image */}
                  <div className="block md:hidden w-full aspect-[16/9] rounded-xl overflow-hidden mb-2">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                      <span className="text-white/40 font-mono text-[9px] sm:text-[10px] tracking-wider w-12 hidden md:block">{project.id} /</span>
                      <h3 className="text-white font-medium text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-tight shrink-0 flex items-center">
                        <span className="relative">
                          {project.title}
                          {/* Animated underline */}
                          <span
                            className={`
                              absolute left-0 -bottom-1 h-[2px] bg-white hidden md:block
                              transition-all duration-500 ease-out
                              ${hoveredIndex === index ? "w-full" : "w-0"}
                            `}
                          />
                        </span>
                        
                        {/* Mobile view only - Arrow directly next to title */}
                        <ArrowUpRight className="w-5 h-5 ml-4 text-white opacity-50 block md:hidden" />
                      </h3>

                      <div className="md:w-0 md:flex-1 w-full mt-1 md:mt-0">
                         {/* Mobile view only string */}
                         <p className="text-white/50 text-[10px] md:hidden tracking-wide font-light">{project.category}</p>
                      </div>

                      {/* Desktop Arrow that slides in */}
                      <ArrowUpRight
                        className={`
                          w-6 h-6 lg:w-8 lg:h-8 text-white
                          transition-all duration-500 ease-out hidden md:block
                          ${
                            hoveredIndex === index
                              ? "opacity-100 translate-x-0 translate-y-0"
                              : "opacity-0 -translate-x-6 translate-y-6"
                          }
                        `}
                      />
                    </div>

                    {/* Desktop Description */}
                    <p
                      className={`
                        hidden md:block text-white/50 text-xs md:text-base mt-4 leading-relaxed font-light pl-20
                        transition-all duration-300 ease-out
                        ${hoveredIndex === index ? "text-white/80" : "text-white/50"}
                      `}
                    >
                      {project.category}
                    </p>
                  </div>

                  {/* Year badge */}
                  <span
                    className={`
                      text-[10px] md:text-xs font-mono text-white/40 tabular-nums absolute md:static top-0 right-0 mt-4 md:mt-0 pt-1 md:pt-0 pb-0 hidden md:block
                      transition-all duration-300 ease-out
                      ${hoveredIndex === index ? "text-white/90" : ""}
                    `}
                  >
                    {project.year}
                  </span>
                </div>
              </div>
            </motion.button>
          ))}

          {/* Bottom border for last item */}
          <div className="border-t border-white/10" />
        </motion.div>
      </div>
    </section>

    {/* Project Detail Modal */}
    <AnimatePresence>
        {selectedProject && selectedProject.detailsImage && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ willChange: "opacity" }}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
              onClick={() => setSelectedProject(null)}
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{ willChange: "transform, opacity" }}
              className="relative w-full h-full md:max-w-[900px] bg-[#0a0a0a] rounded-[2rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 md:px-10 border-b border-white/10 shrink-0 bg-[#0a0a0a] z-10">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">{selectedProject.title}</h2>
                  <p className="text-white/40 text-xs md:text-sm font-mono mt-1 uppercase">{selectedProject.category} / {selectedProject.year}</p>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white text-white hover:text-black transition-all duration-300 cursor-pointer"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto w-full no-scrollbar">
                <div className="w-full flex justify-center pb-20">
                  <img
                    src={selectedProject.detailsImage}
                    alt={selectedProject.title}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
