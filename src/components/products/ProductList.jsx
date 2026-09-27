import { useState, useEffect, useMemo } from 'react';
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
  TrendingUp, KeyRound, Lightbulb, Link2
} from 'lucide-react';

const GAME_GENRES = [
  'Action', 'Adventure', 'Shooting', 'Fighting', 'Racing',
  'Sports', 'Simulation', 'Horror', 'Survival', 'RPG',
  'Platformer', 'Puzzle', 'Stealth', 'Battle', 'MOBA',
  'MMORPG', 'Roguelike', 'Metroidvania', 'Strategy', 'FPS'
];

const REGION_OPTIONS = [
  'Region 01 (USA/Canada)',
  'Region 02 (UK/UAE)',
  'Region 03 (HongKong)',
  'Region 04 (Australia)'
];

const GAME_PLATFORMS = ['PS5', 'PS4', 'XBOX', 'NINTENDO SWITCH'];

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
  const [variant, setVariant] = useState('Slim');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('New');
  const [modelNumber, setModelNumber] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [platform, setPlatform] = useState('PS5');
  const [brand, setBrand] = useState('Sony');
  const [placement, setPlacement] = useState('Horizontal');
  const [maxPriceCap, setMaxPriceCap] = useState('');
  const [embedMedia, setEmbedMedia] = useState('');
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

  // Game-specific Form States (matching PDF)
  const [region, setRegion] = useState('');
  const [developer, setDeveloper] = useState('');
  const [storyHours, setStoryHours] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [searchKeywords, setSearchKeywords] = useState('');

  // Form States - Category
  const [catName, setCatName] = useState('');
  const [catPlatform, setCatPlatform] = useState('Hardware');
  const [catDesc, setCatDesc] = useState('');

  // Form States - Variation
  const [editingVarId, setEditingVarId] = useState(null);
  const [varSku, setVarSku] = useState('');
  const [varTitle, setVarTitle] = useState('');
  const [varImageUrl, setVarImageUrl] = useState('');
  const [varDescription, setVarDescription] = useState('');
  const [varEmbedMedia, setVarEmbedMedia] = useState('');
  const [varRegion, setVarRegion] = useState('');
  const [varDeveloper, setVarDeveloper] = useState('');
  const [varBrand, setVarBrand] = useState('Sony');
  const [varVariant, setVarVariant] = useState('Slim');
  const [varModelNumber, setVarModelNumber] = useState('');
  const [varStoryHours, setVarStoryHours] = useState('');
  const [varPlacement, setVarPlacement] = useState('Horizontal');
  const [varMaxPriceCap, setVarMaxPriceCap] = useState('');
  const [varSelectedGenres, setVarSelectedGenres] = useState([]);
  const [varSearchKeywords, setVarSearchKeywords] = useState('');
  const [varPlatform, setVarPlatform] = useState('PS5');
  const [varCondition, setVarCondition] = useState('New');
  const [varColor, setVarColor] = useState('');
  const [varStorage, setVarStorage] = useState('');
  const [varEdition, setVarEdition] = useState('');
  const [varBundle, setVarBundle] = useState('');
  const [varPrice, setVarPrice] = useState('');
  const [varCostPrice, setVarCostPrice] = useState('');
  const [varStock, setVarStock] = useState('10');
  const [varThreshold, setVarThreshold] = useState('5');
  const [uploadingVarMedia, setUploadingVarMedia] = useState(false);
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

  // Filtered Products - Multi-column comprehensive search across all table fields & keywords
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const trimmedSearch = searchTerm.trim().toLowerCase();

      // Dropdown filters
      const matchesCategory = selectedCategory ? String(p.categoryId) === String(selectedCategory) : true;
      const matchesConditionFilter = selectedCondition ? p.condition === selectedCondition : true;

      if (!matchesCategory || !matchesConditionFilter) return false;
      if (!trimmedSearch) return true;

      // Tokenize search query for multi-word cross-column searches (e.g. "PS5 New Retro")
      const terms = trimmedSearch.split(/\s+/).filter(Boolean);

      return terms.every(term => {
        // 1. PRODUCT INFO COLUMN (Title, Model Number, Aliases, Keywords, Tags, Description, ID)
        if (p.title?.toLowerCase().includes(term)) return true;
        if (p.modelNumber?.toLowerCase().includes(term)) return true;
        if (p.description?.toLowerCase().includes(term)) return true;
        if (String(p.id).toLowerCase().includes(term)) return true;
        if (Array.isArray(p.aliases) && p.aliases.some(a => String(a).toLowerCase().includes(term))) return true;
        if (Array.isArray(p.keywords) && p.keywords.some(k => String(k).toLowerCase().includes(term))) return true;
        if (Array.isArray(p.tags) && p.tags.some(t => String(t).toLowerCase().includes(term))) return true;

        // 2. CONDITION COLUMN (New, Used, Brand New, Pre-Owned)
        if (p.condition?.toLowerCase().includes(term)) return true;
        if ((term === 'new' || term === 'brand new') && p.condition === 'New') return true;
        if ((term === 'used' || term === 'pre-owned' || term === 'preowned') && (p.condition === 'Used' || p.condition === 'Pre-Owned')) return true;

        // 3. CATEGORY COLUMN (Name, Category Platform, Description)
        if (p.category?.name?.toLowerCase().includes(term)) return true;
        if (p.category?.platform?.toLowerCase().includes(term)) return true;
        if (p.category?.description?.toLowerCase().includes(term)) return true;

        // 4. SUPPLIER / VENDOR COLUMN (Company Name, Contact Name, Email, Phone, "Store / No Supplier")
        if (p.vendor?.companyName?.toLowerCase().includes(term)) return true;
        if (p.vendor?.name?.toLowerCase().includes(term)) return true;
        if (p.vendor?.email?.toLowerCase().includes(term)) return true;
        if (!p.vendor && ('store (no supplier)'.includes(term) || 'no supplier'.includes(term) || 'store'.includes(term) || 'supplier'.includes(term))) return true;

        // 5. PLATFORM COLUMN (Product Attributes Platform, Category Platform)
        if (p.attributes?.platform?.toLowerCase().includes(term)) return true;
        if (p.platform?.toLowerCase().includes(term)) return true;

        // 6. SKUs / VARIATIONS COLUMN (SKU, Platform, Condition, Color, Storage, Edition, Bundle, Price, Variation Count)
        const varCountStr = `${p.variations?.length || 0} variations`;
        if (varCountStr.includes(term) || `${p.variations?.length || 0} skus`.includes(term)) return true;
        if (Array.isArray(p.variations) && p.variations.some(v => {
          if (!v) return false;
          if (v.sku?.toLowerCase().includes(term)) return true;
          if (v.platform?.toLowerCase().includes(term)) return true;
          if (v.condition?.toLowerCase().includes(term)) return true;
          if (v.color?.toLowerCase().includes(term)) return true;
          if (v.storage?.toLowerCase().includes(term)) return true;
          if (v.edition?.toLowerCase().includes(term)) return true;
          if (v.bundle?.toLowerCase().includes(term)) return true;
          if (v.price !== undefined && String(v.price).includes(term)) return true;
          if (v.costPrice !== undefined && String(v.costPrice).includes(term)) return true;
          return false;
        })) return true;

        // 7. STATUS COLUMN (Published, Draft, Archived, Featured, Best Seller, Flash Sale)
        if (p.status?.toLowerCase().includes(term)) return true;
        if (p.isFeatured && 'featured'.includes(term)) return true;
        if (p.isBestSeller && ('bestseller'.includes(term) || 'best seller'.includes(term))) return true;
        if (p.isFlashSale && ('flash sale'.includes(term) || 'flashsale'.includes(term))) return true;

        // 8. GENERAL ATTRIBUTES & SPECIFICATIONS (Dynamic JSON Key-Value pairs)
        if (p.attributes && typeof p.attributes === 'object') {
          for (const [key, val] of Object.entries(p.attributes)) {
            if (key.toLowerCase().includes(term)) return true;
            if (val && String(val).toLowerCase().includes(term)) return true;
          }
        }

        if (p.specifications && typeof p.specifications === 'object') {
          for (const [key, val] of Object.entries(p.specifications)) {
            if (key.toLowerCase().includes(term)) return true;
            if (val && String(val).toLowerCase().includes(term)) return true;
          }
        }

        return false;
      });
    });
  }, [products, searchTerm, selectedCategory, selectedCondition]);


  const selectedCatObj = useMemo(() => {
    return categories.find(c => String(c.id) === String(categoryId));
  }, [categories, categoryId]);

  const isGameCategory = useMemo(() => {
    if (!categoryId) return false;
    if (categoryId === 'game-default') return true;
    if (!selectedCatObj) return false;
    const name = (selectedCatObj.name || '').toLowerCase();
    const slug = (selectedCatObj.slug || '').toLowerCase();
    const plat = (selectedCatObj.platform || '').toLowerCase();
    return name.includes('game') || slug.includes('game') || plat === 'software';
  }, [selectedCatObj, categoryId]);

  const handleToggleGenre = (g) => {
    setSelectedGenres((prev) => {
      if (prev.includes(g)) {
        return prev.filter(item => item !== g);
      } else {
        return [...prev, g]; // Maintain selection sequence
      }
    });
  };

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
    setVariant('Slim');
    setDescription('');
    setCondition('New');
    setModelNumber('');
    // Default to Games category if found, else first category
    const gameCat = categories.find(c => 
      c.name?.toLowerCase().includes('game') || c.slug?.toLowerCase().includes('game')
    );
    setCategoryId(gameCat ? gameCat.id : (categories[0]?.id || ''));
    setPlatform('PS5');
    setBrand('Sony');
    setPlacement('Horizontal');
    setMaxPriceCap('');
    setEmbedMedia('');
    setStatus('Published');
    setTags('');
    setAliases('');
    setKeywords('');
    setSearchKeywords('');
    setRegion('');
    setDeveloper('');
    setStoryHours('');
    setSelectedGenres([]);
    setPrice('');
    setStock('10');
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
    setTitle(product.title || '');
    setVariant(product.attributes?.variant || 'Slim');
    setDescription(product.description || '');
    setCondition(product.condition === 'Used' ? 'Used' : 'New');
    setModelNumber(product.modelNumber || '');
    setCategoryId(product.categoryId || '');
    setPlatform(product.attributes?.platform || product.platform || 'PS5');
    setBrand(product.attributes?.brand || 'Sony');
    setPlacement(product.attributes?.placement || 'Horizontal');
    setMaxPriceCap(
      product.maxPriceCap !== undefined && product.maxPriceCap !== null
        ? String(product.maxPriceCap)
        : (product.attributes?.maxPriceCap !== undefined && product.attributes?.maxPriceCap !== null ? String(product.attributes.maxPriceCap) : '')
    );
    setEmbedMedia(product.embedMedia || product.attributes?.embedMedia || '');
    setStatus(product.status || 'Published');
    setTags(product.tags ? product.tags.join(', ') : '');
    setAliases(product.aliases ? product.aliases.join(', ') : '');
    setKeywords(product.keywords ? product.keywords.join(', ') : '');

    // Game fields
    setRegion(product.attributes?.region || product.specifications?.region || '');
    setDeveloper(product.attributes?.developer || product.attributes?.brand || product.specifications?.developer || '');
    
    // Extract numerical story hours (e.g. '28.5 Hours' -> '28.5')
    const rawHours = product.attributes?.storyHours || product.specifications?.storyHours || product.attributes?.playtime || '';
    const hoursMatch = String(rawHours).match(/[\d.]+/);
    setStoryHours(hoursMatch ? hoursMatch[0] : (rawHours ? String(rawHours).trim() : ''));

    // Extract genres array preserving order
    if (Array.isArray(product.attributes?.genres)) {
      setSelectedGenres(product.attributes.genres);
    } else if (typeof product.attributes?.genre === 'string') {
      const gList = product.attributes.genre.split(/[\/,]/).map(g => g.trim()).filter(Boolean);
      setSelectedGenres(gList);
    } else if (product.specifications?.genre) {
      const gList = String(product.specifications.genre).split(/[\/,]/).map(g => g.trim()).filter(Boolean);
      setSelectedGenres(gList);
    } else {
      setSelectedGenres([]);
    }

    // SEO single keywords field
    const combinedKeywords = [
      ...(Array.isArray(product.keywords) ? product.keywords : []),
      ...(Array.isArray(product.aliases) ? product.aliases : [])
    ];
    const uniqueKeywords = [...new Set(combinedKeywords)];
    setSearchKeywords(uniqueKeywords.length > 0 ? uniqueKeywords.join(', ') : (product.keywords?.join?.(', ') || ''));

    setPrice(product.variations?.[0]?.price?.toString() || '');
    setStock(product.variations?.[0]?.stockQuantity?.toString() || '10');
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

    // Validate MAX PRICE CAP (Mandatory numerical field)
    if (!maxPriceCap) {
      alert('MAX PRICE CAP is mandatory. Please enter a valid maximum price limit.');
      return;
    }
    const numMaxCap = parseFloat(maxPriceCap);
    if (isNaN(numMaxCap) || numMaxCap <= 0) {
      alert('Please enter a valid positive number for MAX PRICE CAP.');
      return;
    }
    if (price && parseFloat(price) > numMaxCap) {
      alert(`Price (Rs ${price}) cannot be greater than the MAX PRICE CAP (Rs ${numMaxCap.toLocaleString()}). Vendors and products cannot exceed this limit.`);
      return;
    }

    const effectiveCondition = (condition === 'Pre Owned/Used' || condition === 'Used') ? 'Used' : 'New';

    // Format Story Hours ("20" -> "20 Hours")
    const formattedStoryHours = storyHours
      ? (String(storyHours).toLowerCase().includes('hour') ? String(storyHours).trim() : `${storyHours} Hours`)
      : null;

    // Format Genre Sequence (Action/RPG/FPS)
    const genreSequence = selectedGenres.length > 0 ? selectedGenres.join('/') : null;

    // Search Keywords processing
    const parsedKeywords = searchKeywords.split(',').map(k => k.trim()).filter(Boolean);
    const tagArray = isGameCategory
      ? [...new Set([...parsedKeywords, ...selectedGenres, platform].filter(Boolean))]
      : tags.split(',').map(t => t.trim()).filter(Boolean);
    const aliasArray = isGameCategory
      ? parsedKeywords
      : aliases.split(',').map(a => a.trim()).filter(Boolean);
    const keywordArray = isGameCategory
      ? parsedKeywords
      : keywords.split(',').map(k => k.trim()).filter(Boolean);

    const generatedModelNumber = isGameCategory
      ? (modelNumber || `GAME-${platform}-${title.slice(0, 8).replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'STD'}`)
      : modelNumber;

    const payload = {
      title,
      description,
      condition: effectiveCondition,
      modelNumber: generatedModelNumber,
      categoryId: categoryId || null,
      status,
      tags: tagArray,
      aliases: aliasArray,
      keywords: keywordArray,
      attributes: {
        ...(editingProduct?.attributes || {}),
        platform,
        maxPriceCap: numMaxCap,
        embedMedia: embedMedia ? embedMedia.trim() : null,
        ...(isGameCategory ? {
          region: region || null,
          developer: developer || null,
          storyHours: formattedStoryHours,
          genre: genreSequence,
          genres: selectedGenres,
          categoryType: 'Game',
        } : {
          variant: variant || undefined,
          brand: brand || undefined,
          placement: placement || undefined,
          categoryType: 'Console',
        })
      },
      specifications: {
        ...(editingProduct?.specifications || {}),
        ...(isGameCategory ? {
          region: region || null,
          developer: developer || null,
          storyHours: formattedStoryHours,
          genre: genreSequence,
          genres: selectedGenres,
        } : {})
      },
      maxPriceCap: numMaxCap,
      embedMedia: embedMedia ? embedMedia.trim() : null,
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
        condition: effectiveCondition,
        price: parseFloat(price),
        stockQuantity: stock ? parseInt(stock, 10) : 10,
        isActive: true,
      }];
    }

    setSavingProduct(true);
    try {
      let res;
      if (editingProduct) {
        res = await api.products.update(editingProduct.id, payload);
        if (price && editingProduct.variations?.length === 1) {
          const singleVar = editingProduct.variations[0];
          try {
            await api.products.updateVariation(singleVar.id, {
              price: parseFloat(price),
              condition: effectiveCondition,
              platform: platform || singleVar.platform,
              stockQuantity: stock ? parseInt(stock, 10) : singleVar.stockQuantity,
            });
          } catch (varErr) {
            console.warn('Could not auto-update single variation price:', varErr);
          }
        }
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

  const isVariationGame = useMemo(() => {
    if (!selectedProductForVariations) return true;
    const cat = categories.find(c => String(c.id) === String(selectedProductForVariations.categoryId)) || selectedProductForVariations.category;
    const catName = (cat?.name || '').toLowerCase();
    const catSlug = (cat?.slug || '').toLowerCase();
    if (catName.includes('console') || catSlug.includes('console') || catName.includes('hardware') || catSlug.includes('hardware')) {
      return false;
    }
    return true;
  }, [categories, selectedProductForVariations]);

  const handleToggleVarGenre = (g) => {
    setVarSelectedGenres((prev) => {
      if (prev.includes(g)) {
        return prev.filter(item => item !== g);
      } else {
        return [...prev, g];
      }
    });
  };

  const resetVariationForm = (prod) => {
    setEditingVarId(null);
    setVarSku('');
    setVarTitle(prod?.title || '');
    setVarImageUrl('');
    setVarPlatform(prod?.attributes?.platform || prod?.platform || 'PS5');
    setVarCondition(prod?.condition || 'New');
    setVarColor('');
    setVarStorage('');
    setVarEdition('');
    setVarBundle('');
    setVarPrice(prod?.price ? String(prod.price) : '');
    setVarCostPrice('');
    setVarStock('10');
    setVarThreshold('5');
    setVarDescription(prod?.description || '');
    setVarEmbedMedia(prod?.embedMedia || prod?.attributes?.embedMedia || '');
    setVarRegion(prod?.attributes?.region || prod?.region || '');
    setVarDeveloper(prod?.attributes?.developer || prod?.developer || '');
    setVarBrand(prod?.attributes?.brand || prod?.brand || 'Sony');
    setVarVariant(prod?.attributes?.variant || 'Slim');
    setVarModelNumber(prod?.modelNumber || '');
    setVarStoryHours(prod?.attributes?.storyHours ? String(prod.attributes.storyHours).replace(/hours?/i, '').trim() : '');
    setVarPlacement(prod?.attributes?.placement || 'Horizontal');
    setVarMaxPriceCap(prod?.maxPriceCap ? String(prod.maxPriceCap) : (prod?.attributes?.maxPriceCap ? String(prod.attributes.maxPriceCap) : ''));
    
    let initialGenres = [];
    if (Array.isArray(prod?.attributes?.genre)) {
      initialGenres = prod.attributes.genre;
    } else if (typeof prod?.attributes?.genre === 'string' && prod.attributes.genre) {
      initialGenres = prod.attributes.genre.split(/[/,]/).map(s => s.trim()).filter(Boolean);
    }
    setVarSelectedGenres(initialGenres);
    setVarSearchKeywords(Array.isArray(prod?.keywords) ? prod.keywords.join(', ') : (prod?.keywords || ''));
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
    setVarTitle(v.title || selectedProductForVariations?.title || '');
    setVarImageUrl(v.imageUrl || '');
    setVarPlatform(v.platform || selectedProductForVariations?.attributes?.platform || 'PS5');
    setVarCondition(v.condition || selectedProductForVariations?.condition || 'New');
    setVarColor(v.color || '');
    setVarStorage(v.storage || '');
    setVarEdition(v.edition || '');
    setVarBundle(v.bundle || '');
    setVarPrice(v.price !== undefined && v.price !== null ? v.price.toString() : '');
    setVarCostPrice(v.costPrice !== undefined && v.costPrice !== null ? v.costPrice.toString() : '');
    setVarStock(v.stockQuantity !== undefined && v.stockQuantity !== null ? v.stockQuantity.toString() : '');
    setVarThreshold(v.lowStockThreshold !== undefined && v.lowStockThreshold !== null ? v.lowStockThreshold.toString() : '5');
    setVarDescription(v.description || selectedProductForVariations?.description || '');
    setVarEmbedMedia(v.embedMedia || selectedProductForVariations?.embedMedia || '');
    setVarRegion(v.region || selectedProductForVariations?.attributes?.region || '');
    setVarDeveloper(v.developer || selectedProductForVariations?.attributes?.developer || '');
    setVarBrand(v.brand || selectedProductForVariations?.attributes?.brand || 'Sony');
    setVarVariant(v.attributes?.variant || selectedProductForVariations?.attributes?.variant || 'Slim');
    setVarModelNumber(v.modelNumber || selectedProductForVariations?.modelNumber || '');
    setVarStoryHours(v.storyHours || (selectedProductForVariations?.attributes?.storyHours ? String(selectedProductForVariations.attributes.storyHours).replace(/hours?/i, '').trim() : ''));
    setVarPlacement(v.placement || selectedProductForVariations?.attributes?.placement || 'Horizontal');
    setVarMaxPriceCap(v.maxPriceCap !== undefined && v.maxPriceCap !== null ? v.maxPriceCap.toString() : (selectedProductForVariations?.maxPriceCap ? String(selectedProductForVariations.maxPriceCap) : ''));
    
    let varGenres = [];
    if (Array.isArray(v.genres) && v.genres.length > 0) {
      varGenres = v.genres;
    } else if (Array.isArray(selectedProductForVariations?.attributes?.genre)) {
      varGenres = selectedProductForVariations.attributes.genre;
    }
    setVarSelectedGenres(varGenres);
    setVarSearchKeywords(v.searchKeywords || (Array.isArray(selectedProductForVariations?.keywords) ? selectedProductForVariations.keywords.join(', ') : ''));
  };

  const handleCancelEditVariation = () => {
    resetVariationForm(selectedProductForVariations);
  };

  const handleVariationImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateMediaFile(file)) return;

    setUploadingVarMedia(true);
    try {
      const res = await api.products.uploadMedia(selectedProductForVariations.id, file);
      if (res.success && res.data) {
        setVarImageUrl(res.data.url);
        const updatedProdRes = await api.products.getById(selectedProductForVariations.id);
        if (updatedProdRes.success) {
          setSelectedProductForVariations(updatedProdRes.data);
          syncProductInList(updatedProdRes.data);
        }
      }
    } catch (err) {
      alert(err.message || 'Error uploading variation image');
    } finally {
      setUploadingVarMedia(false);
    }
  };

  const handleSaveVariation = async (e) => {
    e.preventDefault();
    const payload = {
      sku: varSku || undefined,
      title: varTitle || undefined,
      imageUrl: varImageUrl || undefined,
      description: varDescription || undefined,
      embedMedia: varEmbedMedia || undefined,
      region: varRegion || undefined,
      developer: varDeveloper || undefined,
      brand: varBrand || undefined,
      modelNumber: varModelNumber || undefined,
      storyHours: varStoryHours || undefined,
      placement: varPlacement || undefined,
      maxPriceCap: varMaxPriceCap ? parseFloat(varMaxPriceCap) : undefined,
      genres: varSelectedGenres,
      searchKeywords: varSearchKeywords || undefined,
      platform: varPlatform || selectedProductForVariations.attributes?.platform || null,
      condition: varCondition || 'New',
      color: varColor || null,
      storage: varStorage || null,
      edition: varEdition || null,
      bundle: varBundle || null,
      price: parseFloat(varPrice),
      costPrice: varCostPrice ? parseFloat(varCostPrice) : 0,
      stockQuantity: parseInt(varStock, 10) || 0,
      lowStockThreshold: varThreshold ? parseInt(varThreshold, 10) : 5,
      attributes: {
        variant: varVariant || undefined
      }
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
            placeholder="Search all columns (Product, SKU, Model, Category, Supplier, Platform, Status...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
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
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl mx-auto max-h-[100dvh] sm:max-h-[min(90vh,920px)] rounded-t-2xl sm:rounded-3xl border border-slate-200/50 dark:border-slate-800 overflow-hidden shadow-2xl transition-all duration-300 flex flex-col">
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
                {/* 1. CATEGORY */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CATEGORY</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white font-medium"
                  >
                    {categories.length > 0 ? (
                      categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.platform ? `(${c.platform})` : ''}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="game-default">Game</option>
                        <option value="console-default">Console</option>
                      </>
                    )}
                  </select>
                </div>

                {/* DYNAMIC FORM: GAME VS CONSOLE / GENERAL */}
                {isGameCategory ? (
                  <>
                    {/* GAME ROW 1: PRODUCT TITLE & REGION (Not mandatory) */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      <div className="sm:col-span-7 space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          PRODUCT TITLE <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                          placeholder="e.g. PlayStation 5 Pro"
                        />
                      </div>

                      <div className="sm:col-span-5 space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            REGION
                          </label>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">The field is not mandatory</span>
                        </div>
                        <select
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                        >
                          <option value="">Select Region (Optional)</option>
                          {REGION_OPTIONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* GAME ROW 2: DESCRIPTION */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        DESCRIPTION
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="3"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                        placeholder="Provide details about specs, condition, features..."
                      />
                    </div>

                    {/* EMBED MEDIA (YouTube link placed near description per PDF annotation: "Youtube link description ke pass.") */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5 text-blue-500" />
                        EMBED MEDIA
                      </label>
                      <input
                        type="text"
                        value={embedMedia}
                        onChange={(e) => setEmbedMedia(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white font-mono placeholder:text-slate-400"
                        placeholder="/link.........................."
                      />
                    </div>

                    {/* GAME ROW 3: CONDITION, PLATFORM, DEVELOPER NAME */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          CONDITION
                        </label>
                        <select
                          value={condition}
                          onChange={(e) => setCondition(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                        >
                          <option value="New">New</option>
                          <option value="Pre Owned/Used">Pre Owned/Used</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          PLATFORM
                        </label>
                        <select
                          value={platform}
                          onChange={(e) => setPlatform(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                        >
                          {GAME_PLATFORMS.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                          {platform && !GAME_PLATFORMS.includes(platform) && (
                            <option value={platform}>{platform}</option>
                          )}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          DEVELOPER NAME
                        </label>
                        <input
                          type="text"
                          value={developer}
                          onChange={(e) => setDeveloper(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                          placeholder="IO Interactive"
                        />
                      </div>
                    </div>

                    {/* GAME ROW 4: STORY HOURS, PRICE, MAX PRICE CAP */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          STORY HOURS
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={storyHours}
                            onChange={(e) => setStoryHours(e.target.value)}
                            className="w-full px-3 py-2 pr-16 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                            placeholder="e.g - 28.5 Hours"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 bg-slate-200/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-md pointer-events-none">
                            Hours
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          PRICE
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                          placeholder="e.g. 5,000"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            MAX PRICE CAP
                          </label>
                          <span className="text-[10px] text-amber-500 font-bold uppercase">Mandatory</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={maxPriceCap}
                          onChange={(e) => setMaxPriceCap(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-amber-500/40 dark:border-amber-500/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 dark:text-white"
                          placeholder="Mandatory (e.g - 5,000)"
                        />
                      </div>
                    </div>

                    {/* GENRES: Checkbox for Genre multiple Selections (Sequence Preserved, e.g. Action/RPG/FPS) */}
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          GENRES
                        </label>
                        {selectedGenres.length > 0 && (
                          <span className="text-[11px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800/60">
                            Sequence: ({selectedGenres.join('/')})
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                        {GAME_GENRES.map((g) => {
                          const isSelected = selectedGenres.includes(g);
                          const orderNum = selectedGenres.indexOf(g) + 1;

                          return (
                            <button
                              key={g}
                              type="button"
                              onClick={() => handleToggleGenre(g)}
                              className={`flex items-center gap-2 p-2 rounded-xl text-xs text-left transition-all ${
                                isSelected
                                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 font-semibold border border-blue-300 dark:border-blue-800'
                                  : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 border border-transparent'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                                isSelected
                                  ? 'bg-blue-600 border-blue-600 text-white'
                                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className="truncate flex-1">{g}</span>
                              {isSelected && (
                                <span className="text-[10px] text-blue-500 font-bold shrink-0">
                                  #{orderNum}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* PRODUCT IMAGES */}
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />
                        PRODUCT IMAGES
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Select images now — they will be uploaded when you save the product.
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

                    {/* SEARCH DISCOVERY, ALIASES & KEYWORDS (Just ONE field per PDF annotation: "Just ak hi field ayegi Search Keywords for SEO") */}
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          SEARCH DISCOVERY, ALIASES & KEYWORDS
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Allow customers to instantly discover this product using abbreviations, nicknames, or common gaming terms (e.g. <strong className="text-purple-600 dark:text-purple-400">GTA 5</strong> for Grand Theft Auto V, <strong className="text-purple-600 dark:text-purple-400">RDR</strong> for Red Dead Redemption, or <strong className="text-purple-600 dark:text-purple-400">PS5</strong>).
                      </p>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <KeyRound className="w-3.5 h-3.5 text-blue-500" />
                            Search Keywords
                          </span>
                          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Highest Search Priority</span>
                        </label>
                        <input
                          type="text"
                          value={searchKeywords}
                          onChange={(e) => setSearchKeywords(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:text-white"
                          placeholder="e.g. GTA 5, GTA V, Grand Theft Auto 5, RDR, RDR1, BO6, PS5"
                        />
                      </div>
                    </div>

                    {/* STATUS & ASSIGN SUPPLIER */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">STATUS</label>
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
                        <div className="space-y-1">
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
                        </div>
                      )}
                    </div>

                    {/* CHECKBOXES */}
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
                  </>
                ) : (
                  /* CONSOLE / HARDWARE / GENERAL CATEGORY FORM */
                  <>
                    {/* 2. PRODUCT TITLE & VARIANT (with existing MODEL NUMBER preserved) */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      <div className="sm:col-span-6 space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">PRODUCT TITLE</label>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                          placeholder="e.g. PlayStation 5 Pro"
                        />
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">VARIANT</label>
                        <select
                          value={variant}
                          onChange={(e) => setVariant(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                        >
                          <option value="Slim">Slim</option>
                          <option value="Fat">Fat</option>
                          <option value="Pro">Pro</option>
                          <option value="Standard">Standard</option>
                          <option value="Digital">Digital</option>
                          {variant && !['Slim', 'Fat', 'Pro', 'Standard', 'Digital'].includes(variant) && (
                            <option value={variant}>{variant}</option>
                          )}
                        </select>
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">MODEL NUMBER</label>
                        <input
                          type="text"
                          value={modelNumber}
                          onChange={(e) => setModelNumber(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                          placeholder="e.g. CFI-2000A"
                        />
                      </div>
                    </div>

                    {/* 3. DESCRIPTION */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase">DESCRIPTION</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="3"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                        placeholder="Provide details about specs, condition, features..."
                      />
                    </div>

                    {/* 4. CONDITION, PLATFORM, BRAND */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">CONDITION</label>
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
                        <label className="text-xs font-semibold text-slate-500 uppercase">PLATFORM</label>
                        <select
                          value={platform}
                          onChange={(e) => setPlatform(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                        >
                          <option value="PS5">PS5</option>
                          <option value="PS4">PS4</option>
                          <option value="PS3">PS3</option>
                          <option value="PS2">PS2</option>
                          <option value="Xbox Series X/S">Xbox Series X/S</option>
                          <option value="Xbox One">Xbox One</option>
                          <option value="Nintendo Switch">Nintendo Switch</option>
                          <option value="PC">PC</option>
                          <option value="Retro">Retro</option>
                          <option value="Accessories">Accessories</option>
                          {platform && !['PS5', 'PS4', 'PS3', 'PS2', 'Xbox Series X/S', 'Xbox One', 'Nintendo Switch', 'PC', 'Retro', 'Accessories'].includes(platform) && (
                            <option value={platform}>{platform}</option>
                          )}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Brand</label>
                        <input
                          type="text"
                          value={brand}
                          onChange={(e) => setBrand(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                          placeholder="Sony"
                        />
                      </div>
                    </div>

                    {/* 5. PLACEMENT, PRICE, MAX PRICE CAP & STOCK QUANTITY */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Placement</label>
                        <select
                          value={placement}
                          onChange={(e) => setPlacement(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                        >
                          <option value="Horizontal">Horizontal</option>
                          <option value="Vertical">Vertical</option>
                          <option value="Both">Both</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Price</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                          placeholder="e.g. 499.99"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-500 uppercase">MAX PRICE CAP</label>
                          <span className="text-[10px] text-amber-500 font-semibold">Mandatory</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={maxPriceCap}
                          onChange={(e) => setMaxPriceCap(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-amber-500/40 dark:border-amber-500/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 dark:text-white"
                          placeholder="Mandatory (e.g - 5,000)"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Stock Quantity</label>
                        <input
                          type="number"
                          min="0"
                          value={stock}
                          onChange={(e) => setStock(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                          placeholder="e.g. 10"
                        />
                      </div>
                    </div>

                    {/* 6. PRODUCT IMAGES */}
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />
                        PRODUCT IMAGES
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Select images now — they will be uploaded when you save the product.
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

                    {/* 7. EMBED MEDIA */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5 text-blue-500" />
                        EMBED MEDIA
                      </label>
                      <input
                        type="text"
                        value={embedMedia}
                        onChange={(e) => setEmbedMedia(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white font-mono placeholder:text-slate-400"
                        placeholder="/link.........................."
                      />
                    </div>

                    {/* 8. SEARCH DISCOVERY, ALIASES & KEYWORDS */}
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          SEARCH DISCOVERY, ALIASES & KEYWORDS
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

                    {/* 9. STATUS & ASSIGN SUPPLIER */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">STATUS</label>
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
                        <div className="space-y-1">
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
                        </div>
                      )}
                    </div>

                    {/* 10. CHECKBOXES */}
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
                  </>
                )}
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
          <div className="bg-white dark:bg-slate-900 w-full max-w-6xl mx-auto max-h-[92vh] overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-2xl transition-all flex flex-col">
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/20">
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
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[82vh] overflow-y-auto">
              
              {/* Left col: Variation Photo & Add/Edit Form (lg:col-span-5) */}
              <div className="space-y-5 lg:col-span-5">
                
                {/* 1. VARIATION PHOTO & MEDIA SECTION */}
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                      Variation Photo
                    </h4>
                    {varImageUrl ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                        Custom Image Set
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">
                        (Variation specific image)
                      </span>
                    )}
                  </div>

                  {/* Active Variation Image Preview */}
                  <div className="flex items-center gap-3 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-950 shrink-0 flex items-center justify-center">
                      {varImageUrl ? (
                        <img src={getMediaUrl(varImageUrl)} className="w-full h-full object-cover" alt="Variation preview" />
                      ) : selectedProductForVariations.media?.length > 0 ? (
                        <img src={getMediaUrl(selectedProductForVariations.media[0].url)} className="w-full h-full object-cover opacity-60" alt="Product default" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {varImageUrl ? 'Variation Specific Image' : 'Using Product Default Image'}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Upload a distinct photo for this variation or pick from gallery below.
                      </p>

                      <div className="flex items-center gap-2">
                        <label className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 transition ${uploadingVarMedia ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}>
                          <Upload className="w-3 h-3" />
                          <span>{uploadingVarMedia ? 'Uploading...' : 'Upload Image'}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp,image/bmp,image/svg+xml"
                            className="hidden"
                            disabled={uploadingVarMedia}
                            onChange={handleVariationImageUpload}
                          />
                        </label>

                        {varImageUrl && (
                          <button
                            type="button"
                            onClick={() => setVarImageUrl('')}
                            className="px-2 py-1 text-[10px] font-medium text-slate-400 hover:text-red-500 rounded-lg transition"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Product Photos Gallery */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Product Gallery (Click to choose for variation):
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {selectedProductForVariations.media?.map(m => {
                        const isSelectedForVar = varImageUrl === m.url;
                        return (
                          <div 
                            key={m.id} 
                            onClick={() => setVarImageUrl(m.url)}
                            className={`relative group aspect-square rounded-xl border overflow-hidden cursor-pointer transition-all ${
                              isSelectedForVar 
                                ? 'border-blue-500 ring-2 ring-blue-500/50 scale-105' 
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                            }`}
                            title="Click to select this image for variation"
                          >
                            <img src={getMediaUrl(m.url)} className="w-full h-full object-cover" alt="" />
                            {isSelectedForVar && (
                              <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMedia(m.id, selectedProductForVariations.id, (data) => {
                                  setSelectedProductForVariations(data);
                                  syncProductInList(data);
                                  if (varImageUrl === m.url) setVarImageUrl('');
                                });
                              }}
                              className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold"
                            >
                              Delete
                            </button>
                          </div>
                        );
                      })}

                      {/* Upload directly to gallery */}
                      <label className={`aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 flex flex-col items-center justify-center transition-colors bg-white dark:bg-slate-950 ${uploadingMedia ? 'opacity-60 pointer-events-none' : 'cursor-pointer'}`}>
                        <Upload className="w-4 h-4 text-slate-400" />
                        <span className="text-[9px] text-slate-500 mt-1 font-semibold">
                          {uploadingMedia ? '...' : '+ Photo'}
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
                  </div>
                </div>

                {/* 2. VARIATION ADD / EDIT FORM */}
                <form onSubmit={handleSaveVariation} className="bg-slate-50 dark:bg-slate-950/40 p-4 sm:p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3.5">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        {editingVarId ? 'Edit SKU Variation' : 'Add SKU Variation'}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {isVariationGame ? 'Game Specs & Variation Fields' : 'Console/Hardware Specs & Variation Fields'}
                      </span>
                    </div>
                    {editingVarId && (
                      <button
                        type="button"
                        onClick={handleCancelEditVariation}
                        className="text-[11px] text-blue-500 hover:underline font-semibold"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                  
                  {/* PRODUCT TITLE */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      PRODUCT TITLE <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      value={varTitle} 
                      onChange={(e) => setVarTitle(e.target.value)}
                      placeholder="e.g. Red Dead Redemption - Standard Edition" 
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                    />
                  </div>

                  {/* DYNAMIC FIELDS: GAME VS CONSOLE */}
                  {isVariationGame ? (
                    <>
                      {/* GAME ROW: REGION (Not mandatory) & PLATFORM & CONDITION */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Region (Optional)</label>
                          <select
                            value={varRegion}
                            onChange={(e) => setVarRegion(e.target.value)}
                            className="w-full px-2.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none dark:text-white"
                          >
                            <option value="">Select Region</option>
                            {REGION_OPTIONS.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Platform</label>
                          <select
                            value={varPlatform}
                            onChange={(e) => setVarPlatform(e.target.value)}
                            className="w-full px-2.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none dark:text-white"
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
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Condition</label>
                          <select
                            value={varCondition}
                            onChange={(e) => setVarCondition(e.target.value)}
                            className="w-full px-2.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none dark:text-white"
                          >
                            <option value="New">Brand New</option>
                            <option value="Used">Pre-Owned / Used</option>
                          </select>
                        </div>
                      </div>

                      {/* DEVELOPER NAME & STORY HOURS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Developer Name</label>
                          <input 
                            type="text" 
                            value={varDeveloper} 
                            onChange={(e) => setVarDeveloper(e.target.value)}
                            placeholder="e.g. Rockstar Games, IO Interactive" 
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none dark:text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Story Hours</label>
                          <div className="relative">
                            <input 
                              type="number" 
                              step="0.5" 
                              min="0"
                              value={varStoryHours} 
                              onChange={(e) => setVarStoryHours(e.target.value)}
                              placeholder="e.g. 28.5" 
                              className="w-full px-3 py-2 pr-14 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none dark:text-white"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                              Hours
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* GENRES (Multi-selection checkboxes with sequence) */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Genres</label>
                          {varSelectedGenres.length > 0 && (
                            <span className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800/60">
                              {varSelectedGenres.join('/')}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-32 overflow-y-auto p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                          {GAME_GENRES.map((g) => {
                            const isSelected = varSelectedGenres.includes(g);
                            const orderNum = varSelectedGenres.indexOf(g) + 1;
                            return (
                              <button
                                key={g}
                                type="button"
                                onClick={() => handleToggleVarGenre(g)}
                                className={`flex items-center gap-1.5 p-1.5 rounded-lg text-[10px] text-left transition ${
                                  isSelected
                                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 font-bold border border-blue-300 dark:border-blue-800'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                                }`}
                              >
                                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                                  isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-700'
                                }`}>
                                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </div>
                                <span className="truncate flex-1">{g}</span>
                                {isSelected && <span className="text-[9px] text-blue-500 shrink-0">#{orderNum}</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    /* CONSOLE / HARDWARE / GENERAL */
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Variant</label>
                          <select
                            value={varVariant}
                            onChange={(e) => setVarVariant(e.target.value)}
                            className="w-full px-2.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none dark:text-white"
                          >
                            <option value="Slim">Slim</option>
                            <option value="Fat">Fat</option>
                            <option value="Pro">Pro</option>
                            <option value="Standard">Standard</option>
                            <option value="Digital">Digital</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Model Number</label>
                          <input 
                            type="text" 
                            value={varModelNumber} 
                            onChange={(e) => setVarModelNumber(e.target.value)}
                            placeholder="e.g. CFI-2000A" 
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none dark:text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Brand</label>
                          <input 
                            type="text" 
                            value={varBrand} 
                            onChange={(e) => setVarBrand(e.target.value)}
                            placeholder="Sony" 
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Platform</label>
                          <select
                            value={varPlatform}
                            onChange={(e) => setVarPlatform(e.target.value)}
                            className="w-full px-2.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none dark:text-white"
                          >
                            <option value="PS5">PS5</option>
                            <option value="PS4">PS4</option>
                            <option value="Xbox Series X/S">Xbox Series X/S</option>
                            <option value="Xbox One">Xbox One</option>
                            <option value="Nintendo Switch">Nintendo Switch</option>
                            <option value="PC">PC</option>
                            <option value="Hardware">Hardware / Universal</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Condition</label>
                          <select
                            value={varCondition}
                            onChange={(e) => setVarCondition(e.target.value)}
                            className="w-full px-2.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none dark:text-white"
                          >
                            <option value="New">Brand New</option>
                            <option value="Used">Pre-Owned / Used</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Placement</label>
                          <select
                            value={varPlacement}
                            onChange={(e) => setVarPlacement(e.target.value)}
                            className="w-full px-2.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none dark:text-white"
                          >
                            <option value="Horizontal">Horizontal</option>
                            <option value="Vertical">Vertical</option>
                            <option value="Both">Both</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* DESCRIPTION */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                    <textarea
                      value={varDescription}
                      onChange={(e) => setVarDescription(e.target.value)}
                      rows="2"
                      placeholder="Details specific to this variation..."
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none dark:text-white"
                    />
                  </div>

                  {/* EMBED MEDIA (YouTube Link) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Link2 className="w-3 h-3 text-blue-500" />
                      Embed Media (YouTube Link)
                    </label>
                    <input 
                      type="text" 
                      value={varEmbedMedia} 
                      onChange={(e) => setVarEmbedMedia(e.target.value)}
                      placeholder="/link.........................." 
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none font-mono dark:text-white"
                    />
                  </div>

                  {/* VARIATION SPECIFIC ATTRIBUTES: COLOR, STORAGE, EDITION, BUNDLE */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Color Variation</label>
                      <input 
                        type="text" 
                        value={varColor} 
                        onChange={(e) => setVarColor(e.target.value)}
                        placeholder="e.g. Midnight Black, White" 
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Storage Variation</label>
                      <input 
                        type="text" 
                        value={varStorage} 
                        onChange={(e) => setVarStorage(e.target.value)}
                        placeholder="e.g. 512GB, 1TB, 2TB" 
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Edition Variation</label>
                      <input 
                        type="text" 
                        value={varEdition} 
                        onChange={(e) => setVarEdition(e.target.value)}
                        placeholder="e.g. Standard, Digital, Collector's, Deluxe" 
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bundle Variation</label>
                      <input 
                        type="text" 
                        value={varBundle} 
                        onChange={(e) => setVarBundle(e.target.value)}
                        placeholder="e.g. Console Only, With Extra Controller, Game Pack" 
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  {/* PRICE, MAX PRICE CAP, COST PRICE */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Price (PKR) *</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        required 
                        value={varPrice} 
                        onChange={(e) => setVarPrice(e.target.value)}
                        placeholder="499.99" 
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none dark:text-white font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Max Price Cap</label>
                        <span className="text-[9px] text-amber-500 font-bold uppercase">Mandatory</span>
                      </div>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={varMaxPriceCap} 
                        onChange={(e) => setVarMaxPriceCap(e.target.value)}
                        placeholder="e.g. 5,000" 
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-amber-500/40 rounded-xl focus:outline-none dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cost Price (PKR)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={varCostPrice} 
                        onChange={(e) => setVarCostPrice(e.target.value)}
                        placeholder="350.00" 
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  {/* STOCK & LOW STOCK ALERT */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stock Qty *</label>
                      <input 
                        type="number" 
                        required 
                        value={varStock} 
                        onChange={(e) => setVarStock(e.target.value)}
                        placeholder="10" 
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Low Stock Alert</label>
                      <input 
                        type="number" 
                        value={varThreshold} 
                        onChange={(e) => setVarThreshold(e.target.value)}
                        placeholder="5" 
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  {/* SEARCH KEYWORDS */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <KeyRound className="w-3 h-3 text-purple-500" />
                        Search Keywords
                      </label>
                      <span className="text-[9px] text-purple-600 dark:text-purple-400 font-semibold">Highest Search Priority</span>
                    </div>
                    <input 
                      type="text" 
                      value={varSearchKeywords} 
                      onChange={(e) => setVarSearchKeywords(e.target.value)}
                      placeholder="e.g. GTA 5, RDR, PS5, Deluxe Edition" 
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:text-white"
                    />
                  </div>

                  {/* SKU CODE */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">SKU Code (Auto if empty)</label>
                    <input 
                      type="text" 
                      value={varSku} 
                      onChange={(e) => setVarSku(e.target.value)}
                      placeholder="e.g. PS5-USE-RDR-6155" 
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none dark:text-white font-mono"
                    />
                  </div>

                  {/* SUBMIT BUTTON */}
                  <div className="flex gap-2 pt-2">
                    {editingVarId && (
                      <button
                        type="button"
                        onClick={handleCancelEditVariation}
                        className="w-1/3 py-2.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className={`btn-brand ${editingVarId ? 'flex-1' : 'w-full'} py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition`}
                    >
                      {editingVarId ? 'Save Changes' : 'Add Variation SKU'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right col: Variations table list (lg:col-span-7) */}
              <div className="lg:col-span-7 space-y-4">
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
                  <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                            <th className="p-3 w-12 text-center">Photo</th>
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
                            const varImg = v.imageUrl || selectedProductForVariations.media?.[0]?.url;

                            return (
                              <tr 
                                key={v.id} 
                                className={`transition-colors ${isCurrentlyEditing ? 'bg-purple-500/10 dark:bg-purple-500/20' : 'hover:bg-slate-100/50 dark:hover:bg-slate-900/30'}`}
                              >
                                <td className="p-3 text-center">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mx-auto shrink-0 flex items-center justify-center">
                                    {varImg ? (
                                      <img src={getMediaUrl(varImg)} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                      <ImageIcon className="w-4 h-4 text-slate-400" />
                                    )}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                                    <div className="truncate max-w-[180px] font-bold text-xs" title={v.title || selectedProductForVariations.title}>
                                      {v.title || selectedProductForVariations.title}
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                      <span className="font-mono text-[10px] text-slate-500">{v.sku}</span>
                                      {v.platform && (
                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                                          {v.platform}
                                        </span>
                                      )}
                                      {v.condition && (
                                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                          v.condition === 'New'
                                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                        }`}>
                                          {v.condition}
                                        </span>
                                      )}
                                    </div>
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
                                    {v.region && (
                                      <span className="px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-[10px] font-medium">
                                        🌐 {v.region}
                                      </span>
                                    )}
                                    {!v.storage && !v.color && !v.edition && !v.bundle && !v.region && (
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
            
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-right">
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
