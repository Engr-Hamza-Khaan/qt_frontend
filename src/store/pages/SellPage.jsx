import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, CheckCircle } from 'lucide-react';
import { storeApi } from '../api';
import TermsAgreement from '../components/TermsAgreement';

function SellPage() {
  const [form, setForm] = useState({
    customerName: '', customerEmail: '', customerPhone: '',
    productName: '', description: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await storeApi.submitSell(form);
      setSuccess(true);
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
        <h1 className="store-page-title mb-2">Request Submitted!</h1>
        <p className="store-muted mb-6">We&apos;ll review your item and send a valuation.</p>
        <Link to="/" className="store-link">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-3 mb-2">
        <DollarSign className="w-8 h-8 text-neon-purple" />
        <h1 className="store-page-title">Sell / Trade-In</h1>
      </div>
      <p className="store-muted mb-8">Get a quote for your used console, games, or gaming gear.</p>

      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 p-6 store-glass-panel">
        <input required className="store-input" placeholder="Your Name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
        <input required type="email" className="store-input" placeholder="Email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} />
        <input className="store-input" placeholder="Phone (optional)" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
        <input required className="store-input" placeholder="Product Name (e.g. PS5 Disc Edition)" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} />
        <textarea required className="store-input" rows={4} placeholder="Condition, accessories included, etc." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <TermsAgreement checked={agreedToTerms} onChange={setAgreedToTerms} />
        <button type="submit" disabled={loading || !agreedToTerms} className="store-btn-primary store-btn-primary--block w-full">
          {loading ? 'Submitting...' : 'Get Valuation'}
        </button>
      </form>
    </div>
  );
}

export default SellPage;
