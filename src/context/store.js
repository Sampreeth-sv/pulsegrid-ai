// Zustand Global Store — Enhanced Live Simulation
import { create } from 'zustand';
import {
  initialGateData, initialVolunteers, initialIncidents,
  initialTransportData, initialSustainabilityData,
  sampleTranslations, accessibilityData
} from '../data/mockData';
import { STADIUM_CONFIG, MATCH_PHASES } from '../constants';
import crowdService from '../services/crowdService';
import volunteerService from '../services/volunteerService';
import notificationService from '../services/notificationService';
import scenarioGenerator from '../services/scenarioGenerator';
import reasoningEngine from '../services/reasoningEngine';

// ─── Helpers ──────────────────────────────────────────────────────
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const drift = (v, min, max, d = 0.05) => clamp(v + (Math.random() - 0.5) * 2 * d * (max - min), min, max);
const driftInt = (v, min, max, d = 0.03) => Math.round(drift(v, min, max, d));

function deriveGateStatus(riskScore) {
  if (riskScore >= 90) return 'CRITICAL';
  if (riskScore >= 75) return 'HIGH';
  if (riskScore >= 55) return 'WARNING';
  return 'NORMAL';
}

function liveTickGates(gates) {
  return gates.map((g) => {
    const newRisk = clamp(drift(g.riskScore, 5, 98, 0.04), 5, 98);
    const occMax = Math.round(g.capacity * 0.95);
    const newOcc = driftInt(g.occupancy, Math.round(g.capacity * 0.05), occMax, 0.02);
    const newQueue = driftInt(g.queueLength, 0, 2000, 0.06);
    const newVel = driftInt(g.entryVelocity, 40, 400, 0.05);
    const newWait = Math.max(0.5, drift(g.avgWaitTime, 0.5, 20, 0.05));
    return {
      ...g,
      riskScore: Math.round(newRisk),
      occupancy: newOcc,
      queueLength: newQueue,
      entryVelocity: newVel,
      avgWaitTime: Number(newWait.toFixed(1)),
      congestionPrediction: clamp(Math.round(newRisk + (Math.random() - 0.5) * 10), 0, 100),
      status: deriveGateStatus(newRisk),
    };
  });
}

function liveTickSustainability(data) {
  return {
    ...data,
    energy: { ...data.energy, current: Math.max(1, drift(data.energy.current, 2, 6, 0.03)) },
    water: { ...data.water, current: Math.round(drift(data.water.current, 80, 200, 0.02)) },
    waste: {
      ...data.waste,
      recyclingRate: clamp(Math.round(drift(data.waste.recyclingRate, 50, 85, 0.01)), 50, 85),
      zones: data.waste.zones.map((z) => ({
        ...z,
        current: clamp(Math.round(drift(z.current, 20, 99, 0.03)), 20, 99),
      })),
    },
    foodWaste: { ...data.foodWaste, current: Math.max(0, Math.round(drift(data.foodWaste.current, 5, 60, 0.04))) },
    carbon: { ...data.carbon, estimated: Math.round(drift(data.carbon.estimated, 100, 170, 0.01)) },
  };
}

function liveTickWeather(w) {
  return {
    ...w,
    temp: Math.round(drift(w.temp, 22, 32, 0.005)),
    humidity: clamp(Math.round(drift(w.humidity, 45, 80, 0.01)), 45, 80),
    wind: Math.max(5, Math.round(drift(w.wind, 5, 25, 0.02))),
  };
}

function liveTickAccessibility(data) {
  return {
    ...data,
    occupiedWheelchairSpaces: clamp(
      driftInt(data.occupiedWheelchairSpaces, 100, data.totalWheelchairSpaces, 0.01),
      0, data.totalWheelchairSpaces
    ),
  };
}

// ─── Realistic AI Reasoning Templates ────────────────────────────
const REASONING_TEMPLATES = [
  (gate) => ({
    type: 'Crowd Risk',
    reasoning: `Crowd density at Gate ${gate.id} exceeded ${gate.riskScore}% for the last 4 minutes. Transit arrivals from Zone ${gate.sector} increased by ${Math.round(5 + Math.random() * 25)}% in the past 8 minutes. Entry velocity at ${gate.entryVelocity} fans/min while the optimal threshold is 200/min. Historical pattern matching shows 94% correlation with surge events.`,
    prediction: `Congestion probability: ${gate.riskScore}%. Estimated crowd peak in ${Math.round(5 + Math.random() * 15)} minutes.`,
    actions: [
      `Redirect fans to Gate ${gate.id === 'D' ? 'C' : gate.id === 'B' ? 'A' : 'B'} immediately`,
      `Deploy ${Math.round(2 + Math.random() * 3)} additional volunteers to zone`,
      `Broadcast multilingual guidance via PA system`,
      `Activate dynamic signage on all entry routes`,
    ],
    impact: `Expected to reduce congestion by ~${Math.round(20 + Math.random() * 20)}% within 10 minutes`,
    riskLevel: gate.riskScore >= 85 ? 'CRITICAL' : gate.riskScore >= 70 ? 'HIGH' : 'MEDIUM',
    confidence: Math.round(82 + Math.random() * 15),
    gateId: gate.id,
    gateName: `Gate ${gate.id}`,
    estimatedResolution: `${Math.round(8 + Math.random() * 12)} minutes`,
    impactForecast: `Affects ~${Math.round(gate.queueLength * 0.6).toLocaleString()} fans in queue`,
  }),
];

// ─── Store ────────────────────────────────────────────────────────
const useStore = create((set, get) => ({
  // === SIMULATION STATE ===
  simulationRunning: false,
  simulationSpeed: 'NORMAL',
  matchPhase: 'CROWD_ARRIVING',
  matchPhaseIndex: 2,
  elapsedSeconds: 0,
  tickCount: 0,

  // === STADIUM STATE ===
  gates: JSON.parse(JSON.stringify(initialGateData)),
  volunteers: JSON.parse(JSON.stringify(initialVolunteers)),
  incidents: JSON.parse(JSON.stringify(initialIncidents)),
  transportData: JSON.parse(JSON.stringify(initialTransportData)),
  sustainabilityData: JSON.parse(JSON.stringify(initialSustainabilityData)),
  accessibilityData: JSON.parse(JSON.stringify(accessibilityData)),
  translations: [...sampleTranslations],
  notifications: notificationService.getAll(),
  heatmapData: [],
  riskForecast: null,
  aiReasonings: [],
  weatherData: { ...STADIUM_CONFIG.weather },

  // === UI STATE ===
  activeMode: 'command',
  sidebarOpen: true,
  notificationDrawerOpen: false,
  architectureModalOpen: false,
  broadcastModalOpen: false,
  selectedGate: null,
  selectedIncident: null,

  // === ACTIONS ===
  setActiveMode: (mode) => set({ activeMode: mode }),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  setNotificationDrawerOpen: (v) => set({ notificationDrawerOpen: v }),
  setArchitectureModalOpen: (v) => set({ architectureModalOpen: v }),
  setBroadcastModalOpen: (v) => set({ broadcastModalOpen: v }),
  setSelectedGate: (gate) => set({ selectedGate: gate }),
  setSelectedIncident: (inc) => set({ selectedIncident: inc }),
  setGates: (gates) => set({ gates }),
  setVolunteers: (volunteers) => set({ volunteers }),
  setNotifications: (notifications) => set({ notifications }),

  addIncident: (incident) => {
    set((s) => ({ incidents: [incident, ...s.incidents].slice(0, 30) }));
    notificationService.add(incident.type, incident.title, incident.description,
      incident.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH');
  },

  resolveIncident: (id) => {
    set((s) => ({
      incidents: s.incidents.map((inc) =>
        inc.id === id ? { ...inc, status: 'RESOLVED', resolvedAt: new Date().toISOString() } : inc
      ),
    }));
    notificationService.add('SUCCESS', 'Incident Resolved', `Incident ${id} marked as resolved.`, 'NORMAL');
  },

  addTranslation: (translation) => {
    set((s) => ({ translations: [translation, ...s.translations].slice(0, 20) }));
    if (translation.medicalAlert) {
      notificationService.add('MEDICAL', 'Medical Alert via Translator', translation.response.substring(0, 80), 'CRITICAL');
    }
    if (translation.securityAlert) {
      notificationService.add('SECURITY', 'Security Alert via Translator', translation.response.substring(0, 80), 'HIGH');
    }
  },

  addAIReasoning: (reasoning) => {
    set((s) => ({ aiReasonings: [reasoning, ...s.aiReasonings].slice(0, 10) }));
  },

  setRiskForecast: (forecast) => set({ riskForecast: forecast }),

  setSimulationSpeed: (speed) => {
    set({ simulationSpeed: speed });
  },

  advanceMatchPhase: () => {
    const { matchPhaseIndex } = get();
    const newIdx = Math.min(matchPhaseIndex + 1, MATCH_PHASES.length - 1);
    set({ matchPhaseIndex: newIdx, matchPhase: MATCH_PHASES[newIdx] });
    notificationService.add('INFO', 'Match Phase Changed', `Stadium now in: ${MATCH_PHASES[newIdx].replace(/_/g, ' ')}`, 'NORMAL');
  },

  // ─── Live Tick ─────────────────────────────────────────────────
  _liveTick: () => {
    const state = get();
    const { gates, sustainabilityData, weatherData, accessibilityData, tickCount } = state;

    // Tick gates
    const newGates = liveTickGates(gates);

    // Tick sustainability every 3 ticks
    const newSustainability = tickCount % 3 === 0
      ? liveTickSustainability(sustainabilityData)
      : sustainabilityData;

    // Tick weather every 10 ticks
    const newWeather = tickCount % 10 === 0 ? liveTickWeather(weatherData) : weatherData;

    // Tick accessibility every 5 ticks
    const newAccessibility = tickCount % 5 === 0
      ? liveTickAccessibility(accessibilityData)
      : accessibilityData;

    set({
      gates: newGates,
      sustainabilityData: newSustainability,
      weatherData: newWeather,
      accessibilityData: newAccessibility,
      tickCount: tickCount + 1,
    });
  },

  startSimulation: () => {
    const { simulationSpeed } = get();
    const INTERVALS = { SLOW: 4000, NORMAL: 2000, FAST: 1000, EXTREME: 400 };
    const interval = INTERVALS[simulationSpeed] || 2000;

    // Main live tick
    const tickTimer = setInterval(() => get()._liveTick(), interval);

    // Volunteer fatigue updater
    const fatigueTimer = setInterval(async () => {
      const vols = await volunteerService.updateFatigueScores();
      set({ volunteers: vols });
    }, 5000);

    // Random incident generator
    const incidentTimer = setInterval(() => {
      const { simulationSpeed: spd } = get();
      const prob = spd === 'EXTREME' ? 0.35 : spd === 'FAST' ? 0.2 : 0.08;
      if (Math.random() < prob) {
        const inc = scenarioGenerator.generateRandomIncident();
        get().addIncident(inc);
      }
    }, 8000);

    // AI reasoning updater
    const reasoningTimer = setInterval(async () => {
      const { gates } = get();
      const criticalGates = gates.filter((g) => g.riskScore > 60);
      if (criticalGates.length > 0) {
        const gate = criticalGates[Math.floor(Math.random() * criticalGates.length)];
        const template = REASONING_TEMPLATES[0](gate);
        get().addAIReasoning({ ...template, id: `AI-${Date.now()}`, timestamp: new Date().toISOString() });
      }
      const forecast = await reasoningEngine.generateRiskForecast(gates, get().matchPhase);
      set({ riskForecast: forecast });
    }, 10000);

    // Notification generator
    const notifTimer = setInterval(() => {
      const { gates } = get();
      const critGate = gates.find((g) => g.riskScore >= 85);
      if (critGate && Math.random() < 0.4) {
        notificationService.add('CROWD', `Gate ${critGate.id} Alert`,
          `Risk score reached ${critGate.riskScore}%. Immediate action recommended.`, 'HIGH');
        set({ notifications: notificationService.getAll() });
      }
    }, 15000);

    set({ simulationRunning: true, _cleanup: [tickTimer, fatigueTimer, incidentTimer, reasoningTimer, notifTimer] });
  },

  pauseSimulation: () => {
    const { _cleanup = [] } = get();
    _cleanup.forEach(clearInterval);
    set({ simulationRunning: false, _cleanup: [] });
  },

  resetSimulation: () => {
    const { _cleanup = [] } = get();
    _cleanup.forEach(clearInterval);
    crowdService.resetSimulation();
    volunteerService.reset();
    set({
      simulationRunning: false,
      gates: JSON.parse(JSON.stringify(initialGateData)),
      volunteers: JSON.parse(JSON.stringify(initialVolunteers)),
      incidents: JSON.parse(JSON.stringify(initialIncidents)),
      translations: [...sampleTranslations],
      aiReasonings: [],
      riskForecast: null,
      matchPhase: 'CROWD_ARRIVING',
      matchPhaseIndex: 2,
      weatherData: { ...STADIUM_CONFIG.weather },
      tickCount: 0,
      _cleanup: [],
    });
    notificationService.add('INFO', 'Simulation Reset', 'All data reset to initial state.', 'NORMAL');
  },

  updateHeatmap: async () => {
    const heatmapData = await crowdService.getDensityHeatmap();
    set({ heatmapData });
  },

  triggerScenario: async (scenarioId) => {
    const result = scenarioGenerator.generateBulkScenario(scenarioId);
    if (result) {
      result.incidents.forEach((inc) => get().addIncident(inc));
      notificationService.add('WARNING', `Scenario: ${scenarioId.replace(/_/g, ' ')}`, result.description, 'HIGH');
    }
  },

  applyUploadedData: async (data, type) => {
    if (type === 'csv') {
      await crowdService.applyCSVData(data);
    } else {
      crowdService.applyJSONData(data);
    }
    const gates = await crowdService.getGateData();
    set({ gates });
    notificationService.add('SUCCESS', 'Data Uploaded', `${type.toUpperCase()} data applied successfully.`, 'NORMAL');
  },

  dismissNotification: (id) => {
    notificationService.dismiss(id);
    set({ notifications: notificationService.getAll() });
  },
}));

// Subscribe to notifications
notificationService.subscribe((notifications) => {
  useStore.setState({ notifications });
});

// Initialize heatmap
crowdService.getDensityHeatmap().then((heatmapData) => {
  useStore.setState({ heatmapData });
});

// Initial AI reasoning run
(async () => {
  const gates = useStore.getState().gates;
  const analyses = await reasoningEngine.analyzeCrowdRisk(gates);
  analyses.forEach((a) => useStore.getState().addAIReasoning(a));
  const forecast = await reasoningEngine.generateRiskForecast(gates, 'CROWD_ARRIVING');
  useStore.setState({ riskForecast: forecast });
})();

export default useStore;
