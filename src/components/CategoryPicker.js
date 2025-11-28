import { Picker } from "@react-native-picker/picker";
import { Text, View } from "react-native";

const DEFAULT_CATEGORIES = ["Ders Çalışma", "Kodlama", "Proje", "Kitap Okuma"];

export default function CategoryPicker({ category, setCategory }) {
  return (
    <View style={{ marginTop: 16, width: "100%" }}>
      <Text style={{ marginBottom: 4, color: "white" }}>Kategori</Text>
      <Picker
        selectedValue={category}
        onValueChange={(value) => setCategory(value)}
      >
        {DEFAULT_CATEGORIES.map((c) => (
          <Picker.Item label={c} value={c} key={c} />
        ))}
      </Picker>
    </View>
  );
}
