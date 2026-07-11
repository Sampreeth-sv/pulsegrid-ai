import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Activity, AlertTriangle, Heart, TrendingUp, TrendingDown,
  CloudRain, Sun, Wind, Thermometer, Zap, Brain, Shield, Bus,
  CheckCircle, Clock, BarChart3, Map
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion as m } from 'framer-motion';
import useStore from '../context/store';
import GateCard from '../components/GateCard';
import IncidentCard from '../components/IncidentCard';
import ReasoningPanel from '../components/ReasoningPanel';
import SimulationControls from '../components/SimulationControls';
import { historicalCrowdData } from '../data/mockData';
import { MATCH_PHASES, STADIUM_CONFIG } from '../constants';
import toast from 'react-hot-toast';
import notificationService from '../services/notificationService';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-dark p-3 rounded-xl border border-white/10 text-xs">
        <p className="text-slate-400 mb-1.5 font-medium">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-slate-300">{p.name}:</span>
            <span className="font-bold text-white">{p.value?.toLocaleString?.() ?? p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const MetricCard = ({ title, value, sub, icon: Icon, color, trend, trendValue }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-4 relative overflow-hidden group"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/2 opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="flex items-start justify-between mb-3">
      <div className="label-text">{title}</div>
      <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <Icon size={15} style={{ color }} />
      </div>
    </div>
    <div className="value-text mb-1">{value}</div>
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500">{sub}</span>
      {trend && (
        <div className={`flex items-center gap-0.5 text-xs font-semibold ${trend === 'up' ? 'text-danger' : 'text-accent'}`}>
          {trend === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {trendValue}
        </div>
      )}
    </div>
  </motion.div>
);

const StadiumMap = ({ gates }) => (
  <div className="relative w-full aspect-video bg-secondary/30 rounded-2xl border border-white/5 overflow-hidden map-grid">
    {/* Stadium SVG */}
    <svg viewBox="0 0 100 60" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Outer stadium */}
      <ellipse cx="50" cy="30" rx="45" ry="27" fill="none" stroke="rgba(0,229,168,0.15)" strokeWidth="0.5" />
      {/* Field */}
      <ellipse cx="50" cy="30" rx="30" ry="18" fill="rgba(0,100,50,0.3)" stroke="rgba(0,229,168,0.3)" strokeWidth="0.3" />
      {/* Center line */}
      <line x1="50" y1="12" x2="50" y2="48" stroke="rgba(255,255,255,0.15)" strokeWidth="0.2" />
      {/* Center circle */}
      <circle cx="50" cy="30" r="5" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.2" />
      {/* Penalty boxes */}
      <rect x="20" y="23" width="8" height="14" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.2" />
      <rect x="72" y="23" width="8" height="14" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.2" />

      {/* Gate indicators */}
      {gates.map((gate) => {
        const risk = gate.riskScore;
        const color = risk >= 90 ? '#FF4D6D' : risk >= 75 ? '#FFC857' : risk >= 55 ? '#FFD468' : '#00E5A8';
        const pulse = risk >= 75;
        const x = gate.position.x;
        const y = gate.position.y * 0.6;
        return (
          <g key={gate.id}>
            {pulse && (
              <circle cx={x} cy={y} r="4" fill={color} opacity="0.15">
                <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.2;0;0.2" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            <circle cx={x} cy={y} r="2.5" fill={color} opacity="0.9" />
            <text x={x} y={y - 3.5} textAnchor="middle" fontSize="2.5" fill="rgba(255,255,255,0.8)" fontWeight="bold">
              {gate.id}
            </text>
            <text x={x} y={y + 5} textAnchor="middle" fontSize="1.8" fill={color}>
              {gate.riskScore}%
            </text>
          </g>
        );
      })}

      {/* Scan line animation */}
      <line x1="0" y1="0" x2="100" y2="0" stroke="rgba(0,229,168,0.3)" strokeWidth="0.3">
        <animateTransform attributeName="transform" type="translate" values="0,0;0,60;0,0" dur="6s" repeatCount="indefinite" />
      </line>
    </svg>

    {/* Legend */}
    <div className="absolute bottom-3 left-3 flex gap-3">
      {[
        { color: '#00E5A8', label: 'Safe' },
        { color: '#FFC857', label: 'Warning' },
        { color: '#FF4D6D', label: 'Critical' },
      ].map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-xs text-slate-400">{item.label}</span>
        </div>
      ))}
    </div>

    {/* Stadium Label */}
    <div className="absolute top-3 left-3 text-xs text-slate-400 font-medium">
      {STADIUM_CONFIG.name} • Live View
    </div>
    <div className="absolute top-3 right-3 flex items-center gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
      <span className="text-xs text-accent font-semibold">LIVE</span>
    </div>
  </div>
);

const HeatmapGrid = ({ data }) => {
  if (!data || !data.length) return null;
  return (
    <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
      {data.map((cell, i) => {
        const opacity = cell.density / 100;
        const color = cell.density >= 80 ? '#FF4D6D' : cell.density >= 60 ? '#FFC857' : cell.density >= 40 ? '#FFD468' : '#00E5A8';
        return (
          <motion.div
            key={i}
            className="aspect-square rounded-sm heatmap-cell"
            style={{ backgroundColor: color, opacity: 0.2 + opacity * 0.8 }}
            animate={{ opacity: 0.2 + opacity * 0.8 }}
            title={`Zone ${cell.row},${cell.col}: ${cell.density}%`}
          />
        );
      })}
    </div>
  );
};

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

  // Gate occupancy for pie chart
  const gatePieData = gates.map((g) => ({ name: `Gate ${g.id}`, value: g.occupancy, color: g.color }));

  // Risk over time mock data
  const riskData = [
    { time: '18:00', risk: 32, crowd: 28 },
    { time: '18:15', risk: 41, crowd: 35 },
    { time: '18:30', risk: 55, crowd: 48 },
    { time: '18:45', risk: 63, crowd: 62 },
    { time: '19:00', risk: 72, crowd: 70 },
    { time: '19:15', risk: avgRisk, crowd: avgRisk - 5 },
  ];

  const handleResolve = (id) => {
    resolveIncident(id);
    toast.success(`Incident ${id} resolved`, { icon: '✅' });
  };

  const handleBroadcast = async (analysis) => {
    await notificationService.broadcastMessage(
      `Gate ${analysis.gateId} Advisory: ${analysis.actions[0]}`,
      ['app', 'display', 'audio']
    );
    toast.success('Broadcast sent to all channels', { icon: '📢' });
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <MetricCard
          title="Total Occupancy"
          value={totalOccupancy.toLocaleString()}
          sub={`of 82,500 capacity`}
          icon={Users}
          color="#00E5A8"
          trend="up"
          trendValue="+8%"
        />
        <MetricCard
          title="Queue Total"
          value={totalQueue.toLocaleString()}
          sub="Fans in entry queues"
          icon={Activity}
          color="#56CCF2"
          trend={totalQueue > 2000 ? 'up' : 'down'}
          trendValue={`${Math.round(totalQueue / 100)}%`}
        />
        <MetricCard
          title="AI Risk Score"
          value={`${avgRisk}/100`}
          sub="System-wide average"
          icon={Brain}
          color={avgRisk >= 75 ? '#FF4D6D' : avgRisk >= 55 ? '#FFC857' : '#00E5A8'}
          trend={avgRisk > 50 ? 'up' : 'down'}
          trendValue={`${avgRisk > 50 ? '+' : '-'}${Math.abs(avgRisk - 40)}pts`}
        />
        <MetricCard
          title="Active Incidents"
          value={activeIncidents.length}
          sub={`${criticalIncidents.length} critical`}
          icon={AlertTriangle}
          color={criticalIncidents.length > 0 ? '#FF4D6D' : '#FFC857'}
        />
        <MetricCard
          title="Volunteers Active"
          value={`${activeVols}/${volunteers.length}`}
          sub="Deployed & Available"
          icon={CheckCircle}
          color="#56CCF2"
        />
        <MetricCard
          title="Weather"
          value={`${weatherData.temp}°C`}
          sub={`${weatherData.condition} • ${weatherData.humidity}% RH`}
          icon={weatherData.condition === 'Clear' ? Sun : CloudRain}
          color="#FFC857"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left: Map + Heatmap */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stadium View Tabs */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Map size={18} className="text-accent" />
                <h2 className="font-display font-bold text-white">Stadium Intelligence View</h2>
              </div>
              <div className="flex gap-1 bg-primary/50 rounded-xl p-1 border border-white/5">
                {[
                  { id: 'map', label: 'Live Map' },
                  { id: 'heatmap', label: 'Density' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === tab.id ? 'bg-accent text-primary' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            {activeTab === 'map' ? (
              <StadiumMap gates={gates} />
            ) : (
              <div className="relative rounded-xl overflow-hidden bg-primary/50 p-3">
                <div className="text-xs text-slate-400 mb-2 font-medium">Crowd Density Heatmap</div>
                <HeatmapGrid data={heatmapData} />
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Low Density</span>
                  <div className="flex gap-1">
                    {['#00E5A8', '#FFD468', '#FFC857', '#FF4D6D'].map((c, i) => (
                      <div key={i} className="w-8 h-2 rounded" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span>High Density</span>
                </div>
              </div>
            )}
          </div>

          {/* Gate Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {gates.map((gate) => (
              <GateCard
                key={gate.id}
                gate={gate}
                onClick={setSelectedGate}
                selected={selectedGate?.id === gate.id}
              />
            ))}
          </div>

          {/* Analytics Charts */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="chart-container">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} className="text-accent" />
                <h3 className="font-bold text-white text-sm">Risk Score Timeline</h3>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={riskData}>
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF4D6D" stopOpacity={0.3} />
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
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="risk" stroke="#FF4D6D" fill="url(#riskGrad)" name="Risk" strokeWidth={2} />
                  <Area type="monotone" dataKey="crowd" stroke="#00E5A8" fill="url(#crowdGrad)" name="Crowd" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={15} className="text-info" />
                <h3 className="font-bold text-white text-sm">Gate Crowd Distribution</h3>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={gates.map((g) => ({ gate: `Gate ${g.id}`, occupancy: g.occupancy, queue: g.queueLength }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="gate" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="occupancy" fill="#00E5A8" name="Inside" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="queue" fill="#FFC857" name="Queue" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historical Crowd Chart */}
          <div className="chart-container">
            <div className="flex items-center gap-2 mb-4">
              <Users size={15} className="text-accent" />
              <h3 className="font-bold text-white text-sm">Historical Fan Arrival by Gate</h3>
              <div className="ml-auto text-xs text-slate-500">Today's match</div>
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
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                {['gateA', 'gateB', 'gateC', 'gateD', 'gateE'].map((key, i) => {
                  const colors = ['#00E5A8', '#56CCF2', '#FFC857', '#FF4D6D', '#bf80ff'];
                  return (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={colors[i]}
                      fill={`url(#grad${i})`}
                      strokeWidth={1.5}
                      name={`Gate ${['A','B','C','D','E'][i]}`}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Simulation Controls */}
          <SimulationControls />

          {/* Risk Forecast */}
          {riskForecast && (
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain size={16} className="text-accent" />
                <span className="font-bold text-white text-sm">AI Risk Forecast</span>
                <span className="ml-auto text-xs text-accent">{riskForecast.confidence}% confident</span>
              </div>
              <div className="p-3 bg-primary/40 rounded-xl mb-3 border border-white/5">
                <div className="label-text mb-1">Overall Risk</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-primary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-danger"
                      animate={{ width: `${riskForecast.overallRisk}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                  <span className={`text-xl font-bold ${riskForecast.overallRisk >= 75 ? 'text-danger' : riskForecast.overallRisk >= 55 ? 'text-warning' : 'text-accent'}`}>
                    {riskForecast.overallRisk}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{riskForecast.recommendation}</p>
              </div>
              <div className="space-y-2">
                {riskForecast.forecast?.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-12 flex-shrink-0">{f.time}</span>
                    <div className="flex-1 h-1.5 bg-primary rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${f.risk >= 75 ? 'bg-danger' : f.risk >= 55 ? 'bg-warning' : 'bg-accent'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${f.risk}%` }}
                        transition={{ delay: i * 0.1, duration: 0.6 }}
                      />
                    </div>
                    <span className="text-xs font-bold text-white w-8 text-right">{f.risk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Reasonings */}
          {aiReasonings.length > 0 && (
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain size={16} className="text-accent" />
                <span className="font-bold text-white text-sm">Live AI Decisions</span>
                <div className="ml-auto flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="text-xs text-accent">Active</span>
                </div>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar">
                {aiReasonings.slice(0, 3).map((analysis) => (
                  <ReasoningPanel
                    key={analysis.id}
                    analysis={analysis}
                    compact
                    onApprove={() => toast.success(`Action approved for Gate ${analysis.gateId}`, { icon: '✅' })}
                    onBroadcast={() => handleBroadcast(analysis)}
                    onIgnore={() => toast(`Analysis dismissed`, { icon: '🚫' })}
                    onEscalate={() => toast.error(`Escalated to Emergency Manager`, { icon: '🚨' })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Active Incidents */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className={criticalIncidents.length > 0 ? 'text-danger' : 'text-warning'} />
              <span className="font-bold text-white text-sm">Active Incidents</span>
              <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${
                criticalIncidents.length > 0 ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'
              }`}>
                {activeIncidents.length}
              </span>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar">
              {activeIncidents.length === 0 ? (
                <div className="text-center text-slate-500 text-sm py-6">
                  <CheckCircle size={24} className="mx-auto mb-2 text-accent opacity-50" />
                  All clear — no active incidents
                </div>
              ) : (
                activeIncidents.map((inc) => (
                  <IncidentCard
                    key={inc.id}
                    incident={inc}
                    compact
                    onResolve={handleResolve}
                  />
                ))
              )}
            </div>
          </div>

          {/* Gate Detail Panel */}
          {selectedGate && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedGate.color }} />
                  <span className="font-bold text-white text-sm">{selectedGate.name} Details</span>
                </div>
                <button onClick={() => setSelectedGate(null)} className="text-slate-500 hover:text-slate-300 text-xs">
                  Close
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'Security Staff', value: selectedGate.securityStaff },
                  { label: 'Medical Staff', value: selectedGate.medicalStaff },
                  { label: 'Entry Velocity', value: `${selectedGate.entryVelocity}/min` },
                  { label: 'Exit Velocity', value: `${selectedGate.exitVelocity}/min` },
                  { label: 'Avg Wait', value: `${selectedGate.avgWaitTime.toFixed(1)} min` },
                  { label: 'Congestion Pred.', value: `${selectedGate.congestionPrediction}%` },
                ].map((item) => (
                  <div key={item.label} className="bg-primary/40 rounded-lg p-2">
                    <div className="text-slate-500 mb-0.5">{item.label}</div>
                    <div className="font-bold text-white">{item.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
