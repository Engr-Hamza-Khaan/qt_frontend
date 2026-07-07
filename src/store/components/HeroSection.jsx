import { Link } from 'react-router-dom';
import StoreHeader from '../layout/StoreHeader';
import { getWhatsAppUrl } from '../config/contact';

const WHATSAPP_URL = getWhatsAppUrl();

function WhatsAppIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={`fill-current ${className}`} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function HeroButtons({ className = '' }) {
  return (
    <div className={`flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start ${className}`}>
      <Link
        to="/shop"
        className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-neon-purple-dark to-neon-purple hover:from-neon-purple hover:to-neon-purple-light text-white font-display font-bold uppercase tracking-wider rounded-full transition-all shadow-neon-purple hover:shadow-neon-purple-lg text-xs sm:text-sm md:text-base"
      >
        Shop Consoles &amp; Games
      </Link>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-glass-btn w-full sm:w-auto justify-center px-6 sm:px-8 py-3 sm:py-3.5 font-display font-bold uppercase tracking-wider text-xs sm:text-sm md:text-base"
      >
        <WhatsAppIcon />
        WhatsApp Us
      </a>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative bg-[#08050f]">
      <div className="relative z-[100] overflow-visible">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-0 w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] lg:w-[550px] lg:h-[550px] bg-neon-purple/15 rounded-full blur-[80px] sm:blur-[110px] lg:blur-[130px]" />
          <div className="absolute bottom-0 right-0 w-[220px] h-[220px] sm:w-[320px] sm:h-[320px] lg:w-[450px] lg:h-[450px] bg-neon-purple-dark/20 rounded-full blur-[70px] sm:blur-[90px] lg:blur-[110px]" />
          <div className="absolute top-1/3 right-1/4 w-[180px] h-[180px] sm:w-[260px] sm:h-[260px] lg:w-[350px] lg:h-[350px] bg-violet-600/10 rounded-full blur-[60px] sm:blur-[75px] lg:blur-[90px]" />
        </div>

        <StoreHeader embedded />
      </div>

      <div className="relative z-0 max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 md:pt-12 lg:pt-14 pb-10 sm:pb-14 md:pb-20 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
          <div className="animate-fade-in text-center lg:text-left">
            <p className="font-display font-semibold text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.2em] sm:tracking-[0.35em] text-white/90 mb-4 sm:mb-5">
              Play. Collect. Level Up.
            </p>

            <h1 className="hero-brush-title text-[1.75rem] xs:text-3xl sm:text-5xl md:text-6xl lg:text-[4.5rem] mb-1 sm:mb-2">
              <span className="text-white"> Consoles </span>
              <span className="hero-neon-text">You Want,</span>
            </h1>
            <h1 className="hero-brush-title text-[1.75rem] xs:text-3xl sm:text-5xl md:text-6xl lg:text-[4.5rem] mb-4 sm:mb-6">
              <span className="text-white">Ready to </span>
              <span className="hero-neon-text">Play.</span>
            </h1>

            <div className="hero-tag-box mb-0 lg:mb-6">
              Your Setup. Your <span className="hero-neon-text font-bold">Legacy.</span>
            </div>

            <HeroButtons className="hidden lg:flex mt-6" />
          </div>

          <div className="relative z-0 flex justify-center lg:justify-end lg:pt-2">
            <div className="hero-image-float relative z-0 w-full max-w-[260px] xs:max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl overflow-hidden rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] ring-1 ring-neon-purple/20 shadow-neon-purple animate-float">
              <img
                src="/home_banner_dark.png"
                alt="Premium consoles and games showcase"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          <HeroButtons className="flex lg:hidden -mt-2 sm:mt-0" />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
