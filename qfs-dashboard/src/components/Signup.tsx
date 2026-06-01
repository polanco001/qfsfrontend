import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Phone, Globe, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { useApp } from '../context/AppContext';

const API_URL = 'https://qfsbackend-1.onrender.com';

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia",
  "Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Belarus","Belgium","Belize",
  "Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei",
  "Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Chad","Chile",
  "China","Colombia","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic",
  "Denmark","Dominican Republic","Ecuador","Egypt","El Salvador","Estonia","Ethiopia",
  "Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Guatemala",
  "Guinea","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq",
  "Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait",
  "Kyrgyzstan","Laos","Latvia","Lebanon","Libya","Liechtenstein","Lithuania","Luxembourg",
  "Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius",
  "Mexico","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar",
  "Namibia","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","Norway",
  "Oman","Pakistan","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland",
  "Portugal","Qatar","Romania","Russia","Rwanda","Saudi Arabia","Senegal","Serbia",
  "Sierra Leone","Singapore","Slovakia","Slovenia","Somalia","South Africa","South Korea",
  "South Sudan","Spain","Sri Lanka","Sudan","Sweden","Switzerland","Syria","Taiwan",
  "Tajikistan","Tanzania","Thailand","Togo","Trinidad and Tobago","Tunisia","Turkey",
  "Turkmenistan","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States",
  "Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
];

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useApp();

  const [step, setStep] = useState<'signup' | 'verify'>('signup');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Verification
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [verifyError, setVerifyError] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  // Password strength
  const getStrength = (p: string) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strength = getStrength(password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!fullName || !email || !password || !country) {
      setErrorMsg('Please fill in all required fields');
      return;
    }
    if (password.length < 8) { setErrorMsg('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { setErrorMsg('Passwords do not match'); return; }
    if (!agreeTerms) { setErrorMsg('You must agree to the terms and conditions'); return; }

    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/signup`, { email, password, fullName, phone, country });
      setStep('verify');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Signup failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    pasted.split('').forEach((char, i) => { newCode[i] = char; });
    setCode(newCode);
    document.getElementById(`code-${Math.min(pasted.length, 5)}`)?.focus();
  };

  const handleVerify = async () => {
    setVerifyError('');
    const fullCode = code.join('');
    if (fullCode.length < 6) { setVerifyError('Enter the full 6-digit code'); return; }
    setVerifyLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-email`, { email, code: fullCode });
      const { user } = res.data;
      await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err: any) {
      setVerifyError(err.response?.data?.error || 'Invalid or expired code.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    setResendMsg('');
    setResendLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/resend-code`, { email });
      setResendMsg('New code sent!');
    } catch {
      setResendMsg('Failed to resend. Try again.');
    } finally {
      setResendLoading(false);
    }
  };

  // ── Step 2: Verify Email ──
  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
        <nav className="flex justify-between items-center py-5 px-8 border-b border-white/10">
          <div className="text-xl font-medium bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">QFS</div>
        </nav>
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-9">
            <div className="mb-8 text-center">
              <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/25 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">
                📧
              </div>
              <div className="inline-block text-[10px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/25 rounded-md px-2 py-1 mb-3">
                CHECK YOUR EMAIL
              </div>
              <h1 className="text-xl font-medium text-white mb-2">Verify your email address</h1>
              <p className="text-xs text-white/40 leading-relaxed">
                We sent a 6-digit verification code to<br />
                <span className="text-blue-400 font-medium">{email}</span>
              </p>
            </div>

            {verifyError && (
              <div className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                {verifyError}
              </div>
            )}
            {resendMsg && (
              <div className="mb-4 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                {resendMsg}
              </div>
            )}

            {/* 6-digit boxes */}
            <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  id={`code-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleCodeChange(i, e.target.value)}
                  onKeyDown={e => handleCodeKeyDown(i, e)}
                  className="w-12 h-14 text-center text-2xl font-bold bg-white/5 border-2 border-white/10 rounded-xl text-white focus:border-blue-500 focus:bg-blue-500/5 outline-none transition-all"
                />
              ))}
            </div>

            <button
              onClick={handleVerify}
              disabled={verifyLoading || code.join('').length < 6}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all mb-5"
            >
              {verifyLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            <div className="text-center space-y-2">
              <p className="text-xs text-white/40">
                Didn't receive the code?{' '}
                <button onClick={handleResend} disabled={resendLoading}
                  className="text-blue-400 hover:text-blue-300 disabled:opacity-50">
                  {resendLoading ? 'Sending...' : 'Resend code'}
                </button>
              </p>
              <p className="text-xs text-white/30">
                Wrong email?{' '}
                <button onClick={() => setStep('signup')} className="text-white/50 hover:text-white/70">
                  Go back
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 1: Signup Form ──
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <nav className="flex justify-between items-center py-5 px-8 border-b border-white/10">
        <div className="text-xl font-medium bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">QFS</div>
        <div className="text-sm text-white/45">
          Have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-blue-400 hover:text-blue-300">Sign in</button>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block text-[10px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/25 rounded-md px-2 py-1 mb-3">
              CREATE ACCOUNT
            </div>
            <h1 className="text-2xl font-semibold text-white mb-1">Join QFS Wallet</h1>
            <p className="text-sm text-white/40">Secure digital wallet for everyone</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            {errorMsg && (
              <div className="mb-5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
                <span>⚠️</span> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">

              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-medium text-white/45 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/60 focus:bg-blue-500/5 outline-none transition"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-medium text-white/45 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/60 focus:bg-blue-500/5 outline-none transition"
                  />
                </div>
              </div>

              {/* Phone + Country side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-white/45 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+1 234 567 8900"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/60 focus:bg-blue-500/5 outline-none transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-white/45 uppercase tracking-wider mb-1.5">
                    Country <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none z-10" />
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                    <select
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      className="w-full bg-[#111827] border border-white/10 rounded-xl pl-10 pr-8 py-3 text-sm text-white focus:border-blue-500/60 outline-none transition appearance-none cursor-pointer"
                    >
                      <option value="" className="text-white/40">Select country</option>
                      {COUNTRIES.map(c => (
                        <option key={c} value={c} className="bg-[#111827] text-white">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-medium text-white/45 uppercase tracking-wider mb-1.5">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/60 focus:bg-blue-500/5 outline-none transition"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Password strength bar */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-1 flex-1 rounded-full transition-all"
                          style={{ backgroundColor: i <= strength ? strengthColor[strength] : '#1e293b' }} />
                      ))}
                    </div>
                    <p className="text-[11px]" style={{ color: strengthColor[strength] }}>
                      {strengthLabel[strength]} password
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] font-medium text-white/45 uppercase tracking-wider mb-1.5">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className={`w-full bg-white/5 border rounded-xl pl-10 pr-12 py-3 text-sm text-white placeholder:text-white/20 focus:bg-blue-500/5 outline-none transition ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-red-500/50 focus:border-red-500'
                        : confirmPassword && password === confirmPassword
                        ? 'border-green-500/50 focus:border-green-500'
                        : 'border-white/10 focus:border-blue-500/60'
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {confirmPassword && (
                    <span className="absolute right-10 top-1/2 -translate-y-1/2 text-sm">
                      {password === confirmPassword ? '✅' : '❌'}
                    </span>
                  )}
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3 pt-1">
                <div
                  onClick={() => setAgreeTerms(!agreeTerms)}
                  className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center cursor-pointer transition ${
                    agreeTerms ? 'bg-blue-600 border-blue-600' : 'border-white/20 bg-white/5'
                  }`}
                >
                  {agreeTerms && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <p className="text-xs text-white/40 leading-relaxed">
                  I agree to the{' '}
                  <span className="text-blue-400 cursor-pointer hover:underline">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-blue-400 cursor-pointer hover:underline">Privacy Policy</span>.
                  My funds are protected under QFS Wallet security protocols.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/70 text-white font-medium rounded-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Creating account...
                  </>
                ) : 'Create Account →'}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-white/5 text-center text-xs text-white/40">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="text-blue-400 hover:text-blue-300">Sign in</button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-1.5 text-white/25 text-[11px]">
              <span>🔒</span> SSL Secured
            </div>
            <div className="flex items-center gap-1.5 text-white/25 text-[11px]">
              <span>🛡️</span> Bank-level encryption
            </div>
            <div className="flex items-center gap-1.5 text-white/25 text-[11px]">
              <span>✅</span> Verified platform
            </div>
          </div>
        </div>
      </div>
    </div>
    
  );
}
