import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Zap, Check } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import {
  getProductImage,
  getLowestPrice,
  getTotalStock,
  getProductPlatforms,
  getPlatformBadgeStyle,
  formatPlatformLabel,
  getProductConditionTag,
} from '../utils';
import { formatCurrency } from '../../utils/formatters';

function formatCondition(condition) {
  if (!condition) return null;
  return condition
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addItem, setIsOpen } = useCart();
  const [added, setAdded] = useState(false);

  const image = getProductImage(product);
  const price = getLowestPrice(product);
  const inStock = getTotalStock(product) > 0;
  const platforms = getProductPlatforms(product);
  const conditionTag = getProductConditionTag(product);
  const favorited = isInWishlist(product?.id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const getDefaultVariation = () => {
    return (
      product?.variations?.find((v) => (v.stockQuantity || 0) > 0) ||
      product?.variations?.[0] || {
        id: `var_${product?.id}`,
        sku: `SKU-${product?.id}`,
        price: price || 0,
        stockQuantity: 10,
        condition: product?.condition || 'New',
        platform: product?.attributes?.platform || null,
      }
    );
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    const variation = getDefaultVariation();
    addItem(product, variation, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleQuickBuy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    const variation = getDefaultVariation();
    addItem(product, variation, 1);
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="store-product-card group block"
    >
      <div className="store-product-card__media">
        {image ? (
          <img
            src={image}
            alt={product.title}
            className="store-product-card__image"
          />
        ) : (
          <div className="store-product-card__image flex items-center justify-center text-gray-500 text-sm">
            No Image
          </div>
        )}
      </div>

      {/* Top Header Overlay Badges (Wishlist + Sale on left, Dynamic Platform Badges + NEW/OLD Tag on right) */}
      <div className="absolute top-2.5 inset-x-2.5 z-30 flex items-start justify-between gap-1.5 pointer-events-none">
        {/* Left Side: Wishlist Heart & Sale Tag */}
        <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
          <button
            type="button"
            onClick={handleWishlistClick}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-md ${
              favorited
                ? 'bg-rose-500 text-white shadow-[0_0_14px_rgba(244,63,94,0.75)] scale-105'
                : 'bg-black/60 border border-white/20 text-gray-300 hover:text-white hover:bg-rose-500/80 hover:border-rose-500/80 shadow-md'
            }`}
            aria-label={favorited ? 'Remove from wishlist' : 'Add to wishlist'}
            title={favorited ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${favorited ? 'fill-current scale-110' : ''}`} />
          </button>

          {(product.isFlashSale || product.isSale) && (
            <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] sm:text-[11px] font-black rounded-lg uppercase tracking-wide shadow-lg border border-red-500/50">
              Sale
            </span>
          )}
        </div>

        {/* Right Side: Dynamic Platform Badges (PS4, PS5, XBOX...) + Dynamic NEW / OLD Tag */}
        <div className="flex items-center gap-1 flex-wrap justify-end pointer-events-auto max-w-[75%]">
          {platforms.map((platform) => {
            const badgeStyle = getPlatformBadgeStyle(platform);
            const label = formatPlatformLabel(platform);
            if (!label) return null;
            return (
              <span
                key={platform}
                className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-black rounded-md uppercase tracking-wider shadow-md transition-transform hover:scale-105 ${badgeStyle}`}
              >
                {label}
              </span>
            );
          })}

          {conditionTag && (
            <span
              className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-black rounded-md uppercase tracking-wider shadow-md transition-transform hover:scale-105 ${conditionTag.className}`}
            >
              {conditionTag.label}
            </span>
          )}
        </div>
      </div>

      <div className="store-product-card__overlay">
        <h3 className="text-xs sm:text-sm font-bold text-white leading-tight line-clamp-2">
          {product.title}
        </h3>
        {product.condition && (
          <p className="text-[11px] text-white/80 mt-0.5 capitalize">
            {formatCondition(product.condition)}
          </p>
        )}
        <p className="text-sm sm:text-base font-extrabold text-white mt-1">
          {formatCurrency(price)}
        </p>

        {inStock ? (
          <div className="w-full mt-2 grid grid-cols-2 gap-1.5 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={handleAddToCart}
              className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all duration-200 ${
                added
                  ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/15 hover:border-white/30 active:scale-95'
              }`}
              title="Add to Cart"
            >
              {added ? (
                <>
                  <Check className="w-3 h-3 shrink-0" />
                  <span className="truncate">Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3 h-3 shrink-0" />
                  <span className="truncate">Add to Cart</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleQuickBuy}
              className="py-1.5 px-1 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 bg-gradient-to-r from-neon-purple to-indigo-600 hover:from-neon-purple-light hover:to-indigo-500 text-white shadow-neon-purple/40 hover:shadow-neon-purple/70 transition-all duration-200 active:scale-95"
              title="Quick Buy"
            >
              <Zap className="w-3 h-3 fill-current shrink-0" />
              <span className="truncate">Quick Buy</span>
            </button>
          </div>
        ) : null}
      </div>

      {!inStock && (
        <div className="absolute inset-0 z-20 bg-[#08050f]/80 flex items-center justify-center rounded-[inherit]">
          <span className="px-3 py-1 bg-gray-900 text-white text-xs font-semibold rounded-full border border-white/10">
            Out of Stock
          </span>
        </div>
      )}
    </Link>
  );
}

export default ProductCard;
