import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NavbarView from './NavbarView';

describe('NavbarView Component', () => {
    it('debería renderizar el logo de la marca correctamente', () => {
        render(<NavbarView user={null} onLogout={() => {}} />);
        
        expect(screen.getByText('SIGLE')).toBeInTheDocument();
        expect(screen.getByText('RedNorte')).toBeInTheDocument();
        expect(screen.getByText('✚')).toBeInTheDocument();
    });

    it('debería mostrar el nombre y rol del usuario si están presentes', () => {
        const mockUser = {
        name: 'Nicolás Valenzuela',
        role: 'Médico'
        };

        render(<NavbarView user={mockUser} onLogout={() => {}} />);

        expect(screen.getByText('Nicolás Valenzuela')).toBeInTheDocument();
        expect(screen.getByText('Médico')).toBeInTheDocument();
    });

    it('debería llamar a la función onLogout cuando se hace clic en Cerrar Sesión', () => {
        const mockOnLogout = vi.fn();
        render(<NavbarView user={null} onLogout={mockOnLogout} />);

        const logoutButton = screen.getByRole('button', { name: /Cerrar Sesión/i });
        fireEvent.click(logoutButton);

        expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });
});
