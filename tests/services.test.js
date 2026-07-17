import { describe, it, expect, vi } from 'vitest';
import scenarioGenerator from '../src/services/scenarioGenerator';
import { translationService } from '../src/services/translationService';
import volunteerService from '../src/services/volunteerService';
import crowdService from '../src/services/crowdService';
import reasoningEngine from '../src/services/reasoningEngine';
import notificationService from '../src/services/notificationService';

describe('Scenario Generator Service Tests', () => {
  it('should generate a valid random incident', () => {
    // Generate multiple times to hit all random templates
    for (let i = 0; i < 20; i++) {
      const incident = scenarioGenerator.generateRandomIncident();
      expect(incident).toBeDefined();
      expect(incident.id).toMatch(/^INC-\d{3}$/);
      expect(incident.status).toBe('ACTIVE');
    }
  });

  it('should generate bulk scenario by ID', () => {
    const scenarios = ['HEAVY_RAIN', 'POWER_FAILURE', 'GATE_CLOSURE', 'MASS_MEDICAL'];
    scenarios.forEach((id) => {
      const scenario = scenarioGenerator.generateBulkScenario(id);
      expect(scenario).toBeDefined();
      expect(scenario.incidents.length).toBeGreaterThan(0);
    });
  });

  it('should return null for invalid scenario ID', () => {
    const scenario = scenarioGenerator.generateBulkScenario('INVALID_ID');
    expect(scenario).toBeNull();
  });

  it('should return a list of available scenarios', () => {
    const list = scenarioGenerator.getAvailableScenarios();
    expect(list.length).toBeGreaterThan(0);
  });

  it('should generate stress tests', async () => {
    const stressIncidents = await scenarioGenerator.generateStressTest();
    expect(stressIncidents.length).toBe(5);
  });
});

describe('Translation and Intent Analysis Service Tests', () => {
  it('should detect languages correctly', async () => {
    const tests = [
      { text: 'ayuda por favor', code: 'es', label: 'Spanish' },
      { text: 'merci toilettes', code: 'fr', label: 'French' },
      { text: 'أين دورة المياه؟', code: 'ar', label: 'Arabic' },
      { text: 'obrigado criança', code: 'pt', label: 'Portuguese' },
      { text: 'danke kind', code: 'de', label: 'German' },
    ];
    for (const t of tests) {
      const res = await translationService.analyzeMessage(t.text);
      expect(res.detectedLanguage).toBe(t.code);
      expect(res.detectedLanguageLabel).toBe(t.label);
    }
  });

  it('should detect emotions and urgency', async () => {
    const medicalResult = await translationService.analyzeMessage('urgent pain help');
    expect(medicalResult.detectedEmotion).toBe('DISTRESSED');
    expect(medicalResult.urgency).toBe('HIGH');

    const lostResult = await translationService.analyzeMessage('lost child missing');
    expect(lostResult.detectedEmotion).toBe('PANIC');
    expect(lostResult.urgency).toBe('CRITICAL');

    const happyResult = await translationService.analyzeMessage('thank you amazing');
    expect(happyResult.detectedEmotion).toBe('POSITIVE');
  });

  it('should classify intents correctly', async () => {
    const toiletResult = await translationService.analyzeMessage('where is the restroom?');
    expect(toiletResult.intent).toBe('RESTROOM');

    const wheelchairResult = await translationService.analyzeMessage('wheelchair access gate');
    expect(wheelchairResult.intent).toBe('ACCESSIBILITY');
  });

  it('should return supported languages list', async () => {
    const langs = await translationService.getSupportedLanguages();
    expect(langs.length).toBeGreaterThan(0);
  });

  it('should simulate voice input samples', () => {
    const langs = ['en', 'ar', 'ary', 'es', 'fr', 'zh'];
    langs.forEach((l) => {
      const sample = translationService.simulateVoiceInput(l);
      expect(sample).toBeDefined();
    });
  });
});

describe('Volunteer Service Tests', () => {
  it('should handle CRUD and availability updates', async () => {
    volunteerService.reset();
    const unsub = volunteerService.subscribe(() => {});
    
    const list = await volunteerService.getAll();
    expect(list.length).toBeGreaterThan(0);

    const first = await volunteerService.getById(list[0].id);
    expect(first.name).toBe(list[0].name);

    const nonExistent = await volunteerService.getById('V-NON-EXIST');
    expect(nonExistent).toBeNull();

    const avail = await volunteerService.getAvailable();
    expect(avail.length).toBeGreaterThan(0);

    const availFirstAid = await volunteerService.getAvailable(['First Aid']);
    expect(availFirstAid.length).toBeDefined();

    const assign = await volunteerService.assignVolunteer(list[0].id, 'Check Sector B', 'Sector B');
    expect(assign.success).toBe(true);

    const assignFail = await volunteerService.assignVolunteer('V-NON-EXIST', 'Task', 'Loc');
    expect(assignFail.success).toBe(false);

    const release = await volunteerService.releaseVolunteer(list[0].id);
    expect(release.success).toBe(true);

    const releaseFail = await volunteerService.releaseVolunteer('V-NON-EXIST');
    expect(releaseFail.success).toBe(false);

    const utilization = await volunteerService.getUtilizationStats();
    expect(utilization.total).toBe(list.length);

    await volunteerService.updateFatigueScores();
    unsub();
  });
});

describe('Crowd Service Tests', () => {
  it('should handle crowd data parsing and simulation state', async () => {
    crowdService.resetSimulation();
    const unsub = crowdService.subscribe(() => {});
    
    const data = await crowdService.getGateData();
    expect(data.length).toBeGreaterThan(0);

    const csvUpdate = [
      { gate_id: data[0].id, occupancy: 500, risk_score: 95 },
      { gate_id: 'NON-EXISTENT-GATE', occupancy: 100 }
    ];
    const updated = await crowdService.applyCSVData(csvUpdate);
    expect(updated[0].occupancy).toBe(500);

    crowdService.applyJSONData({});
    crowdService.applyJSONData({ gates: [{ id: 'NON-EXISTENT-GATE', occupancy: 42 }] });
    // Pass low risk score so it evaluates to status NORMAL and covers line 105
    crowdService.applyJSONData({ gates: [{ id: data[0].id, occupancy: 300, riskScore: 10 }] });

    const unsubSim = crowdService.startSimulation('CROWD_ARRIVING', 'FAST', () => {});
    unsubSim();
    
    const unsubSim2 = crowdService.startSimulation('CROWD_ARRIVING', 'EXTREME', () => {});
    unsubSim2();

    // Use fake timers to let the simulation tick and cover updateGate branches
    vi.useFakeTimers();
    let tickCount = 0;
    
    // We mock Math.random to alternate between high and low values to hit multiple risk thresholds in updateGate
    let calls = 0;
    const mockRandom = vi.spyOn(Math, 'random').mockImplementation(() => {
      calls++;
      return calls % 2 === 0 ? 0.99 : 0.01;
    });

    const unsubSimTick = crowdService.startSimulation('CROWD_ARRIVING', 'FAST', () => {
      tickCount++;
    });

    // Advance fake timers to trigger simulation ticks
    await vi.advanceTimersByTimeAsync(8000);
    expect(tickCount).toBeGreaterThan(0);

    unsubSimTick();
    mockRandom.mockRestore();
    vi.useRealTimers();

    crowdService.updatePhase('KICKOFF');
    crowdService.stopSimulation();
    unsub();
  });
});

describe('Reasoning Engine Service Tests', () => {
  it('should analyze crowd risks and generate insights', async () => {
    const gates = [
      { id: 'A', name: 'Gate A', occupancy: 4000, capacity: 5000, riskScore: 88, entryVelocity: 180, sector: 'North', queueLength: 300, volunteerCount: 2 },
      { id: 'B', name: 'Gate B', occupancy: 3800, capacity: 5000, riskScore: 78, entryVelocity: 150, sector: 'South', queueLength: 200, volunteerCount: 1 },
      { id: 'C', name: 'Gate C', occupancy: 3000, capacity: 5000, riskScore: 60, entryVelocity: 120, sector: 'East', queueLength: 150, volunteerCount: 3 }
    ];
    const riskAnalysis = await reasoningEngine.analyzeCrowdRisk(gates);
    expect(riskAnalysis.length).toBe(3);

    // Call multiple times to execute both medical templates
    for (let i = 0; i < 10; i++) {
      const medicalResult = await reasoningEngine.generateMedicalResponse('dizzy heat', 'First Aid Station A');
      expect(medicalResult.actions.length).toBeGreaterThan(0);
    }

    const volunteers = [
      { id: 'V1', name: 'John', availability: true, status: 'ACTIVE', fatigueScore: 10, rating: 4.8, skills: ['First Aid', 'Child Safety'], workloadHours: 1.5 }
    ];
    const volRec = await reasoningEngine.generateVolunteerRecommendation({ type: 'MEDICAL' }, volunteers);
    expect(volRec.recommended.name).toBe('John');

    // Call with empty available volunteers to trigger line 114
    const volRecEmpty = await reasoningEngine.generateVolunteerRecommendation({ type: 'VIP' }, []);
    expect(volRecEmpty.error).toBeDefined();

    const broadcast = await reasoningEngine.generateBroadcastMessage({ type: 'CROWD', location: 'Gate A' });
    expect(broadcast.en).toBeDefined();

    const forecastHigh = await reasoningEngine.generateRiskForecast(gates, 'CROWD_ARRIVING');
    expect(forecastHigh.recommendation).toContain('contingency');

    const gatesMedium = [{ id: 'A', occupancy: 2000, capacity: 5000, riskScore: 55 }];
    const forecastMed = await reasoningEngine.generateRiskForecast(gatesMedium, 'KICKOFF');
    expect(forecastMed.recommendation).toContain('Monitor closely');

    const gatesLow = [{ id: 'A', occupancy: 1000, capacity: 5000, riskScore: 20 }];
    const forecastLow = await reasoningEngine.generateRiskForecast(gatesLow, 'FIRST_HALF');
    expect(forecastLow.recommendation).toContain('nominal');

    const patternEmpty = await reasoningEngine.analyzeIncidentPattern([]);
    expect(patternEmpty.dominantType).toBe('NONE');

    const pattern = await reasoningEngine.analyzeIncidentPattern([{ type: 'CROWD' }, { type: 'CROWD' }]);
    expect(pattern.dominantType).toBe('CROWD');
  }, 15000); // 15s timeout
});

describe('Notification Service Tests', () => {
  it('should manage alerts and notification states', () => {
    const initialCount = notificationService.getUnreadCount();
    const notif = notificationService.add('INFO', 'Test Alert', 'This is a test');
    expect(notif.id).toBeDefined();
    expect(notificationService.getUnreadCount()).toBe(initialCount + 1);

    notificationService.markRead(notif.id);
    expect(notificationService.getUnreadCount()).toBe(initialCount);

    notificationService.markAllRead();
    expect(notificationService.getUnreadCount()).toBe(0);

    notificationService.dismiss(notif.id);
    expect(notificationService.getAll().find(n => n.id === notif.id)).toBeUndefined();
  });
});
