import { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function SellCryptoModal({ onClose }: { onClose: () => void }) {
  const { user, assets, sellAsset } = useApp();
  const [asset, setAsset] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const assetKeys = Object.keys(assets).filter(key => assets[key] > 0);

  const handleSell = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    setError('');
    const success = await sellAsset(asset, parseFloat(amount));
    setLoading(false);
    if (success) {
      alert('Sold successfully!');
      onClose();
    } else {
      setError('Failed to sell. Try again.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Sell Crypto</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><X size={18} /></button>
      </div>

      {assetKeys.length === 0 ? (
        <p className="text-slate-500">You have no crypto to sell.</p>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Asset</label>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            >
              {assetKeys.map(key => <option key={key}>{key}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Amount to Sell</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Available: ${assets[asset]}`}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleSell}
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white rounded-lg font-semibold"
          >
            {loading ? 'Selling...' : 'Sell'}
          </button>
        </>
      )}
    </div>
  );
}