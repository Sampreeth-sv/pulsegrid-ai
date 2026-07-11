import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Accessibility, ArrowUp, ArrowUpCircle, Volume2, Captions, HandMetal, AlertCircle, CheckCircle, Clock, Brain } from 'lucide-react';
import useStore from '../context/store';

export default function AccessibilityPage() {
  const { accessibilityData } = useStore();
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);

  const liftStatusColor = { OPERATIONAL: 'text-accent', MAINTENANCE: 'text-danger', BUSY: 'text-warning' };
  const liftBg = { OPERATIONAL: 'bg-accent/20', MAINTENANCE: 'bg-danger/20', BUSY: 'bg-warning/20' };

  const aiInsights = [
    'Wheelchair route to Section 210 is clear. Estimated travel time 4 minutes.',
    'North Lift B under maintenance. Recommend using East Lift A as alternative.',
    'Sign language request pending for Section 214 since 8 minutes. Volunteer needed.',
    'Accessible restroom near Gate C has extended queue. Volunteer deployed to assist.',
  ];

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3">
            <Accessibility className="text-accent" size={24} /> Accessibility Intelligence
          </h1>
          <p className="text-slate-400 text-sm mt-1">AI-powered accessibility routing, lift monitoring & adaptive services</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setHighContrast(!highContrast)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${highContrast ? 'bg-white text-black border-white' : 'border-white/10 text-slate-300 hover:border-white/30'}`}>
            High Contrast
          </button>
          <button onClick={() => setLargeText(!largeText)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${largeText ? 'bg-accent text-primary border-accent' : 'border-white/10 text-slate-300 hover:border-white/30'}`}>
            Large Text
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        {[
          { label: 'Wheelchair Spaces', value: `${accessibilityData.occupiedWheelchairSpaces}/${accessibilityData.totalWheelchairSpaces}`, color: '#56CCF2' },
          { label: 'Interpreters Active', value: accessibilityData.signLanguageInterpreters, color: '#00E5A8' },
          { label: 'Active Requests', value: accessibilityData.requests.length, color: '#FFC857' },
          { label: 'Lifts Operational', value: `${accessibilityData.lifts.filter(l => l.status === 'OPERATIONAL').length}/${accessibilityData.lifts.length}`, color: '#00E5A8' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <div className="text-xs text-slate-500 mb-1">{stat.label}</div>
            <div className={`${largeText ? 'text-3xl' : 'text-xl'} font-bold`} style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Lift Status */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpCircle size={16} className="text-accent" />
            <h2 className="font-bold text-white text-sm">Elevator Status</h2>
          </div>
          <div className="space-y-3">
            {accessibilityData.lifts.map((lift) => (
              <div key={lift.id} className="flex items-center justify-between p-3 bg-primary/40 rounded-xl border border-white/5">
                <div>
                  <div className="text-sm font-medium text-white">{lift.name}</div>
                  <div className="text-xs text-slate-500">Floor {lift.floor}</div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${liftBg[lift.status]} ${liftStatusColor[lift.status]}`}>
                    {lift.status}
                  </div>
                  {lift.waitTime !== null && (
                    <div className="text-xs text-slate-500 mt-0.5">{lift.waitTime === 0 ? 'No wait' : `${lift.waitTime}m wait`}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Requests */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={16} className="text-warning" />
            <h2 className="font-bold text-white text-sm">Active Requests</h2>
          </div>
          <div className="space-y-3">
            {accessibilityData.requests.map((req) => (
              <div key={req.id} className={`p-3 rounded-xl border ${req.status === 'PENDING' ? 'bg-warning/10 border-warning/20' : 'bg-accent/10 border-accent/20'}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-semibold text-white capitalize">{req.type.replace('_', ' ')}</span>
                  <span className={`text-xs font-bold ${req.status === 'PENDING' ? 'text-warning' : 'text-accent'}`}>{req.status}</span>
                </div>
                <div className="text-xs text-slate-400">📍 {req.location}</div>
                {req.volunteer && <div className="text-xs text-slate-400 mt-0.5">👤 Volunteer {req.volunteer}</div>}
                {req.eta !== null && <div className="text-xs text-accent mt-0.5">⏱ ETA: {req.eta === 0 ? 'On site' : `${req.eta} min`}</div>}
                {req.status === 'PENDING' && (
                  <button className="btn-primary text-xs px-3 py-1.5 mt-2">Assign Volunteer</button>
                )}
              </div>
            ))}
            {accessibilityData.requests.length === 0 && (
              <div className="text-center text-slate-500 text-sm py-6">
                <CheckCircle size={24} className="mx-auto mb-2 text-accent opacity-50" />
                No pending requests
              </div>
            )}
          </div>
        </div>

        {/* Services & AI Insights */}
        <div className="space-y-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Volume2 size={16} className="text-info" />
              <h2 className="font-bold text-white text-sm">Active Services</h2>
            </div>
            <div className="space-y-2">
              {[
                { icon: Captions, label: 'Live Captions', active: accessibilityData.activeCaptions, color: '#00E5A8' },
                { icon: HandMetal, label: 'Sign Language', active: true, color: '#56CCF2' },
                { icon: Volume2, label: 'Audio Guidance', active: true, color: '#FFC857' },
                { icon: Accessibility, label: 'Wheelchair Nav', active: true, color: '#00E5A8' },
              ].map((svc) => {
                const Icon = svc.icon;
                return (
                  <div key={svc.label} className="flex items-center justify-between p-2.5 rounded-lg bg-primary/40 border border-white/5">
                    <div className="flex items-center gap-2">
                      <Icon size={14} style={{ color: svc.color }} />
                      <span className="text-sm text-slate-300">{svc.label}</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${svc.active ? 'bg-accent animate-pulse' : 'bg-slate-600'}`} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={15} className="text-accent" />
              <h2 className="font-bold text-white text-sm">AI Insights</h2>
            </div>
            <div className="space-y-2">
              {aiInsights.map((insight, i) => (
                <div key={i} className="flex gap-2 text-xs text-slate-300 leading-relaxed">
                  <span className="text-accent mt-0.5 flex-shrink-0">→</span>
                  {insight}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
