import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PasscodeModal } from './PasscodeModal';
import { WalletBackupModal } from './WalletBackupModal';
import { VerifiedBadge } from './VerifiedBadge';
import { Modal } from './Modal';
import axios from 'axios';
import { Lock, LogOut, Shield, Eye, EyeOff, Bell, Key, Mail, Upload, Loader2 } from 'lucide-react';

export function SettingsPage() {
  const { user, token, logout, hasPasscode, getWalletBackup, updateProfile } = useApp();
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPasscodeModal, setShowPasscodeModal] = useState<null | 'create' | 'change' | 'verify'>(null);
  const [showWalletBackup, setShowWalletBackup] = useState(false);
  const [hasBackup, setHasBackup] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check wallet backup status
  useState(() => {
    getWalletBackup().then(phrase => setHasBackup(phrase !== ''));
  }, []);

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    if (!oldPassword) { setPasswordError('Enter your current password'); return; }
    if (!newPassword || newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match'); return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters'); return;
    }
    setIsLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://https://qfsbackend-1.onrender.com/api'}/auth/change-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswordSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePasscodeSuccess = () => {
    setShowPasscodeModal(null);
    alert('✅ Passcode saved successfully!');
  };

  const passcodeSet = hasPasscode();

  const toggleEmailNotifs = async () => {
    const newVal = !emailNotifs;
    setEmailNotifs(newVal);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || 'http://https://qfsbackend-1.onrender.com/api'}/user/notifications/settings`,
        { emailEnabled: newVal },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) { console.error('Failed to update notification settings:', err); }
  };

  // Avatar upload handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarUploading(true);
    const success = await updateProfile(user?.fullName || '', avatarFile);
    setAvatarUploading(false);
    if (success) {
      setAvatarFile(null);
      setAvatarPreview('');
      alert('Avatar updated successfully!');
    } else {
      alert('Failed to upload avatar.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8">Account Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Change Password */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Lock size={18} className="text-blue-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Change Password</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: 'Current Password', value: oldPassword, setter: setOldPassword, show: showOldPassword, toggle: () => setShowOldPassword(!showOldPassword) },
              { label: 'New Password', value: newPassword, setter: setNewPassword, show: showNewPassword, toggle: () => setShowNewPassword(!showNewPassword), placeholder: 'Min. 8 characters' },
              { label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword, show: showConfirmPassword, toggle: () => setShowConfirmPassword(!showConfirmPassword), placeholder: 'Repeat new password' },
            ].map(({ label, value, setter, show, toggle, placeholder }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={e => setter(e.target.value)}
                    placeholder={placeholder || '••••••••'}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            ))}

            {passwordError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-red-600 dark:text-red-400 text-sm">{passwordError}</p>
              </div>
            )}
            {passwordSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <p className="text-green-600 dark:text-green-400 text-sm">{passwordSuccess}</p>
              </div>
            )}

            <button onClick={handlePasswordChange} disabled={isLoading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors">
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>

        {/* App Passcode */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-purple-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">App Passcode</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className={`flex items-center gap-2 p-3 rounded-lg ${passcodeSet ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'}`}>
              <span className="text-lg">{passcodeSet ? '🔒' : '🔓'}</span>
              <p className={`text-sm font-medium ${passcodeSet ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                {passcodeSet ? 'Passcode is active' : 'No passcode set — your account is less secure'}
              </p>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {passcodeSet ? 'Your passcode protects your account. You can change it anytime.' : 'Set a 6-digit passcode to add an extra layer of security to your account.'}
            </p>
            <button onClick={() => setShowPasscodeModal(passcodeSet ? 'change' : 'create')} className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
              {passcodeSet ? '🔄 Change Passcode' : '🔒 Create Passcode'}
            </button>
          </div>
        </div>

        {/* Email Notifications */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-green-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-slate-400" />
                <span className="text-sm font-medium">Email Notifications</span>
              </div>
              <button
                onClick={toggleEmailNotifs}
                className={`w-12 h-6 rounded-full transition ${emailNotifs ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition ${emailNotifs ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <p className="text-xs text-slate-500">Receive emails for transaction updates, KYC status, and more.</p>
          </div>
        </div>

        {/* Wallet Backup */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Key size={18} className="text-amber-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Wallet Backup</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className={`flex items-center gap-2 p-3 rounded-lg ${hasBackup ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'}`}>
              <span className="text-lg">{hasBackup ? '✅' : '⚠️'}</span>
              <p className={`text-sm font-medium ${hasBackup ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                {hasBackup ? 'Wallet backed up' : 'Wallet backup required'}
              </p>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Store your 12-word recovery phrase to secure your wallet.
            </p>
            <button onClick={() => setShowWalletBackup(true)} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors">
              {hasBackup ? 'View Backup' : 'Backup Now'}
            </button>
          </div>
        </div>

        {/* Account Info (with Avatar Upload) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-semibold text-slate-900 dark:text-white">Account Info</h3>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {avatarPreview || (user?.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : user?.fullName?.[0] || 'U')}
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500">Avatar</p>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm flex items-center gap-1"
                  >
                    <Upload size={14} /> Upload
                  </button>
                  {avatarFile && (
                    <button
                      onClick={handleAvatarUpload}
                      disabled={avatarUploading}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-1 disabled:opacity-50"
                    >
                      {avatarUploading ? <Loader2 size={14} className="animate-spin" /> : 'Save Avatar'}
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500">Full Name</p>
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-900 dark:text-white">{user?.fullName}</p>
                {user?.kycCompleted && <VerifiedBadge size={14} showText={false} className="text-blue-500" />}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="font-medium text-slate-900 dark:text-white">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Role</p>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {user?.role}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500">KYC Status</p>
              {user?.kycCompleted ? (
                <VerifiedBadge size={16} className="text-green-600" />
              ) : (
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  ⏳ Pending
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <LogOut size={18} className="text-red-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Session</h3>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Signed in as <span className="font-medium text-slate-800 dark:text-slate-200">{user?.email}</span>
            </p>
            <button onClick={handleLogout} className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPasscodeModal && (
        <PasscodeModal
          mode={showPasscodeModal}
          onSuccess={handlePasscodeSuccess}
          onCancel={() => setShowPasscodeModal(null)}
        />
      )}
      <Modal isOpen={showWalletBackup} onClose={() => setShowWalletBackup(false)} title="Wallet Backup">
        <WalletBackupModal onClose={() => setShowWalletBackup(false)} />
      </Modal>
    </div>
  );
}