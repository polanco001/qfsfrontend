import { useApp } from '../context/AppContext';

export function TransactionHistoryPage() {
  const { user } = useApp();
  const transactions = user?.transactions || [];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Transaction History</h2>
      {transactions.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No transactions yet.</div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold capitalize">{tx.type}</p>
                  <p className="text-sm text-slate-500">{tx.details}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.type === 'buy' ? '+' : '-'} ${tx.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-400">{new Date(tx.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}