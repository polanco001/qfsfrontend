import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface ReceiveCryptoModalProps {
  onClose: () => void;
}

const cryptos = [
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿', color: 'text-orange-500', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf2B' },
  { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', color: 'text-purple-500', address: '0x742d35Cc6634C0532925a3b8D4C9B2e5c8A1F22E' },
  { symbol: 'SOL', name: 'Solana', icon: '◎', color: 'text-green-500', address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' },
  { symbol: 'ADA', name: 'Cardano', icon: '₳', color: 'text-blue-500', address: 'addr1qxy5z7y7p4y7h6g5f4g3h2j1k0l9m8n7p6q5r4s3t2u1v0w9x8y7z' },
  { symbol: 'XRP', name: 'Ripple', icon: '✕', color: 'text-cyan-500', address: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh' },
  { symbol: 'USDT', name: 'Tether', icon: '₮', color: 'text-emerald-500', address: '0x742d35Cc6634C0532925a3b8D4C9B2e5c8A1F22E' },
];

export function ReceiveCryptoModal({ onClose }: ReceiveCryptoModalProps) {
  const [selectedCrypto, setSelectedCrypto] = useState(cryptos[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
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
            onClick={() => setSelectedCrypto(c)}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedCrypto.symbol === c.symbol
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
            {selectedCrypto.address}
          </p>
        </div>

        <button
          onClick={handleCopy}
          className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors text-sm ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
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
