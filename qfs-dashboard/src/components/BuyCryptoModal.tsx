import { useState } from 'react';
import { CreditCard, DollarSign } from 'lucide-react';

interface BuyCryptoModalProps {
  onClose: () => void;
}

export function BuyCryptoModal({ onClose }: BuyCryptoModalProps) {
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const cryptos = [
    { symbol: 'BTC', name: 'Bitcoin', icon: '₿', price: 67234.56 },
    { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', price: 3456.78 },
    { symbol: 'SOL', name: 'Solana', icon: '◎', price: 142.34 },
    { symbol: 'ADA', name: 'Cardano', icon: '₳', price: 0.58 },
    { symbol: 'XRP', name: 'Ripple', icon: '✕', price: 0.52 },
  ];

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
    { id: 'bank', name: 'Bank Transfer', icon: DollarSign },
  ];

  const handleBuy = () => {
    if (!selectedCrypto || !amount || !paymentMethod) {
      alert('Please fill in all fields');
      return;
    }
    const crypto = cryptos.find(c => c.symbol === selectedCrypto);
    const estimatedAmount = parseFloat(amount) / (crypto?.price || 1);
    alert(`Purchase order submitted!\nBuying ${estimatedAmount.toFixed(8)} ${selectedCrypto} for $${amount} using ${paymentMethod}`);
    onClose();
  };

  return (
    <div className="space-y-4">
      <p className="text-slate-600 dark:text-slate-400">Select cryptocurrency to purchase</p>

      <div className="grid grid-cols-3 gap-3">
        {cryptos.map((crypto) => (
          <button
            key={crypto.symbol}
            onClick={() => setSelectedCrypto(crypto.symbol)}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedCrypto === crypto.symbol
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="text-2xl mb-1">{crypto.icon}</div>
            <p className="text-slate-900 dark:text-white font-semibold text-sm">{crypto.symbol}</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs">${crypto.price.toFixed(2)}</p>
          </button>
        ))}
      </div>

      {selectedCrypto && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">
              Amount (USD)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in USD"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {amount && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                ≈ {(parseFloat(amount) / (cryptos.find(c => c.symbol === selectedCrypto)?.price || 1)).toFixed(8)} {selectedCrypto}
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.name)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      paymentMethod === method.name
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <Icon className={`mx-auto mb-2 ${paymentMethod === method.name ? 'text-blue-500' : 'text-slate-400'}`} size={24} />
                    <p className="text-slate-900 dark:text-white font-semibold text-sm">{method.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleBuy}
            disabled={!amount || !paymentMethod}
            className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold transition-colors"
          >
            Buy {selectedCrypto}
          </button>
        </div>
      )}
    </div>
  );
}
