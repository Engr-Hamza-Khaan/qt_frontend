import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { 
  ShoppingBag, Search, Eye, RefreshCw, Truck, CreditCard, 
  User, CheckCircle, Clock, X, AlertCircle, Award, ExternalLink, Trash2
} from 'lucide-react';
import ModalOverlay from '../ui/ModalOverlay';
import { formatCurrency } from '../../utils/formatters';

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  // Selected Order for detail view / modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [assigningItemId, setAssigningItemId] = useState(null);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  
  // Status edit values
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Current logged in user info (to restrict options depending on Vendor role)
  const currentUser = api.auth.getCurrentUser();
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';
  const canManageOrders = ['Admin', 'Super Admin', 'Staff'].includes(currentUser?.role);

  const fetchData = async () => {
    setLoading(true);
    try {
      const orderRes = await api.orders.getAll();
      if (orderRes.success) setOrders(orderRes.data);

      if (isAdmin) {
        const vendorRes = await api.vendors.getAll();
        if (vendorRes.success) setVendors(vendorRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve order records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter logic
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (o.customer?.name && o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter ? o.orderStatus === statusFilter : true;
    const matchesPayment = paymentFilter ? o.paymentStatus === paymentFilter : true;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleViewDetails = async (orderId) => {
    try {
      const res = await api.orders.getById(orderId);
      if (res.success) {
        setSelectedOrder(res.data);
        setOrderStatus(res.data.orderStatus);
        setPaymentStatus(res.data.paymentStatus);
        setCarrier(res.data.carrier || '');
        setTrackingNumber(res.data.trackingNumber || '');
        setOrderNotes(res.data.orderNotes || '');
        setAssigningItemId(null);
        setSelectedVendorId('');
      }
    } catch (err) {
      alert(err.message || 'Error fetching order details');
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      const res = await api.orders.updateStatus(selectedOrder.id, {
        orderStatus,
        paymentStatus,
        carrier,
        trackingNumber,
        orderNotes
      });
      if (res.success) {
        alert('Order updated successfully!');
        handleViewDetails(selectedOrder.id);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error updating order statuses');
    }
  };

  const handleAssignSupplier = async (itemId) => {
    if (!selectedVendorId) {
      alert('Please choose a supplier vendor profile first.');
      return;
    }

    try {
      const res = await api.orders.assignSupplier(selectedOrder.id, itemId, selectedVendorId);
      if (res.success) {
        alert('Supplier assigned and inventory allocated!');
        handleViewDetails(selectedOrder.id);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error assigning supplier');
    }
  };

  const handleDeleteOrder = async (order) => {
    const confirmed = window.confirm(
      `Delete order ${order.orderNumber}? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const res = await api.orders.delete(order.id);
      if (res.success) {
        if (selectedOrder?.id === order.id) setSelectedOrder(null);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error deleting order');
    }
  };

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400 border border-yellow-200/50 dark:border-yellow-900/30';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border border-red-200/50 dark:border-red-900/30';
      case 'Processing':
      case 'Supplier Assigned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30';
      case 'Refunded':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <ShoppingBag className="w-7 h-7 text-blue-500" />
          Orders & Fulfillment
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Track sales, dispatch status, record tracking numbers, and assign supplier channels.
        </p>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by order number or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Order Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Supplier Assigned">Supplier Assigned</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Refunded">Refunded</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Payments</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Fetching orders records...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl py-20 text-center rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
          <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Orders Registered</h3>
          <p className="text-slate-400 text-sm mt-1">Orders placed by customers will reflect here.</p>
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/20">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Order Ref</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Customer</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Items Count</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Total Amount</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Fulfillment</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Payment</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {o.orderNumber}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-semibold text-slate-800 dark:text-white">
                        {o.customer?.name || 'Guest User'}
                      </div>
                      <div className="text-xs text-slate-400">{o.customer?.email || 'N/A'}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-700 dark:text-slate-300 text-right">
                      {o.items?.length || 0}
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-800 dark:text-white text-right">
                      {formatCurrency(o.totalAmount)}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${getOrderStatusBadge(o.orderStatus)}`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${getPaymentStatusBadge(o.paymentStatus)}`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(o.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition"
                        >
                          Details
                        </button>
                        {canManageOrders && (
                          <button
                            onClick={() => handleDeleteOrder(o)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                            title="Delete order"
                            aria-label={`Delete order ${o.orderNumber}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* DETAIL MODAL WITH SHIPPER ASSIGNMENT & STATUS UPDATE */}
      <ModalOverlay open={!!selectedOrder}>
        {selectedOrder && (
          <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-3xl border border-slate-200/50 dark:border-slate-800 overflow-hidden shadow-2xl transition-all">
            
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                  Order Details: <span className="text-blue-600 dark:text-blue-400">{selectedOrder.orderNumber}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-h-[85vh] overflow-y-auto">
              
              {/* Left Column: items & assignment */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Order Items Section */}
                <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-4">
                  <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 border-b border-slate-200/50 dark:border-slate-800 pb-2">
                    Line Items & Fulfillment Allocation
                  </h4>
                  
                  <div className="space-y-4">
                    {selectedOrder.items?.map(item => {
                      const variation = item.variation;
                      const product = variation?.product;
                      return (
                        <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl">
                          <div className="flex-1">
                            <h5 className="font-bold text-sm text-slate-800 dark:text-white">{product?.title || 'Unknown Product'}</h5>
                            <p className="text-xs text-slate-400 mt-0.5">SKU: {variation?.sku || 'N/A'}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              Qty: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.quantity}</span> | 
                              Price: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(item.price)}</span>
                            </p>
                          </div>
                          
                          {/* Assignment flow */}
                          <div className="flex flex-wrap items-center justify-end gap-3 shrink-0">
                            <div className="text-right">
                              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Fulfillment status</div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md mt-0.5 inline-block ${
                                item.fulfillmentStatus === 'Assigned' 
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400'
                              }`}>
                                {item.fulfillmentStatus}
                              </span>
                              {item.assignedVendor && (
                                <p className="text-[10px] text-slate-400 mt-0.5">Vendor: {item.assignedVendor.companyName}</p>
                              )}
                            </div>

                            {/* Admin Supplier Assign Dropdown */}
                            {isAdmin && item.fulfillmentStatus === 'Unassigned' && (
                              <div className="flex flex-col gap-1 items-end">
                                {assigningItemId === item.id ? (
                                  <div className="flex gap-1.5">
                                    <select
                                      value={selectedVendorId}
                                      onChange={(e) => setSelectedVendorId(e.target.value)}
                                      className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-300 focus:outline-none"
                                    >
                                      <option value="">Select Supplier</option>
                                      {vendors.map(v => (
                                        <option key={v.id} value={v.id}>{v.companyName} ({formatCurrency(v.balance)} bal)</option>
                                      ))}
                                    </select>
                                    <button 
                                      onClick={() => handleAssignSupplier(item.id)}
                                      className="btn-brand px-2 py-1 rounded-lg text-[10px] font-bold"
                                    >
                                      Assign
                                    </button>
                                    <button 
                                      onClick={() => setAssigningItemId(null)}
                                      className="px-1.5 py-1 bg-slate-200 text-slate-600 rounded-lg text-[10px]"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setAssigningItemId(item.id);
                                      setSelectedVendorId('');
                                    }}
                                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition"
                                  >
                                    Assign Vendor
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shipping & Delivery Address Info */}
                <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Shipping Destination</h5>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <Truck className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div>
                        <p>{selectedOrder.shippingAddress?.streetAddress || 'N/A'}</p>
                        <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode}</p>
                        <p>{selectedOrder.shippingAddress?.country}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Customer Context</h5>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <User className="w-4 h-4 text-purple-500 mt-0.5" />
                      <div>
                        <p>{selectedOrder.customer?.name || 'Guest Checkout'}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{selectedOrder.customer?.email}</p>
                        <p className="text-xs text-slate-400">{selectedOrder.customer?.phoneNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Update statuses & logistics */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Billing Summary */}
                <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3">
                  <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 border-b border-slate-200/50 dark:border-slate-800 pb-2">
                    Payment Invoice
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-500">
                      <span>Payment Method:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-300">{selectedOrder.paymentMethod || 'Credit Card'}</span>
                    </div>
                    {selectedOrder.couponCode && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Coupon ({selectedOrder.couponCode}):</span>
                        <span>-{formatCurrency(selectedOrder.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold border-t border-slate-200 dark:border-slate-800 pt-2 text-slate-800 dark:text-white">
                      <span>Grand Total:</span>
                      <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Edit Form - Only visible to Admins/Staff */}
                {isAdmin ? (
                  <form onSubmit={handleUpdateStatus} className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-4">
                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 border-b border-slate-200/50 dark:border-slate-800 pb-2">
                      Fulfillment Logistics
                    </h4>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Order Status</label>
                      <select
                        value={orderStatus}
                        onChange={(e) => setOrderStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Supplier Assigned">Supplier Assigned</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Payment Status</label>
                      <select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Shipping Carrier</label>
                      <input
                        type="text"
                        value={carrier}
                        onChange={(e) => setCarrier(e.target.value)}
                        placeholder="DHL / FedEx / TCS"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Tracking Number</label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Tracking reference link code"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Internal Panel Notes</label>
                      <textarea
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        rows="2"
                        placeholder="Supplier dispatch instructions..."
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn-brand w-full py-2.5 font-bold rounded-xl text-xs"
                    >
                      Update Order logistics
                    </button>
                  </form>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Order Logistics Info</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300">Carrier: <span className="font-bold">{selectedOrder.carrier || 'N/A'}</span></p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">Tracking: <span className="font-bold">{selectedOrder.trackingNumber || 'N/A'}</span></p>
                    <p className="text-xs text-slate-400 bg-white dark:bg-slate-900 p-2.5 border border-slate-200/50 dark:border-slate-800 rounded-lg">
                      Note: Update requests must be routed via central administration clerk profile.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 flex items-center justify-between gap-3">
              {canManageOrders && (
                <button
                  type="button"
                  onClick={() => handleDeleteOrder(selectedOrder)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 rounded-xl font-bold text-xs transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Order
                </button>
              )}
              <button 
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="ml-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition"
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </ModalOverlay>

    </div>
  );
}

export default OrderList;
