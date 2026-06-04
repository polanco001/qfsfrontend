import { useState, useEffect } from 'react';
import { X, Wallet, CreditCard, Shield, ExternalLink, Copy, Check } from 'lucide-react';

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
  { id: 'fixedfloat', name: 'FixedFloat', icon: '⚡', desc: 'No KYC • Instant' },
  { id: 'exolix', name: 'Exolix', icon: '🔄', desc: ' • Fixed rates' },
  { id: 'changenow', name: 'ChangeNOW', icon: '💱', desc: 'Card • Fast' },
  { id: 'moonpay', name: 'MoonPay', icon: '🌙', desc: 'Card • Bank (manual address)' },
];

export function BuyCryptoModal({ onClose, userEmail }: BuyCryptoModalProps) {
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
      // Copy wallet address first, then open MoonPay (user pastes it there)
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      window.open('https://buy.moonpay.com', '_blank');
      return;
    }

    // Other providers – auto‑fill wallet address in URL
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Buy Cryptocurrency</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Select a coin & provider – crypto comes to your wallet</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition">
          <X size={18} className="text-slate-500" />
        </button>
      </div>

      {/* Provider selector */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Exchange Provider</label>
        <div className="grid grid-cols-4 gap-2">
          {PROVIDERS.map(p => (
            <button
              key={p.id}
              onClick={() => setProvider(p.id)}
              className={`p-3 rounded-xl border-2 text-center transition ${
                provider === p.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="text-xl mb-1">{p.icon}</div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">{p.name}</div>
              <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Crypto grid */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Cryptocurrency</label>
        <div className="grid grid-cols-5 gap-2">
          {CRYPTOS.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCrypto(c.id)}
              className={`p-3 rounded-xl border-2 text-center transition ${
                selectedCrypto === c.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
              }`}
            >
              <div className="text-2xl font-bold" style={{ color: c.color }}>{c.icon}</div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">{c.symbol}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">${c.price.toLocaleString()}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected crypto info */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: crypto.color + '20', color: crypto.color }}>
          {crypto.icon}
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{crypto.name} ({crypto.symbol})</p>
          <p className="text-xs text-slate-500">1 {crypto.symbol} = ${crypto.price.toLocaleString()}</p>
        </div>
      </div>

      {/* Your wallet address – ALWAYS VISIBLE & COPYABLE */}
      <div className="p-3 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10">
        <label className="block text-xs font-medium text-blue-700 dark:text-blue-300 mb-1.5">
          🏦 Your {crypto.symbol} Wallet Address
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={walletAddress}
            readOnly
            className="flex-1 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white font-mono"
          />
          <button
            onClick={copyAddress}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition flex items-center gap-1.5"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1.5">
          Send only {crypto.symbol} to this address. You can copy it and use any exchange or wallet.
        </p>
      </div>

      {/* Amount (optional, for auto-fill providers) */}
      {provider !== 'moonpay' && (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Amount (USD) <span className="text-slate-400">(optional)</span></label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="10"
              className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none transition"
            />
            {amount && parseFloat(amount) > 0 && (
              <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Estimated you'll receive</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{estimatedCrypto} {crypto.symbol}</p>
                </div>
                <div className="text-3xl" style={{ color: crypto.color }}>{crypto.icon}</div>
              </div>
            )}
          </div>

          {/* Quick amounts */}
          <div className="grid grid-cols-4 gap-2">
            {['50', '100', '250', '500'].map(a => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className={`p-2 rounded-xl border-2 text-sm font-medium transition ${
                  amount === a
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700'
                    : 'border-slate-200 dark:border-slate-600 text-slate-500 hover:border-slate-300'
                }`}
              >
                ${a}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Buy button */}
      <button
        onClick={handleBuy}
        disabled={provider !== 'moonpay' && (!amount || parseFloat(amount) < 10)}
        className="w-full py-3.5 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
      >
        <span>{crypto.icon}</span>
        {provider === 'moonpay'
          ? `Copy Address & Open MoonPay`
          : `Buy ${crypto.symbol} via ${PROVIDERS.find(p => p.id === provider)?.name}`}
        <ExternalLink size={16} />
      </button>

      {/* MoonPay hint */}
      {provider === 'moonpay' && (
        <p className="text-xs text-amber-600 dark:text-amber-400 text-center bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
          ⚠️ The address has been copied. Paste it on MoonPay when asked for the destination wallet.
        </p>
      )}

      <p className="text-[10px] text-slate-400 text-center">
        You'll be redirected to complete your purchase. Crypto will be sent directly to your wallet.
      </p>

      <div className="flex items-center justify-center gap-4 pt-1">
        <div className="flex items-center gap-1 text-[10px] text-slate-400"><Shield size={12} /> No KYC Required</div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400"><Wallet size={12} /> Direct to Wallet</div>
      </div>
    </div>
  );
}
