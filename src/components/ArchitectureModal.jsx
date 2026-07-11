import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Map, Shield, Database, Cpu, Server, Brain, Sparkles, Mic, Globe, BarChart3, Activity, HardDrive } from 'lucide-react';
import useStore from '../context/store';
import { GOOGLE_CLOUD_SERVICES } from '../constants';

const iconMap = { Map, Shield, Database, Zap, Server, Brain, Sparkles, Mic, Globe, BarChart3, Activity, HardDrive };

const categoryColors = {
  Location: '#34a853',
  Auth: '#FFA000',
  Database: '#00BCD4',
  Compute: '#FF5722',
  'AI/ML': '#7C4DFF',
  Analytics: '#FF6D00',
  Operations: '#E91E63',
  Storage: '#795548',
};

const connections = [
  ['firebase', 'firestore'], ['maps', 'vertex'], ['vertex', 'gemini'],
  ['firestore', 'functions'], ['functions', 'cloudrun'], ['cloudrun', 'vertex'],
  ['gemini', 'speech'], ['gemini', 'translation'], ['bigquery', 'vertex'],
  ['functions', 'bigquery'], ['monitoring', 'functions'], ['storage', 'cloudrun'],
];

export default function ArchitectureModal() {
  const { architectureModalOpen, setArchitectureModalOpen } = useStore();

  const categories = [...new Set(GOOGLE_CLOUD_SERVICES.map((s) => s.category))];

  return (
    <AnimatePresence>
      {architectureModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            onClick={() => setArchitectureModalOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-primary-100 rounded-3xl border border-white/10 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between flex-shrink-0">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Cpu size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-white">Google Cloud Architecture</h2>
                    <p className="text-sm text-slate-400">PULSEGRID AI™ Infrastructure Overview</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setArchitectureModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Architecture diagram */}
              <div className="mb-8 p-5 rounded-2xl bg-secondary/30 border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 map-grid opacity-50" />
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5 relative">
                  Service Architecture
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 relative">
                  {GOOGLE_CLOUD_SERVICES.map((service, i) => {
                    const Icon = iconMap[service.icon] || Zap;
                    const catColor = categoryColors[service.category] || '#00E5A8';
                    return (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass-card p-3 hover:scale-105 transition-all duration-200 group"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${catColor}20`, border: `1px solid ${catColor}40` }}
                          >
                            <Icon size={15} style={{ color: catColor }} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white truncate">{service.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{service.description}</div>
                            <span
                              className="inline-block mt-1.5 text-xs px-1.5 py-0.5 rounded font-medium"
                              style={{ backgroundColor: `${catColor}20`, color: catColor }}
                            >
                              {service.category}
                            </span>
                          </div>
                        </div>
                        {/* Animated connection dots */}
                        <div className="mt-2 flex gap-0.5">
                          {[...Array(3)].map((_, j) => (
                            <motion.div
                              key={j}
                              className="h-0.5 flex-1 rounded-full"
                              style={{ backgroundColor: catColor }}
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1.5, delay: j * 0.3, repeat: Infinity }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Data Flow */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="glass-card p-4">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Activity size={15} className="text-accent" />
                    Real-Time Data Flow
                  </h3>
                  <div className="space-y-2">
                    {[
                      { from: 'IoT Sensors / Volunteers', to: 'Firestore', via: 'Firebase SDK' },
                      { from: 'Firestore', to: 'Cloud Functions', via: 'Trigger' },
                      { from: 'Cloud Functions', to: 'Vertex AI + Gemini', via: 'API Call' },
                      { from: 'Gemini', to: 'All Dashboards', via: 'WebSocket/SSE' },
                      { from: 'BigQuery', to: 'Analytics Dashboard', via: 'Query API' },
                    ].map((flow, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="text-white/70 font-medium">{flow.from}</span>
                        <motion.div
                          className="flex-1 flex items-center gap-1"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                        >
                          <div className="flex-1 border-t border-dashed border-accent/40" />
                          <span className="text-accent/70">{flow.via}</span>
                          <div className="flex-1 border-t border-dashed border-accent/40" />
                        </motion.div>
                        <span className="text-accent font-medium">{flow.to}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-4">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Sparkles size={15} className="text-accent" />
                    AI Module Routing
                  </h3>
                  <div className="space-y-2">
                    {[
                      { module: 'Crowd Intelligence XAI', service: 'Vertex AI + BigQuery', color: '#7C4DFF' },
                      { module: 'Multilingual Assistant', service: 'Gemini + Translation API', color: '#00E5A8' },
                      { module: 'Accessibility AI', service: 'Cloud Functions + Maps', color: '#56CCF2' },
                      { module: 'Transport Intelligence', service: 'Maps Platform + Vertex', color: '#34a853' },
                      { module: 'Volunteer Matching', service: 'Vertex AI + Firestore', color: '#FF5722' },
                      { module: 'Sustainability AI', service: 'BigQuery + Cloud Run', color: '#4CAF50' },
                    ].map((mod, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">{mod.module}</span>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: `${mod.color}20`, color: mod.color }}
                        >
                          {mod.service}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map((cat) => {
                  const services = GOOGLE_CLOUD_SERVICES.filter((s) => s.category === cat);
                  const color = categoryColors[cat] || '#00E5A8';
                  return (
                    <div key={cat} className="glass-card p-3">
                      <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color }}>
                        {cat}
                      </div>
                      <div className="space-y-1">
                        {services.map((s) => (
                          <div key={s.id} className="text-xs text-slate-400">{s.name}</div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
