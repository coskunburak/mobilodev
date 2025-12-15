import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  AppState,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
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
const MIN_MINUTES = 1;
const MAX_MINUTES = 180;

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
  const targetEndTsRef = useRef(null);

  const sanitizedMinutes = useMemo(() => {
    const n = Number(minutes);
    if (Number.isNaN(n)) return DEFAULT_MINUTES;
    return Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, Math.floor(n)));
  }, [minutes]);

  const clearTick = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTick = () => {
    clearTick();
    intervalRef.current = setInterval(() => {
      if (targetEndTsRef.current == null) return;
      const now = Date.now();
      const diff = Math.max(0, Math.round((targetEndTsRef.current - now) / 1000));
      setRemainingSec(diff);
      if (diff <= 0) {
        clearTick();
        handleSessionEnd();
      }
    }, 250);
  };

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (
        appStateRef.current === "active" &&
        (nextState === "background" || nextState === "inactive") //arkaplan kontrolü
      ) {
        if (isRunning) {
          pauseTimer(true);
        }
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, [isRunning]);

  useEffect(() => () => clearTick(), []);

  const handleStart = () => {
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
  };

  const pauseTimer = (fromAppBackground = false) => {
    setIsRunning(false);
    clearTick();

    if (targetEndTsRef.current != null) {
      const now = Date.now();
      const diff = Math.max(0, Math.round((targetEndTsRef.current - now) / 1000));
      setRemainingSec(diff);
    }

    if (fromAppBackground) {
      setDistractionCount((c) => c + 1); //dikkat dağınıklığını 1 artır
    }
  };

  const handlePause = () => {
    pauseTimer(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    clearTick();
    const totalSec = sanitizedMinutes * 60;
    setRemainingSec(totalSec);
    setDistractionCount(0);
    sessionStartRef.current = null;
    targetEndTsRef.current = null;
  };

  const handleSessionEnd = () => {
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
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.title} accessibilityRole="header">
            Odaklanma Zamanlayıcısı
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Süre (dakika)</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={minutes}
                maxLength={3}
                onChangeText={(text) => {
                  const onlyDigits = text.replace(/[^0-9]/g, "");
                  setMinutes(onlyDigits);
                  const val = Number(onlyDigits);
                  if (!Number.isNaN(val)) {
                    const clamped = Math.min(
                      MAX_MINUTES,
                      Math.max(MIN_MINUTES, val || 0)
                    );
                    setRemainingSec(clamped * 60);
                  } else {
                    setRemainingSec(0);
                  }
                }}
                placeholder={`${DEFAULT_MINUTES}`}
                placeholderTextColor={colors.muted}
                accessibilityLabel="Süreyi dakika olarak giriniz"
                returnKeyType="done"
              />
              <Text style={styles.minSuffix}>dk</Text>
            </View>

            <Text
              style={styles.timerText}
              accessibilityLiveRegion="polite"
              accessibilityLabel={`Kalan süre ${formatTime(remainingSec)}`}
            >
              {formatTime(remainingSec)}
            </Text>

            <View style={{ marginTop: 16 }}>
              <CategoryPicker
                category={category}
                setCategory={setCategory}
                accessibilityLabel="Kategori seçimi"
              />
            </View>

            <Text
              style={styles.infoText}
              accessibilityLabel={`Dikkat dağınıklığı sayısı ${distractionCount}`}
            >
              Dikkat Dağınıklığı:{" "}
              <Text style={styles.infoStrong}>{distractionCount}</Text>
            </Text>

            <View style={{ marginTop: 14 }}>
              <TimerControls
                onStart={handleStart}
                onPause={handlePause}
                onReset={handleReset}
                isRunning={isRunning}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      <SessionSummaryModal
        visible={summaryVisible}
        onClose={() => setSummaryVisible(false)}
        summary={lastSummary}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 12,
    marginTop: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.muted,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  label: {
    marginBottom: 6,
    color: colors.text,
    fontWeight: "600",
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",

  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.muted,
    fontSize: 16,
    textAlign: "center",
  },
  minSuffix: {
    marginLeft: 8,
    color: colors.muted,
    fontWeight: "600",
  },
  timerText: {
    marginTop: 16,
    fontSize: 56,
    lineHeight: 60,
    color: colors.primary,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
    ...Platform.select({
      android: { includeFontPadding: false },
    }),
  },
  infoText: {
    color: colors.text,
    marginTop: 12,
    fontWeight: 'bold'
  },
  infoStrong: {
    fontWeight: "700",
  },
});
