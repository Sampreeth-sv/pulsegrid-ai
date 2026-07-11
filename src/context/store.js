// Zustand Global Store
import { create } from 'zustand';
import { initialGateData, initialVolunteers, initialIncidents, initialTransportData, initialSustainabilityData, sampleTranslations, accessibilityData } from '../data/mockData';
import { STADIUM_CONFIG, MATCH_PHASES } from '../constants';
import crowdService from '../services/crowdService';
import volunteerService from '../services/volunteerService';
import notificationService from '../services/notificationService';
import scenarioGenerator from '../services/scenarioGenerator';
import reasoningEngine from '../services/reasoningEngine';

const useStore = create((set, get) => ({
  // === SIMULATION STATE ===
  simulationRunning: false,
  simulationSpeed: 'NORMAL',
  matchPhase: 'CROWD_ARRIVING',
  matchPhaseIndex: 2,
  elapsedSeconds: 0,

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

  // === UI STATE ===
  activeMode: 'command',
  sidebarOpen: true,
  notificationDrawerOpen: false,
  architectureModalOpen: false,
  broadcastModalOpen: false,
  selectedGate: null,
  selectedIncident: null,
  weatherData: STADIUM_CONFIG.weather,

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
    notificationService.add(incident.type, incident.title, incident.description, incident.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH');
  },

  resolveIncident: (id) => {
    set((s) => ({
      incidents: s.incidents.map((inc) =>
        inc.id === id ? { ...inc, status: 'RESOLVED', resolvedAt: new Date().toISOString() } : inc
      ),
    }));
    notificationService.add('SUCCESS', 'Incident Resolved', `Incident ${id} has been marked as resolved.`, 'NORMAL');
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
    const { simulationRunning, matchPhase } = get();
    if (simulationRunning) {
      crowdService.stopSimulation();
      crowdService.startSimulation(matchPhase, speed, (gates) => {
        get().setGates(gates);
        get().updateHeatmap();
      });
    }
  },

  advanceMatchPhase: () => {
    const { matchPhaseIndex } = get();
    const newIdx = Math.min(matchPhaseIndex + 1, MATCH_PHASES.length - 1);
    set({ matchPhaseIndex: newIdx, matchPhase: MATCH_PHASES[newIdx] });
    notificationService.add('INFO', 'Match Phase Changed', `Stadium now in: ${MATCH_PHASES[newIdx].replace(/_/g, ' ')}`, 'NORMAL');
  },

  startSimulation: () => {
    const { matchPhase, simulationSpeed } = get();
    crowdService.startSimulation(matchPhase, simulationSpeed, (gates) => {
      get().setGates(gates);
    });

    // Volunteer fatigue updater
    const fatigue = setInterval(async () => {
      const vols = await volunteerService.updateFatigueScores();
      set({ volunteers: vols });
    }, 5000);

    // Random incident generator
    const incidentTimer = setInterval(() => {
      const { incidents, simulationSpeed: spd } = get();
      if (Math.random() < (spd === 'EXTREME' ? 0.4 : spd === 'FAST' ? 0.25 : 0.1)) {
        const inc = scenarioGenerator.generateRandomIncident();
        get().addIncident(inc);
      }
    }, 8000);

    // AI reasoning updater
    const reasoningTimer = setInterval(async () => {
      const { gates } = get();
      const analyses = await reasoningEngine.analyzeCrowdRisk(gates);
      analyses.forEach((a) => get().addAIReasoning(a));
      const forecast = await reasoningEngine.generateRiskForecast(gates, get().matchPhase);
      set({ riskForecast: forecast });
    }, 10000);

    set({ simulationRunning: true, _cleanup: [fatigue, incidentTimer, reasoningTimer] });
  },

  pauseSimulation: () => {
    crowdService.stopSimulation();
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
      _cleanup: [],
    });
    notificationService.add('INFO', 'Simulation Reset', 'All data has been reset to initial state.', 'NORMAL');
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
    notificationService.add('SUCCESS', 'Data Uploaded', `${type.toUpperCase()} data applied successfully. AI models recalibrating.`, 'NORMAL');
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
