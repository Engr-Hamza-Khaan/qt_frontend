import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { 
  Package, Plus, Search, Tag, Eye, Edit2, Copy, Trash2, 
  Layers, Layers2, Sparkles, Check, X, AlertCircle, Upload, Image as ImageIcon
} from 'lucide-react';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');

  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
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

  // Form States - Category
  const [catName, setCatName] = useState('');
  const [catPlatform, setCatPlatform] = useState('Hardware');
  const [catDesc, setCatDesc] = useState('');

  // Form States - Variation
  const [varSku, setVarSku] = useState('');
  const [varColor, setVarColor] = useState('');
  const [varStorage, setVarStorage] = useState('');
  const [varEdition, setVarEdition] = useState('');
  const [varPrice, setVarPrice] = useState('');
  const [varCostPrice, setVarCostPrice] = useState('');
  const [varStock, setVarStock] = useState('');
  const [varThreshold, setVarThreshold] = useState('');

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const prodRes = await api.products.getAll();
      if (prodRes.success) setProducts(prodRes.data.products);
      
      const catRes = await api.categories.getAll();
      if (catRes.success) setCategories(catRes.data);
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
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.modelNumber && p.modelNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory ? String(p.categoryId) === String(selectedCategory) : true;
    const matchesCondition = selectedCondition ? p.condition === selectedCondition : true;
    return matchesSearch && matchesCategory && matchesCondition;
  });

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
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    const payload = {
      title,
      description,
      condition,
      modelNumber,
      categoryId: parseInt(categoryId),
      status,
      tags: tagArray,
      attributes: { platform }
    };

    try {
      let res;
      if (editingProduct) {
        res = await api.products.update(editingProduct.id, payload);
      } else {
        res = await api.products.create(payload);
      }

      if (res.success) {
        setShowProductModal(false);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error saving product');
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

  // Variation Handlers
  const handleManageVariations = (product) => {
    setSelectedProductForVariations(product);
    setVarSku('');
    setVarColor('');
    setVarStorage('');
    setVarEdition('');
    setVarPrice('');
    setVarCostPrice('');
    setVarStock('');
    setVarThreshold('');
    setShowVariationModal(true);
  };

  const handleAddVariation = async (e) => {
    e.preventDefault();
    const payload = {
      sku: varSku,
      color: varColor || null,
      storage: varStorage || null,
      edition: varEdition || null,
      platform: selectedProductForVariations.attributes?.platform || 'Hardware',
      price: parseFloat(varPrice),
      costPrice: varCostPrice ? parseFloat(varCostPrice) : null,
      stockQuantity: parseInt(varStock),
      lowStockThreshold: varThreshold ? parseInt(varThreshold) : 5
    };

    try {
      const res = await api.products.addVariation(selectedProductForVariations.id, payload);
      if (res.success) {
        // Refresh selected product variations
        const updatedProdRes = await api.products.getById(selectedProductForVariations.id);
        if (updatedProdRes.success) {
          setSelectedProductForVariations(updatedProdRes.data);
          // Refresh main table too
          fetchData();
          // Reset form
          setVarSku('');
          setVarColor('');
          setVarStorage('');
          setVarEdition('');
          setVarPrice('');
          setVarCostPrice('');
          setVarStock('');
          setVarThreshold('');
        }
      }
    } catch (err) {
      alert(err.message || 'Error adding variation');
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
          fetchData();
        }
      }
    } catch (err) {
      alert(err.message || 'Error deleting variation');
    }
  };

  // Media Handlers
  const handleMediaUpload = async (e, productId) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await api.products.uploadMedia(productId, file);
      if (res.success) {
        const updatedProdRes = await api.products.getById(productId);
        if (updatedProdRes.success) {
          setSelectedProductForVariations(updatedProdRes.data);
          fetchData();
        }
      }
    } catch (err) {
      alert(err.message || 'Error uploading file');
    }
  };

  const handleDeleteMedia = async (mediaId, productId) => {
    if (!window.confirm('Delete this media file?')) return;
    try {
      const res = await api.products.deleteMedia(mediaId);
      if (res.success) {
        const updatedProdRes = await api.products.getById(productId);
        if (updatedProdRes.success) {
          setSelectedProductForVariations(updatedProdRes.data);
          fetchData();
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
        
        <div className="flex gap-3">
          <button 
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 rounded-xl transition-all font-medium text-sm border border-slate-200/50 dark:border-slate-700/50"
          >
            <Layers className="w-4 h-4" />
            New Category
          </button>
          
          <button 
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all font-semibold text-sm shadow-lg shadow-blue-500/25 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add Product
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
            <option value="Refurbished">Refurbished</option>
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
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Platform</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">SKUs / Variations</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map(p => {
                  const mediaUrl = p.media && p.media.length > 0 
                    ? `http://localhost:5000${p.media[0].filePath}` 
                    : null;
                  
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
                          <p className="text-xs text-slate-400 mt-0.5">Model: {p.modelNumber || 'N/A'}</p>
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
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200/50 dark:border-slate-800 overflow-hidden shadow-2xl transition-all duration-300">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/20">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Product to Catalog'}
              </h3>
              <button 
                onClick={() => setShowProductModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <option value="Refurbished">Refurbished</option>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                    placeholder="console, nextgen, sony"
                  />
                </div>

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
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE CATEGORY */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200/50 dark:border-slate-800 overflow-hidden shadow-2xl">
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
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-sm transition shadow-md"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: MANAGE VARIATIONS & MEDIA */}
      {showVariationModal && selectedProductForVariations && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl border border-slate-200/50 dark:border-slate-800 overflow-hidden shadow-2xl transition-all">
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
                        <img src={`http://localhost:5000${m.filePath}`} className="w-full h-full object-cover" alt="" />
                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(m.id, selectedProductForVariations.id)}
                          className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                    
                    {/* Upload button wrapper */}
                    <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white dark:bg-slate-950">
                      <Upload className="w-5 h-5 text-slate-400" />
                      <span className="text-[10px] text-slate-500 mt-1 font-semibold">Upload</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={(e) => handleMediaUpload(e, selectedProductForVariations.id)} 
                      />
                    </label>
                  </div>
                </div>

                {/* Variation Add Form */}
                <form onSubmit={handleAddVariation} className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Add SKU Variation</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">SKU Code (Unique)</label>
                    <input 
                      type="text" 
                      required 
                      value={varSku} 
                      onChange={(e) => setVarSku(e.target.value)}
                      placeholder="e.g. PS5-PRO-WHITE-01" 
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Color</label>
                      <input 
                        type="text" 
                        value={varColor} 
                        onChange={(e) => setVarColor(e.target.value)}
                        placeholder="White/Black" 
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Storage</label>
                      <input 
                        type="text" 
                        value={varStorage} 
                        onChange={(e) => setVarStorage(e.target.value)}
                        placeholder="e.g. 1TB" 
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Edition</label>
                    <input 
                      type="text" 
                      value={varEdition} 
                      onChange={(e) => setVarEdition(e.target.value)}
                      placeholder="Standard/Collector" 
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Price ($)</label>
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
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Cost Price ($)</label>
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

                  <button
                    type="submit"
                    className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition shadow-md pt-1.5"
                  >
                    Add Variation SKU
                  </button>
                </form>
              </div>

              {/* Right col: Variations table list */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Active Variations for this Product</h4>
                
                {selectedProductForVariations.variations?.length === 0 ? (
                  <div className="border border-dashed border-slate-200 dark:border-slate-800 p-10 rounded-2xl text-center text-slate-400 text-sm">
                    No variations defined yet. Create the first SKU variation on the left.
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                          <th className="p-3">SKU</th>
                          <th className="p-3">Attributes</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Stock</th>
                          <th className="p-3 text-right">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {selectedProductForVariations.variations?.map(v => {
                          const isLowStock = v.stockQuantity <= v.lowStockThreshold;
                          return (
                            <tr key={v.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/30">
                              <td className="p-3 font-semibold text-slate-800 dark:text-slate-300">{v.sku}</td>
                              <td className="p-3 text-slate-500 dark:text-slate-400">
                                {[v.color, v.storage, v.edition].filter(Boolean).join(' | ') || 'Default'}
                              </td>
                              <td className="p-3 font-semibold text-slate-800 dark:text-white">
                                ${v.price} <span className="text-[10px] text-slate-400 font-normal">(${v.costPrice || '0.00'} cost)</span>
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                                  isLowStock 
                                    ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' 
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                }`}>
                                  {v.stockQuantity} in stock
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVariation(v.id)}
                                  className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
        </div>
      )}

    </div>
  );
}

export default ProductList;
