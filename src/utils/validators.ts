// Funciones puras de validacion

export function validateCredentials(
  username: string,
  password: string
): string[] {
  const errors: string[] = [];

  if (!username.trim()) {
    errors.push('El usuario es requerido');
  } else if (username.trim().length < 3) {
    errors.push('El usuario debe tener al menos 3 caracteres');
  } else if (/\s/.test(username.trim())) {
    errors.push('El usuario no puede tener espacios');
  }

  if (!password) {
    errors.push('La contraseña es requerida');
  } else if (password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }

  return errors;
}

export function validateRegister(
  username: string,
  password: string,
  confirm: string
): string[] {
  const errors = validateCredentials(username, password);
  if (password && password !== confirm) {
    errors.push('Las contraseñas no coinciden');
  }
  return errors;
}


export function validaTituloTarea(title: string): string | null {
  const clean = title.trim();
  if (!clean) return 'Escribí un título para la tarea';
  if (clean.length > 80) return 'El título no puede superar los 80 caracteres';
  return null;
}