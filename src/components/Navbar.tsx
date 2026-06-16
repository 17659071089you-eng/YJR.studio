import { motion, AnimatePresence, useScroll } from 'motion/react';
import { cn } from '../lib/utils';
import { useRef, useState, useEffect } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';

function MagneticLink({ href, onClick, children, className, isActive }: { href: string, onClick: (e: any) => void, children: React.ReactNode, className?: string, isActive?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      onClick={onClick}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={cn(
        "relative group px-3 py-1.5 rounded-full flex items-center transition-colors duration-300",
        isActive ? "bg-white text-black" : "text-white",
        className
      )}
    >
      <span className="relative z-10 flex items-center gap-1">{children}</span>
      {!isActive && <span className="absolute left-0 bottom-0 w-full h-[1px] bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>}
    </motion.a>
  );
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const sections = ['home', 'projects', 'gallery', 'profile', 'contact'];
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      let current = 'home';
      for (const id of sections) {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Trigger when the section's top crosses the middle of the viewport (with a 100px buffer)
          if (rect.top <= window.innerHeight / 2 + 100) {
            current = id;
          }
        }
      }
      
      // If we've scrolled to the absolute bottom of the page, activate the last section
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50) {
        current = 'contact';
      }
      
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveSection(id);
    setIsMobileMenuOpen(false); // Close mobile menu if open
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="fixed top-4 md:top-6 left-0 right-0 z-[60] flex flex-col items-center pointer-events-none px-4 md:px-0">
        <motion.nav
          className={cn(
            'pointer-events-auto transition-all duration-500 flex items-center w-full md:w-auto justify-between md:justify-center',
            'bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-full px-4 py-1.5 md:px-6 md:py-2'
          )}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-4 md:gap-8 text-sm md:text-base font-medium tracking-widest text-white">
            {/* Circular Progress Logo */}
            <div className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 cursor-pointer" onClick={(e) => handleScrollTo(e as any, 'home')}>
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff9500" />
                    <stop offset="100%" stopColor="#ff5e00" />
                  </linearGradient>
                </defs>
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="url(#blueGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  style={{
                    pathLength: scrollYProgress
                  }}
                />
              </svg>
              <span className="text-[10px] md:text-xs font-bold tracking-tighter">JR</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <MagneticLink href="#home" isActive={activeSection === 'home'} onClick={(e) => handleScrollTo(e, 'home')}>Home</MagneticLink>
              <MagneticLink href="#projects" isActive={activeSection === 'projects'} onClick={(e) => handleScrollTo(e, 'projects')}>Work</MagneticLink>
              <MagneticLink href="#gallery" isActive={activeSection === 'gallery'} onClick={(e) => handleScrollTo(e, 'gallery')}>Gallery</MagneticLink>
              <MagneticLink href="#profile" isActive={activeSection === 'profile'} onClick={(e) => handleScrollTo(e, 'profile')}>About</MagneticLink>
              <MagneticLink href="#contact" isActive={activeSection === 'contact'} onClick={(e) => handleScrollTo(e, 'contact')}>
                Say hi <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 ml-0.5" />
              </MagneticLink>
            </div>
          </div>

          <button 
            className="md:hidden flex items-center justify-center p-2 text-white min-h-[44px] min-w-[44px]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </motion.nav>

        {/* Status Indicator */}
        <motion.div
          className={cn(
            "absolute right-6 overflow-hidden md:right-8 top-16 md:top-3 pointer-events-auto flex flex-row items-center space-x-2.5 bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-md border border-white/10 rounded-full cursor-pointer md:px-4 md:py-2",
            isScrolled && "md:pointer-events-none",
            "px-2 py-1.5 md:flex", // adjust for mobile
             isMobileMenuOpen && "hidden" // hide on mobile when menu opens
          )}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isScrolled ? 0 : 1, y: isScrolled && window.innerWidth >= 768 ? -10 : 0 }}
          transition={{ duration: 0.8, delay: isScrolled ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => handleScrollTo(e as any, 'contact')}
        >
          <span className="relative flex min-w-2 h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-white/80 text-[10px] md:text-xs font-medium tracking-wide uppercase hidden md:inline-block">
            Available for Work
          </span>
        </motion.div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[55] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center px-6 pt-20 pb-10 pointer-events-auto md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="flex flex-col items-center justify-center gap-8 text-2xl font-medium tracking-widest w-full">
              {['home', 'projects', 'gallery', 'profile', 'contact'].map((id) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(e) => handleScrollTo(e, id)}
                  className={cn(
                    "w-full text-center py-4 flex items-center justify-center uppercase tracking-widest",
                    activeSection === id ? "text-white" : "text-white/50"
                  )}
                >
                  {id === 'projects' ? 'Work' : id === 'profile' ? 'About' : id === 'contact' ? 'Say hi' : id}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
