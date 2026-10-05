
// Lógica de negocio de las tareas

// Opciones de recordatorio
export const REMINDER_OPTIONS = [
  { label: 'Sin aviso', seconds: 0 },
  { label: '10 seg', seconds: 10 },
  { label: '1 min', seconds: 60 },
  { label: '5 min', seconds: 300 },
  { label: '1 hora', seconds: 3600 },
];

// Agrega un cero a la izquierda
function twoDigits(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

// Texto del recordatorio que se ve en cada tarjeta
export function formatReminder(remindAt: number, now: number = Date.now()): string {
  const date = new Date(remindAt);
  const hour = `${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}`;

  const today = new Date(now);
  const sameDay = date.toDateString() === today.toDateString();
  const when = sameDay
    ? hour
    : `${twoDigits(date.getDate())}/${twoDigits(date.getMonth() + 1)} ${hour}`;

  return remindAt <= now ? `Avisado ${when}` : `Aviso ${when}`;
}