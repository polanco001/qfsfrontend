import { useState } from 'react';
import { Wallet, Lock, Loader2 } from 'lucide-react';

interface ConnectWalletModalProps {
  onClose: () => void;
}

export function ConnectWalletModal({ onClose }: ConnectWalletModalProps) {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [phraseInput, setPhraseInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const wallets = [
    { id: 'metamask', name: 'MetaMask', icon: '🦊', description: 'Popular Ethereum wallet' },
    { id: 'trustwallet', name: 'Trust Wallet', icon: '🛡️', description: 'Multi-chain mobile wallet' },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: '💼', description: 'Secure crypto wallet' },
    { id: 'phantom', name: 'Phantom', icon: '👻', description: 'Solana wallet' },
    { id: 'ledger', name: 'Ledger', icon: '🔐', description: 'Hardware wallet' },
    { id: 'exodus', name: 'Exodus', icon: '🚀', description: 'Multi-currency wallet' },
  ];

  const validatePhrase = (phrase: string) => {
    const words = phrase.trim().split(/\s+/);
    return words.length === 12 || words.length === 24;
  };

  const handleConnect = async () => {
    setError('');
    if (!phraseInput.trim()) {
      setError('Please enter your recovery phrase');
      return;
    }
    if (!validatePhrase(phraseInput)) {
      setError('Invalid recovery phrase. Please enter exactly 12 or 24 words.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to connect a wallet.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/user/wallet/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          walletName: selectedWallet,
          phrase: phraseInput.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert('✅ Wallet connected successfully!');
        onClose();
      } else {
        setError(data.error || 'Failed to connect wallet.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!selectedWallet ? (
        <>
          <p className="text-slate-600 dark:text-slate-400">Select your blockchain wallet provider</p>
          <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {wallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => setSelectedWallet(wallet.name)}
                className="p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all bg-white dark:bg-slate-900 text-left"
              >
                <div className="text-3xl mb-2">{wallet.icon}</div>
                <p className="text-slate-900 dark:text-white font-semibold">{wallet.name}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{wallet.description}</p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <Wallet className="text-blue-500" size={32} />
              <div>
                <p className="text-slate-900 dark:text-white font-semibold">{selectedWallet}</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Enter your recovery phrase</p>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">
              <Lock className="inline mr-1" size={14} />
              Recovery Phrase (12 or 24 words)
            </label>
            <textarea
              value={phraseInput}
              onChange={(e) => { setPhraseInput(e.target.value); setError(''); }}
              placeholder="Enter your 12 or 24 word recovery phrase separated by spaces..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {phraseInput && (
              <p className={`text-xs mt-1 ${validatePhrase(phraseInput) ? 'text-green-500' : 'text-slate-500 dark:text-slate-400'}`}>
                {phraseInput.trim().split(/\s+/).length} words entered
                {validatePhrase(phraseInput) && ' ✓'}
              </p>
            )}
            {error && <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
              <span>⚠️</span> {error}
            </p>}
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
            <p className="text-yellow-800 dark:text-yellow-200 text-xs">
              <strong>Security Notice:</strong> Never share your recovery phrase with anyone. This demo uses mock authentication.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setSelectedWallet(null); setPhraseInput(''); setError(''); }}
              className="flex-1 py-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleConnect}
              disabled={!phraseInput.trim() || loading}
              className="flex-1 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}