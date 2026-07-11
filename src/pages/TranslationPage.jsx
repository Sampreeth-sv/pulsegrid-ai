import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Mic, MicOff, Send, AlertTriangle, Heart, Shield,
  Brain, Loader, Volume2, ChevronDown, Clock, CheckCircle
} from 'lucide-react';
import useStore from '../context/store';
import translationService from '../services/translationService';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'pt', label: 'Portuguese', flag: '🇧🇷' },
  { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
  { code: 'ary', label: 'Moroccan Arabic', flag: '🇲🇦' },
  { code: 'de', label: 'German', flag: '🇩🇪' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', label: 'Chinese', flag: '🇨🇳' },
];

const DEMO_INPUTS = [
  { text: 'Where is the nearest restroom?', lang: 'en', desc: 'Simple direction query' },
  { text: 'جدي فجأة حس بدوخة كبيرة', lang: 'ary', desc: 'Moroccan Arabic - Medical emergency' },
  { text: '我的孩子不见了，他穿着蓝色的球衣', lang: 'zh', desc: 'Chinese - Lost child' },
  { text: '¿Dónde está la sección de accesibilidad?', lang: 'es', desc: 'Spanish - Accessibility query' },
  { text: 'My grandfather suddenly feels dizzy and has chest pain', lang: 'en', desc: 'English - Critical medical' },
  { text: 'Où sont les toilettes accessibles aux fauteuils roulants?', lang: 'fr', desc: 'French - Accessibility' },
];

const urgencyColors = {
  CRITICAL: { bg: 'bg-danger/20', text: 'text-danger', border: 'border-danger/30' },
  HIGH: { bg: 'bg-warning/20', text: 'text-warning', border: 'border-warning/30' },
  MEDIUM: { bg: 'bg-yellow-400/20', text: 'text-yellow-300', border: 'border-yellow-400/30' },
  LOW: { bg: 'bg-accent/20', text: 'text-accent', border: 'border-accent/30' },
};

const emotionEmoji = {
  NEUTRAL: '😐', DISTRESSED: '😰', PANIC: '😱', POSITIVE: '😊', FRUSTRATED: '😤',
};

function VoiceWave({ active }) {
  if (!active) return null;
  return (
    <div className="flex items-center gap-0.5 h-5">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="w-0.5 bg-accent rounded-full voice-bar"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

function TranslationResult({ result }) {
  const [expanded, setExpanded] = useState(true);
  const urgency = urgencyColors[result.urgency] || urgencyColors.LOW;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border ${urgency.border} bg-secondary/30 overflow-hidden`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 ${urgency.bg}`}>
        <div className="flex items-center gap-3">
          {result.medicalAlert && <Heart size={15} className="text-danger animate-pulse" />}
          {result.securityAlert && <Shield size={15} className="text-warning animate-pulse" />}
          {!result.medicalAlert && !result.securityAlert && <Globe size={15} className="text-accent" />}
          <span className={`text-sm font-bold ${urgency.text}`}>
            {result.medicalAlert ? 'MEDICAL ALERT' : result.securityAlert ? 'SECURITY ALERT' : 'Translation Result'}
          </span>
          <span className="text-xs text-slate-400">{result.id}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${urgency.bg} ${urgency.text}`}>
            {result.urgency}
          </span>
          <span className="text-lg" title={`Detected emotion: ${result.detectedEmotion}`}>
            {emotionEmoji[result.detectedEmotion] || '😐'}
          </span>
          <button onClick={() => setExpanded(!expanded)} className="text-slate-400 hover:text-white">
            <ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-3">
          {/* Detection info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: 'Language', value: `${result.detectedLanguageLabel}`, sub: `${result.langConfidence}%` },
              { label: 'Emotion', value: result.detectedEmotion, sub: `${emotionEmoji[result.detectedEmotion]}` },
              { label: 'Urgency', value: result.urgency },
              { label: 'Intent', value: result.intent?.replace(/_/g, ' ') },
            ].map((item) => (
              <div key={item.label} className="bg-primary/40 rounded-lg p-2 text-xs">
                <div className="text-slate-500 mb-0.5">{item.label}</div>
                <div className="font-bold text-white">{item.value}</div>
                {item.sub && <div className="text-slate-600">{item.sub}</div>}
              </div>
            ))}
          </div>

          {/* Input */}
          <div>
            <div className="label-text mb-1">Original Input</div>
            <div className="bg-primary/40 rounded-lg p-3 text-sm text-slate-300 border border-white/5">
              {result.input}
            </div>
          </div>

          {/* AI Response */}
          <div>
            <div className="label-text mb-1">AI Response</div>
            <div className="bg-primary/40 rounded-lg p-3 text-sm text-white border border-accent/10 border-l-4 border-l-accent">
              {result.response}
            </div>
          </div>

          {/* AI Reasoning */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Brain size={12} className="text-accent" />
              <div className="label-text">AI Reasoning</div>
            </div>
            <div className="bg-primary/40 rounded-lg p-3 text-xs text-slate-300 border border-white/5 leading-relaxed">
              {result.reasoning}
            </div>
          </div>

          {/* Other language translations */}
          {Object.keys(result.translations || {}).length > 0 && (
            <div>
              <div className="label-text mb-2">Multilingual Responses</div>
              <div className="space-y-2">
                {Object.entries(result.translations).map(([lang, text]) => {
                  const langInfo = LANGUAGES.find((l) => l.code === lang) || { flag: '🌐', label: lang };
                  return (
                    <div key={lang} className="flex gap-3 text-xs bg-primary/30 rounded-lg p-2 border border-white/5">
                      <span className="text-xl flex-shrink-0">{langInfo.flag}</span>
                      <div>
                        <div className="text-slate-500 font-medium mb-0.5">{langInfo.label}</div>
                        <div className="text-slate-300">{text}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Alert Actions */}
          {(result.medicalAlert || result.securityAlert) && (
            <div className="flex gap-2 pt-2 border-t border-white/5">
              <button className="btn-danger text-xs px-3 py-1.5">
                <Heart size={12} />
                {result.medicalAlert ? 'Alert Medical Team' : 'Alert Security'}
              </button>
              <button className="btn-secondary text-xs px-3 py-1.5">
                Mark Handled
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function TranslationPage() {
  const { translations, addTranslation } = useStore();
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [voiceSimulating, setVoiceSimulating] = useState(false);
  const inputRef = useRef(null);

  const handleAnalyze = async (text = inputText) => {
    if (!text.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const result = await translationService.analyzeMessage(text);
      addTranslation(result);
      setInputText('');
      if (result.urgency === 'CRITICAL') {
        toast.error(`CRITICAL: ${result.intent} detected!`, { duration: 5000 });
      } else if (result.urgency === 'HIGH') {
        toast.error(`HIGH PRIORITY: ${result.detectedEmotion} emotion detected`, { duration: 4000 });
      } else {
        toast.success('Message analyzed successfully');
      }
    } catch (err) {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleVoiceSimulate = async () => {
    setVoiceSimulating(true);
    setVoiceActive(true);
    const text = translationService.simulateVoiceInput(selectedLang);
    // Simulate voice recognition delay
    await new Promise((r) => setTimeout(r, 1500));
    setInputText(text);
    setVoiceActive(false);
    setVoiceSimulating(false);
    toast.success(`Voice input captured: "${text.substring(0, 40)}..."`, { icon: '🎙️' });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3">
            <Globe className="text-accent" size={24} />
            Context-Aware Multilingual AI
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time emotion detection, intent recognition & intelligent multilingual response
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/20 border border-accent/30">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs text-accent font-semibold">Gemini AI Active</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Input Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Language Selector */}
          <div className="glass-card p-4">
            <div className="label-text mb-3">Voice Simulator Language</div>
            <div className="grid grid-cols-3 gap-1.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all text-xs ${
                    selectedLang === lang.code
                      ? 'bg-accent/20 border-accent/40 text-accent'
                      : 'border-white/5 hover:bg-white/5 text-slate-400'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-medium text-center leading-tight">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="glass-card p-4">
            <div className="label-text mb-3">Fan Message Input</div>
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type or paste fan message in any language... (supports Arabic, Chinese, Japanese, Spanish, French, Portuguese, German, English)"
              className="input-field resize-none min-h-[120px] text-sm mb-3 leading-relaxed"
              dir={['ar', 'ary'].includes(selectedLang) ? 'rtl' : 'ltr'}
            />

            <div className="flex items-center gap-2">
              {/* Voice Simulate */}
              <button
                onClick={handleVoiceSimulate}
                disabled={voiceSimulating}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  voiceSimulating
                    ? 'bg-accent/20 border-accent/40 text-accent'
                    : 'border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                {voiceSimulating ? (
                  <>
                    <VoiceWave active={true} />
                    <span className="text-xs">Listening...</span>
                  </>
                ) : (
                  <>
                    <Mic size={15} />
                    <span className="text-xs">Voice Simulate</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleAnalyze()}
                disabled={!inputText.trim() || isAnalyzing}
                className="btn-primary flex-1 justify-center text-sm"
              >
                {isAnalyzing ? (
                  <>
                    <Loader size={15} className="animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain size={15} />
                    Analyze with AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Demo Scenarios */}
          <div className="glass-card p-4">
            <div className="label-text mb-3">Quick Demo Scenarios</div>
            <div className="space-y-2">
              {DEMO_INPUTS.map((demo, i) => (
                <motion.button
                  key={i}
                  whileHover={{ x: 4 }}
                  onClick={() => { setInputText(demo.text); setSelectedLang(demo.lang); }}
                  className="w-full text-left px-3 py-2.5 rounded-xl border border-white/5 hover:border-accent/30 bg-secondary/30 hover:bg-secondary/50 transition-all group"
                >
                  <div className="text-sm text-white group-hover:text-accent transition-colors truncate">{demo.text}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{demo.desc}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="glass-card p-4">
            <div className="label-text mb-3">Session Stats</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Analyses', value: translations.length, icon: Globe, color: '#00E5A8' },
                { label: 'Medical Alerts', value: translations.filter((t) => t.medicalAlert).length, icon: Heart, color: '#FF4D6D' },
                { label: 'Security Alerts', value: translations.filter((t) => t.securityAlert).length, icon: Shield, color: '#FFC857' },
                { label: 'Languages', value: [...new Set(translations.map((t) => t.detectedLanguage))].length, icon: Globe, color: '#56CCF2' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-primary/40 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={13} style={{ color: stat.color }} />
                      <span className="text-xs text-slate-500">{stat.label}</span>
                    </div>
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white text-sm">Translation & Analysis Results</h2>
            <span className="text-xs text-slate-500">{translations.length} analyses</span>
          </div>

          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-6 text-center"
            >
              <div className="flex justify-center mb-3">
                <div className="relative">
                  <Brain size={32} className="text-accent animate-pulse" />
                  <div className="absolute inset-0 rounded-full border-2 border-accent/30 animate-ping" />
                </div>
              </div>
              <div className="text-white font-semibold text-sm mb-1">Gemini AI Analyzing...</div>
              <div className="text-slate-400 text-xs">Detecting language, emotion, intent, and generating contextual response</div>
            </motion.div>
          )}

          <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto no-scrollbar">
            {translations.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Globe size={40} className="mx-auto mb-4 text-slate-600" />
                <div className="text-slate-400 text-sm">No messages analyzed yet.</div>
                <div className="text-slate-600 text-xs mt-1">Try a demo scenario or type a message above.</div>
              </div>
            ) : (
              translations.map((t) => (
                <TranslationResult key={t.id} result={t} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
