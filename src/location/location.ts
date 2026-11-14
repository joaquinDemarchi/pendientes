// Ubicacion actual del dispositivo + direccion aproximada + abrir en el mapa.
import * as Location from 'expo-location';
import { Alert, Linking } from 'react-native';
import { pedirPermiso } from '../permissions/permissions';
import { TaskLocation } from '../types';

// Devuelve la ubicacin, o null si no hay permiso o no se pudo obtener
export async function obtenerUbicacion(): Promise<TaskLocation | null> {
  if (!(await pedirPermiso('ubicacion'))) return null;

  try {
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced, 
    });
    const{ latitude, longitude } = pos.coords;

    let address: string | null = null;
    try{
      const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geo) address = armarDireccion(geo);
    } catch {
      address = null;
    }

    return { latitude, longitude, address };
  } catch(e) {
    console.warn('[Ubicación] No se pudo obtener:', e);
    Alert.alert('Sin ubicación', 'No pudimos obtener tu ubicación. Revisá que el GPS esté activado.');
    return null;
  }
}

function armarDireccion(geo: Location.LocationGeocodedAddress): string | null {
  const calle= [geo.street, geo.streetNumber].filter(Boolean).join(' ');
  const partes= [calle, geo.city ?? geo.subregion].filter(Boolean);
  return partes.length > 0 ? partes.join(', ') : null;
}

// Texto para mostrar. la dir si hay, si no coordenadas
export function textoUbicacion(loc: TaskLocation): string {
  return loc.address ?? formatearCoords(loc);
}

export function formatearCoords(loc: TaskLocation): string {
  return `${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)}`;
}

// Abre Maps c pin en la ubic
export function abrirEnMapa(loc: TaskLocation) {
  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`);
}