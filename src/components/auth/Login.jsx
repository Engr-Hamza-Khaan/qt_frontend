import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDefaultRoute } from '../../config/navigation';
import { Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import BrandLogo from '../ui/BrandLogo';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
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
      const user = await login(email, password);
      navigate(getDefaultRoute(user.role), { replace: true });
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
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg z-10">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl space-y-8">
          <div className="flex flex-col items-center">
            <BrandLogo
              variant="white"
              logoSize="xl"
              layout="vertical"
              nameClassName="text-2xl font-extrabold text-white tracking-tight"
              subtitleClassName="text-slate-400 text-sm normal-case tracking-normal mt-1"
            />
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-950/40 border border-red-900/50 text-red-200 rounded-2xl text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="h-5 w-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border border-slate-800/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
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
                <Lock className="h-5 w-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border border-slate-800/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                  placeholder="••••••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="store-btn-primary store-btn-primary--block w-full active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? 'Authenticating...' : 'Sign In To Panel'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </span>
            </button>
          </form>

          <div className="border-t border-slate-800/80 pt-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Quick Sandbox Login</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                ['admin@quickturn.com', 'adminpassword123', 'Super Admin'],
                ['staff@quickturn.com', 'staffpassword123', 'Staff'],
                ['sony@supplier.com', 'vendorpassword123', 'Vendor'],
              ].map(([em, pw, label]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleQuickLogin(em, pw)}
                  className="py-2.5 px-3 bg-slate-950/30 hover:bg-slate-950/80 border border-slate-800/80 rounded-xl text-[11px] font-medium text-slate-300 hover:text-white transition-all"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
