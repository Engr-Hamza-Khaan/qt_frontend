import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, Check, Minus, Plus, ShieldCheck, Truck } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { storeApi } from '../api';
import { useCart } from '../context/CartContext';
import { getMediaUrl, getTotalStock } from '../utils';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function ProductPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { data, loading, error } = useFetch(() => storeApi.getProduct(id), [id]);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = data?.data;
  const variations = product?.variations || [];
  const activeVar = selectedVariation || variations[0];
  const inStock = activeVar && activeVar.stockQuantity > 0;

  const handleAddToCart = () => {
    if (!activeVar || !inStock) return;
    addItem(product, activeVar, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      <Link to="/shop" className="inline-flex items-center gap-1 text-sm store-muted hover:text-neon-purple mb-6 transition">
        <ChevronLeft className="w-4 h-4" /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <div className="aspect-square rounded-2xl bg-black/30 overflow-hidden store-glass-panel">
            {mainImage ? (
              <img src={mainImage} alt={product.title} className="w-full h-full object-contain p-6" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {images.map((img) => (
                <div key={img.id} className="w-16 h-16 rounded-lg overflow-hidden store-glass-panel shrink-0 bg-black/20">
                  <img src={getMediaUrl(img.url)} alt="" className="w-full h-full object-contain p-1" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {product.isFlashSale && (
              <span className="px-2.5 py-0.5 bg-red-600 text-white text-xs font-bold rounded uppercase">Sale</span>
            )}
            {product.isFeatured && (
              <span className="store-badge-featured text-xs px-2.5 py-0.5">Featured</span>
            )}
            {product.condition && (
              <span className="px-2.5 py-0.5 bg-white/5 text-gray-300 text-xs font-medium rounded capitalize border border-white/10">
                {product.condition}
              </span>
            )}
          </div>

          <h1 className="store-page-title mb-2">{product.title}</h1>
          {product.category && (
            <p className="text-sm text-neon-purple font-medium mb-4">{product.category.name}</p>
          )}

          <p className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
            {activeVar ? formatCurrency(activeVar.price) : '—'}
          </p>

          <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 pb-6 border-b border-neon-purple/20">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <ShieldCheck className="w-4 h-4 text-neon-purple" /> Genuine Product
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Truck className="w-4 h-4 text-neon-purple" /> Fast Delivery
            </div>
          </div>

          {product.description && (
            <p className="text-gray-400 leading-relaxed mb-6 text-sm">{product.description}</p>
          )}

          {variations.length > 0 && (
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm font-semibold text-white mb-2">Select Option</p>
                <div className="flex flex-wrap gap-2">
                  {variations.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => { setSelectedVariation(v); setQuantity(1); }}
                      disabled={v.stockQuantity <= 0}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                        activeVar?.id === v.id
                          ? 'border-neon-purple bg-neon-purple/15 text-neon-purple'
                          : v.stockQuantity <= 0
                            ? 'border-white/10 text-gray-600 cursor-not-allowed'
                            : 'border-white/15 text-gray-300 hover:border-neon-purple/50'
                      }`}
                    >
                      {[v.platform, v.storage, v.color, v.edition].filter(Boolean).join(' / ') || v.sku}
                    </button>
                  ))}
                </div>
              </div>

              {inStock && (
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-white">Quantity</p>
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 rounded-lg border border-white/15 hover:border-neon-purple/40 text-gray-300">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold w-8 text-center text-white">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(Math.min(quantity + 1, activeVar.stockQuantity))} className="p-2 rounded-lg border border-white/15 hover:border-neon-purple/40 text-gray-300">
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-gray-500">{activeVar.stockQuantity} in stock</span>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`store-btn-primary store-btn-primary--block w-full ${
              !inStock ? 'opacity-50 cursor-not-allowed' : added ? 'from-emerald-600 to-emerald-500' : ''
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

          {product.modelNumber && (
            <p className="text-xs text-gray-500 mt-4">SKU / Model: {product.modelNumber}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
