import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginView from './LoginView';

describe('LoginView Component', () => {
    const defaultProps = {
        modo: 'login',
        email: '',
        password: '',
        confirmPassword: '',
        error: null,
        loading: false,
        onSubmit: vi.fn(),
        onCambiarModo: vi.fn(),
        onEmailChange: vi.fn(),
        onPasswordChange: vi.fn(),
        onConfirmPasswordChange: vi.fn(),
    };

    it('debería renderizar la cabecera y el formulario en modo login por defecto', () => {
        render(<LoginView {...defaultProps} />);
        
        expect(screen.getByText('Ingreso a Plataforma')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Acceder a mi Portal/i })).toBeInTheDocument();
        expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(1);
    });

    it('debería renderizar campos adicionales en modo registro', () => {
        render(<LoginView {...defaultProps} modo="registro" />);
        
        expect(screen.getByText('Crear Cuenta')).toBeInTheDocument();
        expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2);
        expect(screen.getByRole('button', { name: /Crear mi Cuenta/i })).toBeInTheDocument();
    });

    it('debería renderizar el banner de error cuando está presente', () => {
        render(<LoginView {...defaultProps} error="Credenciales inválidas" />);
        
        expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
    });

    it('debería deshabilitar el botón de envío y mostrar "Procesando..." cuando está cargando', () => {
        render(<LoginView {...defaultProps} loading={true} />);
        
        const submitButton = screen.getByRole('button', { name: /Procesando.../i });
        expect(submitButton).toBeDisabled();
    });

    it('debería llamar a los controladores correspondientes cuando el usuario interactúa', () => {
        const onEmailChangeMock = vi.fn();
        const onPasswordChangeMock = vi.fn();
        const onSubmitMock = vi.fn((e) => e.preventDefault());

        render(
        <LoginView
            {...defaultProps}
            onEmailChange={onEmailChangeMock}
            onPasswordChange={onPasswordChangeMock}
            onSubmit={onSubmitMock}
        />
        );

        const emailInput = screen.getByPlaceholderText('usuario@ejemplo.cl');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        expect(onEmailChangeMock).toHaveBeenCalled();

        const passwordInput = screen.getByPlaceholderText('••••••••');
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        expect(onPasswordChangeMock).toHaveBeenCalled();

        const form = screen.getByPlaceholderText('usuario@ejemplo.cl').closest('form');
        fireEvent.submit(form);
        expect(onSubmitMock).toHaveBeenCalled();
    });
});
