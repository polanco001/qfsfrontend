import { useState } from 'react';
import { X } from 'lucide-react';

interface LivePriceChartProps {
  onClose: () => void;
  defaultSymbol?: string;
}

const ASSETS = [
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

export function LivePriceChart({ onClose, defaultSymbol = 'BTC' }: LivePriceChartProps) {
  const [selectedSymbol, setSelectedSymbol] = useState(defaultSymbol);

  const asset = ASSETS.find(a => a.symbol === selectedSymbol) || ASSETS[0];

  const getChartSrc = (symbol: string) => {
    const symbolMap: Record<string, string> = {
      BTC: 'BINANCE:BTCUSDT',
      ETH: 'BINANCE:ETHUSDT',
      SOL: 'BINANCE:SOLUSDT',
      USDT: 'BINANCE:USDTUSDT',
      ADA: 'BINANCE:ADAUSDT',
      XRP: 'BINANCE:XRPUSDT',
      DOGE: 'BINANCE:DOGEUSDT',
      BNB: 'BINANCE:BNBUSDT',
      LTC: 'BINANCE:LTCUSDT',
      DOT: 'BINANCE:DOTUSDT',
      TRX: 'BINANCE:TRXUSDT',
      LINK: 'BINANCE:LINKUSDT',
      MATIC: 'BINANCE:MATICUSDT',
      SHIB: 'BINANCE:SHIBUSDT',
    };

    const tradingViewSymbol = symbolMap[symbol] || 'BINANCE:BTCUSDT';
    return `https://www.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${tradingViewSymbol}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=&utm_medium=widget_new&utm_campaign=chart&utm_term=${tradingViewSymbol}`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Live Price Chart</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
          <X size={18} />
        </button>
      </div>

      {/* Asset Selector */}
      <div className="flex flex-wrap gap-2">
        {ASSETS.map(a => (
          <button
            key={a.symbol}
            onClick={() => setSelectedSymbol(a.symbol)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedSymbol === a.symbol
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {a.symbol}
          </button>
        ))}
      </div>

      {/* TradingView Chart */}
      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <iframe
          src={getChartSrc(selectedSymbol)}
          className="w-full h-[500px]"
          frameBorder="0"
          allowFullScreen
          title={`${selectedSymbol} Price Chart`}
        />
      </div>

      {/* Info */}
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
        Live chart for {asset.name} ({asset.symbol}) - Powered by TradingView
      </p>
    </div>
  );
}