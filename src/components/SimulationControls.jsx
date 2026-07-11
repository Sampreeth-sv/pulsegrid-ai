import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap, ChevronDown, Clock } from 'lucide-react';
import useStore from '../context/store';
import { SIMULATION_SPEEDS, MATCH_PHASES } from '../constants';
import scenarioGenerator from '../services/scenarioGenerator';
import toast from 'react-hot-toast';

export default function SimulationControls({ compact = false }) {
  const {
    simulationRunning, simulationSpeed, matchPhase,
    startSimulation, pauseSimulation, resetSimulation,
    setSimulationSpeed, triggerScenario, advanceMatchPhase,
  } = useStore();
  const [showScenarios, setShowScenarios] = React.useState(false);
  const scenarios = scenarioGenerator.getAvailableScenarios();
  const speedKeys = Object.keys(SIMULATION_SPEEDS);

  const handleStart = () => {
    startSimulation();
    toast.success('Simulation started', { icon: '▶️' });
  };

  const handlePause = () => {
    pauseSimulation();
    toast('Simulation paused', { icon: '⏸️' });
  };

  const handleReset = () => {
    resetSimulation();
    toast('Simulation reset', { icon: '🔄' });
  };

  const handleScenario = async (scenarioId) => {
    await triggerScenario(scenarioId);
    setShowScenarios(false);
    toast.success(`Scenario "${scenarioId.replace(/_/g, ' ')}" activated!`, { icon: '⚡' });
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {simulationRunning ? (
          <button onClick={handlePause} className="btn-warning text-xs px-3 py-1.5">
            <Pause size={13} /> Pause
          </button>
        ) : (
          <button onClick={handleStart} className="btn-primary text-xs px-3 py-1.5">
            <Play size={13} /> Start
          </button>
        )}
        <button onClick={handleReset} className="btn-ghost text-xs px-3 py-1.5">
          <RotateCcw size={13} /> Reset
        </button>
        <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1 border border-white/5">
          {speedKeys.map((key) => (
            <button
              key={key}
              onClick={() => setSimulationSpeed(key)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                simulationSpeed === key ? 'bg-accent text-primary font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {SIMULATION_SPEEDS[key].label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={16} className="text-accent" />
        <span className="font-display font-bold text-white text-sm">Simulation Controls</span>
        <div className={`ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${
          simulationRunning ? 'bg-accent/20 text-accent' : 'bg-slate-700/50 text-slate-400'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${simulationRunning ? 'bg-accent animate-pulse' : 'bg-slate-600'}`} />
          {simulationRunning ? 'Active' : 'Paused'}
        </div>
      </div>

      {/* Play/Pause/Reset */}
      <div className="flex gap-2 mb-4">
        {simulationRunning ? (
          <button onClick={handlePause} className="btn-warning flex-1 justify-center text-sm">
            <Pause size={15} /> Pause
          </button>
        ) : (
          <button onClick={handleStart} className="btn-primary flex-1 justify-center text-sm">
            <Play size={15} /> {simulationRunning ? 'Resume' : 'Start'}
          </button>
        )}
        <button onClick={handleReset} className="btn-secondary px-4">
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Speed Controls */}
      <div className="mb-4">
        <div className="label-text mb-2">Simulation Speed</div>
        <div className="grid grid-cols-4 gap-1 bg-primary/50 rounded-xl p-1 border border-white/5">
          {speedKeys.map((key) => (
            <button
              key={key}
              onClick={() => setSimulationSpeed(key)}
              className={`py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                simulationSpeed === key
                  ? 'bg-accent text-primary shadow-glow-accent'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {SIMULATION_SPEEDS[key].label}
            </button>
          ))}
        </div>
      </div>

      {/* Match Phase */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="label-text">Match Phase</div>
          <button onClick={advanceMatchPhase} className="text-xs text-accent hover:underline flex items-center gap-1">
            <Clock size={11} /> Advance
          </button>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-xl border border-white/5">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-sm text-white font-medium">{matchPhase.replace(/_/g, ' ')}</span>
          <span className="text-xs text-slate-500 ml-auto">
            {MATCH_PHASES.indexOf(matchPhase) + 1}/{MATCH_PHASES.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 bg-primary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            animate={{ width: `${((MATCH_PHASES.indexOf(matchPhase) + 1) / MATCH_PHASES.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Scenario Triggers */}
      <div>
        <button
          onClick={() => setShowScenarios(!showScenarios)}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-secondary/50 rounded-xl border border-white/5 text-sm text-slate-300 hover:text-white transition-colors"
        >
          <span className="font-medium">Trigger Scenario</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${showScenarios ? 'rotate-180' : ''}`}
          />
        </button>
        {showScenarios && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 space-y-1.5"
          >
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => handleScenario(scenario.id)}
                className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl bg-primary/50 hover:bg-secondary/50 border border-white/5 transition-all text-left group"
              >
                <div className={`mt-0.5 px-1.5 py-0.5 rounded text-xs font-bold ${
                  scenario.severity === 'CRITICAL' ? 'bg-danger/20 text-danger' :
                  scenario.severity === 'HIGH' ? 'bg-warning/20 text-warning' :
                  'bg-accent/20 text-accent'
                }`}>
                  {scenario.severity}
                </div>
                <div>
                  <div className="text-sm font-medium text-white group-hover:text-accent transition-colors">{scenario.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{scenario.description}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
