import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { 
  FileText, Layout, Settings, Plus, Edit2, Trash2, X, Check, Eye, AlertCircle, 
  Smartphone, Monitor, Sparkles, Megaphone, MessageSquare, Image as ImageIcon
} from 'lucide-react';

function CMSManager() {
  const [pages, setPages] = useState([]);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Tabs
  const [activeTab, setActiveTab] = useState('pages'); // pages, banner, notification, chatbot

  // Page Editor Modal
  const [showPageModal, setShowPageModal] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [pageStatus, setPageStatus] = useState('Published');

  // Settings states
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroBtnText, setHeroBtnText] = useState('');
  const [heroImgUrl, setHeroImgUrl] = useState('');
  const [promoTitle, setPromoTitle] = useState('');
  const [promoSubtitle, setPromoSubtitle] = useState('');
  const [promoEnd, setPromoEnd] = useState('');

  const [notifActive, setNotifActive] = useState(true);
  const [notifText, setNotifText] = useState('');
  const [notifColor, setNotifColor] = useState('#E11D48');

  const [botMessage, setBotMessage] = useState('');

  const fetchCMSData = async () => {
    setLoading(true);
    try {
      const pageRes = await api.cms.getPages();
      if (pageRes.success) setPages(pageRes.data);

      const settingRes = await api.cms.getSettings();
      if (settingRes.success) {
        setSettings(settingRes.data);
        // Map key-values to form states
        const banner = settingRes.data.find(s => s.key === 'homepage_banners')?.value;
        if (banner) {
          setHeroTitle(banner.hero?.title || '');
          setHeroSubtitle(banner.hero?.subtitle || '');
          setHeroBtnText(banner.hero?.buttonText || '');
          setHeroImgUrl(banner.hero?.imageUrl || '');
          setPromoTitle(banner.promotion?.title || '');
          setPromoSubtitle(banner.promotion?.subtitle || '');
          setPromoEnd(banner.promotion?.endDate ? banner.promotion.endDate.split('T')[0] : '');
        }

        const notif = settingRes.data.find(s => s.key === 'notification_bar')?.value;
        if (notif) {
          setNotifActive(notif.active);
          setNotifText(notif.text);
          setNotifColor(notif.color);
        }

        const chatbot = settingRes.data.find(s => s.key === 'chatbot_welcome_message')?.value;
        if (chatbot) {
          setBotMessage(chatbot.text);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load CMS contents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCMSData();
  }, []);

  // Save Settings Handlers
  const handleSaveBanners = async (e) => {
    e.preventDefault();
    const payload = {
      key: 'homepage_banners',
      value: {
        hero: { title: heroTitle, subtitle: heroSubtitle, buttonText: heroBtnText, imageUrl: heroImgUrl },
        promotion: { title: promoTitle, subtitle: promoSubtitle, endDate: promoEnd }
      }
    };
    try {
      const res = await api.cms.updateSetting(payload);
      if (res.success) alert('Homepage banners updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update banners.');
    }
  };

  const handleSaveNotification = async (e) => {
    e.preventDefault();
    const payload = {
      key: 'notification_bar',
      value: { active: notifActive, text: notifText, color: notifColor }
    };
    try {
      const res = await api.cms.updateSetting(payload);
      if (res.success) alert('Notification stripe updated!');
    } catch (err) {
      alert(err.message || 'Failed to save notifications.');
    }
  };

  const handleSaveChatbot = async (e) => {
    e.preventDefault();
    const payload = {
      key: 'chatbot_welcome_message',
      value: { text: botMessage }
    };
    try {
      const res = await api.cms.updateSetting(payload);
      if (res.success) alert('Chatbot settings updated!');
    } catch (err) {
      alert(err.message || 'Failed to save bot settings.');
    }
  };

  // Page Editor Handlers
  const handleOpenPageModal = (page = null) => {
    if (page) {
      setEditingPage(page);
      setPageTitle(page.title);
      setPageSlug(page.slug);
      setPageContent(page.content);
      setPageStatus(page.status);
    } else {
      setEditingPage(null);
      setPageTitle('');
      setPageSlug('');
      setPageContent('');
      setPageStatus('Published');
    }
    setShowPageModal(true);
  };

  const handleSavePage = async (e) => {
    e.preventDefault();
    const payload = { title: pageTitle, slug: pageSlug, content: pageContent, status: pageStatus };
    try {
      let res;
      if (editingPage) {
        res = await api.cms.updatePage(editingPage.id, payload);
      } else {
        res = await api.cms.createPage(payload);
      }
      if (res.success) {
        setShowPageModal(false);
        fetchCMSData();
      }
    } catch (err) {
      alert(err.message || 'Failed to save CMS Page');
    }
  };

  const handleDeletePage = async (id) => {
    if (!window.confirm('Delete this custom content page? This cannot be undone.')) return;
    try {
      const res = await api.cms.deletePage(id);
      if (res.success) fetchCMSData();
    } catch (err) {
      alert(err.message || 'Failed to delete page');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Layout className="w-7 h-7 text-blue-500" />
          Storefront & CMS Management
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Edit landing page banner text, write custom terms pages, customize alert bars, and configure bot scripts.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('pages')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
            activeTab === 'pages' 
              ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Custom HTML Pages
        </button>
        <button
          onClick={() => setActiveTab('banner')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
            activeTab === 'banner' 
              ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Homepage Hero Banners
        </button>
        <button
          onClick={() => setActiveTab('notification')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
            activeTab === 'notification' 
              ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Alert Notification Stripe
        </button>
        <button
          onClick={() => setActiveTab('chatbot')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
            activeTab === 'chatbot' 
              ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Chatbot Scripts
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm mt-3">Syncing CMS settings...</p>
        </div>
      ) : (
        <div>
          {/* TAB 1: CUSTOM PAGES TABLE */}
          {activeTab === 'pages' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => handleOpenPageModal(null)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl transition text-sm font-semibold shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Add Custom Page
                </button>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Page Title</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">URL Slug</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Type</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {pages.map(page => (
                      <tr key={page.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-4 font-bold text-slate-800 dark:text-white text-sm">
                          {page.title}
                        </td>
                        <td className="p-4 text-sm font-mono text-slate-500 dark:text-slate-400">
                          /{page.slug}
                        </td>
                        <td className="p-4 text-xs">
                          <span className={`px-2 py-0.5 rounded font-semibold ${
                            page.isSystemPage ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {page.isSystemPage ? 'System Core' : 'Custom HTML'}
                          </span>
                        </td>
                        <td className="p-4 text-sm">
                          <span className={page.status === 'Published' ? 'text-emerald-500 font-semibold' : 'text-slate-400'}>
                            ● {page.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenPageModal(page)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {!page.isSystemPage && (
                              <button
                                onClick={() => handleDeletePage(page.id)}
                                className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
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

          {/* TAB 2: HOMEPAGE HERO BANNERS & PROMO CARDS */}
          {activeTab === 'banner' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Form Input fields */}
              <form onSubmit={handleSaveBanners} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 space-y-4 shadow-lg">
                <h3 className="font-bold text-sm uppercase text-slate-500 tracking-wider">Main Hero Section Details</h3>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Hero Section Heading Title</label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Hero Section Sub-description text</label>
                  <textarea
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    rows="2"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Hero Button Text</label>
                    <input
                      type="text"
                      value={heroBtnText}
                      onChange={(e) => setHeroBtnText(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Hero Image URL</label>
                    <input
                      type="text"
                      value={heroImgUrl}
                      onChange={(e) => setHeroImgUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                    />
                  </div>
                </div>

                <h3 className="font-bold text-sm uppercase text-slate-500 tracking-wider pt-4 border-t border-slate-100 dark:border-slate-800">
                  Sub Promotion Cards & EndDates
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Promo Label title</label>
                    <input
                      type="text"
                      value={promoTitle}
                      onChange={(e) => setPromoTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Promotion Sub-text</label>
                    <input
                      type="text"
                      value={promoSubtitle}
                      onChange={(e) => setPromoSubtitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Promotion Countdown End-Date</label>
                  <input
                    type="date"
                    value={promoEnd}
                    onChange={(e) => setPromoEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl text-xs transition shadow-md"
                >
                  Save Banners Configurations
                </button>
              </form>

              {/* LIVE SIMULATION BOX */}
              <div className="bg-slate-950 rounded-3xl p-6 border border-slate-900 text-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    Live Website Banner Simulator
                  </span>
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  </div>
                </div>

                {/* Homepage Header Hero Simulation */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center p-6 text-left">
                  {heroImgUrl && (
                    <img 
                      src={heroImgUrl} 
                      className="absolute inset-0 w-full h-full object-cover opacity-35" 
                      alt="" 
                    />
                  )}
                  <div className="z-10 max-w-sm space-y-2">
                    <h2 className="text-xl md:text-2xl font-black leading-tight tracking-tight">
                      {heroTitle || 'Banners Header Title'}
                    </h2>
                    <p className="text-[10px] text-slate-300 font-medium">
                      {heroSubtitle || 'This description text goes on the homepage. Change it in the editor on the left.'}
                    </p>
                    <button className="px-3.5 py-1.5 bg-blue-600 text-white rounded font-bold text-[10px]">
                      {heroBtnText || 'Click here'}
                    </button>
                  </div>
                </div>

                {/* Promotion countdown timer banner */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs">{promoTitle || 'Flash Sale Title'}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{promoSubtitle || 'Flash subtext description.'}</p>
                  </div>
                  {promoEnd && (
                    <div className="text-right">
                      <span className="text-[10px] bg-red-950/80 border border-red-900 text-red-400 px-2 py-0.5 rounded font-mono font-bold">
                        Ends: {promoEnd}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ALERT NOTIFICATION STRIPE */}
          {activeTab === 'notification' && (
            <div className="max-w-2xl mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/85 space-y-6 shadow-lg">
              <h3 className="font-bold text-sm uppercase text-slate-500 tracking-wider">Top Notification Alert Strip</h3>
              
              {/* Alert stripe simulation */}
              {notifActive && (
                <div 
                  style={{ backgroundColor: notifColor }}
                  className="p-3 text-white text-xs font-bold text-center rounded-xl animate-pulse shadow"
                >
                  {notifText || 'Enter notification text below...'}
                </div>
              )}

              <form onSubmit={handleSaveNotification} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Alert Strip Text Content</label>
                  <input
                    type="text"
                    required
                    value={notifText}
                    onChange={(e) => setNotifText(e.target.value)}
                    placeholder="e.g. Free delivery on orders exceeding $100! | Sale ends tonight!"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Alert Color (Hex Code)</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={notifColor}
                        onChange={(e) => setNotifColor(e.target.value)}
                        className="w-10 h-10 border-0 bg-transparent cursor-pointer rounded-xl"
                      />
                      <input
                        type="text"
                        value={notifColor}
                        onChange={(e) => setNotifColor(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Display Status</label>
                    <div className="flex items-center h-10 mt-1">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={notifActive} 
                          onChange={(e) => setNotifActive(e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                        <span className="ml-2 text-sm font-medium text-slate-600 dark:text-slate-300">Visible to Buyers</span>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl text-xs transition shadow-md"
                >
                  Save Notification Configurations
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: CHATBOT WELCOME NOTE */}
          {activeTab === 'chatbot' && (
            <div className="max-w-2xl mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/85 space-y-6 shadow-lg">
              <h3 className="font-bold text-sm uppercase text-slate-500 tracking-wider">Customer Care Chatbot Welcome message</h3>
              
              <div className="flex gap-3 bg-blue-50 dark:bg-slate-950 p-4 border border-blue-100 dark:border-slate-800 rounded-2xl">
                <MessageSquare className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <h5 className="text-xs font-bold text-blue-800 dark:text-blue-400">Live Customer Window Preview</h5>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed italic">
                    "{botMessage || 'Loading welcome banner script...'}"
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveChatbot} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Chat Welcome Message Text</label>
                  <textarea
                    required
                    value={botMessage}
                    onChange={(e) => setBotMessage(e.target.value)}
                    rows="4"
                    placeholder="e.g. Welcome to Quickturn! How can our technicians assist with your repair status today?"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl text-xs transition shadow-md"
                >
                  Save Welcome message
                </button>
              </form>
            </div>
          )}

        </div>
      )}

      {/* PAGE CREATE OR UPDATE MODAL */}
      {showPageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200/50 dark:border-slate-850 shadow-2xl transition-all">
            
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                {editingPage ? 'Edit Content Page' : 'Create Custom HTML Page'}
              </h3>
              <button 
                onClick={() => setShowPageModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePage} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Page Title</label>
                  <input
                    type="text"
                    required
                    value={pageTitle}
                    onChange={(e) => {
                      setPageTitle(e.target.value);
                      if (!editingPage) {
                        setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                    placeholder="e.g. Terms of Service"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Slug path (URL)</label>
                  <input
                    type="text"
                    required
                    value={pageSlug}
                    onChange={(e) => setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white font-mono"
                    placeholder="terms-of-service"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Page Content (HTML support)</label>
                <textarea
                  required
                  rows="12"
                  value={pageContent}
                  onChange={(e) => setPageContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white font-mono"
                  placeholder="<h1>Terms</h1><p>Write your markup here...</p>"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                  <select
                    value={pageStatus}
                    onChange={(e) => setPageStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPageModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-sm transition shadow-md"
                >
                  Save CMS page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default CMSManager;
