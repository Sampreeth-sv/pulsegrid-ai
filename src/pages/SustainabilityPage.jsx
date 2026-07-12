import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Zap, Droplets, Trash2, Wind, TrendingDown, TrendingUp, Brain, Sun } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useStore from '../context/store';
import { StatCard, SectionHeader, Badge, ProgressBar } from '../components/ui';

const weeklyEnergy = [
  { day: 'Mon', kwh: 4800, baseline: 5800 }, { day: 'Tue', kwh: 5100, baseline: 5800 },
  { day: 'Wed', kwh: 4400, baseline: 5800 }, { day: 'Thu', kwh: 4700, baseline: 5800 },
  { day: 'Fri', kwh: 5200, baseline: 5800 }, { day: 'Sat', kwh: 4950, baseline: 5800 },
  { day: 'Today', kwh: 4200, baseline: 5800 },
];

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-dark p-3 rounded-xl border border-white/10 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-white font-bold">{p.name}: {p.value}</span>
        </div>
      ))}
    </div>
  );
};

const AI_RECOMMENDATIONS = [
  {
    icon: '🌱', title: 'Solar Panel Optimization',
    body: 'Cloud coverage decreasing at 19:30. Redirect HVAC to solar supplement — estimated 0.4 MWh savings.',
    impact: '−0.4 MWh', color: '#00E5A8',
  },
  {
    icon: '💧', title: 'Grey Water Recycling Alert',
    body: 'Restroom consumption 18% above benchmark. Activate grey water recycling loop in zones B and D.',
    impact: '−22 kL/hr', color: '#56CCF2',
  },
  {
    icon: '♻️', title: 'Food Waste Intervention',
    body: 'Food Court B at 91% waste bin capacity. Dispatch sustainability team + send recycling guidance to volunteers.',
    impact: '−15 kg', color: '#FFC857',
  },
];

export default function SustainabilityPage() {
  const { sustainabilityData } = useStore();
  const { energy, water, waste, carbon, foodWaste } = sustainabilityData;
  const energySavingPct = Math.round((1 - energy.current / energy.baseline) * 100);
  const waterSavingPct = Math.round((1 - water.current / water.baseline) * 100);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3">
          <Leaf className="text-accent" size={24} /> Sustainability Command
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">Live environmental monitoring & AI-driven green recommendations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Energy Usage" value={energy.current} decimals={1} suffix=" MWh"
          sub={`Baseline: ${energy.baseline} MWh`} icon={Zap} color="#FFC857"
          trend="down" trendValue={`−${energySavingPct}%`} />
        <StatCard title="Water Usage" value={water.current} decimals={0} suffix=" kL/hr"
          sub={`Baseline: ${water.baseline} kL/hr`} icon={Droplets} color="#56CCF2"
          trend="down" trendValue={`−${waterSavingPct}%`} />
        <StatCard title="Carbon Footprint" value={carbon.estimated} decimals={0} suffix=" tCO₂e"
          sub={`Target: ${carbon.target} tCO₂e`} icon={Wind} color="#00E5A8"
          trend={carbon.estimated < carbon.target ? 'down' : 'up'} trendValue="On Track" />
        <StatCard title="Food Waste" value={foodWaste.current} decimals={0} suffix=" kg"
          sub={`Projected: ${foodWaste.projected} kg`} icon={Trash2} color="#FF4D6D"
          trend={foodWaste.current < foodWaste.projected * 0.5 ? 'down' : 'up'}
          trendValue={`${Math.round(foodWaste.current / foodWaste.projected * 100)}%`}
          critical={foodWaste.current > 30} />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Energy Trend */}
        <div className="chart-container">
          <SectionHeader icon={Zap} title="Weekly Energy Trend"
            action={<Badge variant="SUCCESS">−{energySavingPct}% vs Baseline</Badge>} />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyEnergy}>
              <defs>
                <linearGradient id="enGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5A8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00E5A8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF4D6D" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#FF4D6D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[3500, 6500]} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="baseline" stroke="#FF4D6D" fill="url(#baseGrad)" name="Baseline kWh" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
              <Area type="monotone" dataKey="kwh" stroke="#00E5A8" fill="url(#enGrad)" name="Actual kWh" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Waste Zones */}
        <div className="chart-container">
          <SectionHeader icon={Trash2} title="Waste Bin Levels"
            action={<span className="text-xs text-slate-500">Real-time IoT sensors</span>} />
          <div className="space-y-3 mt-2">
            {waste.zones.map((zone) => (
              <div key={zone.id}>
                <ProgressBar value={zone.current} max={zone.capacity}
                  label={zone.name} showValue
                  height="h-2.5" />
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent" /><span>Normal</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-warning" /><span>Near Full</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-danger" /><span>Full</span></div>
          </div>
        </div>
      </div>

      {/* Live Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Recycling Rate */}
        <div className="glass-card p-5">
          <SectionHeader icon={Leaf} title="Recycling Rate" />
          <div className="flex items-center justify-center py-4">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <motion.circle cx="18" cy="18" r="15.9" fill="none" stroke="#00E5A8" strokeWidth="3"
                  strokeDasharray="100" strokeLinecap="round"
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 100 - waste.recyclingRate }}
                  transition={{ duration: 1, ease: 'easeOut' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-white">{waste.recyclingRate}%</div>
                <div className="text-xs text-accent">Recycled</div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <Badge variant={waste.recyclingRate >= 70 ? 'SUCCESS' : waste.recyclingRate >= 55 ? 'HIGH' : 'CRITICAL'}>
              {waste.recyclingRate >= 70 ? 'On Target' : waste.recyclingRate >= 55 ? 'Below Target' : 'Action Required'}
            </Badge>
          </div>
        </div>

        {/* Carbon Tracker */}
        <div className="glass-card p-5">
          <SectionHeader icon={Wind} title="Carbon Budget" />
          <ProgressBar value={carbon.estimated} max={carbon.target} label={`${carbon.estimated} / ${carbon.target} tCO₂e`} showValue height="h-3" />
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Remaining budget</span>
              <span className="text-accent font-bold">{carbon.target - carbon.estimated} tCO₂e</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Est. final footprint</span>
              <span className="text-white font-bold">{Math.round(carbon.estimated * 1.3)} tCO₂e</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status</span>
              <Badge variant="SUCCESS">On Track</Badge>
            </div>
          </div>
        </div>

        {/* Solar / Green Energy */}
        <div className="glass-card p-5">
          <SectionHeader icon={Sun} title="Green Energy Mix" />
          <div className="space-y-3 mt-2">
            {[
              { label: 'Solar', pct: 38, color: '#FFC857' },
              { label: 'Grid Renewable', pct: 44, color: '#00E5A8' },
              { label: 'Conventional', pct: 18, color: '#475569' },
            ].map((src) => (
              <div key={src.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{src.label}</span>
                  <span className="font-bold" style={{ color: src.color }}>{src.pct}%</span>
                </div>
                <div className="h-2 bg-primary rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ backgroundColor: src.color }}
                    initial={{ width: 0 }} animate={{ width: `${src.pct}%` }} transition={{ duration: 0.8 }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-accent font-semibold">82% Green Energy Today 🌱</div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="glass-card p-5">
        <SectionHeader icon={Brain} title="AI Sustainability Recommendations" live
          subtitle="Proactive interventions to reduce environmental impact" />
        <div className="grid md:grid-cols-3 gap-4">
          {AI_RECOMMENDATIONS.map((rec, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl bg-primary/40 border border-white/8 hover:border-accent/20 transition-all">
              <div className="text-2xl mb-2">{rec.icon}</div>
              <div className="font-bold text-white text-sm mb-1">{rec.title}</div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{rec.body}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold" style={{ color: rec.color }}>Impact: {rec.impact}</span>
                <button className="text-xs px-2.5 py-1 rounded-lg bg-accent/15 border border-accent/25 text-accent hover:bg-accent/25 transition-all font-medium">
                  Apply
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
