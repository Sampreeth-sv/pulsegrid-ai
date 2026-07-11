// Crowd Service - Real-time crowd simulation
import { RISK_THRESHOLDS, SIMULATION_SPEEDS } from '../constants';
import { initialGateData } from '../data/mockData';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let simulationInterval = null;
let subscribers = [];
let currentGateData = JSON.parse(JSON.stringify(initialGateData));

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

const updateGate = (gate, phase, speed) => {
  const phaseEntryRates = {
    PRE_MATCH: 0.3, GATES_OPENING: 0.6, CROWD_ARRIVING: 1.0, KICKOFF: 0.4,
    FIRST_HALF: 0.1, HALF_TIME: 0.5, SECOND_HALF: 0.1, FULL_TIME: 0.2, POST_MATCH: 0.8,
  };
  const rate = phaseEntryRates[phase] || 0.5;
  const noise = (Math.random() - 0.5) * 0.3;
  const effectiveRate = Math.max(0, rate + noise) * speed;

  const entryDelta = Math.round((Math.random() * 80 + 20) * effectiveRate);
  const queueDelta = Math.round((Math.random() - 0.4) * 150 * effectiveRate);

  gate.entryVelocity = clamp(gate.entryVelocity + Math.round((Math.random() - 0.5) * 40), 20, 450);
  gate.occupancy = clamp(gate.occupancy + entryDelta, 0, gate.capacity);
  gate.queueLength = clamp(gate.queueLength + queueDelta, 0, 3000);
  gate.avgWaitTime = clamp(gate.queueLength / Math.max(gate.entryVelocity, 1) * 1.2 + Math.random() * 2, 0, 60);

  // Recalculate risk
  const occupancyRisk = (gate.occupancy / gate.capacity) * 40;
  const queueRisk = Math.min((gate.queueLength / 1000) * 30, 35);
  const velocityRisk = Math.min(((gate.entryVelocity - 150) / 300) * 25, 25);
  gate.riskScore = clamp(Math.round(occupancyRisk + queueRisk + velocityRisk + Math.random() * 5), 5, 100);

  // Update status
  if (gate.riskScore >= RISK_THRESHOLDS.CRITICAL) gate.status = 'CRITICAL';
  else if (gate.riskScore >= RISK_THRESHOLDS.HIGH) gate.status = 'HIGH';
  else if (gate.riskScore >= RISK_THRESHOLDS.MEDIUM) gate.status = 'WARNING';
  else gate.status = 'NORMAL';

  // Congestion prediction (next 30 min)
  gate.congestionPrediction = clamp(
    Math.round(gate.riskScore + (gate.queueLength / 200) * 10 + Math.random() * 10 - 5),
    0, 100
  );

  return gate;
};

export const crowdService = {
  async getGateData() {
    await sleep(100 + Math.random() * 100);
    return JSON.parse(JSON.stringify(currentGateData));
  },

  async getDensityHeatmap() {
    await sleep(200);
    const cells = [];
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const gateProximity = currentGateData.reduce((max, gate) => {
          const dist = Math.sqrt(
            Math.pow((gate.position.x / 10 - col), 2) + Math.pow((gate.position.y / 10 - row), 2)
          );
          const influence = Math.max(0, (gate.riskScore / 100) * (1 / (dist + 0.5)));
          return Math.max(max, influence);
        }, 0);
        cells.push({ row, col, density: clamp(Math.round(gateProximity * 100 + Math.random() * 10 - 5), 0, 100) });
      }
    }
    return cells;
  },

  async applyCSVData(parsedData) {
    await sleep(300);
    parsedData.forEach((row) => {
      const gate = currentGateData.find((g) => g.id === row.gate_id);
      if (gate) {
        if (row.occupancy !== undefined) gate.occupancy = parseInt(row.occupancy, 10);
        if (row.capacity !== undefined) gate.capacity = parseInt(row.capacity, 10);
        if (row.queue_length !== undefined) gate.queueLength = parseInt(row.queue_length, 10);
        if (row.volunteers !== undefined) gate.volunteerCount = parseInt(row.volunteers, 10);
        if (row.risk_score !== undefined) gate.riskScore = parseInt(row.risk_score, 10);
        if (row.entry_velocity !== undefined) gate.entryVelocity = parseInt(row.entry_velocity, 10);
        if (gate.riskScore >= RISK_THRESHOLDS.CRITICAL) gate.status = 'CRITICAL';
        else if (gate.riskScore >= RISK_THRESHOLDS.HIGH) gate.status = 'HIGH';
        else if (gate.riskScore >= RISK_THRESHOLDS.MEDIUM) gate.status = 'WARNING';
        else gate.status = 'NORMAL';
      }
    });
    subscribers.forEach((fn) => fn(JSON.parse(JSON.stringify(currentGateData))));
    return currentGateData;
  },

  applyJSONData(jsonData) {
    if (jsonData.gates) {
      jsonData.gates.forEach((row) => {
        const gate = currentGateData.find((g) => g.id === row.gate_id || g.id === row.id);
        if (gate) {
          Object.assign(gate, row);
          if (gate.riskScore >= RISK_THRESHOLDS.CRITICAL) gate.status = 'CRITICAL';
          else if (gate.riskScore >= RISK_THRESHOLDS.HIGH) gate.status = 'HIGH';
          else if (gate.riskScore >= RISK_THRESHOLDS.MEDIUM) gate.status = 'WARNING';
          else gate.status = 'NORMAL';
        }
      });
      subscribers.forEach((fn) => fn(JSON.parse(JSON.stringify(currentGateData))));
    }
  },

  startSimulation(phase = 'CROWD_ARRIVING', speedKey = 'NORMAL', onUpdate) {
    const speedConfig = SIMULATION_SPEEDS[speedKey] || SIMULATION_SPEEDS.NORMAL;
    if (onUpdate) subscribers.push(onUpdate);
    if (simulationInterval) clearInterval(simulationInterval);
    simulationInterval = setInterval(() => {
      currentGateData = currentGateData.map((g) =>
        updateGate({ ...g }, phase, speedConfig.multiplier)
      );
      subscribers.forEach((fn) => fn(JSON.parse(JSON.stringify(currentGateData))));
    }, speedConfig.interval);
    return () => {
      clearInterval(simulationInterval);
      subscribers = subscribers.filter((fn) => fn !== onUpdate);
    };
  },

  stopSimulation() {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      simulationInterval = null;
    }
  },

  resetSimulation() {
    this.stopSimulation();
    currentGateData = JSON.parse(JSON.stringify(initialGateData));
    subscribers.forEach((fn) => fn(JSON.parse(JSON.stringify(currentGateData))));
  },

  subscribe(fn) {
    subscribers.push(fn);
    return () => { subscribers = subscribers.filter((s) => s !== fn); };
  },

  updatePhase(phase) {
    // Phase update propagates naturally on next tick
    return phase;
  },
};

export default crowdService;
