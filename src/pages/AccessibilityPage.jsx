import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Accessibility, Lift, Volume2, HandMetal, MapPin, Clock, CheckCircle, AlertTriangle, Plus, User, Navigation } from 'lucide-react';
import useStore from '../context/store';
import { StatCard, SectionHeader, Badge, EmptyState } from '../components/ui';
import toast from 'react-hot-toast';

const REQUEST_TYPES = {
  wheelchair: { label: 'Wheelchair', icon: '♿', color: '#56CCF2' },
  sign_language: { label: 'Sign Language', icon: '👋', color: '#00E5A8' },
  audio_guidance: { label: 'Audio Guidance', icon: '🔊', color: '#FFC857' },
  visual_assistance: { label: 'Visual Assistance', icon: '👁️', color: '#bf80ff' },
};

const LIFT_STATUS_COLORS = { OPERATIONAL: '#00E5A8', MAINTENANCE: '#FF4D6D', BUSY: '#FFC857' };

function LiftCard({ lift }) {
  const color = LIFT_STATUS_COLORS[lift.status] || '#94a3b8';
  return (
    <div className="glass-card p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ backgroundColor: color }} />
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-bold text-white text-sm">{lift.name}</div>
          <div className="text-xs text-slate-500 mt-0.5">Floor {lift.floor}</div>
        </div>
        <Badge variant={lift.status === 'OPERATIONAL' ? 'ACTIVE' : lift.status === 'MAINTENANCE' ? 'CRITICAL' : 'HIGH'} pulse={lift.status === 'MAINTENANCE'}>
          {lift.status}
        </Badge>
      </div>
      <div className="flex items-center gap-2 text-xs">
        {lift.status === 'OPERATIONAL' ? (
          <span className="text-accent flex items-center gap-1">
            <CheckCircle size={12} />
            {lift.waitTime > 0 ? `Wait: ${lift.waitTime} min` : 'Available now'}
          </span>
        ) : (
          <span className="text-danger flex items-center gap-1">
            <AlertTriangle size={12} />
            {lift.status === 'MAINTENANCE' ? 'Under maintenance' : 'Busy'}
          </span>
        )}
      </div>
      {lift.status === 'OPERATIONAL' && (
        <motion.div className="mt-3 h-1 bg-primary rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full bg-accent"
            animate={{ width: lift.waitTime === 0 ? '5%' : `${Math.min(lift.waitTime * 15, 100)}%` }}
            transition={{ duration: 0.8 }} />
        </motion.div>
      )}
    </div>
  );
}

function RequestCard({ request, onAssign }) {
  const type = REQUEST_TYPES[request.type] || { label: request.type, icon: '?', color: '#94a3b8' };
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      className={`glass-card p-4 ${request.status === 'PENDING' ? 'border-warning/25' : request.status === 'EN_ROUTE' ? 'border-info/25' : 'border-accent/20'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{type.icon}</span>
          <div>
            <div className="font-bold text-white text-sm">{type.label}</div>
            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin size={10} /> {request.location}
            </div>
          </div>
        </div>
        <Badge variant={request.status === 'PENDING' ? 'HIGH' : request.status === 'EN_ROUTE' ? 'INFO' : 'SUCCESS'} pulse={request.status === 'PENDING'}>
          {request.status.replace('_', ' ')}
        </Badge>
      </div>
      {request.volunteer && (
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <User size={11} className="text-info" />
          <span>Volunteer assigned</span>
          {request.eta !== null && request.eta > 0 && (
            <span className="text-accent font-semibold flex items-center gap-1 ml-auto">
              <Clock size={10} /> ETA: {request.eta} min
            </span>
          )}
          {request.eta === 0 && <span className="text-accent font-semibold ml-auto">Active</span>}
        </div>
      )}
      {!request.volunteer && (
        <button onClick={() => { onAssign(request.id); toast.success(`Volunteer assigned to ${type.label} request!`); }}
          className="w-full btn-primary text-xs justify-center mt-1">
          <User size={12} /> Assign Volunteer
        </button>
      )}
    </motion.div>
  );
}

export default function AccessibilityPage() {
  const { accessibilityData } = useStore();
  const [requests, setRequests] = useState(accessibilityData.requests);
  const [showNew, setShowNew] = useState(false);
  const [newType, setNewType] = useState('wheelchair');
  const [newLocation, setNewLocation] = useState('');

  const handleAssign = (id) => {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, volunteer: 'V-AUTO', status: 'EN_ROUTE', eta: Math.round(2 + Math.random() * 5) } : r));
  };

  const handleAddRequest = () => {
    if (!newLocation.trim()) return;
    const newReq = {
      id: `ACC-${Date.now()}`,
      type: newType,
      location: newLocation,
      volunteer: null,
      status: 'PENDING',
      eta: null,
    };
    setRequests((prev) => [newReq, ...prev]);
    setNewLocation('');
    setShowNew(false);
    toast.success('Accessibility request created!');
  };

  const wheelchairPct = Math.round((accessibilityData.occupiedWheelchairSpaces / accessibilityData.totalWheelchairSpaces) * 100);
  const operationalLifts = accessibilityData.lifts.filter((l) => l.status === 'OPERATIONAL').length;
  const pendingRequests = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3">
            <Accessibility className="text-info" size={24} /> Accessibility Console
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Live adaptive services, lift status, and request management</p>
        </div>
        <button onClick={() => setShowNew(!showNew)} className="btn-primary text-sm">
          <Plus size={14} /> New Request
        </button>
      </div>

      {/* New Request Form */}
      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="glass-card p-4 border-info/25">
            <div className="text-sm font-bold text-white mb-3">New Accessibility Request</div>
            <div className="grid sm:grid-cols-3 gap-3">
              <select value={newType} onChange={(e) => setNewType(e.target.value)} className="input-field text-sm">
                {Object.entries(REQUEST_TYPES).map(([key, val]) => (
                  <option key={key} value={key}>{val.icon} {val.label}</option>
                ))}
              </select>
              <input value={newLocation} onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Location (e.g. Gate B, Section 112)" className="input-field text-sm" />
              <button onClick={handleAddRequest} className="btn-primary justify-center">Create Request</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Wheelchair Spaces" value={`${accessibilityData.occupiedWheelchairSpaces}/${accessibilityData.totalWheelchairSpaces}`}
          sub={`${wheelchairPct}% occupied`} icon={Accessibility} color="#56CCF2" />
        <StatCard title="Active Requests" value={requests.filter(r => r.status !== 'ACTIVE').length}
          sub={`${pendingRequests} pending assignment`} icon={Clock} color="#FFC857"
          critical={pendingRequests > 2} />
        <StatCard title="Operational Lifts" value={`${operationalLifts}/${accessibilityData.lifts.length}`}
          sub={`${accessibilityData.lifts.length - operationalLifts} unavailable`}
          icon={Navigation} color={operationalLifts < accessibilityData.lifts.length ? '#FF4D6D' : '#00E5A8'} />
        <StatCard title="Interpreters" value={accessibilityData.signLanguageInterpreters}
          sub="Sign language on duty" icon={HandMetal} color="#00E5A8" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Lift Status */}
        <div className="glass-card p-4">
          <SectionHeader icon={Navigation} title="Elevator & Lift Status"
            action={<Badge variant={operationalLifts === accessibilityData.lifts.length ? 'SUCCESS' : 'HIGH'}>
              {operationalLifts}/{accessibilityData.lifts.length} Online
            </Badge>} />
          <div className="grid sm:grid-cols-2 gap-3">
            {accessibilityData.lifts.map((lift) => <LiftCard key={lift.id} lift={lift} />)}
          </div>
        </div>

        {/* Active Requests */}
        <div className="glass-card p-4">
          <SectionHeader icon={Accessibility} title="Service Requests"
            live subtitle={`${requests.length} total · ${pendingRequests} awaiting assignment`}
            action={
              <button onClick={() => {
                const types = Object.keys(REQUEST_TYPES);
                const newReq = {
                  id: `ACC-${Date.now()}`, type: types[Math.floor(Math.random() * types.length)],
                  location: ['Gate A', 'Gate B Concourse', 'Section 114', 'Food Court A'][Math.floor(Math.random() * 4)],
                  volunteer: null, status: 'PENDING', eta: null,
                };
                setRequests((prev) => [newReq, ...prev]);
                toast('New accessibility request received!', { icon: '♿' });
              }} className="btn-ghost text-xs px-2">
                <Plus size={12} /> Simulate
              </button>
            }
          />
          <div className="space-y-2 max-h-80 overflow-y-auto no-scrollbar">
            {requests.length === 0
              ? <EmptyState icon={Accessibility} title="No active requests" description="All fans assisted" />
              : requests.map((r) => <RequestCard key={r.id} request={r} onAssign={handleAssign} />)
            }
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="glass-card p-4">
        <SectionHeader icon={Volume2} title="Adaptive Services Status" />
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Live Captions', active: accessibilityData.activeCaptions, icon: '📝' },
            { label: 'Audio Description', active: true, icon: '🔊' },
            { label: 'Sign Language', active: accessibilityData.signLanguageInterpreters > 0, icon: '👋' },
            { label: 'Wheelchair Paths', active: true, icon: '♿' },
            { label: 'Sensory Rooms', active: true, icon: '🧘' },
            { label: 'Prayer Rooms', active: true, icon: '🕌' },
            { label: 'Family Zones', active: true, icon: '👨‍👩‍👧' },
            { label: 'Medical Support', active: true, icon: '🏥' },
          ].map((svc) => (
            <div key={svc.label} className={`p-3 rounded-xl border flex items-center gap-3 ${svc.active ? 'bg-accent/5 border-accent/20' : 'bg-danger/5 border-danger/20'}`}>
              <span className="text-xl">{svc.icon}</span>
              <div>
                <div className="text-xs font-medium text-white">{svc.label}</div>
                <div className={`text-xs font-bold ${svc.active ? 'text-accent' : 'text-danger'}`}>
                  {svc.active ? '● Active' : '● Inactive'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
