import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import PortalPacienteView from './PortalPacienteView';

const API = import.meta.env.VITE_API_BASE_URL;

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
  if (res.status === 404) return null;
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

export default function PortalPacienteContainer({ user, onNotificaciones, onMarcarLeidas }) {
  const [listas, setListas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [medicos, setMedicos] = useState([]);
  const [mensajeCita, setMensajeCita] = useState(null);
  const [mostrarFormNuevo, setMostrarFormNuevo] = useState(false);
  const [especialidadNueva, setEspecialidadNueva] = useState('');
  const [diagnosticoNuevo, setDiagnosticoNuevo] = useState('');
  const [medicoIdNuevo, setMedicoIdNuevo] = useState('');
  const [fechaNueva, setFechaNueva] = useState('');
  const [horaNueva, setHoraNueva] = useState('');
  const [horasOcupadasNuevo, setHorasOcupadasNuevo] = useState([]);
  const [agendandoNuevo, setAgendandoNuevo] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [rutNuevo, setRutNuevo] = useState('');
  const [fechaNacimientoNuevo, setFechaNacimientoNuevo] = useState('');

  const refrescarNotificaciones = async (pacienteId) => {
    if (!pacienteId) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const n = await apiFetch(`/api/pacientes/notificaciones/paciente/${pacienteId}/no-leidas`, token).catch(() => []);
      setNotificaciones(n);
      if (onNotificaciones) onNotificaciones(n);
    } catch {
    }
  };

  const refrescarNotificacionesConReintento = async (pacienteId, intentos = 3, esperaMs = 1200) => {
    for (let i = 0; i < intentos; i++) {
      await new Promise((resolve) => setTimeout(resolve, esperaMs));
      await refrescarNotificaciones(pacienteId);
    }
  };

  useEffect(() => {
    const cargar = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const pac = await apiFetch(`/api/listas/pacientes/email/${user.email}`, token).catch(() => null);
        setPaciente(pac);

        const [l, c, n, med] = await Promise.all([
          apiFetch(`/api/listas/paciente/email/${user.email}`, token).catch(() => []),
          pac ? apiFetch(`/api/citas/paciente/${pac.id}`, token).catch(() => []) : Promise.resolve([]),
          // Cambiado a /no-leidas
          pac ? apiFetch(`/api/pacientes/notificaciones/paciente/${pac.id}/no-leidas`, token).catch(() => []) : Promise.resolve([]),
          apiFetch(`/api/citas/medicos`, token).catch(() => []),
        ]);
        setListas(l);
        setCitas(c);
        setNotificaciones(n);
        setMedicos(med);

        if (onNotificaciones) onNotificaciones(n);

        // Pasar función marcarLeidas al App.jsx
        if (onMarcarLeidas && pac) {
          onMarcarLeidas(async () => {
            const t = await auth.currentUser.getIdToken();
            await apiFetch(`/api/pacientes/notificaciones/paciente/${pac.id}/marcar-leidas`, t, 'PUT').catch(() => {});
            setNotificaciones([]);
            if (onNotificaciones) onNotificaciones([]);
          });
        }

      } catch (err) {
        setError('Error al cargar datos del paciente.');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [user]);

  useEffect(() => {
    if (!paciente) return;
    const intervalo = setInterval(() => {
      refrescarNotificaciones(paciente.id);
    }, 20000);
    return () => clearInterval(intervalo);
  }, [paciente]);

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
    if (!paciente && (!rutNuevo || !fechaNacimientoNuevo)) return;
    setAgendandoNuevo(true);
    setMensajeCita(null);
    try {
      const token = await auth.currentUser.getIdToken();

      const datosPaciente = paciente ? {
        id: paciente.id,
        rut: paciente.rut,
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        email: paciente.email,
        telefono: paciente.telefono,
        fechaNacimiento: paciente.fechaNacimiento,
        establecimientoId: paciente.establecimientoId
      } : {
        rut: rutNuevo,
        nombre: user.email.split('@')[0],
        apellido: '',
        email: user.email,
        telefono: '',
        fechaNacimiento: fechaNacimientoNuevo,
        establecimientoId: 1
      };

      const nuevaLista = await apiFetch('/api/listas/registrar', token, 'POST', {
        paciente: datosPaciente,
        especialidad: especialidadNueva,
        diagnostico: diagnosticoNuevo,
        perteneceGes: false
      });

      await apiFetch('/api/citas/agendar', token, 'POST', {
        cita: {
          pacienteId: nuevaLista.paciente?.id || paciente?.id,
          listaEsperaId: nuevaLista.id,
          especialidad: especialidadNueva,
          fechaHora: `${fechaNueva}T${horaNueva}:00`
        },
        medicoId: parseInt(medicoIdNuevo)
      });

      const pacActualizado = await apiFetch(`/api/listas/pacientes/email/${user.email}`, token).catch(() => null);
      setPaciente(pacActualizado);

      const [nuevasListas, nuevasCitas] = await Promise.all([
        apiFetch(`/api/listas/paciente/email/${user.email}`, token).catch(() => []),
        pacActualizado ? apiFetch(`/api/citas/paciente/${pacActualizado.id}`, token).catch(() => []) : Promise.resolve([])
      ]);
      setListas(nuevasListas);
      setCitas(nuevasCitas);
      setMensajeCita({ tipo: 'exito', texto: 'Derivación y cita creadas correctamente.' });
      setMostrarFormNuevo(false);
      setEspecialidadNueva(''); setDiagnosticoNuevo(''); setMedicoIdNuevo(''); setFechaNueva(''); setHoraNueva('');
      setRutNuevo(''); setFechaNacimientoNuevo('');

      if (pacActualizado) refrescarNotificacionesConReintento(pacActualizado.id);
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

      
      refrescarNotificacionesConReintento(paciente.id);
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
      pacienteExiste={!!paciente}
      mostrarFormNuevo={mostrarFormNuevo}
      especialidadNueva={especialidadNueva}
      diagnosticoNuevo={diagnosticoNuevo}
      medicoIdNuevo={medicoIdNuevo}
      fechaNueva={fechaNueva}
      horaNueva={horaNueva}
      horasOcupadasNuevo={horasOcupadasNuevo}
      agendandoNuevo={agendandoNuevo}
      cancelando={cancelando}
      rutNuevo={rutNuevo}
      fechaNacimientoNuevo={fechaNacimientoNuevo}
      onToggleFormNuevo={() => { setMostrarFormNuevo(!mostrarFormNuevo); setMensajeCita(null); }}
      onEspecialidadChange={(v) => { setEspecialidadNueva(v); setMedicoIdNuevo(''); setFechaNueva(''); setHoraNueva(''); }}
      onDiagnosticoChange={(v) => setDiagnosticoNuevo(v)}
      onMedicoNuevoChange={(v) => { setMedicoIdNuevo(v); setFechaNueva(''); setHoraNueva(''); }}
      onFechaNuevaChange={(v) => { setFechaNueva(v); setHoraNueva(''); }}
      onHoraNuevaChange={(v) => setHoraNueva(v)}
      onNuevaSolicitud={nuevaSolicitud}
      onCancelarCita={cancelarCita}
      onRutNuevoChange={(v) => setRutNuevo(v)}
      onFechaNacimientoNuevoChange={(v) => setFechaNacimientoNuevo(v)}
    />
  );
}