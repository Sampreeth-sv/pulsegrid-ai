// Reasoning Engine - Simulates Gemini-powered AI reasoning
import { RISK_THRESHOLDS } from '../constants';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const getRiskLevel = (score) => {
  if (score >= RISK_THRESHOLDS.CRITICAL) return 'CRITICAL';
  if (score >= RISK_THRESHOLDS.HIGH) return 'HIGH';
  if (score >= RISK_THRESHOLDS.MEDIUM) return 'MEDIUM';
  return 'LOW';
};

const crowdReasoningTemplates = [
  (gate, pct, trend) => ({
    reasoning: `Transit buses from Parking Zone ${gate.sector} have increased arrivals by ${Math.round(trend)}% over the last 5 minutes. Gate ${gate.id} is processing ${gate.entryVelocity} fans/min against an optimal capacity of 200/min. At current queue growth (${gate.queueLength} fans), unsafe density will be reached in ${Math.round(12 - gate.riskScore / 10)} minutes unless intervention occurs.`,
    actions: [
      `Redirect pedestrian flow to Gate ${gate.id === 'D' ? 'C' : gate.id === 'B' ? 'A' : 'D'}`,
      `Dispatch ${Math.ceil(gate.queueLength / 200)} additional volunteers immediately`,
      `Broadcast multilingual crowd guidance (EN/AR/ES/FR/PT)`,
      `Open auxiliary entry lane 3`,
    ],
    impactForecast: `~${Math.round(gate.queueLength * 1.4)} fans will be directly impacted without intervention`,
    estimatedResolution: `${Math.round(8 + Math.random() * 10)} minutes with intervention`,
    confidence: Math.round(88 + Math.random() * 10),
  }),
  (gate, pct) => ({
    reasoning: `Weather conditions (28°C, 62% humidity) combined with high foot traffic have created a heat stress corridor at Gate ${gate.id}. Fan entry velocity (${gate.entryVelocity}/min) exceeds the designed safe throughput by ${Math.round(gate.entryVelocity / 200 * 100 - 100)}%. Queue compression is increasing the risk of heat-related medical events in the next 15 minutes.`,
    actions: [
      `Deploy cooling stations at Gate ${gate.id} queue`,
      `Reduce entry density using barrier reconfiguration`,
      `Assign medical volunteer to queue monitoring`,
      `Activate shade structure panels A-C`,
    ],
    impactForecast: `Heat stress risk for ${Math.round(gate.queueLength * 0.3)} fans currently in queue`,
    estimatedResolution: `${Math.round(10 + Math.random() * 8)} minutes`,
    confidence: Math.round(82 + Math.random() * 12),
  }),
  (gate) => ({
    reasoning: `Capacity analysis shows Gate ${gate.id} operating at ${Math.round(gate.occupancy / gate.capacity * 100)}% occupancy with disproportionate volunteer coverage (${gate.volunteerCount} active vs ${Math.ceil(gate.occupancy / 800)} recommended). Adjacent sectors show lower density. AI routing optimization predicts a 34% reduction in wait time if load balancing is applied across Gates A-D.`,
    actions: [
      `Reallocate 4 volunteers from Gate ${gate.id === 'C' ? 'A' : 'C'} to Gate ${gate.id}`,
      `Update crowd flow digital signage for Gates A, B, D`,
      `Enable express lane for holders of accessible tickets`,
      `Notify app users of alternative entry routes`,
    ],
    impactForecast: `Expected 34% wait time reduction for ~${gate.queueLength} queued fans`,
    estimatedResolution: `${Math.round(6 + Math.random() * 6)} minutes`,
    confidence: Math.round(85 + Math.random() * 10),
  }),
];

const medicalReasoningTemplates = [
  (location) => ({
    reasoning: `Fan reported sudden dizziness consistent with heat exhaustion. Ambient temperature of 28°C and high humidity (62%) create conditions favorable for heat-related illness, especially among elderly fans in prolonged queues. Nearest first aid station at ${location} is ${Math.round(80 + Math.random() * 200)}m away. Volunteer with First Aid certification identified and dispatched.`,
    actions: [
      'Alert primary medical team immediately',
      'Dispatch nearest certified first aid volunteer',
      'Prepare stretcher at closest medical station',
      'Clear pathway for medical access',
      'Notify stadium medical director',
    ],
    priority: 'HIGH',
    estimatedETA: `${Math.round(2 + Math.random() * 3)} minutes`,
    confidence: Math.round(88 + Math.random() * 10),
  }),
  (location) => ({
    reasoning: `Fan reporting chest discomfort. Based on symptom description and age factor (elderly), cardiac event cannot be ruled out. Immediate defibrillator deployment recommended. AED unit located 45m from reported location. Medical team alerted via priority channel.`,
    actions: [
      'IMMEDIATE: Dispatch AED unit',
      'Alert stadium medical director via priority line',
      'Clear 10m radius around fan for emergency response',
      'Dispatch 2 paramedics from medical station',
      'Prepare emergency vehicle access route',
    ],
    priority: 'CRITICAL',
    estimatedETA: `${Math.round(1 + Math.random() * 2)} minutes`,
    confidence: Math.round(90 + Math.random() * 8),
  }),
];

export const reasoningEngine = {
  async analyzeCrowdRisk(gateData) {
    await sleep(300 + Math.random() * 400);
    const riskGates = gateData.filter((g) => g.riskScore >= RISK_THRESHOLDS.MEDIUM);
    const analyses = riskGates.map((gate) => {
      const pct = (gate.occupancy / gate.capacity) * 100;
      const trend = 15 + Math.random() * 40;
      const template = crowdReasoningTemplates[Math.floor(Math.random() * crowdReasoningTemplates.length)];
      const analysis = template(gate, pct, trend);
      return {
        gateId: gate.id,
        gateName: gate.name,
        riskLevel: getRiskLevel(gate.riskScore),
        riskScore: gate.riskScore,
        occupancyPct: Math.round(pct),
        ...analysis,
        id: `REASON-${Date.now()}-${gate.id}`,
        timestamp: new Date().toISOString(),
      };
    });
    return analyses;
  },

  async generateMedicalResponse(query, location) {
    await sleep(200 + Math.random() * 300);
    const template = medicalReasoningTemplates[Math.floor(Math.random() * medicalReasoningTemplates.length)];
    return template(location);
  },

  async generateVolunteerRecommendation(incident, volunteers) {
    await sleep(150 + Math.random() * 200);
    const available = volunteers.filter((v) => v.availability && v.status !== 'ON_BREAK');
    if (!available.length) {
      return { error: 'No available volunteers', fallback: 'Contact duty manager immediately' };
    }
    const scored = available.map((v) => ({
      ...v,
      matchScore: Math.round(
        (100 - v.fatigueScore) * 0.4 +
        v.rating * 10 * 0.3 +
        (incident.type === 'MEDICAL' && v.skills.includes('First Aid') ? 30 : 0) +
        (incident.type === 'LOST_CHILD' && v.skills.includes('Child Safety') ? 25 : 0) +
        Math.random() * 10
      ),
    }));
    const best = scored.sort((a, b) => b.matchScore - a.matchScore)[0];
    return {
      recommended: best,
      reason: `${best.name} selected based on: skill match (${best.skills.slice(0, 2).join(', ')}), low fatigue (${best.fatigueScore}%), proximity to incident, and ${(best.workloadHours).toFixed(1)}h current workload.`,
      eta: `${Math.round(1 + Math.random() * 4)} minutes`,
      confidence: best.matchScore,
      alternatives: scored.slice(1, 3),
    };
  },

  async generateBroadcastMessage(incident, languages = ['en', 'ar', 'es', 'fr']) {
    await sleep(400 + Math.random() * 300);
    const messages = {
      en: `Attention stadium guests: Please be aware of ${incident.type === 'CROWD' ? 'high crowd density near ' + incident.location : 'an operational update'}. Staff are available to assist. Thank you for your cooperation.`,
      ar: `تنبيه للضيوف: يُرجى الانتباه إلى ${incident.type === 'CROWD' ? 'كثافة الحشود بالقرب من ' + incident.location : 'تحديث تشغيلي'}. الموظفون متاحون للمساعدة.`,
      es: `Estimados visitantes: Les informamos sobre ${incident.type === 'CROWD' ? 'alta densidad de personas cerca de ' + incident.location : 'una actualización operacional'}. El personal está disponible para ayudar.`,
      fr: `Chers visiteurs: Veuillez noter ${incident.type === 'CROWD' ? 'une forte densité de foule près de ' + incident.location : 'une mise à jour opérationnelle'}. Le personnel est disponible pour vous aider.`,
      pt: `Prezados visitantes: Por favor, estejam cientes ${incident.type === 'CROWD' ? 'da alta densidade de multidão perto de ' + incident.location : 'de uma atualização operacional'}. A equipe está disponível.`,
    };
    return languages.reduce((acc, lang) => {
      if (messages[lang]) acc[lang] = messages[lang];
      return acc;
    }, {});
  },

  async generateRiskForecast(gateData, matchPhase) {
    await sleep(500 + Math.random() * 500);
    const totalOccupancy = gateData.reduce((s, g) => s + g.occupancy, 0);
    const avgRisk = gateData.reduce((s, g) => s + g.riskScore, 0) / gateData.length;
    const phaseMultipliers = {
      PRE_MATCH: 1.2, GATES_OPENING: 1.4, CROWD_ARRIVING: 1.5, KICKOFF: 0.8,
      FIRST_HALF: 0.6, HALF_TIME: 1.3, SECOND_HALF: 0.7, FULL_TIME: 1.6, POST_MATCH: 1.4,
    };
    const multiplier = phaseMultipliers[matchPhase] || 1;
    return {
      overallRisk: Math.min(100, Math.round(avgRisk * multiplier)),
      forecast: [
        { time: '+15min', risk: Math.min(100, Math.round(avgRisk * multiplier * 1.1)), event: 'Continued arrival surge' },
        { time: '+30min', risk: Math.min(100, Math.round(avgRisk * multiplier * 0.9)), event: 'Post-redirect stabilization' },
        { time: '+45min', risk: Math.min(100, Math.round(avgRisk * 0.7)), event: 'Kickoff crowd settling' },
        { time: '+60min', risk: Math.min(100, Math.round(avgRisk * 0.5)), event: 'Peak ingress complete' },
      ],
      recommendation: avgRisk > 70
        ? 'Immediate intervention required. Activate contingency crowd flow plan.'
        : avgRisk > 50
        ? 'Monitor closely. Pre-position additional resources at high-risk gates.'
        : 'Situation nominal. Continue standard monitoring protocols.',
      confidence: Math.round(80 + Math.random() * 15),
    };
  },

  async analyzeIncidentPattern(incidents) {
    await sleep(300 + Math.random() * 200);
    const byType = incidents.reduce((acc, inc) => {
      acc[inc.type] = (acc[inc.type] || 0) + 1;
      return acc;
    }, {});
    const dominant = Object.entries(byType).sort((a, b) => b[1] - a[1])[0];
    return {
      patterns: byType,
      dominantType: dominant?.[0] || 'NONE',
      insight: dominant
        ? `Pattern analysis: ${dominant[1]} ${dominant[0].toLowerCase()} incident${dominant[1] > 1 ? 's' : ''} detected. ${dominant[0] === 'CROWD' ? 'Consider pre-emptive crowd redistribution.' : dominant[0] === 'MEDICAL' ? 'Medical team should be on heightened readiness.' : 'Standard response protocols apply.'}`
        : 'No significant patterns detected. Operations nominal.',
      recommendations: [
        'Increase monitoring frequency at high-risk zones',
        'Ensure all first responders are briefed',
        'Update digital signage with latest guidance',
      ],
    };
  },
};

export default reasoningEngine;
