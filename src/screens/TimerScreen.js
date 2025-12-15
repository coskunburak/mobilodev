import {
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
import { useFocusTimer } from "../hooks/useFocusTimer";
import colors from "../theme/colors";

const DEFAULT_MINUTES = 25;

export default function TimerScreen() {
  const { addSession } = useSessions();

  const {
    minutes,
    remainingSec,
    isRunning,
    category,
    distractionCount,
    summaryVisible,
    lastSummary,

    formatTime,

    setCategory,
    setSummaryVisible,
    onMinutesChange,
    handleStart,
    handlePause,
    handleReset,
  } = useFocusTimer({ addSession });

  const timeText = formatTime(remainingSec);

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
                onChangeText={onMinutesChange}
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
              accessibilityLabel={`Kalan süre ${timeText}`}
            >
              {timeText}
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
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingTop: 12, paddingHorizontal: 16 },
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
  label: { marginBottom: 6, color: colors.text, fontWeight: "700" },
  inputRow: { flexDirection: "row", alignItems: "center" },
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
  minSuffix: { marginLeft: 8, color: colors.muted, fontWeight: "600" },
  timerText: {
    marginTop: 16,
    fontSize: 56,
    lineHeight: 60,
    color: colors.primary,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
    ...Platform.select({ android: { includeFontPadding: false } }),
  },
  infoText: { color: colors.text, marginTop: 12, fontWeight: "700" },
  infoStrong: { fontWeight: "700" },
});
