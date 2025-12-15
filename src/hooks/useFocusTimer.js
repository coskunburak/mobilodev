import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, AppState } from "react-native";

const DEFAULT_MINUTES = 25;
const MIN_MINUTES = 1;
const MAX_MINUTES = 180;

export function useFocusTimer({ addSession }) {
  const [minutes, setMinutes] = useState(String(DEFAULT_MINUTES));
  const [remainingSec, setRemainingSec] = useState(DEFAULT_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [category, setCategory] = useState("Ders Çalışma");
  const [distractionCount, setDistractionCount] = useState(0);

  const [summaryVisible, setSummaryVisible] = useState(false);
  const [lastSummary, setLastSummary] = useState(null);

  const intervalRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const sessionStartRef = useRef(null);
  const targetEndTsRef = useRef(null);

  const sanitizedMinutes = useMemo(() => {
    const n = Number(minutes);
    if (Number.isNaN(n)) return DEFAULT_MINUTES;
    return Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, Math.floor(n)));
  }, [minutes]);

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const formatTime = useCallback((sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, []);

  const handleSessionEnd = useCallback(() => {
    setIsRunning(false);
    clearTick();

    const end = new Date();
    const start = sessionStartRef.current || end;

    const actualSec = Math.max(0, Math.round((end - start) / 1000));
    const targetSec = sanitizedMinutes * 60;

    const session = {
      id: `${Date.now()}`,
      category,
      targetDurationSec: targetSec,
      actualDurationSec: actualSec,
      distractionCount,
      startedAt: start.toISOString(),
      endedAt: end.toISOString(),
    };

    addSession(session);

    setLastSummary(session);
    setSummaryVisible(true);

    setDistractionCount(0);
    sessionStartRef.current = null;
    targetEndTsRef.current = null;
    setRemainingSec(sanitizedMinutes * 60);
  }, [addSession, category, clearTick, distractionCount, sanitizedMinutes]);

  const startTick = useCallback(() => {
    clearTick();

    intervalRef.current = setInterval(() => {
      if (targetEndTsRef.current == null) return;

      const now = Date.now();
      const diff = Math.max(
        0,
        Math.round((targetEndTsRef.current - now) / 1000)
      );

      setRemainingSec(diff);

      if (diff <= 0) {
        clearTick();
        handleSessionEnd();
      }
    }, 250);
  }, [clearTick, handleSessionEnd]);

  const pauseTimer = useCallback(
    (fromAppBackground = false) => {
      setIsRunning(false);
      clearTick();

      if (targetEndTsRef.current != null) {
        const now = Date.now();
        const diff = Math.max(
          0,
          Math.round((targetEndTsRef.current - now) / 1000)
        );
        setRemainingSec(diff);
      }

      if (fromAppBackground) {
        setDistractionCount((c) => c + 1);
      }
    },
    [clearTick]
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (
        appStateRef.current === "active" &&
        (nextState === "background" || nextState === "inactive")
      ) {
        if (isRunning) pauseTimer(true);
      }
      appStateRef.current = nextState;
    });

    return () => sub.remove();
  }, [isRunning, pauseTimer]);

  useEffect(() => () => clearTick(), [clearTick]);

  const onMinutesChange = useCallback((text) => {
    const onlyDigits = text.replace(/[^0-9]/g, "");
    setMinutes(onlyDigits);

    const val = Number(onlyDigits);
    if (!Number.isNaN(val)) {
      const clamped = Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, val || 0));
      setRemainingSec(clamped * 60);
    } else {
      setRemainingSec(0);
    }
  }, []);

  const handleStart = useCallback(() => {
    if (Number.isNaN(Number(minutes)) || Number(minutes) <= 0) {
      Alert.alert("Hata", "Lütfen geçerli bir dakika değeri giriniz.");
      return;
    }

    if (!isRunning) {
      const totalSec = sanitizedMinutes * 60;
      const baseRemaining = remainingSec === 0 ? totalSec : remainingSec;

      const now = Date.now();
      targetEndTsRef.current = now + baseRemaining * 1000;

      if (!sessionStartRef.current) {
        sessionStartRef.current = new Date();
      }

      setIsRunning(true);
      startTick();
    }
  }, [isRunning, minutes, remainingSec, sanitizedMinutes, startTick]);

  const handlePause = useCallback(() => {
    pauseTimer(false);
  }, [pauseTimer]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    clearTick();
    setRemainingSec(sanitizedMinutes * 60);
    setDistractionCount(0);
    sessionStartRef.current = null;
    targetEndTsRef.current = null;
  }, [clearTick, sanitizedMinutes]);

  return {
    minutes,
    remainingSec,
    isRunning,
    category,
    distractionCount,
    summaryVisible,
    lastSummary,

    sanitizedMinutes,
    formatTime,

    setCategory,
    setSummaryVisible,
    onMinutesChange,
    handleStart,
    handlePause,
    handleReset,
  };
}

export default useFocusTimer;
