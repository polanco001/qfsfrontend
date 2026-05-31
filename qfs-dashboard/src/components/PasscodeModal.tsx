import { useState, useEffect } from 'react';
import { X, Delete, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PasscodeModalProps {
  mode: 'create' | 'verify';
  onSuccess: () => void;
  onCancel?: () => void;
}

export function PasscodeModal({ mode, onSuccess, onCancel }: PasscodeModalProps) {
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'entry' | 'confirm'>('entry');
  const [enteredCode, setEnteredCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { setPasscode: setUserPasscode, verifyPasscode } = useApp();

  const handleDigit = (digit: string) => {
    if (mode === 'create') {
      if (step === 'entry') {
        if (passcode.length < 6) setPasscode(prev => prev + digit);
      } else {
        if (confirmPasscode.length < 6) setConfirmPasscode(prev => prev + digit);
      }
    } else {
      if (enteredCode.length < 6) setEnteredCode(prev => prev + digit);
    }
  };

  const handleDelete = () => {
    if (mode === 'create') {
      if (step === 'entry') setPasscode(prev => prev.slice(0, -1));
      else setConfirmPasscode(prev => prev.slice(0, -1));
    } else {
      setEnteredCode(prev => prev.slice(0, -1));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      if (mode === 'create') {
        if (step === 'entry') {
          if (passcode.length === 6) {
            setStep('confirm');
          } else {
            setError('Enter 6 digits');
          }
        } else {
          if (confirmPasscode.length === 6) {
            if (passcode === confirmPasscode) {
              const success = await setUserPasscode(passcode);
              if (success) onSuccess();
              else setError('Failed to save passcode. Try again.');
            } else {
              setError('Passcodes do not match');
              setConfirmPasscode('');
            }
          } else {
            setError('Enter 6 digits');
          }
        }
      } else {
        if (enteredCode.length === 6) {
          // ✅ await verifyPasscode — it's async
          const verified = await verifyPasscode(enteredCode);
          if (verified) {
            onSuccess();
          } else {
            setError('Invalid passcode');
            setEnteredCode('');
          }
        } else {
          setError('Enter 6 digits');
        }
      }
    } catch (err) {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when 6 digits entered
  useEffect(() => {
    setError('');
    const currentCode = mode === 'create'
      ? (step === 'entry' ? passcode : confirmPasscode)
      : enteredCode;
    if (currentCode.length === 6) {
      handleSubmit();
    }
  }, [passcode, confirmPasscode, enteredCode]);

  const displayCode = mode === 'create'
    ? (step === 'entry' ? passcode : confirmPasscode)
    : enteredCode;

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {mode === 'create'
              ? (step === 'entry' ? 'Create Passcode' : 'Confirm Passcode')
              : 'Enter Passcode'}
          </h2>
          {onCancel && (
            <button onClick={onCancel} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
              <X size={20} />
            </button>
          )}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          {mode === 'create'
            ? (step === 'entry' ? 'Set a 6-digit passcode for extra security' : 'Confirm your passcode')
            : 'Enter your 6-digit passcode to continue'}
        </p>

        {/* Dots */}
        <div className="flex justify-center gap-4 mb-6">
          {[0,1,2,3,4,5].map(i => (
            <div key={i} className={`w-4 h-4 rounded-full transition-all ${
              displayCode.length > i ? 'bg-blue-600 scale-110' : 'bg-slate-300 dark:bg-slate-600'
            }`} />
          ))}
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        {loading && <p className="text-blue-500 text-sm text-center mb-4">Verifying...</p>}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1,2,3,4,5,6,7,8,9].map(d => (
            <button key={d} onClick={() => handleDigit(d.toString())}
              className="py-3 text-2xl font-semibold bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 transition">
              {d}
            </button>
          ))}
          <div /> {/* empty space */}
          <button onClick={() => handleDigit('0')}
            className="py-3 text-2xl font-semibold bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 transition">
            0
          </button>
          <button onClick={handleDelete}
            className="py-3 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 transition">
            <Delete size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}