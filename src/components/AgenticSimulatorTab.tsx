import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Volume2,
  VolumeX,
  Crosshair,
  ArrowRight,
  ShieldCheck,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import {
  playGimbalMoveSound,
  playPassSound,
  playRejectSound,
  playScanClickSound,
} from '../utils/soundEffects';
import logoImg from '../assets/Logo.jpeg';

export const AgenticSimulatorTab: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [autoRunning, setAutoRunning] = useState<boolean>(false);
  const [glareDetected, setGlareDetected] = useState<boolean>(true);
  const [panAngle, setPanAngle] = useState<number>(0);
  const [tiltAngle, setTiltAngle] = useState<number>(0);
  const [polarizerAngle, setPolarizerAngle] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [pneumaticPistonFired, setPneumaticPistonFired] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [pneumaticPressureBar, setPneumaticPressureBar] = useState<number>(6.2);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Confidence & measurement calculation
  const confidence = glareDetected ? 54 : 96;
  const defectLengthMm = glareDetected ? 0.22 : 0.38;

  // Auto-run cycle
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoRunning) {
      if (currentStep === 0) {
        timer = setTimeout(() => {
          if (soundOn) playScanClickSound();
          setCurrentStep(1);
        }, 1200);
      } else if (currentStep === 1) {
        timer = setTimeout(() => {
          if (soundOn) playGimbalMoveSound();
          setPanAngle(18.5);
          setTiltAngle(-7.0);
          setPolarizerAngle(45);
          setZoomLevel(2.2);
          setGlareDetected(false);
          setCurrentStep(2);
        }, 1500);
      } else if (currentStep === 2) {
        timer = setTimeout(() => {
          if (soundOn) playPassSound();
          setCurrentStep(3);
        }, 1200);
      } else if (currentStep === 3) {
        timer = setTimeout(() => {
          if (soundOn) playRejectSound();
          setPneumaticPistonFired(true);
          setCurrentStep(4);
          setAutoRunning(false);
          setTimeout(() => setPneumaticPistonFired(false), 1000);
        }, 1200);
      }
    }
    return () => clearTimeout(timer);
  }, [autoRunning, currentStep, soundOn]);

  // Render 2D Animated Robotic Arm & Conveyor on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 480;
    const h = 320;
    canvas.width = w;
    canvas.height = h;

    // Dark industrial background
    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, w, h);

    // Draw grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw Conveyor Belt
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(40, 240, w - 80, 24);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 240, w - 80, 24);

    // Rollers
    for (let rx = 60; rx < w - 60; rx += 50) {
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(rx, 252, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Specimen (Silicon Wafer) on conveyor
    const waferX = w / 2;
    const waferY = 232;
    ctx.save();
    ctx.translate(waferX, waferY);
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 48, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Defect on Wafer
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(8, -2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Glare reflection if active
    if (glareDetected) {
      const grad = ctx.createRadialGradient(-6, -4, 0, -6, -4, 25);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(-6, -4, 25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Draw Robot Base Mount at top
    const baseX = w / 2;
    const baseY = 40;
    ctx.fillStyle = '#334155';
    ctx.fillRect(baseX - 35, baseY - 20, 70, 20);

    // Arm Link 1
    const radPan = (panAngle * Math.PI) / 180;
    const jointX = baseX + Math.sin(radPan) * 40;
    const jointY = baseY + 70;

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(jointX, jointY);
    ctx.stroke();

    // Pivot Joint
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(jointX, jointY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Arm Link 2 down to Gimbal Head
    const headX = jointX + Math.sin(radPan * 1.4) * 50;
    const headY = jointY + 60 + (zoomLevel - 1.0) * 15;

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(jointX, jointY);
    ctx.lineTo(headX, headY);
    ctx.stroke();

    // Camera Sensor Head
    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(radPan * 0.8);

    // Camera Body
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.fillRect(-18, -10, 36, 20);
    ctx.strokeRect(-18, -10, 36, 20);

    // Lens Barrel
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-10, 10, 20, 14 * zoomLevel);
    ctx.strokeRect(-10, 10, 20, 14 * zoomLevel);

    // Polarizer Filter Indicator Ring
    ctx.strokeStyle = polarizerAngle > 0 ? '#10b981' : '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 10 + 14 * zoomLevel, 12, 0, Math.PI);
    ctx.stroke();

    // Vision Raycone down to specimen
    ctx.fillStyle = glareDetected
      ? 'rgba(234, 179, 8, 0.12)'
      : 'rgba(16, 185, 129, 0.15)';
    ctx.beginPath();
    ctx.moveTo(-10, 10 + 14 * zoomLevel);
    ctx.lineTo(-45, waferY - 10);
    ctx.lineTo(45, waferY - 10);
    ctx.lineTo(10, 10 + 14 * zoomLevel);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Draw Pneumatic Ejector Piston on right side of conveyor
    const pistonBaseX = w - 60;
    const pistonBaseY = waferY;
    const pistonExtension = pneumaticPistonFired ? 55 : 8;

    ctx.fillStyle = '#475569';
    ctx.fillRect(pistonBaseX, pistonBaseY - 12, 35, 24);

    // Shaft
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(pistonBaseX - pistonExtension, pistonBaseY - 5, pistonExtension, 10);

    // Pusher Head
    ctx.fillStyle = pneumaticPistonFired ? '#f43f5e' : '#94a3b8';
    ctx.fillRect(pistonBaseX - pistonExtension - 6, pistonBaseY - 16, 6, 32);

    // Particle flash if fired
    if (pneumaticPistonFired) {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(pistonBaseX - pistonExtension - 12, pistonBaseY, 14, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [panAngle, tiltAngle, polarizerAngle, zoomLevel, glareDetected, pneumaticPistonFired]);

  // Manual Trigger: Glare Ambiguity Simulation
  const handleSimulateGlare = () => {
    if (soundOn) playGimbalMoveSound();
    setGlareDetected(true);
    setPanAngle(0);
    setTiltAngle(0);
    setPolarizerAngle(0);
    setZoomLevel(1.0);
    setCurrentStep(0);
  };

  // Manual Trigger: Auto Compensate
  const handleCompensate = () => {
    if (soundOn) playGimbalMoveSound();
    setPanAngle(18.5);
    setTiltAngle(-7.0);
    setPolarizerAngle(45);
    setZoomLevel(2.2);
    setGlareDetected(false);
    setCurrentStep(3);
    setTimeout(() => {
      if (soundOn) playPassSound();
    }, 400);
  };

  // Manual Trigger: Fire Piston
  const handleFirePiston = () => {
    if (soundOn) playRejectSound();
    setPneumaticPistonFired(true);
    setPneumaticPressureBar(5.8);
    setCurrentStep(4);
    setTimeout(() => {
      setPneumaticPistonFired(false);
      setPneumaticPressureBar(6.2);
    }, 1000);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Device Header */}
      <div className="p-4 md:p-5 rounded-2xl metallic-panel-glow flex flex-wrap items-center justify-between gap-4 relative overflow-hidden shadow-2xl">
        <span className="hud-corner hud-corner-tl" />
        <span className="hud-corner hud-corner-tr" />
        <span className="hud-corner hud-corner-bl" />
        <span className="hud-corner hud-corner-br" />

        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full overflow-hidden p-0.5 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-700 shadow-[0_0_20px_rgba(0,240,255,0.4)] ring-1 ring-cyan-400/50 flex items-center justify-center shrink-0">
            <img src={logoImg} alt="Aegis-5000 Badge" className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display font-extrabold text-base md:text-xl text-white uppercase tracking-wider flex items-center gap-2">
                Agentic Closed-Loop Robotic Actuator
              </h2>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold">
                PHYSICAL AI KINEMATICS
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Active perception loop: camera gimbal reorientation, optical polarization, and pneumatic rejection
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSoundOn(!soundOn)}
            className="p-2.5 rounded-xl btn-cyber-secondary cursor-pointer"
            title="Toggle Sound"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setAutoRunning(!autoRunning)}
            className={`px-4 py-2.5 rounded-xl font-display font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-xl ${
              autoRunning
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse'
                : 'btn-cyber-primary'
            }`}
          >
            {autoRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-slate-950" />}
            <span>{autoRunning ? 'PAUSE CYCLE' : 'AUTONOMOUS CYCLE'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Interactive 2D Robotics Canvas (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 md:p-5 rounded-2xl metallic-panel space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-cyan-400" />
                <span>Kinematic Sensor Head & Conveyor Simulation</span>
              </span>
              <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-500/40 font-bold">
                GIMBAL: {panAngle > 0 ? `+${panAngle}°` : `${panAngle}°`}
              </span>
            </div>

            {/* Canvas Container with HUD corners */}
            <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-700/80 aspect-[3/2] flex items-center justify-center shadow-2xl">
              <span className="hud-corner hud-corner-tl" />
              <span className="hud-corner hud-corner-tr" />
              <span className="hud-corner hud-corner-bl" />
              <span className="hud-corner hud-corner-br" />

              <canvas ref={canvasRef} className="w-full h-full object-contain" />

              {/* Status overlay banner */}
              <div className="absolute bottom-3 left-3 bg-[#030712]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700 text-xs font-mono flex items-center gap-2.5 shadow-xl">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    glareDetected ? 'bg-amber-400 animate-ping shadow-[0_0_8px_#f59e0b]' : 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                  }`}
                />
                <span className="text-slate-100 font-semibold">
                  {glareDetected
                    ? 'GLARE DETECTED (54% CERTAINTY - AMBIGUOUS)'
                    : 'ANGLE COMPENSATED (96% CERTAINTY - CONFIRMED)'}
                </span>
              </div>
            </div>

            {/* Quick Tactile Action Buttons */}
            <div className="grid grid-cols-3 gap-2.5 text-xs font-display font-bold uppercase tracking-wider">
              <button
                onClick={handleSimulateGlare}
                className="p-3 rounded-xl btn-cyber-secondary hover:border-amber-500/80 hover:text-amber-300 flex flex-col items-center gap-1 transition-all cursor-pointer shadow-md"
              >
                <span>☀️ Induce Glare</span>
                <span className="text-[10px] text-slate-400 font-mono normal-case tracking-normal">Simulate ambiguity</span>
              </button>

              <button
                onClick={handleCompensate}
                className="p-3 rounded-xl btn-cyber-primary text-slate-950 flex flex-col items-center gap-1 transition-all cursor-pointer shadow-xl"
              >
                <span>🔄 Auto-Gimbal (+18.5°)</span>
                <span className="text-[10px] text-slate-950 font-mono normal-case tracking-normal font-semibold">Reorient sensor head</span>
              </button>

              <button
                onClick={handleFirePiston}
                className="p-3 rounded-xl btn-cyber-secondary hover:border-rose-500/80 hover:text-rose-300 flex flex-col items-center gap-1 transition-all cursor-pointer shadow-md"
              >
                <span>💥 Pneumatic Piston</span>
                <span className="text-[10px] text-slate-400 font-mono normal-case tracking-normal">Eject defective piece</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Manual Actuator Sliders & Live Telemetry (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Telemetry Card */}
          <div className="p-4 md:p-5 rounded-2xl metallic-panel space-y-3.5 shadow-xl">
            <span className="text-xs font-display font-bold text-white uppercase tracking-wider block border-b border-slate-800 pb-2.5">
              Active Perception Telemetry
            </span>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="font-mono text-slate-400 uppercase text-[11px]">Measurement Certainty</span>
                <span
                  className={`font-mono font-bold text-sm ${
                    confidence > 80 ? 'text-emerald-400 text-glow-emerald' : 'text-amber-400 text-glow-amber'
                  }`}
                >
                  {confidence}%
                </span>
              </div>
              <div className="w-full bg-[#030712] rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    confidence > 80 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_#10b981]' : 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_#f59e0b]'
                  }`}
                  style={{ width: `${confidence}%` }}
                />
              </div>

              <div className="flex justify-between text-slate-400 pt-2.5 border-t border-slate-800 font-mono">
                <span>Measured Fissure</span>
                <span className="text-white font-bold text-glow-cyan">{defectLengthMm} mm</span>
              </div>

              <div className="flex justify-between text-slate-400 font-mono">
                <span>Pneumatic Pressure</span>
                <span className="text-cyan-400 font-bold">{pneumaticPressureBar.toFixed(1)} Bar</span>
              </div>

              <div className="flex justify-between text-slate-400 font-mono">
                <span>Ejection Piston</span>
                <span
                  className={`font-bold ${
                    pneumaticPistonFired ? 'text-rose-400 animate-pulse text-glow-rose' : 'text-slate-500'
                  }`}
                >
                  {pneumaticPistonFired ? 'ACTIVATED [EJECT]' : 'ARMED (STANDBY)'}
                </span>
              </div>
            </div>
          </div>

          {/* Manual Sliders */}
          <div className="p-4 md:p-5 rounded-2xl metallic-panel space-y-3.5 shadow-xl">
            <span className="text-xs font-display font-bold text-white uppercase tracking-wider block border-b border-slate-800 pb-2.5">
              Manual Actuator Sliders
            </span>

            {/* Pan Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span className="font-mono text-[11px] uppercase text-slate-400">Pan Angle</span>
                <span className="font-mono text-cyan-400 font-bold">{panAngle.toFixed(1)}°</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="1"
                value={panAngle}
                onChange={(e) => {
                  setPanAngle(Number(e.target.value));
                  if (Math.abs(Number(e.target.value)) > 10) setGlareDetected(false);
                }}
                className="w-full accent-cyan-400 h-1.5 bg-[#030712] rounded-lg cursor-pointer"
              />
            </div>

            {/* Polarizer Angle */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span className="font-mono text-[11px] uppercase text-slate-400">Cross-Polarizer Filter</span>
                <span className="font-mono text-emerald-400 font-bold">{polarizerAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="15"
                value={polarizerAngle}
                onChange={(e) => {
                  setPolarizerAngle(Number(e.target.value));
                  if (Number(e.target.value) >= 45) setGlareDetected(false);
                }}
                className="w-full accent-emerald-400 h-1.5 bg-[#030712] rounded-lg cursor-pointer"
              />
            </div>

            {/* Lens Zoom */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span className="font-mono text-[11px] uppercase text-slate-400">Lens Magnification (Zoom)</span>
                <span className="font-mono text-cyan-300 font-bold">{zoomLevel.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.1"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-[#030712] rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Interactive Tool Call Inspector */}
          <div className="p-4 rounded-2xl metallic-panel space-y-2 text-xs font-mono shadow-xl">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">MCP Actuator Protocol Command</span>
              <span className="text-[10px] text-emerald-400 font-bold">STATUS 200 OK</span>
            </div>
            <div className="p-3 rounded-xl bg-[#030712] border border-slate-800 text-[11px] text-cyan-300 overflow-x-auto shadow-inner">
              <code>
                {`aegis_actuator_exec({ pan: ${panAngle.toFixed(1)}, polarizer: ${polarizerAngle}, piston: ${pneumaticPistonFired} })`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
