import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TextPressure } from './TextPressure';

// 1. Manually interleaved order so Landscapes (L) and Portraits (P) are beautifully mixed
// original ids: Portraits: [7, 8, 10, 12, 15, 17], Landscapes/Wide: [1,2,3,4,5,6,9,11,13,14,16]

// 17 items total. To ensure the flex-justified grid remains perfectly flush and proportionate
// (no massive single image at the end), we group them explicitly into rows with balanced numbers:
// Desktop: 5 rows (4, 4, 3, 3, 3 items) = 17 items
// Mobile: 8 rows (2, 2, 2, 2, 2, 2, 2, 3 items) = 17 items
const optimizedGalleryOrder = [
  1, 7, 2, 8,   // Row 1 (desktop): Wide, Tall, Wide, Tall (4 items)
  12, 3, 10, 4, // Row 2 (desktop): Tall, Wide, Tall, Wide (4 items)
  5, 17, 6,     // Row 3 (desktop): Wide, Tall, Wide (3 items)
  11, 15, 9,    // Row 4 (desktop): Wide, Tall, Wide (3 items)
  13, 14, 16    // Row 5 (desktop): Wide, Wide, Wide (3 items)
];

const baseGalleryItems = [
  { id: 1, title: 'Apple TV', category: 'Design', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/apple-tv1.jpg' },
  { id: 2, title: 'Baseball', category: 'Photography', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/baseball4.jpg' },
  { id: 3, title: 'Car 5', category: 'Render', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/car5.jpg' },
  { id: 4, title: 'Car 10', category: 'Render', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/car10.jpg' },
  { id: 5, title: 'Car 6', category: 'Render', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/car6.jpg' },
  { id: 6, title: 'IP 1', category: 'Brand', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/ip1.jpg' },
  { id: 7, title: 'Girl 1', category: 'Character', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/girl2.jpg' },
  { id: 8, title: 'Robot 1', category: 'Character', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/robot1.jpg' },
  { id: 9, title: 'TB 1', category: 'Concept', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/tb1.jpg' },
  { id: 10, title: 'VH 1', category: 'Concept', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/vh1.jpg' },
  { id: 11, title: 'Christmas', category: 'Event', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/%E5%9C%A3%E8%AF%9E.jpg' },
  { id: 12, title: 'Quantum Leap', category: 'Poster', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/%E9%87%8F%E5%AD%90%E9%A3%9E%E8%B7%83%E8%AE%A1%E5%88%92.jpg' },
  { id: 13, title: 'Match', category: 'Sports', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/%E6%AF%94%E8%B5%9B.jpg' },
  { id: 14, title: 'Toy Story', category: '3D Render', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/toystory.jpg' },
  { id: 15, title: 'Outfit', category: 'Character', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/%E6%8D%A2%E8%A3%851.jpg' },
  { id: 16, title: 'VH 2', category: 'Concept', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/vh2.jpg' },
  { id: 17, title: 'Poster 1', category: 'Poster', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/baseball2.jpg' },
];

const galleryItems = optimizedGalleryOrder.map(id => baseGalleryItems.find(i => i.id === id)!);

export function Gallery() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [dynamicARs, setDynamicARs] = useState<Record<number, number>>({});

  useEffect(() => {
    if (isModalOpen) {
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
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.classList.remove('modal-open');
    };
  }, [isModalOpen]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const gapSize = isMobile ? 16 : 24; // 16px (gap-4) or 24px (gap-6)
  
  // Custom grouping logic so we don't end up with 1 item taking the entire last row
  // For mobile: The user requested to remove the last 3 rows, so we use 5 rows (10 items) instead of 8
  const rowCounts = isMobile ? [2, 2, 2, 2, 2] : [4, 4, 3, 3, 3];
  
  const rows = [];
  let currentItemIndex = 0;
  for (const count of rowCounts) {
    if (currentItemIndex >= galleryItems.length) break;
    rows.push(galleryItems.slice(currentItemIndex, currentItemIndex + count));
    currentItemIndex += count;
  }

  const REAL_ASPECT_RATIOS: Record<number, number> = {
    1: 1, 2: 0.707, 3: 1.791, 4: 1, 5: 1.776, 6: 1.6, 7: 0.945, 8: 1.593, 
    9: 1.791, 10: 0.826, 11: 1.833, 12: 1.777, 13: 1.791, 14: 2.098, 15: 0.707, 
    16: 2.002, 17: 0.805, 101: 1.791, 102: 0.707, 103: 0.746, 104: 0.707, 105: 1, 
    106: 0.707, 107: 1.967, 108: 1, 109: 0.707, 110: 1, 111: 1, 112: 1.6, 113: 1.6, 
    114: 1.6, 115: 1.6, 117: 0.945, 118: 0.8, 119: 1.967, 120: 1.802,
  };

  const getFallbackAR = (id: number) => {
    return REAL_ASPECT_RATIOS[id] || 1.77;
  };

  const shuffledModalItems = useMemo(() => {
    const items: any[] = [
      ...galleryItems,
      { id: 101, title: 'TB 2', category: 'Concept', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/tb2.jpg' },
      { id: 102, title: 'Outfit 4', category: 'Character', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/换装2.jpg' },
      { id: 103, title: 'Baseball 3', category: 'Photography', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/baseball3.jpg' },
      { id: 104, title: 'Baseball 5', category: 'Photography', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/baseball5.jpg' },
      { id: 105, title: 'Apple TV 1', category: 'Design', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/apple-tv.jpg' },
      { id: 106, title: 'Baseball 6', category: 'Photography', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/baseball6.jpg' },
      { id: 107, title: 'Car 7', category: 'Render', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/car7.jpg' },
      { id: 108, title: 'Demon', category: 'Render', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/demon.jpg' },
      { id: 109, title: 'Car 8', category: 'Render', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/car8.jpg' },
      { id: 110, title: 'Girl 1', category: 'Character', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/girl1.jpg' },
      { id: 111, title: 'Car 9', category: 'Render', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/ip4.jpg' },
      { id: 112, title: 'IP 2', category: 'Brand', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/ip5.jpg' },
      { id: 113, title: 'IP 3', category: 'Brand', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/ks1.jpg' },
      { id: 114, title: 'IP 5', category: 'Brand', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/tinny1.jpg' },
      { id: 115, title: 'IP 4', category: 'Brand', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/baseball人物-KV.jpg' },
      { id: 117, title: 'Girl 2', category: 'Character', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/夏日kv-拷贝.jpg' },
      { id: 118, title: 'COVER', category: 'Design', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/tb1.jpg' },
      { id: 119, title: 'Car 1', category: 'Render', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/car6.jpg' },
      { id: 120, title: 'Summer KV', category: 'Poster', img: 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/夏日kv-拷贝.jpg' },
    ];

    // We no longer shuffle the items to preserve original waterfall order,
    // followed by the extra items that only appear in the modal.

    // Remove the item duplicate (id 119 => id 5) explicitly instead of popping since shape matters.
    // Also remove id 120 as it is a duplicate of 117
    const filteredItems = items.filter(item => item.id !== 119 && item.id !== 120);

    return filteredItems;
  }, []);

  useEffect(() => {
    // Preload modal images so they appear instantly when the modal is opened
    shuffledModalItems.forEach((item) => {
      if (item.img) {
        const img = new Image();
        img.src = item.img;
      }
    });
  }, [shuffledModalItems]);

  // Use a stable fallback aspect ratio for the structural math grouping.
  const stableItemARs = shuffledModalItems.map(item => dynamicARs[item.id] || getFallbackAR(item.id));
  const totalStableAR = stableItemARs.reduce((sum, ar) => sum + ar, 0);

  // Target row aspect ratio sum (e.g. 5 means the row is 5x wider than it is tall)
  const targetRowAR = isMobile ? 1.8 : 5.0; 
  const optimalRowCount = Math.max(1, Math.round(totalStableAR / targetRowAR));
  const optimalTargetAR = totalStableAR / optimalRowCount;

  const modalRows: any[][] = [];
  let currentRow: any[] = [];
  let currentAR = 0;

  shuffledModalItems.forEach((item, index) => {
    currentRow.push(item);
    currentAR += stableItemARs[index];
    
    // Wrap row if we cross our mathematically balanced target threshold.
    // Subtracting a fraction of the current item's AR acts as a 'closest fit' rounding mechanism.
    if (currentAR >= optimalTargetAR - (stableItemARs[index] * 0.4) && modalRows.length < optimalRowCount - 1) {
      modalRows.push([...currentRow]);
      currentRow = [];
      currentAR = 0;
    }
  });

  // Push the final exact row remainder, which will naturally balance itself
  if (currentRow.length > 0) {
    // If the last row is under-filled, pad it with a single "Upcoming" placeholder that takes up
    // the exact remaining mathematical flex ratio so that the existing images shrink correctly
    // and match the perfect horizontal track alignment.
    if (currentAR < optimalTargetAR - 0.5) {
      currentRow.push({
        id: 'upcoming-placeholder',
        title: 'Upcoming',
        category: 'New Frame',
        img: null,
        customAR: optimalTargetAR - currentAR
      });
    }
    modalRows.push([...currentRow]);
  }

  return (
    <>
      <section id="gallery" className="pt-12 pb-32 px-6 md:px-12 relative z-30">
        <div className="max-w-[1440px] mx-auto">
          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="flex flex-col space-y-2 md:space-y-4">
              <TextPressure 
                text="Gallery" 
                highlightWords={['Gallery', 'GALLERY']}
                className="tracking-tight text-white text-left"
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
            </div>
            <div className="max-w-xs md:max-w-sm text-white/80 text-base md:text-lg font-light tracking-wide leading-relaxed pb-0 text-right w-full md:w-auto self-end">
              A curated collection of visual experiments.
            </div>
          </div>

          <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-4 md:gap-6">
            {/* Row by row render */}
            {rows.map((row, rowIdx) => (
              <div 
                key={rowIdx} 
                className="w-full flex flex-row flex-nowrap items-start"
                style={{ gap: `${gapSize}px` }}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {row.map((item) => {
                  const globalIndex = galleryItems.indexOf(item);
                  const ar = dynamicARs[item.id] || getFallbackAR(item.id);

                  return (
                    <div
                      key={item.id}
                      className="relative overflow-hidden rounded-xl bg-[#111] border border-white/10 group cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(globalIndex)}
                      style={{
                        // Core Math Magic: By giving them flex-grow exactly equal to their ratio, 
                        // Flexbox divides the row exactly so their heights perfectly match each other!
                        flex: `${ar} 1 0%`,
                        aspectRatio: `${ar} / 1`, // Tie height strictly to width precisely matching the image
                      }}
                    >
                      <img 
                        src={item.img} 
                        alt={item.title}
                        decoding="async"
                        fetchPriority={rowIdx < 2 ? "high" : "auto"}
                        loading={rowIdx < 2 ? "eager" : "lazy"}
                        onLoad={(e) => {
                          const img = e.currentTarget;
                          if (img.naturalWidth && img.naturalHeight) {
                            setDynamicARs(prev => ({
                              ...prev,
                              [item.id]: img.naturalWidth / img.naturalHeight
                            }));
                          }
                        }}
                        // 0 cropping occurs because the container mathematically perfectly mimics the image's proportions
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform block"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-12 md:mt-20 flex justify-center w-full">
            <button 
              onClick={() => {
                setIsModalOpen(true);
              }}
              className="w-full md:w-auto px-10 py-4 bg-white/10 border border-white/20 rounded-full text-white uppercase tracking-widest text-sm font-medium transition-colors duration-300 hover:bg-white/20 active:bg-white active:text-black cursor-pointer"
            >
              View More
            </button>
          </div>
        </div>
      </section>

      {/* Full Screen Gallery Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ willChange: "opacity" }}
              className="absolute inset-0 bg-black/95"
              onClick={() => {
                setIsModalOpen(false);
              }}
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{ willChange: "transform, opacity" }}
              className="relative w-full h-full max-w-[1600px] bg-[#0a0a0a] rounded-[2rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 md:px-10 border-b border-white/10 shrink-0 bg-[#0a0a0a] z-10">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white uppercase">Complete Gallery</h2>
                  <p className="text-white/40 text-xs md:text-sm font-mono mt-1">ALL IMAGES & UPLOADS</p>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                  }}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white text-white hover:text-black transition-all duration-300"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-4 md:gap-6">
                  {modalRows.map((row, rowIdx) => (
                    <div 
                      key={`m-row-${rowIdx}`}
                      className="w-full flex flex-row flex-nowrap items-start"
                      style={{ gap: `${gapSize}px` }}
                    >
                      {row.map((item) => {
                        const ar = dynamicARs[item.id] || item.customAR || getFallbackAR(item.id);
                        return (
                          <div
                            key={item.id}
                            className={`relative overflow-hidden rounded-xl bg-[#111] border group cursor-pointer ${item.img ? 'border-white/10' : 'border-white/20 border-dashed hover:bg-white/10 flex flex-col items-center justify-center'}`}
                            style={{
                              flex: `${ar} 1 0%`,
                              aspectRatio: `${ar} / 1`,
                            }}
                          >
                            {item.img ? (
                              <>
                                <img 
                                  src={item.img} 
                                  alt={item.title} 
                                  loading="lazy"
                                  decoding="async"
                                  onLoad={(e) => {
                                    const img = e.currentTarget;
                                    if (img.naturalWidth && img.naturalHeight) {
                                      setDynamicARs(prev => ({
                                        ...prev,
                                        [item.id]: img.naturalWidth / img.naturalHeight
                                      }));
                                    }
                                  }}
                                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none transform-gpu" 
                                  referrerPolicy="no-referrer" 
                                />
                              </>
                            ) : (
                              <>
                                <svg className="w-8 h-8 text-white/20 mb-4 group-hover:text-white/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-white/30 group-hover:text-white/60 font-mono text-xs tracking-widest transition-colors">UPCOMING</span>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
