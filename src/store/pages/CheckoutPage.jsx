import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Tag, ChevronLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { storeApi } from '../api';
import { formatCurrency } from '../../utils/formatters';

function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [success, setSuccess] = useState(null);

  const [guest, setGuest] = useState({ name: '', email: '', phoneNumber: '' });
  const [address, setAddress] = useState({
    street: '', city: '', state: '', postalCode: '', country: 'Pakistan',
    receiverName: '', receiverPhone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [customerNotes, setCustomerNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const cartItems = items.map((i) => ({ variationId: i.variationId, quantity: i.quantity }));
  const discountAmount = Number(discount?.discountAmount || 0);
  const total = Math.max(0, subtotal - discountAmount);

  useEffect(() => {
    setDiscount(null);
    setCouponSuccess('');
  }, [items, subtotal]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setError('');
    setCouponSuccess('');
    try {
      const res = await storeApi.validateCoupon(couponCode.trim(), subtotal, cartItems);
      if (res.success) {
        setDiscount(res.data);
        setCouponSuccess(`Coupon "${res.data.code}" applied — you save ${formatCurrency(res.data.discountAmount)}`);
      }
    } catch (err) {
      setError(err.message);
      setDiscount(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!items.length) return;
    setLoading(true);
    setError('');

    try {
      const res = await storeApi.checkout({
        items: cartItems,
        guest: {
          name: guest.name,
          email: guest.email,
          phoneNumber: guest.phoneNumber,
        },
        shippingAddress: {
          ...address,
          receiverName: address.receiverName || guest.name,
          receiverPhone: address.receiverPhone || guest.phoneNumber,
        },
        paymentMethod,
        customerNotes,
        couponCode: discount?.code || undefined,
        discountAmount: discountAmount || undefined,
      });

      if (res.success) {
        setSuccess(res.data);
        clearCart();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <CheckCircle className="w-16 h-16 text-neon-purple mx-auto mb-4" />
        <h1 className="store-page-title mb-2">Order Placed!</h1>
        <p className="store-muted mb-2">Thank you for your purchase.</p>
        <p className="text-lg font-bold text-neon-purple mb-1">Order #{success.orderNumber}</p>
        <p className="text-gray-400 mb-8">Total: {formatCurrency(success.totalAmount)}</p>
        <Link to="/shop" className="store-btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  if (!items.length) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/cart" className="inline-flex items-center gap-1 text-sm store-muted hover:text-neon-purple mb-6 transition">
        <ChevronLeft className="w-4 h-4" /> Back to Cart
      </Link>

      <h1 className="store-page-title mb-8">Checkout</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {couponSuccess && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
          {couponSuccess}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <section className="p-4 sm:p-6 store-glass-panel">
            <h2 className="font-bold text-white mb-4 font-display">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input required className="store-input" placeholder="Full Name" value={guest.name} onChange={(e) => setGuest({ ...guest, name: e.target.value })} />
              <input required type="email" className="store-input" placeholder="Email" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} />
              <input className="store-input sm:col-span-2" placeholder="Phone (optional)" value={guest.phoneNumber} onChange={(e) => setGuest({ ...guest, phoneNumber: e.target.value })} />
            </div>
          </section>

          <section className="p-4 sm:p-6 store-glass-panel">
            <h2 className="font-bold text-white mb-4 font-display">Shipping Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input required className="store-input sm:col-span-2" placeholder="Street Address" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
              <input required className="store-input" placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
              <input required className="store-input" placeholder="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
              <input required className="store-input" placeholder="Postal Code" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
              <input required className="store-input" placeholder="Country" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
            </div>
          </section>

          <section className="p-4 sm:p-6 store-glass-panel">
            <h2 className="font-bold text-white mb-4 font-display">Payment & Notes</h2>
            <select className="store-input mb-4" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option>Credit Card</option>
              <option>PayPal</option>
              <option>Bank Transfer</option>
              <option>Cash on Delivery</option>
            </select>
            <textarea className="store-input" rows={3} placeholder="Order notes (optional)" value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} />
          </section>
        </div>

        <div className="lg:col-span-2">
          <div className="p-4 sm:p-6 store-glass-panel lg:sticky lg:top-24 space-y-4">
            <h2 className="font-bold text-white font-display">Order Summary</h2>

            {items.map((item) => (
              <div key={item.variationId} className="flex justify-between text-sm">
                <span className="text-gray-400 truncate mr-2">{item.title} × {item.quantity}</span>
                <span className="font-medium text-white shrink-0">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}

            <div className="border-t border-neon-purple/20 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-neon-purple">
                  <span>Discount ({discount.code})</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-white">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                className="store-input flex-1"
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyCoupon();
                  }
                }}
              />
              <button
                type="button"
                onClick={applyCoupon}
                disabled={couponLoading || !couponCode.trim()}
                className="px-4 py-2 store-brand-chip flex items-center justify-center shrink-0 disabled:opacity-50"
              >
                <Tag className="w-4 h-4" />
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="store-btn-primary store-btn-primary--block w-full"
            >
              {loading ? 'Placing Order...' : `Place Order — ${formatCurrency(total)}`}
            </button>

            <p className="text-[10px] text-gray-500 text-center">No account required. Guest checkout.</p>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CheckoutPage;
