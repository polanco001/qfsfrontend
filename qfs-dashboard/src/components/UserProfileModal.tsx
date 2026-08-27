import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, XCircle, Pencil, Check, Loader2, Upload } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, updateProfile } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !user) return null;

  const startEditing = () => {
    setNameInput(user.fullName);
    setError('');
    setAvatarFile(null);
    setAvatarPreview('');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setError('');
    setAvatarFile(null);
    setAvatarPreview('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const saveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setError('Name cannot be empty');
      return;
    }
    setSaving(true);
    setError('');
    const ok = await updateProfile(trimmed, avatarFile || undefined);
    setSaving(false);
    if (ok) {
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview('');
    } else {
      setError('Failed to update. Try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
            {avatarPreview || (user.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : user.fullName[0])}
          </div>
          {isEditing && (
            <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm">
              <Upload size={14} className="inline mr-1" /> Upload
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-500">Full Name</p>
            {isEditing ? (
              <div className="mt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveName()}
                    autoFocus
                    disabled={saving}
                    className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={saveName} disabled={saving} className="p-1.5 rounded-full bg-green-500 text-white hover:bg-green-600 disabled:opacity-50">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  </button>
                  <button onClick={cancelEditing} disabled={saving} className="p-1.5 rounded-full bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 disabled:opacity-50">
                    <X size={14} />
                  </button>
                </div>
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-medium">{user.fullName}</p>
                <button onClick={startEditing} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                  <Pencil size={14} className="text-slate-400" />
                </button>
              </div>
            )}
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
        </div>
      </div>
    </div>
  );
}