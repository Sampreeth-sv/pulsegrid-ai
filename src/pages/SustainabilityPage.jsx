import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Zap, Droplets, Trash2, Wind, Brain, TrendingDown, TrendingUp } from 'lucide-react';
import useStore from '../context/store';
import { RadialBarChart, RadialBar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

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

const energyHistory = [
  { time: '16:00', energy: 2.1, water: 65 }, { time: '17:00', energy: 3.2, water: 88 },
  { time: '18:00', energy: 3.8, water: 102 }, { time: '18:30', energy: 4.1, water: 118 },
  { time: '19:00', energy: 4.2, water: 128 },
];

export default function SustainabilityPage() {
  const { sustainabilityData } = useStore();

  const aiRecs = [
    { text: 'Food Court B waste bins at 91% capacity. Dispatch waste team before halftime surge.', urgency: 'HIGH', action: 'Dispatch team now' },
    { text: 'Energy consumption 28% below baseline. LED optimization working effectively.', urgency: 'LOW', action: 'Maintain settings' },
    { text: 'Predicted food waste of 45kg by match end. Recommend fan donation program activation.', urgency: 'MEDIUM', action: 'Activate program' },
    { text: 'Recycling rate at 68%. Target 75%. Increase volunteer presence at recycling stations.', urgency: 'MEDIUM', action: 'Assign 2 volunteers' },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3">
          <Leaf className="text-accent" size={24} /> Sustainability Intelligence
        </h1>
        <p className="text-slate-400 text-sm mt-1">AI-powered environmental monitoring & recommendations</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Energy Used', value: `${sustainabilityData.energy.current} MWh`, sub: `${sustainabilityData.energy.savings}% below baseline`, icon: Zap, color: '#FFC857', good: true },
          { label: 'Water Usage', value: `${sustainabilityData.water.current} kL/hr`, sub: `${sustainabilityData.water.savings}% saved`, icon: Droplets, color: '#56CCF2', good: true },
          { label: 'Recycling Rate', value: `${sustainabilityData.waste.recyclingRate}%`, sub: 'Target: 75%', icon: Trash2, color: '#00E5A8', good: sustainabilityData.waste.recyclingRate >= 70 },
          { label: 'Carbon Est.', value: `${sustainabilityData.carbon.estimated} tCO₂e`, sub: `Target: ${sustainabilityData.carbon.target}`, icon: Wind, color: '#00E5A8', good: true },
          { label: 'Food Waste', value: `${sustainabilityData.foodWaste.current} kg`, sub: `Projected: ${sustainabilityData.foodWaste.projected}kg`, icon: Leaf, color: '#FFC857', good: false },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">{metric.label}</span>
                <Icon size={14} style={{ color: metric.color }} />
              </div>
              <div className="text-lg font-bold text-white">{metric.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {metric.good ? <TrendingDown size={11} className="text-accent" /> : <TrendingUp size={11} className="text-warning" />}
                <span className={`text-xs ${metric.good ? 'text-accent' : 'text-warning'}`}>{metric.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Energy & Water Chart */}
        <div className="lg:col-span-2 glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-warning" />
            <h2 className="font-bold text-white text-sm">Energy & Water Consumption</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={energyHistory}>
              <defs>
                <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFC857" stopOpacity={0.3} /><stop offset="95%" stopColor="#FFC857" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#56CCF2" stopOpacity={0.3} /><stop offset="95%" stopColor="#56CCF2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="energy" stroke="#FFC857" fill="url(#energyGrad)" name="Energy (MWh)" strokeWidth={2} />
              <Area type="monotone" dataKey="water" stroke="#56CCF2" fill="url(#waterGrad)" name="Water (kL)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Waste Zones */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 size={16} className="text-accent" />
            <h2 className="font-bold text-white text-sm">Waste Bin Status</h2>
          </div>
          <div className="space-y-3">
            {sustainabilityData.waste.zones.map((zone) => (
              <div key={zone.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">{zone.name}</span>
                  <span className={`font-bold ${zone.current >= 85 ? 'text-danger' : zone.current >= 70 ? 'text-warning' : 'text-accent'}`}>{zone.current}%</span>
                </div>
                <div className="h-2 bg-primary rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${zone.current >= 85 ? 'bg-danger' : zone.current >= 70 ? 'bg-warning' : 'bg-accent'}`}
                    animate={{ width: `${zone.current}%` }} transition={{ duration: 0.6 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={16} className="text-accent" />
          <h2 className="font-bold text-white text-sm">AI Sustainability Recommendations</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {aiRecs.map((rec, i) => (
            <div key={i} className={`flex items-start justify-between gap-3 p-3 rounded-xl border ${rec.urgency === 'HIGH' ? 'bg-danger/10 border-danger/20' : rec.urgency === 'MEDIUM' ? 'bg-warning/10 border-warning/20' : 'bg-accent/10 border-accent/20'}`}>
              <p className="text-sm text-slate-300 flex-1">{rec.text}</p>
              <button className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex-shrink-0 ${rec.urgency === 'HIGH' ? 'bg-danger/20 text-danger' : rec.urgency === 'MEDIUM' ? 'bg-warning/20 text-warning' : 'bg-accent/20 text-accent'}`}>
                {rec.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
