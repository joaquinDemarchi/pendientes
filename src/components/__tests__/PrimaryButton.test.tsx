import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { PrimaryButton } from '../PrimaryButton';

describe('PrimaryButton', () => {
  it('muestra el texto que recibe por props', () => {
    render(<PrimaryButton title="Agregar tarea" onPress={jest.fn()} />);
    expect(screen.getByText('Agregar tarea')).toBeTruthy();
  });

  it('ejecuta onPress al tocarlo', () => {
    const onPress = jest.fn();
    render(<PrimaryButton title="Guardar" onPress={onPress} testID="btn" />);
    fireEvent.press(screen.getByTestId('btn'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('NO ejecuta onPress si está deshabilitado', () => {
    const onPress = jest.fn();
    render(<PrimaryButton title="Guardar" onPress={onPress} disabled testID="btn" />);
    fireEvent.press(screen.getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
  });
});