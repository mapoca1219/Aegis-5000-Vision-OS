import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Sliders,
  Layers,
  Cpu,
  Zap,
  Shield,
  Award,
  Sparkles,
  Camera,
  CameraOff,
  Share2,
  MoreHorizontal,
  Grid,
  ChevronDown,
  Info,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Eye,
  Settings,
  Database,
  Radio,
  Bell,
  Gauge,
  HelpCircle,
  LogOut,
  Maximize2,
  Terminal,
} from 'lucide-react';
import {
  playScanClickSound,
  playPassSound,
  playRejectSound,
  playGimbalMoveSound,
} from '../utils/soundEffects';

interface ExecutiveDashboardProps {
  onOpenPitch: () => void;
  onNavigateTab: (tabId: string) => void;
  soundEnabled?: boolean;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  onOpenPitch,
  onNavigateTab,
  soundEnabled = true,
}) => {
  // Optical Scanner State
  const [tiltVal, setTiltVal] = useState<number>(0);
  const [panVal, setPanVal] = useState<number>(0);
  const [gimbalOrientation, setGimbalOrientation] = useState<number>(18.5);
  const [useWebcam, setUseWebcam] = useState<boolean>(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);

  // Presenter Facecam State
  const [facecamActive, setFacecamActive] = useState<boolean>(false);
  const [facecamStream, setFacecamStream] = useState<MediaStream | null>(null);
  const facecamVideoRef = useRef<HTMLVideoElement | null>(null);
  const scannerVideoRef = useRef<HTMLVideoElement | null>(null);
  const pcbCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const histCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // OpenCV 5 Algorithm Workbench State
  const [activeStage, setActiveStage] = useState<number>(2); // Stage 2 active as in screenshot
  const [cannyThreshold1, setCannyThreshold1] = useState<number>(45);
  const [cannyThreshold2, setCannyThreshold2] = useState<number>(100);
  const [contrastLimit, setContrastLimit] = useState<number>(50);
  const [pixelIntensity, setPixelIntensity] = useState<number>(100);

  // Right Side Telemetry Tabs State
  const [rightTab, setRightTab] = useState<'agentic' | 'benchmark'>('agentic');
  const [isStressRunning, setIsStressRunning] = useState<boolean>(false);
  const [simFps, setSimFps] = useState<number>(248);
  const [pneumaticPressure, setPneumaticPressure] = useState<number>(6.2);
  const [inspectionYield, setInspectionYield] = useState<number>(98.4);

  // Toggle Live Webcam for Scanner
  const toggleScannerWebcam = async () => {
    if (soundEnabled) playScanClickSound();
    if (useWebcam) {
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop());
        setWebcamStream(null);
      }
      setUseWebcam(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
        });
        setWebcamStream(stream);
        setUseWebcam(true);
      } catch (err) {
        console.warn('Webcam permission denied or unavailable, using synthetic PCB feed:', err);
        setUseWebcam(false);
      }
    }
  };

  // Toggle Facecam
  const toggleFacecam = async () => {
    if (soundEnabled) playScanClickSound();
    if (facecamActive) {
      if (facecamStream) {
        facecamStream.getTracks().forEach((track) => track.stop());
        setFacecamStream(null);
      }
      setFacecamActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 360 },
        });
        setFacecamStream(stream);
        setFacecamActive(true);
      } catch (err) {
        console.warn('Facecam permission denied:', err);
        setFacecamActive(false);
      }
    }
  };

  // Bind video element streams
  useEffect(() => {
    if (facecamVideoRef.current && facecamStream) {
      facecamVideoRef.current.srcObject = facecamStream;
    }
  }, [facecamStream]);

  useEffect(() => {
    if (scannerVideoRef.current && webcamStream) {
      scannerVideoRef.current.srcObject = webcamStream;
    }
  }, [webcamStream]);

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      if (webcamStream) webcamStream.getTracks().forEach((t) => t.stop());
      if (facecamStream) facecamStream.getTracks().forEach((t) => t.stop());
    };
  }, [webcamStream, facecamStream]);

  // Draw Realistic High-Density PCB Canvas with Scan Reticle & Defect Boxes
  useEffect(() => {
    if (useWebcam) return;
    const canvas = pcbCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let scanLineY = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      // 1. Dark Industrial Green PCB Solder Mask
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#0a2318');
      bgGrad.addColorStop(0.5, '#071b12');
      bgGrad.addColorStop(1, '#05140d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Apply Pan & Tilt offsets
      ctx.save();
      ctx.translate(panVal * 10, tiltVal * 10);

      // 2. Copper Traces / Tracks
      ctx.strokeStyle = '#1b4d36';
      ctx.lineWidth = 2.5;

      // Diagonal & Horizontal Bus lines
      for (let y = 30; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w * 0.35, y);
        ctx.lineTo(w * 0.45, y + 20);
        ctx.lineTo(w, y + 20);
        ctx.stroke();
      }

      // 3. Central QFP / Micro-Controller IC Chip (IC10)
      const icX = w * 0.36;
      const icY = h * 0.28;
      const icW = w * 0.32;
      const icH = h * 0.44;

      // Silver IC Pin Leads
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      const numPins = 14;

      // Left & Right pins
      for (let i = 0; i < numPins; i++) {
        const py = icY + (icH / (numPins + 1)) * (i + 1);
        ctx.beginPath();
        ctx.moveTo(icX - 16, py);
        ctx.lineTo(icX, py);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(icX + icW, py);
        ctx.lineTo(icX + icW + 16, py);
        ctx.stroke();
      }

      // Top & Bottom pins
      for (let i = 0; i < numPins; i++) {
        const px = icX + (icW / (numPins + 1)) * (i + 1);
        ctx.beginPath();
        ctx.moveTo(px, icY - 16);
        ctx.lineTo(px, icY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(px, icY + icH);
        ctx.lineTo(px, icY + icH + 16);
        ctx.stroke();
      }

      // IC Body (Matte Black Epoxy Package)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(icX, icY, icW, icH);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(icX, icY, icW, icH);

      // IC Laser Engraved Label
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('AEGIS-SOC-5', icX + 18, icY + icH * 0.45);
      ctx.fillText('ARM64 NEON', icX + 18, icY + icH * 0.6);

      // Pin 1 Index Dot
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(icX + 12, icY + 12, 3, 0, Math.PI * 2);
      ctx.fill();

      // 4. SMD Capacitors & Resistors around IC
      const smdComponents = [
        { x: w * 0.12, y: h * 0.22, w: 26, h: 48, label: 'C10' },
        { x: w * 0.12, y: h * 0.52, w: 26, h: 48, label: 'C13' },
        { x: w * 0.78, y: h * 0.2, w: 54, h: 90, label: 'U5' },
        { x: w * 0.75, y: h * 0.65, w: 20, h: 36, label: 'R21' },
        { x: w * 0.82, y: h * 0.65, w: 20, h: 36, label: 'R22' },
      ];

      smdComponents.forEach((comp) => {
        // Ceramic body
        ctx.fillStyle = '#78716c';
        ctx.fillRect(comp.x, comp.y, comp.w, comp.h);
        // Solder metal terminations
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(comp.x, comp.y, comp.w, 6);
        ctx.fillRect(comp.x, comp.y + comp.h - 6, comp.w, 6);
        // Silkscreen text
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px monospace';
        ctx.fillText(comp.label, comp.x + 2, comp.y - 4);
      });

      // 5. Digital Coordinate Laser Grid Overlay (Green matrix from reference screenshot)
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.28)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 42) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 42) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // 6. Defect Bounding Boxes (Neon Green with Reticle Brackets)
      const defectBoxes = [
        { x: icX + 16, y: icY + 22, w: 42, h: 42, tag: 'PIN-SHORT' },
        { x: icX + icW - 28, y: icY + 36, w: 32, h: 32, tag: 'BRIDGING' },
        { x: w * 0.74, y: h * 0.64, w: 36, h: 42, tag: 'VOID' },
      ];

      defectBoxes.forEach((box) => {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(box.x, box.y, box.w, box.h);

        // Reticle Corners
        const s = 6;
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2;
        // TL
        ctx.beginPath();
        ctx.moveTo(box.x - 2, box.y + s);
        ctx.lineTo(box.x - 2, box.y - 2);
        ctx.lineTo(box.x + s, box.y - 2);
        ctx.stroke();
        // BR
        ctx.beginPath();
        ctx.moveTo(box.x + box.w + 2, box.y + box.h - s);
        ctx.lineTo(box.x + box.w + 2, box.y + box.h + 2);
        ctx.lineTo(box.x + box.w - s, box.y + box.h + 2);
        ctx.stroke();

        // Tag label
        ctx.fillStyle = 'rgba(6, 78, 59, 0.85)';
        ctx.fillRect(box.x, box.y - 12, 48, 11);
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 7.5px monospace';
        ctx.fillText(box.tag, box.x + 3, box.y - 3);
      });

      // 7. Scanning Laser Line
      scanLineY = (scanLineY + 2.5) % h;
      const laserGrad = ctx.createLinearGradient(0, scanLineY - 15, 0, scanLineY + 15);
      laserGrad.addColorStop(0, 'rgba(16, 185, 129, 0)');
      laserGrad.addColorStop(0.5, 'rgba(52, 211, 153, 0.85)');
      laserGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = laserGrad;
      ctx.fillRect(0, scanLineY - 15, w, 30);

      ctx.restore();

      animFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrame);
  }, [useWebcam, tiltVal, panVal]);

  // Draw 2D Digital Histogram matching screenshot (teal/cyan bar chart)
  useEffect(() => {
    const canvas = histCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Dark grid background
    ctx.fillStyle = '#080e1b';
    ctx.fillRect(0, 0, w, h);

    // Subtle horizontal grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75].forEach((ratio) => {
      ctx.beginPath();
      ctx.moveTo(0, h * ratio);
      ctx.lineTo(w, h * ratio);
      ctx.stroke();
    });

    // Bars: 64 bins
    const numBars = 70;
    const barW = (w - 20) / numBars;

    // Normal distribution centered at x = 0.65
    for (let i = 0; i < numBars; i++) {
      const normX = i / numBars;
      const mean = 0.68;
      const sigma = 0.16;
      const gauss = Math.exp(-Math.pow(normX - mean, 2) / (2 * Math.pow(sigma, 2)));
      const noise = (Math.sin(i * 1.5) * 0.08 + Math.cos(i * 2.8) * 0.05);
      const barHeight = Math.max(6, (gauss + noise) * (h * 0.82));

      const bx = 10 + i * barW;
      const by = h - barHeight - 4;

      // Cyan to Teal gradient
      const barGrad = ctx.createLinearGradient(0, by, 0, h);
      barGrad.addColorStop(0, '#06b6d4');
      barGrad.addColorStop(0.5, '#0d9488');
      barGrad.addColorStop(1, '#042f2e');

      ctx.fillStyle = barGrad;
      ctx.fillRect(bx, by, barW - 1.5, barHeight);
    }

    // Two vertical guide markers (Amber/Orange lines at ~35% and ~70%)
    const m1X = w * 0.38;
    const m2X = w * 0.75;

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(m1X, 6);
    ctx.lineTo(m1X, h - 4);
    ctx.stroke();

    ctx.strokeStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(m2X, 6);
    ctx.lineTo(m2X, h - 4);
    ctx.stroke();
  }, [contrastLimit, pixelIntensity]);

  // Run Stress Test in Benchmark tab
  const handleRunStress = () => {
    if (soundEnabled) playScanClickSound();
    setIsStressRunning(true);
    let count = 0;
    const interval = setInterval(() => {
      count += 1;
      setSimFps(Math.round(244 + Math.random() * 8));
      if (count > 25) {
        clearInterval(interval);
        setIsStressRunning(false);
        if (soundEnabled) playPassSound();
      }
    }, 100);
  };

  // Trigger Autonomous Agentic Cycle from Dashboard
  const handleTriggerAgentic = () => {
    if (soundEnabled) playGimbalMoveSound();
    setGimbalOrientation(18.5);
    setPanVal(2);
    setTiltVal(-1);
    setPneumaticPressure(6.2);
    setInspectionYield(98.4);
    setTimeout(() => {
      if (soundEnabled) playRejectSound();
    }, 800);
  };

  // 6 Pipeline Stages matching reference screenshot
  const pipelineStages = [
    { id: 1, label: '1. Stage 1 Graph', sub: 'Input Frame', icon: Activity },
    { id: 2, label: '2. Computer Vision', sub: 'OpenCV G-API', icon: Layers },
    { id: 3, label: '3. Coputer Processing Pipeline', sub: 'Adaptive CLAHE', icon: Radio },
    { id: 4, label: '4. Stage 4 Pipeline', sub: 'Canny Moments', icon: Eye },
    { id: 5, label: '5. Stage 5 Processing', sub: 'Morphology', icon: Database },
    { id: 6, label: '6. Stage 6 Pipeline', sub: 'Spectral Heatmap', icon: Settings },
  ];

  // Inspection Log Rows matching screenshot
  const logRows = [
    { id: 'Inspection 5000', telemetry: 'High-density PCB/micro-defect scanning, vaneity PCB/micro-defect', spec: '10 mm', size: '25 µm', time: '2026-05-06', status: 'REJECT' },
    { id: 'Inspection 5000', telemetry: 'High-density PCB/micro-defect scanning, vaneity PCB/micro-defect', spec: '10 mm', size: '1.2 µm', time: '2026-05-06', status: 'PASS' },
    { id: 'Inspection 5000', telemetry: 'High-density PCB/micro-defect scanning, vaneity PCB/micro-defect', spec: '10 mm', size: '33 µm', time: '2026-05-06', status: 'REJECT' },
    { id: 'Inspection 5000', telemetry: 'High-density PCB/micro-defect scanning, vaneity PCB/micro-defect', spec: '10 mm', size: '25 µm', time: '2026-05-06', status: 'QUARANTINE' },
    { id: 'Inspection 5000', telemetry: 'High-density PCB/micro-defect scanning, vaneity PCB/micro-defect', spec: '10 mm', size: '20 µm', time: '2026-05-06', status: 'REJECT' },
  ];

  return (
    <div className="flex h-screen w-full bg-[#080D1A] text-slate-100 overflow-hidden font-sans select-none">
      {/* ==================================================================== */}
      {/* 1. LEFT SLIM ICON NAVIGATION SIDEBAR (Matching reference image)       */}
      {/* ==================================================================== */}
      <aside className="w-14 shrink-0 bg-[#060A14] border-r border-slate-800/80 flex flex-col items-center justify-between py-3 z-30">
        {/* Top Branding Emblem */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={onOpenPitch}
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.4)] cursor-pointer hover:scale-105 transition-transform"
            title="Aegis-5000 System Core"
          >
            <div className="w-full h-full bg-[#080D1A] rounded-[10px] flex items-center justify-center text-cyan-400 font-extrabold text-sm">
              ▲
            </div>
          </button>

          {/* Navigation Icons matching screenshot */}
          <div className="flex flex-col items-center gap-2 mt-2">
            {/* Home / OS Console (Active) */}
            <button
              onClick={() => onNavigateTab('dashboard')}
              className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.3)] cursor-pointer"
              title="Operating System Dashboard (Executive Console)"
            >
              <Grid className="w-4 h-4" />
            </button>

            {/* Optical Scanner View */}
            <button
              onClick={() => onNavigateTab('vision-lab')}
              className="w-10 h-10 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-cyan-400 transition-colors flex items-center justify-center cursor-pointer"
              title="Optical Scanner Station (Full View)"
            >
              <Cpu className="w-4 h-4" />
            </button>

            {/* OpenCV 5 Pipeline Lab */}
            <button
              onClick={() => onNavigateTab('pipeline-lab')}
              className="w-10 h-10 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-cyan-400 transition-colors flex items-center justify-center cursor-pointer"
              title="OpenCV 5 G-API Vision Lab"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Agentic Simulator */}
            <button
              onClick={() => onNavigateTab('agentic-loop')}
              className="w-10 h-10 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-cyan-400 transition-colors flex items-center justify-center cursor-pointer"
              title="Agentic Closed-Loop Simulator"
            >
              <Zap className="w-4 h-4" />
            </button>

            {/* Compute Benchmark */}
            <button
              onClick={() => onNavigateTab('benchmark')}
              className="w-10 h-10 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-cyan-400 transition-colors flex items-center justify-center cursor-pointer"
              title="AWS Graviton4 + COOL Benchmark"
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* Cloud Telemetry Vault */}
            <button
              onClick={() => onNavigateTab('cloud-console')}
              className="w-10 h-10 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-cyan-400 transition-colors flex items-center justify-center cursor-pointer"
              title="Amazon S3 Defect Vault & Telemetry"
            >
              <Database className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Sidebar Action Icons */}
        <div className="flex flex-col items-center gap-2.5">
          {/* Notification Bell with Badge */}
          <button className="relative w-9 h-9 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-amber-400 transition-colors flex items-center justify-center cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
          </button>

          {/* Help / Docs */}
          <button
            onClick={onOpenPitch}
            className="w-9 h-9 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-cyan-400 transition-colors flex items-center justify-center cursor-pointer"
            title="System Documentation & Pitch"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button className="w-9 h-9 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-cyan-400 transition-colors flex items-center justify-center cursor-pointer">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ==================================================================== */}
      {/* 2. MAIN APPLICATION WORKSPACE                                        */}
      {/* ==================================================================== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-12 bg-[#080D1A] border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0">
          {/* Brand Header */}
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 text-base font-black">▲</span>
            <h1 className="font-display font-black tracking-widest text-sm md:text-base text-white uppercase flex items-center gap-1.5">
              <span>AEGIS-5000</span>
              <span className="text-cyan-400 text-glow-cyan">VISION OS</span>
            </h1>
          </div>

          {/* Right Top Status Controls */}
          <div className="flex items-center gap-3">
            {/* Executive Pitch Button in Navbar */}
            <button
              onClick={onOpenPitch}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-900 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Executive Pitch</span>
            </button>

            {/* Quick Action Buttons matching reference */}
            <div className="flex items-center gap-1.5 text-slate-400">
              <button className="p-1.5 rounded-lg hover:bg-slate-800/80 hover:text-slate-200 transition-colors cursor-pointer">
                <Grid className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-slate-800/80 hover:text-slate-200 transition-colors cursor-pointer">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-slate-800/80 hover:text-slate-200 transition-colors cursor-pointer">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* User Profile Avatar */}
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] font-bold text-cyan-300">
              MP
            </div>
          </div>
        </header>

        {/* Dashboard Grid Container (Dense 16:9 matching reference screenshot) */}
        <main className="flex-1 p-3.5 gap-3.5 grid grid-cols-12 grid-rows-12 overflow-hidden">
          {/* ================================================================ */}
          {/* CARD 1: OPTICAL SCANNER STATION (Cols 1-5, Rows 1-7)             */}
          {/* ================================================================ */}
          <section className="col-span-12 lg:col-span-5 row-span-7 bg-[#0B1120] border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between shadow-lg relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 shrink-0">
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                  OPTICAL SCANNER STATION
                </h2>
                <p className="text-[10px] text-slate-400 font-mono">
                  High-density PCB/Micro-defect scanning
                </p>
              </div>

              {/* Status Pill matching screenshot */}
              <button
                onClick={toggleScannerWebcam}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] font-mono text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)] cursor-pointer hover:bg-emerald-900/60"
                title="Toggle Real USB Webcam vs High-Density PCB Simulator"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{useWebcam ? 'LIVE CAMERA' : 'LIVE USB'}</span>
              </button>
            </div>

            {/* Video / Canvas Viewport */}
            <div className="flex-1 min-h-[190px] rounded-lg overflow-hidden relative bg-[#040914] border border-slate-800/60 flex items-center justify-center shadow-inner">
              {useWebcam ? (
                <video
                  ref={scannerVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <canvas
                  ref={pcbCanvasRef}
                  width={480}
                  height={280}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Corner Brackets */}
              <span className="hud-corner hud-corner-tl" />
              <span className="hud-corner hud-corner-tr" />
              <span className="hud-corner hud-corner-bl" />
              <span className="hud-corner hud-corner-br" />

              {/* Live USB Watermark on bottom right (matching image) */}
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 border border-emerald-500/40 text-[9px] font-mono text-emerald-400 flex items-center gap-1.5 backdrop-blur-xs">
                <span>LIVE USB</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
            </div>

            {/* Sliders Below Feed (matching image) */}
            <div className="mt-2.5 grid grid-cols-3 gap-2.5 shrink-0 text-[10px] font-mono">
              {/* Tilt Slider */}
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>TILT - {tiltVal}/3</span>
                </div>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  value={tiltVal}
                  onChange={(e) => setTiltVal(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Pan Slider */}
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>PAN - {panVal}/4</span>
                </div>
                <input
                  type="range"
                  min="-4"
                  max="4"
                  value={panVal}
                  onChange={(e) => setPanVal(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Manual Gimbal Orientation Slider */}
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>MANUAL GIMBAL ORIENTATION</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={gimbalOrientation}
                  onChange={(e) => setGimbalOrientation(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>
          </section>

          {/* ================================================================ */}
          {/* CARD 2: OPENCV 5 ALGORITHM WORKBENCH (Cols 6-9, Rows 1-7)        */}
          {/* ================================================================ */}
          <section className="col-span-12 lg:col-span-4 row-span-7 bg-[#0B1120] border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between shadow-lg relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 shrink-0">
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                  OPENCV 5 ALGORITHM WORKBENCH
                </h2>
                <p className="text-[10px] text-slate-400 font-mono">
                  Computer Vision Processing Pipeline
                </p>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <button className="p-1 hover:text-cyan-400 cursor-pointer">
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 hover:text-cyan-400 cursor-pointer">
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 hover:text-cyan-400 cursor-pointer">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 6-Stage Connected Node Graph (matching screenshot) */}
            <div className="flex items-center justify-between gap-1 py-1.5 px-1 bg-[#060B14] rounded-lg border border-slate-800/60 shrink-0 overflow-x-auto scrollbar-none">
              {pipelineStages.map((stage, idx) => {
                const Icon = stage.icon;
                const isActive = activeStage === stage.id;
                return (
                  <React.Fragment key={stage.id}>
                    <button
                      onClick={() => {
                        if (soundEnabled) playScanClickSound();
                        setActiveStage(stage.id);
                      }}
                      className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-all min-w-[50px] cursor-pointer ${
                        isActive
                          ? 'bg-cyan-950/70 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,229,255,0.3)] ring-1 ring-cyan-400/40'
                          : 'hover:bg-slate-800/60 text-slate-400 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span className="text-[8px] font-mono font-medium truncate mt-0.5">
                        {stage.label.split(' ')[0]} {stage.label.split(' ')[1]}
                      </span>
                      {isActive && <div className="w-3 h-0.5 bg-cyan-400 rounded-full mt-0.5" />}
                    </button>
                    {idx < pipelineStages.length - 1 && (
                      <div className="w-2.5 h-[1px] bg-slate-700 shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Sliders Grid below Nodes */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 py-1.5 text-[10px] font-mono shrink-0">
              {/* Canny Left */}
              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>CANNY EDGE DETECTION</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={cannyThreshold1}
                  onChange={(e) => setCannyThreshold1(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Canny Right (100) */}
              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>CANNY EDGE DETECTION</span>
                  <span className="text-cyan-400">{cannyThreshold2}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={cannyThreshold2}
                  onChange={(e) => setCannyThreshold2(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Contrast Limits (50) */}
              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>CONTRAST LIMITS</span>
                  <span className="text-cyan-400">{contrastLimit}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={contrastLimit}
                  onChange={(e) => setContrastLimit(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Pixel Intensity (100) */}
              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>PIXEL INTENSITY</span>
                  <span className="text-cyan-400">{pixelIntensity}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="255"
                  value={pixelIntensity}
                  onChange={(e) => setPixelIntensity(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            {/* 256-Bin Pixel Intensity Histogram (Teal/Cyan Bar Chart matching screenshot) */}
            <div className="flex-1 min-h-[90px] rounded-lg overflow-hidden relative bg-[#060B14] border border-slate-800/60 p-1 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 px-1">
                <span>1200</span>
                <span>900</span>
                <span>600</span>
                <span>300</span>
                <span>0</span>
              </div>
              <canvas
                ref={histCanvasRef}
                width={360}
                height={75}
                className="w-full h-16 rounded"
              />
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 px-1">
                <span>0</span>
                <span>500</span>
                <span>1000</span>
                <span>1500</span>
              </div>
            </div>
          </section>

          {/* ================================================================ */}
          {/* CARD 3 & 4: WEBCAM OVERLAY & TELEMETRY (Cols 10-12, Rows 1-7)    */}
          {/* ================================================================ */}
          <div className="col-span-12 lg:col-span-3 row-span-7 flex flex-col gap-2.5">
            {/* Top: Natural Lighting Facecam Box */}
            <div className="h-36 rounded-xl bg-[#090F1C] border border-emerald-500/40 p-1 relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center justify-center">
              {facecamActive ? (
                <video
                  ref={facecamVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full rounded-lg bg-gradient-to-tr from-slate-900 to-slate-800 flex flex-col items-center justify-center text-center p-2">
                  <div className="w-10 h-10 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-300 mb-1">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-300 font-bold">PRESENTER CAM READY</span>
                  <button
                    onClick={toggleFacecam}
                    className="mt-1 px-2 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-[9px] font-mono font-bold text-black cursor-pointer"
                  >
                    START CAM
                  </button>
                </div>
              )}

              {/* Green Cyber Corner Brackets */}
              <span className="hud-corner hud-corner-tl" />
              <span className="hud-corner hud-corner-tr" />
              <span className="hud-corner hud-corner-bl" />
              <span className="hud-corner hud-corner-br" />

              {/* Glowing Green LIVE badge */}
              <div
                onClick={toggleFacecam}
                className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 border border-emerald-400 text-[8px] font-mono text-emerald-400 flex items-center gap-1 cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{facecamActive ? 'LIVE' : 'OFFLINE'}</span>
              </div>
            </div>

            {/* Bottom: Tabbed Telemetry & Benchmark Card */}
            <div className="flex-1 bg-[#0B1120] border border-slate-800/80 rounded-xl p-2.5 flex flex-col justify-between shadow-lg">
              {/* Tab Selector */}
              <div className="flex items-center border-b border-slate-800 pb-1.5 mb-2 gap-2 text-[10px] font-mono font-bold">
                <button
                  onClick={() => setRightTab('agentic')}
                  className={`pb-0.5 cursor-pointer uppercase transition-colors ${
                    rightTab === 'agentic'
                      ? 'text-cyan-400 border-b-2 border-cyan-400 text-glow-cyan'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  AGENTIC CLOSED-LOOP
                </button>
                <button
                  onClick={() => setRightTab('benchmark')}
                  className={`pb-0.5 cursor-pointer uppercase transition-colors ${
                    rightTab === 'benchmark'
                      ? 'text-cyan-400 border-b-2 border-cyan-400 text-glow-cyan'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  COMPUTE BENCHMARK
                </button>
              </div>

              {/* Tab 1: Agentic Closed Loop Content (matching screenshot) */}
              {rightTab === 'agentic' ? (
                <div className="flex flex-col gap-2 flex-1 justify-between">
                  {/* Inspection Yield */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">
                        INSPECTION YIELD
                      </span>
                      <span className="text-xl font-display font-extrabold text-cyan-400 text-glow-cyan">
                        {inspectionYield}%
                      </span>
                    </div>
                    <Info className="w-3.5 h-3.5 text-slate-500" />
                  </div>

                  {/* Pneumatic Pressure */}
                  <div>
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-0.5">
                      <span>PNEUMATIC PRESSURE</span>
                      <span className="text-white font-bold">{pneumaticPressure} bar</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(pneumaticPressure / 8) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Gimbal Tilt Pan */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">
                        GIMBAL TILT PAN
                      </span>
                      <span className="text-sm font-display font-bold text-white">
                        -7.0 / 18.5
                      </span>
                      <span className="text-[8px] font-mono text-slate-500 block">
                        GIMBAL TILT: -7.0 / 18.5
                      </span>
                    </div>
                    <button
                      onClick={handleTriggerAgentic}
                      className="px-2 py-1 rounded bg-cyan-950 border border-cyan-500/40 text-[9px] font-mono text-cyan-300 hover:bg-cyan-900 cursor-pointer shadow-sm"
                    >
                      AUTOPILOT
                    </button>
                  </div>

                  {/* Throughput */}
                  <div className="pt-1 border-t border-slate-800/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-slate-400 uppercase">THROUGHPUT</span>
                      <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-display font-black text-emerald-400">
                        {simFps} FPS
                      </span>
                      <span className="text-[10px] text-slate-500">vs 87 FPS</span>
                    </div>
                    <span className="text-[8px] font-mono text-slate-500 block">
                      AWS GRAVITON4 + COOL
                    </span>
                  </div>
                </div>
              ) : (
                /* Tab 2: Compute Benchmark Content */
                <div className="flex flex-col gap-2 flex-1 justify-between text-[10px] font-mono">
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <div className="flex justify-between text-slate-400">
                      <span>ARM64 NEON Speedup</span>
                      <span className="text-emerald-400 font-bold">2.85x</span>
                    </div>
                    <div className="flex justify-between text-slate-400 mt-1">
                      <span>P99 Frame Latency</span>
                      <span className="text-cyan-400 font-bold">4.03 ms</span>
                    </div>
                    <div className="flex justify-between text-slate-400 mt-1">
                      <span>Cost Reduction</span>
                      <span className="text-amber-400 font-bold">-70.9%</span>
                    </div>
                  </div>

                  <button
                    onClick={handleRunStress}
                    disabled={isStressRunning}
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-black font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 ${isStressRunning ? 'animate-spin' : ''}`} />
                    <span>{isStressRunning ? 'STREAMING...' : 'RUN LIVE STRESS'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ================================================================ */}
          {/* CARD 5: REAL-TIME PRODUCTION INSPECTION LOG (Cols 1-12, Rows 8-12)*/}
          {/* ================================================================ */}
          <section className="col-span-12 row-span-5 bg-[#0B1120] border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between shadow-lg overflow-hidden">
            {/* Header with Title and Executive Pitch Button */}
            <div className="flex items-center justify-between mb-1.5 shrink-0">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
                <span>REAL-TIME PRODUCTION INSPECTION LOG</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </h2>

              <button
                onClick={onOpenPitch}
                className="px-3 py-1 rounded-lg bg-[#0F172A] border border-cyan-500/30 hover:border-cyan-400 text-[11px] font-mono text-cyan-300 flex items-center gap-1.5 cursor-pointer hover:bg-slate-800 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Executive Pitch & Demo</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            {/* Dense Tabular Log matching screenshot */}
            <div className="flex-1 overflow-y-auto scrollbar-none rounded-lg border border-slate-800/60 bg-[#060B14]">
              <table className="w-full text-left text-[10px] font-mono">
                <thead className="bg-[#090F1C] text-slate-400 sticky top-0 border-b border-slate-800 uppercase text-[9px]">
                  <tr>
                    <th className="py-1.5 px-3">INSPECTION</th>
                    <th className="py-1.5 px-3">TELEMETRY</th>
                    <th className="py-1.5 px-3">INSPECTION</th>
                    <th className="py-1.5 px-3">DEFECT SIZE</th>
                    <th className="py-1.5 px-3 text-right">TIMESTAMPS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  {logRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-900/60 transition-colors"
                    >
                      <td className="py-1.5 px-3 text-cyan-400 font-semibold whitespace-nowrap">
                        {row.id}
                      </td>
                      <td className="py-1.5 px-3 text-slate-300 truncate max-w-md">
                        {row.telemetry}
                      </td>
                      <td className="py-1.5 px-3 text-slate-400 whitespace-nowrap">
                        {row.spec}
                      </td>
                      <td className="py-1.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">{row.size}</span>
                          <span className="w-3 h-2 rounded-xs bg-amber-500/80 inline-block" />
                        </div>
                      </td>
                      <td className="py-1.5 px-3 text-right text-slate-500 whitespace-nowrap">
                        {row.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Status Badges matching screenshot */}
            <div className="flex items-center justify-between pt-2 shrink-0">
              <div className="flex items-center gap-2">
                {/* Uplink Secure Pill */}
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/40 text-[9px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="font-bold">Uplink Secure</span>
                  <span className="text-emerald-500/80">• 258-bit S3 metadata identifiers</span>
                </div>

                {/* Vault Active Pill */}
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-950/40 border border-amber-500/40 text-[9px] font-mono text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="font-bold">Vault Active</span>
                  <span className="text-amber-500/80">• 256-bit S3 metadata identifiers</span>
                </div>
              </div>

              {/* Notification icon */}
              <button className="text-slate-500 hover:text-slate-300 cursor-pointer">
                <Bell className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
