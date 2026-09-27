import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  TrendingUp,
  History,
  Tag,
  Gamepad2,
  Package,
  Layers,
  ChevronRight,
  Sparkles,
  Loader2,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { storeApi } from '../api';
import { getMediaUrl } from '../utils';

const RECENT_SEARCHES_KEY = 'qt_store_recent_searches';
const MAX_RECENT = 5;

export default function SearchBar({
  variant = 'header', // 'header', 'embedded', 'mobile'
  onCloseMobile,
  placeholder = 'Search games, consoles, RDR, GTA 5, PS5, SKUs...',
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState({
    products: [],
    totalMatches: 0,
    categories: [],
    popularSearches: [],
  });
  const [popularTerms, setPopularTerms] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const navigate = useNavigate();
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {
      setRecentSearches([]);
    }
  }, []);

  // Fetch initial popular terms
  useEffect(() => {
    storeApi
      .getPopularSearches()
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setPopularTerms(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Global shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Save to recent searches
  const saveRecentSearch = useCallback((term) => {
    if (!term || !term.trim()) return;
    const clean = term.trim();
    setRecentSearches((prev) => {
      const next = [clean, ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(
        0,
        MAX_RECENT
      );
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const removeRecentSearch = (e, termToRemove) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const next = prev.filter((t) => t !== termToRemove);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const clearAllRecent = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  };

  // Debounced Search Suggestions
  const fetchSuggestions = useCallback((searchQuery) => {
    if (!searchQuery.trim()) {
      setLoading(false);
      setSuggestions((prev) => ({ ...prev, products: [], totalMatches: 0, categories: [] }));
      return;
    }

    setLoading(true);
    storeApi
      .getSearchSuggestions(searchQuery.trim(), 6)
      .then((res) => {
        if (res?.success && res.data) {
          setSuggestions(res.data);
        }
      })
      .catch(() => {
        setSuggestions({ products: [], totalMatches: 0, categories: [], popularSearches: [] });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedIndex(-1);
    setIsOpen(true);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 200);
  };

  // Execute full search to /shop
  const executeSearch = (searchTerm) => {
    const term = (searchTerm || query).trim();
    if (!term) return;

    saveRecentSearch(term);
    storeApi.trackSearch(term, suggestions.totalMatches || 0).catch(() => {});

    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();
    navigate(`/shop?search=${encodeURIComponent(term)}`);
  };

  const handleProductSelect = (product) => {
    saveRecentSearch(product.title);
    storeApi.trackSearch(product.title, 1).catch(() => {});
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();
    navigate(`/product/${product.id}`);
  };

  const handleCategorySelect = (cat) => {
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();
    navigate(`/shop?categorySlug=${encodeURIComponent(cat.slug)}`);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    const itemsCount = suggestions.products.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < itemsCount - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : itemsCount - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < itemsCount) {
        handleProductSelect(suggestions.products[selectedIndex]);
      } else {
        executeSearch(query);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Helper highlight matching text in title
  const renderHighlighted = (text, highlight) => {
    if (!highlight || !highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={i} className="text-blue-400 font-bold underline decoration-blue-400/50">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Badge icon/style by matched reason
  const getBadgeStyle = (reason) => {
    if (!reason) return null;
    const r = reason.toLowerCase();
    if (r.includes('alias')) {
      return {
        bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
        icon: <Sparkles className="w-3 h-3 text-blue-400" />,
      };
    }
    if (r.includes('sku')) {
      return {
        bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        icon: <Package className="w-3 h-3 text-emerald-400" />,
      };
    }
    if (r.includes('platform')) {
      return {
        bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
        icon: <Gamepad2 className="w-3 h-3 text-blue-400" />,
      };
    }
    if (r.includes('category')) {
      return {
        bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
        icon: <Layers className="w-3 h-3 text-cyan-400" />,
      };
    }
    return {
      bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      icon: <Tag className="w-3 h-3 text-amber-400" />,
    };
  };

  const hasQuery = query.trim().length > 0;
  const popularList = suggestions.popularSearches?.length ? suggestions.popularSearches : popularTerms;

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          executeSearch();
        }}
        className={`group relative flex items-center gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all duration-300 ${
          isOpen
            ? 'bg-[#081242] ring-2 ring-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.4)] border border-blue-500/50'
            : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 shadow-inner'
        }`}
      >
        <Search
          className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-colors duration-200 ${
            isOpen ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-200'
          }`}
        />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search catalog"
          className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none tracking-wide"
        />

        {loading && <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />}

        {query && !loading && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions((prev) => ({ ...prev, products: [], totalMatches: 0, categories: [] }));
              inputRef.current?.focus();
            }}
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition shrink-0"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="hidden md:flex items-center gap-1 pl-1 shrink-0">
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold text-gray-400 bg-white/10 rounded border border-white/10 shadow-sm">
            ⌘K
          </kbd>
        </div>
      </form>

      {/* Autocomplete Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2.5 z-[150] bg-[#060c2c]/95 backdrop-blur-2xl border border-blue-500/25 rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(59,130,246,0.25)] overflow-hidden animate-fade-in divide-y divide-white/10">
          {/* STATE 1: Empty Query - Recent & Popular Searches */}
          {!hasQuery && (
            <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-blue-400" />
                      Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={clearAllRecent}
                      className="text-[10px] text-gray-400 hover:text-rose-400 transition"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        onClick={() => {
                          setQuery(term);
                          fetchSuggestions(term);
                        }}
                        className="group flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 hover:border-blue-500/40 border border-white/10 rounded-xl text-xs text-gray-300 hover:text-white cursor-pointer transition"
                      >
                        <History className="w-3 h-3 text-gray-500 group-hover:text-blue-400 transition-colors" />
                        <span>{term}</span>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(e, term)}
                          className="text-gray-500 hover:text-rose-400 p-0.5 rounded-full"
                          title="Remove"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              {popularList.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-2.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    Trending Searches
                  </span>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {popularList.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          setQuery(term);
                          fetchSuggestions(term);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600/15 to-blue-500/10 hover:from-blue-600/30 hover:to-blue-500/20 border border-blue-500/30 hover:border-blue-400/60 rounded-xl text-xs font-medium text-gray-200 hover:text-white transition shadow-sm"
                      >
                        <TrendingUp className="w-3 h-3 text-blue-400" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Categories Navigation */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-2.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
                  Quick Explore Categories
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Consoles', slug: 'consoles' },
                    { label: 'Games', slug: 'games' },
                    { label: 'Accessories', slug: 'accessories' },
                    { label: '3D Figures', slug: 'custom-3d-figures' },
                  ].map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition text-left"
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-xs font-semibold text-gray-200">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: Active Query - Products & Suggestions */}
          {hasQuery && (
            <div className="max-h-[75vh] overflow-y-auto">
              {/* Matching Categories Header if any */}
              {suggestions.categories?.length > 0 && (
                <div className="px-4 py-2.5 bg-white/[0.02] flex items-center gap-2 overflow-x-auto">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-cyan-400" />
                    Categories:
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {suggestions.categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleCategorySelect(c)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 transition"
                      >
                        {c.name} {c.platform ? `(${c.platform})` : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Products List */}
              {suggestions.products.length > 0 ? (
                <div className="p-2 sm:p-3 space-y-1">
                  <div className="px-3 py-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    <span>Matching Products ({suggestions.totalMatches})</span>
                    <span className="text-[10px] text-gray-500 font-normal lowercase">
                      press enter or click to open
                    </span>
                  </div>

                  {suggestions.products.map((product, idx) => {
                    const isSelected = selectedIndex === idx;
                    const badge = getBadgeStyle(product.matchedReason);

                    return (
                      <div
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`group flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-600/25 via-blue-500/15 to-transparent border border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0 flex items-center justify-center">
                          {product.featuredImage ? (
                            <img
                              src={getMediaUrl(product.featuredImage)}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <Gamepad2 className="w-6 h-6 text-gray-600" />
                          )}
                          {product.condition === 'Used' && (
                            <span className="absolute top-0.5 left-0.5 px-1 py-0.2 text-[8px] font-bold bg-amber-500 text-black rounded">
                              Used
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                              {renderHighlighted(product.title, query)}
                            </h4>

                            {badge && (
                              <span
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${badge.bg}`}
                              >
                                {badge.icon}
                                <span>{product.matchedReason}</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-gray-400">
                            {product.category?.name && (
                              <span className="text-gray-300 font-medium">
                                {product.category.name}
                              </span>
                            )}
                            {product.platform && (
                              <>
                                <span>•</span>
                                <span className="px-1.5 py-0.2 bg-white/10 text-gray-200 rounded text-[10px] font-semibold">
                                  {product.platform}
                                </span>
                              </>
                            )}
                            {product.modelNumber && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-[10px] text-gray-400">
                                  {product.modelNumber}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Price & Stock */}
                        <div className="text-right shrink-0">
                          <div className="text-xs sm:text-sm font-extrabold text-white">
                            Rs {Number(product.price || 0).toLocaleString()}
                          </div>
                          <span
                            className={`text-[10px] font-semibold ${
                              product.inStock ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>

                        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors shrink-0" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                !loading && (
                  <div className="p-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-400">
                      <Search className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        No results found for "{query}"
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                        Try searching with aliases like{' '}
                        <span className="text-blue-400 font-semibold">GTA 5, RDR, PS5</span>, or
                        browse by category.
                      </p>
                    </div>
                    {popularList.length > 0 && (
                      <div className="pt-2 flex flex-wrap justify-center gap-1.5">
                        {popularList.slice(0, 5).map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => {
                              setQuery(term);
                              fetchSuggestions(term);
                            }}
                            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-300 hover:text-white transition"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}

          {/* Footer Action */}
          {hasQuery && (
            <div className="p-3 bg-[#050b28]/95 flex items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={() => executeSearch(query)}
                className="flex items-center gap-2 font-bold text-blue-400 hover:text-blue-300 transition"
              >
                <span>View all {suggestions.totalMatches} results in Shop</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="hidden sm:flex items-center gap-3 text-[10px] text-gray-500 font-mono">
                <span>[↑↓] navigate</span>
                <span>[↵] select</span>
                <span>[ESC] close</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
