
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Field } from '../components/Field';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { colors, spacing } from '../theme';
import { RootStackParamList } from '../types';
import { validateCredentials } from '../utils/validators';

// Tipo de las props que le pasa el Stack a esta pantalla
type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const handleLogin = async () => {
    const validation = validateCredentials(username, password);
    if (validation.length > 0) {
      setErrors(validation);
      return;
    }
    const error = await login(username, password);
    setErrors(error ? [error] : []);
    // Si no hubo error, AuthContext cambia "user" 
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.brand}>Pendientes</Text>
        <Text style={styles.subtitle}>Ingresá para ver tus tareas.</Text>

        <Field label="Usuario" value={username} onChangeText={setUsername} testID="username-input" />
        <Field
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          testID="password-input"
        />

        {errors.map((e) => (
          <Text key={e} style={styles.error}>
            {e}
          </Text>
        ))}

        <View style={styles.gap} />
        <PrimaryButton title="Ingresar" onPress={handleLogin} testID="login-button" />

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.link}>
          <Text style={styles.linkText}>
            ¿No tenés cuenta? <Text style={styles.linkStrong}>Registrate</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  brand: { fontSize: 36, fontWeight: '700', color: colors.text, letterSpacing: -1 },
  subtitle: { fontSize: 16, color: colors.textSoft, marginTop: spacing.xs, marginBottom: spacing.xl },
  error: { color: colors.roseText, fontSize: 14, marginBottom: spacing.xs },
  gap: { height: spacing.sm },
  link: { marginTop: spacing.lg, alignItems: 'center' },
  linkText: { color: colors.textSoft, fontSize: 15 },
  linkStrong: { color: colors.lavenderText, fontWeight: '700' },
});