import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShoppingCart, ChevronLeft, Check, Minus, Plus, ShieldCheck, Truck, Heart, 
  Sparkles, Layers, Box, Cpu, HardDrive, Palette, Award, PackageCheck, AlertTriangle,
  Zap, ListFilter, CheckCircle2
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { storeApi } from '../api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getMediaUrl } from '../utils';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function ProductPage() {
  const { id } = useParams();
  const { addItem, setIsOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { data, loading, error } = useFetch(() => storeApi.getProduct(id), [id]);

  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedEdition, setSelectedEdition] = useState('');
  const [selectedBundle, setSelectedBundle] = useState('');
  const [showAllVariationsList, setShowAllVariationsList] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = data?.data;
  const variations = useMemo(() => product?.variations || [], [product]);

  // Extract distinct variation dimensions
  const platforms = useMemo(
    () => [...new Set(variations.map((v) => v.platform).filter(Boolean))],
    [variations]
  );
  const conditions = useMemo(
    () => [...new Set(variations.map((v) => v.condition).filter(Boolean))],
    [variations]
  );
  const storages = useMemo(
    () => [...new Set(variations.map((v) => v.storage).filter(Boolean))],
    [variations]
  );
  const colors = useMemo(
    () => [...new Set(variations.map((v) => v.color).filter(Boolean))],
    [variations]
  );
  const editions = useMemo(
    () => [...new Set(variations.map((v) => v.edition).filter(Boolean))],
    [variations]
  );
  const bundles = useMemo(
    () => [...new Set(variations.map((v) => v.bundle).filter(Boolean))],
    [variations]
  );

  // Initialize selected variation on load
  useEffect(() => {
    if (variations.length > 0 && !selectedVariation) {
      const inStockVar = variations.find((v) => v.stockQuantity > 0) || variations[0];
      setSelectedVariation(inStockVar);
      setSelectedPlatform(inStockVar.platform || '');
      setSelectedCondition(inStockVar.condition || product?.condition || 'New');
      setSelectedStorage(inStockVar.storage || '');
      setSelectedColor(inStockVar.color || '');
      setSelectedEdition(inStockVar.edition || '');
      setSelectedBundle(inStockVar.bundle || '');
    }
  }, [variations, product]);

  const activeVar = selectedVariation || variations[0];
  const inStock = activeVar && activeVar.stockQuantity > 0;
  const isLowStock = inStock && activeVar.stockQuantity <= (activeVar.lowStockThreshold || 5);
  const favorited = isInWishlist(product?.id);

  // Find best variation matching target filters
  const findMatchingVariation = (target) => {
    // Score each variation by matched dimensions
    let bestMatch = variations[0];
    let bestScore = -1;

    for (const v of variations) {
      let score = 0;
      if (target.platform && v.platform === target.platform) score += 5;
      if (target.condition && v.condition === target.condition) score += 4;
      if (target.storage && v.storage === target.storage) score += 3;
      if (target.color && v.color === target.color) score += 3;
      if (target.edition && v.edition === target.edition) score += 2;
      if (target.bundle && v.bundle === target.bundle) score += 2;
      if (v.stockQuantity > 0) score += 1;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = v;
      }
    }
    return bestMatch;
  };

  const handleSelectDimension = (dimension, value) => {
    const updated = {
      platform: dimension === 'platform' ? value : selectedPlatform,
      condition: dimension === 'condition' ? value : selectedCondition,
      storage: dimension === 'storage' ? value : selectedStorage,
      color: dimension === 'color' ? value : selectedColor,
      edition: dimension === 'edition' ? value : selectedEdition,
      bundle: dimension === 'bundle' ? value : selectedBundle,
    };

    if (dimension === 'platform') setSelectedPlatform(value);
    if (dimension === 'condition') setSelectedCondition(value);
    if (dimension === 'storage') setSelectedStorage(value);
    if (dimension === 'color') setSelectedColor(value);
    if (dimension === 'edition') setSelectedEdition(value);
    if (dimension === 'bundle') setSelectedBundle(value);

    const match = findMatchingVariation(updated);
    if (match) {
      setSelectedVariation(match);
      setSelectedPlatform(match.platform || '');
      setSelectedCondition(match.condition || product?.condition || 'New');
      setSelectedStorage(match.storage || '');
      setSelectedColor(match.color || '');
      setSelectedEdition(match.edition || '');
      setSelectedBundle(match.bundle || '');
      setQuantity(1);
    }
  };

  const handleSelectVariationDirect = (v) => {
    setSelectedVariation(v);
    setSelectedPlatform(v.platform || '');
    setSelectedCondition(v.condition || product?.condition || 'New');
    setSelectedStorage(v.storage || '');
    setSelectedColor(v.color || '');
    setSelectedEdition(v.edition || '');
    setSelectedBundle(v.bundle || '');
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!activeVar || !inStock) return;
    addItem(product, activeVar, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleQuickBuy = () => {
    if (!activeVar || !inStock) return;
    addItem(product, activeVar, quantity);
    setIsOpen(false);
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-[60vh]" />;
  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="store-muted">{error || 'Product not found'}</p>
        <Link to="/shop" className="store-link text-sm mt-4 inline-block">Back to Shop</Link>
      </div>
    );
  }

  const images = product.media || [];
  const mainImage = getMediaUrl(images.find((m) => m.isFeatured)?.url || images[0]?.url);

  // Check if multiple variation dimensions exist
  const hasMultipleDimensions =
    platforms.length > 1 ||
    conditions.length > 1 ||
    storages.length > 1 ||
    colors.length > 1 ||
    editions.length > 1 ||
    bundles.length > 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      <Link to="/shop" className="inline-flex items-center gap-1 text-sm store-muted hover:text-neon-purple mb-6 transition">
        <ChevronLeft className="w-4 h-4" /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Media Column */}
        <div>
          <div className="aspect-square rounded-2xl bg-black/30 overflow-hidden store-glass-panel border border-neon-purple/20 relative group">
            {mainImage ? (
              <img src={mainImage} alt={product.title} className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
            )}

            {/* Active Variation Badges on Image */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
              {activeVar?.condition && (
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider backdrop-blur-md shadow-md flex items-center gap-1 ${
                  activeVar.condition === 'New'
                    ? 'bg-emerald-500/90 text-white'
                    : 'bg-amber-500/90 text-black font-extrabold'
                }`}>
                  <Sparkles className="w-3 h-3" />
                  {activeVar.condition === 'New' ? 'Brand New' : 'Pre-Owned'}
                </span>
              )}
              {activeVar?.bundle && (
                <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-purple-600/90 text-white backdrop-blur-md shadow-md flex items-center gap-1">
                  <Box className="w-3 h-3" /> Bundle
                </span>
              )}
            </div>

            {product.isFlashSale && (
              <span className="absolute top-4 right-4 px-3 py-1 bg-red-600 text-white text-xs font-extrabold rounded-lg uppercase tracking-wider shadow-lg">
                Flash Sale
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {images.map((img) => (
                <div key={img.id} className="w-16 h-16 rounded-xl overflow-hidden store-glass-panel shrink-0 bg-black/20 border border-white/10 hover:border-neon-purple transition">
                  <img src={getMediaUrl(img.url)} alt="" className="w-full h-full object-contain p-1" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Column */}
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {product.category && (
                <span className="text-xs px-2.5 py-1 rounded-lg bg-neon-purple/15 text-neon-purple-light font-semibold border border-neon-purple/30">
                  {product.category.name}
                </span>
              )}
              {activeVar?.platform && (
                <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-300 font-semibold border border-blue-500/30 flex items-center gap-1">
                  <Cpu className="w-3 h-3" /> {activeVar.platform}
                </span>
              )}
              {product.isFeatured && (
                <span className="store-badge-featured text-xs px-2.5 py-0.5">Featured</span>
              )}
            </div>

            <h1 className="store-page-title mb-2">{product.title}</h1>

            {/* Price & SKU Header */}
            <div className="flex flex-wrap items-baseline gap-3 my-4">
              <p className="text-3xl sm:text-4xl font-extrabold text-white">
                {activeVar ? formatCurrency(activeVar.price) : '—'}
              </p>
              {activeVar?.sku && (
                <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  SKU: {activeVar.sku}
                </span>
              )}
            </div>

            {/* In-Stock / Availability Alert */}
            <div className="flex items-center gap-2 text-sm font-medium">
              {inStock ? (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg ${
                  isLowStock ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                  {isLowStock ? `Only ${activeVar.stockQuantity} left in stock - order soon!` : 'In Stock & Ready to Ship'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30">
                  <AlertTriangle className="w-4 h-4" /> Currently Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Value Props Bar */}
          <div className="grid grid-cols-2 gap-3 py-3 border-y border-white/10">
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <ShieldCheck className="w-4 h-4 text-neon-purple shrink-0" />
              <span>100% Genuine Warranty</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <Truck className="w-4 h-4 text-neon-purple shrink-0" />
              <span>Fast Express Dispatch</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MULTI-DIMENSIONAL VARIATION SELECTOR */}
          {/* ========================================================================= */}
          {variations.length > 0 && (
            <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-neon-purple" /> Select Product Configuration
                </h3>
                {variations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setShowAllVariationsList(!showAllVariationsList)}
                    className="text-xs text-neon-purple-light hover:text-white flex items-center gap-1 transition"
                  >
                    <ListFilter className="w-3.5 h-3.5" />
                    {showAllVariationsList ? 'Hide Package List' : 'Compare All Packages'}
                  </button>
                )}
              </div>

              {/* 1. Platform Variation */}
              {platforms.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-blue-400" /> Platform:
                    <span className="text-white font-bold">{selectedPlatform || 'Default'}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {platforms.map((plat) => {
                      const isSelected = (activeVar?.platform || selectedPlatform) === plat;
                      return (
                        <button
                          key={plat}
                          type="button"
                          onClick={() => handleSelectDimension('platform', plat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500/20 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                              : 'border-white/10 text-gray-300 hover:border-white/30 bg-black/30'
                          }`}
                        >
                          {plat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Condition Variation (New vs Used) */}
              {conditions.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Condition:
                    <span className="text-white font-bold">{activeVar?.condition === 'New' ? 'Brand New (Sealed)' : 'Pre-Owned / Tested'}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {conditions.map((cond) => {
                      const isSelected = (activeVar?.condition || selectedCondition) === cond;
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => handleSelectDimension('condition', cond)}
                          className={`p-2.5 rounded-xl text-xs text-left font-bold border transition flex items-center justify-between ${
                            isSelected
                              ? cond === 'New'
                                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                                : 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                              : 'border-white/10 text-gray-300 hover:border-white/30 bg-black/30'
                          }`}
                        >
                          <div>
                            <p className="font-bold">{cond === 'New' ? '✨ Brand New' : '🔄 Pre-Owned'}</p>
                            <p className="text-[10px] text-gray-400 font-normal mt-0.5">
                              {cond === 'New' ? 'Factory sealed with manufacturer warranty' : 'Inspected & tested by technicians'}
                            </p>
                          </div>
                          {isSelected && <Check className="w-4 h-4 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Storage Variation */}
              {storages.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> Storage Capacity:
                    <span className="text-white font-bold">{selectedStorage || activeVar?.storage}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {storages.map((stor) => {
                      const isSelected = (activeVar?.storage || selectedStorage) === stor;
                      return (
                        <button
                          key={stor}
                          type="button"
                          onClick={() => handleSelectDimension('storage', stor)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                              : 'border-white/10 text-gray-300 hover:border-white/30 bg-black/30'
                          }`}
                        >
                          💾 {stor}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Color Variation */}
              {colors.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5 text-pink-400" /> Color:
                    <span className="text-white font-bold">{selectedColor || activeVar?.color}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((col) => {
                      const isSelected = (activeVar?.color || selectedColor) === col;
                      return (
                        <button
                          key={col}
                          type="button"
                          onClick={() => handleSelectDimension('color', col)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                            isSelected
                              ? 'border-neon-purple bg-neon-purple/20 text-white shadow-[0_0_12px_rgba(176,38,255,0.3)]'
                              : 'border-white/10 text-gray-300 hover:border-white/30 bg-black/30'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-400" />
                          <span>{col}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. Edition Variation */}
              {editions.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-indigo-400" /> Edition:
                    <span className="text-white font-bold">{selectedEdition || activeVar?.edition}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {editions.map((ed) => {
                      const isSelected = (activeVar?.edition || selectedEdition) === ed;
                      return (
                        <button
                          key={ed}
                          type="button"
                          onClick={() => handleSelectDimension('edition', ed)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                              : 'border-white/10 text-gray-300 hover:border-white/30 bg-black/30'
                          }`}
                        >
                          ⭐ {ed}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 6. Bundle Variation */}
              {bundles.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                    <Box className="w-3.5 h-3.5 text-purple-400" /> Bundle Package:
                    <span className="text-white font-bold">{selectedBundle || activeVar?.bundle}</span>
                  </label>
                  <div className="flex flex-col gap-2">
                    {bundles.map((bun) => {
                      const isSelected = (activeVar?.bundle || selectedBundle) === bun;
                      return (
                        <button
                          key={bun}
                          type="button"
                          onClick={() => handleSelectDimension('bundle', bun)}
                          className={`p-2.5 rounded-xl text-xs text-left font-semibold border transition flex items-center justify-between ${
                            isSelected
                              ? 'border-purple-500 bg-purple-500/20 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                              : 'border-white/10 text-gray-300 hover:border-white/30 bg-black/30'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Box className="w-4 h-4 text-purple-400 shrink-0" />
                            <span>{bun}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Fallback Single Flat List Selector if few generic variations */}
              {!hasMultipleDimensions && variations.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400">Available Options:</label>
                  <div className="flex flex-wrap gap-2">
                    {variations.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSelectVariationDirect(v)}
                        disabled={v.stockQuantity <= 0}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition ${
                          activeVar?.id === v.id
                            ? 'border-neon-purple bg-neon-purple/20 text-white shadow-[0_0_12px_rgba(176,38,255,0.3)]'
                            : v.stockQuantity <= 0
                              ? 'border-white/10 text-gray-600 cursor-not-allowed line-through'
                              : 'border-white/15 text-gray-300 hover:border-neon-purple/50 bg-black/30'
                        }`}
                      >
                        {[v.platform, v.condition, v.storage, v.color, v.edition, v.bundle].filter(Boolean).join(' · ') || v.sku}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Comparison Table Toggle */}
              {showAllVariationsList && variations.length > 1 && (
                <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                  <p className="text-xs font-bold text-gray-300">All Available Packages:</p>
                  <div className="divide-y divide-white/10 rounded-xl bg-black/40 border border-white/10 overflow-hidden text-xs">
                    {variations.map((v) => {
                      const isSelected = activeVar?.id === v.id;
                      return (
                        <div
                          key={v.id}
                          onClick={() => handleSelectVariationDirect(v)}
                          className={`p-3 flex items-center justify-between cursor-pointer transition ${
                            isSelected ? 'bg-neon-purple/15 text-white' : 'hover:bg-white/5 text-gray-300'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold">{v.sku}</span>
                              {v.condition && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 font-semibold">{v.condition}</span>
                              )}
                              {v.bundle && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">{v.bundle}</span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400">
                              {[v.platform, v.storage, v.color, v.edition].filter(Boolean).join(' · ') || 'Standard Specs'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-extrabold text-sm text-neon-purple-light">{formatCurrency(v.price)}</p>
                            <p className="text-[10px] text-gray-500">{v.stockQuantity > 0 ? `${v.stockQuantity} in stock` : 'Out of Stock'}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-2">
            {inStock && (
              <div className="flex items-center gap-4">
                <p className="text-sm font-semibold text-white">Quantity:</p>
                <div className="flex items-center gap-2 bg-black/40 border border-white/15 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-extrabold w-8 text-center text-white">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(quantity + 1, activeVar.stockQuantity))}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-gray-400">({activeVar.stockQuantity} available)</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`store-btn-primary flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                  !inStock
                    ? 'opacity-50 cursor-not-allowed bg-gray-800'
                    : added
                    ? 'from-emerald-600 to-emerald-500'
                    : 'hover:scale-[1.02]'
                }`}
                style={added ? { background: 'linear-gradient(to right, #059669, #10b981)' } : undefined}
              >
                {added ? (
                  <><Check className="w-5 h-5" /> Added to Cart</>
                ) : inStock ? (
                  <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
                ) : (
                  'Out of Stock'
                )}
              </button>

              <button
                type="button"
                onClick={handleQuickBuy}
                disabled={!inStock}
                className={`py-3.5 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-1.5 transition ${
                  !inStock
                    ? 'opacity-50 cursor-not-allowed bg-white/5 border border-white/10'
                    : 'bg-gradient-to-r from-neon-purple to-indigo-600 hover:from-neon-purple-light hover:to-indigo-500 shadow-neon-purple/40 hover:scale-[1.02]'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" /> Quick Buy
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm shrink-0 ${
                  favorited
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                    : 'bg-white/5 border-white/15 text-gray-300 hover:text-white hover:border-rose-500/40 hover:bg-rose-500/10'
                }`}
                title={favorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
                aria-label={favorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-5 h-5 transition-transform ${favorited ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
                <span className="hidden sm:inline">{favorited ? 'Saved' : 'Wishlist'}</span>
              </button>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-sm font-bold text-white mb-2">About this item</h3>
              <p className="text-gray-400 leading-relaxed text-sm whitespace-pre-line">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductPage;

