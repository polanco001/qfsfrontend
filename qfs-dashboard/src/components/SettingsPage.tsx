import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';   // ✅ relative from components/
import { PasscodeModal } from './PasscodeModal';
import axios from 'axios';
import { Lock, LogOut, Shield, Eye, EyeOff } from 'lucide-react';

export function SettingsPage() {
  const { user, token, logout, hasPasscode } = useApp();
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        'https://qfsbackend-1.onrender.com/api/auth/change-password',
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
    logout();              // Clears auth state
    navigate('/login');    // Explicitly go to login page
  };

  const handlePasscodeSuccess = () => {
    setShowPasscodeModal(false);
    alert('✅ Passcode saved successfully!');
  };

  const passcodeSet = hasPasscode();

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
                  <button type="button" onClick={toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
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

            <button onClick={handlePasswordChange} disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors">
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
              {passcodeSet
                ? 'Your passcode protects your account. You can change it anytime.'
                : 'Set a 6-digit passcode to add an extra layer of security to your account.'}
            </p>
            <button onClick={() => setShowPasscodeModal(true)}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
              {passcodeSet ? '🔄 Change Passcode' : '🔒 Create Passcode'}
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-semibold text-slate-900 dark:text-white">Account Info</h3>
          </div>
          <div className="p-6 space-y-3">
            <div>
              <p className="text-xs text-slate-500">Full Name</p>
              <p className="font-medium text-slate-900 dark:text-white">{user?.fullName}</p>
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
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${user?.kycCompleted ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {user?.kycCompleted ? '✅ Verified' : '⏳ Pending'}
              </span>
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
            <button onClick={handleLogout}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
              Logout
            </button>
          </div>
        </div>
      </div>

      {showPasscodeModal && (
        <PasscodeModal
          mode="create"
          onSuccess={handlePasscodeSuccess}
          onCancel={() => setShowPasscodeModal(false)}
        />
      )}
    </div>
  );
}
