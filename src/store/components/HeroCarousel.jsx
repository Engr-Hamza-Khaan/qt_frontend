import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BRAND_NAME, BRAND_SLOGAN } from '../../config/brand';

const DEFAULT_SLIDES = [
  {
    title: 'Premium Laptops & MacBooks',
    subtitle: 'New & certified pre-owned — best prices in Pakistan',
    cta: 'Shop Now',
    link: '/shop',
    bg: 'from-gray-900 via-gray-800 to-gray-900',
  },
  {
    title: 'Flash Sale — Limited Time',
    subtitle: 'Save big on top brands. While stocks last.',
    cta: 'View Deals',
    link: '/shop?flashSale=true',
    bg: 'from-blue-900 via-blue-800 to-indigo-900',
  },
  {
    title: 'Trade-In Your Device',
    subtitle: 'Get instant quote for your used laptop or console',
    cta: 'Get Quote',
    link: '/sell',
    bg: 'from-slate-800 via-slate-700 to-slate-900',
  },
];

function HeroCarousel({ hero = {}, slides = DEFAULT_SLIDES }) {
  const items = hero.title
    ? [{ title: hero.title, subtitle: hero.subtitle, cta: hero.buttonText || 'Shop Now', link: '/shop', bg: 'from-gray-900 via-gray-800 to-gray-900' }, ...slides.slice(1)]
    : slides;

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  const slide = items[current];

  return (
    <section className="relative bg-gray-900 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg} transition-all duration-700`} />
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiPjxwYXRoIGQ9Ik0wIDQwaDQwVjB6Ii8+PC9nPjwvc3ZnPg==')]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20">
        <div className="max-w-xl animate-fade-in">
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider mb-3">
            {BRAND_NAME} — {BRAND_SLOGAN}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
            {slide.title}
          </h1>
          <p className="text-gray-300 text-base md:text-lg mb-8 leading-relaxed">
            {slide.subtitle}
          </p>
          <Link
            to={slide.link}
            className="inline-flex items-center px-7 py-3.5 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition text-sm"
          >
            {slide.cta}
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setCurrent((prev) => (prev - 1 + items.length) % items.length)}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => setCurrent((prev) => (prev + 1) % items.length)}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === current ? 'w-8 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroCarousel;
