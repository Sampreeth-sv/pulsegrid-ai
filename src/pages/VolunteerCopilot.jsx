import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Map, MessageSquare, Bell, User, AlertTriangle, Heart,
  Clock, Battery, Wifi, MapPin, Star, CheckCircle, Baby,
  Accessibility, Package, Mic, Phone, Zap, Activity, Users,
  ChevronRight, Send, Loader
} from 'lucide-react';
import useStore from '../context/store';
import translationService from '../services/translationService';
import toast from 'react-hot-toast';

const MY_VOLUNTEER = {
  id: 'V001', name: 'Amira Benali', role: 'Crowd Management',
  assignedGate: 'A', sector: 'North', languages: ['Arabic', 'French', 'English'],
  shiftStart: '16:00', shiftEnd: '22:00', rating: 4.8,
  skills: ['First Aid', 'Crowd Control', 'Translation'],
};

function StatusBar() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <div className="flex justify-between items-center px-4 pt-2 pb-1 text-xs text-slate-400">
      <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      <div className="flex items-center gap-2">
        <Wifi size={12} className="text-accent" />
        <Battery size={12} className="text-accent" />
        <span>87%</span>
      </div>
    </div>
  );
}

function TabBar({ active, onChange }) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'map', icon: Map, label: 'Map' },
    { id: 'ai', icon: MessageSquare, label: 'AI' },
    { id: 'alerts', icon: Bell, label: 'Alerts' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto bg-primary-100/95 backdrop-blur-sm border-t border-white/10 flex justify-around items-center px-2 py-2 z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${active === tab.id ? 'text-accent' : 'text-slate-500'}`}>
            <Icon size={active === tab.id ? 22 : 20} />
            <span className="text-xs">{tab.label}</span>
            {active === tab.id && <div className="w-1 h-1 rounded-full bg-accent" />}
          </button>
        );
      })}
    </div>
  );
}

function HomeTab({ incidents, volunteers }) {
  const { simulationRunning, startSimulation } = useStore();
  const [shiftSeconds, setShiftSeconds] = useState(5423);
  useEffect(() => {
    const t = setInterval(() => setShiftSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const hours = Math.floor(shiftSeconds / 3600);
  const mins = Math.floor((shiftSeconds % 3600) / 60);
  const secs = shiftSeconds % 60;

  const nearbyIncidents = incidents.filter((i) => i.status === 'ACTIVE').slice(0, 3);
  const nearbyVols = volunteers.filter((v) => v.assignedGate === MY_VOLUNTEER.assignedGate && v.id !== MY_VOLUNTEER.id).slice(0, 3);

  const quickActions = [
    { icon: Heart, label: 'Medical SOS', color: '#FF4D6D', action: () => toast.error('🚨 Medical SOS sent to all teams!', { duration: 4000 }) },
    { icon: Baby, label: 'Lost Child', color: '#FFC857', action: () => toast('🧒 Lost child protocol initiated', { duration: 3000 }) },
    { icon: Accessibility, label: 'Accessibility', color: '#56CCF2', action: () => toast.success('♿ Accessibility team notified') },
    { icon: Package, label: 'Equipment', color: '#00E5A8', action: () => toast.success('📦 Equipment request submitted') },
    { icon: AlertTriangle, label: 'Incident', color: '#FFC857', action: () => toast('⚠️ Incident reported to command') },
    { icon: Phone, label: 'Emergency', color: '#FF4D6D', action: () => toast.error('📞 Connecting to emergency line...') },
  ];

  return (
    <div className="space-y-4 pb-20">
      {/* Assignment Card */}
      <div className="mobile-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-semibold text-accent">ACTIVE SHIFT</span>
          </div>
          <div className="font-mono text-sm text-white font-bold">
            {String(hours).padStart(2, '0')}:{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
        </div>
        <div className="text-lg font-bold text-white">{MY_VOLUNTEER.role}</div>
        <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
          <MapPin size={14} className="text-accent" />
          <span>Gate {MY_VOLUNTEER.assignedGate} — {MY_VOLUNTEER.sector} Sector</span>
        </div>
        <div className="mt-3 p-3 bg-primary/50 rounded-xl border border-white/5">
          <div className="text-xs text-slate-500 mb-1">Current Task</div>
          <div className="text-sm text-white font-medium">Gate A Queue Management — Zone 2</div>
          <div className="flex items-center gap-1 mt-2">
            <Activity size={12} className="text-accent" />
            <span className="text-xs text-accent">Active deployment</span>
          </div>
        </div>
      </div>

      {/* Shift Timer */}
      <div className="mobile-card">
        <div className="label-text mb-3">Shift Progress</div>
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{MY_VOLUNTEER.shiftStart}</span>
          <span>{MY_VOLUNTEER.shiftEnd}</span>
        </div>
        <div className="h-2 bg-primary rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-accent to-info rounded-full" style={{ width: `${(shiftSeconds / (6 * 3600)) * 100}%` }} />
        </div>
        <div className="text-xs text-slate-400 mt-1 text-right">{Math.round((shiftSeconds / 21600) * 100)}% complete</div>
      </div>

      {/* Quick Actions */}
      <div className="mobile-card">
        <div className="label-text mb-3">Quick Actions</div>
        <div className="grid grid-cols-3 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.button key={action.label} whileTap={{ scale: 0.93 }} onClick={action.action}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/10 hover:border-white/20 transition-all bg-primary/40">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${action.color}20` }}>
                  <Icon size={20} style={{ color: action.color }} />
                </div>
                <span className="text-xs text-slate-300 text-center leading-tight">{action.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Nearby Incidents */}
      {nearbyIncidents.length > 0 && (
        <div className="mobile-card">
          <div className="label-text mb-3 text-danger">⚡ Nearby Incidents</div>
          <div className="space-y-2">
            {nearbyIncidents.map((inc) => (
              <div key={inc.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-primary/40 border border-danger/20">
                <AlertTriangle size={14} className="text-danger flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{inc.title}</div>
                  <div className="text-xs text-slate-500">{inc.location}</div>
                </div>
                <span className={`text-xs font-bold ${inc.severity === 'CRITICAL' ? 'text-danger' : 'text-warning'}`}>{inc.severity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nearby Volunteers */}
      <div className="mobile-card">
        <div className="label-text mb-3">Nearby Volunteers</div>
        <div className="space-y-2">
          {nearbyVols.map((vol) => (
            <div key={vol.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-primary/40 border border-white/5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-info/30 flex items-center justify-center text-xs font-bold text-white">
                {vol.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{vol.name}</div>
                <div className="text-xs text-slate-500">{vol.role}</div>
              </div>
              <div className={`w-2 h-2 rounded-full ${vol.status === 'ACTIVE' ? 'bg-accent animate-pulse' : vol.status === 'DEPLOYED' ? 'bg-warning' : 'bg-slate-600'}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AITab() {
  const { addTranslation } = useStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedLang, setSelectedLang] = useState('en');

  const LANGS = [
    { code: 'en', flag: '🇺🇸' }, { code: 'ar', flag: '🇸🇦' }, { code: 'ary', flag: '🇲🇦' },
    { code: 'es', flag: '🇪🇸' }, { code: 'fr', flag: '🇫🇷' }, { code: 'zh', flag: '🇨🇳' },
  ];

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const text = input;
    setInput('');
    setLoading(true);
    try {
      const result = await translationService.analyzeMessage(text);
      setResults((prev) => [result, ...prev]);
      addTranslation(result);
      if (result.urgency === 'CRITICAL' || result.medicalAlert) {
        toast.error('🚨 CRITICAL ALERT — Medical team notified!', { duration: 5000 });
      }
    } finally { setLoading(false); }
  };

  const handleVoice = async () => {
    setVoiceActive(true);
    await new Promise((r) => setTimeout(r, 1500));
    const sample = translationService.simulateVoiceInput(selectedLang);
    setInput(sample);
    setVoiceActive(false);
    toast.success('Voice captured!', { icon: '🎙️' });
  };

  return (
    <div className="space-y-3 pb-20">
      <div className="mobile-card">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
            <Zap size={14} className="text-accent" />
          </div>
          <span className="font-bold text-white">AI Fan Assistant</span>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs text-accent">Gemini AI</span>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex gap-1 mb-3">
          {LANGS.map((lang) => (
            <button key={lang.code} onClick={() => setSelectedLang(lang.code)}
              className={`flex-1 py-1.5 rounded-lg text-base transition-all ${selectedLang === lang.code ? 'bg-accent/20 border border-accent/40' : 'border border-white/5'}`}>
              {lang.flag}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <button onClick={handleVoice} disabled={voiceActive}
            className={`p-3 rounded-xl border transition-all flex-shrink-0 ${voiceActive ? 'bg-danger/20 border-danger/40 text-danger' : 'border-white/10 text-slate-400'}`}>
            <Mic size={18} className={voiceActive ? 'animate-pulse' : ''} />
          </button>
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type fan message in any language..."
            className="input-field flex-1 text-sm" dir={['ar', 'ary'].includes(selectedLang) ? 'rtl' : 'ltr'} />
          <button onClick={handleSend} disabled={!input.trim() || loading}
            className="p-3 rounded-xl bg-accent text-primary font-bold transition-all hover:bg-accent-300 active:scale-95 flex-shrink-0">
            {loading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {loading && (
          <div className="mobile-card text-center py-6">
            <Zap size={24} className="text-accent mx-auto mb-2 animate-pulse" />
            <div className="text-sm text-accent font-semibold">Analyzing...</div>
          </div>
        )}
        {results.map((r) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`mobile-card ${r.medicalAlert ? 'border-danger/40' : r.securityAlert ? 'border-warning/40' : 'border-white/10'}`}>
            <div className="flex items-center gap-2 mb-2">
              {r.medicalAlert && <Heart size={14} className="text-danger animate-pulse" />}
              {r.securityAlert && <AlertTriangle size={14} className="text-warning animate-pulse" />}
              <span className={`text-xs font-bold ${r.urgency === 'CRITICAL' ? 'text-danger' : r.urgency === 'HIGH' ? 'text-warning' : 'text-accent'}`}>{r.urgency}</span>
              <span className="text-xs text-slate-500 ml-auto">{r.detectedLanguageLabel}</span>
            </div>
            <div className="text-xs text-slate-400 italic mb-2">"{r.input}"</div>
            <div className="text-sm text-white leading-relaxed">{r.response}</div>
          </motion.div>
        ))}
        {results.length === 0 && !loading && (
          <div className="mobile-card text-center py-8 text-slate-500">
            <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
            <div className="text-sm">Ask a fan question or tap voice</div>
          </div>
        )}
      </div>
    </div>
  );
}

function AlertsTab({ notifications }) {
  return (
    <div className="space-y-3 pb-20">
      <div className="text-xs text-slate-500 px-1">{notifications.length} notifications</div>
      {notifications.slice(0, 15).map((n) => (
        <motion.div key={n.id} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          className={`mobile-card ${!n.read ? 'border-l-4 border-l-accent' : 'opacity-70'}`}>
          <div className="flex justify-between items-start">
            <div className={`text-sm font-bold ${n.priority === 'CRITICAL' ? 'text-danger' : n.priority === 'HIGH' ? 'text-warning' : 'text-white'}`}>{n.title}</div>
            <span className="text-xs text-slate-500">{Math.floor((Date.now() - new Date(n.timestamp)) / 60000)}m ago</span>
          </div>
          <p className="text-sm text-slate-400 mt-1 leading-relaxed">{n.message}</p>
        </motion.div>
      ))}
    </div>
  );
}

function ProfileTab() {
  return (
    <div className="space-y-4 pb-20">
      <div className="mobile-card text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/40 to-info/40 flex items-center justify-center mx-auto mb-3 text-3xl font-bold text-white border-4 border-accent/30">
          {MY_VOLUNTEER.name.split(' ').map((n) => n[0]).join('')}
        </div>
        <h2 className="text-xl font-bold text-white">{MY_VOLUNTEER.name}</h2>
        <p className="text-slate-400 text-sm">{MY_VOLUNTEER.role}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          <span className="text-white font-bold">{MY_VOLUNTEER.rating}</span>
          <span className="text-slate-500">· Gate {MY_VOLUNTEER.assignedGate} · {MY_VOLUNTEER.sector}</span>
        </div>
      </div>
      <div className="mobile-card">
        <div className="label-text mb-3">Languages</div>
        <div className="flex flex-wrap gap-2">
          {MY_VOLUNTEER.languages.map((lang) => (
            <span key={lang} className="px-3 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium">{lang}</span>
          ))}
        </div>
      </div>
      <div className="mobile-card">
        <div className="label-text mb-3">Skills & Certifications</div>
        <div className="space-y-2">
          {MY_VOLUNTEER.skills.map((skill) => (
            <div key={skill} className="flex items-center gap-2 text-sm text-slate-300">
              <CheckCircle size={14} className="text-accent flex-shrink-0" />
              {skill}
            </div>
          ))}
        </div>
      </div>
      <div className="mobile-card">
        <div className="label-text mb-3">Shift Info</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            { label: 'Start', value: MY_VOLUNTEER.shiftStart },
            { label: 'End', value: MY_VOLUNTEER.shiftEnd },
            { label: 'Sector', value: MY_VOLUNTEER.sector },
            { label: 'Gate', value: MY_VOLUNTEER.assignedGate },
          ].map((item) => (
            <div key={item.label} className="bg-primary/40 rounded-lg p-2.5">
              <div className="text-slate-500 text-xs">{item.label}</div>
              <div className="text-white font-bold">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function VolunteerCopilot() {
  const [activeTab, setActiveTab] = useState('home');
  const { incidents, notifications, volunteers } = useStore();

  const tabContent = {
    home: <HomeTab incidents={incidents} volunteers={volunteers} />,
    map: (
      <div className="pb-20 h-[60vh] flex flex-col items-center justify-center mobile-card m-4">
        <Map size={40} className="text-slate-600 mb-3" />
        <div className="text-slate-400 text-sm font-medium">Interactive Map</div>
        <div className="text-slate-600 text-xs mt-1 text-center">GPS navigation available when deployed</div>
        <div className="mt-4 text-xs text-accent">Gate A — North Sector</div>
        <div className="mt-2 w-40 h-40 rounded-full border-2 border-accent/30 flex items-center justify-center relative">
          <div className="w-3 h-3 rounded-full bg-accent animate-ping absolute" />
          <div className="w-3 h-3 rounded-full bg-accent" />
        </div>
      </div>
    ),
    ai: <AITab />,
    alerts: <AlertsTab notifications={notifications} />,
    profile: <ProfileTab />,
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-primary flex items-start justify-center">
      <div className="w-full max-w-sm min-h-screen flex flex-col relative bg-primary">
        {/* Status bar */}
        <StatusBar />

        {/* Header */}
        <div className="mobile-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
                <Zap size={14} className="text-accent" />
              </div>
              <div>
                <div className="font-display font-bold text-white text-sm">PULSEGRID</div>
                <div className="text-accent text-xs">Volunteer Co-Pilot</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <div className="w-5 h-5 rounded-full bg-danger flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{unread}</span>
                </div>
              )}
              <div className="px-2 py-1 rounded-lg bg-accent/20 border border-accent/30">
                <span className="text-xs text-accent font-semibold">Gate A</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {tabContent[activeTab]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Tab Bar */}
        <TabBar active={activeTab} onChange={setActiveTab} />
      </div>
    </div>
  );
}
