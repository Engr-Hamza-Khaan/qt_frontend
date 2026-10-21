import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, CheckCircle, Upload, X, Image as ImageIcon, 
  Gamepad2, Cpu, ShieldCheck, Zap, Copy, Check
} from 'lucide-react';
import { storeApi } from '../api';
import TermsAgreement from '../components/TermsAgreement';

const POPULAR_DEVICES = [
  'PS5 Disc Edition',
  'PS5 Slim / Digital',
  'PS4 Pro / Slim',
  'Xbox Series X',
  'Xbox Series S',
  'Nintendo Switch OLED',
  'DualSense Controller',
  'Xbox Elite Series 2',
];

const ISSUE_CATEGORIES = [
  { value: 'HDMI Port Replacement', label: 'HDMI Port Repair / Broken Pins' },
  { value: 'Stick Drift / Hall-Effect', label: 'Stick Drift (Hall-Effect Upgrade)' },
  { value: 'No Power / Overheating', label: 'No Power / Won\'t Turn On / Overheating' },
  { value: 'Disc Drive Error', label: 'Disc Drive Not Reading / Jammed' },
  { value: 'Button / Trigger Malfunction', label: 'Button / Bumper / Trigger Issue' },
  { value: 'Liquid / Water Damage', label: 'Liquid / Water Damage Diagnostic' },
  { value: 'Software / Boot Loop', label: 'Firmware / Boot Loop / Brick' },
  { value: 'General Diagnostic / Other', label: 'Other Hardware Issue / Diagnostic' },
];

function RepairPage() {
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    preferredContact: 'Email',
    deviceType: 'Console',
    deviceModel: '',
    issueType: 'HDMI Port Replacement',
    serialNumber: '',
    accessoriesIncluded: 'Console / Device only',
    priority: 'Normal',
    description: '',
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successTicket, setSuccessTicket] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef(null);

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

  const handleCopyTicket = (ticketId) => {
    const refCode = `#REP-${ticketId.slice(0, 8).toUpperCase()}`;
    navigator.clipboard.writeText(refCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let uploadedMediaUrls = [];

      // If user selected files, upload them first
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
        mediaUrls: uploadedMediaUrls,
      };

      const res = await storeApi.submitRepair(payload);
      if (res?.success && res.data) {
        setSuccessTicket(res.data);
      } else {
        setSuccessTicket(payload);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit repair request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (successTicket) {
    const ticketRef = successTicket.id 
      ? `#REP-${successTicket.id.slice(0, 8).toUpperCase()}`
      : '#REP-SUBMITTED';

    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>

        <h1 className="store-page-title mb-2 text-2xl sm:text-3xl">Repair Request Booked!</h1>
        <p className="store-muted mb-6 text-sm sm:text-base">
          Our master technicians have received your intake report and will review it immediately.
        </p>

        {/* Ticket Reference Badge */}
        <div className="p-6 store-glass-panel rounded-2xl max-w-lg mx-auto text-left mb-8 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Ticket Reference</span>
              <span className="font-mono text-lg font-bold text-neon-purple">{ticketRef}</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopyTicket(successTicket.id || 'REF')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Ref'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Customer:</span>
              <span className="font-medium text-white">{successTicket.customerName}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Contact:</span>
              <span className="font-medium text-white">{successTicket.customerEmail}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Device Model:</span>
              <span className="font-medium text-white">{successTicket.deviceModel || form.deviceModel || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Issue Category:</span>
              <span className="font-medium text-white">{successTicket.issueType || form.issueType || 'Diagnostic'}</span>
            </div>
          </div>

          <div className="p-3 bg-neon-purple/10 border border-neon-purple/20 rounded-xl text-xs text-slate-300">
            <span className="font-semibold text-white block mb-0.5">Next Steps:</span>
            We will contact you at <span className="text-neon-purple font-medium">{successTicket.customerEmail}</span> with shipping instructions or drop-off time slot and diagnostic quote.
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link to="/" className="store-link text-sm">
            Back to Home
          </Link>
          <button
            type="button"
            onClick={() => {
              setSuccessTicket(null);
              setForm({
                customerName: '',
                customerEmail: '',
                customerPhone: '',
                preferredContact: 'Email',
                deviceType: 'Console',
                deviceModel: '',
                issueType: 'HDMI Port Replacement',
                serialNumber: '',
                accessoriesIncluded: 'Console / Device only',
                priority: 'Normal',
                description: '',
              });
              setSelectedFiles([]);
              setFilePreviews([]);
            }}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/15 text-white transition"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-2xl bg-neon-purple/20 border border-neon-purple/30 text-neon-purple">
          <Wrench className="w-7 h-7" />
        </div>
        <div>
          <h1 className="store-page-title text-2xl sm:text-3xl">Professional Repair Service</h1>
          <p className="store-muted text-xs sm:text-sm">
            Board-level diagnostics, HDMI replacements, Hall-Effect joystick upgrades, and console repairs.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6 store-glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
        
        {/* Section 1: Customer Contact Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neon-purple border-b border-white/10 pb-2">
            <Cpu className="w-4 h-4" />
            <span>1. Customer & Contact Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                required
                className="store-input w-full"
                placeholder="e.g. Alex Morgan"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="email"
                className="store-input w-full"
                placeholder="alex@example.com"
                value={form.customerEmail}
                onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">
                Phone / WhatsApp Number
              </label>
              <input
                className="store-input w-full"
                placeholder="+1 (555) 000-0000"
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">
                Preferred Contact Method
              </label>
              <select
                className="store-input w-full"
                value={form.preferredContact}
                onChange={(e) => setForm({ ...form, preferredContact: e.target.value })}
              >
                <option value="Email">Email</option>
                <option value="Phone">Phone Call</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Hardware & Device Details */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neon-purple border-b border-white/10 pb-2">
            <Gamepad2 className="w-4 h-4" />
            <span>2. Device & Hardware Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">
                Device Category <span className="text-red-400">*</span>
              </label>
              <select
                className="store-input w-full"
                value={form.deviceType}
                onChange={(e) => setForm({ ...form, deviceType: e.target.value })}
              >
                <option value="Console">Home Console (PS5, Xbox, Switch dock)</option>
                <option value="Controller">Controller (DualSense, Elite, Scuf)</option>
                <option value="Handheld">Handheld (Switch Lite, Steam Deck, ROG)</option>
                <option value="Accessory">Headset / VR / Accessory</option>
                <option value="Retro">Retro Console / Vintage Gear</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">
                Device Model & Brand <span className="text-red-400">*</span>
              </label>
              <input
                required
                className="store-input w-full"
                placeholder="e.g. PS5 Disc Edition, Xbox Series X..."
                value={form.deviceModel}
                onChange={(e) => setForm({ ...form, deviceModel: e.target.value })}
              />
            </div>
          </div>

          {/* Quick select pills */}
          <div>
            <span className="text-[11px] text-slate-400 block mb-1.5">Quick Pick Device:</span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_DEVICES.map((dev) => (
                <button
                  type="button"
                  key={dev}
                  onClick={() => setForm({ ...form, deviceModel: dev })}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                    form.deviceModel === dev
                      ? 'bg-neon-purple text-white border-neon-purple font-semibold shadow-sm'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {dev}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">
                Serial Number <span className="text-slate-400 font-normal">(Optional, on back/bottom)</span>
              </label>
              <input
                className="store-input w-full font-mono text-xs"
                placeholder="e.g. AK123456789"
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">
                Accessories Included
              </label>
              <input
                className="store-input w-full"
                placeholder="e.g. Console only, With power cable, With controller"
                value={form.accessoriesIncluded}
                onChange={(e) => setForm({ ...form, accessoriesIncluded: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Defect & Issue Diagnostics */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neon-purple border-b border-white/10 pb-2">
            <Zap className="w-4 h-4" />
            <span>3. Issue Diagnostics & Symptoms</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">
                Primary Issue Category <span className="text-red-400">*</span>
              </label>
              <select
                className="store-input w-full"
                value={form.issueType}
                onChange={(e) => setForm({ ...form, issueType: e.target.value })}
              >
                {ISSUE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">
                Turnaround Priority
              </label>
              <select
                className="store-input w-full"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="Normal">Standard Turnaround (2–4 business days)</option>
                <option value="Urgent">Urgent / Rush Service (Priority diagnostic)</option>
                <option value="Low">Flexible / Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1.5">
              Detailed Issue Description <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              className="store-input w-full text-sm leading-relaxed"
              rows={4}
              placeholder="Describe exact symptoms, error codes, when the issue started, noises, or prior repair attempts..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Media & Photos upload */}
          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1.5">
              Attach Photos / Video of Defect <span className="text-slate-400 font-normal">(Optional, up to 5 files)</span>
            </label>
            
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl border border-dashed border-white/20 hover:border-neon-purple/60 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-2 transition"
              >
                <Upload className="w-4 h-4 text-neon-purple" />
                Upload Photos / Damage Proof
              </button>

              <span className="text-[11px] text-slate-400">
                {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'Max 10MB per file'}
              </span>
            </div>

            {/* Thumbnail previews */}
            {filePreviews.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {filePreviews.map((previewUrl, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/20 bg-black/40 group">
                    <img src={previewUrl} alt="Upload preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-red-400"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Terms & Submission */}
        <div className="pt-2 border-t border-white/10 space-y-4">
          <TermsAgreement checked={agreedToTerms} onChange={setAgreedToTerms} />

          <button
            type="submit"
            disabled={loading || !agreedToTerms}
            className="store-btn-primary store-btn-primary--block w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-neon-purple/20"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Booking Repair Request...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Submit Comprehensive Repair Request</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}

export default RepairPage;
