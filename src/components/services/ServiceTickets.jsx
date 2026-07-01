import { useState, useEffect, useRef } from 'react';
import { api } from '../../api/client';
import { 
  MessageSquare, Wrench, DollarSign, Search, Clock, Check, X, Send, 
  User, Mail, Phone, Calendar, AlertCircle, RefreshCw, MessageCircle
} from 'lucide-react';

function ServiceTickets() {
  const [repairs, setRepairs] = useState([]);
  const [sells, setSells] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('repairs'); // repairs, sells, chats

  // Detail & Editing States
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketNotes, setTicketNotes] = useState('');
  const [ticketStatus, setTicketStatus] = useState('');

  // Active chat session
  const [activeChat, setActiveChat] = useState(null);
  const [chatReplyText, setChatReplyText] = useState('');
  const chatMessagesEndRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'repairs') {
        const res = await api.services.getRepairs();
        if (res.success) setRepairs(res.data);
      } else if (activeTab === 'sells') {
        const res = await api.services.getSells();
        if (res.success) setSells(res.data);
      } else if (activeTab === 'chats') {
        const res = await api.services.getChats();
        if (res.success) setChats(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to sync service tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Scroll active chat to bottom
  useEffect(() => {
    if (activeChat) {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat]);

  // Open Repair / Sell detail
  const handleOpenTicket = (ticket) => {
    setSelectedTicket(ticket);
    setTicketStatus(ticket.status);
    setTicketNotes(ticket.notes || '');
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (activeTab === 'repairs') {
        res = await api.services.updateRepair(selectedTicket.id, {
          status: ticketStatus,
          notes: ticketNotes
        });
      } else {
        res = await api.services.updateSell(selectedTicket.id, {
          status: ticketStatus,
          notes: ticketNotes
        });
      }

      if (res.success) {
        alert('Ticket updated successfully!');
        setSelectedTicket(null);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to update ticket');
    }
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
    if (!chatReplyText.trim()) return;

    try {
      const res = await api.services.replyToChat(activeChat.id, chatReplyText);
      if (res.success) {
        // Optimistic update of transcript locally
        setActiveChat(prev => ({
          ...prev,
          messages: [
            ...prev.messages,
            { sender: 'bot', text: chatReplyText, timestamp: new Date() }
          ]
        }));
        setChatReplyText('');
        // Refresh conversations list to update latest snippet
        const chatsListRes = await api.services.getChats();
        if (chatsListRes.success) setChats(chatsListRes.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to send chat reply');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Wrench className="w-7 h-7 text-blue-500" />
            Support tickets & service requests
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Address diagnostic repairs intake, evaluate trade-in valuations, and talk directly via the customer chat.
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-850 gap-1 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('repairs');
            setSelectedTicket(null);
            setActiveChat(null);
          }}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'repairs' 
              ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Console Repair Intake ({repairs.length})
        </button>
        
        <button
          onClick={() => {
            setActiveTab('sells');
            setSelectedTicket(null);
            setActiveChat(null);
          }}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'sells' 
              ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Valuations & Sells ({sells.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('chats');
            setSelectedTicket(null);
            setActiveChat(null);
          }}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'chats' 
              ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
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
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Customer</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Description</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Date Logged</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {repairs.map(rep => (
                    <tr key={rep.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-4">
                        <div className="font-bold text-slate-800 dark:text-white text-sm">{rep.customerName}</div>
                        <div className="text-xs text-slate-400">{rep.customerEmail}</div>
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {rep.description}
                      </td>
                      <td className="p-4 text-xs">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          rep.status === 'Completed' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400'
                        }`}>
                          {rep.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-400">
                        {new Date(rep.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenTicket(rep)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-white text-xs font-semibold rounded-lg"
                        >
                          Review Ticket
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                          sell.status === 'Approved' || sell.status === 'Payout Settle'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400'
                        }`}>
                          {sell.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
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
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                  <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Chat Conversations inbox</h3>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
                  {chats.map(chat => {
                    const latestMsg = chat.messages?.[chat.messages.length - 1];
                    const isSelected = activeChat?.id === chat.id;

                    return (
                      <button
                        key={chat.id}
                        onClick={() => handleSelectChat(chat)}
                        className={`w-full text-left p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all flex items-start gap-3 ${
                          isSelected ? 'bg-blue-50/50 dark:bg-blue-950/20 border-r-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 flex-shrink-0">
                          {chat.customerName[0]}
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
                          {activeChat.customerName[0]}
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
                                : 'bg-gradient-to-tr from-blue-600 to-purple-600 text-white rounded-tr-none shadow-md shadow-blue-500/10'
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

      {/* DETAIL EDITOR MODAL FOR REPAIRS / SELLS */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200/50 dark:border-slate-850 shadow-2xl transition-all">
            
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                {activeTab === 'repairs' ? 'Diagnose Repair Ticket' : 'Approve Valuation Ticket'}
              </h3>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTicket} className="p-6 space-y-4">
              
              {/* Contact info details */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                  <User className="w-3.5 h-3.5" />
                  <span>{selectedTicket.customerName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{selectedTicket.customerEmail}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{selectedTicket.customerPhone}</span>
                </div>
              </div>

              {/* Proposed items / request */}
              {activeTab === 'sells' && (
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Product Proposed</label>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{selectedTicket.productName}</p>
                </div>
              )}

              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Customer Description</label>
                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/20 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850">
                  {selectedTicket.description}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Ticket Status</label>
                <select
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                >
                  {activeTab === 'repairs' ? (
                    <>
                      <option value="Pending">Pending</option>
                      <option value="Under Diagnosis">Under Diagnosis</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </>
                  ) : (
                    <>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Inspecting">Inspecting</option>
                      <option value="Payout Settle">Payout Settle</option>
                      <option value="Rejected">Rejected</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Diagnostic / Valuation Notes</label>
                <textarea
                  value={ticketNotes}
                  onChange={(e) => setTicketNotes(e.target.value)}
                  rows="3"
                  placeholder="Record defect reports, cost estimations or tracking details here..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-sm transition shadow-md"
                >
                  Save Ticket logs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default ServiceTickets;
