import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  X,
  CheckCheck,
  Trash2,
  Bell,
  CheckCircle,
  AlertCircle,
  Package,
  Truck,
  FileCheck,
} from 'lucide-react';
import { NotificationEventType } from '../../types/procurement';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const {
    allNotifications,
    currentUser,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
  } = useProcurement();

  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  if (!isOpen) return null;

  // Filter notifications relevant to current user or admin
  const userNotifications = allNotifications.filter(
    (n) => n.userId === currentUser.id || n.userId === 'usr-admin' || currentUser.role === 'ADMIN'
  );

  const displayed =
    filter === 'UNREAD' ? userNotifications.filter((n) => !n.isRead) : userNotifications;

  const getEventIcon = (type: NotificationEventType) => {
    switch (type) {
      case NotificationEventType.REQUEST_APPROVED:
      case NotificationEventType.PO_FULLY_APPROVED:
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case NotificationEventType.REQUEST_REJECTED:
      case NotificationEventType.PO_REJECTED:
      case NotificationEventType.SUPPLIER_REJECTED:
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case NotificationEventType.ORDER_DISPATCHED:
      case NotificationEventType.ORDER_DELIVERED:
        return <Truck className="w-4 h-4 text-blue-600" />;
      case NotificationEventType.LOW_STOCK_ALERT:
        return <Package className="w-4 h-4 text-amber-600" />;
      default:
        return <FileCheck className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#191C20] rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#00639A] dark:text-sky-300 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                In-App Notifications
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time alerts, approvals & delivery updates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filter === 'ALL'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              All ({userNotifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filter === 'UNREAD'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Unread ({userNotifications.filter((n) => !n.isRead).length})
            </button>
          </div>
          <button
            onClick={markAllNotificationsAsRead}
            className="flex items-center gap-1 text-[#00639A] dark:text-sky-400 hover:underline font-medium"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800/60">
          {displayed.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                No notifications right now
              </p>
              <p className="text-xs text-slate-400 mt-1">
                You will be notified when orders progress or signatures are requested.
              </p>
            </div>
          ) : (
            displayed.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`pt-2.5 first:pt-0 p-3 rounded-2xl cursor-pointer transition-all ${
                  notif.isRead
                    ? 'bg-white dark:bg-[#191C20] opacity-80'
                    : 'bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    {getEventIcon(notif.eventType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-500">
          Showing notifications for {currentUser.name} ({currentUser.role.replace('_', ' ')})
        </div>
      </div>
    </div>
  );
};
