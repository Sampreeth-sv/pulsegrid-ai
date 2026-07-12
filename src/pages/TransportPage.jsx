import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Train, Bus, Car, MapPin, AlertTriangle,
  Clock, Navigation, Brain, Activity,
} from 'lucide-react';
import { StatCard, SectionHeader, Badge, ProgressBar } from '../components/ui';
import useStore from '../context/store';
import toast from 'react-hot-toast';

// ─── Static helpers ───────────────────────────────────────────────
const statusVariant = {
  OPERATIONAL: 'OPERATIONAL',
  DELAYED: 'DELAYED',
  SURGE: 'WARNING',
  RUNNING: 'OPERATIONAL',
  AVAILABLE: 'SUCCESS',
  BUSY: 'WARNING',
  ALMOST_FULL: 'WARNING',
  LIMITED: 'MEDIUM',
  PARTIAL_DELAY: 'WARNING',
  SURGE_PRICING: 'WARNING',
};

const aiRoutingRecs = [
  {
    id: 'r1',
    urgency: 'HIGH',
    icon: <Train size={14} className="text-danger" />,
    headline: 'Metro Line 2 Delay Active',
    text: 'Line 2 (Red) 15-min delay affects ~2,400 fans en route. Activating 3 extra shuttles from Lot J. ETA 8 min.',
  },
  {
    id: 'r2',
    urgency: 'MEDIUM',
    icon: <Bus size={14} className="text-warning" />,
    headline: 'Shuttle Zone J Surge',
    text: 'Lot J Extended buses at 65% capacity with 18-min wait. Redirect fans to Lot A Express (5-min wait).',
  },
  {
    id: 'r3',
    urgency: 'MEDIUM',
    icon: <MapPin size={14} className="text-warning" />,
    headline: 'Parking Lot A Near Full',
    text: 'Lot A at 90% (2,890/3,200). Activating dynamic signage to redirect new arrivals to Lot J (70% free).',
  },
  {
    id: 'r4',
    urgency: 'LOW',
    icon: <Car size={14} className="text-accent" />,
    headline: 'Rideshare Surge Pricing',
    text: 'Zone North: 2.1× surge pricing, 22-min wait. Zone South available at 1.3× / 8-min wait — recommend Zone South.',
  },
];

const urgencyVariant = { HIGH: 'CRITICAL', MEDIUM: 'WARNING', LOW: 'SUCCESS' };
const lineColors = { M1: '#56CCF2', M2: '#FF4D6D', M3: '#00E5A8' };

// ─── Component ────────────────────────────────────────────────────
export default function TransportPage() {
  const { transportData } = useStore();
  const [expandedZone, setExpandedZone] = useState(null);

  const { metro, shuttle, rideshare, parking } = transportData;

  const metroLoadPct = Math.round((metro.currentLoad / metro.totalCapacity) * 100);
  const shuttleLoadPct = Math.round((shuttle.currentLoad / shuttle.totalCapacity) * 100);
  const avgRideshareWait = rideshare.avgWaitTime;
  const parkingPct = Math.round((parking.occupied / parking.totalSpaces) * 100);

  const handleDispatch = (zoneName) => {
    toast.success(`Extra shuttle dispatched to ${zoneName}`);
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <SectionHeader
          icon={Navigation}
          title="Transportation Intelligence"
          subtitle="Real-time transport monitoring with AI congestion prediction"
          live
          iconColor="text-accent"
        />
      </motion.div>

      {/* KPI StatCards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Metro Load"
          value={metroLoadPct}
          sub={`${metro.currentLoad.toLocaleString()} / ${metro.totalCapacity.toLocaleString()} riders`}
          icon={Train}
          color="#56CCF2"
          suffix="%"
          critical={metroLoadPct >= 85}
          trend="up"
          trendValue="+8%"
        />
        <StatCard
          title="Shuttle Status"
          value={shuttle.zones.filter((z) => z.status === 'RUNNING').length}
          sub={`of ${shuttle.zones.length} zones active`}
          icon={Bus}
          color="#FFC857"
          animate={false}
        />
        <StatCard
          title="Rideshare Wait"
          value={avgRideshareWait}
          sub={rideshare.surgeActive ? 'Surge pricing active' : 'Normal pricing'}
          icon={Car}
          color={avgRideshareWait > 20 ? '#FF4D6D' : '#00E5A8'}
          suffix=" min"
          decimals={0}
          critical={avgRideshareWait > 20}
        />
        <StatCard
          title="Parking"
          value={parkingPct}
          sub={`${parking.occupied.toLocaleString()} / ${parking.totalSpaces.toLocaleString()} spaces`}
          icon={MapPin}
          color={parkingPct >= 85 ? '#FF4D6D' : '#FFC857'}
          suffix="%"
          critical={parkingPct >= 90}
        />
      </div>

      {/* AI Routing Recommendations */}
      <div className="glass-card p-4">
        <SectionHeader
          icon={Brain}
          title="AI Routing Recommendations"
          subtitle="Live autonomous transport optimisation"
          iconColor="text-accent"
        />
        <div className="grid md:grid-cols-2 gap-3">
          {aiRoutingRecs.map((rec, i) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.09 }}
              className={`flex items-start gap-3 p-3 rounded-xl border
                ${rec.urgency === 'HIGH'
                  ? 'bg-danger/10 border-danger/20'
                  : rec.urgency === 'MEDIUM'
                  ? 'bg-warning/10 border-warning/20'
                  : 'bg-accent/10 border-accent/20'}`}
            >
              <div className="mt-0.5 flex-shrink-0">{rec.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-white">{rec.headline}</span>
                  <Badge variant={urgencyVariant[rec.urgency]}>{rec.urgency}</Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{rec.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* ── Metro Lines ── */}
        <div className="glass-card p-4">
          <SectionHeader
            icon={Train}
            title="Metro Rail"
            subtitle={`System: ${metro.status.replace('_', ' ')}`}
            iconColor="text-info"
            action={
              <Badge variant={statusVariant[metro.status] || 'NORMAL'}>
                {metro.status.replace('_', ' ')}
              </Badge>
            }
          />
          <div className="space-y-3">
            {metro.lines.map((line, idx) => (
              <motion.div
                key={line.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-primary/40 rounded-xl p-3 border border-white/5"
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className="text-sm font-bold"
                    style={{ color: lineColors[line.id] || '#fff' }}
                  >
                    {line.name}
                  </span>
                  <Badge variant={statusVariant[line.status] || 'NORMAL'} pulse={line.status === 'DELAYED'}>
                    {line.status}
                  </Badge>
                </div>

                <ProgressBar
                  value={line.capacity}
                  max={100}
                  label={`Load: ${line.capacity}%`}
                  showValue
                  height="h-2"
                />

                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div>
                    <span className="text-slate-500">Frequency </span>
                    <span className="font-bold text-white">{line.frequency}</span>
                  </div>
                  <div>
                    {line.delay > 0 ? (
                      <span className="text-danger flex items-center gap-1">
                        <AlertTriangle size={10} /> +{line.delay} min delay
                      </span>
                    ) : (
                      <span className="text-accent">
                        Next: {line.nextArrival} min
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Shuttle Zones ── */}
        <div className="glass-card p-4">
          <SectionHeader
            icon={Bus}
            title="Shuttle Buses"
            subtitle={`${shuttle.zones.length} zones · ${shuttle.zones.reduce((s, z) => s + z.buses, 0)} buses active`}
            iconColor="text-warning"
          />
          <div className="space-y-3">
            {shuttle.zones.map((zone, idx) => (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-primary/40 rounded-xl p-3 border border-white/5 cursor-pointer hover:border-white/15 transition-colors"
                onClick={() => setExpandedZone(expandedZone === zone.id ? null : zone.id)}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-white">{zone.name}</span>
                  <Badge variant={statusVariant[zone.status] || 'NORMAL'} pulse={zone.status === 'SURGE'}>
                    {zone.status}
                  </Badge>
                </div>

                <ProgressBar
                  value={zone.capacity}
                  max={100}
                  label={`Capacity: ${zone.capacity}%`}
                  showValue
                  height="h-2"
                />

                <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                  <div>
                    <div className="text-slate-500">Buses</div>
                    <div className="font-bold text-white">{zone.buses}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Wait</div>
                    <div className={`font-bold ${zone.waitTime > 15 ? 'text-danger' : zone.waitTime > 8 ? 'text-warning' : 'text-accent'}`}>
                      {zone.waitTime} min
                    </div>
                  </div>
                  <div>
                    <button
                      className="btn-primary text-xs px-2 py-1 mt-1"
                      onClick={(e) => { e.stopPropagation(); handleDispatch(zone.name); }}
                    >
                      + Bus
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Parking ── */}
        <div className="glass-card p-4">
          <SectionHeader
            icon={Car}
            title="Parking Availability"
            subtitle={`${(parking.totalSpaces - parking.occupied).toLocaleString()} spaces remaining`}
            iconColor="text-accent"
          />
          <div className="space-y-3">
            {parking.lots.map((lot, idx) => (
              <motion.div
                key={lot.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                className="bg-primary/40 rounded-xl p-3 border border-white/5"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-white">{lot.name}</span>
                  <Badge variant={statusVariant[lot.status] || 'NORMAL'}>
                    {lot.status.replace('_', ' ')}
                  </Badge>
                </div>
                <ProgressBar
                  value={lot.occupied}
                  max={lot.capacity}
                  label={`${lot.occupied.toLocaleString()} / ${lot.capacity.toLocaleString()}`}
                  showValue
                  height="h-2"
                />
              </motion.div>
            ))}

            {/* Total activity bar */}
            <div className="pt-2 border-t border-white/5">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Total capacity used</span>
                <span className="font-bold text-white">{parkingPct}%</span>
              </div>
              <ProgressBar value={parking.occupied} max={parking.totalSpaces} height="h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Rideshare zone summary */}
      <div className="glass-card p-4">
        <SectionHeader
          icon={Car}
          title="Rideshare Zones"
          subtitle={`Surge pricing ${rideshare.surgeActive ? 'active' : 'inactive'} · Avg wait ${rideshare.avgWaitTime} min`}
          iconColor="text-warning"
          action={
            rideshare.surgeActive
              ? <Badge variant="WARNING" pulse>SURGE ACTIVE</Badge>
              : <Badge variant="SUCCESS">NORMAL</Badge>
          }
        />
        <div className="grid md:grid-cols-2 gap-3">
          {rideshare.zones.map((zone, idx) => (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-4 rounded-xl border ${zone.status === 'BUSY' ? 'bg-warning/5 border-warning/20' : 'bg-accent/5 border-accent/20'}`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-white">{zone.name}</span>
                <Badge variant={zone.status === 'BUSY' ? 'WARNING' : 'SUCCESS'}>{zone.status}</Badge>
              </div>
              <div className="grid grid-cols-3 text-xs gap-2">
                <div>
                  <div className="text-slate-500">Wait</div>
                  <div className={`font-bold text-lg ${zone.waitTime > 15 ? 'text-danger' : 'text-accent'}`}>
                    {zone.waitTime}m
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Vehicles</div>
                  <div className="font-bold text-white">{zone.vehicles}</div>
                </div>
                <div>
                  <div className="text-slate-500">Surge</div>
                  <div className={`font-bold ${zone.surgeMultiplier > 2 ? 'text-danger' : 'text-warning'}`}>
                    {zone.surgeMultiplier}×
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
