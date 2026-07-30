import { useEffect, useRef, useState } from 'react';

const FRAME_COUNT = 242;

export default function ScrollVideoDemo() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const imagesRef = useRef([]);
  const [loaded, setLoaded] = useState(false);

  // Preload Images
  useEffect(() => {
    let loadedCount = 0;
    const imgs = [];
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      // Pad to 4 digits: 0001, 0002, etc.
      const frameNum = i.toString().padStart(4, '0');
      img.src = `/frames/frame_${frameNum}.jpg`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === FRAME_COUNT) {
          setLoaded(true);
        }
      };
      imgs.push(img);
    }
    imagesRef.current = imgs;
  }, []);

  // Draw Initial Frame
  useEffect(() => {
    if (loaded && canvasRef.current && imagesRef.current.length > 0) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.drawImage(imagesRef.current[0], 0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [loaded]);

  // Handle Scroll to Frame calculation
  useEffect(() => {
    let animationFrameId;
    
    const handleScroll = () => {
      if (!containerRef.current || !canvasRef.current || !loaded) return;
      
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      
      const scrollHeight = container.offsetHeight - window.innerHeight;
      let rawProgress = -rect.top / scrollHeight;
      rawProgress = Math.max(0, Math.min(1, rawProgress));
      setProgress(rawProgress);
      
      // Calculate which frame to draw
      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.floor(rawProgress * FRAME_COUNT)
      );

      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        const ctx = canvasRef.current.getContext('2d');
        const img = imagesRef.current[frameIndex];
        if (img) {
          ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [loaded]);

  return (
    <div ref={containerRef} className="relative w-full h-[500vh] bg-[#030407] font-inter border-t border-b border-white/5">
      
      {/* Loading State Overlay */}
      {!loaded && (
        <div className="sticky top-0 left-0 w-full h-screen z-50 flex items-center justify-center bg-[#030407] text-white">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-blue-400 animate-spin"></div>
            <p className="text-sm tracking-widest uppercase text-white/50">Initializing Render Engine...</p>
          </div>
        </div>
      )}

      {/* STICKY CANVAS BACKGROUND */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden z-0 bg-black">
        <canvas 
          ref={canvasRef}
          width={1920}
          height={1080}
          className="w-full h-full object-cover opacity-80"
        />
        {/* Subtle vignette and dark overlay for premium text contrast */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        
        {/* Overlay to hide watermark */}
        <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-10 pointer-events-none">
          <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex items-start gap-4 min-w-[260px]">
             <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
               <div className="relative flex h-3 w-3">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
               </div>
             </div>
             <div>
               <h4 className="text-zinc-100 text-sm font-semibold tracking-wide mb-1.5 flex items-center gap-2">
                 EchoGaze Engine v2
               </h4>
               <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-medium leading-[1.6]">
                 Real-time Neural Sync <br />
                 Hardware Accelerated AAC
               </p>
             </div>
          </div>
        </div>
      </div>

      {/* CONTENT SECTIONS OVERLAY */}
      <div className="relative z-10 w-full h-full pointer-events-none">
        
        <div className="absolute top-[100vh] left-6 md:left-24 w-[90%] md:w-[45%] max-w-xl pointer-events-auto">
          <ContentBlock 
            progress={progress} 
            start={0.05} 
            end={0.3}
            title="Surgical Precision"
            text="Observe the hardware acceleration. The central 3D element renders perfectly synced to the scroll tick, never dropping a frame while this block slides in seamlessly."
            subtitle="01 - The Engine"
          />
        </div>

        <div className="absolute top-[250vh] right-6 md:right-24 w-[90%] md:w-[45%] max-w-xl pointer-events-auto">
          <ContentBlock 
            progress={progress} 
            start={0.4} 
            end={0.65}
            title="Flowing Textures"
            text="Notice the sophisticated glassmorphism effect. Instead of a simple opacity fade, these panels transition smoothly from a blurred state into absolute clarity."
            subtitle="02 - The Aesthetic"
            alignRight
          />
        </div>

        <div className="absolute top-[400vh] left-6 md:left-24 w-[90%] md:w-[45%] max-w-xl pointer-events-auto">
          <ContentBlock 
            progress={progress} 
            start={0.75} 
            end={0.95}
            title="Premium Experience"
            text="By mapping thousands of extracted image frames to the browser's scroll height, we completely bypass standard video decoding lag-resulting in an award-winning user experience."
            subtitle="03 - The Method"
          />
        </div>

      </div>
    </div>
  );
}

function ContentBlock({ progress, start, end, title, text, subtitle, alignRight = false }) {
  let opacity = 0;
  let translateY = 120;
  let blur = 24;

  if (progress >= start && progress <= start + 0.1) {
    const localProg = (progress - start) / 0.1;
    opacity = localProg;
    translateY = 120 * (1 - localProg);
    blur = 24 * (1 - localProg);
  } 
  else if (progress > start + 0.1 && progress < end - 0.1) {
    opacity = 1;
    translateY = 0;
    blur = 0;
  }
  else if (progress >= end - 0.1 && progress <= end) {
    const localProg = (progress - (end - 0.1)) / 0.1;
    opacity = 1 - localProg;
    translateY = -120 * localProg;
    blur = 24 * localProg;
  }

  return (
    <div 
      className={`relative overflow-hidden bg-white/[0.02] border border-white/5 backdrop-blur-2xl p-10 md:p-14 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] ${alignRight ? 'text-right' : 'text-left'}`}
      style={{ 
        opacity: opacity,
        transform: `translateY(${translateY}px)`,
        filter: `blur(${blur}px)`,
        willChange: 'opacity, transform, filter'
      }}
    >
      {/* Subtle inner top highlight */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      <h4 className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-blue-400 mb-6 font-medium">
        {subtitle}
      </h4>
      <h3 className="text-5xl sm:text-6xl text-white mb-6 leading-[1.1] tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
        {title}
      </h3>
      <p className="text-white/60 text-lg sm:text-xl leading-relaxed font-light">
        {text}
      </p>
    </div>
  );
}
