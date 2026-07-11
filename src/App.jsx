import React, { useState, lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowLeft } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import CommandLayout from './layouts/CommandLayout';

// Lazy-loaded pages
const OverviewPage = lazy(() => import('./pages/OverviewPage'));
const TranslationPage = lazy(() => import('./pages/TranslationPage'));
const VolunteersPage = lazy(() => import('./pages/VolunteersPage'));
const TransportPage = lazy(() => import('./pages/TransportPage'));
const MedicalPage = lazy(() => import('./pages/MedicalPage'));
const AccessibilityPage = lazy(() => import('./pages/AccessibilityPage'));
const SustainabilityPage = lazy(() => import('./pages/SustainabilityPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const VolunteerCopilot = lazy(() => import('./pages/VolunteerCopilot'));
const JuryPortal = lazy(() => import('./pages/JuryPortal'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="relative w-12 h-12 mx-auto mb-3">
          <div className="w-12 h-12 rounded-full border-2 border-accent/30 animate-spin border-t-accent" />
          <Zap size={16} className="text-accent absolute inset-0 m-auto" />
        </div>
        <div className="text-sm text-slate-400">Loading module...</div>
      </div>
    </div>
  );
}

const commandPages = {
  overview: OverviewPage,
  crowd: OverviewPage,
  translation: TranslationPage,
  volunteers: VolunteersPage,
  transport: TransportPage,
  medical: MedicalPage,
  accessibility: AccessibilityPage,
  sustainability: SustainabilityPage,
  analytics: AnalyticsPage,
  broadcast: OverviewPage,
};

export default function App() {
  const [mode, setMode] = useState(null); // null=landing, 'command', 'volunteer', 'jury'
  const [commandPage, setCommandPage] = useState('overview');

  const handleSelectMode = (selectedMode) => {
    setMode(selectedMode);
    if (selectedMode === 'command') setCommandPage('overview');
  };

  const handleBack = () => {
    setMode(null);
  };

  // Volunteer Copilot
  if (mode === 'volunteer') {
    return (
      <>
        <Toaster position="top-center" toastOptions={{
          style: { background: '#132238', color: '#e2e8f0', border: '1px solid rgba(0,229,168,0.2)', borderRadius: '12px' },
          duration: 3000,
        }} />
        <div className="relative">
          <button onClick={handleBack}
            className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-100/90 border border-white/10 text-slate-400 hover:text-white text-xs transition-all">
            <ArrowLeft size={13} /> Exit
          </button>
          <Suspense fallback={<LoadingFallback />}>
            <VolunteerCopilot />
          </Suspense>
        </div>
      </>
    );
  }

  // Jury Portal
  if (mode === 'jury') {
    return (
      <>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#132238', color: '#e2e8f0', border: '1px solid rgba(0,229,168,0.2)', borderRadius: '12px' },
        }} />
        <div className="min-h-screen bg-primary">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-primary-100">
            <div className="flex items-center gap-3">
              <button onClick={handleBack} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
                <ArrowLeft size={16} /> Back
              </button>
              <div className="w-px h-5 bg-white/10" />
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-accent" />
                <span className="font-display font-bold text-white">PULSEGRID AI™</span>
                <span className="text-xs px-2 py-0.5 bg-warning/20 text-warning rounded-full font-semibold">JURY PORTAL</span>
              </div>
            </div>
          </div>
          <Suspense fallback={<LoadingFallback />}>
            <JuryPortal />
          </Suspense>
        </div>
      </>
    );
  }

  // Command Center
  if (mode === 'command') {
    const PageComponent = commandPages[commandPage] || OverviewPage;
    return (
      <>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#132238', color: '#e2e8f0', border: '1px solid rgba(0,229,168,0.2)', borderRadius: '12px' },
        }} />
        <CommandLayout activePage={commandPage} onNavigate={setCommandPage}>
          <Suspense fallback={<LoadingFallback />}>
            <PageComponent />
          </Suspense>
        </CommandLayout>
        {/* Back to landing */}
        <button onClick={handleBack}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-100/80 backdrop-blur border border-white/10 text-slate-500 hover:text-slate-300 text-xs transition-all z-30 opacity-30 hover:opacity-100">
          <ArrowLeft size={12} /> Back to Landing
        </button>
      </>
    );
  }

  // Landing
  return (
    <>
      <Toaster position="top-center" toastOptions={{
        style: { background: '#132238', color: '#e2e8f0', border: '1px solid rgba(0,229,168,0.2)', borderRadius: '12px' },
      }} />
      <AnimatePresence>
        <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <LandingPage onSelectMode={handleSelectMode} />
        </motion.div>
      </AnimatePresence>
    </>
  );
}
