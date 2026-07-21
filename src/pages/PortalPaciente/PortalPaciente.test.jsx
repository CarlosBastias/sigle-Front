import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../firebase', () => ({
    auth: { currentUser: { getIdToken: vi.fn().mockResolvedValue('fake-token') } }
}));

vi.mock('./PortalPacienteContainer', () => ({
    ESPECIALIDADES: ['Cardiología', 'Traumatología', 'Neurología'],
    TODOS_HORARIOS: ['08:00', '08:30', '09:00'],
}));

import PortalPacienteView from './PortalPacienteView';

const defaultProps = {
    listas: [],
    citas: [],
    notificaciones: [],
    loading: false,
    error: null,
    mensajeCita: null,
    medicos: [],
    mostrarFormNuevo: false,
    especialidadNueva: '',
    diagnosticoNuevo: '',
    medicoIdNuevo: '',
    fechaNueva: '',
    horaNueva: '',
    horasOcupadasNuevo: [],
    agendandoNuevo: false,
    cancelando: false,
    pacienteExiste: true,
    rutNuevo: '',
    fechaNacimientoNuevo: '',
    onToggleFormNuevo: vi.fn(),
    onEspecialidadChange: vi.fn(),
    onDiagnosticoChange: vi.fn(),
    onMedicoNuevoChange: vi.fn(),
    onFechaNuevaChange: vi.fn(),
    onHoraNuevaChange: vi.fn(),
    onNuevaSolicitud: vi.fn(),
    onCancelarCita: vi.fn(),
    onRutNuevoChange: vi.fn(),
    onFechaNacimientoNuevoChange: vi.fn(),
    };

    describe('PortalPacienteView Component', () => {
    it('debería mostrar el spinner de carga cuando loading es true', () => {
        render(<PortalPacienteView {...defaultProps} loading={true} />);

        expect(screen.getByText('Cargando tu portal...')).toBeInTheDocument();
    });

    it('debería renderizar el título del portal cuando no está cargando', () => {
        render(<PortalPacienteView {...defaultProps} />);

        expect(screen.getByText('Mi Portal de Salud')).toBeInTheDocument();
    });

    it('debería mostrar el mensaje de error cuando existe', () => {
        render(<PortalPacienteView {...defaultProps} error="Error al cargar datos" />);

        expect(screen.getByText('Error al cargar datos')).toBeInTheDocument();
    });

    it('debería mostrar mensaje vacío cuando no hay derivaciones', () => {
        render(<PortalPacienteView {...defaultProps} listas={[]} />);

        expect(screen.getByText('No tienes derivaciones activas.')).toBeInTheDocument();
    });

    it('debería mostrar mensaje vacío cuando no hay citas', () => {
        render(<PortalPacienteView {...defaultProps} citas={[]} />);

        expect(screen.getByText('No tienes citas programadas.')).toBeInTheDocument();
    });

    it('debería llamar a onToggleFormNuevo cuando se hace clic en el botón de nueva solicitud', () => {
        const mockToggle = vi.fn();
        render(<PortalPacienteView {...defaultProps} onToggleFormNuevo={mockToggle} />);

        const btn = screen.getByRole('button', { name: /Nueva Solicitud de Cita/i });
        fireEvent.click(btn);

        expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    it('debería mostrar las derivaciones cuando existen', () => {
        const listas = [
        { id: 1, especialidad: 'Cardiología', diagnostico: 'Dolor pecho', estado: 'ACTIVA', prioridad: 'ALTA' }
        ];
        render(<PortalPacienteView {...defaultProps} listas={listas} />);

        expect(screen.getByText('Cardiología')).toBeInTheDocument();
        expect(screen.getByText('Dolor pecho')).toBeInTheDocument();
    });

    it('debería mostrar el mensaje de éxito cuando mensajeCita.tipo es exito', () => {
        render(<PortalPacienteView {...defaultProps} mensajeCita={{ tipo: 'exito', texto: 'Cita creada correctamente.' }} />);

        expect(screen.getByText('Cita creada correctamente.')).toBeInTheDocument();
    });
});
