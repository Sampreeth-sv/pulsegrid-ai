import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import {
  Upload, FileText, CheckCircle, AlertTriangle, Download, RefreshCw,
  Eye, Brain, BarChart3, Trash2, Play, Zap, Shield, X, Code
} from 'lucide-react';
import useStore from '../context/store';
import { CSV_REQUIRED_COLUMNS } from '../constants';
import toast from 'react-hot-toast';
import scenarioGenerator from '../services/scenarioGenerator';

const sampleCSV = `gate_id,occupancy,capacity,queue_length,volunteers,risk_score,entry_velocity,exit_velocity,security_staff,medical_staff,avg_wait_time
A,3200,16500,420,12,28,145,0,8,2,4.2
B,8500,16500,1200,5,88,320,0,4,1,16.5
C,2100,16500,180,10,15,87,0,7,2,2.1
D,4000,16500,600,9,45,195,0,6,2,7.8
E,820,4500,45,8,12,52,0,12,3,1.5`;

const sampleJSON = {
  stadiumId: 'METLIFE-2026',
  matchId: 'WC2026-QF-01',
  timestamp: new Date().toISOString(),
  gates: [
    { gate_id: 'A', occupancy: 4500, capacity: 16500, queue_length: 650, risk_score: 42, entry_velocity: 180, volunteers: 10 },
    { gate_id: 'B', occupancy: 9200, capacity: 16500, queue_length: 1450, risk_score: 91, entry_velocity: 380, volunteers: 4 },
    { gate_id: 'C', occupancy: 2800, capacity: 16500, queue_length: 220, risk_score: 22, entry_velocity: 95, volunteers: 11 },
    { gate_id: 'D', occupancy: 5500, capacity: 16500, queue_length: 780, risk_score: 58, entry_velocity: 210, volunteers: 8 },
    { gate_id: 'E', occupancy: 1100, capacity: 4500, queue_length: 60, risk_score: 14, entry_velocity: 60, volunteers: 8 },
  ],
};

function ValidationReport({ errors, warnings, parsed, filename }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={16} className="text-accent" />
        <h3 className="font-bold text-white text-sm">AI Error Guard — Validation Report</h3>
        <span className="text-xs text-slate-500 ml-auto">{filename}</span>
      </div>

      {errors.length === 0 && warnings.length === 0 ? (
        <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-xl border border-accent/20">
          <CheckCircle size={20} className="text-accent" />
          <div>
            <div className="font-semibold text-accent text-sm">Validation Passed</div>
            <div className="text-xs text-slate-400">{parsed} records validated successfully</div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {errors.length > 0 && (
            <div>
              <div className="label-text text-danger mb-2 flex items-center gap-1">
                <X size={12} /> {errors.length} Error{errors.length > 1 ? 's' : ''}
              </div>
              {errors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 bg-danger/10 rounded-lg border border-danger/20 text-xs">
                  <AlertTriangle size={12} className="text-danger mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">{err}</span>
                </div>
              ))}
            </div>
          )}
          {warnings.length > 0 && (
            <div>
              <div className="label-text text-warning mb-2">⚠ {warnings.length} Warning{warnings.length > 1 ? 's' : ''}</div>
              {warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 bg-warning/10 rounded-lg border border-warning/20 text-xs">
                  <AlertTriangle size={12} className="text-warning mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">{w}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {parsed > 0 && (
        <div className="mt-3 text-xs text-slate-500">
          ✅ {parsed} gate record{parsed !== 1 ? 's' : ''} parsed and ready to apply
        </div>
      )}
    </motion.div>
  );
}

export default function JuryPortal() {
  const { gates, applyUploadedData, resetSimulation, startSimulation, triggerScenario } = useStore();
  const [uploadState, setUploadState] = useState(null); // null | 'validating' | 'success' | 'error'
  const [validationResult, setValidationResult] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [dataInspector, setDataInspector] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [jsonInput, setJsonInput] = useState('');

  const validateCSV = (rows) => {
    const errors = [];
    const warnings = [];
    if (!rows.length) { errors.push('File is empty — no data rows found'); return { errors, warnings }; }
    const headers = Object.keys(rows[0]).map((h) => h.trim().toLowerCase());
    const missing = CSV_REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
    if (missing.length) errors.push(`Missing required columns: ${missing.join(', ')}`);
    const ids = rows.map((r) => r.gate_id?.trim());
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dupes.length) warnings.push(`Duplicate gate IDs found: ${[...new Set(dupes)].join(', ')}`);
    rows.forEach((row, i) => {
      const occ = parseInt(row.occupancy, 10);
      const cap = parseInt(row.capacity, 10);
      const risk = parseInt(row.risk_score, 10);
      if (occ > cap) warnings.push(`Row ${i + 2}: occupancy (${occ}) exceeds capacity (${cap}) for gate ${row.gate_id}`);
      if (risk < 0 || risk > 100) errors.push(`Row ${i + 2}: risk_score must be 0-100, got ${risk}`);
      if (!['A', 'B', 'C', 'D', 'E'].includes(row.gate_id?.trim())) warnings.push(`Row ${i + 2}: Unknown gate_id "${row.gate_id}"`);
    });
    return { errors, warnings };
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploadState('validating');
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: (result) => {
          const { errors, warnings } = validateCSV(result.data);
          setValidationResult({ errors, warnings, parsed: result.data.length, filename: file.name });
          setParsedData({ type: 'csv', data: result.data });
          setUploadState(errors.length === 0 ? 'success' : 'error');
        },
        error: () => {
          setValidationResult({ errors: ['Failed to parse CSV file. Please check the format.'], warnings: [], parsed: 0, filename: file.name });
          setUploadState('error');
        },
      });
    } else if (ext === 'json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          setParsedData({ type: 'json', data: json });
          setValidationResult({ errors: [], warnings: [], parsed: json.gates?.length || 0, filename: file.name });
          setUploadState('success');
        } catch {
          setValidationResult({ errors: ['Invalid JSON format. Please check your file.'], warnings: [], parsed: 0, filename: file.name });
          setUploadState('error');
        }
      };
      reader.readAsText(file);
    } else {
      setValidationResult({ errors: [`Unsupported file type: .${ext}. Please upload CSV or JSON.`], warnings: [], parsed: 0, filename: file.name });
      setUploadState('error');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/csv': ['.csv'], 'application/json': ['.json'] }, maxFiles: 1 });

  const handleApply = async () => {
    if (!parsedData) return;
    await applyUploadedData(parsedData.data, parsedData.type);
    toast.success('Data applied! AI models recalibrating...', { icon: '🚀', duration: 4000 });
  };

  const handleJSONApply = () => {
    try {
      const json = JSON.parse(jsonInput);
      applyUploadedData(json, 'json');
      toast.success('JSON data applied successfully!', { icon: '✅' });
    } catch {
      toast.error('Invalid JSON. Please check your input.');
    }
  };

  const downloadSampleCSV = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'stadium-state-sample.csv'; a.click();
    toast.success('Sample CSV downloaded!');
  };

  const downloadSampleJSON = () => {
    const blob = new Blob([JSON.stringify(sampleJSON, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'stadium-state-sample.json'; a.click();
    toast.success('Sample JSON downloaded!');
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3">
            <Eye className="text-accent" size={24} /> Jury Evaluation Portal
          </h1>
          <p className="text-slate-400 text-sm mt-1">Upload data and verify PULSEGRID AI™ reacts in real-time to any stadium state</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { resetSimulation(); toast('Environment reset to default state', { icon: '🔄' }); }} className="btn-secondary text-sm">
            <RefreshCw size={14} /> Reset All
          </button>
          <button onClick={() => { startSimulation(); toast.success('Simulation started!', { icon: '▶️' }); }} className="btn-primary text-sm">
            <Play size={14} /> Start Demo
          </button>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 bg-primary/50 rounded-xl p-1 border border-white/5 w-fit">
        {[{ id: 'upload', label: 'Upload Data' }, { id: 'manual', label: 'Manual JSON' }, { id: 'scenarios', label: 'Scenarios' }, { id: 'inspector', label: 'Data Inspector' }].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === tab.id ? 'bg-accent text-primary' : 'text-slate-400 hover:text-white'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'upload' && (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Drop Zone */}
          <div className="space-y-4">
            <div {...getRootProps()} className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-accent bg-accent/10' : 'border-white/20 hover:border-accent/50 hover:bg-white/2'}`}>
              <input {...getInputProps()} />
              <motion.div animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}>
                <Upload size={40} className={`mx-auto mb-4 ${isDragActive ? 'text-accent' : 'text-slate-500'}`} />
                <h3 className="font-bold text-white mb-2">{isDragActive ? 'Drop your file here!' : 'Drag & Drop Stadium Data'}</h3>
                <p className="text-slate-400 text-sm mb-3">Supports CSV and JSON formats</p>
                <div className="flex justify-center gap-3">
                  <span className="px-3 py-1 bg-primary rounded-lg text-xs text-slate-400 border border-white/10">.csv</span>
                  <span className="px-3 py-1 bg-primary rounded-lg text-xs text-slate-400 border border-white/10">.json</span>
                </div>
              </motion.div>
              {uploadState === 'validating' && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/80 rounded-2xl">
                  <div className="text-center">
                    <Brain size={32} className="text-accent mx-auto mb-2 animate-pulse" />
                    <span className="text-sm text-accent font-semibold">AI Error Guard Validating...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {validationResult && (
              <div className="flex gap-2">
                {uploadState === 'success' && (
                  <button onClick={handleApply} className="btn-primary flex-1 justify-center">
                    <Zap size={14} /> Apply to Simulation
                  </button>
                )}
                <button onClick={() => { setValidationResult(null); setParsedData(null); setUploadState(null); }} className="btn-ghost px-3">
                  <Trash2 size={14} />
                </button>
              </div>
            )}

            {/* Download samples */}
            <div className="glass-card p-4">
              <div className="label-text mb-3">Download Sample Datasets</div>
              <div className="space-y-2">
                <button onClick={downloadSampleCSV} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/10 hover:border-accent/30 text-sm text-slate-300 hover:text-white transition-all group">
                  <FileText size={15} className="text-accent" />
                  <div className="text-left">
                    <div className="font-medium group-hover:text-accent transition-colors">stadium-state.csv</div>
                    <div className="text-xs text-slate-500">Valid 5-gate dataset with all required columns</div>
                  </div>
                  <Download size={13} className="ml-auto text-slate-500" />
                </button>
                <button onClick={downloadSampleJSON} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/10 hover:border-accent/30 text-sm text-slate-300 hover:text-white transition-all group">
                  <Code size={15} className="text-info" />
                  <div className="text-left">
                    <div className="font-medium group-hover:text-accent transition-colors">stadium-state.json</div>
                    <div className="text-xs text-slate-500">JSON format with full stadium metadata</div>
                  </div>
                  <Download size={13} className="ml-auto text-slate-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Validation Panel */}
          <div>
            {validationResult ? (
              <ValidationReport {...validationResult} />
            ) : (
              <div className="glass-card p-8 text-center h-full flex flex-col items-center justify-center">
                <Shield size={40} className="text-slate-600 mb-4" />
                <div className="text-slate-400 font-medium">AI Error Guard Ready</div>
                <div className="text-slate-600 text-sm mt-1">Upload a file to see validation results</div>
                <div className="mt-4 text-xs text-slate-600 max-w-xs leading-relaxed">
                  Validates required columns, data types, value ranges, duplicate IDs, and structural integrity
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'manual' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="glass-card p-4">
            <div className="label-text mb-3">Paste JSON Data</div>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={JSON.stringify(sampleJSON, null, 2)}
              className="input-field font-mono text-xs min-h-[400px] leading-relaxed resize-none"
            />
            <div className="flex gap-2 mt-3">
              <button onClick={handleJSONApply} className="btn-primary flex-1 justify-center">
                <Zap size={14} /> Apply to Simulation
              </button>
              <button onClick={() => setJsonInput(JSON.stringify(sampleJSON, null, 2))} className="btn-secondary text-sm">
                Load Sample
              </button>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="label-text mb-3">Expected JSON Schema</div>
            <pre className="text-xs text-slate-300 font-mono leading-relaxed overflow-auto">{`{
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

      {activeTab === 'scenarios' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarioGenerator.getAvailableScenarios().map((scenario) => (
            <motion.div key={scenario.id} whileHover={{ y: -4 }} className="glass-card p-4">
              <div className={`text-xs font-bold mb-2 px-2 py-0.5 rounded-full w-fit ${scenario.severity === 'CRITICAL' ? 'bg-danger/20 text-danger' : scenario.severity === 'HIGH' ? 'bg-warning/20 text-warning' : 'bg-accent/20 text-accent'}`}>
                {scenario.severity}
              </div>
              <h3 className="font-bold text-white mb-1">{scenario.name}</h3>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">{scenario.description}</p>
              <button
                onClick={async () => {
                  await triggerScenario(scenario.id);
                  toast.success(`Scenario "${scenario.name}" triggered!`, { icon: '⚡' });
                }}
                className="btn-primary w-full justify-center text-sm"
              >
                <Play size={14} /> Trigger Scenario
              </button>
            </motion.div>
          ))}
          <motion.div whileHover={{ y: -4 }} className="glass-card p-4 border-dashed border-2 border-accent/20">
            <h3 className="font-bold text-white mb-1">Random Incident</h3>
            <p className="text-sm text-slate-400 mb-4">Generate a random operational incident for testing</p>
            <button
              onClick={() => {
                const { addIncident } = useStore.getState();
                const inc = scenarioGenerator.generateRandomIncident();
                addIncident(inc);
                toast.success('Random incident generated!', { icon: '🎲' });
              }}
              className="btn-secondary w-full justify-center text-sm"
            >
              <Zap size={14} /> Generate Random
            </button>
          </motion.div>
        </div>
      )}

      {activeTab === 'inspector' && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-accent" />
            <h2 className="font-bold text-white text-sm">Live Data Inspector</h2>
            <span className="ml-auto text-xs text-accent">Real-time simulation state</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10">
                  {['Gate', 'Name', 'Occupancy', 'Capacity', '%', 'Queue', 'Risk', 'Status', 'Volunteers', 'Wait'].map((h) => (
                    <th key={h} className="text-left text-slate-500 pb-2 pr-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gates.map((gate) => (
                  <tr key={gate.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="py-2 pr-4 font-bold text-white">{gate.id}</td>
                    <td className="py-2 pr-4 text-slate-300">{gate.name}</td>
                    <td className="py-2 pr-4 text-white">{gate.occupancy.toLocaleString()}</td>
                    <td className="py-2 pr-4 text-slate-400">{gate.capacity.toLocaleString()}</td>
                    <td className="py-2 pr-4">
                      <span className={`font-bold ${(gate.occupancy/gate.capacity) > 0.8 ? 'text-danger' : (gate.occupancy/gate.capacity) > 0.6 ? 'text-warning' : 'text-accent'}`}>
                        {Math.round(gate.occupancy/gate.capacity*100)}%
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-white">{gate.queueLength}</td>
                    <td className="py-2 pr-4">
                      <span className={`font-bold ${gate.riskScore >= 75 ? 'text-danger' : gate.riskScore >= 55 ? 'text-warning' : 'text-accent'}`}>{gate.riskScore}</span>
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`px-1.5 py-0.5 rounded-full font-semibold ${gate.status === 'CRITICAL' ? 'bg-danger/20 text-danger' : gate.status === 'WARNING' || gate.status === 'HIGH' ? 'bg-warning/20 text-warning' : 'bg-accent/20 text-accent'}`}>{gate.status}</span>
                    </td>
                    <td className="py-2 pr-4 text-white">{gate.volunteerCount}</td>
                    <td className="py-2 text-white">{gate.avgWaitTime.toFixed(1)}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-xs text-slate-500">Updates live every 2 seconds during simulation</div>
        </div>
      )}
    </div>
  );
}
