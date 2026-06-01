
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Phone, Globe, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { useApp } from '../context/AppContext';

const API_URL = 'https://qfsbackend-1.onrender.com';
export default function Signup() {
  const navigate = useNavigate();
  const { login } = useApp();

  const [step, setStep] = useState('signup');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [agreeTerms, setAgreeTerms] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [verifyError, setVerifyError] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // store temp credentials safely for login after verify
  const [tempCred, setTempCred] = useState({ email: '', password: '' });

  /* ========================
     SIGNUP (FIXED + SAFE)
  ======================== */
  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName || !email || !password || !country) {
      setErrorMsg('Fill all required fields');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('You must agree to terms');
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(`${API_URL}/api/auth/signup`, {
        email: email.trim().toLowerCase(),
        password,
        fullName,
        phone: phone || '',
        country
      }, { timeout: 15000 });

      // IMPORTANT FIX: store credentials for verify step
      setTempCred({
        email: email.trim().toLowerCase(),
        password
      });

      setStep('verify');

    } catch (err) {
      setErrorMsg(err?.response?.data?.error || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  /* ========================
     VERIFY EMAIL (FIXED)
  ======================== */
  const handleVerify = async () => {
    setVerifyError('');

    const fullCode = code.join('');

    if (fullCode.length !== 6) {
      setVerifyError('Enter full 6-digit code');
      return;
    }

    setVerifyLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-email`, {
        email,
        code: fullCode
      });

      const user = res?.data?.user;

      // SAFE LOGIN AFTER VERIFY
      await login(tempCred.email, tempCred.password);

      navigate(user?.role === 'admin' ? '/admin' : '/');

    } catch (err) {
      setVerifyError(err?.response?.data?.error || 'Verification failed');
    } finally {
      setVerifyLoading(false);
    }
  };

  /* ========================
     RESEND CODE
  ======================== */
  const handleResend = async () => {
    setResendLoading(true);

    try {
      await axios.post(`${API_URL}/api/auth/resend-code`, {
        email
      });

    } catch (err) {
      console.log(err);
    } finally {
      setResendLoading(false);
    }
  };

  /* ========================
     CODE INPUT
  ======================== */
  const handleCodeChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;

    const newCode = [...code];
    newCode[i] = val.slice(-1);
    setCode(newCode);
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];

    pasted.split('').forEach((c, i) => {
      newCode[i] = c;
    });

    setCode(newCode);
  };

  /* ========================
     VERIFY SCREEN
  ======================== */
  if (step === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white">
        <div className="w-full max-w-md p-6 bg-white/5 border border-white/10 rounded-xl">

          <h2 className="text-xl text-center mb-2">Verify Email</h2>
          <p className="text-sm text-center text-white/50 mb-4">
            Code sent to {email}
          </p>

          <div className="flex gap-2 justify-center mb-4" onPaste={handlePaste}>
            {code.map((c, i) => (
              <input
                key={i}
                maxLength={1}
                value={c}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                className="w-10 h-12 text-center bg-white/10 border border-white/10"
              />
            ))}
          </div>

          {verifyError && (
            <p className="text-red-400 text-sm mb-2">{verifyError}</p>
          )}

          <button
            onClick={handleVerify}
            disabled={verifyLoading}
            className="w-full bg-blue-600 py-2 rounded"
          >
            {verifyLoading ? 'Verifying...' : 'Verify'}
          </button>

          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="w-full mt-2 text-blue-400 text-sm"
          >
            {resendLoading ? 'Sending...' : 'Resend code'}
          </button>
        </div>
      </div>
    );
  }

  /* ========================
     SIGNUP UI (UNCHANGED STRUCTURE)
  ======================== */
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white">

      <form onSubmit={handleSignup} className="w-full max-w-lg p-6 bg-white/5 border border-white/10 rounded-xl">

        <h1 className="text-xl mb-4">Create Account</h1>

        {errorMsg && <p className="text-red-400 mb-2">{errorMsg}</p>}

        <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" className="w-full mb-2 p-2 bg-black/20" />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full mb-2 p-2 bg-black/20" />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" className="w-full mb-2 p-2 bg-black/20" />
        <input value={country} onChange={e => setCountry(e.target.value)} placeholder="Country" className="w-full mb-2 p-2 bg-black/20" />

        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full mb-2 p-2 bg-black/20" />
        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm Password" className="w-full mb-2 p-2 bg-black/20" />

        <label className="text-sm">
          <input type="checkbox" checked={agreeTerms} onChange={() => setAgreeTerms(!agreeTerms)} />
          {' '}I agree to terms
        </label>

        <button disabled={isLoading} className="w-full mt-4 bg-blue-600 py-2">
          {isLoading ? 'Creating...' : 'Create Account'}
        </button>

      </form>
    </div>
  );
}
