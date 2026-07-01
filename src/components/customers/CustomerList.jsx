import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { 
  Users, Search, UserCheck, UserX, Clock, ShoppingCart, 
  Mail, Phone, BookOpen, AlertCircle, X, ChevronRight
} from 'lucide-react';

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Selected customer for modal
  const [selectedCust, setSelectedCust] = useState(null);
  const [custDetailsLoading, setCustDetailsLoading] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [supportNotes, setSupportNotes] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.customers.getAll();
      if (res.success) {
        setCustomers(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve customers list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSelectCustomer = async (cust) => {
    setCustDetailsLoading(true);
    setSelectedCust(cust);
    try {
      const res = await api.customers.getById(cust.id);
      if (res.success) {
        setOrderHistory(res.data.customer?.orders || []);
        setWishlist(res.data.wishlist || []);
        setSupportNotes(res.data.supportNotes || '');
      }
    } catch (err) {
      alert(err.message || 'Failed to retrieve profile details.');
    } finally {
      setCustDetailsLoading(false);
    }
  };

  const handleToggleStatus = async (cust, currentStatus) => {
    const confirmationText = currentStatus 
      ? `Are you sure you want to BLOCK ${cust.name}? They will lose access to log in.`
      : `Are you sure you want to ACTIVATE ${cust.name}'s account?`;
    
    if (!window.confirm(confirmationText)) return;

    try {
      const targetStatus = !currentStatus;
      const res = await api.customers.toggleStatus(cust.id, targetStatus);
      if (res.success) {
        // Refresh local list
        setCustomers(prev => prev.map(c => c.id === cust.id ? { ...c, isActive: targetStatus } : c));
        // Refresh detail view if open
        if (selectedCust && selectedCust.id === cust.id) {
          setSelectedCust(prev => ({ ...prev, isActive: targetStatus }));
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle account activation.');
    }
  };

  // Filtered List
  const filteredCustomers = customers.filter(c => {
    return c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           c.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
           (c.phoneNumber && c.phoneNumber.includes(searchTerm));
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Users className="w-7 h-7 text-blue-500" />
          Customers database
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Track customer accounts, profile details, wishlist trends, and block/unblock buyer profiles.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 flex items-center">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or telephone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
          />
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading accounts registry...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl py-20 text-center rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Customers Found</h3>
          <p className="text-slate-400 text-sm mt-1">Try refining your search keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map(cust => (
            <div 
              key={cust.id} 
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 hover:shadow-xl transition-all relative overflow-hidden group"
            >
              {/* Account Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  cust.isActive 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
                    : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                }`}>
                  {cust.isActive ? 'Active' : 'Blocked'}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/10">
                    {cust.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-blue-500 transition-colors">{cust.name}</h3>
                    <p className="text-xs text-slate-400">Registered {new Date(cust.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{cust.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{cust.phoneNumber || 'No phone registered'}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleStatus(cust, cust.isActive)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      cust.isActive 
                        ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30' 
                        : 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30'
                    }`}
                  >
                    {cust.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    {cust.isActive ? 'Block Account' : 'Activate Account'}
                  </button>

                  <button
                    onClick={() => handleSelectCustomer(cust)}
                    className="flex items-center gap-0.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-bold"
                  >
                    View details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL WITH ORDER HISTORY & WISHLIST */}
      {selectedCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl border border-slate-200/50 dark:border-slate-800 overflow-hidden shadow-2xl transition-all">
            
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center font-bold text-slate-800 dark:text-white">
                  {selectedCust.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">{selectedCust.name}</h3>
                  <p className="text-xs text-slate-400">{selectedCust.email}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedCust(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {custDetailsLoading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-xs text-slate-400">Loading profile data...</p>
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-h-[80vh] overflow-y-auto">
                
                {/* Left col: user facts & notes */}
                <div className="space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Metrics</h4>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status:</span>
                        <span className={`font-semibold ${selectedCust.isActive ? 'text-emerald-500' : 'text-red-500'}`}>
                          {selectedCust.isActive ? 'Active Active' : 'Blocked'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Orders:</span>
                        <span className="font-semibold text-slate-800 dark:text-white">{orderHistory.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Phone:</span>
                        <span className="font-semibold text-slate-800 dark:text-white">{selectedCust.phoneNumber || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Staff Notes</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-3 border border-slate-200/50 dark:border-slate-800 rounded-xl leading-relaxed">
                      "{supportNotes || 'No registration remarks.'}"
                    </p>
                  </div>
                </div>

                {/* Right col: orders & wishlist */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Order History */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sales Order Log</h4>
                    
                    {orderHistory.length === 0 ? (
                      <div className="border border-dashed border-slate-200 dark:border-slate-800/80 p-8 rounded-2xl text-center text-slate-400 text-sm">
                        No orders recorded for this customer yet.
                      </div>
                    ) : (
                      <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                              <th className="p-3">Order Number</th>
                              <th className="p-3">Date</th>
                              <th className="p-3 text-right">Total</th>
                              <th className="p-3 text-center">Fulfillment</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {orderHistory.map(order => (
                              <tr key={order.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/30">
                                <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">{order.orderNumber}</td>
                                <td className="p-3 text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="p-3 text-right font-bold text-slate-800 dark:text-white">${parseFloat(order.totalAmount).toFixed(2)}</td>
                                <td className="p-3 text-center">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 uppercase">
                                    {order.orderStatus}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Wishlist Tracking */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Favorites & Wishlist Tracking</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {wishlist.map(w => (
                        <div key={w.id} className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-300">{w.title}</p>
                            <p className="text-slate-400">${w.price}</p>
                          </div>
                          <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                            Tracked
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-right">
              <button 
                type="button"
                onClick={() => setSelectedCust(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default CustomerList;
