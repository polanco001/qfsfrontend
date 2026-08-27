import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CryptoRate {
  symbol: string;
  name: string;
  price: number;
  change: number;
  trending: boolean;
}

export function CryptoRatesWidget() {
  const { livePrices, fetchLivePrices } = useApp();
  const [rates, setRates] = useState<CryptoRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLivePrices();
  }, []);

  useEffect(() => {
    if (Object.keys(livePrices).length > 0) {
      const symbolMap: Record<string, string> = {
        BTC: 'Bitcoin',
        ETH: 'Ethereum',
        SOL: 'Solana',
        USDT: 'Tether',
        ADA: 'Cardano',
        XRP: 'Ripple',
        DOGE: 'Dogecoin',
        BNB: 'BNB',
        LTC: 'Litecoin',
        DOT: 'Polkadot',
        TRX: 'TRON',
        LINK: 'Chainlink',
        MATIC: 'Polygon',
        SHIB: 'Shiba Inu'
      };

      const newRates: CryptoRate[] = Object.keys(livePrices).map(symbol => ({
        symbol,
        name: symbolMap[symbol] || symbol,
        price: livePrices[symbol] || 0,
        change: 0, // We can't get 24h change from simple price, so we set 0 for now
        trending: true
      }));

      setRates(newRates);
      setLoading(false);
    }
  }, [livePrices]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="animate-pulse space-y-3">
          {[1,2,3,4,5,6].map(i => (
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
          <button onClick={fetchLivePrices} className="text-blue-500 hover:text-blue-600">↻ Refresh</button>
          <span className="text-slate-500">Updated: {new Date().toLocaleTimeString()}</span>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}