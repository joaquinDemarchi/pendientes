// Elegir un contacto de la agenda como responsable de la tarea
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Contact, ContactField, ContactsSortOrder } from 'expo-contacts';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Field } from '../components/Field';
import { PrimaryButton } from '../components/PrimaryButton';
import { pedirPermiso } from '../permissions/permissions';
import { useBorradorStore } from '../store/borradorStore';
import { colors, radius, spacing } from '../theme';
import { RootStackParamList, TaskContact } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ContactPicker'>;

export default function ContactPickerScreen({ navigation }: Props) {
  const [contactos, setContactos] = useState<TaskContact[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [sinPermiso, setSinPermiso] = useState(false);
  const setContact = useBorradorStore((s) => s.setContact);

  // Al abrir la pantallapid permiso p/ leer la agenda 
  useEffect(() => {
    const cargar = async () => {
      if (!(await pedirPermiso('contactos'))) {
        setSinPermiso(true);
        setCargando(false);
        return;
      }
      // API nueva de expo-contacts (SDK 57)
      const data = await Contact.getAllDetails([ContactField.FULL_NAME, ContactField.PHONES], {
        sortOrder: ContactsSortOrder.GivenName, 
      });
      // solo me quedocon lsque guarda la tarea
      const lista: TaskContact[] = data
        .filter((c) => c.fullName)
        .map((c) => ({
          id: c.id,
          name: c.fullName ?? 'Sin nombre',
          phone: c.phones?.[0]?.number ?? null,
        }));
      setContactos(lista);
      setCargando(false);
    };
    cargar();
  }, []);

  const elegir = (c: TaskContact) => {
    setContact(c);       
    navigation.goBack();
  };

 
  const texto = busqueda.trim().toLowerCase();
  const filtrados = contactos.filter((c) => c.name.toLowerCase().includes(texto));

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.lavenderText} />
      </View>
    );
  }

  if (sinPermiso) {
    return (
      <View style={styles.center}>
        <Text style={styles.msg}>Sin acceso a tus contactos no podemos mostrar la agenda.</Text>
        <PrimaryButton title="Volver" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.search}>
        <Field label="Buscar" value={busqueda} onChangeText={setBusqueda} placeholder="Nombre del contacto" />
      </View>
      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => elegir(item)}>
            <View style={styles.inicial}>
              <Text style={styles.inicialText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.name}>{item.name}</Text>
              {item.phone && <Text style={styles.phone}>{item.phone}</Text>}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {contactos.length === 0 ? 'Tu agenda está vacía.' : `Nadie se llama "${busqueda}".`}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.bg },
  msg: { fontSize: 16, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  search: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  inicial: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inicialText: { fontSize: 16, fontWeight: '700', color: colors.lavenderText },
  rowBody: { flex: 1 },
  name: { fontSize: 16, color: colors.text },
  phone: { fontSize: 13, color: colors.textSoft, marginTop: 2 },
  empty: { textAlign: 'center', color: colors.textSoft, marginTop: spacing.xl },
});