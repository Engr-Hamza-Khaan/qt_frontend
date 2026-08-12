import { useState, useEffect, useRef } from 'react';
import {
  ScrollText,
  X,
  Search,
  CheckCircle,
  Copy,
  Printer,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { storeApi } from '../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { getWhatsAppUrl, WHATSAPP_DISPLAY } from '../config/contact';

const FALLBACK_TERMS = {
  title: 'Terms & Conditions',
  subtitle: 'Please review the policies governing purchases, console repairs, trade-ins, and services at Quickturn.',
  lastUpdated: 'August 2026',
  bannerBadge: 'Quickturn Gaming Policies',
  sections: [
    {
      id: 'acceptance',
      heading: '1. Acceptance of Agreement',
      content: 'By accessing our website, browsing products, submitting orders, or requesting console repair and trade-in services, you agree to comply with and be bound by these Terms and Conditions along with our privacy policies.'
    },
    {
      id: 'orders_payments',
      heading: '2. Orders, Pricing & Payment Methods',
      content: 'All product prices are quoted in PKR (Pakistani Rupee) and are subject to change without prior notice. We accept Cash on Delivery (COD) and direct Bank Transfers. Orders are subject to item availability and confirmation. Quickturn reserves the right to decline or cancel orders due to pricing errors or inventory discrepancies.'
    },
    {
      id: 'shipping_delivery',
      heading: '3. Shipping, Delivery & Tracking',
      content: 'We provide nationwide delivery across Pakistan through reliable courier services. Orders are typically processed and delivered within 2-4 business days. Real-time tracking information is communicated once the consignment is dispatched. Customers must inspect packages upon arrival and notify us immediately of any transit damage.'
    },
    {
      id: 'repair_services',
      heading: '4. Console Repair & Diagnostic Services',
      content: 'Consoles and accessories submitted for repair undergo preliminary diagnostics. Pre-existing issues, prior unauthorized repairs, or liquid damage must be disclosed beforehand. We offer a 30-day service warranty on components replaced during repair. Damages caused by electrical surges, misuse, or tampering after repair are excluded from warranty.'
    },
    {
      id: 'sell_tradein',
      heading: '5. Sell & Trade-in Policy',
      content: 'Valuations provided through our online estimation form are provisional. The final trade-in value or cash payout is confirmed after technical inspection and grading at our facility. All trade-in devices must belong to the seller and must not be blacklisted, iCloud-locked, or reported lost/stolen.'
    },
    {
      id: 'warranty_returns',
      heading: '6. Warranty, Replacements & Returns',
      content: 'Brand new hardware items include standard official warranty coverage or a 7-day initial replacement warranty for manufacturing defects. Pre-owned items include a 7-day checking warranty. Items must be returned in their original packaging with all included accessories. Physical damage or water intrusion voids warranty.'
    },
    {
      id: 'custom_3d',
      heading: '7. Custom 3D Figures & Bespoke Mods',
      content: 'Custom 3D figures and personalized modding requests are built to individual specifications. Production begins following order confirmation and upfront deposit. Because these are custom-made items, orders cannot be cancelled or refunded once production has begun.'
    },
    {
      id: 'liability',
      heading: '8. Limitation of Liability',
      content: 'Quickturn shall not be held liable for indirect, incidental, or consequential damages resulting from product misuse, ungrounded household power issues, or third-party courier delays.'
    }
  ],
  contactEmail: 'info@quickturn.pk',
  contactPhone: '+92 300 1234567',
  contactAddress: 'Karachi, Sindh, Pakistan'
};

/**
 * Helper function to trigger opening the Terms & Conditions modal from anywhere
 */
export function openTermsModal(options = {}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-terms-modal', { detail: options }));
  }
}

export default function TermsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [termsData, setTermsData] = useState(FALLBACK_TERMS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [onAcceptCallback, setOnAcceptCallback] = useState(null);
  const contentRef = useRef(null);

  // Listen for global open-terms-modal event
  useEffect(() => {
    const handleOpen = (e) => {
      setIsOpen(true);
      if (e?.detail?.onAccept && typeof e.detail.onAccept === 'function') {
        setOnAcceptCallback(() => e.detail.onAccept);
      } else {
        setOnAcceptCallback(null);
      }
    };

    window.addEventListener('open-terms-modal', handleOpen);
    return () => window.removeEventListener('open-terms-modal', handleOpen);
  }, []);

  // Fetch updated terms data when modal is open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadTerms = async () => {
      try {
        setLoading(true);
        const res = await storeApi.getTermsAndConditions();
        if (isMounted && res?.data) {
          setTermsData({
            ...FALLBACK_TERMS,
            ...res.data,
            sections: Array.isArray(res.data.sections) && res.data.sections.length > 0
              ? res.data.sections
              : FALLBACK_TERMS.sections,
          });
        }
      } catch (err) {
        console.warn('Using default Terms & Conditions data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadTerms();

    // Prevent body background scrolling when modal is open
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isMounted = false;
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleAccept = () => {
    if (onAcceptCallback) {
      onAcceptCallback();
    }
    handleClose();
  };

  const handleCopyText = () => {
    const allText = [
      termsData.title,
      `Last Updated: ${termsData.lastUpdated}`,
      termsData.subtitle,
      '',
      ...(termsData.sections || []).map((s) => `${s.heading}\n${s.content}\n`),
      `Contact: ${termsData.contactEmail} | ${termsData.contactPhone}`,
    ].join('\n');

    navigator.clipboard.writeText(allText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(`terms-sec-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!isOpen) return null;

  const sections = termsData.sections || [];
  const filteredSections = sections.filter((sec) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (sec.heading && sec.heading.toLowerCase().includes(q)) ||
      (sec.content && sec.content.toLowerCase().includes(q))
    );
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xl animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#090514] border border-neon-purple/30 shadow-[0_0_50px_rgba(124,22,201,0.25)] text-gray-200 overflow-hidden">
        {/* Glow ambient decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-neon-purple/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 p-4 sm:p-6 border-b border-neon-purple/20 bg-gradient-to-r from-purple-950/60 via-[#100824]/80 to-purple-950/60 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center text-neon-purple shadow-lg shadow-purple-900/30 shrink-0">
                <ScrollText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-neon-purple/25 text-neon-purple border border-neon-purple/40">
                    {termsData.bannerBadge || 'Quickturn Gaming Policies'}
                  </span>
                  <span className="text-xs text-gray-400">
                    Last Updated: <strong className="text-gray-300">{termsData.lastUpdated}</strong>
                  </span>
                </div>
                <h2
                  id="terms-modal-title"
                  className="text-lg sm:text-2xl font-bold text-white font-display mt-0.5 tracking-tight"
                >
                  {termsData.title}
                </h2>
              </div>
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleCopyText}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition"
                title="Copy Terms to Clipboard"
                aria-label="Copy Terms"
              >
                {copied ? (
                  <span className="text-xs text-emerald-400 font-bold px-1">Copied!</span>
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="hidden sm:block p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition"
                title="Print Terms"
                aria-label="Print Terms"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subtitle & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-xl">
              {termsData.subtitle}
            </p>

            {/* Instant Filter / Search input */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search within terms (e.g. repair, COD)..."
                className="w-full text-xs pl-8 pr-7 py-2 rounded-xl bg-black/50 border border-neon-purple/25 text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-white text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Quick jump navigation chips */}
          {!searchQuery && sections.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <span className="text-gray-400 font-semibold shrink-0 mr-1">Jump to:</span>
              {sections.map((sec, idx) => {
                const shortLabel = sec.heading.replace(/^\d+\.\s*/, '');
                return (
                  <button
                    key={sec.id || idx}
                    type="button"
                    onClick={() => scrollToSection(sec.id || idx)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 hover:border-neon-purple/50 hover:bg-neon-purple/15 text-gray-300 hover:text-white transition whitespace-nowrap shrink-0 font-medium"
                  >
                    {shortLabel}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Scrollable Content Body */}
        <div
          ref={contentRef}
          className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-sm scroll-smooth"
        >
          {loading && (
            <div className="flex items-center justify-center py-6">
              <LoadingSpinner size="md" />
            </div>
          )}

          {filteredSections.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-neon-purple/20 text-gray-400">
              <ScrollText className="w-8 h-8 mx-auto mb-2 text-neon-purple/50" />
              <p className="font-semibold text-white">No matching policy sections found</p>
              <p className="text-xs text-gray-400 mt-1">
                Try searching for a different keyword or clear the search filter.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-3 px-3 py-1.5 rounded-lg text-xs font-bold bg-neon-purple/20 text-neon-purple hover:bg-neon-purple/30 transition"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            filteredSections.map((sec, idx) => (
              <div
                key={sec.id || idx}
                id={`terms-sec-${sec.id || idx}`}
                className="p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-neon-purple/15 hover:border-neon-purple/35 transition space-y-2 group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-neon-purple shadow-[0_0_8px_#7c16c9]" />
                  <h3 className="text-sm sm:text-base font-bold text-white font-display tracking-tight">
                    {sec.heading}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-300/90 leading-relaxed pl-4.5 whitespace-pre-line">
                  {sec.content}
                </p>
              </div>
            ))
          )}

          {/* Support & Contact Details in Modal */}
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-black/60 to-purple-950/30 border border-neon-purple/20 text-xs text-gray-400 space-y-3 mt-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-neon-purple" />
              <h4 className="font-bold text-white text-sm font-display">
                Questions or Policy Clarification?
              </h4>
            </div>
            <p className="text-gray-400 leading-relaxed">
              If you have any questions regarding these terms, product warranties, repair requests, or trade-in valuations, feel free to contact our customer support team:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
              {termsData.contactEmail && (
                <a
                  href={`mailto:${termsData.contactEmail}`}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/10 hover:border-neon-purple/40 text-gray-300 hover:text-neon-purple transition"
                >
                  <Mail className="w-3.5 h-3.5 text-neon-purple shrink-0" />
                  <span className="truncate">{termsData.contactEmail}</span>
                </a>
              )}
              {termsData.contactPhone && (
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/10 hover:border-neon-purple/40 text-gray-300 hover:text-neon-purple transition"
                >
                  <Phone className="w-3.5 h-3.5 text-neon-purple shrink-0" />
                  <span>{termsData.contactPhone || WHATSAPP_DISPLAY}</span>
                </a>
              )}
              {termsData.contactAddress && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/10 text-gray-300">
                  <MapPin className="w-3.5 h-3.5 text-neon-purple shrink-0" />
                  <span className="truncate">{termsData.contactAddress}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Action Bar */}
        <div className="relative z-10 p-3 sm:p-4 border-t border-neon-purple/20 bg-[#090514] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>By proceeding with transactions on Quickturn, you accept these terms.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#7c16c9] to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(124,22,201,0.4)] transition"
            >
              I Understand &amp; Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
