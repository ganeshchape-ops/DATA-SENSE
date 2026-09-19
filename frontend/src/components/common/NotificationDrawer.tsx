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
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'anomaly':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'report':
        return <FileText className="w-4 h-4 text-purple-400" />;
      case 'prediction':
      case 'analysis':
        return <Sparkles className="w-4 h-4 text-blue-400" />;
      case 'security':
        return <ShieldCheck className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleNotificationClick = (link: string) => {
    navigate(link);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-sm glass-dropdown h-full shadow-2xl border-l border-white/10 flex flex-col animate-in-scale">
        {/* Header */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-400" />
            <h2 className="font-bold text-white text-base">
              Notifications
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
              {notifications.filter(n => n.unread).length} new
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions bar */}
        <div className="px-4 py-2 bg-[#07090E]/60 border-b border-white/[0.06] flex items-center justify-between text-xs">
          <button
            onClick={onMarkAllAsRead}
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            Mark all read
          </button>
          <button
            onClick={onClearAll}
            className="text-slate-400 hover:text-rose-400 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Clear all
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-center text-sm">
              <Bell className="w-8 h-8 mb-2 opacity-30" />
              No notifications yet
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif.link)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                  notif.unread
                    ? 'bg-purple-950/20 border-purple-500/30'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-xl bg-white/[0.04]">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-bold text-white truncate">
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {notif.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/[0.08] text-center">
          <button
            onClick={() => { navigate('/settings'); onClose(); }}
            className="text-xs text-slate-400 hover:text-purple-400 flex items-center justify-center gap-1 w-full"
          >
            Notification Preferences <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
