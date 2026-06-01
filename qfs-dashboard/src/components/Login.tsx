import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import axios from 'axios';

const API_URL = 'https://qfsbackend-1.onrender.com/api';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) { setErrorMsg('Please fill in both fields'); return; }
    setIsLoading(true);

    const loggedInUser = await login(email, password);
    if (loggedInUser) {
      navigate(loggedInUser.role === 'admin' ? '/admin' : '/');
    } else {
      setErrorMsg('Invalid credentials or email not verified.');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotMsg('');
    if (!forgotEmail) { setForgotError('Enter your email address'); return; }
    setForgotLoading(true);
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email: forgotEmail });
      setForgotMsg('If that email exists, a reset link has been sent. Check your inbox.');
    } catch {
      setForgotError('Something went wrong. Try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  // ── Forgot Password Modal ──
  if (showForgot) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
        <nav className="flex justify-between items-center py-5 px-8 border-b border-white/10">
          <div className="text-xl font-medium bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">QFS</div>
          <button onClick={() => setShowForgot(false)} className="text-sm text-white/45 hover:text-white/70">
            ← Back to login
          </button>
        </nav>
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-9">
            <div className="mb-8">
              <div className="inline-block text-[10px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/25 rounded-md px-2 py-1 mb-3">
                ACCOUNT RECOVERY
              </div>
              <h1 className="text-xl font-medium text-white mb-1">Forgot your password?</h1>
              <p className="text-xs text-white/40">Enter your email and we'll send you a reset link.</p>
            </div>

            {forgotMsg && (
              <div className="mb-4 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                {forgotMsg}
              </div>
            )}
            {forgotError && (
              <div className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {forgotError}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-white/45 uppercase mb-1.5">Email</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/60 focus:bg-blue-500/5 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/70 text-white font-medium rounded-xl transition-all"
              >
                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-white/40">
              Remembered it?{' '}
              <button onClick={() => setShowForgot(false)} className="text-blue-400">Sign in</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Login Page ──
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <nav className="flex justify-between items-center py-5 px-8 border-b border-white/10">
        <div className="text-xl font-medium bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">QFS</div>
        <div className="text-sm text-white/45">
          New?{' '}
          <button onClick={() => navigate('/signup')} className="text-blue-400">Create account</button>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-9">
          <div className="mb-8">
            <div className="inline-block text-[10px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/25 rounded-md px-2 py-1 mb-3">
              WELCOME BACK
            </div>
            <h1 className="text-xl font-medium text-white mb-1">Sign in to QFS</h1>
            <p className="text-xs text-white/40">Enter your credentials to continue.</p>
          </div>

          {errorMsg && (
            <div className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-white/45 uppercase mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/60 focus:bg-blue-500/5 outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-medium text-white/45 uppercase">Password</label>
                {/* ✅ Forgot password link */}
                <button
                  type="button"
                  onClick={() => { setShowForgot(true); setForgotEmail(email); }}
                  className="text-[11px] text-blue-400 hover:text-blue-300 transition"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder:text-white/20 focus:border-blue-500/60 focus:bg-blue-500/5 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/70 text-white font-medium rounded-xl transition-all active:scale-[0.99]"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-white/40">
            Don't have an account?{' '}
            <button onClick={() => navigate('/signup')} className="text-blue-400">Create one</button>
          </div>
        </div>
      </div>
    </div>
  );
}
