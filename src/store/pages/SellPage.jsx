import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, Clock, Gamepad2, CheckCircle, Upload, X, Image as ImageIcon, 
  Phone, Mail, MessageCircle, MapPin, Calendar, ShieldCheck, Eye, Sparkles, 
  Copy, Check, ExternalLink, AlertCircle, Filter, Tag, Link2, ChevronRight,
  RefreshCw, CheckCircle2, Flame, Layers
} from 'lucide-react';
import { storeApi } from '../api';
import { getMediaUrl } from '../utils';
import { formatCurrency } from '../../utils/formatters';
import TermsAgreement from '../components/TermsAgreement';
import ModalOverlay from '../../components/ui/ModalOverlay';

const PLATFORM_OPTIONS = [
  'PS5', 'PS4', 'PS3', 'PS2',
  'Xbox Series X/S', 'Xbox One', 'Xbox 360',
  'Nintendo Switch', 'Nintendo Switch OLED', 'Nintendo Switch Lite',
  'Retro', 'PC'
];

const BRAND_OPTIONS = ['Sony', 'Microsoft', 'Nintendo', 'Valve', 'Other'];

const VARIANT_OPTIONS = ['Slim', 'Fat', 'Pro', 'Standard', 'Digital', 'OLED', 'Special Edition'];

const STORAGE_OPTIONS = ['500GB', '825GB', '1TB', '2TB', '128GB', '64GB', '32GB', 'Custom SSD'];

const CONDITION_OPTIONS = [
  'Used - Like New (Mint)',
  'Used - Excellent',
  'Used - Good',
  'Used - Fair (Visible Wear)'
];

const PLACEMENT_OPTIONS = ['Horizontal', 'Vertical', 'Both'];

const EDITION_OPTIONS = [
  'Standard Edition',
  'Disc Edition',
  'Digital Edition',
  'Spider-Man 2 Limited Edition',
  'God of War Ragnarök Bundle',
  'Halo Infinite Limited Edition',
  'Zelda Tears of the Kingdom Edition'
];

function SellPage() {
  const [activeTab, setActiveTab] = useState('post-ad'); // 'post-ad', 'browse-ads', 'trade-in'

  // Used Console Ad Form State - Matches Console Category Fields
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    city: 'Karachi',
    preferredContact: 'WhatsApp',
    title: '',
    platform: 'PS5',
    brand: 'Sony',
    variant: 'Slim',
    modelNumber: '',
    storage: '1TB',
    color: 'Glacier White',
    edition: 'Standard Edition',
    placement: 'Horizontal',
    condition: 'Used - Like New (Mint)',
    accessoriesIncluded: '1x Wireless Controller, High-Speed HDMI Cable, Power Cord, Original Box',
    price: '',
    description: '',
    embedMedia: '',
    keywords: '',
    tags: 'PS5, Console, Used, 4K Gaming'
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successAd, setSuccessAd] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Active Ads Browser State
  const [activeAds, setActiveAds] = useState([]);
  const [loadingAds, setLoadingAds] = useState(false);
  const [adsPlatformFilter, setAdsPlatformFilter] = useState('All');
  const [adsSearch, setAdsSearch] = useState('');
  const [selectedAdForModal, setSelectedAdForModal] = useState(null);

  const fileInputRef = useRef(null);

  // Fetch published ads
  const fetchActiveAds = async () => {
    setLoadingAds(true);
    try {
      const params = {};
      if (adsPlatformFilter !== 'All') params.platform = adsPlatformFilter;
      if (adsSearch) params.search = adsSearch;
      const res = await storeApi.getUsedConsoleAds(params);
      if (res?.success) {
        setActiveAds(res.data || []);
      }
    } catch (err) {
      console.warn('Failed to fetch active ads:', err.message);
    } finally {
      setLoadingAds(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'browse-ads') {
      fetchActiveAds();
    }
  }, [activeTab, adsPlatformFilter]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Limit to max 5 total files
    const combined = [...selectedFiles, ...files].slice(0, 5);
    setSelectedFiles(combined);

    // Create local object URLs for instant previews
    const previews = combined.map(file => URL.createObjectURL(file));
    setFilePreviews(previews);
  };

  const removeFile = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = filePreviews.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setFilePreviews(updatedPreviews);
  };

  const handleSubmitAd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let uploadedMediaUrls = [];

      // If user selected photos, upload them via public service upload
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append('files', file);
        });

        try {
          const uploadRes = await storeApi.uploadServiceFiles(formData);
          if (uploadRes?.fileUrls) {
            uploadedMediaUrls = uploadRes.fileUrls;
          }
        } catch (uploadErr) {
          console.warn('Media upload warning, continuing request:', uploadErr.message);
        }
      }

      const payload = {
        ...form,
        productName: form.title || `${form.brand} ${form.platform} ${form.variant}`,
        listingType: 'Used Console Ad',
        mediaUrls: uploadedMediaUrls,
      };

      const res = await storeApi.submitSell(payload);
      if (res?.success && res.data) {
        setSuccessAd(res.data);
      } else {
        setSuccessAd(payload);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit used console ad. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAdRef = (id) => {
    const refCode = `#AD-${id.slice(0, 8).toUpperCase()}`;
    navigator.clipboard.writeText(refCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // SUCCESS CONFIRMATION SCREEN
  if (successAd) {
    const adRef = successAd.id 
      ? `#AD-${successAd.id.slice(0, 8).toUpperCase()}`
      : '#AD-LISTED';

    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10">
          <CheckCircle className="w-10 h-10" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-3">
          <Clock className="w-3.5 h-3.5" /> 30-Day Listing Activated
        </span>

        <h1 className="store-page-title mb-2 text-2xl sm:text-3xl">Your Used Console Ad is Live!</h1>
        <p className="store-muted mb-8 text-sm sm:text-base max-w-md mx-auto">
          Your ad has been published. It will remain active for <strong className="text-white">30 days</strong> and can be browsed by verified gamers on Quickturn.
        </p>

        {/* Ad Summary Card */}
        <div className="p-6 store-glass-panel rounded-2xl max-w-lg mx-auto text-left mb-8 border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Ad Reference Code</span>
              <span className="font-mono text-lg font-bold text-neon-purple">{adRef}</span>
            </div>
            {successAd.id && (
              <button
                type="button"
                onClick={() => handleCopyAdRef(successAd.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Console Listed:</span>
              <span className="font-bold text-white text-sm">{successAd.productName || form.title}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Asking Price:</span>
              <span className="font-bold text-emerald-400 text-sm">
                {successAd.price ? formatCurrency(successAd.price) : 'Contact for Price'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Platform & Variant:</span>
              <span className="text-slate-200">{successAd.platform} • {successAd.variant || 'Standard'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Location / City:</span>
              <span className="text-slate-200">{successAd.city || 'Pakistan'}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Clock className="w-3.5 h-3.5" /> Automatically disables after 30 days
            </span>
            <span>Status: <strong className="text-emerald-400">Active</strong></span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSuccessAd(null);
              setActiveTab('browse-ads');
            }}
            className="store-btn-primary w-full sm:w-auto px-6 py-3"
          >
            Browse Community Ads
          </button>
          <button
            type="button"
            onClick={() => {
              setSuccessAd(null);
              setForm({
                ...form,
                title: '',
                price: '',
                description: '',
              });
              setSelectedFiles([]);
              setFilePreviews([]);
            }}
            className="store-btn-secondary w-full sm:w-auto px-6 py-3"
          >
            Post Another Ad
          </button>
          <Link to="/" className="store-link text-sm py-2">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      
      {/* Top Banner Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-purple/10 border border-neon-purple/30 text-neon-purple text-xs font-bold tracking-wide uppercase mb-3">
          <Gamepad2 className="w-4 h-4" /> Used Console Selling & Ads Marketplace
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          Sell Your Used Gaming Console
        </h1>
        <p className="store-muted text-sm sm:text-base">
          List your pre-owned PlayStation, Xbox, or Nintendo console with all hardware specs. Ads run for <strong className="text-white">30 days</strong> with auto-expiration.
        </p>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center justify-center gap-2 mb-8 border-b border-white/10 pb-4">
        <button
          type="button"
          onClick={() => setActiveTab('post-ad')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
            activeTab === 'post-ad'
              ? 'bg-neon-purple text-white shadow-lg shadow-neon-purple/30'
              : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Post Used Console Ad (30 Days)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('browse-ads')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
            activeTab === 'browse-ads'
              ? 'bg-neon-purple text-white shadow-lg shadow-neon-purple/30'
              : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10'
          }`}
        >
          <Eye className="w-4 h-4" />
          Browse Active Ads
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('trade-in')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
            activeTab === 'trade-in'
              ? 'bg-neon-purple text-white shadow-lg shadow-neon-purple/30'
              : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Quickturn Trade-In Quote
        </button>
      </div>

      {/* TAB 1: POST USED CONSOLE AD (WITH ALL CONSOLE CATEGORY FIELDS) */}
      {activeTab === 'post-ad' && (
        <div className="max-w-3xl mx-auto">
          
          {/* 30-Day Notice Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-neon-purple/20 via-blue-500/10 to-transparent border border-neon-purple/30 flex items-start gap-3">
            <Clock className="w-5 h-5 text-neon-purple shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold text-white text-sm">30-Day Auto-Disable Ad Policy</h4>
              <p className="text-slate-300 mt-0.5 leading-relaxed">
                Your ad will be live in our community marketplace for exactly 30 days. After 30 days, it automatically disables to keep listings fresh. You can renew or extend it anytime.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmitAd} className="space-y-6 p-6 sm:p-8 store-glass-panel rounded-3xl border border-white/10 shadow-2xl">
            
            {/* SECTION 1: CONSOLE HARDWARE SPECS (ALL CONSOLE CATEGORY FIELDS) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <Gamepad2 className="w-4 h-4 text-neon-purple" />
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Console Category Specifications
                </h3>
              </div>

              {/* Product Title & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-8 space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Console Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    className="store-input"
                    placeholder="e.g. PlayStation 5 Slim Disc Edition (Mint)"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div className="sm:col-span-4 space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Brand
                  </label>
                  <select
                    className="store-input"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  >
                    {BRAND_OPTIONS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Platform, Variant, Model Number */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Platform <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    className="store-input"
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  >
                    {PLATFORM_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Variant
                  </label>
                  <select
                    className="store-input"
                    value={form.variant}
                    onChange={(e) => setForm({ ...form, variant: e.target.value })}
                  >
                    {VARIANT_OPTIONS.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Model Number
                  </label>
                  <input
                    className="store-input"
                    placeholder="e.g. CFI-1200 / CFI-2000A"
                    value={form.modelNumber}
                    onChange={(e) => setForm({ ...form, modelNumber: e.target.value })}
                  />
                </div>
              </div>

              {/* Storage, Color, Edition */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Storage Capacity
                  </label>
                  <select
                    className="store-input"
                    value={form.storage}
                    onChange={(e) => setForm({ ...form, storage: e.target.value })}
                  >
                    {STORAGE_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Color / Shell
                  </label>
                  <input
                    className="store-input"
                    placeholder="e.g. Glacier White / Cosmic Red"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Edition
                  </label>
                  <select
                    className="store-input"
                    value={form.edition}
                    onChange={(e) => setForm({ ...form, edition: e.target.value })}
                  >
                    {EDITION_OPTIONS.map((ed) => (
                      <option key={ed} value={ed}>{ed}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Placement, Condition, Asking Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Placement
                  </label>
                  <select
                    className="store-input"
                    value={form.placement}
                    onChange={(e) => setForm({ ...form, placement: e.target.value })}
                  >
                    {PLACEMENT_OPTIONS.map((pl) => (
                      <option key={pl} value={pl}>{pl}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Condition
                  </label>
                  <select
                    className="store-input text-emerald-400 font-semibold"
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  >
                    {CONDITION_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Asking Price (PKR) <span className="text-red-400">*</span></span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    className="store-input font-mono font-bold text-emerald-400"
                    placeholder="e.g. 145,000"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
              </div>

              {/* Included Accessories */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Accessories Included with Console
                </label>
                <input
                  className="store-input"
                  placeholder="e.g. 2x DualSense Controllers, Charging Dock, HDMI Cable, Power Lead, Box"
                  value={form.accessoriesIncluded}
                  onChange={(e) => setForm({ ...form, accessoriesIncluded: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Description & Hardware Condition Details <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  className="store-input leading-relaxed"
                  placeholder="Provide honest details regarding cosmetic state, warranty status, seal condition, how long it was used, or reason for selling..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Embed Media (YouTube Video Demo link) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-blue-400" />
                  YouTube Video / Demo Link (Optional)
                </label>
                <input
                  type="url"
                  className="store-input font-mono text-xs"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={form.embedMedia}
                  onChange={(e) => setForm({ ...form, embedMedia: e.target.value })}
                />
              </div>

              {/* Search Keywords & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-purple-400" />
                    Keywords (comma-separated)
                  </label>
                  <input
                    className="store-input"
                    placeholder="e.g. PS5, PS5 Slim, GTA 5, 4K 120Hz"
                    value={form.keywords}
                    onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Tags
                  </label>
                  <input
                    className="store-input"
                    placeholder="e.g. disc edition, mint, local pickup"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: PHOTOS UPLOAD */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-neon-purple" />
                  Console Photos (Up to 5 images)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {selectedFiles.length} / 5 Selected
                </span>
              </div>

              {/* Image Previews */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {filePreviews.map((url, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-white/20 bg-black/40">
                    <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {selectedFiles.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-2xl border-2 border-dashed border-white/20 hover:border-neon-purple/60 flex flex-col items-center justify-center gap-1 bg-white/5 hover:bg-white/10 transition"
                  >
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Add Photo</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* SECTION 3: SELLER CONTACT DETAILS */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <Phone className="w-4 h-4 text-neon-purple" />
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Seller Contact Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase">
                    Your Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    className="store-input"
                    placeholder="Full Name"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    className="store-input"
                    placeholder="name@gmail.com"
                    value={form.customerEmail}
                    onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase">
                    Phone / WhatsApp Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    className="store-input"
                    placeholder="+92 300 1234567"
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase">
                      City / Location
                    </label>
                    <input
                      className="store-input"
                      placeholder="e.g. Karachi"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase">
                      Contact Via
                    </label>
                    <select
                      className="store-input"
                      value={form.preferredContact}
                      onChange={(e) => setForm({ ...form, preferredContact: e.target.value })}
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Phone Call">Phone Call</option>
                      <option value="Email">Email</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="pt-2">
              <TermsAgreement checked={agreedToTerms} onChange={setAgreedToTerms} />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="store-btn-primary store-btn-primary--block w-full py-4 text-base font-bold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Publishing 30-Day Used Console Ad...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Publish Used Console Ad (Active for 30 Days)
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: BROWSE ACTIVE USED CONSOLE ADS */}
      {activeTab === 'browse-ads' && (
        <div className="space-y-6">
          
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 store-glass-panel rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5" /> Platform:
              </span>
              {['All', 'PS5', 'PS4', 'Xbox', 'Nintendo Switch'].map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setAdsPlatformFilter(plat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                    adsPlatformFilter === plat
                      ? 'bg-neon-purple text-white'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-72">
              <input
                type="text"
                placeholder="Search console, city, model..."
                value={adsSearch}
                onChange={(e) => setAdsSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchActiveAds()}
                className="store-input text-xs py-2 w-full"
              />
              <button
                type="button"
                onClick={fetchActiveAds}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition"
              >
                Search
              </button>
            </div>
          </div>

          {/* Live Ads Grid */}
          {loadingAds ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-neon-purple/30 border-t-neon-purple rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-mono">Loading active used console listings...</p>
            </div>
          ) : activeAds.length === 0 ? (
            <div className="py-20 text-center store-glass-panel rounded-3xl border border-white/10 max-w-lg mx-auto p-8 space-y-4">
              <Gamepad2 className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Used Console Ads Currently Active</h3>
              <p className="text-xs text-slate-400">
                Be the first gamer to post an ad for your used console! Ads stay active for 30 days.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('post-ad')}
                className="store-btn-primary px-6 py-2.5 text-xs font-bold"
              >
                Post Used Console Ad Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeAds.map((ad) => {
                const daysRemaining = ad.daysRemaining ?? 30;
                const isUrgent = daysRemaining <= 5;
                const imgUrl = Array.isArray(ad.mediaUrls) && ad.mediaUrls[0] ? getMediaUrl(ad.mediaUrls[0]) : null;

                return (
                  <div
                    key={ad.id}
                    className="group store-glass-panel rounded-3xl border border-white/10 overflow-hidden hover:border-neon-purple/40 transition-all duration-300 flex flex-col shadow-xl"
                  >
                    {/* Top Image & Expiry Tag */}
                    <div className="relative aspect-video bg-black/40 overflow-hidden">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={ad.productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-1 bg-gradient-to-br from-slate-900 to-black">
                          <Gamepad2 className="w-10 h-10" />
                          <span className="text-[10px] font-semibold text-slate-400">Verified Console Ad</span>
                        </div>
                      )}

                      {/* 30-Day Expiry Countdown Badge */}
                      <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1 border shadow-lg ${
                        isUrgent
                          ? 'bg-rose-500/80 text-white border-rose-400/50'
                          : 'bg-emerald-500/80 text-white border-emerald-400/50'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {daysRemaining} Days Left
                      </span>

                      {/* Platform Tag */}
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/70 text-slate-200 border border-white/20 backdrop-blur-md">
                        {ad.platform}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[11px] font-bold text-neon-purple uppercase tracking-wider">
                            {ad.brand} {ad.variant ? `• ${ad.variant}` : ''}
                          </span>
                          {ad.city && (
                            <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 text-slate-500" /> {ad.city}
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-white text-base line-clamp-1 group-hover:text-neon-purple transition">
                          {ad.productName}
                        </h3>

                        <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {ad.description}
                        </p>

                        {/* Specs Pill Badges */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {ad.storage && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-medium">
                              💾 {ad.storage}
                            </span>
                          )}
                          {ad.condition && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                              ✨ {ad.condition}
                            </span>
                          )}
                          {ad.color && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-medium">
                              🎨 {ad.color}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price & Action Button */}
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                            Asking Price
                          </span>
                          <span className="text-lg font-mono font-extrabold text-emerald-400">
                            {ad.price ? formatCurrency(ad.price) : 'Contact'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedAdForModal(ad)}
                          className="store-btn-secondary px-4 py-2 text-xs font-bold flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Ad
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TRADITIONAL QUICKTURN VALUATION / GENERAL TRADE-IN */}
      {activeTab === 'trade-in' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-1">Instant Store Trade-In Valuation</h2>
            <p className="text-xs store-muted">
              Sell directly to Quickturn for cash or store credit without waiting for community buyers.
            </p>
          </div>

          <form onSubmit={handleSubmitAd} className="space-y-4 p-6 store-glass-panel rounded-3xl border border-white/10">
            <input required className="store-input" placeholder="Your Name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            <input required type="email" className="store-input" placeholder="Email Address" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} />
            <input required className="store-input" placeholder="Phone Number (WhatsApp preferred)" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
            <input required className="store-input" placeholder="Item Name (e.g. PS5 Disc Edition, Nintendo OLED, Retro Games)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea required className="store-input" rows={4} placeholder="Condition details, accessories included, or faults if any..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <TermsAgreement checked={agreedToTerms} onChange={setAgreedToTerms} />
            <button type="submit" disabled={loading || !agreedToTerms} className="store-btn-primary store-btn-primary--block w-full py-3.5">
              {loading ? 'Submitting...' : 'Request Trade-In Valuation'}
            </button>
          </form>
        </div>
      )}

      {/* MODAL: FULL AD DETAILS LIGHTBOX */}
      <ModalOverlay open={!!selectedAdForModal}>
        {selectedAdForModal && (
          <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-3xl p-6 shadow-2xl text-white space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    ⏱️ {selectedAdForModal.daysRemaining ?? 30} Days Active Remaining
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    #AD-{selectedAdForModal.id?.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white">
                  {selectedAdForModal.productName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAdForModal(null)}
                className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Gallery */}
            {Array.isArray(selectedAdForModal.mediaUrls) && selectedAdForModal.mediaUrls.length > 0 && (
              <div className="space-y-2">
                <div className="aspect-video rounded-2xl overflow-hidden bg-black/60 border border-white/10">
                  <img
                    src={getMediaUrl(selectedAdForModal.mediaUrls[0])}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
                {selectedAdForModal.mediaUrls.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selectedAdForModal.mediaUrls.map((url, idx) => (
                      <img
                        key={idx}
                        src={getMediaUrl(url)}
                        alt=""
                        className="w-20 h-20 rounded-xl object-cover border border-white/10 shrink-0"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Price & Specs Table */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Asking Price</span>
                <span className="text-lg font-mono font-extrabold text-emerald-400">
                  {selectedAdForModal.price ? formatCurrency(selectedAdForModal.price) : 'Contact'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Platform</span>
                <span className="font-semibold text-white">{selectedAdForModal.platform || 'Console'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Storage</span>
                <span className="font-semibold text-white">{selectedAdForModal.storage || 'Standard'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Condition</span>
                <span className="font-semibold text-emerald-400">{selectedAdForModal.condition || 'Used'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Variant</span>
                <span className="font-semibold text-white">{selectedAdForModal.variant || 'Standard'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Color</span>
                <span className="font-semibold text-white">{selectedAdForModal.color || 'Standard'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Placement</span>
                <span className="font-semibold text-white">{selectedAdForModal.placement || 'Horizontal'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Model Number</span>
                <span className="font-mono text-white">{selectedAdForModal.modelNumber || 'N/A'}</span>
              </div>
            </div>

            {/* Accessories */}
            {selectedAdForModal.accessoriesIncluded && (
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs">
                <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">
                  Included Accessories
                </span>
                <p className="text-slate-200">{selectedAdForModal.accessoriesIncluded}</p>
              </div>
            )}

            {/* Description */}
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px] block">
                Seller Description
              </span>
              <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">
                {selectedAdForModal.description}
              </p>
            </div>

            {/* YouTube Embed Link */}
            {selectedAdForModal.embedMedia && (
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                  <Link2 className="w-4 h-4" /> Video Demonstration Link
                </span>
                <a
                  href={selectedAdForModal.embedMedia}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neon-purple hover:underline flex items-center gap-1"
                >
                  Watch Video <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Contact Seller CTA */}
            <div className="p-4 bg-gradient-to-r from-neon-purple/20 via-blue-600/10 to-transparent border border-neon-purple/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Listed By</span>
                <span className="text-sm font-bold text-white block">{selectedAdForModal.customerName}</span>
                <span className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" /> {selectedAdForModal.city || 'Pakistan'}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {selectedAdForModal.customerPhone && (
                  <a
                    href={`https://wa.me/${selectedAdForModal.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi, I saw your ad on Quickturn for "${selectedAdForModal.productName}" priced at ${formatCurrency(selectedAdForModal.price || 0)}. Is it still available?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp Seller
                  </a>
                )}
                {selectedAdForModal.customerPhone && (
                  <a
                    href={`tel:${selectedAdForModal.customerPhone}`}
                    className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition"
                    title="Call Seller"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
                {selectedAdForModal.customerEmail && (
                  <a
                    href={`mailto:${selectedAdForModal.customerEmail}?subject=${encodeURIComponent(`Regarding your ad: ${selectedAdForModal.productName}`)}`}
                    className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition"
                    title="Email Seller"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </ModalOverlay>

    </div>
  );
}

export default SellPage;
