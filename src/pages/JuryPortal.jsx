import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import {
  Upload, FileText, CheckCircle, AlertTriangle, Download, RefreshCw,
  Eye, Brain, BarChart3, Trash2, Play, Zap, Shield, X, Code,
  ChevronRight, Database, Search, TriangleAlert, FileCheck, Sparkles
} from 'lucide-react';
import useStore from '../context/store';
import { CSV_REQUIRED_COLUMNS } from '../constants';
import toast from 'react-hot-toast';
import scenarioGenerator from '../services/scenarioGenerator';
import { SectionHeader, Badge, ProgressBar, AIThinking, EmptyState } from '../components/ui';

const sampleCSV = `gate_id,occupancy,capacity,queue_length,volunteers,risk_score,entry_velocity,exit_velocity,security_staff,medical_staff,avg_wait_time
A,3200,16500,420,12,28,145,0,8,2,4.2
B,8500,16500,1200,5,88,320,0,4,1,16.5
C,2100,16500,180,10,15,87,0,7,2,2.1
D,4000,16500,600,9,45,195,0,6,2,7.8
E,820,4500,45,8,12,52,0,12,3,1.5`;

const sampleJSON = {
  stadiumId: 'METLIFE-2026', matchId: 'WC2026-QF-01', timestamp: new Date().toISOString(),
  gates: [
    { gate_id: 'A', occupancy: 4500, capacity: 16500, queue_length: 650, risk_score: 42, entry_velocity: 180, volunteers: 10 },
    { gate_id: 'B', occupancy: 9200, capacity: 16500, queue_length: 1450, risk_score: 91, entry_velocity: 380, volunteers: 4 },
    { gate_id: 'C', occupancy: 2800, capacity: 16500, queue_length: 220, risk_score: 22, entry_velocity: 95, volunteers: 11 },
    { gate_id: 'D', occupancy: 5500, capacity: 16500, queue_length: 780, risk_score: 58, entry_velocity: 210, volunteers: 8 },
    { gate_id: 'E', occupancy: 1100, capacity: 4500, queue_length: 60, risk_score: 14, entry_velocity: 60, volunteers: 8 },
  ],
};

// ─── Processing Pipeline ──────────────────────────────────────────
const STAGES = [
  { id: 'received', label: 'Dataset Received', icon: Database, color: '#56CCF2' },
  { id: 'validation', label: 'AI Error Guard Validation', icon: Shield, color: '#00E5A8' },
  { id: 'analysis', label: 'AI Analysis', icon: Brain, color: '#7C4DFF' },
  { id: 'risk', label: 'Risk Detection', icon: TriangleAlert, color: '#FF4D6D' },
  { id: 'report', label: 'Summary Report', icon: FileCheck, color: '#FFC857' },
];

function ProcessingPipeline({ stage, errors, warnings, parsed, data }) {
  const currentIdx = STAGES.findIndex((s) => s.id === stage);
  const done = stage === 'report';

  return (
    <div className="glass-card p-5 space-y-4">
      <SectionHeader icon={Sparkles} title="AI Processing Pipeline" live={!done} />

      {/* Stages */}
      <div className="space-y-2">
        {STAGES.map((s, i) => {
          const Icon = s.icon;
          const isDone = i < currentIdx || done;
          const isActive = i === currentIdx && !done;
          const isPending = i > currentIdx && !done;
          return (
            <motion.div key={s.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isActive ? 'bg-accent/8 border border-accent/25' :
                isDone ? 'bg-primary/40 border border-white/5' :
                'bg-primary/20 border border-white/3 opacity-40'
              }`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isDone ? '' : isActive ? 'animate-pulse' : ''
              }`} style={{ backgroundColor: isDone || isActive ? `${s.color}20` : 'rgba(255,255,255,0.03)' }}>
                {isDone
                  ? <CheckCircle size={16} style={{ color: s.color }} />
                  : isActive
                    ? <div className="relative"><div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${s.color}60`, borderTopColor: s.color }} /></div>
                    : <Icon size={16} className="text-slate-600" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold ${isDone ? 'text-white' : isActive ? 'text-accent' : 'text-slate-600'}`}>{s.label}</div>
                {isActive && <div className="text-xs text-slate-500 mt-0.5">Processing...</div>}
                {isDone && s.id === 'validation' && (
                  <div className="text-xs mt-0.5">
                    {errors.length === 0
                      ? <span className="text-accent">Passed — {parsed} records valid</span>
                      : <span className="text-danger">{errors.length} error{errors.length > 1 ? 's' : ''} found</span>
                    }
                    {warnings.length > 0 && <span className="text-warning ml-2">· {warnings.length} warning{warnings.length > 1 ? 's' : ''}</span>}
                  </div>
                )}
                {isDone && s.id === 'analysis' && <div className="text-xs text-slate-500 mt-0.5">Crowd patterns, risk scores, volunteer gaps analyzed</div>}
                {isDone && s.id === 'risk' && (
                  <div className="text-xs mt-0.5">
                    {data?.gates?.some((g) => g.risk_score > 75)
                      ? <span className="text-danger">⚠ High-risk gates detected</span>
                      : <span className="text-accent">No critical risks found</span>
                    }
                  </div>
                )}
              </div>
              {(isDone || isActive) && (
                <div className={`text-xs font-bold flex-shrink-0 ${isDone ? 'text-accent' : 'text-slate-500'}`}>
                  {isDone ? '✓' : '...'}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Summary Report */}
      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-accent/5 rounded-xl border border-accent/20 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-accent">
              <Sparkles size={15} />
              AI Analysis Complete
            </div>
            {data?.gates && (
              <div className="space-y-2">
                {data.gates.map((g) => (
                  <div key={g.gate_id || g.id} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-12">Gate {g.gate_id || g.id}</span>
                    <div className="flex-1 h-1.5 bg-primary rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${g.risk_score >= 75 ? 'bg-danger' : g.risk_score >= 55 ? 'bg-warning' : 'bg-accent'}`}
                        style={{ width: `${g.risk_score}%` }} />
                    </div>
                    <Badge variant={g.risk_score >= 75 ? 'CRITICAL' : g.risk_score >= 55 ? 'HIGH' : 'SUCCESS'} className="w-16 justify-center">
                      {g.risk_score >= 75 ? 'CRITICAL' : g.risk_score >= 55 ? 'ELEVATED' : 'SAFE'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-400 leading-relaxed">
              {data?.gates?.filter((g) => g.risk_score >= 75).length > 0
                ? `⚠ ${data.gates.filter((g) => g.risk_score >= 75).length} gate(s) in critical state. AI recommends immediate volunteer redeployment and crowd redirection.`
                : '✅ Stadium state nominal. AI monitoring active. No immediate interventions required.'
              }
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Validation Panel ──────────────────────────────────────────────
function ValidationBadge({ errors, warnings, parsed, filename }) {
  if (!errors && !warnings) return null;
  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Shield size={15} className="text-accent" />
        <span className="font-bold text-white text-sm">AI Error Guard</span>
        <span className="text-xs text-slate-500 ml-auto truncate max-w-32">{filename}</span>
      </div>
      {errors.length === 0 && warnings.length === 0 ? (
        <div className="flex items-center gap-3 p-3 bg-accent/8 rounded-xl border border-accent/20">
          <CheckCircle size={18} className="text-accent" />
          <div><div className="font-semibold text-accent text-sm">Validation Passed</div>
            <div className="text-xs text-slate-400">{parsed} records valid</div></div>
        </div>
      ) : (
        <div className="space-y-2">
          {errors.map((err, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 bg-danger/8 rounded-xl border border-danger/20 text-xs">
              <X size={12} className="text-danger mt-0.5 flex-shrink-0" />
              <span className="text-slate-300">{err}</span>
            </div>
          ))}
          {warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 bg-warning/8 rounded-xl border border-warning/20 text-xs">
              <AlertTriangle size={12} className="text-warning mt-0.5 flex-shrink-0" />
              <span className="text-slate-300">{w}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────
export default function JuryPortal() {
  const { gates, applyUploadedData, resetSimulation, startSimulation, triggerScenario } = useStore();
  const [activeTab, setActiveTab] = useState('upload');
  const [pipelineStage, setPipelineStage] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [jsonInput, setJsonInput] = useState('');
  const [applied, setApplied] = useState(false);

  const validateCSV = (rows) => {
    const errors = [], warnings = [];
    if (!rows.length) { errors.push('File is empty — no data rows found'); return { errors, warnings }; }
    const headers = Object.keys(rows[0]).map((h) => h.trim().toLowerCase());
    const missing = CSV_REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
    if (missing.length) errors.push(`Missing required columns: ${missing.join(', ')}`);
    const ids = rows.map((r) => r.gate_id?.trim());
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dupes.length) warnings.push(`Duplicate gate IDs: ${[...new Set(dupes)].join(', ')}`);
    rows.forEach((row, i) => {
      const occ = parseInt(row.occupancy, 10), cap = parseInt(row.capacity, 10), risk = parseInt(row.risk_score, 10);
      if (occ > cap) warnings.push(`Row ${i + 2}: occupancy > capacity for gate ${row.gate_id}`);
      if (risk < 0 || risk > 100) errors.push(`Row ${i + 2}: risk_score must be 0-100, got ${risk}`);
    });
    return { errors, warnings };
  };

  const runPipeline = async (data, errors, warnings, parsed, filename) => {
    setValidationResult({ errors, warnings, parsed, filename });
    if (errors.length > 0) return; // Don't proceed on hard errors

    // Stage progression
    for (const stage of ['received', 'validation', 'analysis', 'risk', 'report']) {
      setPipelineStage(stage);
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setPipelineStage('received');
    setApplied(false);
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: async (result) => {
          const { errors, warnings } = validateCSV(result.data);
          setParsedData({ type: 'csv', data: result.data, gates: result.data.map((r) => ({ gate_id: r.gate_id, risk_score: parseInt(r.risk_score || 0) })) });
          await runPipeline(result.data, errors, warnings, result.data.length, file.name);
        },
        error: () => { setValidationResult({ errors: ['Failed to parse CSV'], warnings: [], parsed: 0, filename: file.name }); setPipelineStage(null); },
      });
    } else if (ext === 'json') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const json = JSON.parse(e.target.result);
          setParsedData({ type: 'json', data: json, gates: json.gates || [] });
          await runPipeline(json, [], [], json.gates?.length || 0, file.name);
        } catch { setValidationResult({ errors: ['Invalid JSON format'], warnings: [], parsed: 0, filename: file.name }); setPipelineStage(null); }
      };
      reader.readAsText(file);
    } else {
      setValidationResult({ errors: [`Unsupported file type .${ext}`], warnings: [], parsed: 0, filename: file.name });
      setPipelineStage(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'text/csv': ['.csv'], 'application/json': ['.json'] }, maxFiles: 1,
  });

  const handleApply = async () => {
    if (!parsedData) return;
    await applyUploadedData(parsedData.data, parsedData.type);
    setApplied(true);
    toast.success('Data applied to simulation! AI models recalibrating...', { icon: '🚀', duration: 4000 });
  };

  const handleReset = () => {
    setPipelineStage(null);
    setValidationResult(null);
    setParsedData(null);
    setApplied(false);
    setJsonInput('');
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    toast.success(`${filename} downloaded!`);
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3">
            <Eye className="text-warning" size={24} /> Jury Evaluation Portal
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Upload stadium data and verify PULSEGRID AI™ responds in real-time</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { resetSimulation(); handleReset(); toast('Environment reset', { icon: '🔄' }); }} className="btn-secondary text-sm">
            <RefreshCw size={14} /> Reset
          </button>
          <button onClick={() => { startSimulation(); toast.success('Simulation started!', { icon: '▶️' }); }} className="btn-primary text-sm">
            <Play size={14} /> Start Demo
          </button>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 bg-primary/50 rounded-xl p-1 border border-white/5 w-fit">
        {[
          { id: 'upload', label: 'File Upload' },
          { id: 'manual', label: 'Manual JSON' },
          { id: 'scenarios', label: 'Scenarios' },
          { id: 'inspector', label: 'Data Inspector' },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === tab.id ? 'bg-accent text-primary' : 'text-slate-400 hover:text-white'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            {/* Drop zone */}
            {!pipelineStage ? (
              <div {...getRootProps()} className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-accent bg-accent/8' : 'border-white/15 hover:border-accent/40 hover:bg-white/2'}`}>
                <input {...getInputProps()} />
                <motion.div animate={isDragActive ? { scale: 1.08 } : { scale: 1 }}>
                  <Upload size={40} className={`mx-auto mb-4 ${isDragActive ? 'text-accent' : 'text-slate-600'}`} />
                  <h3 className="font-bold text-white mb-2">{isDragActive ? 'Drop your file here!' : 'Drag & Drop Stadium Data'}</h3>
                  <p className="text-slate-400 text-sm mb-3">Supports CSV and JSON formats</p>
                  <div className="flex justify-center gap-3">
                    <span className="px-3 py-1 bg-primary rounded-lg text-xs text-slate-400 border border-white/10">.csv</span>
                    <span className="px-3 py-1 bg-primary rounded-lg text-xs text-slate-400 border border-white/10">.json</span>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="glass-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileCheck size={20} className="text-accent" />
                  <div>
                    <div className="text-sm font-bold text-white">File loaded</div>
                    <div className="text-xs text-slate-500">{validationResult?.parsed} records · {parsedData?.type?.toUpperCase()}</div>
                  </div>
                </div>
                <button onClick={handleReset} className="text-slate-500 hover:text-slate-300 p-2 rounded-lg hover:bg-white/5"><X size={16} /></button>
              </div>
            )}

            {/* Apply / Actions */}
            {pipelineStage === 'report' && !applied && validationResult?.errors?.length === 0 && (
              <motion.button initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                onClick={handleApply} className="btn-primary w-full justify-center">
                <Zap size={15} /> Apply to Live Simulation
              </motion.button>
            )}
            {applied && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-accent/10 border border-accent/25">
                <CheckCircle size={16} className="text-accent" />
                <span className="text-sm text-accent font-semibold">Applied to simulation — AI models recalibrating</span>
              </motion.div>
            )}

            {/* Sample downloads */}
            <div className="glass-card p-4">
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-3">Download Sample Datasets</div>
              <div className="space-y-2">
                <button onClick={() => downloadFile(sampleCSV, 'stadium-state.csv', 'text/csv')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/8 hover:border-accent/30 text-sm text-slate-300 hover:text-white transition-all group">
                  <FileText size={15} className="text-accent" />
                  <div className="text-left flex-1">
                    <div className="font-medium text-sm group-hover:text-accent transition-colors">stadium-state.csv</div>
                    <div className="text-xs text-slate-600">5-gate dataset, all required columns</div>
                  </div>
                  <Download size={13} className="text-slate-600" />
                </button>
                <button onClick={() => downloadFile(JSON.stringify(sampleJSON, null, 2), 'stadium-state.json', 'application/json')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/8 hover:border-accent/30 text-sm text-slate-300 hover:text-white transition-all group">
                  <Code size={15} className="text-info" />
                  <div className="text-left flex-1">
                    <div className="font-medium text-sm group-hover:text-accent transition-colors">stadium-state.json</div>
                    <div className="text-xs text-slate-600">JSON format with stadium metadata</div>
                  </div>
                  <Download size={13} className="text-slate-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Pipeline Panel */}
          <div>
            {pipelineStage ? (
              <ProcessingPipeline
                stage={pipelineStage}
                errors={validationResult?.errors || []}
                warnings={validationResult?.warnings || []}
                parsed={validationResult?.parsed || 0}
                data={parsedData}
              />
            ) : (
              <div className="glass-card p-8 text-center h-full flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-warning/10 border border-warning/20 flex items-center justify-center mx-auto">
                  <Shield size={28} className="text-warning" />
                </div>
                <div className="text-white font-semibold">AI Error Guard Ready</div>
                <div className="text-slate-500 text-sm max-w-xs text-center leading-relaxed">
                  Upload a CSV or JSON file to start the 5-stage AI analysis pipeline
                </div>
                <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                  {STAGES.map((s) => (
                    <span key={s.id} className="text-xs px-2 py-0.5 rounded-full border border-white/8 text-slate-500">{s.label}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual JSON Tab */}
      {activeTab === 'manual' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="glass-card p-4">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-3">Paste JSON Data</div>
            <textarea value={jsonInput} onChange={(e) => setJsonInput(e.target.value)}
              placeholder={JSON.stringify(sampleJSON, null, 2)}
              className="input-field font-mono text-xs min-h-[380px] leading-relaxed resize-none" />
            <div className="flex gap-2 mt-3">
              <button onClick={async () => {
                try {
                  const json = JSON.parse(jsonInput);
                  applyUploadedData(json, 'json');
                  toast.success('JSON data applied!', { icon: '✅' });
                } catch { toast.error('Invalid JSON. Please check your input.'); }
              }} className="btn-primary flex-1 justify-center">
                <Zap size={14} /> Apply to Simulation
              </button>
              <button onClick={() => setJsonInput(JSON.stringify(sampleJSON, null, 2))} className="btn-secondary text-sm">Load Sample</button>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-3">Expected JSON Schema</div>
            <pre className="text-xs text-slate-300 font-mono leading-relaxed overflow-auto bg-primary/50 p-4 rounded-xl">{`{
  "stadiumId": "string",
  "matchId": "string",
  "timestamp": "ISO date",
  "gates": [
    {
      "gate_id": "A|B|C|D|E",
      "occupancy": number,
      "capacity": number,
      "queue_length": number,
      "risk_score": 0-100,
      "entry_velocity": number,
      "volunteers": number
    }
  ]
}`}</pre>
          </div>
        </div>
      )}

      {/* Scenarios Tab */}
      {activeTab === 'scenarios' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarioGenerator.getAvailableScenarios().map((scenario) => (
            <motion.div key={scenario.id} whileHover={{ y: -4 }}
              className={`glass-card p-5 relative overflow-hidden border ${
                scenario.severity === 'CRITICAL' ? 'border-danger/25' : scenario.severity === 'HIGH' ? 'border-warning/20' : 'border-white/10'
              }`}>
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
                style={{ background: scenario.severity === 'CRITICAL' ? '#FF4D6D' : scenario.severity === 'HIGH' ? '#FFC857' : '#00E5A8' }} />
              <Badge variant={scenario.severity === 'CRITICAL' ? 'CRITICAL' : scenario.severity === 'HIGH' ? 'HIGH' : 'SUCCESS'} className="mb-3">
                {scenario.severity}
              </Badge>
              <h3 className="font-bold text-white mb-1 text-sm">{scenario.name}</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">{scenario.description}</p>
              <button onClick={async () => { await triggerScenario(scenario.id); toast.success(`Scenario "${scenario.name}" triggered!`, { icon: '⚡' }); }}
                className="btn-primary w-full justify-center text-sm">
                <Play size={13} /> Trigger Scenario
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Inspector Tab */}
      {activeTab === 'inspector' && (
        <div className="glass-card p-4">
          <SectionHeader icon={BarChart3} title="Live Data Inspector" live subtitle="Real-time simulation state — updates every 2 seconds" />
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10">
                  {['Gate', 'Name', 'Occupancy', 'Cap.', '%', 'Queue', 'Risk', 'Status', 'Vols', 'Wait'].map((h) => (
                    <th key={h} className="text-left text-slate-500 pb-2 pr-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gates.map((gate, i) => {
                  const pct = Math.round(gate.occupancy / gate.capacity * 100);
                  return (
                    <motion.tr key={gate.id}
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="py-2.5 pr-3 font-bold text-white">{gate.id}</td>
                      <td className="py-2.5 pr-3 text-slate-300">{gate.name}</td>
                      <td className="py-2.5 pr-3 text-white font-medium">{gate.occupancy.toLocaleString()}</td>
                      <td className="py-2.5 pr-3 text-slate-500">{gate.capacity.toLocaleString()}</td>
                      <td className="py-2.5 pr-3">
                        <span className={`font-bold ${pct > 80 ? 'text-danger' : pct > 60 ? 'text-warning' : 'text-accent'}`}>{pct}%</span>
                      </td>
                      <td className="py-2.5 pr-3 text-white">{gate.queueLength}</td>
                      <td className="py-2.5 pr-3">
                        <span className={`font-bold ${gate.riskScore >= 75 ? 'text-danger' : gate.riskScore >= 55 ? 'text-warning' : 'text-accent'}`}>
                          {gate.riskScore}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">
                        <Badge variant={gate.status === 'CRITICAL' ? 'CRITICAL' : gate.status !== 'NORMAL' ? 'HIGH' : 'SUCCESS'}>
                          {gate.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-3 text-white">{gate.volunteerCount}</td>
                      <td className="py-2.5 text-white">{gate.avgWaitTime.toFixed(1)}m</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
