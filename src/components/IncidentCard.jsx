import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Heart, Shield, Baby, Bus, Star, Flame, Zap, Users, Eye, CheckCircle, Clock } from 'lucide-react';

const typeIcons = {
  MEDICAL: Heart, SECURITY: Shield, CROWD: Users, LOST_CHILD: Baby,
  TRANSPORT: Bus, VIP: Star, FIRE: Flame, POWER: Zap, SUSPICIOUS: Eye,
};

const severityStyles = {
  CRITICAL: { border: 'border-l-danger', badge: 'bg-danger/20 text-danger', pulse: true },
  HIGH: { border: 'border-l-warning', badge: 'bg-warning/20 text-warning', pulse: false },
  MEDIUM: { border: 'border-l-yellow-400', badge: 'bg-yellow-400/20 text-yellow-300', pulse: false },
  LOW: { border: 'border-l-accent', badge: 'bg-accent/20 text-accent', pulse: false },
};

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function IncidentCard({ incident, onResolve, onAssign, compact = false }) {
  const Icon = typeIcons[incident.type] || AlertTriangle;
  const style = severityStyles[incident.severity] || severityStyles.LOW;
  const isResolved = incident.status === 'RESOLVED';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: isResolved ? 0.5 : 1, x: 0 }}
      className={`relative p-4 rounded-xl border-l-4 ${style.border} bg-secondary/30 border border-white/5 overflow-hidden`}
    >
      {/* Critical pulse */}
      {style.pulse && !isResolved && (
        <motion.div
          className="absolute inset-0 bg-danger/5"
          animate={{ opacity: [0, 0.4, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className="flex items-start gap-3 relative">
        <div className={`p-2 rounded-lg flex-shrink-0 ${style.badge}`}>
          <Icon size={15} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <span className="text-sm font-bold text-white">{incident.title}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${style.badge}`}>
                  {incident.severity}
                </span>
                <span className="text-xs text-slate-500">{incident.id}</span>
                {isResolved && (
                  <span className="text-xs font-semibold text-accent bg-accent/20 px-1.5 py-0.5 rounded-full">
                    RESOLVED
                  </span>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                <Clock size={10} />
                {timeAgo(incident.timestamp)}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-1.5 leading-relaxed">{incident.description}</p>
          <div className="text-xs text-slate-500">📍 {incident.location}</div>

          {!compact && incident.aiReasoning && (
            <div className="mt-3 bg-primary/40 rounded-lg p-2.5 border border-white/5">
              <div className="text-xs font-semibold text-accent mb-1 flex items-center gap-1">
                🤖 AI Reasoning
              </div>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{incident.aiReasoning}</p>
            </div>
          )}

          {!compact && !isResolved && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {onResolve && (
                <button
                  onClick={() => onResolve(incident.id)}
                  className="btn-primary text-xs px-3 py-1.5"
                >
                  <CheckCircle size={12} />
                  Mark Resolved
                </button>
              )}
              {onAssign && (
                <button
                  onClick={() => onAssign(incident)}
                  className="btn-secondary text-xs px-3 py-1.5"
                >
                  Assign Volunteer
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
