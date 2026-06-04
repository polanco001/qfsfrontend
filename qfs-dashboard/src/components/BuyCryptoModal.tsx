import { useState, useEffect } from 'react';
import { X, Wallet, Shield, ExternalLink, Copy, Check } from 'lucide-react';

interface BuyCryptoModalProps {
  onClose: () => void;
  userEmail?: string;
}

// Your real wallet addresses
const WALLETS = {
  btc: 'bc1qq8h0yqzt3r7543wnjr63va77pd3lyfqdmt9zmz',
  eth: '0x79152da483747c96f9c7c375117abe3461368800',
  sol: 'Er7AH3YPnncoTY3DrD793hRGNZHeEr2BGHQtL4erPqah',
  ada: '0x79152da483747c96f9c7c375117abe3461368800',
  xrp: 'rQHrmfjM96NkenhQ9YeL24hUBZznCMZ356',
};

const CRYPTOS = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', icon: '₿', price: 67234.56, color: '#f7931a' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', price: 3456.78, color: '#627eea' },
  { id: 'sol', name: 'Solana', symbol: 'SOL', icon: '◎', price: 142.34, color: '#9945ff' },
  { id: 'ada', name: 'Cardano', symbol: 'ADA', icon: '₳', price: 0.58, color: '#0033ad' },
  { id: 'xrp', name: 'XRP', symbol: 'XRP', icon: '✕', price: 0.52, color: '#23292f' },
];

const PROVIDERS = [
  { id: 'fixedfloat', name: 'FixedFloat', icon: '⚡', desc: 'No KYC' },
  { id: 'exolix', name: 'Exolix', icon: '🔄', desc: 'Anonymous' },
  { id: 'changenow', name: 'ChangeNOW', icon: '💱', desc: 'Card' },
  { id: 'moonpay', name: 'MoonPay', icon: '🌙', desc: 'Card/Bank' },
];

export function BuyCryptoModal({ onClose }: BuyCryptoModalProps) {
  const [selectedCrypto, setSelectedCrypto] = useState('btc');
  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState('fixedfloat');
  const [estimatedCrypto, setEstimatedCrypto] = useState('0');
  const [copied, setCopied] = useState(false);

  const crypto = CRYPTOS.find(c => c.id === selectedCrypto)!;
  const walletAddress = WALLETS[selectedCrypto as keyof typeof WALLETS];

  useEffect(() => {
    if (amount && crypto) {
      setEstimatedCrypto((parseFloat(amount) / crypto.price).toFixed(6));
    } else {
      setEstimatedCrypto('0');
    }
  }, [amount, selectedCrypto]);

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBuy = () => {
    if (provider === 'moonpay') {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      window.open('https://buy.moonpay.com', '_blank');
      return;
    }

    let url = '';
    switch (provider) {
      case 'fixedfloat':
        url = `https://fixedfloat.com/?to=${selectedCrypto.toUpperCase()}&address=${walletAddress}&amount=${amount}`;
        break;
      case 'exolix':
        url = `https://exolix.com/?to=${selectedCrypto.toUpperCase()}&address=${walletAddress}&amount=${amount}`;
        break;
      case 'changenow':
        url = `https://changenow.io/?to=${selectedCrypto.toLowerCase()}&address=${walletAddress}&amount=${amount}&from=usd`;
        break;
    }
    if (url) window.open(url, '_blank');
  };

  return (
    <div className="space-y-4 max-h-[85vh] overflow-y-auto px-1">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 pb-2 z-10">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Buy Cryptocurrency</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">No KYC · Direct to wallet</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition -mr-2">
          <X size={18} className="text-slate-500" />
        </button>
      </div>

      {/* Crypto selector – big tap targets */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Coin</label>
        <div className="flex gap-1.5">
          {CRYPTOS.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCrypto(c.id)}
              className={`flex-1 py-2.5 rounded-xl border-2 text-center transition ${
                selectedCrypto === c.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-600 active:bg-slate-50'
              }`}
            >
              <div className="text-xl font-bold" style={{ color: c.color }}>{c.icon}</div>
              <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{c.symbol}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Amount (USD) <span className="text-slate-400 font-normal">optional</span>
        </label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="$100"
          inputMode="decimal"
          className="w-full px-3 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-base text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none transition"
        />
        {amount && parseFloat(amount) > 0 && (
          <div className="mt-1.5 py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-between">
            <p className="text-xs text-slate-500">≈ {estimatedCrypto} {crypto.symbol}</p>
            <span style={{ color: crypto.color }}>{crypto.icon}</span>
          </div>
        )}
      </div>

      {/* Quick amounts */}
      <div className="grid grid-cols-4 gap-1.5">
        {['50', '100', '250', '500'].map(a => (
          <button
            key={a}
            onClick={() => setAmount(a)}
            className={`py-2.5 rounded-xl border-2 text-sm font-medium transition ${
              amount === a
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700'
                : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 active:bg-slate-50'
            }`}
          >
            ${a}
          </button>
        ))}
      </div>

      {/* Provider */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Provider</label>
        <div className="grid grid-cols-4 gap-1.5">
          {PROVIDERS.map(p => (
            <button
              key={p.id}
              onClick={() => setProvider(p.id)}
              className={`py-2.5 rounded-xl border-2 text-center transition ${
                provider === p.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-600 active:bg-slate-50'
              }`}
            >
              <div className="text-lg">{p.icon}</div>
              <div className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">{p.name}</div>
              <div className="text-[9px] text-slate-400">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Wallet address – compact but copyable */}
      <div className="p-2.5 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-700 bg-blue-50/40 dark:bg-blue-900/10">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-medium text-blue-700 dark:text-blue-300">🏦 {crypto.symbol} Wallet</p>
          <button
            onClick={copyAddress}
            className="text-[10px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 active:scale-95 transition"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="text-[11px] text-slate-700 dark:text-slate-300 font-mono break-all leading-tight">{walletAddress}</p>
      </div>

      {/* MoonPay hint */}
      {provider === 'moonpay' && (
        <p className="text-[11px] text-amber-600 dark:text-amber-400 text-center bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
          ⚠️ Address copied – paste it on MoonPay
        </p>
      )}

      {/* Buy button – big & sticky */}
      <button
        onClick={handleBuy}
        className="w-full py-3.5 bg-gradient-to-r from-green-500 to-blue-600 active:from-green-600 active:to-blue-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 text-base"
      >
        <span>{crypto.icon}</span>
        {provider === 'moonpay' ? 'Copy Address & Open MoonPay' : `Buy ${crypto.symbol} via ${PROVIDERS.find(p => p.id === provider)?.name}`}
        <ExternalLink size={16} />
      </button>

      <p className="text-[10px] text-slate-400 text-center pb-1">🔒 No KYC · Direct to your wallet</p>
    </div>
  );
}
