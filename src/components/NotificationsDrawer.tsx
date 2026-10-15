import React, { useState } from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { playScanClickSound } from '../utils/soundEffects';

interface NotificationItem {
  id: string;
  type: 'CRITICAL' | 'SUCCESS' | 'INFO' | 'METRIC';
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

function getTypeBadgeClass(type: NotificationItem['type']): string {
  switch (type) {
    case 'CRITICAL':
      return 'bg-rose-950 text-rose-300 border border-rose-500/40';
    case 'SUCCESS':
      return 'bg-emerald-950 text-emerald-300 border border-emerald-500/40';
    case 'METRIC':
      return 'bg-cyan-950 text-cyan-300 border border-cyan-500/40';
    default:
      return 'bg-slate-800 text-slate-300';
  }
}

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  soundEnabled,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      type: 'CRITICAL',
      title: 'Ambiguous Specular Flare Detected',
      desc: 'Silicon Wafer SN-9428 certainty dropped to 54% due to Brewster angle reflection. Agentic re-orientation initiated.',
      time: '12s ago',
      read: false,
    },
    {
      id: 'n2',
      type: 'SUCCESS',
      title: 'Agentic Closed-Loop Remediated',
      desc: 'Servo gimbal rotated +18.5° / -7.0° and cross-polarizer engaged at 45°. Certainty restored to 96%.',
      time: '1m ago',
      read: false,
    },
    {
      id: 'n3',
      type: 'INFO',
      title: 'Pneumatic Ejection Dispatched',
      desc: 'Sol-01 cylinder fired at 6.2 bar (28ms pulse). Defective wafer quarantined with zero line stoppage.',
      time: '2m ago',
      read: false,
    },
    {
      id: 'n4',
      type: 'SUCCESS',
      title: 'Amazon S3 Defect Vault Sync Complete',
      desc: 'High-res capture and JSON telemetry encrypted with AWS KMS 256-bit key (arn:aws:kms:us-east-1:...:aegis-defect-vault).',
      time: '4m ago',
      read: true,
    },
    {
      id: 'n5',
      type: 'METRIC',
      title: 'Graviton4 Throughput Stable',
      desc: 'ARM64 NEON pipeline sustained 248 FPS with P99 frame latency of 4.03 ms across last 50,000 frames.',
      time: '8m ago',
      read: true,
    },
  ]);

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    if (soundEnabled) playScanClickSound();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClear = () => {
    if (soundEnabled) playScanClickSound();
    setNotifications([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fadeIn select-none">
      <div className="w-full max-w-md h-full bg-[#080D1A] border-l border-cyan-500/30 p-4 flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.9)] relative text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                TELEMETRY NOTIFICATIONS
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Real-time Industrial Alarms & Event Traces
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

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 scrollbar-none font-mono">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-slate-600 mb-2" />
              <span>All systems nominal. No pending alarms.</span>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-all ${
                  item.read
                    ? 'bg-slate-900/50 border-slate-800/60 opacity-75'
                    : 'bg-slate-900 border-slate-700 shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${getTypeBadgeClass(item.type)}`}>
                    {item.type}
                  </span>
                  <span className="text-[10px] text-slate-500">{item.time}</span>
                </div>
                <h4 className="text-xs font-bold text-white mb-0.5">{item.title}</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
          <button
            onClick={handleMarkAllRead}
            disabled={notifications.length === 0}
            className="text-cyan-400 hover:text-cyan-300 cursor-pointer disabled:opacity-40"
          >
            Mark all as read
          </button>
          <button
            onClick={handleClear}
            disabled={notifications.length === 0}
            className="text-slate-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear list</span>
          </button>
        </div>
      </div>
    </div>
  );
};

