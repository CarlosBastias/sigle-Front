import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import PortalPacienteView from './PortalPacienteView';

const API = 'https://sigle-apigateway.onrender.com';

async function apiFetch(path, token, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${API}${path}`, options);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

function generarHorarios() {
  const horarios = [];
  for (let h = 8; h < 18; h++) {
    horarios.push(`${String(h).padStart(2, '0')}:00`);
    horarios.push(`${String(h).padStart(2, '0')}:30`);
  }
  return horarios;
}

export const ESPECIALIDADES = [
  'Cardiología', 'Traumatología', 'Oftalmología', 'Neurología',
  'Dermatología', 'Gastroenterología', 'Endocrinología', 'Reumatología',
  'Neumología', 'Urología'
];

export const TODOS_HORARIOS = generarHorarios();

export default function PortalPacienteContainer({ user }) {
  const [listas, setListas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [medicos, setMedicos] = useState([]);
  const [mensajeCita, setMensajeCita] = useState(null);

  // Estado formulario nueva solicitud
  const [mostrarFormNuevo, setMostrarFormNuevo] = useState(false);
  const [especialidadNueva, setEspecialidadNueva] = useState('');
  const [diagnosticoNuevo, setDiagnosticoNuevo] = useState('');
  const [medicoIdNuevo, setMedicoIdNuevo] = useState('');
  const [fechaNueva, setFechaNueva] = useState('');
  const [horaNueva, setHoraNueva] = useState('');
  const [horasOcupadasNuevo, setHorasOcupadasNuevo] = useState([]);
  const [agendandoNuevo, setAgendandoNuevo] = useState(false);

  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const pac = await apiFetch(`/api/listas/pacientes/email/${user.email}`, token).catch(() => null);
        setPaciente(pac);

        const [l, c, n, med] = await Promise.all([
          apiFetch(`/api/listas/paciente/email/${user.email}`, token).catch(() => []),
          pac ? apiFetch(`/api/citas/paciente/${pac.id}`, token).catch(() => []) : Promise.resolve([]),
          apiFetch(`/api/pacientes/notificaciones/paciente/${user.email}`, token).catch(() => []),
          apiFetch(`/api/citas/medicos`, token).catch(() => []),
        ]);
        setListas(l);
        setCitas(c);
        setNotificaciones(n);
        setMedicos(med);
      } catch (err) {
        setError('Error al cargar datos del paciente.');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [user]);

  useEffect(() => {
    if (!medicoIdNuevo || !fechaNueva) { setHorasOcupadasNuevo([]); setHoraNueva(''); return; }
    const cargar = async () => {
      const token = await auth.currentUser.getIdToken();
      const ocupadas = await apiFetch(`/api/citas/medico/${medicoIdNuevo}/horas-ocupadas?fecha=${fechaNueva}`, token).catch(() => []);
      setHorasOcupadasNuevo(ocupadas);
      setHoraNueva('');
    };
    cargar();
  }, [medicoIdNuevo, fechaNueva]);

  const nuevaSolicitud = async () => {
    if (!especialidadNueva || !diagnosticoNuevo || !medicoIdNuevo || !fechaNueva || !horaNueva) return;
    setAgendandoNuevo(true);
    setMensajeCita(null);
    try {
      const token = await auth.currentUser.getIdToken();
      const nuevaLista = await apiFetch('/api/listas/registrar', token, 'POST', {
        paciente: {
          id: paciente.id,
          rut: paciente.rut,
          nombre: paciente.nombre,
          apellido: paciente.apellido,
          email: paciente.email,
          telefono: paciente.telefono,
          fechaNacimiento: paciente.fechaNacimiento,
          establecimientoId: paciente.establecimientoId
        },
        especialidad: especialidadNueva,
        diagnostico: diagnosticoNuevo,
        perteneceGes: false
      });

      await apiFetch('/api/citas/agendar', token, 'POST', {
        cita: {
          pacienteId: paciente.id,
          listaEsperaId: nuevaLista.id,
          especialidad: especialidadNueva,
          fechaHora: `${fechaNueva}T${horaNueva}:00`
        },
        medicoId: parseInt(medicoIdNuevo)
      });

      const [nuevasListas, nuevasCitas] = await Promise.all([
        apiFetch(`/api/listas/paciente/email/${user.email}`, token).catch(() => []),
        apiFetch(`/api/citas/paciente/${paciente.id}`, token).catch(() => [])
      ]);
      setListas(nuevasListas);
      setCitas(nuevasCitas);
      setMensajeCita({ tipo: 'exito', texto: 'Derivación y cita creadas correctamente.' });
      setMostrarFormNuevo(false);
      setEspecialidadNueva(''); setDiagnosticoNuevo(''); setMedicoIdNuevo(''); setFechaNueva(''); setHoraNueva('');
    } catch {
      setMensajeCita({ tipo: 'error', texto: 'Error al crear la solicitud.' });
    } finally {
      setAgendandoNuevo(false);
    }
  };

  const cancelarCita = async (citaId) => {
    if (!window.confirm('¿Estás seguro que deseas cancelar esta cita?')) return;
    setCancelando(true);
    try {
      const token = await auth.currentUser.getIdToken();
      await apiFetch(`/api/citas/${citaId}/cancelar`, token, 'POST', {
        motivo: 'Cancelado por el paciente',
        canceladoPor: 'PACIENTE'
      });
      const token2 = await auth.currentUser.getIdToken();
      const nuevasCitas = await apiFetch(`/api/citas/paciente/${paciente.id}`, token2).catch(() => []);
      setCitas(nuevasCitas);
    } catch {
      alert('Error al cancelar la cita.');
    } finally {
      setCancelando(false);
    }
  };

  return (
    <PortalPacienteView
      listas={listas}
      citas={citas}
      notificaciones={notificaciones}
      loading={loading}
      error={error}
      mensajeCita={mensajeCita}
      medicos={medicos}
      mostrarFormNuevo={mostrarFormNuevo}
      especialidadNueva={especialidadNueva}
      diagnosticoNuevo={diagnosticoNuevo}
      medicoIdNuevo={medicoIdNuevo}
      fechaNueva={fechaNueva}
      horaNueva={horaNueva}
      horasOcupadasNuevo={horasOcupadasNuevo}
      agendandoNuevo={agendandoNuevo}
      cancelando={cancelando}
      onToggleFormNuevo={() => { setMostrarFormNuevo(!mostrarFormNuevo); setMensajeCita(null); }}
      onEspecialidadChange={(v) => { setEspecialidadNueva(v); setMedicoIdNuevo(''); setFechaNueva(''); setHoraNueva(''); }}
      onDiagnosticoChange={(v) => setDiagnosticoNuevo(v)}
      onMedicoNuevoChange={(v) => { setMedicoIdNuevo(v); setFechaNueva(''); setHoraNueva(''); }}
      onFechaNuevaChange={(v) => { setFechaNueva(v); setHoraNueva(''); }}
      onHoraNuevaChange={(v) => setHoraNueva(v)}
      onNuevaSolicitud={nuevaSolicitud}
      onCancelarCita={cancelarCita}
    />
  );
}