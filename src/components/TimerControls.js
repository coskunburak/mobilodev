import { Button, View } from "react-native";

export default function TimerControls({ onStart, onPause, onReset, isRunning }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
      {!isRunning && <Button title="Başlat" onPress={onStart} />}
      {isRunning && <Button title="Duraklat" onPress={onPause} />}
      <Button title="Sıfırla" onPress={onReset} />
    </View>
  );
}
