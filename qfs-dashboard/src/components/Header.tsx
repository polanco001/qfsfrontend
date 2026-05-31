import { useState, useEffect } from 'react';
import { Sun, Moon, Bell, User, Menu, X, Eye, EyeOff, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserProfileModal } from './UserProfileModal';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  notificationCount: number;
  onNotificationClick: () => void;
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

export function Header({ 
  isDarkMode, 
  toggleDarkMode, 
  notificationCount, 
  onNotificationClick,
  isMobileMenuOpen,
  onMobileMenuToggle
}: HeaderProps) {
  const { user, notifications, fetchNotifications } = useApp();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = () => {
    onNotificationClick();
    setShowNotificationsPanel(!showNotificationsPanel);
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left side – mobile menu toggle + balance */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMobileMenuToggle}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 transition-colors md:hidden"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-8">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Total Balance</p>
                <div className="flex items-center gap-2">
                  <p className="text-slate-900 dark:text-white text-2xl sm:text-3xl font-bold">
                    {balanceVisible ? `$${user?.balance?.toFixed(2) ?? '0.00'}` : '••••••'}
                  </p>
                  <button
                    onClick={() => setBalanceVisible(!balanceVisible)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    {balanceVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-slate-500 text-xs">$0.00 (+0.0%) today</p>
              </div>
              <div className="border-l border-slate-200 dark:border-slate-700 pl-4 hidden sm:block">
                <p className="text-slate-500 dark:text-slate-400 text-xs">Available</p>
                <p className="text-slate-900 dark:text-white text-xl font-semibold">
                  {balanceVisible ? `$${user?.balance?.toFixed(2) ?? '0.00'}` : '••••'}
                </p>
              </div>
            </div>
          </div>
          {/* Right side – action buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={toggleDarkMode} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200">
              {isDarkMode ? <Sun className="text-yellow-500" size={20} /> : <Moon className="text-slate-700" size={20} />}
            </button>
            <button onClick={handleNotificationClick} className="relative p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200">
              <Bell className="text-slate-700 dark:text-slate-300" size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button onClick={() => setShowProfileModal(true)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200">
              <User className="text-slate-700 dark:text-slate-300" size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotificationsPanel && (
        <div className="absolute right-4 top-16 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border max-h-96 overflow-y-auto z-50">
          <div className="p-3 border-b font-semibold">Notifications</div>
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-slate-500">No notifications</div>
          ) : (
            notifications.map(n => (
              <div key={n._id} className={`p-3 border-b hover:bg-slate-50 dark:hover:bg-slate-700 ${!n.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <p className="text-sm">{n.message}</p>
                <span className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
            ))
          )}
          <button onClick={fetchNotifications} className="w-full p-2 text-center text-blue-500 text-sm">Refresh</button>
        </div>
      )}

      <UserProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </>
  );
}