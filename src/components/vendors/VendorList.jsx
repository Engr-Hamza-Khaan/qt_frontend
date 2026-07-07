import { useState, useEffect } from 'react';
import {
  Truck, Search, Eye, DollarSign, RefreshCw, X, AlertCircle,
  Plus, Edit2, Trash2,
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

  const openCreateModal = () => {
    setEditingVendor(null);
    setForm(EMPTY_FORM);
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
        };
        await api.vendors.update(editingVendor.id, payload);
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
      }
      setShowFormModal(false);
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

                {!editingVendor ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Password *</label>
                    <input
                      required
                      type="password"
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(e) => handleFormChange('password', e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                  </div>
                ) : (
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
                )}

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
    </div>
  );
}

export default VendorList;
