import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, ChevronUp, CheckCircle, Radio, X, TrendingUp, AlertTriangle, Clock, Target, Zap } from 'lucide-react';
import { Badge } from './ui';

const RISK_COLORS = { CRITICAL: '#FF4D6D', HIGH: '#FFC857', MEDIUM: '#FFD468', LOW: '#00E5A8' };

export default function ReasoningPanel({ analysis, compact = false, onApprove, onBroadcast, onIgnore, onEscalate }) {
  const [expanded, setExpanded] = useState(!compact);
  if (!analysis) return null;

  const riskColor = RISK_COLORS[analysis.riskLevel] || '#00E5A8';
  const conf = analysis.confidence || 88;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card relative overflow-hidden ${analysis.riskLevel === 'CRITICAL' ? 'border-danger/30' : analysis.riskLevel === 'HIGH' ? 'border-warning/25' : 'border-accent/20'}`}
    >
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ backgroundColor: riskColor }} />

      {/* Pulse for critical */}
      {analysis.riskLevel === 'CRITICAL' && (
        <motion.div className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{ opacity: [0, 0.08, 0] }} transition={{ duration: 2.5, repeat: Infinity }}
          style={{ background: 'radial-gradient(circle at 50% 0%, #FF4D6D, transparent 70%)' }} />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${riskColor}18` }}>
              <Brain size={16} style={{ color: riskColor }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{analysis.type || 'AI Analysis'}</span>
                {analysis.gateId && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-white/8 text-slate-400 font-medium">Gate {analysis.gateId}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant={analysis.riskLevel === 'CRITICAL' ? 'CRITICAL' : analysis.riskLevel === 'HIGH' ? 'HIGH' : analysis.riskLevel === 'MEDIUM' ? 'WARNING' : 'SUCCESS'}
                  pulse={analysis.riskLevel === 'CRITICAL'}>
                  {analysis.riskLevel || 'MEDIUM'}
                </Badge>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Target size={9} /> {conf}% confidence
                </span>
              </div>
            </div>
          </div>
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0">
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>

        {/* Confidence Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">Confidence</span>
            <span className="font-bold" style={{ color: riskColor }}>{conf}%</span>
          </div>
          <div className="h-1.5 bg-primary rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ backgroundColor: riskColor }}
              initial={{ width: 0 }} animate={{ width: `${conf}%` }} transition={{ duration: 0.8 }} />
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
              <div className="space-y-3">
                {/* Reasoning */}
                {analysis.reasoning && (
                  <div className="p-3 rounded-xl bg-primary/50 border border-white/5">
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Brain size={10} className="text-accent" /> Reasoning
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{analysis.reasoning}</p>
                  </div>
                )}

                {/* Prediction */}
                {analysis.prediction && (
                  <div className="p-3 rounded-xl bg-primary/50 border border-white/5">
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <TrendingUp size={10} className="text-warning" /> Prediction
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{analysis.prediction}</p>
                  </div>
                )}

                {/* Suggested Actions */}
                {analysis.actions?.length > 0 && (
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Zap size={10} className="text-accent" /> Recommended Actions
                    </div>
                    <div className="space-y-1.5">
                      {analysis.actions.slice(0, 4).map((action, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span className="w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: `${riskColor}20`, color: riskColor }}>
                            {i + 1}
                          </span>
                          <span className="text-slate-300 leading-relaxed">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Impact */}
                {analysis.impact && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-accent/5 border border-accent/15">
                    <CheckCircle size={13} className="text-accent flex-shrink-0" />
                    <span className="text-xs text-slate-300">{analysis.impact}</span>
                  </div>
                )}

                {/* Meta */}
                <div className="flex gap-3 text-xs text-slate-500">
                  {analysis.estimatedResolution && (
                    <span className="flex items-center gap-1"><Clock size={10} /> Est. {analysis.estimatedResolution}</span>
                  )}
                  {analysis.impactForecast && (
                    <span className="flex items-center gap-1"><AlertTriangle size={10} /> {analysis.impactForecast}</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex gap-1.5 mt-3 pt-3 border-t border-white/5">
          {onApprove && (
            <button onClick={onApprove} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold bg-accent/15 text-accent border border-accent/25 hover:bg-accent/25 transition-all active:scale-95">
              <CheckCircle size={12} /> Approve
            </button>
          )}
          {onBroadcast && (
            <button onClick={onBroadcast} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold bg-info/10 text-info border border-info/20 hover:bg-info/20 transition-all active:scale-95">
              <Radio size={12} /> Broadcast
            </button>
          )}
          {onEscalate && (
            <button onClick={onEscalate} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 transition-all active:scale-95">
              <TrendingUp size={12} /> Escalate
            </button>
          )}
          {onIgnore && (
            <button onClick={onIgnore} className="py-2 px-2.5 rounded-xl text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all active:scale-95">
              <X size={12} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
