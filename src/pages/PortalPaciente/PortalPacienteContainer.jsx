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

export default function PortalPacienteContainer({ user }) {
  const [listas, setListas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarFormCita, setMostrarFormCita] = useState(false);
  const [listaSeleccionada, setListaSeleccionada] = useState(null);
  const [medicos, setMedicos] = useState([]);
  const [medicoId, setMedicoId] = useState('');
  const [fechaHora, setFechaHora] = useState('');
  const [agendando, setAgendando] = useState(false);
  const [mensajeCita, setMensajeCita] = useState(null);

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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [user]);

  const solicitarCita = async () => {
    if (!medicoId || !fechaHora || !listaSeleccionada) return;
    setAgendando(true);
    setMensajeCita(null);
    try {
      const token = await auth.currentUser.getIdToken();
      await apiFetch('/api/citas/agendar', token, 'POST', {
        cita: {
          pacienteId: paciente.id,
          listaEsperaId: listaSeleccionada.id,
          especialidad: listaSeleccionada.especialidad,
          fechaHora
        },
        medicoId: parseInt(medicoId)
      });
      setMensajeCita({ tipo: 'exito', texto: 'Cita agendada correctamente.' });
      setMostrarFormCita(false);
      const token2 = await auth.currentUser.getIdToken();
      const nuevasCitas = await apiFetch(`/api/citas/paciente/${paciente.id}`, token2).catch(() => []);
      setCitas(nuevasCitas);
    } catch {
      setMensajeCita({ tipo: 'error', texto: 'Error al agendar la cita.' });
    } finally {
      setAgendando(false);
    }
  };

  const cancelarCita = async (citaId) => {
    if (!window.confirm('¿Estás seguro que deseas cancelar esta cita?')) return;
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
      mostrarFormCita={mostrarFormCita}
      listaSeleccionada={listaSeleccionada}
      medicos={medicos}
      medicoId={medicoId}
      fechaHora={fechaHora}
      agendando={agendando}
      onSolicitarCita={solicitarCita}
      onCancelarCita={cancelarCita}
      onSeleccionarLista={(item) => { setListaSeleccionada(item); setMostrarFormCita(true); setMensajeCita(null); }}
      onCerrarFormCita={() => setMostrarFormCita(false)}
      onMedicoChange={(e) => setMedicoId(e.target.value)}
      onFechaHoraChange={(e) => setFechaHora(e.target.value)}
    />
  );
}
