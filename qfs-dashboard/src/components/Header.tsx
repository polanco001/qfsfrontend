import { useState, useEffect } from 'react';
import { Sun, Moon, Bell, User, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserProfileModal } from './UserProfileModal';
import { VerifiedBadge } from './VerifiedBadge';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  notificationCount: number;
  onNotificationClick: () => void;
}

export function Header({
  isDarkMode,
  toggleDarkMode,
  notificationCount,
  onNotificationClick,
}: HeaderProps) {
  const { user, notifications, fetchNotifications } = useApp();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const getNotificationStyle = (message: string) => {
    if (message.includes('KYC')) return { icon: '🛡️', color: 'text-purple-500' };
    if (message.includes('payment') || message.includes('credited')) return { icon: '💰', color: 'text-green-500' };
    if (message.includes('deducted')) return { icon: '🔻', color: 'text-red-500' };
    if (message.includes('password')) return { icon: '🔑', color: 'text-amber-500' };
    return { icon: '🔔', color: 'text-blue-500' };
  };

  return (
    <>
      <div
        className={`border-b px-4 sm:px-8 py-4 relative ${
          isDarkMode
            ? 'bg-[#0B1120] border-slate-700/50'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="ml-10">
            <div
              className={`rounded-xl px-5 py-3 flex items-center gap-4 backdrop-blur-md ${
                isDarkMode
                  ? 'bg-slate-800/60 border border-slate-700/50'
                  : 'bg-white border border-slate-200 shadow-sm'
              }`}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.fullName?.[0] || 'U'
                )}
              </div>

              <div>
                {/* User's name shown prominently above the balance */}
                <div
                  className={`flex items-center gap-1.5 text-xs font-semibold mb-0.5 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  <span>👤 {user?.fullName || 'User'}</span>
                  {user?.kycCompleted && (
                    <VerifiedBadge size={14} showText={false} className="text-blue-400" />
                  )}
                </div>

                <p
                  className={`text-[10px] uppercase tracking-wider font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Wallet Balance
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-2xl md:text-3xl font-bold tracking-tight ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {balanceVisible
                      ? `$${Number(user?.balance ?? 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : '••••••'}
                  </span>
                  <button
                    onClick={() => setBalanceVisible(!balanceVisible)}
                    className={`p-1 transition-colors ${
                      isDarkMode
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {balanceVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  +0.0% today
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-lg border transition-all ${
                isDarkMode
                  ? 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-600'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>

            {/* Notification Bell */}
            <button
              onClick={onNotificationClick}
              className={`relative p-2.5 rounded-lg border transition-all ${
                isDarkMode
                  ? 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-600'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowProfileModal(true)}
              className={`p-2.5 rounded-lg border transition-all ${
                isDarkMode
                  ? 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-600'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <User size={18} />
            </button>
          </div>
        </div>
      </div>

      <UserProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </>
  );
}