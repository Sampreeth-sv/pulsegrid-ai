import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Activity, AlertTriangle, Clock,
  MapPin, User, Brain, CheckCircle, Zap,
} from 'lucide-react';
import { StatCard, SectionHeader, Badge, ProgressBar, EmptyState } from '../components/ui';
import useStore from '../context/store';
import toast from 'react-hot-toast';

// ─── Static data ──────────────────────────────────────────────────
const cases = [
  {
    id: 'MED-001',
    type: 'Heat Exhaustion',
    location: 'Section 112 – Gate B Concourse',
    status: 'ACTIVE',
    severity: 'HIGH',
    patient: 'Fan, ~65 yr, Male',
    responder: 'V004 – Miguel Santos',
    dispatched: '2 min ago',
    eta: '1 min',
    notes:
      'Patient seated in shade. Pulse 88 bpm, stable. Ice pack applied. Awaiting paramedic unit.',
  },
  {
    id: 'MED-002',
    type: 'Ankle Sprain',
    location: 'Concourse Stairs – Section 205',
    status: 'EN_ROUTE',
    severity: 'MEDIUM',
    patient: 'Fan, ~30 yr, Female',
    responder: 'Stadium Medic – Unit 3',
    dispatched: '8 min ago',
    eta: 'On site',
    notes:
      'Twisted ankle on wet stairs. Mobility limited. Wheelchair requested. X-ray unlikely needed.',
  },
  {
    id: 'MED-003',
    type: 'Child Asthma Attack',
    location: 'Food Court Zone B – Kiosk 7',
    status: 'RESOLVED',
    severity: 'HIGH',
    patient: 'Child, ~9 yr',
    responder: 'V001 – Amira Benali',
    dispatched: '22 min ago',
    eta: 'Resolved',
    notes:
      'Rescue inhaler administered. O2 saturation returned to 98%. Parents notified. Child discharged.',
  },
];

const aedStations = [
  { id: 'AED-1', name: 'AED Station – Gate A', occupied: 1, capacity: 4, status: 'AVAILABLE' },
  { id: 'AED-2', name: 'AED Station – Gate B', occupied: 3, capacity: 4, status: 'BUSY' },
  { id: 'AED-3', name: 'AED Station – Field Level', occupied: 2, capacity: 6, status: 'AVAILABLE' },
  { id: 'AED-4', name: 'AED Station – Gate D', occupied: 4, capacity: 4, status: 'FULL' },
];

const aiTriageRecs = [
  {
    id: 't1',
    icon: <AlertTriangle size={13} className="text-warning" />,
    priority: 'HIGH',
    text: 'Ambient temp 28 °C / 82% humidity — heat illness risk elevated. Deploy water distribution at Gate A & D queues immediately.',
  },
  {
    id: 't2',
    icon: <Zap size={13} className="text-danger" />,
    priority: 'CRITICAL',
    text: 'AED Station Gate D at full capacity. Redirect non-critical patients to Gate A station (3 available beds).',
  },
  {
    id: 't3',
    icon: <Activity size={13} className="text-accent" />,
    priority: 'INFO',
    text: 'Current event rate: 1.2 cases/hr — within normal range for 20 k+ occupancy. No surge predicted.',
  },
  {
    id: 't4',
    icon: <Brain size={13} className="text-info" />,
    priority: 'INFO',
    text: 'Pre-position AED units at Sections 101, 112 & 205 based on crowd-density heatmap patterns.',
  },
  {
    id: 't5',
    icon: <Heart size={13} className="text-danger" />,
    priority: 'MEDIUM',
    text: 'Volunteer V004 fatigue score at 67 %. Consider rotation with on-call medical reserve after current case.',
  },
];

const severityBadge = { CRITICAL: 'CRITICAL', HIGH: 'HIGH', MEDIUM: 'MEDIUM', LOW: 'LOW' };
const statusBadge   = { ACTIVE: 'CRITICAL', EN_ROUTE: 'WARNING', RESOLVED: 'SUCCESS' };
const priorityBadge = { CRITICAL: 'CRITICAL', HIGH: 'WARNING', MEDIUM: 'MEDIUM', INFO: 'INFO' };

// ─── Component ────────────────────────────────────────────────────
export default function MedicalPage() {
  const { incidents, resolveIncident } = useStore();
  const medicalIncidents = incidents.filter((i) => i.type === 'MEDICAL');

  const activeCases   = cases.filter((c) => c.status !== 'RESOLVED').length;
  const resolvedCases = cases.filter((c) => c.status === 'RESOLVED').length;

  const handleResolve = (id) => {
    resolveIncident(id);
    toast.success(`Case ${id} marked as resolved.`);
  };

  const handleAmbulance = (id) => {
    toast.error(`🚑 Ambulance requested for case ${id}`);
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <SectionHeader
          icon={Heart}
          title="Medical Dashboard"
          subtitle="Real-time case tracking, station capacity & AI-assisted triage"
          live
          iconColor="text-danger"
        />
      </motion.div>

      {/* KPI StatCards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Active Cases"
          value={activeCases}
          sub="Currently open"
          icon={AlertTriangle}
          color="#FF4D6D"
          critical={activeCases >= 3}
          trend="up"
          trendValue="+1 hr"
        />
        <StatCard
          title="AED Stations"
          value={aedStations.length}
          sub={`${aedStations.filter((s) => s.status !== 'FULL').length} available`}
          icon={Zap}
          color="#FFC857"
        />
        <StatCard
          title="Medical Team"
          value={12}
          sub="On duty now"
          icon={User}
          color="#56CCF2"
        />
        <StatCard
          title="Avg Response"
          value={4.2}
          sub="minutes per case"
          icon={Clock}
          color="#00E5A8"
          decimals={1}
          suffix=" min"
          trend="down"
          trendValue="−0.3"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* ── Medical Cases ── */}
        <div className="lg:col-span-2 glass-card p-4">
          <SectionHeader
            icon={Activity}
            title="Active Medical Cases"
            subtitle={`${activeCases} open · ${resolvedCases} resolved today`}
            live={activeCases > 0}
            iconColor="text-danger"
          />

          {cases.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="No active medical cases"
              description="The medical dashboard will populate when cases are reported."
            />
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {cases.map((c, idx) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className={`p-4 rounded-xl border-l-4 border border-white/5
                      ${c.status === 'RESOLVED'
                        ? 'border-l-accent bg-accent/5 opacity-70'
                        : c.severity === 'HIGH'
                        ? 'border-l-danger bg-danger/5'
                        : 'border-l-warning bg-warning/5'}`}
                  >
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <div>
                        <div className="font-bold text-white text-sm">{c.type}</div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <MapPin size={10} /> {c.location}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={statusBadge[c.status]} pulse={c.status === 'ACTIVE'}>
                          {c.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant={severityBadge[c.severity]}>{c.severity}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div>
                        <span className="text-slate-500">Patient: </span>
                        <span className="text-slate-300">{c.patient}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Responder: </span>
                        <span className="text-slate-300">{c.responder}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={10} className="text-slate-500" />
                        <span className="text-slate-400">{c.dispatched}</span>
                      </div>
                      <div>
                        <span className={c.eta === 'Resolved' ? 'text-accent' : 'text-warning'}>
                          ETA: {c.eta}
                        </span>
                      </div>
                    </div>

                    <div className="bg-primary/40 rounded-lg p-2.5 text-xs text-slate-300 leading-relaxed mb-2">
                      {c.notes}
                    </div>

                    {c.status !== 'RESOLVED' && (
                      <div className="flex gap-2 mt-1">
                        <button
                          className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                          onClick={() => handleResolve(c.id)}
                        >
                          <CheckCircle size={11} /> Resolve
                        </button>
                        <button
                          className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1"
                          onClick={() => handleAmbulance(c.id)}
                        >
                          <Heart size={11} /> Call Ambulance
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">
          {/* Station Capacity */}
          <div className="glass-card p-4">
            <SectionHeader
              icon={Heart}
              title="Station Capacity"
              subtitle="AED & first-aid bed utilization"
              iconColor="text-danger"
            />
            <div className="space-y-3">
              {aedStations.map((station, idx) => (
                <motion.div
                  key={station.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  className="p-3 bg-primary/40 rounded-xl border border-white/5"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-white">{station.name}</span>
                    <Badge
                      variant={
                        station.status === 'FULL'
                          ? 'CRITICAL'
                          : station.status === 'BUSY'
                          ? 'WARNING'
                          : 'SUCCESS'
                      }
                    >
                      {station.status}
                    </Badge>
                  </div>
                  <ProgressBar
                    value={station.occupied}
                    max={station.capacity}
                    label={`${station.occupied}/${station.capacity} beds`}
                    showValue
                    height="h-2"
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* AI Triage Recommendations */}
          <div className="glass-card p-4 border-l-4 border-l-accent">
            <SectionHeader
              icon={Brain}
              title="AI Triage Recommendations"
              subtitle="Autonomous medical risk assessment"
              iconColor="text-accent"
            />
            <div className="space-y-2.5">
              {aiTriageRecs.map((rec, i) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-2.5 pb-2.5 border-b border-white/5 last:border-0 last:pb-0"
                >
                  <div className="mt-0.5 flex-shrink-0">{rec.icon}</div>
                  <div>
                    <Badge variant={priorityBadge[rec.priority]} className="mb-1">
                      {rec.priority}
                    </Badge>
                    <p className="text-xs text-slate-300 leading-relaxed">{rec.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
