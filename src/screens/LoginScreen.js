import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useAuth } from '../context/AuthProvider';
import colors from '../theme/colors'; 

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
    
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      let msg = "Giriş başarısız.";
      if(error.code === 'auth/invalid-email') msg = "Geçersiz e-posta formatı.";
      if(error.code === 'auth/user-not-found') msg = "Kullanıcı bulunamadı.";
      if(error.code === 'auth/wrong-password') msg = "Hatalı şifre.";
      Alert.alert("Hata", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Hoş Geldiniz</Text>
        <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>

        <TextInput
          style={styles.input}
          placeholder="E-posta"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Şifre"
          placeholderTextColor={colors.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.buttonText}>Giriş Yap</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Hesabın yok mu? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.link}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'rgba(95, 99, 125, 0.1)', // Card renginin biraz saydam hali
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.card,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    color: colors.text,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: colors.muted,
  },
  link: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});