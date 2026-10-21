import { useState, useEffect } from 'react';
import {
  Truck, Search, Eye, DollarSign, RefreshCw, X, AlertCircle,
  Plus, Edit2, Trash2, KeyRound, Copy, Check, MessageCircle,
  Mail, ExternalLink, Share2, EyeOff, Lock, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import ModalOverlay from '../ui/ModalOverlay';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { isAdmin } from '../../utils/roles';

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  phoneNumber: '',
  companyName: '',
  contactPerson: '',
  address: '',
  status: 'Active',
  isActive: true,
};

function VendorList() {
  const { user } = useAuth();
  const adminUser = isAdmin(user?.role);

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // Access Sharing & Password Generation States
  const [showPassword, setShowPassword] = useState(false);
  const [copiedAccess, setCopiedAccess] = useState(false);
  const [createdVendorAccess, setCreatedVendorAccess] = useState(null);
  const [shareVendorModal, setShareVendorModal] = useState(null);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      const res = await api.vendors.getAll(params);
      if (res.success) setVendors(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [statusFilter]);

  const openDetail = async (id) => {
    try {
      const res = await api.vendors.getById(id);
      if (res.success) setSelectedVendor(res.data);
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePayout = async () => {
    if (!payoutAmount || !selectedVendor) return;
    setActionLoading(true);
    try {
      await api.vendors.payout(selectedVendor.id, parseFloat(payoutAmount), payoutNotes);
      alert('Payout processed successfully');
      setPayoutAmount('');
      setPayoutNotes('');
      openDetail(selectedVendor.id);
      fetchVendors();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm((prev) => ({ ...prev, password: pwd }));
    setShowPassword(true);
  };

  const getShareAccessMessage = (vendorData, rawPassword) => {
    const portalUrl = `${window.location.origin}/admin/login`;
    const company = vendorData?.companyName || vendorData?.name || 'Supplier';
    const email = vendorData?.email || '';
    const pwd = rawPassword || (vendorData?.password ? vendorData.password : (form.password ? form.password : '(Keep your current password)'));

    return `Hello ${company},\n\nYour Quickturn Supplier Portal account is ready.\n\n🌐 Portal Link: ${portalUrl}\n📧 Login Email: ${email}\n🔑 Password: ${pwd}\n\nPlease sign in to view your supplier dashboard, inventory movements, earnings, and manage your 30-day used console ads.`;
  };

  const handleCopyAccess = (vendorData, rawPassword) => {
    const text = getShareAccessMessage(vendorData, rawPassword);
    navigator.clipboard.writeText(text);
    setCopiedAccess(true);
    setTimeout(() => setCopiedAccess(false), 2500);
  };

  const getWhatsAppShareLink = (vendorData, rawPassword) => {
    const phone = (vendorData?.phoneNumber || vendorData?.phone || '').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(getShareAccessMessage(vendorData, rawPassword));
    return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
  };

  const getEmailShareLink = (vendorData, rawPassword) => {
    const email = vendorData?.email || '';
    const subject = encodeURIComponent('Quickturn Supplier Portal - Login Access Details');
    const body = encodeURIComponent(getShareAccessMessage(vendorData, rawPassword));
    return `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const openCreateModal = () => {
    setEditingVendor(null);
    setForm(EMPTY_FORM);
    setShowPassword(false);
    setShowFormModal(true);
  };

  const openEditModal = (vendor) => {
    setEditingVendor(vendor);
    setForm({
      name: vendor.user?.name || '',
      email: vendor.email || '',
      password: '',
      phoneNumber: vendor.phone || '',
      companyName: vendor.companyName || '',
      contactPerson: vendor.contactPerson || '',
      address: vendor.address || '',
      status: vendor.status || 'Active',
      isActive: vendor.user?.isActive ?? true,
    });
    setShowPassword(false);
    setShowFormModal(true);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveVendor = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingVendor) {
        const payload = {
          name: form.name,
          email: form.email,
          phone: form.phoneNumber,
          phoneNumber: form.phoneNumber,
          companyName: form.companyName,
          contactPerson: form.contactPerson,
          address: form.address,
          status: form.status,
          isActive: form.isActive,
          ...(form.password ? { password: form.password } : {})
        };
        await api.vendors.update(editingVendor.id, payload);
        setShowFormModal(false);
      } else {
        if (!form.password) {
          alert('Password is required for new suppliers');
          return;
        }
        await api.vendors.create({
          name: form.name,
          email: form.email,
          password: form.password,
          phoneNumber: form.phoneNumber,
          companyName: form.companyName,
          contactPerson: form.contactPerson,
          address: form.address,
          status: form.status,
        });

        // Prompt admin with Access Sharing card immediately after creating
        setCreatedVendorAccess({
          companyName: form.companyName,
          name: form.name,
          email: form.email,
          phoneNumber: form.phoneNumber,
          phone: form.phoneNumber,
          password: form.password,
        });
        setShowFormModal(false);
      }
      fetchVendors();
    } catch (err) {
      alert(err.message || 'Failed to save supplier');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteVendor = async (vendor) => {
    if (!window.confirm(`Delete supplier "${vendor.companyName}"? This cannot be undone.`)) return;
    try {
      await api.vendors.delete(vendor.id);
      if (selectedVendor?.id === vendor.id) setSelectedVendor(null);
      fetchVendors();
    } catch (err) {
      alert(err.message || 'Failed to delete supplier');
    }
  };

  const filtered = vendors.filter((v) =>
    !searchTerm ||
    v.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && vendors.length === 0) {
    return <LoadingSpinner size="lg" className="min-h-[300px]" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-500" />
            Supplier Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">Add, edit and manage vendor accounts, balances and payouts</p>
        </div>
        <div className="flex items-center gap-2">
          {adminUser && (
            <button
              type="button"
              onClick={openCreateModal}
              className="btn-brand flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" /> Add Supplier
            </button>
          )}
          <button
            type="button"
            onClick={fetchVendors}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Pending Approval">Pending Approval</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-400 uppercase">
                <th className="p-4">Company</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Balance</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No suppliers found
                  </td>
                </tr>
              ) : (
                filtered.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-4">
                      <p className="font-semibold text-slate-800 dark:text-white">{vendor.companyName}</p>
                      <p className="text-xs text-slate-400">{vendor.email}</p>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">{vendor.contactPerson || '—'}</td>
                    <td className="p-4 font-bold text-emerald-600">{formatCurrency(vendor.balance)}</td>
                    <td className="p-4"><Badge status={vendor.status}>{vendor.status}</Badge></td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openDetail(vendor.id)}
                          title="View details"
                          className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 hover:bg-blue-100 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {adminUser && (
                          <>
                            <button
                              type="button"
                              onClick={() => setShareVendorModal(vendor)}
                              title="Share portal access"
                              className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 hover:bg-emerald-100 transition"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(vendor)}
                              title="Edit supplier"
                              className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 hover:bg-amber-100 transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteVendor(vendor)}
                              title="Delete supplier"
                              className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 hover:bg-red-100 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Form Modal */}
      <ModalOverlay open={showFormModal}>
        <div className="flex flex-col w-[min(calc(100vw-2rem),36rem)] max-h-[min(90vh,720px)] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-2xl overflow-hidden">
          <div className="shrink-0 px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/30">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {editingVendor ? 'Edit Supplier' : 'Add New Supplier'}
            </h3>
            <button
              type="button"
              onClick={() => setShowFormModal(false)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveVendor} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Company Name *</label>
                  <input
                    required
                    autoComplete="organization"
                    value={form.companyName}
                    onChange={(e) => handleFormChange('companyName', e.target.value)}
                    placeholder="e.g. Sony Distribution"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Contact Person</label>
                  <input
                    autoComplete="name"
                    value={form.contactPerson}
                    onChange={(e) => handleFormChange('contactPerson', e.target.value)}
                    placeholder="Contact name"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Account Name *</label>
                  <input
                    required
                    autoComplete="username"
                    value={form.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="Login display name"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Email *</label>
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    placeholder="supplier@company.com"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase">
                      Password {!editingVendor && '*'}
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      Generate Password
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      required={!editingVendor}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(e) => handleFormChange('password', e.target.value)}
                      placeholder={editingVendor ? 'Leave blank to keep current' : 'Min. 8 characters'}
                      className="w-full pl-4 pr-11 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {editingVendor ? (
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => handleFormChange('isActive', e.target.checked)}
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Account active</span>
                    </label>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Phone</label>
                    <input
                      autoComplete="tel"
                      value={form.phoneNumber}
                      onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                  </div>
                )}

                {editingVendor && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Phone</label>
                    <input
                      autoComplete="tel"
                      value={form.phoneNumber}
                      onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Pending Approval">Pending Approval</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Address</label>
                  <textarea
                    rows={2}
                    autoComplete="street-address"
                    value={form.address}
                    onChange={(e) => handleFormChange('address', e.target.value)}
                    placeholder="Business address"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>

                {/* Direct Share Options inside Modal */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-gradient-to-br from-blue-50/90 to-indigo-50/70 dark:from-slate-800/90 dark:to-indigo-950/30 border border-blue-200/80 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-sm">
                        <Share2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                          Share Portal Access
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Directly send login credentials and portal link to this vendor
                        </p>
                      </div>
                    </div>
                    {form.password && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Password Ready
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-700">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Portal URL</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 truncate block text-[11px]" title={`${window.location.origin}/admin/login`}>
                        {window.location.origin}/admin/login
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-700">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Email</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 truncate block text-[11px]">
                        {form.email || '—'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-700">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Password</span>
                      <span className="font-mono truncate block text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        {form.password || (editingVendor ? '(Keep existing)' : 'Generate above')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopyAccess(form, form.password)}
                      className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-sm"
                    >
                      {copiedAccess ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy Access</span>
                        </>
                      )}
                    </button>

                    <a
                      href={getWhatsAppShareLink(form, form.password)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={getEmailShareLink(form, form.password)}
                      className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-950/30 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="btn-brand px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 active:scale-[0.98]"
              >
                {actionLoading ? 'Saving...' : editingVendor ? 'Update Supplier' : 'Create Supplier'}
              </button>
            </div>
          </form>
        </div>
      </ModalOverlay>

      {/* Detail Modal */}
      <ModalOverlay open={!!selectedVendor}>
        {selectedVendor && (
          <div className="flex flex-col w-[min(calc(100vw-2rem),42rem)] max-h-[min(90vh,720px)] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-800 overflow-hidden">
            <div className="shrink-0 p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/30">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedVendor.companyName}</h3>
                <p className="text-sm text-slate-500">{selectedVendor.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {adminUser && (
                  <button
                    type="button"
                    onClick={() => {
                      openEditModal(selectedVendor);
                      setSelectedVendor(null);
                    }}
                    className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 hover:bg-amber-100 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                <button type="button" onClick={() => setSelectedVendor(null)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Contact</p>
                  <p className="font-medium mt-1">{selectedVendor.contactPerson || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Phone</p>
                  <p className="font-medium mt-1">{selectedVendor.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Status</p>
                  <div className="mt-1"><Badge status={selectedVendor.status}>{selectedVendor.status}</Badge></div>
                </div>
              </div>

              {selectedVendor.address && (
                <div className="text-sm">
                  <p className="text-xs text-slate-500 uppercase">Address</p>
                  <p className="mt-1 text-slate-600 dark:text-slate-400">{selectedVendor.address}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Balance', value: formatCurrency(selectedVendor.balance) },
                  { label: 'Paid Out', value: formatCurrency(selectedVendor.paidPayments) },
                  { label: 'Pending', value: formatCurrency(selectedVendor.pendingPayments) },
                ].map((s) => (
                  <div key={s.label} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center">
                    <p className="text-xs text-slate-500 uppercase">{s.label}</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-white mt-1">{s.value}</p>
                  </div>
                ))}
              </div>

              {adminUser && (
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" /> Process Payout
                  </h4>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={payoutNotes}
                    onChange={(e) => setPayoutNotes(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                  <button
                    type="button"
                    onClick={handlePayout}
                    disabled={actionLoading || !payoutAmount}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Settle Payout'}
                  </button>
                </div>
              )}

              {selectedVendor.ledgerEntries?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-sm">Recent Ledger</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedVendor.ledgerEntries.map((entry) => (
                      <div key={entry.id} className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 text-xs">
                        <div>
                          <p className="font-medium">{entry.type}</p>
                          <p className="text-slate-400">{formatDate(entry.createdAt)}</p>
                        </div>
                        <p className={`font-bold ${entry.type.includes('Credit') ? 'text-emerald-500' : 'text-red-500'}`}>
                          {formatCurrency(entry.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </ModalOverlay>

      {/* Newly Created Vendor - Access Credentials Share Lightbox */}
      <ModalOverlay open={!!createdVendorAccess}>
        {createdVendorAccess && (
          <div className="flex flex-col w-[min(calc(100vw-2rem),34rem)] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center border-b border-slate-100 dark:border-slate-800 bg-gradient-to-b from-emerald-50/70 to-transparent dark:from-emerald-950/20">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                Supplier Created Successfully!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Account login credentials have been generated for <strong className="text-slate-700 dark:text-slate-300">{createdVendorAccess.companyName}</strong>. Share portal access with them now.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 uppercase font-semibold">Portal URL</span>
                  <a
                    href={`${window.location.origin}/admin/login`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    {window.location.origin}/admin/login
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                  <span className="text-slate-400 uppercase font-semibold">Login Email</span>
                  <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                    {createdVendorAccess.email}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                  <span className="text-slate-400 uppercase font-semibold">Password</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800">
                    {createdVendorAccess.password}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleCopyAccess(createdVendorAccess, createdVendorAccess.password)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition shadow-sm"
                >
                  {copiedAccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-600 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                      <span>Copy Details</span>
                    </>
                  )}
                </button>

                <a
                  href={getWhatsAppShareLink(createdVendorAccess, createdVendorAccess.password)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={getEmailShareLink(createdVendorAccess, createdVendorAccess.password)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </a>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setCreatedVendorAccess(null)}
                className="btn-brand px-6 py-2 rounded-xl text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </ModalOverlay>

      {/* Share Vendor Access Lightbox */}
      <ModalOverlay open={!!shareVendorModal}>
        {shareVendorModal && (
          <div className="flex flex-col w-[min(calc(100vw-2rem),34rem)] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    Share Supplier Portal Access
                  </h3>
                  <p className="text-xs text-slate-500">
                    {shareVendorModal.companyName} ({shareVendorModal.email})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShareVendorModal(null)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 uppercase font-semibold">Portal URL</span>
                  <a
                    href={`${window.location.origin}/admin/login`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    {window.location.origin}/admin/login
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                  <span className="text-slate-400 uppercase font-semibold">Vendor Email</span>
                  <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                    {shareVendorModal.email}
                  </span>
                </div>
                {shareVendorModal.phone && (
                  <div className="flex items-center justify-between text-xs border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                    <span className="text-slate-400 uppercase font-semibold">Phone</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {shareVendorModal.phone}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <p>
                  Passwords are encrypted for security. If the supplier forgot their password, you can reset it by editing this supplier and entering a new password.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleCopyAccess(shareVendorModal, '')}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition shadow-sm"
                >
                  {copiedAccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-600 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                      <span>Copy Details</span>
                    </>
                  )}
                </button>

                <a
                  href={getWhatsAppShareLink(shareVendorModal, '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={getEmailShareLink(shareVendorModal, '')}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </a>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  const target = shareVendorModal;
                  setShareVendorModal(null);
                  openEditModal(target);
                }}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Reset Password / Edit
              </button>
              <button
                type="button"
                onClick={() => setShareVendorModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </ModalOverlay>
    </div>
  );
}

export default VendorList;
