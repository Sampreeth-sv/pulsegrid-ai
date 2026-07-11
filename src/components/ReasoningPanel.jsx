import React from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle, Clock, AlertTriangle, ChevronDown, ChevronUp, Zap } from 'lucide-react';

const riskColors = {
  CRITICAL: 'border-l-danger text-danger bg-danger/5',
  HIGH: 'border-l-warning text-warning bg-warning/5',
  MEDIUM: 'border-l-yellow-400 text-yellow-300 bg-yellow-400/5',
  LOW: 'border-l-accent text-accent bg-accent/5',
};

export default function ReasoningPanel({ analysis, onApprove, onBroadcast, onAssign, onIgnore, onEscalate, compact = false }) {
  const [expanded, setExpanded] = React.useState(!compact);
  if (!analysis) return null;
  const riskStyle = riskColors[analysis.riskLevel] || riskColors.LOW;

  return (
    <motion.div
      layout
      className={`rounded-xl border-l-4 p-4 ${riskStyle} border border-white/5 bg-secondary/30`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 p-1.5 rounded-lg bg-accent/20 flex-shrink-0">
            <Brain size={14} className="text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">AI Analysis: {analysis.gateName || analysis.type || 'System'}</span>
              <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-accent/20 text-accent">
                {analysis.confidence}% conf.
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <AlertTriangle size={11} />
                <span>Risk: {analysis.riskLevel}</span>
              </div>
              {analysis.estimatedResolution && (
                <div className="flex items-center gap-1">
                  <Clock size={11} />
                  <span>ETA: {analysis.estimatedResolution}</span>
                </div>
              )}
              {analysis.impactForecast && (
                <span className="text-slate-500 hidden lg:block">{analysis.impactForecast}</span>
              )}
            </div>
          </div>
        </div>
        {compact && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded hover:bg-white/5 text-slate-400 transition-colors flex-shrink-0"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      {/* Reasoning */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="bg-primary/40 rounded-lg p-3 mb-3 border border-white/5">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap size={12} className="text-accent" />
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">AI Reasoning Chain</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{analysis.reasoning}</p>
          </div>

          {/* Suggested Actions */}
          {analysis.actions && analysis.actions.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Suggested Actions</div>
              <div className="space-y-1.5">
                {analysis.actions.map((action, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-accent">{i + 1}</span>
                    </div>
                    <span className="text-sm text-slate-300">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {onApprove && (
              <button
                onClick={() => onApprove(analysis)}
                className="btn-primary text-xs px-3 py-1.5"
              >
                <CheckCircle size={13} />
                Approve
              </button>
            )}
            {onBroadcast && (
              <button
                onClick={() => onBroadcast(analysis)}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                Broadcast
              </button>
            )}
            {onAssign && (
              <button
                onClick={() => onAssign(analysis)}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                Assign Volunteers
              </button>
            )}
            {onIgnore && (
              <button
                onClick={() => onIgnore(analysis)}
                className="btn-ghost text-xs px-3 py-1.5 text-slate-500"
              >
                Ignore
              </button>
            )}
            {onEscalate && (
              <button
                onClick={() => onEscalate(analysis)}
                className="btn-danger text-xs px-3 py-1.5"
              >
                Escalate
              </button>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
