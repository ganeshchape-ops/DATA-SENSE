import React from 'react';
import {
  Bell, CheckCircle2, AlertTriangle, FileText, Sparkles, ShieldCheck,
  X, Trash2, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'upload' | 'analysis' | 'prediction' | 'anomaly' | 'report' | 'security';
  unread: boolean;
  link: string;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'upload':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'anomaly':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'report':
        return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'prediction':
      case 'analysis':
        return <Sparkles className="w-4 h-4 text-cyan-500" />;
      case 'security':
        return <ShieldCheck className="w-4 h-4 text-violet-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleNotificationClick = (link: string) => {
    navigate(link);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in-scale">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Notifications
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full">
              {notifications.filter(n => n.unread).length} new
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions bar */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <button
            onClick={onMarkAllAsRead}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Mark all read
          </button>
          <button
            onClick={onClearAll}
            className="text-slate-400 hover:text-rose-500 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Clear all
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center text-sm">
              <Bell className="w-8 h-8 mb-2 opacity-30" />
              No notifications yet
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif.link)}
                className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                  notif.unread
                    ? 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-200/70 dark:border-indigo-800/50'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {notif.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {notif.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center">
          <button
            onClick={() => { navigate('/settings'); onClose(); }}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 flex items-center justify-center gap-1 w-full"
          >
            Manage Notification Preferences <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
