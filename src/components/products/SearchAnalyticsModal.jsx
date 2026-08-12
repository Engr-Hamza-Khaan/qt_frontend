import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import ModalOverlay from '../ui/ModalOverlay';
import {
  Search,
  TrendingUp,
  Pin,
  Trash2,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Flame,
  SearchX,
  BarChart3,
} from 'lucide-react';

export default function SearchAnalyticsModal({ open, onClose }) {
  const [analytics, setAnalytics] = useState({
    totalSearches: 0,
    uniqueQueries: 0,
    topSearches: [],
    zeroResultSearches: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTerm, setNewTerm] = useState('');
  const [addingTerm, setAddingTerm] = useState(false);
  const [activeTab, setActiveTab] = useState('popular'); // 'popular' | 'zero'

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.search.getAnalytics();
      if (res?.success && res.data) {
        setAnalytics(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch search analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAnalytics();
    }
  }, [open]);

  const handleAddTerm = async (e) => {
    e.preventDefault();
    if (!newTerm.trim()) return;
    setAddingTerm(true);
    try {
      const res = await api.search.addOrPinTerm({ term: newTerm.trim(), isPinned: true });
      if (res?.success) {
        setNewTerm('');
        fetchAnalytics();
      }
    } catch (err) {
      alert(err.message || 'Failed to add search term');
    } finally {
      setAddingTerm(false);
    }
  };

  const handleTogglePin = async (id) => {
    try {
      const res = await api.search.togglePinTerm(id);
      if (res?.success) {
        setAnalytics((prev) => ({
          ...prev,
          topSearches: prev.topSearches.map((item) =>
            item.id === id ? { ...item, isPinned: !item.isPinned } : item
          ),
        }));
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle pin');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this search term record?')) return;
    try {
      const res = await api.search.deleteTerm(id);
      if (res?.success) {
        setAnalytics((prev) => ({
          ...prev,
          topSearches: prev.topSearches.filter((item) => item.id !== id),
          zeroResultSearches: prev.zeroResultSearches.filter((item) => item.id !== id),
        }));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete term');
    }
  };

  return (
    <ModalOverlay open={open} align="center">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl mx-auto rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-white">
                Search Analytics & Trending Keywords
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track customer search demand, manage aliases, and pin trending search suggestions.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="p-3.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              Total Searches
            </span>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white mt-1">
              {Number(analytics.totalSearches || 0).toLocaleString()}
            </p>
          </div>

          <div className="p-3.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              Unique Queries
            </span>
            <p className="text-xl sm:text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
              {Number(analytics.uniqueQueries || 0).toLocaleString()}
            </p>
          </div>

          <div className="p-3.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              Zero-Result Terms
            </span>
            <p className="text-xl sm:text-2xl font-extrabold text-rose-500 mt-1">
              {analytics.zeroResultSearches?.length || 0}
            </p>
          </div>
        </div>

        {/* Add Pinned Term Form */}
        <div className="px-4 sm:px-6 pt-4">
          <form onSubmit={handleAddTerm} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                placeholder="Add & pin a trending search term (e.g. GTA 5, PS5 Pro, RDR)..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={addingTerm || !newTerm.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Pin Term</span>
            </button>
          </form>
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-6 pt-4 flex gap-2 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('popular')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'popular'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Popular & Pinned Searches ({analytics.topSearches?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('zero')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'zero'
                ? 'border-rose-500 text-rose-500'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <SearchX className="w-3.5 h-3.5" />
            <span>Missing / Zero-Result Searches ({analytics.zeroResultSearches?.length || 0})</span>
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
          {loading ? (
            <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-500" />
              <span>Loading search statistics...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 text-rose-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          ) : activeTab === 'popular' ? (
            analytics.topSearches.length > 0 ? (
              analytics.topSearches.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleTogglePin(item.id)}
                      title={item.isPinned ? 'Unpin search term' : 'Pin search term to storefront'}
                      className={`p-1.5 rounded-lg border transition ${
                        item.isPinned
                          ? 'bg-purple-500/20 text-purple-500 border-purple-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-600 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <Pin className={`w-3.5 h-3.5 ${item.isPinned ? 'fill-purple-500' : ''}`} />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-white capitalize">
                          {item.term}
                        </span>
                        {item.isPinned && (
                          <span className="px-1.5 py-0.2 bg-purple-500/15 text-purple-600 dark:text-purple-400 text-[10px] font-bold rounded-md border border-purple-500/30">
                            Featured Suggestion
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {item.resultsCount} catalog products matching
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold font-mono">
                      {item.searchCount} searches
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                No search term logs recorded yet.
              </div>
            )
          ) : analytics.zeroResultSearches.length > 0 ? (
            analytics.zeroResultSearches.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-rose-500/5 border border-rose-500/20"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-500 flex items-center justify-center">
                    <SearchX className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-800 dark:text-white capitalize">
                      {item.term}
                    </span>
                    <p className="text-[11px] text-rose-400 font-medium">
                      0 matching products found in catalog
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-rose-500/15 text-rose-400 rounded-lg text-xs font-bold font-mono">
                    {item.searchCount} attempts
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs flex flex-col items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <span>Great! All customer searches currently match catalog products.</span>
            </div>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
}
