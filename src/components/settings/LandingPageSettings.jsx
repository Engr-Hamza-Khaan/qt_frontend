import { useState, useEffect } from 'react';
import {
  LayoutTemplate,
  Save,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Sparkles,
  Layers,
  ShoppingBag,
  ShieldCheck,
  Megaphone,
  Gamepad2,
  Check,
} from 'lucide-react';
import { api } from '../../api/client';
import LoadingSpinner from '../ui/LoadingSpinner';

const DEFAULT_LANDING_PAGE = {
  sectionsOrder: [
    { id: 'hero', label: 'Hero Section & Consoles Showcase', enabled: true },
    { id: 'trust', label: 'Trust & Feature Badges', enabled: true },
    { id: 'newArrivals', label: 'New Arrivals Products', enabled: true },
    { id: 'flashSale', label: 'Flash Deals Products', enabled: true },
    { id: 'featured', label: 'Featured Products', enabled: true },
    { id: 'promoBanner', label: 'Promotional Mid-Banner', enabled: true },
    { id: 'bestSellers', label: 'Best Sellers Products', enabled: true },
    { id: 'sellCta', label: 'Sell / Trade-in Banner', enabled: true },
  ],
  hero: {
    badge: '• CERTIFIED • TESTED • READY TO SHIP',
    headline1: 'CONSOLE YOU',
    headline2: 'WANT,',
    headlineHollow: 'READY TO PLAY.',
    subtitle: 'Every console is inspected, stress-tested, and backed by a 90-day warranty before it reaches your door. Trade in your old gear anytime.',
    shopBtnText: 'Shop Console',
    shopBtnLink: '/shop?categorySlug=consoles',
    sellBtnText: 'Sell Your Console',
    sellBtnLink: '/sell',
    platforms: [
      {
        id: 'xbox',
        label: 'XBOX SERIES',
        name: 'Xbox Series X & S',
        image: '/Xbox Both.png',
        alt: 'Xbox Series X and Series S Consoles',
        shopLink: '/shop?categorySlug=consoles&search=xbox',
        sellLink: '/sell',
      },
      {
        id: 'playstation',
        label: 'PLAYSTATION',
        name: 'PlayStation 5 Slim',
        image: '/SLim.png',
        alt: 'PlayStation 5 Slim Console',
        shopLink: '/shop?categorySlug=consoles&search=playstation',
        sellLink: '/sell',
      },
      {
        id: 'nintendo',
        label: 'NINTENDO SWITCH',
        name: 'Nintendo Switch OLED',
        image: '/Nintendo PNG.png',
        alt: 'Nintendo Switch Console',
        shopLink: '/shop?categorySlug=consoles&search=nintendo',
        sellLink: '/sell',
      },
    ],
  },
  trustBar: [
    { icon: 'shield', title: 'Genuine Products', desc: '100% authentic warranty' },
    { icon: 'truck', title: 'Fast Delivery', desc: 'Nationwide shipping' },
    { icon: 'rotate', title: 'Easy Returns', desc: '7-day return policy' },
    { icon: 'headphones', title: 'Expert Support', desc: 'WhatsApp & phone help' },
  ],
  productHeadings: {
    newArrivals: {
      title: 'New Arrivals',
      subtitle: 'Latest products added to the store',
      viewAllText: 'View All',
      viewAllLink: '/shop',
    },
    flashSale: {
      title: 'Flash Deals',
      subtitle: "Limited time offers — grab them before they're gone",
      viewAllText: 'View All',
      viewAllLink: '/shop?flashSale=true',
    },
    featured: {
      title: 'Featured Products',
      subtitle: 'Hand-picked premium picks for you',
      viewAllText: 'View All',
      viewAllLink: '/shop?featured=true',
    },
    bestSellers: {
      title: 'Best Sellers',
      subtitle: 'Most popular products this month',
      viewAllText: 'View All',
      viewAllLink: '/shop',
    },
  },
  promoBanner: {
    show: true,
    title: 'Level Up Your Gaming Setup',
    subtitle: 'Exclusive deals on pro gaming controllers, headsets, and 4K displays.',
    buttonText: 'Shop Collection',
    buttonLink: '/shop',
    badge: 'EXCLUSIVE DEALS',
  },
  sellCta: {
    title: 'Have a console or game to sell?',
    subtitle: 'Get an instant quote for your used console, games, or gaming gear',
    buttonText: 'Get a Quote',
    buttonLink: '/sell',
  },
};

const TABS = [
  { id: 'order', label: 'Section Order', icon: Layers },
  { id: 'hero', label: 'Hero & Text', icon: Sparkles },
  { id: 'platforms', label: 'Hero Platforms & Images', icon: Gamepad2 },
  { id: 'products', label: 'Product Headings', icon: ShoppingBag },
  { id: 'banners', label: 'Promo & CTA Banners', icon: Megaphone },
  { id: 'trust', label: 'Trust Badges', icon: ShieldCheck },
];

export default function LandingPageSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState('order');
  const [form, setForm] = useState(DEFAULT_LANDING_PAGE);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.settings.getLandingPage();
      if (res?.data) {
        setForm({
          ...DEFAULT_LANDING_PAGE,
          ...res.data,
          hero: {
            ...DEFAULT_LANDING_PAGE.hero,
            ...(res.data.hero || {}),
          },
          productHeadings: {
            ...DEFAULT_LANDING_PAGE.productHeadings,
            ...(res.data.productHeadings || {}),
          },
          promoBanner: {
            ...DEFAULT_LANDING_PAGE.promoBanner,
            ...(res.data.promoBanner || {}),
          },
          sellCta: {
            ...DEFAULT_LANDING_PAGE.sellCta,
            ...(res.data.sellCta || {}),
          },
        });
      }
    } catch (err) {
      console.error('Failed to fetch landing page settings:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to load landing page settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await api.settings.updateLandingPage(form);
      setFeedback({
        type: 'success',
        message: res?.message || 'Landing page configuration saved successfully!',
      });
    } catch (err) {
      console.error('Save failed:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to save landing page settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all landing page settings back to default values?')) {
      setForm(DEFAULT_LANDING_PAGE);
      setFeedback({ type: 'success', message: 'Default landing page configuration restored. Click "Save Changes" to apply.' });
    }
  };

  // Section Order Helpers
  const moveSection = (index, direction) => {
    const newOrder = [...form.sectionsOrder];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setForm({ ...form, sectionsOrder: newOrder });
  };

  const toggleSection = (index) => {
    const newOrder = [...form.sectionsOrder];
    newOrder[index] = {
      ...newOrder[index],
      enabled: !newOrder[index].enabled,
    };
    setForm({ ...form, sectionsOrder: newOrder });
  };

  // Hero platform updater
  const updatePlatform = (index, field, value) => {
    const updatedPlatforms = [...form.hero.platforms];
    updatedPlatforms[index] = {
      ...updatedPlatforms[index],
      [field]: value,
    };
    setForm({
      ...form,
      hero: {
        ...form.hero,
        platforms: updatedPlatforms,
      },
    });
  };

  // Product heading updater
  const updateProductHeading = (sectionKey, field, value) => {
    setForm({
      ...form,
      productHeadings: {
        ...form.productHeadings,
        [sectionKey]: {
          ...form.productHeadings[sectionKey],
          [field]: value,
        },
      },
    });
  };

  // Trust item updater
  const updateTrustItem = (index, field, value) => {
    const updatedTrust = [...form.trustBar];
    updatedTrust[index] = {
      ...updatedTrust[index],
      [field]: value,
    };
    setForm({
      ...form,
      trustBar: updatedTrust,
    });
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-[400px]" />;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg dark:shadow-neon-purple/20">
            <LayoutTemplate className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Landing Page Customizer
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Customize home page text, hero images, banner announcements, and reorder sections.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" />
            View Store
          </a>
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-brand px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-lg flex items-center gap-2"
          >
            {saving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tab Navigation Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Section Order & Visibility */}
      {activeTab === 'order' && (
        <div className="glass-card p-5 sm:p-6 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Landing Page Section Order & Visibility
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Reorder sections using the Up/Down buttons or toggle visibility ON/OFF.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-neon-purple border border-purple-200 dark:border-purple-800">
              {form.sectionsOrder.filter((s) => s.enabled).length} of {form.sectionsOrder.length} Active
            </span>
          </div>

          <div className="space-y-3">
            {form.sectionsOrder.map((section, idx) => (
              <div
                key={section.id}
                className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all ${
                  section.enabled
                    ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 shadow-sm'
                    : 'bg-slate-100/50 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {section.label}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ID: {section.id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Up button */}
                  <button
                    type="button"
                    onClick={() => moveSection(idx, -1)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  {/* Down button */}
                  <button
                    type="button"
                    onClick={() => moveSection(idx, 1)}
                    disabled={idx === form.sectionsOrder.length - 1}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  {/* Toggle Show/Hide */}
                  <button
                    type="button"
                    onClick={() => toggleSection(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      section.enabled
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {section.enabled ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Hero Section Text & Buttons */}
      {activeTab === 'hero' && (
        <div className="glass-card p-5 sm:p-6 space-y-6 animate-fade-in">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Hero Section Text & CTA Buttons
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize the prominent pill badge, headline typography, and action buttons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Pill Badge */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Pill Badge Text (Top Label)
              </label>
              <input
                type="text"
                value={form.hero.badge}
                onChange={(e) => setForm({ ...form, hero: { ...form.hero, badge: e.target.value } })}
                placeholder="• CERTIFIED • TESTED • READY TO SHIP"
                className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white"
              />
            </div>

            {/* Headline Line 1 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Main Headline Line 1
              </label>
              <input
                type="text"
                value={form.hero.headline1}
                onChange={(e) => setForm({ ...form, hero: { ...form.hero, headline1: e.target.value } })}
                placeholder="CONSOLE YOU"
                className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white"
              />
            </div>

            {/* Headline Line 2 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Main Headline Line 2
              </label>
              <input
                type="text"
                value={form.hero.headline2}
                onChange={(e) => setForm({ ...form, hero: { ...form.hero, headline2: e.target.value } })}
                placeholder="WANT,"
                className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white"
              />
            </div>

            {/* Hollow / Highlight Stroke Line */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Hollow / Neon Accent Headline (Line 3)
              </label>
              <input
                type="text"
                value={form.hero.headlineHollow}
                onChange={(e) => setForm({ ...form, hero: { ...form.hero, headlineHollow: e.target.value } })}
                placeholder="READY TO PLAY."
                className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white font-mono"
              />
            </div>

            {/* Subtitle / Paragraph */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Hero Subtitle Description
              </label>
              <textarea
                rows={3}
                value={form.hero.subtitle}
                onChange={(e) => setForm({ ...form, hero: { ...form.hero, subtitle: e.target.value } })}
                placeholder="Describe your console guarantees and warranty..."
                className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white"
              />
            </div>

            {/* Primary Button Text */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Primary Button Label (White Button)
              </label>
              <input
                type="text"
                value={form.hero.shopBtnText}
                onChange={(e) => setForm({ ...form, hero: { ...form.hero, shopBtnText: e.target.value } })}
                placeholder="Shop Console"
                className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white"
              />
            </div>

            {/* Secondary Button Text */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Secondary Button Label (Glass Button)
              </label>
              <input
                type="text"
                value={form.hero.sellBtnText}
                onChange={(e) => setForm({ ...form, hero: { ...form.hero, sellBtnText: e.target.value } })}
                placeholder="Sell Your Console"
                className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Hero Platforms & Images */}
      {activeTab === 'platforms' && (
        <div className="glass-card p-5 sm:p-6 space-y-6 animate-fade-in">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Hero Console Platforms & Showcase Images
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configure the consoles displayed on the right side of the hero and in the platform switcher strip.
            </p>
          </div>

          <div className="space-y-6">
            {form.hero.platforms.map((platform, idx) => (
              <div
                key={platform.id || idx}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      {platform.label || `Platform ${idx + 1}`}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Image Preview thumbnail */}
                  <div className="md:col-span-3 flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950 border border-slate-800 text-center min-h-[140px]">
                    {platform.image ? (
                      <img
                        src={platform.image}
                        alt={platform.name}
                        className="max-h-24 object-contain drop-shadow"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/200x150/1e293b/ffffff?text=Image+Not+Found';
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-600" />
                    )}
                    <span className="text-[10px] text-slate-400 mt-2 truncate max-w-full">
                      {platform.image || 'No image URL'}
                    </span>
                  </div>

                  {/* Form fields */}
                  <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Platform Bar Label
                      </label>
                      <input
                        type="text"
                        value={platform.label}
                        onChange={(e) => updatePlatform(idx, 'label', e.target.value)}
                        placeholder="e.g. PLAYSTATION"
                        className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Console Full Model Name
                      </label>
                      <input
                        type="text"
                        value={platform.name}
                        onChange={(e) => updatePlatform(idx, 'name', e.target.value)}
                        placeholder="e.g. PlayStation 5 Slim"
                        className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Image URL / Local File Path
                      </label>
                      <input
                        type="text"
                        value={platform.image}
                        onChange={(e) => updatePlatform(idx, 'image', e.target.value)}
                        placeholder="e.g. /SLim.png or https://images.unsplash.com/..."
                        className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs font-mono"
                      />
                      <p className="text-[11px] text-slate-400">
                        Tip: You can use built-in images like <code className="text-purple-400">/Xbox Both.png</code>, <code className="text-purple-400">/SLim.png</code>, <code className="text-purple-400">/Nintendo PNG.png</code>, or any public web image URL.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Shop Link Path
                      </label>
                      <input
                        type="text"
                        value={platform.shopLink}
                        onChange={(e) => updatePlatform(idx, 'shopLink', e.target.value)}
                        placeholder="/shop?categorySlug=consoles"
                        className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Sell Link Path
                      </label>
                      <input
                        type="text"
                        value={platform.sellLink}
                        onChange={(e) => updatePlatform(idx, 'sellLink', e.target.value)}
                        placeholder="/sell"
                        className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Product Section Titles */}
      {activeTab === 'products' && (
        <div className="glass-card p-5 sm:p-6 space-y-6 animate-fade-in">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Product Grids Headings & Subtitles
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize the titles, subtitles, and 'View All' links for each product collection shown on the landing page.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: 'newArrivals', label: 'New Arrivals Section' },
              { key: 'flashSale', label: 'Flash Deals Section' },
              { key: 'featured', label: 'Featured Products Section' },
              { key: 'bestSellers', label: 'Best Sellers Section' },
            ].map(({ key, label }) => {
              const item = form.productHeadings[key] || {};
              return (
                <div
                  key={key}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3"
                >
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    {label}
                  </h3>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => updateProductHeading(key, 'title', e.target.value)}
                      placeholder="Title"
                      className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Subtitle / Caption
                    </label>
                    <input
                      type="text"
                      value={item.subtitle || ''}
                      onChange={(e) => updateProductHeading(key, 'subtitle', e.target.value)}
                      placeholder="Subtitle"
                      className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="space-y-1">
                      <label className="block text-[11px] text-slate-500 dark:text-slate-400">
                        Link Text
                      </label>
                      <input
                        type="text"
                        value={item.viewAllText || 'View All'}
                        onChange={(e) => updateProductHeading(key, 'viewAllText', e.target.value)}
                        className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] text-slate-500 dark:text-slate-400">
                        Link Destination
                      </label>
                      <input
                        type="text"
                        value={item.viewAllLink || '/shop'}
                        onChange={(e) => updateProductHeading(key, 'viewAllLink', e.target.value)}
                        className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Promo & CTA Banners */}
      {activeTab === 'banners' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* Promotional Mid-Banner */}
          <div className="glass-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Mid-Page Promotional Banner
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.promoBanner.show !== false}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      promoBanner: { ...form.promoBanner, show: e.target.checked },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:peer-focus:ring-neon-purple peer-checked:bg-purple-600 dark:peer-checked:bg-neon-purple" />
              </label>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Banner Badge
                </label>
                <input
                  type="text"
                  value={form.promoBanner.badge || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      promoBanner: { ...form.promoBanner, badge: e.target.value },
                    })
                  }
                  placeholder="e.g. EXCLUSIVE DEALS"
                  className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Banner Title
                </label>
                <input
                  type="text"
                  value={form.promoBanner.title || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      promoBanner: { ...form.promoBanner, title: e.target.value },
                    })
                  }
                  placeholder="e.g. Level Up Your Gaming Setup"
                  className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Banner Subtitle
                </label>
                <textarea
                  rows={2}
                  value={form.promoBanner.subtitle || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      promoBanner: { ...form.promoBanner, subtitle: e.target.value },
                    })
                  }
                  placeholder="Subtitle..."
                  className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={form.promoBanner.buttonText || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        promoBanner: { ...form.promoBanner, buttonText: e.target.value },
                      })
                    }
                    placeholder="Shop Collection"
                    className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Button URL
                  </label>
                  <input
                    type="text"
                    value={form.promoBanner.buttonLink || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        promoBanner: { ...form.promoBanner, buttonLink: e.target.value },
                      })
                    }
                    placeholder="/shop"
                    className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sell / Trade-in CTA Strip */}
          <div className="glass-card p-5 sm:p-6 space-y-4">
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Bottom Trade-in / Sell CTA Strip
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Full-width call to action encouraging customers to sell equipment or trade-in.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  CTA Headline
                </label>
                <input
                  type="text"
                  value={form.sellCta.title || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sellCta: { ...form.sellCta, title: e.target.value },
                    })
                  }
                  placeholder="Have a console or game to sell?"
                  className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  CTA Description
                </label>
                <textarea
                  rows={2}
                  value={form.sellCta.subtitle || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sellCta: { ...form.sellCta, subtitle: e.target.value },
                    })
                  }
                  placeholder="Get an instant quote for your used console, games, or gaming gear"
                  className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={form.sellCta.buttonText || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        sellCta: { ...form.sellCta, buttonText: e.target.value },
                      })
                    }
                    placeholder="Get a Quote"
                    className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Button URL
                  </label>
                  <input
                    type="text"
                    value={form.sellCta.buttonLink || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        sellCta: { ...form.sellCta, buttonLink: e.target.value },
                      })
                    }
                    placeholder="/sell"
                    className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Trust Badges */}
      {activeTab === 'trust' && (
        <div className="glass-card p-5 sm:p-6 space-y-6 animate-fade-in">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Trust & Feature Badges Bar
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize the four value-proposition badges displayed directly beneath the hero section.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {form.trustBar.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <select
                    value={item.icon || 'shield'}
                    onChange={(e) => updateTrustItem(idx, 'icon', e.target.value)}
                    className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 px-2 py-1"
                  >
                    <option value="shield">Shield (Genuine)</option>
                    <option value="truck">Truck (Fast Delivery)</option>
                    <option value="rotate">Rotate (Easy Returns)</option>
                    <option value="headphones">Headphones (Support)</option>
                    <option value="zap">Zap (Speed / Instant)</option>
                    <option value="sparkles">Sparkles (Quality)</option>
                    <option value="award">Award (Certified)</option>
                    <option value="clock">Clock (24/7)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Badge Title
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateTrustItem(idx, 'title', e.target.value)}
                    className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Description
                  </label>
                  <input
                    type="text"
                    value={item.desc}
                    onChange={(e) => updateTrustItem(idx, 'desc', e.target.value)}
                    className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
