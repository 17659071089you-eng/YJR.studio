import { motion, AnimatePresence, useScroll } from 'motion/react';
import { cn } from '../lib/utils';
import { useRef, useState, useEffect } from 'react';
import { ArrowUpRight, Menu, X, Mail } from 'lucide-react';

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
        "relative group px-4 py-2 md:px-6 md:py-2.5 rounded-full flex items-center transition-colors duration-300",
        isActive ? "bg-white text-black" : "text-white hover:bg-white/10",
        className
      )}
    >
      <span className="relative z-10 flex items-center gap-1">{children}</span>
      {!isActive && <span className="absolute left-4 right-4 bottom-1 h-[2px] rounded-full bg-white/40 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300"></span>}
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
      <div className="fixed top-[calc(max(1rem,env(safe-area-inset-top))+25px)] md:top-[calc(1.5rem+20px)] left-0 right-0 z-[60] flex flex-col items-center pointer-events-none px-4 md:px-0 w-full">
        {/* Logo at top-left */}
        <motion.div 
          className={cn(
            "fixed md:absolute left-4 md:left-8 top-[calc(max(1rem,env(safe-area-inset-top))+1px)] md:top-[calc(0.25rem-60px)] cursor-pointer flex items-start justify-start w-[211px] h-[105px] md:w-[370px] md:h-[185px]",
            isScrolled ? "pointer-events-none" : "pointer-events-auto"
          )}
          onClick={(e) => handleScrollTo(e as any, 'home')}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isScrolled ? 0 : 1, y: isScrolled && window.innerWidth >= 768 ? -10 : 0 }}
          transition={{ duration: 0.8, delay: isScrolled ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <img 
            src="https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/logo1.png" 
            alt="Logo" 
            className="w-full h-full object-contain object-left-top drop-shadow-md" 
          />
        </motion.div>

        <motion.nav
          className={cn(
            'pointer-events-auto transition-all duration-500 flex items-center justify-center', 
            'bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-full p-1.5 md:p-2',
            'fixed right-4 top-[calc(max(1rem,env(safe-area-inset-top))+25px)] md:relative md:right-auto md:top-auto z-50'
          )}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center text-sm md:text-base font-medium tracking-widest text-white">
            <div className="hidden md:flex items-center gap-1 md:gap-2">
              <MagneticLink href="#home" isActive={activeSection === 'home'} onClick={(e) => handleScrollTo(e, 'home')}>Home</MagneticLink>
              <MagneticLink href="#projects" isActive={activeSection === 'projects'} onClick={(e) => handleScrollTo(e, 'projects')}>Work</MagneticLink>
              <MagneticLink href="#gallery" isActive={activeSection === 'gallery'} onClick={(e) => handleScrollTo(e, 'gallery')}>Gallery</MagneticLink>
              <MagneticLink href="#profile" isActive={activeSection === 'profile'} onClick={(e) => handleScrollTo(e, 'profile')}>About</MagneticLink>
              <MagneticLink href="#contact" isActive={activeSection === 'contact'} onClick={(e) => handleScrollTo(e, 'contact')}>
                Say hi <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 ml-0.5" />
              </MagneticLink>
            </div>
          </div>

          <div className="md:hidden flex items-center gap-1">
            <button 
              className="flex items-center justify-center min-w-[35px] min-h-[35px] rounded-full text-white bg-transparent hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
            <button
               className={cn(
                 "relative flex items-center justify-center min-w-[35px] min-h-[35px] rounded-full text-green-500 bg-transparent hover:bg-white/10 transition-colors",
                 isMobileMenuOpen && "hidden"
               )}
               onClick={(e) => handleScrollTo(e as any, 'contact')}
            >
              <span className="relative flex items-center justify-center min-w-2 h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 [animation-duration:3s]"></span>
                <span className="relative inline-flex rounded-full h-full w-full bg-green-500"></span>
              </span>
            </button>
          </div>
        </motion.nav>

        {/* Status Indicator */}
        <motion.div
          className={cn(
            "hidden md:flex fixed md:absolute right-[80px] md:right-8 top-[calc(max(1.75rem,env(safe-area-inset-top))+25px)] md:top-[calc(0.75rem+10px)] pointer-events-auto flex-row items-center space-x-2.5 bg-transparent md:bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-md border border-transparent md:border-white/10 rounded-full cursor-pointer px-4 py-2",
            isScrolled && "md:pointer-events-none"
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
            Available
          </span>
        </motion.div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[calc(max(1rem,env(safe-area-inset-top))+70px)] right-4 z-[55] min-w-[88px] bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-3xl flex flex-col p-1.5 pointer-events-auto md:hidden"
          >
            <div className="flex flex-col w-full gap-1 text-sm font-medium tracking-widest text-white">
              {['home', 'projects', 'gallery', 'profile', 'contact'].map((id) => {
                const label = id === 'projects' ? 'Work' : id === 'profile' ? 'About' : id === 'contact' ? 'Say hi' : id;
                const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1);
                return (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={(e) => handleScrollTo(e, id)}
                    className={cn(
                      "w-full text-center py-2 px-3 flex items-center justify-center rounded-full transition-colors whitespace-nowrap",
                      activeSection === id ? "bg-white text-black" : "text-white hover:bg-white/10"
                    )}
                  >
                    {formattedLabel}
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
