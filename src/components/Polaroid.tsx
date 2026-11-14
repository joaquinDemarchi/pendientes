// Foto con marco de polaroid
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

interface Props {
  uri: string;
  size?: number;        
  inclinacion?: number; 
}

export function Polaroid({ uri, size = 180, inclinacion = -3 }: Props) {
  const borde = Math.max(3, Math.round(size * 0.06)); //  marco crece confoto
  return (
    <View
      style={[
        styles.marco,
        { padding: borde, paddingBottom: borde * 3, transform: [{ rotate: `${inclinacion}deg` }] },
      ]}
    >
      <Image source={{ uri }} style={{ width: size, height: size }} />
    </View>
  );
}

const styles = StyleSheet.create({
  marco: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
});