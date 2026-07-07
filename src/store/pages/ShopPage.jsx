import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { storeApi } from '../api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  ACCESSORIES_SUBFILTERS,
  CATEGORY_ACCORDION_SLUGS,
  NESTED_CATEGORY_SLUGS,
  SHOP_CATEGORY_ORDER,
} from '../config/navigation';

function isSubFilterActive(sub, categorySlug, currentSearch) {
  if (sub.search) {
    return categorySlug === sub.categorySlug && currentSearch === sub.search.toLowerCase();
  }
  return categorySlug === sub.categorySlug && !currentSearch;
}

function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [accessoriesOpen, setAccessoriesOpen] = useState(false);

  const categoryId = searchParams.get('categoryId') || '';
  const categorySlug = searchParams.get('categorySlug') || '';
  const currentSearch = (searchParams.get('search') || '').toLowerCase();
  const featured = searchParams.get('featured') || '';
  const flashSale = searchParams.get('flashSale') || '';
  const page = searchParams.get('page') || '1';

  const isAccessoriesSectionActive =
    categorySlug === 'accessories' ||
    categorySlug === 'custom-3d-figures' ||
    ACCESSORIES_SUBFILTERS.some((sub) => isSubFilterActive(sub, categorySlug, currentSearch));

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    if (isAccessoriesSectionActive) setAccessoriesOpen(true);
  }, [categorySlug, currentSearch]);

  useEffect(() => {
    storeApi.getCategories().then((res) => {
      if (res.success) setCategories(res.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (searchParams.get('search')) params.search = searchParams.get('search');
    if (categoryId) params.categoryId = categoryId;
    else if (categorySlug) params.categorySlug = categorySlug;
    if (featured === 'true') params.isFeatured = 'true';
    if (flashSale === 'true') params.isFlashSale = 'true';

    storeApi.getProducts(params).then((res) => {
      if (res.success) {
        setProducts(res.data);
        setTotalPages(res.totalPages || 1);
      }
    }).catch(() => setProducts([])).finally(() => setLoading(false));
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (search) next.set('search', search);
    else next.delete('search');
    next.set('page', '1');
    setSearchParams(next);
  };

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key === 'categorySlug') next.delete('categoryId');
    next.set('page', '1');
    setSearchParams(next);
  };

  const setCategoryFilter = (slug) => {
    const next = new URLSearchParams(searchParams);
    next.delete('categoryId');
    next.delete('search');
    if (slug) next.set('categorySlug', slug);
    else next.delete('categorySlug');
    next.set('page', '1');
    setSearchParams(next);
  };

  const setSubFilter = ({ categorySlug: slug, search: subSearch }) => {
    const next = new URLSearchParams();
    next.set('categorySlug', slug);
    if (subSearch) next.set('search', subSearch);
    next.set('page', '1');
    setSearchParams(next);
  };

  const visibleCategories = categories
    .filter((c) => !NESTED_CATEGORY_SLUGS.includes(c.slug))
    .sort((a, b) => {
      const ai = SHOP_CATEGORY_ORDER.indexOf(a.slug);
      const bi = SHOP_CATEGORY_ORDER.indexOf(b.slug);
      if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

  const activeCategory = categories.find(
    (c) => String(c.id) === categoryId || (categorySlug && c.slug === categorySlug)
  );
  const activeSubFilter = ACCESSORIES_SUBFILTERS.find((sub) =>
    isSubFilterActive(sub, categorySlug, currentSearch)
  );

  const renderCategoryButton = (category) => {
    const isActive = String(category.id) === categoryId || category.slug === categorySlug;

    if (CATEGORY_ACCORDION_SLUGS.includes(category.slug)) {
      const parentActive = categorySlug === category.slug && !currentSearch;

      return (
        <div key={category.id} className="space-y-1">
          <button
            type="button"
            aria-expanded={accessoriesOpen}
            onClick={() => {
              if (accessoriesOpen) {
                setAccessoriesOpen(false);
              } else {
                setCategoryFilter(category.slug);
                setAccessoriesOpen(true);
              }
            }}
            className={`store-filter-accordion ${
              parentActive || isAccessoriesSectionActive
                ? 'store-filter-accordion--active'
                : 'store-filter-accordion--default'
            }`}
          >
            <span className="store-filter-accordion-label">{category.name}</span>
            <ChevronDown
              className={`store-filter-accordion-chevron ${accessoriesOpen ? 'store-filter-accordion-chevron--open' : ''}`}
            />
          </button>

          {accessoriesOpen && (
            <div className="space-y-0.5">
              {ACCESSORIES_SUBFILTERS.map((sub) => (
                <button
                  key={sub.label}
                  type="button"
                  onClick={() => setSubFilter(sub)}
                  className={`store-filter-btn store-filter-btn--sub ${
                    isSubFilterActive(sub, categorySlug, currentSearch)
                      ? 'store-filter-btn--active'
                      : 'store-filter-btn--default'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={category.id}
        type="button"
        onClick={() => setCategoryFilter(category.slug)}
        className={`store-filter-btn ${isActive ? 'store-filter-btn--active' : 'store-filter-btn--default'}`}
      >
        {category.name}
      </button>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      <div className="mb-6">
        <h1 className="store-page-title">
          {flashSale === 'true' ? 'Deals & Offers' : featured === 'true' ? 'Featured Products' : activeSubFilter ? activeSubFilter.label : activeCategory ? activeCategory.name : 'All Products'}
        </h1>
        <p className="store-muted text-sm mt-1">
          {loading ? 'Loading...' : `${products.length} products shown`}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <button
          type="button"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="lg:hidden flex items-center justify-between px-4 py-3 store-glass-panel text-sm font-medium text-white"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </span>
          <ChevronDown className={`w-4 h-4 transition ${filtersOpen ? 'rotate-180' : ''}`} />
        </button>

        <aside className={`lg:w-56 shrink-0 space-y-4 ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="store-input pl-10"
            />
          </form>

          <div className="store-glass-panel p-4">
            <h3 className="text-sm font-bold text-white mb-3">Category</h3>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setCategoryFilter('')}
                className={`store-filter-btn ${!categoryId && !categorySlug ? 'store-filter-btn--active' : 'store-filter-btn--default'}`}
              >
                All Categories
              </button>
              {visibleCategories.map((c) => renderCategoryButton(c))}
            </div>
          </div>

          <div className="store-glass-panel p-4">
            <h3 className="text-sm font-bold text-white mb-3">Quick Filters</h3>
            <div className="flex flex-col gap-2">
              {[
                { key: 'featured', label: 'Featured Only' },
                { key: 'flashSale', label: 'On Sale' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={searchParams.get(key) === 'true'}
                    onChange={() => setFilter(key, searchParams.get(key) === 'true' ? '' : 'true')}
                    className="rounded border-neon-purple/40 bg-transparent text-neon-purple focus:ring-neon-purple/30"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
            <LoadingSpinner size="lg" className="min-h-[300px]" />
          ) : products.length === 0 ? (
            <div className="text-center py-20 store-glass-panel">
              <p className="store-muted">No products found. Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-1.5 mt-10">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFilter('page', String(p))}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                        String(p) === page
                          ? 'bg-neon-purple text-white shadow-neon-purple'
                          : 'store-brand-chip px-0 py-0 w-9 h-9 flex items-center justify-center'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShopPage;
