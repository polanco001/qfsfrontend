import { useState } from 'react';
import { Upload, Camera, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';

interface GiftCardRedeemModalProps {
  onClose: () => void;
}

const giftCards = [
  { id: 'itunes',  name: 'iTunes',       icon: '🎵', color: '#fc3c44', bgGradient: 'linear-gradient(135deg, #fc3c44, #c8002f)' },
  { id: 'ebay',    name: 'eBay',         icon: '🛒', color: '#e53238', bgGradient: 'linear-gradient(135deg, #e53238, #0064d2)' },
  { id: 'razer',   name: 'Razer',        icon: '🎮', color: '#00ff00', bgGradient: 'linear-gradient(135deg, #00ff00, #008800)' },
  { id: 'amazon',  name: 'Amazon',       icon: '📦', color: '#ff9900', bgGradient: 'linear-gradient(135deg, #ff9900, #146eb4)' },
  { id: 'google',  name: 'Google Play',  icon: '▶️',  color: '#4285f4', bgGradient: 'linear-gradient(135deg, #4285f4, #34a853)' },
  { id: 'steam',   name: 'Steam',        icon: '🎯', color: '#171a21', bgGradient: 'linear-gradient(135deg, #171a21, #2a475e)' },
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
      {/* ---- CSS Animations & Realistic Card Styles ---- */}
      <style>{`
        @keyframes threeDSpin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }
        .gift-card-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }
        @media (max-width: 380px) {
          .gift-card-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }
        }

        /* Realistic physical card styles */
        .real-card {
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.15);
          background-size: cover;
          font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
          user-select: none;
        }

        /* Card texture (micro‑dots) */
        .real-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px);
          background-size: 10px 10px;
          pointer-events: none;
          z-index: 2;
        }

        /* Plastic shine overlay */
        .real-card .plastic-shine {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
          animation: shine 4s infinite;
          z-index: 3;
          pointer-events: none;
        }

        .card-logo-area {
          position: relative;
          z-index: 5;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 14px 0;
        }
        .card-logo-icon {
          font-size: 1.4rem;
          filter: drop-shadow(0 2px 3px rgba(0,0,0,0.4));
        }
        .card-logo-text {
          font-weight: 700;
          font-size: 1rem;
          color: white;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }
        .card-number-box {
          position: relative;
          z-index: 5;
          margin: 8px 14px 0;
          background: rgba(255,255,255,0.25);
          backdrop-filter: blur(4px);
          border-radius: 8px;
          padding: 6px 10px;
          font-family: 'SF Mono', 'Menlo', monospace;
          font-size: 0.9rem;
          letter-spacing: 0.12em;
          color: #111;
          font-weight: 500;
          text-align: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        .card-valid-thru {
          position: relative;
          z-index: 5;
          margin: 4px 14px 0;
          font-size: 0.6rem;
          color: rgba(255,255,255,0.9);
          text-align: right;
          text-shadow: 0 1px 2px rgba(0,0,0,0.4);
        }
        .barcode-strip {
          position: relative;
          z-index: 5;
          margin: 6px 10px 10px;
          height: 18px;
          background: repeating-linear-gradient(
            90deg,
            #000 0px, #000 2px,
            #fff 2px, #fff 4px
          );
          border-radius: 4px;
          opacity: 0.8;
          box-shadow: inset 0 0 3px rgba(0,0,0,0.4);
        }

        /* Grid card simplified realism */
        .gift-card-item.real-card {
          aspect-ratio: 1.6/1;
          width: 100%;
          cursor: pointer;
          transition: transform 0.25s, box-shadow 0.25s;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .gift-card-item.real-card:hover {
          transform: scale(1.03);
        }
        .gift-card-item.real-card.selected {
          box-shadow: 0 0 25px rgba(255,255,255,0.3);
        }
        .grid-card-logo {
          position: relative;
          z-index: 5;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 8px 0;
        }
        .grid-card-logo .card-logo-icon {
          font-size: 1.2rem;
        }
        .grid-card-logo .card-logo-text {
          font-size: 0.7rem;
        }
        .grid-card-number {
          position: relative;
          z-index: 5;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(4px);
          margin: 0 8px;
          border-radius: 5px;
          padding: 2px 6px;
          font-size: 0.55rem;
          font-family: monospace;
          color: #111;
          text-align: center;
        }
        .grid-barcode {
          position: relative;
          z-index: 5;
          margin: 4px 8px 6px;
          height: 10px;
          background: repeating-linear-gradient(90deg, #000 0px, #000 1.5px, #fff 1.5px, #fff 3px);
          border-radius: 2px;
          opacity: 0.7;
        }

        /* Selected card detailed realism */
        .selected-card-display {
          display: flex;
          justify-content: center;
          animation: threeDSpin 0.8s ease-out;
        }
        .selected-real-card {
          width: 100%;
          max-width: 300px;
          aspect-ratio: 1.6/1;
          border-radius: 18px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.2);
          margin: 0 auto;
        }
        .selected-real-card .card-logo-area {
          padding: 12px 16px 0;
        }
        .selected-real-card .card-logo-icon {
          font-size: 1.8rem;
        }
        .selected-real-card .card-logo-text {
          font-size: 1.2rem;
        }
        .selected-real-card .card-number-box {
          margin: 12px 16px 0;
          font-size: 1.1rem;
          padding: 8px 14px;
        }
        .selected-real-card .card-valid-thru {
          margin: 6px 16px 0;
          font-size: 0.7rem;
        }
        .selected-real-card .barcode-strip {
          margin: 8px 12px 12px;
          height: 22px;
        }

        .back-arrow-btn {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(6px);
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          z-index: 10;
          transition: background 0.2s;
        }
        .back-arrow-btn:hover {
          background: rgba(255,255,255,0.25);
        }
      `}</style>

      {/* ---- Main container ---- */}
      <div className="space-y-5 p-1 text-white max-h-[75vh] overflow-y-auto relative">
        <p className="text-center text-slate-300 text-sm">
          Choose a gift card brand
        </p>

        {/* ---- Step 1: Realistic card grid ---- */}
        {!selectedType && (
          <div className="gift-card-grid">
            {giftCards.map((card) => (
              <div
                key={card.id}
                className={`real-card gift-card-item ${selectedType === card.id ? 'selected' : ''}`}
                style={{ background: card.bgGradient }}
                onClick={() => setSelectedType(card.id)}
              >
                <div className="plastic-shine" />
                <div className="grid-card-logo">
                  <span className="card-logo-icon">{card.icon}</span>
                  <span className="card-logo-text">{card.name}</span>
                </div>
                <div className="grid-card-number">•••• 1234</div>
                <div className="grid-barcode" />
              </div>
            ))}
          </div>
        )}

        {/* ---- Step 2: Selected card (detailed & spinning) ---- */}
        {selectedCard && (
          <div className="relative">
            <button
              onClick={() => setSelectedType('')}
              className="back-arrow-btn"
              aria-label="Go back to card selection"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="selected-card-display mt-2">
              <div className="real-card selected-real-card" style={{ background: selectedCard.bgGradient }}>
                <div className="plastic-shine" />
                <div className="card-logo-area">
                  <span className="card-logo-icon">{selectedCard.icon}</span>
                  <span className="card-logo-text">{selectedCard.name}</span>
                </div>
                <div className="card-number-box">•••• •••• •••• 1234</div>
                <div className="card-valid-thru">VALID THRU 12/28</div>
                <div className="barcode-strip" />
              </div>
            </div>
          </div>
        )}

        {/* ---- After card selection: input method & form ---- */}
        {selectedCard && (
          <>
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
                <Camera size={16} /> Upload
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
                <Sparkles size={16} /> Manual
              </button>
            </div>

            {inputMethod === 'image' && (
              <div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4 flex items-start gap-2">
                  <AlertCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300">
                    Scratch the card, then take a clear photo of the code.
                  </p>
                </div>
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-blue-500 transition-all bg-slate-800/40 backdrop-blur-sm">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="text-slate-400 mb-2" size={28} />
                    <p className="text-xs text-slate-300 text-center px-2">
                      {image ? image.name : 'Tap to upload scratched card'}
                    </p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            )}

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

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold text-base transition-all active:scale-[0.98] shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
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
