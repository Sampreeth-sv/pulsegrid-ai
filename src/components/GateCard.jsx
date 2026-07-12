import React from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, Clock, Zap, Shield, AlertTriangle, TrendingUp } from 'lucide-react';
import { ProgressBar, Badge } from './ui';

const STATUS_VARIANTS = {
  CRITICAL: { badge: 'CRITICAL', glow: '#FF4D6D', border: 'border-danger/40' },
  HIGH: { badge: 'HIGH', glow: '#FFC857', border: 'border-warning/30' },
  WARNING: { badge: 'HIGH', glow: '#FFC857', border: 'border-warning/25' },
  NORMAL: { badge: 'SUCCESS', glow: '#00E5A8', border: 'border-accent/15' },
};

export default function GateCard({ gate, onClick, selected }) {
  if (!gate) return null;
  const pct = Math.round((gate.occupancy / gate.capacity) * 100);
  const sv = STATUS_VARIANTS[gate.status] || STATUS_VARIANTS.NORMAL;
  const isCritical = gate.status === 'CRITICAL';
  const isWarning = gate.status === 'WARNING' || gate.status === 'HIGH';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={() => onClick?.(gate)}
      className={`glass-card p-4 cursor-pointer relative overflow-hidden transition-all duration-300 ${sv.border} ${selected ? `ring-1 ring-accent/40` : ''}`}
    >
      {/* Background pulse for critical */}
      {isCritical && (
        <motion.div className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{ opacity: [0, 0.1, 0] }} transition={{ duration: 2, repeat: Infinity }}
          style={{ background: 'radial-gradient(circle at top left, #FF4D6D, transparent 60%)' }} />
      )}

      {/* Top color bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ backgroundColor: gate.color }} />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-bold text-white text-sm leading-none">{gate.name}</div>
          <div className="text-xs text-slate-500 mt-0.5">{gate.sector} Sector</div>
        </div>
        <Badge variant={sv.badge} pulse={isCritical}>{gate.status}</Badge>
      </div>

      {/* Occupancy Bar */}
      <ProgressBar value={gate.occupancy} max={gate.capacity} height="h-2" className="mb-3" />

      {/* Occupancy numbers */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs text-slate-500">Occupancy</div>
          <div className="font-bold text-white text-sm">{gate.occupancy.toLocaleString()}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">Fill Rate</div>
          <div className={`font-bold text-sm ${pct >= 85 ? 'text-danger' : pct >= 65 ? 'text-warning' : 'text-accent'}`}>{pct}%</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {[
          { icon: Activity, label: 'Queue', value: gate.queueLength, color: isWarning ? 'text-warning' : isCritical ? 'text-danger' : 'text-slate-300' },
          { icon: Users, label: 'Vols', value: gate.volunteerCount, color: 'text-slate-300' },
          { icon: Clock, label: 'Wait', value: `${gate.avgWaitTime.toFixed(1)}m`, color: gate.avgWaitTime > 10 ? 'text-danger' : gate.avgWaitTime > 6 ? 'text-warning' : 'text-accent' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-primary/50 rounded-xl p-2 text-center">
            <Icon size={11} className="text-slate-600 mx-auto mb-0.5" />
            <div className={`text-xs font-bold leading-none ${color}`}>{value}</div>
            <div className="text-xs text-slate-600 mt-0.5 leading-none">{label}</div>
          </div>
        ))}
      </div>

      {/* Risk Score */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <Shield size={11} className="text-slate-500" />
          <span className="text-slate-500">AI Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1 w-20 bg-primary rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full"
              style={{ backgroundColor: gate.riskScore >= 75 ? '#FF4D6D' : gate.riskScore >= 55 ? '#FFC857' : '#00E5A8' }}
              animate={{ width: `${gate.riskScore}%` }} transition={{ duration: 0.5 }} />
          </div>
          <span className={`font-bold w-7 text-right ${gate.riskScore >= 75 ? 'text-danger' : gate.riskScore >= 55 ? 'text-warning' : 'text-accent'}`}>
            {gate.riskScore}
          </span>
        </div>
      </div>

      {/* Congestion prediction indicator */}
      {gate.congestionPrediction >= 70 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-1.5 mt-2.5 text-xs"
          style={{ color: gate.congestionPrediction >= 85 ? '#FF4D6D' : '#FFC857' }}>
          <TrendingUp size={11} />
          <span>Congestion predicted: {gate.congestionPrediction}%</span>
        </motion.div>
      )}

      {/* Entry velocity */}
      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-600">
        <Zap size={10} className="text-slate-700" />
        <span>{gate.entryVelocity} fans/min entry velocity</span>
      </div>
    </motion.div>
  );
}
