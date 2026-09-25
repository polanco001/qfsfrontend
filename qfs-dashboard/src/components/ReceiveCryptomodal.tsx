import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

interface ReceiveCryptoModalProps {
  onClose: () => void;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://qfsbackend-1.onrender.com';

const COIN_META = [
  { symbol: 'BTC',  name: 'Bitcoin',  icon: '₿', color: 'text-orange-500' },
  { symbol: 'ETH',  name: 'Ethereum', icon: 'Ξ', color: 'text-purple-500' },
  { symbol: 'SOL',  name: 'Solana',   icon: '◎', color: 'text-green-500' },
  { symbol: 'ADA',  name: 'Cardano',  icon: '₳', color: 'text-blue-500' },
  { symbol: 'XRP',  name: 'Ripple',   icon: '✕', color: 'text-cyan-500' },
  { symbol: 'USDT', name: 'Tether',   icon: '₮', color: 'text-emerald-500' },
];

export function ReceiveCryptoModal({ onClose }: ReceiveCryptoModalProps) {
  const [wallets, setWallets] = useState<Record<string, string>>({});
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then(r => r.json())
      .then(d => setWallets(d.wallets || {}))
      .catch(() => {});
  }, []);

  const cryptos = COIN_META.map(c => ({ ...c, address: wallets[c.symbol] || '' }));
  const selectedCrypto = cryptos.find(c => c.symbol === selectedSymbol) || cryptos[0];

  const handleCopy = () => {
    if (!selectedCrypto.address) return;
    navigator.clipboard.writeText(selectedCrypto.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <p className="text-slate-600 dark:text-slate-400 text-sm">Select a coin to get your receive address</p>

      {/* Coin selector */}
      <div className="grid grid-cols-3 gap-2">
        {cryptos.map((c) => (
          <button
            key={c.symbol}
            onClick={() => setSelectedSymbol(c.symbol)}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedSymbol === c.symbol
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className={`text-xl mb-1 ${c.color}`}>{c.icon}</div>
            <p className="text-slate-900 dark:text-white font-semibold text-xs">{c.symbol}</p>
          </button>
        ))}
      </div>

      {/* QR placeholder + address */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 space-y-3">
        {/* QR code visual placeholder */}
        <div className="w-36 h-36 mx-auto bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-7 gap-px p-2 w-full h-full">
            {Array.from({ length: 49 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-sm ${
                  Math.random() > 0.5 ? 'bg-slate-900 dark:bg-white' : 'bg-transparent'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">
            {selectedCrypto.name} ({selectedCrypto.symbol}) Address
          </p>
          <p className="text-slate-900 dark:text-white text-xs font-mono break-all leading-5">
            {selectedCrypto.address || 'Not configured — please contact support'}
          </p>
        </div>

        <button
          onClick={handleCopy}
          disabled={!selectedCrypto.address}
          className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors text-sm ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white'
          }`}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy Address'}
        </button>
      </div>

      <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
        Only send {selectedCrypto.symbol} to this address. Sending other assets may result in permanent loss.
      </p>
    </div>
  );
}

export default ReceiveCryptoModal;