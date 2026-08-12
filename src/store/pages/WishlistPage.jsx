import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight, Package, Sparkles } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../../utils/formatters';

function formatCondition(condition) {
  if (!condition) return null;
  return condition
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem, setIsOpen } = useCart();

  const handleAddToCart = (product) => {
    const defaultVariation =
      product.variations?.find((v) => v.stockQuantity > 0) ||
      product.variations?.[0] || {
        id: `var_${product.id}`,
        sku: `SKU-${product.id}`,
        price: product.price || 0,
        stockQuantity: 10,
        condition: product.condition || 'New',
        platform: product.platform || null,
      };

    addItem(product, defaultVariation, 1);
    setIsOpen(true);
  };

  const handleAddAllToCart = () => {
    items.forEach((product) => {
      if (product.inStock !== false) {
        const defaultVariation =
          product.variations?.find((v) => v.stockQuantity > 0) ||
          product.variations?.[0] || {
            id: `var_${product.id}`,
            sku: `SKU-${product.id}`,
            price: product.price || 0,
            stockQuantity: 10,
            condition: product.condition || 'New',
            platform: product.platform || null,
          };
        addItem(product, defaultVariation, 1);
      }
    });
    setIsOpen(true);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 animate-fade-in">
        <div className="max-w-md mx-auto text-center store-glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.25)]">
            <Heart className="w-10 h-10 stroke-[1.75]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mb-2">
            Your Wishlist is Empty
          </h2>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            You haven&apos;t saved any gear yet. Explore our consoles, games, and accessories, and tap the heart icon to save your favorites!
          </p>

          <Link
            to="/shop"
            className="store-btn-primary w-full justify-center py-3.5 normal-case font-semibold text-sm shadow-neon-purple inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
                My Wishlist
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                {items.length} {items.length === 1 ? 'item' : 'items'} saved for later
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAddAllToCart}
            className="store-btn-primary px-4 py-2.5 text-xs sm:text-sm normal-case font-semibold inline-flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" /> Add All to Cart
          </button>

          <button
            type="button"
            onClick={clearWishlist}
            className="px-3.5 py-2.5 rounded-xl border border-white/15 text-gray-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 transition text-xs sm:text-sm inline-flex items-center gap-1.5"
            title="Clear entire wishlist"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
        {items.map((product) => {
          return (
            <div
              key={product.id}
              className="store-product-card group flex flex-col justify-between relative rounded-2xl overflow-hidden bg-[#0e081c]/80 border border-white/10 hover:border-rose-500/50 transition-all duration-300 hover:shadow-[0_0_25px_rgba(244,63,94,0.2)]"
            >
              {/* Media Section */}
              <div className="relative">
                <Link to={`/product/${product.id}`} className="block overflow-hidden">
                  <div className="aspect-square bg-black/30 flex items-center justify-center p-3 sm:p-4 group-hover:scale-105 transition-transform duration-300">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                        <Package className="w-8 h-8 opacity-40 mb-1" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Floating Remove Button */}
                <button
                  type="button"
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-2 left-2 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition shadow-lg"
                  aria-label="Remove from wishlist"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Badges */}
                {product.isFlashSale && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded uppercase tracking-wider">
                    Sale
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                <div>
                  {product.category && (
                    <p className="text-[10px] uppercase font-semibold tracking-wider text-rose-400/90 mb-1">
                      {product.category}
                    </p>
                  )}
                  <Link to={`/product/${product.id}`} className="block">
                    <h3 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2 hover:text-rose-400 transition-colors">
                      {product.title}
                    </h3>
                  </Link>

                  {product.condition && (
                    <p className="text-[11px] text-gray-400 mt-1 capitalize">
                      {formatCondition(product.condition)}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-sm sm:text-base font-bold text-white mb-3">
                    {formatCurrency(product.price)}
                  </p>

                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.inStock === false}
                      className={`flex-1 py-2 px-2.5 rounded-xl font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition ${
                        product.inStock === false
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
                          : 'bg-gradient-to-r from-neon-purple to-indigo-600 hover:from-neon-purple-light hover:to-indigo-500 text-white shadow-neon-purple/50'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {product.inStock === false ? 'Out of Stock' : 'Add to Cart'}
                    </button>

                    <Link
                      to={`/product/${product.id}`}
                      className="p-2 rounded-xl border border-white/15 text-gray-300 hover:text-white hover:bg-white/10 transition flex items-center justify-center shrink-0"
                      title="View Details"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WishlistPage;
