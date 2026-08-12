import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Sparkles, Flame, Tag, Bell, Info, X, ArrowRight } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { api } from '../../api/client';

const ICON_MAP = {
  truck: Truck,
  sparkles: Sparkles,
  flame: Flame,
  tag: Tag,
  bell: Bell,
  info: Info,
};

const PRESET_STYLES = {
  'neon-purple': {
    wrapper: 'bg-gradient-to-r from-purple-950 via-[#7c16c9] to-purple-950 border-b border-neon-purple/40 text-white shadow-[0_4px_25px_rgba(176,38,255,0.3)]',
    badge: 'bg-white/15 text-purple-200 border border-white/20',
    btn: 'bg-white text-purple-950 hover:bg-purple-100 shadow-[0_0_15px_rgba(255,255,255,0.4)]',
  },
  'cyber-flame': {
    wrapper: 'bg-gradient-to-r from-rose-950 via-red-600 to-amber-700 border-b border-rose-500/40 text-white shadow-[0_4px_25px_rgba(225,29,72,0.3)]',
    badge: 'bg-white/15 text-rose-100 border border-white/20',
    btn: 'bg-white text-rose-950 hover:bg-rose-100 shadow-[0_0_15px_rgba(255,255,255,0.4)]',
  },
  'emerald-rush': {
    wrapper: 'bg-gradient-to-r from-emerald-950 via-emerald-700 to-teal-800 border-b border-emerald-400/40 text-white shadow-[0_4px_25px_rgba(16,185,129,0.3)]',
    badge: 'bg-white/15 text-emerald-100 border border-white/20',
    btn: 'bg-white text-emerald-950 hover:bg-emerald-100 shadow-[0_0_15px_rgba(255,255,255,0.4)]',
  },
  'royal-blue': {
    wrapper: 'bg-gradient-to-r from-slate-950 via-blue-700 to-indigo-800 border-b border-blue-400/40 text-white shadow-[0_4px_25px_rgba(59,130,246,0.3)]',
    badge: 'bg-white/15 text-blue-100 border border-white/20',
    btn: 'bg-white text-blue-950 hover:bg-blue-100 shadow-[0_0_15px_rgba(255,255,255,0.4)]',
  },
};

export default function AnnouncementBar({ settings: propsSettings, className = '' }) {
  // If propsSettings is not provided, fetch from backend API
  const { data: fetchedData, loading } = useFetch(
    propsSettings ? null : () => api.settings.getNotificationBar()
  );

  const barData = propsSettings || fetchedData?.data;
  const [dismissed, setDismissed] = useState(false);

  const active = barData ? (barData.active ?? true) : false;
  const text = barData?.text || '';
  const link = barData?.link || '';
  const linkText = barData?.linkText || '';
  const preset = barData?.preset || 'neon-purple';
  const customBg = barData?.customBg || '#7c16c9';
  const textColor = barData?.textColor || '#ffffff';
  const dismissable = barData?.dismissable ?? true;
  const iconKey = barData?.icon || 'truck';

  // Session dismissal check (per text hash)
  useEffect(() => {
    if (!text) return;
    const dismissedKey = `qt_announcement_dismissed_${text.length}_${text.slice(0, 10)}`;
    if (sessionStorage.getItem(dismissedKey) === 'true') {
      setDismissed(true);
    } else {
      setDismissed(false);
    }
  }, [text]);

  const handleDismiss = () => {
    setDismissed(true);
    if (text) {
      const dismissedKey = `qt_announcement_dismissed_${text.length}_${text.slice(0, 10)}`;
      sessionStorage.setItem(dismissedKey, 'true');
    }
  };

  // If loading without custom props, or not active, or no text, or dismissed
  if (!propsSettings && loading) {
    return null;
  }

  if (!active || !text || (dismissed && !propsSettings)) {
    return null;
  }

  const IconComponent = ICON_MAP[iconKey] || Truck;
  const presetTheme = PRESET_STYLES[preset];

  const wrapperClass = presetTheme
    ? presetTheme.wrapper
    : 'border-b text-white shadow-md';

  const customStyle = preset === 'custom'
    ? { backgroundColor: customBg, color: textColor, borderColor: 'rgba(255,255,255,0.2)' }
    : {};

  const isExternalLink = link.startsWith('http://') || link.startsWith('https://');

  return (
    <div
      className={`relative z-[110] transition-all duration-300 ${wrapperClass} ${className}`}
      style={customStyle}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-center relative text-xs sm:text-sm font-medium">
        <div className="flex items-center justify-center flex-wrap gap-2 text-center min-w-0 px-6">
          {iconKey !== 'none' && IconComponent && (
            <span className={`inline-flex items-center justify-center p-1 rounded-full shrink-0 ${presetTheme?.badge || 'bg-white/20'}`}>
              <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
            </span>
          )}

          <span className="truncate max-w-[85vw] sm:max-w-none">{text}</span>

          {link && (
            isExternalLink ? (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 px-3 py-1 text-[11px] sm:text-xs font-bold rounded-full transition-all shrink-0 ${presetTheme?.btn || 'bg-white text-black hover:bg-gray-100'}`}
              >
                {linkText || 'Learn More'}
                <ArrowRight className="w-3 h-3" />
              </a>
            ) : (
              <Link
                to={link}
                className={`inline-flex items-center gap-1 px-3 py-1 text-[11px] sm:text-xs font-bold rounded-full transition-all shrink-0 ${presetTheme?.btn || 'bg-white text-black hover:bg-gray-100'}`}
              >
                {linkText || 'Learn More'}
                <ArrowRight className="w-3 h-3" />
              </Link>
            )
          )}
        </div>

        {dismissable && (
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss announcement"
            className="absolute right-4 sm:right-6 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
