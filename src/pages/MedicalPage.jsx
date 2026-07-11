import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, AlertTriangle, MapPin, Clock, CheckCircle, Phone, Brain, Activity } from 'lucide-react';
import useStore from '../context/store';

const cases = [
  { id: 'MED-001', type: 'Heat Exhaustion', location: 'Section 112 - Gate B Concourse', status: 'ACTIVE', severity: 'HIGH', patient: 'Fan, ~65yr, Male', responder: 'V004 (Miguel Santos)', dispatched: '2m ago', eta: '1m', notes: 'Patient seated. Pulse stable. Awaiting paramedic.' },
  { id: 'MED-002', type: 'Ankle Injury', location: 'Concourse Stairs - Section 205', status: 'EN_ROUTE', severity: 'MEDIUM', patient: 'Fan, ~30yr, Female', responder: 'Stadium Medic', dispatched: '8m ago', eta: 'On site', notes: 'Twisted ankle on wet stairs. Mobility limited.' },
  { id: 'MED-003', type: 'Child Asthma', location: 'Food Court Zone B', status: 'RESOLVED', severity: 'HIGH', patient: 'Child, ~9yr', responder: 'V001 (Amira Benali)', dispatched: '22m ago', eta: 'Resolved', notes: 'Inhaler administered. Child stable. Parents notified.' },
];

const firstAidStations = [
  { id: 'FA-1', name: 'First Aid - Gate A', capacity: 4, occupied: 1, status: 'AVAILABLE' },
  { id: 'FA-2', name: 'First Aid - Gate B', capacity: 4, occupied: 3, status: 'BUSY' },
  { id: 'FA-3', name: 'First Aid - Field Level', capacity: 6, occupied: 2, status: 'AVAILABLE' },
  { id: 'FA-4', name: 'First Aid - Gate D', capacity: 4, occupied: 4, status: 'FULL' },
];

export default function MedicalPage() {
  const { incidents } = useStore();
  const medicalIncidents = incidents.filter((i) => i.type === 'MEDICAL');

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3">
          <Heart className="text-danger" size={24} /> Medical Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">Real-time medical case tracking, first aid station status & AI triage</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Cases', value: cases.filter(c => c.status !== 'RESOLVED').length, color: '#FF4D6D' },
          { label: 'Resolved Today', value: cases.filter(c => c.status === 'RESOLVED').length, color: '#00E5A8' },
          { label: 'Medical Staff', value: 12, color: '#56CCF2' },
          { label: 'AED Units', value: '8 Active', color: '#FFC857' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 text-center">
            <div className="text-xs text-slate-500 mb-1">{s.label}</div>
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Active Cases */}
        <div className="lg:col-span-2 glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-danger" />
            <h2 className="font-bold text-white text-sm">Medical Cases</h2>
          </div>
          <div className="space-y-3">
            {cases.map((c) => (
              <div key={c.id} className={`p-4 rounded-xl border-l-4 ${c.status === 'RESOLVED' ? 'border-l-accent bg-accent/5 opacity-70' : c.severity === 'HIGH' ? 'border-l-danger bg-danger/5' : 'border-l-warning bg-warning/5'} border border-white/5`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-white text-sm">{c.type}</div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <MapPin size={10} /> {c.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.status === 'RESOLVED' ? 'bg-accent/20 text-accent' : c.status === 'ACTIVE' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'}`}>
                      {c.status}
                    </span>
                    <div className="text-xs text-slate-500 mt-0.5">{c.id}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div><span className="text-slate-500">Patient:</span> <span className="text-slate-300">{c.patient}</span></div>
                  <div><span className="text-slate-500">Responder:</span> <span className="text-slate-300">{c.responder}</span></div>
                  <div className="flex items-center gap-1"><Clock size={10} className="text-slate-500" /> <span className="text-slate-400">{c.dispatched}</span></div>
                  <div><span className={c.eta === 'Resolved' ? 'text-accent' : 'text-warning'}>ETA: {c.eta}</span></div>
                </div>
                <div className="bg-primary/40 rounded-lg p-2 text-xs text-slate-300 leading-relaxed">{c.notes}</div>
                {c.status !== 'RESOLVED' && (
                  <div className="flex gap-2 mt-2">
                    <button className="btn-primary text-xs px-3 py-1.5"><CheckCircle size={11} /> Resolve</button>
                    <button className="btn-danger text-xs px-3 py-1.5"><Phone size={11} /> Call Ambulance</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* First Aid Stations + AI */}
        <div className="space-y-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Heart size={16} className="text-danger" />
              <h2 className="font-bold text-white text-sm">First Aid Stations</h2>
            </div>
            <div className="space-y-3">
              {firstAidStations.map((station) => (
                <div key={station.id} className="p-3 bg-primary/40 rounded-xl border border-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-white">{station.name}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${station.status === 'FULL' ? 'bg-danger/20 text-danger' : station.status === 'BUSY' ? 'bg-warning/20 text-warning' : 'bg-accent/20 text-accent'}`}>{station.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-primary rounded-full overflow-hidden">
                      <motion.div className={`h-full rounded-full ${station.occupied >= station.capacity ? 'bg-danger' : station.occupied >= station.capacity * 0.7 ? 'bg-warning' : 'bg-accent'}`}
                        animate={{ width: `${(station.occupied / station.capacity) * 100}%` }} transition={{ duration: 0.5 }} />
                    </div>
                    <span className="text-xs text-slate-400">{station.occupied}/{station.capacity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-4 border-l-4 border-l-accent">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={15} className="text-accent" />
              <h2 className="font-bold text-white text-sm">AI Medical Insights</h2>
            </div>
            <div className="space-y-2">
              {[
                '⚠️ High temperature (28°C) increases heat illness risk. Deploy water stations at Gate queues.',
                '🏥 First Aid Gate D at full capacity. Redirect non-critical cases to Gate A station.',
                '📊 Current medical event rate: 1.2 cases/hr. Within acceptable range for 20k+ occupancy.',
                '💊 Stock AED units at Sections 101, 112, 205 based on crowd density patterns.',
              ].map((insight, i) => (
                <div key={i} className="text-xs text-slate-300 leading-relaxed border-b border-white/5 pb-2 last:border-0 last:pb-0">
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
