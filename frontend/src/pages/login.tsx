import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { ThemeSwitcher } from '../components/ui/ThemeSwitcher';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const identifier = email.includes('@') ? email : `${email}@watermap.kz`;

        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: identifier, password })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Login failed');
        }

        login(data.user, 'cookie-handled-by-browser');
        navigate({
          'admin': '/admin/users',
          'expert': '/expert/map-editor',
          'user': '/map'
        }[data.user.role as string] || '/map');

      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');

        login(data.user, 'cookie');
        navigate('/map');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-all duration-300 bg-slate-100 dark:bg-slate-950">
      {/* Theme Switcher - Now renders as fixed floating button */}
      <ThemeSwitcher />

      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-3xl animate-pulse transition-colors duration-300 bg-primary-200/40 dark:bg-primary-900/20" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full blur-3xl animate-pulse delay-1000 transition-colors duration-300 bg-blue-200/40 dark:bg-blue-900/20" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">

          {/* Header */}
          <div className="p-8 text-center border-b transition-colors duration-500 border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="w-12 h-12 bg-gradient-to-tr from-primary-500 to-primary-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-primary-500/20">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight transition-colors duration-500 text-slate-900 dark:text-white">WaterMap Professional</h1>
            <p className="text-sm mt-1 transition-colors duration-500 text-slate-500 dark:text-slate-400">Enterprise Water Management System</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b transition-colors duration-500 border-slate-200/50 dark:border-slate-800/50">
            <button
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${isLogin ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              Sign In
              {isLogin && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />}
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${!isLogin ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              Create Account
              {!isLogin && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />}
            </button>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex gap-2 items-start text-red-500 dark:text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {!isLogin && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="space-y-1">
                      <label className="text-xs font-medium uppercase tracking-wide ml-1 transition-colors duration-500 text-slate-500 dark:text-slate-400">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors text-slate-400 dark:text-slate-500 group-focus-within:text-primary-500" />
                        <input
                          type="text"
                          required={!isLogin}
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1">
                <label className="text-xs font-medium uppercase tracking-wide ml-1 transition-colors duration-500 text-slate-500 dark:text-slate-400">
                  {isLogin ? 'Email or Username' : 'Email Address'}
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors text-slate-400 dark:text-slate-500 group-focus-within:text-primary-500" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    placeholder={isLogin ? "admin1" : "name@company.com"}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-medium uppercase tracking-wide transition-colors duration-500 text-slate-500 dark:text-slate-400">Password</label>
                  {isLogin && (
                    <a href="#" className="text-xs text-primary-500 hover:text-primary-400">Forgot?</a>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors text-slate-400 dark:text-slate-500 group-focus-within:text-primary-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-wait"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs mt-6 transition-colors duration-500 text-slate-400 dark:text-slate-600">
          &copy; 2025 WaterMap System. Restricted Access.
        </p>
      </motion.div>
    </div>
  );
}