import { useState, useEffect } from 'react';
import { Sun, Moon, Bell, User, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserProfileModal } from './UserProfileModal';

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
  onNotificationClick
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
      {/* Header container – dark banking background */}
      <div className="bg-[#0B1120] border-b border-slate-700/50 px-4 sm:px-8 py-4 relative">
        <div className="flex items-center justify-between gap-4">
          
          {/* Left – Balance Card (shifted right to clear hamburger) */}
          <div className="ml-10">
            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-xl px-5 py-3 flex items-center gap-4">
              <div>
                <p className="text-slate-400 text-[10px] uppercase tracking-wider font-medium mb-1">
                  Portfolio Value
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-white text-2xl md:text-3xl font-bold tracking-tight">
                    {balanceVisible ? `$${user?.balance?.toFixed(2) ?? '0.00'}` : '••••••'}
                  </span>
                  <button
                    onClick={() => setBalanceVisible(!balanceVisible)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                  >
                    {balanceVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">+0.0% today</p>
              </div>
            </div>
          </div>

          {/* Right – Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark mode toggle */}
            <button 
              onClick={toggleDarkMode} 
              className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-600 transition-all"
            >
              {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <button 
              onClick={handleNotificationClick} 
              className="relative p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-600 transition-all"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <button 
              onClick={() => setShowProfileModal(true)} 
              className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-600 transition-all"
            >
              <User size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Panel – matching dark style */}
      {showNotificationsPanel && (
        <div className="absolute right-4 top-16 w-80 bg-[#0B1120] border border-slate-700/50 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50 backdrop-blur-xl">
          <div className="p-4 border-b border-slate-700/50">
            <h3 className="text-white font-semibold">Notifications</h3>
          </div>
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">No new notifications</div>
          ) : (
            notifications.map(n => (
              <div 
                key={n._id} 
                className={`p-4 border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors ${
                  !n.read ? 'bg-blue-900/20 border-l-2 border-blue-500' : ''
                }`}
              >
                <p className="text-sm text-slate-200">{n.message}</p>
                <span className="text-xs text-slate-500 mt-1 block">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
          <button 
            onClick={fetchNotifications} 
            className="w-full p-3 text-sm text-blue-400 hover:bg-slate-800/50 transition-colors font-medium"
          >
            Refresh
          </button>
        </div>
      )}

      <UserProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </>
  );
}
