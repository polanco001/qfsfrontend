import { useState, useEffect } from 'react';
import { ArrowDownUp, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function SwapPage() {
  const { user, assets, swapAssets, convertToAsset, fetchAssets } = useApp();
  const [fromToken, setFromToken] = useState<string>('USD');
  const [toToken, setToToken] = useState<string>('BTC');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [pricesLoading, setPricesLoading] = useState(false);

  const tokens = [
    { symbol: 'USD', name: 'US Dollar' },
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'USDT', name: 'Tether' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'XRP', name: 'Ripple' },
    { symbol: 'DOGE', name: 'Dogecoin' },
    { symbol: 'BNB', name: 'BNB' },
    { symbol: 'LTC', name: 'Litecoin' },
    { symbol: 'DOT', name: 'Polkadot' },
    { symbol: 'TRX', name: 'TRON' },
    { symbol: 'LINK', name: 'Chainlink' },
    { symbol: 'MATIC', name: 'Polygon' },
    { symbol: 'SHIB', name: 'Shiba Inu' },
  ];

  useEffect(() => {
    fetchAssets();
    fetchLivePrices();
  }, []);

  const fetchLivePrices = async () => {
    setPricesLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/user/prices`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLivePrices(data);
      }
    } catch (err) {
      console.error('Failed to fetch prices:', err);
    } finally {
      setPricesLoading(false);
    }
  };

  // Fetch prices every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchLivePrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const getPrice = (symbol: string) => {
    if (symbol === 'USD') return 1;
    return livePrices[symbol] || 1;
  };

  const getBalance = (symbol: string) => {
    if (symbol === 'USD') return user?.balance || 0;
    return assets[symbol as keyof typeof assets] || 0;
  };

  useEffect(() => {
    if (fromAmount && !isNaN(parseFloat(fromAmount))) {
      const fromPrice = getPrice(fromToken);
      const toPrice = getPrice(toToken);
      const rate = fromPrice / toPrice;
      setToAmount((parseFloat(fromAmount) * rate).toFixed(8));
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromToken, toToken, livePrices]);

  const swapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount('');
    setToAmount('');
  };

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    const amount = parseFloat(fromAmount);

    if (fromToken === 'USD') {
      if ((user?.balance || 0) < amount) {
        setError('Insufficient USD balance');
        return;
      }
      setLoading(true);
      setError('');
      const success = await convertToAsset(toToken, amount);
      setLoading(false);
      if (success) {
        alert('Conversion successful!');
        setFromAmount('');
        setToAmount('');
        fetchLivePrices();
      } else {
        setError('Conversion failed. Please try again.');
      }
    } else {
      if ((assets[fromToken as keyof typeof assets] || 0) < amount) {
        setError(`Insufficient ${fromToken} balance`);
        return;
      }
      setLoading(true);
      setError('');
      const success = await swapAssets(fromToken, toToken, amount);
      setLoading(false);
      if (success) {
        alert('Swap completed!');
        setFromAmount('');
        setToAmount('');
        fetchLivePrices();
      } else {
        setError('Swap failed. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Swap / Convert</h2>
        <button
          onClick={fetchLivePrices}
          disabled={pricesLoading}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400"
        >
          <RefreshCw size={16} className={pricesLoading ? 'animate-spin' : ''} />
        </button>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border">
        {/* From Section */}
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-slate-500">From</span>
            <span className="text-xs text-slate-400">
              {fromToken === 'USD' ? `Balance: $${(user?.balance || 0).toFixed(2)}` : `Balance: ${getBalance(fromToken).toFixed(6)} ${fromToken}`}
            </span>
          </div>
          <div className="flex gap-2">
            <select
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              className="bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-sm"
            >
              {tokens.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
            </select>
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-right text-2xl outline-none"
            />
          </div>
          <div className="text-right text-xs text-slate-400 mt-1">
            1 {fromToken} ≈ ${getPrice(fromToken).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Swap Icon */}
        <div className="flex justify-center my-2">
          <button onClick={swapTokens} className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200">
            <ArrowDownUp size={20} />
          </button>
        </div>

        {/* To Section */}
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-slate-500">To</span>
            <span className="text-xs text-slate-400">
              Balance: {getBalance(toToken).toFixed(6)} {toToken}
            </span>
          </div>
          <div className="flex gap-2">
            <select
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              className="bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-sm"
            >
              {tokens.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
            </select>
            <input
              type="number"
              value={toAmount}
              readOnly
              placeholder="0.0"
              className="flex-1 bg-transparent text-right text-2xl outline-none"
            />
          </div>
          <div className="text-right text-xs text-slate-400 mt-1">
            1 {toToken} ≈ ${getPrice(toToken).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Error */}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* Submit Button */}
        <button
          onClick={handleSwap}
          disabled={loading || !fromAmount || parseFloat(fromAmount) <= 0}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg font-semibold"
        >
          {loading ? 'Processing...' : fromToken === 'USD' ? 'Convert to Crypto' : 'Swap Tokens'}
        </button>
      </div>
    </div>
  );
}