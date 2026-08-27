import { useState, useEffect } from 'react';
import { ShoppingCart, TrendingDown, Repeat, Wallet, ArrowUpRight, ShieldAlert, RefreshCw, Lock } from 'lucide-react';
import ActionCard from './ActionCard';
import { CryptoRatesWidget } from './CryptoRatesWidget';
import { Modal } from './Modal';
import { BuyCryptoModal } from './BuyCryptoModal';
import { ConnectWalletModal } from './ConnectWalletModal';
import { WithdrawModal } from './WithdrawModal';
import { SwapPage } from './SwapPage';
import { SellCryptoModal } from './SellCryptoModal';
import { PortfolioChart } from './PortfolioChart';
import { LivePriceChart } from './LivePriceChart';
import { WalletBackupModal } from './WalletBackupModal';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const ASSET_ICONS: Record<string, string> = {
  BTC: '₿', ETH: 'Ξ', SOL: '◎', USDT: '₮', ADA: '₳', XRP: '✕',
  DOGE: 'Ð', BNB: 'BNB', LTC: 'Ł', DOT: '●', TRX: 'T', LINK: '⬡', MATIC: 'M', SHIB: 'SHIB'
};

export function Dashboard() {
  const { user, fetchUser, assets, livePrices, fetchLivePrices, getWalletBackup, fetchStakes } = useApp();
  const navigate = useNavigate();
  const [showBuyCrypto, setShowBuyCrypto] = useState(false);
  const [showConnectWallet, setShowConnectWallet] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showKYCAlert, setShowKYCAlert] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  const [showSell, setShowSell] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [chartSymbol, setChartSymbol] = useState('BTC');
  const [showWalletBackup, setShowWalletBackup] = useState(false);
  const [hasBackup, setHasBackup] = useState(false);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [stakeSummary, setStakeSummary] = useState({ count: 0, totalValue: 0, assetCount: 0 });

  useEffect(() => {
    if (user) fetchUser();
    fetchLivePrices();
    checkBackupStatus();
    loadStakeSummary();
  }, []);

  const checkBackupStatus = async () => {
    const phrase = await getWalletBackup();
    setHasBackup(phrase !== '');
  };

  const loadStakeSummary = async () => {
    const stakes = await fetchStakes();
    let totalValue = 0;
    const assetSet = new Set<string>();
    stakes.forEach(stake => {
      totalValue += stake.amount * (livePrices[stake.asset] || 0);
      assetSet.add(stake.asset);
    });
    setStakeSummary({
      count: stakes.length,
      totalValue,
      assetCount: assetSet.size
    });
  };

  const actions = [
    { id: 'buy', title: 'Buy Crypto', description: 'Purchase cryptocurrency with your preferred payment method', icon: ShoppingCart, color: 'green' },
    { id: 'sell', title: 'Sell Crypto', description: 'Convert your cryptocurrency to fiat currency', icon: TrendingDown, color: 'red' },
    { id: 'swap', title: 'Swap Tokens', description: 'Exchange one cryptocurrency for another instantly', icon: Repeat, color: 'blue' },
    { id: 'connect', title: 'Connect Wallet', description: 'Link your cryptocurrency wallet to access all features', icon: Wallet, color: 'purple' },
    { id: 'withdraw', title: 'Withdraw', description: 'Transfer funds to your wallet or bank account', icon: ArrowUpRight, color: 'purple' },
  ];

  const handleActionClick = (actionId: string) => {
    if (actionId === 'buy') setShowBuyCrypto(true);
    else if (actionId === 'sell') setShowSell(true);
    else if (actionId === 'swap') setShowSwap(true);
    else if (actionId === 'connect') setShowConnectWallet(true);
    else if (actionId === 'withdraw') {
      if (!user?.kycCompleted) setShowKYCAlert(true);
      else setShowWithdraw(true);
    }
  };

  const handleAssetClick = (asset: string) => {
    setChartSymbol(asset);
    setShowChart(true);
  };

  const totalAssetValue = Object.keys(assets).reduce((total, asset) => {
    return total + (assets[asset as keyof typeof assets] || 0) * (livePrices[asset] || 0);
  }, 0);

  const assetEntries = Object.entries(assets).filter(([asset, amount]) => amount > 0);

  const handleRefreshPrices = async () => {
    setPricesLoading(true);
    await fetchLivePrices();
    setPricesLoading(false);
    loadStakeSummary();
  };

  return (
    <>
      <div className="p-4 md:p-8">
        <div className="mb-8">
          <h2 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold mb-2">Welcome Back!</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">Manage your crypto portfolio with ease</p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4 lg:gap-6 mb-8">
          {actions.map((action) => (
            <ActionCard key={action.id} title={action.title} description={action.description} icon={action.icon} color={action.color} onClick={() => handleActionClick(action.id)} />
          ))}
        </div>

        {/* Staking Summary / Wallet Backup Alert */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-white">
            <p className="text-sm opacity-80">Total Asset Value</p>
            <p className="text-2xl font-bold">${totalAssetValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-4 text-white">
            <p className="text-sm opacity-80">Active Stakes</p>
            <p className="text-2xl font-bold">{stakeSummary.count} <span className="text-sm">({stakeSummary.assetCount} assets)</span></p>
            <p className="text-xs opacity-80 mt-1">Value: ${stakeSummary.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className={`rounded-xl p-4 border ${hasBackup ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'}`}>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {hasBackup ? '✅ Wallet Backed Up' : '⚠️ Wallet Backup Required'}
            </p>
            <button onClick={() => setShowWalletBackup(true)} className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
              {hasBackup ? 'View Backup' : 'Backup Now'}
            </button>
          </div>
        </div>

        {/* Assets & Portfolio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-900 dark:text-white text-xl font-semibold">Your Assets</h3>
              <button onClick={handleRefreshPrices} disabled={pricesLoading} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
                <RefreshCw size={14} className={pricesLoading ? 'animate-spin' : ''} /> {pricesLoading ? 'Updating...' : 'Refresh'}
              </button>
            </div>
            <div className="mb-4">
              <span className="text-sm text-slate-500">Total Value: </span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">${totalAssetValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            {assetEntries.length === 0 ? (
              <p className="text-slate-500">You don't hold any crypto assets yet. Use the Swap or Buy Crypto buttons to get started.</p>
            ) : (
              <div className="space-y-3">
                {assetEntries.map(([asset, amount]) => (
                  <div key={asset} onClick={() => handleAssetClick(asset)} className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-900 px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">{ASSET_ICONS[asset] || asset[0]}</div>
                      <div>
                        <p className="text-slate-900 dark:text-white font-semibold">{asset}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{(amount).toFixed(6)} {asset}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-900 dark:text-white font-semibold">${(amount * (livePrices[asset] || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p className="text-xs text-slate-500">@ ${(livePrices[asset] || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-slate-900 dark:text-white text-xl font-semibold mb-4">Portfolio Distribution</h3>
            <PortfolioChart />
          </div>
        </div>

        {/* Crypto Rates Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-slate-900 dark:text-white text-xl font-semibold mb-4">Portfolio Overview</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">24h Volume</p>
                <p className="text-slate-900 dark:text-white text-2xl font-bold">$2,341.00</p>
                <p className="text-blue-500 text-sm mt-1">12 transactions</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Profit/Loss</p>
                <p className="text-slate-900 dark:text-white text-2xl font-bold">+$1,234.56</p>
                <p className="text-green-500 text-sm mt-1">+11.2% all time</p>
              </div>
            </div>
          </div>
          <CryptoRatesWidget />
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={showBuyCrypto} onClose={() => setShowBuyCrypto(false)} title="Buy Cryptocurrency"><BuyCryptoModal onClose={() => setShowBuyCrypto(false)} /></Modal>
      <Modal isOpen={showConnectWallet} onClose={() => setShowConnectWallet(false)} title="Connect Wallet"><ConnectWalletModal onClose={() => setShowConnectWallet(false)} /></Modal>
      <Modal isOpen={showWithdraw} onClose={() => setShowWithdraw(false)} title="Withdraw Funds"><WithdrawModal onClose={() => setShowWithdraw(false)} /></Modal>
      <Modal isOpen={showSwap} onClose={() => setShowSwap(false)} title="Swap Tokens"><SwapPage /></Modal>
      <Modal isOpen={showSell} onClose={() => setShowSell(false)} title="Sell Crypto"><SellCryptoModal onClose={() => setShowSell(false)} /></Modal>
      <Modal isOpen={showChart} onClose={() => setShowChart(false)} title="Live Price Chart"><LivePriceChart onClose={() => setShowChart(false)} defaultSymbol={chartSymbol} /></Modal>
      <Modal isOpen={showWalletBackup} onClose={() => setShowWalletBackup(false)} title="Wallet Backup"><WalletBackupModal onClose={() => setShowWalletBackup(false)} /></Modal>

      {/* KYC warning modal */}
      <Modal isOpen={showKYCAlert} onClose={() => setShowKYCAlert(false)} title="KYC Required">
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <ShieldAlert size={40} className="text-amber-500" />
          <p className="text-slate-700 dark:text-slate-300 text-center">You must complete KYC verification before you can withdraw funds.</p>
          <div className="flex gap-3 w-full">
            <button onClick={() => setShowKYCAlert(false)} className="flex-1 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">Cancel</button>
            <button onClick={() => { setShowKYCAlert(false); navigate('/kyc'); }} className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium">Go to KYC</button>
          </div>
        </div>
      </Modal>
    </>
  );
}