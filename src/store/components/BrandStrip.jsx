import { Link } from 'react-router-dom';

const BRANDS = [
  { name: 'PlayStation', slug: 'playstation' },
  { name: 'Xbox', slug: 'xbox' },
  { name: 'Nintendo', slug: 'nintendo' },
  { name: 'Meta Quest', slug: 'meta+quest' },
  { name: 'EA', slug: 'ea' },
  { name: 'Ubisoft', slug: 'ubisoft' },
  { name: 'Activision', slug: 'activision' },
  { name: 'Rockstar', slug: 'rockstar' },
];

function BrandStrip() {
  return (
    <section className="py-8 border-y border-neon-purple/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="store-section-title text-center mb-6">Shop by Platform &amp; Publisher</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {BRANDS.map((brand) => (
            <Link
              key={brand.slug}
              to={`/shop?search=${brand.slug}`}
              className="store-brand-chip"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BrandStrip;
