// Botón reutilizable 

import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, radius, spacing } from '../theme';

type Variant = 'primary' | 'ghost' | 'danger';

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant; // opcional: si no se pasa, es 'primary'
  disabled?: boolean;
  testID?: string;
}

export function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  testID,
}: Props) {
  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.base, styles[variant], disabled && styles.disabled]}
    >
      <Text style={[styles.text, textStyles[variant]]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  primary: { backgroundColor: colors.lavender },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.rose },
  disabled: { opacity: 0.5 },
  text: { fontSize: 16, fontWeight: '600' },
  primaryText: { color: colors.lavenderText },
  ghostText: { color: colors.textSoft },
  dangerText: { color: colors.roseText },
});

const textStyles = {
  primary: styles.primaryText,
  ghost: styles.ghostText,
  danger: styles.dangerText,
};