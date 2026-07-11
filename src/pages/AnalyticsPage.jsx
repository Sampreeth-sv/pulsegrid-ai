import React from 'react';
import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react';
import useStore from '../context/store';
import { historicalCrowdData } from '../data/mockData';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-dark p-3 rounded-xl border border-white/10 text-xs">
      <p className="text-white font-bold mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value?.toLocaleString?.() ?? p.value}</span></div>
      ))}
    </div>
  );
};

const gateColors = ['#00E5A8', '#56CCF2', '#FFC857', '#FF4D6D', '#bf80ff'];

const riskTrend = [
  { time: '16:00', A: 10, B: 8, C: 5, D: 12, E: 4 },
  { time: '17:00', A: 18, B: 22, C: 10, D: 25, E: 8 },
  { time: '18:00', A: 28, B: 45, C: 15, D: 55, E: 10 },
  { time: '18:30', A: 28, B: 62, C: 15, D: 87, E: 12 },
  { time: '19:00', A: 28, B: 62, C: 15, D: 87, E: 12 },
];

const volunteerUtilization = [
  { name: 'Crowd Mgmt', active: 4, deployed: 2, break: 1 },
  { name: 'Medical', active: 2, deployed: 1, break: 0 },
  { name: 'Translation', active: 2, deployed: 1, break: 0 },
  { name: 'Transport', active: 1, deployed: 1, break: 0 },
  { name: 'Accessibility', active: 1, deployed: 0, break: 1 },
];

export default function AnalyticsPage() {
  const { gates, volunteers, incidents } = useStore();

  const resolvedToday = incidents.filter((i) => i.status === 'RESOLVED').length;
  const avgResponse = '4.2 min';
  const totalOccupancy = gates.reduce((s, g) => s + g.occupancy, 0);
  const utilizationRate = Math.round(totalOccupancy / (gates.reduce((s, g) => s + g.capacity, 0)) * 100);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="text-accent" size={24} /> Analytics Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">Historical trends, gate performance & operational analytics</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Stadium Utilization', value: `${utilizationRate}%`, color: '#00E5A8' },
          { label: 'Total Occupancy', value: totalOccupancy.toLocaleString(), color: '#56CCF2' },
          { label: 'Incidents Resolved', value: resolvedToday, color: '#00E5A8' },
          { label: 'Avg Response Time', value: avgResponse, color: '#FFC857' },
        ].map((kpi) => (
          <div key={kpi.label} className="glass-card p-4">
            <div className="text-xs text-slate-500 mb-1">{kpi.label}</div>
            <div className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Historical fan arrival */}
        <div className="chart-container">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-accent" />
            <h3 className="font-bold text-white text-sm">Fan Arrival Rate by Gate</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={historicalCrowdData}>
              <defs>
                {gateColors.map((c, i) => (
                  <linearGradient key={i} id={`ag${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={c} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={c} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              {['gateA','gateB','gateC','gateD','gateE'].map((k, i) => (
                <Area key={k} type="monotone" dataKey={k} stroke={gateColors[i]} fill={`url(#ag${i})`} name={`Gate ${['A','B','C','D','E'][i]}`} strokeWidth={1.5} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Risk trend */}
        <div className="chart-container">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={15} className="text-danger" />
            <h3 className="font-bold text-white text-sm">Risk Score Trend by Gate</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={riskTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              {['A','B','C','D','E'].map((gate, i) => (
                <Line key={gate} type="monotone" dataKey={gate} stroke={gateColors[i]} strokeWidth={2} dot={false} name={`Gate ${gate}`} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Volunteer utilization */}
        <div className="chart-container">
          <div className="flex items-center gap-2 mb-4">
            <Users size={15} className="text-info" />
            <h3 className="font-bold text-white text-sm">Volunteer Utilization by Role</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={volunteerUtilization}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="active" stackId="a" fill="#00E5A8" name="Active" />
              <Bar dataKey="deployed" stackId="a" fill="#FFC857" name="Deployed" />
              <Bar dataKey="break" stackId="a" fill="#475569" name="Break" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gate performance table */}
        <div className="chart-container">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={15} className="text-warning" />
            <h3 className="font-bold text-white text-sm">Gate Performance Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10">
                  {['Gate', 'Occ%', 'Risk', 'Queue', 'Wait', 'Status'].map((h) => (
                    <th key={h} className="text-left text-slate-500 pb-2 pr-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gates.map((gate, i) => (
                  <tr key={gate.id} className="border-b border-white/5">
                    <td className="py-2 pr-3 font-bold" style={{ color: gateColors[i] }}>Gate {gate.id}</td>
                    <td className="py-2 pr-3 text-white">{Math.round(gate.occupancy/gate.capacity*100)}%</td>
                    <td className={`py-2 pr-3 font-bold ${gate.riskScore >= 75 ? 'text-danger' : gate.riskScore >= 55 ? 'text-warning' : 'text-accent'}`}>{gate.riskScore}</td>
                    <td className="py-2 pr-3 text-slate-300">{gate.queueLength}</td>
                    <td className="py-2 pr-3 text-slate-300">{gate.avgWaitTime.toFixed(1)}m</td>
                    <td className="py-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${gate.status === 'CRITICAL' ? 'bg-danger/20 text-danger' : gate.status !== 'NORMAL' ? 'bg-warning/20 text-warning' : 'bg-accent/20 text-accent'}`}>{gate.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
