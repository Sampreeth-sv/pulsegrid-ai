import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import useStore from '../src/context/store';

describe('Global Zustand Store Tests', () => {
  beforeEach(() => {
    // Reset store before each test
    useStore.getState().resetSimulation();
  });

  afterEach(() => {
    // Clean up any timers
    useStore.getState().pauseSimulation();
  });

  it('should initialize with default states', () => {
    const state = useStore.getState();
    expect(state.simulationRunning).toBe(false);
    expect(state.simulationSpeed).toBe('NORMAL');
    expect(state.gates.length).toBeGreaterThan(0);
    expect(state.volunteers.length).toBeGreaterThan(0);
    expect(state.incidents.length).toBeGreaterThan(0);
    expect(state.activeMode).toBe('command');
    expect(state.sidebarOpen).toBe(true);
  });

  it('should update UI modes and modal states via actions', () => {
    const store = useStore.getState();
    
    store.setActiveMode('volunteer');
    expect(useStore.getState().activeMode).toBe('volunteer');

    store.setSidebarOpen(false);
    expect(useStore.getState().sidebarOpen).toBe(false);

    store.setNotificationDrawerOpen(true);
    expect(useStore.getState().notificationDrawerOpen).toBe(true);

    store.setArchitectureModalOpen(true);
    expect(useStore.getState().architectureModalOpen).toBe(true);

    store.setBroadcastModalOpen(true);
    expect(useStore.getState().broadcastModalOpen).toBe(true);

    const gate = { id: 'A', sector: 'North' };
    store.setSelectedGate(gate);
    expect(useStore.getState().selectedGate).toEqual(gate);

    const incident = { id: 'INC-101', title: 'Power Surge' };
    store.setSelectedIncident(incident);
    expect(useStore.getState().selectedIncident).toEqual(incident);

    const testGates = [{ id: 'A', riskScore: 10 }];
    store.setGates(testGates);
    expect(useStore.getState().gates).toEqual(testGates);

    const testVols = [{ id: 'V1', name: 'Bob' }];
    store.setVolunteers(testVols);
    expect(useStore.getState().volunteers).toEqual(testVols);

    const testNotifs = [{ id: 'N1', title: 'Alert' }];
    store.setNotifications(testNotifs);
    expect(useStore.getState().notifications).toEqual(testNotifs);
  });

  it('should handle match phase progression', () => {
    const store = useStore.getState();
    const initialIndex = store.matchPhaseIndex;
    
    store.advanceMatchPhase();
    
    const updated = useStore.getState();
    expect(updated.matchPhaseIndex).toBe(initialIndex + 1);
    expect(updated.notifications.length).toBeGreaterThan(0);
  });

  it('should add and resolve incidents', () => {
    const store = useStore.getState();
    const initialCount = store.incidents.length;
    
    const newInc = {
      id: `INC-TEST-${Date.now()}`,
      type: 'MEDICAL',
      title: 'Gate Jam',
      description: 'Crowd clogging Gate B',
      severity: 'HIGH',
      status: 'OPEN',
      timestamp: new Date().toISOString()
    };
    
    store.addIncident(newInc);
    
    const stateAfterAdd = useStore.getState();
    expect(stateAfterAdd.incidents.length).toBe(initialCount + 1);
    expect(stateAfterAdd.incidents[0].title).toBe('Gate Jam');

    // Resolve the incident
    store.resolveIncident(newInc.id);
    
    const stateAfterResolve = useStore.getState();
    const resolved = stateAfterResolve.incidents.find(i => i.id === newInc.id);
    expect(resolved.status).toBe('RESOLVED');
    expect(resolved.resolvedAt).toBeDefined();
  });

  it('should handle translations, AI reasonings and risk forecast additions', () => {
    const store = useStore.getState();

    // Test addTranslation paths (including alerts)
    store.addTranslation({ response: 'Please help', medicalAlert: true, securityAlert: false });
    expect(useStore.getState().translations[0].response).toBe('Please help');

    store.addTranslation({ response: 'Suspicious pack', medicalAlert: false, securityAlert: true });
    expect(useStore.getState().translations[0].response).toBe('Suspicious pack');

    // Test addAIReasoning
    store.addAIReasoning({ id: 'AI-1', title: 'High Density' });
    expect(useStore.getState().aiReasonings[0].id).toBe('AI-1');

    // Test setRiskForecast
    store.setRiskForecast({ overallRisk: 45 });
    expect(useStore.getState().riskForecast.overallRisk).toBe(45);
  });

  it('should trigger custom scenarios', async () => {
    const store = useStore.getState();
    // Use HEAVY_RAIN which is a valid bulk scenario name
    await store.triggerScenario('HEAVY_RAIN');
    
    const state = useStore.getState();
    expect(state.incidents.length).toBeGreaterThan(0);
  });

  it('should start, pause, speed-change and liveTick simulation loops with fake timers', async () => {
    vi.useFakeTimers();
    
    let randomCalls = 0;
    const mockRandom = vi.spyOn(Math, 'random').mockImplementation(() => {
      randomCalls++;
      // Alternate between high and low random values to cover both scaling and logic checks
      return randomCalls % 2 === 0 ? 0.99 : 0.01;
    });

    const store = useStore.getState();
    store.setSimulationSpeed('FAST');
    store.startSimulation();
    expect(useStore.getState().simulationRunning).toBe(true);

    // Advance fake timers by 20 seconds to trigger all simulation callbacks
    await vi.advanceTimersByTimeAsync(20000);

    const ticked = useStore.getState();
    expect(ticked.tickCount).toBeGreaterThan(0);

    store.pauseSimulation();
    expect(useStore.getState().simulationRunning).toBe(false);

    mockRandom.mockRestore();
    vi.useRealTimers();
  });

  it('should apply CSV and JSON uploaded dataset', async () => {
    const store = useStore.getState();
    
    const csvData = [{ gate_id: 'A', occupancy: '1000', capacity: '5000', risk_score: '20' }];
    await store.applyUploadedData(csvData, 'csv');
    expect(useStore.getState().gates[0].occupancy).toBe(1000);

    const jsonData = { gates: [{ gate_id: 'B', occupancy: 420 }] };
    await store.applyUploadedData(jsonData, 'json');
    expect(useStore.getState().gates[1].occupancy).toBe(420);
  });

  it('should update crowd density heatmap', async () => {
    const store = useStore.getState();
    await store.updateHeatmap();
    expect(useStore.getState().heatmapData.length).toBe(100);
  });

  it('should dismiss notifications', () => {
    const store = useStore.getState();
    
    // Set a mock notification
    const testNotif = { id: 'notif-123', title: 'Test Alert', dismissed: false };
    useStore.setState({ notifications: [testNotif] });
    
    store.dismissNotification('notif-123');
    
    const state = useStore.getState();
    const dismissed = state.notifications.find(n => n.id === 'notif-123');
    expect(dismissed).toBeUndefined();
  });
});
