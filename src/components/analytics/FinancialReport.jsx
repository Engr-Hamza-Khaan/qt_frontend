import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { 
  TrendingUp, Calendar, Filter, DollarSign, PieChart, Briefcase, 
  ArrowUpRight, ArrowDownRight, Award, ShieldAlert
} from 'lucide-react';

function FinancialReport() {
  const [report, setReport] = useState(null);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters State
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');

  const fetchFiltersAndData = async () => {
    setLoading(true);
    try {
      // Fetch categories & vendors to populate filter dropdowns
      const catRes = await api.categories.getAll();
      if (catRes.success) setCategories(catRes.data);

      const vendorRes = await api.vendors.getAll();
      if (vendorRes.success) setVendors(vendorRes.data);

      // Fetch financial metrics
      await fetchFinancialMetrics();
    } catch (err) {
      setError(err.message || 'Error syncing data catalogs.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancialMetrics = async () => {
    try {
      const params = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (selectedCat) params.categoryId = selectedCat;
      if (selectedVendor) params.vendorId = selectedVendor;

      const res = await api.reports.getFinancialReport(params);
      if (res.success) {
        setReport(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch financial stats.');
    }
  };

  useEffect(() => {
    fetchFiltersAndData();
  }, []);

  const handleApplyFilters = async (e) => {
    e.preventDefault();
    setLoading(true);
    await fetchFinancialMetrics();
    setLoading(false);
  };

  const handleResetFilters = async () => {
    setDateFrom('');
    setDateTo('');
    setSelectedCat('');
    setSelectedVendor('');
    setLoading(true);
    try {
      const res = await api.reports.getFinancialReport({});
      if (res.success) setReport(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const summary = report?.summary || {
    grossRevenue: 0,
    costOfGoodsSold: 0,
    netProfit: 0,
    profitMargin: 0
  };

  const productPerformance = report?.performanceByProduct 
    ? Object.values(report.performanceByProduct) 
    : [];

  const categoryPerformance = report?.performanceByCategory 
    ? Object.values(report.performanceByCategory) 
    : [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-blue-500" />
          Financial ledger & analytics
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Track platform gross receipts, cost of goods (COGS), net yield margins, and product performance listings.
        </p>
      </div>

      {/* Filter Toolbar Form */}
      <form onSubmit={handleApplyFilters} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-md grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">From Date</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs focus:outline-none dark:text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">To Date</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs focus:outline-none dark:text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs focus:outline-none dark:text-white"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.platform})</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Supplier</label>
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs focus:outline-none dark:text-white"
          >
            <option value="">All Suppliers</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>{v.companyName}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl text-xs transition shadow-md"
          >
            Filter
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl text-xs transition"
          >
            Reset
          </button>
        </div>
      </form>

      {/* KPI Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm mt-3">Re-calculating financials...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* CARD 1: Gross Sales */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-md relative overflow-hidden group">
              <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[30px]" />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Gross Revenue</p>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                    ${parseFloat(summary.grossRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="p-2.5 bg-blue-500/10 rounded-2xl text-blue-500">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-emerald-500">
                <ArrowUpRight className="w-4 h-4" />
                <span>Gross sales receipt sum</span>
              </div>
            </div>

            {/* CARD 2: Cost of Goods Sold */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-md relative overflow-hidden group">
              <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[30px]" />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Cost of Goods (COGS)</p>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                    ${parseFloat(summary.costOfGoodsSold || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-500">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-amber-500">
                <ArrowUpRight className="w-4 h-4" />
                <span>Vendor payout cost allocations</span>
              </div>
            </div>

            {/* CARD 3: Net Profits */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-md relative overflow-hidden group">
              <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[30px]" />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Net Profit Yield</p>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                    ${parseFloat(summary.netProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-500">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-emerald-500">
                <ArrowUpRight className="w-4 h-4" />
                <span>Retained admin share</span>
              </div>
            </div>

            {/* CARD 4: Profit Margin */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-md relative overflow-hidden group">
              <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[30px]" />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Profit Margin</p>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                    {parseFloat(summary.profitMargin || 0).toFixed(1)}%
                  </h3>
                </div>
                <div className="p-2.5 bg-purple-500/10 rounded-2xl text-purple-500">
                  <PieChart className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-purple-500">
                <ArrowUpRight className="w-4 h-4" />
                <span>Yield efficiency percentage</span>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Product Performance Table List */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Award className="w-5 h-5 text-blue-500" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">Product Sales Leaderboard</h4>
              </div>
              
              {productPerformance.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  No product sales reports match filters.
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {productPerformance.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-2xl">
                      <div className="flex-1 min-w-0 pr-3">
                        <h5 className="font-bold text-xs text-slate-800 dark:text-white truncate">{p.title}</h5>
                        <p className="text-[10px] text-slate-400 mt-0.5">{p.qtySold} items ordered</p>
                      </div>
                      
                      <div className="text-right text-xs">
                        <span className="font-bold text-slate-800 dark:text-white">${parseFloat(p.revenue).toFixed(2)}</span>
                        <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">${parseFloat(p.profit).toFixed(2)} net</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category Performance list */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <PieChart className="w-5 h-5 text-purple-500" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">Performance by category</h4>
              </div>
              
              {categoryPerformance.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  No category performance matches filters.
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {categoryPerformance.map(c => (
                    <div key={c.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-2xl">
                      <div>
                        <h5 className="font-bold text-xs text-slate-800 dark:text-white">{c.name}</h5>
                        <p className="text-[10px] text-slate-400 mt-0.5">{c.qtySold} units dispatched</p>
                      </div>
                      
                      <div className="text-right text-xs">
                        <span className="font-bold text-slate-800 dark:text-white">${parseFloat(c.revenue).toFixed(2)}</span>
                        <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">${parseFloat(c.profit).toFixed(2)} yield</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default FinancialReport;
