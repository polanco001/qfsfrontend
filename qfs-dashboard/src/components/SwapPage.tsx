import { useState, useEffect } from 'react';
import { ArrowDownUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

const tokens = [
  { symbol: 'BTC', name: 'Bitcoin', price: 67000 },
  { symbol: 'ETH', name: 'Ethereum', price: 3500 },
  { symbol: 'SOL', name: 'Solana', price: 140 },
  { symbol: 'USDT', name: 'Tether', price: 1 },
];

export function SwapPage() {
  const { user, addTransaction, updateBalance } = useApp();
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      tokens.forEach(t => {
        const change = (Math.random() - 0.5) * 0.02;
        t.price = Math.max(0.01, t.price * (1 + change));
      });
      if (fromToken && toToken && fromAmount) {
        const rate = fromToken.price / toToken.price;
        setToAmount((parseFloat(fromAmount) * rate).toFixed(8));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [fromToken, toToken, fromAmount]);

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && !isNaN(parseFloat(value))) {
      const rate = fromToken.price / toToken.price;
      setToAmount((parseFloat(value) * rate).toFixed(8));
    } else {
      setToAmount('');
    }
  };

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
    if (value && !isNaN(parseFloat(value))) {
      const rate = toToken.price / fromToken.price;
      setFromAmount((parseFloat(value) * rate).toFixed(8));
    } else {
      setFromAmount('');
    }
  };

  const swapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleSwap = async () => {
    if (!user) return;
    const amountNum = parseFloat(fromAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (amountNum > user.balance) {
      setError('Insufficient balance');
      return;
    }
    setLoading(true);
    setError('');
    setTimeout(() => {
      const newBalance = user.balance - amountNum;
      updateBalance(newBalance);
      addTransaction({
        type: 'swap',
        amount: amountNum,
        currency: fromToken.symbol,
        details: `Swapped ${amountNum} ${fromToken.symbol} to ${toAmount} ${toToken.symbol}`,
      });
      alert('Swap completed!');
      setFromAmount('');
      setToAmount('');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Swap Tokens</h2>
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border">
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-slate-500">From</span>
            <span className="text-xs text-slate-400">Balance: {user?.balance.toFixed(2)} USDT</span>
          </div>
          <div className="flex gap-2">
            <select
              value={fromToken.symbol}
              onChange={(e) => setFromToken(tokens.find(t => t.symbol === e.target.value)!)}
              className="bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-sm"
            >
              {tokens.map(t => <option key={t.symbol}>{t.symbol}</option>)}
            </select>
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-right text-2xl outline-none"
            />
          </div>
          <div className="text-right text-xs text-slate-400 mt-1">≈ ${(parseFloat(fromAmount) * fromToken.price).toFixed(2)}</div>
        </div>

        <div className="flex justify-center my-2">
          <button onClick={swapTokens} className="p-2 rounded-full bg-slate-100 dark:bg-slate-700">
            <ArrowDownUp size={20} />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-slate-500">To</span>
          </div>
          <div className="flex gap-2">
            <select
              value={toToken.symbol}
              onChange={(e) => setToToken(tokens.find(t => t.symbol === e.target.value)!)}
              className="bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-sm"
            >
              {tokens.map(t => <option key={t.symbol}>{t.symbol}</option>)}
            </select>
            <input
              type="number"
              value={toAmount}
              onChange={(e) => handleToAmountChange(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-right text-2xl outline-none"
            />
          </div>
          <div className="text-right text-xs text-slate-400 mt-1">≈ ${(parseFloat(toAmount) * toToken.price).toFixed(2)}</div>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button
          onClick={handleSwap}
          disabled={loading || !fromAmount || parseFloat(fromAmount) <= 0}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg font-semibold"
        >
          {loading ? 'Swapping...' : 'Swap'}
        </button>
      </div>
    </div>
  );
}