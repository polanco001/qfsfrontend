import { useState } from 'react';
import { Upload, Camera, AlertCircle, Sparkles } from 'lucide-react';

interface GiftCardRedeemModalProps {
  onClose: () => void;
}

const giftCardTypes = [
  { id: 'itunes', name: 'iTunes', icon: '🎵', color: '#fc3c44' },
  { id: 'ebay', name: 'eBay', icon: '🛒', color: '#e53238' },
  { id: 'razer', name: 'Razer', icon: '🎮', color: '#00ff00' },
  { id: 'amazon', name: 'Amazon', icon: '📦', color: '#ff9900' },
  { id: 'google', name: 'Google Play', icon: '▶️', color: '#4285f4' },
  { id: 'steam', name: 'Steam', icon: '🎯', color: '#171a21' },
];

export function GiftCardRedeemModal({ onClose }: GiftCardRedeemModalProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [code, setCode] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [inputMethod, setInputMethod] = useState<'image' | 'code'>('image');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedCard = giftCardTypes.find(c => c.id === selectedType);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!selectedType) {
      setError('Please select a gift card type');
      return;
    }
    if (inputMethod === 'image' && !image) {
      setError('Please upload an image of the scratched gift card');
      return;
    }
    if (inputMethod === 'code' && !code.trim()) {
      setError('Please enter the gift card code');
      return;
    }

    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('cardType', selectedType);
    formData.append('inputMethod', inputMethod);
    if (inputMethod === 'code') formData.append('code', code);
    if (inputMethod === 'image' && image) formData.append('image', image);

    try {
      const response = await fetch('https://qfsbackend-1.onrender.com/api/user/giftcard/submit', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Gift card redemption submitted! Your request is under review inside the Admin Panel.');
        onClose();
      } else {
        setError(data.msg || 'Submission failed.');
      }
    } catch (err) {
      setError('Server network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ---- CSS animations injected here ---- */}
      <style>{`
        @keyframes card-float {
          0% { transform: translateY(0px) rotateX(2deg) rotateY(2deg); }
          50% { transform: translateY(-6px) rotateX(0deg) rotateY(0deg); }
          100% { transform: translateY(0px) rotateX(2deg) rotateY(2deg); }
        }
        @keyframes shine-fast {
          0% { left: -100%; }
          100% { left: 200%; }
        }
        .animate-card-float {
          animation: card-float 4s ease-in-out infinite;
        }
        .animate-shine-fast {
          position: absolute;
          top: 0;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transform: skewX(-20deg);
          animation: shine-fast 2s infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>

      <div className="space-y-6 p-1">
        {/* ---- Animated Card Preview ---- */}
        <div className="flex justify-center">
          <div className="relative w-72 h-44 perspective-1000">
            <div
              className={`w-full h-full rounded-2xl transition-all duration-500 transform-gpu ${
                selectedType ? 'animate-card-float shadow-2xl' : 'bg-slate-800/40 border border-slate-700/50'
              }`}
              style={{
                background: selectedCard
                  ? `linear-gradient(135deg, ${selectedCard.color}40, ${selectedCard.color}10)`
                  : 'rgba(30,41,59,0.5)',
                boxShadow: selectedCard ? `0 0 40px ${selectedCard.color}20` : 'none',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div className="animate-shine-fast" />
              </div>

              {selectedCard ? (
                <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center">
                  <span className="text-5xl mb-2 drop-shadow-lg">{selectedCard.icon}</span>
                  <p className="text-white font-bold text-xl tracking-wider">{selectedCard.name}</p>
                  <p className="text-slate-300 text-xs mt-1">Gift Card</p>
                  <div className="mt-3 bg-white/10 rounded-lg px-4 py-1.5 text-slate-200 font-mono text-sm tracking-widest animate-pulse">
                    •••• •••• •••• ••••
                  </div>
                </div>
              ) : (
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-3">
                    <Sparkles size={28} className="opacity-50" />
                  </div>
                  <p className="text-sm">Select a card to preview</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---- Description ---- */}
        <p className="text-slate-300 text-sm text-center">
          Redeem your gift card for QFS credits. Choose a type and provide the card details.
        </p>

        {/* ---- Gift card type selection ---- */}
        <div>
          <label className="block text-slate-200 text-sm font-medium mb-3">
            Gift Card Type <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {giftCardTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  selectedType === type.id
                    ? 'border-white/30 bg-white/10 backdrop-blur-md shadow-lg'
                    : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-500'
                }`}
                style={{
                  boxShadow: selectedType === type.id ? `0 0 20px ${type.color}30` : undefined,
                }}
              >
                <span className="text-3xl block mb-1">{type.icon}</span>
                <p className="text-white font-semibold text-xs">{type.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ---- Input method toggle ---- */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setInputMethod('image')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              inputMethod === 'image'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
            }`}
          >
            <Camera size={16} /> Upload Image
          </button>
          <button
            type="button"
            onClick={() => setInputMethod('code')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              inputMethod === 'code'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
            }`}
          >
            <Sparkles size={16} /> Manual Code
          </button>
        </div>

        {/* ---- Image upload area ---- */}
        {inputMethod === 'image' && (
          <div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4 flex items-start gap-2">
              <AlertCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">
                Make sure the card is scratched and the entire code is clearly visible before taking a picture.
              </p>
            </div>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-blue-500 transition-all bg-slate-800/40 backdrop-blur-sm">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="text-slate-400 mb-2" size={32} />
                <p className="text-sm text-slate-300">
                  {image ? image.name : 'Click to upload scratched card image'}
                </p>
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        )}

        {/* ---- Manual code entry ---- */}
        {inputMethod === 'code' && (
          <div>
            <label className="block text-slate-200 text-sm font-medium mb-2">
              Gift Card Code
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>
        )}

        {/* ---- Error message ---- */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* ---- Submit button ---- */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold text-lg transition-all active:scale-[0.98] shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Submitting...
            </>
          ) : (
            'Submit for Review'
          )}
        </button>
      </div>
    </>
  );
}
