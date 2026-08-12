import { useState, useEffect } from 'react';
import {
  ScrollText,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Search,
  FileText,
  Mail,
  Phone,
  MapPin,
  HelpCircle,
  Copy,
  ExternalLink,
  Smartphone,
  Monitor,
  X,
} from 'lucide-react';
import { api } from '../../api/client';
import LoadingSpinner from '../ui/LoadingSpinner';

const PRESETS = [
  {
    id: 'standard',
    name: '🎮 Standard Gaming & Repair Store',
    description: 'Comprehensive policy covering console sales, repairs, trade-ins, and accessories.',
    data: {
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
    }
  },
  {
    id: 'warranty_focused',
    name: '🛡️ Warranty & Verification Focus',
    description: 'Strict return policies, detailed checking warranty rules, and anti-fraud terms.',
    data: {
      title: 'Store Terms & Warranty Policy',
      subtitle: 'Official customer agreement detailing testing protocols, warranty limitations, and repair terms.',
      lastUpdated: 'August 2026',
      bannerBadge: 'Verified Hardware Protection',
      sections: [
        {
          id: 'acceptance',
          heading: '1. User Agreement & Verification',
          content: 'Placing an order or requesting service constitutes legally binding acceptance of all testing, delivery, and warranty policies established by Quickturn.'
        },
        {
          id: 'checking_warranty',
          heading: '2. 7-Day Checking Warranty Protocols',
          content: 'All pre-owned gaming consoles and controllers undergo multi-stage quality testing. Customers are granted a 7-day checking window upon receiving the package. Security void seals must remain intact. Any tampering, seal breakage, or voltage surge damages will void eligibility.'
        },
        {
          id: 'repair_terms',
          heading: '3. Technical Repairs & Diagnostics',
          content: 'Diagnostic fees are non-refundable. Component replacements include a 30-day parts warranty. Devices not collected within 45 days after repair completion may incur holding fees.'
        },
        {
          id: 'payouts',
          heading: '4. Trade-in Payments & Proof of Purchase',
          content: 'Sellers must present a valid CNIC copy and verify original ownership before receiving cash or bank payouts for trade-in items.'
        }
      ],
      contactEmail: 'support@quickturn.pk',
      contactPhone: '+92 300 1234567',
      contactAddress: 'Karachi, Sindh, Pakistan'
    }
  }
];

export default function TermsSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [sectionFilter, setSectionFilter] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop');

  const [form, setForm] = useState({
    title: 'Terms & Conditions',
    subtitle: 'Please review the policies governing purchases, console repairs, trade-ins, and services at Quickturn.',
    lastUpdated: 'August 2026',
    bannerBadge: 'Quickturn Gaming Policies',
    sections: [],
    contactEmail: 'info@quickturn.pk',
    contactPhone: '+92 300 1234567',
    contactAddress: 'Karachi, Sindh, Pakistan',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.settings.getTermsAndConditions();
      if (res.data) {
        setForm((prev) => ({
          ...prev,
          ...res.data,
          sections: Array.isArray(res.data.sections) ? res.data.sections : prev.sections,
        }));
      }
    } catch (err) {
      console.error('Failed to fetch terms settings:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to load Terms & Conditions settings.',
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
      const res = await api.settings.updateTermsAndConditions(form);
      setFeedback({
        type: 'success',
        message: res.message || 'Terms & Conditions saved and published successfully!',
      });
    } catch (err) {
      console.error('Save failed:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to save Terms & Conditions.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleApplyPreset = (preset) => {
    if (
      window.confirm(
        `Load "${preset.name}" preset? This will overwrite the current form content.`
      )
    ) {
      setForm({ ...preset.data });
      setFeedback({
        type: 'success',
        message: `Applied "${preset.name}" preset. Remember to click "Save Changes" to publish.`,
      });
    }
  };

  const handleAddSection = () => {
    const nextNumber = form.sections.length + 1;
    const newSection = {
      id: `section_${Date.now()}`,
      heading: `${nextNumber}. New Policy Section`,
      content: 'Write policy details, requirements, conditions, and specifications here.',
    };
    setForm((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  const handleRemoveSection = (index) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, idx) => idx !== index),
    }));
  };

  const handleUpdateSection = (index, field, value) => {
    setForm((prev) => {
      const newSections = [...prev.sections];
      newSections[index] = {
        ...newSections[index],
        [field]: value,
      };
      return { ...prev, sections: newSections };
    });
  };

  const handleMoveSection = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= form.sections.length) return;

    setForm((prev) => {
      const newSections = [...prev.sections];
      const item = newSections[index];
      newSections.splice(index, 1);
      newSections.splice(targetIndex, 0, item);
      return { ...prev, sections: newSections };
    });
  };

  const handleDuplicateSection = (index) => {
    const item = form.sections[index];
    const duplicated = {
      ...item,
      id: `section_${Date.now()}`,
      heading: `${item.heading} (Copy)`,
    };
    setForm((prev) => {
      const newSections = [...prev.sections];
      newSections.splice(index + 1, 0, duplicated);
      return { ...prev, sections: newSections };
    });
  };

  const filteredSections = form.sections.filter((sec) => {
    if (!sectionFilter.trim()) return true;
    const query = sectionFilter.toLowerCase();
    return (
      (sec.heading && sec.heading.toLowerCase().includes(query)) ||
      (sec.content && sec.content.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Loading Terms & Conditions configuration...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-4 sm:p-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-purple-600 dark:to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 shrink-0">
            <ScrollText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
                Terms &amp; Conditions
              </h1>
              <span className="bg-purple-100 text-purple-700 dark:bg-neon-purple/20 dark:text-neon-purple text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Interactive Modal
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Edit store terms, repair policies, trade-in rules, and preview the storefront customer modal.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-purple-300 dark:border-neon-purple/40 text-purple-700 dark:text-neon-purple hover:bg-purple-50 dark:hover:bg-neon-purple/15 transition flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>Test Customer Modal</span>
          </button>
          <button
            type="button"
            onClick={fetchSettings}
            disabled={saving}
            className="btn-secondary px-3.5 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5"
            title="Reload from server"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-brand px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-purple-600/30 flex items-center gap-2"
          >
            {saving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
            <span>Save &amp; Publish</span>
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

      {/* Presets Bar */}
      <div className="glass-card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-neon-purple" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Quick Template Presets
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRESETS.map((p) => (
            <div
              key={p.id}
              className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-purple-400 dark:hover:border-neon-purple/50 transition flex items-start justify-between gap-3 group"
            >
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {p.description}
                </p>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-purple-600 dark:text-neon-purple font-medium">
                  <span>{p.data.sections.length} curated sections included</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-100 dark:bg-neon-purple/20 text-purple-700 dark:text-neon-purple hover:bg-purple-200 dark:hover:bg-neon-purple/30 transition shrink-0"
              >
                Apply Preset
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metadata & Contact Info */}
        <div className="space-y-6 lg:col-span-1">
          {/* Header Metadata */}
          <div className="glass-card p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <FileText className="w-4 h-4 text-purple-600 dark:text-neon-purple" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Modal Header Settings
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Modal Main Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-base text-sm w-full"
                placeholder="e.g. Terms & Conditions"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Header Badge Tag
              </label>
              <input
                type="text"
                value={form.bannerBadge}
                onChange={(e) => setForm({ ...form, bannerBadge: e.target.value })}
                className="input-base text-sm w-full"
                placeholder="e.g. Quickturn Gaming Policies"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Last Updated Date
              </label>
              <input
                type="text"
                value={form.lastUpdated}
                onChange={(e) => setForm({ ...form, lastUpdated: e.target.value })}
                className="input-base text-sm w-full"
                placeholder="e.g. August 2026 or 12 Aug 2026"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Introduction / Subtitle
              </label>
              <textarea
                rows={3}
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="input-base text-sm w-full"
                placeholder="Brief summary or introductory statement..."
              />
            </div>
          </div>

          {/* Contact & Support Info */}
          <div className="glass-card p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <Mail className="w-4 h-4 text-purple-600 dark:text-neon-purple" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Support &amp; Legal Inquiries
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Support Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  className="input-base text-sm w-full pl-9"
                  placeholder="info@quickturn.pk"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Support Phone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  className="input-base text-sm w-full pl-9"
                  placeholder="+92 300 1234567"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Registered Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={form.contactAddress}
                  onChange={(e) => setForm({ ...form, contactAddress: e.target.value })}
                  className="input-base text-sm w-full pl-9"
                  placeholder="Karachi, Sindh, Pakistan"
                />
              </div>
            </div>
          </div>

          {/* Quick Tips Box */}
          <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-300 space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-neon-purple" />
              <span>Storefront Modal Integration</span>
            </div>
            <p className="leading-relaxed text-purple-800/80 dark:text-purple-300/80">
              When customers click <strong>Terms &amp; Conditions</strong> anywhere in the store (Sell form, Repair booking, Checkout, or Footer), it dynamically launches this modal with instant search and responsive views.
            </p>
          </div>
        </div>

        {/* Right Column: Sections Editor */}
        <div className="space-y-4 lg:col-span-2">
          <div className="glass-card p-4 sm:p-5">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/60 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Policy Sections</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {form.sections.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Organize policy articles into titled sections for quick scanning by customers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={sectionFilter}
                    onChange={(e) => setSectionFilter(e.target.value)}
                    placeholder="Filter sections..."
                    className="input-base text-xs pl-8 pr-3 py-1.5 w-36 sm:w-44"
                  />
                  {sectionFilter && (
                    <button
                      type="button"
                      onClick={() => setSectionFilter('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="btn-brand px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Section</span>
                </button>
              </div>
            </div>

            {/* Sections List */}
            <div className="mt-4 space-y-4">
              {filteredSections.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">
                    {sectionFilter ? 'No sections match your filter search.' : 'No policy sections added yet.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="mt-3 text-xs font-bold text-purple-600 dark:text-neon-purple hover:underline"
                  >
                    + Add your first policy section
                  </button>
                </div>
              ) : (
                filteredSections.map((sec, idx) => {
                  const originalIndex = form.sections.findIndex((s) => s.id === sec.id);
                  return (
                    <div
                      key={sec.id || idx}
                      className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 shadow-sm space-y-3 transition group hover:border-purple-300 dark:hover:border-neon-purple/40"
                    >
                      {/* Section Card Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                            {originalIndex + 1}
                          </span>
                          <input
                            type="text"
                            value={sec.heading}
                            onChange={(e) =>
                              handleUpdateSection(originalIndex, 'heading', e.target.value)
                            }
                            className="input-base text-sm font-bold flex-1 py-1.5 bg-transparent border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:bg-white dark:focus:bg-slate-900"
                            placeholder="Section Heading..."
                          />
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveSection(originalIndex, -1)}
                            disabled={originalIndex === 0}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                            title="Move Section Up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveSection(originalIndex, 1)}
                            disabled={originalIndex === form.sections.length - 1}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                            title="Move Section Down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateSection(originalIndex)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 dark:hover:text-neon-purple hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Duplicate Section"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSection(originalIndex)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            title="Delete Section"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Section Content */}
                      <div>
                        <textarea
                          rows={4}
                          value={sec.content}
                          onChange={(e) =>
                            handleUpdateSection(originalIndex, 'content', e.target.value)
                          }
                          className="input-base text-xs sm:text-sm w-full leading-relaxed resize-y"
                          placeholder="Policy text content for this section..."
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Add button */}
            {filteredSections.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400">
                  {form.sections.length} total sections configured
                </span>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-dashed border-purple-400 dark:border-neon-purple/50 text-purple-600 dark:text-neon-purple hover:bg-purple-50 dark:hover:bg-neon-purple/10 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Section</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Modal Tester / Live Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0b0816] border border-purple-500/30 shadow-2xl shadow-purple-900/40 text-gray-200 overflow-hidden">
            {/* Modal Top Bar */}
            <div className="p-4 sm:p-5 border-b border-purple-500/20 bg-purple-950/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center text-neon-purple shrink-0">
                  <ScrollText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-neon-purple/25 text-neon-purple border border-neon-purple/30">
                      {form.bannerBadge || 'Quickturn Gaming Policies'}
                    </span>
                    <span className="text-xs text-gray-400">Updated: {form.lastUpdated}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white font-display mt-0.5">
                    {form.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-purple-500/20">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 ${
                      previewDevice === 'desktop' ? 'bg-neon-purple/30 text-white' : 'text-gray-400'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 ${
                      previewDevice === 'mobile' ? 'bg-neon-purple/30 text-white' : 'text-gray-400'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div
              className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 mx-auto w-full transition-all ${
                previewDevice === 'mobile' ? 'max-w-sm border-x border-purple-500/20' : 'max-w-none'
              }`}
            >
              {form.subtitle && (
                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs sm:text-sm text-purple-200 leading-relaxed">
                  {form.subtitle}
                </div>
              )}

              {/* Sections list */}
              <div className="space-y-4">
                {form.sections.map((sec, idx) => (
                  <div
                    key={sec.id || idx}
                    className="p-4 rounded-xl bg-white/[0.03] border border-purple-500/15 hover:border-purple-500/30 transition space-y-1.5"
                  >
                    <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-purple" />
                      <span>{sec.heading}</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-300/90 leading-relaxed pl-3.5">
                      {sec.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Contact Footer in Modal */}
              <div className="p-4 rounded-xl bg-black/40 border border-purple-500/20 text-xs text-gray-400 space-y-2">
                <h5 className="font-bold text-gray-200">Need clarification or support?</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {form.contactEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-neon-purple shrink-0" />
                      <span>{form.contactEmail}</span>
                    </div>
                  )}
                  {form.contactPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-neon-purple shrink-0" />
                      <span>{form.contactPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 sm:p-5 border-t border-purple-500/20 bg-purple-950/30 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-400 hidden sm:inline">
                Live Storefront Customer Modal Preview
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-gray-200 hover:bg-white/20 transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPreviewModal(false);
                    handleSave();
                  }}
                  className="btn-brand px-5 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/30"
                >
                  Save These Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
