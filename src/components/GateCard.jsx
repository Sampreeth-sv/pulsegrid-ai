import React from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, AlertTriangle, Zap, TrendingUp, TrendingDown } from 'lucide-react';

const getRiskColor = (score) => {
  if (score >= 90) return { text: 'text-danger', bg: 'bg-danger', glow: 'glow-danger' };
  if (score >= 75) return { text: 'text-warning', bg: 'bg-warning', glow: 'glow-warning' };
  if (score >= 55) return { text: 'text-yellow-300', bg: 'bg-yellow-400', glow: '' };
  return { text: 'text-accent', bg: 'bg-accent', glow: 'glow-accent' };
};

const getStatusLabel = (status) => {
  const map = {
    NORMAL: { label: 'Normal', color: 'text-accent', bg: 'bg-accent/20', dot: 'bg-accent' },
    WARNING: { label: 'Warning', color: 'text-warning', bg: 'bg-warning/20', dot: 'bg-warning' },
    HIGH: { label: 'High Risk', color: 'text-warning', bg: 'bg-warning/20', dot: 'bg-warning' },
    CRITICAL: { label: 'Critical', color: 'text-danger', bg: 'bg-danger/20', dot: 'bg-danger' },
  };
  return map[status] || map.NORMAL;
};

export default function GateCard({ gate, onClick, selected }) {
  const risk = getRiskColor(gate.riskScore);
  const status = getStatusLabel(gate.status);
  const occupancyPct = Math.round((gate.occupancy / gate.capacity) * 100);

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick?.(gate)}
      className={`glass-card p-4 cursor-pointer relative overflow-hidden ${selected ? 'border-accent/40 shadow-glow-accent' : ''}`}
    >
      {/* Critical pulse overlay */}
      {gate.status === 'CRITICAL' && (
        <motion.div
          className="absolute inset-0 bg-danger/5 rounded-xl"
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: gate.color }}
            />
            <span className="font-display font-bold text-white text-sm">{gate.name}</span>
          </div>
          <span className="text-xs text-slate-500 mt-0.5">{gate.sector} Sector</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${status.dot} ${gate.status === 'CRITICAL' ? 'animate-ping' : 'animate-pulse'}`} />
          {status.label}
        </div>
      </div>

      {/* Occupancy Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-400">Occupancy</span>
          <span className={`text-xs font-bold ${risk.text}`}>{occupancyPct}%</span>
        </div>
        <div className="h-1.5 bg-primary rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${risk.bg}`}
            initial={{ width: 0 }}
            animate={{ width: `${occupancyPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-600 mt-0.5">
          <span>{gate.occupancy.toLocaleString()}</span>
          <span>{gate.capacity.toLocaleString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-primary/40 rounded-lg p-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Users size={11} className="text-info" />
            <span className="text-xs text-slate-500">Queue</span>
          </div>
          <span className="text-sm font-bold text-white">{gate.queueLength.toLocaleString()}</span>
        </div>
        <div className="bg-primary/40 rounded-lg p-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock size={11} className="text-warning" />
            <span className="text-xs text-slate-500">Wait</span>
          </div>
          <span className="text-sm font-bold text-white">{gate.avgWaitTime.toFixed(1)}m</span>
        </div>
        <div className="bg-primary/40 rounded-lg p-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={11} className="text-accent" />
            <span className="text-xs text-slate-500">Entry/min</span>
          </div>
          <span className="text-sm font-bold text-white">{gate.entryVelocity}</span>
        </div>
        <div className="bg-primary/40 rounded-lg p-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Users size={11} className="text-slate-400" />
            <span className="text-xs text-slate-500">Volunteers</span>
          </div>
          <span className="text-sm font-bold text-white">{gate.volunteerCount}</span>
        </div>
      </div>

      {/* Risk Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={13} className={risk.text} />
          <span className="text-xs text-slate-400">AI Risk Score</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 bg-primary rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${risk.bg}`}
              animate={{ width: `${gate.riskScore}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className={`text-sm font-bold ${risk.text}`}>{gate.riskScore}</span>
        </div>
      </div>

      {/* Congestion Prediction */}
      <div className="mt-2 pt-2 border-t border-white/5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">30-min Forecast</span>
          <div className="flex items-center gap-1">
            {gate.congestionPrediction > gate.riskScore
              ? <TrendingUp size={11} className="text-danger" />
              : <TrendingDown size={11} className="text-accent" />
            }
            <span className={gate.congestionPrediction > gate.riskScore ? 'text-danger' : 'text-accent'}>
              {gate.congestionPrediction}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
