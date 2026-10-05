


import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { TaskCard } from '../components/TaskCard';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { colors, spacing } from '../theme';
import { RootStackParamList, Task } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const { tasks, loading, reload, toggleTask, deleteTask } = useTasks();

  // Cada vez que volvemos a esta pantalla recargamos la lista desde AsyncStorage.
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  // Confirmación antes de borrar 
  const ConfElim = (id: string) => {
    Alert.alert('Eliminar tarea', '¿Seguro que querés eliminarla?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteTask(id) },
    ]);
  };

  const irAEditar = (task: Task) => navigation.navigate('TaskForm', { task });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.lavenderText} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Hola, {user}</Text>
          <Text style={styles.title}>Pendientes</Text>
        </View>
        <Button title="Salir" color={colors.lavenderText} onPress={logout} />
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard task={item} onToggle={toggleTask} onEdit={irAEditar} onDelete={ConfElim} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nada por hacer</Text>
            <Text style={styles.emptyText}>Agregá tu primera tarea con el botón de abajo.</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <PrimaryButton
          title="+  Nueva tarea"
          onPress={() => navigation.navigate('TaskForm', {})}
          testID="new-task-button"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  hello: { fontSize: 14, color: colors.textSoft },
  title: { fontSize: 32, fontWeight: '700', color: colors.text, letterSpacing: -1 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  emptyText: { fontSize: 14, color: colors.textSoft, marginTop: spacing.xs, textAlign: 'center' },
  footer: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
});