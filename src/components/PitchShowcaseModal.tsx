import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  HardDrive,
  Eye,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Activity,
  Award,
  Maximize2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import logoImg from '../assets/Logo.jpeg';
import {
  playPassSound,
  playRejectSound,
  playScanClickSound,
  playGimbalMoveSound,
} from '../utils/soundEffects';

interface PitchShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const PitchShowcaseModal: React.FC<PitchShowcaseModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [autoPlayProgress, setAutoPlayProgress] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Interactive stage states
  const [glareIntensity, setGlareIntensity] = useState<number>(85);
  const [isRemediating, setIsRemediating] = useState<boolean>(false);
  const [remediated, setRemediated] = useState<boolean>(false);
  const [pistonFired, setPistonFired] = useState<boolean>(false);
  const [activeArch, setActiveArch] = useState<'graviton' | 'x86'>('graviton');

  const stageCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const stages = [
    {
      id: 0,
      title: 'Executive Vision & Grand Prize Alignment',
      subtitle: 'From Passive Cameras to Physical AI Closed-Loop Systems',
      tag: 'ARCHITECTURE',
    },
    {
      id: 1,
      title: 'The Manufacturing Bottleneck: Specular Glare',
      subtitle: 'Why Traditional AOI Scraps 12-18% of Conforming Chips',
      tag: 'THE PROBLEM',
    },
    {
      id: 2,
      title: 'Autonomous Closed-Loop Remediation',
      subtitle: 'Active Robotic Perception: Gimbal Pan/Tilt & Optical Polarizer',
      tag: 'THE SOLUTION',
    },
    {
      id: 3,
      title: 'OpenCV 5 G-API on AWS Graviton4 COOL',
      subtitle: '2.85x Vectorized SIMD Speedup & 70.9% Cloud Compute Savings',
      tag: 'PERFORMANCE',
    },
    {
      id: 4,
      title: 'Physical Actuation & Amazon S3 Evidence Vault',
      subtitle: 'Millisecond PLC Pneumatic Ejection & Forensic Archival',
      tag: 'RESULTS & ROI',
    },
  ];

  // Auto-play timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying && isOpen) {
      interval = setInterval(() => {
        setAutoPlayProgress((prev) => {
          if (prev >= 100) {
            setCurrentStage((curr) => {
              const next = (curr + 1) % stages.length;
              if (soundEnabled) playScanClickSound();
              if (next === 4) {
                confetti({
                  particleCount: 80,
                  spread: 70,
                  origin: { y: 0.6 },
                });
              }
              return next;
            });
            return 0;
          }
          return prev + 2.5; // ~4 seconds per stage
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, isOpen, soundEnabled, stages.length]);

  // Stage 2 Canvas: Interactive Physical Gimbal & Wafer Glare Simulation
  useEffect(() => {
    if (!isOpen || (currentStage !== 1 && currentStage !== 2)) return;
    const canvas = stageCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 520;
    const h = 320;
    canvas.width = w;
    canvas.height = h;

    // Dark cyber navy background with blueprint grid
    ctx.fillStyle = '#060c1c';
    ctx.fillRect(0, 0, w, h);

    // Schematic grid
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Silicon Wafer Die Drawing
    const waferX = 140;
    const waferY = 160;
    const waferR = 90;

    // Wafer outer circular rim
    const waferGrad = ctx.createRadialGradient(waferX, waferY, 10, waferX, waferY, waferR);
    waferGrad.addColorStop(0, '#1e293b');
    waferGrad.addColorStop(0.7, '#0f172a');
    waferGrad.addColorStop(1, '#0284c7');

    ctx.fillStyle = waferGrad;
    ctx.beginPath();
    ctx.arc(waferX, waferY, waferR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Circuit grid on wafer
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1;
    for (let i = -waferR + 20; i < waferR - 10; i += 22) {
      ctx.strokeRect(waferX + i, waferY - 60, 18, 120);
    }

    // Defect fissure in silicon
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(waferX - 15, waferY - 20);
    ctx.lineTo(waferX + 5, waferY);
    ctx.lineTo(waferX + 22, waferY - 8);
    ctx.stroke();

    // Glare Simulation Overlay
    const actualGlare = remediated ? 5 : glareIntensity;
    if (actualGlare > 10) {
      const glareGrad = ctx.createRadialGradient(
        waferX + 5,
        waferY - 10,
        5,
        waferX + 5,
        waferY - 10,
        (actualGlare / 100) * 85
      );
      glareGrad.addColorStop(0, `rgba(255, 255, 255, ${actualGlare / 100})`);
      glareGrad.addColorStop(0.5, `rgba(0, 240, 255, ${actualGlare / 180})`);
      glareGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');

      ctx.fillStyle = glareGrad;
      ctx.beginPath();
      ctx.arc(waferX + 5, waferY - 10, (actualGlare / 100) * 85, 0, Math.PI * 2);
      ctx.fill();
    }

    // Robotic Inspection Gimbal Head & Lens on the Right
    const gimbalX = 380;
    const gimbalY = 160;
    const armAngle = remediated ? 18.5 : 0;

    // Robotic mount base
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(gimbalX + 50, 40, 50, 240);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(gimbalX + 50, 40, 50, 240);

    // Servo Joint
    ctx.save();
    ctx.translate(gimbalX, gimbalY);
    ctx.rotate((armAngle * Math.PI) / 180);

    // Camera Body
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-45, -30, 90, 60);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-45, -30, 90, 60);

    // Optical Lens Barrel
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-75, -20, 30, 40);
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(-75, -20, 30, 40);

    // Polarizer Ring
    ctx.fillStyle = remediated ? '#10b981' : '#f59e0b';
    ctx.fillRect(-85, -24, 10, 48);

    // Laser Sensor Beam
    ctx.strokeStyle = remediated ? 'rgba(16, 185, 129, 0.65)' : 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(-85, 0);
    ctx.lineTo(-240, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();

    // Corner HUD telemetry on Canvas
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(remediated ? 'AGENTIC REMEDIATION: ACTIVE (POLARIZER 45°)' : 'STATUS: SPECULAR GLARE DETECTED', 18, 28);

    ctx.fillStyle = remediated ? '#10b981' : '#f59e0b';
    ctx.fillText(
      remediated ? 'CERTAINTY: 96.4% [FISSURE CONFIRMED]' : `CERTAINTY: 42.1% [AMBIGUOUS - GLARE ${glareIntensity}%]`,
      18,
      46
    );
  }, [isOpen, currentStage, glareIntensity, remediated]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (soundEnabled) playScanClickSound();
    setCurrentStage((prev) => (prev + 1) % stages.length);
    setAutoPlayProgress(0);
  };

  const handlePrev = () => {
    if (soundEnabled) playScanClickSound();
    setCurrentStage((prev) => (prev - 1 + stages.length) % stages.length);
    setAutoPlayProgress(0);
  };

  const handleExecuteRemediation = () => {
    if (soundEnabled) playGimbalMoveSound();
    setIsRemediating(true);
    setTimeout(() => {
      setRemediated(true);
      setIsRemediating(false);
      if (soundEnabled) playPassSound();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }, 1200);
  };

  const handleFirePiston = () => {
    if (soundEnabled) playRejectSound();
    setPistonFired(true);
    setTimeout(() => setPistonFired(false), 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="metallic-panel-glow w-full max-w-5xl rounded-3xl p-5 sm:p-7 space-y-6 relative border border-cyan-500/40 shadow-2xl overflow-hidden my-auto">
        {/* Decorative HUD Corner Brackets */}
        <span className="hud-corner hud-corner-tl" />
        <span className="hud-corner hud-corner-tr" />
        <span className="hud-corner hud-corner-bl" />
        <span className="hud-corner hud-corner-br" />

        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full overflow-hidden p-0.5 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-700 shadow-[0_0_20px_rgba(0,240,255,0.45)] ring-1 ring-cyan-400/50 flex items-center justify-center shrink-0">
              <img src={logoImg} alt="Aegis-5000 Badge" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-lg sm:text-xl text-white tracking-wider uppercase">
                  AEGIS-5000 EXECUTIVE PITCH & DEMO
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-gradient-to-r from-amber-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                  HACKATHON WINNER REEL
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Grand Prize • Best Use of COOL (AWS Graviton4) • Agentic Vision Competition 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto Play Toggle */}
            <button
              onClick={() => {
                setIsAutoPlaying(!isAutoPlaying);
                if (soundEnabled) playScanClickSound();
              }}
              className={`px-3 py-1.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                isAutoPlaying
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_#00f0ff]'
                  : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{isAutoPlaying ? 'PAUSE TOUR' : 'AUTO-PLAY PITCH (90s)'}</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
              title="Toggle Audio Effects"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stage Progress Stepper Bar */}
        <div className="space-y-2">
          <div className="grid grid-cols-5 gap-2">
            {stages.map((stage) => {
              const isActive = currentStage === stage.id;
              const isPast = currentStage > stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => {
                    setCurrentStage(stage.id);
                    setAutoPlayProgress(0);
                    if (soundEnabled) playScanClickSound();
                  }}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer relative overflow-hidden ${
                    isActive
                      ? 'bg-[#08152c] border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                      : isPast
                      ? 'bg-slate-950/70 border-slate-700/80 text-slate-300'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold text-cyan-400">0{stage.id + 1}</span>
                    <span className="text-[9px] uppercase tracking-wider">{stage.tag}</span>
                  </div>
                  <div className="font-display font-bold text-xs truncate mt-0.5">{stage.title}</div>
                  {isActive && isAutoPlaying && (
                    <div
                      className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
                      style={{ width: `${autoPlayProgress}%` }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Interactive Stage Body */}
        <div className="metallic-panel rounded-2xl p-5 border border-slate-700/80 min-h-[360px] flex flex-col justify-between">
          {/* STAGE 0: Executive Overview */}
          {currentStage === 0 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-32 h-32 md:w-44 md:h-44 shrink-0 rounded-2xl overflow-hidden p-1 bg-gradient-to-br from-slate-200 via-slate-500 to-slate-800 shadow-[0_0_30px_rgba(0,240,255,0.4)] border border-cyan-400/50 flex items-center justify-center">
                  <img src={logoImg} alt="Aegis-5000 Badge" className="w-full h-full object-cover rounded-xl" />
                </div>
                <div className="space-y-3 flex-1 text-left">
                  <span className="px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
                    GRAND PRIZE VALUE PROPOSITION
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-wide">
                    Next-Generation Physical AI for Zero-Defect Smart Factories
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    High-value semiconductor wafer and solar panel inspection systems scrap up to <strong>18%</strong> of
                    conforming silicon due to <em>specular glare and lighting ambiguity</em>. Aegis-5000 is the first
                    autonomous system that couples <strong>OpenCV 5 modern G-API</strong> inside AWS Graviton4 COOL with
                    an <strong>active perception-decision-action loop</strong>: it physically re-orients lenses, eliminates
                    glare, and triggers sub-millisecond pneumatic rejection.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 font-mono">OPENCV 5 G-API</div>
                      <div className="text-cyan-400 font-bold font-mono text-base">Streaming Graph</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 font-mono">AWS GRAVITON4</div>
                      <div className="text-emerald-400 font-bold font-mono text-base">2.85x Acceleration</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 font-mono">CYCLE LATENCY</div>
                      <div className="text-cyan-400 font-bold font-mono text-base">4.03 ms P99</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 font-mono">SCRAP REDUCTION</div>
                      <div className="text-emerald-400 font-bold font-mono text-base">84% Recovered</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 1: The Manufacturing Problem */}
          {currentStage === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col lg:flex-row gap-5 items-center">
                <div className="w-full lg:w-1/2 rounded-xl overflow-hidden border border-slate-700/80 shadow-lg relative bg-black">
                  <span className="hud-corner hud-corner-tl" />
                  <span className="hud-corner hud-corner-tr" />
                  <span className="hud-corner hud-corner-bl" />
                  <span className="hud-corner hud-corner-br" />
                  <canvas ref={stageCanvasRef} className="w-full h-auto object-contain" />
                </div>

                <div className="w-full lg:w-1/2 space-y-3.5 text-left">
                  <span className="px-2.5 py-1 rounded-md bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
                    PROBLEM: SPECULAR GLARE & FALSE SCRAP
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white">
                    Passive Inspection Cameras Are Blinded by Reflections
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    In traditional AOI stations, fixed cameras cannot differentiate between true micro-cracks and
                    specular reflection flares. When confidence drops below 85%, traditional lines scrap the part,
                    burning thousands of dollars per shift.
                  </p>

                  <div className="p-3.5 rounded-xl bg-[#030712] border border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400 uppercase">Simulate Glare Intensity:</span>
                      <span className="text-amber-400 font-bold">{glareIntensity}% Flare</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={glareIntensity}
                      onChange={(e) => {
                        setGlareIntensity(Number(e.target.value));
                        setRemediated(false);
                      }}
                      className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span>Clear Surface</span>
                      <span className="text-rose-400 font-bold">Standard AOI Rejection Threshold (85%)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => {
                        setCurrentStage(2);
                        handleExecuteRemediation();
                      }}
                      className="btn-cyber-primary px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>SEE AGENTIC CLOSED-LOOP SOLUTION</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2: Autonomous Closed-Loop Remediation */}
          {currentStage === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col lg:flex-row gap-5 items-center">
                <div className="w-full lg:w-1/2 rounded-xl overflow-hidden border border-slate-700/80 shadow-lg relative bg-black">
                  <span className="hud-corner hud-corner-tl" />
                  <span className="hud-corner hud-corner-tr" />
                  <span className="hud-corner hud-corner-bl" />
                  <span className="hud-corner hud-corner-br" />
                  <canvas ref={stageCanvasRef} className="w-full h-auto object-contain" />
                </div>

                <div className="w-full lg:w-1/2 space-y-3.5 text-left">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
                    PHYSICAL AI AGENTIC LOOP
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white">
                    Perception-Decision-Action in Closed Loop
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    When uncertainty occurs, Aegis-5000 commands micro-actuators: the gimbal tilts <strong>+18.5°</strong>,
                    rotates an optical cross-polarizer <strong>45°</strong>, and zooms <strong>2.2x</strong>. Glare is
                    extinguished, revealing the genuine 0.38mm silicon fissure with <strong>96.4% confidence</strong>.
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400">SERVO GIMBAL</div>
                      <div className="text-cyan-400 font-bold text-sm mt-0.5">
                        {remediated ? '+18.5° (OPTIMAL)' : '0.0° (BLINDED)'}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400">OPTICAL POLARIZER</div>
                      <div className="text-emerald-400 font-bold text-sm mt-0.5">
                        {remediated ? '45° EXTINCTION' : '0° BYPASS'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleExecuteRemediation}
                      disabled={isRemediating}
                      className="btn-cyber-primary px-5 py-3 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                    >
                      <Sparkles className={`w-4 h-4 ${isRemediating ? 'animate-spin' : ''}`} />
                      <span>{isRemediating ? 'EXECUTING ROBOTIC REMEDIATION...' : 'TRIGGER AUTONOMOUS REMEDIATION'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 3: Performance on AWS Graviton4 COOL */}
          {currentStage === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
                    AWS GRAVITON4 & COOL CONTAINER BENCHMARK
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white mt-1">
                    Arm64 NEON Vectorized G-API vs Legacy x86 Baseline
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                  <button
                    onClick={() => setActiveArch('graviton')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      activeArch === 'graviton' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    AWS GRAVITON4 (COOL)
                  </button>
                  <button
                    onClick={() => setActiveArch('x86')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      activeArch === 'x86' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    LEGACY x86 XEON
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                <div className="p-4 rounded-xl metallic-panel border border-slate-700/80 space-y-1">
                  <span className="text-xs text-slate-400 font-mono uppercase">Inference Speed</span>
                  <div className="text-3xl font-black font-mono text-emerald-400 text-glow-emerald">
                    {activeArch === 'graviton' ? '248 FPS' : '87 FPS'}
                  </div>
                  <div className="text-xs text-slate-300 font-mono">
                    {activeArch === 'graviton' ? '2.85x Throughput Acceleration' : 'Legacy baseline throughput'}
                  </div>
                </div>

                <div className="p-4 rounded-xl metallic-panel border border-slate-700/80 space-y-1">
                  <span className="text-xs text-slate-400 font-mono uppercase">P99 Cycle Latency</span>
                  <div className="text-3xl font-black font-mono text-cyan-400 text-glow-cyan">
                    {activeArch === 'graviton' ? '4.03 ms' : '11.49 ms'}
                  </div>
                  <div className="text-xs text-slate-300 font-mono">Sub-pixel contour momemts & CLAHE</div>
                </div>

                <div className="p-4 rounded-xl metallic-panel border border-slate-700/80 space-y-1">
                  <span className="text-xs text-slate-400 font-mono uppercase">Cloud Compute Cost</span>
                  <div className="text-3xl font-black font-mono text-amber-400 text-glow-amber">
                    {activeArch === 'graviton' ? '$0.18 / M' : '$0.62 / M'}
                  </div>
                  <div className="text-xs text-slate-300 font-mono">70.9% cloud infrastructure reduction</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-300">COOL Container Image: public.ecr.aws/opencv/cool:v2.4-arm64</span>
                </div>
                <span className="text-emerald-400 font-bold">100% ARM64 NATIVE</span>
              </div>
            </div>
          )}

          {/* STAGE 4: Closed-Loop Actuation & S3 Vault */}
          {currentStage === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="px-2.5 py-1 rounded-md bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold">
                    PLANT LEVEL EXECUTION & EVIDENCE
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white mt-1">
                    Sub-Millisecond Pneumatic Ejection & Amazon S3 Forensic Vault
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-bold">
                  S3 KMS ENCRYPTED
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-slate-400">Pneumatic Actuator</span>
                    <span className={`text-xs font-mono font-bold ${pistonFired ? 'text-rose-400 animate-ping' : 'text-emerald-400'}`}>
                      {pistonFired ? 'PISTON EXTENDED [EJECTING]' : 'PLC ARMED (6.2 BAR)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Defective silicon parts are mechanically purged in &lt; 2.5ms into Containment Bin B via high-pressure
                    solenoid piston, preventing contamination of conforming assembly batches.
                  </p>
                  <button
                    onClick={handleFirePiston}
                    className="w-full btn-cyber-primary py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Zap className="w-4 h-4" />
                    <span>TEST HIGH-PRESSURE PISTON EJECT</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-slate-400">Forensic Evidence Vault</span>
                    <span className="text-xs font-mono text-cyan-300">s3://aegis-defect-vault/2026/</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Every anomalous specimen is automatically fingerprinted with sub-pixel contour coordinates,
                    timestamp, operator serial, and saved as a forensic 1080p record on AWS.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToTab?.('cloud-console');
                      }}
                      className="w-full btn-cyber-secondary py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span>OPEN S3 DEFECT VAULT</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-cyan-950/40 to-blue-950/40 border border-cyan-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Award className="w-6 h-6 text-amber-400 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-white">Full Competition Alignment:</span>{' '}
                    <span className="text-slate-300">
                      OpenCV 5 G-API + AWS Graviton4 COOL Container + Agentic Closed-Loop Physical AI.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    confetti({
                      particleCount: 100,
                      spread: 80,
                      origin: { y: 0.6 },
                    });
                    if (soundEnabled) playPassSound();
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-mono cursor-pointer transition-colors"
                >
                  CELEBRATE 🏆
                </button>
              </div>
            </div>
          )}

          {/* Bottom Stage Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 mt-4">
            <button
              onClick={handlePrev}
              className="px-4 py-2 rounded-xl btn-cyber-secondary text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>PREVIOUS STAGE</span>
            </button>

            <div className="text-xs font-mono text-slate-400">
              Stage <span className="text-cyan-400 font-bold">{currentStage + 1}</span> of {stages.length}
            </div>

            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-xl btn-cyber-primary text-xs flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <span>{currentStage === stages.length - 1 ? 'RESTART TOUR' : 'NEXT STAGE'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
