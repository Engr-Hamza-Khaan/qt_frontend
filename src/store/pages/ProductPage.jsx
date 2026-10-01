import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, ChevronLeft, Check, Minus, Plus, Heart,
  Sparkles, Layers, Box, Cpu, HardDrive, Palette, Award, AlertTriangle,
  Zap, ListFilter, CheckCircle2, Info, Sliders, Building2, Play, Film
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { storeApi } from '../api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getMediaUrl } from '../utils';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// Helper to extract or convert YouTube URLs & iframe codes into playable embed links
function getYouTubeEmbedUrl(urlOrCode, fallbackTitle = '') {
  if (!urlOrCode) {
    // Provide nice realistic playable trailer fallbacks for demo items if none is configured
    const lower = (fallbackTitle || '').toLowerCase();
    if (lower.includes('god of war')) return 'https://www.youtube-nocookie.com/embed/EE-4GvjKcfs';
    if (lower.includes('spider') || lower.includes('spiderman')) return 'https://www.youtube-nocookie.com/embed/bgqGdIoa52s';
    if (lower.includes('ps5') || lower.includes('playstation')) return 'https://www.youtube-nocookie.com/embed/RkC0l4iekYo';
    return null;
  }

  // If iframe string was pasted, extract src
  const srcMatch = urlOrCode.match(/src=["']([^"']+)["']/);
  if (srcMatch) return srcMatch[1];

  // Standard YouTube url regex (supports watch?v=, youtu.be, shorts, embed)
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = urlOrCode.match(regExp);
  if (match && match[2].length >= 11) {
    const videoId = match[2].substring(0, 11);
    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
  }

  if (typeof urlOrCode === 'string' && (urlOrCode.includes('youtube.com') || urlOrCode.includes('youtu.be') || urlOrCode.startsWith('http'))) {
    return urlOrCode;
  }

  return null;
}

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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = data?.data;
  const rawVariations = useMemo(() => product?.variations || [], [product]);

  // Extract distinct platforms and conditions
  const platforms = useMemo(() => {
    const fromVars = [...new Set(rawVariations.map((v) => v.platform).filter(Boolean))];
    if (fromVars.length > 0) return fromVars;
    if (product?.attributes?.platform) return [product.attributes.platform];
    return ['PS4', 'PS5', 'NINTENDO'];
  }, [rawVariations, product]);

  const conditions = useMemo(() => {
    const fromVars = [...new Set(rawVariations.map((v) => v.condition).filter(Boolean))];
    if (fromVars.length > 0) return fromVars;
    if (product?.condition) return [product.condition];
    return ['New', 'Used'];
  }, [rawVariations, product]);

  // Initialize selected variation on load
  useEffect(() => {
    if (rawVariations.length > 0 && !selectedVariation) {
      const inStockVar = rawVariations.find((v) => v.stockQuantity > 0) || rawVariations[0];
      setSelectedVariation(inStockVar);
      setSelectedPlatform(inStockVar.platform || platforms[0] || 'PS5');
      setSelectedCondition(inStockVar.condition || product?.condition || 'New');
      setSelectedStorage(inStockVar.storage || '');
      setSelectedColor(inStockVar.color || '');
      setSelectedEdition(inStockVar.edition || '');
      setSelectedBundle(inStockVar.bundle || '');
    } else if (product && !selectedPlatform) {
      setSelectedPlatform(product.attributes?.platform || platforms[0] || 'PS5');
      setSelectedCondition(product.condition || 'New');
    }
  }, [rawVariations, product, platforms]);

  useEffect(() => {
    if (selectedVariation?.imageUrl) {
      setActiveImageIndex(0);
    }
  }, [selectedVariation]);

  const activeVar = selectedVariation || rawVariations[0] || null;
  const activePrice = activeVar?.price ? Number(activeVar.price) : Number(product?.price || 10000);
  const inStock = activeVar ? (activeVar.stockQuantity > 0) : true;
  const isLowStock = inStock && activeVar?.stockQuantity !== undefined && activeVar.stockQuantity <= (activeVar.lowStockThreshold || 5);
  const favorited = isInWishlist(product?.id);

  // Determine category type for dynamic attribute switching (Games vs Consoles vs Others)
  const isConsole = useMemo(() => {
    const catName = (product?.category?.name || '').toLowerCase();
    const catSlug = (product?.category?.slug || '').toLowerCase();
    const title = (product?.title || '').toLowerCase();
    return (
      catName.includes('console') ||
      catSlug.includes('console') ||
      catName.includes('hardware') ||
      title.includes('playstation 5') ||
      title.includes('xbox series') ||
      title.includes('nintendo switch')
    );
  }, [product]);

  const isGame = useMemo(() => {
    const catName = (product?.category?.name || '').toLowerCase();
    const catSlug = (product?.category?.slug || '').toLowerCase();
    return (
      catName.includes('game') ||
      catSlug.includes('game') ||
      product?.category?.platform?.toLowerCase() === 'software' ||
      !isConsole
    );
  }, [product, isConsole]);

  // Dynamic 4 Meta Attributes according to PDF Guidelines:
  // "Ye Product Page Games Ke Hisab Se Bana Howa Ha. Suppose Agr Console Add Krte Hain Tou Ye Option/description Change Hojygi
  // Example. Console Add Krne Ke Baad Edition Ajyega Genre Ki Jagah And Developer Ki Jagah Brand Ajye Same Story Hours Ki Jagah Series Ajye"
  const metaAttributes = useMemo(() => {
    if (!product) return [];

    if (isConsole) {
      return [
        {
          label: 'Edition',
          value: activeVar?.edition || activeVar?.attributes?.variant || product.attributes?.variant || product.attributes?.edition || 'Standard Edition'
        },
        {
          label: 'Brand',
          value: activeVar?.brand || product.attributes?.brand || 'Sony'
        },
        {
          label: 'Series',
          value: activeVar?.modelNumber || product.modelNumber || product.attributes?.series || 'PlayStation 5 Series'
        },
        {
          label: 'Placement',
          value: activeVar?.placement || product.attributes?.placement || 'Horizontal / Vertical'
        }
      ];
    }

    // Default for Games
    return [
      {
        label: 'Genre',
        value: (Array.isArray(activeVar?.genres) && activeVar.genres.length > 0 ? activeVar.genres.join('/') : null) || product.attributes?.genre || product.specifications?.genre || 'Action-Adventure'
      },
      {
        label: 'Story Hours',
        value: (() => {
          const raw = activeVar?.storyHours || product.attributes?.storyHours || product.specifications?.storyHours || product.attributes?.playtime;
          if (!raw) return '18 Hours';
          return String(raw).toLowerCase().includes('hour') ? String(raw) : `${raw} Hours`;
        })()
      },
      {
        label: 'Developer',
        value: activeVar?.developer || product.attributes?.developer || product.attributes?.brand || product.specifications?.developer || 'IO Interactive'
      },
      {
        label: 'Region',
        value: activeVar?.region || product?.attributes?.region || product?.specifications?.region || 'USA (Canada)'
      }
    ];
  }, [product, activeVar, isConsole]);

  // Media gallery list with variation image prioritization
  const displayImages = useMemo(() => {
    const list = [];
    if (activeVar?.imageUrl) {
      const varImg = getMediaUrl(activeVar.imageUrl);
      if (varImg) list.push(varImg);
    }
    const mediaList = product?.media && product.media.length > 0 ? product.media : [];
    mediaList.forEach((m) => {
      const u = getMediaUrl(m.url);
      if (u && !list.includes(u)) list.push(u);
    });
    if (list.length === 0) list.push('/SLim.png');
    return list;
  }, [product, activeVar]);

  // Find best variation matching target filters
  const findMatchingVariation = (target, changedDimension = null) => {
    if (!rawVariations || rawVariations.length === 0) return null;
    let bestMatch = null;
    let bestScore = -Infinity;

    for (const v of rawVariations) {
      let score = 0;
      if (changedDimension && target[changedDimension]) {
        const targetVal = String(target[changedDimension]).trim().toLowerCase();
        const vVal = v[changedDimension] ? String(v[changedDimension]).trim().toLowerCase() : '';
        if (vVal === targetVal) score += 1000;
        else score -= 500;
      }

      const dimensions = ['platform', 'condition', 'storage', 'color', 'edition', 'bundle'];
      for (const dim of dimensions) {
        if (target[dim]) {
          const targetVal = String(target[dim]).trim().toLowerCase();
          const vVal = v[dim] ? String(v[dim]).trim().toLowerCase() : '';
          if (vVal === targetVal) score += 100;
          else if (!vVal) score += 10;
          else score -= 5;
        }
      }

      if (v.stockQuantity > 0) score += 50;

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
      storage: selectedStorage,
      color: selectedColor,
      edition: selectedEdition,
      bundle: selectedBundle,
    };

    if (dimension === 'platform') setSelectedPlatform(value);
    if (dimension === 'condition') setSelectedCondition(value);

    const match = findMatchingVariation(updated, dimension);
    if (match) {
      setSelectedVariation(match);
      setSelectedPlatform(match.platform || (dimension === 'platform' ? value : ''));
      setSelectedCondition(match.condition || (dimension === 'condition' ? value : ''));
      setQuantity(1);
    }
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
        <p className="text-gray-400">{error || 'Product not found'}</p>
        <Link to="/shop" className="text-blue-400 hover:underline text-sm mt-4 inline-block">Back to Shop</Link>
      </div>
    );
  }

  const currentImage = displayImages[activeImageIndex] || displayImages[0] || '/SLim.png';

  // Playable video trailer embed
  const trailerEmbedUrl = getYouTubeEmbedUrl(
    product.embedMedia ||
    product.attributes?.embedMedia ||
    product.media?.find((m) => m.type === 'Video' || m.type === 'Trailer')?.url,
    product.title
  );


  return (
    <div className="min-h-screen bg-[#060814] text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* BREADCRUMB NAVIGATION (Matching PDF Top Row) */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-400 border-b border-slate-800/80 pb-3">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition font-medium group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Shop</span>
          </Link>
          <div className="flex items-center gap-1.5 truncate max-w-[65%] text-[11px] sm:text-xs">
            <span>Home</span>
            <span>/</span>
            <span>{product.category?.name || 'Games'}</span>
            <span>/</span>
            <span className="text-slate-200 font-semibold truncate">{product.title}</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN PRODUCT HERO SECTION */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT AREA: 1:1 Main Image + Bottom Thumbnails */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Product Image (1:1 Ratio) */}
            <div className="aspect-square w-full rounded-3xl overflow-hidden border border-slate-800 bg-[#0a0f24] shadow-2xl relative group flex items-center justify-center p-4">
              <img
                src={currentImage}
                alt={product.title}
                className="w-full h-full object-contain rounded-2xl transition-transform duration-500 group-hover:scale-105"
              />

              {/* Overlaid Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
                {selectedCondition && (
                  <span className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg uppercase tracking-wider backdrop-blur-md shadow-md ${
                    selectedCondition === 'New'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-500 text-black'
                  }`}>
                    {selectedCondition}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Thumbnail Strip */}
            {displayImages.length > 1 && (
              <div className="flex items-center justify-center gap-2.5 sm:gap-3 overflow-x-auto py-1">
                {displayImages.map((imgUrl, idx) => {
                  const isActive = activeImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`aspect-square w-14 sm:w-16 rounded-2xl overflow-hidden shrink-0 border transition-all duration-200 p-1 bg-slate-900/90 ${
                        isActive
                          ? 'border-white ring-2 ring-white/40 shadow-[0_0_12px_rgba(255,255,255,0.4)] scale-105'
                          : 'border-slate-800 hover:border-slate-600 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT AREA: Title, Price, Dynamic Meta Specs, Selectors & Actions */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Title & Price Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-2">
                {product.title}
              </h1>
              <div className="flex items-baseline gap-3">
                <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                  {formatCurrency(activePrice)}
                </p>
                {/* {product.attributes?.maxPriceCap && (
                  <span className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                    Cap: {formatCurrency(product.attributes.maxPriceCap)}
                  </span>
                )} */}
              </div>
            </div>

            {/* Dynamic Meta Specifications (Category-Aware: Games vs Consoles) */}
            <div className="space-y-1.5 text-xs sm:text-sm text-slate-300 py-1 border-y border-slate-800/80">
              {metaAttributes.map((attr) => (
                <p key={attr.label} className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium w-28 shrink-0">{attr.label}:</span>
                  <span className="font-semibold text-white truncate">{attr.value}</span>
                </p>
              ))}
            </div>

            {/* Platform Selector Buttons (Pill format matching PDF: [PS4] [PS5] [NINTENDO]) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Platform
              </label>
              <div className="flex flex-wrap gap-2.5">
                {platforms.map((plat) => {
                  const isSelected = selectedPlatform.toLowerCase() === plat.toLowerCase();
                  return (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => handleSelectDimension('platform', plat)}
                      className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase transition-all duration-200 border ${
                        isSelected
                          ? 'bg-white text-slate-950 border-white shadow-[0_0_12px_rgba(255,255,255,0.4)] scale-105'
                          : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-600 hover:text-white'
                      }`}
                    >
                      {plat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Condition Selector Buttons (Pill format matching PDF: [New] [Used]) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Condition
              </label>
              <div className="flex flex-wrap gap-2.5">
                {conditions.map((cond) => {
                  const isSelected = selectedCondition.toLowerCase() === cond.toLowerCase();
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => handleSelectDimension('condition', cond)}
                      className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 border ${
                        isSelected
                          ? 'bg-white text-slate-950 border-white shadow-[0_0_12px_rgba(255,255,255,0.4)] scale-105'
                          : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-600 hover:text-white'
                      }`}
                    >
                      {cond}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector & Live Sub Total Calculation */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">Quantity:</span>
                <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-extrabold w-8 text-center text-sm text-white">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Sub Total (Prominently displayed as shown in PDF: "Sub Total: Rs. 20,000") */}
              <p className="text-base sm:text-lg font-bold text-slate-200">
                Sub Total: <span className="font-extrabold text-white font-mono">{formatCurrency(activePrice * quantity)}</span>
              </p>
            </div>

            {/* Primary Action Buttons: Buy Now | Add to Cart | Wishlist Heart */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleQuickBuy}
                disabled={!inStock}
                className="flex-1 py-3 px-6 rounded-xl font-extrabold text-sm text-white bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`flex-1 py-3 px-5 rounded-xl font-extrabold text-sm border flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 ${
                  added
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-[#0f1738] border-blue-500/40 text-blue-300 hover:border-blue-400 hover:text-white hover:bg-blue-900/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                }`}
              >
                {added ? (
                  <><Check className="w-4 h-4" /> Added!</>
                ) : (
                  <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
                )}
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`p-3 rounded-xl border transition-all duration-200 shrink-0 ${
                  favorited
                    ? 'bg-rose-500/20 border-rose-500/60 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400 hover:border-slate-700'
                }`}
                title={favorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${favorited ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SHORT OVERVIEW DESCRIPTION PARAGRAPH */}
        {/* ========================================================================= */}
        <div className="pt-2 text-sm sm:text-base leading-relaxed text-slate-300 max-w-5xl">
          <p>
            {product.description
              ? product.description.split('\n')[0]
              : 'Experience unparalleled next-generation gaming with top-tier performance, immersive storytelling, and breathtaking visuals engineered for true gaming enthusiasts.'}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* CASH ON DELIVERY (COD) ADVANCE NOTICE BOX */}
        {/* PDF Rule: "Ye Message Sab Products mein ayega just console mein 100% advance ayega." */}
        {/* ========================================================================= */}
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-start gap-3">
            <span className="text-amber-400 text-lg shrink-0 mt-0.5">⚠️</span>
            <div className="space-y-1 text-xs sm:text-sm">
              <h4 className="font-bold text-amber-300">
                {isConsole
                  ? 'Important Notice for Console Orders:'
                  : 'Important Notice for Cash on Delivery Orders:'}
              </h4>
              <p className="text-slate-300 leading-relaxed">
                {isConsole
                  ? 'The customer must pay 100% in advance before the console is shipped. Cash on Delivery (COD) is not available for consoles.'
                  : 'The customer must pay Rs. 500/- in advance before the product is shipped. The remaining product price will be collected via Cash on Delivery (COD).'}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PRODUCT DESCRIPTION SECTION WITH PLAYABLE TRAILER & FULL TEXT */}
        {/* PDF Rule: "Youtube se Embed Code ayega... ayse playable trailer show hona chayei. Description ayse ayegi after trailer ki" */}
        {/* ========================================================================= */}
        <div className="space-y-6 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
              Product Description
            </h2>
          </div>

          {/* Embedded Playable YouTube Video Trailer */}
          {trailerEmbedUrl && (
            <div className="w-full rounded-3xl overflow-hidden border border-slate-800 bg-black shadow-2xl aspect-video relative group">
              <iframe
                src={trailerEmbedUrl}
                title={`${product.title} Trailer`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}

          {/* Full Detailed Description following the trailer */}
          <div className="text-sm sm:text-base leading-relaxed text-slate-300 space-y-4">
            {product.description ? (
              <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
            ) : (
              <p>
                From Santa Monica Studio comes the critically acclaimed journey. Fimbulwinter is well underway. Kratos and Atreus must journey to each of the Nine Realms in search of answers as Asgardian forces prepare for a prophesied battle that will end the world. Along the way they will explore stunning, mythical landscapes, and face fearsome enemies in the form of Norse gods and monsters. The threat of Ragnarök grows ever closer. Kratos and Atreus must choose between their own safety and the safety of the realms.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default ProductPage;
