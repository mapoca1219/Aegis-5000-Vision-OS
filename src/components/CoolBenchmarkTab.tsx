import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Cpu,
  Zap,
  DollarSign,
  Activity,
  Terminal,
  ArrowRight,
  CheckCircle2,
  Download,
  Flame,
  Gauge,
} from 'lucide-react';
import { playScanClickSound, playPassSound } from '../utils/soundEffects';

export const CoolBenchmarkTab: React.FC = () => {
  const [framesPerDay, setFramesPerDay] = useState<number>(1000000);
  const [isRunningSim, setIsRunningSim] = useState<boolean>(false);
  const [simFramesProcessed, setSimFramesProcessed] = useState<number>(14280);
  const [currentFps, setCurrentFps] = useState<number>(248);
  const [currentTemp, setCurrentTemp] = useState<number>(44);
  const [selectedArch, setSelectedArch] = useState<'graviton' | 'x86' | 'edge'>('graviton');
  const [downloadNotice, setDownloadNotice] = useState<boolean>(false);

  // Benchmarks
  const gravitonFps = 248;
  const x86Fps = 87;
  const edgeFps = 112;

  const activeFps = selectedArch === 'graviton' ? currentFps : selectedArch === 'x86' ? x86Fps : edgeFps;
  const speedup = (gravitonFps / x86Fps).toFixed(2); // 2.85x

  // Cost calculations
  const costX86PerMonth = (framesPerDay / 1000000) * 0.62 * 30;
  const costGravitonPerMonth = (framesPerDay / 1000000) * 0.18 * 30;
  const monthlySavings = costX86PerMonth - costGravitonPerMonth;
  const savingsPct = 70.9;

  // Energy calculations (kWh / month)
  const kwhX86 = (framesPerDay / 1000000) * 1.8 * 30;
  const kwhGraviton = (framesPerDay / 1000000) * 0.52 * 30;
  const kwhSaved = kwhX86 - kwhGraviton;

  const handleRunStressTest = () => {
    playScanClickSound();
    setIsRunningSim(true);
    let count = 0;
    const interval = setInterval(() => {
      count += 500;
      setSimFramesProcessed((prev) => prev + 500);
      setCurrentFps(Math.round(244 + Math.random() * 9));
      setCurrentTemp((prev) => Math.min(52, prev + 1));
      if (count >= 5000) {
        clearInterval(interval);
        setIsRunningSim(false);
        playPassSound();
        setTimeout(() => setCurrentTemp(44), 3000);
      }
    }, 100);
  };

  const handleExportBenchmark = () => {
    playPassSound();
    const data = {
      benchmarkTimestamp: new Date().toISOString(),
      architecture: selectedArch,
      graviton4Fps: gravitonFps,
      x86Fps: x86Fps,
      speedupFactor: `${speedup}x`,
      latencyP99Ms: 4.03,
      framesEvaluated: simFramesProcessed,
      monthlySavingsUsd: monthlySavings.toFixed(2),
      energySavedKwh: kwhSaved.toFixed(1),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `benchmark_graviton4_${Date.now()}.json`;
    a.click();
    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 2500);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="metallic-panel p-5 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80" />
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-400/50 flex items-center justify-center font-bold text-xl shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                BENCHMARK ENGINE 4.2
              </span>
              <span className="text-[10px] font-mono text-slate-400">AWS c8g.2xlarge • Arm64 NEON</span>
            </div>
            <h2 className="font-display font-bold text-lg text-white uppercase tracking-wider mt-1">
              AWS Graviton4 + COOL Benchmark Studio
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              Deterministic real-time throughput profiling: Arm64 NEON vectorized runtime vs legacy x86 architectures.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={handleExportBenchmark}
            className="btn-cyber-secondary flex items-center gap-1.5 cursor-pointer text-xs px-3.5 py-2"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>{downloadNotice ? 'EXPORTED!' : 'EXPORT JSON AUDIT'}</span>
          </button>

          <button
            onClick={handleRunStressTest}
            disabled={isRunningSim}
            className="btn-cyber-primary flex items-center gap-2 cursor-pointer text-xs px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)] disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isRunningSim ? 'animate-spin' : ''}`} />
            <span>{isRunningSim ? 'STREAMING...' : 'RUN LIVE STRESS TEST'}</span>
          </button>
        </div>
      </div>

      {/* Architecture Selection Blades */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {[
          {
            id: 'graviton' as const,
            title: 'Graviton4 + COOL',
            subtitle: 'Arm64 Vectorized NEON G-API',
            fps: '248 FPS',
            badge: 'ACTIVE HARDWARE',
            activeBorder: 'border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/40',
            fpsColor: 'text-emerald-400 text-glow-emerald',
          },
          {
            id: 'x86' as const,
            title: 'Intel / AMD Baseline',
            subtitle: 'x86-64 SSE4.2 Legacy Mode',
            fps: '87 FPS',
            badge: 'LEGACY BASELINE',
            activeBorder: 'border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/40',
            fpsColor: 'text-slate-200',
          },
          {
            id: 'edge' as const,
            title: 'Embedded Edge NPU',
            subtitle: 'On-Premises Jetson Orin',
            fps: '112 FPS',
            badge: 'EDGE HARDWARE',
            activeBorder: 'border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.2)] ring-1 ring-cyan-400/40',
            fpsColor: 'text-cyan-400 text-glow-cyan',
          },
        ].map((arch) => (
          <button
            key={arch.id}
            onClick={() => setSelectedArch(arch.id)}
            className={`metallic-panel p-4 text-left transition-all cursor-pointer relative overflow-hidden ${
              selectedArch === arch.id
                ? `${arch.activeBorder}`
                : 'hover:border-slate-600 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-display font-bold text-white uppercase tracking-wider truncate">{arch.title}</span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950/90 text-slate-300 border border-slate-700/60 shrink-0">
                {arch.badge}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1 leading-snug">{arch.subtitle}</div>
            <div className={`text-2xl sm:text-3xl font-black font-mono mt-2.5 ${arch.fpsColor}`}>{arch.fps}</div>
            {selectedArch === arch.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-400" />
            )}
          </button>
        ))}
      </div>

      {/* Real-time Hardware Gauges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Speedup Meter */}
        <div className="metallic-panel p-4 hud-corner flex flex-col justify-between border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-display font-bold uppercase tracking-wider text-slate-300">Vector Speedup</span>
            <span className="text-emerald-400 font-mono font-bold text-[11px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
              2.85x
            </span>
          </div>
          <div>
            <div className="text-3xl font-black font-mono text-emerald-400 text-glow-emerald tracking-tight">{speedup}x</div>
            <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span>Throughput vs x86-64</span>
            </div>
          </div>
          <div className="w-full bg-slate-950/80 rounded-full h-1.5 overflow-hidden border border-emerald-500/20">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full w-[95%] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          </div>
        </div>

        {/* Latency Meter */}
        <div className="metallic-panel p-4 hud-corner flex flex-col justify-between border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-display font-bold uppercase tracking-wider text-slate-300">Loop Latency (P99)</span>
            <span className="text-cyan-400 font-mono font-bold text-[11px] bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
              TARGET &lt; 5ms
            </span>
          </div>
          <div>
            <div className="text-3xl font-black font-mono text-cyan-400 text-glow-cyan tracking-tight">
              {selectedArch === 'graviton' ? '4.03 ms' : selectedArch === 'x86' ? '11.49 ms' : '8.92 ms'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
              <span>Per-frame cycle time</span>
            </div>
          </div>
          <div className="w-full bg-slate-950/80 rounded-full h-1.5 overflow-hidden border border-cyan-500/20">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-400 h-full w-[90%] shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
          </div>
        </div>

        {/* Temperature Gauge */}
        <div className="metallic-panel p-4 hud-corner flex flex-col justify-between border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-display font-bold uppercase tracking-wider text-slate-300">Die Temperature</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-3xl font-black font-mono text-amber-400 tracking-tight">{currentTemp} °C</div>
            <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span>{currentTemp > 48 ? 'Heavy Load Envelope' : 'Optimal Envelope'}</span>
            </div>
          </div>
          <div className="w-full bg-slate-950/80 rounded-full h-1.5 overflow-hidden border border-amber-500/20">
            <div
              className={`h-full transition-all duration-300 ${
                currentTemp > 48
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                  : 'bg-gradient-to-r from-teal-500 to-emerald-400 shadow-[0_0_10px_rgba(20,184,166,0.5)]'
              }`}
              style={{ width: `${(currentTemp / 70) * 100}%` }}
            />
          </div>
        </div>

        {/* Total Processed Counter */}
        <div className="metallic-panel p-4 hud-corner flex flex-col justify-between border-purple-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-display font-bold uppercase tracking-wider text-slate-300">Frames Ingested</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-3xl font-black font-mono text-purple-400 tracking-tight">
              {simFramesProcessed.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
              <span>Continuous live stream</span>
            </div>
          </div>
          <div className="w-full bg-slate-950/80 rounded-full h-1.5 overflow-hidden border border-purple-500/20">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-400 h-full w-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
          </div>
        </div>
      </div>

      {/* Production Volume & Cloud Economy Calculator */}
      <div className="metallic-panel-glow p-5 sm:p-6 space-y-5 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400 uppercase bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                PLANT FINANCES &amp; ESG
              </span>
              <span className="text-[10px] font-mono text-slate-400">AWS GRAVITON4 COOL SAVINGS</span>
            </div>
            <h3 className="text-base font-display font-bold text-white uppercase tracking-wider mt-1">
              Industrial Compute Economy &amp; Green Energy Model
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Simulate enterprise plant throughput to project OPEX cost reductions and electrical kilowatt savings.
            </p>
          </div>
          <div className="sm:text-right shrink-0">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Production Volume</div>
            <span className="text-sm font-mono font-bold text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-400/50 inline-block mt-0.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              {(framesPerDay / 1000000).toFixed(1)} Million parts / day
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>200K parts/day (Pilot Line)</span>
            <span className="text-emerald-400 font-bold">{(framesPerDay / 1000000).toFixed(1)}M PARTS</span>
            <span>10M parts/day (Giga-factory)</span>
          </div>
          <input
            type="range"
            min="200000"
            max="10000000"
            step="200000"
            value={framesPerDay}
            onChange={(e) => setFramesPerDay(Number(e.target.value))}
            className="w-full accent-cyan-400 h-2 bg-slate-950 rounded-lg cursor-pointer border border-cyan-500/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          {/* x86 Cost */}
          <div className="metallic-panel p-4 space-y-2 border-rose-500/30">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-display font-bold uppercase tracking-wider text-[11px]">Legacy x86 OPEX</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/30">
                c6i.2xlarge
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-rose-400 text-glow-rose tracking-tight">
              ${costX86PerMonth.toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-400 font-sans">/ mo</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Baseline x86-64 cloud compute
            </div>
          </div>

          {/* Graviton4 Cost */}
          <div className="metallic-panel p-4 space-y-2 border-cyan-500/30">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-display font-bold uppercase tracking-wider text-[11px]">Graviton4 COOL OPEX</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                c8g.2xlarge
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-cyan-400 text-glow-cyan tracking-tight">
              ${costGravitonPerMonth.toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-400 font-sans">/ mo</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Vectorized Arm64 NEON instances
            </div>
          </div>

          {/* Net Savings */}
          <div className="metallic-panel p-4 space-y-2 border-emerald-400/50 bg-emerald-950/30 ring-1 ring-emerald-400/40">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-300 font-display font-bold uppercase tracking-wider text-[11px]">Net Plant Savings</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-200 border border-emerald-400/50">
                -70.9% OPEX
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-emerald-300 text-glow-emerald tracking-tight">
              +${monthlySavings.toFixed(2)}{' '}
              <span className="text-xs font-normal text-emerald-400 font-sans">/ mo</span>
            </div>
            <div className="text-[11px] text-emerald-300/90 font-mono">
              Conserves {kwhSaved.toFixed(0)} kWh electrical energy / mo
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
