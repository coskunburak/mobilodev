import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../context/AuthProvider';
import colors from '../theme/colors';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // UX İyileştirmesi: Hangi inputun aktif olduğunu takip edelim
  const [focusedInput, setFocusedInput] = useState(null);

  const { signup } = useAuth();

  const handleSignup = async () => {
    if (!email || !password) return Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
    
    setLoading(true);
    try {
      await signup(email, password);
      console.log("Kayıt başarılı!"); 
    } catch (error) {
      console.log("KAYIT HATASI:", error.code, error.message); 
      
      let msg = "Kayıt başarısız.";
      if(error.code === 'auth/email-already-in-use') msg = "Bu e-posta zaten kullanımda.";
      else if(error.code === 'auth/weak-password') msg = "Şifre en az 6 karakter olmalı.";
      else if(error.code === 'auth/invalid-email') msg = "Geçersiz e-posta adresi.";
      else msg = error.message; 

      Alert.alert("Hata", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Aramıza Katıl</Text>
            <Text style={styles.subtitle}>Saniyeler içinde hesabını oluştur ve hemen başla.</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-posta</Text>
              <TextInput
                style={[
                  styles.input, 
                  focusedInput === 'email' && styles.inputFocused
                ]}
                placeholder="ornek@email.com"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şifre</Text>
              <TextInput
                style={[
                  styles.input, 
                  focusedInput === 'password' && styles.inputFocused
                ]}
                placeholder="Güçlü bir şifre girin"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleSignup} 
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Hesap Oluştur</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Zaten hesabın var mı? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: { 
      flex: 1, 
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 24,
    },
    headerContainer: {
      marginBottom: 40,
      alignItems: 'center',
    },
    title: { 
      fontSize: 32, 
      fontWeight: '800', 
      color: colors.text, 
      marginBottom: 12, 
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    subtitle: { 
      fontSize: 16, 
      color: colors.muted, 
      textAlign: 'center',
      lineHeight: 24,
      paddingHorizontal: 20,
    },
    formContainer: {
      width: '100%',
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      marginLeft: 4,
      opacity: 0.9,
    },
    input: { 
      backgroundColor: 'rgba(255,255,255,0.05)', // Hafif bir zemin
      borderWidth: 1.5, 
      borderColor: colors.card, // Varsayılan border
      borderRadius: 16, 
      padding: 18, 
      color: colors.text, 
      fontSize: 16,
    },
    inputFocused: {
      borderColor: colors.primary, // Odaklanınca renk değişimi
      backgroundColor: 'rgba(255,255,255,0.08)',
    },
    button: { 
      backgroundColor: colors.primary, 
      paddingVertical: 18, 
      borderRadius: 16, 
      alignItems: 'center', 
      marginTop: 24,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8, // Android gölgesi
    },
    buttonText: { 
      color: '#fff', // Primary üzerine genelde beyaz gider, colors.text koyuysa bunu değiştirebilirsin
      fontSize: 16, 
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    footer: { 
      flexDirection: 'row', 
      justifyContent: 'center', 
      marginTop: 40,
      alignItems: 'center',
    },
    footerText: { 
      color: colors.muted,
      fontSize: 15,
    },
    link: { 
      color: colors.primary, 
      fontWeight: '700',
      fontSize: 15,
      marginLeft: 4,
    }
});