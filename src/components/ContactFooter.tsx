import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowDown, Mail, MessageCircle, Aperture, X } from 'lucide-react';
import { TextPressure } from './TextPressure';

const contacts = [
  { id: 'email', label: 'Email', value: 'youjiarong_2020@qq.com', icon: Mail, type: 'lucide' },
  { id: 'wechat', label: 'WeChat', value: 'you-jiarong', isQr: true, icon: 'https://raw.githubusercontent.com/17659071089you-eng/portfolio/main/Wechat--Streamline-Bootstrap.svg', type: 'image' },
  { id: 'redbook', label: 'RedBook', value: 'View profile', link: 'https://xhslink.com/m/8n62TzsEteQ', isLink: true, icon: 'https://raw.githubusercontent.com/17659071089you-eng/portfolio/main/Xiaohongshu--Streamline-Simple-Icons.svg', type: 'image' },
];

function ContactCard({ contact, copiedId, handleCopy, setIsQrModalOpen }: { contact: any, copiedId: string | null, handleCopy: (id: string, val: string) => void, setIsQrModalOpen: (val: boolean) => void }) {
  const Icon = contact.icon;
  return (
    <motion.div
      className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 min-h-[176px] h-auto md:h-60 rounded-2xl cursor-pointer group relative overflow-hidden transition-colors duration-300 hover:bg-white/5 flex flex-col items-center justify-center text-center"
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onClick={() => {
        if (contact.isLink && contact.link) {
          window.open(contact.link, '_blank', 'noopener,noreferrer');
        } else if (contact.isQr) {
          // Open Modal for QR
          if (window.innerWidth < 768) {
             setIsQrModalOpen(true);
          } else {
             handleCopy(contact.id, contact.value);
          }
        } else {
          handleCopy(contact.id, contact.value);
        }
      }}
    >
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative z-10 transition-all duration-300 mb-4 md:mb-6">
        {contact.type === 'lucide' ? (
          <Icon className="w-6 h-6 md:w-7 md:h-7 text-white/80 transition-colors duration-300" strokeWidth={2} />
        ) : (
          <img src={contact.icon} alt={contact.label} className="w-6 h-6 md:w-7 md:h-7 invert opacity-80 transition-opacity duration-300" />
        )}
      </div>

      <div className="flex flex-col gap-1.5 relative z-10 w-full">
        <span className="text-white text-3xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
          {contact.label}
        </span>
        <span className="text-white/60 text-[10px] md:text-xs lg:text-sm font-light tracking-wide break-all px-2">
          {copiedId === contact.id ? <span className="text-green-400 font-medium">COPIED!</span> : contact.value}
        </span>
      </div>

      {/* QR Code for WeChat - Desktop Hover Only */}
      {contact.isQr && (
        <div className="hidden md:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/80 backdrop-blur-sm z-20 pointer-events-none">
          <div className="bg-white p-2 rounded-xl shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-500">
            <img 
              src="https://wsrv.nl/?url=https%3A%2F%2Fpub-09c21faf928f44ddb7f174a2fc18cfc9.r2.dev%2Fwechat.png&output=webp" 
              alt="WeChat QR Code" 
              className="w-28 h-28 object-contain" 
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function ContactFooter() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCopy = (id: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <footer id="contact" className="relative pt-12 md:pt-24 pb-32 -mt-16 md:-mt-32 px-6 md:px-12 overflow-hidden z-20 flex justify-center">
      <div className="max-w-[1440px] mx-auto w-full">
        <div className="mb-24 flex flex-col items-center justify-center w-full space-y-4">
          <TextPressure 
            text="THANK YOU." 
            highlightWords={['YOU.']}
            highlightGradient="linear-gradient(45deg, #ec4899, #f97316)"
            className="tracking-tight text-white flex justify-center text-center hidden md:flex"
            style={{
              fontFamily: 'JosefinSansBold, system-ui',
              fontSize: '106px',
              fontWeight: 'normal',
              fontStyle: 'normal',
              textDecorationLine: 'none',
              lineHeight: '95px',
              textTransform: 'none',
              transform: 'scaleY(0.85)',
              transformOrigin: 'top'
            }}
          />
          <h2 className="md:hidden text-4xl font-extrabold tracking-tight text-white text-center transform scale-y-90 uppercase" style={{ fontFamily: 'JosefinSansBold, system-ui' }}>
            THANK YOU.
          </h2>
          <div className="max-w-xl text-center text-white/80 text-base md:text-lg font-light tracking-wide leading-relaxed">
            Let's create something together. Feel free to reach out for freelance opportunities or creative collaborations.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-32 perspective-1000 w-full">
          {contacts.map((contact) => (
            <ContactCard 
              key={contact.id} 
              contact={contact} 
              copiedId={copiedId} 
              handleCopy={handleCopy} 
              setIsQrModalOpen={setIsQrModalOpen}
            />
          ))}
        </div>

        {/* Footer Signature */}
        <div className="border-t border-white/10 pt-12 flex items-center justify-center">
          <p className="text-white/40 text-xs md:text-sm font-mono text-center mb-4 md:mb-0">
            © {new Date().getFullYear()} JR.PORTFOLIO. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
      
      {/* Mobile QR Modal */}
      <AnimatePresence>
        {isQrModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md md:hidden"
            onClick={() => setIsQrModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#111] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center max-w-sm w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsQrModalOpen(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
              >
                <X size={20} />
              </button>
              
              <div className="bg-white p-3 rounded-xl mb-4 mt-6">
                <img 
                  src="https://wsrv.nl/?url=https%3A%2F%2Fpub-09c21faf928f44ddb7f174a2fc18cfc9.r2.dev%2Fwechat.png&output=webp" 
                  alt="WeChat QR Code" 
                  className="w-48 h-48 object-contain" 
                />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1">WeChat</h3>
              <p className="text-white/60 text-sm mb-6 text-center">长按识别二维码或保存图片<br/>(Long press to recognize or save)</p>
              
              <button 
                onClick={() => {
                  handleCopy('wechat', 'you-jiarong');
                  setTimeout(() => setIsQrModalOpen(false), 1500);
                }}
                className="w-full py-3 bg-white/10 rounded-full font-medium text-white text-sm active:bg-white active:text-black transition-colors"
              >
                {copiedId === 'wechat' ? 'COPIED!' : 'COPY ID'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
