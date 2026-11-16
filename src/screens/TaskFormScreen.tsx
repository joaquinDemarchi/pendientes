
// Alta y edición de tareas
// Si llega una tarea por parametro se edita sino alta.

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View,Switch  } from 'react-native';
import { Field } from '../components/Field';
import { PrimaryButton } from '../components/PrimaryButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../theme';
import { RootStackParamList } from '../types';
import { REMINDER_OPTIONS } from '../utils/tasks';
import { validaTituloTarea } from '../utils/validators';
import { useBorradorStore } from '../store/borradorStore';
import { TaskInput, useTasksStore } from '../store/tasksStore';
import * as ImagePicker from 'expo-image-picker';
import { Polaroid } from '../components/Polaroid';
import { pedirPermiso } from '../permissions/permissions';
import { Etiqueta } from '../components/Etiqueta';
import { abrirEnMapa, formatearCoords, obtenerUbicacion, textoUbicacion } from '../location/location';
import { agendarTarea } from '../calendar/calendar';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskForm'>;

export default function TaskFormScreen({ navigation, route }: Props) {
  const tareaEditandose = route.params?.task; 
  const addTask = useTasksStore((s) => s.addTask);
  const updateTask = useTasksStore((s) => s.updateTask);
  const deleteTask = useTasksStore((s) => s.deleteTask);

  const photoUri = useBorradorStore((s) => s.photoUri);
  const location = useBorradorStore((s) => s.location);
  const contact = useBorradorStore((s) => s.contact);
  const iniciarBorrador = useBorradorStore((s) => s.iniciar);
  // Alto de la barra de navegación de Android (o la del iPhone) para no tapar el botón
  const insets = useSafeAreaInsets();
  
  const setPhoto = useBorradorStore((s) => s.setPhoto);

  const setLocation = useBorradorStore((s) => s.setLocation);
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const setContact = useBorradorStore((s) => s.setContact);

  const setCalendarEvent = useTasksStore((s) => s.setCalendarEvent);
  const [agendar, setAgendar] = useState(false);
  const yaAgendada = !!tareaEditandose?.calendarEventId;

  const [title, setTitle] = useState(tareaEditandose?.title ?? '');
  const [reminder, setReminder] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  
  useEffect(() => {
    iniciarBorrador(tareaEditandose);
  }, [tareaEditandose, iniciarBorrador]);

  const handleSave = async () => {
    const validacion = validaTituloTarea(title);
    if (validacion) {
      setError(validacion);
      return;
    }
    setSaving(true);
    const data: TaskInput = { title, reminderSeconds: reminder, photoUri, location, contact };
    const guardada = tareaEditandose
    ? await updateTask(tareaEditandose.id, data)
    : await addTask(data);

    if (agendar && guardada) {
    const eventId = await agendarTarea(guardada);
    if (eventId) await setCalendarEvent(guardada.id, eventId);
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

  const elegirDeGaleria = async () => {
  if (!(await pedirPermiso('galeria'))) return;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true, // deja recortar
    aspect: [1, 1],      // cuadrada, como la polaroid
    quality: 0.6,
  });
  // "Siempre verificar result.canceled antes de acceder a result.assets" (U9)
  if (!result.canceled) setPhoto(result.assets[0].uri);
  }

  const usarMiUbicacion = async () => {
  setBuscandoUbicacion(true);
  const loc = await obtenerUbicacion();
  setBuscandoUbicacion(false);
  if (loc) setLocation(loc);
};

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + spacing.xl }]} keyboardShouldPersistTaps="handled">
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

      <Text style={[styles.label, styles.section]}>Foto</Text>
      {photoUri && (
        <View style={styles.photoBox}>
          <Polaroid uri={photoUri} size={170} />
          <TouchableOpacity onPress={() => setPhoto(null)}>
            <Text style={styles.quitar}>Quitar</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.chips}>
        <TouchableOpacity style={styles.chip} onPress={() => navigation.navigate('Camera')}>
          <Text style={styles.chipText}>Sacar foto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chip} onPress={elegirDeGaleria}>
          <Text style={styles.chipText}>Elegir de la galería</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, styles.section]}>Lugar</Text>
{location && (
  <View style={styles.adjunto}>
    <Etiqueta texto={textoUbicacion(location)} detalle={formatearCoords(location)} color="sky">
      <View style={styles.etiquetaAcciones}>
        <TouchableOpacity onPress={() => abrirEnMapa(location)}>
          <Text style={styles.verMapa}>Ver en mapa</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setLocation(null)}>
          <Text style={styles.quitar}>Quitar</Text>
        </TouchableOpacity>
      </View>
    </Etiqueta>
  </View>
)}
<View style={styles.chips}>
  <TouchableOpacity style={styles.chip} onPress={usarMiUbicacion} disabled={buscandoUbicacion}>
    <Text style={styles.chipText}>
      {buscandoUbicacion ? 'Buscando…' : location ? 'Actualizar ubicación' : 'Usar mi ubicación actual'}
    </Text>
  </TouchableOpacity>
</View>

<Text style={[styles.label, styles.section]}>Responsable</Text>
{contact && (
  <View style={styles.adjunto}>
    <Etiqueta texto={contact.name} detalle={contact.phone ?? 'Sin teléfono'} color="lavender" inclinacion={-1}>
      <View style={styles.etiquetaAcciones}>
        <TouchableOpacity onPress={() => setContact(null)}>
          <Text style={styles.quitar}>Quitar</Text>
        </TouchableOpacity>
      </View>
    </Etiqueta>
  </View>
)}
<View style={styles.chips}>
  <TouchableOpacity style={styles.chip} onPress={() => navigation.navigate('ContactPicker')}>
    <Text style={styles.chipText}>{contact ? 'Cambiar responsable' : 'Elegir de mis contactos'}</Text>
  </TouchableOpacity>
</View>

    <Text style={[styles.label, styles.section]}>Calendario</Text>
{yaAgendada ? (
  <Text style={styles.hint}>Esta tarea ya está en tu calendario.</Text>
) : (
  <>
    <View style={styles.switchRow}>
      <Text style={styles.switchText}>Agendar en el calendario</Text>
      <Switch
        value={agendar}
        onValueChange={setAgendar}
        trackColor={{ false: colors.border, true: colors.lavender }}
        thumbColor={agendar ? colors.lavenderText : colors.surface}
      />
    </View>
    {agendar && (
      <Text style={styles.hint}>
        {reminder > 0
          ? 'Se agenda a la hora del aviso, por 30 minutos.'
          : 'Se agenda dentro de 1 hora, por 30 minutos.'}
      </Text>
    )}
  </>
)}

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
  section: { marginTop: spacing.lg },
  photoBox: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md, marginBottom: spacing.md, paddingLeft: spacing.xs },
  quitar: { fontSize: 13, fontWeight: '600', color: colors.roseText },
  adjunto: { marginBottom: spacing.md },
  etiquetaAcciones: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  verMapa: { fontSize: 13, fontWeight: '600', color: colors.skyText, textDecorationLine: 'underline' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchText: { fontSize: 15, color: colors.text },
});