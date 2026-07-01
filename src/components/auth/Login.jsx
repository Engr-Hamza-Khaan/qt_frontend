import { useState } from 'react';
import { api } from '../../api/client';
import { Shield, Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.auth.login(email, password);
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden px-4">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Content Card */}
      <div className="w-full max-w-lg z-10">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl space-y-8 relative">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/20 mb-2">
              <Shield className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Quick<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Turn</span>
            </h1>
            <p className="text-slate-400 text-sm">
              Premium E-Commerce Administration Suite
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-950/40 border border-red-900/50 text-red-200 rounded-2xl text-sm transition-all duration-300">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block ml-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 h-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border border-slate-800/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 text-sm"
                  placeholder="name@company.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block ml-1">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 h-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border border-slate-800/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 text-sm"
                  placeholder="••••••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3.5 px-6 rounded-2xl transition-all duration-300 shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? 'Authenticating Securely...' : 'Sign In To Panel'}
                {!loading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
              </span>
            </button>
          </form>

          {/* Quick Login Shortcuts */}
          <div className="border-t border-slate-800/80 pt-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Quick Sandbox Login Accounts</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@quickturn.com', 'adminpassword123')}
                className="py-2.5 px-3 bg-slate-950/30 hover:bg-slate-950/80 border border-slate-800/80 rounded-xl text-[11px] font-medium text-slate-300 hover:text-white transition-all text-center"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('staff@quickturn.com', 'staffpassword123')}
                className="py-2.5 px-3 bg-slate-950/30 hover:bg-slate-950/80 border border-slate-800/80 rounded-xl text-[11px] font-medium text-slate-300 hover:text-white transition-all text-center"
              >
                Staff Clerk
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('sony@supplier.com', 'vendorpassword123')}
                className="py-2.5 px-3 bg-slate-950/30 hover:bg-slate-950/80 border border-slate-800/80 rounded-xl text-[11px] font-medium text-slate-300 hover:text-white transition-all text-center"
              >
                Sony Vendor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
