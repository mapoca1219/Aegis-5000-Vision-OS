import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { VisionLabTab } from './components/VisionLabTab';
import { PipelineLabTab } from './components/PipelineLabTab';
import { AgenticSimulatorTab } from './components/AgenticSimulatorTab';
import { CoolBenchmarkTab } from './components/CoolBenchmarkTab';
import { CloudConsoleTab } from './components/CloudConsoleTab';
import { DetectedDefect } from './utils/visionEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('vision-lab');

  const handleSendToAgentic = (_defect: DetectedDefect, _sampleId: string) => {
    setActiveTab('agentic-loop');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Sticky Top Navigation */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Dynamic Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:py-8">
        {activeTab === 'vision-lab' && <VisionLabTab onSendToAgentic={handleSendToAgentic} />}
        {activeTab === 'pipeline-lab' && <PipelineLabTab />}
        {activeTab === 'agentic-loop' && <AgenticSimulatorTab />}
        {activeTab === 'benchmark' && <CoolBenchmarkTab />}
        {activeTab === 'cloud-console' && <CloudConsoleTab />}
      </main>

      {/* Industrial Machine Status Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 text-xs text-slate-500 py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-slate-300">Aegis-5000 Vision OS</span>
            <span>•</span>
            <span className="text-slate-400">High-Precision Optical Quality Assurance Terminal</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span>OpenCV 5 G-API</span>
            <span>•</span>
            <span>AWS Graviton4 Arm64</span>
            <span>•</span>
            <span>Edge & Cloud Compute Pipeline</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
