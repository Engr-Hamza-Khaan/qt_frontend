import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { storeApi } from '../api';
import ProductCard from '../components/ProductCard';
import HeroSection from '../components/HeroSection';
import TrustBar from '../components/TrustBar';
// import BrandStrip from '../components/BrandStrip';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function ProductSection({ title, subtitle, products, viewAllLink, viewAllText = 'View All', alt = false }) {
  if (!products?.length) return null;

  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-12 ${alt ? 'store-section-alt' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h2 className="store-section-title">{title}</h2>
          {subtitle && <p className="store-section-subtitle">{subtitle}</p>}
        </div>
        {viewAllLink && (
          <Link to={viewAllLink} className="store-link flex items-center gap-1 text-sm shrink-0 self-start sm:self-auto">
            {viewAllText} <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

const DEFAULT_SECTIONS_ORDER = [
  { id: 'hero', enabled: true },
  { id: 'trust', enabled: true },
  { id: 'newArrivals', enabled: true },
  { id: 'flashSale', enabled: true },
  { id: 'featured', enabled: true },
  { id: 'promoBanner', enabled: true },
  { id: 'bestSellers', enabled: true },
  { id: 'sellCta', enabled: true },
];

function HomePage() {
  const { data, loading } = useFetch(() => storeApi.getHome());
  const home = data?.data || {};
  const landingPage = home.settings?.landingPage || {};
  const banners = home.settings?.banners || {};
  const headings = landingPage.productHeadings || {};

  if (loading) return <LoadingSpinner size="lg" className="min-h-[60vh]" />;

  const sectionsOrder = Array.isArray(landingPage.sectionsOrder) && landingPage.sectionsOrder.length > 0
    ? landingPage.sectionsOrder
    : DEFAULT_SECTIONS_ORDER;

  const renderSection = (section) => {
    if (!section.enabled) return null;

    switch (section.id) {
      case 'hero':
        return <HeroSection key="hero" heroConfig={landingPage.hero} />;

      case 'trust':
        return <TrustBar key="trust" trustConfig={landingPage.trustBar} />;

      case 'newArrivals':
        return (
          <ProductSection
            key="newArrivals"
            title={headings.newArrivals?.title || 'New Arrivals'}
            subtitle={headings.newArrivals?.subtitle || 'Latest products added to the store'}
            products={home.newArrivals}
            viewAllLink={headings.newArrivals?.viewAllLink || '/shop'}
            viewAllText={headings.newArrivals?.viewAllText || 'View All'}
          />
        );

      case 'flashSale':
        return (
          <ProductSection
            key="flashSale"
            title={headings.flashSale?.title || 'Flash Deals'}
            subtitle={headings.flashSale?.subtitle || "Limited time offers — grab them before they're gone"}
            products={home.flashSale}
            viewAllLink={headings.flashSale?.viewAllLink || '/shop?flashSale=true'}
            viewAllText={headings.flashSale?.viewAllText || 'View All'}
          />
        );

      case 'featured':
        return (
          <ProductSection
            key="featured"
            title={headings.featured?.title || 'Featured Products'}
            subtitle={headings.featured?.subtitle || 'Hand-picked premium picks for you'}
            products={home.featured}
            viewAllLink={headings.featured?.viewAllLink || '/shop?featured=true'}
            viewAllText={headings.featured?.viewAllText || 'View All'}
            alt
          />
        );

      case 'promoBanner': {
        const promo = landingPage.promoBanner || banners.promotion || {};
        if (promo.show === false || (!promo.title && !banners.promotion?.title)) return null;
        const title = promo.title || banners.promotion?.title;
        const subtitle = promo.subtitle || banners.promotion?.subtitle;
        const buttonText = promo.buttonText || 'Shop Collection';
        const buttonLink = promo.buttonLink || '/shop';
        const badge = promo.badge;

        return (
          <section key="promoBanner" className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div className="store-promo-banner">
              <div>
                {badge && (
                  <span className="inline-block text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">
                    {badge}
                  </span>
                )}
                <h3 className="text-2xl md:text-3xl font-bold mb-2 font-display">{title}</h3>
                {subtitle && <p className="text-gray-300">{subtitle}</p>}
              </div>
              <Link to={buttonLink} className="store-btn-primary shrink-0 normal-case">
                {buttonText} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        );
      }

      case 'bestSellers':
        return (
          <ProductSection
            key="bestSellers"
            title={headings.bestSellers?.title || 'Best Sellers'}
            subtitle={headings.bestSellers?.subtitle || 'Most popular products this month'}
            products={home.bestSellers}
            viewAllLink={headings.bestSellers?.viewAllLink || '/shop'}
            viewAllText={headings.bestSellers?.viewAllText || 'View All'}
          />
        );

      case 'sellCta': {
        const sellCta = landingPage.sellCta || {};
        return (
          <section key="sellCta" className="store-cta-strip">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-white">
              <div>
                <h3 className="text-xl font-bold mb-1 font-display">
                  {sellCta.title || 'Have a console or game to sell?'}
                </h3>
                <p className="text-blue-200/80 text-sm">
                  {sellCta.subtitle || 'Get an instant quote for your used console, games, or gaming gear'}
                </p>
              </div>
              <Link
                to={sellCta.buttonLink || '/sell'}
                className="whatsapp-glass-btn px-6 py-3 font-display font-bold uppercase tracking-wider text-sm shrink-0"
              >
                {sellCta.buttonText || 'Get a Quote'}
              </Link>
            </div>
          </section>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div>
      {sectionsOrder.map((section) => renderSection(section))}
    </div>
  );
}

export default HomePage;
