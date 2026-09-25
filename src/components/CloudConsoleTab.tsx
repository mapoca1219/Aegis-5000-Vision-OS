import React, { useState, useEffect, useRef } from 'react';
import {
  Server,
  Cloud,
  Database,
  Radio,
  Activity,
  Terminal,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Download,
  Eye,
  SlidersHorizontal,
  Wifi,
  X,
  ExternalLink,
  ZoomIn,
  Camera,
  Layers,
  FileCheck,
} from 'lucide-react';
import { playScanClickSound, playPassSound, playRejectSound } from '../utils/soundEffects';
import { drawSyntheticSample } from '../utils/visionEngine';

interface CloudLog {
  id: string;
  time: string;
  level: 'INFO' | 'WARN' | 'CRITICAL';
  source: string;
  message: string;
  vaultRefId?: string;
}

interface VaultDefect {
  id: string;
  serial: string;
  time: string;
  specimen: string;
  patternType: 'wafer' | 'pcb' | 'solar' | 'turbine';
  defectType: string;
  dimensionMm: number;
  confidence: number;
  s3Key: string;
  defectPos: { x: number; y: number };
}

// Reusable mini canvas thumbnail for S3 vault items
const VaultThumbnail: React.FC<{ item: VaultDefect }> = ({ item }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 180;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw synthetic specimen
    drawSyntheticSample(canvas, item.patternType, 0, 1.0, true, item.defectPos);

    // Draw defect highlight box
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.strokeRect(item.defectPos.x - 14, item.defectPos.y - 14, 28, 28);

    // Crosshair target
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(item.defectPos.x - 1, item.defectPos.y - 6, 2, 12);
    ctx.fillRect(item.defectPos.x - 6, item.defectPos.y - 1, 12, 2);
  }, [item]);

  return (
    <div className="relative w-full h-24 bg-black rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full object-cover" />
      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-rose-950/80 text-rose-300 border border-rose-500/40">
        {item.dimensionMm} mm
      </div>
    </div>
  );
};

export const CloudConsoleTab: React.FC = () => {
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [pingResults, setPingResults] = useState<{ [key: string]: number }>({
    factoryGateway: 0.4,
    iotCore: 1.8,
    gravitonCluster: 3.9,
    s3Vault: 6.1,
  });

  // Video Streaming Parameters
  const [streamBitrate, setStreamBitrate] = useState<number>(45); // Mbps
  const [fpsLimit, setFpsLimit] = useState<number>(60);
  const [compressionQuality, setCompressionQuality] = useState<number>(85);

  // Cloud Service Active Toggles
  const [services, setServices] = useState({
    iotCore: true,
    kinesisIngest: true,
    gravitonWorkers: true,
    s3Archival: true,
  });

  // Selected Vault Item for High-Res Modal Inspection
  const [selectedVaultItem, setSelectedVaultItem] = useState<VaultDefect | null>(null);
  const [modalViewMode, setModalViewMode] = useState<'raw' | 'contour' | 'zoom'>('contour');

  const modalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Defect Vault Gallery (with calibrated defect positions)
  const vaultItems: VaultDefect[] = [
    {
      id: 'v1',
      serial: 'SN-9428',
      time: '14:28:12',
      specimen: 'Silicon Wafer Die',
      patternType: 'wafer',
      defectType: 'Silicon Bus Line Fissure',
      dimensionMm: 0.38,
      confidence: 0.96,
      s3Key: 's3://aegis-inspection-vault/2026/09/wafer_sn9428_raw.png',
      defectPos: { x: 90, y: 60 },
    },
    {
      id: 'v2',
      serial: 'SN-9419',
      time: '14:24:05',
      specimen: 'Solar PV Cell',
      patternType: 'solar',
      defectType: 'Grid Fingerprint Micro-Fracture',
      dimensionMm: 0.52,
      confidence: 0.94,
      s3Key: 's3://aegis-inspection-vault/2026/09/solar_sn9419_raw.png',
      defectPos: { x: 110, y: 55 },
    },
    {
      id: 'v3',
      serial: 'SN-9402',
      time: '14:19:48',
      specimen: 'High-Density PCB',
      patternType: 'pcb',
      defectType: 'SMD Trace Solder Bridging',
      dimensionMm: 0.29,
      confidence: 0.98,
      s3Key: 's3://aegis-inspection-vault/2026/09/pcb_sn9402_raw.png',
      defectPos: { x: 75, y: 65 },
    },
    {
      id: 'v4',
      serial: 'SN-9388',
      time: '14:11:32',
      specimen: 'Turbine Blade',
      patternType: 'turbine',
      defectType: 'Leading-Edge Delamination',
      dimensionMm: 0.41,
      confidence: 0.95,
      s3Key: 's3://aegis-inspection-vault/2026/09/blade_sn9388_raw.png',
      defectPos: { x: 95, y: 50 },
    },
  ];

  // Meaningful Real-time Industrial Events Stream
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'CRITICAL'>('ALL');
  const [isLogLive, setIsLogLive] = useState<boolean>(true);
  const [logs, setLogs] = useState<CloudLog[]>([
    {
      id: '1',
      time: '14:28:14',
      level: 'INFO',
      source: 'Kinesis-Video-01',
      message: 'RTSP video ingest active at 60 FPS (45 Mbps bitrate) zero packet loss.',
    },
    {
      id: '2',
      time: '14:28:13',
      level: 'WARN',
      source: 'Aegis-MCP',
      message: 'Optical ambiguity 0.46 due to specular glare on Wafer SN-9428. Reorienting gimbal to +18.5°.',
      vaultRefId: 'v1',
    },
    {
      id: '3',
      time: '14:28:13',
      level: 'INFO',
      source: 'Graviton-Worker-3',
      message: 'Actuators repositioned: +18.5° pan angle, 45° cross-polarizer. Certainty elevated to 96%.',
    },
    {
      id: '4',
      time: '14:28:12',
      level: 'CRITICAL',
      source: 'PLC-Ejector',
      message: 'CRITICAL DEFECT: Part SN-9428 exhibits 0.38mm crack (max tolerance 0.15mm). Pneumatic reject fired.',
      vaultRefId: 'v1',
    },
    {
      id: '5',
      time: '14:28:11',
      level: 'INFO',
      source: 'S3-Archival',
      message: 'Forensic RAW snapshot committed to s3://aegis-inspection-vault/2026/09/wafer_sn9428_raw.png',
      vaultRefId: 'v1',
    },
    {
      id: '6',
      time: '14:24:05',
      level: 'CRITICAL',
      source: 'OpenCV-Engine',
      message: 'CRITICAL DEFECT: Solar PV Cell SN-9419 with 0.52mm micro-fracture detected.',
      vaultRefId: 'v2',
    },
  ]);

  // Ping Test Action
  const handleRunPingTest = () => {
    playScanClickSound();
    setIsPinging(true);
    setTimeout(() => {
      setPingResults({
        factoryGateway: Number((0.3 + Math.random() * 0.3).toFixed(1)),
        iotCore: Number((1.5 + Math.random() * 0.8).toFixed(1)),
        gravitonCluster: Number((3.6 + Math.random() * 0.7).toFixed(1)),
        s3Vault: Number((5.8 + Math.random() * 1.2).toFixed(1)),
      });
      setIsPinging(false);
      playPassSound();
    }, 700);
  };

  // Auto-stream meaningful realistic plant logs
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLogLive) {
      interval = setInterval(() => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString();

        const scenarioTypes = [
          {
            level: 'INFO' as const,
            source: 'Graviton-Worker-1',
            message: `Active batch: 60 FPS sustained on AWS Graviton4 (P99 latency 3.9ms).`,
          },
          {
            level: 'INFO' as const,
            source: 'AWS-IoT-Core',
            message: `TLS 1.3 secure MQTT telemetry synchronized with plant PLC (frame ack OK).`,
          },
          {
            level: 'WARN' as const,
            source: 'Optical-Gimbal',
            message: `Ambient illumination variance detected. Automatic adaptive CLAHE compensation applied.`,
          },
          {
            level: 'CRITICAL' as const,
            source: 'PLC-Ejector',
            message: `CRITICAL DEFECT: Part SN-9402 exceeds SMD geometry tolerance (0.29mm). Diverted to quarantine.`,
            vaultRefId: 'v3',
          },
          {
            level: 'INFO' as const,
            source: 'S3-Archival',
            message: `S3 Vault: Photographic evidence committed with KMS encryption on Amazon S3.`,
            vaultRefId: 'v4',
          },
        ];

        const chosen = scenarioTypes[Math.floor(Math.random() * scenarioTypes.length)];
        const newLog: CloudLog = {
          id: String(Date.now()),
          time: timeStr,
          level: chosen.level,
          source: chosen.source,
          message: chosen.message,
          vaultRefId: chosen.vaultRefId,
        };

        setLogs((prev) => [newLog, ...prev.slice(0, 24)]);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isLogLive]);

  // Render high-res image inside inspection modal
  useEffect(() => {
    if (!selectedVaultItem) return;
    const canvas = modalCanvasRef.current;
    if (!canvas) return;

    const w = 560;
    const h = 380;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const defX = (selectedVaultItem.defectPos.x / 180) * w;
    const defY = (selectedVaultItem.defectPos.y / 120) * h;

    // Draw specimen
    drawSyntheticSample(canvas, selectedVaultItem.patternType, 0, 1.0, true, { x: defX, y: defY });

    if (modalViewMode === 'contour') {
      // Draw calibrated OpenCV contour bounding box
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(defX - 35, defY - 35, 70, 70);
      ctx.setLineDash([]);

      // Corner brackets
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      const sz = 12;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(defX - 42, defY - 42 + sz);
      ctx.lineTo(defX - 42, defY - 42);
      ctx.lineTo(defX - 42 + sz, defY - 42);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(defX + 42 - sz, defY - 42);
      ctx.lineTo(defX + 42, defY - 42);
      ctx.lineTo(defX + 42, defY - 42 + sz);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(defX - 42, defY + 42 - sz);
      ctx.lineTo(defX - 42, defY + 42);
      ctx.lineTo(defX - 42 + sz, defY + 42);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(defX + 42 - sz, defY + 42);
      ctx.lineTo(defX + 42, defY + 42);
      ctx.lineTo(defX + 42, defY + 42 - sz);
      ctx.stroke();

      // Measurement tag
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(defX - 35, defY - 58, 140, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`FISSURE: ${selectedVaultItem.dimensionMm} mm`, defX - 30, defY - 44);
    } else if (modalViewMode === 'zoom') {
      // Zoom inset lens in corner
      const lensX = w - 160;
      const lensY = 20;
      const lensW = 140;
      const lensH = 140;

      ctx.save();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.strokeRect(lensX, lensY, lensW, lensH);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(lensX, lensY, lensW, lensH);

      // Clip inside lens
      ctx.beginPath();
      ctx.rect(lensX, lensY, lensW, lensH);
      ctx.clip();

      // Draw magnified defect patch (3x zoom)
      ctx.drawImage(
        canvas,
        Math.max(0, defX - 25),
        Math.max(0, defY - 25),
        50,
        50,
        lensX,
        lensY,
        lensW,
        lensH
      );

      // Red reticle in zoom
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.strokeRect(lensX + 40, lensY + 40, 60, 60);

      ctx.restore();

      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('OPTICAL LENS (3.0X)', lensX + 8, lensY + lensH - 8);
    }
  }, [selectedVaultItem, modalViewMode]);

  const handleOpenItem = (item: VaultDefect) => {
    playScanClickSound();
    setSelectedVaultItem(item);
  };

  const handleOpenFromLog = (vaultId?: string) => {
    if (!vaultId) return;
    const found = vaultItems.find((v) => v.id === vaultId) || vaultItems[0];
    playScanClickSound();
    setSelectedVaultItem(found);
  };

  const filteredLogs = logs.filter((l) => logFilter === 'ALL' || l.level === logFilter);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold text-lg">
            ☁️
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white uppercase tracking-wide flex items-center gap-2">
              Cloud Telemetry & Plant Connectivity Console
            </h2>
            <p className="text-xs text-slate-400">
              Real-time latency monitoring, RTSP streaming telemetry, and Amazon S3 defect evidence vault
            </p>
          </div>
        </div>

        <button
          onClick={handleRunPingTest}
          disabled={isPinging}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs uppercase flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
          <span>{isPinging ? 'Measuring Latency...' : 'Run Ping Test'}</span>
        </button>
      </div>

      {/* Latency Network Jitter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'On-Prem Factory Switch', latency: pingResults.factoryGateway, icon: Wifi, target: '< 1 ms' },
          { label: 'AWS IoT Core Ingest', latency: pingResults.iotCore, icon: Radio, target: '< 3 ms' },
          { label: 'Graviton4 COOL Cluster', latency: pingResults.gravitonCluster, icon: Server, target: '< 5 ms' },
          { label: 'Amazon S3 Vault', latency: pingResults.s3Vault, icon: Database, target: '< 10 ms' },
        ].map((node, i) => {
          const Icon = node.icon;
          return (
            <div key={i} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400">{node.label}</span>
                <Icon className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-2xl font-black font-mono text-cyan-400">{node.latency} ms</div>
              <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Target {node.target}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Streaming Configuration & S3 Defect Vault */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Video Streaming Configuration (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-xs uppercase text-white">Video Transmission Link Parameters</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                TLS 1.3 ACTIVE
              </span>
            </div>

            {/* Bitrate Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Bandwidth (RTSP Bitrate)</span>
                <span className="font-mono text-cyan-400 font-bold">{streamBitrate} Mbps</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={streamBitrate}
                onChange={(e) => setStreamBitrate(Number(e.target.value))}
                className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* FPS Limit Buttons */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Framerate Limit</span>
                <span className="font-mono text-emerald-400 font-bold">{fpsLimit} FPS</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
                {[30, 60, 120].map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      playScanClickSound();
                      setFpsLimit(f);
                    }}
                    className={`py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                      fpsLimit === f
                        ? 'bg-blue-600 text-white font-bold border-blue-500'
                        : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                    }`}
                  >
                    {f} FPS
                  </button>
                ))}
              </div>
            </div>

            {/* Compression Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>JPEG / WebP Compression Quality</span>
                <span className="font-mono text-purple-400 font-bold">{compressionQuality}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={compressionQuality}
                onChange={(e) => setCompressionQuality(Number(e.target.value))}
                className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Microservice Health Toggles */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">
                Active Cloud Services
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {[
                  { key: 'iotCore', label: 'AWS IoT Core' },
                  { key: 'kinesisIngest', label: 'Kinesis Video' },
                  { key: 'gravitonWorkers', label: 'Graviton4 Pool' },
                  { key: 's3Archival', label: 'Amazon S3 Vault' },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => {
                      playScanClickSound();
                      setServices((prev) => ({ ...prev, [s.key]: !prev[s.key as keyof typeof prev] }));
                    }}
                    className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      services[s.key as keyof typeof services]
                        ? 'bg-slate-950 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950/40 border-slate-800 text-slate-600'
                    }`}
                  >
                    <span>{s.label}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        services[s.key as keyof typeof services] ? 'bg-emerald-400' : 'bg-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: S3 Defect Vault Gallery WITH VISUAL THUMBNAILS (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-xs uppercase text-white">
                    Amazon S3 Defect Evidence Vault (Forensic Captures)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Click any specimen thumbnail or button to open high-resolution forensic inspection
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-500/30 whitespace-nowrap">
                4 EJECTED PIECES
              </span>
            </div>

            {/* Visual Vault Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {vaultItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenItem(item)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 group ${
                    selectedVaultItem?.id === item.id
                      ? 'bg-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {/* Visual Specimen Thumbnail Canvas */}
                  <VaultThumbnail item={item} />

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold font-mono text-white group-hover:text-cyan-300 transition-colors">
                      {item.serial}
                    </span>
                    <span className="text-rose-400 font-mono font-bold">{item.dimensionMm} mm</span>
                  </div>

                  <div className="text-[11px] text-slate-300">{item.specimen}</div>
                  <div className="text-[10px] text-amber-300 font-mono">{item.defectType}</div>

                  {/* Tactile Button to Open Image */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenItem(item);
                    }}
                    className="w-full py-1.5 px-2 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Forensic Image</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Event Log Terminal WITH DIRECT IMAGE LINKS */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <div>
              <h3 className="font-bold text-xs uppercase text-white">Real-Time Event & Telemetry Terminal</h3>
              <p className="text-[10px] text-slate-400">
                Events with confirmed anomalies include the direct <strong>[📷 View Image]</strong> inspection button
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
              {(['ALL', 'INFO', 'WARN', 'CRITICAL'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLogFilter(lvl)}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    logFilter === lvl ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsLogLive(!isLogLive)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-[10px] font-mono text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              {isLogLive ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
              <span>{isLogLive ? 'PAUSE' : 'RESUME'}</span>
            </button>
          </div>
        </div>

        {/* Log Entries */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs max-h-56 overflow-y-auto space-y-2 scrollbar-thin">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-slate-900/60 transition-colors"
            >
              <div className="flex items-start gap-2 leading-relaxed flex-1">
                <span className="text-slate-500 whitespace-nowrap">[{log.time}]</span>
                <span
                  className={`font-bold px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap ${
                    log.level === 'INFO'
                      ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                      : log.level === 'WARN'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-950 text-rose-300 border border-rose-500/30 animate-pulse'
                  }`}
                >
                  {log.level}
                </span>
                <span className="text-cyan-400 whitespace-nowrap">{log.source}:</span>
                <span className="text-slate-300">{log.message}</span>
              </div>

              {/* Direct Link to View Image if event references a captured part */}
              {log.vaultRefId && (
                <button
                  onClick={() => handleOpenFromLog(log.vaultRefId)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap shadow-sm shadow-cyan-500/10"
                >
                  <Camera className="w-3 h-3" />
                  <span>📷 View Image</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* HIGH-RESOLUTION IMAGE INSPECTION MODAL */}
      {selectedVaultItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-5 space-y-4 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-600/30 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-bold">
                  📸
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <span>Forensic Evidence: {selectedVaultItem.serial}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30">
                      DEFECT: {selectedVaultItem.dimensionMm} mm
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedVaultItem.specimen} • {selectedVaultItem.defectType} • Captured: {selectedVaultItem.time}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedVaultItem(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Display Mode Switcher */}
            <div className="flex items-center justify-between gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-mono">
              <span className="text-slate-400 pl-2">VIEWPORT MODE:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'contour' as const, label: 'Contours & Bounding Box', icon: Layers },
                  { id: 'zoom' as const, label: 'Optical Lens (3x)', icon: ZoomIn },
                  { id: 'raw' as const, label: 'Original RAW Sensor Image', icon: Camera },
                ].map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setModalViewMode(mode.id)}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                        modalViewMode === mode.id
                          ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Canvas Specimen Display */}
            <div className="relative rounded-xl overflow-hidden bg-black border border-slate-800 aspect-[14/9] flex items-center justify-center">
              <canvas ref={modalCanvasRef} className="w-full h-full object-contain" />

              {/* S3 URI watermark tag */}
              <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-800 text-[10px] font-mono text-slate-400">
                {selectedVaultItem.s3Key}
              </div>
            </div>

            {/* Telemetry and Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Defect Size</div>
                <div className="text-rose-400 font-bold text-sm mt-0.5">{selectedVaultItem.dimensionMm} mm</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">OpenCV 5 Certainty</div>
                <div className="text-emerald-400 font-bold text-sm mt-0.5">
                  {(selectedVaultItem.confidence * 100).toFixed(0)}%
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Plant Actuation</div>
                <div className="text-rose-400 font-bold text-sm mt-0.5">PLC Ejection</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Cloud Storage</div>
                <div className="text-cyan-400 font-bold text-sm mt-0.5">S3 + KMS Encrypted</div>
              </div>
            </div>

            {/* Actions: Download Image & Telemetry */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  playPassSound();
                  const canvas = modalCanvasRef.current;
                  if (!canvas) return;
                  const a = document.createElement('a');
                  a.href = canvas.toDataURL('image/png');
                  a.download = `${selectedVaultItem.serial}_defect_capture.png`;
                  a.click();
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Image (.PNG)</span>
              </button>

              <button
                onClick={() => {
                  playPassSound();
                  const blob = new Blob([JSON.stringify(selectedVaultItem, null, 2)], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedVaultItem.serial}_telemetry.json`;
                  a.click();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Telemetry (.JSON)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
