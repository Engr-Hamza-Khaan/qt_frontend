import { useState, useEffect } from 'react';
import {
  Megaphone,
  Save,
  RotateCcw,
  Sparkles,
  Truck,
  Flame,
  Tag,
  Bell,
  Info,
  CheckCircle2,
  AlertCircle,
  Eye,
  Settings,
  Palette,
  ExternalLink,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { api } from '../../api/client';
import LoadingSpinner from '../ui/LoadingSpinner';
import AnnouncementBar from '../ui/AnnouncementBar';

const QUICK_TEXT_PRESETS = [
  '🚚 Free shipping on orders over Rs 150! | Summer Sale Active Now!',
  '⚡ FLASH SALE: Up to 20% off all PS5 controllers & retro games!',
  '🔧 Need console repair? Get an instant quote & fast turnaround!',
  '🎮 Trade in your old console or games for top instant cash payouts!',
  '🎁 Use coupon code WELCOME10 for 10% off your first order!',
];

const PRESET_THEMES = [
  {
    id: 'neon-purple',
    name: 'Neon Purple (Signature)',
    gradient: 'from-purple-950 via-[#7c16c9] to-purple-950',
    border: 'border-neon-purple/50',
  },
  {
    id: 'cyber-flame',
    name: 'Cyber Flame (Crimson)',
    gradient: 'from-rose-950 via-red-600 to-amber-700',
    border: 'border-rose-500/50',
  },
  {
    id: 'emerald-rush',
    name: 'Emerald Rush (Mint)',
    gradient: 'from-emerald-950 via-emerald-700 to-teal-800',
    border: 'border-emerald-400/50',
  },
  {
    id: 'royal-blue',
    name: 'Royal Blue (Sapphire)',
    gradient: 'from-slate-950 via-blue-700 to-indigo-800',
    border: 'border-blue-400/50',
  },
  {
    id: 'custom',
    name: 'Custom Colors',
    gradient: 'from-slate-800 to-slate-900',
    border: 'border-slate-600',
  },
];

const ICONS = [
  { id: 'truck', label: 'Truck', icon: Truck },
  { id: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { id: 'flame', label: 'Flame', icon: Flame },
  { id: 'tag', label: 'Discount Tag', icon: Tag },
  { id: 'bell', label: 'Bell Alert', icon: Bell },
  { id: 'info', label: 'Info Notice', icon: Info },
  { id: 'none', label: 'No Icon', icon: null },
];

export default function AnnouncementBarSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', message: '' }
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'

  const [form, setForm] = useState({
    active: true,
    text: '',
    link: '/shop',
    linkText: 'Shop Deals',
    preset: 'neon-purple',
    customBg: '#7c16c9',
    textColor: '#ffffff',
    dismissable: true,
    showInAdmin: false,
    icon: 'truck',
    placement: 'top',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.settings.getNotificationBar();
      if (res.data) {
        setForm((prev) => ({
          ...prev,
          ...res.data,
        }));
      }
    } catch (err) {
      console.error('Failed to fetch announcement settings:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to load announcement bar settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await api.settings.updateNotificationBar(form);
      setFeedback({
        type: 'success',
        message: res.message || 'Announcement bar settings saved successfully!',
      });
      // Clear dismissal key so updated message shows up immediately
      sessionStorage.clear();
    } catch (err) {
      console.error('Save failed:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to save announcement bar settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm({
      active: true,
      text: '🚚 Free shipping on orders over Rs 150! | Summer Sale Active Now!',
      link: '/shop',
      linkText: 'Shop Deals',
      preset: 'neon-purple',
      customBg: '#7c16c9',
      textColor: '#ffffff',
      dismissable: true,
      showInAdmin: false,
      icon: 'truck',
      placement: 'top',
    });
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-[400px]" />;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg dark:shadow-neon-purple/20">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Announcement Bar Settings
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Manage top announcement banner text, active visibility status, links, and storefront styling.
              </p>
            </div>
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
            Save Settings
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

      {/* Live Real-time Storefront Preview Card */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200/50 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-600 dark:text-neon-purple" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Live Real-Time Store Preview
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition ${
                  previewDevice === 'desktop'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-neon-purple shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-4 h-4" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition ${
                  previewDevice === 'mobile'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-neon-purple shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                form.active
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {form.active ? '● Banner ON' : '○ Banner OFF'}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-slate-950 text-slate-100 rounded-b-2xl flex justify-center">
          <div
            className={`w-full transition-all duration-300 border border-slate-800 rounded-xl overflow-hidden shadow-2xl bg-[#08050f] ${
              previewDevice === 'mobile' ? 'max-w-sm' : 'max-w-full'
            }`}
          >
            {/* Browser / Device Top Bar */}
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 font-mono text-[11px] text-slate-400 truncate">
                  quickturn.com/
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {form.active ? 'Visible' : 'Hidden'}
              </span>
            </div>

            {/* Simulated Store Layout */}
            <div>
              {form.active ? (
                <AnnouncementBar settings={form} />
              ) : (
                <div className="px-4 py-2.5 bg-slate-900/90 border-b border-dashed border-slate-800 text-slate-400 text-xs italic text-center">
                  🚫 Announcement Bar is currently turned OFF (Hidden from store visitors)
                </div>
              )}

              {/* Simulated Store Navbar Header */}
              <div className="p-3 sm:p-4 bg-[#08050f] border-b border-purple-900/30 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2 font-bold text-white">
                  <span className="text-neon-purple">QT</span> QUICKTURN STORE
                </div>
                <div className="hidden sm:flex gap-3 text-slate-400 text-[11px]">
                  <span>Consoles</span>
                  <span>Games</span>
                  <span>Repairs</span>
                  <span>Trade-in</span>
                </div>
              </div>

              <div className="p-6 sm:p-8 text-center bg-gradient-to-b from-transparent to-[#08050f]">
                <p className="text-xs text-slate-400 font-mono">
                  [ Storefront Page Content Section ]
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basic & Content Settings (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Status & Message Editor */}
          <div className="glass-card p-5 sm:p-6 space-y-6">
            <div className="flex items-center justify-between gap-4 pb-5 border-b border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-neon-purple">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white">Announcement Status</h3>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        form.active
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {form.active ? 'ON / ACTIVE' : 'OFF / DISABLED'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Toggle to show or hide the announcement bar on top of the store.
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
                <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:peer-focus:ring-neon-purple peer-checked:bg-purple-600 dark:peer-checked:bg-neon-purple shadow-inner" />
              </label>
            </div>

            {/* Announcement Message Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Announcement Text / Message *
                </label>
                <span className="text-xs text-slate-400">{form.text?.length || 0} chars</span>
              </div>
              <textarea
                rows={3}
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="Type your store announcement message here..."
                className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white"
              />
            </div>

            {/* Quick Text Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Quick Text Templates (Click to fill):
              </label>
              <div className="flex flex-wrap gap-2">
                {QUICK_TEXT_PRESETS.map((presetText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setForm({ ...form, text: presetText })}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-neon-purple/20 hover:text-purple-700 dark:hover:text-neon-purple transition text-left border border-slate-200/60 dark:border-slate-700/60"
                  >
                    {presetText.slice(0, 42)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Action Link & Button */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Action Link URL / Path
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    placeholder="e.g. /shop or https://..."
                    className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white pr-8"
                  />
                  <ExternalLink className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
                <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-400">
                  <span>Quick paths:</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, link: '/shop' })}
                    className="hover:text-purple-500 underline"
                  >
                    /shop
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, link: '/shop?flashSale=true' })}
                    className="hover:text-purple-500 underline"
                  >
                    /flash-sale
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, link: '/sell' })}
                    className="hover:text-purple-500 underline"
                  >
                    /sell
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, link: '/repair' })}
                    className="hover:text-purple-500 underline"
                  >
                    /repair
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Action Button Label
                </label>
                <input
                  type="text"
                  value={form.linkText}
                  onChange={(e) => setForm({ ...form, linkText: e.target.value })}
                  placeholder="e.g. Shop Deals, Claim Offer"
                  className="input-field dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Icon Selector Card */}
          <div className="glass-card p-5 sm:p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-neon-purple" />
              Select Announcement Icon
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {ICONS.map((item) => {
                const IconComp = item.icon;
                const isSelected = form.icon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setForm({ ...form, icon: item.id })}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'border-purple-600 dark:border-neon-purple bg-purple-50 dark:bg-neon-purple/20 text-purple-700 dark:text-neon-purple shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {IconComp ? <IconComp className="w-5 h-5" /> : <span className="text-xs font-bold">—</span>}
                    <span className="text-[11px] font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Theme & Behavior Options (1 col) */}
        <div className="space-y-6">
          {/* Visual Theme Presets */}
          <div className="glass-card p-5 sm:p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-600 dark:text-neon-purple" />
              Theme & Style Preset
            </h3>

            <div className="space-y-2.5">
              {PRESET_THEMES.map((theme) => {
                const isSelected = form.preset === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setForm({ ...form, preset: theme.id })}
                    className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-purple-600 dark:border-neon-purple ring-2 ring-purple-500/20 bg-slate-50 dark:bg-slate-800/80'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${theme.gradient} border ${theme.border} shrink-0 shadow-sm`} />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {theme.name}
                      </span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-neon-purple shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Color Inputs */}
            {form.preset === 'custom' && (
              <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50 space-y-3 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.customBg}
                      onChange={(e) => setForm({ ...form, customBg: e.target.value })}
                      className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
                    />
                    <input
                      type="text"
                      value={form.customBg}
                      onChange={(e) => setForm({ ...form, customBg: e.target.value })}
                      className="input-field font-mono text-xs dark:bg-slate-950"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.textColor}
                      onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                      className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
                    />
                    <input
                      type="text"
                      value={form.textColor}
                      onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                      className="input-field font-mono text-xs dark:bg-slate-950"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Visibility & Behavior Options */}
          <div className="glass-card p-5 sm:p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white">Customer Behavior</h3>

            <div className="space-y-4">
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Allow Customer Dismissal
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Displays an 'X' button so customers can close the bar during their session.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={form.dismissable}
                  onChange={(e) => setForm({ ...form, dismissable: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
