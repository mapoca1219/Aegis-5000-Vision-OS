import React, { useState } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Camera,
  Cpu,
  Shield,
  Zap,
  Sliders,
  CheckCircle2,
  RotateCcw,
  Key,
  Globe,
} from 'lucide-react';
import { playScanClickSound, playPassSound } from '../utils/soundEffects';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onShowToast: (msg: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
  onShowToast,
}) => {
  const [awsRegion, setAwsRegion] = useState<string>('us-east-1');
  const [frameRateTarget, setFrameRateTarget] = useState<number>(248);
  const [solenoidPressure, setSolenoidPressure] = useState<number>(6.2);
  const [safetyBoundary, setSafetyBoundary] = useState<number>(85);
  const [kmsKeyArn, setKmsKeyArn] = useState<string>(
    'arn:aws:kms:us-east-1:123456789012:key/aegis-defect-vault'
  );

  if (!isOpen) return null;

  const handleSave = () => {
    if (soundEnabled) playPassSound();
    onShowToast('Settings applied and persisted to local runtime.');
    onClose();
  };

  const handleReset = () => {
    if (soundEnabled) playScanClickSound();
    setAwsRegion('us-east-1');
    setFrameRateTarget(248);
    setSolenoidPressure(6.2);
    setSafetyBoundary(85);
    onShowToast('Reset to default aerospace factory specifications.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="metallic-panel w-full max-w-lg rounded-2xl border border-cyan-500/40 p-5 shadow-[0_0_40px_rgba(0,240,255,0.25)] relative overflow-hidden flex flex-col gap-4 text-slate-100">
        <span className="hud-corner hud-corner-tl" />
        <span className="hud-corner hud-corner-tr" />
        <span className="hud-corner hud-corner-bl" />
        <span className="hud-corner hud-corner-br" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-sm text-white tracking-wider uppercase">
                SYSTEM CONFIGURATION & HARDWARE SETTINGS
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Aegis-5000 Vision OS • Factory Calibration Suite
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Options */}
        <div className="space-y-3.5 text-xs font-mono">
          {/* Sound & Haptics */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2.5">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <div>
                <span className="text-white font-bold block">Tactile Audio & Acoustic Haptics</span>
                <span className="text-[10px] text-slate-400">
                  Web Audio API feedback on scanner, servo, and pneumatic triggers
                </span>
              </div>
            </div>
            <button
              onClick={onToggleSound}
              className={`px-3 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-all ${
                soundEnabled
                  ? 'bg-cyan-600 text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {soundEnabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>

          {/* AWS Cloud Deployment Region */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                AWS Graviton4 Deployment Region
              </span>
              <span className="text-[10px] text-cyan-400 font-bold">{awsRegion}</span>
            </div>
            <select
              value={awsRegion}
              onChange={(e) => setAwsRegion(e.target.value)}
              className="w-full bg-[#060B14] border border-slate-700 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-cyan-400"
            >
              <option value="us-east-1">US East (N. Virginia) • us-east-1 (Optimal COOL Ingest)</option>
              <option value="us-west-2">US West (Oregon) • us-west-2</option>
              <option value="eu-west-1">Europe (Ireland) • eu-west-1</option>
              <option value="ap-northeast-1">Asia Pacific (Tokyo) • ap-northeast-1</option>
            </select>
          </div>

          {/* Pneumatic Cylinder Pressure & Safety Threshold */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Pneumatics</span>
                <span className="text-cyan-400 font-bold">{solenoidPressure} bar</span>
              </div>
              <input
                type="range"
                min="4.5"
                max="7.5"
                step="0.1"
                value={solenoidPressure}
                onChange={(e) => setSolenoidPressure(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[9px] text-slate-500 block mt-1">Nominal: 6.2 bar</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Safety Threshold</span>
                <span className="text-amber-400 font-bold">{safetyBoundary}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="95"
                step="1"
                value={safetyBoundary}
                onChange={(e) => setSafetyBoundary(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-[9px] text-slate-500 block mt-1">Triggers Agentic Reorientation</span>
            </div>
          </div>

          {/* KMS Encryption Key for S3 Vault */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-white font-bold flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              AWS KMS 256-Bit Master Key ARN
            </span>
            <input
              type="text"
              value={kmsKeyArn}
              onChange={(e) => setKmsKeyArn(e.target.value)}
              className="w-full bg-[#060B14] border border-slate-700 rounded-lg p-1.5 text-[10px] text-slate-300 font-mono outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={handleReset}
            className="btn-cyber-secondary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Defaults</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-cyber-primary px-4 py-1.5 rounded-lg text-xs font-bold text-slate-950 flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Apply Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
