import { useState, useEffect, useRef, useMemo } from 'react';
import { api } from '../../api/client';
import { 
  MessageSquare, Wrench, DollarSign, Search, Clock, Check, X, Send, 
  User, Mail, Phone, Calendar, AlertCircle, RefreshCw, MessageCircle,
  Copy, ExternalLink, Trash2, Camera, ShieldAlert, Cpu, Gamepad2,
  FileText, CheckCircle2, ChevronRight, Tag
} from 'lucide-react';
import ModalOverlay from '../ui/ModalOverlay';

function ServiceTickets() {
  const [repairs, setRepairs] = useState([]);
  const [sells, setSells] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('repairs'); // repairs, sells, chats

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Detail & Editing States
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketNotes, setTicketNotes] = useState('');
  const [ticketStatus, setTicketStatus] = useState('');
  const [ticketPriority, setTicketPriority] = useState('Normal');
  const [ticketCost, setTicketCost] = useState('');
  const [ticketValuation, setTicketValuation] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Lightbox preview for photos
  const [previewImage, setPreviewImage] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Active chat session
  const [activeChat, setActiveChat] = useState(null);
  const [chatReplyText, setChatReplyText] = useState('');
  const chatMessagesEndRef = useRef(null);

  const fetchData = async (tab = activeTab, silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      if (tab === 'repairs') {
        const res = await api.services.getRepairs();
        if (res.success) setRepairs(res.data);
      } else if (tab === 'sells') {
        const res = await api.services.getSells();
        if (res.success) setSells(res.data);
      } else if (tab === 'chats') {
        const res = await api.services.getChats();
        if (res.success) setChats(res.data);
      }
    } catch (err) {
      if (!silent) setError(err.message || 'Failed to sync service tickets.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchTabCounts = async () => {
    try {
      const [repairsRes, sellsRes, chatsRes] = await Promise.all([
        api.services.getRepairs(),
        api.services.getSells(),
        api.services.getChats(),
      ]);
      if (repairsRes?.success) setRepairs(repairsRes.data);
      if (sellsRes?.success) setSells(sellsRes.data);
      if (chatsRes?.success) setChats(chatsRes.data);
    } catch {
      // Counts refresh silently; active tab fetch shows errors
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  // Real-time live polling for chats and active chat transcript
  useEffect(() => {
    let timer;
    if (activeTab === 'chats') {
      timer = setInterval(async () => {
        try {
          const chatsRes = await api.services.getChats();
          if (chatsRes.success) setChats(chatsRes.data);

          if (activeChat?.id) {
            const chatRes = await api.services.getChatById(activeChat.id);
            if (chatRes.success) {
              setActiveChat((prev) => {
                if (!prev) return chatRes.data;
                if (JSON.stringify(prev.messages) !== JSON.stringify(chatRes.data.messages)) {
                  return chatRes.data;
                }
                return prev;
              });
            }
          }
        } catch {
          // Silent catch during background poll
        }
      }, 4000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeTab, activeChat?.id]);

  // Scroll active chat to bottom on new messages
  useEffect(() => {
    if (activeChat) {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat?.messages?.length]);

  // Open Repair / Sell detail
  const handleOpenTicket = (ticket) => {
    setSelectedTicket(ticket);
    setTicketStatus(ticket.status || 'Pending');
    setTicketNotes(ticket.notes || '');
    setTicketPriority(ticket.priority || 'Normal');
    setTicketCost(ticket.estimatedCost !== undefined && ticket.estimatedCost !== null ? ticket.estimatedCost : '');
    setTicketValuation(ticket.valuation !== undefined && ticket.valuation !== null ? ticket.valuation : '');
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      let res;
      if (activeTab === 'repairs') {
        res = await api.services.updateRepair(selectedTicket.id, {
          status: ticketStatus,
          notes: ticketNotes,
          priority: ticketPriority,
          estimatedCost: ticketCost === '' ? 0 : parseFloat(ticketCost) || 0
        });
      } else {
        res = await api.services.updateSell(selectedTicket.id, {
          status: ticketStatus,
          notes: ticketNotes,
          valuation: ticketValuation === '' ? null : parseFloat(ticketValuation) || null
        });
      }

      if (res?.success) {
        setSelectedTicket(null);
        fetchData(activeTab, true);
        fetchTabCounts();
      }
    } catch (err) {
      alert(err.message || 'Failed to update ticket');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this repair request? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await api.services.deleteRepair(ticketId);
      if (res?.success) {
        setSelectedTicket(null);
        fetchData(activeTab, true);
        fetchTabCounts();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete repair request');
    }
  };

  const handleCopyTicketRef = (id) => {
    const refCode = `#REP-${id.slice(0, 8).toUpperCase()}`;
    navigator.clipboard.writeText(refCode);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopySummary = (ticket) => {
    const refCode = `#REP-${ticket.id.slice(0, 8).toUpperCase()}`;
    const lines = [
      `Quick Turn Repair Ticket: ${refCode}`,
      `Customer: ${ticket.customerName} (${ticket.customerEmail} / ${ticket.customerPhone || 'No phone'})`,
      `Device: ${ticket.deviceModel || ticket.deviceType || 'Console'}`,
      `Issue: ${ticket.issueType || 'Diagnostic'}`,
      `Status: ${ticketStatus || ticket.status}`,
      `Quoted Cost: ${ticketCost ? `$${ticketCost}` : 'Pending diagnosis'}`,
      `Description: ${ticket.description}`,
      ticketNotes ? `Technician Notes: ${ticketNotes}` : ''
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(lines);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  // Open Chat Conversation
  const handleSelectChat = async (chat) => {
    try {
      const res = await api.services.getChatById(chat.id);
      if (res.success) {
        setActiveChat(res.data);
        setChatReplyText('');
      }
    } catch (err) {
      alert(err.message || 'Error fetching chat transcript.');
    }
  };

  const handleSendChatReply = async (e) => {
    e.preventDefault();
    if (!chatReplyText.trim() || !activeChat) return;

    const replyText = chatReplyText.trim();
    setChatReplyText('');

    // Optimistic update of transcript locally
    const optimisticMsg = { sender: 'agent', text: replyText, timestamp: new Date().toISOString() };
    setActiveChat(prev => ({
      ...prev,
      messages: [...(prev?.messages || []), optimisticMsg]
    }));

    try {
      const res = await api.services.replyToChat(activeChat.id, replyText);
      if (res.success && res.data) {
        setActiveChat(res.data);
        const chatsListRes = await api.services.getChats();
        if (chatsListRes.success) setChats(chatsListRes.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to send chat reply');
    }
  };

  // Filtered repairs based on search query and status filter
  const filteredRepairs = useMemo(() => {
    return repairs.filter((rep) => {
      // Status filter
      if (statusFilter !== 'All' && rep.status !== statusFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const refCode = `#rep-${rep.id.slice(0, 8).toLowerCase()}`;
        const matchName = rep.customerName?.toLowerCase().includes(q);
        const matchEmail = rep.customerEmail?.toLowerCase().includes(q);
        const matchPhone = rep.customerPhone?.toLowerCase().includes(q);
        const matchModel = rep.deviceModel?.toLowerCase().includes(q);
        const matchIssue = rep.issueType?.toLowerCase().includes(q);
        const matchDesc = rep.description?.toLowerCase().includes(q);
        const matchRef = refCode.includes(q) || rep.id.toLowerCase().includes(q);

        return matchName || matchEmail || matchPhone || matchModel || matchIssue || matchDesc || matchRef;
      }
      return true;
    });
  }, [repairs, statusFilter, searchQuery]);

  // Statistics counters
  const stats = useMemo(() => {
    return {
      total: repairs.length,
      pending: repairs.filter(r => r.status === 'Pending').length,
      processing: repairs.filter(r => r.status === 'Processing').length,
      completed: repairs.filter(r => r.status === 'Completed').length,
    };
  }, [repairs]);

  return (
    <div className="space-y-6">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <Wrench className="w-6 h-6" />
            </div>
            Support Tickets & Service Requests
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Manage console repairs, intake diagnostics, trade-in valuations, and real-time live support.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchData(activeTab)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setActiveTab('repairs');
            setSelectedTicket(null);
            setActiveChat(null);
          }}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'repairs' 
              ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Console Repair Intake ({repairs.length})
        </button>
        
        <button
          type="button"
          onClick={() => {
            setActiveTab('sells');
            setSelectedTicket(null);
            setActiveChat(null);
          }}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'sells' 
              ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Valuations & Sells ({sells.length})
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('chats');
            setSelectedTicket(null);
            setActiveChat(null);
          }}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'chats' 
              ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Live Chats ({chats.length})
        </button>
      </div>

      {/* Main Panel Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Syncing tickets dashboard...</p>
        </div>
      ) : (
        <div>
          
          {/* TAB 1: CONSOLE REPAIR INTAKE */}
          {activeTab === 'repairs' && (
            <div className="space-y-4">
              
              {/* Quick KPI Stats Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 shadow-sm">
                  <span className="text-xs font-semibold text-slate-400 block">Total Repair Tickets</span>
                  <span className="text-2xl font-bold text-slate-800 dark:text-white mt-1 block">{stats.total}</span>
                </div>
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 shadow-sm">
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 block">Pending Intake</span>
                  <span className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1 block">{stats.pending}</span>
                </div>
                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 shadow-sm">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block">In Diagnostics</span>
                  <span className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1 block">{stats.processing}</span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 shadow-sm">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block">Completed</span>
                  <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1 block">{stats.completed}</span>
                </div>
              </div>

              {/* Search & Status Filters Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
                
                {/* Search Box */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by customer, phone, device, issue or ticket ref..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Status Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {['All', 'Pending', 'Processing', 'Completed', 'Archived'].map((status) => (
                    <button
                      type="button"
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                        statusFilter === status
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

              </div>

              {/* Repairs List Table */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Ticket Ref</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Customer</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Device & Model</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Issue & Defect</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Photos</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Date Logged</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {filteredRepairs.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-sm text-slate-400">
                          {searchQuery || statusFilter !== 'All' 
                            ? 'No repair tickets match the active search / filter criteria.'
                            : 'No repair requests logged yet. Customer submissions from /repair will appear here.'
                          }
                        </td>
                      </tr>
                    )}
                    {filteredRepairs.map((rep) => {
                      const refCode = `#REP-${rep.id.slice(0, 8).toUpperCase()}`;
                      const hasPhotos = Array.isArray(rep.mediaUrls) && rep.mediaUrls.length > 0;
                      const isUrgent = rep.priority === 'Urgent';

                      return (
                        <tr key={rep.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                          
                          {/* Ticket Ref & Priority */}
                          <td className="p-4 align-top">
                            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 block">
                              {refCode}
                            </span>
                            {isUrgent && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 mt-1">
                                <ShieldAlert className="w-3 h-3" /> URGENT
                              </span>
                            )}
                          </td>

                          {/* Customer */}
                          <td className="p-4 align-top">
                            <div className="font-bold text-slate-800 dark:text-white text-sm">{rep.customerName}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{rep.customerEmail}</div>
                            {rep.customerPhone && (
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {rep.customerPhone}
                              </div>
                            )}
                          </td>

                          {/* Device & Model */}
                          <td className="p-4 align-top">
                            <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                              {rep.deviceModel || (rep.deviceType ? `${rep.deviceType} Hardware` : 'Console')}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {rep.deviceType || 'Console'}
                              </span>
                              {rep.serialNumber && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  SN: {rep.serialNumber}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Issue & Defect */}
                          <td className="p-4 align-top max-w-xs">
                            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-0.5">
                              {rep.issueType || 'Diagnostic'}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                              {rep.description}
                            </p>
                          </td>

                          {/* Photos */}
                          <td className="p-4 align-top text-center">
                            {hasPhotos ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold">
                                <Camera className="w-3.5 h-3.5" />
                                {rep.mediaUrls.length}
                              </span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="p-4 align-top text-xs">
                            <span className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] inline-block ${
                              rep.status === 'Completed' 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20' 
                                : rep.status === 'Processing'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-500/20'
                                : rep.status === 'Archived'
                                ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-500/20'
                            }`}>
                              {rep.status}
                            </span>
                          </td>

                          {/* Date Logged */}
                          <td className="p-4 align-top text-xs text-slate-400 whitespace-nowrap">
                            <div>{new Date(rep.createdAt).toLocaleDateString()}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="p-4 align-top text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenTicket(rep)}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-sm transition"
                            >
                              Review Details
                            </button>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 2: VALUATION / SELL REQUESTS */}
          {activeTab === 'sells' && (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Customer</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Proposed Product</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Description</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {sells.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-sm text-slate-400">
                        No sell/trade-in requests yet. Submissions from <span className="font-semibold">/sell</span> will appear here.
                      </td>
                    </tr>
                  )}
                  {sells.map(sell => (
                    <tr key={sell.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-4">
                        <div className="font-bold text-slate-800 dark:text-white text-sm">{sell.customerName}</div>
                        <div className="text-xs text-slate-400">{sell.customerEmail}</div>
                      </td>
                      <td className="p-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {sell.productName}
                      </td>
                      <td className="p-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {sell.description}
                      </td>
                      <td className="p-4 text-xs">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          sell.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400'
                        }`}>
                          {sell.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenTicket(sell)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-white text-xs font-semibold rounded-lg"
                        >
                          Review valuation
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: LIVE SUPPORT CHATS & INBOX */}
          {activeTab === 'chats' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
              
              {/* Left Inbox List */}
              <div className="lg:col-span-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20">
                  <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Chat Conversations inbox</h3>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
                  {chats.length === 0 && (
                    <p className="p-6 text-center text-sm text-slate-400">
                      No live chat conversations yet. Customer messages from the store chatbot will appear here.
                    </p>
                  )}
                  {chats.map(chat => {
                    const latestMsg = chat.messages?.[chat.messages.length - 1];
                    const isSelected = activeChat?.id === chat.id;

                    return (
                      <button
                        type="button"
                        key={chat.id}
                        onClick={() => handleSelectChat(chat)}
                        className={`w-full text-left p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all flex items-start gap-3 ${
                          isSelected ? 'bg-blue-50/50 dark:bg-blue-950/20 border-r-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 flex-shrink-0">
                          {(chat.customerName || '?')[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-xs text-slate-800 dark:text-white truncate">{chat.customerName}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {chat.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {latestMsg ? latestMsg.text : 'Click to read conversation'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Active Conversation panel */}
              <div className="lg:col-span-2 bg-slate-950 rounded-3xl border border-slate-900 overflow-hidden flex flex-col relative text-white">
                {activeChat ? (
                  <>
                    {/* Header */}
                    <div className="p-4 border-b border-slate-900 bg-slate-900/60 backdrop-blur-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                          {(activeChat.customerName || '?')[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white">{activeChat.customerName}</h4>
                          <p className="text-[10px] text-slate-400">{activeChat.customerEmail}</p>
                        </div>
                      </div>
                      
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono text-slate-400">
                        {activeChat.customerSessionId}
                      </span>
                    </div>

                    {/* Messages Scroll area */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-4">
                      {activeChat.messages?.map((msg, index) => {
                        const isCustomer = msg.sender === 'customer';
                        return (
                          <div 
                            key={index}
                            className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}
                          >
                            <div className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isCustomer 
                                ? 'bg-slate-900 border border-slate-800 text-white rounded-tl-none' 
                                : 'btn-brand text-white rounded-tr-none'
                            }`}>
                              <p>{msg.text}</p>
                              <span className="text-[8px] text-slate-400 block mt-1 text-right font-mono">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatMessagesEndRef} />
                    </div>

                    {/* Reply Input Form */}
                    <form onSubmit={handleSendChatReply} className="p-4 border-t border-slate-900 bg-slate-900/40 flex items-center gap-2">
                      <input
                        type="text"
                        value={chatReplyText}
                        onChange={(e) => setChatReplyText(e.target.value)}
                        placeholder="Type standard reply text to customer window..."
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                      <button
                        type="submit"
                        className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition shadow-lg"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <MessageSquare className="w-12 h-12 text-slate-800 mb-3 animate-pulse" />
                    <h4 className="text-sm font-bold text-slate-400">No Chat Selected</h4>
                    <p className="text-xs text-slate-600 mt-1 max-w-xs">Pick an active customer support thread from the inbox panel to read transcripts and write replies.</p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* COMPREHENSIVE TICKET DETAILS MODAL */}
      <ModalOverlay open={!!selectedTicket}>
        {selectedTicket && (
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-2xl transition-all max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                  {activeTab === 'repairs' ? <Wrench className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                      {activeTab === 'repairs' ? 'Repair Ticket Details' : 'Trade-In Valuation Ticket'}
                    </h3>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      #REP-{selectedTicket.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Logged on {new Date(selectedTicket.createdAt).toLocaleDateString()} at {new Date(selectedTicket.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyTicketRef(selectedTicket.id)}
                  title="Copy Ticket Reference"
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  {copiedId ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateTicket} className="p-6 space-y-6">
              
              {/* Top Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Customer Contact Details Card */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/80 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-500" /> Customer Information
                    </span>
                    {selectedTicket.preferredContact && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        Prefers: {selectedTicket.preferredContact}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Full Name:</span>
                      <span className="font-semibold text-slate-800 dark:text-white text-sm">
                        {selectedTicket.customerName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Email Address:</span>
                        <a 
                          href={`mailto:${selectedTicket.customerEmail}`}
                          className="font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3" />
                          {selectedTicket.customerEmail}
                        </a>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Phone / WhatsApp:</span>
                      {selectedTicket.customerPhone ? (
                        <div className="flex items-center gap-2 mt-0.5">
                          <a
                            href={`tel:${selectedTicket.customerPhone}`}
                            className="font-mono text-slate-700 dark:text-slate-200 hover:text-blue-500 flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3 text-emerald-500" />
                            {selectedTicket.customerPhone}
                          </a>
                          <a
                            href={`https://wa.me/${selectedTicket.customerPhone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-md text-[10px] font-bold transition"
                          >
                            WhatsApp
                          </a>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not provided</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Device & Hardware Details Card */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/80 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Gamepad2 className="w-3.5 h-3.5 text-blue-500" /> Device & Intake Details
                    </span>
                    {selectedTicket.priority && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedTicket.priority === 'Urgent'
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}>
                        {selectedTicket.priority} Priority
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">
                        {activeTab === 'repairs' ? 'Device Model:' : 'Product Proposed:'}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-white text-sm">
                        {activeTab === 'repairs' 
                          ? (selectedTicket.deviceModel || selectedTicket.deviceType || 'Console')
                          : selectedTicket.productName
                        }
                      </span>
                    </div>

                    {activeTab === 'repairs' && (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Device Category:</span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">
                              {selectedTicket.deviceType || 'Console'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Primary Issue:</span>
                            <span className="font-medium text-indigo-600 dark:text-indigo-400">
                              {selectedTicket.issueType || 'Diagnostic'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Serial Number:</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300">
                              {selectedTicket.serialNumber || 'Not provided'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Accessories Included:</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300 truncate block">
                              {selectedTicket.accessoriesIncluded || 'Device only'}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

              </div>

              {/* Customer Defect Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  Customer Symptom Description & Defect Report
                </label>
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-950/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                  {selectedTicket.description}
                </div>
              </div>

              {/* Attached Photos / Defect Media Gallery */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-blue-500" />
                    Customer Attached Media ({Array.isArray(selectedTicket.mediaUrls) ? selectedTicket.mediaUrls.length : 0})
                  </label>
                </div>

                {Array.isArray(selectedTicket.mediaUrls) && selectedTicket.mediaUrls.length > 0 ? (
                  <div className="flex flex-wrap gap-3 p-3 bg-slate-50 dark:bg-slate-950/30 rounded-2xl border border-slate-100 dark:border-slate-850">
                    {selectedTicket.mediaUrls.map((url, idx) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewImage(url)}
                        className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 cursor-pointer hover:opacity-80 transition relative group"
                      >
                        <img src={url} alt={`Defect proof ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition text-xs font-bold">
                          Zoom
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-xs text-slate-400 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-850 italic">
                    No photo attachments uploaded with this ticket.
                  </div>
                )}
              </div>

              {/* Status, Priority & Valuation / Cost Workflow */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-850">
                
                {/* Status Dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Ticket Status</label>
                  <select
                    value={ticketStatus}
                    onChange={(e) => setTicketStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none dark:text-white"
                  >
                    {activeTab === 'repairs' ? (
                      <>
                        <option value="Pending">Pending Intake</option>
                        <option value="Processing">Processing / In Diagnostics</option>
                        <option value="Completed">Completed & Tested</option>
                        <option value="Archived">Archived / Closed</option>
                      </>
                    ) : (
                      <>
                        <option value="Pending">Pending Valuation</option>
                        <option value="Approved">Approved Offer</option>
                        <option value="Rejected">Rejected</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Priority (Repairs) */}
                {activeTab === 'repairs' ? (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Priority Level</label>
                    <select
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none dark:text-white"
                    >
                      <option value="Normal">Normal Turnaround</option>
                      <option value="Urgent">Urgent / Rush</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Offered Valuation ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={ticketValuation}
                      onChange={(e) => setTicketValuation(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none dark:text-white"
                    />
                  </div>
                )}

                {/* Quoted / Estimated Cost (Repairs) */}
                {activeTab === 'repairs' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Estimated / Quoted Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={ticketCost}
                      onChange={(e) => setTicketCost(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none dark:text-white"
                    />
                  </div>
                )}

              </div>

              {/* Technician Diagnostic Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Technical Diagnostic & Internal Action Notes
                </label>
                <textarea
                  value={ticketNotes}
                  onChange={(e) => setTicketNotes(e.target.value)}
                  rows="3"
                  placeholder="Record parts replaced (e.g. HDMI port IC, Hall-effect joysticks), warranty terms, diagnostic results, tracking numbers, or customer communication logs..."
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none dark:text-white"
                />
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopySummary(selectedTicket)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition"
                  >
                    {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSummary ? 'Summary Copied' : 'Copy Ticket Summary'}
                  </button>

                  {activeTab === 'repairs' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTicket(selectedTicket.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="btn-brand px-5 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-2"
                  >
                    {isUpdating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save Ticket Changes</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

            </form>
          </div>
        )}
      </ModalOverlay>

      {/* LIGHTBOX FOR DEFECT PHOTO PREVIEW */}
      <ModalOverlay open={!!previewImage}>
        {previewImage && (
          <div className="bg-black/90 p-4 rounded-3xl max-w-4xl max-h-[90vh] flex flex-col items-center justify-center relative shadow-2xl">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage}
              alt="Defect proof full view"
              className="max-h-[80vh] max-w-full object-contain rounded-xl"
            />
            <div className="mt-3 flex items-center gap-3 text-xs text-white/80">
              <a
                href={previewImage}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center gap-1 text-blue-400"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open full size in new tab
              </a>
            </div>
          </div>
        )}
      </ModalOverlay>

    </div>
  );
}

export default ServiceTickets;
