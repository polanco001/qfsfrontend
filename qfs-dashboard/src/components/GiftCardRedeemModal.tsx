import { useState } from 'react';
import { Upload, Camera, AlertCircle } from 'lucide-react';

interface GiftCardRedeemModalProps {
  onClose: () => void;
}

const giftCardTypes = [
  { id: 'itunes', name: 'iTunes', icon: '🎵' },
  { id: 'ebay', name: 'eBay', icon: '🛒' },
  { id: 'razer', name: 'Razer', icon: '🎮' },
  { id: 'amazon', name: 'Amazon', icon: '📦' },
  { id: 'google', name: 'Google Play', icon: '▶️' },
  { id: 'steam', name: 'Steam', icon: '🎯' },
];

export function GiftCardRedeemModal({ onClose }: GiftCardRedeemModalProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [code, setCode] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [inputMethod, setInputMethod] = useState<'image' | 'code'>('image');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="space-y-5">
      <p className="text-slate-600 dark:text-slate-400 text-sm">
        Redeem your gift card for QFS credits. Choose a method below.
      </p>

      {/* Gift card type selection */}
      <div>
        <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">
          Gift Card Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {giftCardTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedType === type.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="text-2xl mb-1">{type.icon}</div>
              <p className="text-slate-900 dark:text-white font-semibold text-xs">{type.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Input method toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setInputMethod('image')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            inputMethod === 'image'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Camera size={16} className="inline mr-1" /> Upload Image
        </button>
        <button
          type="button"
          onClick={() => setInputMethod('code')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            inputMethod === 'code'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Manual Code Entry
        </button>
      </div>

      {/* Image upload */}
      {inputMethod === 'image' && (
        <div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-3">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                ⚠️ Scratch the card to reveal the code before taking a picture. The image must clearly show the entire code.
              </p>
            </div>
          </div>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-900">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="text-slate-400 mb-2" size={32} />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {image ? image.name : 'Click to upload image of scratched card'}
              </p>
            </div>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>
      )}

      {/* Manual code entry */}
      {inputMethod === 'code' && (
        <div>
          <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">
            Gift Card Code
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter the gift card code (e.g., XXXX-XXXX-XXXX-XXXX)"
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors disabled:bg-slate-500"
      >
        {loading ? 'Submitting Details...' : 'Submit for Review'}
      </button>
    </div>
  );
}
