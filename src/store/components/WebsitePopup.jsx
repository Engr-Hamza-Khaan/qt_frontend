import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Sparkles,
  Tag,
  Copy,
  Check,
  ArrowRight,
  Gift,
  Clock,
  Send,
  ShoppingBag,
} from 'lucide-react';
import { storeApi } from '../api';

const THEME_STYLES = {
  'neon-purple': {
    wrapper:
      'bg-slate-950/95 border border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.35)] text-white',
    badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/40',
    primaryBtn:
      'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_25px_rgba(168,85,247,0.5)]',
    accent: 'text-purple-400',
    codeBg: 'bg-purple-950/70 border-purple-500/40 text-purple-200',
    progressBar: 'bg-gradient-to-r from-purple-500 to-fuchsia-500',
  },
  'cyber-flame': {
    wrapper:
      'bg-slate-950/95 border border-rose-500/40 shadow-[0_0_50px_rgba(244,63,94,0.35)] text-white',
    badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
    primaryBtn:
      'bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-[0_0_25px_rgba(244,63,94,0.5)]',
    accent: 'text-rose-400',
    codeBg: 'bg-rose-950/70 border-rose-500/40 text-rose-200',
    progressBar: 'bg-gradient-to-r from-rose-500 to-amber-500',
  },
  'emerald-rush': {
    wrapper:
      'bg-slate-950/95 border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.35)] text-white',
    badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
    primaryBtn:
      'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.5)]',
    accent: 'text-emerald-400',
    codeBg: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200',
    progressBar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  },
  'royal-blue': {
    wrapper:
      'bg-slate-950/95 border border-blue-500/40 shadow-[0_0_50px_rgba(59,130,246,0.35)] text-white',
    badge: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
    primaryBtn:
      'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-[0_0_25px_rgba(59,130,246,0.5)]',
    accent: 'text-blue-400',
    codeBg: 'bg-blue-950/70 border-blue-500/40 text-blue-200',
    progressBar: 'bg-gradient-to-r from-blue-500 to-indigo-500',
  },
  'gold-luxury': {
    wrapper:
      'bg-slate-950/95 border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.35)] text-white',
    badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    primaryBtn:
      'bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-700 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black shadow-[0_0_25px_rgba(245,158,11,0.5)]',
    accent: 'text-amber-400',
    codeBg: 'bg-amber-950/70 border-amber-500/40 text-amber-200',
    progressBar: 'bg-gradient-to-r from-amber-400 to-yellow-500',
  },
  custom: {
    wrapper: 'border shadow-2xl',
    badge: 'bg-white/15 border border-white/20',
    primaryBtn: 'font-bold shadow-lg',
    accent: '',
    codeBg: 'border bg-black/40',
    progressBar: 'bg-white',
  },
};

export default function WebsitePopup({ previewConfig = null }) {
  const navigate = useNavigate();
  const [popupData, setPopupData] = useState(previewConfig);
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [isSuccessState, setIsSuccessState] = useState(false);
  const [copied, setCopied] = useState(false);
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);

  const autoCloseTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const triggerTimeoutRef = useRef(null);

  // Fetch popup config from backend if not previewing
  useEffect(() => {
    if (previewConfig) {
      setPopupData(previewConfig);
      setIsRendered(true);
      setIsVisible(true);
      setIsSuccessState(false);
      return;
    }

    let isMounted = true;
    const fetchConfig = async () => {
      try {
        const res = await storeApi.getPopup();
        if (isMounted && res.success && res.data) {
          setPopupData(res.data);
        }
      } catch (err) {
        console.error('Failed to load popup configuration:', err);
      }
    };

    fetchConfig();
    return () => {
      isMounted = false;
    };
  }, [previewConfig]);

  // Main Display and Trigger Logic
  useEffect(() => {
    if (previewConfig) return; // Preview handled separately
    if (!popupData || !popupData.active) {
      setIsVisible(false);
      setIsRendered(false);
      return;
    }

    // Check frequency limitations
    const seenKey = 'qt_website_popup_seen';
    const seenTimestampKey = 'qt_website_popup_seen_time';
    const freq = popupData.frequency || 'once_per_session';

    if (freq === 'once_per_session') {
      if (sessionStorage.getItem(seenKey) === 'true') return;
    } else if (freq === 'once_per_day') {
      const lastSeen = localStorage.getItem(seenTimestampKey);
      if (lastSeen) {
        const hoursAgo = (Date.now() - parseInt(lastSeen, 10)) / (1000 * 60 * 60);
        if (hoursAgo < 24) return;
      }
    }

    const openPopup = () => {
      setIsRendered(true);
      setTimeout(() => setIsVisible(true), 50);

      // Record frequency flag
      if (freq === 'once_per_session') {
        sessionStorage.setItem(seenKey, 'true');
      } else if (freq === 'once_per_day') {
        localStorage.setItem(seenTimestampKey, String(Date.now()));
      }
    };

    const triggerType = popupData.triggerType || 'delay';

    if (triggerType === 'immediate') {
      openPopup();
    } else if (triggerType === 'delay') {
      const delay = Math.max(0, parseInt(popupData.delaySeconds, 10) || 4) * 1000;
      triggerTimeoutRef.current = setTimeout(openPopup, delay);
    } else if (triggerType === 'scroll') {
      const targetPercent = Math.min(100, Math.max(5, parseInt(popupData.scrollPercentage, 10) || 30));
      const handleScroll = () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight <= 0) return;
        const currentPercent = (window.scrollY / scrollHeight) * 100;
        if (currentPercent >= targetPercent) {
          openPopup();
          window.removeEventListener('scroll', handleScroll);
        }
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    } else if (triggerType === 'exit_intent') {
      const handleMouseLeave = (e) => {
        if (e.clientY <= 15) {
          openPopup();
          document.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
      document.addEventListener('mouseleave', handleMouseLeave);

      // Mobile fallback timer since mouseleave doesn't trigger on touchscreens
      const mobileFallback = setTimeout(() => {
        if (window.innerWidth < 768) {
          openPopup();
          document.removeEventListener('mouseleave', handleMouseLeave);
        }
      }, 10000);

      return () => {
        document.removeEventListener('mouseleave', handleMouseLeave);
        clearTimeout(mobileFallback);
      };
    }

    return () => {
      if (triggerTimeoutRef.current) clearTimeout(triggerTimeoutRef.current);
    };
  }, [popupData, previewConfig]);

  // Handle Auto-close duration timer
  useEffect(() => {
    if (!isVisible || !popupData) return;

    if (popupData.autoClose && popupData.autoCloseSeconds > 0) {
      const totalSec = parseInt(popupData.autoCloseSeconds, 10);
      setTimeRemaining(totalSec);

      countdownIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      autoCloseTimerRef.current = setTimeout(() => {
        handleClose();
      }, totalSec * 1000);
    }

    return () => {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isVisible, popupData]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsRendered(false);
      setIsSuccessState(false);
      setTimeRemaining(null);
    }, 300);
  };

  const handleCopyCode = async () => {
    const code = popupData?.couponCode || '';
    if (code) {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch {
        // clipboard fallback
      }
    }
  };

  const handlePrimaryAction = async () => {
    const actionType = popupData?.actionType || 'copy_coupon';

    if (actionType === 'copy_coupon') {
      await handleCopyCode();
      setIsSuccessState(true);
    } else if (actionType === 'redirect') {
      handleClose();
      const link = popupData?.buttonLink || '/shop';
      if (link.startsWith('http://') || link.startsWith('https://')) {
        window.open(link, '_blank');
      } else {
        navigate(link);
      }
    } else if (actionType === 'custom_success') {
      setIsSuccessState(true);
    }
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!subscriberEmail.trim()) return;

    setSubmittingLead(true);
    try {
      await storeApi.submitPopupLead({ email: subscriberEmail });
      await handleCopyCode();
      setIsSuccessState(true);
    } catch (err) {
      console.error('Lead submission notice:', err);
      // still advance to success with code so user is satisfied
      setIsSuccessState(true);
    } finally {
      setSubmittingLead(false);
    }
  };

  if (!isRendered && !previewConfig) return null;
  if (!popupData) return null;

  const theme = THEME_STYLES[popupData.presetTheme] || THEME_STYLES['neon-purple'];
  const isCustom = popupData.presetTheme === 'custom';

  const customStyle = isCustom
    ? {
        backgroundColor: popupData.customBg || '#120d24',
        color: popupData.textColor || '#ffffff',
        borderColor: popupData.accentColor || '#a855f7',
      }
    : {};

  const customBtnStyle = isCustom
    ? {
        backgroundColor: popupData.accentColor || '#a855f7',
        color: popupData.textColor || '#ffffff',
      }
    : {};

  const positionClass =
    popupData.position === 'bottom-right'
      ? 'items-end justify-end p-4 sm:p-6'
      : popupData.position === 'bottom-left'
      ? 'items-end justify-start p-4 sm:p-6'
      : 'items-center justify-center p-4';

  const animationClass =
    popupData.animation === 'slide-up'
      ? isVisible
        ? 'translate-y-0 opacity-100'
        : 'translate-y-16 opacity-0'
      : popupData.animation === 'fade-in'
      ? isVisible
        ? 'opacity-100 scale-100'
        : 'opacity-0 scale-100'
      : isVisible
      ? 'scale-100 opacity-100'
      : 'scale-95 opacity-0';

  const totalAutoSeconds = parseInt(popupData.autoCloseSeconds, 10) || 15;
  const progressPercent =
    timeRemaining !== null && popupData.autoClose
      ? (timeRemaining / totalAutoSeconds) * 100
      : 100;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex ${positionClass} transition-opacity duration-300 pointer-events-none ${
        popupData.position === 'center' ? 'bg-black/60 backdrop-blur-sm' : ''
      } ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`}
      onClick={(e) => {
        if (e.target === e.currentTarget && popupData.position === 'center') {
          handleClose();
        }
      }}
    >
      <div
        style={customStyle}
        className={`relative w-full max-w-lg rounded-3xl overflow-hidden backdrop-blur-2xl transition-all duration-300 shadow-2xl pointer-events-auto ${theme.wrapper} ${animationClass}`}
      >
        {/* Auto close progress indicator bar */}
        {popupData.autoClose && timeRemaining !== null && (
          <div className="absolute top-0 inset-x-0 h-1 bg-white/10 z-20 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${theme.progressBar}`}
              style={{
                width: `${progressPercent}%`,
                ...(isCustom ? { backgroundColor: popupData.accentColor } : {}),
              }}
            />
          </div>
        )}

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close popup"
          className="absolute top-3.5 right-3.5 z-30 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-all backdrop-blur-md border border-white/10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Optional Auto-close timer indicator badge */}
        {popupData.autoClose && timeRemaining !== null && (
          <div className="absolute top-3.5 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/40 border border-white/10 backdrop-blur-md text-white/70">
            <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>Closes in {timeRemaining}s</span>
          </div>
        )}

        {/* Optional Visual Banner Header Image */}
        {popupData.imageUrl && !isSuccessState && (
          <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-900">
            <img
              src={popupData.imageUrl}
              alt={popupData.title || 'Promotional Offer'}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            {popupData.badge && (
              <div className="absolute bottom-3 left-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md ${theme.badge}`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {popupData.badge}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-5">
          {!isSuccessState ? (
            /* ================= INITIAL POPUP OFFER STATE ================= */
            <>
              {/* Badge if no image */}
              {!popupData.imageUrl && popupData.badge && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md mb-1 border">
                  <Sparkles className="w-3.5 h-3.5" />
                  {popupData.badge}
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug text-white">
                  {popupData.title || 'Special Exclusive Offer'}
                </h3>
                {popupData.subtitle && (
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {popupData.subtitle}
                  </p>
                )}
              </div>

              {/* Coupon Code Pill */}
              {popupData.couponCode && popupData.actionType !== 'newsletter' && (
                <div
                  className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 border ${theme.codeBg}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Tag className="w-4 h-4 shrink-0 opacity-80" />
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                        Promo Code
                      </div>
                      <div className="text-sm sm:text-base font-mono font-extrabold tracking-widest text-white">
                        {popupData.couponCode}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 border border-white/20"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Newsletter Email Capture Form (if actionType is newsletter) */}
              {popupData.actionType === 'newsletter' ? (
                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="Enter your email to unlock offer..."
                      value={subscriberEmail}
                      onChange={(e) => setSubscriberEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-white/50 backdrop-blur-md"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingLead}
                    style={customBtnStyle}
                    className={`w-full py-3 px-6 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer ${theme.primaryBtn}`}
                  >
                    <Send className="w-4 h-4" />
                    {submittingLead
                      ? 'Unlocking...'
                      : popupData.buttonText || 'Unlock Discount'}
                  </button>
                </form>
              ) : (
                /* Primary Action Button */
                <button
                  type="button"
                  onClick={handlePrimaryAction}
                  style={customBtnStyle}
                  className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer ${theme.primaryBtn}`}
                >
                  <Gift className="w-4 h-4" />
                  {popupData.buttonText || 'Claim Deal Now'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Secondary Dismissal Link */}
              {popupData.secondaryButtonText && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-xs text-slate-400 hover:text-white transition-colors underline-offset-4 hover:underline"
                  >
                    {popupData.secondaryButtonText}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* ================= VISITOR SUCCESS FEEDBACK STATE ================= */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 animate-bounce">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xl sm:text-2xl font-black text-white">
                  {popupData.successTitle || '🎉 Success! Code Ready!'}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto">
                  {popupData.successMessage ||
                    `Code ${popupData.couponCode} has been copied to your clipboard. Apply it at checkout for instant savings!`}
                </p>
              </div>

              {/* Code Display */}
              {popupData.couponCode && (
                <div
                  onClick={handleCopyCode}
                  className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/15 transition active:scale-95"
                >
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    Code:
                  </span>
                  <span className="font-mono font-black text-base text-emerald-400 tracking-wider">
                    {popupData.couponCode}
                  </span>
                  <Copy className="w-3.5 h-3.5 text-slate-400 ml-1" />
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    const link =
                      popupData.successButtonLink ||
                      popupData.buttonLink ||
                      '/shop';
                    if (link.startsWith('http://') || link.startsWith('https://')) {
                      window.open(link, '_blank');
                    } else {
                      navigate(link);
                    }
                  }}
                  style={customBtnStyle}
                  className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${theme.primaryBtn}`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {popupData.successButtonText || 'Start Shopping Deals'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
