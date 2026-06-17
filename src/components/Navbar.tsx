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
      {/* Top Gradient/Blur Mask for Mobile */}
      <div 
        className={cn(
          "fixed top-0 left-0 right-0 h-32 z-[45] pointer-events-none transition-opacity duration-700 md:hidden",
          "bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-[4px]",
          isScrolled ? "opacity-100" : "opacity-0"
        )}
        style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}
      />
      
      <div className="fixed top-[calc(max(1rem,env(safe-area-inset-top))-5px)] md:top-[calc(1.5rem+20px)] left-0 right-0 z-[60] flex flex-col items-center pointer-events-none px-4 md:px-0 w-full">
        {/* Logo at top-left */}
        <motion.div 
          className={cn(
            "fixed md:absolute left-4 md:left-8 top-[calc(max(1rem,env(safe-area-inset-top))+15px)] -translate-y-1/2 md:translate-y-0 md:top-[calc(0.25rem-60px)] cursor-pointer flex items-center md:items-start justify-start w-[211px] h-[105px] md:w-[370px] md:h-[185px] scale-80 origin-left md:scale-100 md:origin-center",
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
            className="w-full h-full object-contain object-left md:object-left-top drop-shadow-md" 
          />
        </motion.div>

        <motion.nav
          className={cn(
            'pointer-events-auto transition-all duration-500 flex items-center justify-center', 
            'bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-full p-1.5 md:p-2',
            'fixed right-4 top-[calc(max(1rem,env(safe-area-inset-top))+15px)] -translate-y-1/2 md:translate-y-0 md:relative md:right-auto md:top-auto z-50 scale-80 origin-right md:scale-100 md:origin-center'
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

          <div className="md:hidden flex items-center gap-4">
            <button 
              className="flex items-center justify-center min-w-[35px] min-h-[35px] rounded-full text-white bg-transparent hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
            <button
               className={cn(
                 "relative flex items-center justify-center min-w-[35px] min-h-[35px] rounded-full text-white bg-transparent hover:bg-white/10 transition-colors",
                 isMobileMenuOpen && "hidden"
               )}
               onClick={(e) => handleScrollTo(e as any, 'contact')}
            >
              <span className="relative flex items-center justify-center min-w-5 h-5 w-5">
                <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" className="absolute w-5 h-5 animate-ping opacity-75 text-white/50 [animation-duration:3s]">
                  <path d="M512 64c259.2 0 469.333333 200.576 469.333333 448s-210.133333 448-469.333333 448a484.48 484.48 0 0 1-232.725333-58.88l-116.394667 50.645333a42.666667 42.666667 0 0 1-58.517333-49.002666l29.76-125.013334C76.629333 703.402667 42.666667 611.477333 42.666667 512 42.666667 264.576 252.8 64 512 64z m0 64C287.488 128 106.666667 300.586667 106.666667 512c0 79.573333 25.557333 155.434667 72.554666 219.285333l5.525334 7.317334 18.709333 24.192-26.965333 113.237333 105.984-46.08 27.477333 15.018667C370.858667 878.229333 439.978667 896 512 896c224.512 0 405.333333-172.586667 405.333333-384S736.512 128 512 128z m-157.696 341.333333a42.666667 42.666667 0 1 1 0 85.333334 42.666667 42.666667 0 0 1 0-85.333334z m159.018667 0a42.666667 42.666667 0 1 1 0 85.333334 42.666667 42.666667 0 0 1 0-85.333334z m158.997333 0a42.666667 42.666667 0 1 1 0 85.333334 42.666667 42.666667 0 0 1 0-85.333334z" fill="currentColor"></path>
                </svg>
                <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" className="relative z-10 w-5 h-5 text-white">
                  <path d="M512 64c259.2 0 469.333333 200.576 469.333333 448s-210.133333 448-469.333333 448a484.48 484.48 0 0 1-232.725333-58.88l-116.394667 50.645333a42.666667 42.666667 0 0 1-58.517333-49.002666l29.76-125.013334C76.629333 703.402667 42.666667 611.477333 42.666667 512 42.666667 264.576 252.8 64 512 64z m0 64C287.488 128 106.666667 300.586667 106.666667 512c0 79.573333 25.557333 155.434667 72.554666 219.285333l5.525334 7.317334 18.709333 24.192-26.965333 113.237333 105.984-46.08 27.477333 15.018667C370.858667 878.229333 439.978667 896 512 896c224.512 0 405.333333-172.586667 405.333333-384S736.512 128 512 128z m-157.696 341.333333a42.666667 42.666667 0 1 1 0 85.333334 42.666667 42.666667 0 0 1 0-85.333334z m159.018667 0a42.666667 42.666667 0 1 1 0 85.333334 42.666667 42.666667 0 0 1 0-85.333334z m158.997333 0a42.666667 42.666667 0 1 1 0 85.333334 42.666667 42.666667 0 0 1 0-85.333334z" fill="currentColor"></path>
                </svg>
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[55] bg-black/80 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-xl flex flex-col items-center justify-center px-6 pt-20 pb-10 pointer-events-auto md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="flex flex-col items-center justify-center w-full gap-8 text-2xl font-medium tracking-widest text-white">
              {['home', 'projects', 'gallery', 'profile', 'contact'].map((id) => {
                const label = id === 'projects' ? 'Work' : id === 'profile' ? 'About' : id === 'contact' ? 'Say hi' : id;
                const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1);
                return (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={(e) => handleScrollTo(e, id)}
                    className={cn(
                      "w-full text-center py-2 flex items-center justify-center transition-colors",
                      activeSection === id ? "text-white" : "text-white/50 hover:text-white/80"
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
