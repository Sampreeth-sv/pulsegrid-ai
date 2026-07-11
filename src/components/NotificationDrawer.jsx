import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCircle, AlertTriangle, Heart, Shield, Bus, Users, Radio, Info, Settings } from 'lucide-react';
import useStore from '../context/store';
import notificationService from '../services/notificationService';

const iconMap = {
  INCIDENT: AlertTriangle, MEDICAL: Heart, SECURITY: Shield,
  CROWD: Users, TRANSPORT: Bus, VOLUNTEER: CheckCircle,
  SUCCESS: CheckCircle, INFO: Info, WARNING: AlertTriangle,
  BROADCAST: Radio, SYSTEM: Settings,
};

const priorityStyles = {
  CRITICAL: 'border-l-danger text-danger',
  HIGH: 'border-l-warning text-warning',
  NORMAL: 'border-l-info text-info',
  LOW: 'border-l-slate-600 text-slate-400',
};

const iconColors = {
  CRITICAL: 'text-danger', HIGH: 'text-warning', NORMAL: 'text-info', LOW: 'text-slate-400',
};

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function NotificationDrawer() {
  const { notificationDrawerOpen, setNotificationDrawerOpen, notifications, dismissNotification } = useStore();

  const handleMarkAll = () => {
    notificationService.markAllRead();
  };

  return (
    <AnimatePresence>
      {notificationDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setNotificationDrawerOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-primary-100 border-l border-white/10 z-50 flex flex-col"
          >
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-accent" />
                <span className="font-display font-bold text-white">Alerts & Notifications</span>
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-danger/20 text-danger text-xs font-bold">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkAll}
                  className="text-xs text-accent hover:text-accent-300 transition-colors"
                >
                  Mark all read
                </button>
                <button
                  onClick={() => setNotificationDrawerOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                  <Bell size={32} className="mb-3 opacity-30" />
                  <span className="text-sm">No notifications</span>
                </div>
              ) : (
                notifications.map((notif) => {
                  const Icon = iconMap[notif.type] || Bell;
                  const pStyle = priorityStyles[notif.priority] || priorityStyles.NORMAL;
                  const iColor = iconColors[notif.priority] || 'text-info';
                  return (
                    <motion.div
                      key={notif.id}
                      layout
                      initial={{ x: 30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 30, opacity: 0 }}
                      className={`relative p-3 rounded-xl bg-secondary/50 border-l-2 ${pStyle} ${!notif.read ? 'border border-white/5' : 'opacity-60'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 ${iColor}`}>
                          <Icon size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-white truncate">{notif.title}</span>
                            {!notif.read && <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                          <span className="text-xs text-slate-600 mt-1 block">{timeAgo(notif.timestamp)}</span>
                        </div>
                        <button
                          onClick={() => dismissNotification(notif.id)}
                          className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
