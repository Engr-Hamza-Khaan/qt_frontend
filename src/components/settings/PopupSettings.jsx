import { useState, useEffect } from 'react';
import {
  Layers,
  Save,
  RotateCcw,
  Sparkles,
  Eye,
  CheckCircle2,
  AlertCircle,
  Copy,
  Clock,
  MousePointer,
  ArrowDownCircle,
  LogOut,
  Palette,
  Image as ImageIcon,
  Smartphone,
  Monitor,
  Gift,
  Mail,
  Users,
  Download,
  Check,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../api/client';
import LoadingSpinner from '../ui/LoadingSpinner';
import WebsitePopup from '../../store/components/WebsitePopup';

const POPUP_TEMPLATES = [
  {
    id: 'flash_sale',
    name: '⚡ Flash Sale 25% Off',
    desc: 'Signature neon gaming style with promo discount code',
    config: {
      active: true,
      title: '⚡ SPECIAL FLASH SALE: 25% OFF!',
      subtitle: 'Level up your gaming setup today! Grab PS5 games, controllers, and accessories with instant savings.',
      badge: '🔥 LIMITED TIME DEAL',
      couponCode: 'GAMER25',
      imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
      presetTheme: 'neon-purple',
      position: 'center',
      animation: 'scale-up',
      triggerType: 'delay',
      delaySeconds: 4,
      scrollPercentage: 35,
      autoClose: false,
      autoCloseSeconds: 15,
      frequency: 'once_per_session',
      actionType: 'copy_coupon',
      buttonText: 'Claim 25% Discount Now',
      buttonLink: '/shop',
      secondaryButtonText: 'Maybe Later',
      successTitle: '🎉 Discount Code Applied!',
      successMessage: 'Code GAMER25 copied to your clipboard! Apply at checkout for instant 25% off.',
      successButtonText: 'Start Shopping Deals',
      successButtonLink: '/shop',
    },
  },
  {
    id: 'free_shipping',
    name: '🚚 Free Shipping Weekend',
    desc: 'Emerald green delivery promo triggering on 25% scroll',
    config: {
      active: true,
      title: '🚚 FREE Nationwide Shipping!',
      subtitle: 'Order anything over Rs 1,500 and get free courier delivery anywhere across Pakistan.',
      badge: '✨ WEEKEND SPECIAL',
      couponCode: 'FREESHIP',
      imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
      presetTheme: 'emerald-rush',
      position: 'center',
      animation: 'scale-up',
      triggerType: 'scroll',
      delaySeconds: 3,
      scrollPercentage: 25,
      autoClose: false,
      autoCloseSeconds: 15,
      frequency: 'once_per_session',
      actionType: 'copy_coupon',
      buttonText: 'Get Free Delivery',
      buttonLink: '/shop',
      secondaryButtonText: 'Continue Browsing',
      successTitle: '🚚 Free Shipping Code Copied!',
      successMessage: 'Use coupon code FREESHIP at checkout for 100% free delivery.',
      successButtonText: 'Shop All Products',
      successButtonLink: '/shop',
    },
  },
  {
    id: 'newsletter_club',
    name: '🎁 VIP Club / Email Unlock',
    desc: 'Lead generation newsletter form to collect customer emails',
    config: {
      active: true,
      title: '🎁 Join Quick Turn VIP Gaming Club',
      subtitle: 'Subscribe with your email to unlock an exclusive 15% discount code and early access to drops.',
      badge: '🌟 EXCLUSIVE PERKS',
      couponCode: 'VIP15',
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      presetTheme: 'royal-blue',
      position: 'center',
      animation: 'scale-up',
      triggerType: 'delay',
      delaySeconds: 5,
      scrollPercentage: 35,
      autoClose: false,
      autoCloseSeconds: 15,
      frequency: 'once_per_session',
      actionType: 'newsletter',
      buttonText: 'Unlock 15% Discount',
      buttonLink: '/shop',
      secondaryButtonText: 'No thanks, I prefer paying full price',
      successTitle: '🎉 Welcome to the Club!',
      successMessage: 'Thank you for subscribing! Your exclusive discount code is VIP15.',
      successButtonText: 'Explore Exclusive Gear',
      successButtonLink: '/shop',
    },
  },
  {
    id: 'exit_intent',
    name: '🚪 Exit-Intent Last Chance',
    desc: 'Catches leaving visitors with an irresistible crimson offer',
    config: {
      active: true,
      title: 'Wait! Don’t Leave Empty Handed!',
      subtitle: 'Take 20% off your purchase right now before this limited time session expires.',
      badge: '⏰ LAST CHANCE',
      couponCode: 'STAY20',
      imageUrl: 'https://images.unsplash.com/photo-1526509867162-5b0c0d1b4b33?w=800&auto=format&fit=crop&q=80',
      presetTheme: 'cyber-flame',
      position: 'center',
      animation: 'scale-up',
      triggerType: 'exit_intent',
      delaySeconds: 4,
      scrollPercentage: 35,
      autoClose: true,
      autoCloseSeconds: 20,
      frequency: 'once_per_session',
      actionType: 'copy_coupon',
      buttonText: 'Claim My 20% Off',
      buttonLink: '/shop',
      secondaryButtonText: 'I will pass',
      successTitle: '🔥 You Got It!',
      successMessage: 'Code STAY20 copied! Finish your order now to save big.',
      successButtonText: 'Browse Catalog',
      successButtonLink: '/shop',
    },
  },
];

const PRESET_THEMES = [
  { id: 'neon-purple', name: 'Neon Purple (Signature)', color: '#a855f7' },
  { id: 'cyber-flame', name: 'Cyber Flame (Crimson)', color: '#f43f5e' },
  { id: 'emerald-rush', name: 'Emerald Rush (Mint)', color: '#10b981' },
  { id: 'royal-blue', name: 'Royal Blue (Sapphire)', color: '#3b82f6' },
  { id: 'gold-luxury', name: 'Gold Luxury (Obsidian)', color: '#f59e0b' },
  { id: 'custom', name: 'Custom Palette', color: '#6366f1' },
];

export default function PopupSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [activeTab, setActiveTab] = useState('appearance'); // 'appearance', 'timing', 'action', 'leads'
  const [previewKey, setPreviewKey] = useState(1);

  const [form, setForm] = useState({
    active: true,
    title: '⚡ SPECIAL FLASH SALE: 25% OFF!',
    subtitle: 'Upgrade your gaming rig, consoles, and controllers today! Use discount code at checkout.',
    badge: '🔥 LIMITED TIME DEAL',
    couponCode: 'QUICKTURN25',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    presetTheme: 'neon-purple',
    customBg: '#120d24',
    textColor: '#ffffff',
    accentColor: '#a855f7',
    position: 'center',
    animation: 'scale-up',
    triggerType: 'delay',
    delaySeconds: 4,
    scrollPercentage: 35,
    autoClose: false,
    autoCloseSeconds: 15,
    frequency: 'once_per_session',
    actionType: 'copy_coupon',
    buttonText: 'Claim 25% Discount Now',
    buttonLink: '/shop',
    secondaryButtonText: 'Maybe Later',
    successTitle: '🎉 Discount Code Applied!',
    successMessage: 'Code QUICKTURN25 has been copied to your clipboard. Enjoy your shopping!',
    successButtonText: 'Start Shopping Now',
    successButtonLink: '/shop',
    leads: [],
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.settings.getPopup();
      if (res.success && res.data) {
        setForm((prev) => ({
          ...prev,
          ...res.data,
        }));
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to load popup settings from server.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await api.settings.updatePopup(form);
      if (res.success) {
        setForm((prev) => ({ ...prev, ...res.data }));
        setFeedback({
          type: 'success',
          message: 'Website popup settings updated successfully!',
        });
        setPreviewKey((k) => k + 1);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error saving popup settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTemplate = (tmpl) => {
    setForm((prev) => ({
      ...prev,
      ...tmpl.config,
    }));
    setPreviewKey((k) => k + 1);
    setFeedback({
      type: 'success',
      message: `Loaded template: "${tmpl.name}"! Click "Save Changes" to publish.`,
    });
  };

  const handleExportLeadsCSV = () => {
    const leads = form.leads || [];
    if (leads.length === 0) {
      alert('No visitor leads collected yet.');
      return;
    }
    const headers = ['Email', 'Phone', 'Name', 'Submitted At'];
    const rows = leads.map((l) => [
      `"${l.email || ''}"`,
      `"${l.phone || ''}"`,
      `"${l.name || ''}"`,
      `"${new Date(l.submittedAt).toLocaleString()}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `quickturn_popup_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-[400px]" />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Layers className="w-7 h-7 text-purple-500" />
            Website Popup Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Design and control visitor popups: appearance, triggers, auto-close duration, and visitor action responses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPreviewKey((k) => k + 1)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition"
            title="Reload live preview"
          >
            <RotateCcw className="w-4 h-4" />
            Refresh Preview
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-brand px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save & Publish'}
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Master Switch Card */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all ${
              form.active
                ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                : 'bg-slate-100 text-slate-400 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-800 dark:text-white">
                Website Popup Status
              </h3>
              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                  form.active
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {form.active ? 'Active on Store' : 'Disabled'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              When active, visitors to the storefront will see this popup based on the trigger and duration rules below.
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-purple-600"></div>
        </label>
      </div>

      {/* Quick Templates Selector */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Quick Preset Templates
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {POPUP_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => handleApplyTemplate(tmpl)}
              className="p-3.5 text-left rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800 hover:border-purple-500/50 hover:shadow-lg transition-all group"
            >
              <div className="font-bold text-xs text-slate-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 flex items-center justify-between">
                <span>{tmpl.name}</span>
                <Sparkles className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                {tmpl.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Editor Tabs (Left) & Dual Device Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor Form Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200/50 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('appearance')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === 'appearance'
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              1. Content & Appearance
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('timing')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === 'timing'
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              2. Trigger & Duration
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('action')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === 'action'
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              3. Visitor Action & State
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('leads')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 ${
                activeTab === 'leads'
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <span>Leads</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-500/20 text-purple-600 dark:text-purple-400 font-extrabold">
                {form.leads?.length || 0}
              </span>
            </button>
          </div>

          {/* TAB 1: Content & Appearance */}
          {activeTab === 'appearance' && (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-xl space-y-5">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Palette className="w-4 h-4 text-purple-500" />
                Popup Content & Styling
              </h3>

              {/* Theme Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Theme Preset Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PRESET_THEMES.map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setForm({ ...form, presetTheme: th.id })}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition ${
                        form.presetTheme === th.id
                          ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: th.color }}
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300 truncate">
                        {th.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Colors (if custom theme selected) */}
              {form.presetTheme === 'custom' && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/50 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Background Color
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={form.customBg}
                        onChange={(e) => setForm({ ...form, customBg: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={form.customBg}
                        onChange={(e) => setForm({ ...form, customBg: e.target.value })}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Text Color
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={form.textColor}
                        onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={form.textColor}
                        onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Button Accent Color
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={form.accentColor}
                        onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={form.accentColor}
                        onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Badge / Tag
                  </label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="e.g. LIMITED OFFER"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Headline / Title
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Headline title..."
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Subtitle / Offer Details
                </label>
                <textarea
                  rows="2"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="Offer description..."
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none dark:text-white"
                />
              </div>

              {/* Coupon Code & Banner Graphic URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Coupon Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.couponCode}
                    onChange={(e) => setForm({ ...form, couponCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. GAMER25"
                    className="w-full mt-1 px-3 py-2 font-mono font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Banner Image URL
                  </label>
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://... (or leave empty for no image)"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              {/* Layout Position & Animation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Screen Position
                  </label>
                  <select
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none dark:text-white"
                  >
                    <option value="center">Center Modal (with Dark Backdrop)</option>
                    <option value="bottom-right">Bottom-Right Floating Card</option>
                    <option value="bottom-left">Bottom-Left Floating Card</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Entrance Animation
                  </label>
                  <select
                    value={form.animation}
                    onChange={(e) => setForm({ ...form, animation: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none dark:text-white"
                  >
                    <option value="scale-up">Scale / Pop Up</option>
                    <option value="slide-up">Slide In from Bottom</option>
                    <option value="fade-in">Smooth Fade In</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Trigger & Duration */}
          {activeTab === 'timing' && (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-xl space-y-6">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Clock className="w-4 h-4 text-amber-500" />
                Popup Trigger & Duration Rules (Kab aur Kitni Dair)
              </h3>

              {/* Trigger Type Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Kab Appear Ho? (Trigger Mechanism)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setForm({ ...form, triggerType: 'delay' })}
                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                      form.triggerType === 'delay'
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-white">
                      <Clock className="w-4 h-4 text-purple-500" />
                      Timed Delay (Recommended)
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Appears automatically after visitor spends X seconds on the site.
                    </p>
                  </div>

                  <div
                    onClick={() => setForm({ ...form, triggerType: 'scroll' })}
                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                      form.triggerType === 'scroll'
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-white">
                      <ArrowDownCircle className="w-4 h-4 text-emerald-500" />
                      Scroll Depth Percentage
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Appears after visitor scrolls down partway through the page.
                    </p>
                  </div>

                  <div
                    onClick={() => setForm({ ...form, triggerType: 'exit_intent' })}
                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                      form.triggerType === 'exit_intent'
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-white">
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Exit Intent (Leaving Page)
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Detects when the cursor moves towards the browser close/tab bar.
                    </p>
                  </div>

                  <div
                    onClick={() => setForm({ ...form, triggerType: 'immediate' })}
                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                      form.triggerType === 'immediate'
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-white">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      Immediate on Page Load
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Pops up immediately when the visitor loads the store.
                    </p>
                  </div>
                </div>
              </div>

              {/* Conditional Slider depending on trigger */}
              {form.triggerType === 'delay' && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">Delay Time Before Showing:</span>
                    <span className="text-purple-600 dark:text-purple-400 font-extrabold">{form.delaySeconds} seconds</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={form.delaySeconds}
                    onChange={(e) => setForm({ ...form, delaySeconds: parseInt(e.target.value, 10) })}
                    className="w-full accent-purple-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>1s (Instant)</span>
                    <span>5s</span>
                    <span>15s</span>
                    <span>30s</span>
                  </div>
                </div>
              )}

              {form.triggerType === 'scroll' && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">Scroll Depth Threshold:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{form.scrollPercentage}% down</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={form.scrollPercentage}
                    onChange={(e) => setForm({ ...form, scrollPercentage: parseInt(e.target.value, 10) })}
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>10% (Top)</span>
                    <span>50% (Halfway)</span>
                    <span>90% (Bottom)</span>
                  </div>
                </div>
              )}

              {/* Kitni Dair Tak Appear Ho (Auto Close Duration) */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white">
                      Auto-Dismiss Timer (Kitni Dair Tak Appear Ho)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      If enabled, the popup will automatically disappear after a specified countdown duration.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.autoClose}
                    onChange={(e) => setForm({ ...form, autoClose: e.target.checked })}
                    className="w-4 h-4 accent-purple-600 cursor-pointer"
                  />
                </div>

                {form.autoClose && (
                  <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">Auto Close Duration:</span>
                      <span className="text-amber-500 font-extrabold">{form.autoCloseSeconds} seconds</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="5"
                      value={form.autoCloseSeconds}
                      onChange={(e) => setForm({ ...form, autoCloseSeconds: parseInt(e.target.value, 10) })}
                      className="w-full accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>5s (Fast)</span>
                      <span>15s (Standard)</span>
                      <span>30s</span>
                      <span>60s</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Display Frequency Rules */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Display Frequency (Visitor Experience)
                </label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none dark:text-white"
                >
                  <option value="once_per_session">Once Per Browser Session (Recommended - not annoying)</option>
                  <option value="once_per_day">Once Every 24 Hours</option>
                  <option value="always">Always on Every Page Visit (Testing / Persistent)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 3: Action & Success Feedback */}
          {activeTab === 'action' && (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-xl space-y-5">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <MousePointer className="w-4 h-4 text-emerald-500" />
                Visitor Action Behavior & Success State
              </h3>

              {/* Action Type */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Visitor Jab Action Le Tou Kia Ho?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, actionType: 'copy_coupon' })}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      form.actionType === 'copy_coupon'
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Copy className="w-3.5 h-3.5 text-purple-500" />
                      Copy Code & Success
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Copies coupon code instantly and transitions to celebratory success screen.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, actionType: 'redirect' })}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      form.actionType === 'redirect'
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                      Direct Link Redirect
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Directly navigates visitor to store page or custom deal URL.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, actionType: 'newsletter' })}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      form.actionType === 'newsletter'
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-emerald-500" />
                      Email Newsletter Form
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Visitor enters their email to unlock code, saved to your leads list.
                    </p>
                  </button>
                </div>
              </div>

              {/* Primary & Secondary Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={form.buttonText}
                    onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                    placeholder="e.g. Claim 25% Discount"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    CTA Target Link
                  </label>
                  <input
                    type="text"
                    value={form.buttonLink}
                    onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
                    placeholder="/shop or https://..."
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Dismissal Link Text
                </label>
                <input
                  type="text"
                  value={form.secondaryButtonText}
                  onChange={(e) => setForm({ ...form, secondaryButtonText: e.target.value })}
                  placeholder="e.g. Maybe Later, or No thanks"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none dark:text-white"
                />
              </div>

              {/* Success State Customization */}
              <div className="p-4 bg-emerald-500/5 dark:bg-emerald-950/20 rounded-2xl border border-emerald-500/20 space-y-3">
                <h4 className="font-bold text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 uppercase">
                  <CheckCircle2 className="w-4 h-4" />
                  Success Screen Display (After Click / Submit)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Success Title
                    </label>
                    <input
                      type="text"
                      value={form.successTitle}
                      onChange={(e) => setForm({ ...form, successTitle: e.target.value })}
                      placeholder="e.g. 🎉 Code Applied!"
                      className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Success Button Text
                    </label>
                    <input
                      type="text"
                      value={form.successButtonText}
                      onChange={(e) => setForm({ ...form, successButtonText: e.target.value })}
                      placeholder="e.g. Start Shopping Deals"
                      className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Success Message
                  </label>
                  <textarea
                    rows="2"
                    value={form.successMessage}
                    onChange={(e) => setForm({ ...form, successMessage: e.target.value })}
                    placeholder="Celebratory feedback message..."
                    className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Collected Leads */}
          {activeTab === 'leads' && (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    Visitor Leads Collected Through Popup
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Customers who submitted their email or phone number in newsletter mode.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportLeadsCSV}
                  disabled={!form.leads || form.leads.length === 0}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
              </div>

              {!form.leads || form.leads.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No subscriber leads recorded yet. Enable "Email Newsletter Form" mode in Action settings to collect visitor emails.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <th className="p-3 font-bold text-slate-500 uppercase">Email / Contact</th>
                        <th className="p-3 font-bold text-slate-500 uppercase">Name</th>
                        <th className="p-3 font-bold text-slate-500 uppercase">Captured Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {form.leads.map((l, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                          <td className="p-3 font-bold text-slate-800 dark:text-white">
                            {l.email || l.phone}
                          </td>
                          <td className="p-3 text-slate-500">
                            {l.name || 'Visitor'}
                          </td>
                          <td className="p-3 text-slate-400">
                            {new Date(l.submittedAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Dual-Device Interactive Preview Column */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-500" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Live Interactive Simulator
                </span>
              </div>

              {/* Device Selector */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-lg transition ${
                    previewDevice === 'desktop'
                      ? 'bg-white dark:bg-slate-800 text-purple-600 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Desktop Preview"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-lg transition ${
                    previewDevice === 'mobile'
                      ? 'bg-white dark:bg-slate-800 text-purple-600 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Interactive test: Click the button inside to test the copy action and preview the success state!
            </p>

            {/* Container for simulation */}
            <div
              className={`relative mx-auto rounded-3xl overflow-hidden border-2 border-slate-700 bg-slate-950 transition-all ${
                previewDevice === 'mobile'
                  ? 'w-[320px] h-[580px] shadow-2xl scale-95'
                  : 'w-full min-h-[500px] shadow-xl'
              }`}
            >
              {/* Fake storefront background mock */}
              <div className="absolute inset-0 p-4 opacity-25 filter blur-[1px] select-none pointer-events-none space-y-4">
                <div className="h-6 w-32 bg-purple-500/40 rounded-lg"></div>
                <div className="h-28 w-full bg-slate-800 rounded-2xl"></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-24 bg-slate-800 rounded-xl"></div>
                  <div className="h-24 bg-slate-800 rounded-xl"></div>
                </div>
              </div>

              {/* Render preview popup */}
              <div key={previewKey} className="relative z-10 w-full h-full">
                <WebsitePopup previewConfig={form} />
              </div>
            </div>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setPreviewKey((k) => k + 1)}
                className="text-[11px] text-purple-600 dark:text-purple-400 font-bold hover:underline"
              >
                Reset / Restart Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
