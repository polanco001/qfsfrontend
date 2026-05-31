import { X, TrendingUp } from 'lucide-react';

interface Notification {
  id: string;
  symbol: string;
  message: string;
  timestamp: Date;
}

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onClearAll: () => void;
}

export function NotificationPanel({ notifications, onClose, onClearAll }: NotificationPanelProps) {
  return (
    <div className="absolute top-16 right-4 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-slate-900 dark:text-white font-semibold">Notifications</h3>
        <div className="flex items-center gap-2">
          <button onClick={onClearAll} className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400">
            Clear All
          </button>
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
              <div key={notification.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="text-green-500" size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900 dark:text-white text-sm font-medium">{notification.symbol} Price Alert</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">{notification.message}</p>
                    <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">{notification.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}