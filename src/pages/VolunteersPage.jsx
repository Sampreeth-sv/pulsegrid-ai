import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Star, Battery, CheckCircle, Brain, AlertTriangle,
  Filter, Search, UserCheck, BarChart3, Clock, Zap
} from 'lucide-react';
import useStore from '../context/store';
import VolunteerCard from '../components/VolunteerCard';
import volunteerService from '../services/volunteerService';
import reasoningEngine from '../services/reasoningEngine';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-dark p-3 rounded-xl border border-white/10 text-xs">
        <p className="text-white font-bold mb-1">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="text-slate-300">{p.name}: <span className="text-white font-semibold">{p.value}</span></div>
        ))}
      </div>
    );
  }
  return null;
};

export default function VolunteersPage() {
  const { volunteers, incidents, setVolunteers } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [loadingRec, setLoadingRec] = useState(false);

  const filteredVolunteers = volunteers.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.languages.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'ALL' || v.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: volunteers.length,
    active: volunteers.filter((v) => v.status === 'ACTIVE').length,
    deployed: volunteers.filter((v) => v.status === 'DEPLOYED').length,
    onBreak: volunteers.filter((v) => v.status === 'ON_BREAK').length,
    avgFatigue: Math.round(volunteers.reduce((s, v) => s + v.fatigueScore, 0) / volunteers.length),
    highFatigue: volunteers.filter((v) => v.fatigueScore > 70).length,
  };

  const roleData = volunteers.reduce((acc, v) => {
    const existing = acc.find((r) => r.role === v.role);
    if (existing) { existing.count++; }
    else { acc.push({ role: v.role.split(' ')[0], count: 1 }); }
    return acc;
  }, []);

  const handleGetAIRecommendation = async () => {
    const criticalIncident = incidents.find((i) => i.severity === 'CRITICAL' && i.status === 'ACTIVE');
    if (!criticalIncident) {
      toast('No critical incidents to assign for', { icon: 'ℹ️' });
      return;
    }
    setLoadingRec(true);
    try {
      const rec = await reasoningEngine.generateVolunteerRecommendation(criticalIncident, volunteers);
      setAiRecommendation({ ...rec, incident: criticalIncident });
      toast.success('AI recommendation generated!', { icon: '🤖' });
    } catch (err) {
      toast.error('Failed to generate recommendation');
    } finally {
      setLoadingRec(false);
    }
  };

  const handleAssign = async (volunteer) => {
    const result = await volunteerService.assignVolunteer(
      volunteer.id, 'AI-Assigned Task', 'Stadium Operations'
    );
    if (result.success) {
      const updated = await volunteerService.getAll();
      setVolunteers(updated);
      toast.success(`${volunteer.name} deployed successfully!`, { icon: '✅' });
    }
  };

  const handleRelease = async (id) => {
    await volunteerService.releaseVolunteer(id);
    const updated = await volunteerService.getAll();
    setVolunteers(updated);
    toast.success('Volunteer released', { icon: '↩️' });
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3">
            <Users className="text-accent" size={24} />
            Volunteer Intelligence
          </h1>
          <p className="text-slate-400 text-sm mt-1">AI-powered volunteer tracking, fatigue monitoring & smart deployment</p>
        </div>
        <button
          onClick={handleGetAIRecommendation}
          disabled={loadingRec}
          className="btn-primary"
        >
          <Brain size={16} />
          {loadingRec ? 'Analyzing...' : 'AI Recommend Best Match'}
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: stats.total, color: '#56CCF2' },
          { label: 'Active', value: stats.active, color: '#00E5A8' },
          { label: 'Deployed', value: stats.deployed, color: '#FFC857' },
          { label: 'On Break', value: stats.onBreak, color: '#94a3b8' },
          { label: 'Avg Fatigue', value: `${stats.avgFatigue}%`, color: stats.avgFatigue > 60 ? '#FF4D6D' : '#FFC857' },
          { label: 'High Fatigue', value: stats.highFatigue, color: '#FF4D6D' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-3 text-center">
            <div className="text-xs text-slate-500 mb-1">{stat.label}</div>
            <div className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Left: Charts */}
        <div className="lg:col-span-1 space-y-4">
          {/* Role Distribution */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={15} className="text-accent" />
              <h3 className="font-bold text-white text-sm">By Role</h3>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={roleData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9 }} />
                <YAxis dataKey="role" type="category" tick={{ fontSize: 9 }} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#00E5A8" radius={[0, 3, 3, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Fatigue Monitor */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Battery size={15} className="text-warning" />
              <h3 className="font-bold text-white text-sm">Fatigue Monitor</h3>
            </div>
            <div className="space-y-2.5">
              {volunteers
                .sort((a, b) => b.fatigueScore - a.fatigueScore)
                .slice(0, 5)
                .map((v) => (
                  <div key={v.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 truncate">{v.name.split(' ')[0]}</span>
                      <span className={`font-bold ${v.fatigueScore > 70 ? 'text-danger' : v.fatigueScore > 50 ? 'text-warning' : 'text-accent'}`}>
                        {Math.round(v.fatigueScore)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-primary rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${v.fatigueScore > 70 ? 'bg-danger' : v.fatigueScore > 50 ? 'bg-warning' : 'bg-accent'}`}
                        animate={{ width: `${v.fatigueScore}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                ))}
            </div>
            {stats.highFatigue > 0 && (
              <div className="mt-3 flex items-center gap-2 px-2.5 py-2 bg-danger/10 rounded-lg border border-danger/20">
                <AlertTriangle size={13} className="text-danger" />
                <span className="text-xs text-danger">{stats.highFatigue} volunteer{stats.highFatigue > 1 ? 's' : ''} need rotation</span>
              </div>
            )}
          </div>

          {/* AI Recommendation Panel */}
          {aiRecommendation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-4 border-l-4 border-l-accent"
            >
              <div className="flex items-center gap-2 mb-3">
                <Brain size={15} className="text-accent" />
                <h3 className="font-bold text-white text-sm">AI Recommendation</h3>
              </div>
              <div className="text-xs text-slate-400 mb-2">
                For: {aiRecommendation.incident?.title}
              </div>
              <div className="bg-primary/40 rounded-lg p-3 mb-3">
                <div className="font-bold text-accent text-sm mb-1">{aiRecommendation.recommended?.name}</div>
                <div className="text-xs text-slate-300 leading-relaxed">{aiRecommendation.reason}</div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-slate-500">ETA: {aiRecommendation.eta}</span>
                  <span className="text-xs text-accent font-semibold">Score: {Math.round(aiRecommendation.confidence)}%</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { handleAssign(aiRecommendation.recommended); setAiRecommendation(null); }}
                  className="btn-primary text-xs px-3 py-1.5 flex-1 justify-center"
                >
                  <UserCheck size={12} />
                  Deploy Now
                </button>
                <button
                  onClick={() => setAiRecommendation(null)}
                  className="btn-ghost text-xs px-3 py-1.5"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Volunteer List */}
        <div className="lg:col-span-3">
          {/* Search + Filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, role, language..."
                className="input-field pl-9 text-sm"
              />
            </div>
            <div className="flex gap-1 bg-primary/50 rounded-xl p-1 border border-white/5">
              {['ALL', 'ACTIVE', 'DEPLOYED', 'ON_BREAK'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterStatus === status ? 'bg-accent text-primary' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Volunteer Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredVolunteers.map((vol) => (
                <VolunteerCard
                  key={vol.id}
                  volunteer={vol}
                  onClick={setSelectedVolunteer}
                  showActions
                  onAssign={handleAssign}
                  onRelease={handleRelease}
                />
              ))}
            </AnimatePresence>
          </div>
          {filteredVolunteers.length === 0 && (
            <div className="glass-card p-12 text-center">
              <Users size={40} className="mx-auto mb-4 text-slate-600" />
              <div className="text-slate-400">No volunteers match your search</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
