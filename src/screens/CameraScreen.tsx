// Pantalla para sacar la foto de la tarea.
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { avisarRechazo } from '../permissions/permissions';
import { useBorradorStore } from '../store/borradorStore';
import { colors, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Camera'>;

export default function CameraScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [sacando, setSacando] = useState(false);
  const setPhoto = useBorradorStore((s) => s.setPhoto);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.lavenderText} />
      </View>
    );
  }

  // Pendiente o denegado: explicamos, pedimos y ofrecemos la galeria como alternativa
  if (!permission.granted) {
    const pedir = async () => {
      const r = await requestPermission();
      if (!r.granted) avisarRechazo('la cámara', 'sacarle una foto a la tarea', r.canAskAgain);
    };
    return (
      <View style={styles.center}>
        <Text style={styles.msg}>Para sacar la foto necesitamos acceso a la cámara.</Text>
        <PrimaryButton title="Permitir cámara" onPress={pedir} />
        <PrimaryButton title="Mejor elijo de la galería" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const sacarFoto = async () => {
    if (sacando) return; // evita dos fotos por doble toque
    setSacando(true);
    try {
      const foto = await cameraRef.current?.takePictureAsync({ quality: 0.6 });
      if (foto?.uri) {
        setPhoto(foto.uri); // queda en el borrador…
        navigation.goBack(); // …y el formulario ya la muestra
      }
    } catch (e) {
      console.warn('[Camara] No se pudo sacar la foto:', e);
    } finally {
      setSacando(false);
    }
  };

  return (
    <View style={styles.screen}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
      <SafeAreaView edges={['bottom']} style={styles.bar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.barText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shutter} onPress={sacarFoto} disabled={sacando}>
          <View style={[styles.shutterInner, sacando && styles.shutterBusy]} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}>
          <Text style={styles.barText}>Girar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.sm, backgroundColor: colors.bg },
  msg: { fontSize: 16, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.bg,
  },
  barText: { fontSize: 15, fontWeight: '600', color: colors.lavenderText },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.lavenderText },
  shutterBusy: { opacity: 0.4 },
});