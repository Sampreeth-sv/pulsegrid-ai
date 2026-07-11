import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Bell, Menu, X, ChevronRight, Zap, Settings,
  Globe, Users, Shield, Heart, Bus, Leaf, Star, Map, BarChart3, Radio,
  Cpu, AlertTriangle, CheckCircle, Clock, Wifi
} from 'lucide-react';
import useStore from '../context/store';
import NotificationDrawer from '../components/NotificationDrawer';
import ArchitectureModal from '../components/ArchitectureModal';
import { MATCH_PHASES } from '../constants';

const navItems = [
  { id: 'overview', label: 'Overview', icon: Activity, path: '/command' },
  { id: 'crowd', label: 'Crowd Intelligence', icon: Users, path: '/command/crowd' },
  { id: 'translation', label: 'AI Translator', icon: Globe, path: '/command/translation' },
  { id: 'volunteer', label: 'Volunteers', icon: Star, path: '/command/volunteers' },
  { id: 'transport', label: 'Transport', icon: Bus, path: '/command/transport' },
  { id: 'medical', label: 'Medical', icon: Heart, path: '/command/medical' },
  { id: 'accessibility', label: 'Accessibility', icon: Shield, path: '/command/accessibility' },
  { id: 'sustainability', label: 'Sustainability', icon: Leaf, path: '/command/sustainability' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/command/analytics' },
  { id: 'broadcast', label: 'Broadcast', icon: Radio, path: '/command/broadcast' },
];

export default function CommandLayout({ children, activePage, onNavigate }) {
  const {
    sidebarOpen, setSidebarOpen, notificationDrawerOpen, setNotificationDrawerOpen,
    architectureModalOpen, setArchitectureModalOpen,
    notifications, simulationRunning, matchPhase, gates, incidents
  } = useStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const unreadCount = notifications.filter((n) => !n.read).length;
  const criticalIncidents = incidents.filter((i) => i.severity === 'CRITICAL' && i.status === 'ACTIVE').length;
  const totalOccupancy = gates.reduce((s, g) => s + g.occupancy, 0);
  const maxRisk = Math.max(...gates.map((g) => g.riskScore));

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const getRiskColor = (score) => {
    if (score >= 90) return 'text-danger';
    if (score >= 75) return 'text-warning';
    if (score >= 55) return 'text-yellow-300';
    return 'text-accent';
  };

  return (
    <div className="flex h-screen bg-primary overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-64 h-full flex flex-col border-r border-white/5 bg-primary-100 relative z-30 flex-shrink-0"
          >
            {/* Logo */}
            <div className="px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/30">
                    <Zap size={18} className="text-accent" />
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent border-2 border-primary animate-pulse" />
                </div>
                <div>
                  <div className="font-display font-bold text-white text-sm leading-none">PULSEGRID</div>
                  <div className="text-accent text-xs font-medium mt-0.5">AI™ Operations</div>
                </div>
              </div>
            </div>

            {/* Match Status */}
            <div className="mx-3 mt-3 p-3 rounded-xl bg-secondary/60 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Live Match</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-danger animate-ping" />
                  <span className="text-xs text-danger font-semibold">LIVE</span>
                </div>
              </div>
              <div className="text-white font-semibold text-sm">🇲🇦 Morocco vs Portugal 🇵🇹</div>
              <div className="text-xs text-slate-400 mt-0.5">MetLife Stadium • {matchPhase.replace(/_/g, ' ')}</div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-primary-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-accent transition-all duration-500"
                    style={{ width: `${((MATCH_PHASES.indexOf(matchPhase) + 1) / MATCH_PHASES.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500">{Math.round(((MATCH_PHASES.indexOf(matchPhase) + 1) / MATCH_PHASES.length) * 100)}%</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-3 overflow-y-auto no-scrollbar">
              <div className="text-xs text-slate-500 px-2 mb-2 font-medium uppercase tracking-wider">Operations</div>
              <div className="space-y-0.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate?.(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-accent/10 text-accent border border-accent/20'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon size={16} className={isActive ? 'text-accent' : ''} />
                      <span className="font-medium">{item.label}</span>
                      {isActive && <ChevronRight size={12} className="ml-auto text-accent/60" />}
                    </button>
                  );
                })}
              </div>

              <div className="text-xs text-slate-500 px-2 mt-4 mb-2 font-medium uppercase tracking-wider">System</div>
              <button
                onClick={() => setArchitectureModalOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                <Cpu size={16} />
                <span className="font-medium">GCP Architecture</span>
              </button>
            </nav>

            {/* Stats Footer */}
            <div className="px-3 pb-3 space-y-2">
              <div className="p-3 rounded-xl bg-secondary/40 border border-white/5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-slate-500">Occupancy</div>
                    <div className="text-sm font-bold text-white">{totalOccupancy.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Max Risk</div>
                    <div className={`text-sm font-bold ${getRiskColor(maxRisk)}`}>{maxRisk}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Incidents</div>
                    <div className="text-sm font-bold text-danger">{criticalIncidents} Critical</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">AI Status</div>
                    <div className="text-sm font-bold text-accent">Online</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <Wifi size={12} className="text-accent" />
                  <span className="text-xs text-slate-500">Connected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${simulationRunning ? 'bg-accent animate-pulse' : 'bg-slate-600'}`} />
                  <span className="text-xs text-slate-500">{simulationRunning ? 'Simulating' : 'Paused'}</span>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-white/5 bg-primary-100/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-slate-500">Operations</span>
              <ChevronRight size={14} className="text-slate-600" />
              <span className="text-white font-medium capitalize">{activePage}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Clock */}
            <div className="hidden md:flex items-center gap-2 font-mono text-sm text-slate-400">
              <Clock size={14} className="text-accent" />
              <span className="text-white font-medium">{currentTime.toLocaleTimeString()}</span>
            </div>

            {/* System Health */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 border border-white/5">
              <CheckCircle size={13} className="text-accent" />
              <span className="text-xs text-slate-300 font-medium">All Systems Online</span>
            </div>

            {/* Critical Alert Badge */}
            {criticalIncidents > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger/20 border border-danger/30"
              >
                <AlertTriangle size={13} className="text-danger animate-pulse" />
                <span className="text-xs text-danger font-bold">{criticalIncidents} Critical</span>
              </motion.div>
            )}

            {/* Notifications */}
            <button
              onClick={() => setNotificationDrawerOpen(!notificationDrawerOpen)}
              className="relative p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-danger text-white text-xs flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <button className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Notification Drawer */}
      <NotificationDrawer />
      {/* Architecture Modal */}
      <ArchitectureModal />
    </div>
  );
}
