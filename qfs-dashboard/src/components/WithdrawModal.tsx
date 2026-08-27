import { useState } from 'react';
import { X, ArrowRight, Loader2, AlertCircle, ShieldCheck, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

interface WithdrawModalProps {
  onClose: () => void;
}

export function WithdrawModal({ onClose }: WithdrawModalProps) {
  const { user, token } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState<'form' | 'loading' | 'limit'>('form');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'crypto' | 'bank' | 'cashapp' | 'paypal' | 'applepay' | 'zelle'>('crypto');
  const [cryptoType, setCryptoType] = useState('BTC');
  const [walletAddress, setWalletAddress] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    accountNumber: '',
    routingNumber: ''
  });
  const [cashAppTag, setCashAppTag] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [applePayEmail, setApplePayEmail] = useState('');
  const [zelleEmail, setZelleEmail] = useState('');
  const [error, setError] = useState('');

  const cryptos = ['BTC', 'ETH', 'SOL', 'USDT', 'XRP', 'ADA'];

  const isAmountValid = () => {
    const amt = parseFloat(amount);
    return amt > 0 && amt <= (user?.balance || 0);
  };

  const isFormValid = () => {
    if (!isAmountValid()) return false;
    switch (method) {
      case 'crypto':
        return !!walletAddress.trim();
      case 'bank':
        return !!bankDetails.accountName && !!bankDetails.accountNumber && !!bankDetails.routingNumber;
      case 'cashapp':
        return !!cashAppTag.trim();
      case 'paypal':
        return !!paypalEmail.trim();
      case 'applepay':
        return !!applePayEmail.trim();
      case 'zelle':
        return !!zelleEmail.trim();
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setError('');
    setStep('loading');

    // Simulate processing for 5 seconds (or send to backend later)
    setTimeout(() => {
      setStep('limit');
    }, 5000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Withdraw Funds</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
          <X size={18} />
        </button>
      </div>

      {/* ── Step: Loading ── */}
      {step === 'loading' && (
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <Loader2 size={40} className="animate-spin text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">Processing your withdrawal...</p>
        </div>
      )}

      {/* ── Step: Limit reached ── */}
      {step === 'limit' && (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertCircle size={32} className="text-red-600 dark:text-red-400" />
          </div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white text-center">
            You haven't reached the withdrawal limit.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Please contact support to increase your withdrawal limit or for further assistance.
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('/support');
              }}
              className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              Contact Support
            </button>
          </div>
        </div>
      )}

      {/* ── Step: Form ── */}
      {step === 'form' && (
        <>
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (USD)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Available: ${(user?.balance || 0).toFixed(2)}
            </p>
            {amount && !isAmountValid() && (
              <p className="text-xs text-red-500 mt-1">Amount exceeds balance or is invalid.</p>
            )}
          </div>

          {/* Method selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Method</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'crypto', label: 'Crypto', icon: '₿' },
                { id: 'bank', label: 'Bank', icon: '🏦' },
                { id: 'cashapp', label: 'Cash App', icon: '💵' },
                { id: 'paypal', label: 'PayPal', icon: '🅿️' },
                { id: 'applepay', label: 'Apple Pay', icon: '🍏' },
                { id: 'zelle', label: 'Zelle', icon: '⚡' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id as any)}
                  className={`p-3 rounded-lg border-2 transition ${
                    method === m.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xl mb-1">{m.icon}</div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{m.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Method-specific fields */}
          {method === 'crypto' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Crypto Type</label>
                <select
                  value={cryptoType}
                  onChange={(e) => setCryptoType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {cryptos.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Wallet Address</label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder={`Enter your ${cryptoType} address`}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm"
                />
              </div>
              <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                <AlertCircle size={16} className="text-yellow-600 shrink-0" />
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  Double-check the address. Sending to the wrong address may cause permanent loss.
                </p>
              </div>
            </div>
          )}

          {method === 'bank' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account Name</label>
                <input
                  type="text"
                  value={bankDetails.accountName}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                  placeholder="Full name on account"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    placeholder="1234567890"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Routing Number</label>
                  <input
                    type="text"
                    value={bankDetails.routingNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, routingNumber: e.target.value })}
                    placeholder="123456789"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {method === 'cashapp' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cash App $Cashtag</label>
              <input
                type="text"
                value={cashAppTag}
                onChange={(e) => setCashAppTag(e.target.value)}
                placeholder="$yourcashtag"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          )}

          {method === 'paypal' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">PayPal Email</label>
              <input
                type="email"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          )}

          {method === 'applepay' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Apple Pay Email or Phone</label>
              <input
                type="text"
                value={applePayEmail}
                onChange={(e) => setApplePayEmail(e.target.value)}
                placeholder="you@example.com or +1234567890"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          )}

          {method === 'zelle' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Zelle Email or Phone</label>
              <input
                type="text"
                value={zelleEmail}
                onChange={(e) => setZelleEmail(e.target.value)}
                placeholder="you@example.com or +1234567890"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold transition"
          >
            Request Withdrawal
          </button>

          <p className="text-[11px] text-slate-400 text-center">
            🔒 Your details are encrypted. Withdrawals are reviewed manually.
          </p>
        </>
      )}
    </div>
  );
}