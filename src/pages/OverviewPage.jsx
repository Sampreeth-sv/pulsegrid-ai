import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Activity, AlertTriangle, Heart, TrendingUp, TrendingDown,
  CloudRain, Sun, Wind, Thermometer, Zap, Brain, Shield, Bus,
  CheckCircle, Clock, BarChart3, Map, Droplets
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import useStore from '../context/store';
import GateCard from '../components/GateCard';
import IncidentCard from '../components/IncidentCard';
import ReasoningPanel from '../components/ReasoningPanel';
import SimulationControls from '../components/SimulationControls';
import { StatCard, SectionHeader, Badge, ProgressBar, EmptyState } from '../components/ui';
import { historicalCrowdData } from '../data/mockData';
import { MATCH_PHASES, STADIUM_CONFIG } from '../constants';
import toast from 'react-hot-toast';
import notificationService from '../services/notificationService';

// ─── Custom Tooltip ───────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-dark p-3 rounded-xl border border-white/10 text-xs shadow-xl">
      <p className="text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-bold text-white">{p.value?.toLocaleString?.() ?? p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Stadium SVG Map ─────────────────────────────────────────────
const StadiumMap = ({ gates, onGateClick, selectedGateId }) => (
  <div className="relative w-full aspect-video bg-secondary/30 rounded-2xl border border-white/5 overflow-hidden">
    <div className="absolute inset-0 map-grid opacity-40" />
    <svg viewBox="0 0 100 60" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Outer stadium ring */}
      <ellipse cx="50" cy="30" rx="46" ry="27" fill="none" stroke="rgba(0,229,168,0.12)" strokeWidth="0.5" />
      <ellipse cx="50" cy="30" rx="38" ry="22" fill="none" stroke="rgba(0,229,168,0.08)" strokeWidth="0.3" strokeDasharray="2 2" />
      {/* Pitch */}
      <ellipse cx="50" cy="30" rx="28" ry="17" fill="rgba(0,100,50,0.25)" stroke="rgba(0,229,168,0.25)" strokeWidth="0.3" />
      <line x1="50" y1="13" x2="50" y2="47" stroke="rgba(255,255,255,0.1)" strokeWidth="0.15" />
      <circle cx="50" cy="30" r="4.5" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.15" />
      <rect x="22" y="24" width="6" height="12" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.15" />
      <rect x="72" y="24" width="6" height="12" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.15" />
      {/* Center dot */}
      <circle cx="50" cy="30" r="0.8" fill="rgba(255,255,255,0.2)" />

      {/* Gate indicators */}
      {gates.map((gate) => {
        const risk = gate.riskScore;
        const color = risk >= 90 ? '#FF4D6D' : risk >= 75 ? '#FFC857' : risk >= 55 ? '#FFD468' : '#00E5A8';
        const isSelected = selectedGateId === gate.id;
        const x = gate.position.x;
        const y = gate.position.y * 0.6;
        return (
          <g key={gate.id} style={{ cursor: 'pointer' }} onClick={() => onGateClick?.(gate)}>
            {/* Pulse ring for high-risk gates */}
            {risk >= 70 && (
              <circle cx={x} cy={y} r="5" fill={color} opacity="0.08">
                <animate attributeName="r" values="4;9;4" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.15;0;0.15" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            {/* Selection ring */}
            {isSelected && (
              <circle cx={x} cy={y} r="4" fill="none" stroke={color} strokeWidth="0.6" opacity="0.8">
                <animate attributeName="r" values="4;5.5;4" dur="1.5s" repeatCount="indefinite" />
              </circle>
            )}
            {/* Gate dot */}
            <circle cx={x} cy={y} r="2.8" fill={color} opacity="0.95" />
            {/* Gate ID */}
            <text x={x} y={y - 4} textAnchor="middle" fontSize="2.5" fill="rgba(255,255,255,0.9)" fontWeight="bold">
              {gate.id}
            </text>
            {/* Risk score */}
            <text x={x} y={y + 5.5} textAnchor="middle" fontSize="1.8" fill={color} fontWeight="bold">
              {gate.riskScore}
            </text>
          </g>
        );
      })}

      {/* Scan line */}
      <line x1="0" y1="0" x2="100" y2="0" stroke="rgba(0,229,168,0.25)" strokeWidth="0.3">
        <animateTransform attributeName="transform" type="translate" values="0,0;0,60;0,0" dur="5s" repeatCount="indefinite" />
      </line>

      {/* Corner markers */}
      {[[3, 3], [97, 3], [3, 57], [97, 57]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="0.8" fill="rgba(0,229,168,0.4)" />
        </g>
      ))}
    </svg>

    {/* Overlays */}
    <div className="absolute bottom-3 left-3 flex gap-3">
      {[['#00E5A8', 'Safe'], ['#FFC857', 'Warning'], ['#FF4D6D', 'Critical']].map(([color, label]) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-xs text-slate-400">{label}</span>
        </div>
      ))}
    </div>
    <div className="absolute top-3 left-3 text-xs text-slate-400 font-medium">{STADIUM_CONFIG.name} • Live View</div>
    <div className="absolute top-3 right-3 flex items-center gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full bg-danger animate-ping" />
      <span className="text-xs text-danger font-semibold">LIVE</span>
    </div>
  </div>
);

// ─── Heatmap Grid ─────────────────────────────────────────────────
const HeatmapGrid = ({ data }) => {
  if (!data || !data.length) return null;
  return (
    <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
      {data.map((cell, i) => {
        const pct = cell.density / 100;
        const color = cell.density >= 80 ? '#FF4D6D' : cell.density >= 60 ? '#FFC857' : cell.density >= 40 ? '#FFD468' : '#00E5A8';
        return (
          <motion.div key={i} className="aspect-square rounded-sm heatmap-cell"
            style={{ backgroundColor: color, opacity: 0.15 + pct * 0.85 }}
            animate={{ opacity: 0.15 + pct * 0.85 }}
            title={`Zone ${cell.row},${cell.col}: ${cell.density}%`}
          />
        );
      })}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────
export default function OverviewPage() {
  const {
    gates, incidents, volunteers, aiReasonings, riskForecast, heatmapData,
    resolveIncident, simulationRunning, matchPhase, weatherData, addAIReasoning
  } = useStore();

  const [selectedGate, setSelectedGate] = useState(null);
  const [activeTab, setActiveTab] = useState('map');

  const activeIncidents = incidents.filter((i) => i.status === 'ACTIVE');
  const criticalIncidents = activeIncidents.filter((i) => i.severity === 'CRITICAL');
  const totalOccupancy = gates.reduce((s, g) => s + g.occupancy, 0);
  const totalQueue = gates.reduce((s, g) => s + g.queueLength, 0);
  const avgRisk = Math.round(gates.reduce((s, g) => s + g.riskScore, 0) / gates.length);
  const activeVols = volunteers.filter((v) => v.status !== 'ON_BREAK').length;

  const riskData = [
    { time: '18:00', risk: 32, crowd: 28 },
    { time: '18:15', risk: 41, crowd: 35 },
    { time: '18:30', risk: 55, crowd: 48 },
    { time: '18:45', risk: 63, crowd: 62 },
    { time: '19:00', risk: 72, crowd: 70 },
    { time: 'Now', risk: avgRisk, crowd: Math.max(avgRisk - 5, 10) },
  ];

  const handleResolve = (id) => {
    resolveIncident(id);
    toast.success(`Incident ${id} resolved`, { icon: '✅' });
  };

  const handleBroadcast = async (analysis) => {
    await notificationService.broadcastMessage(
      `Gate ${analysis.gateId} Advisory: ${analysis.actions?.[0] || 'Monitor closely'}`,
      ['app', 'display', 'audio']
    );
    toast.success('Broadcast sent to all channels', { icon: '📢' });
  };

  const weatherIcon = weatherData.condition === 'Clear' ? Sun : weatherData.condition === 'Rain' ? CloudRain : Wind;

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Total Occupancy" value={totalOccupancy} decimals={0}
          sub={`of 82,500 capacity`} icon={Users} color="#00E5A8"
          trend={totalOccupancy > 25000 ? 'up' : 'down'} trendValue={`${Math.round(totalOccupancy/825)}%`}
        />
        <StatCard
          title="Queue Total" value={totalQueue} decimals={0}
          sub="Fans in entry queues" icon={Activity} color="#56CCF2"
          trend={totalQueue > 2000 ? 'up' : 'down'} trendValue={`${Math.round(totalQueue / 50)}%`}
        />
        <StatCard
          title="AI Risk Score" value={avgRisk} suffix="/100"
          sub="System-wide average" icon={Brain}
          color={avgRisk >= 75 ? '#FF4D6D' : avgRisk >= 55 ? '#FFC857' : '#00E5A8'}
          trend={avgRisk > 50 ? 'up' : 'down'} trendValue={`${avgRisk > 50 ? '+' : '-'}${Math.abs(avgRisk - 40)}pts`}
          critical={avgRisk >= 75}
        />
        <StatCard
          title="Active Incidents" value={activeIncidents.length}
          sub={`${criticalIncidents.length} critical`} icon={AlertTriangle}
          color={criticalIncidents.length > 0 ? '#FF4D6D' : '#FFC857'}
          critical={criticalIncidents.length > 0}
        />
        <StatCard
          title="Volunteers Active" value={activeVols} suffix={`/${volunteers.length}`}
          sub="Deployed & Available" icon={CheckCircle} color="#56CCF2"
        />
        <StatCard
          title="Weather" value={weatherData.temp} suffix="°C"
          sub={`${weatherData.condition} · ${weatherData.humidity}% RH`}
          icon={weatherIcon} color="#FFC857" animate
        />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left: Map + Charts */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stadium View */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-4">
              <SectionHeader icon={Map} title="Stadium Intelligence View"
                subtitle={`${STADIUM_CONFIG.name} • ${matchPhase.replace(/_/g, ' ')}`} live />
              <div className="flex gap-1 bg-primary/50 rounded-xl p-1 border border-white/5">
                {[{ id: 'map', label: 'Live Map' }, { id: 'heatmap', label: 'Density' }].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === tab.id ? 'bg-accent text-primary' : 'text-slate-400 hover:text-white'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {activeTab === 'map'
                  ? <StadiumMap gates={gates} onGateClick={setSelectedGate} selectedGateId={selectedGate?.id} />
                  : (
                    <div className="relative rounded-xl overflow-hidden bg-primary/50 p-4">
                      <div className="text-xs text-slate-400 mb-3 font-medium flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        Live Crowd Density Heatmap
                      </div>
                      <HeatmapGrid data={heatmapData} />
                      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                        <span>Low Density</span>
                        <div className="flex gap-1">
                          {['#00E5A8', '#FFD468', '#FFC857', '#FF4D6D'].map((c, i) => (
                            <div key={i} className="w-10 h-2 rounded" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <span>High Density</span>
                      </div>
                    </div>
                  )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Gate Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {gates.map((gate) => (
              <GateCard key={gate.id} gate={gate}
                onClick={setSelectedGate} selected={selectedGate?.id === gate.id} />
            ))}
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="chart-container">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} className="text-danger" />
                <span className="font-bold text-white text-sm">Risk Score Timeline</span>
                <Badge variant={avgRisk >= 75 ? 'CRITICAL' : avgRisk >= 55 ? 'HIGH' : 'SUCCESS'} className="ml-auto">
                  {avgRisk >= 75 ? 'CRITICAL' : avgRisk >= 55 ? 'ELEVATED' : 'SAFE'}
                </Badge>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={riskData}>
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF4D6D" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#FF4D6D" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="crowdGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E5A8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00E5A8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="risk" stroke="#FF4D6D" fill="url(#riskGrad)" name="Risk" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="crowd" stroke="#00E5A8" fill="url(#crowdGrad)" name="Crowd %" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={15} className="text-info" />
                <span className="font-bold text-white text-sm">Gate Distribution</span>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={gates.map((g) => ({ gate: `Gate ${g.id}`, occupancy: g.occupancy, queue: g.queueLength }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="gate" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="occupancy" fill="#00E5A8" name="Inside" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="queue" fill="#FFC857" name="Queue" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historical Chart */}
          <div className="chart-container">
            <div className="flex items-center gap-2 mb-4">
              <Users size={15} className="text-accent" />
              <span className="font-bold text-white text-sm">Historical Fan Arrival by Gate</span>
              <span className="ml-auto text-xs text-slate-500">Today's match · {STADIUM_CONFIG.homeTeam} vs {STADIUM_CONFIG.awayTeam}</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={historicalCrowdData}>
                <defs>
                  {['#00E5A8', '#56CCF2', '#FFC857', '#FF4D6D', '#bf80ff'].map((color, i) => (
                    <linearGradient key={i} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                {['gateA', 'gateB', 'gateC', 'gateD', 'gateE'].map((key, i) => {
                  const colors = ['#00E5A8', '#56CCF2', '#FFC857', '#FF4D6D', '#bf80ff'];
                  return (
                    <Area key={key} type="monotone" dataKey={key} stroke={colors[i]}
                      fill={`url(#grad${i})`} strokeWidth={1.5} name={`Gate ${['A', 'B', 'C', 'D', 'E'][i]}`} dot={false} />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          <SimulationControls />

          {/* Risk Forecast */}
          {riskForecast && (
            <div className="glass-card p-4">
              <SectionHeader icon={Brain} title="AI Risk Forecast"
                action={<Badge variant="INFO">{riskForecast.confidence}% conf.</Badge>} />
              <div className="p-3 bg-primary/40 rounded-xl mb-3 border border-white/5">
                <div className="label-text mb-2">Overall Risk Level</div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 h-3 bg-primary rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-accent to-danger"
                      animate={{ width: `${riskForecast.overallRisk}%` }}
                      transition={{ duration: 0.8 }} />
                  </div>
                  <span className={`text-xl font-bold ${riskForecast.overallRisk >= 75 ? 'text-danger' : riskForecast.overallRisk >= 55 ? 'text-warning' : 'text-accent'}`}>
                    {riskForecast.overallRisk}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{riskForecast.recommendation}</p>
              </div>
              <div className="space-y-2">
                {riskForecast.forecast?.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-12 flex-shrink-0">{f.time}</span>
                    <div className="flex-1 h-1.5 bg-primary rounded-full overflow-hidden">
                      <motion.div className={`h-full rounded-full ${f.risk >= 75 ? 'bg-danger' : f.risk >= 55 ? 'bg-warning' : 'bg-accent'}`}
                        initial={{ width: 0 }} animate={{ width: `${f.risk}%` }}
                        transition={{ delay: i * 0.1, duration: 0.6 }} />
                    </div>
                    <span className="text-xs font-bold text-white w-6 text-right">{f.risk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Decisions */}
          {aiReasonings.length > 0 && (
            <div className="glass-card p-4">
              <SectionHeader icon={Brain} title="Live AI Decisions" live />
              <div className="space-y-3 max-h-72 overflow-y-auto no-scrollbar">
                {aiReasonings.slice(0, 3).map((analysis) => (
                  <ReasoningPanel key={analysis.id} analysis={analysis} compact
                    onApprove={() => toast.success(`Action approved for Gate ${analysis.gateId}`, { icon: '✅' })}
                    onBroadcast={() => handleBroadcast(analysis)}
                    onIgnore={() => toast('Analysis dismissed', { icon: '🚫' })}
                    onEscalate={() => toast.error('Escalated to Emergency Manager', { icon: '🚨' })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Active Incidents */}
          <div className="glass-card p-4">
            <SectionHeader
              icon={AlertTriangle}
              title="Active Incidents"
              iconColor={criticalIncidents.length > 0 ? 'text-danger' : 'text-warning'}
              action={<Badge variant={criticalIncidents.length > 0 ? 'CRITICAL' : 'HIGH'} pulse={criticalIncidents.length > 0}>
                {activeIncidents.length}
              </Badge>}
            />
            <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar">
              {activeIncidents.length === 0
                ? <EmptyState icon={CheckCircle} title="All clear — no active incidents" />
                : activeIncidents.map((inc) => (
                  <IncidentCard key={inc.id} incident={inc} compact onResolve={handleResolve} />
                ))
              }
            </div>
          </div>

          {/* Gate Detail */}
          <AnimatePresence>
            {selectedGate && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedGate.color }} />
                    <span className="font-bold text-white text-sm">{selectedGate.name}</span>
                    <Badge variant={selectedGate.status === 'CRITICAL' ? 'CRITICAL' : selectedGate.status === 'WARNING' || selectedGate.status === 'HIGH' ? 'HIGH' : 'SUCCESS'}>
                      {selectedGate.status}
                    </Badge>
                  </div>
                  <button onClick={() => setSelectedGate(null)} className="text-slate-500 hover:text-slate-300 text-xs px-2 py-1 rounded hover:bg-white/5">
                    Close
                  </button>
                </div>
                <ProgressBar value={selectedGate.occupancy} max={selectedGate.capacity}
                  label="Occupancy" showValue className="mb-3" />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ['Security Staff', selectedGate.securityStaff],
                    ['Medical Staff', selectedGate.medicalStaff],
                    ['Entry Velocity', `${selectedGate.entryVelocity}/min`],
                    ['Avg Wait', `${selectedGate.avgWaitTime.toFixed(1)} min`],
                    ['Queue', selectedGate.queueLength],
                    ['Congestion Pred.', `${selectedGate.congestionPrediction}%`],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-primary/40 rounded-lg p-2">
                      <div className="text-slate-500 mb-0.5">{label}</div>
                      <div className="font-bold text-white">{value}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
