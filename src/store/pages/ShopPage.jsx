import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, SlidersHorizontal, ChevronDown, X, ArrowUpDown, Clock, 
  Gamepad2, Sparkles, MapPin, Eye, Phone, Mail, MessageCircle, ExternalLink, Link2, AlertCircle
} from 'lucide-react';
import { storeApi } from '../api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ModalOverlay from '../../components/ui/ModalOverlay';
import { formatCurrency } from '../../utils/formatters';
import { getMediaUrl } from '../utils';
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

  // Used Console Ads State
  const [consoleAds, setConsoleAds] = useState([]);
  const [selectedAdModal, setSelectedAdModal] = useState(null);
  const activeTabMode = searchParams.get('tab') || 'products'; // 'products' or 'ads'

  const categoryId = searchParams.get('categoryId') || '';
  const categorySlug = searchParams.get('categorySlug') || '';
  const condition = searchParams.get('condition') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sortBy = searchParams.get('sortBy') || '';
  const order = searchParams.get('order') || '';
  const currentSearch = (searchParams.get('search') || '').toLowerCase();
  const featured = searchParams.get('featured') || '';
  const flashSale = searchParams.get('flashSale') || '';
  const page = searchParams.get('page') || '1';

  // Manual numeric input state
  const [inputMin, setInputMin] = useState(minPrice);
  const [inputMax, setInputMax] = useState(maxPrice);

  useEffect(() => {
    setInputMin(minPrice);
    setInputMax(maxPrice);
  }, [minPrice, maxPrice]);

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

    storeApi.getUsedConsoleAds().then((res) => {
      if (res?.success) setConsoleAds(res.data || []);
    }).catch(() => {});
  }, []);

  const setTabMode = (tab) => {
    const next = new URLSearchParams(searchParams);
    if (tab === 'ads') {
      next.set('tab', 'ads');
    } else {
      next.delete('tab');
    }
    setSearchParams(next);
  };

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (searchParams.get('search')) params.search = searchParams.get('search');
    if (categoryId) params.categoryId = categoryId;
    else if (categorySlug) params.categorySlug = categorySlug;
    if (condition) params.condition = condition;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (sortBy) params.sortBy = sortBy;
    if (order) params.order = order;
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

  const handleApplyPrice = (e) => {
    if (e) e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (inputMin) next.set('minPrice', inputMin.trim());
    else next.delete('minPrice');
    if (inputMax) next.set('maxPrice', inputMax.trim());
    else next.delete('maxPrice');
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleResetPrice = () => {
    setInputMin('');
    setInputMax('');
    const next = new URLSearchParams(searchParams);
    next.delete('minPrice');
    next.delete('maxPrice');
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleSortChange = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'price_asc') {
      next.set('sortBy', 'price');
      next.set('order', 'asc');
    } else if (value === 'price_desc') {
      next.set('sortBy', 'price');
      next.set('order', 'desc');
    } else {
      next.delete('sortBy');
      next.delete('order');
    }
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

  const activeSearchQuery = searchParams.get('search');
  const hasActivePriceFilter = Boolean(minPrice || maxPrice);

  const getPriceLabel = () => {
    if (minPrice && maxPrice) {
      return `Rs ${Number(minPrice).toLocaleString()} - Rs ${Number(maxPrice).toLocaleString()}`;
    }
    if (minPrice) {
      return `Over Rs ${Number(minPrice).toLocaleString()}`;
    }
    if (maxPrice) {
      return `Under Rs ${Number(maxPrice).toLocaleString()}`;
    }
    return '';
  };

  const currentSortValue = sortBy === 'price' ? `price_${order || 'asc'}` : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="store-page-title">
              {activeSearchQuery
                ? `Search: "${activeSearchQuery}"`
                : flashSale === 'true'
                ? 'Deals & Offers'
                : featured === 'true'
                ? 'Featured Products'
                : activeSubFilter
                ? activeSubFilter.label
                : activeCategory
                ? activeCategory.name
                : 'All Products'}
            </h1>
            <p className="store-muted text-sm mt-1">
              {loading ? 'Searching catalog...' : `${products.length} products found`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 mr-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={currentSortValue}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-[#0e081c] text-xs text-gray-200 py-1.5 px-2.5 rounded-xl border border-white/15 focus:border-neon-purple/50 focus:outline-none cursor-pointer"
              >
                <option value="">Sort: Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {activeSearchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  const next = new URLSearchParams(searchParams);
                  next.delete('search');
                  next.set('page', '1');
                  setSearchParams(next);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-gray-300 hover:text-rose-300 border border-white/15 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <span>Search: "{activeSearchQuery}"</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {hasActivePriceFilter && (
              <button
                type="button"
                onClick={handleResetPrice}
                className="px-3 py-1.5 rounded-xl bg-neon-purple/20 hover:bg-rose-500/20 text-neon-purple-light hover:text-rose-300 border border-neon-purple/30 text-xs font-semibold flex items-center gap-1.5 transition shadow-[0_0_12px_rgba(176,38,255,0.15)]"
                title="Remove price filter"
              >
                <span>Price: {getPriceLabel()}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {condition && (
              <button
                type="button"
                onClick={() => setFilter('condition', '')}
                className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-rose-500/20 text-blue-300 hover:text-rose-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <span>Condition: {condition}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <button
          type="button"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="lg:hidden flex items-center justify-between px-4 py-3 store-glass-panel text-sm font-medium text-white rounded-xl"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-neon-purple" /> Filters
            {(hasActivePriceFilter || condition || featured || flashSale) && (
              <span className="w-2 h-2 rounded-full bg-neon-purple animate-pulse" />
            )}
          </span>
          <ChevronDown className={`w-4 h-4 transition ${filtersOpen ? 'rotate-180' : ''}`} />
        </button>

        <aside className={`lg:w-60 shrink-0 space-y-4 ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalog..."
              className="store-input pl-10 text-xs"
            />
          </form>

          {/* Clean Price Filter Panel */}
          <div className="store-glass-panel p-4 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Price Filter</h3>
              {hasActivePriceFilter && (
                <button
                  type="button"
                  onClick={handleResetPrice}
                  className="text-[11px] text-neon-purple hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            <form onSubmit={handleApplyPrice} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[11px] text-gray-400 block mb-1 font-medium">Min (Rs)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={inputMin}
                    onChange={(e) => setInputMin(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-black/40 border border-white/15 rounded-lg text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none"
                  />
                </div>
                <span className="text-gray-500 text-xs self-end mb-2">-</span>
                <div className="flex-1">
                  <label className="text-[11px] text-gray-400 block mb-1 font-medium">Max (Rs)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={inputMax}
                    onChange={(e) => setInputMax(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-black/40 border border-white/15 rounded-lg text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-neon-purple to-indigo-600 hover:from-neon-purple-light hover:to-indigo-500 text-white font-semibold text-xs transition active:scale-95 shadow-neon-purple/30"
              >
                Apply Price
              </button>
            </form>
          </div>

          {/* Category Filter */}
          <div className="store-glass-panel p-4 rounded-2xl border border-white/10">
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

          {/* Condition Filter */}
          <div className="store-glass-panel p-4 rounded-2xl border border-white/10">
            <h3 className="text-sm font-bold text-white mb-3">Condition</h3>
            <div className="space-y-1">
              {[
                { val: '', label: 'All Conditions' },
                { val: 'New', label: 'Brand New' },
                { val: 'Used', label: 'Pre-Owned / Used' },
              ].map((cond) => (
                <button
                  key={cond.val}
                  type="button"
                  onClick={() => setFilter('condition', cond.val)}
                  className={`store-filter-btn ${
                    condition === cond.val ? 'store-filter-btn--active' : 'store-filter-btn--default'
                  }`}
                >
                  {cond.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Flags Filter */}
          <div className="store-glass-panel p-4 rounded-2xl border border-white/10">
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

        <div className="flex-1 space-y-4">
          
          {/* Top Mode Switcher: Store Inventory vs 30-Day Used Console Ads */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 store-glass-panel rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTabMode('products')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 ${
                  activeTabMode !== 'ads'
                    ? 'bg-neon-purple text-white shadow-lg shadow-neon-purple/20'
                    : 'text-slate-400 hover:text-white bg-white/5'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                Store Catalog ({products.length})
              </button>

              <button
                type="button"
                onClick={() => setTabMode('ads')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 ${
                  activeTabMode === 'ads'
                    ? 'bg-neon-purple text-white shadow-lg shadow-neon-purple/20'
                    : 'text-slate-400 hover:text-white bg-white/5'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-neon-purple" />
                Used Console Ads ({consoleAds.length})
              </button>
            </div>

            <Link
              to="/sell"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-neon-purple/20 to-blue-500/20 hover:from-neon-purple/30 hover:to-blue-500/30 text-neon-purple text-xs font-bold border border-neon-purple/30 transition text-center"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Sell Used Console (Post 30-Day Ad)
            </Link>
          </div>

          {/* TAB 1: STORE PRODUCTS */}
          {activeTabMode !== 'ads' ? (
            loading ? (
              <LoadingSpinner size="lg" className="min-h-[300px]" />
            ) : products.length === 0 ? (
              <div className="text-center py-20 store-glass-panel rounded-2xl border border-white/10">
                <p className="store-muted">No products found. Try adjusting your filters.</p>
                {(hasActivePriceFilter || condition || search || featured || flashSale) && (
                  <button
                    type="button"
                    onClick={() => setSearchParams(new URLSearchParams())}
                    className="mt-4 px-4 py-2 rounded-xl bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple text-xs font-semibold transition"
                  >
                    Clear All Filters
                  </button>
                )}
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
            )
          ) : (
            /* TAB 2: ACTIVE 30-DAY USED CONSOLE ADS */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-neon-purple/20 via-blue-500/10 to-transparent border border-neon-purple/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-neon-purple" />
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Community Used Console Ads (30-Day Auto-Disable)
                    </h3>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Verified pre-owned consoles listed by local gamers. Each ad stays active for 30 days.
                    </p>
                  </div>
                </div>
                <Link to="/sell" className="store-btn-primary px-3 py-1.5 text-xs font-bold shrink-0">
                  Post Your Ad
                </Link>
              </div>

              {consoleAds.length === 0 ? (
                <div className="text-center py-20 store-glass-panel rounded-2xl border border-white/10 p-8 space-y-3">
                  <Gamepad2 className="w-12 h-12 text-slate-500 mx-auto" />
                  <h3 className="text-lg font-bold text-white">No Active Console Ads</h3>
                  <p className="text-xs text-slate-400">
                    Be the first gamer to post a 30-day listing for your used console!
                  </p>
                  <Link to="/sell" className="store-btn-primary inline-block px-5 py-2 text-xs font-bold">
                    Post Console Ad Now
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {consoleAds.map((ad) => {
                    const daysRemaining = ad.daysRemaining ?? 30;
                    const isUrgent = daysRemaining <= 5;
                    const imgUrl = Array.isArray(ad.mediaUrls) && ad.mediaUrls[0] ? getMediaUrl(ad.mediaUrls[0]) : null;

                    return (
                      <div
                        key={ad.id}
                        className="group store-glass-panel rounded-3xl border border-white/10 overflow-hidden hover:border-neon-purple/40 transition-all duration-300 flex flex-col shadow-xl"
                      >
                        <div className="relative aspect-video bg-black/40 overflow-hidden">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={ad.productName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-1 bg-gradient-to-br from-slate-900 to-black">
                              <Gamepad2 className="w-10 h-10" />
                              <span className="text-[10px] font-semibold text-slate-400">Verified Console Ad</span>
                            </div>
                          )}

                          <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1 border shadow-lg ${
                            isUrgent
                              ? 'bg-rose-500/80 text-white border-rose-400/50'
                              : 'bg-emerald-500/80 text-white border-emerald-400/50'
                          }`}>
                            <Clock className="w-3 h-3" />
                            {daysRemaining}d Left
                          </span>

                          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/70 text-slate-200 border border-white/20 backdrop-blur-md">
                            {ad.platform}
                          </span>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[10px] font-bold text-neon-purple uppercase tracking-wider">
                                {ad.brand} {ad.variant ? `• ${ad.variant}` : ''}
                              </span>
                              {ad.city && (
                                <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                  <MapPin className="w-3 h-3 text-slate-500" /> {ad.city}
                                </span>
                              )}
                            </div>

                            <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-neon-purple transition">
                              {ad.productName}
                            </h3>

                            <div className="flex flex-wrap gap-1 mt-2">
                              {ad.storage && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                                  💾 {ad.storage}
                                </span>
                              )}
                              {ad.condition && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                                  ✨ {ad.condition}
                                </span>
                              )}
                              {ad.sellerType === 'Vendor' && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold">
                                  🛡️ {ad.vendorCompany || 'Supplier'}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Asking</span>
                              <span className="text-base font-mono font-extrabold text-emerald-400">
                                {ad.price ? formatCurrency(ad.price) : 'Contact'}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedAdModal(ad)}
                              className="store-btn-secondary px-3 py-1.5 text-xs font-bold flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL: USED CONSOLE AD DETAILS LIGHTBOX */}
        <ModalOverlay open={!!selectedAdModal}>
          {selectedAdModal && (
            <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-3xl p-6 shadow-2xl text-white space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      ⏱️ {selectedAdModal.daysRemaining ?? 30} Days Active Left
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      #AD-{selectedAdModal.id?.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white">
                    {selectedAdModal.productName}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAdModal(null)}
                  className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Gallery */}
              {Array.isArray(selectedAdModal.mediaUrls) && selectedAdModal.mediaUrls.length > 0 && (
                <div className="aspect-video rounded-2xl overflow-hidden bg-black/60 border border-white/10">
                  <img
                    src={getMediaUrl(selectedAdModal.mediaUrls[0])}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Specs Table */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Asking Price</span>
                  <span className="text-lg font-mono font-extrabold text-emerald-400">
                    {selectedAdModal.price ? formatCurrency(selectedAdModal.price) : 'Contact'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Platform</span>
                  <span className="font-semibold text-white">{selectedAdModal.platform || 'Console'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Storage</span>
                  <span className="font-semibold text-white">{selectedAdModal.storage || 'Standard'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Condition</span>
                  <span className="font-semibold text-emerald-400">{selectedAdModal.condition || 'Used'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Variant</span>
                  <span className="font-semibold text-white">{selectedAdModal.variant || 'Standard'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Color</span>
                  <span className="font-semibold text-white">{selectedAdModal.color || 'Standard'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Placement</span>
                  <span className="font-semibold text-white">{selectedAdModal.placement || 'Horizontal'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Model Number</span>
                  <span className="font-mono text-white">{selectedAdModal.modelNumber || 'N/A'}</span>
                </div>
              </div>

              {selectedAdModal.accessoriesIncluded && (
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">
                    Included Accessories
                  </span>
                  <p className="text-slate-200">{selectedAdModal.accessoriesIncluded}</p>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Seller Description</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                  {selectedAdModal.description}
                </p>
              </div>

              {/* YouTube Link */}
              {selectedAdModal.embedMedia && (
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                    <Link2 className="w-4 h-4" /> Video Demonstration Link
                  </span>
                  <a
                    href={selectedAdModal.embedMedia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neon-purple hover:underline flex items-center gap-1"
                  >
                    Watch Video <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Contact Seller */}
              <div className="p-4 bg-gradient-to-r from-neon-purple/20 via-blue-600/10 to-transparent border border-neon-purple/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Seller</span>
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    {selectedAdModal.vendorCompany || selectedAdModal.customerName}
                    {selectedAdModal.sellerType === 'Vendor' && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] border border-purple-500/40 font-bold">
                        🛡️ Verified Supplier
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" /> {selectedAdModal.city || 'Pakistan'}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {selectedAdModal.customerPhone && (
                    <a
                      href={`https://wa.me/${selectedAdModal.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi, I saw your ad on Quickturn for "${selectedAdModal.productName}" priced at ${formatCurrency(selectedAdModal.price || 0)}. Is it still available?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp Seller
                    </a>
                  )}
                  {selectedAdModal.customerPhone && (
                    <a
                      href={`tel:${selectedAdModal.customerPhone}`}
                      className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition"
                      title="Call Seller"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  {selectedAdModal.customerEmail && (
                    <a
                      href={`mailto:${selectedAdModal.customerEmail}?subject=${encodeURIComponent(`Regarding your ad: ${selectedAdModal.productName}`)}`}
                      className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition"
                      title="Email Seller"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </ModalOverlay>
      </div>
    </div>
  );
}

export default ShopPage;
