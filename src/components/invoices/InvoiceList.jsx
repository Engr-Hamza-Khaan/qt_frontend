import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Printer,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Save,
  ShoppingBag,
  Building,
  User,
  CreditCard,
  Minus,
  Check,
  RotateCcw,
} from 'lucide-react';
import { api } from '../../api/client';
import ModalOverlay from '../ui/ModalOverlay';
import LoadingSpinner from '../ui/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';

const DEFAULT_COMPANY = {
  companyName: 'Quick Turn Gaming & Repairs',
  companyLogo: '/logo.png',
  companyAddress: 'Shop #12, Gaming Plaza, Saddar, Karachi, Pakistan',
  companyPhone: '+92 300 1234567',
  companyEmail: 'info@quickturn.pk',
  companyWebsite: 'www.quickturn.pk',
  headerNote: 'Official Commercial Invoice & Warranty Receipt',
  footerNotes:
    'Thank you for choosing Quick Turn! 7-day checking warranty on pre-owned items. For repairs, 30-day service warranty applies. Goods once sold cannot be returned without original cash receipt.',
  paymentTerms:
    'Payment Method: Cash / Bank Transfer. Bank: Meezan Bank | Account Title: Quick Turn Store | Account #: 0101-01020304-01 | IBAN: PK55MEZN00010102030401',
  authorizedSignatory: 'Quick Turn Store Manager',
  showSignatureSection: true,
};

// Pure, reusable formal invoice document content
function InvoiceDocumentContent({ invoice }) {
  if (!invoice) return null;

  return (
    <div className="w-full bg-white text-slate-900 font-sans leading-normal">
      {/* Top Header Row: Logo & Company (Left) + Invoice Title & Meta (Right) */}
      <div className="flex flex-row items-start justify-between gap-6 border-b-2 border-slate-900 pb-4">
        {/* Company Branding */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center p-1.5 overflow-hidden shrink-0">
            <img
              src={invoice.companyLogo || '/logo.png'}
              alt="Quick Turn Logo"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/logo.png';
              }}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight uppercase font-outfit">
              {invoice.companyName || DEFAULT_COMPANY.companyName}
            </h2>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">
              {invoice.headerNote || DEFAULT_COMPANY.headerNote}
            </p>
            <div className="text-[11px] text-slate-600 mt-1 space-y-0.5 leading-snug">
              <p>{invoice.companyAddress || DEFAULT_COMPANY.companyAddress}</p>
              <p>
                Phone: {invoice.companyPhone || DEFAULT_COMPANY.companyPhone} | Email:{' '}
                {invoice.companyEmail || DEFAULT_COMPANY.companyEmail}
              </p>
              {invoice.companyWebsite && <p>Website: {invoice.companyWebsite}</p>}
            </div>
          </div>
        </div>

        {/* Invoice Title & Meta Details */}
        <div className="text-right shrink-0">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">
            INVOICE
          </h1>
          <div className="font-mono font-extrabold text-sm text-blue-600 mt-1">
            {invoice.invoiceNumber}
          </div>
          <div className="text-[11px] text-slate-700 mt-2 space-y-0.5">
            <p>
              <span className="font-bold text-slate-500">Date:</span> {invoice.issueDate}
            </p>
            {invoice.dueDate && (
              <p>
                <span className="font-bold text-slate-500">Due Date:</span> {invoice.dueDate}
              </p>
            )}
            <p>
              <span className="font-bold text-slate-500">Payment:</span>{' '}
              {invoice.paymentMethod || 'Cash on Delivery'}
            </p>
            <p>
              <span className="font-bold text-slate-500">Status:</span>{' '}
              <span
                className={`font-black uppercase px-2 py-0.5 rounded text-[10px] ${
                  invoice.status === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {invoice.status}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Billed To Customer Card */}
      <div className="my-3.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
            BILLED TO:
          </div>
          <div className="text-sm font-black text-slate-900">{invoice.customerName}</div>
          <div className="text-xs text-slate-600 mt-0.5 space-y-0.5">
            {invoice.customerPhone && <p>📞 {invoice.customerPhone}</p>}
            {invoice.customerEmail && <p>✉️ {invoice.customerEmail}</p>}
          </div>
        </div>

        {invoice.customerAddress && (
          <div className="sm:text-right max-w-xs">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
              SHIPPING / DELIVERY DESTINATION:
            </div>
            <div className="text-xs text-slate-700 leading-relaxed">
              {invoice.customerAddress}
              {invoice.customerCity && `, ${invoice.customerCity}`}
            </div>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="mb-3.5 rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-800 text-[11px] font-black uppercase tracking-wider border-b border-slate-300">
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th className="py-2.5 px-3">Description / Item</th>
              <th className="py-2.5 px-3 text-right w-28">Unit Price</th>
              <th className="py-2.5 px-3 text-center w-16">Qty</th>
              <th className="py-2.5 px-3 text-right w-32">Total Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {(invoice.items || []).map((item, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                <td className="py-2.5 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                <td className="py-2.5 px-3">
                  <div className="font-bold text-slate-900">{item.title}</div>
                  {item.sku && (
                    <span className="inline-block text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded mt-0.5">
                      SKU: {item.sku}
                    </span>
                  )}
                  {item.description && (
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.description}</div>
                  )}
                </td>
                <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                  {formatCurrency(item.price)}
                </td>
                <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                  {item.quantity}
                </td>
                <td className="py-2.5 px-3 text-right font-black text-slate-900">
                  {formatCurrency((parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals & Notes Section */}
      <div className="flex flex-row justify-between items-start gap-6 pt-1">
        <div className="flex-1 space-y-2 text-xs">
          {invoice.paymentTerms && (
            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
              <span className="font-bold text-blue-950 block text-[10px] uppercase tracking-wider">
                Payment Instructions / Bank Details:
              </span>
              <p className="mt-0.5 text-[11px] text-blue-900 leading-relaxed">
                {invoice.paymentTerms}
              </p>
            </div>
          )}
          {invoice.footerNotes && (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-700 block text-[10px] uppercase tracking-wider">
                Warranty & Return Terms:
              </span>
              <p className="mt-0.5 text-[10px] text-slate-600 leading-relaxed">
                {invoice.footerNotes}
              </p>
            </div>
          )}
        </div>

        <div className="w-64 space-y-1.5 text-xs shrink-0">
          <div className="flex justify-between text-slate-600 py-1 border-b border-slate-100">
            <span>Subtotal:</span>
            <span className="font-bold text-slate-900">{formatCurrency(invoice.subtotal)}</span>
          </div>
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold py-1 border-b border-slate-100">
              <span>Discount:</span>
              <span>-{formatCurrency(invoice.discountAmount)}</span>
            </div>
          )}
          {invoice.shippingFee > 0 && (
            <div className="flex justify-between text-slate-600 py-1 border-b border-slate-100">
              <span>Shipping Fee:</span>
              <span>+{formatCurrency(invoice.shippingFee)}</span>
            </div>
          )}
          {invoice.taxAmount > 0 && (
            <div className="flex justify-between text-slate-600 py-1 border-b border-slate-100">
              <span>Tax / Surcharge:</span>
              <span>+{formatCurrency(invoice.taxAmount)}</span>
            </div>
          )}
          <div className="p-2.5 bg-slate-900 text-white rounded-xl flex justify-between items-center mt-2 shadow-sm">
            <span className="text-xs uppercase font-black tracking-wider">Grand Total:</span>
            <span className="text-base font-black text-white">{formatCurrency(invoice.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      {invoice.showSignatureSection && (
        <div className="grid grid-cols-2 gap-10 mt-6 pt-4 border-t border-slate-200">
          <div className="text-center">
            <div className="h-10 border-b border-slate-400 flex items-end justify-center pb-1">
              {/* signature line */}
            </div>
            <p className="text-[11px] font-black text-slate-900 mt-1 uppercase">
              {invoice.authorizedSignatory || 'Quick Turn Store Manager'}
            </p>
            <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">
              Authorized Sign & Stamp
            </p>
          </div>

          <div className="text-center">
            <div className="h-10 border-b border-slate-400 flex items-end justify-center pb-1">
              {/* customer signature line */}
            </div>
            <p className="text-[11px] font-black text-slate-900 mt-1 uppercase">
              Customer Acceptance
            </p>
            <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">
              Received in good order & accepted
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summaryMeta, setSummaryMeta] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  // Modals
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [savingInvoice, setSavingInvoice] = useState(false);

  // External data for builder
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [registeredCustomers, setRegisteredCustomers] = useState([]);
  const [selectedProductVariationId, setSelectedProductVariationId] = useState('');

  // Builder Form State
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    status: 'Pending',
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Unpaid',
    customerId: '',
    orderId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerCity: '',
    companyName: DEFAULT_COMPANY.companyName,
    companyLogo: DEFAULT_COMPANY.companyLogo,
    companyAddress: DEFAULT_COMPANY.companyAddress,
    companyPhone: DEFAULT_COMPANY.companyPhone,
    companyEmail: DEFAULT_COMPANY.companyEmail,
    companyWebsite: DEFAULT_COMPANY.companyWebsite,
    headerNote: DEFAULT_COMPANY.headerNote,
    footerNotes: DEFAULT_COMPANY.footerNotes,
    paymentTerms: DEFAULT_COMPANY.paymentTerms,
    authorizedSignatory: DEFAULT_COMPANY.authorizedSignatory,
    showSignatureSection: true,
    discountAmount: 0,
    shippingFee: 0,
    taxAmount: 0,
    items: [],
    notes: '',
  });

  const currentUser = api.auth.getCurrentUser();
  const canManageInvoices = ['Admin', 'Super Admin', 'Staff'].includes(currentUser?.role);

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, paymentFilter]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await api.invoices.getAll(params);
      if (res.success) {
        setInvoices(res.data || []);
        setSummaryMeta(res.meta?.summary || null);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve invoice records.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxiliaryData = async () => {
    try {
      const [prodRes, custRes] = await Promise.all([
        api.products.getAll(),
        api.customers.getAll().catch(() => ({ data: [] })),
      ]);
      if (prodRes.success) setCatalogProducts(prodRes.data || []);
      if (custRes.success) setRegisteredCustomers(custRes.data || []);
    } catch {
      // ignore
    }
  };

  const handleOpenCreateBuilder = async () => {
    fetchAuxiliaryData();
    setIsEditing(false);
    setEditingInvoiceId(null);

    let nextNumber = `INV-${new Date().getFullYear()}-0001`;
    try {
      const res = await api.invoices.getNextNumber();
      if (res.success && res.data?.invoiceNumber) {
        nextNumber = res.data.invoiceNumber;
      }
    } catch {
      // fallback
    }

    setFormData({
      invoiceNumber: nextNumber,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'Pending',
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Unpaid',
      customerId: '',
      orderId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
      customerCity: '',
      companyName: DEFAULT_COMPANY.companyName,
      companyLogo: DEFAULT_COMPANY.companyLogo,
      companyAddress: DEFAULT_COMPANY.companyAddress,
      companyPhone: DEFAULT_COMPANY.companyPhone,
      companyEmail: DEFAULT_COMPANY.companyEmail,
      companyWebsite: DEFAULT_COMPANY.companyWebsite,
      headerNote: DEFAULT_COMPANY.headerNote,
      footerNotes: DEFAULT_COMPANY.footerNotes,
      paymentTerms: DEFAULT_COMPANY.paymentTerms,
      authorizedSignatory: DEFAULT_COMPANY.authorizedSignatory,
      showSignatureSection: true,
      discountAmount: 0,
      shippingFee: 0,
      taxAmount: 0,
      items: [
        {
          id: `item-${Date.now()}`,
          title: 'Custom Product / Service',
          sku: '',
          description: '',
          price: 1500,
          quantity: 1,
          total: 1500,
        },
      ],
      notes: '',
    });

    setIsBuilderOpen(true);
  };

  const handleOpenEditBuilder = (inv) => {
    fetchAuxiliaryData();
    setIsEditing(true);
    setEditingInvoiceId(inv.id);

    setFormData({
      invoiceNumber: inv.invoiceNumber,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate || '',
      status: inv.status,
      paymentMethod: inv.paymentMethod || 'Cash on Delivery',
      paymentStatus: inv.paymentStatus || 'Unpaid',
      customerId: inv.customerId || '',
      orderId: inv.orderId || '',
      customerName: inv.customerName || '',
      customerEmail: inv.customerEmail || '',
      customerPhone: inv.customerPhone || '',
      customerAddress: inv.customerAddress || '',
      customerCity: inv.customerCity || '',
      companyName: inv.companyName || DEFAULT_COMPANY.companyName,
      companyLogo: inv.companyLogo || DEFAULT_COMPANY.companyLogo,
      companyAddress: inv.companyAddress || DEFAULT_COMPANY.companyAddress,
      companyPhone: inv.companyPhone || DEFAULT_COMPANY.companyPhone,
      companyEmail: inv.companyEmail || DEFAULT_COMPANY.companyEmail,
      companyWebsite: inv.companyWebsite || DEFAULT_COMPANY.companyWebsite,
      headerNote: inv.headerNote || DEFAULT_COMPANY.headerNote,
      footerNotes: inv.footerNotes !== undefined ? inv.footerNotes : DEFAULT_COMPANY.footerNotes,
      paymentTerms: inv.paymentTerms !== undefined ? inv.paymentTerms : DEFAULT_COMPANY.paymentTerms,
      authorizedSignatory: inv.authorizedSignatory || DEFAULT_COMPANY.authorizedSignatory,
      showSignatureSection: inv.showSignatureSection ?? true,
      discountAmount: inv.discountAmount || 0,
      shippingFee: inv.shippingFee || 0,
      taxAmount: inv.taxAmount || 0,
      items: inv.items || [],
      notes: inv.notes || '',
    });

    setIsBuilderOpen(true);
  };

  const handleCustomerSelect = (customerId) => {
    if (!customerId) return;
    const cust = registeredCustomers.find((c) => c.id === customerId);
    if (cust) {
      setFormData((prev) => ({
        ...prev,
        customerId: cust.id,
        customerName: cust.name || '',
        customerEmail: cust.email || '',
        customerPhone: cust.phoneNumber || '',
        customerAddress: cust.address || prev.customerAddress,
        customerCity: cust.city || prev.customerCity,
      }));
    }
  };

  const handleAddCatalogProduct = () => {
    if (!selectedProductVariationId) return;

    let foundVar = null;
    let foundProd = null;

    for (const prod of catalogProducts) {
      if (prod.variations && prod.variations.length > 0) {
        const v = prod.variations.find((v) => v.id === selectedProductVariationId);
        if (v) {
          foundVar = v;
          foundProd = prod;
          break;
        }
      }
    }

    if (!foundVar) return;

    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: foundProd.id,
      variationId: foundVar.id,
      title: foundProd.title,
      sku: foundVar.sku || '',
      description: foundVar.sku ? `SKU: ${foundVar.sku}` : '',
      price: parseFloat(foundVar.price) || 0,
      quantity: 1,
      total: parseFloat(foundVar.price) || 0,
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    setSelectedProductVariationId('');
  };

  const handleAddCustomItem = () => {
    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: null,
      variationId: null,
      title: 'Custom Repair / Service',
      sku: '',
      description: '',
      price: 1000,
      quantity: 1,
      total: 1000,
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    const item = { ...updated[index] };

    if (field === 'price') {
      item.price = Math.max(0, parseFloat(value) || 0);
      item.total = parseFloat((item.price * item.quantity).toFixed(2));
    } else if (field === 'quantity') {
      item.quantity = Math.max(1, parseInt(value, 10) || 1);
      item.total = parseFloat((item.price * item.quantity).toFixed(2));
    } else {
      item[field] = value;
    }

    updated[index] = item;
    setFormData((prev) => ({ ...prev, items: updated }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) {
      alert('Invoice must have at least one line item.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculatedSubtotal = (formData.items || []).reduce((acc, curr) => {
    return acc + (parseFloat(curr.price) || 0) * (parseInt(curr.quantity, 10) || 1);
  }, 0);

  const calculatedGrandTotal = Math.max(
    0,
    calculatedSubtotal -
      (parseFloat(formData.discountAmount) || 0) +
      (parseFloat(formData.shippingFee) || 0) +
      (parseFloat(formData.taxAmount) || 0)
  );

  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    if (!formData.customerName.trim()) {
      alert('Please enter a customer name.');
      return;
    }
    if (formData.items.length === 0) {
      alert('Invoice must contain at least one line item.');
      return;
    }

    setSavingInvoice(true);
    try {
      const payload = {
        ...formData,
        subtotal: calculatedSubtotal,
        totalAmount: calculatedGrandTotal,
      };

      let res;
      if (isEditing && editingInvoiceId) {
        res = await api.invoices.update(editingInvoiceId, payload);
      } else {
        res = await api.invoices.create(payload);
      }

      if (res.success) {
        alert(isEditing ? 'Invoice updated successfully!' : 'Invoice generated successfully!');
        setIsBuilderOpen(false);
        fetchInvoices();
        if (res.data) {
          setSelectedInvoice(res.data);
        }
      }
    } catch (err) {
      alert(err.message || 'Error saving invoice record.');
    } finally {
      setSavingInvoice(false);
    }
  };

  const handleDeleteInvoice = async (inv) => {
    if (!window.confirm(`Delete invoice ${inv.invoiceNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await api.invoices.delete(inv.id);
      if (res.success) {
        if (selectedInvoice?.id === inv.id) setSelectedInvoice(null);
        fetchInvoices();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete invoice.');
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleQuickTogglePaid = async (inv) => {
    const newStatus = inv.status === 'Paid' ? 'Pending' : 'Paid';
    const newPayment = inv.status === 'Paid' ? 'Unpaid' : 'Paid';

    try {
      const res = await api.invoices.update(inv.id, {
        status: newStatus,
        paymentStatus: newPayment,
      });
      if (res.success) {
        fetchInvoices();
        if (selectedInvoice?.id === inv.id) {
          setSelectedInvoice(res.data);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to update invoice status.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50';
      case 'Draft':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border border-red-200/50';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(term) ||
      (inv.customerName && inv.customerName.toLowerCase().includes(term)) ||
      (inv.customerEmail && inv.customerEmail.toLowerCase().includes(term)) ||
      (inv.customerPhone && inv.customerPhone.toLowerCase().includes(term));
    return matchesSearch;
  });

  const variationOptions = [];
  catalogProducts.forEach((prod) => {
    if (prod.variations && prod.variations.length > 0) {
      prod.variations.forEach((v) => {
        variationOptions.push({
          id: v.id,
          label: `${prod.title} ${v.sku ? `(SKU: ${v.sku})` : ''} - ${formatCurrency(v.price)}`,
        });
      });
    }
  });

  return (
    <div className="space-y-6">
      {/* Flawless A4 Print Styles: renders ONLY body > #printable-invoice-portal starting at (0, 0) */}
      <style>{`
        #printable-invoice-portal {
          display: none;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm 8mm 10mm;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            height: auto !important;
            overflow: visible !important;
          }

          /* Hide application UI, backdrop and modals */
          body > * {
            display: none !important;
          }

          /* Render only the direct body portal */
          body > #printable-invoice-portal {
            display: block !important;
            visibility: visible !important;
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            box-shadow: none !important;
            border: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body > #printable-invoice-portal * {
            visibility: visible !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-500" />
            Manual Invoices & Billing
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Create custom commercial invoices, select catalog products or custom services, and print or export receipts.
          </p>
        </div>

        {canManageInvoices && (
          <button
            type="button"
            onClick={handleOpenCreateBuilder}
            className="btn-brand px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            Create Manual Invoice
          </button>
        )}
      </div>

      {/* Stats Summary Cards */}
      {summaryMeta && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Invoiced</p>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">
                {formatCurrency(summaryMeta.totalInvoiced || 0)}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{summaryMeta.totalInvoicesCount || 0} total invoices</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">Collected Revenue</p>
              <h3 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(summaryMeta.totalPaid || 0)}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{summaryMeta.paidCount || 0} paid invoices</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-500">Pending Receivables</p>
              <h3 className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {formatCurrency(summaryMeta.totalPending || 0)}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{summaryMeta.pendingCount || 0} invoices awaiting payment</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-purple-500">Collection Rate</p>
              <h3 className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                {summaryMeta.totalInvoiced > 0
                  ? `${Math.round((summaryMeta.totalPaid / summaryMeta.totalInvoiced) * 100)}%`
                  : '0%'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Paid vs Total Invoiced</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search invoice #, customer name, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Draft">Draft</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Invoices List Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-slate-500 text-sm font-medium">Loading invoice records...</p>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl py-20 text-center rounded-3xl border border-slate-200/50 dark:border-slate-800">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Invoices Found</h3>
          <p className="text-slate-400 text-sm mt-1">
            Click "Create Manual Invoice" to create your first customized invoice.
          </p>
          {canManageInvoices && (
            <button
              onClick={handleOpenCreateBuilder}
              className="btn-brand mt-4 px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Manual Invoice
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Invoice #</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Issue Date</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Customer</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Items</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Grand Total</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Payment Method</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(inv)}
                        className="text-sm font-extrabold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                      >
                        <FileText className="w-4 h-4" />
                        {inv.invoiceNumber}
                      </button>
                      {inv.order && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          From Order: {inv.order.orderNumber}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                      {inv.issueDate}
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-bold text-slate-800 dark:text-white">
                        {inv.customerName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {inv.customerPhone || inv.customerEmail || 'Walk-in Customer'}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-600 dark:text-slate-300">
                      {inv.items?.length || 0} line item(s)
                    </td>
                    <td className="p-4 text-sm font-extrabold text-slate-800 dark:text-white text-right">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="p-4 text-xs text-slate-600 dark:text-slate-300">
                      {inv.paymentMethod || 'Cash'}
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleQuickTogglePaid(inv)}
                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full cursor-pointer hover:opacity-80 transition ${getStatusBadge(
                          inv.status
                        )}`}
                        title="Click to toggle Paid/Pending"
                      >
                        {inv.status}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                          title="View / Print Invoice"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        {canManageInvoices && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEditBuilder(inv)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition"
                              title="Edit Invoice"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteInvoice(inv)}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                              title="Delete Invoice"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= INVOICE BUILDER / EDITOR MODAL ================= */}
      <ModalOverlay open={isBuilderOpen}>
        <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl border border-slate-200/50 dark:border-slate-800 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
          {/* Builder Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800 dark:text-white">
                  {isEditing ? `Edit Invoice: ${formData.invoiceNumber}` : 'Create Manual Invoice'}
                </h3>
                <p className="text-xs text-slate-400">
                  Select catalog products or add custom items, specify prices, addresses, and footer notes.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsBuilderOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Builder Form Body */}
          <form onSubmit={handleSaveInvoice} className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Section 1: Invoice Meta & Basic Info */}
            <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Invoice Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Issue Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value,
                      paymentStatus: e.target.value === 'Paid' ? 'Paid' : formData.paymentStatus,
                    })
                  }
                  className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Draft">Draft</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                  <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                  <option value="Credit / Debit Card">Credit / Debit Card</option>
                  <option value="Cash (In-store)">Cash (In-store)</option>
                  <option value="JazzCash / EasyPaisa">JazzCash / EasyPaisa</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Payment Status
                </label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                </select>
              </div>
            </div>

            {/* Section 2: Customer Details & Company Branding */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-purple-500" />
                    Customer Details (Bill To)
                  </h4>

                  {/* Pick from existing registered customers */}
                  {registeredCustomers.length > 0 && (
                    <select
                      value={formData.customerId || ''}
                      onChange={(e) => handleCustomerSelect(e.target.value)}
                      className="px-2 py-1 text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-300 focus:outline-none"
                    >
                      <option value="">-- Pick Registered Customer --</option>
                      {registeredCustomers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.email || c.phoneNumber})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Customer Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe or Walk-in Customer"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="customer@email.com"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="+92 300 0000000"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Billing / Shipping Address
                    </label>
                    <input
                      type="text"
                      placeholder="Full street address and city..."
                      value={formData.customerAddress}
                      onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Company Branding & Customizable Header */}
              <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-blue-500" />
                    Company Logo & Header Details
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Company / Store Name
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Company Contact Phone
                    </label>
                    <input
                      type="text"
                      value={formData.companyPhone}
                      onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Company Email
                    </label>
                    <input
                      type="email"
                      value={formData.companyEmail}
                      onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Header Slogan / Receipt Note
                    </label>
                    <input
                      type="text"
                      value={formData.headerNote}
                      onChange={(e) => setFormData({ ...formData, headerNote: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Store Address
                    </label>
                    <input
                      type="text"
                      value={formData.companyAddress}
                      onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Line Items (Existing Catalog Products OR Custom Items) */}
            <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/50 dark:border-slate-800 pb-3">
                <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-500" />
                  Invoice Line Items (Products & Services)
                </h4>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddCustomItem}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Custom Item
                  </button>
                </div>
              </div>

              {/* Add from catalog selector */}
              {variationOptions.length > 0 && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <select
                    value={selectedProductVariationId}
                    onChange={(e) => setSelectedProductVariationId(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="">-- Select Existing Product from Store Catalog to Insert --</option>
                    {variationOptions.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddCatalogProduct}
                    disabled={!selectedProductVariationId}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
                  >
                    <Plus className="w-4 h-4" /> Add Catalog Product
                  </button>
                </div>
              )}

              {/* Items Table */}
              <div className="space-y-3">
                {formData.items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    {/* Title & SKU */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">
                          Item Name / Service
                        </label>
                        <input
                          type="text"
                          required
                          value={item.title}
                          onChange={(e) => handleItemChange(idx, 'title', e.target.value)}
                          placeholder="Product Name or Service"
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">
                          SKU / Note
                        </label>
                        <input
                          type="text"
                          value={item.sku || ''}
                          onChange={(e) => handleItemChange(idx, 'sku', e.target.value)}
                          placeholder="Optional SKU or warranty details"
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Price, Qty, Total, and Delete */}
                    <div className="flex items-center justify-end gap-3 shrink-0">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase block">
                          Unit Price (Rs)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.price}
                          onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                          className="w-24 px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-800 dark:text-white focus:outline-none text-right"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase block text-center">
                          Qty
                        </label>
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => handleItemChange(idx, 'quantity', item.quantity - 1)}
                            className="p-0.5 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            className="w-10 text-center bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleItemChange(idx, 'quantity', item.quantity + 1)}
                            className="p-0.5 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right w-24">
                        <div className="text-[9px] font-bold text-slate-400 uppercase">Total</div>
                        <div className="text-xs font-black text-blue-600 dark:text-blue-400">
                          {formatCurrency((parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Totals & Financial Adjustments */}
            <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Discount (Rs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discountAmount}
                    onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Shipping Fee (Rs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.shippingFee}
                    onChange={(e) => setFormData({ ...formData, shippingFee: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Tax / Surcharge (Rs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.taxAmount}
                    onChange={(e) => setFormData({ ...formData, taxAmount: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Items Subtotal:</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {formatCurrency(calculatedSubtotal)}
                  </span>
                </div>
                {formData.discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                    <span>Discount:</span>
                    <span>-{formatCurrency(formData.discountAmount)}</span>
                  </div>
                )}
                {formData.shippingFee > 0 && (
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Shipping Fee:</span>
                    <span>+{formatCurrency(formData.shippingFee)}</span>
                  </div>
                )}
                {formData.taxAmount > 0 && (
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Tax:</span>
                    <span>+{formatCurrency(formData.taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-slate-700 dark:text-slate-300">
                    Grand Total:
                  </span>
                  <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                    {formatCurrency(calculatedGrandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 5: Footer Notes & Signature Setup */}
            <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200/50 dark:border-slate-800 pb-2">
                Customizable Footer & Signature Section
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Warranty & Terms Footer Note
                  </label>
                  <textarea
                    rows="2"
                    value={formData.footerNotes}
                    onChange={(e) => setFormData({ ...formData, footerNotes: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Payment Instructions / Bank Details
                  </label>
                  <textarea
                    rows="2"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Signatory Title / Name
                  </label>
                  <input
                    type="text"
                    value={formData.authorizedSignatory}
                    onChange={(e) => setFormData({ ...formData, authorizedSignatory: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <input
                    type="checkbox"
                    id="sig_toggle"
                    checked={formData.showSignatureSection}
                    onChange={(e) => setFormData({ ...formData, showSignatureSection: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                  <label htmlFor="sig_toggle" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Include Formal Signature & Stamp Section on Invoice
                  </label>
                </div>
              </div>
            </div>

            {/* Builder Actions Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsBuilderOpen(false)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingInvoice}
                className="btn-brand px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {savingInvoice ? 'Saving Invoice...' : isEditing ? 'Update Invoice' : 'Generate Invoice'}
              </button>
            </div>
          </form>
        </div>
      </ModalOverlay>

      {/* ================= PRINTABLE INVOICE VIEW MODAL ================= */}
      <ModalOverlay open={!!selectedInvoice}>
        {selectedInvoice && (
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Modal Top Actions Toolbar (Hidden on print) */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm text-blue-600 dark:text-blue-400">
                  {selectedInvoice.invoiceNumber}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getStatusBadge(selectedInvoice.status)}`}>
                  {selectedInvoice.status}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintInvoice}
                  className="btn-brand px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save PDF
                </button>
                {canManageInvoices && (
                  <button
                    type="button"
                    onClick={() => {
                      const inv = selectedInvoice;
                      setSelectedInvoice(null);
                      handleOpenEditBuilder(inv);
                    }}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Screen Preview Container */}
            <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-white text-slate-900">
              <InvoiceDocumentContent invoice={selectedInvoice} />
            </div>
          </div>
        )}
      </ModalOverlay>

      {/* Direct-To-Body Portal for Flawless A4 Print Preview (Starts at 0, 0 with NO top gap) */}
      {selectedInvoice &&
        typeof document !== 'undefined' &&
        createPortal(
          <div id="printable-invoice-portal">
            <InvoiceDocumentContent invoice={selectedInvoice} />
          </div>,
          document.body
        )}
    </div>
  );
}
