import { CreditCard, ArrowLeft, Crown, Zap, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { PaymentMethodModal } from './PaymentMethodModal';

interface CardTopupModalProps {
  onClose: () => void;
}

interface CardProduct {
  id: string;
  name: string;
  description: string;
  gradient: string;
  icon: React.ReactNode;
  cardPreview: (holderName: string) => React.ReactNode;
}

export function CardTopupModal({ onClose }: CardTopupModalProps) {
  const [selectedCardType, setSelectedCardType] = useState<'qfs' | 'medbed' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<CardProduct | null>(null);
  const [cardholderName, setCardholderName] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  // ─── Card previews (unchanged, but rendered inside glass cards) ───
  const qfsSilverPreview = (name: string) => (
    <div className="w-full h-40 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl p-4 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl" />
      <div className="flex justify-between items-start">
        <span className="text-xs font-mono opacity-80">QFS SILVER</span>
        <Sparkles size={18} className="opacity-80" />
      </div>
      <div>
        <p className="text-sm font-bold tracking-wider">•••• •••• •••• 4582</p>
        <p className="text-[10px] mt-1">VALID THRU 12/28</p>
        {name && <p className="text-xs font-semibold mt-2 uppercase">{name}</p>}
      </div>
      <div className="flex justify-between items-end">
        <span className="text-xs font-bold">SILVER MEMBER</span>
        <span className="text-xs font-mono">VISA</span>
      </div>
    </div>
  );

  const qfsGoldPreview = (name: string) => (
    <div className="w-full h-40 bg-gradient-to-br from-amber-500 to-yellow-700 rounded-xl p-4 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl" />
      <div className="flex justify-between items-start">
        <span className="text-xs font-mono opacity-80">QFS GOLD</span>
        <Crown size={18} className="opacity-80" />
      </div>
      <div>
        <p className="text-sm font-bold tracking-wider">•••• •••• •••• 8793</p>
        <p className="text-[10px] mt-1">VALID THRU 12/30</p>
        {name && <p className="text-xs font-semibold mt-2 uppercase">{name}</p>}
      </div>
      <div className="flex justify-between items-end">
        <span className="text-xs font-bold">GOLD MEMBER</span>
        <span className="text-xs font-mono">GOLD</span>
      </div>
    </div>
  );

  const trumpGoldPreview = (name: string) => (
    <div className="w-full h-40 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 rounded-xl p-4 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
      <div className="flex justify-between items-start relative z-10">
        <span className="text-[10px] font-bold tracking-wider">UNITED STATES OF AMERICA</span>
        <Zap size={18} className="opacity-80" />
      </div>
      <div className="relative z-10 text-center">
        <p className="text-2xl font-black tracking-widest">TRUMP</p>
        <p className="text-xs font-bold tracking-[0.3em] mt-1">GOLDCARD</p>
        {name && <p className="text-[10px] font-semibold uppercase mt-1 opacity-90">{name}</p>}
      </div>
      <div className="flex justify-end relative z-10">
        <span className="text-[10px] font-mono">EXCLUSIVE</span>
      </div>
    </div>
  );

  const cardProducts: CardProduct[] = [
    {
      id: 'qfs_silver',
      name: 'QFS Silver Card',
      description: 'Entry‑level QFS card with essential benefits',
      gradient: 'from-gray-500 to-gray-700',
      icon: <Sparkles size={24} />,
      cardPreview: qfsSilverPreview,
    },
    {
      id: 'qfs_gold',
      name: 'QFS Gold Card',
      description: 'Premium gold card with priority support and lower fees',
      gradient: 'from-amber-500 to-yellow-600',
      icon: <Crown size={24} />,
      cardPreview: qfsGoldPreview,
    },
    {
      id: 'trump_gold',
      name: 'Trump Gold Card',
      description: 'Limited edition Trump‑branded gold card – exclusive access',
      gradient: 'from-yellow-400 to-orange-500',
      icon: <Zap size={24} />,
      cardPreview: trumpGoldPreview,
    },
  ];

  const handlePurchase = () => {
    if (!cardholderName.trim()) {
      alert('Please enter the cardholder name');
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentComplete = () => {
    alert(`${selectedProduct?.name} purchase submitted successfully for ${cardholderName}!`);
    onClose();
  };

  const handleBack = () => {
    if (selectedProduct) {
      setSelectedProduct(null);
      setCardholderName('');
    } else if (selectedCardType) {
      setSelectedCardType(null);
    }
  };

  if (showPayment && selectedProduct) {
    return <PaymentMethodModal onClose={onClose} onComplete={handlePaymentComplete} />;
  }

  // ── Step 2: QFS card product selection (gallery) ──
  if (selectedCardType === 'qfs' && !selectedProduct) {
    return (
      <div className="space-y-5 animate-in fade-in duration-300">
        <button onClick={handleBack} className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <p className="text-slate-300 text-center text-sm tracking-wide">CHOOSE YOUR QFS CARD</p>
        <div className="grid grid-cols-1 gap-4">
          {cardProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all p-5 group"
            >
              <div className="flex gap-4">
                <div className="w-32 flex-shrink-0">{product.cardPreview('')}</div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors">{product.name}</h3>
                  <p className="text-slate-400 text-xs mt-1">{product.description}</p>
                </div>
                <CreditCard className="text-slate-500 group-hover:text-white transition-colors" size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Step 3: Selected product details + cardholder name ──
  if (selectedProduct && !showPayment) {
    return (
      <div className="space-y-5 animate-in fade-in duration-300">
        <button onClick={handleBack} className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <div className="flex flex-col gap-6">
            <div className="w-full max-w-xs mx-auto">{selectedProduct.cardPreview(cardholderName)}</div>
            <div>
              <h3 className="text-white text-xl font-bold">{selectedProduct.name}</h3>
              <p className="text-slate-400 text-sm mt-1">{selectedProduct.description}</p>
              <div className="mt-5">
                <label className="block text-slate-300 text-sm font-medium mb-1">Cardholder Name</label>
                <input
                  type="text"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                  placeholder="JOHN DOE"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase tracking-wider transition-all"
                />
              </div>
              <button
                onClick={handlePurchase}
                disabled={!cardholderName.trim()}
                className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20"
              >
                Purchase Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 1: Card type selection (QFS or Medbed) ──
  if (!selectedCardType) {
    return (
      <div className="space-y-5 animate-in fade-in duration-300">
        <p className="text-slate-300 text-center text-sm tracking-wide">SELECT A CARD</p>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedCardType('qfs')}
            className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-blue-500/50 transition-all group text-center"
          >
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
              <CreditCard className="text-blue-400" size={28} />
            </div>
            <p className="text-white font-semibold">QFS Card</p>
            <p className="text-slate-400 text-xs mt-1">Silver / Gold / Trump</p>
          </button>
          <button
            onClick={() => setSelectedCardType('medbed')}
            className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-purple-500/50 transition-all group text-center"
          >
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-all">
              <CreditCard className="text-purple-400" size={28} />
            </div>
            <p className="text-white font-semibold">Medbed Card</p>
            <p className="text-slate-400 text-xs mt-1">Healing session credits</p>
          </button>
        </div>
      </div>
    );
  }

  // ── Step 4: Medbed card ──
  if (selectedCardType === 'medbed' && !showPayment) {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <button onClick={handleBack} className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="bg-purple-500/5 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
            <CreditCard className="text-purple-400" size={32} />
          </div>
          <h3 className="text-white font-bold text-lg">Medbed Card</h3>
          <p className="text-slate-400 text-sm mt-1">Access Medbed healing sessions worldwide</p>
          <div className="mt-5 text-left">
            <label className="block text-slate-300 text-sm font-medium mb-1">Cardholder Name</label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
              placeholder="JOHN DOE"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase tracking-wider transition-all"
            />
          </div>
          <button
            onClick={handlePurchase}
            disabled={!cardholderName.trim()}
            className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold transition-all active:scale-[0.98] shadow-lg shadow-purple-600/20"
          >
            Purchase Now
          </button>
        </div>
      </div>
    );
  }

  return null;
}
