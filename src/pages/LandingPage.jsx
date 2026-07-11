import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Monitor, Smartphone, Eye, ChevronRight, Activity, Users, Brain, Globe } from 'lucide-react';

const FEATURES = [
  { icon: Brain, label: 'Explainable AI', desc: 'Real-time crowd intelligence with human-readable reasoning chains', color: '#7C4DFF' },
  { icon: Globe, label: 'Multilingual AI', desc: 'Context-aware translation for 10+ languages with emotion detection', color: '#00E5A8' },
  { icon: Activity, label: 'Live Simulation', desc: 'Full stadium simulation with adjustable speed and scenario triggers', color: '#56CCF2' },
  { icon: Users, label: 'Volunteer AI', desc: 'Smart deployment recommendations based on skills, fatigue & proximity', color: '#FFC857' },
];

const MODES = [
  {
    id: 'command',
    icon: Monitor,
    title: 'Command Center',
    subtitle: 'Desktop Operations',
    desc: 'Full-scale stadium operations dashboard for coordinators, security, and medical teams',
    color: '#00E5A8',
    badge: 'DESKTOP',
  },
  {
    id: 'volunteer',
    icon: Smartphone,
    title: 'Volunteer Co-Pilot',
    subtitle: 'Mobile Interface',
    desc: 'Smartphone-optimized interface for volunteers with AI assistant and emergency tools',
    color: '#56CCF2',
    badge: 'MOBILE',
  },
  {
    id: 'jury',
    icon: Eye,
    title: 'Jury Evaluation',
    subtitle: 'Testing Portal',
    desc: 'Upload CSV/JSON data and verify AI reactions. Includes scenario generator and data inspector',
    color: '#FFC857',
    badge: 'JUDGE',
  },
];

export default function LandingPage({ onSelectMode }) {
  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-info/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 map-grid opacity-30" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        {/* Logo & Title */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center border-2 border-accent/40">
                <Zap size={28} className="text-accent" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent border-2 border-primary animate-ping" />
            </div>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-black text-white mb-3">
            PULSEGRID <span className="gradient-text">AI™</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl mb-2">The Intelligent FIFA World Cup 2026 Stadium Operations & Volunteer Co-Pilot</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-accent text-sm font-semibold italic">"One AI. Every Fan. Every Volunteer. Every Decision."</span>
          </div>
        </motion.div>

        {/* Feature pills */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
                className="glass-card p-4 text-center">
                <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `${f.color}20` }}>
                  <Icon size={18} style={{ color: f.color }} />
                </div>
                <div className="text-sm font-bold text-white mb-1">{f.label}</div>
                <div className="text-xs text-slate-500 leading-relaxed">{f.desc}</div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Mode selector */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="grid md:grid-cols-3 gap-4">
          {MODES.map((mode, i) => {
            const Icon = mode.icon;
            return (
              <motion.button key={mode.id} whileHover={{ y: -6, scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => onSelectMode(mode.id)}
                className="glass-card p-6 text-left group cursor-pointer relative overflow-hidden"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                  style={{ backgroundImage: `radial-gradient(circle at top right, ${mode.color}, transparent)` }} />
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center border" style={{ backgroundColor: `${mode.color}20`, borderColor: `${mode.color}40` }}>
                    <Icon size={24} style={{ color: mode.color }} />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${mode.color}20`, color: mode.color }}>
                    {mode.badge}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-0.5">{mode.title}</h3>
                <p className="text-sm font-medium mb-3" style={{ color: mode.color }}>{mode.subtitle}</p>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{mode.desc}</p>
                <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: mode.color }}>
                  Launch Interface <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-center mt-10 text-slate-600 text-xs">
          Built for PromptWars Challenge 4 • Powered by Google Cloud AI • FIFA World Cup 2026
        </motion.div>
      </div>
    </div>
  );
}
