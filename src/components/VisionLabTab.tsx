import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SAMPLES } from '../data/championshipBlueprint';
import { drawSyntheticSample, processImagePipeline, DetectedDefect, ProcessOptions } from '../utils/visionEngine';
import {
  playPassSound,
  playRejectSound,
  playScanClickSound,
  playGimbalMoveSound,
} from '../utils/soundEffects';
import {
  Play,
  Pause,
  Camera,
  RefreshCw,
  Video,
  Volume2,
  VolumeX,
  FileCheck,
  AlertOctagon,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  Layers,
  History,
} from 'lucide-react';

interface ScanHistoryItem {
  id: string;
  serialNumber: string;
  time: string;
  specimen: string;
  metricMm: number;
  confidence: number;
  status: 'PASS' | 'DEFECT' | 'AMBIGUOUS';
}

interface VisionLabTabProps {
  onSendToAgentic?: (defect: DetectedDefect, sampleId: string) => void;
}

export const VisionLabTab: React.FC<VisionLabTabProps> = ({ onSendToAgentic }) => {
  const [selectedSampleId, setSelectedSampleId] = useState<string>('wafer-die');
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [isContinuousMode, setIsContinuousMode] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isEStopped, setIsEStopped] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<ProcessOptions['filterType']>('subpixel_contours');

  // Physical Camera Gimbal & Polarizer States
  const [panAngle, setPanAngle] = useState<number>(0);
  const [zoomFactor, setZoomFactor] = useState<number>(1.0);
  const [polarizedFilter, setPolarizedFilter] = useState<boolean>(false);
  const [customDefectPos, setCustomDefectPos] = useState<{ x: number; y: number } | undefined>(undefined);

  // Advanced Tuning (Collapsible)
  const [showTuning, setShowTuning] = useState<boolean>(false);
  const [blurRadius, setBlurRadius] = useState<number>(3);
  const [edgeThresholdLow, setEdgeThresholdLow] = useState<number>(40);
  const [edgeThresholdHigh, setEdgeThresholdHigh] = useState<number>(120);
  const [claheClip, setClaheClip] = useState<number>(2.5);

  // Production Counters
  const [totalScanned, setTotalScanned] = useState<number>(1428);
  const [totalPassed, setTotalPassed] = useState<number>(1406);
  const [totalDefects, setTotalDefects] = useState<number>(22);
  const [ejectedPiston, setEjectedPiston] = useState<boolean>(false);

  // Scan History
  const [history, setHistory] = useState<ScanHistoryItem[]>([
    { id: '1', serialNumber: 'SN-9428', time: '14:28:12', specimen: 'Silicon Wafer Die', metricMm: 0.38, confidence: 0.96, status: 'DEFECT' },
    { id: '2', serialNumber: 'SN-9427', time: '14:28:09', specimen: 'High-Density PCB', metricMm: 0.02, confidence: 0.99, status: 'PASS' },
    { id: '3', serialNumber: 'SN-9426', time: '14:28:06', specimen: 'Solar Wafer Cell', metricMm: 0.01, confidence: 0.98, status: 'PASS' },
    { id: '4', serialNumber: 'SN-9425', time: '14:28:03', specimen: 'Silicon Wafer Die', metricMm: 0.22, confidence: 0.54, status: 'AMBIGUOUS' },
    { id: '5', serialNumber: 'SN-9424', time: '14:28:00', specimen: 'Turbine Airfoil', metricMm: 0.03, confidence: 0.97, status: 'PASS' },
  ]);

  // Output telemetry
  const [detectedDefects, setDetectedDefects] = useState<DetectedDefect[]>([]);
  const [renderLatencyMs, setRenderLatencyMs] = useState<number>(3.8);

  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const currentSample = SAMPLES.find((s) => s.id === selectedSampleId) || SAMPLES[0];

  // Process Frame Callback
  const processFrame = useCallback(() => {
    if (isEStopped) return;
    const srcCanvas = sourceCanvasRef.current;
    const outCanvas = outputCanvasRef.current;
    if (!srcCanvas || !outCanvas) return;

    const t0 = performance.now();

    if (isWebcamActive && videoRef.current && videoRef.current.readyState >= 2) {
      const ctx = srcCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, srcCanvas.width, srcCanvas.height);
      }
    } else {
      drawSyntheticSample(
        srcCanvas,
        currentSample.patternType,
        panAngle,
        zoomFactor,
        polarizedFilter,
        customDefectPos
      );
    }

    const options: ProcessOptions = {
      filterType: activeFilter,
      blurRadius,
      edgeThresholdLow,
      edgeThresholdHigh,
      claheClip,
      panAngle,
      zoomFactor,
      polarizedFilter,
    };

    const results = processImagePipeline(srcCanvas, outCanvas, options, customDefectPos);
    const t1 = performance.now();
    setRenderLatencyMs(Number((t1 - t0).toFixed(2)));
    setDetectedDefects(results);
  }, [
    isEStopped,
    isWebcamActive,
    currentSample.patternType,
    panAngle,
    zoomFactor,
    polarizedFilter,
    customDefectPos,
    activeFilter,
    blurRadius,
    edgeThresholdLow,
    edgeThresholdHigh,
    claheClip,
  ]);

  // Continuous loop
  useEffect(() => {
    let animId: number;
    const render = () => {
      if (!isEStopped) {
        processFrame();
      }
      if (isWebcamActive) {
        animId = requestAnimationFrame(render);
      }
    };
    render();
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isEStopped, isWebcamActive, processFrame]);

  // Single Manual Trigger Scan
  const handleTriggerScan = () => {
    if (isEStopped) return;
    if (soundEnabled) playScanClickSound();
    setIsScanning(true);
    processFrame();

    setTimeout(() => {
      setIsScanning(false);
      const primary = detectedDefects[0];
      const isDefect = primary && primary.status === 'confirmed_defect';
      const isAmbiguous = primary && primary.status === 'ambiguous';

      if (isDefect) {
        if (soundEnabled) playRejectSound();
        setTotalDefects((d) => d + 1);
      } else if (isAmbiguous) {
        if (soundEnabled) playScanClickSound();
      } else {
        if (soundEnabled) playPassSound();
        setTotalPassed((p) => p + 1);
      }
      setTotalScanned((s) => s + 1);

      // Append to history
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const newItem: ScanHistoryItem = {
        id: String(Date.now()),
        serialNumber: `SN-${Math.floor(9400 + Math.random() * 99)}`,
        time: timeStr,
        specimen: currentSample.title.split('(')[0].trim(),
        metricMm: primary ? primary.microMetricMm : 0.02,
        confidence: primary ? primary.confidence : 0.98,
        status: isDefect ? 'DEFECT' : isAmbiguous ? 'AMBIGUOUS' : 'PASS',
      };
      setHistory((prev) => [newItem, ...prev.slice(0, 9)]);
    }, 250);
  };

  // Continuous Conveyor Belt Auto-Cycle
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isContinuousMode && !isEStopped) {
      interval = setInterval(() => {
        handleTriggerScan();
      }, 2600);
    }
    return () => clearInterval(interval);
  }, [isContinuousMode, isEStopped, detectedDefects, totalScanned]);

  // Pneumatic PLC Ejector Trigger
  const handlePistonEject = () => {
    if (soundEnabled) playRejectSound();
    setEjectedPiston(true);
    setTimeout(() => setEjectedPiston(false), 1200);
  };

  // Agentic Camera Re-Orientation Action
  const handleAutoReorientGimbal = () => {
    if (soundEnabled) playGimbalMoveSound();
    setPanAngle(18.5);
    setPolarizedFilter(true);
    setZoomFactor(1.8);
    setTimeout(() => {
      if (soundEnabled) playPassSound();
    }, 400);
  };

  // Reset Camera to 0°
  const handleResetCamera = () => {
    if (soundEnabled) playGimbalMoveSound();
    setPanAngle(0);
    setZoomFactor(1.0);
    setPolarizedFilter(false);
    setCustomDefectPos(undefined);
  };

  // Webcam Toggle
  const toggleWebcam = async () => {
    if (isWebcamActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsWebcamActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 360 },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsWebcamActive(true);
      } catch (err) {
        console.warn('Webcam unavailable', err);
      }
    }
  };

  // Canvas Click: place defect
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isWebcamActive || isEStopped) return;
    const canvas = sourceCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;
    setCustomDefectPos({ x: Math.round(clickX), y: Math.round(clickY) });
    if (soundEnabled) playScanClickSound();
  };

  // Download Inspection Report CSV
  const handleDownloadReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Serial,Timestamp,Specimen,DefectSizeMm,Confidence,Status\n' +
      history
        .map((h) => `${h.serialNumber},${h.time},${h.specimen},${h.metricMm}mm,${(h.confidence * 100).toFixed(0)}%,${h.status}`)
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Aegis5_Inspection_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const primaryDefect = detectedDefects[0];
  const isDefect = primaryDefect && primaryDefect.status === 'confirmed_defect';
  const isAmbiguous = primaryDefect && primaryDefect.status === 'ambiguous';
  const passRate = totalScanned > 0 ? ((totalPassed / totalScanned) * 100).toFixed(1) : '100.0';

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* DEVICE HEADER: Model & Real-time Status Indicators */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold text-lg">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base md:text-lg text-white tracking-wide uppercase">
                Aegis-5000 Pro Inspection Station
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                {isEStopped ? 'EMERGENCY (STOPPED)' : 'READY FOR SCAN'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-Time Optical Quality Assurance Terminal • OpenCV 5 & AWS Graviton
            </p>
          </div>
        </div>

        {/* Hardware Status LEDs */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            <span className={`w-2.5 h-2.5 rounded-full ${isEStopped ? 'bg-rose-500' : 'bg-emerald-400 animate-ping'}`} />
            <span>GIGE CAMERA: <strong>{isWebcamActive ? 'WEBCAM 60FPS' : 'ONLINE'}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>LATENCY: <strong>{renderLatencyMs} ms</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-purple-300">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span>GIMBAL: <strong>{panAngle > 0 ? `+${panAngle}°` : `${panAngle}°`}</strong></span>
          </div>
        </div>
      </div>

      {/* OPERATOR METRICS BAR: Big production counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-slate-400 font-medium">TOTAL SCANNED</div>
            <div className="text-2xl font-extrabold font-mono text-white mt-1">{totalScanned}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Active assembly line</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
            #
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-emerald-400 font-medium">PASS RATE</div>
            <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">{passRate}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{totalPassed} conforming parts</div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-400/40" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-rose-400 font-medium">DEFECTS EJECTED</div>
            <div className="text-2xl font-extrabold font-mono text-rose-400 mt-1">{totalDefects}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Routed to containment bin B</div>
          </div>
          <XCircle className="w-8 h-8 text-rose-400/40" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-amber-400 font-medium">FALSE REJECTS SAVED</div>
            <div className="text-2xl font-extrabold font-mono text-amber-400 mt-1">19</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Recovered with polarizer</div>
          </div>
          <Sparkles className="w-8 h-8 text-amber-400/40" />
        </div>
      </div>

      {/* TACTILE PHYSICAL ACTION BUTTONS */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Big Trigger Scan Button */}
          <button
            onClick={handleTriggerScan}
            disabled={isEStopped}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 flex items-center gap-2.5 transition-all transform active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            <Zap className={`w-5 h-5 ${isScanning ? 'animate-bounce text-amber-300' : 'text-white'}`} />
            <span>TRIGGER SCAN</span>
          </button>

          {/* Continuous Conveyor Belt Button */}
          <button
            onClick={() => {
              if (soundEnabled) playScanClickSound();
              setIsContinuousMode(!isContinuousMode);
            }}
            disabled={isEStopped}
            className={`px-5 py-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40 cursor-pointer ${
              isContinuousMode
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/30 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {isContinuousMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
            <span>{isContinuousMode ? 'STOP CONVEYOR' : 'CONTINUOUS CONVEYOR'}</span>
          </button>

          {/* Emergency Stop Button */}
          <button
            onClick={() => {
              if (soundEnabled) playRejectSound();
              setIsEStopped(!isEStopped);
              if (isContinuousMode) setIsContinuousMode(false);
            }}
            className={`px-4 py-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
              isEStopped
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-rose-700 hover:bg-rose-600 text-white shadow-lg shadow-rose-600/30'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>{isEStopped ? 'RESUME SYSTEM' : 'EMERGENCY STOP (E-STOP)'}</span>
          </button>
        </div>

        {/* Utilities: Sound & Report Download */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-slate-800 text-cyan-300 border-slate-700'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title={soundEnabled ? 'Mute buzzer' : 'Enable sound effects'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Sound ON' : 'Mute'}</span>
          </button>

          <button
            onClick={toggleWebcam}
            className={`px-3.5 py-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              isWebcamActive
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">{isWebcamActive ? 'Close Webcam' : 'Use Live Webcam'}</span>
          </button>

          <button
            onClick={handleDownloadReport}
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* MASSIVE STATUS BANNER */}
      <div
        className={`p-4 rounded-2xl border transition-all duration-300 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isEStopped
            ? 'bg-rose-950/90 border-rose-600 text-rose-200'
            : isDefect
            ? 'bg-gradient-to-r from-rose-950/90 via-slate-900 to-rose-950/90 border-rose-500 shadow-rose-500/20'
            : isAmbiguous
            ? 'bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-amber-500 shadow-amber-500/20'
            : 'bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-950/90 border-emerald-500 shadow-emerald-500/20'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shrink-0 ${
              isEStopped
                ? 'bg-rose-600 text-white animate-pulse'
                : isDefect
                ? 'bg-rose-600 text-white animate-pulse'
                : isAmbiguous
                ? 'bg-amber-600 text-white animate-bounce'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isEStopped ? '🛑' : isDefect ? '❌' : isAmbiguous ? '⚠️' : '✅'}
          </div>

          <div>
            <div className="text-base md:text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
              {isEStopped
                ? 'SYSTEM HALTED: EMERGENCY STOP ACTIVE'
                : isDefect
                ? `PART REJECTED - DEFECT CONFIRMED (${primaryDefect?.microMetricMm} mm)`
                : isAmbiguous
                ? 'OPTICAL GLARE DETECTED (54% CERTAINTY - AMBIGUOUS)'
                : 'PART APPROVED - QUALITY PASS (< 0.05 mm)'}
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              {isEStopped
                ? 'Press "RESUME SYSTEM" to restart the optical inspection pipeline.'
                : isDefect
                ? `Fissure detected with ${((primaryDefect?.confidence || 0.95) * 100).toFixed(0)}% sub-pixel accuracy. Action: Pneumatic rejection to containment bin.`
                : isAmbiguous
                ? 'Specular glare blinding sensor. Click "AUTO-REORIENT GIMBAL" to trigger closed-loop robotic compensation.'
                : 'Geometry and bus trace density within permitted manufacturing tolerances.'}
            </div>
          </div>
        </div>

        {/* Action Button inside Status Banner */}
        <div className="shrink-0 flex items-center gap-2">
          {isDefect && (
            <button
              onClick={handlePistonEject}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                ejectedPiston
                  ? 'bg-rose-500 text-white animate-ping'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40'
              }`}
            >
              <span>{ejectedPiston ? 'PISTON FIRED 💥' : 'EJECT PART (PLC)'}</span>
            </button>
          )}

          {isAmbiguous && (
            <button
              onClick={handleAutoReorientGimbal}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase flex items-center gap-2 shadow-lg shadow-amber-500/40 animate-pulse cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>AUTO-REORIENT GIMBAL (+18.5°)</span>
            </button>
          )}

          {isDefect && onSendToAgentic && (
            <button
              onClick={() => onSendToAgentic(primaryDefect, selectedSampleId)}
              className="px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Inspect Agentic Loop</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* DUAL DISPLAY: Live Sensor View vs OpenCV 5 Sub-Pixel Segmentation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT SCREEN: Raw Sensor Acquisition */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              RAW SENSOR FEED (Click canvas to position defect)
            </span>
            <span className="font-mono text-slate-400">
              {isWebcamActive ? 'Live USB Webcam' : 'GigE 1080p Sensor'}
            </span>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl flex items-center justify-center aspect-[4/3]">
            <canvas
              ref={sourceCanvasRef}
              width={480}
              height={360}
              onClick={handleCanvasClick}
              className="w-full h-full object-contain cursor-crosshair"
            />
            <video ref={videoRef} className="hidden" playsInline muted />

            {/* Target Crosshair in Center */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-12 h-12 border border-cyan-500/40 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
              </div>
            </div>

            {/* Live Glare status overlay */}
            <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
              <div className="px-2.5 py-1 rounded-md text-[10px] font-mono bg-slate-900/90 border border-slate-700 text-slate-200">
                ANGLE: {panAngle}° | ZOOM: {zoomFactor.toFixed(1)}x
              </div>
              {!polarizedFilter && !isWebcamActive && (
                <div className="px-2.5 py-1 rounded-md text-[10px] font-mono bg-amber-950/90 border border-amber-600/50 text-amber-300 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>GLINT DETECTED</span>
                </div>
              )}
              {polarizedFilter && (
                <div className="px-2.5 py-1 rounded-md text-[10px] font-mono bg-emerald-950/90 border border-emerald-600/50 text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>45° POLARIZER ACTIVE</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SCREEN: OpenCV 5 Analysis HUD */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              OPENCV 5 SUB-PIXEL ANALYSIS ({activeFilter.toUpperCase()})
            </span>
            <span className="font-mono text-emerald-400">AWS Graviton4 COOL</span>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl flex items-center justify-center aspect-[4/3]">
            <canvas
              ref={outputCanvasRef}
              width={480}
              height={360}
              className="w-full h-full object-contain"
            />

            {/* Scanning Laser Beam Effect when scan triggered */}
            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400 animate-pulse pointer-events-none top-1/2" />
            )}

            {/* Bounding Box HUD Info */}
            <div className="absolute bottom-3 right-3 flex flex-col gap-1 pointer-events-none">
              {detectedDefects.map((d) => (
                <div
                  key={d.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border backdrop-blur-md shadow-lg ${
                    d.status === 'confirmed_defect'
                      ? 'bg-rose-950/90 text-rose-200 border-rose-500'
                      : 'bg-amber-950/90 text-amber-200 border-amber-500'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1">
                    <span>{d.id}: {d.microMetricMm} mm</span>
                  </div>
                  <div className="text-[10px] opacity-80">
                    Confidence: {(d.confidence * 100).toFixed(0)}% • Area: {d.areaPx}px²
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TACTILE JOYSTICK & ROBOTIC SENSOR ACTUATORS */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">
              Optical Sensor Gimbal & Actuator Controls
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Adjust orientation to eliminate glint reflections or increase macro magnification
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          {/* 1. Tactile D-Pad Joystick */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 mb-2">PAN / TILT JOYSTICK</span>
            <div className="grid grid-cols-3 gap-1.5 w-32">
              <div />
              <button
                onClick={() => {
                  if (soundEnabled) playGimbalMoveSound();
                  setZoomFactor((z) => Math.min(2.5, z + 0.2));
                }}
                className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer"
                title="Zoom In"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <div />

              <button
                onClick={() => {
                  if (soundEnabled) playGimbalMoveSound();
                  setPanAngle((a) => Math.max(-30, a - 5));
                }}
                className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer"
                title="Pan Left"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetCamera}
                className="p-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center cursor-pointer"
                title="Center"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  if (soundEnabled) playGimbalMoveSound();
                  setPanAngle((a) => Math.min(30, a + 5));
                }}
                className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer"
                title="Pan Right"
              >
                <ArrowRight className="w-4 h-4" />
              </button>

              <div />
              <button
                onClick={() => {
                  if (soundEnabled) playGimbalMoveSound();
                  setZoomFactor((z) => Math.max(1.0, z - 0.2));
                }}
                className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer"
                title="Zoom Out"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <div />
            </div>
          </div>

          {/* 2. Quick Presets */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400">PRESET POSITIONS:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleResetCamera}
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 text-left transition-all cursor-pointer"
              >
                <div className="text-cyan-400">0.0° Angle</div>
                <div className="text-[10px] text-slate-500">Standard Top-Down</div>
              </button>

              <button
                onClick={handleAutoReorientGimbal}
                className="p-2.5 rounded-lg bg-purple-950/60 border border-purple-500/40 hover:border-purple-400 text-xs font-semibold text-purple-200 text-left transition-all cursor-pointer"
              >
                <div className="text-purple-300">Anti-Glare +18.5°</div>
                <div className="text-[10px] text-slate-400">Eliminates optical flare</div>
              </button>

              <button
                onClick={() => {
                  if (soundEnabled) playGimbalMoveSound();
                  setZoomFactor(2.2);
                }}
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 text-left transition-all cursor-pointer"
              >
                <div className="text-emerald-400">Macro Zoom 2.2x</div>
                <div className="text-[10px] text-slate-500">Sub-Millimeter Resolution</div>
              </button>

              <button
                onClick={() => {
                  if (soundEnabled) playScanClickSound();
                  setPolarizedFilter(!polarizedFilter);
                }}
                className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition-all cursor-pointer ${
                  polarizedFilter
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className={polarizedFilter ? 'text-emerald-400' : 'text-slate-400'}>
                  Polarizer Filter
                </div>
                <div className="text-[10px] text-slate-500">
                  {polarizedFilter ? '45° Cross (ON)' : 'Inactive (OFF)'}
                </div>
              </button>
            </div>
          </div>

          {/* 3. Specimen Selector with touch cards */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400">INSPECTION SPECIMEN:</span>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => {
                    setSelectedSampleId(sample.id);
                    setCustomDefectPos(undefined);
                    if (isWebcamActive) toggleWebcam();
                    if (soundEnabled) playScanClickSound();
                  }}
                  className={`p-2.5 rounded-lg text-left border transition-all cursor-pointer ${
                    selectedSampleId === sample.id && !isWebcamActive
                      ? 'bg-blue-600/30 border-blue-400 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs truncate">{sample.title.split('(')[0]}</div>
                  <div className="text-[10px] text-slate-400 truncate">{sample.category}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Vision Filter Stages Bar */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400">OPENCV 5 PIPELINE STAGES:</span>
            <button
              onClick={() => setShowTuning(!showTuning)}
              className="text-[11px] font-mono text-cyan-400 hover:underline cursor-pointer"
            >
              {showTuning ? 'Hide Advanced Tuning' : 'Canny / CLAHE Filter Sliders'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5">
            {[
              { id: 'subpixel_contours', label: '1. Sub-Pixel', desc: 'HUD + Metric' },
              { id: 'heatmap', label: '2. Heatmap', desc: 'Anomalies' },
              { id: 'canny', label: '3. Edges', desc: 'Canny 40-120' },
              { id: 'sobel', label: '4. Gradient', desc: 'Sobel Mag' },
              { id: 'clahe', label: '5. CLAHE', desc: 'Contrast' },
              { id: 'gaussian', label: '6. Filter 5x5', desc: 'Denoise' },
              { id: 'grayscale', label: '7. Gray', desc: 'cvtColor' },
              { id: 'original', label: '8. Raw BGR', desc: 'Pure Sensor' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as ProcessOptions['filterType'])}
                className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                  activeFilter === f.id
                    ? 'bg-blue-600 text-white border-blue-400 font-bold shadow-md shadow-blue-500/20'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="text-xs truncate">{f.label}</div>
                <div className="text-[10px] text-slate-400 truncate">{f.desc}</div>
              </button>
            ))}
          </div>

          {/* Collapsible Fine Tuning */}
          {showTuning && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 mt-3 border-t border-slate-800 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Canny Low Threshold</span>
                  <span className="font-mono text-white">{edgeThresholdLow}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={edgeThresholdLow}
                  onChange={(e) => setEdgeThresholdLow(Number(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Canny High Threshold</span>
                  <span className="font-mono text-white">{edgeThresholdHigh}</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="220"
                  value={edgeThresholdHigh}
                  onChange={(e) => setEdgeThresholdHigh(Number(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>CLAHE Contrast Clip</span>
                  <span className="font-mono text-white">{claheClip.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.5"
                  value={claheClip}
                  onChange={(e) => setClaheClip(Number(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* REAL-TIME PRODUCTION HISTORY LOG TABLE */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Real-Time Production Inspection Log</h3>
          </div>
          <button
            onClick={handleDownloadReport}
            className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Export History (.CSV)</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2">SERIAL</th>
                <th className="pb-2">TIME</th>
                <th className="pb-2">SPECIMEN</th>
                <th className="pb-2">DEFECT SIZE</th>
                <th className="pb-2">CONFIDENCE</th>
                <th className="pb-2 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-slate-950/60 transition-colors">
                  <td className="py-2.5 font-bold text-slate-200">{item.serialNumber}</td>
                  <td className="py-2.5 text-slate-400">{item.time}</td>
                  <td className="py-2.5 text-slate-300">{item.specimen}</td>
                  <td className="py-2.5">
                    <span className={item.metricMm > 0.05 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {item.metricMm} mm
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-300">{(item.confidence * 100).toFixed(0)}%</td>
                  <td className="py-2.5 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'PASS'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : item.status === 'DEFECT'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
