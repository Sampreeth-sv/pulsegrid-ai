import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCircle, AlertTriangle, Heart, Users, Bus, Shield, Leaf, Zap, Info } from 'lucide-react';
import useStore from '../context/store';
import { Badge } from './ui';

const TYPE_CONFIG = {
  MEDICAL: { icon: Heart, color: '#FF4D6D', bg: 'bg-danger/10', border: 'border-danger/25' },
  SECURITY: { icon: Shield, color: '#FF4D6D', bg: 'bg-danger/10', border: 'border-danger/20' },
  CROWD: { icon: Users, color: '#FFC857', bg: 'bg-warning/10', border: 'border-warning/20' },
  TRANSPORT: { icon: Bus, color: '#56CCF2', bg: 'bg-info/10', border: 'border-info/20' },
  SUCCESS: { icon: CheckCircle, color: '#00E5A8', bg: 'bg-accent/10', border: 'border-accent/20' },
  WARNING: { icon: AlertTriangle, color: '#FFC857', bg: 'bg-warning/10', border: 'border-warning/20' },
  INFO: { icon: Info, color: '#56CCF2', bg: 'bg-info/10', border: 'border-info/20' },
  SUSTAINABILITY: { icon: Leaf, color: '#00E5A8', bg: 'bg-accent/10', border: 'border-accent/20' },
  POWER: { icon: Zap, color: '#FFC857', bg: 'bg-warning/10', border: 'border-warning/20' },
};

const getConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.INFO;
const timeAgo = (ts) => {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

export default function NotificationDrawer() {
  const { notificationDrawerOpen, setNotificationDrawerOpen, notifications, dismissNotification } = useStore();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <AnimatePresence>
      {notificationDrawerOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setNotificationDrawerOpen(false)} />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-80 z-50 flex flex-col bg-primary-100/95 backdrop-blur-xl border-l border-white/8"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/8 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center">
                  <Bell size={15} className="text-accent" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Notifications</div>
                  {unread > 0 && <div className="text-xs text-accent">{unread} unread</div>}
                </div>
              </div>
              <button onClick={() => setNotificationDrawerOpen(false)}
                className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell size={36} className="text-slate-700 mb-3" />
                  <div className="text-slate-500 text-sm">No notifications yet</div>
                  <div className="text-slate-700 text-xs mt-1">Start the simulation to see live alerts</div>
                </div>
              ) : (
                notifications.map((n, i) => {
                  const cfg = getConfig(n.type);
                  const Icon = cfg.icon;
                  return (
                    <motion.div key={n.id}
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      className={`p-3 rounded-xl border relative ${cfg.bg} ${cfg.border} ${!n.read ? 'border-l-2' : 'opacity-60'}`}
                      style={!n.read ? { borderLeftColor: cfg.color } : {}}>
                      <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: `${cfg.color}20` }}>
                          <Icon size={12} style={{ color: cfg.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-semibold text-white text-xs truncate">{n.title}</span>
                            {n.priority === 'CRITICAL' && (
                              <Badge variant="CRITICAL" className="flex-shrink-0" style={{ fontSize: '9px', padding: '1px 4px' }}>!</Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{n.message}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-xs text-slate-600">{timeAgo(n.timestamp)}</span>
                            <button onClick={() => dismissNotification(n.id)}
                              className="text-xs text-slate-600 hover:text-slate-400 transition-colors px-1.5 py-0.5 rounded hover:bg-white/5">
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-white/8 flex-shrink-0">
                <button onClick={() => notifications.forEach((n) => dismissNotification(n.id))}
                  className="btn-ghost w-full justify-center text-xs py-2">
                  Clear All Notifications
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
