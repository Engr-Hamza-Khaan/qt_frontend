import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { storeApi } from '../api';
import ProductCard from '../components/ProductCard';
import HeroSection from '../components/HeroSection';
import TrustBar from '../components/TrustBar';
// import BrandStrip from '../components/BrandStrip';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function ProductSection({ title, subtitle, products, viewAllLink, alt = false }) {
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
            View All <ArrowRight className="w-4 h-4" />
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

function HomePage() {
  const { data, loading } = useFetch(() => storeApi.getHome());
  const home = data?.data || {};
  const banners = home.settings?.banners || {};

  if (loading) return <LoadingSpinner size="lg" className="min-h-[60vh]" />;

  return (
    <div>
      <HeroSection />

      <TrustBar />

      {/* <BrandStrip /> */}

      {/* {home.categories?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-12">
          <h2 className="store-section-title text-center mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {home.categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?categoryId=${cat.id}`}
                className="store-category-card group"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-neon-purple/15 border border-neon-purple/30 group-hover:bg-neon-purple/25 flex items-center justify-center transition">
                  <span className="text-lg font-bold text-neon-purple transition">
                    {cat.name.charAt(0)}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white group-hover:text-neon-purple transition">
                  {cat.name}
                </p>
                {cat.platform && (
                  <p className="text-xs text-gray-500 mt-0.5">{cat.platform}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )} */}

      <ProductSection
        title="New Arrivals"
        subtitle="Latest products added to the store"
        products={home.newArrivals}
        viewAllLink="/shop"
      />

      <ProductSection
        title="Flash Deals"
        subtitle="Limited time offers — grab them before they're gone"
        products={home.flashSale}
        viewAllLink="/shop?flashSale=true"
      />

      <ProductSection
        title="Featured Products"
        subtitle="Hand-picked premium picks for you"
        products={home.featured}
        viewAllLink="/shop?featured=true"
        alt
      />

      {banners.promotion?.title && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="store-promo-banner">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2 font-display">{banners.promotion.title}</h3>
              <p className="text-gray-300">{banners.promotion.subtitle}</p>
            </div>
            <Link to="/shop" className="store-btn-primary shrink-0 normal-case">
              Shop Collection <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      <ProductSection
        title="Best Sellers"
        subtitle="Most popular products this month"
        products={home.bestSellers}
        viewAllLink="/shop"
      />

      <section className="store-cta-strip">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-white">
          <div>
            <h3 className="text-xl font-bold mb-1 font-display">Have a console or game to sell?</h3>
            <p className="text-purple-200/80 text-sm">Get an instant quote for your used console, games, or gaming gear</p>
          </div>
          <Link to="/sell" className="whatsapp-glass-btn px-6 py-3 font-display font-bold uppercase tracking-wider text-sm shrink-0">
            Get a Quote
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
