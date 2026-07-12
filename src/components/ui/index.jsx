import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ─── Animated Number ─────────────────────────────────────────────
export function AnimatedNumber({ value, duration = 800, decimals = 0, prefix = '', suffix = '', className = '' }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  const frame = useRef(null);

  useEffect(() => {
    const start = prev.current;
    const end = value;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setDisplay(current);
      if (progress < 1) frame.current = requestAnimationFrame(tick);
      else prev.current = end;
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value, duration]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString();

  return <span className={className}>{prefix}{formatted}{suffix}</span>;
}

// ─── Pulsing Live Dot ─────────────────────────────────────────────
export function PulsingDot({ color = 'bg-accent', size = 'w-2 h-2', ring = true }) {
  return (
    <span className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {ring && <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-75 animate-ping`} />}
      <span className={`relative inline-flex rounded-full ${size} ${color}`} />
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────
export function StatCard({
  title, value, sub, icon: Icon, color = '#00E5A8',
  trend, trendValue, animate = true, decimals = 0,
  prefix = '', suffix = '', critical = false, className = ''
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.02 }}
      className={`glass-card p-4 relative overflow-hidden group cursor-default ${critical ? 'border-danger/30' : ''} ${className}`}
    >
      {/* Glow overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${color}10, transparent 70%)` }}
      />
      {critical && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{ opacity: [0, 0.15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ background: `radial-gradient(circle, #FF4D6D20, transparent)` }}
        />
      )}

      <div className="flex items-start justify-between mb-3 relative">
        <div className="label-text">{title}</div>
        <div className="p-2 rounded-xl transition-all group-hover:scale-110" style={{ backgroundColor: `${color}18` }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>

      <div className="value-text mb-1 relative" style={{ color: critical ? '#FF4D6D' : undefined }}>
        {animate
          ? <AnimatedNumber value={typeof value === 'number' ? value : 0} decimals={decimals} prefix={prefix} suffix={suffix} />
          : <span>{prefix}{value}{suffix}</span>
        }
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 truncate">{sub}</span>
        {trend && trendValue && (
          <div className={`flex items-center gap-0.5 text-xs font-semibold flex-shrink-0 ${trend === 'up' ? 'text-danger' : trend === 'down' ? 'text-accent' : 'text-slate-400'}`}>
            {trend === 'up' ? <TrendingUp size={11} /> : trend === 'down' ? <TrendingDown size={11} /> : <Minus size={11} />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-b-xl" style={{ backgroundColor: color }} />
    </motion.div>
  );
}

// ─── Section Header ───────────────────────────────────────────────
export function SectionHeader({ icon: Icon, title, subtitle, action, live = false, iconColor = 'text-accent' }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-5">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
            <Icon size={18} className={iconColor} />
          </div>
        )}
        <div>
          <h2 className="font-display text-lg font-bold text-white">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {live && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20">
            <PulsingDot color="bg-accent" size="w-1.5 h-1.5" />
            <span className="text-xs font-semibold text-accent">LIVE</span>
          </div>
        )}
        {action}
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────
export const BADGE_VARIANTS = {
  CRITICAL: 'bg-danger/20 text-danger border-danger/30',
  HIGH: 'bg-warning/20 text-warning border-warning/30',
  MEDIUM: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/20',
  LOW: 'bg-accent/20 text-accent border-accent/20',
  INFO: 'bg-info/20 text-info border-info/20',
  SUCCESS: 'bg-accent/20 text-accent border-accent/20',
  WARNING: 'bg-warning/20 text-warning border-warning/20',
  NORMAL: 'bg-slate-700/50 text-slate-300 border-white/10',
  ACTIVE: 'bg-accent/20 text-accent border-accent/20',
  OPERATIONAL: 'bg-accent/20 text-accent border-accent/20',
  DELAYED: 'bg-danger/20 text-danger border-danger/30',
  MAINTENANCE: 'bg-danger/20 text-danger border-danger/30',
};

export function Badge({ variant = 'NORMAL', children, pulse = false, className = '' }) {
  const styles = BADGE_VARIANTS[variant] || BADGE_VARIANTS.NORMAL;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${styles} ${className}`}>
      {pulse && <PulsingDot color={variant === 'CRITICAL' ? 'bg-danger' : variant === 'HIGH' ? 'bg-warning' : 'bg-accent'} size="w-1 h-1" ring={false} />}
      {children}
    </span>
  );
}

// ─── Panel ────────────────────────────────────────────────────────
export function Panel({ children, className = '', accentColor, title, icon: Icon }) {
  return (
    <div className={`glass-card p-4 relative overflow-hidden ${className}`} style={accentColor ? { borderColor: `${accentColor}25` } : {}}>
      {accentColor && <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />}
      {(title || Icon) && (
        <div className="flex items-center gap-2 mb-4">
          {Icon && <Icon size={15} className="text-accent" />}
          {title && <span className="font-bold text-white text-sm">{title}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color, height = 'h-1.5', label, showValue = false, className = '' }) {
  const pct = Math.min((value / max) * 100, 100);
  const auto = pct >= 85 ? '#FF4D6D' : pct >= 65 ? '#FFC857' : '#00E5A8';
  const barColor = color || auto;

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex justify-between text-xs mb-1">
          {label && <span className="text-slate-400">{label}</span>}
          {showValue && <span className="font-bold" style={{ color: barColor }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={`${height} bg-primary rounded-full overflow-hidden`}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon size={40} className="text-slate-700 mb-3" />}
      <div className="text-slate-400 font-medium text-sm">{title}</div>
      {description && <div className="text-slate-600 text-xs mt-1 max-w-xs">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── AI Thinking Indicator ────────────────────────────────────────
export function AIThinking({ label = 'AI Analyzing...' }) {
  return (
    <div className="flex items-center gap-3 py-4 px-4 rounded-xl bg-accent/5 border border-accent/20">
      <div className="relative w-8 h-8 flex-shrink-0">
        <div className="w-8 h-8 rounded-full border-2 border-accent/30 animate-spin border-t-accent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        </div>
      </div>
      <div>
        <div className="text-sm font-semibold text-accent">{label}</div>
        <div className="text-xs text-slate-500 mt-0.5">Processing neural reasoning chain...</div>
      </div>
      <div className="ml-auto flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-accent"
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}
