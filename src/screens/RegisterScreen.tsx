
// Registro con usuario y contraseña

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { Field } from '../components/Field';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { colors, spacing } from '../theme';
import { RootStackParamList } from '../types';
import { validateRegister } from '../utils/validators';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const handleRegister = async () => {
    const validation = validateRegister(username, password, confirm);
    if (validation.length > 0) {
      setErrors(validation);
      return;
    }
    const error = await register(username, password);
    if (error) setErrors([error]);
    
  };

  return (
    <KeyboardAvoidingView
      style={styles.safe}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Tus tareas quedan guardadas en este teléfono.</Text>

        <Field label="Usuario" value={username} onChangeText={setUsername} placeholder="ej: lio" />
        <Field
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Mínimo 6 caracteres"
        />
        <Field label="Repetir contraseña" value={confirm} onChangeText={setConfirm} secureTextEntry />

        {errors.map((e) => (
          <Text key={e} style={styles.error}>
            {e}
          </Text>
        ))}

        <PrimaryButton title="Registrarme" onPress={handleRegister} />
        <PrimaryButton title="Ya tengo cuenta" variant="ghost" onPress={() => navigation.goBack()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingTop: spacing.md },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: colors.textSoft, marginTop: spacing.xs, marginBottom: spacing.lg },
  error: { color: colors.roseText, fontSize: 14, marginBottom: spacing.sm },
});