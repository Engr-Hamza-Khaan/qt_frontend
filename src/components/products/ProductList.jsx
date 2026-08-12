import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { getMediaUrl, getProductImage } from '../../store/utils';
import { formatCurrency } from '../../utils/formatters';
import { isStaffOrAbove } from '../../utils/roles';
import ModalOverlay from '../ui/ModalOverlay';
import SearchAnalyticsModal from './SearchAnalyticsModal';
import { 
  Package, Plus, Search, Tag, Eye, Edit2, Copy, Trash2, 
  Layers, Layers2, Sparkles, Check, X, AlertCircle, Upload, Image as ImageIcon,
  TrendingUp, KeyRound, Lightbulb
} from 'lucide-react';

function ProductList() {
  const { user } = useAuth();
  const canAssignSupplier = isStaffOrAbove(user?.role);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');

  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Variation Manager Modal State
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [selectedProductForVariations, setSelectedProductForVariations] = useState(null);

  // Form States - Product
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('New');
  const [modelNumber, setModelNumber] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [platform, setPlatform] = useState('PS5');
  const [status, setStatus] = useState('Published');
  const [tags, setTags] = useState('');
  const [aliases, setAliases] = useState('');
  const [keywords, setKeywords] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isFlashSale, setIsFlashSale] = useState(false);
  const [vendorId, setVendorId] = useState('');

  // Form States - Category
  const [catName, setCatName] = useState('');
  const [catPlatform, setCatPlatform] = useState('Hardware');
  const [catDesc, setCatDesc] = useState('');

  // Form States - Variation
  const [editingVarId, setEditingVarId] = useState(null);
  const [varSku, setVarSku] = useState('');
  const [varPlatform, setVarPlatform] = useState('PS5');
  const [varCondition, setVarCondition] = useState('New');
  const [varColor, setVarColor] = useState('');
  const [varStorage, setVarStorage] = useState('');
  const [varEdition, setVarEdition] = useState('');
  const [varBundle, setVarBundle] = useState('');
  const [varPrice, setVarPrice] = useState('');
  const [varCostPrice, setVarCostPrice] = useState('');
  const [varStock, setVarStock] = useState('');
  const [varThreshold, setVarThreshold] = useState('5');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [pendingImages, setPendingImages] = useState([]);
  const [formMedia, setFormMedia] = useState([]);
  const [savingProduct, setSavingProduct] = useState(false);

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const prodRes = await api.products.getAll({ limit: 500 });
      if (prodRes.success) setProducts(Array.isArray(prodRes.data) ? prodRes.data : prodRes.data?.products || []);
      
      const catRes = await api.categories.getAll();
      if (catRes.success) setCategories(catRes.data);

      if (canAssignSupplier) {
        const vendorRes = await api.vendors.getAll({ status: 'Active' });
        if (vendorRes.success) setVendors(vendorRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch products or categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term ||
                          p.title.toLowerCase().includes(term) || 
                          (p.modelNumber && p.modelNumber.toLowerCase().includes(term)) ||
                          (Array.isArray(p.aliases) && p.aliases.some(a => a.toLowerCase().includes(term))) ||
                          (Array.isArray(p.keywords) && p.keywords.some(k => k.toLowerCase().includes(term))) ||
                          (Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(term)));
    const matchesCategory = selectedCategory ? String(p.categoryId) === String(selectedCategory) : true;
    const matchesCondition = selectedCondition ? p.condition === selectedCondition : true;
    return matchesSearch && matchesCategory && matchesCondition;
  });

  const clearPendingImages = () => {
    setPendingImages((prev) => {
      prev.forEach((img) => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
      });
      return [];
    });
  };

  const closeProductModal = () => {
    clearPendingImages();
    setFormMedia([]);
    setShowProductModal(false);
  };

  // Product Handlers
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setTitle('');
    setDescription('');
    setCondition('New');
    setModelNumber('');
    setCategoryId(categories[0]?.id || '');
    setPlatform('PS5');
    setStatus('Published');
    setTags('');
    setAliases('');
    setKeywords('');
    setPrice('');
    setStock('');
    setIsFeatured(false);
    setIsBestSeller(false);
    setIsFlashSale(false);
    setVendorId('');
    clearPendingImages();
    setFormMedia([]);
    setShowProductModal(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setTitle(product.title);
    setDescription(product.description || '');
    setCondition(product.condition);
    setModelNumber(product.modelNumber || '');
    setCategoryId(product.categoryId);
    setPlatform(product.attributes?.platform || 'PS5');
    setStatus(product.status);
    setTags(product.tags ? product.tags.join(', ') : '');
    setAliases(product.aliases ? product.aliases.join(', ') : '');
    setKeywords(product.keywords ? product.keywords.join(', ') : '');
    setPrice(product.variations?.[0]?.price?.toString() || '');
    setStock(product.variations?.[0]?.stockQuantity?.toString() || '');
    setIsFeatured(!!product.isFeatured);
    setIsBestSeller(!!product.isBestSeller);
    setIsFlashSale(!!product.isFlashSale);
    setVendorId(product.vendorId || '');
    clearPendingImages();
    setFormMedia(product.media || []);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    const aliasArray = aliases.split(',').map(a => a.trim()).filter(Boolean);
    const keywordArray = keywords.split(',').map(k => k.trim()).filter(Boolean);

    const payload = {
      title,
      description,
      condition,
      modelNumber,
      categoryId: categoryId || null,
      status,
      tags: tagArray,
      aliases: aliasArray,
      keywords: keywordArray,
      attributes: { platform },
      isFeatured,
      isBestSeller,
      isFlashSale,
    };

    if (canAssignSupplier) {
      payload.vendorId = vendorId || null;
    }

    if (!editingProduct && price) {
      payload.variations = [{
        platform,
        price: parseFloat(price),
        stockQuantity: stock ? parseInt(stock, 10) : 0,
        isActive: true,
      }];
    }

    setSavingProduct(true);
    try {
      let res;
      if (editingProduct) {
        res = await api.products.update(editingProduct.id, payload);
      } else {
        res = await api.products.create(payload);
      }

      if (res.success) {
        const productId = editingProduct?.id || res.data?.id;

        if (!editingProduct && pendingImages.length > 0 && productId) {
          for (const img of pendingImages) {
            await api.products.uploadMedia(productId, img.file);
          }
        }

        closeProductModal();
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error saving product');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? All variations will be deleted.')) return;
    try {
      const res = await api.products.delete(id);
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error deleting product');
    }
  };

  const handleDuplicateProduct = async (id) => {
    try {
      const res = await api.products.duplicate(id);
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error duplicating product');
    }
  };

  // Category Handlers
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await api.categories.create({
        name: catName,
        platform: catPlatform,
        description: catDesc
      });
      if (res.success) {
        setShowCategoryModal(false);
        setCatName('');
        setCatDesc('');
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error creating category');
    }
  };

  const resetVariationForm = (prod) => {
    setEditingVarId(null);
    setVarSku('');
    setVarPlatform(prod?.attributes?.platform || 'PS5');
    setVarCondition(prod?.condition || 'New');
    setVarColor('');
    setVarStorage('');
    setVarEdition('');
    setVarBundle('');
    setVarPrice('');
    setVarCostPrice('');
    setVarStock('');
    setVarThreshold('5');
  };

  // Variation Handlers
  const handleManageVariations = async (product) => {
    try {
      const res = await api.products.getById(product.id);
      if (!res.success) return;

      setSelectedProductForVariations(res.data);
      resetVariationForm(res.data);
      setShowVariationModal(true);
    } catch (err) {
      alert(err.message || 'Error loading product details');
    }
  };

  const handleStartEditVariation = (v) => {
    setEditingVarId(v.id);
    setVarSku(v.sku || '');
    setVarPlatform(v.platform || selectedProductForVariations?.attributes?.platform || 'PS5');
    setVarCondition(v.condition || selectedProductForVariations?.condition || 'New');
    setVarColor(v.color || '');
    setVarStorage(v.storage || '');
    setVarEdition(v.edition || '');
    setVarBundle(v.bundle || '');
    setVarPrice(v.price !== undefined ? v.price.toString() : '');
    setVarCostPrice(v.costPrice !== undefined ? v.costPrice.toString() : '');
    setVarStock(v.stockQuantity !== undefined ? v.stockQuantity.toString() : '');
    setVarThreshold(v.lowStockThreshold !== undefined ? v.lowStockThreshold.toString() : '5');
  };

  const handleCancelEditVariation = () => {
    resetVariationForm(selectedProductForVariations);
  };

  const handleSaveVariation = async (e) => {
    e.preventDefault();
    const payload = {
      sku: varSku || undefined,
      platform: varPlatform || selectedProductForVariations.attributes?.platform || null,
      condition: varCondition || 'New',
      color: varColor || null,
      storage: varStorage || null,
      edition: varEdition || null,
      bundle: varBundle || null,
      price: parseFloat(varPrice),
      costPrice: varCostPrice ? parseFloat(varCostPrice) : 0,
      stockQuantity: parseInt(varStock, 10) || 0,
      lowStockThreshold: varThreshold ? parseInt(varThreshold, 10) : 5
    };

    try {
      let res;
      if (editingVarId) {
        res = await api.products.updateVariation(editingVarId, payload);
      } else {
        res = await api.products.addVariation(selectedProductForVariations.id, payload);
      }

      if (res.success) {
        // Refresh selected product variations
        const updatedProdRes = await api.products.getById(selectedProductForVariations.id);
        if (updatedProdRes.success) {
          setSelectedProductForVariations(updatedProdRes.data);
          syncProductInList(updatedProdRes.data);
          fetchData();
          resetVariationForm(updatedProdRes.data);
        }
      }
    } catch (err) {
      alert(err.message || 'Error saving variation');
    }
  };

  const handleDeleteVariation = async (varId) => {
    if (!window.confirm('Delete this variation SKU?')) return;
    try {
      const res = await api.products.deleteVariation(varId);
      if (res.success) {
        const updatedProdRes = await api.products.getById(selectedProductForVariations.id);
        if (updatedProdRes.success) {
          setSelectedProductForVariations(updatedProdRes.data);
          syncProductInList(updatedProdRes.data);
          fetchData();
        }
      }
    } catch (err) {
      alert(err.message || 'Error deleting variation');
    }
  };

  const syncProductInList = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p))
    );
  };

  const validateMediaFile = (file) => {
    const allowedTypes = /^image\/(jpeg|jpg|png|gif|webp|bmp|svg\+xml|heic|heif)|video\//i;
    if (!allowedTypes.test(file.type) && !/\.(jpe?g|png|gif|webp|bmp|svg|heic|heif)$/i.test(file.name)) {
      alert('Please upload a valid image file (jpg, png, gif, webp).');
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image is too large. Maximum size is 10MB.');
      return false;
    }

    return true;
  };

  const handlePendingImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = files.filter(validateMediaFile);
    if (!validFiles.length) {
      e.target.value = '';
      return;
    }

    setPendingImages((prev) => [
      ...prev,
      ...validFiles.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
    e.target.value = '';
  };

  const handleRemovePendingImage = (id) => {
    setPendingImages((prev) => {
      const item = prev.find((img) => img.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  // Media Handlers
  const handleMediaUpload = async (e, productId, onUpdated) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateMediaFile(file)) {
      e.target.value = '';
      return;
    }

    setUploadingMedia(true);
    try {
      const res = await api.products.uploadMedia(productId, file);
      if (res.success) {
        const updatedProdRes = await api.products.getById(productId);
        if (updatedProdRes.success) {
          onUpdated?.(updatedProdRes.data);
        }
      }
    } catch (err) {
      alert(err.message || 'Error uploading file');
    } finally {
      setUploadingMedia(false);
      e.target.value = '';
    }
  };

  const handleDeleteMedia = async (mediaId, productId, onUpdated) => {
    if (!window.confirm('Delete this media file?')) return;
    try {
      const res = await api.products.deleteMedia(mediaId);
      if (res.success) {
        const updatedProdRes = await api.products.getById(productId);
        if (updatedProdRes.success) {
          onUpdated?.(updatedProdRes.data);
        }
      }
    } catch (err) {
      alert(err.message || 'Error deleting media');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Package className="w-7 h-7 text-blue-500" />
            Products & Catalog Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Control items, create variations, upload images, and configure categories.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button 
            type="button"
            onClick={() => setShowAnalyticsModal(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 rounded-xl transition-all font-semibold text-xs sm:text-sm border border-purple-200 dark:border-purple-800/60"
          >
            <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Search Analytics</span>
          </button>

          <button 
            type="button"
            onClick={handleOpenCreateModal}
            className="btn-brand flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by product name or model number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.platform})</option>
            ))}
          </select>

          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Conditions</option>
            <option value="New">New</option>
            <option value="Used">Used</option>
          </select>
        </div>
      </div>

      {/* Main product table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Fetching catalog database...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl py-20 text-center rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
          <Package className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Products Found</h3>
          <p className="text-slate-400 text-sm mt-1">Try resetting your filters or create a new product above.</p>
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/20">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product Info</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Condition</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                  {canAssignSupplier && (
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Supplier</th>
                  )}
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Platform</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">SKUs / Variations</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map(p => {
                  const mediaUrl = getProductImage(p);
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {mediaUrl ? (
                            <img src={mediaUrl} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1">{p.title}</h4>
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            <span className="text-[11px] text-slate-400">Model: {p.modelNumber || 'N/A'}</span>
                            {p.aliases && p.aliases.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 rounded text-[10px] font-semibold border border-purple-200 dark:border-purple-800/40" title={`Aliases: ${p.aliases.join(', ')}`}>
                                <Sparkles className="w-2.5 h-2.5" />
                                {p.aliases.slice(0, 2).join(', ')}{p.aliases.length > 2 ? ` +${p.aliases.length - 2}` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          p.condition === 'New' 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}>
                          {p.condition}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {p.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      {canAssignSupplier && (
                        <td className="p-4">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {p.vendor?.companyName || 'Store (No supplier)'}
                          </span>
                        </td>
                      )}
                      <td className="p-4">
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md font-semibold">
                          {p.attributes?.platform || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => handleManageVariations(p)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold transition-all"
                        >
                          <Layers2 className="w-3.5 h-3.5" />
                          {p.variations?.length || 0} Variations
                        </button>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-semibold ${
                          p.status === 'Published' 
                            ? 'text-emerald-500' 
                            : 'text-slate-400'
                        }`}>
                          ● {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            title="Edit Product"
                            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicateProduct(p.id)}
                            title="Duplicate Product"
                            className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            title="Delete Product"
                            className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE OR EDIT PRODUCT */}
      <ModalOverlay open={showProductModal} align="bottom-mobile">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl mx-auto max-h-[100dvh] sm:max-h-[min(90vh,900px)] rounded-t-2xl sm:rounded-3xl border border-slate-200/50 dark:border-slate-800 overflow-hidden shadow-2xl transition-all duration-300 flex flex-col">
            <div className="shrink-0 p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/20">
              <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-white truncate">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Product to Catalog'}
              </h3>
              <button 
                type="button"
                onClick={closeProductModal}
                className="shrink-0 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Product Images
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {editingProduct
                    ? 'Upload or remove product photos. First image is used as the featured image on the store.'
                    : 'Select images now — they will be uploaded when you save the product.'}
                </p>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {editingProduct
                    ? formMedia.map((m) => (
                        <div key={m.id} className="relative group aspect-square rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-200 dark:bg-slate-900">
                          <img src={getMediaUrl(m.url)} className="w-full h-full object-cover" alt="" />
                          {m.isFeatured && (
                            <span className="absolute top-1 left-1 text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-md">
                              Featured
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteMedia(m.id, editingProduct.id, (data) => {
                                setFormMedia(data.media || []);
                                setEditingProduct(data);
                                syncProductInList(data);
                              })
                            }
                            className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      ))
                    : pendingImages.map((img) => (
                        <div key={img.id} className="relative group aspect-square rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-200 dark:bg-slate-900">
                          <img src={img.previewUrl} className="w-full h-full object-cover" alt="" />
                          <button
                            type="button"
                            onClick={() => handleRemovePendingImage(img.id)}
                            className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      ))}

                  <label
                    className={`aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 flex flex-col items-center justify-center transition-colors bg-white dark:bg-slate-950 ${
                      uploadingMedia || savingProduct ? 'opacity-60 pointer-events-none' : 'cursor-pointer'
                    }`}
                  >
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-[10px] text-slate-500 mt-1 font-semibold">
                      {uploadingMedia ? 'Uploading...' : 'Upload'}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp,image/bmp,image/svg+xml"
                      className="hidden"
                      multiple={!editingProduct}
                      disabled={uploadingMedia || savingProduct}
                      onChange={
                        editingProduct
                          ? (e) =>
                              handleMediaUpload(e, editingProduct.id, (data) => {
                                setFormMedia(data.media || []);
                                setEditingProduct(data);
                                syncProductInList(data);
                              })
                          : handlePendingImageSelect
                      }
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Product Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                    placeholder="e.g. PlayStation 5 Pro"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Model Number</label>
                  <input
                    type="text"
                    value={modelNumber}
                    onChange={(e) => setModelNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                    placeholder="e.g. CFI-2000A"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                  placeholder="Provide details about specs, condition, features..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.platform})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                  >
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Platform Attribute</label>
                  <input
                    type="text"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                    placeholder="e.g. PS5, Switch, Retro"
                  />
                </div>
              </div>

              {/* Search Discovery & Aliases Section */}
              <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Search Discovery, Aliases & Keywords
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Allow customers to instantly discover this product using abbreviations, nicknames, or common gaming terms (e.g. <strong className="text-purple-600 dark:text-purple-400">GTA 5</strong> for Grand Theft Auto V, <strong className="text-purple-600 dark:text-purple-400">RDR</strong> for Red Dead Redemption, or <strong className="text-purple-600 dark:text-purple-400">PS5</strong>).
                </p>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-purple-500" />
                        Aliases & Alternative Names (comma-separated)
                      </span>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-normal">Highest Search Priority</span>
                    </label>
                    <input
                      type="text"
                      value={aliases}
                      onChange={(e) => setAliases(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:text-white"
                      placeholder="e.g. GTA 5, GTA V, Grand Theft Auto 5, RDR, RDR1, BO6, PS5"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-blue-500" />
                      Search Keywords (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                      placeholder="e.g. rockstar, heist, wild west, open world, zombies, multiplayer, shooter"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                      placeholder="console, nextgen, sony, exclusive"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>

                {canAssignSupplier && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Assign Supplier</label>
                    <select
                      value={vendorId}
                      onChange={(e) => setVendorId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                    >
                      <option value="">Store owned (no supplier)</option>
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>{v.companyName}</option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Supplier gets this product in their portal. Orders can still assign any vendor at fulfillment time.
                    </p>
                  </div>
                )}
              </div>

              {!editingProduct && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Price (PKR)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                      placeholder="e.g. 499.99"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                      placeholder="e.g. 10"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  Featured on homepage
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  Best Seller
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFlashSale}
                    onChange={(e) => setIsFlashSale(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  Flash Deal
                </label>
              </div>
              </div>

              <div className="shrink-0 p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={closeProductModal}
                  disabled={savingProduct}
                  className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="btn-brand w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm disabled:opacity-60"
                >
                  {savingProduct ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
      </ModalOverlay>

      {/* MODAL 2: CREATE CATEGORY */}
      <ModalOverlay open={showCategoryModal}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">Add New Category</h3>
              <button 
                onClick={() => setShowCategoryModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                  placeholder="e.g. Hardware, Software"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Platform Classification</label>
                <select
                  value={catPlatform}
                  onChange={(e) => setCatPlatform(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                >
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Peripherals">Peripherals</option>
                  <option value="Collectibles">Collectibles</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Description</label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  rows="2"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                  placeholder="A short summary of this category type"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-brand px-5 py-2.5 rounded-xl font-bold text-sm"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
      </ModalOverlay>

      {/* MODAL 3: MANAGE VARIATIONS & MEDIA */}
      {showVariationModal && selectedProductForVariations && (
      <ModalOverlay open>
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl mx-auto max-h-[90vh] overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-2xl transition-all flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/20">
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                  Manage Variations & Media
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedProductForVariations.title}
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowVariationModal(false);
                  setSelectedProductForVariations(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-h-[80vh] overflow-y-auto">
              
              {/* Left col: Add new variation & media gallery */}
              <div className="space-y-6 lg:col-span-1">
                
                {/* Media Uploader */}
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Product Photos</h4>
                  
                  {/* Photo List */}
                  <div className="grid grid-cols-3 gap-2">
                    {selectedProductForVariations.media?.map(m => (
                      <div key={m.id} className="relative group aspect-square rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-200 dark:bg-slate-900">
                        <img src={getMediaUrl(m.url)} className="w-full h-full object-cover" alt="" />
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteMedia(m.id, selectedProductForVariations.id, (data) => {
                              setSelectedProductForVariations(data);
                              syncProductInList(data);
                            })
                          }
                          className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                    
                    {/* Upload button wrapper */}
                    <label className={`aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 flex flex-col items-center justify-center transition-colors bg-white dark:bg-slate-950 ${uploadingMedia ? 'opacity-60 pointer-events-none' : 'cursor-pointer'}`}>
                      <Upload className="w-5 h-5 text-slate-400" />
                      <span className="text-[10px] text-slate-500 mt-1 font-semibold">
                        {uploadingMedia ? 'Uploading...' : 'Upload'}
                      </span>
                      <input 
                        type="file" 
                        accept="image/jpeg,image/png,image/gif,image/webp,image/bmp,image/svg+xml"
                        className="hidden" 
                        disabled={uploadingMedia}
                        onChange={(e) =>
                          handleMediaUpload(e, selectedProductForVariations.id, (data) => {
                            setSelectedProductForVariations(data);
                            syncProductInList(data);
                          })
                        }
                      />
                    </label>
                  </div>
                </div>                {/* Variation Add / Edit Form */}
                <form onSubmit={handleSaveVariation} className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      {editingVarId ? 'Edit SKU Variation' : 'Add SKU Variation'}
                    </h4>
                    {editingVarId && (
                      <button
                        type="button"
                        onClick={handleCancelEditVariation}
                        className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">SKU Code (Auto if empty)</label>
                    <input 
                      type="text" 
                      value={varSku} 
                      onChange={(e) => setVarSku(e.target.value)}
                      placeholder="e.g. PS5-NEW-1TB-BLK-01" 
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none dark:text-white"
                    />
                  </div>

                  {/* 1. Platform & 2. Condition */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Platform</label>
                      <select
                        value={varPlatform}
                        onChange={(e) => setVarPlatform(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none dark:text-white"
                      >
                        <option value="PS5">PS5</option>
                        <option value="PS4">PS4</option>
                        <option value="Xbox Series X">Xbox Series X</option>
                        <option value="Xbox One">Xbox One</option>
                        <option value="Nintendo Switch">Nintendo Switch</option>
                        <option value="PC">PC</option>
                        <option value="Hardware">Hardware / Universal</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Condition</label>
                      <select
                        value={varCondition}
                        onChange={(e) => setVarCondition(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none dark:text-white"
                      >
                        <option value="New">Brand New</option>
                        <option value="Used">Pre-Owned / Used</option>
                      </select>
                    </div>
                  </div>

                  {/* 3. Color & 4. Storage */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Color Variation</label>
                      <input 
                        type="text" 
                        value={varColor} 
                        onChange={(e) => setVarColor(e.target.value)}
                        placeholder="e.g. Midnight Black, White" 
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Storage Variation</label>
                      <input 
                        type="text" 
                        value={varStorage} 
                        onChange={(e) => setVarStorage(e.target.value)}
                        placeholder="e.g. 512GB, 1TB, 2TB" 
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  {/* 5. Edition */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Edition Variation</label>
                    <input 
                      type="text" 
                      value={varEdition} 
                      onChange={(e) => setVarEdition(e.target.value)}
                      placeholder="e.g. Standard, Digital, Collector's, Deluxe" 
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none dark:text-white"
                    />
                  </div>

                  {/* 6. Bundle */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Bundle Variation</label>
                    <input 
                      type="text" 
                      value={varBundle} 
                      onChange={(e) => setVarBundle(e.target.value)}
                      placeholder="e.g. Console Only, With Extra Controller, Game Pack" 
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none dark:text-white"
                    />
                  </div>

                  {/* Price & Cost Price */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Price (PKR)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        required 
                        value={varPrice} 
                        onChange={(e) => setVarPrice(e.target.value)}
                        placeholder="499.99" 
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Cost Price (PKR)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={varCostPrice} 
                        onChange={(e) => setVarCostPrice(e.target.value)}
                        placeholder="350.00" 
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Stock & Threshold */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Stock Qty</label>
                      <input 
                        type="number" 
                        required 
                        value={varStock} 
                        onChange={(e) => setVarStock(e.target.value)}
                        placeholder="10" 
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Low Stock Alert</label>
                      <input 
                        type="number" 
                        value={varThreshold} 
                        onChange={(e) => setVarThreshold(e.target.value)}
                        placeholder="3" 
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    {editingVarId && (
                      <button
                        type="button"
                        onClick={handleCancelEditVariation}
                        className="w-1/3 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className={`btn-brand ${editingVarId ? 'flex-1' : 'w-full'} py-2 rounded-xl text-xs font-bold`}
                    >
                      {editingVarId ? 'Save Changes' : 'Add Variation SKU'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right col: Variations table list */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Active Variations ({selectedProductForVariations.variations?.length || 0})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Supports Color, Storage, Edition, Platform, Condition & Bundle
                  </span>
                </div>
                
                {selectedProductForVariations.variations?.length === 0 ? (
                  <div className="border border-dashed border-slate-200 dark:border-slate-800 p-10 rounded-2xl text-center text-slate-400 text-sm">
                    No variations defined yet. Create the first SKU variation on the left.
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                            <th className="p-3">SKU & Specs</th>
                            <th className="p-3">Variation Attributes</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Stock</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {selectedProductForVariations.variations?.map((v) => {
                            const isLowStock = v.stockQuantity <= (v.lowStockThreshold ?? 5);
                            const isCurrentlyEditing = editingVarId === v.id;
                            return (
                              <tr 
                                key={v.id} 
                                className={`transition-colors ${isCurrentlyEditing ? 'bg-purple-500/10 dark:bg-purple-500/20' : 'hover:bg-slate-100/50 dark:hover:bg-slate-900/30'}`}
                              >
                                <td className="p-3">
                                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 flex-wrap">
                                    <span>{v.sku}</span>
                                    {v.platform && (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                                        {v.platform}
                                      </span>
                                    )}
                                    {v.condition && (
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                        v.condition === 'New'
                                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                      }`}>
                                        {v.condition}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3 text-slate-600 dark:text-slate-300">
                                  <div className="flex flex-wrap gap-1 items-center">
                                    {v.storage && (
                                      <span className="px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-[10px] font-medium">
                                        💾 {v.storage}
                                      </span>
                                    )}
                                    {v.color && (
                                      <span className="px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-[10px] font-medium">
                                        🎨 {v.color}
                                      </span>
                                    )}
                                    {v.edition && (
                                      <span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-medium">
                                        ⭐ {v.edition}
                                      </span>
                                    )}
                                    {v.bundle && (
                                      <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-medium">
                                        📦 {v.bundle}
                                      </span>
                                    )}
                                    {!v.storage && !v.color && !v.edition && !v.bundle && (
                                      <span className="text-slate-400 text-[11px]">Standard Option</span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3 font-semibold text-slate-800 dark:text-white whitespace-nowrap">
                                  {formatCurrency(v.price)}{' '}
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    ({formatCurrency(v.costPrice || 0)} cost)
                                  </span>
                                </td>
                                <td className="p-3 whitespace-nowrap">
                                  <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                                    isLowStock 
                                      ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' 
                                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                  }`}>
                                    {v.stockQuantity} in stock
                                  </span>
                                </td>
                                <td className="p-3 text-right whitespace-nowrap">
                                  <div className="inline-flex items-center gap-1 justify-end">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditVariation(v)}
                                      className="text-blue-500 hover:text-blue-700 p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                                      title="Edit variation"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteVariation(v.id)}
                                      className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                      title="Delete variation"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-right">
              <button 
                type="button"
                onClick={() => {
                  setShowVariationModal(false);
                  setSelectedProductForVariations(null);
                }}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition"
              >
                Close Manager
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* MODAL 3: SEARCH ANALYTICS & TRENDING KEYWORDS */}
      <SearchAnalyticsModal
        open={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
      />

    </div>
  );
}

export default ProductList;
