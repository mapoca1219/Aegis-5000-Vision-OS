import React, { useState, useEffect } from 'react';
import { Cpu, Sparkles, Layers, SlidersHorizontal, Cloud, Activity } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const [clock, setClock] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'vision-lab', label: 'Optical Scanner Station', icon: Cpu },
    { id: 'pipeline-lab', label: 'OpenCV 5 Vision Lab', icon: SlidersHorizontal },
    { id: 'agentic-loop', label: 'Agentic Robotic Loop', icon: Sparkles },
    { id: 'benchmark', label: 'Compute Benchmark', icon: Layers },
    { id: 'cloud-console', label: 'Cloud Telemetry & Vault', icon: Cloud },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Machine Header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm md:text-base tracking-wide text-white uppercase">
                  Aegis-5000 Vision OS
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Autonomous Quality Assurance OS • OpenCV 5 & AWS Graviton4
              </p>
            </div>
          </div>

          {/* Clean Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <nav className="flex items-center gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900 bg-slate-950/80 border border-slate-800'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Real-time Clock */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>{clock}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
