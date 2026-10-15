import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { VisionLabTab } from './components/VisionLabTab';
import { PipelineLabTab } from './components/PipelineLabTab';
import { AgenticSimulatorTab } from './components/AgenticSimulatorTab';
import { CoolBenchmarkTab } from './components/CoolBenchmarkTab';
import { CloudConsoleTab } from './components/CloudConsoleTab';
import { PitchShowcaseModal } from './components/PitchShowcaseModal';
import { DetectedDefect } from './utils/visionEngine';
import logoImg from './assets/Logo.jpeg';
import { Shield, Cpu, Zap, HardDrive, Award, Sparkles, ChevronRight } from 'lucide-react';
import { playScanClickSound } from './utils/soundEffects';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isPitchOpen, setIsPitchOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const handleSendToAgentic = (_defect: DetectedDefect, _sampleId: string) => {
    setActiveTab('agentic-loop');
  };

  // 16:9 Executive Operating System Dashboard matching reference screenshot
  if (activeTab === 'dashboard') {
    return (
      <div className="min-h-screen bg-[#080D1A] text-slate-100 flex flex-col font-sans select-none overflow-hidden">
        <ExecutiveDashboard
          onOpenPitch={() => setIsPitchOpen(true)}
          onNavigateTab={(tab) => setActiveTab(tab)}
          soundEnabled={soundEnabled}
        />
        <PitchShowcaseModal
          isOpen={isPitchOpen}
          onClose={() => setIsPitchOpen(false)}
          onNavigateToTab={(tab) => {
            setActiveTab(tab);
            setIsPitchOpen(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blueprint-grid text-slate-100 flex flex-col selection:bg-cyan-400 selection:text-black font-sans relative overflow-x-hidden">
      {/* High-tech ambient cyan light glow reflection */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 max-w-5xl h-72 bg-radial from-cyan-500/15 via-blue-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Sticky Top Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPitch={() => setIsPitchOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      {/* Executive Quick-Tour Callout Banner for Hackathon Judges */}
      <div className="max-w-7xl w-full mx-auto px-4 pt-4">
        <div className="metallic-panel-glow rounded-2xl p-3 sm:p-4 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-sm sm:text-base text-white tracking-wide">
                  HACKATHON GRAND PRIZE SHOWCASE
                </span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                  INTERACTIVE PITCH READY
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                OpenCV AI Competition 2026: Autonomous Closed-Loop Micro-Defect Remediation on AWS Graviton4 COOL
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                if (soundEnabled) playScanClickSound();
                setIsPitchOpen(true);
              }}
              className="btn-cyber-primary px-4 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg w-full sm:w-auto justify-center"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>LAUNCH INTERACTIVE PITCH (90s)</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-950" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Dynamic Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 md:py-6 z-10">
        {activeTab === 'vision-lab' && <VisionLabTab onSendToAgentic={handleSendToAgentic} />}
        {activeTab === 'pipeline-lab' && <PipelineLabTab />}
        {activeTab === 'agentic-loop' && <AgenticSimulatorTab />}
        {activeTab === 'benchmark' && <CoolBenchmarkTab />}
        {activeTab === 'cloud-console' && <CloudConsoleTab />}
      </main>

      {/* Industrial Machine Status Footer matching Logo.jpeg Specifications */}
      <footer className="border-t border-cyan-500/20 bg-[#040814]/95 backdrop-blur-xl text-xs text-slate-400 py-6 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Machine ID & Badge */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden p-0.5 bg-gradient-to-b from-slate-200 to-slate-600 shadow-[0_0_10px_rgba(0,240,255,0.3)] ring-1 ring-cyan-500/40 shrink-0">
              <img src={logoImg} alt="Aegis-5000 Badge" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-pulse" />
                <span className="font-display font-bold text-sm text-white tracking-wider">
                  AEGIS-5000 VISION OS
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  AUTONOMOUS CLOSED-LOOP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Physical AI Quality Assurance Terminal • High-Precision Sub-Pixel Inspection
              </p>
            </div>
          </div>

          {/* Architecture Badges corresponding to Logo.jpeg */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5 shadow-sm">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>OpenCV 5 G-API</span>
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 flex items-center gap-1.5 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>AWS Graviton4 Arm64 (NEON)</span>
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 flex items-center gap-1.5 shadow-sm">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>COOL Container v2.4</span>
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 flex items-center gap-1.5 shadow-sm">
              <HardDrive className="w-3.5 h-3.5 text-purple-400" />
              <span>PLC Eject & S3 Vault</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Interactive Pitch Deck & Demo Modal */}
      <PitchShowcaseModal
        isOpen={isPitchOpen}
        onClose={() => setIsPitchOpen(false)}
        onNavigateToTab={(tab) => {
          setActiveTab(tab);
          setIsPitchOpen(false);
        }}
      />
    </div>
  );
}
