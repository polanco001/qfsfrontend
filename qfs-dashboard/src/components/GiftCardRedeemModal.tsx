import { useState } from 'react';
import { Upload, Camera, AlertCircle, Sparkles, ArrowLeft, ShieldCheck, Lock } from 'lucide-react';

interface GiftCardRedeemModalProps {
  onClose: () => void;
}

/* ─── Real-life card definitions ──────────────────────────────────────────── */
const giftCards = [
  {
    id: 'itunes',
    name: 'Apple iTunes',
    shortName: 'iTunes',
    number: '•••• •••• •••• 4821',
    expiry: '12/26',
    // Real iTunes card: white card, colorful music note swirl on left, Apple logo
    render: (small?: boolean) => {
      const h = small ? 80 : 160;
      const w = small ? 128 : '100%';
      return (
        <div style={{ width: w, height: h, borderRadius: small ? 8 : 16, background: '#fff', position: 'relative', overflow: 'hidden', boxShadow: small ? '0 4px 12px rgba(0,0,0,0.4)' : '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid rgba(0,0,0,0.08)', flexShrink: 0 }}>
          {/* Colorful gradient swirl left half */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '55%', background: 'linear-gradient(160deg,#fa5af2 0%,#fc3c44 25%,#ff7a30 50%,#ffbe00 75%,#32d74b 100%)' }} />
          {/* White right section */}
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '48%', background: '#fff' }} />
          {/* Diagonal cut */}
          <div style={{ position: 'absolute', left: '40%', top: 0, bottom: 0, width: '20%', background: 'linear-gradient(to bottom right,#fa5af2,#ff7a30)', clipPath: 'polygon(0 0,100% 0,0 100%)' }} />
          {/* Music note */}
          <div style={{ position: 'absolute', left: small ? 8 : 16, top: '50%', transform: 'translateY(-50%)', fontSize: small ? 22 : 48, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>🎵</div>
          {/* iTunes text */}
          <div style={{ position: 'absolute', right: small ? 6 : 12, top: small ? 8 : 16 }}>
            <div style={{ fontSize: small ? 7 : 13, fontWeight: 900, color: '#1d1d1f', fontFamily: '-apple-system,sans-serif', letterSpacing: '-0.02em' }}>iTunes</div>
            <div style={{ fontSize: small ? 5 : 9, color: '#555', fontFamily: '-apple-system,sans-serif' }}>Gift Card</div>
          </div>
          {/* Apple logo */}
          <div style={{ position: 'absolute', right: small ? 6 : 12, bottom: small ? 6 : 14, fontSize: small ? 12 : 22 }}>🍎</div>
          {!small && (
            <div style={{ position: 'absolute', left: 16, bottom: 14, fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.12em', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>•••• •••• •••• 4821</div>
          )}
          {/* Shine */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(255,255,255,0.3) 0%,transparent 50%)', pointerEvents: 'none' }} />
        </div>
      );
    },
  },
  {
    id: 'amazon',
    name: 'Amazon',
    shortName: 'Amazon',
    number: '•••• •••• •••• 3391',
    expiry: '11/27',
    render: (small?: boolean) => {
      const h = small ? 80 : 160;
      const w = small ? 128 : '100%';
      return (
        <div style={{ width: w, height: h, borderRadius: small ? 8 : 16, background: 'linear-gradient(135deg,#131921 0%,#232f3e 100%)', position: 'relative', overflow: 'hidden', boxShadow: small ? '0 4px 12px rgba(0,0,0,0.5)' : '0 20px 50px rgba(0,0,0,0.6)', flexShrink: 0 }}>
          {/* Amazon orange wave */}
          <div style={{ position: 'absolute', bottom: -20, left: -20, right: -20, height: '60%', background: 'rgba(255,153,0,0.12)', borderRadius: '60% 60% 0 0', transform: 'rotate(-3deg)' }} />
          {/* Amazon smile arrow */}
          <div style={{ position: 'absolute', left: small ? 8 : 16, top: '50%', transform: 'translateY(-60%)', fontSize: small ? 24 : 52, filter: 'drop-shadow(0 2px 8px rgba(255,153,0,0.5))' }}>📦</div>
          {/* Logo text */}
          <div style={{ position: 'absolute', right: small ? 6 : 14, top: small ? 8 : 16 }}>
            <div style={{ fontSize: small ? 9 : 18, fontWeight: 900, color: '#ff9900', fontFamily: 'Georgia,serif', letterSpacing: '-0.02em' }}>amazon</div>
            <div style={{ width: small ? 28 : 52, height: small ? 2 : 3, background: 'linear-gradient(90deg,#ff9900,#ff6600)', borderRadius: 2, marginTop: 1 }} />
            <div style={{ fontSize: small ? 5 : 9, color: '#aaa', marginTop: 2 }}>Gift Card</div>
          </div>
          {/* Barcode */}
          {!small && (
            <div style={{ position: 'absolute', left: 16, bottom: 14, right: 14 }}>
              <div style={{ height: 16, background: 'repeating-linear-gradient(90deg,rgba(255,255,255,0.8) 0px,rgba(255,255,255,0.8) 2px,transparent 2px,transparent 4px)', borderRadius: 2, marginBottom: 4 }} />
              <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>•••• •••• •••• 3391</div>
            </div>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(255,255,255,0.06) 0%,transparent 60%)', pointerEvents: 'none' }} />
        </div>
      );
    },
  },
  {
    id: 'google',
    name: 'Google Play',
    shortName: 'Play',
    number: '•••• •••• •••• 7702',
    expiry: '09/27',
    render: (small?: boolean) => {
      const h = small ? 80 : 160;
      const w = small ? 128 : '100%';
      return (
        <div style={{ width: w, height: h, borderRadius: small ? 8 : 16, background: '#fff', position: 'relative', overflow: 'hidden', boxShadow: small ? '0 4px 12px rgba(0,0,0,0.3)' : '0 20px 50px rgba(0,0,0,0.4)', border: '1px solid #e8e8e8', flexShrink: 0 }}>
          {/* Colorful diagonal quadrants */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '50%', background: '#4285f4', opacity: 0.12 }} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '50%', background: '#ea4335', opacity: 0.12 }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '50%', height: '50%', background: '#34a853', opacity: 0.12 }} />
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '50%', height: '50%', background: '#fbbc05', opacity: 0.12 }} />
          {/* Play triangle */}
          <div style={{ position: 'absolute', left: small ? 10 : 20, top: '50%', transform: 'translateY(-50%)', fontSize: small ? 26 : 56, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>▶️</div>
          {/* Google Play text */}
          <div style={{ position: 'absolute', right: small ? 6 : 14, top: small ? 8 : 16 }}>
            <div style={{ fontSize: small ? 6 : 10, fontWeight: 700, color: '#555', letterSpacing: '0.05em' }}>GOOGLE</div>
            <div style={{ fontSize: small ? 8 : 16, fontWeight: 900, color: '#1a73e8', letterSpacing: '-0.01em' }}>Play</div>
            <div style={{ fontSize: small ? 5 : 9, color: '#888' }}>Gift Card</div>
          </div>
          {/* G colors bar */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: small ? 4 : 6, display: 'flex' }}>
            {['#4285f4','#ea4335','#fbbc05','#34a853'].map(c => <div key={c} style={{ flex: 1, background: c }} />)}
          </div>
          {!small && (
            <div style={{ position: 'absolute', left: 16, bottom: 18, fontFamily: 'monospace', fontSize: 10, color: '#333', letterSpacing: '0.12em' }}>•••• •••• •••• 7702</div>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(255,255,255,0.5) 0%,transparent 50%)', pointerEvents: 'none' }} />
        </div>
      );
    },
  },
  {
    id: 'steam',
    name: 'Steam',
    shortName: 'Steam',
    number: '•••• •••• •••• 5509',
    expiry: '06/28',
    render: (small?: boolean) => {
      const h = small ? 80 : 160;
      const w = small ? 128 : '100%';
      return (
        <div style={{ width: w, height: h, borderRadius: small ? 8 : 16, background: 'linear-gradient(135deg,#1b2838 0%,#2a475e 50%,#1b2838 100%)', position: 'relative', overflow: 'hidden', boxShadow: small ? '0 4px 12px rgba(0,0,0,0.6)' : '0 20px 50px rgba(0,0,0,0.7)', flexShrink: 0 }}>
          {/* Steam blue glow */}
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle,rgba(102,192,234,0.25),transparent 70%)' }} />
          {/* Steam logo */}
          <div style={{ position: 'absolute', left: small ? 8 : 16, top: '50%', transform: 'translateY(-60%)', fontSize: small ? 24 : 52, filter: 'drop-shadow(0 0 8px rgba(102,192,234,0.6))' }}>🎮</div>
          {/* Steam text */}
          <div style={{ position: 'absolute', right: small ? 6 : 14, top: small ? 8 : 16 }}>
            <div style={{ fontSize: small ? 9 : 18, fontWeight: 900, color: '#66c0ea', fontFamily: 'Arial Black,sans-serif', letterSpacing: '0.05em' }}>STEAM</div>
            <div style={{ fontSize: small ? 5 : 9, color: '#4a90b8' }}>Wallet Gift Card</div>
          </div>
          {/* Circuit lines */}
          <div style={{ position: 'absolute', bottom: small ? 10 : 20, left: small ? 8 : 14, right: small ? 8 : 14 }}>
            <div style={{ height: 1, background: 'rgba(102,192,234,0.2)', marginBottom: small ? 3 : 5 }} />
            {!small && <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(102,192,234,0.6)', letterSpacing: '0.12em' }}>•••• •••• •••• 5509</div>}
          </div>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(102,192,234,0.08) 0%,transparent 60%)', pointerEvents: 'none' }} />
        </div>
      );
    },
  },
  {
    id: 'ebay',
    name: 'eBay',
    shortName: 'eBay',
    number: '•••• •••• •••• 9174',
    expiry: '03/27',
    render: (small?: boolean) => {
      const h = small ? 80 : 160;
      const w = small ? 128 : '100%';
      return (
        <div style={{ width: w, height: h, borderRadius: small ? 8 : 16, background: '#fff', position: 'relative', overflow: 'hidden', boxShadow: small ? '0 4px 12px rgba(0,0,0,0.3)' : '0 20px 50px rgba(0,0,0,0.4)', border: '1px solid #e8e8e8', flexShrink: 0 }}>
          {/* White bg with subtle pattern */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(0,0,0,0.04) 1px,transparent 1px)', backgroundSize: '12px 12px' }} />
          {/* eBay colorful letters */}
          <div style={{ position: 'absolute', left: small ? 6 : 14, top: '50%', transform: 'translateY(-60%)' }}>
            {['e','B','a','y'].map((l, i) => (
              <span key={i} style={{ fontSize: small ? 16 : 36, fontWeight: 900, fontFamily: 'Arial Black,sans-serif', color: ['#e53238','#0064d2','#f5af02','#86b817'][i], lineHeight: 1, marginRight: small ? -1 : -2, display: 'inline-block', transform: i % 2 === 0 ? 'translateY(2px)' : 'translateY(-2px)' }}>{l}</span>
            ))}
          </div>
          {/* Gift */}
          <div style={{ position: 'absolute', right: small ? 8 : 18, top: '50%', transform: 'translateY(-60%)', fontSize: small ? 22 : 46 }}>🛒</div>
          {/* Bottom */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: small ? 5 : 8, display: 'flex' }}>
            {['#e53238','#0064d2','#f5af02','#86b817'].map(c => <div key={c} style={{ flex: 1, background: c }} />)}
          </div>
          {!small && (
            <div style={{ position: 'absolute', left: 14, bottom: 18, fontFamily: 'monospace', fontSize: 10, color: '#555', letterSpacing: '0.12em' }}>•••• •••• •••• 9174</div>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(255,255,255,0.6) 0%,transparent 50%)', pointerEvents: 'none' }} />
        </div>
      );
    },
  },
  {
    id: 'razer',
    name: 'Razer Gold',
    shortName: 'Razer',
    number: '•••• •••• •••• 6623',
    expiry: '08/26',
    render: (small?: boolean) => {
      const h = small ? 80 : 160;
      const w = small ? 128 : '100%';
      return (
        <div style={{ width: w, height: h, borderRadius: small ? 8 : 16, background: 'linear-gradient(135deg,#000 0%,#0d1a00 60%,#000 100%)', position: 'relative', overflow: 'hidden', boxShadow: small ? '0 4px 12px rgba(0,0,0,0.7)' : '0 20px 50px rgba(0,0,0,0.8)', flexShrink: 0 }}>
          {/* Green glow */}
          <div style={{ position: 'absolute', top: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,255,0,0.2),transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,255,0,0.15),transparent 70%)' }} />
          {/* Snake logo */}
          <div style={{ position: 'absolute', left: small ? 8 : 16, top: '50%', transform: 'translateY(-60%)', fontSize: small ? 24 : 52, filter: 'drop-shadow(0 0 8px rgba(0,255,0,0.8))' }}>🐍</div>
          {/* Razer text */}
          <div style={{ position: 'absolute', right: small ? 6 : 14, top: small ? 8 : 14 }}>
            <div style={{ fontSize: small ? 9 : 18, fontWeight: 900, color: '#00ff00', fontFamily: 'Arial Black,sans-serif', letterSpacing: '0.1em', textShadow: '0 0 10px rgba(0,255,0,0.8)' }}>RAZER</div>
            <div style={{ fontSize: small ? 5 : 9, color: 'rgba(0,255,0,0.6)', letterSpacing: '0.06em' }}>GOLD GIFT CARD</div>
          </div>
          {/* Grid pattern */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,255,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,0,0.03) 1px,transparent 1px)', backgroundSize: '16px 16px', pointerEvents: 'none' }} />
          {!small && (
            <div style={{ position: 'absolute', left: 16, bottom: 14, fontFamily: 'monospace', fontSize: 10, color: 'rgba(0,255,0,0.6)', letterSpacing: '0.12em', textShadow: '0 0 6px rgba(0,255,0,0.5)' }}>•••• •••• •••• 6623</div>
          )}
        </div>
      );
    },
  },
];

/* ─── Flip animation CSS ─────────────────────────────────────────────────── */
const CSS = `
@keyframes cardFlipIn {
  0%   { transform: rotateY(90deg) scale(0.85); opacity: 0; }
  60%  { transform: rotateY(-8deg) scale(1.02); opacity: 1; }
  100% { transform: rotateY(0deg) scale(1);    opacity: 1; }
}
@keyframes cardSpin {
  0%   { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
}
@keyframes shimmer {
  0%   { transform: translateX(-150%) skewX(-20deg); }
  100% { transform: translateX(250%)  skewX(-20deg); }
}
.card-flip-in  { animation: cardFlipIn 0.55s cubic-bezier(0.23,1,0.32,1) both; }
.card-spin     { animation: cardSpin  0.7s cubic-bezier(0.4,0,0.2,1) both; }
.card-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.15) 50%, transparent 100%);
  animation: shimmer 2.5s infinite;
  pointer-events: none;
  z-index: 10;
}
`;

/* ─── Main Component (black text version) ───────────────────────────────── */
export function GiftCardRedeemModal({ onClose }: GiftCardRedeemModalProps) {
  const [selectedId, setSelectedId] = useState<string>('');
  const [code, setCode] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [inputMethod, setInputMethod] = useState<'image' | 'code'>('image');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const selectedCard = giftCards.find(c => c.id === selectedId);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setSpinning(true);
    setError('');
    setTimeout(() => setSpinning(false), 750);
  };

  const handleBack = () => {
    setSelectedId('');
    setCode('');
    setImage(null);
    setPreview('');
    setError('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setError('');
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedId) { setError('Please select a gift card type.'); return; }
    if (inputMethod === 'image' && !image) { setError('Please upload a photo of your scratched gift card.'); return; }
    if (inputMethod === 'code' && !code.trim()) { setError('Please enter the gift card code.'); return; }

    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('cardType', selectedId);
    formData.append('inputMethod', inputMethod);
    if (inputMethod === 'code') formData.append('code', code);
    if (inputMethod === 'image' && image) formData.append('image', image);

    try {
      const res = await fetch('https://qfsbackend-1.onrender.com/api/user/giftcard/submit', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        alert('✅ Gift card submitted! Your request is under review.');
        onClose();
      } else {
        setError(data.msg || 'Submission failed. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, width: '100%', color: '#111' }}>

        {/* ── STEP 1: Card Grid ──────────────────────────────────────────── */}
        {!selectedId && (
          <div>
            <p style={{ textAlign: 'center', fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 18 }}>
              Select Gift Card Brand
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {giftCards.map(card => (
                <button
                  key={card.id}
                  onClick={() => handleSelect(card.id)}
                  style={{
                    background: 'none', border: 'none', padding: 0,
                    cursor: 'pointer', borderRadius: 10, overflow: 'hidden',
                    display: 'block', width: '100%',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.96)')}
                  onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {/* Full-width realistic card */}
                  <div style={{ width: '100%', aspectRatio: '1.6/1', position: 'relative' }}>
                    {card.render(true)}
                    {/* Card name overlay - now black on light translucent bg */}
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', padding: '0 6px 6px',
                      background: 'linear-gradient(to top, rgba(255,255,255,0.85), rgba(255,255,255,0.2) 80%)',
                      borderRadius: 8
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#111', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>{card.shortName}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: Selected card + form ──────────────────────────────── */}
        {selectedCard && (
          <div>
            {/* ── Back arrow — big, easy to tap ── */}
            <button
              onClick={handleBack}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#f0f0f0',
                border: '1.5px solid #ccc',
                borderRadius: 14, color: '#111',
                fontSize: 16, fontWeight: 700,
                cursor: 'pointer', padding: '11px 18px',
                marginBottom: 18, width: '100%',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <ArrowLeft size={20} />
              <span>Back to Cards</span>
            </button>

            {/* Full-size card with 360° spin on entry */}
            <div style={{ perspective: 1000, marginBottom: 18 }}>
              <div className={spinning ? 'card-spin' : 'card-flip-in'} style={{ transformStyle: 'preserve-3d', position: 'relative' }}>
                <div className="card-shimmer" style={{ position: 'relative', borderRadius: 16, overflow: 'hidden' }}>
                  {selectedCard.render(false)}
                </div>
              </div>
            </div>

            {/* Card name + security badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <p style={{ fontWeight: 800, fontSize: 20, marginBottom: 3, color: '#111' }}>{selectedCard.name}</p>
                <p style={{ fontSize: 13, color: '#555', fontFamily: 'monospace' }}>{selectedCard.number}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 20, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <ShieldCheck size={14} color="#16a34a" />
                <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 700 }}>Secure</span>
              </div>
            </div>

            {/* Input method toggle — large tap targets */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, background: '#f0f0f0', padding: 5, borderRadius: 16 }}>
              {[
                { id: 'image', label: 'Upload Photo', icon: <Camera size={18} /> },
                { id: 'code',  label: 'Enter Code',   icon: <Sparkles size={18} /> },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => { setInputMethod(m.id as any); setError(''); }}
                  style={{
                    flex: 1, padding: '13px 0', borderRadius: 13, border: 'none',
                    cursor: 'pointer', fontSize: 15, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    transition: 'all 0.2s',
                    background: inputMethod === m.id ? '#2563eb' : 'transparent',
                    color: inputMethod === m.id ? '#fff' : '#444',
                    boxShadow: inputMethod === m.id ? '0 4px 16px rgba(37,99,235,0.45)' : 'none',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>

            {/* Image upload */}
            {inputMethod === 'image' && (
              <div style={{ marginBottom: 18 }}>
                {/* Instruction box — large readable text */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(245,158,11,0.08)', border: '1.5px solid rgba(245,158,11,0.3)', borderRadius: 14, padding: '13px 14px', marginBottom: 14 }}>
                  <AlertCircle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 15, color: '#92400e', lineHeight: 1.6, fontWeight: 500 }}>
                    Scratch the silver panel on your card first, then take a <strong>clear close-up photo</strong> of the code.
                  </p>
                </div>

                <label style={{ display: 'block', cursor: 'pointer' }}>
                  <div style={{
                    borderRadius: 16, border: `2px dashed ${preview ? 'rgba(34,197,94,0.6)' : '#ccc'}`,
                    background: preview ? 'rgba(34,197,94,0.04)' : '#fafafa',
                    overflow: 'hidden', transition: 'all 0.2s', minHeight: 120,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', padding: 16,
                  }}>
                    {preview ? (
                      <>
                        <img src={preview} alt="Card preview" style={{ width: '100%', maxHeight: 170, objectFit: 'cover', borderRadius: 10 }} />
                        <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(34,197,94,0.92)', borderRadius: 20, padding: '5px 13px', fontSize: 13, fontWeight: 800, color: '#fff' }}>✓ Photo ready</div>
                      </>
                    ) : (
                      <>
                        <Upload size={36} color="#555" style={{ marginBottom: 10 }} />
                        <p style={{ fontSize: 17, color: '#111', fontWeight: 700, marginBottom: 4 }}>Tap to upload photo</p>
                        <p style={{ fontSize: 13, color: '#666' }}>JPG, PNG or HEIC</p>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
              </div>
            )}

            {/* Code input */}
            {inputMethod === 'code' && (
              <div style={{ marginBottom: 18 }}>
                {/* Label — large */}
                <label style={{ display: 'block', fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 10 }}>
                  Gift Card Code
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#999" style={{ position: 'absolute', left: 16, top: 18, pointerEvents: 'none' }} />
                  <textarea
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    rows={3}
                    style={{
                      width: '100%', padding: '16px 16px 16px 44px',
                      borderRadius: 16, border: '2px solid #ccc',
                      background: '#fafafa',
                      color: '#111', fontSize: 18, fontFamily: 'monospace',
                      letterSpacing: '0.14em', lineHeight: 1.7,
                      outline: 'none', resize: 'none', boxSizing: 'border-box',
                      caretColor: '#60a5fa', transition: 'border 0.2s',
                    }}
                    onFocus={e => (e.target.style.borderColor = 'rgba(37,99,235,0.5)')}
                    onBlur={e => (e.target.style.borderColor = '#ccc')}
                  />
                </div>
                <p style={{ fontSize: 13, color: '#666', marginTop: 7, lineHeight: 1.5 }}>
                  🔒 Your code is encrypted and secure.
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.3)', borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 15, color: '#b91c1c', lineHeight: 1.5, fontWeight: 500 }}>{error}</p>
              </div>
            )}

            {/* Security note */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: '#f5f5f5', border: '1px solid #e0e0e0', marginBottom: 18 }}>
              <ShieldCheck size={16} color="#666" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>
                256-bit encrypted · Reviewed by admin · Never auto-processed
              </p>
            </div>

            {/* Submit — large, easy tap */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', padding: '17px 0', borderRadius: 18, border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 800, fontSize: 17, color: '#fff',
                background: loading ? '#aaa' : 'linear-gradient(135deg,#16a34a,#15803d)',
                boxShadow: loading ? 'none' : '0 8px 28px rgba(22,163,74,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                transition: 'all 0.25s',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {loading ? (
                <>
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Submitting securely…
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Submit for Review
                </>
              )}
            </button>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}
      </div>
    </>
  );
}
