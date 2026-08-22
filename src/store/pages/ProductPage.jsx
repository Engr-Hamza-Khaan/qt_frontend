import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, ChevronLeft, Check, Minus, Plus, ShieldCheck, Truck, Heart,
  Sparkles, Layers, Box, Cpu, HardDrive, Palette, Award, AlertTriangle,
  Zap, ListFilter, CheckCircle2, Info, Sliders, Building2
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
  const navigate = useNavigate();
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
  const [activeTab, setActiveTab] = useState('attributes'); // 'attributes' | 'variations' | 'specs' | 'description'
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = data?.data;
  const rawVariations = useMemo(() => product?.variations || [], [product]);

  // Dynamically extract distinct variation dimensions from backend product variations
  const platforms = useMemo(
    () => [...new Set(rawVariations.map((v) => v.platform).filter(Boolean))],
    [rawVariations]
  );
  const conditions = useMemo(
    () => [...new Set(rawVariations.map((v) => v.condition).filter(Boolean))],
    [rawVariations]
  );
  const storages = useMemo(
    () => [...new Set(rawVariations.map((v) => v.storage).filter(Boolean))],
    [rawVariations]
  );
  const colors = useMemo(
    () => [...new Set(rawVariations.map((v) => v.color).filter(Boolean))],
    [rawVariations]
  );
  const editions = useMemo(
    () => [...new Set(rawVariations.map((v) => v.edition).filter(Boolean))],
    [rawVariations]
  );
  const bundles = useMemo(
    () => [...new Set(rawVariations.map((v) => v.bundle).filter(Boolean))],
    [rawVariations]
  );

  // Initialize selected variation on load
  useEffect(() => {
    if (rawVariations.length > 0 && !selectedVariation) {
      const inStockVar = rawVariations.find((v) => v.stockQuantity > 0) || rawVariations[0];
      setSelectedVariation(inStockVar);
      setSelectedPlatform(inStockVar.platform || '');
      setSelectedCondition(inStockVar.condition || product?.condition || '');
      setSelectedStorage(inStockVar.storage || '');
      setSelectedColor(inStockVar.color || '');
      setSelectedEdition(inStockVar.edition || '');
      setSelectedBundle(inStockVar.bundle || '');
    }
  }, [rawVariations, product]);

  const activeVar = selectedVariation || rawVariations[0] || null;
  const activePrice = activeVar ? activeVar.price : product?.price || 0;
  const inStock = activeVar ? (activeVar.stockQuantity > 0) : true;
  const isLowStock = inStock && activeVar?.stockQuantity !== undefined && activeVar.stockQuantity <= (activeVar.lowStockThreshold || 5);
  const favorited = isInWishlist(product?.id);

  // Fully Dynamic Attributes Extraction from API Product Data (No hardcoding)
  const allAttributes = useMemo(() => {
    if (!product) return {};

    const attrs = {};

    // 1. Dynamic brand detection (from attributes.brand / publisher / vendor / tags)
    const brand =
      product.attributes?.brand ||
      product.attributes?.publisher ||
      product.vendor?.companyName ||
      (Array.isArray(product.tags)
        ? product.tags.find((t) =>
          ['Sony', 'Microsoft', 'Nintendo', 'EA', 'Rockstar', 'Capcom', 'Ubisoft', 'Sega', 'Bandai Namco'].includes(t)
        )
        : null);
    if (brand) attrs['Brand'] = brand;

    // 2. Standard product & active variation properties
    const platform = activeVar?.platform || selectedPlatform || product.attributes?.platform || product.category?.platform;
    if (platform) attrs['Platform'] = platform;

    const condition = activeVar?.condition || selectedCondition || product.condition;
    if (condition) attrs['Condition'] = condition;

    const edition = activeVar?.edition || selectedEdition || product.attributes?.edition;
    if (edition) attrs['Edition'] = edition;

    const color = activeVar?.color || selectedColor || product.attributes?.color;
    if (color) attrs['Color'] = color;

    const storage = activeVar?.storage || selectedStorage || product.attributes?.storage;
    if (storage) attrs['Storage'] = storage;

    const bundle = activeVar?.bundle || selectedBundle || product.attributes?.bundle;
    if (bundle) attrs['Bundle'] = bundle;

    if (activeVar?.sku || product.modelNumber) attrs['SKU / Model'] = activeVar?.sku || product.modelNumber;

    // 3. Dynamic JSON Key-Value pairs from backend product.attributes
    if (product.attributes && typeof product.attributes === 'object') {
      Object.entries(product.attributes).forEach(([key, val]) => {
        if (val !== null && val !== undefined && val !== '') {
          const formattedKey = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
          if (!attrs[formattedKey]) {
            attrs[formattedKey] = typeof val === 'object' ? JSON.stringify(val) : String(val);
          }
        }
      });
    }

    // 4. Dynamic JSON Key-Value pairs from backend product.specifications
    if (product.specifications && typeof product.specifications === 'object') {
      Object.entries(product.specifications).forEach(([key, val]) => {
        if (val !== null && val !== undefined && val !== '') {
          const formattedKey = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
          if (!attrs[formattedKey]) {
            attrs[formattedKey] = typeof val === 'object' ? JSON.stringify(val) : String(val);
          }
        }
      });
    }

    return attrs;
  }, [product, activeVar, selectedPlatform, selectedCondition, selectedEdition, selectedColor, selectedStorage, selectedBundle]);

  // Find best variation matching target filters, prioritizing the dimension that was clicked
  const findMatchingVariation = (target, changedDimension = null) => {
    if (!rawVariations || rawVariations.length === 0) return null;
    let bestMatch = null;
    let bestScore = -Infinity;

    for (const v of rawVariations) {
      let score = 0;

      // 1. Give highest priority to matching the dimension the user explicitly clicked
      if (changedDimension && target[changedDimension]) {
        const targetVal = String(target[changedDimension]).trim().toLowerCase();
        const vVal = v[changedDimension] ? String(v[changedDimension]).trim().toLowerCase() : '';

        if (vVal === targetVal) {
          score += 1000;
        } else {
          score -= 500;
        }
      }

      // 2. Score other target dimensions
      const dimensions = ['platform', 'condition', 'storage', 'color', 'edition', 'bundle'];
      for (const dim of dimensions) {
        if (target[dim]) {
          const targetVal = String(target[dim]).trim().toLowerCase();
          const vVal = v[dim] ? String(v[dim]).trim().toLowerCase() : '';

          if (vVal === targetVal) {
            score += 100;
          } else if (!vVal) {
            score += 10;
          } else {
            score -= 5;
          }
        }
      }

      // 3. Prefer in-stock items
      if (v.stockQuantity > 0) {
        score += 50;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = v;
      }
    }

    return bestMatch || rawVariations[0];
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

    const match = findMatchingVariation(updated, dimension);
    if (match) {
      setSelectedVariation(match);
      setSelectedPlatform(match.platform || (dimension === 'platform' ? value : ''));
      setSelectedCondition(match.condition || (dimension === 'condition' ? value : ''));
      setSelectedStorage(match.storage || (dimension === 'storage' ? value : ''));
      setSelectedColor(match.color || (dimension === 'color' ? value : ''));
      setSelectedEdition(match.edition || (dimension === 'edition' ? value : ''));
      setSelectedBundle(match.bundle || (dimension === 'bundle' ? value : ''));
      setQuantity(1);
    }
  };

  const handleSelectVariationDirect = (v) => {
    setSelectedVariation(v);
    setSelectedPlatform(v.platform || '');
    setSelectedCondition(v.condition || '');
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
    navigate('/checkout');
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
  const attributeEntries = Object.entries(allAttributes);
  const hasMultipleDimensions =
    platforms.length > 1 ||
    conditions.length > 1 ||
    storages.length > 1 ||
    colors.length > 1 ||
    editions.length > 1 ||
    bundles.length > 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/shop" className="inline-flex items-center gap-1 text-sm store-muted hover:text-neon-purple transition">
          <ChevronLeft className="w-4 h-4" /> Back to Shop
        </Link>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Home</span> / <span>{product.category?.name || 'Store'}</span>
          {allAttributes['Brand'] && <> / <span className="text-white font-medium">{allAttributes['Brand']}</span></>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Column: Media Gallery & Dynamic Key Attributes Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-[3/4] rounded-2xl bg-black/30 overflow-hidden store-glass-panel border border-neon-purple/20 relative group">
            {mainImage ? (
              <img src={mainImage} alt={product.title} className="w-full h-full object-fill transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
            )}

            {/* Overlaid Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
              {allAttributes['Condition'] && (
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider backdrop-blur-md shadow-md flex items-center gap-1 ${allAttributes['Condition'] === 'New'
                    ? 'bg-emerald-500/90 text-white'
                    : 'bg-amber-500/90 text-black font-extrabold'
                  }`}>
                  <Sparkles className="w-3 h-3" />
                  {allAttributes['Condition'] === 'New' ? 'Brand New' : 'Pre-Owned'}
                </span>
              )}
              {allAttributes['Edition'] && (
                <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-600/90 text-white backdrop-blur-md shadow-md flex items-center gap-1">
                  <Award className="w-3 h-3" /> {allAttributes['Edition']}
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
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {images.map((img) => (
                <div key={img.id} className="w-16 h-16 rounded-xl overflow-hidden store-glass-panel shrink-0 bg-black/20 border border-white/10 hover:border-neon-purple transition">
                  <img src={getMediaUrl(img.url)} alt="" className="w-full h-full object-fill" />
                </div>
              ))}
            </div>
          )}

          {/* Dynamic Key Attributes Card (Driven 100% by DB Data) */}
          {attributeEntries.length > 0 && (
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-neon-purple-light flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-neon-purple" /> Key Attributes
              </h3>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {attributeEntries.slice(0, 8).map(([key, val]) => (
                  <div key={key} className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                    <span className="text-gray-400">{key}</span>
                    <span className="font-bold text-white truncate max-w-[110px]" title={val}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Title, Dynamic Variations & Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {(activeVar?.condition || selectedCondition || product.condition) && (
                <span className={`text-xs px-2.5 py-1 rounded-lg font-bold border flex items-center gap-1 uppercase tracking-wider ${
                  (activeVar?.condition || selectedCondition || product.condition) === 'New'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                }`}>
                  <Sparkles className="w-3 h-3" />
                  {(activeVar?.condition || selectedCondition || product.condition) === 'New' ? 'Brand New' : 'Pre-Owned'}
                </span>
              )}
              {allAttributes['Platform'] && (
                <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-300 font-semibold border border-blue-500/30 flex items-center gap-1">
                  <Cpu className="w-3 h-3" /> {allAttributes['Platform']}
                </span>
              )}
              {allAttributes['Brand'] && (
                <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/30 flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> {allAttributes['Brand']}
                </span>
              )}
              {product.isFeatured && (
                <span className="store-badge-featured text-xs px-2.5 py-0.5">Featured</span>
              )}
            </div>

            <h1 className="store-page-title text-2xl sm:text-3xl font-black mb-3">{product.title}</h1>

            {/* Dynamic Price & SKU Header */}
            <div className="flex flex-wrap items-baseline gap-3 my-3">
              <p className="text-3xl sm:text-4xl font-extrabold text-white">
                {formatCurrency(activePrice)}
              </p>
              {activeVar?.sku && (
                <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 font-mono">
                  SKU: {activeVar.sku}
                </span>
              )}
            </div>

            {/* Stock Availability Indicator */}
            <div className="flex items-center gap-2 text-sm font-medium">
              {inStock ? (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg ${isLowStock ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  }`}>
                  <CheckCircle2 className="w-4 h-4" />
                  {isLowStock && activeVar?.stockQuantity ? `Only ${activeVar.stockQuantity} left in stock!` : 'In Stock & Ready to Ship'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30">
                  <AlertTriangle className="w-4 h-4" /> Currently Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-2 gap-3 py-3 border-y border-white/10">
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <ShieldCheck className="w-4.5 h-4.5 text-neon-purple shrink-0" />
              <span>100% Genuine Product Guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <Truck className="w-4.5 h-4.5 text-neon-purple shrink-0" />
              <span>Fast Express Shipping</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* DYNAMIC PRODUCT VARIATIONS SECTION */}
          {/* ========================================================================= */}
          {rawVariations.length > 0 && (
            <div className="space-y-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4.5 h-4.5 text-neon-purple" /> Select Variation
                </h3>
                {rawVariations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setShowAllVariationsList(!showAllVariationsList)}
                    className="text-xs text-neon-purple-light hover:text-white flex items-center gap-1 transition font-semibold"
                  >
                    <ListFilter className="w-3.5 h-3.5" />
                    {showAllVariationsList ? 'Hide List' : 'Compare All Packages'}
                  </button>
                )}
              </div>

              {/* 1. Edition Variations */}
              {editions.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-indigo-300 font-bold">
                      <Award className="w-3.5 h-3.5 text-indigo-400" /> Edition:
                    </span>
                    <span className="text-white font-bold">{activeVar?.edition || selectedEdition}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {editions.map((ed) => {
                      const isSelected = String(activeVar?.edition || selectedEdition || '').toLowerCase() === String(ed).toLowerCase();
                      return (
                        <button
                          key={ed}
                          type="button"
                          onClick={() => handleSelectDimension('edition', ed)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${isSelected
                              ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                              : 'border-white/10 text-gray-300 hover:border-white/30 bg-black/30'
                            }`}
                        >
                          <Award className="w-3 h-3 text-indigo-400" /> {ed}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Color Variations */}
              {colors.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-pink-300 font-bold">
                      <Palette className="w-3.5 h-3.5 text-pink-400" /> Color:
                    </span>
                    <span className="text-white font-bold">{activeVar?.color || selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((col) => {
                      const isSelected = String(activeVar?.color || selectedColor || '').toLowerCase() === String(col).toLowerCase();
                      return (
                        <button
                          key={col}
                          type="button"
                          onClick={() => handleSelectDimension('color', col)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${isSelected
                              ? 'border-pink-500 bg-pink-500/20 text-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.3)]'
                              : 'border-white/10 text-gray-300 hover:border-white/30 bg-black/30'
                            }`}
                        >
                          <span className={`w-3 h-3 rounded-full ${col.toLowerCase().includes('black')
                              ? 'bg-gray-900 border border-gray-600'
                              : col.toLowerCase().includes('white')
                                ? 'bg-white'
                                : col.toLowerCase().includes('red')
                                  ? 'bg-red-500'
                                  : 'bg-purple-500'
                            }`} />
                          <span>{col}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Storage Variations */}
              {storages.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-emerald-300 font-bold">
                      <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> Storage Capacity:
                    </span>
                    <span className="text-white font-bold">{activeVar?.storage || selectedStorage}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {storages.map((stor) => {
                      const isSelected = String(activeVar?.storage || selectedStorage || '').toLowerCase() === String(stor).toLowerCase();
                      return (
                        <button
                          key={stor}
                          type="button"
                          onClick={() => handleSelectDimension('storage', stor)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${isSelected
                              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                              : 'border-white/10 text-gray-300 hover:border-white/30 bg-black/30'
                            }`}
                        >
                          <HardDrive className="w-3 h-3 text-emerald-400" /> {stor}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Platform Variations */}
              {platforms.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-blue-300 font-bold">
                      <Cpu className="w-3.5 h-3.5 text-blue-400" /> Platform:
                    </span>
                    <span className="text-white font-bold">{activeVar?.platform || selectedPlatform}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {platforms.map((plat) => {
                      const isSelected = String(activeVar?.platform || selectedPlatform || '').toLowerCase() === String(plat).toLowerCase();
                      return (
                        <button
                          key={plat}
                          type="button"
                          onClick={() => handleSelectDimension('platform', plat)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${isSelected
                              ? 'border-blue-500 bg-blue-500/20 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                              : 'border-white/10 text-gray-300 hover:border-white/30 bg-black/30'
                            }`}
                        >
                          <Cpu className="w-3 h-3 text-blue-400" /> {plat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. Condition Variations */}
              {conditions.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-amber-300 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Condition:
                    </span>
                    <span className="text-white font-bold">{(activeVar?.condition || selectedCondition) === 'New' ? 'Brand New' : (activeVar?.condition || selectedCondition || 'Pre-Owned')}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {conditions.map((cond) => {
                      const isSelected = String(activeVar?.condition || selectedCondition || '').toLowerCase() === String(cond).toLowerCase();
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => handleSelectDimension('condition', cond)}
                          className={`p-2.5 rounded-xl text-xs text-left font-bold border transition flex items-center justify-between ${isSelected
                              ? cond === 'New'
                                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                                : 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                              : 'border-white/10 text-gray-300 hover:border-white/30 bg-black/30'
                            }`}
                        >
                          <div>
                            <p className="font-bold flex items-center gap-1">
                              {cond === 'New' ? '✨ Brand New' : `🔄 ${cond}`}
                            </p>
                          </div>
                          {isSelected && <Check className="w-4 h-4 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 6. Bundle Variations */}
              {bundles.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-purple-300 font-bold">
                      <Box className="w-3.5 h-3.5 text-purple-400" /> Bundle Package:
                    </span>
                    <span className="text-white font-bold">{activeVar?.bundle || selectedBundle}</span>
                  </label>
                  <div className="flex flex-col gap-2">
                    {bundles.map((bun) => {
                      const isSelected = String(activeVar?.bundle || selectedBundle || '').toLowerCase() === String(bun).toLowerCase();
                      return (
                        <button
                          key={bun}
                          type="button"
                          onClick={() => handleSelectDimension('bundle', bun)}
                          className={`p-2.5 rounded-xl text-xs text-left font-semibold border transition flex items-center justify-between ${isSelected
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

              {/* Generic single flat variation list if single variation dimensions exist */}
              {!hasMultipleDimensions && rawVariations.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400">Available Variations:</label>
                  <div className="flex flex-wrap gap-2">
                    {rawVariations.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSelectVariationDirect(v)}
                        disabled={v.stockQuantity <= 0}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition ${activeVar?.id === v.id
                            ? 'border-neon-purple bg-neon-purple/20 text-white shadow-[0_0_12px_rgba(176,38,255,0.3)]'
                            : v.stockQuantity <= 0
                              ? 'border-white/10 text-gray-600 cursor-not-allowed line-through'
                              : 'border-white/15 text-gray-300 hover:border-neon-purple/50 bg-black/30'
                          }`}
                      >
                        {[v.edition, v.storage, v.color, v.condition, v.bundle].filter(Boolean).join(' · ') || v.sku}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Comparison List View */}
              {showAllVariationsList && rawVariations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                  <p className="text-xs font-bold text-gray-300">All Database Variation Packages:</p>
                  <div className="divide-y divide-white/10 rounded-xl bg-black/40 border border-white/10 overflow-hidden text-xs">
                    {rawVariations.map((v) => {
                      const isSelected = activeVar?.id === v.id;
                      return (
                        <div
                          key={v.id}
                          onClick={() => handleSelectVariationDirect(v)}
                          className={`p-3 flex items-center justify-between cursor-pointer transition ${isSelected ? 'bg-neon-purple/15 text-white' : 'hover:bg-white/5 text-gray-300'
                            }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold font-mono">{v.sku}</span>
                              {v.condition && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 font-semibold">{v.condition}</span>
                              )}
                              {v.edition && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">{v.edition}</span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400">
                              {[v.platform, v.storage, v.color, v.bundle].filter(Boolean).join(' · ') || 'Standard Specs'}
                            </p>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <p className="font-extrabold text-sm text-neon-purple-light">{formatCurrency(v.price)}</p>
                              <p className="text-[10px] text-gray-500">{v.stockQuantity > 0 ? `${v.stockQuantity} in stock` : 'Out of Stock'}</p>
                            </div>
                            <span className={`px-2.5 py-1 text-[11px] rounded-lg font-bold flex items-center gap-1 shrink-0 ${isSelected
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                : 'bg-white/10 text-gray-400'
                              }`}>
                              {isSelected ? <><Check className="w-3 h-3 text-emerald-400" /> Selected</> : 'Select'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dynamic Active Selection Summary */}
          {activeVar && (
            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-neon-purple/30 text-xs flex flex-wrap items-center justify-between gap-2">
              <span className="text-gray-300">
                Selected Package: <strong className="text-white">{product.title}</strong> {[activeVar.edition, activeVar.storage, activeVar.color, activeVar.condition].filter(Boolean).join(' · ')}
              </span>
              <span className="text-neon-purple-light font-bold font-mono">{formatCurrency(activePrice)}</span>
            </div>
          )}

          {/* Quantity and Action Buttons */}
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
                    onClick={() => setQuantity(Math.min(quantity + 1, activeVar?.stockQuantity || 99))}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {activeVar?.stockQuantity !== undefined && (
                  <span className="text-xs text-gray-400">({activeVar.stockQuantity} available)</span>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`store-btn-primary flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${!inStock
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
                className={`py-3.5 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-1.5 transition ${!inStock
                    ? 'opacity-50 cursor-not-allowed bg-white/5 border border-white/10'
                    : 'bg-gradient-to-r from-neon-purple to-indigo-600 hover:from-neon-purple-light hover:to-indigo-500 shadow-neon-purple/40 hover:scale-[1.02]'
                  }`}
              >
                <Zap className="w-4 h-4 fill-current" /> Quick Buy
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm shrink-0 ${favorited
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
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FULL DYNAMIC SPECIFICATIONS & ATTRIBUTES TABBED SECTION */}
      {/* ========================================================================= */}
      <div className="mt-12 pt-8 border-t border-white/10">
        <div className="flex gap-2 border-b border-white/10 pb-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('attributes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeTab === 'attributes'
                ? 'bg-neon-purple text-white shadow-[0_0_15px_rgba(176,38,255,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <Sliders className="w-4 h-4" /> Attributes Summary
          </button>
          {rawVariations.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('variations')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeTab === 'variations'
                  ? 'bg-neon-purple text-white shadow-[0_0_15px_rgba(176,38,255,0.4)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <Layers className="w-4 h-4" /> Variations Matrix
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('description')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeTab === 'description'
                ? 'bg-neon-purple text-white shadow-[0_0_15px_rgba(176,38,255,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <Info className="w-4 h-4" /> Product Description
          </button>
        </div>

        <div className="py-6">
          {/* Tab 1: Dynamic Attributes Table */}
          {activeTab === 'attributes' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-neon-purple" /> Full Product Specifications & Attributes
              </h3>

              {attributeEntries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attributeEntries.map(([key, val]) => (
                    <div key={key} className="flex justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-sm">
                      <span className="text-gray-400 font-medium">{key}</span>
                      <span className="font-bold text-white text-right font-sans">{val}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No custom attributes listed for this item.</p>
              )}
            </div>
          )}

          {/* Tab 2: Variations Matrix Table */}
          {activeTab === 'variations' && rawVariations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-neon-purple" /> Available Variations & Options Matrix
              </h3>

              <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-white/5 text-gray-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Edition</th>
                      <th className="p-3">Color</th>
                      <th className="p-3">Storage</th>
                      <th className="p-3">Condition</th>
                      <th className="p-3">Bundle</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {rawVariations.map((v) => {
                      const isSelected = activeVar?.id === v.id;
                      return (
                        <tr key={v.id} className={isSelected ? 'bg-neon-purple/15 text-white font-bold' : 'hover:bg-white/5'}>
                          <td className="p-3 font-mono text-neon-purple-light">{v.sku}</td>
                          <td className="p-3">{v.edition || '—'}</td>
                          <td className="p-3">{v.color || '—'}</td>
                          <td className="p-3">{v.storage || '—'}</td>
                          <td className="p-3 font-semibold">{v.condition || '—'}</td>
                          <td className="p-3">{v.bundle || '—'}</td>
                          <td className="p-3 font-bold text-emerald-400">{formatCurrency(v.price)}</td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => handleSelectVariationDirect(v)}
                              className={`px-3 py-1.5 rounded-lg transition font-bold text-xs inline-flex items-center gap-1 ${isSelected
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                  : 'bg-neon-purple/20 text-neon-purple-light hover:bg-neon-purple hover:text-white'
                                }`}
                            >
                              {isSelected ? (
                                <><Check className="w-3.5 h-3.5 text-emerald-400" /> Selected</>
                              ) : (
                                'Select'
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Description */}
          {activeTab === 'description' && (
            <div className="space-y-3 max-w-4xl text-sm leading-relaxed text-gray-300">
              <h3 className="text-base font-bold text-white mb-2">Item Overview</h3>
              <p className="whitespace-pre-line">{product.description || 'No detailed description available for this item.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
