import { Button, Modal, Text, View } from "react-native";
import colors from "../theme/colors";

export default function SessionSummaryModal({
  visible,
  onClose,
  summary,
}) {
  if (!summary) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "80%",
            backgroundColor: colors.card,
            padding: 20,
            borderRadius: 16,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}>
            Seans Özeti
          </Text>
          <Text style={{ color: colors.text, marginTop: 8 }}>
            Kategori: {summary.category}
          </Text>
          <Text style={{ color: colors.text }}>
            Hedef Süre: {Math.round(summary.targetDurationSec / 60)} dk
          </Text>
          <Text style={{ color: colors.text }}>
            Gerçek Süre: {Math.round(summary.actualDurationSec / 60)} dk
          </Text>
          <Text style={{ color: colors.text }}>
            Dikkat Dağınıklığı: {summary.distractionCount}
          </Text>

          <View style={{ marginTop: 16 }}>
            <Button title="Tamam" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
