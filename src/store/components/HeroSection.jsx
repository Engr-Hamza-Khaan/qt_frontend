import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import StoreHeader from '../layout/StoreHeader';

const PLATFORMS = [
  {
    id: 'xbox',
    label: 'XBOX SERIES',
    name: 'Xbox Series X & S',
    image: '/Xbox Both.png',
    alt: 'Xbox Series X and Series S Consoles',
    activeColor: 'text-[#107c10]',
    glowColor: 'from-[#107c10]/40 via-[#107c10]/20 to-transparent',
    ambientGlow: 'bg-[#107c10]/30',
    shopLink: '/shop?categorySlug=consoles&search=xbox',
    sellLink: '/sell',
  },
  {
    id: 'playstation',
    label: 'PLAYSTATION',
    name: 'PlayStation 5 Slim',
    image: '/SLim.png',
    alt: 'PlayStation 5 Slim Console',
    activeColor: 'text-[#0070d1]',
    glowColor: 'from-[#0070d1]/45 via-[#0070d1]/25 to-transparent',
    ambientGlow: 'bg-[#0070d1]/35',
    shopLink: '/shop?categorySlug=consoles&search=playstation',
    sellLink: '/sell',
  },
  {
    id: 'nintendo',
    label: 'NINTENDO SWITCH',
    name: 'Nintendo Switch OLED',
    image: '/Nintendo PNG.png',
    alt: 'Nintendo Switch Console',
    activeColor: 'text-[#e60012]',
    glowColor: 'from-[#e60012]/45 via-[#e60012]/20 to-transparent',
    ambientGlow: 'bg-[#e60012]/35',
    shopLink: '/shop?categorySlug=consoles&search=nintendo',
    sellLink: '/sell',
  },
];

function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(1); // Default to PlayStation (index 1) as in page 1
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PLATFORMS.length);
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const currentPlatform = PLATFORMS[activeIndex];

  return (
    <section
      className="relative bg-[#050c38] text-white overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Dynamic Ambient Glow Behind Hero */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden transition-all duration-400" aria-hidden="true">
        {/* Dynamic platform ambient glow behind image on right */}
        <div
          className={`absolute top-1/4 right-5 sm:right-16 lg:right-28 w-[320px] h-[320px] sm:w-[460px] sm:h-[460px] lg:w-[620px] lg:h-[620px] rounded-full blur-[100px] sm:blur-[140px] transition-all duration-400 ${currentPlatform.ambientGlow}`}
        />
        {/* Top-left deep navy glow */}
        <div className="absolute -top-20 -left-20 w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] bg-blue-700/20 rounded-full blur-[120px]" />
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/15 via-transparent to-transparent" />
      </div>

      {/* Top Navigation Header (Embedded) */}
      <div className="relative z-50">
        <StoreHeader embedded />
      </div>

      {/* Main Hero Body */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 md:pt-14 pb-12 sm:pb-16 lg:pb-20">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-8 items-center min-h-[460px] sm:min-h-[520px] lg:min-h-[560px]">
          
          {/* Left Hero Content Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left z-20">
            
            {/* Pill Badge: • CERTIFIED • TESTED • READY TO SHIP */}
            <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#0a1548]/90 border border-blue-400/30 text-blue-100 text-[11px] sm:text-xs md:text-sm font-semibold tracking-wider mb-5 sm:mb-6 shadow-[0_0_20px_rgba(59,130,246,0.2)] backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <span className="tracking-widest">CERTIFIED</span>
              <span className="text-cyan-400 font-bold">•</span>
              <span className="tracking-widest">TESTED</span>
              <span className="text-cyan-400 font-bold">•</span>
              <span className="tracking-widest">READY TO SHIP</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-sans font-black tracking-tight uppercase leading-[0.95] text-[2.75rem] xs:text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] xl:text-[5.4rem] mb-4 sm:mb-5">
              <span className="block text-white">CONSOLE YOU</span>
              <span className="block text-white">WANT,</span>
              <span className="block hero-hollow-stroke">READY TO PLAY.</span>
            </h1>

            {/* Subtext description */}
            <p className="text-sm sm:text-base md:text-lg text-gray-300 font-normal leading-relaxed max-w-xl mb-7 sm:mb-9">
              Every console is inspected, stress-tested, and backed by a 90-day warranty before it reaches your door. Trade in your old gear anytime.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
              <Link
                to={currentPlatform.shopLink}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white hover:bg-gray-100 text-[#050c38] font-bold text-xs sm:text-sm md:text-base rounded-xl transition-all shadow-[0_4px_25px_rgba(255,255,255,0.25)] hover:shadow-[0_4px_30px_rgba(255,255,255,0.4)] active:scale-95"
              >
                <span>Shop Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to={currentPlatform.sellLink}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 bg-[#0a1548]/80 hover:bg-[#102066] border border-white/80 hover:border-white text-white font-bold text-xs sm:text-sm md:text-base rounded-xl transition-all shadow-[0_4px_20px_rgba(0,0,0,0.4)] active:scale-95"
              >
                Sell Your Console
              </Link>
            </div>
          </div>

          {/* Right Hero Visual Showcase Column (5 cols) */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[480px]">
            {PLATFORMS.map((platform, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={platform.id}
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out ${
                    isActive
                      ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto z-20'
                      : 'opacity-0 scale-95 translate-y-3 pointer-events-none z-10'
                  }`}
                >
                  <div className="relative w-full max-w-[340px] xs:max-w-[400px] sm:max-w-[480px] lg:max-w-[560px] animate-float">
                    <img
                      src={platform.image}
                      alt={platform.alt}
                      className="w-full h-auto max-h-[380px] sm:max-h-[460px] lg:max-h-[500px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)] filter brightness-105"
                      loading={idx === 1 ? 'eager' : 'lazy'}
                    />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Bottom Platform Switcher Bar (Crisp White Strip) */}
      <div className="relative z-30 w-full bg-white border-t border-slate-200 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 md:py-5">
          <div className="flex items-center justify-around sm:justify-between gap-2 sm:gap-6">
            {PLATFORMS.map((platform, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className="group flex-1 text-center py-2 px-1 sm:px-4 focus:outline-none transition-all duration-200"
                  aria-label={`Show ${platform.name}`}
                  aria-pressed={isActive}
                >
                  <span
                    className={`block font-outfit sm:font-display font-black text-sm xs:text-base sm:text-2xl md:text-3xl lg:text-[2rem] tracking-wider uppercase transition-all duration-200 ${
                      isActive
                        ? `${platform.activeColor} scale-105 drop-shadow-sm`
                        : 'text-[#050c38] opacity-90 hover:opacity-100 hover:scale-[1.02]'
                    }`}
                  >
                    {platform.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
