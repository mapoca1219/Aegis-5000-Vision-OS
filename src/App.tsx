import React, { useState, useEffect } from 'react';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { VisionLabTab } from './components/VisionLabTab';
import { PipelineLabTab } from './components/PipelineLabTab';
import { AgenticSimulatorTab } from './components/AgenticSimulatorTab';
import { CoolBenchmarkTab } from './components/CoolBenchmarkTab';
import { CloudConsoleTab } from './components/CloudConsoleTab';
import { PitchShowcaseModal } from './components/PitchShowcaseModal';
import { SettingsModal } from './components/SettingsModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { SystemDiagnosticsModal } from './components/SystemDiagnosticsModal';
import { DetectedDefect } from './utils/visionEngine';
import {
  Grid,
  Cpu,
  SlidersHorizontal,
  Zap,
  Layers,
  Database,
  Bell,
  HelpCircle,
  Settings,
  Award,
  Share2,
  MoreHorizontal,
  Download,
  Activity,
  Maximize2,
  CheckCircle2,
  X,
} from 'lucide-react';
import { playScanClickSound, playPassSound } from './utils/soundEffects';

interface TabMetadata {
  id: string;
  label: string;
  title: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabMetadata[] = [
  {
    id: 'dashboard',
    label: 'Executive OS Console',
    title: '// EXECUTIVE OS CONSOLE',
    badge: '16:9 INDUSTRIAL OS',
    icon: Grid,
  },
  {
    id: 'vision-lab',
    label: 'Optical Scanner Station',
    title: '// OPTICAL SCANNER STATION',
    badge: '1080P SUB-PIXEL',
    icon: Cpu,
  },
  {
    id: 'pipeline-lab',
    label: 'OpenCV 5 G-API Lab',
    title: '// OPENCV 5 G-API WORKBENCH',
    badge: 'ARM64 NEON VECTOR',
    icon: SlidersHorizontal,
  },
  {
    id: 'agentic-loop',
    label: 'Agentic Closed-Loop',
    title: '// AGENTIC CLOSED-LOOP SIMULATOR',
    badge: 'AUTONOMOUS PLC',
    icon: Zap,
  },
  {
    id: 'benchmark',
    label: 'Compute Benchmark',
    title: '// AWS GRAVITON4 + COOL BENCHMARK',
    badge: '2.85x SPEEDUP',
    icon: Layers,
  },
  {
    id: 'cloud-console',
    label: 'Amazon S3 Defect Vault',
    title: '// AMAZON S3 DEFECT VAULT & KMS',
    badge: 'SSE-KMS 256-BIT',
    icon: Database,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isPitchOpen, setIsPitchOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-dismiss toast after 3.5 seconds
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleTabChange = (tabId: string) => {
    if (soundEnabled) playScanClickSound();
    setActiveTab(tabId);
  };

  const handleSendToAgentic = (_defect: DetectedDefect, _sampleId: string) => {
    setActiveTab('agentic-loop');
  };

  // Share URL functionality
  const handleShare = async () => {
    if (soundEnabled) playScanClickSound();
    const shareUrl = window.location.origin || 'https://aegis-5000-vision-os-kappa.vercel.app/';
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      showToast('🔗 System URL copied to clipboard: Ready for Devpost judges!');
    } catch {
      showToast(`🔗 System URL: ${shareUrl}`);
    }
  };

  // Download Telemetry JSON audit
  const handleDownloadTelemetryJson = () => {
    if (soundEnabled) playPassSound();
    setIsMoreMenuOpen(false);

    const telemetryReport = {
      system: 'Aegis-5000 Vision OS',
      version: '5.2.0-PRO',
      timestamp: new Date().toISOString(),
      hackathonTarget: 'OpenCV AI Competition 2026, powered by AWS',
      hardwareSpecs: {
        processor: 'AWS Graviton4 (c8g.2xlarge)',
        architecture: 'Arm64 / ARMv9 Neoverse-V2',
        vectorEngine: 'ARM NEON 128-bit SIMD',
        container: 'COOL (Cloud-Optimized OpenCV Linux) v2.4',
        memory: '16 GB DDR5 ECC',
      },
      benchmarks: {
        nativeGraviton4Fps: 248,
        latencyMs: 3.98,
        x86BaselineFps: 87,
        speedupFactor: '2.85x',
        activePneumaticPressureBar: 6.2,
        inspectionYieldPercentage: 98.4,
      },
      securityAndCompliance: {
        iso9001Audit: 'VERIFIED',
        kmsEncryptionKey: 'arn:aws:kms:us-east-1:123456789012:key/aegis-5000-forensic-vault',
        s3Bucket: 's3://aegis-5000-forensic-vault-us-east-1/',
        agenticDecisionCertaintyThreshold: 0.85,
      },
    };

    const blob = new Blob([JSON.stringify(telemetryReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegis-5000-telemetry-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('📥 Telemetry JSON audit exported successfully');
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (soundEnabled) playScanClickSound();
    setIsMoreMenuOpen(false);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      showToast('⛶ Entering fullscreen mode');
    } else {
      document.exitFullscreen().catch(() => {});
      showToast('⛶ Exited fullscreen mode');
    }
  };

  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <div className="h-screen w-screen bg-[#080D1A] text-slate-100 flex font-sans select-none overflow-hidden relative selection:bg-cyan-400 selection:text-black">
      {/* ==================================================================== */}
      {/* 1. MASTER PERSISTENT LEFT SLIM ICON SIDEBAR                           */}
      {/* ==================================================================== */}
      <aside className="w-14 shrink-0 bg-[#060A14] border-r border-slate-800/80 flex flex-col items-center justify-between py-3 z-30">
        <div className="flex flex-col items-center gap-3">
          {/* Holographic Delta Logo Mark */}
          <button
            onClick={() => {
              if (soundEnabled) playScanClickSound();
              setIsPitchOpen(true);
            }}
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.4)] cursor-pointer hover:scale-105 transition-transform"
            title="Aegis-5000 System Core (Click for Interactive Pitch)"
          >
            <div className="w-full h-full bg-[#080D1A] rounded-[10px] flex items-center justify-center text-cyan-400 font-extrabold text-sm">
              ▲
            </div>
          </button>

          {/* Persistent Station Navigation Icons */}
          <nav className="flex flex-col items-center gap-2 mt-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-950/80 border border-cyan-500/60 text-cyan-400 shadow-[0_0_14px_rgba(0,229,255,0.35)] scale-105'
                      : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 border border-transparent'
                  }`}
                  title={tab.label}
                >
                  <Icon className="w-4 h-4" />
                  {isActive && (
                    <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-cyan-400 rounded-r-full shadow-[0_0_8px_#00f0ff]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Persistent Sidebar Action Icons */}
        <div className="flex flex-col items-center gap-2.5">
          {/* Notifications Bell */}
          <button
            onClick={() => {
              if (soundEnabled) playScanClickSound();
              setIsNotificationsOpen(true);
            }}
            className="relative w-9 h-9 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-amber-400 transition-colors flex items-center justify-center cursor-pointer"
            title="Open Notifications & Alarms Drawer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e] animate-pulse" />
          </button>

          {/* Help / Pitch Showcase */}
          <button
            onClick={() => {
              if (soundEnabled) playScanClickSound();
              setIsPitchOpen(true);
            }}
            className="w-9 h-9 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-cyan-400 transition-colors flex items-center justify-center cursor-pointer"
            title="Interactive Pitch & Architecture (90s)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              if (soundEnabled) playScanClickSound();
              setIsSettingsOpen(true);
            }}
            className="w-9 h-9 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-cyan-400 transition-colors flex items-center justify-center cursor-pointer"
            title="System Settings & Hardware Calibration"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ==================================================================== */}
      {/* 2. MASTER APPLICATION WORKSPACE FRAME                                */}
      {/* ==================================================================== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Permanent Top Navigation Bar */}
        <header className="h-12 bg-[#080D1A] border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 text-base font-black">▲</span>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black tracking-widest text-sm md:text-base text-white uppercase flex items-center gap-1.5">
                <span>AEGIS-5000</span>
                <span className="text-cyan-400 text-glow-cyan">VISION OS</span>
              </h1>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-xs font-mono text-cyan-300 font-bold hidden md:inline">
                {currentTab.title}
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 hidden lg:inline font-bold">
                {currentTab.badge}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Executive Pitch Button */}
            <button
              onClick={() => {
                if (soundEnabled) playScanClickSound();
                setIsPitchOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-900 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Executive Pitch</span>
            </button>

            {/* Quick Action Icons */}
            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => handleTabChange('dashboard')}
                className={`p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer ${
                  activeTab === 'dashboard' ? 'text-cyan-400 bg-slate-800/60' : 'hover:text-slate-200'
                }`}
                title="Return to Executive OS Console"
              >
                <Grid className="w-4 h-4" />
              </button>

              <button
                onClick={handleShare}
                className="p-1.5 rounded-lg hover:bg-slate-800/80 hover:text-slate-200 transition-colors cursor-pointer"
                title="Share System Link (Devpost Ready)"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Three dots menu */}
              <div className="relative">
                <button
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  className="p-1.5 rounded-lg hover:bg-slate-800/80 hover:text-slate-200 transition-colors cursor-pointer"
                  title="More System Actions"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {isMoreMenuOpen && (
                  <div className="absolute right-0 top-9 w-56 bg-[#090F1C] border border-cyan-500/30 rounded-xl p-1.5 shadow-2xl z-50 text-xs font-mono text-slate-300 animate-fadeIn">
                    <button
                      onClick={handleDownloadTelemetryJson}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800/80 hover:text-cyan-400 flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Export Telemetry JSON</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        setIsDiagnosticsOpen(true);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800/80 hover:text-emerald-400 flex items-center gap-2 cursor-pointer"
                    >
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Run System Diagnostics</span>
                    </button>
                    <button
                      onClick={handleToggleFullscreen}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800/80 hover:text-white flex items-center gap-2 cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Toggle Fullscreen</span>
                    </button>
                    <div className="h-[1px] bg-slate-800 my-1" />
                    <button
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        setIsSettingsOpen(true);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800/80 hover:text-white flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Settings & Calibration</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Operator Badge Avatar */}
            <button
              type="button"
              onClick={() => {
                if (soundEnabled) playScanClickSound();
                setIsSettingsOpen(true);
              }}
              className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] font-bold text-cyan-300 cursor-pointer hover:border-cyan-400 shadow-sm transition-colors"
              title="Operator: Marco Polo Caicedo (Click to configure)"
              aria-label="Operator Settings: Marco Polo Caicedo"
            >
              MP
            </button>
          </div>
        </header>

        {/* Dynamic Main Station Viewport */}
        <main className="flex-1 overflow-hidden relative bg-[#080D1A]">
          {activeTab === 'dashboard' && (
            <div className="w-full h-full overflow-hidden">
              <ExecutiveDashboard
                onOpenPitch={() => setIsPitchOpen(true)}
                onNavigateTab={(tab) => handleTabChange(tab)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenNotifications={() => setIsNotificationsOpen(true)}
                onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
                onShare={handleShare}
                soundEnabled={soundEnabled}
              />
            </div>
          )}

          {activeTab !== 'dashboard' && (
            <div className="w-full h-full overflow-y-auto p-4 md:p-6 custom-scrollbar bg-blueprint-grid">
              <div className="max-w-7xl mx-auto pb-10">
                {activeTab === 'vision-lab' && (
                  <VisionLabTab onSendToAgentic={handleSendToAgentic} />
                )}
                {activeTab === 'pipeline-lab' && <PipelineLabTab />}
                {activeTab === 'agentic-loop' && <AgenticSimulatorTab />}
                {activeTab === 'benchmark' && <CoolBenchmarkTab />}
                {activeTab === 'cloud-console' && <CloudConsoleTab />}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ==================================================================== */}
      {/* 3. FLOATING CYBER TOAST NOTIFICATION                                 */}
      {/* ==================================================================== */}
      {toastMessage && (
        <div className="fixed top-14 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#090F1E]/95 border border-cyan-500/50 text-xs font-mono text-cyan-300 shadow-[0_0_25px_rgba(0,240,255,0.35)] backdrop-blur-md animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. PERSISTENT GLOBAL MODALS & DRAWERS                                */}
      {/* ==================================================================== */}
      <PitchShowcaseModal
        isOpen={isPitchOpen}
        onClose={() => setIsPitchOpen(false)}
        onNavigateToTab={(tab) => {
          handleTabChange(tab);
          setIsPitchOpen(false);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onShowToast={(msg) => showToast(msg)}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        soundEnabled={soundEnabled}
      />

      <SystemDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        soundEnabled={soundEnabled}
      />
    </div>
  );
}
