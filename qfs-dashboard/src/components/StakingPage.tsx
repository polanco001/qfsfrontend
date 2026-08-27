import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Loader2, RefreshCw, Lock, Unlock, TrendingUp } from 'lucide-react';

interface Stake {
  _id: string;
  asset: string;
  amount: number;
  startDate: string;
  apy: number;
  stakingPeriod: string;
  status: string;
}

const PERIODS = [
  { value: '30', label: '30 days', apy: 5 },
  { value: '90', label: '90 days', apy: 7 },
  { value: '180', label: '180 days', apy: 10 },
  { value: '365', label: '365 days', apy: 15 },
];

export function StakingPage() {
  const { assets, livePrices, fetchAssets, fetchLivePrices } = useApp();
  const [stakes, setStakes] = useState<Stake[]>([]);
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [staking, setStaking] = useState(false);
  const [unstakingId, setUnstakingId] = useState<string | null>(null);

  const assetKeys = Object.keys(assets).filter(key => assets[key] > 0);

  const fetchStakes = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/user/staking`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStakes(data);
      }
    } catch (err) {
      console.error('Failed to fetch stakes:', err);
    }
  };

  useEffect(() => {
    fetchAssets();
    fetchLivePrices();
    fetchStakes();
  }, []);

  const handleStake = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (!selectedAsset || (assets[selectedAsset] || 0) < parseFloat(amount)) {
      setError('Insufficient balance');
      return;
    }

    setStaking(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/user/stake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ asset: selectedAsset, amount: parseFloat(amount), stakingPeriod: selectedPeriod })
      });
      const data = await res.json();
      if (data.success) {
        alert('Staked successfully!');
        setAmount('');
        fetchAssets();
        fetchStakes();
      } else {
        setError(data.error || 'Staking failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setStaking(false);
    }
  };

  const handleUnstake = async (stakeId: string) => {
    if (!confirm('Are you sure you want to unstake? You will receive your asset plus any earned interest.')) return;
    setUnstakingId(stakeId);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/user/unstake/${stakeId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('Unstaked successfully!');
        fetchAssets();
        fetchStakes();
      } else {
        alert(data.error || 'Unstaking failed');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setUnstakingId(null);
    }
  };

  const selectedPeriodInfo = PERIODS.find(p => p.value === selectedPeriod);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Staking & Earnings</h2>
          <p className="text-sm text-slate-500">Earn passive income by staking your crypto assets</p>
        </div>
        <button onClick={fetchStakes} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm hover:bg-slate-200">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staking Form */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Stake Asset</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Asset</label>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              >
                {assetKeys.length === 0 ? (
                  <option>No assets available</option>
                ) : (
                  assetKeys.map(key => <option key={key}>{key}</option>)
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Available: ${(assets[selectedAsset] || 0).toFixed(6)} ${selectedAsset}`}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Staking Period</label>
              <div className="grid grid-cols-2 gap-2">
                {PERIODS.map(period => (
                  <button
                    key={period.value}
                    onClick={() => setSelectedPeriod(period.value)}
                    className={`p-3 rounded-lg border-2 transition ${
                      selectedPeriod === period.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="block text-sm font-semibold text-slate-900 dark:text-white">{period.label}</span>
                    <span className="text-xs text-green-500">{period.apy}% APY</span>
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={handleStake}
              disabled={staking || !amount || parseFloat(amount) <= 0 || assetKeys.length === 0}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-slate-400 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              {staking ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
              {staking ? 'Staking...' : 'Stake Now'}
            </button>
          </div>
        </div>

        {/* Active Stakes */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Active Stakes</h3>
          
          {stakes.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-8">No active stakes. Start staking to earn rewards.</p>
          ) : (
            <div className="space-y-3">
              {stakes.map(stake => (
                <div key={stake._id} className="rounded-lg bg-slate-50 dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{stake.amount.toFixed(6)} {stake.asset}</p>
                      <p className="text-xs text-slate-500">
                        {stake.stakingPeriod} days · {stake.apy}% APY
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Started: {new Date(stake.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleUnstake(stake._id)}
                      disabled={unstakingId === stake._id}
                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      {unstakingId === stake._id ? <Loader2 size={14} className="animate-spin" /> : 'Unstake'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <TrendingUp size={16} className="inline mr-1" />
              Rewards are calculated daily and added to your stake. You can unstake anytime to receive your assets plus any accrued interest.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}