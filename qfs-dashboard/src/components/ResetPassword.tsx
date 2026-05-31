import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setErrorMsg('Invalid reset link. Please request a new one.');
    }
  }, [token, email]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!password || !confirmPassword) { setErrorMsg('Please fill in both fields'); return; }
    if (password.length < 8) { setErrorMsg('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { setErrorMsg('Passwords do not match'); return; }

    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { email, token, newPassword: password });
      setSuccessMsg('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Reset failed. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <nav className="flex justify-between items-center py-5 px-8 border-b border-white/10">
        <div className="text-xl font-medium bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">QFS</div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-9">
          <div className="mb-8">
            <div className="inline-block text-[10px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/25 rounded-md px-2 py-1 mb-3">
              RESET PASSWORD
            </div>
            <h1 className="text-xl font-medium text-white mb-1">Create new password</h1>
            <p className="text-xs text-white/40">
              For <span className="text-white/60">{email}</span>
            </p>
          </div>

          {successMsg && (
            <div className="mb-4 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              ✅ {successMsg} Redirecting to login...
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {errorMsg}
            </div>
          )}

          {!successMsg && (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-white/45 uppercase mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder:text-white/20 focus:border-blue-500/60 focus:bg-blue-500/5 outline-none"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-white/45 uppercase mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder:text-white/20 focus:border-blue-500/60 focus:bg-blue-500/5 outline-none"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !token || !email}
                className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/70 text-white font-medium rounded-xl transition-all"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="mt-5 text-center text-xs text-white/40">
            <button onClick={() => navigate('/login')} className="text-blue-400">Back to login</button>
          </div>
        </div>
      </div>
    </div>
  );
}