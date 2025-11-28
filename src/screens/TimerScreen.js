import { useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import CategoryPicker from "../components/CategoryPicker";
import SessionSummaryModal from "../components/SessionSummaryModal";
import TimerControls from "../components/TimerControls";
import { useSessions } from "../context/SessionProvider";
import colors from "../theme/colors";

const DEFAULT_MINUTES = 25;

export default function TimerScreen() {
  const { addSession } = useSessions();

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

  // Sayaç çalıştırma
  useEffect(() => {
    if (isRunning) {
      if (!sessionStartRef.current) {
        sessionStartRef.current = new Date();
      }

      intervalRef.current = setInterval(() => {
        setRemainingSec((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleSessionEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  // AppState dinleme
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (
        appStateRef.current === "active" &&
        (nextState === "background" || nextState === "inactive")
      ) {
        // Kullanıcı uygulamadan çıktı
        if (isRunning) {
          setIsRunning(false);
          setDistractionCount((c) => c + 1);
        }
      }
      appStateRef.current = nextState;
    });

    return () => sub.remove();
  }, [isRunning]);

  const handleStart = () => {
    const minsNumber = Number(minutes);
    if (Number.isNaN(minsNumber) || minsNumber <= 0) {
      Alert.alert("Hata", "Lütfen geçerli bir dakika değeri giriniz.");
      return;
    }
    const totalSec = minsNumber * 60;
    setRemainingSec((prev) => (prev === 0 ? totalSec : prev)); // sıfırlanmışsa tekrar yükle
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    const minsNumber = Number(minutes) || DEFAULT_MINUTES;
    setRemainingSec(minsNumber * 60);
    setDistractionCount(0);
    sessionStartRef.current = null;
  };

  const handleSessionEnd = () => {
    setIsRunning(false);
    const end = new Date();
    const start = sessionStartRef.current || end;
    const actualSec = Math.round((end - start) / 1000);
    const targetSec = Number(minutes) * 60;

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

    // bir sonraki seans için reset
    setDistractionCount(0);
    sessionStartRef.current = null;
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Odaklanma Zamanlayıcısı</Text>

      <Text style={styles.label}>Süre (dakika)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={minutes}
        onChangeText={(text) => {
          setMinutes(text);
          const val = Number(text) || 0;
          setRemainingSec(val * 60);
        }}
      />

      <Text style={styles.timerText}>{formatTime(remainingSec)}</Text>

      <CategoryPicker category={category} setCategory={setCategory} />

      <Text style={styles.infoText}>
        Dikkat Dağınıklığı Sayısı: {distractionCount}
      </Text>

      <TimerControls
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
        isRunning={isRunning}
      />

      <SessionSummaryModal
        visible={summaryVisible}
        onClose={() => setSummaryVisible(false)}
        summary={lastSummary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 24,
  },
  label: {
    alignSelf: "flex-start",
    marginBottom: 4,
    color: colors.text,
    fontWeight: 'bold '
  },
  input: {
    width: "100%",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "black",
    color: colors.text,
    marginBottom: 16,
  },
  timerText: {
    fontSize: 48,
    color: colors.primary,
    marginTop: 8,
  },
  infoText: {
    color: colors.text,
    marginTop: 12,
    fontWeight: 'bold'
  },
});
