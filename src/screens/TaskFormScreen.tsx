
// Alta y edición de tareas
// Si llega una tarea por parametro se edita sino alta.

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Field } from '../components/Field';
import { PrimaryButton } from '../components/PrimaryButton';
import { useTasks } from '../hooks/useTasks';
import { colors, radius, spacing } from '../theme';
import { RootStackParamList } from '../types';
import { REMINDER_OPTIONS } from '../utils/tasks';
import { validaTituloTarea } from '../utils/validators';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskForm'>;

export default function TaskFormScreen({ navigation, route }: Props) {
  const tareaEditandose = route.params?.task; 
  const { addTask, updateTask, deleteTask } = useTasks();

  const [title, setTitle] = useState(tareaEditandose?.title ?? '');
  const [reminder, setReminder] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const validacion = validaTituloTarea(title);
    if (validacion) {
      setError(validacion);
      return;
    }
    setSaving(true);
    if (tareaEditandose) {
      await updateTask(tareaEditandose.id, title, reminder);
    } else {
      await addTask(title, reminder);
    }
    setSaving(false);
    navigation.goBack(); // volvemos a Home, que recarga la lista sola
  };

  const handleDelete = () => {
    if (!tareaEditandose) return;
    Alert.alert('Eliminar tarea', '¿Seguro que querés eliminarla?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteTask(tareaEditandose.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Field
        label="Título"
        value={title}
        onChangeText={(t) => {
          setTitle(t);
          setError(null);
        }}
        placeholder="¿Qué tenés que hacer?"
        autoCapitalize="sentences"
        autoFocus={!tareaEditandose}
        maxLength={80}
        testID="title-input"
      />
      {error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.label}>Recordatorio</Text>
      <View style={styles.chips}>
        {REMINDER_OPTIONS.map((opt) => {
          const selected = reminder === opt.seconds;
          return (
            <TouchableOpacity
              key={opt.label}
              onPress={() => setReminder(opt.seconds)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.hint}>
        {tareaEditandose
          ? 'Al guardar, el aviso anterior se reemplaza por el que elijas acá.'
          : 'Te llega una notificación cuando se cumple el tiempo.'}
      </Text>

      <View style={styles.buttons}>
        <PrimaryButton
          title={tareaEditandose ? 'Guardar cambios' : 'Agregar tarea'}
          onPress={handleSave}
          disabled={saving}
          testID="save-button"
        />
        {tareaEditandose && <PrimaryButton title="Eliminar tarea" variant="danger" onPress={handleDelete} />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg },
  error: { color: colors.roseText, fontSize: 14, marginTop: -spacing.sm, marginBottom: spacing.md },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSoft,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.peach, borderColor: colors.peach },
  chipText: { fontSize: 14, color: colors.textSoft },
  chipTextSelected: { color: colors.peachText, fontWeight: '600' },
  hint: { fontSize: 13, color: colors.textSoft, marginTop: spacing.sm },
  buttons: { marginTop: spacing.xl, gap: spacing.sm },
});