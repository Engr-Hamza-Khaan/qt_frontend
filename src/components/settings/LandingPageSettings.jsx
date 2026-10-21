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
  SlidersHorizontal,
  Plus,
  Trash2,
  Copy,
  Clock,
  Navigation,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../api/client';
import LoadingSpinner from '../ui/LoadingSpinner';

const DEFAULT_SLIDER_SLIDES = [
  {
    id: 'slide-1',
    badge: '• CERTIFIED • TESTED • READY TO SHIP',
    headline1: 'NEXT-GEN',
    headline2: 'PLAYSTATION 5,',
    headlineHollow: 'READY TO PLAY.',
    subtitle: 'Every console is inspected, stress-tested, and backed by a 90-day warranty before it reaches your door. Trade in your old gear anytime.',
    primaryBtnText: 'Shop PS5 Consoles',
    primaryBtnLink: '/shop?categorySlug=consoles&search=playstation',
    secondaryBtnText: 'Sell Your Console',
    secondaryBtnLink: '/sell',
    image: '/SLim.png',
    alt: 'PlayStation 5 Slim Console',
    activeColor: 'text-[#0070d1]',
    glowColor: 'from-[#0070d1]/45 via-[#0070d1]/25 to-transparent',
    ambientGlow: 'bg-[#0070d1]/35',
  },
  {
    id: 'slide-2',
    badge: '• POWER YOUR DREAMS • 4K GAMING',
    headline1: 'XBOX SERIES X|S',
    headline2: 'NEXT-LEVEL SPEED,',
    headlineHollow: 'UNBEATABLE VALUE.',
    subtitle: 'Experience true 4K gaming and lightning fast load times with pre-owned and brand-new Xbox Series consoles with full warranty.',
    primaryBtnText: 'Shop Xbox Series',
    primaryBtnLink: '/shop?categorySlug=consoles&search=xbox',
    secondaryBtnText: 'Trade-In & Upgrade',
    secondaryBtnLink: '/sell',
    image: '/Xbox Both.png',
    alt: 'Xbox Series X and Series S Consoles',
    activeColor: 'text-[#107c10]',
    glowColor: 'from-[#107c10]/40 via-[#107c10]/20 to-transparent',
    ambientGlow: 'bg-[#107c10]/30',
  },
  {
    id: 'slide-3',
    badge: '• HYBRID GAMING • VIBRANT OLED',
    headline1: 'NINTENDO SWITCH',
    headline2: 'PLAY ANYWHERE,',
    headlineHollow: 'ANYTIME WITH FRIENDS.',
    subtitle: 'Vibrant 7-inch OLED screen and portable fun for everyone. Check out our certified handheld consoles and games catalog.',
    primaryBtnText: 'Shop Nintendo Switch',
    primaryBtnLink: '/shop?categorySlug=consoles&search=nintendo',
    secondaryBtnText: 'Browse Games',
    secondaryBtnLink: '/shop?categorySlug=games',
    image: '/Nintendo PNG.png',
    alt: 'Nintendo Switch Console',
    activeColor: 'text-[#e60012]',
    glowColor: 'from-[#e60012]/45 via-[#e60012]/20 to-transparent',
    ambientGlow: 'bg-[#e60012]/35',
  },
];

const DEFAULT_SLIDER_CONFIG = {
  autoplay: true,
  autoplayInterval: 5000,
  showArrows: true,
  showDots: true,
  slides: DEFAULT_SLIDER_SLIDES,
};

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
    useStandardSlider: false,
    sliderConfig: DEFAULT_SLIDER_CONFIG,
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
  { id: 'slider', label: 'Standard Slider (Carousel)', icon: SlidersHorizontal },
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
            useStandardSlider: Boolean(res.data.hero?.useStandardSlider),
            sliderConfig: {
              ...DEFAULT_SLIDER_CONFIG,
              ...(res.data.hero?.sliderConfig || {}),
              slides: (Array.isArray(res.data.hero?.sliderConfig?.slides) && res.data.hero.sliderConfig.slides.length > 0)
                ? res.data.hero.sliderConfig.slides
                : DEFAULT_SLIDER_CONFIG.slides,
            },
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

  // Standard Slider Helpers
  const toggleStandardSlider = () => {
    setForm((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        useStandardSlider: !prev.hero.useStandardSlider,
      },
    }));
  };

  const updateSliderConfig = (field, value) => {
    setForm((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        sliderConfig: {
          ...(prev.hero.sliderConfig || DEFAULT_SLIDER_CONFIG),
          [field]: value,
        },
      },
    }));
  };

  const updateSlide = (index, field, value) => {
    const currentSlides = [...(form.hero.sliderConfig?.slides || DEFAULT_SLIDER_SLIDES)];
    currentSlides[index] = {
      ...currentSlides[index],
      [field]: value,
    };
    updateSliderConfig('slides', currentSlides);
  };

  const addSlide = () => {
    const currentSlides = [...(form.hero.sliderConfig?.slides || DEFAULT_SLIDER_SLIDES)];
    const newSlide = {
      id: `slide-${Date.now()}`,
      badge: '• NEW ARRIVAL • EXCLUSIVE DEAL',
      headline1: 'NEW GAMING',
      headline2: 'COLLECTION,',
      headlineHollow: 'LEVEL UP TODAY.',
      subtitle: 'Explore our latest arrivals of high performance consoles, premium controllers, and gaming essentials.',
      primaryBtnText: 'Shop Now',
      primaryBtnLink: '/shop',
      secondaryBtnText: 'Explore More',
      secondaryBtnLink: '/shop',
      image: '/SLim.png',
      alt: 'Gaming Collection',
      activeColor: 'text-purple-500',
      glowColor: 'from-purple-600/45 via-purple-600/25 to-transparent',
      ambientGlow: 'bg-purple-600/35',
    };
    updateSliderConfig('slides', [...currentSlides, newSlide]);
  };

  const removeSlide = (index) => {
    const currentSlides = [...(form.hero.sliderConfig?.slides || DEFAULT_SLIDER_SLIDES)];
    if (currentSlides.length <= 1) {
      alert('At least one slide is required in the slider.');
      return;
    }
    const filtered = currentSlides.filter((_, i) => i !== index);
    updateSliderConfig('slides', filtered);
  };

  const duplicateSlide = (index) => {
    const currentSlides = [...(form.hero.sliderConfig?.slides || DEFAULT_SLIDER_SLIDES)];
    const copy = {
      ...currentSlides[index],
      id: `slide-${Date.now()}`,
      headline1: `${currentSlides[index].headline1 || ''} (Copy)`,
    };
    const updated = [...currentSlides];
    updated.splice(index + 1, 0, copy);
    updateSliderConfig('slides', updated);
  };

  const moveSlide = (index, direction) => {
    const currentSlides = [...(form.hero.sliderConfig?.slides || DEFAULT_SLIDER_SLIDES)];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentSlides.length) return;
    const temp = currentSlides[index];
    currentSlides[index] = currentSlides[targetIndex];
    currentSlides[targetIndex] = temp;
    updateSliderConfig('slides', currentSlides);
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

          {/* Standard Slider Mode Switch Banner */}
          <div className="p-4 sm:p-5 rounded-2xl border border-purple-200/80 dark:border-purple-800/80 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    Hero Display Mode: Standard Slider Option
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    form.hero.useStandardSlider
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                  }`}>
                    {form.hero.useStandardSlider ? 'Standard Slider Enabled' : 'Console Showcase Active'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
                  {form.hero.useStandardSlider
                    ? 'Standard Slider is ENABLED. The homepage hero is displaying the multi-slide carousel. You can configure individual slides, autoplay, and navigation arrows in the "Standard Slider" tab.'
                    : 'Interactive 3-Platform Showcase is currently active. Toggle this switch ON to switch the hero section into a full-featured standard image/banner slider.'}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(form.hero.useStandardSlider)}
                    onChange={toggleStandardSlider}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 dark:peer-checked:bg-purple-500" />
                </label>

                {form.hero.useStandardSlider && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('slider')}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Manage Slides</span>
                  </button>
                )}
              </div>
            </div>
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

      {/* Tab: Standard Slider (Carousel) */}
      {activeTab === 'slider' && (
        <div className="space-y-6 animate-fade-in">
          {/* Slider Master Status Card */}
          <div className="glass-card p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800/80 gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Standard Slider (Carousel) Settings
                  </h2>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    form.hero.useStandardSlider
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                  }`}>
                    {form.hero.useStandardSlider ? 'Enabled on Storefront' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Control whether the homepage hero displays a standard banner slider, and adjust autoplay, navigation controls, and timing.
                </p>
              </div>

              {/* Master Enable/Disable Switch */}
              <div className="flex items-center gap-3 bg-slate-100/70 dark:bg-slate-900/70 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Enable Slider:
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(form.hero.useStandardSlider)}
                    onChange={toggleStandardSlider}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 dark:peer-checked:bg-purple-500" />
                </label>
              </div>
            </div>

            {/* Slider Behavior Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* Autoplay Toggle */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Auto-Advance
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Automatically transition slides
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={form.hero.sliderConfig?.autoplay !== false}
                    onChange={(e) => updateSliderConfig('autoplay', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 dark:peer-checked:bg-purple-500" />
                </label>
              </div>

              {/* Navigation Arrows Toggle */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Arrow Buttons
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Show Next & Prev arrows
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={form.hero.sliderConfig?.showArrows !== false}
                    onChange={(e) => updateSliderConfig('showArrows', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 dark:peer-checked:bg-purple-500" />
                </label>
              </div>

              {/* Indicator Dots Toggle */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Indicator Dots
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Bottom slide pagination dots
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={form.hero.sliderConfig?.showDots !== false}
                    onChange={(e) => updateSliderConfig('showDots', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 dark:peer-checked:bg-purple-500" />
                </label>
              </div>

              {/* Slide Duration / Interval */}
              <div className="sm:col-span-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Slide Display Duration
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Amount of time each slide is displayed before auto-advancing
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[3000, 5000, 7000, 10000].map((ms) => (
                      <button
                        key={ms}
                        type="button"
                        onClick={() => updateSliderConfig('autoplayInterval', ms)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                          (Number(form.hero.sliderConfig?.autoplayInterval) || 5000) === ms
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                        }`}
                      >
                        {ms / 1000}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slides Manager List Card */}
          <div className="glass-card p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Carousel Slides ({(form.hero.sliderConfig?.slides || DEFAULT_SLIDER_SLIDES).length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Customize the title, badges, image, and buttons for each slide in the standard slider.
                </p>
              </div>

              <button
                type="button"
                onClick={addSlide}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-md shadow-purple-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Slide</span>
              </button>
            </div>

            <div className="space-y-5">
              {(form.hero.sliderConfig?.slides || DEFAULT_SLIDER_SLIDES).map((slide, idx) => {
                const slidesList = form.hero.sliderConfig?.slides || DEFAULT_SLIDER_SLIDES;
                return (
                  <div
                    key={slide.id || idx}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4"
                  >
                    {/* Slide Header Toolbar */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {slide.headline1 ? `${slide.headline1} ${slide.headline2 || ''}` : `Slide ${idx + 1}`}
                          </h4>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {slide.badge || 'No badge'}
                          </span>
                        </div>
                      </div>

                      {/* Slide Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => moveSlide(idx, -1)}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                          title="Move Slide Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSlide(idx, 1)}
                          disabled={idx === slidesList.length - 1}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                          title="Move Slide Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateSlide(idx)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                          title="Duplicate Slide"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSlide(idx)}
                          disabled={slidesList.length <= 1}
                          className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 disabled:cursor-not-allowed transition"
                          title="Delete Slide"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Slide Edit Form Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                      {/* Image Preview & Quick Switcher */}
                      <div className="md:col-span-3 flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950 border border-slate-800 text-center min-h-[160px]">
                        {slide.image ? (
                          <img
                            src={slide.image}
                            alt={slide.headline1 || 'Slide Image'}
                            className="max-h-24 object-contain drop-shadow"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://placehold.co/200x150/1e293b/ffffff?text=Image+Not+Found';
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-slate-600" />
                        )}
                        <span className="text-[10px] text-slate-400 mt-2 truncate max-w-full font-mono">
                          {slide.image || 'No image'}
                        </span>
                        {/* Quick Presets */}
                        <div className="flex flex-wrap gap-1 mt-2 justify-center">
                          {['/SLim.png', '/Xbox Both.png', '/Nintendo PNG.png'].map((path) => (
                            <button
                              key={path}
                              type="button"
                              onClick={() => updateSlide(idx, 'image', path)}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-purple-600 hover:text-white transition"
                            >
                              {path.includes('SLim') ? 'PS5' : path.includes('Xbox') ? 'Xbox' : 'Switch'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Fields */}
                      <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Pill Badge */}
                        <div className="sm:col-span-2 space-y-1">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Pill Badge Text
                          </label>
                          <input
                            type="text"
                            value={slide.badge || ''}
                            onChange={(e) => updateSlide(idx, 'badge', e.target.value)}
                            placeholder="• CERTIFIED • TESTED • READY TO SHIP"
                            className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs"
                          />
                        </div>

                        {/* Headline Line 1 */}
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Headline Line 1
                          </label>
                          <input
                            type="text"
                            value={slide.headline1 || ''}
                            onChange={(e) => updateSlide(idx, 'headline1', e.target.value)}
                            placeholder="NEXT-GEN"
                            className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs font-bold"
                          />
                        </div>

                        {/* Headline Line 2 */}
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Headline Line 2
                          </label>
                          <input
                            type="text"
                            value={slide.headline2 || ''}
                            onChange={(e) => updateSlide(idx, 'headline2', e.target.value)}
                            placeholder="PLAYSTATION 5,"
                            className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs font-bold"
                          />
                        </div>

                        {/* Hollow Accent Line 3 */}
                        <div className="sm:col-span-2 space-y-1">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Neon Hollow Accent Headline (Line 3)
                          </label>
                          <input
                            type="text"
                            value={slide.headlineHollow || ''}
                            onChange={(e) => updateSlide(idx, 'headlineHollow', e.target.value)}
                            placeholder="READY TO PLAY."
                            className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs font-mono"
                          />
                        </div>

                        {/* Subtitle */}
                        <div className="sm:col-span-2 space-y-1">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Slide Subtitle Description
                          </label>
                          <textarea
                            rows={2}
                            value={slide.subtitle || ''}
                            onChange={(e) => updateSlide(idx, 'subtitle', e.target.value)}
                            placeholder="Describe your gaming offer or guarantee..."
                            className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs"
                          />
                        </div>

                        {/* Image URL */}
                        <div className="sm:col-span-2 space-y-1">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Product Image URL
                          </label>
                          <input
                            type="text"
                            value={slide.image || ''}
                            onChange={(e) => updateSlide(idx, 'image', e.target.value)}
                            placeholder="e.g. /SLim.png or public image URL"
                            className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs font-mono"
                          />
                        </div>

                        {/* Primary Button */}
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Primary Button Label
                          </label>
                          <input
                            type="text"
                            value={slide.primaryBtnText || ''}
                            onChange={(e) => updateSlide(idx, 'primaryBtnText', e.target.value)}
                            placeholder="Shop Now"
                            className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Primary Button Link
                          </label>
                          <input
                            type="text"
                            value={slide.primaryBtnLink || ''}
                            onChange={(e) => updateSlide(idx, 'primaryBtnLink', e.target.value)}
                            placeholder="/shop?categorySlug=consoles"
                            className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs"
                          />
                        </div>

                        {/* Secondary Button */}
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Secondary Button Label
                          </label>
                          <input
                            type="text"
                            value={slide.secondaryBtnText || ''}
                            onChange={(e) => updateSlide(idx, 'secondaryBtnText', e.target.value)}
                            placeholder="Sell Your Console"
                            className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Secondary Button Link
                          </label>
                          <input
                            type="text"
                            value={slide.secondaryBtnLink || ''}
                            onChange={(e) => updateSlide(idx, 'secondaryBtnLink', e.target.value)}
                            placeholder="/sell"
                            className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white text-xs"
                          />
                        </div>

                        {/* Ambient Glow Theme preset selector */}
                        <div className="sm:col-span-2 space-y-1.5 pt-1">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Ambient Glow Color Preset
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { label: 'PlayStation Blue', ambient: 'bg-[#0070d1]/35', active: 'text-[#0070d1]' },
                              { label: 'Xbox Green', ambient: 'bg-[#107c10]/30', active: 'text-[#107c10]' },
                              { label: 'Nintendo Red', ambient: 'bg-[#e60012]/35', active: 'text-[#e60012]' },
                              { label: 'Cyberpunk Purple', ambient: 'bg-purple-600/35', active: 'text-purple-500' },
                              { label: 'Amber Gold', ambient: 'bg-amber-500/35', active: 'text-amber-400' },
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => {
                                  updateSlide(idx, 'ambientGlow', preset.ambient);
                                  updateSlide(idx, 'activeColor', preset.active);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                                  slide.ambientGlow === preset.ambient
                                    ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
