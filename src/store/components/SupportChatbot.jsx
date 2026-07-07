import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Minus, Send, Clock, Headphones } from 'lucide-react';
import { storeApi } from '../api';
import {
  getOrCreateSessionId,
  getStoredMessages,
  saveMessages,
  getStoredCustomer,
  saveCustomer,
} from '../utils/chatSession';
import { isWithinBusinessHours } from '../utils/businessHours';

function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => getStoredMessages());
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [settings, setSettings] = useState(null);
  const [customer, setCustomer] = useState(() => getStoredCustomer());
  const [showIntro, setShowIntro] = useState(() => !getStoredCustomer());
  const [introName, setIntroName] = useState(() => getStoredCustomer()?.name || '');
  const [introEmail, setIntroEmail] = useState(() => getStoredCustomer()?.email || '');

  const sessionId = useRef(getOrCreateSessionId());
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const isOnline = settings ? isWithinBusinessHours(settings.schedule) : true;

  const syncFromServer = useCallback(async () => {
    try {
      const res = await storeApi.getChatBySession(sessionId.current);
      if (res.success && res.data?.messages?.length) {
        setMessages(res.data.messages);
        saveMessages(res.data.messages);
      }
    } catch {
      // Keep local session history if sync fails
    }
  }, []);

  useEffect(() => {
    storeApi.getChatSettings().then((res) => {
      if (res.success) setSettings(res.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (getStoredCustomer()) {
      syncFromServer();
    }
  }, [syncFromServer]);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && customer) {
      syncFromServer();
      pollRef.current = setInterval(syncFromServer, 8000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isOpen, customer, syncFromServer]);

  const handleIntroSubmit = (e) => {
    e.preventDefault();
    if (!introName.trim()) return;

    const info = { name: introName.trim(), email: introEmail.trim() || null };
    setCustomer(info);
    saveCustomer(info);
    setShowIntro(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || sending || !customer) return;

    setSending(true);
    setInputText('');

    const optimistic = [
      ...messages,
      { sender: 'customer', text, timestamp: new Date().toISOString() },
    ];
    setMessages(optimistic);

    try {
      const res = await storeApi.sendChatMessage({
        customerSessionId: sessionId.current,
        text,
        customerName: customer.name,
        customerEmail: customer.email,
      });

      if (res.success && res.data?.messages) {
        setMessages(res.data.messages);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Sorry, we could not send your message. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const toggleOpen = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
      if (customer) syncFromServer();
    }
  };

  const senderLabel = (sender) => {
    if (sender === 'customer') return 'You';
    if (sender === 'agent') return 'Support';
    return 'Bot';
  };

  return (
    <>
      {/* Floating trigger */}
      {!isOpen && (
        <button
          type="button"
          onClick={toggleOpen}
          className="support-chat-fab"
          aria-label="Open customer support chat"
        >
          <MessageCircle className="w-6 h-6" />
          {messages.length > 0 && (
            <span className="support-chat-fab-badge" aria-hidden="true" />
          )}
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="support-chat-panel" role="dialog" aria-label="Customer support chat">
          {/* Header */}
          <div className="support-chat-header">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center shrink-0">
                <Headphones className="w-4 h-4 text-neon-purple" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">Customer Support</p>
                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  {isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="support-chat-icon-btn"
                aria-label="Minimize chat"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="support-chat-icon-btn"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Business hours / offline banner */}
          {settings && (
            <div className={`support-chat-status-bar ${isOnline ? 'support-chat-status-bar--online' : 'support-chat-status-bar--offline'}`}>
              <Clock className="w-3.5 h-3.5 shrink-0" />
              {isOnline ? (
                <span>Support hours: {settings.businessHoursDisplay}</span>
              ) : (
                <span>{settings.offlineMessage}</span>
              )}
            </div>
          )}

          {/* Body */}
          <div className="support-chat-body">
            {showIntro ? (
              <form onSubmit={handleIntroSubmit} className="p-4 space-y-3">
                <p className="text-sm text-gray-300">
                  {settings?.welcomeMessage || 'Hello! How can we help you today?'}
                </p>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Your Name *</label>
                  <input
                    type="text"
                    value={introName}
                    onChange={(e) => setIntroName(e.target.value)}
                    required
                    placeholder="Enter your name"
                    className="store-input mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email (optional)</label>
                  <input
                    type="email"
                    value={introEmail}
                    onChange={(e) => setIntroEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="store-input mt-1"
                  />
                </div>
                <button type="submit" className="store-btn-primary w-full py-2.5 normal-case tracking-normal text-sm">
                  Start Chat
                </button>
              </form>
            ) : (
              <>
                <div className="support-chat-messages">
                  {messages.length === 0 && settings && (
                    <div className="text-center py-6 px-4">
                      <p className="text-sm text-gray-400">{settings.welcomeMessage}</p>
                    </div>
                  )}
                  {messages.map((msg, i) => {
                    const isCustomer = msg.sender === 'customer';
                    return (
                      <div key={i} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                        <div className={`support-chat-bubble ${isCustomer ? 'support-chat-bubble--customer' : 'support-chat-bubble--support'}`}>
                          {!isCustomer && (
                            <span className="support-chat-sender">{senderLabel(msg.sender)}</span>
                          )}
                          <p>{msg.text}</p>
                          <span className="support-chat-time">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="support-chat-input-row">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={isOnline ? 'Type your message…' : 'Leave a message…'}
                    disabled={sending}
                    className="store-input flex-1 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={sending || !inputText.trim()}
                    className="support-chat-send-btn"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default SupportChatbot;
