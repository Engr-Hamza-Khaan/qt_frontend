import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getMediaUrl } from '../utils';
import { formatCurrency } from '../../utils/formatters';

function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-neon-purple/40 mb-4" />
        <h1 className="store-page-title mb-2">Your cart is empty</h1>
        <p className="store-muted mb-6">Add some games or consoles to get started</p>
        <Link to="/shop" className="store-btn-primary">
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="store-page-title mb-8">
        Shopping Cart ({itemCount} items)
      </h1>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={item.variationId} className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 rounded-2xl store-glass-panel">
            <div className="flex gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-black/30 border border-neon-purple/20 overflow-hidden shrink-0">
                {item.image && <img src={getMediaUrl(item.image)} alt="" className="w-full h-full object-contain p-2" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm sm:text-base line-clamp-2">{item.title}</h3>
                <p className="text-xs sm:text-sm store-muted mt-0.5 truncate">
                  {[item.platform, item.storage, item.color].filter(Boolean).join(' · ')}
                </p>
                <p className="text-base sm:text-lg font-bold text-neon-purple mt-1.5 sm:mt-2">{formatCurrency(item.price)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
              <button type="button" onClick={() => removeItem(item.variationId)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg order-2 sm:order-none">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 order-1 sm:order-none">
                <button type="button" onClick={() => updateQuantity(item.variationId, item.quantity - 1)} className="p-1.5 rounded-lg border border-white/15 text-gray-300">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold w-6 text-center text-white">{item.quantity}</span>
                <button type="button" onClick={() => updateQuantity(item.variationId, Math.min(item.quantity + 1, item.maxStock))} className="p-1.5 rounded-lg border border-white/15 text-gray-300">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm font-bold text-white order-3 sm:order-none">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl store-glass-panel">
        <div className="flex justify-between text-lg font-bold mb-4 text-white">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <Link to="/checkout" className="store-btn-primary store-btn-primary--block w-full text-center">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}

export default CartPage;
