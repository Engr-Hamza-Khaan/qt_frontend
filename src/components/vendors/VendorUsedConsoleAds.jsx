import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Gamepad2, Plus, Clock, RefreshCw, Eye, Trash2, CheckCircle2,
  AlertCircle, ShieldAlert, Sparkles, Image as ImageIcon, Upload, X,
  ExternalLink, Phone, MessageCircle, MapPin, Tag, Film, Check,
  Power, Layers, DollarSign, Calendar, ChevronRight
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ModalOverlay from '../ui/ModalOverlay';

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

export default function VendorUsedConsoleAds() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'create'
  const [ads, setAds] = useState([]);
  const [counts, setCounts] = useState({ total: 0, active: 0, expired: 0, disabled: 0, sold: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Ad for Details Modal
  const [selectedAd, setSelectedAd] = useState(null);

  // Create Form State - All Console Category Fields
  const [form, setForm] = useState({
    title: '',
    platform: 'PS5',
    brand: 'Sony',
    variant: 'Slim',
    modelNumber: '',
    storage: '1TB',
    color: 'Glacier White',
    edition: 'Disc Edition',
    placement: 'Horizontal',
    condition: 'Used - Like New (Mint)',
    price: '',
    accessoriesIncluded: '',
    description: '',
    embedMedia: '',
    tags: '',
    keywords: '',
    city: user?.vendorProfile?.city || 'Karachi',
    phone: user?.vendorProfile?.phone || user?.phone || '',
    preferredContact: 'WhatsApp',
    mediaUrls: []
  });

  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const fetchAds = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.vendors.getUsedConsoles({
        adStatus: statusFilter,
        search: searchQuery
      });
      if (res.success) {
        setAds(res.data || []);
        if (res.counts) setCounts(res.counts);
      }
    } catch (err) {
      setError(err.message || 'Failed to load your console ads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAds();
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (form.mediaUrls.length + files.length > 5) {
      alert('Maximum 5 photos allowed per console ad');
      return;
    }

    setUploadingPhotos(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const res = await api.services.uploadMedia(formData);
      if (res.success && res.fileUrls) {
        setForm((prev) => ({
          ...prev,
          mediaUrls: [...prev.mediaUrls, ...res.fileUrls]
        }));
      }
    } catch (err) {
      alert('Photo upload failed: ' + (err.message || 'Server error'));
    } finally {
      setUploadingPhotos(false);
    }
  };

  const removePhoto = (index) => {
    setForm((prev) => ({
      ...prev,
      mediaUrls: prev.mediaUrls.filter((_, i) => i !== index)
    }));
  };

  const handleCreateAd = async (e) => {
    e.preventDefault();
    if (!form.price) {
      alert('Please specify an asking price');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        productName: `${form.brand} ${form.platform} ${form.variant} ${form.edition}`.trim(),
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        keywords: form.keywords ? form.keywords.split(',').map((k) => k.trim()).filter(Boolean) : []
      };

      const res = await api.vendors.createUsedConsoleAd(payload);
      if (res.success) {
        setSuccessMessage('Used Console Ad successfully published for 30 days! It is now live on the storefront.');
        // Reset form
        setForm({
          title: '',
          platform: 'PS5',
          brand: 'Sony',
          variant: 'Slim',
          modelNumber: '',
          storage: '1TB',
          color: 'Glacier White',
          edition: 'Disc Edition',
          placement: 'Horizontal',
          condition: 'Used - Like New (Mint)',
          price: '',
          accessoriesIncluded: '',
          description: '',
          embedMedia: '',
          tags: '',
          keywords: '',
          city: user?.vendorProfile?.city || 'Karachi',
          phone: user?.vendorProfile?.phone || user?.phone || '',
          preferredContact: 'WhatsApp',
          mediaUrls: []
        });
        setActiveTab('list');
        fetchAds();
        setTimeout(() => setSuccessMessage(null), 8000);
      }
    } catch (err) {
      setError(err.message || 'Failed to publish console ad');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (adId, action) => {
    setActionLoadingId(adId);
    try {
      let res;
      if (action === 'extend') {
        res = await api.vendors.extendUsedConsoleAd(adId);
      } else if (action === 'toggle') {
        res = await api.vendors.toggleUsedConsoleAd(adId);
      } else if (action === 'sold') {
        res = await api.vendors.markSoldUsedConsoleAd(adId);
      } else if (action === 'delete') {
        if (!confirm('Are you sure you want to permanently delete this console ad?')) {
          setActionLoadingId(null);
          return;
        }
        res = await api.vendors.deleteUsedConsoleAd(adId);
      }

      if (res?.success) {
        if (selectedAd && selectedAd.id === adId) {
          if (action === 'delete') setSelectedAd(null);
          else setSelectedAd(res.data);
        }
        fetchAds();
      }
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderCountdownBadge = (ad) => {
    if (ad.adStatus === 'Sold') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" /> Sold
        </span>
      );
    }

    if (ad.adStatus === 'Disabled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20">
          <Power className="w-3.5 h-3.5" /> Paused
        </span>
      );
    }

    if (ad.isExpired || ad.adStatus === 'Expired') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 animate-pulse">
          <AlertCircle className="w-3.5 h-3.5" /> Auto-Disabled (30d Expired)
        </span>
      );
    }

    // Active
    const days = ad.daysRemaining ?? 30;
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30">
        <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
        Active • {days} {days === 1 ? 'Day' : 'Days'} Left
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
              <Gamepad2 className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              Used Console Selling (30-Day Ads)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Supplier Portal
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Publish second-hand gaming consoles to Quickturn buyers. Ads remain active for 30 days and automatically disable unless renewed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchAds}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <Link
            to="/shop"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Eye className="w-4 h-4" />
            View Storefront
          </Link>

          {activeTab === 'list' ? (
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              Post 30-Day Console Ad
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600 transition"
            >
              Back to My Ads
            </button>
          )}
        </div>
      </div>

      {/* 30-DAY AUTO-EXPIRY POLICY BANNER */}
      <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-blue-950/20 border border-purple-200/80 dark:border-purple-800/60 rounded-2xl flex items-start gap-3 shadow-sm">
        <div className="p-2 bg-purple-500/10 dark:bg-purple-500/20 rounded-xl text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
          <Clock className="w-5 h-5" />
        </div>
        <div className="text-xs text-purple-900 dark:text-purple-200/90 leading-relaxed space-y-1">
          <div className="font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1.5 text-sm">
            How 30-Day Used Console Ads Work for Suppliers
          </div>
          <p>
            • <strong>30-Day Active Window:</strong> Each ad published by your supplier account appears directly on the public Store Catalog and `/sell` browser with your <strong>Verified Supplier Badge</strong>.
          </p>
          <p>
            • <strong>Automatic Disabling:</strong> Exactly 30 days after creation, the listing will <strong>automatically disable</strong> so buyers never contact you for stale or sold inventory.
          </p>
          <p>
            • <strong>Instant Renewal:</strong> You can extend any active or expired ad for <strong>+30 days</strong> with a single click at any time.
          </p>
        </div>
      </div>

      {/* SUCCESS / ERROR ALERTS */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl text-emerald-700 dark:text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-600 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Ads', value: counts.total, color: 'text-slate-800 dark:text-white', bg: 'from-blue-500/10 to-indigo-500/10', border: 'border-blue-500/20' },
          { label: 'Live on Store', value: counts.active, color: 'text-purple-600 dark:text-purple-400', bg: 'from-purple-500/10 to-pink-500/10', border: 'border-purple-500/20' },
          { label: 'Expired (Needs Renewal)', value: counts.expired, color: 'text-red-600 dark:text-red-400', bg: 'from-red-500/10 to-orange-500/10', border: 'border-red-500/20' },
          { label: 'Sold Consoles', value: counts.sold, color: 'text-emerald-600 dark:text-emerald-400', bg: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-500/20' }
        ].map((stat, i) => (
          <div
            key={i}
            className={`p-4 rounded-2xl bg-gradient-to-br ${stat.bg} border ${stat.border} backdrop-blur-xl shadow-sm`}
          >
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* MAIN VIEW: LIST OF ADS OR CREATE FORM */}
      {activeTab === 'create' ? (
        /* CREATE NEW USED CONSOLE AD (FULL CONSOLE CATEGORY FIELDS) */
        <Card padding={false}>
          <div className="p-6 border-b border-slate-200/60 dark:border-slate-700/60">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Post New 30-Day Used Console Ad</h3>
            <p className="text-xs text-slate-500 mt-1">
              Fill all console category hardware details. The listing will remain live on the storefront for exactly 30 days.
            </p>
          </div>

          <form onSubmit={handleCreateAd} className="p-6 space-y-6">
            {/* PLATFORM & HARDWARE SPECIFICATIONS */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-purple-500" />
                Console Hardware Classification
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Platform <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    {PLATFORM_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    {BRAND_OPTIONS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Variant <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.variant}
                    onChange={(e) => setForm({ ...form, variant: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    {VARIANT_OPTIONS.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Model Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CFI-2000, CUH-7200"
                    value={form.modelNumber}
                    onChange={(e) => setForm({ ...form, modelNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Storage Size <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.storage}
                    onChange={(e) => setForm({ ...form, storage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    {STORAGE_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Color
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Glacier White, Midnight Black"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Edition
                  </label>
                  <select
                    value={form.edition}
                    onChange={(e) => setForm({ ...form, edition: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    {EDITION_OPTIONS.map((ed) => (
                      <option key={ed} value={ed}>{ed}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* PLACEMENT, CONDITION & ASKING PRICE */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700/60">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                Condition & Pricing
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Placement
                  </label>
                  <select
                    value={form.placement}
                    onChange={(e) => setForm({ ...form, placement: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    {PLACEMENT_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Condition <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    {CONDITION_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Asking Price (PKR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 145000"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono font-bold text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Included Accessories
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1x DualSense Controller, HDMI 2.1 Cable, Power Cord, Original Packaging Box"
                  value={form.accessoriesIncluded}
                  onChange={(e) => setForm({ ...form, accessoriesIncluded: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Console Description & Inspection Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe cosmetic condition, warranty seal status, controller condition, or included bonus items..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none leading-relaxed"
                />
              </div>
            </div>

            {/* PHOTOS & VIDEO EMBED */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700/60">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-500" />
                Console Photos & Video Walkthrough
              </h4>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Console Photos (Up to 5)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {form.mediaUrls.map((url, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 group">
                      <img src={url} alt="Console" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 transition shadow"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {form.mediaUrls.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhotos}
                      className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 flex flex-col items-center justify-center text-slate-400 hover:text-purple-500 transition text-xs font-medium gap-1"
                    >
                      {uploadingPhotos ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          <span>Add Photo</span>
                        </>
                      )}
                    </button>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-red-500" />
                  YouTube Video Demonstration (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={form.embedMedia}
                  onChange={(e) => setForm({ ...form, embedMedia: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            {/* SELLER LOCATION & WHATSAPP CONTACT */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700/60">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-500" />
                Supplier Contact & City
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    City Location
                  </label>
                  <input
                    type="text"
                    placeholder="Karachi, Lahore, Islamabad, etc."
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    WhatsApp / Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+92 300 1234567"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Preferred Contact Method
                  </label>
                  <select
                    value={form.preferredContact}
                    onChange={(e) => setForm({ ...form, preferredContact: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Phone">Phone Call</option>
                    <option value="Email">Email</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-500" />
                This ad will stay active for 30 days and will be tagged with your Verified Supplier account.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 text-sm font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/25 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Publishing Ad...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Publish 30-Day Console Ad
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </Card>
      ) : (
        /* MY CONSOLE ADS TABLE / LIST */
        <Card padding={false}>
          {/* SEARCH & FILTERS BAR */}
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'All', label: `All (${counts.total})` },
                { id: 'Active', label: `Active (${counts.active})` },
                { id: 'Expired', label: `Expired (${counts.expired})` },
                { id: 'Disabled', label: `Paused (${counts.disabled})` },
                { id: 'Sold', label: `Sold (${counts.sold})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                    statusFilter === tab.id
                      ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search console, model, specs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 w-48 sm:w-60"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 transition"
              >
                Search
              </button>
            </form>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="p-4">Console Item</th>
                  <th className="p-4">Specifications</th>
                  <th className="p-4">Asking Price</th>
                  <th className="p-4">30-Day Ad Lifecycle</th>
                  <th className="p-4">Location / WhatsApp</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {ads.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-slate-400">
                      <Gamepad2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-purple-500" />
                      <p className="font-semibold text-slate-600 dark:text-slate-300">No Used Console Ads Found</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {statusFilter !== 'All' ? `No ads matching status "${statusFilter}"` : 'You have not posted any used console ads yet.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('create')}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Post Your First Console Ad
                      </button>
                    </td>
                  </tr>
                ) : (
                  ads.map((ad) => {
                    const isBusy = actionLoadingId === ad.id;
                    const photo = ad.mediaUrls?.[0];

                    return (
                      <tr key={ad.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        {/* ITEM PREVIEW */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                              {photo ? (
                                <img src={photo} alt={ad.productName} className="w-full h-full object-cover" />
                              ) : (
                                <Gamepad2 className="w-6 h-6 text-purple-500 opacity-60" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 dark:text-white truncate max-w-xs">
                                {ad.productName || 'Used Console'}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                                  {ad.platform}
                                </span>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  {ad.variant}
                                </span>
                                {ad.modelNumber && (
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {ad.modelNumber}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* SPECS */}
                        <td className="p-4">
                          <div className="space-y-0.5 text-xs">
                            <p className="text-slate-700 dark:text-slate-300 font-medium">
                              {ad.storage || 'Standard Storage'} • {ad.color || 'Standard'}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                              {ad.edition || 'Standard Edition'} • {ad.placement || 'Horizontal'}
                            </p>
                            <span className="inline-block mt-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                              {ad.condition}
                            </span>
                          </div>
                        </td>

                        {/* PRICE */}
                        <td className="p-4">
                          <p className="font-extrabold text-slate-900 dark:text-white text-base font-mono">
                            {formatCurrency(ad.price)}
                          </p>
                          <p className="text-[10px] text-slate-400">Asking Price</p>
                        </td>

                        {/* 30-DAY LIFECYCLE */}
                        <td className="p-4">
                          <div className="space-y-1">
                            {renderCountdownBadge(ad)}
                            {ad.expiresAt && (
                              <p className="text-[11px] text-slate-400">
                                Expires: {formatDate(ad.expiresAt)}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* CONTACT */}
                        <td className="p-4">
                          <div className="space-y-0.5 text-xs">
                            <p className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-amber-500" />
                              {ad.city || 'Karachi'}
                            </p>
                            <p className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-500" />
                              {ad.customerPhone || '—'}
                            </p>
                          </div>
                        </td>

                        {/* ACTIONS */}
                        <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            {/* EXTEND 30 DAYS BUTTON */}
                            <button
                              type="button"
                              onClick={() => handleAction(ad.id, 'extend')}
                              disabled={isBusy}
                              title="Extend ad duration by 30 days"
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition flex items-center gap-1 border border-purple-200 dark:border-purple-800/60"
                            >
                              <RefreshCw className={`w-3 h-3 ${isBusy ? 'animate-spin' : ''}`} />
                              +30 Days
                            </button>

                            {/* TOGGLE PAUSE/ACTIVE */}
                            <button
                              type="button"
                              onClick={() => handleAction(ad.id, 'toggle')}
                              disabled={isBusy}
                              title={ad.adStatus === 'Active' ? 'Pause Ad' : 'Activate Ad'}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            >
                              <Power className="w-4 h-4" />
                            </button>

                            {/* MARK SOLD */}
                            {ad.adStatus !== 'Sold' && (
                              <button
                                type="button"
                                onClick={() => handleAction(ad.id, 'sold')}
                                disabled={isBusy}
                                title="Mark as Sold"
                                className="p-1.5 text-slate-400 hover:text-emerald-500 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}

                            {/* VIEW DETAILS */}
                            <button
                              type="button"
                              onClick={() => setSelectedAd(ad)}
                              title="View full specs & details"
                              className="p-1.5 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* DELETE */}
                            <button
                              type="button"
                              onClick={() => handleAction(ad.id, 'delete')}
                              disabled={isBusy}
                              title="Delete Ad"
                              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* AD DETAILS MODAL */}
      {selectedAd && (
        <ModalOverlay open={!!selectedAd} onClose={() => setSelectedAd(null)} maxWidth="max-w-2xl">
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30">
                  #AD-{selectedAd.id.slice(0, 8).toUpperCase()}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                  {selectedAd.productName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Posted on {formatDate(selectedAd.createdAt)} by Verified Supplier {selectedAd.vendorCompany || user?.vendorProfile?.companyName}
                </p>
              </div>

              <button
                onClick={() => setSelectedAd(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STATUS & PRICE BANNER */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Asking Price</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatCurrency(selectedAd.price)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 mb-1">Ad Lifecycle Status</p>
                {renderCountdownBadge(selectedAd)}
              </div>
            </div>

            {/* FULL HARDWARE SPECS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/40">
                <p className="text-slate-400">Platform</p>
                <p className="font-bold text-slate-800 dark:text-white mt-0.5">{selectedAd.platform}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/40">
                <p className="text-slate-400">Brand</p>
                <p className="font-bold text-slate-800 dark:text-white mt-0.5">{selectedAd.brand}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/40">
                <p className="text-slate-400">Variant</p>
                <p className="font-bold text-slate-800 dark:text-white mt-0.5">{selectedAd.variant}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/40">
                <p className="text-slate-400">Model Number</p>
                <p className="font-bold text-slate-800 dark:text-white mt-0.5 font-mono">{selectedAd.modelNumber || 'Standard'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/40">
                <p className="text-slate-400">Storage Size</p>
                <p className="font-bold text-slate-800 dark:text-white mt-0.5">{selectedAd.storage || '—'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/40">
                <p className="text-slate-400">Color</p>
                <p className="font-bold text-slate-800 dark:text-white mt-0.5">{selectedAd.color || 'Standard'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/40">
                <p className="text-slate-400">Edition</p>
                <p className="font-bold text-slate-800 dark:text-white mt-0.5">{selectedAd.edition || 'Standard'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/40">
                <p className="text-slate-400">Condition</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{selectedAd.condition}</p>
              </div>
            </div>

            {/* ACCESSORIES */}
            {selectedAd.accessoriesIncluded && (
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 text-xs">
                <span className="font-bold text-purple-700 dark:text-purple-300 block mb-0.5">
                  Accessories Included:
                </span>
                <span className="text-purple-900 dark:text-purple-200">{selectedAd.accessoriesIncluded}</span>
              </div>
            )}

            {/* DESCRIPTION */}
            {selectedAd.description && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60">
                  {selectedAd.description}
                </p>
              </div>
            )}

            {/* PHOTOS */}
            {selectedAd.mediaUrls?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Console Photos</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAd.mediaUrls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:scale-105 transition"
                    >
                      <img src={url} alt={`Console ${i + 1}`} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* YOUTUBE EMBED */}
            {selectedAd.embedMedia && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-red-500" /> Video Demonstration
                </h4>
                <a
                  href={selectedAd.embedMedia}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:underline"
                >
                  {selectedAd.embedMedia} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* FOOTER ACTIONS */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleAction(selectedAd.id, 'delete')}
                className="px-3.5 py-2 text-xs font-bold rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Delete Ad
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAction(selectedAd.id, 'extend')}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Extend +30 Days
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAd(null)}
                  className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
