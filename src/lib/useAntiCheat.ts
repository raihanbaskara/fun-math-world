import { useState, useEffect, useRef } from 'react';
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
  const leaveStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab was hidden / switched
        leaveStartTimeRef.current = Date.now();
        setSwitchCount(prev => {
          const next = prev + 1;
          soundService.alert();
          if (onViolation) {
            onViolation(`Peringatan Integritas! Terdeteksi perpindahan tab (${next}x).`, next);
          }
          return next;
        });
      } else {
        // Tab is back
        if (leaveStartTimeRef.current) {
          const duration = Math.max(1, Math.round((Date.now() - leaveStartTimeRef.current) / 1000));
          setTotalLeaveSeconds(prev => prev + duration);
          setLogs(prev => [
            ...prev,
            {
              timestamp: new Date().toLocaleTimeString('id-ID'),
              incident: 'Meninggalkan tab / berpindah jendela browser',
              durationSeconds: duration
            }
          ]);
          leaveStartTimeRef.current = null;
        }
      }
    };

    const handleBlur = () => {
      if (!document.hidden && !leaveStartTimeRef.current) {
        leaveStartTimeRef.current = Date.now();
        setSwitchCount(prev => {
          const next = prev + 1;
          soundService.alert();
          if (onViolation) {
            onViolation(`Peringatan Integritas! Jendela browser kehilangan fokus (${next}x).`, next);
          }
          return next;
        });
      }
    };

    const handleFocus = () => {
      if (leaveStartTimeRef.current) {
        const duration = Math.max(1, Math.round((Date.now() - leaveStartTimeRef.current) / 1000));
        setTotalLeaveSeconds(prev => prev + duration);
        setLogs(prev => [
          ...prev,
          {
            timestamp: new Date().toLocaleTimeString('id-ID'),
            incident: 'Jendela kembali aktif',
            durationSeconds: duration
          }
        ]);
        leaveStartTimeRef.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [active, onViolation]);

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
  };

  return {
    switchCount,
    totalLeaveSeconds,
    logs,
    getReport,
    resetReport
  };
}
