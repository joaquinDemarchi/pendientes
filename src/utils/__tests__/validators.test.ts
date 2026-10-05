// Tests de lógica de negocio: validación de credenciales.

import { validateCredentials } from '../validators';

describe('validateCredentials', () => {
  it('devuelve un array vacío con datos válidos', () => {
    expect(validateCredentials('lio', 'clave123')).toEqual([]);
  });

  it('rechaza contraseñas de menos de 6 caracteres', () => {
    expect(validateCredentials('lio', '123')).toContain(
      'La contraseña debe tener al menos 6 caracteres'
    );
  });
});