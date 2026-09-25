import { useState, useEffect } from 'react';
import { Check, Upload, Copy } from 'lucide-react';

interface PaymentMethodModalProps {
  amount?: number;
  onClose: () => void;
  onComplete: () => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  symbol: string;
  address: string;
  icon: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://qfsbackend-1.onrender.com';

const METHOD_META = [
  { id: 'btc',  name: 'Bitcoin',  symbol: 'BTC',  icon: '₿' },
  { id: 'eth',  name: 'Ethereum', symbol: 'ETH',  icon: 'Ξ' },
  { id: 'xrp',  name: 'Ripple',   symbol: 'XRP',  icon: '✕' },
  { id: 'xlm',  name: 'Stellar',  symbol: 'XLM',  icon: 'X' },
  { id: 'sol',  name: 'Solana',   symbol: 'SOL',  icon: '◎' },
  { id: 'rave', name: 'Rave',     symbol: 'RAVE', icon: 'R' },
];

export function PaymentMethodModal({ amount, onClose, onComplete }: PaymentMethodModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [wallets, setWallets] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then(r => r.json())
      .then(d => setWallets(d.wallets || {}))
      .catch(() => {});
  }, []);

  const paymentMethods: PaymentMethod[] = METHOD_META.map(m => ({
    ...m,
    address: wallets[m.symbol] || '',
  }));

  const handleCopyAddress = () => {
    if (selectedMethod?.address) {
      navigator.clipboard.writeText(selectedMethod.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMethod || !screenshot) {
      alert('Please select a method and upload a screenshot');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in.');
      return;
    }
    const formData = new FormData();
    formData.append('screenshot', screenshot);
    formData.append('method', selectedMethod.symbol);
    formData.append('amount', amount?.toString() || '0');

    try {
      const res = await fetch(`${API_URL}/api/user/payment/submit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        alert('✅ Payment submitted!');
        onComplete();
      } else {
        alert(`❌ Error: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert('Network error. Check your connection.');
    }
  };

  return (
    <div className="space-y-4">
      {!selectedMethod ? (
        <>
          <p className="text-slate-600 dark:text-slate-400">
            Select your preferred payment method{amount ? ` for $${amount.toLocaleString()}` : ''}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method)}
                disabled={!method.address}
                className="p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all bg-white dark:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-3xl mb-2">{method.icon}</div>
                <p className="text-slate-900 dark:text-white font-semibold">{method.symbol}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">{method.name}</p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{selectedMethod.icon}</span>
              <div>
                <p className="text-slate-900 dark:text-white font-semibold">{selectedMethod.name}</p>
                {amount && <p className="text-slate-600 dark:text-slate-400 text-sm">Amount: ${amount.toLocaleString()}</p>}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Wallet Address</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={selectedMethod.address}
                readOnly
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
              />
              <button onClick={handleCopyAddress} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2">
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Send payment to this address</p>
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Upload Payment Screenshot</label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-900">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="text-slate-400 mb-2" size={32} />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {screenshot ? screenshot.name : 'Click to upload screenshot'}
                </p>
              </div>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setSelectedMethod(null)} className="flex-1 py-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Change Method
            </button>
            <button onClick={handleSubmit} disabled={!screenshot} className="flex-1 py-3 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold transition-colors">
              Submit Payment
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default PaymentMethodModal;