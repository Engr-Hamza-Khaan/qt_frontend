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

      <button
        type="button"
        onClick={handleWishlistClick}
        className={`absolute top-2.5 left-2.5 z-30 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-md ${
          favorited
            ? 'bg-rose-500 text-white shadow-[0_0_14px_rgba(244,63,94,0.75)] scale-105'
            : 'bg-black/50 border border-white/20 text-gray-300 hover:text-white hover:bg-rose-500/80 hover:border-rose-500/80 shadow-md'
        }`}
        aria-label={favorited ? 'Remove from wishlist' : 'Add to wishlist'}
        title={favorited ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart className={`w-4 h-4 transition-transform ${favorited ? 'fill-current scale-110' : ''}`} />
      </button>

      {product.isFlashSale && (
        <span className="absolute top-2.5 right-2.5 z-20 px-2.5 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-md">
          Sale
        </span>
      )}

      {platforms.length > 0 && (
        <div className="store-product-card__platforms">
          {platforms.map((platform) => (
            <span key={platform} className="store-product-card__platform-badge">
              {platform}
            </span>
          ))}
        </div>
      )}

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
