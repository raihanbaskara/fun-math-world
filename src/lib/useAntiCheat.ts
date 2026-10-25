import { useState, useEffect, useRef, useCallback } from 'react';
import { AntiCheatReport, AntiCheatLogRecord } from '@/types';
import { soundService } from '@/services/soundService';

export interface UseAntiCheatOptions {
  active: boolean;
  onViolation?: (warningMessage: string, switchCount: number) => void;
}

export function useAntiCheat({ active, onViolation }: UseAntiCheatOptions) {
  const [switchCount, setSwitchCount] = useState<number>(0);
  const [totalLeaveSeconds, setTotalLeaveSeconds] = useState<number>(0);
  const [logs, setLogs] = useState<AntiCheatLogRecord[]>([]);

  // State guards to prevent duplicate counts (e.g. blur followed by visibilitychange)
  const isAwayRef = useRef<boolean>(false);
  const leaveStartTimeRef = useRef<number | null>(null);
  const lastViolationTimeRef = useRef<number>(0);
  const pausedUntilRef = useRef<number>(0);
  const isFilePickerActiveRef = useRef<boolean>(false);

  // Keep latest onViolation in a ref to avoid recreating listeners
  const onViolationRef = useRef(onViolation);
  useEffect(() => {
    onViolationRef.current = onViolation;
  }, [onViolation]);

  // Method to temporarily pause anti-cheat (e.g. when taking camera photo or selecting file)
  const pauseAntiCheat = useCallback((durationMs: number = 60000) => {
    pausedUntilRef.current = Date.now() + durationMs;
  }, []);

  const resumeAntiCheat = useCallback(() => {
    pausedUntilRef.current = 0;
    isFilePickerActiveRef.current = false;
  }, []);

  // Explicit safe-mode for file selection / camera capture
  const markFilePickerOpen = useCallback((durationMs: number = 600000) => {
    isFilePickerActiveRef.current = true;
    pausedUntilRef.current = Date.now() + durationMs;
  }, []);

  const markFilePickerClosed = useCallback((gracePeriodMs: number = 4000) => {
    pausedUntilRef.current = Date.now() + gracePeriodMs;
    setTimeout(() => {
      isFilePickerActiveRef.current = false;
    }, gracePeriodMs);
  }, []);

  useEffect(() => {
    if (!active) {
      isAwayRef.current = false;
      leaveStartTimeRef.current = null;
      isFilePickerActiveRef.current = false;
      return;
    }

    const handleLeave = () => {
      const now = Date.now();

      // Check if paused or file picker/camera is active
      if (isFilePickerActiveRef.current || now < pausedUntilRef.current) {
        return;
      }

      // If already away or if violation was recorded less than 1.5 seconds ago (debounce blur + visibilitychange)
      if (isAwayRef.current || (now - lastViolationTimeRef.current < 1500)) {
        if (!leaveStartTimeRef.current) {
          leaveStartTimeRef.current = now;
        }
        isAwayRef.current = true;
        return;
      }

      isAwayRef.current = true;
      leaveStartTimeRef.current = now;
      lastViolationTimeRef.current = now;

      setSwitchCount(prev => {
        const next = prev + 1;
        soundService.alert();
        if (onViolationRef.current) {
          onViolationRef.current(`Peringatan Integritas! Terdeteksi perpindahan tab (${next}x).`, next);
        }
        return next;
      });
    };

    const handleReturn = () => {
      const now = Date.now();

      // If returning while file picker was active, cleanly reset without counting
      if (isFilePickerActiveRef.current || now < pausedUntilRef.current) {
        leaveStartTimeRef.current = null;
        isAwayRef.current = false;
        return;
      }

      if (!isAwayRef.current && !leaveStartTimeRef.current) {
        return;
      }

      const startTime = leaveStartTimeRef.current || now;
      const duration = Math.max(1, Math.round((now - startTime) / 1000));

      setTotalLeaveSeconds(prev => prev + duration);
      setLogs(prev => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString('id-ID'),
          incident: 'Meninggalkan tab / jendela aplikasi',
          durationSeconds: duration
        }
      ]);

      leaveStartTimeRef.current = null;
      isAwayRef.current = false;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleLeave();
      } else {
        handleReturn();
      }
    };

    const handleBlur = () => {
      handleLeave();
    };

    const handleFocus = () => {
      handleReturn();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [active]);

  const getReport = (): AntiCheatReport => {
    return {
      switchCount,
      totalLeaveSeconds,
      log: logs
    };
  };

  const resetReport = () => {
    setSwitchCount(0);
    setTotalLeaveSeconds(0);
    setLogs([]);
    leaveStartTimeRef.current = null;
    isAwayRef.current = false;
    lastViolationTimeRef.current = 0;
    pausedUntilRef.current = 0;
  };

  const restoreReport = useCallback((report?: Partial<AntiCheatReport> | null) => {
    if (!report) return;
    if (typeof report.switchCount === 'number') {
      setSwitchCount(report.switchCount);
    }
    if (typeof report.totalLeaveSeconds === 'number') {
      setTotalLeaveSeconds(report.totalLeaveSeconds);
    }
    if (Array.isArray(report.log)) {
      setLogs(report.log);
    }
  }, []);

  return {
    switchCount,
    totalLeaveSeconds,
    logs,
    getReport,
    resetReport,
    restoreReport,
    pauseAntiCheat,
    resumeAntiCheat,
    markFilePickerOpen,
    markFilePickerClosed
  };
}
