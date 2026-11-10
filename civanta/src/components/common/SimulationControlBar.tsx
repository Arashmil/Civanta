import React, { useState, useEffect } from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import {
  FastForward,
  RotateCcw,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface SimulationControlBarProps {
  onRoleModalOpen: () => void;
}

export const SimulationControlBar: React.FC<SimulationControlBarProps> = ({ onRoleModalOpen }) => {
  const { refreshData } = useGrievance();
  const { t } = useLanguage();
  const [clockStatus, setClockStatus] = useState<any>(null);
  const [offsetSeconds, setOffsetSeconds] = useState<number>(0);
  const [liveRealTime, setLiveRealTime] = useState<Date>(new Date());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Live real-time tick: ticks EVERY 1 SECOND
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveRealTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadClock = async () => {
    try {
      const status = await api.getClock();
      setClockStatus(status);
      setOffsetSeconds(status.offset_seconds || 0);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadClock();
    const interval = setInterval(loadClock, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleFastForward = async (days: number, label: string) => {
    setLoading(true);
    try {
      const res = await api.fastForwardClock(days);
      await loadClock();
      await refreshData();
      showToast(`Clock +${days}d (${label}). Overdue: ${res.scheduler_run?.overdue_flagged || 0}, Escalated: ${res.scheduler_run?.escalations_triggered || 0}`);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetClock = async () => {
    setLoading(true);
    try {
      await api.resetClock();
      await loadClock();
      await refreshData();
      showToast('Clock reset to Real-Time IST.');
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyChain = async () => {
    try {
      const res = await api.verifyAuditChain();
      if (res.valid) {
        alert(`Cryptographic Audit Chain: Valid\n${res.total_verified} blocks verified from genesis to head.`);
      } else {
        alert(`Cryptographic Integrity Failure\nChain broken at Entry #${res.broken_at_id}.\nReason: ${res.reason || res.message}`);
      }
    } catch (err: any) {
      alert(`Verification error: ${err.message}`);
    }
  };

  // Current simulated time derived from live ticking clock + offset
  const simulatedDate = new Date(liveRealTime.getTime() + offsetSeconds * 1000);

  const liveTimeString = simulatedDate.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const liveDateString = simulatedDate.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short'
  });

  const isSimulated = offsetSeconds !== 0;
  const offsetDays = Math.round((offsetSeconds / 86400) * 10) / 10;

  return (
    <>
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-slate-900/95 text-white px-3 py-2 rounded-[6px] border border-slate-700 text-xs shadow-xl font-mono backdrop-blur-xs">
          <CheckCircle2 size={14} className="text-[#15803D] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Ultra-compact, non-blocking floating widget at bottom-right */}
      <aside className="fixed bottom-4 right-4 z-40 no-print select-none">
        {isMinimized ? (
          /* Mini Pill Mode (Takes only ~150px x 32px, never covers anything) */
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#14213D]/95 hover:bg-[#14213D] text-white border border-slate-600 shadow-lg text-xs font-mono cursor-pointer backdrop-blur-md transition-all hover:scale-105"
            title="Click to expand Demo SLA Controls"
          >
            <Clock size={13} className="text-amber-400 animate-pulse" />
            <span className="font-bold tracking-tight text-amber-300">{liveTimeString}</span>
            <span className="text-[10px] text-slate-300 font-sans">IST</span>
            {isSimulated && (
              <span className="bg-[#B91C1C] text-white px-1.5 py-0.2 rounded text-[10px] font-bold">
                +{offsetDays}d
              </span>
            )}
            <Maximize2 size={11} className="text-slate-400 ml-0.5" />
          </button>
        ) : (
          /* Sleek Single-Line Floating Capsule (Compact, max-h 42px) */
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#14213D]/95 text-white border border-slate-600 shadow-xl backdrop-blur-md text-xs font-mono">
            {/* Live Ticking Clock Display */}
            <div className="flex items-center gap-1.5 pr-2 border-r border-slate-700">
              <Clock size={14} className="text-amber-400 shrink-0 animate-pulse" />
              <div className="flex flex-col leading-none">
                <span className="font-bold tracking-tight text-amber-300 text-xs">
                  {liveTimeString}
                </span>
                <span className="text-[9px] text-slate-300 font-sans mt-0.5">
                  {liveDateString} • IST (UTC+05:30)
                </span>
              </div>
            </div>

            {/* Status Indicator */}
            {isSimulated ? (
              <span className="bg-[#B91C1C] text-white px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">
                +{offsetDays}d
              </span>
            ) : (
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full text-[10px] shrink-0 font-sans">
                {t('Real-Time')}
              </span>
            )}

            {/* Quick Fast-Forward Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleFastForward(1, '24h Reminder')}
                disabled={loading}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-amber-400 text-[11px] font-bold cursor-pointer transition-colors disabled:opacity-50"
                title="Fast forward simulated time by 24 hours (Triggers SLA Reminder)"
              >
                +1d
              </button>

              <button
                onClick={() => handleFastForward(3, '3d Escalation')}
                disabled={loading}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[#D97706] border border-slate-700 hover:border-amber-400 text-[11px] font-bold cursor-pointer transition-colors disabled:opacity-50"
                title="Fast forward simulated time by 3 days (Triggers DySP Escalation)"
              >
                +3d
              </button>

              <button
                onClick={() => handleFastForward(7, '7d Red Flag')}
                disabled={loading}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700 hover:border-red-400 text-[11px] font-bold cursor-pointer transition-colors disabled:opacity-50"
                title="Fast forward simulated time by 7 days (Triggers Red Flag Alert)"
              >
                +7d
              </button>

              {isSimulated && (
                <button
                  onClick={handleResetClock}
                  disabled={loading}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] flex items-center gap-0.5 cursor-pointer transition-colors disabled:opacity-50"
                  title="Reset clock to real-time"
                >
                  <RotateCcw size={10} />
                  <span>{t('Reset')}</span>
                </button>
              )}

              <button
                onClick={handleVerifyChain}
                className="p-1 rounded text-emerald-400 hover:bg-slate-800 cursor-pointer"
                title="Verify SHA-256 Audit Chain"
              >
                <ShieldCheck size={14} />
              </button>
            </div>

            {/* Minimize Toggle */}
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer ml-1"
              title="Minimize to tiny pill"
            >
              <Minimize2 size={12} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
