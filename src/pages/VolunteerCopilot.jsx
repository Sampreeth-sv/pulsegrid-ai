import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Map, MessageSquare, Bell, User, AlertTriangle, Heart,
  Clock, Battery, Wifi, MapPin, Star, CheckCircle, Baby,
  Accessibility, Package, Mic, Phone, Zap, Activity, Users,
  ChevronRight, Send, Loader, Bot, UserCircle, ThumbsUp, ThumbsDown,
  Navigation, ArrowRight, Shield
} from 'lucide-react';
import useStore from '../context/store';
import translationService from '../services/translationService';
import toast from 'react-hot-toast';

const MY_VOLUNTEER = {
  id: 'V001', name: 'Amira Benali', role: 'Crowd Management',
  assignedGate: 'A', sector: 'North', languages: ['Arabic', 'French', 'English'],
  shiftStart: '16:00', shiftEnd: '22:00', rating: 4.8,
  skills: ['First Aid', 'Crowd Control', 'Translation'],
  avatar: 'AB',
};

// ─── AI Response Generator ────────────────────────────────────────
const AI_RESPONSES = {
  medical: {
    thinking: 'Assessing medical situation...',
    response: 'Nearest first-aid station is 180m at Section 110. Medical team already alerted. ETA: 2 minutes.',
    actions: ['Navigate to Patient', 'Call Medical Team', 'Mark as Handled'],
    eta: '2 min',
    priority: 'CRITICAL',
  },
  crowd: {
    thinking: 'Analyzing crowd flow patterns...',
    response: 'Gate D congestion at 87%. Recommend redirecting incoming fans through Gate C. Open auxiliary lanes.',
    actions: ['Redirect Fans', 'Open Gate C', 'Broadcast Guidance'],
    eta: '5 min',
    priority: 'HIGH',
  },
  lostchild: {
    thinking: 'Activating lost child protocol...',
    response: 'Lost child protocol LC-091 active. Family waiting at Gate C reunification point. CCTV tracking enabled.',
    actions: ['Go to Last Known Location', 'Contact Family', 'Alert Security'],
    eta: '8 min',
    priority: 'HIGH',
  },
  default: {
    thinking: 'Processing your request...',
    response: "Understood. I've logged your request and will coordinate with nearby volunteers and command center.",
    actions: ['Confirm', 'Escalate', 'Log Incident'],
    eta: '3 min',
    priority: 'NORMAL',
  },
};

function classifyMessage(text) {
  const lower = text.toLowerCase();
  if (lower.includes('medical') || lower.includes('sick') || lower.includes('hurt') || lower.includes('dizzin') || lower.includes('heart') || lower.includes('fall')) return 'medical';
  if (lower.includes('crowd') || lower.includes('congestion') || lower.includes('surge') || lower.includes('queue')) return 'crowd';
  if (lower.includes('lost') || lower.includes('child') || lower.includes('kid') || lower.includes('missing')) return 'lostchild';
  return 'default';
}

// ─── Message Bubble ───────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  const isSystem = msg.role === 'system';

  if (isSystem) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex justify-center">
        <span className="text-xs text-slate-600 bg-white/3 px-3 py-1 rounded-full border border-white/8">{msg.content}</span>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${isUser ? 'bg-accent/30 text-accent' : 'bg-info/20 text-info'}`}>
        {isUser ? MY_VOLUNTEER.avatar : <Bot size={14} />}
      </div>

      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {/* Bubble */}
        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-accent/20 text-white rounded-tr-sm border border-accent/25'
            : 'bg-secondary/60 text-slate-200 rounded-tl-sm border border-white/10'
        }`}>
          {msg.content}
        </div>

        {/* AI Actions */}
        {!isUser && msg.actions && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-1.5 mt-1">
            {msg.actions.map((action) => (
              <motion.button key={action} whileTap={{ scale: 0.95 }}
                onClick={() => toast.success(`${action} confirmed!`)}
                className="text-xs px-3 py-1.5 rounded-xl bg-accent/15 border border-accent/30 text-accent hover:bg-accent/25 transition-all font-medium">
                {action}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Meta info */}
        {!isUser && msg.eta && (
          <div className={`flex items-center gap-3 text-xs ${msg.priority === 'CRITICAL' ? 'text-danger' : msg.priority === 'HIGH' ? 'text-warning' : 'text-slate-500'}`}>
            <span className="flex items-center gap-1">
              <Clock size={10} /> ETA: {msg.eta}
            </span>
            {msg.priority && msg.priority !== 'NORMAL' && (
              <span className={`px-1.5 py-0.5 rounded font-bold ${msg.priority === 'CRITICAL' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'}`}>
                {msg.priority}
              </span>
            )}
          </div>
        )}

        <span className="text-xs text-slate-600">{new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </motion.div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────
function TypingIndicator({ label }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="flex gap-2.5">
      <div className="w-7 h-7 rounded-full bg-info/20 flex items-center justify-center flex-shrink-0">
        <Bot size={14} className="text-info" />
      </div>
      <div className="bg-secondary/60 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
        <span className="text-xs text-slate-400">{label}</span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-accent"
              animate={{ scale: [0.6, 1.2, 0.6], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── AI Chat Tab ──────────────────────────────────────────────────
function AITab() {
  const { addTranslation } = useStore();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome', role: 'ai', time: Date.now(),
      content: "Hello Amira! I'm your PULSEGRID AI Co-Pilot. How can I assist you right now? You can report incidents, ask for guidance, or translate fan messages.",
      actions: ['Report Incident', 'Fan Translation', 'Request Support'],
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingLabel, setThinkingLabel] = useState('');
  const [voiceActive, setVoiceActive] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const LANGS = [
    { code: 'en', flag: '🇺🇸', label: 'EN' },
    { code: 'ar', flag: '🇸🇦', label: 'AR' },
    { code: 'ary', flag: '🇲🇦', label: 'ARY' },
    { code: 'es', flag: '🇪🇸', label: 'ES' },
    { code: 'fr', flag: '🇫🇷', label: 'FR' },
    { code: 'zh', flag: '🇨🇳', label: 'ZH' },
  ];

  const sendMessage = async (text) => {
    if (!text.trim() || isThinking) return;
    const userMsg = { id: `u-${Date.now()}`, role: 'user', time: Date.now(), content: text };
    setMessages((m) => [...m, userMsg]);
    setInput('');

    const category = classifyMessage(text);
    const resp = AI_RESPONSES[category];
    setIsThinking(true);
    setThinkingLabel(resp.thinking);

    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

    // Also try translation if fan message
    if (selectedLang !== 'en' || text.match(/[\u0600-\u06FF\u4e00-\u9fff]/)) {
      try {
        const result = await translationService.analyzeMessage(text);
        addTranslation(result);
        if (result.medicalAlert) toast.error('🚨 Medical alert escalated to command!', { duration: 5000 });
      } catch { /* silent */ }
    }

    setIsThinking(false);
    const aiMsg = {
      id: `ai-${Date.now()}`, role: 'ai', time: Date.now(),
      content: resp.response,
      actions: resp.actions,
      eta: resp.eta,
      priority: resp.priority,
    };
    setMessages((m) => [...m, aiMsg]);
  };

  const handleVoice = async () => {
    setVoiceActive(true);
    await new Promise((r) => setTimeout(r, 1500));
    const samples = {
      en: "There's a fan who seems to be having chest pain near section B.",
      ar: "هناك حشد كبير عند البوابة د",
      ary: "كاين واحد مريض عند باب ب",
      es: "Hay una multitud grande en la puerta C",
      fr: "Il y a un enfant perdu près du kiosque alimentaire",
      zh: "我的孩子不见了，他穿着蓝色的球衣",
    };
    setInput(samples[selectedLang] || samples.en);
    setVoiceActive(false);
    toast.success('Voice captured!', { icon: '🎙️', duration: 2000 });
  };

  const QUICK_PROMPTS = [
    { label: '🚨 Medical', text: 'A fan near Gate B is showing signs of heat stroke' },
    { label: '👶 Lost Child', text: 'There is a lost child near the food court' },
    { label: '👥 Crowd', text: 'Gate D queue is growing dangerously large' },
    { label: '🔄 Translate', text: 'جدي فجأة حس بدوخة كبيرة' },
  ];

  return (
    <div className="flex flex-col h-full pb-20">
      {/* Header */}
      <div className="mobile-card mb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
              <Bot size={16} className="text-accent" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">AI Co-Pilot</div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse inline-block" />
                Powered by Gemini
              </div>
            </div>
          </div>
          {/* Language selector */}
          <div className="flex gap-0.5">
            {LANGS.map((lang) => (
              <button key={lang.code} onClick={() => setSelectedLang(lang.code)}
                className={`px-1.5 py-1 rounded-lg text-xs transition-all ${selectedLang === lang.code ? 'bg-accent/20 border border-accent/40 text-accent' : 'text-slate-500 hover:text-slate-300'}`}>
                {lang.flag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick prompts */}
      <div className="flex gap-1.5 mb-3 flex-shrink-0 overflow-x-auto no-scrollbar pb-1">
        {QUICK_PROMPTS.map((p) => (
          <button key={p.label} onClick={() => sendMessage(p.text)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-secondary/50 border border-white/10 text-slate-300 hover:border-accent/30 hover:text-accent transition-all whitespace-nowrap">
            {p.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 mb-3 min-h-0">
        {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
        <AnimatePresence>
          {isThinking && <TypingIndicator label={thinkingLabel} />}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 flex-shrink-0">
        <motion.button onClick={handleVoice} disabled={voiceActive} whileTap={{ scale: 0.9 }}
          className={`p-3 rounded-xl border transition-all flex-shrink-0 ${voiceActive ? 'bg-danger/20 border-danger/40 text-danger' : 'border-white/10 text-slate-400 hover:border-accent/30 hover:text-accent'}`}>
          <Mic size={18} className={voiceActive ? 'animate-pulse' : ''} />
        </motion.button>
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          placeholder="Type a message or report an incident..."
          className="input-field flex-1 text-sm"
          dir={['ar', 'ary'].includes(selectedLang) ? 'rtl' : 'ltr'} />
        <motion.button onClick={() => sendMessage(input)} disabled={!input.trim() || isThinking}
          whileTap={{ scale: 0.9 }}
          className="p-3 rounded-xl bg-accent text-primary font-bold transition-all hover:bg-accent/90 active:scale-95 flex-shrink-0 disabled:opacity-40">
          {isThinking ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
        </motion.button>
      </div>
    </div>
  );
}

// ─── Home Tab ─────────────────────────────────────────────────────
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
  const nearbyVols = volunteers
    .filter((v) => v.assignedGate === MY_VOLUNTEER.assignedGate && v.id !== MY_VOLUNTEER.id)
    .slice(0, 3);

  const quickActions = [
    { icon: Heart, label: 'Medical', color: '#FF4D6D', action: () => toast.error('🚨 Medical SOS sent!', { duration: 4000 }) },
    { icon: Baby, label: 'Lost Child', color: '#FFC857', action: () => toast('🧒 Lost child protocol initiated') },
    { icon: Accessibility, label: 'Assist', color: '#56CCF2', action: () => toast.success('♿ Accessibility team notified') },
    { icon: Package, label: 'Equipment', color: '#00E5A8', action: () => toast.success('📦 Equipment request submitted') },
    { icon: AlertTriangle, label: 'Incident', color: '#FFC857', action: () => toast('⚠️ Incident reported to command') },
    { icon: Phone, label: 'Emergency', color: '#FF4D6D', action: () => toast.error('📞 Connecting to emergency line...') },
  ];

  return (
    <div className="space-y-3 pb-20">
      {/* Assignment Card */}
      <div className="mobile-card border-l-4 border-l-accent">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-semibold text-accent">ACTIVE SHIFT</span>
          </div>
          <div className="font-mono text-sm text-white font-bold tracking-wider">
            {String(hours).padStart(2, '0')}:{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
        </div>
        <div className="text-base font-bold text-white">{MY_VOLUNTEER.role}</div>
        <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
          <MapPin size={13} className="text-accent" />
          <span>Gate {MY_VOLUNTEER.assignedGate} — {MY_VOLUNTEER.sector} Sector</span>
        </div>
        <div className="mt-3 p-3 bg-primary/50 rounded-xl border border-white/5">
          <div className="text-xs text-slate-500 mb-1">Current Assignment</div>
          <div className="text-sm text-white font-medium">Gate A Queue Management — Zone 2</div>
          <div className="flex items-center gap-1 mt-1.5">
            <Activity size={11} className="text-accent" />
            <span className="text-xs text-accent">Active deployment</span>
          </div>
        </div>
      </div>

      {/* Shift Progress */}
      <div className="mobile-card">
        <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Shift Progress</div>
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>{MY_VOLUNTEER.shiftStart}</span>
          <span>{Math.round((shiftSeconds / 21600) * 100)}% complete</span>
          <span>{MY_VOLUNTEER.shiftEnd}</span>
        </div>
        <div className="h-2 bg-primary rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-accent to-info"
            animate={{ width: `${Math.min((shiftSeconds / 21600) * 100, 100)}%` }}
            transition={{ duration: 0.5 }} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mobile-card">
        <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-3">Quick Actions</div>
        <div className="grid grid-cols-3 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.button key={action.label} whileTap={{ scale: 0.9 }} onClick={action.action}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-white/8 hover:border-white/20 transition-all bg-primary/40 active:scale-95">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${action.color}18` }}>
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
        <div className="mobile-card border border-danger/20">
          <div className="text-xs text-danger font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-danger animate-ping" />
            Nearby Active Incidents
          </div>
          <div className="space-y-2">
            {nearbyIncidents.map((inc) => (
              <motion.div key={inc.id} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-primary/40 border border-danger/15">
                <AlertTriangle size={14} className="text-danger flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{inc.title}</div>
                  <div className="text-xs text-slate-500">{inc.location}</div>
                </div>
                <span className={`text-xs font-bold flex-shrink-0 ${inc.severity === 'CRITICAL' ? 'text-danger' : 'text-warning'}`}>
                  {inc.severity}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Nearby Volunteers */}
      {nearbyVols.length > 0 && (
        <div className="mobile-card">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Nearby Team</div>
          <div className="space-y-2">
            {nearbyVols.map((vol) => (
              <div key={vol.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-primary/40 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-info/30 flex items-center justify-center text-xs font-bold text-white">
                  {vol.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-white">{vol.name}</div>
                  <div className="text-xs text-slate-500">{vol.role}</div>
                </div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${vol.status === 'ACTIVE' ? 'bg-accent animate-pulse' : vol.status === 'DEPLOYED' ? 'bg-warning' : 'bg-slate-600'}`} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Alerts Tab ───────────────────────────────────────────────────
function AlertsTab({ notifications }) {
  return (
    <div className="space-y-2 pb-20">
      <div className="text-xs text-slate-500 mb-2">{notifications.length} notifications</div>
      <AnimatePresence>
        {notifications.slice(0, 20).map((n, i) => (
          <motion.div key={n.id} initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className={`mobile-card ${!n.read ? 'border-l-4 border-l-accent' : 'opacity-60'}`}>
            <div className="flex justify-between items-start">
              <div className={`text-xs font-bold ${n.priority === 'CRITICAL' ? 'text-danger' : n.priority === 'HIGH' ? 'text-warning' : 'text-white'}`}>
                {n.title}
              </div>
              <span className="text-xs text-slate-600 ml-2 flex-shrink-0">
                {Math.floor((Date.now() - new Date(n.timestamp)) / 60000)}m ago
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
      {notifications.length === 0 && (
        <div className="text-center py-12 text-slate-600 text-sm">No notifications yet</div>
      )}
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────
function ProfileTab() {
  const fatigue = 32;
  return (
    <div className="space-y-3 pb-20">
      <div className="mobile-card text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/40 to-info/40 flex items-center justify-center mx-auto mb-3 text-3xl font-bold text-white border-4 border-accent/30">
          {MY_VOLUNTEER.avatar}
        </div>
        <h2 className="text-lg font-bold text-white">{MY_VOLUNTEER.name}</h2>
        <p className="text-slate-400 text-xs">{MY_VOLUNTEER.role}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Star size={13} className="text-yellow-400 fill-yellow-400" />
          <span className="text-white font-bold text-sm">{MY_VOLUNTEER.rating}</span>
          <span className="text-slate-600 text-xs">· Gate {MY_VOLUNTEER.assignedGate} · {MY_VOLUNTEER.sector}</span>
        </div>
      </div>

      <div className="mobile-card">
        <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Fatigue Level</div>
        <div className="h-2.5 bg-primary rounded-full overflow-hidden mb-1">
          <motion.div className={`h-full rounded-full ${fatigue > 70 ? 'bg-danger' : fatigue > 50 ? 'bg-warning' : 'bg-accent'}`}
            initial={{ width: 0 }} animate={{ width: `${fatigue}%` }} transition={{ duration: 0.8 }} />
        </div>
        <div className="text-xs text-slate-500">{fatigue}% — {fatigue < 40 ? 'Fresh & Ready' : fatigue < 70 ? 'Moderate' : 'Rest Recommended'}</div>
      </div>

      <div className="mobile-card">
        <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Languages</div>
        <div className="flex flex-wrap gap-2">
          {MY_VOLUNTEER.languages.map((lang) => (
            <span key={lang} className="px-3 py-1.5 rounded-full bg-accent/15 text-accent text-xs font-medium border border-accent/25">{lang}</span>
          ))}
        </div>
      </div>

      <div className="mobile-card">
        <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Skills & Certifications</div>
        <div className="space-y-2">
          {MY_VOLUNTEER.skills.map((skill) => (
            <div key={skill} className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle size={12} className="text-accent flex-shrink-0" />
              {skill}
            </div>
          ))}
        </div>
      </div>

      <div className="mobile-card">
        <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Shift Info</div>
        <div className="grid grid-cols-2 gap-2">
          {[['Start', MY_VOLUNTEER.shiftStart], ['End', MY_VOLUNTEER.shiftEnd], ['Sector', MY_VOLUNTEER.sector], ['Gate', MY_VOLUNTEER.assignedGate]].map(([label, val]) => (
            <div key={label} className="bg-primary/40 rounded-xl p-2.5">
              <div className="text-slate-500 text-xs">{label}</div>
              <div className="text-white font-bold text-sm">{val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Status Bar ───────────────────────────────────────────────────
function StatusBar() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <div className="flex justify-between items-center px-4 pt-2 pb-1 text-xs text-slate-500">
      <span className="font-medium">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      <div className="flex items-center gap-2">
        <Wifi size={11} className="text-accent" />
        <Battery size={11} className="text-accent" />
        <span>87%</span>
      </div>
    </div>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────────
function TabBar({ active, onChange, unread }) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'map', icon: Map, label: 'Map' },
    { id: 'ai', icon: MessageSquare, label: 'AI' },
    { id: 'alerts', icon: Bell, label: 'Alerts', badge: unread },
    { id: 'profile', icon: User, label: 'Me' },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto bg-primary-100/95 backdrop-blur-md border-t border-white/8 flex justify-around items-center px-2 py-2 z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${active === tab.id ? 'text-accent' : 'text-slate-600 hover:text-slate-400'}`}>
            <div className="relative">
              <Icon size={active === tab.id ? 22 : 20} />
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-danger text-white text-xs flex items-center justify-center font-bold" style={{ fontSize: '8px' }}>
                  {tab.badge > 9 ? '9+' : tab.badge}
                </span>
              )}
            </div>
            <span className="text-xs">{tab.label}</span>
            {active === tab.id && <motion.div layoutId="tab-indicator" className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-accent" />}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function VolunteerCopilot() {
  const [activeTab, setActiveTab] = useState('home');
  const { incidents, notifications, volunteers } = useStore();
  const unread = notifications.filter((n) => !n.read).length;

  const tabContent = {
    home: <HomeTab incidents={incidents} volunteers={volunteers} />,
    map: (
      <div className="pb-20 flex flex-col items-center justify-center py-8 mobile-card m-0">
        <div className="relative w-48 h-48 mb-4">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} className="absolute inset-0 rounded-full border border-accent/20"
              animate={{ scale: [1, 1 + i * 0.3, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 1 }} />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-3 h-3">
              <div className="absolute inset-0 rounded-full bg-accent animate-ping" />
              <div className="relative w-3 h-3 rounded-full bg-accent" />
            </div>
          </div>
        </div>
        <div className="text-white font-bold mb-1">Gate A — North Sector</div>
        <div className="text-slate-500 text-xs text-center">MetLife Stadium, East Rutherford, NJ</div>
        <div className="text-xs text-accent mt-3 flex items-center gap-1">
          <Navigation size={12} /> GPS Active
        </div>
      </div>
    ),
    ai: <AITab />,
    alerts: <AlertsTab notifications={notifications} />,
    profile: <ProfileTab />,
  };

  return (
    <div className="min-h-screen bg-primary flex items-start justify-center">
      <div className="w-full max-w-sm min-h-screen flex flex-col relative bg-primary">
        <StatusBar />

        {/* Header */}
        <div className="mobile-header flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
                <Zap size={14} className="text-accent" />
              </div>
              <div>
                <div className="font-display font-bold text-white text-xs">PULSEGRID</div>
                <div className="text-accent text-xs leading-none">Volunteer Co-Pilot</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <div className="w-5 h-5 rounded-full bg-danger flex items-center justify-center">
                  <span className="text-white text-xs font-bold" style={{ fontSize: '9px' }}>{unread}</span>
                </div>
              )}
              <div className="px-2 py-1 rounded-lg bg-accent/15 border border-accent/25">
                <span className="text-xs text-accent font-semibold">Gate A</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className={`flex-1 overflow-y-auto p-3 ${activeTab === 'ai' ? 'flex flex-col' : ''}`} style={activeTab === 'ai' ? { minHeight: 0 } : {}}>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
              className={activeTab === 'ai' ? 'flex-1 flex flex-col min-h-0 h-full' : ''}>
              {tabContent[activeTab]}
            </motion.div>
          </AnimatePresence>
        </div>

        <TabBar active={activeTab} onChange={setActiveTab} unread={unread} />
      </div>
    </div>
  );
}
