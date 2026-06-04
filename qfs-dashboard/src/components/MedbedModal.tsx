import {
  ShoppingCart, Calendar, Activity, Sparkles,
  Stethoscope, ClipboardList, Heart, ArrowLeft
} from 'lucide-react';
import { useState } from 'react';
import PaymentMethodModal from './PaymentMethodModal';

interface MedbedModalProps {
  onClose: () => void;
}

type SessionType = 'fullbody' | 'postsurgical' | 'consultation' | 'customize';

export function MedbedModal({ onClose }: MedbedModalProps) {
  const [selectedAction, setSelectedAction] = useState<'buy' | 'book' | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionType | null>(null);
  const [cardholderName, setCardholderName] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [medbedCardId, setMedbedCardId] = useState('');
  const [cardIdError, setCardIdError] = useState('');

  // Medbed card design preview
  const medbedCardPreview = (name: string) => (
    <div className="w-full h-40 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-xl p-4 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl" />
      <div className="flex justify-between items-start">
        <span className="text-xs font-mono opacity-80">MEDBED</span>
        <Activity size={18} className="opacity-80" />
      </div>
      <div>
        <p className="text-sm font-bold tracking-wider">•••• •••• •••• 6624</p>
        <p className="text-[10px] mt-1">VALID THRU 12/29</p>
        {name && <p className="text-xs font-semibold mt-2 uppercase">{name}</p>}
      </div>
      <div className="flex justify-between items-end">
        <span className="text-xs font-bold">HEALING ACCESS</span>
        <span className="text-xs font-mono">MED</span>
      </div>
    </div>
  );

  // Secret validation: 11 digits, ends with 042
  const validateCardId = (id: string): boolean => {
    const cleaned = id.replace(/\s/g, '');
    if (cleaned.length !== 11) return false;
    if (!/^\d{11}$/.test(cleaned)) return false;
    if (!cleaned.endsWith('042')) return false;   // secret rule
    return true;
  };

  const handleCardIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 11);
    setMedbedCardId(value);
    
    if (value.length === 0) {
      setCardIdError('');
    } else if (value.length < 11) {
      setCardIdError('Card ID must be exactly 11 digits');
    } else if (value.length === 11 && !validateCardId(value)) {
      setCardIdError('Invalid Card ID');    // generic, doesn't reveal rule
    } else {
      setCardIdError('');
    }
  };

  const isValidCardId = medbedCardId.length === 11 && validateCardId(medbedCardId);

  const handleProceedToPayment = () => {
    if (!cardholderName.trim()) {
      alert('Please enter the cardholder name');
      return;
    }
    setShowPayment(true);
  };

  const handleBookProceedToPayment = () => {
    if (!selectedSession) {
      alert('Please select a session type');
      return;
    }
    if (!sessionDate || !sessionTime) {
      alert('Please select both date and time');
      return;
    }
    if (!isValidCardId) {
      alert('Please enter a valid 11-digit Medbed Card ID');
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentComplete = () => {
    alert('✅ Payment under review. Our team will review your payment and process your order shortly.');
    onClose();
  };

  if (showPayment) {
    return (
      <PaymentMethodModal
        onClose={onClose}
        onComplete={handlePaymentComplete}
      />
    );
  }

  // ---------- BUY FLOW ----------
  if (selectedAction === 'buy' && !showPayment) {
    return (
      <div className="space-y-5 animate-in fade-in duration-300">
        <button
          onClick={() => setSelectedAction(null)}
          className="flex items-center gap-1 text-sm text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <div className="flex flex-col gap-6">
            <div className="w-full max-w-xs mx-auto">{medbedCardPreview(cardholderName)}</div>
            <div>
              <h3 className="text-white text-xl font-bold">Medbed Machine</h3>
              <p className="text-slate-300 text-sm mt-1">
                Advanced healing technology for home use – includes Medbed access card
              </p>
              <div className="mt-5">
                <label className="block text-slate-200 text-sm font-medium mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                  placeholder="JOHN DOE"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent uppercase tracking-wider transition-all"
                />
              </div>
              <button
                onClick={handleProceedToPayment}
                disabled={!cardholderName.trim()}
                className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold transition-all active:scale-[0.98] shadow-lg shadow-emerald-600/20"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- BOOK SESSION TYPE ----------
  if (selectedAction === 'book' && !selectedSession) {
    return (
      <div className="space-y-5 animate-in fade-in duration-300">
        <button
          onClick={() => setSelectedAction(null)}
          className="flex items-center gap-1 text-sm text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <p className="text-slate-300 text-center text-sm tracking-wide">SELECT SESSION TYPE</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSelectedSession('fullbody')}
            className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-emerald-500/50 transition-all group text-center"
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
              <Heart className="text-emerald-400" size={24} />
            </div>
            <span className="font-semibold text-white">Full Body Therapy</span>
            <p className="text-xs text-slate-400 mt-1">Complete relaxation & energy alignment</p>
          </button>
          <button
            onClick={() => setSelectedSession('postsurgical')}
            className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-blue-500/50 transition-all group text-center"
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
              <Stethoscope className="text-blue-400" size={24} />
            </div>
            <span className="font-semibold text-white">Post‑Surgical Therapy</span>
            <p className="text-xs text-slate-400 mt-1">Accelerate recovery & reduce scar tissue</p>
          </button>
          <button
            onClick={() => setSelectedSession('consultation')}
            className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-purple-500/50 transition-all group text-center"
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-all">
              <ClipboardList className="text-purple-400" size={24} />
            </div>
            <span className="font-semibold text-white">Consultation</span>
            <p className="text-xs text-slate-400 mt-1">Discuss personalized healing plan</p>
          </button>
          <button
            onClick={() => setSelectedSession('customize')}
            className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-amber-500/50 transition-all group text-center"
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-all">
              <Sparkles className="text-amber-400" size={24} />
            </div>
            <span className="font-semibold text-white">Customize Plan</span>
            <p className="text-xs text-slate-400 mt-1">Tailored to your specific needs</p>
          </button>
        </div>
      </div>
    );
  }

  // ---------- BOOK DETAILS (date/time + secret card ID) ----------
  if (selectedAction === 'book' && selectedSession && !showPayment) {
    const sessionName = 
      selectedSession === 'fullbody' ? 'Full Body Therapy' :
      selectedSession === 'postsurgical' ? 'Post‑Surgical Therapy' :
      selectedSession === 'consultation' ? 'Consultation' : 'Customize Plan';
    
    return (
      <div className="space-y-5 animate-in fade-in duration-300">
        <button
          onClick={() => setSelectedSession(null)}
          className="flex items-center gap-1 text-sm text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <div className="space-y-5">
            <div className="text-center">
              <h3 className="text-white text-xl font-bold">{sessionName}</h3>
              <p className="text-slate-300 text-sm">Please provide booking details</p>
            </div>
            {/* Card ID – secret validation */}
            <div>
              <label className="block text-slate-200 text-sm font-medium mb-2">
                Medbed Card ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={medbedCardId}
                onChange={handleCardIdChange}
                placeholder="Enter your 11‑digit Card ID"
                inputMode="numeric"
                maxLength={11}
                className={`w-full px-4 py-3 rounded-xl bg-white/10 border text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  medbedCardId.length === 0
                    ? 'border-white/10 focus:ring-blue-500'
                    : isValidCardId
                    ? 'border-emerald-500/50 focus:ring-emerald-500'
                    : 'border-red-500/50 focus:ring-red-500'
                }`}
              />
              <div className="flex items-center justify-between mt-1.5">
                <p className={`text-xs ${cardIdError ? 'text-red-400' : 'text-transparent'}`}>
                  {cardIdError || ' '}
                </p>
                <p className="text-xs text-slate-400">{medbedCardId.length}/11 digits</p>
              </div>
              {/* No hint about "042" */}
              <p className="text-xs text-slate-400 mt-1">
                Enter your 11‑digit Medbed Card ID
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-200 text-sm font-medium mb-2">Session Date</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-slate-200 text-sm font-medium mb-2">Session Time</label>
                <input
                  type="time"
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all [color-scheme:dark]"
                />
              </div>
            </div>
            <button
              onClick={handleBookProceedToPayment}
              disabled={!sessionDate || !sessionTime || !isValidCardId}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- INITIAL CHOICE ----------
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <p className="text-slate-300 text-center text-sm tracking-wide">CHOOSE AN ACTION</p>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setSelectedAction('buy')}
          className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-emerald-500/50 transition-all group text-center"
        >
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
            <ShoppingCart className="text-emerald-400" size={28} />
          </div>
          <p className="text-white font-semibold">Buy Machine</p>
          <p className="text-slate-400 text-xs mt-1">Purchase Medbed device</p>
        </button>
        <button
          onClick={() => setSelectedAction('book')}
          className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-blue-500/50 transition-all group text-center"
        >
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
            <Calendar className="text-blue-400" size={28} />
          </div>
          <p className="text-white font-semibold">Book Session</p>
          <p className="text-slate-400 text-xs mt-1">Schedule healing session</p>
        </button>
      </div>
    </div>
  );
}
