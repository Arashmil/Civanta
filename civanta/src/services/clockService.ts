/**
 * Centralized Clock & Simulation Service
 * Provides synchronized simulated time across all components (SLA countdowns,
 * progress bars, audit logs, and status evaluators) with local resilience for GitHub Pages.
 */
import { useState, useEffect, useCallback } from 'react';
import { api } from './api';

const STORAGE_KEY = 'civanta_clock_offset_seconds';
const EVENT_NAME = 'civanta-clock-change';

let memoryOffsetSeconds = 0;

// Initialize offset from localStorage on load
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved !== null) {
    memoryOffsetSeconds = parseInt(saved, 10) || 0;
  }
} catch {
  // fallback to 0
}

export const ClockService = {
  /**
   * Get the current simulated offset in seconds.
   */
  getOffsetSeconds(): number {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        memoryOffsetSeconds = parseInt(saved, 10) || 0;
      }
    } catch {
      // ignore
    }
    return memoryOffsetSeconds;
  },

  /**
   * Returns current simulated time (real-time + offset).
   */
  getSimulatedTime(): Date {
    const offset = this.getOffsetSeconds();
    return new Date(Date.now() + offset * 1000);
  },

  /**
   * Save offset to localStorage and notify all listeners.
   */
  setOffsetSeconds(seconds: number): void {
    memoryOffsetSeconds = seconds;
    try {
      localStorage.setItem(STORAGE_KEY, String(seconds));
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(EVENT_NAME, {
          detail: {
            offsetSeconds: seconds,
            simulatedTime: new Date(Date.now() + seconds * 1000),
          },
        })
      );
    }
  },

  /**
   * Fast forward simulated clock by specified days and hours.
   */
  async fastForward(days: number = 0, hours: number = 0): Promise<Date> {
    const current = this.getOffsetSeconds();
    const additional = days * 86400 + hours * 3600;
    const newOffset = current + additional;
    this.setOffsetSeconds(newOffset);

    // Sync with backend if available (silent fallback)
    try {
      await api.fastForwardClock(days, hours);
    } catch {
      // offline / GitHub Pages mode - local offset is primary
    }

    return this.getSimulatedTime();
  },

  /**
   * Reset simulated clock to real-time (offset = 0).
   */
  async resetClock(): Promise<Date> {
    this.setOffsetSeconds(0);

    // Sync with backend if available (silent fallback)
    try {
      await api.resetClock();
    } catch {
      // offline / GitHub Pages mode
    }

    return this.getSimulatedTime();
  },

  /**
   * Probe backend clock on startup or refresh.
   */
  async syncWithBackend(): Promise<void> {
    try {
      const res = await api.getClock();
      if (res && typeof res.offset_seconds === 'number') {
        this.setOffsetSeconds(res.offset_seconds);
      }
    } catch {
      // offline or GitHub Pages - keep local offset
    }
  },

  /**
   * Format simulated date for IST display.
   */
  formatIST(date?: Date): { time: string; date: string } {
    const targetDate = date || ClockService.getSimulatedTime();
    const time = targetDate.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    const dateStr = targetDate.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    return { time, date: dateStr };
  },
};

/**
 * React hook to subscribe to live ticking simulated time.
 * Ticks every 1 second and immediately reacts when fast-forward or reset occurs.
 */
export function useSimulatedClock() {
  const [simulatedTime, setSimulatedTime] = useState<Date>(() => ClockService.getSimulatedTime());
  const [offsetSeconds, setOffsetSeconds] = useState<number>(() => ClockService.getOffsetSeconds());

  useEffect(() => {
    // 1. Live 1-second tick
    const timer = setInterval(() => {
      setSimulatedTime(ClockService.getSimulatedTime());
      setOffsetSeconds(ClockService.getOffsetSeconds());
    }, 1000);

    // 2. React to clock jumps (fast-forward or reset)
    const handleClockChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setSimulatedTime(customEvent.detail.simulatedTime);
        setOffsetSeconds(customEvent.detail.offsetSeconds);
      } else {
        setSimulatedTime(ClockService.getSimulatedTime());
        setOffsetSeconds(ClockService.getOffsetSeconds());
      }
    };

    window.addEventListener(EVENT_NAME, handleClockChange);

    return () => {
      clearInterval(timer);
      window.removeEventListener(EVENT_NAME, handleClockChange);
    };
  }, []);

  const fastForward = useCallback(async (days: number, hours: number = 0) => {
    const updated = await ClockService.fastForward(days, hours);
    setSimulatedTime(updated);
    setOffsetSeconds(ClockService.getOffsetSeconds());
    return updated;
  }, []);

  const resetClock = useCallback(async () => {
    const updated = await ClockService.resetClock();
    setSimulatedTime(updated);
    setOffsetSeconds(0);
    return updated;
  }, []);

  const isSimulated = offsetSeconds !== 0;
  const offsetDays = Math.round((offsetSeconds / 86400) * 10) / 10;
  const { time: liveTimeString, date: liveDateString } = ClockService.formatIST(simulatedTime);

  return {
    simulatedTime,
    offsetSeconds,
    offsetDays,
    isSimulated,
    fastForward,
    resetClock,
    liveTimeString,
    liveDateString,
  };
}
