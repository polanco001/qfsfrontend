import { useState } from 'react';
import { Upload, Camera, AlertCircle, Sparkles } from 'lucide-react';

interface GiftCardRedeemModalProps {
  onClose: () => void;
}

const giftCards = [
  { id: 'itunes',    name: 'iTunes',        icon: '🎵', color: '#fc3c44', bgGradient: 'linear-gradient(135deg, #fc3c44, #c8002f)' },
  { id: 'ebay',      name: 'eBay',          icon: '🛒', color: '#e53238', bgGradient: 'linear-gradient(135deg, #e53238, #0064d2)' },
  { id: 'razer',     name: 'Razer',         icon: '🎮', color: '#00ff00', bgGradient: 'linear-gradient(135deg, #00ff00, #008800)' },
  { id: 'amazon',    name: 'Amazon',        icon: '📦', color: '#ff9900', bgGradient: 'linear-gradient(135deg, #ff9900, #146eb4)' },
  { id: 'google',    name: 'Google Play',   icon: '▶️', color: '#4285f4', bgGradient: 'linear-gradient(135deg, #4285f4, #34a853)' },
  { id: 'steam',     name: 'Steam',         icon: '🎯', color: '#171a21', bgGradient: 'linear-gradient(135deg, #171a21, #2a475e)' },
];

export function GiftCardRedeemModal({ onClose }: GiftCardRedeemModalProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [code, setCode] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [inputMethod, setInputMethod] = useState<'image' | 'code'>('image');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedCard = giftCards.find(c => c.id === selectedType);

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
      {/* ---- CSS Animations ---- */}
      <style>{`
        @keyframes threeDSpin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        .gift-card-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .gift-card-item {
          aspect-ratio: 1.6 / 1;
          border-radius: 16px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          border: 2px solid rgba(255,255,255,0.1);
        }
        .gift-card-item:hover {
          transform: scale(1.03);
          border-color: rgba(255,255,255,0.3);
        }
        .gift-card-item.selected {
          border-color: white;
          box-shadow: 0 0 30px rgba(255,255,255,0.2);
        }
        .card-icon {
          font-size: 2.5rem;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
        }
        .card-brand {
          font-weight: 700;
          font-size: 1rem;
          color: white;
          text-shadow: 0 1px 3px rgba(0,0,0,0.5);
          margin-top: 4px;
        }
        .card-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.9);
          margin-top: 2px;
        }
        .selected-card-display {
          display: flex;
          justify-content: center;
          animation: threeDSpin 0.8s ease-out;
        }
        .selected-card-inner {
          width: 280px;
          aspect-ratio: 1.6 / 1;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 15px 35px rgba(0,0,0,0.5);
          position: relative;
          overflow: hidden;
          border: 2px solid rgba(255,255,255,0.2);
        }
        .shine-overlay {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%);
          animation: shine 3s infinite;
        }
        @keyframes shine {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }
        .selected-card-inner .card-icon {
          font-size: 3.5rem;
          margin-bottom: 6px;
        }
        .selected-card-inner .card-brand {
          font-size: 1.5rem;
        }
        .selected-card-inner .card-label {
          font-size: 0.75rem;
        }
        .fake-code {
          background: rgba(0,0,0,0.3);
          padding: 4px 12px;
          border-radius: 8px;
          font-family: monospace;
          color: rgba(255,255,255,0.9);
          letter-spacing: 0.2em;
          margin-top: 10px;
        }
        .back-button {
          margin-top: 12px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: 0.2s;
        }
        .back-button:hover {
          background: rgba(255,255,255,0.1);
        }
      `}</style>

      <div className="space-y-6 p-1 text-white">
        {/* Heading */}
        <p className="text-center text-slate-300 text-sm">
          Choose a gift card brand
        </p>

        {/* ---- Step 1: Card selection grid (hidden when a card is selected) ---- */}
        {!selectedType && (
          <div className="gift-card-grid">
            {giftCards.map((card) => (
              <div
                key={card.id}
                className="gift-card-item"
                style={{ background: card.bgGradient }}
                onClick={() => setSelectedType(card.id)}
              >
                <span className="card-icon">{card.icon}</span>
                <span className="card-brand">{card.name}</span>
                <span className="card-label">GIFT CARD</span>
              </div>
            ))}
          </div>
        )}

        {/* ---- Step 2: Selected card display with 3D spin ---- */}
        {selectedCard && (
          <div className="selected-card-display">
            <div className="selected-card-inner" style={{ background: selectedCard.bgGradient }}>
              <div className="shine-overlay" />
              <span className="card-icon">{selectedCard.icon}</span>
              <span className="card-brand">{selectedCard.name}</span>
              <span className="card-label">GIFT CARD</span>
              <div className="fake-code">•••• •••• •••• ••••</div>
            </div>
          </div>
        )}

        {/* ---- After card selection: input method & form ---- */}
        {selectedCard && (
          <>
            {/* Change card button */}
            <button
              onClick={() => setSelectedType('')}
              className="back-button mx-auto block"
            >
              ← Choose different card
            </button>

            {/* Input method toggle */}
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

            {/* Image upload area */}
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

            {/* Manual code entry */}
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

            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit button */}
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
          </>
        )}
      </div>
    </>
  );
}
