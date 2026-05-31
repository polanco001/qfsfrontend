// src/components/MedbedModal.tsx
import { ShoppingCart, Calendar, Activity, Sparkles, Stethoscope, ClipboardList, Heart, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { PaymentMethodModal } from './PaymentMethodModal';

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

  // Medbed card design preview (for Buy)
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
    if (!medbedCardId.trim()) {
      alert('Please enter your Medbed Card ID');
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentComplete = (isBooking = false) => {
    if (isBooking) {
      alert('✅ Payment under review. Our team will review your payment and confirm your booking within 24 hours.');
    } else {
      alert('✅ Payment under review. Our team will review your payment and process your order shortly.');
    }
    onClose();
  };

  // If payment modal is shown
  if (showPayment) {
    const isBooking = selectedAction === 'book';
    return (
      <PaymentMethodModal
        onClose={onClose}
        onComplete={() => handlePaymentComplete(isBooking)}
      />
    );
  }

  // ========== BUY FLOW (card design + name) ==========
  if (selectedAction === 'buy' && !showPayment) {
    return (
      <div className="space-y-5">
        <button
          onClick={() => setSelectedAction(null)}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="bg-gradient-to-r from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-64">{medbedCardPreview(cardholderName)}</div>
            <div className="flex-1">
              <h3 className="text-slate-900 dark:text-white text-xl font-bold">Medbed Machine</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Advanced healing technology for home use – includes Medbed access card
              </p>
              <div className="mt-4">
                <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                  placeholder="JOHN DOE"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                />
              </div>
              <button
                onClick={handleProceedToPayment}
                disabled={!cardholderName.trim()}
                className="mt-5 w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold transition-colors"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== BOOK FLOW (session type + date/time + card ID) ==========
  if (selectedAction === 'book' && !selectedSession) {
    return (
      <div className="space-y-5">
        <button
          onClick={() => setSelectedAction(null)}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <p className="text-slate-600 dark:text-slate-400 text-center">Select session type</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSelectedSession('fullbody')}
            className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 text-center bg-white dark:bg-slate-900"
          >
            <Heart className="mx-auto mb-2 text-emerald-500" size={28} />
            <span className="font-semibold text-slate-900 dark:text-white">Full Body Therapy</span>
            <p className="text-xs text-slate-500 mt-1">Complete relaxation & energy alignment</p>
          </button>
          <button
            onClick={() => setSelectedSession('postsurgical')}
            className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-center bg-white dark:bg-slate-900"
          >
            <Stethoscope className="mx-auto mb-2 text-blue-500" size={28} />
            <span className="font-semibold text-slate-900 dark:text-white">Post‑Surgical Therapy</span>
            <p className="text-xs text-slate-500 mt-1">Accelerate recovery & reduce scar tissue</p>
          </button>
          <button
            onClick={() => setSelectedSession('consultation')}
            className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 text-center bg-white dark:bg-slate-900"
          >
            <ClipboardList className="mx-auto mb-2 text-purple-500" size={28} />
            <span className="font-semibold text-slate-900 dark:text-white">Consultation</span>
            <p className="text-xs text-slate-500 mt-1">Discuss personalized healing plan</p>
          </button>
          <button
            onClick={() => setSelectedSession('customize')}
            className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 text-center bg-white dark:bg-slate-900"
          >
            <Sparkles className="mx-auto mb-2 text-amber-500" size={28} />
            <span className="font-semibold text-slate-900 dark:text-white">Customize Plan</span>
            <p className="text-xs text-slate-500 mt-1">Tailored to your specific needs</p>
          </button>
        </div>
      </div>
    );
  }

  if (selectedAction === 'book' && selectedSession && !showPayment) {
    // Session type selected – now show date, time, card ID
    const sessionName = 
      selectedSession === 'fullbody' ? 'Full Body Therapy' :
      selectedSession === 'postsurgical' ? 'Post‑Surgical Therapy' :
      selectedSession === 'consultation' ? 'Consultation' : 'Customize Plan';
    
    return (
      <div className="space-y-5">
        <button
          onClick={() => setSelectedSession(null)}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="bg-gradient-to-r from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-slate-900 dark:text-white text-xl font-bold">{sessionName}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Please provide booking details</p>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">
                Medbed Card ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={medbedCardId}
                onChange={(e) => setMedbedCardId(e.target.value)}
                placeholder="Enter your Medbed Card ID"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Session Date</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Session Time</label>
                <input
                  type="time"
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleBookProceedToPayment}
              disabled={!sessionDate || !sessionTime || !medbedCardId.trim()}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold transition-colors"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Initial choice: Buy or Book
  return (
    <div className="space-y-4">
      <p className="text-slate-600 dark:text-slate-400">Choose an action</p>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setSelectedAction('buy')}
          className="p-4 rounded-lg border-2 transition-all border-slate-200 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-500"
        >
          <ShoppingCart className="mx-auto mb-2 text-green-500" size={32} />
          <p className="text-slate-900 dark:text-white font-semibold text-sm">Buy Medbed Machine</p>
        </button>
        <button
          onClick={() => setSelectedAction('book')}
          className="p-4 rounded-lg border-2 transition-all border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500"
        >
          <Calendar className="mx-auto mb-2 text-blue-500" size={32} />
          <p className="text-slate-900 dark:text-white font-semibold text-sm">Book Session</p>
        </button>
      </div>
    </div>
  );
}