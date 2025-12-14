import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthProvider';
import colors from '../theme/colors';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSignup = async () => {
    if (!email || !password) return Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
    
    setLoading(true);
    try {
      await signup(email, password);
      console.log("Kayıt başarılı!"); // Başarılı olursa bunu görürüz
    } catch (error) {
      // Hatanın detayını terminale yazdırıyoruz:
      console.log("KAYIT HATASI:", error.code, error.message); 
      
      let msg = "Kayıt başarısız.";
      if(error.code === 'auth/email-already-in-use') msg = "Bu e-posta zaten kullanımda.";
      else if(error.code === 'auth/weak-password') msg = "Şifre en az 6 karakter olmalı.";
      else if(error.code === 'auth/invalid-email') msg = "Geçersiz e-posta adresi.";
      else msg = error.message; // Geliştirme aşamasında gerçek hatayı ekranda görmek için bunu ekle

      Alert.alert("Hata", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Hesap Oluştur</Text>
        <Text style={styles.subtitle}>Uygulamaya başlamak için kayıt olun</Text>

        <TextInput
          style={styles.input}
          placeholder="E-posta"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Şifre"
          placeholderTextColor={colors.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.text} /> : <Text style={styles.buttonText}>Kayıt Ol</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Zaten hesabın var mı? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: 20 },
    formContainer: { backgroundColor: 'rgba(95, 99, 125, 0.1)', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: colors.card },
    title: { fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 8, textAlign: 'center' },
    subtitle: { fontSize: 16, color: colors.muted, marginBottom: 32, textAlign: 'center' },
    input: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 16, color: colors.text, fontSize: 16 },
    button: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    buttonText: { color: colors.text, fontSize: 16, fontWeight: 'bold' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
    footerText: { color: colors.muted },
    link: { color: colors.primary, fontWeight: 'bold' }
});