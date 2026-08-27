import { X, Bell } from 'lucide-react';

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onClearAll: () => void;
}

// Helper to safely format date (fixes "Invalid Date" issue)
const formatDate = (dateString: string) => {
  if (!dateString) return 'No date';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';
  return date.toLocaleString();
};

export function NotificationPanel({ notifications, onClose, onClearAll }: NotificationPanelProps) {
  return (
    <div className="absolute top-16 right-4 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-slate-900 dark:text-white font-semibold">Notifications</h3>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button onClick={onClearAll} className="text-xs text-red-500 hover:text-red-700">
              Clear All
            </button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">
            <X size={16} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500 dark:text-slate-400">No new notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {notifications.map((notification) => (
              <div key={notification._id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Bell className="text-blue-500" size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900 dark:text-white text-sm">{notification.message}</p>
                    <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}