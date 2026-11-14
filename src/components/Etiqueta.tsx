// Etiqueta tipo post-it para el lugar y el responsable de una tarea
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

const PALETA = {
  sky: { fondo: colors.sky, texto: colors.skyText },            
  lavender: { fondo: colors.lavender, texto: colors.lavenderText }, 
};

interface Props {
  texto: string;
  detalle?: string;                 
  color?: keyof typeof PALETA;      
  inclinacion?: number;
  chica?: boolean;                  // versión compacta para la lista
  children?: React.ReactNode;       // acciones
}

export function Etiqueta({ texto, detalle, color = 'sky', inclinacion = 1, chica = false, children }: Props) {
  const p = PALETA[color];
  return (
    <View
      style={[
        styles.postit,
        chica && styles.postitChica,
        { backgroundColor: p.fondo, transform: [{ rotate: `${inclinacion}deg` }] },
      ]}
    >
      <Text style={[styles.texto, chica && styles.textoChico, { color: p.texto }]} numberOfLines={chica ? 1 : 2}>
        {texto}
      </Text>
      {detalle && !chica ? <Text style={[styles.detalle, { color: p.texto }]}>{detalle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  postit: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 3, 
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  postitChica: { paddingHorizontal: 8, paddingVertical: 3 },
  texto: { fontSize: 14, fontWeight: '600' },
  textoChico: { fontSize: 12 },
  detalle: { fontSize: 12, marginTop: 2, opacity: 0.8 },
});