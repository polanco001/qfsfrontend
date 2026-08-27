import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TrendingUp, TrendingDown, RefreshCw, ArrowLeftRight, Wallet, CreditCard, Gift, FileText, Search, ArrowDownToLine, ArrowUpFromLine, Lock, Unlock } from 'lucide-react';

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  currency?: string;
  details?: string;
  timestamp: string;
}

export function TransactionHistoryPage() {
  const { transactions, fetchTransactions } = useApp();
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell' | 'swap' | 'card' | 'medbed' | 'giftcard' | 'topup' | 'withdraw' | 'stake' | 'unstake'>('all');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter !== 'all' && tx.type !== filter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!tx.type.toLowerCase().includes(term) && !tx.details?.toLowerCase().includes(term)) return false;
    }
    return true;
  });

  const getAmountDisplay = (tx: Transaction) => {
    if (tx.type === 'topup' || tx.type === 'sell' || tx.type === 'unstake') return { sign: '+', color: 'text-green-500' };
    if (tx.type === 'withdraw' || tx.type === 'buy' || tx.type === 'card' || tx.type === 'medbed' || tx.type === 'giftcard' || tx.type === 'stake') return { sign: '-', color: 'text-red-500' };
    return { sign: '', color: 'text-slate-500' };
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'topup': return <ArrowDownToLine size={20} className="text-green-500" />;
      case 'withdraw': return <ArrowUpFromLine size={20} className="text-red-500" />;
      case 'buy': return <TrendingUp size={20} className="text-green-500" />;
      case 'sell': return <TrendingDown size={20} className="text-red-500" />;
      case 'swap': return <ArrowLeftRight size={20} className="text-blue-500" />;
      case 'card': return <CreditCard size={20} className="text-purple-500" />;
      case 'medbed': return <Wallet size={20} className="text-teal-500" />;
      case 'giftcard': return <Gift size={20} className="text-amber-500" />;
      case 'stake': return <Lock size={20} className="text-blue-500" />;
      case 'unstake': return <Unlock size={20} className="text-green-500" />;
      default: return <FileText size={20} className="text-slate-500" />;
    }
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'topup', label: 'Top Up' },
    { id: 'withdraw', label: 'Withdraw' },
    { id: 'buy', label: 'Buy' },
    { id: 'sell', label: 'Sell' },
    { id: 'swap', label: 'Swap' },
    { id: 'stake', label: 'Stake' },
    { id: 'unstake', label: 'Unstake' },
    { id: 'card', label: 'Card' },
    { id: 'medbed', label: 'Medbed' },
    { id: 'giftcard', label: 'Giftcard' },
  ];

  const handleRefresh = async () => {
    setLoading(true);
    await fetchTransactions();
    setLoading(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Transaction History</h2>
          <p className="text-sm text-slate-500">All your transactions with date & time</p>
        </div>
        <button onClick={handleRefresh} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm hover:bg-slate-200">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === tab.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search transactions..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((tx) => {
            const amountDisplay = getAmountDisplay(tx);
            return (
              <div key={tx._id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      {getIcon(tx.type)}
                    </div>
                    <div>
                      <p className="font-semibold capitalize text-slate-900">
                        {tx.type === 'topup' ? 'Top Up' : tx.type === 'withdraw' ? 'Withdrawal' : tx.type === 'buy' ? 'Crypto Purchase' : tx.type === 'sell' ? 'Crypto Sale' : tx.type === 'swap' ? 'Token Swap' : tx.type === 'stake' ? 'Stake' : tx.type === 'unstake' ? 'Unstake' : tx.type === 'card' ? 'Card Purchase' : tx.type === 'medbed' ? 'Medbed Session' : tx.type === 'giftcard' ? 'Gift Card Redeem' : tx.type}
                      </p>
                      {tx.details && <p className="text-sm text-slate-500">{tx.details}</p>}
                      {tx.currency && <p className="text-xs text-slate-400">Currency: {tx.currency}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${amountDisplay.color}`}>{amountDisplay.sign} ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(tx.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}