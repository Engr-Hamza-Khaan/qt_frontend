import { Link } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getMediaUrl } from '../utils';
import { formatCurrency } from '../../utils/formatters';

function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      <div className="absolute inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto h-[min(85vh,100dvh)] sm:h-full w-full sm:max-w-md flex flex-col animate-slide-up-drawer sm:animate-slide-in store-glass-panel rounded-t-2xl sm:rounded-none border-t sm:border-t-0 sm:border-l border-neon-purple/30">
        <div className="flex items-center justify-between p-5 border-b border-neon-purple/20">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
            <ShoppingBag className="w-5 h-5 text-neon-purple" /> Cart ({itemCount})
          </h2>
          <button type="button" onClick={() => setIsOpen(false)} className="p-2 rounded-lg hover:bg-white/10 text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Your cart is empty</p>
              <Link
                to="/shop"
                onClick={() => setIsOpen(false)}
                className="store-link inline-block mt-4 text-sm"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.variationId} className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="w-16 h-16 rounded-lg bg-black/30 border border-neon-purple/20 overflow-hidden shrink-0">
                  {item.image && (
                    <img src={getMediaUrl(item.image)} alt="" className="w-full h-full object-contain p-1" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {[item.platform, item.storage, item.color].filter(Boolean).join(' · ')}
                  </p>
                  <p className="text-sm font-bold text-neon-purple mt-1">{formatCurrency(item.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variationId, item.quantity - 1)}
                      className="p-1 rounded bg-white/5 border border-white/10 text-gray-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-6 text-center text-white">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variationId, Math.min(item.quantity + 1, item.maxStock))}
                      className="p-1 rounded bg-white/5 border border-white/10 text-gray-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.variationId)}
                      className="ml-auto p-1 text-red-400 hover:bg-red-500/10 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-5 border-t border-neon-purple/20 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal</span>
              <span className="font-bold text-white">{formatCurrency(subtotal)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={() => setIsOpen(false)}
              className="store-btn-primary store-btn-primary--block w-full text-center"
            >
              Checkout
            </Link>
            <Link
              to="/cart"
              onClick={() => setIsOpen(false)}
              className="block w-full py-2.5 text-center text-sm text-gray-400 hover:text-neon-purple transition"
            >
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartDrawer;
