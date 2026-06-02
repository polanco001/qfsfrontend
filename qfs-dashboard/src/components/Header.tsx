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
      {/* Header — light/dark adaptive */}
      <div className={`
        border-b px-4 sm:px-8 py-4 relative
        ${isDarkMode 
          ? 'bg-[#0B1120] border-slate-700/50' 
          : 'bg-white border-slate-200'
        }
      `}>
        <div className="flex items-center justify-between gap-4">
          
          {/* Left – User name + Balance Card */}
          <div className="ml-10">
            <div className={`
              rounded-xl px-3 sm:px-5 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-4
              ${isDarkMode
                ? 'bg-slate-800/60 border border-slate-700/50'
                : 'bg-white border border-slate-200 shadow-sm'
              }
            `}>
              {/* User Avatar + Name */}
              <div className={`flex items-center gap-2 sm:gap-3 border-r pr-2 sm:pr-4 mr-1 sm:mr-2 ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {user?.fullName || 'User'}
                  </p>
                  <p className={`text-[9px] sm:text-[10px] uppercase tracking-wider font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {user?.role === 'admin' ? 'Admin' : 'Account Holder'}
                  </p>
                </div>
              </div>

              {/* Balance */}
              <div>
                <p className={`text-[9px] sm:text-[10px] uppercase tracking-wider font-medium mb-0.5 sm:mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Portfolio Value
                </p>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className={`text-lg sm:text-2xl md:text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {balanceVisible ? `$${user?.balance?.toFixed(2) ?? '0.00'}` : '••••••'}
                  </span>
                  <button
                    onClick={() => setBalanceVisible(!balanceVisible)}
                    className={`p-1 transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {balanceVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className={`text-[10px] sm:text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  +0.0% today
                </p>
              </div>
            </div>
          </div>

          {/* Right – Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Dark/light toggle */}
            <button 
              onClick={toggleDarkMode} 
              className={`
                p-2 sm:p-2.5 rounded-lg border transition-all
                ${isDarkMode
                  ? 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-600'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }
              `}
            >
              {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>

            {/* Notifications */}
            <button 
              onClick={handleNotificationClick} 
              className={`
                relative p-2 sm:p-2.5 rounded-lg border transition-all
                ${isDarkMode
                  ? 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-600'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }
              `}
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center animate-pulse font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <button 
              onClick={() => setShowProfileModal(true)} 
              className={`
                p-2 sm:p-2.5 rounded-lg border transition-all
                ${isDarkMode
                  ? 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-600'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }
              `}
            >
              <User size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Panel — adaptive */}
      {showNotificationsPanel && (
        <div className={`
          absolute right-2 sm:right-4 top-14 sm:top-16 w-72 sm:w-80 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50 backdrop-blur-xl border
          ${isDarkMode 
            ? 'bg-[#0B1120] border-slate-700/50 text-white' 
            : 'bg-white border-slate-200 text-slate-900'
          }
        `}>
          <div className={`p-3 sm:p-4 border-b ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
            <h3 className="font-semibold text-sm">Notifications</h3>
          </div>
          {notifications.length === 0 ? (
            <div className={`p-6 text-center text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              No new notifications
            </div>
          ) : (
            notifications.map(n => (
              <div 
                key={n._id} 
                className={`
                  p-3 sm:p-4 border-b transition-colors
                  ${isDarkMode ? 'border-slate-700/30 hover:bg-slate-800/50' : 'border-slate-100 hover:bg-slate-50'}
                  ${!n.read ? (isDarkMode ? 'bg-blue-900/20 border-l-2 border-blue-500' : 'bg-blue-50 border-l-2 border-blue-500') : ''}
                `}
              >
                <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{n.message}</p>
                <span className={`text-[10px] sm:text-xs mt-1 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
          <button 
            onClick={fetchNotifications} 
            className={`w-full p-3 text-xs sm:text-sm font-medium transition-colors ${
              isDarkMode ? 'text-blue-400 hover:bg-slate-800/50' : 'text-blue-600 hover:bg-slate-50'
            }`}
          >
            Refresh
          </button>
        </div>
      )}

      <UserProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </>
  );
}
