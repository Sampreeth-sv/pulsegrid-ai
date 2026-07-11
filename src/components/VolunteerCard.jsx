import React from 'react';
import { motion } from 'framer-motion';
import { User, Battery, MapPin, Star, Clock, AlertTriangle, CheckCircle, Loader } from 'lucide-react';

const statusStyles = {
  ACTIVE: { label: 'Active', color: 'text-accent', bg: 'bg-accent/20', dot: 'bg-accent' },
  DEPLOYED: { label: 'Deployed', color: 'text-warning', bg: 'bg-warning/20', dot: 'bg-warning' },
  ON_BREAK: { label: 'On Break', color: 'text-slate-400', bg: 'bg-slate-700/50', dot: 'bg-slate-500' },
  OFFLINE: { label: 'Offline', color: 'text-slate-500', bg: 'bg-slate-800/50', dot: 'bg-slate-600' },
};

const fatigueLevelColor = (score) => {
  if (score >= 75) return 'bg-danger';
  if (score >= 55) return 'bg-warning';
  return 'bg-accent';
};

export default function VolunteerCard({ volunteer, onClick, compact = false, showActions = false, onAssign, onRelease }) {
  const status = statusStyles[volunteer.status] || statusStyles.ACTIVE;

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className="glass-card p-4 cursor-pointer"
      onClick={() => onClick?.(volunteer)}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/30 to-info/30 flex items-center justify-center border-2 border-accent/20">
            <span className="text-white font-bold text-sm">
              {volunteer.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-primary ${status.dot} ${volunteer.status === 'ACTIVE' ? 'animate-pulse' : ''}`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-bold text-white">{volunteer.name}</div>
              <div className="text-xs text-slate-400">{volunteer.role}</div>
            </div>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${status.bg} ${status.color} flex-shrink-0`}>
              {volunteer.status === 'ACTIVE' && <div className={`w-1 h-1 rounded-full ${status.dot} animate-pulse`} />}
              {status.label}
            </div>
          </div>

          {/* Languages */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {volunteer.languages.slice(0, 3).map((lang) => (
              <span key={lang} className="text-xs px-1.5 py-0.5 rounded bg-primary/50 text-slate-400 border border-white/5">
                {lang}
              </span>
            ))}
            {volunteer.languages.length > 3 && (
              <span className="text-xs text-slate-600">+{volunteer.languages.length - 3}</span>
            )}
          </div>
        </div>
      </div>

      {!compact && (
        <>
          {/* Current Task */}
          <div className="mt-3 flex items-start gap-2 bg-primary/40 rounded-lg p-2 border border-white/5">
            {volunteer.status === 'DEPLOYED' ? (
              <AlertTriangle size={12} className="text-warning mt-0.5 flex-shrink-0" />
            ) : (
              <CheckCircle size={12} className="text-accent mt-0.5 flex-shrink-0" />
            )}
            <span className="text-xs text-slate-300 leading-relaxed">{volunteer.currentTask}</span>
          </div>

          {/* Stats */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {/* Fatigue */}
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Battery size={11} className="text-slate-500" />
                <span className="text-xs text-slate-500">Fatigue</span>
              </div>
              <div className="h-1.5 bg-primary rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${fatigueLevelColor(volunteer.fatigueScore)}`}
                  animate={{ width: `${volunteer.fatigueScore}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-xs text-slate-400 mt-0.5">{Math.round(volunteer.fatigueScore)}%</span>
            </div>

            {/* Rating */}
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Star size={11} className="text-yellow-400" />
                <span className="text-xs text-slate-500">Rating</span>
              </div>
              <span className="text-sm font-bold text-white">{volunteer.rating.toFixed(1)}</span>
            </div>

            {/* Hours */}
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Clock size={11} className="text-info" />
                <span className="text-xs text-slate-500">Hours</span>
              </div>
              <span className="text-sm font-bold text-white">{volunteer.workloadHours.toFixed(1)}h</span>
            </div>
          </div>

          {/* Location */}
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin size={11} />
            <span>Gate {volunteer.assignedGate} • {volunteer.sector} Sector</span>
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="mt-3 flex gap-2">
              {volunteer.availability && onAssign && (
                <button
                  onClick={(e) => { e.stopPropagation(); onAssign(volunteer); }}
                  className="btn-primary text-xs px-3 py-1.5 flex-1 justify-center"
                >
                  Deploy
                </button>
              )}
              {!volunteer.availability && onRelease && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRelease(volunteer.id); }}
                  className="btn-secondary text-xs px-3 py-1.5 flex-1 justify-center"
                >
                  Release
                </button>
              )}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
