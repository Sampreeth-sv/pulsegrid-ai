import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Zap, Monitor, Smartphone, Eye, ChevronRight, Activity, Users, Brain, Globe, Shield, BarChart3, Star } from 'lucide-react';

// ─── Particle Canvas ──────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,229,168,${(1 - dist / 150) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,229,168,${p.alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

// ─── Radar Animation ──────────────────────────────────────────────
function RadarPing() {
  return (
    <div className="absolute bottom-16 right-16 w-40 h-40 opacity-20 hidden lg:block pointer-events-none">
      <div className="w-full h-full rounded-full border border-accent/40 flex items-center justify-center relative">
        <div className="w-3/4 h-3/4 rounded-full border border-accent/30 flex items-center justify-center">
          <div className="w-1/2 h-1/2 rounded-full border border-accent/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-accent" />
          </div>
        </div>
        {/* Sweeping line */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{ background: 'conic-gradient(from 0deg, rgba(0,229,168,0.2), transparent 30%)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        {/* Ping dots */}
        {[{ top: '20%', left: '60%' }, { top: '55%', left: '30%' }, { top: '70%', left: '65%' }].map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-accent"
            style={pos}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.7 }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Animated Stadium Silhouette ──────────────────────────────────
function StadiumSilhouette() {
  return (
    <div className="absolute left-8 top-1/2 -translate-y-1/2 opacity-10 hidden xl:block pointer-events-none">
      <svg width="200" height="160" viewBox="0 0 200 160">
        {/* Stadium outline */}
        <ellipse cx="100" cy="80" rx="90" ry="55" fill="none" stroke="#00E5A8" strokeWidth="1.5" />
        <ellipse cx="100" cy="80" rx="60" ry="36" fill="rgba(0,229,168,0.05)" stroke="#00E5A8" strokeWidth="0.5" />
        {/* Seating tiers */}
        {[80, 68, 56].map((ry, i) => (
          <ellipse key={i} cx="100" cy="80" rx={88 - i * 12} ry={ry - i * 8}
            fill="none" stroke="#00E5A8" strokeWidth="0.3" strokeDasharray="4 3" />
        ))}
        {/* Gate markers */}
        {[
          { cx: 100, cy: 25 }, { cx: 190, cy: 80 },
          { cx: 100, cy: 135 }, { cx: 10, cy: 80 }
        ].map((pos, i) => (
          <motion.circle key={i} cx={pos.cx} cy={pos.cy} r="4" fill="#00E5A8"
            animate={{ opacity: [0.3, 1, 0.3], r: [3, 5, 3] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
        {/* Scan line */}
        <motion.line x1="0" y1="80" x2="200" y2="80" stroke="#00E5A8" strokeWidth="0.5" opacity="0.5"
          animate={{ y1: [0, 160, 0], y2: [0, 160, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      </svg>
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────
function FeatureCard({ icon: Icon, label, desc, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -5, scale: 1.03 }}
      className="glass-card p-4 text-center group cursor-default relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
        style={{ background: `radial-gradient(ellipse at center, ${color}12, transparent 70%)` }} />
      <div className="w-11 h-11 rounded-2xl mx-auto mb-3 flex items-center justify-center border transition-all group-hover:scale-110 duration-300"
        style={{ backgroundColor: `${color}18`, borderColor: `${color}35` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div className="text-sm font-bold text-white mb-1 group-hover:text-accent transition-colors">{label}</div>
      <div className="text-xs text-slate-500 leading-relaxed">{desc}</div>
    </motion.div>
  );
}

// ─── Mode Card ────────────────────────────────────────────────────
function ModeCard({ mode, onSelect, index }) {
  const Icon = mode.icon;
  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(mode.id)}
      className="glass-card p-6 text-left group cursor-pointer relative overflow-hidden w-full"
    >
      {/* Animated glow */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 70% 30%, ${mode.color}15, transparent 60%)` }}
      />
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${mode.color}, transparent)` }} />

      <div className="flex items-start justify-between mb-5">
        <div className="w-13 h-13 rounded-2xl flex items-center justify-center border-2 transition-all group-hover:scale-110 duration-300"
          style={{ backgroundColor: `${mode.color}18`, borderColor: `${mode.color}45`, width: '52px', height: '52px' }}>
          <Icon size={26} style={{ color: mode.color }} />
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full border"
          style={{ backgroundColor: `${mode.color}18`, borderColor: `${mode.color}40`, color: mode.color }}>
          {mode.badge}
        </span>
      </div>

      <h3 className="font-display text-xl font-bold text-white mb-0.5 group-hover:text-white transition-colors">{mode.title}</h3>
      <p className="text-sm font-semibold mb-3" style={{ color: mode.color }}>{mode.subtitle}</p>
      <p className="text-sm text-slate-400 leading-relaxed mb-5">{mode.desc}</p>

      <div className="flex items-center gap-2 font-semibold text-sm group-hover:gap-3 transition-all" style={{ color: mode.color }}>
        Launch Interface
        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.button>
  );
}

// ─── Live Stats Bar ───────────────────────────────────────────────
function LiveStatsBar() {
  const [stats, setStats] = useState({
    fans: 19120, incidents: 4, volunteers: 8, risk: 67
  });

  useEffect(() => {
    const t = setInterval(() => {
      setStats((s) => ({
        fans: Math.max(15000, s.fans + Math.round((Math.random() - 0.3) * 80)),
        incidents: Math.max(0, s.incidents + (Math.random() > 0.8 ? 1 : Math.random() > 0.9 ? -1 : 0)),
        volunteers: Math.max(5, s.volunteers + (Math.random() > 0.9 ? 1 : Math.random() > 0.9 ? -1 : 0)),
        risk: Math.max(20, Math.min(90, s.risk + Math.round((Math.random() - 0.5) * 4))),
      }));
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const items = [
    { label: 'Fans Inside', value: stats.fans.toLocaleString(), color: '#00E5A8', dot: true },
    { label: 'Active Incidents', value: stats.incidents, color: stats.incidents > 3 ? '#FF4D6D' : '#FFC857', dot: false },
    { label: 'Volunteers Active', value: `${stats.volunteers}/8`, color: '#56CCF2', dot: true },
    { label: 'AI Risk Score', value: `${stats.risk}/100`, color: stats.risk > 70 ? '#FF4D6D' : '#00E5A8', dot: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="flex flex-wrap justify-center gap-4 mb-10"
    >
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/3 border border-white/8 backdrop-blur-sm">
          {item.dot && (
            <span className="relative flex-shrink-0">
              <span className="absolute w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: item.color, opacity: 0.6 }} />
              <span className="relative w-2 h-2 rounded-full block" style={{ backgroundColor: item.color }} />
            </span>
          )}
          <span className="text-xs text-slate-400">{item.label}</span>
          <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
        </div>
      ))}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────
const FEATURES = [
  { icon: Brain, label: 'Explainable AI', desc: 'Real-time crowd risk forecasting with human-readable reasoning chains', color: '#7C4DFF' },
  { icon: Globe, label: 'Multilingual AI', desc: '10+ languages with real-time emotion & intent detection', color: '#00E5A8' },
  { icon: Activity, label: 'Live Simulation', desc: 'Full stadium tick-based simulation at configurable speeds', color: '#56CCF2' },
  { icon: Users, label: 'Volunteer AI', desc: 'Fatigue-aware smart deployment with proximity matching', color: '#FFC857' },
  { icon: Shield, label: 'Incident Engine', desc: 'Auto-generated scenarios with AI triage and response plans', color: '#FF4D6D' },
  { icon: BarChart3, label: 'Analytics', desc: 'Historical trends, gate performance, and predictive forecasts', color: '#FF6D00' },
  { icon: Star, label: 'Sustainability', desc: 'Live energy, water, carbon, and waste AI recommendations', color: '#4CAF50' },
  { icon: Eye, label: 'Jury Portal', desc: 'CSV/JSON ingestion with AI Error Guard and staged analysis', color: '#E91E63' },
];

const MODES = [
  {
    id: 'command', icon: Monitor, title: 'Command Center', subtitle: 'Desktop Operations',
    desc: 'Full-scale stadium operations dashboard for coordinators, security, and medical teams. Live AI-driven insights.',
    color: '#00E5A8', badge: 'DESKTOP',
  },
  {
    id: 'volunteer', icon: Smartphone, title: 'Volunteer Co-Pilot', subtitle: 'Mobile AI Assistant',
    desc: 'Conversational AI interface for volunteers with emergency tools, multilingual support, and live alerts.',
    color: '#56CCF2', badge: 'MOBILE',
  },
  {
    id: 'jury', icon: Eye, title: 'Jury Evaluation', subtitle: 'Testing & Validation Portal',
    desc: 'Upload stadium data and verify AI reactions in real-time. Full scenario simulator and live data inspector.',
    color: '#FFC857', badge: 'JUDGE',
  },
];

export default function LandingPage({ onSelectMode }) {
  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-start p-4 lg:p-8 relative overflow-hidden">
      {/* Particle network background */}
      <ParticleCanvas />

      {/* Gradient blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/6 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-info/5 blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-purple-500/4 blur-[60px] pointer-events-none" />

      {/* Map grid overlay */}
      <div className="absolute inset-0 map-grid opacity-20 pointer-events-none" />

      {/* Decorative elements */}
      <RadarPing />
      <StadiumSilhouette />

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="mb-6 mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/25 backdrop-blur-sm">
            <span className="relative flex">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <span className="text-xs font-semibold text-accent tracking-wider uppercase">FIFA World Cup 2026 — Live Command Platform</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-center mb-4">
          <h1 className="font-display text-5xl md:text-7xl font-black text-white leading-none tracking-tight mb-3">
            PULSE<span className="gradient-text">GRID</span>{' '}
            <span className="text-5xl md:text-6xl font-black text-white/30">AI™</span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            The Intelligent FIFA World Cup 2026 Stadium Operations & Volunteer Co-Pilot.<br className="hidden md:block" />
            Powered by Google Cloud AI, Vertex AI & Gemini.
          </p>
        </motion.div>

        {/* Tagline */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mb-8">
          <p className="text-center text-sm text-accent/80 font-medium italic tracking-wide">
            "One AI. Every Fan. Every Volunteer. Every Decision."
          </p>
        </motion.div>

        {/* Live Stats */}
        <LiveStatsBar />

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mb-10">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.label} {...f} delay={0.15 + i * 0.05} />
          ))}
        </div>

        {/* Mode Cards */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="w-full mb-6">
          <div className="text-center mb-4">
            <h2 className="font-display text-xl font-bold text-white">Choose Your Interface</h2>
            <p className="text-slate-500 text-sm mt-1">Select the role-based view to launch</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {MODES.map((mode, i) => (
              <ModeCard key={mode.id} mode={mode} onSelect={onSelectMode} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="text-center text-slate-700 text-xs pb-6">
          Built for PromptWars Challenge 4 &nbsp;•&nbsp; Powered by Google Cloud AI &nbsp;•&nbsp; FIFA World Cup 2026
        </motion.div>
      </div>
    </div>
  );
}
