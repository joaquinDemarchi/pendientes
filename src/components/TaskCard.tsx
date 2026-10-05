
// Ítem de la lista de tareas 
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { Task } from '../types';
import { formatReminder } from '../utils/tasks';

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onToggle, onEdit, onDelete }: Props) {
  return (
    <View style={[styles.card, task.done && styles.cardDone]}>
      
      <TouchableOpacity
        testID={`toggle-${task.id}`}
        onPress={() => onToggle(task.id)}
        style={[styles.check, task.done && styles.checkDone]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {task.done && <Text style={styles.checkMark}>✓</Text>}
      </TouchableOpacity>

      <View style={styles.body}>
        <Text style={[styles.title, task.done && styles.titleDone]} numberOfLines={2}>
          {task.title}
        </Text>

        {task.remindAt !== null && !task.done && (
          <Text style={styles.reminder}>{formatReminder(task.remindAt)}</Text>
        )}

        <View style={styles.actions}>
          <TouchableOpacity testID={`edit-${task.id}`} onPress={() => onEdit(task)}>
            <Text style={[styles.action, styles.edit]}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity testID={`delete-${task.id}`} onPress={() => onDelete(task.id)}>
            <Text style={[styles.action, styles.remove]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm + 4,
    gap: 14,
  },
  cardDone: { backgroundColor: colors.sage, borderColor: colors.sage },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.lavenderText,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkDone: { backgroundColor: colors.sageText, borderColor: colors.sageText },
  checkMark: { color: colors.surface, fontSize: 14, fontWeight: '700' },
  body: { flex: 1 },
  title: { fontSize: 16, color: colors.text, lineHeight: 22 },
  titleDone: { color: colors.sageText, textDecorationLine: 'line-through' },
  reminder: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: colors.peach,
    color: colors.peachText,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: 10 },
  action: { fontSize: 13, fontWeight: '600' },
  edit: { color: colors.skyText },
  remove: { color: colors.roseText },
});