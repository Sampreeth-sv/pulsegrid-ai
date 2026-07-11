import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bus, Train, Car, Clock, AlertTriangle, Brain, TrendingUp, CheckCircle } from 'lucide-react';
import useStore from '../context/store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-dark p-3 rounded-xl border border-white/10 text-xs">
      <p className="text-white font-bold mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="text-slate-300">{p.name}: <span className="text-white font-semibold">{p.value}</span></div>
      ))}
    </div>
  );
};

const statusColor = { OPERATIONAL: 'text-accent', DELAYED: 'text-danger', SURGE: 'text-warning', AVAILABLE: 'text-accent', BUSY: 'text-warning', ALMOST_FULL: 'text-warning', LIMITED: 'text-yellow-300', PARTIAL_DELAY: 'text-warning', SURGE_PRICING: 'text-warning' };
const statusBg = { OPERATIONAL: 'bg-accent/20', DELAYED: 'bg-danger/20', SURGE: 'bg-warning/20', AVAILABLE: 'bg-accent/20', BUSY: 'bg-warning/20', ALMOST_FULL: 'bg-warning/20', LIMITED: 'bg-yellow-400/20', PARTIAL_DELAY: 'bg-warning/20', SURGE_PRICING: 'bg-warning/20' };

export default function TransportPage() {
  const { transportData } = useStore();
  const [activeTab, setActiveTab] = useState('overview');

  const parkingData = transportData.parking.lots.map((lot) => ({
    name: lot.name, occupied: lot.occupied, free: lot.capacity - lot.occupied,
  }));

  const COLORS = ['#FF4D6D', '#00E5A8'];

  const aiInsights = [
    { icon: '🚇', text: 'Metro Line 2 delay will affect ~2,400 fans. Activating 3 extra shuttles from Lot J.', urgency: 'HIGH' },
    { icon: '🚌', text: 'Shuttle Zone J operating at surge capacity. ETA wait time increasing to 18 minutes.', urgency: 'MEDIUM' },
    { icon: '🅿️', text: 'Parking Lot A at 90% capacity. Redirect new arrivals to Lot J (70% capacity).', urgency: 'MEDIUM' },
    { icon: '🚗', text: 'Ride-share Zone North surge pricing active (2.1x). Zone South available with 8-min wait.', urgency: 'LOW' },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3">
            <Bus className="text-accent" size={24} /> Transportation Intelligence
          </h1>
          <p className="text-slate-400 text-sm mt-1">Real-time transport monitoring with AI congestion prediction</p>
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid md:grid-cols-2 gap-3">
        {aiInsights.map((insight, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            className={`flex items-start gap-3 p-3 rounded-xl border ${insight.urgency === 'HIGH' ? 'bg-danger/10 border-danger/20' : insight.urgency === 'MEDIUM' ? 'bg-warning/10 border-warning/20' : 'bg-accent/10 border-accent/20'}`}>
            <span className="text-xl flex-shrink-0">{insight.icon}</span>
            <div>
              <span className={`text-xs font-bold mr-2 ${insight.urgency === 'HIGH' ? 'text-danger' : insight.urgency === 'MEDIUM' ? 'text-warning' : 'text-accent'}`}>AI:</span>
              <span className="text-sm text-slate-300">{insight.text}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Metro */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Train size={18} className="text-info" />
            <h2 className="font-bold text-white">Metro Rail</h2>
            <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${statusBg[transportData.metro.status]} ${statusColor[transportData.metro.status]}`}>{transportData.metro.status.replace('_', ' ')}</span>
          </div>
          <div className="space-y-3">
            {transportData.metro.lines.map((line) => (
              <div key={line.id} className="bg-primary/40 rounded-xl p-3 border border-white/5">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-sm text-white">{line.name}</div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusBg[line.status]} ${statusColor[line.status]}`}>{line.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><div className="text-slate-500">Frequency</div><div className="font-bold text-white">{line.frequency}</div></div>
                  <div><div className="text-slate-500">Load</div><div className={`font-bold ${line.capacity > 85 ? 'text-danger' : 'text-accent'}`}>{line.capacity}%</div></div>
                  <div><div className="text-slate-500">Next</div><div className={`font-bold ${line.delay > 0 ? 'text-danger' : 'text-accent'}`}>{line.delay > 0 ? `+${line.delay}m` : `${line.nextArrival}m`}</div></div>
                </div>
                {line.delay > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-danger">
                    <AlertTriangle size={11} /> {line.delay}-minute delay
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Shuttles */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Bus size={18} className="text-warning" />
            <h2 className="font-bold text-white">Shuttle Buses</h2>
          </div>
          <div className="space-y-3">
            {transportData.shuttle.zones.map((zone) => (
              <div key={zone.id} className="bg-primary/40 rounded-xl p-3 border border-white/5">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-white">{zone.name}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusBg[zone.status]} ${statusColor[zone.status]}`}>{zone.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><div className="text-slate-500">Buses</div><div className="font-bold text-white">{zone.buses}</div></div>
                  <div><div className="text-slate-500">Wait</div><div className={`font-bold ${zone.waitTime > 15 ? 'text-danger' : zone.waitTime > 8 ? 'text-warning' : 'text-accent'}`}>{zone.waitTime}m</div></div>
                  <div><div className="text-slate-500">Load</div><div className="font-bold text-white">{zone.capacity}%</div></div>
                </div>
                <div className="mt-2 h-1.5 bg-primary rounded-full overflow-hidden">
                  <motion.div className={`h-full rounded-full ${zone.capacity > 85 ? 'bg-danger' : zone.capacity > 70 ? 'bg-warning' : 'bg-accent'}`}
                    animate={{ width: `${zone.capacity}%` }} transition={{ duration: 0.5 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Parking Chart */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Car size={18} className="text-accent" />
            <h2 className="font-bold text-white">Parking Availability</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={parkingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="occupied" stackId="a" fill="#FF4D6D" name="Occupied" />
              <Bar dataKey="free" stackId="a" fill="#00E5A8" name="Free" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {transportData.parking.lots.map((lot) => (
              <div key={lot.id} className="flex items-center justify-between text-xs">
                <span className="text-slate-300">{lot.name}</span>
                <span className={`font-bold ${statusColor[lot.status] || 'text-accent'}`}>{lot.status.replace('_', ' ')}</span>
                <span className="text-slate-500">{lot.occupied}/{lot.capacity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
