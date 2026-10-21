import { useState, useEffect, useMemo } from 'react';
import {
  Package, ArrowDownRight, ArrowUpRight, DollarSign, Wallet,
  AlertTriangle, CheckCircle2, X, AlertCircle, Sparkles, Layers,
  ChevronRight, ShieldAlert, Check
} from 'lucide-react';
import { api } from '../../api/client';
import { getProductImage } from '../../store/utils';
import { formatCurrency } from '../../utils/formatters';
import ModalOverlay from '../ui/ModalOverlay';

const POLICY_NOTE_TEXT =
  'Payment will be cleared after product is successfully received by the customer. If product has any problem or is not as described, all delivery charges will be paid by the vendor. Product should meet all the given details.';

export default function VendorStockModal({
  open,
  onClose,
  initialProduct = null,
  initialVariation = null,
  initialMode = 'in',
  products = [],
  onSuccess
}) {
  const [mode, setMode] = useState(initialMode); // 'in' or 'out'
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedVariationId, setSelectedVariationId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [sellingPrice, setSellingPrice] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const [fetchedProducts, setFetchedProducts] = useState([]);
  const [fetchedProductDetails, setFetchedProductDetails] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Auto fetch catalog products if not passed
  useEffect(() => {
    if (open && (!products || products.length === 0) && !initialProduct) {
      setLoadingProducts(true);
      api.products.getAll({ limit: 100 })
        .then((res) => {
          const list = res.data?.products || res.products || (Array.isArray(res.data) ? res.data : []);
          setFetchedProducts(list);
          if (list.length > 0 && !selectedProductId) {
            setSelectedProductId(list[0].id);
          }
        })
        .catch((err) => console.error('Failed to load products in modal:', err))
        .finally(() => setLoadingProducts(false));
    }
  }, [open, products, initialProduct, selectedProductId]);

  const allProducts = useMemo(() => {
    if (products && products.length > 0) return products;
    return fetchedProducts;
  }, [products, fetchedProducts]);

  // Reset or initialize state when modal opens or initial values change
  useEffect(() => {
    if (open) {
      setMode(initialMode || 'in');
      setError('');
      setSuccessMessage('');
      setProductSearch('');

      if (initialProduct?.id) {
        setSelectedProductId(initialProduct.id);
      } else if (allProducts.length > 0 && !selectedProductId) {
        setSelectedProductId(allProducts[0].id);
      }

      if (initialVariation?.id) {
        setSelectedVariationId(initialVariation.id);
        const existingStock = initialVariation.vendorStocks?.[0];
        if (existingStock?.sellingPrice) {
          setSellingPrice(String(existingStock.sellingPrice));
        } else if (initialVariation.price) {
          setSellingPrice(String(initialVariation.price));
        }
      }
      setQuantity('1');
      setReason('');
    }
  }, [open, initialProduct, initialVariation, initialMode, allProducts]);

  // Selected product object
  const currentProduct = useMemo(() => {
    if (initialProduct && initialProduct.id === selectedProductId) {
      return initialProduct;
    }
    if (fetchedProductDetails[selectedProductId]) {
      return fetchedProductDetails[selectedProductId];
    }
    return allProducts.find((p) => p.id === selectedProductId) || null;
  }, [selectedProductId, initialProduct, allProducts, fetchedProductDetails]);

  // Load detailed variations if missing
  useEffect(() => {
    if (selectedProductId && !initialProduct?.variations) {
      const prod = allProducts.find((p) => p.id === selectedProductId);
      if (prod && (!prod.variations || prod.variations.length === 0) && !fetchedProductDetails[selectedProductId]) {
        api.products.getById(selectedProductId).then((res) => {
          if (res.success && res.data) {
            setFetchedProductDetails((prev) => ({ ...prev, [selectedProductId]: res.data }));
          }
        }).catch(console.error);
      }
    }
  }, [selectedProductId, allProducts, initialProduct, fetchedProductDetails]);

  // Product variations
  const productVariations = useMemo(() => {
    return currentProduct?.variations || [];
  }, [currentProduct]);

  // Sync selected variation when product changes
  useEffect(() => {
    if (!productVariations || productVariations.length === 0) {
      setSelectedVariationId('');
      return;
    }

    // If current selected variation is not in this product, pick first
    const exists = productVariations.some((v) => v.id === selectedVariationId);
    if (!exists) {
      const firstVar = productVariations[0];
      setSelectedVariationId(firstVar?.id || '');
      const existingStock = firstVar?.vendorStocks?.[0];
      if (existingStock?.sellingPrice) {
        setSellingPrice(String(existingStock.sellingPrice));
      } else if (firstVar?.price) {
        setSellingPrice(String(firstVar.price));
      }
    }
  }, [productVariations, selectedVariationId]);

  // Selected variation object
  const currentVariation = useMemo(() => {
    return productVariations.find((v) => v.id === selectedVariationId) || null;
  }, [productVariations, selectedVariationId]);

  // Existing vendor stock for this SKU
  const currentVendorStock = useMemo(() => {
    if (!currentVariation) return 0;
    const vendorStockObj = currentVariation.vendorStocks?.[0];
    return vendorStockObj ? parseInt(vendorStockObj.quantity, 10) || 0 : 0;
  }, [currentVariation]);

  // Effective max price cap
  const effectiveMaxCap = useMemo(() => {
    if (currentVariation?.maxPriceCap !== null && currentVariation?.maxPriceCap !== undefined) {
      return parseFloat(currentVariation.maxPriceCap);
    }
    if (currentProduct?.maxPriceCap !== null && currentProduct?.maxPriceCap !== undefined) {
      return parseFloat(currentProduct.maxPriceCap);
    }
    return null;
  }, [currentVariation, currentProduct]);

  // Earnings calculations (10% platform commission)
  const numPrice = parseFloat(sellingPrice) || 0;
  const numQty = parseInt(quantity, 10) || 0;
  const commissionRate = 10.0;
  const platformFeePerUnit = parseFloat((numPrice * 0.1).toFixed(2));
  const vendorReceivesPerUnit = parseFloat((numPrice - platformFeePerUnit).toFixed(2));
  const totalVendorReceives = parseFloat((vendorReceivesPerUnit * numQty).toFixed(2));

  // Cap warning
  const exceedsCap = effectiveMaxCap !== null && numPrice > effectiveMaxCap;

  // Filtered product options for searchable select
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return allProducts;
    const q = productSearch.toLowerCase().trim();
    return allProducts.filter((p) =>
      p.title?.toLowerCase().includes(q) ||
      p.modelNumber?.toLowerCase().includes(q) ||
      p.category?.name?.toLowerCase().includes(q)
    );
  }, [allProducts, productSearch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!selectedProductId) {
      setError('Please select a product first.');
      return;
    }
    if (!selectedVariationId) {
      setError('Please select a SKU variation.');
      return;
    }

    if (!numQty || numQty <= 0) {
      setError('Please enter a valid quantity of at least 1.');
      return;
    }

    if (mode === 'in') {
      if (!numPrice || numPrice <= 0) {
        setError('Please enter your selling price for this game.');
        return;
      }
      if (exceedsCap) {
        setError(`Selling price cannot exceed the maximum price cap of Rs ${effectiveMaxCap}.`);
        return;
      }

      setLoading(true);
      try {
        const res = await api.vendors.stockIn({
          variationId: selectedVariationId,
          quantity: numQty,
          sellingPrice: numPrice,
        });

        if (res.success) {
          setSuccessMessage(
            `Successfully stocked in ${numQty} units of "${currentProduct?.title || 'game'}". You will receive ${formatCurrency(vendorReceivesPerUnit)} per unit upon delivery.`
          );
          if (onSuccess) onSuccess();
          setTimeout(() => {
            onClose();
          }, 1800);
        }
      } catch (err) {
        setError(err.message || 'Failed to stock in. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // Stock Out
      if (currentVendorStock <= 0) {
        setError('You currently have 0 units of your own stock for this SKU.');
        return;
      }
      if (numQty > currentVendorStock) {
        setError(`Cannot stock out ${numQty} units. Your current stock is ${currentVendorStock} units.`);
        return;
      }

      setLoading(true);
      try {
        const res = await api.vendors.stockOut({
          variationId: selectedVariationId,
          quantity: numQty,
          reason,
        });

        if (res.success) {
          setSuccessMessage(
            `Successfully stocked out ${numQty} units. Your remaining stock is ${currentVendorStock - numQty} units.`
          );
          if (onSuccess) onSuccess();
          setTimeout(() => {
            onClose();
          }, 1600);
        }
      } catch (err) {
        setError(err.message || 'Failed to stock out. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (!open) return null;

  return (
    <ModalOverlay open={open} align="bottom-mobile">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl mx-auto max-h-[100dvh] sm:max-h-[min(90vh,880px)] rounded-t-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xl flex flex-col">
        {/* Header with Mode Switcher */}
        <div className="shrink-0 p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${
                mode === 'in'
                  ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
              }`}>
                {mode === 'in' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-white">
                  {mode === 'in' ? 'Stock In (Add Game Stock)' : 'Stock Out (Remove Own Stock)'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage inventory allocation for your vendor account
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Toggle Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl">
            <button
              type="button"
              onClick={() => { setMode('in'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                mode === 'in'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Stock In</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('out'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                mode === 'out'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Stock Out</span>
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs sm:text-sm text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* STEP 1: SELECT PRODUCT */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              1. Select Catalog Product
            </label>
            {initialProduct ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                  {getProductImage(initialProduct) ? (
                    <img src={getProductImage(initialProduct)} alt={initialProduct.title} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{initialProduct.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {initialProduct.category?.name || 'Category'} · {initialProduct.attributes?.platform || initialProduct.condition || 'New'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="🔍 Search game title..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedProductId(id);
                    const prod = allProducts.find((p) => p.id === id);
                    if (prod && (!prod.variations || prod.variations.length === 0) && !fetchedProductDetails[id]) {
                      api.products.getById(id).then((res) => {
                        if (res.success && res.data) {
                          setFetchedProductDetails((prev) => ({ ...prev, [id]: res.data }));
                        }
                      }).catch(console.error);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <option value="" disabled>-- Choose a Game / Product ({filteredProducts.length} available) --</option>
                  {filteredProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.attributes?.platform || 'Console'} · {p.condition})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* STEP 2: SELECT SKU / VARIATION */}
          {currentProduct && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  2. Select SKU / Variation
                </label>
                {currentVariation && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40">
                    Your Stock: {currentVendorStock} units
                  </span>
                )}
              </div>

              {productVariations.length === 0 ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-700 dark:text-amber-400">
                  No SKU variations found for this product. Please ask the store administrator to configure SKUs.
                </div>
              ) : (
                <select
                  value={selectedVariationId}
                  onChange={(e) => {
                    setSelectedVariationId(e.target.value);
                    const v = productVariations.find((item) => item.id === e.target.value);
                    const existingStock = v?.vendorStocks?.[0];
                    if (existingStock?.sellingPrice) {
                      setSellingPrice(String(existingStock.sellingPrice));
                    } else if (v?.price) {
                      setSellingPrice(String(v.price));
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  {productVariations.map((v) => {
                    const myStock = v.vendorStocks?.[0]?.quantity || 0;
                    const details = [
                      v.platform || currentProduct?.attributes?.platform,
                      v.condition,
                      v.edition,
                      v.storage,
                      v.bundle
                    ].filter(Boolean).join(' · ');
                    return (
                      <option key={v.id} value={v.id}>
                        {v.sku} [{details}] — (My Stock: {myStock})
                      </option>
                    );
                  })}
                </select>
              )}
            </div>
          )}

          {/* STEP 3: STOCK DETAILS (Shown after product & SKU are selected) */}
          {selectedVariationId && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  {mode === 'in' ? 'Units to Stock In' : 'Units to Stock Out'}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => String(Math.max(1, (parseInt(prev, 10) || 1) - 1)))}
                    className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-lg transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={mode === 'out' ? currentVendorStock : undefined}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="flex-1 text-center py-2.5 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-base text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => {
                      const next = (parseInt(prev, 10) || 0) + 1;
                      if (mode === 'out' && next > currentVendorStock) return prev;
                      return String(next);
                    })}
                    className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-lg transition-colors"
                  >
                    +
                  </button>
                </div>
                {mode === 'out' && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                    Maximum units you can remove: <span className="font-bold text-slate-700 dark:text-slate-200">{currentVendorStock} units</span>
                  </p>
                )}
              </div>

              {/* Selling Price & Realtime Earnings (Stock In only) */}
              {mode === 'in' && (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Your Selling Price (PKR / Rs)
                      </label>
                      {effectiveMaxCap && (
                        <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                          Max Cap: Rs {effectiveMaxCap.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-semibold text-sm">
                        Rs
                      </div>
                      <input
                        type="number"
                        step="any"
                        min="1"
                        placeholder="e.g. 5000"
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(e.target.value)}
                        className={`w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border ${
                          exceedsCap ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 dark:border-slate-800'
                        } rounded-xl font-bold text-base text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40`}
                      />
                    </div>
                    {exceedsCap && (
                      <p className="text-xs text-rose-500 font-medium mt-1">
                        Price exceeds the platform cap of Rs {effectiveMaxCap}. Please lower your selling price.
                      </p>
                    )}
                  </div>

                  {/* Realtime Vendor Payout Preview Card */}
                  {numPrice > 0 && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-blue-50/30 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                        <span>Your Selling Price:</span>
                        <span className="font-semibold text-slate-800 dark:text-white">Rs {numPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-emerald-200/50 dark:border-emerald-800/40">
                        <span>Platform Commission (10%):</span>
                        <span className="font-medium text-rose-500">- Rs {platformFeePerUnit.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between pt-0.5">
                        <div className="flex items-center gap-1.5">
                          <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">
                            Amount You Will Receive:
                          </span>
                        </div>
                        <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
                          Rs {vendorReceivesPerUnit.toLocaleString()} <span className="text-xs font-normal text-emerald-700/80 dark:text-emerald-300/80">/ unit</span>
                        </span>
                      </div>

                      {numQty > 1 && (
                        <div className="text-[11px] text-right font-medium text-emerald-700 dark:text-emerald-300">
                          Total payout for {numQty} units: <span className="font-black text-xs text-emerald-800 dark:text-emerald-200">Rs {totalVendorReceives.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MANDATORY POLICY NOTICE (As requested by user) */}
                  <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-800/60 shadow-sm">
                    <div className="flex items-start gap-2.5">
                      <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h5 className="font-bold text-xs uppercase tracking-wider text-amber-900 dark:text-amber-300">
                          Vendor Payment & Fulfillment Policy
                        </h5>
                        <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed font-medium">
                          {POLICY_NOTE_TEXT}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stock Out Reason (Stock Out only) */}
              {mode === 'out' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Reason for Stock Out (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sold locally, Inventory recall, Damaged"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  />
                </div>
              )}
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs sm:text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedVariationId || (mode === 'in' && exceedsCap) || (mode === 'out' && currentVendorStock <= 0)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                mode === 'in'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-rose-500/20'
              }`}
            >
              {loading ? (
                <span>Processing...</span>
              ) : mode === 'in' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirm Stock In</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-4 h-4" />
                  <span>Confirm Stock Out</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
