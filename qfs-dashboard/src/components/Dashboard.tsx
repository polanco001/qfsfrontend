import { useState } from 'react';
import { ShoppingCart, TrendingDown, Repeat, Wallet } from 'lucide-react';
import { ActionCard } from './ActionCard';
import { CryptoRatesWidget } from './CryptoRatesWidget';
import { Modal } from './Modal';
import { BuyCryptoModal } from './BuyCryptoModal';
import { ConnectWalletModal } from './ConnectWalletModal';

export function Dashboard() {
  const [showBuyCrypto, setShowBuyCrypto] = useState(false);
  const [showConnectWallet, setShowConnectWallet] = useState(false);

  const actions = [
    { id: 'buy', title: 'Buy Crypto', description: 'Purchase cryptocurrency with your preferred payment method', icon: ShoppingCart, color: 'green' },
    { id: 'sell', title: 'Sell Crypto', description: 'Convert your cryptocurrency to fiat currency', icon: TrendingDown, color: 'red' },
    { id: 'swap', title: 'Swap Tokens', description: 'Exchange one cryptocurrency for another instantly', icon: Repeat, color: 'blue' },
    { id: 'connect', title: 'Connect Wallet', description: 'Link your cryptocurrency wallet to access all features', icon: Wallet, color: 'purple' },
  ];

  const handleActionClick = (actionId: string) => {
    if (actionId === 'buy') setShowBuyCrypto(true);
    else if (actionId === 'connect') setShowConnectWallet(true);
    else if (actionId === 'sell') alert('Sell Crypto feature is coming soon. Stay tuned!');
    else if (actionId === 'swap') alert('Swap Tokens feature is coming soon. Stay tuned!');
  };

  return (
    <>
      <div className="p-4 md:p-8">
        <div className="mb-8">
          <h2 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold mb-2">Welcome Back!</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">Manage your crypto portfolio with ease</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 lg:gap-6 mb-8">
          {actions.map((action) => (
            <ActionCard
              key={action.id}
              title={action.title}
              description={action.description}
              icon={action.icon}
              color={action.color}
              onClick={() => handleActionClick(action.id)}
            />
          ))}
        </div>
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
      <Modal isOpen={showBuyCrypto} onClose={() => setShowBuyCrypto(false)} title="Buy Cryptocurrency">
        <BuyCryptoModal onClose={() => setShowBuyCrypto(false)} />
      </Modal>
      <Modal isOpen={showConnectWallet} onClose={() => setShowConnectWallet(false)} title="Connect Wallet">
        <ConnectWalletModal onClose={() => setShowConnectWallet(false)} />
      </Modal>
    </>
  );
}