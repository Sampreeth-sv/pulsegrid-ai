// Scenario Generator - Creates random incidents for simulation
import { INCIDENT_TYPES } from '../constants';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let incidentCounter = 5;

const scenarioTemplates = [
  {
    type: 'MEDICAL',
    title: 'Fan Requires Medical Attention',
    descriptions: [
      'Fan reported chest discomfort near Section 109. Age approximately 65.',
      'Child with asthma symptoms near Gate B food court. Inhaler needed.',
      'Fan twisted ankle on concourse stairs near Section 205.',
      'Fan feeling faint near Gate D queue. Possible heat exhaustion.',
    ],
    severity: 'HIGH',
    locations: ['Section 109', 'Gate B Food Court', 'Section 205 Stairs', 'Gate D Queue'],
  },
  {
    type: 'SECURITY',
    title: 'Security Alert Reported',
    descriptions: [
      'Unattended bag reported near Section 112 seating.',
      'Fan altercation at Gate C entry point. Verbal dispute.',
      'Ticket fraud attempt detected at Gate B scanner.',
      'Suspicious individual photographing restricted area.',
    ],
    severity: 'HIGH',
    locations: ['Section 112', 'Gate C Entry', 'Gate B Turnstile', 'Operations Corridor'],
  },
  {
    type: 'CROWD',
    title: 'Crowd Density Warning',
    descriptions: [
      'Crowd surge detected at Gate D. Queue exceeding safe limits.',
      'Bottleneck forming at north concourse junction.',
      'Fan density at maximum threshold near Section 101 entrance.',
      'Exit corridor at Section 220 reaching capacity.',
    ],
    severity: 'CRITICAL',
    locations: ['Gate D', 'North Concourse', 'Section 101', 'Section 220 Exit'],
  },
  {
    type: 'LOST_CHILD',
    title: 'Lost Child Protocol',
    descriptions: [
      'Child (approx. 8yo, red jersey) separated from family near food court.',
      'Young girl (approx. 6yo, Morocco scarf) lost near restroom Section 108.',
      'Twin boys (approx. 10yo) separated from parents at Gate A.',
    ],
    severity: 'HIGH',
    locations: ['Food Court Zone A', 'Section 108 Restroom', 'Gate A'],
  },
  {
    type: 'TRANSPORT',
    title: 'Transportation Disruption',
    descriptions: [
      'Metro Line 1 experiencing signal failure. 20-minute delay.',
      'Shuttle Bus Zone B reported breakdown. Redistributing passengers.',
      'Ride-share zone overflow. Vehicles blocking emergency access lane.',
      'Parking Lot A exit gates malfunctioning.',
    ],
    severity: 'MEDIUM',
    locations: ['Metro Station', 'Shuttle Zone B', 'Ride-Share Zone North', 'Lot A Exit'],
  },
  {
    type: 'VIP',
    title: 'VIP Protocol Activated',
    descriptions: [
      'FIFA President arriving at Gate E in 10 minutes. Clear escort path.',
      'Dignitary convoy approaching north entrance. Security perimeter required.',
      'Celebrity guest in Section VIP Box 3. Media management needed.',
    ],
    severity: 'LOW',
    locations: ['Gate Echo', 'North VIP Entrance', 'VIP Box 3'],
  },
  {
    type: 'SUSPICIOUS',
    title: 'Suspicious Activity Reported',
    descriptions: [
      'Fan attempting to access unauthorized area near technical zone.',
      'Individual attempting to enter field perimeter at south end.',
      'Drone spotted near stadium airspace. Security teams alerted.',
    ],
    severity: 'HIGH',
    locations: ['Technical Zone Access', 'South Field Perimeter', 'Stadium Airspace'],
  },
  {
    type: 'POWER',
    title: 'Power System Alert',
    descriptions: [
      'Power fluctuation detected in Food Court Zone B. Generator on standby.',
      'Section 200 level lighting at 40% capacity. Maintenance team alerted.',
      'CCTV Camera bank 7 offline. Manual monitoring required.',
    ],
    severity: 'MEDIUM',
    locations: ['Food Court Zone B', 'Section 200', 'CCTV Control Room'],
  },
];

export const scenarioGenerator = {
  generateRandomIncident() {
    const template = scenarioTemplates[Math.floor(Math.random() * scenarioTemplates.length)];
    const descIdx = Math.floor(Math.random() * template.descriptions.length);
    const incidentId = `INC-${String(++incidentCounter).padStart(3, '0')}`;
    return {
      id: incidentId,
      type: template.type,
      title: template.title,
      description: template.descriptions[descIdx],
      location: template.locations[descIdx] || template.locations[0],
      severity: template.severity,
      status: 'ACTIVE',
      timestamp: new Date().toISOString(),
      assignedVolunteers: [],
      aiReasoning: `AI system detected ${template.type.toLowerCase()} event via ${['CCTV monitoring', 'volunteer report', 'fan app report', 'sensor data', 'security patrol'][Math.floor(Math.random() * 5)]}. Immediate response protocol initiated. Analyzing crowd data and volunteer availability...`,
      aiActions: [
        'Dispatch nearest available volunteer',
        'Alert relevant department heads',
        'Log incident in operations system',
      ],
      confidence: Math.round(75 + Math.random() * 22),
      estimatedResolution: `${Math.round(5 + Math.random() * 20)} minutes`,
      impactForecast: `${['Low', 'Medium', 'Moderate', 'High'][Math.floor(Math.random() * 4)]} impact`,
      resolvedAt: null,
    };
  },

  generateBulkScenario(scenarioName) {
    const scenarios = {
      HEAVY_RAIN: {
        incidents: [
          { type: 'TRANSPORT', title: 'Weather Impact: Transport Delays', severity: 'HIGH', location: 'All Transport Zones' },
          { type: 'CROWD', title: 'Shelter Seeking Surge', severity: 'CRITICAL', location: 'All Covered Areas' },
        ],
        gateUpdates: [
          { gate: 'A', riskDelta: 20, queueDelta: 400 },
          { gate: 'B', riskDelta: 25, queueDelta: 600 },
          { gate: 'D', riskDelta: 35, queueDelta: 800 },
        ],
        weatherUpdate: { condition: 'Heavy Rain', temp: 19, humidity: 95, wind: 28 },
        description: 'Heavy rain causing fan congregation at covered areas. Crowd redistribution required.',
      },
      POWER_FAILURE: {
        incidents: [
          { type: 'POWER', title: 'Partial Power Failure', severity: 'CRITICAL', location: 'Sections 100-150' },
          { type: 'SECURITY', title: 'CCTV System Disruption', severity: 'HIGH', location: 'CCTV Control Room' },
        ],
        description: 'Generator backup active. Sections 100-150 on reduced power. Medical equipment on UPS.',
      },
      GATE_CLOSURE: {
        incidents: [
          { type: 'CROWD', title: 'Gate D Emergency Closure', severity: 'CRITICAL', location: 'Gate Delta' },
          { type: 'CROWD', title: 'Fan Redirection Required', severity: 'HIGH', location: 'All Gates' },
        ],
        description: 'Gate D closed due to technical issue. All fans being redirected to Gates A, B, C.',
      },
      MASS_MEDICAL: {
        incidents: [
          { type: 'MEDICAL', title: 'Multiple Medical Events', severity: 'CRITICAL', location: 'Multiple Locations' },
          { type: 'MEDICAL', title: 'Food Poisoning Suspected', severity: 'HIGH', location: 'Food Court A' },
        ],
        description: 'Multiple fans reporting similar symptoms in Food Court A. Health authorities notified.',
      },
    };
    const scenario = scenarios[scenarioName];
    if (!scenario) return null;
    return {
      ...scenario,
      incidents: scenario.incidents.map((inc) => ({
        ...inc,
        id: `INC-${String(++incidentCounter).padStart(3, '0')}`,
        status: 'ACTIVE',
        timestamp: new Date().toISOString(),
        assignedVolunteers: [],
        aiReasoning: `Scenario "${scenarioName}" activated. AI systems detecting cascading effects. Multi-department coordination required.`,
        aiActions: ['Activate emergency protocol', 'Brief all department heads', 'Initiate fan communications'],
        confidence: Math.round(85 + Math.random() * 12),
        estimatedResolution: `${Math.round(20 + Math.random() * 30)} minutes`,
        resolvedAt: null,
      })),
    };
  },

  async generateStressTest() {
    await sleep(500);
    const incidents = [];
    for (let i = 0; i < 5; i++) {
      await sleep(100);
      incidents.push(this.generateRandomIncident());
    }
    return incidents;
  },

  getAvailableScenarios() {
    return [
      { id: 'HEAVY_RAIN', name: 'Heavy Rain', description: 'Simulates heavy rainfall and its cascading effects', icon: 'CloudRain', severity: 'HIGH' },
      { id: 'POWER_FAILURE', name: 'Power Failure', description: 'Partial stadium power outage with backup systems', icon: 'Zap', severity: 'CRITICAL' },
      { id: 'GATE_CLOSURE', name: 'Gate Closure', description: 'Emergency closure of Gate D forcing rerouting', icon: 'DoorClosed', severity: 'CRITICAL' },
      { id: 'MASS_MEDICAL', name: 'Mass Medical Event', description: 'Multiple simultaneous medical emergencies', icon: 'Heart', severity: 'CRITICAL' },
      { id: 'VIP_ARRIVAL', name: 'VIP Arrival', description: 'High-profile VIP arrival with security requirements', icon: 'Star', severity: 'LOW' },
    ];
  },
};

export default scenarioGenerator;
