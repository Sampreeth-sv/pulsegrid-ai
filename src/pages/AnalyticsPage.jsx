import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Activity, BarChart3 } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { StatCard, SectionHeader, Badge } from '../components/ui';
import useStore from '../context/store';
import { historicalCrowdData } from '../data/mockData';

// ─── Static analytics data ────────────────────────────────────────
const gateColors = ['#00E5A8', '#56CCF2', '#FFC857', '#FF4D6D', '#bf80ff'];
const gateKeys   = ['gateA', 'gateB', 'gateC', 'gateD', 'gateE'];
const gateLabels = ['Gate A', 'Gate B', 'Gate C', 'Gate D', 'Gate E'];

const riskTrend = [
  { time: '16:00', A: 10, B: 8,  C: 5,  D: 12, E: 4  },
  { time: '17:00', A: 18, B: 22, C: 10, D: 25, E: 8  },
  { time: '18:00', A: 28, B: 45, C: 15, D: 55, E: 10 },
  { time: '18:30', A: 28, B: 62, C: 15, D: 87, E: 12 },
  { time: '19:00', A: 28, B: 62, C: 15, D: 87, E: 12 },
];

const volunteerUtilization = [
  { name: 'Crowd Mgmt',     active: 4, deployed: 2, onBreak: 1 },
  { name: 'Medical',        active: 2, deployed: 1, onBreak: 0 },
  { name: 'Translation',    active: 2, deployed: 1, onBreak: 0 },
  { name: 'Transport',      active: 1, deployed: 1, onBreak: 0 },
  { name: 'Accessibility',  active: 1, deployed: 0, onBreak: 1 },
];

// ─── Custom tooltip ───────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-dark p-3 rounded-xl border border-white/10 text-xs shadow-xl">
      <p className="text-white font-bold mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-bold text-white">{p.value?.toLocaleString?.() ?? p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Shared chart axis styles ─────────────────────────────────────
const axisStyle   = { fontSize: 10, fill: '#64748b' };
const gridStyle   = { stroke: 'rgba(255,255,255,0.05)', strokeDasharray: '3 3' };

// ─── Component ────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { gates, volunteers, incidents } = useStore();

  const resolvedToday   = incidents.filter((i) => i.status === 'RESOLVED').length;
  const totalOccupancy  = gates.reduce((s, g) => s + g.occupancy, 0);
  const totalCapacity   = gates.reduce((s, g) => s + g.capacity, 0);
  const utilizationRate = Math.round((totalOccupancy / totalCapacity) * 100);
  const criticalGates   = gates.filter((g) => g.riskScore >= 75).length;

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <SectionHeader
          icon={BarChart3}
          title="Analytics Dashboard"
          subtitle="Historical trends, gate performance & operational analytics"
          live
          iconColor="text-accent"
        />
      </motion.div>

      {/* KPI StatCards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Stadium Utilization"
          value={utilizationRate}
          sub={`${totalOccupancy.toLocaleString()} fans inside`}
          icon={TrendingUp}
          color="#00E5A8"
          suffix="%"
          trend="up"
          trendValue="+4%"
        />
        <StatCard
          title="Total Occupancy"
          value={totalOccupancy}
          sub={`of ${totalCapacity.toLocaleString()} capacity`}
          icon={Users}
          color="#56CCF2"
        />
        <StatCard
          title="Incidents Resolved"
          value={resolvedToday}
          sub="today"
          icon={Activity}
          color="#00E5A8"
        />
        <StatCard
          title="Critical Gates"
          value={criticalGates}
          sub="risk score ≥ 75"
          icon={BarChart3}
          color={criticalGates >= 2 ? '#FF4D6D' : '#FFC857'}
          critical={criticalGates >= 2}
        />
      </div>

      {/* Charts 2×2 grid */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* ── Fan Arrival AreaChart ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="chart-container"
        >
          <SectionHeader
            icon={TrendingUp}
            title="Fan Arrival Rate by Gate"
            subtitle="Historical crowd arrival per 30-min interval"
            iconColor="text-accent"
          />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={historicalCrowdData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                {gateColors.map((c, i) => (
                  <linearGradient key={i} id={`ag${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={c} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={c} stopOpacity={0}   />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="time"  tick={axisStyle} />
              <YAxis               tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              {gateKeys.map((k, i) => (
                <Area
                  key={k}
                  type="monotone"
                  dataKey={k}
                  stroke={gateColors[i]}
                  fill={`url(#ag${i})`}
                  name={gateLabels[i]}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ── Risk Score LineChart ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="chart-container"
        >
          <SectionHeader
            icon={Activity}
            title="Risk Score Trend by Gate"
            subtitle="Crowd risk index (0–100) over time"
            iconColor="text-danger"
          />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={riskTrend} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="time" tick={axisStyle} />
              <YAxis tick={axisStyle} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              {/* Danger threshold reference */}
              {['A', 'B', 'C', 'D', 'E'].map((gate, i) => (
                <Line
                  key={gate}
                  type="monotone"
                  dataKey={gate}
                  stroke={gateColors[i]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  name={`Gate ${gate}`}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ── Volunteer Utilization BarChart ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="chart-container"
        >
          <SectionHeader
            icon={Users}
            title="Volunteer Utilization by Role"
            subtitle="Active / deployed / on-break breakdown"
            iconColor="text-info"
          />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={volunteerUtilization} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="name" tick={{ ...axisStyle, fontSize: 9 }} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="active"   stackId="a" fill="#00E5A8" name="Active"   />
              <Bar dataKey="deployed" stackId="a" fill="#FFC857" name="Deployed" />
              <Bar dataKey="onBreak"  stackId="a" fill="#475569" name="Break"    radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ── Gate Performance Table ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="chart-container"
        >
          <SectionHeader
            icon={BarChart3}
            title="Gate Performance Comparison"
            subtitle="Live gate-by-gate operational metrics"
            iconColor="text-warning"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10">
                  {['Gate', 'Occ %', 'Risk', 'Queue', 'Wait', 'Velocity', 'Status'].map((h) => (
                    <th key={h} className="text-left text-slate-500 pb-2 pr-3 font-semibold tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gates.map((gate, i) => {
                  const occPct = Math.round((gate.occupancy / gate.capacity) * 100);
                  return (
                    <motion.tr
                      key={gate.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.06 }}
                      className="border-b border-white/5 hover:bg-white/2 transition-colors"
                    >
                      <td className="py-2 pr-3 font-bold" style={{ color: gateColors[i] }}>
                        Gate {gate.id}
                      </td>
                      <td className="py-2 pr-3 text-white font-semibold">{occPct}%</td>
                      <td className={`py-2 pr-3 font-bold ${gate.riskScore >= 75 ? 'text-danger' : gate.riskScore >= 55 ? 'text-warning' : 'text-accent'}`}>
                        {gate.riskScore}
                      </td>
                      <td className="py-2 pr-3 text-slate-300">{gate.queueLength.toLocaleString()}</td>
                      <td className="py-2 pr-3 text-slate-300">{gate.avgWaitTime.toFixed(1)} m</td>
                      <td className="py-2 pr-3 text-slate-300">{gate.entryVelocity}/min</td>
                      <td className="py-2">
                        <Badge
                          variant={
                            gate.status === 'CRITICAL' ? 'CRITICAL'
                            : gate.status === 'HIGH'    ? 'HIGH'
                            : gate.status === 'WARNING' ? 'WARNING'
                            : 'SUCCESS'
                          }
                          pulse={gate.status === 'CRITICAL'}
                        >
                          {gate.status}
                        </Badge>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
