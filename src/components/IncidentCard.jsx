import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, User, CheckCircle, ChevronRight, Brain, Zap } from 'lucide-react';
import { Badge } from './ui';

const SEVERITY_MAP = {
  CRITICAL: { badge: 'CRITICAL', border: 'border-l-danger', bg: 'bg-danger/5' },
  HIGH: { badge: 'HIGH', border: 'border-l-warning', bg: 'bg-warning/5' },
  MEDIUM: { badge: 'MEDIUM', border: 'border-l-yellow-400', bg: '' },
  LOW: { badge: 'LOW', border: 'border-l-accent', bg: '' },
};

const TYPE_EMOJI = {
  MEDICAL: '🏥', SECURITY: '🛡️', CROWD: '👥', LOST_CHILD: '👶',
  ACCESSIBILITY: '♿', TRANSPORT: '🚌', FIRE: '🔥', POWER: '⚡', VIP: '⭐', SUSPICIOUS: '👁️',
};

const timeAgo = (ts) => {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

export default function IncidentCard({ incident, compact = false, onResolve }) {
  if (!incident) return null;
  const sv = SEVERITY_MAP[incident.severity] || SEVERITY_MAP.MEDIUM;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card border-l-4 ${sv.border} ${sv.bg} relative overflow-hidden`}
    >
      {/* Critical pulse */}
      {incident.severity === 'CRITICAL' && (
        <motion.div className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0, 0.06, 0] }} transition={{ duration: 2, repeat: Infinity }}
          style={{ background: 'linear-gradient(90deg, #FF4D6D, transparent 40%)' }} />
      )}

      <div className="p-3.5">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-base flex-shrink-0">{TYPE_EMOJI[incident.type] || '⚠️'}</span>
            <div className="min-w-0">
              <div className="font-bold text-white text-sm leading-tight truncate">{incident.title}</div>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                <Zap size={9} className="flex-shrink-0" /> {incident.location}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            <Badge variant={sv.badge} pulse={incident.severity === 'CRITICAL'}>{incident.severity}</Badge>
          </div>
        </div>

        {/* Description */}
        {!compact && (
          <p className="text-xs text-slate-400 leading-relaxed mb-2 line-clamp-2">{incident.description}</p>
        )}

        {/* AI Reasoning preview */}
        {incident.aiReasoning && !compact && (
          <div className="flex items-start gap-1.5 p-2.5 rounded-xl bg-primary/50 border border-white/5 mb-2">
            <Brain size={11} className="text-accent mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{incident.aiReasoning}</p>
          </div>
        )}

        {/* Actions (AI Suggested) */}
        {incident.aiActions?.length > 0 && !compact && (
          <div className="flex flex-wrap gap-1 mb-2">
            {incident.aiActions.slice(0, 3).map((action, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-accent/8 border border-accent/15 text-accent">{action}</span>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Clock size={10} /> {timeAgo(incident.timestamp)}</span>
            {incident.assignedVolunteers?.length > 0 && (
              <span className="flex items-center gap-1 text-info">
                <User size={10} /> {incident.assignedVolunteers.length} assigned
              </span>
            )}
            {incident.confidence && (
              <span className="text-slate-600">{incident.confidence}% AI conf.</span>
            )}
          </div>
          {onResolve && incident.status !== 'RESOLVED' && (
            <button onClick={() => onResolve(incident.id)}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-all font-medium">
              <CheckCircle size={10} /> Resolve
            </button>
          )}
          {incident.status === 'RESOLVED' && (
            <span className="text-xs text-accent flex items-center gap-1"><CheckCircle size={10} /> Resolved</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
