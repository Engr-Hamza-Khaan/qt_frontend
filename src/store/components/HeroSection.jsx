import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import StoreHeader from '../layout/StoreHeader';

const DEFAULT_PLATFORMS = [
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

const DEFAULT_SLIDES = [
  {
    id: 'slide-1',
    badge: '• CERTIFIED • TESTED • READY TO SHIP',
    headline1: 'NEXT-GEN',
    headline2: 'PLAYSTATION 5,',
    headlineHollow: 'READY TO PLAY.',
    subtitle: 'Every console is inspected, stress-tested, and backed by a 90-day warranty before it reaches your door. Trade in your old gear anytime.',
    primaryBtnText: 'Shop PS5 Consoles',
    primaryBtnLink: '/shop?categorySlug=consoles&search=playstation',
    secondaryBtnText: 'Sell Your Console',
    secondaryBtnLink: '/sell',
    image: '/SLim.png',
    alt: 'PlayStation 5 Slim Console',
    activeColor: 'text-[#0070d1]',
    glowColor: 'from-[#0070d1]/45 via-[#0070d1]/25 to-transparent',
    ambientGlow: 'bg-[#0070d1]/35',
  },
  {
    id: 'slide-2',
    badge: '• POWER YOUR DREAMS • 4K GAMING',
    headline1: 'XBOX SERIES X|S',
    headline2: 'NEXT-LEVEL SPEED,',
    headlineHollow: 'UNBEATABLE VALUE.',
    subtitle: 'Experience true 4K gaming and lightning fast load times with pre-owned and brand-new Xbox Series consoles with full warranty.',
    primaryBtnText: 'Shop Xbox Series',
    primaryBtnLink: '/shop?categorySlug=consoles&search=xbox',
    secondaryBtnText: 'Trade-In & Upgrade',
    secondaryBtnLink: '/sell',
    image: '/Xbox Both.png',
    alt: 'Xbox Series X and Series S Consoles',
    activeColor: 'text-[#107c10]',
    glowColor: 'from-[#107c10]/40 via-[#107c10]/20 to-transparent',
    ambientGlow: 'bg-[#107c10]/30',
  },
  {
    id: 'slide-3',
    badge: '• HYBRID GAMING • VIBRANT OLED',
    headline1: 'NINTENDO SWITCH',
    headline2: 'PLAY ANYWHERE,',
    headlineHollow: 'ANYTIME WITH FRIENDS.',
    subtitle: 'Vibrant 7-inch OLED screen and portable fun for everyone. Check out our certified handheld consoles and games catalog.',
    primaryBtnText: 'Shop Nintendo Switch',
    primaryBtnLink: '/shop?categorySlug=consoles&search=nintendo',
    secondaryBtnText: 'Browse Games',
    secondaryBtnLink: '/shop?categorySlug=games',
    image: '/Nintendo PNG.png',
    alt: 'Nintendo Switch Console',
    activeColor: 'text-[#e60012]',
    glowColor: 'from-[#e60012]/45 via-[#e60012]/20 to-transparent',
    ambientGlow: 'bg-[#e60012]/35',
  },
];

function HeroSection({ heroConfig = {} }) {
  const useStandardSlider = Boolean(heroConfig?.useStandardSlider);

  // ==========================================
  // 1. STANDARD SLIDER (CAROUSEL) MODE
  // ==========================================
  if (useStandardSlider) {
    const sliderConfig = heroConfig?.sliderConfig || {};
    const slides = (Array.isArray(sliderConfig?.slides) && sliderConfig.slides.length > 0)
      ? sliderConfig.slides
      : DEFAULT_SLIDES;

    const autoplay = sliderConfig?.autoplay !== false;
    const autoplayInterval = Math.max(2000, Number(sliderConfig?.autoplayInterval) || 5000);
    const showArrows = sliderConfig?.showArrows !== false;
    const showDots = sliderConfig?.showDots !== false;

    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const touchStartX = useRef(null);
    const timerRef = useRef(null);

    // Ensure valid index if slides change
    useEffect(() => {
      if (currentSlide >= slides.length) {
        setCurrentSlide(0);
      }
    }, [slides.length, currentSlide]);

    // Autoplay timer
    useEffect(() => {
      if (!autoplay || isPaused || slides.length <= 1) return;

      timerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, autoplayInterval);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, [autoplay, isPaused, slides.length, autoplayInterval]);

    const handlePrev = () => {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const handleNext = () => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    // Touch handlers for mobile swipe
    const handleTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      if (touchStartX.current === null) return;
      const touchEndX = e.changedTouches[0].clientX;
      const diffX = touchStartX.current - touchEndX;
      if (Math.abs(diffX) > 40) {
        if (diffX > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
      touchStartX.current = null;
    };

    const activeSlide = slides[currentSlide] || slides[0] || DEFAULT_SLIDES[0];

    return (
      <section
        className="relative bg-[#050c38] text-white overflow-hidden select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-roledescription="carousel"
        aria-label="Homepage Hero Slider"
      >
        {/* Dynamic Ambient Glow Behind Hero matching current slide */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden transition-all duration-700" aria-hidden="true">
          <div
            className={`absolute top-1/4 right-5 sm:right-16 lg:right-28 w-[320px] h-[320px] sm:w-[460px] sm:h-[460px] lg:w-[620px] lg:h-[620px] rounded-full blur-[100px] sm:blur-[140px] transition-all duration-700 ${
              activeSlide.ambientGlow || 'bg-blue-600/30'
            }`}
          />
          <div className="absolute -top-20 -left-20 w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] bg-blue-700/20 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        </div>

        {/* Top Navigation Header (Embedded) */}
        <div className="relative z-50">
          <StoreHeader embedded />
        </div>

        {/* Main Hero Slider Body */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 md:pt-14 pb-16 sm:pb-20 lg:pb-24">
          <div className="relative min-h-[460px] sm:min-h-[520px] lg:min-h-[560px] flex items-center">
            {slides.map((slide, idx) => {
              const isActive = idx === currentSlide;
              return (
                <div
                  key={slide.id || idx}
                  className={`w-full grid lg:grid-cols-12 gap-8 lg:gap-8 items-center transition-all duration-500 ease-out ${
                    isActive
                      ? 'opacity-100 translate-x-0 pointer-events-auto relative z-20'
                      : 'opacity-0 absolute inset-0 pointer-events-none z-10 translate-x-8'
                  }`}
                  aria-hidden={!isActive}
                >
                  {/* Left Slide Content Column (7 cols) */}
                  <div className="lg:col-span-7 flex flex-col items-start text-left z-20">
                    {/* Pill Badge */}
                    {slide.badge && (
                      <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#0a1548]/90 border border-blue-400/30 text-blue-100 text-[11px] sm:text-xs md:text-sm font-semibold tracking-wider mb-5 sm:mb-6 shadow-[0_0_20px_rgba(59,130,246,0.2)] backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                        <span className="tracking-widest uppercase">{slide.badge}</span>
                      </div>
                    )}

                    {/* Main Headline */}
                    <h1 className="font-sans font-black tracking-tight uppercase leading-[0.95] text-[2.75rem] xs:text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] xl:text-[5.4rem] mb-4 sm:mb-5">
                      {slide.headline1 && <span className="block text-white">{slide.headline1}</span>}
                      {slide.headline2 && <span className="block text-white">{slide.headline2}</span>}
                      {slide.headlineHollow && <span className="block hero-hollow-stroke">{slide.headlineHollow}</span>}
                    </h1>

                    {/* Subtext description */}
                    {slide.subtitle && (
                      <p className="text-sm sm:text-base md:text-lg text-gray-300 font-normal leading-relaxed max-w-xl mb-7 sm:mb-9">
                        {slide.subtitle}
                      </p>
                    )}

                    {/* CTA Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
                      {slide.primaryBtnText && (
                        <Link
                          to={slide.primaryBtnLink || '/shop'}
                          className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white hover:bg-gray-100 text-[#050c38] font-bold text-xs sm:text-sm md:text-base rounded-xl transition-all shadow-[0_4px_25px_rgba(255,255,255,0.25)] hover:shadow-[0_4px_30px_rgba(255,255,255,0.4)] active:scale-95"
                        >
                          <span>{slide.primaryBtnText}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}

                      {slide.secondaryBtnText && (
                        <Link
                          to={slide.secondaryBtnLink || '/sell'}
                          className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 bg-[#0a1548]/80 hover:bg-[#102066] border border-white/80 hover:border-white text-white font-bold text-xs sm:text-sm md:text-base rounded-xl transition-all shadow-[0_4px_20px_rgba(0,0,0,0.4)] active:scale-95"
                        >
                          {slide.secondaryBtnText}
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Right Slide Visual Column (5 cols) */}
                  <div className="lg:col-span-5 relative flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[480px]">
                    {slide.image && (
                      <div className="relative w-full max-w-[340px] xs:max-w-[400px] sm:max-w-[480px] lg:max-w-[560px] animate-float flex items-center justify-center">
                        <img
                          src={slide.image}
                          alt={slide.alt || slide.headline1 || 'Banner product showcase'}
                          className="w-full h-auto max-h-[380px] sm:max-h-[460px] lg:max-h-[500px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)] filter brightness-105"
                          loading={idx === 0 ? 'eager' : 'lazy'}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Previous & Next Navigation Arrows */}
        {showArrows && slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-40 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-200 shadow-xl active:scale-90 group focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-40 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-200 shadow-xl active:scale-90 group focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </>
        )}

        {/* Bottom Pagination Dots & Progress Bar */}
        {showDots && slides.length > 1 && (
          <div className="absolute bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 sm:gap-2.5 bg-black/45 backdrop-blur-md px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/15 shadow-xl">
            {slides.map((_, i) => {
              const isActive = i === currentSlide;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 focus:outline-none ${
                    isActive
                      ? 'w-7 sm:w-9 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                      : 'w-2 sm:w-2.5 bg-white/35 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              );
            })}
            <span className="text-[10px] sm:text-xs font-mono font-bold text-white/80 ml-1.5 select-none tracking-wider">
              {String(currentSlide + 1).padStart(2, '0')}/{String(slides.length).padStart(2, '0')}
            </span>
          </div>
        )}
      </section>
    );
  }

  // ==========================================
  // 2. DEFAULT INTERACTIVE CONSOLE SHOWCASE
  // ==========================================
  const badge = heroConfig?.badge || '• CERTIFIED • TESTED • READY TO SHIP';
  const headline1 = heroConfig?.headline1 !== undefined ? heroConfig.headline1 : 'CONSOLE YOU';
  const headline2 = heroConfig?.headline2 !== undefined ? heroConfig.headline2 : 'WANT,';
  const headlineHollow = heroConfig?.headlineHollow !== undefined ? heroConfig.headlineHollow : 'READY TO PLAY.';
  const subtitle = heroConfig?.subtitle !== undefined ? heroConfig.subtitle : 'Every console is inspected, stress-tested, and backed by a 90-day warranty before it reaches your door. Trade in your old gear anytime.';
  const shopBtnText = heroConfig?.shopBtnText || 'Shop Console';
  const shopBtnLink = heroConfig?.shopBtnLink || null;
  const sellBtnText = heroConfig?.sellBtnText || 'Sell Your Console';
  const sellBtnLink = heroConfig?.sellBtnLink || '/sell';

  const platforms = (Array.isArray(heroConfig?.platforms) && heroConfig.platforms.length > 0)
    ? heroConfig.platforms.map((p, idx) => ({
        ...DEFAULT_PLATFORMS[idx % DEFAULT_PLATFORMS.length],
        ...p,
      }))
    : DEFAULT_PLATFORMS;

  const [activeIndex, setActiveIndex] = useState(1); // Default to PlayStation (index 1)
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPaused || platforms.length <= 1) return;

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % platforms.length);
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, platforms.length]);

  const currentPlatform = platforms[activeIndex] || platforms[0] || DEFAULT_PLATFORMS[0];

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
            
            {/* Pill Badge */}
            {badge && (
              <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#0a1548]/90 border border-blue-400/30 text-blue-100 text-[11px] sm:text-xs md:text-sm font-semibold tracking-wider mb-5 sm:mb-6 shadow-[0_0_20px_rgba(59,130,246,0.2)] backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                <span className="tracking-widest uppercase">{badge}</span>
              </div>
            )}

            {/* Main Headline */}
            <h1 className="font-sans font-black tracking-tight uppercase leading-[0.95] text-[2.75rem] xs:text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] xl:text-[5.4rem] mb-4 sm:mb-5">
              {headline1 && <span className="block text-white">{headline1}</span>}
              {headline2 && <span className="block text-white">{headline2}</span>}
              {headlineHollow && <span className="block hero-hollow-stroke">{headlineHollow}</span>}
            </h1>

            {/* Subtext description */}
            {subtitle && (
              <p className="text-sm sm:text-base md:text-lg text-gray-300 font-normal leading-relaxed max-w-xl mb-7 sm:mb-9">
                {subtitle}
              </p>
            )}

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
              <Link
                to={shopBtnLink || currentPlatform.shopLink}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white hover:bg-gray-100 text-[#050c38] font-bold text-xs sm:text-sm md:text-base rounded-xl transition-all shadow-[0_4px_25px_rgba(255,255,255,0.25)] hover:shadow-[0_4px_30px_rgba(255,255,255,0.4)] active:scale-95"
              >
                <span>{shopBtnText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to={sellBtnLink || currentPlatform.sellLink}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 bg-[#0a1548]/80 hover:bg-[#102066] border border-white/80 hover:border-white text-white font-bold text-xs sm:text-sm md:text-base rounded-xl transition-all shadow-[0_4px_20px_rgba(0,0,0,0.4)] active:scale-95"
              >
                {sellBtnText}
              </Link>
            </div>
          </div>

          {/* Right Hero Visual Showcase Column (5 cols) */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[480px]">
            {platforms.map((platform, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={platform.id || idx}
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out ${
                    isActive
                      ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto z-20'
                      : 'opacity-0 scale-95 translate-y-3 pointer-events-none z-10'
                  }`}
                >
                  <div className="relative w-full max-w-[340px] xs:max-w-[400px] sm:max-w-[480px] lg:max-w-[560px] animate-float">
                    <img
                      src={platform.image}
                      alt={platform.alt || platform.name || 'Gaming Console'}
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
            {platforms.map((platform, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={platform.id || idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className="group flex-1 text-center py-2 px-1 sm:px-4 focus:outline-none transition-all duration-200"
                  aria-label={`Show ${platform.name || platform.label}`}
                  aria-pressed={isActive}
                >
                  <span
                    className={`block font-outfit sm:font-display font-black text-sm xs:text-base sm:text-2xl md:text-3xl lg:text-[2rem] tracking-wider uppercase transition-all duration-200 ${
                      isActive
                        ? `${platform.activeColor || 'text-purple-600'} scale-105 drop-shadow-sm`
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
