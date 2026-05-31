import { useApp } from '../context/AppContext';
import { X, CheckCircle, XCircle } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user } = useApp();
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-500">Full Name</p>
            <p className="font-medium">{user.fullName}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">KYC Status</p>
            <div className="flex items-center gap-2">
              {user.kycCompleted ? (
                <><CheckCircle size={16} className="text-green-500" /><span className="text-green-500 font-medium">Verified</span></>
              ) : (
                <><XCircle size={16} className="text-red-500" /><span className="text-red-500">Not verified</span></>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-2">Purchased Items</p>
            {user.purchasedItems.length === 0 ? (
              <p className="text-sm text-slate-400">No purchases yet.</p>
            ) : (
              <div className="space-y-2">
                {user.purchasedItems.map((item) => (
                  <div key={item.id} className="bg-slate-100 dark:bg-slate-700 rounded-lg p-2 text-sm">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-slate-500">${item.price} • {new Date(item.purchasedAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}