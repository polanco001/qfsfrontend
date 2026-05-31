export function MarketPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-slate-900 dark:text-white text-3xl font-bold mb-2">Live Market</h2>
        <p className="text-slate-600 dark:text-slate-400">Real-time trading charts powered by TradingView</p>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <iframe
          src="https://www.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=BINANCE%3ABTCUSDT&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=&utm_medium=widget_new&utm_campaign=chart&utm_term=BINANCE%3ABTCUSDT"
          className="w-full h-[600px]"
          frameBorder="0"
          allowFullScreen
          title="TradingView Chart"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">24h Volume</p>
          <p className="text-slate-900 dark:text-white text-2xl font-bold">$2.4B</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Market Cap</p>
          <p className="text-slate-900 dark:text-white text-2xl font-bold">$1.2T</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Active Traders</p>
          <p className="text-slate-900 dark:text-white text-2xl font-bold">124K</p>
        </div>
      </div>
    </div>
  );
}