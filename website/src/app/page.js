'use client';

import { useEffect, useRef, useState } from 'react';
import { Eye, LayoutGrid, MousePointerClick, AlertTriangle, Cpu, Wifi, Cloud, LayoutDashboard, Check, X, ArrowRight, Star, Coffee, Heart } from 'lucide-react';
import ScrollVideoDemo from '@/components/ScrollVideoDemo';

const BG_IMAGE_1 = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260713_140344_79e1296a-86d7-43fd-9b5f-63ffe560f291.png&w=1280&q=85";
const FRONT_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260713_162101_0d7498c5-29bb-47bf-a99f-2773c0a880a9.mp4";
const OVERLAY_IMAGE = "https://soft-zoom-63098134.figma.site/_assets/v11/3f10f1876e118f72a396e05a6c2d099569478272.png";

const Logo = () => (
  <svg viewBox="0 0 256 256" className="w-[28px] h-[28px] fill-white">
    <path d="M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z" />
  </svg>
);

const MobileMenu = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const items = ["Device", "Features", "Architecture", "Compare", "Source"];

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setMounted(false), 500);
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen && !mounted) return null;

  return (
    <div className={`fixed inset-0 z-[55] bg-[#05050A] transition-opacity duration-500 flex flex-col items-center justify-center ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <button onClick={onClose} className={`absolute top-6 right-6 w-12 h-12 rounded-full liquid-glass flex items-center justify-center transition-all duration-500 delay-100 ${isOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-75 opacity-0'}`}>
        <div className="relative w-5 h-5">
          <div className="absolute inset-0 m-auto w-5 h-[1.5px] bg-white rotate-45"></div>
          <div className="absolute inset-0 m-auto w-5 h-[1.5px] bg-white -rotate-45"></div>
        </div>
      </button>

      <div className="flex flex-col items-center gap-10">
        {items.map((item, i) => (
          <a key={item} href={`#${item.toLowerCase()}`} onClick={onClose} className="text-white/80 hover:text-white text-3xl sm:text-5xl font-medium transition-all duration-700 ease-[cubic-bezier(0.77,0,0.18,1)]"
            style={{ opacity: isOpen ? 1 : 0, transform: isOpen ? 'translateY(0)' : 'translateY(40px)', transitionDelay: `${100 + (i * 60)}ms`, fontFamily: "'Instrument Serif', serif" }}>
            {item}
          </a>
        ))}
        
        <button className="liquid-glass rounded-full px-8 py-4 flex items-center gap-3 mt-8 transition-all duration-700 ease-[cubic-bezier(0.77,0,0.18,1)] hover:bg-white/10"
           style={{ opacity: isOpen ? 1 : 0, transform: isOpen ? 'translateY(0)' : 'translateY(40px)', transitionDelay: `${100 + (items.length * 60)}ms` }}>
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse-glow"></div>
          <span className="text-white text-sm font-medium tracking-wide uppercase">Dashboard</span>
        </button>
      </div>
    </div>
  );
};

// Premium Staggered Text Reveal
const RevealText = ({ text, delay = 0, className = "", as: Component = "div" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -100px 0px" });
    
    if (domRef.current) observer.observe(domRef.current);
    return () => domRef.current && observer.disconnect();
  }, []);

  const words = text.split(" ");

  return (
    <Component ref={domRef} className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-flex overflow-hidden py-4 px-4 -my-4 -mx-4 mr-2 md:mr-3 lg:mr-4">
          <span
            className={`inline-block transition-all duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-blue-400 hover:scale-[1.03] hover:-translate-y-1 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
            style={{ transitionDelay: `${delay + (i * 60)}ms` }}
          >
            {word}
          </span>
        </span>
      ))}
    </Component>
  );
};

// Intersection Observer Fade In component
const FadeIn = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -100px 0px" });
    
    if (domRef.current) observer.observe(domRef.current);
    return () => domRef.current && observer.disconnect();
  }, []);

  return (
    <div ref={domRef} className={`transition-all duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

// Premium Card with Mouse-Tracking Glow
const PremiumCard = ({ children, className = "", delay = 0 }) => {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entries[0].target);
      }
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    
    if (cardRef.current) observer.observe(cardRef.current);
    return () => cardRef.current && observer.disconnect();
  }, []);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden bg-zinc-950 border border-zinc-800 rounded-2xl transition-all duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Subtle Mouse Tracking Highlight */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'radial-gradient(400px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(255, 255, 255, 0.03), transparent 40%)'
        }}
      />
      
      {/* Content wrapper */}
      <div className="relative z-10 p-8 md:p-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};

const Header = () => {
  const [stars, setStars] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    fetch("https://api.github.com/repos/John-Varghese-EH/MyStic-Squad_Amit-Kumar")
      .then((res) => res.json())
      .then((data) => {
        if (data.stargazers_count !== undefined) setStars(data.stargazers_count);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between pointer-events-none transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="flex items-center gap-2 pointer-events-auto bg-black/40 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/10 shadow-lg">
        <a href="#" className="flex items-center gap-2 font-bold text-base md:text-lg tracking-tight text-white">
          <Logo />
          <span style={{ fontFamily: "'Instrument Serif', serif" }} className="tracking-wide text-xl mt-1">EchoGaze</span>
        </a>
      </div>
      <div className="pointer-events-auto flex items-center gap-2 md:gap-3">
        <div className="hidden md:flex items-center gap-3 md:gap-4 px-3 md:px-4 h-10 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium">
          {["Features", "Architecture", "Compare", "Source"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-white/60 hover:text-white transition-colors uppercase tracking-widest text-[10px]">
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3 md:gap-4 px-3 md:px-4 h-10 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium">
          <a href="/dashboard" className="text-white/60 hover:text-white transition-colors flex items-center gap-2">
            <span className="uppercase tracking-widest text-[10px]">Dashboard</span>
          </a>
          <a href="https://github.com/John-Varghese-EH/MyStic-Squad_Amit-Kumar" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors flex items-center gap-2 group">
            <svg className="w-4 h-4 fill-current hidden sm:block" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
            <span className="flex items-center gap-1 text-xs font-semibold">
              <Star className="w-3.5 h-3.5 sm:w-3 sm:h-3 fill-current group-hover:text-yellow-500 transition-colors" />
              <span>{stars !== null ? stars : "Star"}</span>
            </span>
            <span className="hidden sm:inline w-[1px] h-3 bg-white/20"></span>
            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">Star us</span>
          </a>
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="w-full pt-16 pb-10 md:pb-20 px-6 md:px-12 bg-[#030407] border-t border-white/10 relative overflow-hidden mt-10">
    {/* Ambient Background Glow */}
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-blue-500/10 blur-[120px] pointer-events-none" />

    <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-12 gap-x-8 gap-y-12 relative z-10">
      
      {/* Brand & Bio */}
      <div className="space-y-6 col-span-2 sm:col-span-4 md:col-span-5 lg:col-span-4">
        <h4 className="text-5xl tracking-tight text-white mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>EchoGaze.</h4>
        <p className="text-white/50 leading-relaxed font-light">
          Restoring a voice to the silent. An open-source, sub-$30 AAC solution using standard micro-movements.
        </p>
        <div className="pt-4">
          <div className="inline-flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg text-sm text-zinc-400">
            <span>Built by</span>
            <div className="w-[1px] h-3 bg-zinc-700"></div>
            <span className="font-medium text-zinc-100">MyStic-Squad</span>
          </div>
        </div>
      </div>
      
      {/* Resources */}
      <div className="space-y-4 col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 md:col-start-7 lg:col-start-6">
        <h4 className="font-bold text-white tracking-tight">Resources</h4>
        <ul className="space-y-3">
          <li><a href="https://github.com/John-Varghese-EH/MyStic-Squad_Amit-Kumar" className="hover:text-white text-white/50 transition-colors text-sm font-medium">GitHub Repository</a></li>
          <li><a href="/dashboard" className="hover:text-white text-white/50 transition-colors text-sm font-medium">Live Dashboard</a></li>
        </ul>
      </div>
      
      {/* Legal */}
      <div className="space-y-4 col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2">
        <h4 className="font-bold text-white tracking-tight">Legal</h4>
        <ul className="space-y-3">
          <li><a href="#" className="hover:text-white text-white/50 transition-colors text-sm font-medium">Privacy Policy</a></li>
          <li><a href="#" className="hover:text-white text-white/50 transition-colors text-sm font-medium">Terms of Service</a></li>
        </ul>
      </div>

      {/* Support CTA */}
      <div className="space-y-4 col-span-2 sm:col-span-4 md:col-span-4 lg:col-span-3 lg:col-start-10 mt-6 md:mt-0">
        <h4 className="font-bold text-white tracking-tight flex items-center gap-2">
          <Coffee className="w-5 h-5 text-amber-500" />
          Support EchoGaze
        </h4>
        <p className="text-sm text-white/50 leading-relaxed mb-4 font-light">
          If this open-source accessibility tech made an impact, please consider supporting. It truly keeps the dream alive! 🙏
        </p>
        <div className="space-y-3">
          <a href="https://buymeacoffee.com/johnvarghese" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-[#FFDD00] text-black font-bold rounded-xl hover:bg-[#FFDD00]/90 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#FFDD00]/10 border border-[#FFDD00]/50">
            <Coffee className="w-5 h-5 fill-current" />
            Buy me a coffee
          </a>
          <div className="grid grid-cols-3 gap-2">
            <a href="https://patreon.com/johnvarghese" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center py-2 px-1 bg-[#FF424D] text-white font-medium rounded-lg hover:bg-[#FF424D]/90 transition-all hover:scale-[1.02] active:scale-95 text-[11px] sm:text-xs border border-[#FF424D]/50">
              Patreon
            </a>
            <a href="https://github.com/sponsors/John-Varghese-EH" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center py-2 px-1 bg-white text-black font-medium rounded-lg hover:opacity-90 transition-all hover:scale-[1.02] active:scale-95 text-[11px] sm:text-xs border border-white/50">
              GitHub
            </a>
            <a href="upi://pay?pa=johnvarghese@noxpay" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center py-2 px-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:opacity-90 transition-all hover:scale-[1.02] active:scale-95 text-[11px] sm:text-xs border border-blue-500/50">
              NoxPay
            </a>
          </div>
        </div>
      </div>
    </div>
    
    {/* Copyright */}
    <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
      <div>&copy; {new Date().getFullYear()} EchoGaze. All rights reserved.</div>
      <div className="flex items-center gap-1.5">
        Licensed under <span className="font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded text-xs text-white/60">MIT</span>
      </div>
    </div>
  </footer>
);

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const videoWrapperRef = useRef(null);
  const targetCursor = useRef({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
  const smoothCursor = useRef({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
  const maskUrl = useRef(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const r = 260;
    canvas.width = r * 2;
    canvas.height = r * 2;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
      gradient.addColorStop(0, 'rgba(0,0,0,1)');
      gradient.addColorStop(0.4, 'rgba(0,0,0,1)');
      gradient.addColorStop(0.6, 'rgba(0,0,0,0.75)');
      gradient.addColorStop(0.75, 'rgba(0,0,0,0.4)');
      gradient.addColorStop(0.88, 'rgba(0,0,0,0.12)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, r * 2, r * 2);
      maskUrl.current = canvas.toDataURL();
      
      if (videoWrapperRef.current) {
        videoWrapperRef.current.style.webkitMaskImage = `url(${maskUrl.current})`;
        videoWrapperRef.current.style.maskImage = `url(${maskUrl.current})`;
        videoWrapperRef.current.style.webkitMaskRepeat = 'no-repeat';
        videoWrapperRef.current.style.maskRepeat = 'no-repeat';
        videoWrapperRef.current.style.webkitMaskSize = `${r * 2}px ${r * 2}px`;
        videoWrapperRef.current.style.maskSize = `${r * 2}px ${r * 2}px`;
      }
    }
  }, []);

  useEffect(() => {
    let animationFrameId;
    const render = () => {
      smoothCursor.current.x += (targetCursor.current.x - smoothCursor.current.x) * 0.1;
      smoothCursor.current.y += (targetCursor.current.y - smoothCursor.current.y) * 0.1;
      
      if (gridRef.current && heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const offsetX = ((smoothCursor.current.x - centerX) / centerX) * 16;
        const offsetY = ((smoothCursor.current.y - centerY) / centerY) * 16;
        gridRef.current.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      }
      
      if (videoWrapperRef.current && maskUrl.current) {
        const r = 260;
        const x = smoothCursor.current.x - r;
        const y = smoothCursor.current.y - r;
        videoWrapperRef.current.style.webkitMaskPosition = `${x}px ${y}px`;
        videoWrapperRef.current.style.maskPosition = `${x}px ${y}px`;
      }
      
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleHeroMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    targetCursor.current.x = e.clientX - rect.left;
    targetCursor.current.y = e.clientY - rect.top;
  };

  return (
    <div className="relative w-full min-h-screen bg-black text-zinc-100 font-inter">
      
      <Header />

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* HERO SECTION */}
      <section 
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        className="relative w-full h-[100svh] font-helvetica-neue bg-black overflow-hidden"
      >
        <div className="absolute inset-[-50px] z-0 opacity-[0.03] pointer-events-none">
          <div ref={gridRef} className="w-full h-full">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#fff" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        <div className="absolute inset-0 z-10 bg-center bg-cover bg-no-repeat pointer-events-none" style={{ backgroundImage: `url(${BG_IMAGE_1})` }} />

        <div className="absolute inset-x-0 z-20 flex flex-col items-center justify-center pointer-events-none h-full mt-[-5%]">
          <h1 className="text-white text-center leading-[0.8] text-[5rem] xs:text-[6.5rem] sm:text-[11rem] md:text-[14rem] lg:text-[18rem] tracking-[-0.03em]" style={{ fontFamily: "'Instrument Serif', serif" }}>
            EchoGaze
          </h1>
          <p className="text-white/50 mt-10 text-lg md:text-2xl font-light tracking-widest uppercase max-w-2xl text-center px-4">
            Restoring a voice to the silent.
          </p>
        </div>

        <img src={OVERLAY_IMAGE} alt="" className="absolute inset-0 z-25 w-full h-full object-cover pointer-events-none" />

        <div ref={videoWrapperRef} className="absolute inset-0 z-30 pointer-events-none" style={{ clipPath: 'inset(40% 0 0 0)' }}>
          <video src={FRONT_VIDEO} className="w-full h-full object-cover" autoPlay loop muted playsInline />
          
          {/* Overlay to hide watermark */}
          <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-40 pointer-events-auto shadow-xl">
            <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex items-start gap-4 min-w-[260px]">
               <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                 <div className="relative flex h-3 w-3">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                 </div>
               </div>
               <div>
                 <h4 className="text-zinc-100 text-sm font-semibold tracking-wide mb-1.5 flex items-center gap-2">
                   EchoGaze AAC View
                 </h4>
                 <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-medium leading-[1.6]">
                   Real-time Physics <br />
                   Hardware Accelerated
                 </p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3D SCROLL VIDEO SECTION */}
      <ScrollVideoDemo />

      {/* CONTENT SECTIONS */}
      <div className="relative z-40 py-40 md:py-56 px-6 md:px-12 lg:px-24 max-w-screen-2xl mx-auto">
        
        {/* The Problem / Mission */}
        <section className="max-w-5xl mx-auto text-center mb-40 md:mb-56">
          <RevealText 
            text="Closing the ₹8 Lakh Silence Gap." 
            as="h2" 
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-medium mb-12 leading-[1.1] tracking-[-0.02em]" 
            style={{ fontFamily: "'Instrument Serif', serif" }} 
          />
          <FadeIn delay={400}>
            <p className="text-white/60 text-xl md:text-3xl leading-[1.6] font-light max-w-4xl mx-auto">
              Current medical-grade eye-tracking devices sit at an exorbitant <span className="text-white/90">₹8,00,000+ price point</span>, requiring complex daily calibration.<br className="hidden md:block"/><br className="hidden md:block"/>
              We engineered a hyper-accessible, open-source alternative using an ESP32 and a single infrared sensor. <span className="text-blue-400 font-medium">Total cost: ₹500.</span>
            </p>
          </FadeIn>
        </section>

        {/* Premium Bento Grid - Core Features */}
        <section id="features" className="mb-40 md:mb-56">
          <FadeIn>
            <h3 className="text-xs uppercase tracking-[0.2em] text-white/50 mb-12 ml-4">01 - Core Engineering</h3>
          </FadeIn>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            
            <PremiumCard delay={100} className="lg:col-span-2 min-h-[400px]">
              <div className="w-12 h-12 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center mb-auto">
                <Eye className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="mt-16">
                <h4 className="text-3xl md:text-5xl font-medium mb-6 tracking-tight text-white/90" style={{ fontFamily: "'Instrument Serif', serif" }}>Non-Invasive IR Motion</h4>
                <p className="text-white/50 text-lg leading-relaxed max-w-xl font-light">
                  Zero physical force, zero skin contact. Mounted on eyeglasses or near a functional limb; detects minute changes in infrared reflectance to register micro-movements seamlessly.
                </p>
              </div>
            </PremiumCard>

            <PremiumCard delay={200} className="min-h-[400px]">
              <div className="w-12 h-12 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center mb-auto">
                <AlertTriangle className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="mt-16">
                <h4 className="text-3xl font-medium mb-4 tracking-tight text-white/90" style={{ fontFamily: "'Instrument Serif', serif" }}>Hardware SOS</h4>
                <p className="text-white/50 leading-relaxed font-light">
                  Safety is paramount. 4 rapid triggers bypass all software logic, sounding an immediate local alarm and pushing a red-alert to the Caregiver Dashboard.
                </p>
              </div>
            </PremiumCard>

            <PremiumCard delay={300} className="min-h-[350px]">
              <div className="w-12 h-12 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center mb-auto">
                <LayoutGrid className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="mt-16">
                <h4 className="text-3xl font-medium mb-4 tracking-tight text-white/90" style={{ fontFamily: "'Instrument Serif', serif" }}>12-Item Command Grid</h4>
                <p className="text-white/50 leading-relaxed font-light">
                  Designed for zero cognitive overload. Auto-cycles columns, allowing patients to zoom in on specific requests effortlessly.
                </p>
              </div>
            </PremiumCard>

            <PremiumCard delay={400} className="lg:col-span-2 min-h-[350px]">
              <div className="w-12 h-12 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center mb-auto">
                <MousePointerClick className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="mt-16">
                <h4 className="text-3xl md:text-5xl font-medium mb-6 tracking-tight text-white/90" style={{ fontFamily: "'Instrument Serif', serif" }}>The 1-Switch Control</h4>
                <p className="text-white/50 text-lg leading-relaxed max-w-xl font-light">
                  No complex keyboards. Three logical commands mapped to a single sensor: Tap to move, Hold (&gt;800ms) to select, and Double-Tap to step back.
                </p>
              </div>
            </PremiumCard>

          </div>
        </section>

        {/* System Architecture */}
        <section id="architecture" className="mb-40 md:mb-56">
          <FadeIn>
            <h3 className="text-xs uppercase tracking-[0.2em] text-white/50 mb-12 ml-4 text-center md:text-left">02 - The Ecosystem</h3>
          </FadeIn>
          
          <div className="relative py-12">
            {/* Glowing SVG Pipeline */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -translate-y-1/2 hidden lg:block overflow-hidden rounded-full">
              <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-traveling-pulse"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
              {[
                { icon: Eye, title: "Physical Layer", desc: "IR sensor detects a muscle twitch or blink." },
                { icon: Cpu, title: "Edge Processing", desc: "ESP32 debounces signal and runs state machine." },
                { icon: Cloud, title: "Cloud WebSocket", desc: "JSON payloads fire at sub-500ms latency." },
                { icon: LayoutDashboard, title: "Caregiver UI", desc: "React dashboard alerts staff instantly." }
              ].map((step, i) => (
                <FadeIn key={i} delay={i * 150} className="bg-zinc-950 border border-zinc-800 p-8 rounded-2xl flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                    <step.icon className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
                  </div>
                  <h5 className="text-lg font-medium mb-2 text-zinc-100">{step.title}</h5>
                  <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section id="compare" className="max-w-4xl mx-auto mb-40">
          <FadeIn>
            <h3 className="text-xs uppercase tracking-[0.2em] text-white/50 mb-16 text-center">03 - Competitive Advantage</h3>
          </FadeIn>
          
          <FadeIn delay={200} className="border border-zinc-800 rounded-2xl bg-zinc-950 p-8 md:p-12 relative overflow-hidden">
             <div className="flex justify-between border-b border-zinc-800 pb-4 mb-6 px-4">
                <div className="w-1/3 text-xs text-zinc-500 font-medium">Feature</div>
                <div className="w-1/3 text-xs text-zinc-500 font-medium text-center">Traditional AAC</div>
                <div className="w-1/3 text-xs text-zinc-300 font-medium text-right">EchoGaze</div>
             </div>

             {[
                { name: "Cost", trad: "₹2,50,000+", echo: "Under ₹500", highlight: true },
                { name: "Input Method", trad: "Eye-tracking", echo: "IR micro-movement" },
                { name: "Calibration", trad: "Daily setup required", echo: "Plug-and-play" },
                { name: "Ecosystem", trad: "Closed, Proprietary", echo: "Open Source", highlight: true }
             ].map((row, i) => (
                <div key={i} className="flex justify-between items-center py-4 px-4 hover:bg-zinc-900 rounded-xl transition-colors">
                  <div className="w-1/3 text-sm md:text-base font-medium text-zinc-200">{row.name}</div>
                  <div className="w-1/3 text-sm text-zinc-500 text-center">{row.trad}</div>
                  <div className={`w-1/3 text-right flex items-center justify-end gap-2 text-sm ${row.highlight ? 'text-zinc-100 font-medium' : 'text-zinc-400'}`}>
                    {row.highlight && <Check className="w-4 h-4 text-zinc-400" />}
                    <span>{row.echo}</span>
                  </div>
                </div>
             ))}
          </FadeIn>
        </section>

      </div>
      
      {/* Premium CTA */}
      <section id="source" className="relative border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.05),transparent_50%)]"></div>
        <div className="relative max-w-4xl mx-auto text-center px-6 py-40 md:py-56">
          <RevealText 
            text="Built to close the gap." 
            as="h2" 
            className="text-5xl md:text-7xl lg:text-[6rem] font-medium mb-12 tracking-[-0.02em]" 
            style={{ fontFamily: "'Instrument Serif', serif" }} 
          />
          <FadeIn delay={400}>
            <p className="text-white/40 text-xl md:text-2xl mb-16 max-w-2xl mx-auto font-light leading-relaxed">
              The full hardware schematics, C++ firmware, and dashboard source code are published open-source. Assistive tech should not be gated behind lakh-rupee licensing.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/dashboard" className="bg-zinc-100 text-zinc-900 rounded-lg px-8 py-3.5 flex items-center gap-2 hover:bg-white transition-colors w-full sm:w-auto justify-center font-medium">
                <span>View Live Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a href="https://github.com/John-Varghese-EH/MyStic-Squad_Amit-Kumar" target="_blank" rel="noreferrer" className="bg-zinc-900 border border-zinc-800 rounded-lg px-8 py-3.5 flex items-center gap-2 hover:bg-zinc-800 transition-colors w-full sm:w-auto justify-center text-zinc-300 font-medium">
                <span>GitHub Repository</span>
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
