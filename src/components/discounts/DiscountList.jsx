import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { 
  Percent, Plus, Search, Tag, Calendar, Layers, 
  Settings, Check, X, Trash2, Edit2, AlertCircle
} from 'lucide-react';

function DiscountList() {
  const [discounts, setDiscounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);

  // Form States
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('Percentage');
  const [value, setValue] = useState('');
  const [applyTo, setApplyTo] = useState('All');
  const [targetId, setTargetId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const discountRes = await api.discounts.getAll();
      if (discountRes.success) setDiscounts(discountRes.data);

      const catRes = await api.categories.getAll();
      if (catRes.success) setCategories(catRes.data);

      const prodRes = await api.products.getAll();
      if (prodRes.success) setProducts(prodRes.data.products);
    } catch (err) {
      setError(err.message || 'Failed to retrieve discounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingDiscount(null);
    setName('');
    setCode('');
    setType('Percentage');
    setValue('');
    setApplyTo('All');
    setTargetId('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]);
    setIsActive(true);
    setShowModal(true);
  };

  const handleOpenEditModal = (discount) => {
    setEditingDiscount(discount);
    setName(discount.name);
    setCode(discount.code || '');
    setType(discount.type);
    setValue(discount.value);
    setApplyTo(discount.applyTo);
    setTargetId(discount.targetId || '');
    setStartDate(discount.startDate ? discount.startDate.split('T')[0] : '');
    setEndDate(discount.endDate ? discount.endDate.split('T')[0] : '');
    setIsActive(discount.isActive);
    setShowModal(true);
  };

  const handleSaveDiscount = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      code: code || null, // null code means auto applied campaign
      type,
      value: parseFloat(value),
      applyTo,
      targetId: targetId ? parseInt(targetId) : null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive
    };

    try {
      let res;
      if (editingDiscount) {
        res = await api.discounts.update(editingDiscount.id, payload);
      } else {
        res = await api.discounts.create(payload);
      }

      if (res.success) {
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to save discount campaign');
    }
  };

  const handleDeleteDiscount = async (id) => {
    if (!window.confirm('Are you sure you want to delete this discount coupon?')) return;
    try {
      const res = await api.discounts.delete(id);
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete discount');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Percent className="w-7 h-7 text-blue-500" />
            Promo codes & campaigns
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Create coupon codes, percentage deductions, flat rate claims, or specific category campaigns.
          </p>
        </div>
        
        <button 
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all font-semibold text-sm shadow-lg shadow-blue-500/25 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Create Discount
        </button>
      </div>

      {/* Discount Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading discount schemas...</p>
        </div>
      ) : discounts.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl py-20 text-center rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
          <Percent className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Discounts Defined</h3>
          <p className="text-slate-400 text-sm mt-1">Create your first welcome voucher or category campaign above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discounts.map(disc => {
            const hasExpired = new Date(disc.endDate) < new Date();
            const targetObject = disc.applyTo === 'Category' 
              ? categories.find(c => String(c.id) === String(disc.targetId))?.name 
              : disc.applyTo === 'Product' 
                ? products.find(p => String(p.id) === String(disc.targetId))?.title 
                : 'All Catalog';

            return (
              <div 
                key={disc.id} 
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 hover:shadow-xl transition-all relative overflow-hidden group flex flex-col justify-between"
              >
                {/* Active Indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    disc.isActive && !hasExpired
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                  }`}>
                    {hasExpired ? 'Expired' : disc.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Coupon Title info */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {disc.applyTo} Campaign
                    </span>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white line-clamp-1">{disc.name}</h3>
                  </div>

                  {/* Visual Coupon Code Tag */}
                  <div className="p-3 bg-dashed-border bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Promo Code</p>
                      <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                        {disc.code || 'AUTO_APPLIED'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Reduction</p>
                      <p className="text-base font-black text-slate-800 dark:text-white">
                        {disc.type === 'Percentage' ? `${disc.value}%` : `$${disc.value}`} OFF
                      </p>
                    </div>
                  </div>

                  {/* Target specification & dates */}
                  <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Target: <strong className="text-slate-700 dark:text-slate-300">{targetObject || 'Catalog Items'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(disc.startDate).toLocaleDateString()} - {new Date(disc.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-4 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditModal(disc)}
                    className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDiscount(disc.id)}
                    className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT VOUCHER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200/50 dark:border-slate-800 overflow-hidden shadow-2xl transition-all">
            
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                {editingDiscount ? 'Update Campaign Schema' : 'Create New Promo Code'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-semibold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDiscount} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Campaign Title</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Summer Clearance Sale"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Promo Coupon Code</label>
                  <input 
                    type="text" 
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CLEAR30 (Leave blank for auto-apply)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                  <div className="flex items-center h-10 mt-1">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isActive} 
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                      <span className="ml-2 text-sm font-medium text-slate-600 dark:text-slate-300">Active</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Voucher Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="FixedAmount">Fixed Amount ($)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Value</label>
                  <input 
                    type="number" 
                    required
                    step="0.01"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="e.g. 15 or 50.00"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Apply To Scope</label>
                  <select
                    value={applyTo}
                    onChange={(e) => {
                      setApplyTo(e.target.value);
                      setTargetId('');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                  >
                    <option value="All">All Catalog</option>
                    <option value="Category">Specific Category</option>
                    <option value="Product">Specific Product</option>
                  </select>
                </div>

                {applyTo === 'Category' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Select Target Category</label>
                    <select
                      value={targetId}
                      required
                      onChange={(e) => setTargetId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                    >
                      <option value="">-- Choose Category --</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.platform})</option>
                      ))}
                    </select>
                  </div>
                )}

                {applyTo === 'Product' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Select Target Product</label>
                    <select
                      value={targetId}
                      required
                      onChange={(e) => setTargetId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white font-sans text-xs"
                    >
                      <option value="">-- Choose Product --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Start Date</label>
                  <input 
                    type="date" 
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">End Date</label>
                  <input 
                    type="date" 
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-sm transition shadow-md"
                >
                  Save Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default DiscountList;
