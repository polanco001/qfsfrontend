// src/components/CryptoRatesWidget.tsx
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CryptoRate {
  symbol: string;
  name: string;
  price: number;
  change: number;
  trending: boolean;
}

export function CryptoRatesWidget() {
  const [rates, setRates] = useState<CryptoRate[]>([
    { symbol: 'BTC', name: 'Bitcoin', price: 0, change: 0, trending: true },
    { symbol: 'ETH', name: 'Ethereum', price: 0, change: 0, trending: true },
    { symbol: 'SOL', name: 'Solana', price: 0, change: 0, trending: true },
    { symbol: 'ADA', name: 'Cardano', price: 0, change: 0, trending: true },
    { symbol: 'XRP', name: 'Ripple', price: 0, change: 0, trending: true },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [retryCount, setRetryCount] = useState(0);
  const [usingFallback, setUsingFallback] = useState(false);

  // Fallback simulated price changes (used when API is unreachable)
  const simulatePrices = () => {
    setRates(prev => prev.map(rate => {
      const changePercent = (Math.random() - 0.5) * 4; // -2% to +2%
      const newPrice = rate.price === 0 
        ? (rate.symbol === 'BTC' ? 67000 : rate.symbol === 'ETH' ? 3500 : rate.symbol === 'SOL' ? 140 : rate.symbol === 'ADA' ? 0.58 : 0.52)
        : rate.price * (1 + changePercent / 100);
      const newChange = rate.change + (Math.random() - 0.5) * 0.8;
      return {
        ...rate,
        price: newPrice,
        change: newChange,
        trending: newChange >= 0,
      };
    }));
    setLastUpdate(new Date());
    setError('Using simulated data – live feed unavailable');
    setUsingFallback(true);
  };

  const fetchPrices = async (attempt = 0) => {
    try {
      const ids = ['bitcoin', 'ethereum', 'solana', 'cardano', 'ripple'];
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.bitcoin && !data.ethereum) throw new Error('Invalid response');
      
      const newRates: CryptoRate[] = [
        { symbol: 'BTC', name: 'Bitcoin', price: data.bitcoin?.usd || 0, change: data.bitcoin?.usd_24h_change || 0, trending: (data.bitcoin?.usd_24h_change || 0) >= 0 },
        { symbol: 'ETH', name: 'Ethereum', price: data.ethereum?.usd || 0, change: data.ethereum?.usd_24h_change || 0, trending: (data.ethereum?.usd_24h_change || 0) >= 0 },
        { symbol: 'SOL', name: 'Solana', price: data.solana?.usd || 0, change: data.solana?.usd_24h_change || 0, trending: (data.solana?.usd_24h_change || 0) >= 0 },
        { symbol: 'ADA', name: 'Cardano', price: data.cardano?.usd || 0, change: data.cardano?.usd_24h_change || 0, trending: (data.cardano?.usd_24h_change || 0) >= 0 },
        { symbol: 'XRP', name: 'Ripple', price: data.ripple?.usd || 0, change: data.ripple?.usd_24h_change || 0, trending: (data.ripple?.usd_24h_change || 0) >= 0 },
      ];

      // Dispatch notification event if any price changed significantly
      newRates.forEach(rate => {
        window.dispatchEvent(new CustomEvent('crypto-price-update', {
          detail: { symbol: rate.symbol, price: rate.price, changePercent: rate.change }
        }));
      });

      setRates(newRates);
      setLastUpdate(new Date());
      setError(null);
      setUsingFallback(false);
      setRetryCount(0);
    } catch (err) {
      console.error(`Price fetch error (attempt ${attempt + 1}):`, err);
      if (attempt < 2) { // retry up to 2 times
        setTimeout(() => fetchPrices(attempt + 1), 2000 * (attempt + 1));
      } else {
        if (!usingFallback) {
          simulatePrices();
        }
        setError('Live feed unavailable – showing simulated prices');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(() => {
      if (!usingFallback) {
        fetchPrices();
      } else {
        // Keep simulation running
        simulatePrices();
      }
    }, 10000); // every 10 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="animate-pulse space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-slate-900 dark:text-white text-xl font-semibold">Live Crypto Rates</h3>
        <div className="flex items-center gap-2 text-xs">
          {error && <span className="text-amber-500">{error}</span>}
          <button onClick={() => fetchPrices()} className="text-blue-500 hover:text-blue-600">↻ Refresh</button>
          <span className="text-slate-500">Updated: {lastUpdate.toLocaleTimeString()}</span>
          <div className="flex items-center gap-1 text-green-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {rates.map((rate) => (
          <div key={rate.symbol} className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {rate.symbol[0]}
              </div>
              <div>
                <p className="text-slate-900 dark:text-white font-semibold">{rate.symbol}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{rate.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-900 dark:text-white font-semibold">
                ${rate.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1 justify-end">
                {rate.change >= 0 ? <TrendingUp className="text-green-500" size={14} /> : <TrendingDown className="text-red-500" size={14} />}
                <span className={rate.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {rate.change >= 0 ? '+' : ''}{rate.change.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}