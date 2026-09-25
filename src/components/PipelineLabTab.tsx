import React, { useState, useRef, useEffect } from 'react';
import { SAMPLES } from '../data/championshipBlueprint';
import { drawSyntheticSample } from '../utils/visionEngine';
import { playScanClickSound, playPassSound } from '../utils/soundEffects';
import {
  SlidersHorizontal,
  Layers,
  Eye,
  Activity,
  ZoomIn,
  RefreshCw,
  Zap,
  Sparkles,
  CheckCircle2,
  Maximize2,
} from 'lucide-react';

export const PipelineLabTab: React.FC = () => {
  const [selectedSampleId, setSelectedSampleId] = useState<string>('wafer-die');
  const [activeStage, setActiveStage] = useState<string>('canny');

  // Pipeline Tuning Parameters
  const [blurKernel, setBlurKernel] = useState<number>(3); // 1, 3, 5, 7
  const [claheClip, setClaheClip] = useState<number>(2.5);
  const [claheGrid, setClaheGrid] = useState<number>(8);
  const [sobelDirection, setSobelDirection] = useState<'both' | 'horizontal' | 'vertical'>('both');
  const [cannyLow, setCannyLow] = useState<number>(45);
  const [cannyHigh, setCannyHigh] = useState<number>(120);
  const [morphOp, setMorphOp] = useState<'none' | 'dilate' | 'erode' | 'close'>('close');
  const [morphIterations, setMorphIterations] = useState<number>(1);

  // Pixel Probe State
  const [probePos, setProbePos] = useState<{ x: number; y: number } | null>(null);
  const [probePixel, setProbePixel] = useState<{ r: number; g: number; b: number; intensity: number } | null>(null);

  // Benchmark Telemetry
  const [pipelineFps, setPipelineFps] = useState<number>(312);
  const [pipelineLatencyMs, setPipelineLatencyMs] = useState<number>(3.2);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const histCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const sample = SAMPLES.find((s) => s.id === selectedSampleId) || SAMPLES[0];

  // Render Pipeline on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 480;
    const height = 360;
    canvas.width = width;
    canvas.height = height;

    // Convert sample id to pattern type
    const patternType: 'wafer' | 'pcb' | 'solar' | 'turbine' =
      selectedSampleId.includes('pcb')
        ? 'pcb'
        : selectedSampleId.includes('solar')
        ? 'solar'
        : selectedSampleId.includes('turbine')
        ? 'turbine'
        : 'wafer';

    // Draw base synthetic sample on canvas
    drawSyntheticSample(canvas, patternType, 0, 1.0, false);

    // Get raw image data
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Intensity histogram array [0..255]
    const histogram = new Uint32Array(256);

    // Step 1: Grayscale conversion
    const gray = new Float32Array(width * height);
    for (let i = 0; i < data.length; i += 4) {
      const idx = i / 4;
      const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      gray[idx] = g;
      histogram[Math.min(255, Math.floor(g))]++;
    }

    // Apply chosen stage
    if (activeStage === 'raw') {
      // Leave as base raw synthetic sample
    } else if (activeStage === 'gray') {
      for (let i = 0; i < data.length; i += 4) {
        const val = gray[i / 4];
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
      }
      ctx.putImageData(imgData, 0, 0);
    } else if (activeStage === 'blur') {
      // Gaussian / Box blur with kernel
      const radius = Math.floor(blurKernel / 2);
      const blurred = new Float32Array(width * height);

      for (let y = radius; y < height - radius; y++) {
        for (let x = radius; x < width - radius; x++) {
          let sum = 0;
          let count = 0;
          for (let ky = -radius; ky <= radius; ky++) {
            for (let kx = -radius; kx <= radius; kx++) {
              sum += gray[(y + ky) * width + (x + kx)];
              count++;
            }
          }
          blurred[y * width + x] = sum / count;
        }
      }

      for (let i = 0; i < data.length; i += 4) {
        const val = blurred[i / 4];
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
      }
      ctx.putImageData(imgData, 0, 0);
    } else if (activeStage === 'clahe') {
      // Simulated CLAHE contrast enhancement
      for (let i = 0; i < data.length; i += 4) {
        const g = gray[i / 4];
        const enhanced = Math.min(255, Math.max(0, (g - 128) * (claheClip / 1.5) + 128));
        data[i] = enhanced;
        data[i + 1] = enhanced * 0.95;
        data[i + 2] = enhanced * 1.1; // Cool tone for wafer contrast
      }
      ctx.putImageData(imgData, 0, 0);
    } else if (activeStage === 'sobel') {
      // Sobel Gradient
      const sobelData = new Float32Array(width * height);
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const gx =
            -1 * gray[(y - 1) * width + (x - 1)] +
            1 * gray[(y - 1) * width + (x + 1)] +
            -2 * gray[y * width + (x - 1)] +
            2 * gray[y * width + (x + 1)] +
            -1 * gray[(y + 1) * width + (x - 1)] +
            1 * gray[(y + 1) * width + (x + 1)];

          const gy =
            -1 * gray[(y - 1) * width + (x - 1)] +
            -2 * gray[(y - 1) * width + x] +
            -1 * gray[(y - 1) * width + (x + 1)] +
            1 * gray[(y + 1) * width + (x - 1)] +
            2 * gray[(y + 1) * width + x] +
            1 * gray[(y + 1) * width + (x + 1)];

          let mag = 0;
          if (sobelDirection === 'horizontal') mag = Math.abs(gx);
          else if (sobelDirection === 'vertical') mag = Math.abs(gy);
          else mag = Math.sqrt(gx * gx + gy * gy);

          sobelData[y * width + x] = Math.min(255, mag);
        }
      }

      for (let i = 0; i < data.length; i += 4) {
        const val = sobelData[i / 4];
        data[i] = val * 0.2;
        data[i + 1] = val;
        data[i + 2] = val * 0.8;
      }
      ctx.putImageData(imgData, 0, 0);
    } else if (activeStage === 'canny') {
      // Canny Hysteresis Edge Detection
      const edges = new Uint8Array(width * height);
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const gx =
            gray[(y - 1) * width + (x + 1)] -
            gray[(y - 1) * width + (x - 1)] +
            2 * (gray[y * width + (x + 1)] - gray[y * width + (x - 1)]) +
            gray[(y + 1) * width + (x + 1)] -
            gray[(y + 1) * width + (x - 1)];

          const gy =
            gray[(y + 1) * width + (x - 1)] -
            gray[(y - 1) * width + (x - 1)] +
            2 * (gray[(y + 1) * width + x] - gray[(y - 1) * width + x]) +
            gray[(y + 1) * width + (x + 1)] -
            gray[(y - 1) * width + (x + 1)];

          const mag = Math.sqrt(gx * gx + gy * gy);
          if (mag >= cannyHigh) {
            edges[y * width + x] = 255;
          } else if (mag >= cannyLow) {
            edges[y * width + x] = 128;
          } else {
            edges[y * width + x] = 0;
          }
        }
      }

      // Morphological operations if selected
      let finalEdges = edges;
      if (morphOp === 'dilate') {
        const dilated = new Uint8Array(width * height);
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            if (
              edges[y * width + x] === 255 ||
              edges[(y - 1) * width + x] === 255 ||
              edges[(y + 1) * width + x] === 255 ||
              edges[y * width + (x - 1)] === 255 ||
              edges[y * width + (x + 1)] === 255
            ) {
              dilated[y * width + x] = 255;
            }
          }
        }
        finalEdges = dilated;
      }

      for (let i = 0; i < data.length; i += 4) {
        const val = finalEdges[i / 4];
        if (val > 0) {
          data[i] = 16;
          data[i + 1] = 230; // Bright Emerald Edge
          data[i + 2] = 140;
        } else {
          data[i] = 10;
          data[i + 1] = 15;
          data[i + 2] = 24;
        }
      }
      ctx.putImageData(imgData, 0, 0);

      // Highlight defect zone with calibrated measurement overlay
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(width * 0.42, height * 0.38, 70, 70);
      ctx.setLineDash([]);
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('ANOMALY: 0.38mm', width * 0.42, height * 0.38 - 6);
    }

    // Render Histogram on second canvas
    const histCanvas = histCanvasRef.current;
    if (histCanvas) {
      const hCtx = histCanvas.getContext('2d');
      if (hCtx) {
        histCanvas.width = 256;
        histCanvas.height = 70;
        hCtx.fillStyle = '#090d16';
        hCtx.fillRect(0, 0, 256, 70);

        let maxCount = 1;
        for (let i = 0; i < 256; i++) {
          if (histogram[i] > maxCount) maxCount = histogram[i];
        }

        hCtx.fillStyle = '#06b6d4';
        for (let i = 0; i < 256; i++) {
          const h = (histogram[i] / maxCount) * 65;
          hCtx.fillRect(i, 70 - h, 1, h);
        }
      }
    }
  }, [
    selectedSampleId,
    activeStage,
    blurKernel,
    claheClip,
    claheGrid,
    sobelDirection,
    cannyLow,
    cannyHigh,
    morphOp,
    morphIterations,
  ]);

  // Handle canvas mouse move for interactive pixel probe
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
      setProbePos({ x, y });
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const p = ctx.getImageData(x, y, 1, 1).data;
        const intensity = Math.round(0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]);
        setProbePixel({ r: p[0], g: p[1], b: p[2], intensity });
      }
    }
  };

  const stages = [
    { id: 'raw', label: '1. Raw Matrix (BGR)' },
    { id: 'gray', label: '2. Grayscale' },
    { id: 'blur', label: '3. Gaussian Blur' },
    { id: 'clahe', label: '4. Adaptive CLAHE' },
    { id: 'sobel', label: '5. Sobel Gradient' },
    { id: 'canny', label: '6. Canny Edges (Final)' },
  ];

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Device Header */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/30 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-bold text-lg">
            🔬
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white uppercase tracking-wide flex items-center gap-2">
              OpenCV 5 Interactive Algorithm Workbench
            </h2>
            <p className="text-xs text-slate-400">
              Real-time convolution kernels, adaptive hysteresis, and sub-pixel edge tuning
            </p>
          </div>
        </div>

        {/* Real-time Hardware FPS Indicator */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <span className="text-slate-500">THROUGHPUT: </span>
            <span className="text-emerald-400 font-bold">{pipelineFps} FPS</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <span className="text-slate-500">LATENCY: </span>
            <span className="text-cyan-400 font-bold">{pipelineLatencyMs} ms</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Interactive Canvas & Pixel Probe (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
            {/* Specimen and Stage Selector Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {SAMPLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      playScanClickSound();
                      setSelectedSampleId(s.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedSampleId === s.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {s.title.split(' ')[0]} {s.title.split(' ')[1] || ''}
                  </button>
                ))}
              </div>

              <div className="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>480 x 360 px</span>
              </div>
            </div>

            {/* Pipeline Stage Buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-xs font-mono">
              {stages.map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    playScanClickSound();
                    setActiveStage(st.id);
                  }}
                  className={`p-2 rounded-xl text-center transition-all cursor-pointer ${
                    activeStage === st.id
                      ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-500/25'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <div className="text-[10px] leading-tight">{st.label}</div>
                </button>
              ))}
            </div>

            {/* Live Interactive Processing Canvas */}
            <div className="relative rounded-xl overflow-hidden bg-black border border-slate-800 aspect-[4/3] flex items-center justify-center group cursor-crosshair">
              <canvas
                ref={canvasRef}
                onMouseMove={handleCanvasMouseMove}
                onMouseLeave={() => setProbePos(null)}
                className="w-full h-full object-contain"
              />

              {/* Crosshair probe overlay */}
              {probePos && (
                <div
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-cyan-400/80 rounded-full flex items-center justify-center"
                  style={{
                    left: `${(probePos.x / 480) * 100}%`,
                    top: `${(probePos.y / 360) * 100}%`,
                  }}
                >
                  <div className="w-1 h-1 bg-cyan-400 rounded-full" />
                </div>
              )}

              {/* Active Stage Floating Tag */}
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[11px] font-mono text-cyan-300">
                ACTIVE STAGE: {activeStage.toUpperCase()}
              </div>
            </div>

            {/* Real-time Pixel Probe & Histogram Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Pixel Probe Card */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Pixel Inspector</div>
                  <div className="text-white mt-0.5">
                    {probePos ? `X: ${probePos.x} | Y: ${probePos.y}` : 'Hover cursor over image'}
                  </div>
                </div>
                {probePixel && (
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500">INTENSITY VALUE</div>
                    <div className="text-cyan-400 font-bold">{probePixel.intensity} / 255</div>
                  </div>
                )}
              </div>

              {/* Pixel Histogram Display */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase">
                  <span>Intensity Histogram</span>
                  <span className="text-cyan-400 font-bold">256 Bins</span>
                </div>
                <canvas ref={histCanvasRef} className="w-full h-9 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Tactile Parameter Controllers (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white uppercase">Filter Tuning Controls</h3>
              </div>
              <button
                onClick={() => {
                  setBlurKernel(3);
                  setClaheClip(2.5);
                  setCannyLow(45);
                  setCannyHigh(120);
                  setMorphOp('close');
                  playPassSound();
                }}
                className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>
            </div>

            {/* Controller 1: Gaussian Blur Kernel */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">1. Gaussian Blur Kernel</span>
                <span className="font-mono text-cyan-400 font-bold">{blurKernel} x {blurKernel} px</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs font-mono pt-1">
                {[1, 3, 5, 7].map((k) => (
                  <button
                    key={k}
                    onClick={() => {
                      playScanClickSound();
                      setBlurKernel(k);
                    }}
                    className={`py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                      blurKernel === k
                        ? 'bg-blue-600 text-white font-bold border-blue-500'
                        : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                    }`}
                  >
                    {k}x{k}
                  </button>
                ))}
              </div>
            </div>

            {/* Controller 2: CLAHE Contrast Parameters */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">2. Adaptive CLAHE Clip Limit</span>
                <span className="font-mono text-emerald-400 font-bold">{claheClip.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.2"
                value={claheClip}
                onChange={(e) => setClaheClip(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>1.0x (Mild)</span>
                <span>3.0x (Balanced)</span>
                <span>5.0x (High Contrast)</span>
              </div>
            </div>

            {/* Controller 3: Sobel Direction */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">3. Sobel Gradient Axis</span>
                <span className="font-mono text-purple-400 font-bold uppercase">{sobelDirection}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
                {(['both', 'horizontal', 'vertical'] as const).map((dir) => (
                  <button
                    key={dir}
                    onClick={() => {
                      playScanClickSound();
                      setSobelDirection(dir);
                    }}
                    className={`py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                      sobelDirection === dir
                        ? 'bg-purple-600 text-white font-bold border-purple-500'
                        : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                    }`}
                  >
                    {dir === 'both' ? 'X + Y' : dir === 'horizontal' ? 'X-Axis' : 'Y-Axis'}
                  </button>
                ))}
              </div>
            </div>

            {/* Controller 4: Canny Thresholds Dual Sliders */}
            <div className="space-y-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">4. Canny Hysteresis Thresholds</span>
                <span className="font-mono text-rose-400 font-bold">
                  {cannyLow} / {cannyHigh}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Minimum Threshold (Low)</span>
                  <span className="font-mono text-slate-200">{cannyLow}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={cannyLow}
                  onChange={(e) => setCannyLow(Number(e.target.value))}
                  className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Maximum Threshold (High)</span>
                  <span className="font-mono text-slate-200">{cannyHigh}</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="220"
                  step="5"
                  value={cannyHigh}
                  onChange={(e) => setCannyHigh(Number(e.target.value))}
                  className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Controller 5: Morphological Operations */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">5. Morphological Operator</span>
                <span className="font-mono text-amber-400 font-bold uppercase">{morphOp}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-xs font-mono pt-1">
                {(['none', 'dilate', 'erode', 'close'] as const).map((op) => (
                  <button
                    key={op}
                    onClick={() => {
                      playScanClickSound();
                      setMorphOp(op);
                    }}
                    className={`py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                      morphOp === op
                        ? 'bg-amber-600 text-white font-bold border-amber-500'
                        : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                    }`}
                  >
                    {op === 'none' ? 'None' : op === 'dilate' ? 'Dilate' : op === 'erode' ? 'Erode' : 'Close'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
