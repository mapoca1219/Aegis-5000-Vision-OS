import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Sparkles,
  Layers,
  SlidersHorizontal,
  Cloud,
  Activity,
  ShieldCheck,
  Zap,
  Volume2,
  VolumeX,
  Award,
  Grid,
} from 'lucide-react';
import logoImg from '../assets/Logo.jpeg';
import { playScanClickSound } from '../utils/soundEffects';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPitch?: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenPitch,
  soundEnabled = true,
  onToggleSound,
}) => {
  const [clock, setClock] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Executive OS Console', icon: Grid, badge: 'DASHBOARD' },
    { id: 'vision-lab', label: 'Optical Scanner Station', icon: Cpu, badge: 'LIVE GIGE' },
    { id: 'pipeline-lab', label: 'OpenCV 5 Vision Lab', icon: SlidersHorizontal, badge: 'G-API' },
    { id: 'agentic-loop', label: 'Agentic Closed-Loop', icon: Sparkles, badge: 'AUTOPILOT' },
    { id: 'benchmark', label: 'Compute Benchmark', icon: Layers, badge: '2.85x' },
    { id: 'cloud-console', label: 'Cloud Telemetry & Vault', icon: Cloud, badge: 'S3 VAULT' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#050b18]/95 backdrop-blur-xl border-b border-cyan-500/25 text-slate-100 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.85)]">
      {/* Top Industrial Micro-Telemetry Ticker */}
      <div className="bg-[#030712] border-b border-slate-800/80 px-4 py-1 text-[10px] font-mono text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              OPENCV 5 G-API CLOUD OPTIMIZED ENGINE
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline text-slate-300">AWS GRAVITON4 (Arm64 NEON)</span>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="hidden md:inline text-emerald-400 font-medium">PLC PNEUMATIC EJECT: ARMED (6.2 BAR)</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 shrink-0">
            <span className="text-cyan-400/90 hidden lg:inline font-bold">CLOSED-LOOP LATENCY: &lt; 4.0ms</span>
            <span className="hidden lg:inline text-slate-600">•</span>
            <span className="px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold">
              SYS-VER 5.2.0-PRO
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          {/* Machine Brand Identity matching Logo.jpeg */}
          <div className="flex items-center justify-between xl:justify-start gap-4">
            <div className="flex items-center gap-3.5">
              {/* Authentic Circular Metallic Emblem */}
              <div
                onClick={onOpenPitch}
                className="relative group cursor-pointer shrink-0"
                title="Click to launch Hackathon Interactive Pitch"
              >
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-300 opacity-60 blur-xs group-hover:opacity-100 transition duration-300 animate-pulse" />
                <div className="relative w-12 h-12 rounded-full overflow-hidden p-0.5 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-700 shadow-[0_0_15px_rgba(0,240,255,0.4)] ring-1 ring-cyan-400/40 flex items-center justify-center">
                  <img
                    src={logoImg}
                    alt="Aegis-5000 Badge"
                    className="w-full h-full object-cover rounded-full transform group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#050b18] border border-cyan-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                </div>
              </div>

              {/* Title Typography */}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display font-extrabold text-base md:text-lg tracking-wider text-white uppercase flex items-center gap-1.5">
                    <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">AEGIS-5000</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 text-glow-cyan font-black">
                      VISION OS
                    </span>
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.2)] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-cyan-400" />
                    <span>ONLINE</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                  <span className="text-cyan-400 font-semibold">AUTONOMOUS CLOSED-LOOP REMEDIATION</span>
                  <span className="hidden md:inline text-slate-600">•</span>
                  <span className="hidden md:inline text-slate-400">OpenCV 5 G-API & AWS Graviton4</span>
                </p>
              </div>
            </div>

            {/* Prominent Hackathon Pitch Button on Small/Medium Screens */}
            <div className="flex xl:hidden items-center gap-2">
              <button
                onClick={onOpenPitch}
                className="btn-cyber-primary px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg animate-pulse"
              >
                <Award className="w-3.5 h-3.5 text-slate-950" />
                <span>PITCH REEL</span>
              </button>
            </div>
          </div>

          {/* High-Tech Industrial Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0 scrollbar-none">
            {/* The Dedicated Hackathon Pitch Button (Desktop) */}
            <button
              onClick={onOpenPitch}
              className="hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-display font-extrabold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 shadow-[0_0_20px_rgba(245,158,11,0.5)] border-t border-white/60 transition-all cursor-pointer transform hover:scale-105 active:scale-95 shrink-0"
            >
              <Award className="w-4 h-4 text-slate-950" />
              <span>🏆 HACKATHON PITCH & DEMO</span>
            </button>

            <nav className="flex items-center gap-1.5 bg-[#081022]/90 p-1 rounded-2xl border border-cyan-500/25 shadow-inner">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (soundEnabled) playScanClickSound();
                      setActiveTab(item.id);
                    }}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(0,240,255,0.4)] border-t border-cyan-200/50 ring-1 ring-cyan-400/50'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80 hover:border-slate-700/60 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]' : 'text-cyan-400/70'}`} />
                    <span className="font-tech tracking-wide">{item.label}</span>
                    {isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-200 shadow-[0_0_6px_#fff]" />
                    ) : (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Sound Toggle */}
            {onToggleSound && (
              <button
                onClick={onToggleSound}
                className="p-2 rounded-xl bg-[#081022] border border-cyan-500/25 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer shrink-0"
                title={soundEnabled ? 'Mute audio' : 'Enable audio feedback'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
              </button>
            )}

            {/* Real-time Hardware Clock */}
            <div className="hidden 2xl:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#081022] border border-cyan-500/25 text-[11px] font-mono text-cyan-300 shadow-inner shrink-0">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="tracking-widest font-semibold">{clock}</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                LOC
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
