import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DashboardView from './DashboardView';

const defaultProps = {
    metricas: { totalListasEspera: 2 },
    establecimientos: [{ id: 1, nombre: 'Hospital Central', region: 'RM', tipo: 'Hospital' }],
    listas: [{ id: 1, especialidad: 'Cardiología', diagnostico: 'Dolor pecho', prioridad: 'ALTA', estado: 'ESPERA', perteneceGes: true }],
    medicos: [{ id: 1, nombre: 'Dr. Pérez' }],
    loading: false,
    error: null,
    rutBusqueda: '',
    pacienteBuscado: null,
    buscando: false,
    mostrarFormPaciente: false,
    mensajePaciente: null,
    guardando: false,
    formPaciente: {
        nombre: '', apellido: '', rut: '', email: '', telefono: '',
        fechaNacimiento: '', establecimientoId: '', especialidad: '', diagnostico: '', perteneceGes: false
    },
    editandoPaciente: false,
    formEdicion: {},
    estadosEditando: {},
    erroresForm: {},
    erroresEdicion: {},
    onBuscarPaciente: vi.fn(),
    onRutChange: vi.fn(),
    onRegistrarPaciente: vi.fn(),
    onToggleForm: vi.fn(),
    onFormChange: vi.fn(),
    onEditarClick: vi.fn(),
    onCancelarEdicion: vi.fn(),
    onFormEdicionChange: vi.fn(),
    onActualizarPaciente: vi.fn(),
    onEstadoLocalChange: vi.fn(),
    onGuardarEstado: vi.fn(),
};

describe('DashboardView Component', () => {
    it('muestra spinner cuando loading es true', () => {
        render(<DashboardView {...defaultProps} loading={true} />);
        expect(screen.getByText('Cargando datos operativos...')).toBeInTheDocument();
    });

    it('muestra mensaje de error cuando error existe', () => {
        render(<DashboardView {...defaultProps} error="Error al cargar" />);
        expect(screen.getByText('Error al cargar')).toBeInTheDocument();
    });

    it('renderiza métricas correctamente', () => {
        render(<DashboardView {...defaultProps} />);
        expect(screen.getByText('Listas de Espera')).toBeInTheDocument();
        expect(screen.getByText('Médicos en Red')).toBeInTheDocument();
        expect(screen.getByText('Establecimientos')).toBeInTheDocument();
    });

    it('permite buscar paciente por RUT', () => {
        render(<DashboardView {...defaultProps} />);
        const input = screen.getByPlaceholderText(/RUT del paciente/i);
        fireEvent.change(input, { target: { value: '12345678-9' } });
        expect(defaultProps.onRutChange).toHaveBeenCalled();
        const btn = screen.getByRole('button', { name: /Buscar/i });
        fireEvent.click(btn);
        expect(defaultProps.onBuscarPaciente).toHaveBeenCalled();
    });

    it('muestra lista de espera con registros', () => {
        render(<DashboardView {...defaultProps} />);
        expect(screen.getByText('Cardiología')).toBeInTheDocument();
        expect(screen.getByText('Dolor pecho')).toBeInTheDocument();
        expect(screen.getByText('ALTA')).toBeInTheDocument();
        expect(screen.getByText('✅')).toBeInTheDocument();
    });

    it('muestra establecimientos cuando se expande la sección', () => {
        render(<DashboardView {...defaultProps} />);
        const header = screen.getByText(/Establecimientos de la Red/i);
        fireEvent.click(header);
        expect(screen.getByText('Hospital Central')).toBeInTheDocument();
        expect(screen.getByText('RM')).toBeInTheDocument();
        expect(screen.getByText('Hospital')).toBeInTheDocument();
    });

    it('permite cambiar estado de una lista y guardar', () => {
        const props = {
        ...defaultProps,
        estadosEditando: { 1: 'AGENDADO' }
        };
        render(<DashboardView {...props} />);
        const guardarBtn = screen.getByRole('button', { name: /Guardar/i });
        fireEvent.click(guardarBtn);
        expect(props.onGuardarEstado).toHaveBeenCalledWith(1);
    });
});
