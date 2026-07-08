import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import MedicoView from './MedicoView';
import { ESPECIALIDADES } from '../PortalPaciente/PortalPacienteContainer';

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

export default function MedicoContainer({ user }) {
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);
  const [establecimientos, setEstablecimientos] = useState([]);
  const [citas, setCitas] = useState([]);
  const [pacientesLista, setPacientesLista] = useState([]);
  const [pacientesMap, setPacientesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingPacientes, setLoadingPacientes] = useState(false);
  const [error, setError] = useState(null);
  const [mensajeAccion, setMensajeAccion] = useState(null);
  const [pacienteEditando, setPacienteEditando] = useState(null);
  const [pacienteCompleto, setPacienteCompleto] = useState(null);
  const [citaActual, setCitaActual] = useState(null);
  const [formEdicion, setFormEdicion] = useState({});
  const [guardando, setGuardando] = useState(false);

  // Formulario de primera vez (completar ficha propia del médico)
  const [formPerfil, setFormPerfil] = useState({ rut: '', nombre: '', especialidad: '', establecimientoId: '' });
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState(null);

  // Al entrar, busca si esta cuenta ya tiene una ficha de médico creada.
  // Si no la tiene, se le pide completar sus datos una sola vez; a partir
  // de ahí queda disponible automáticamente para que los pacientes lo agenden.
  useEffect(() => {
    const cargar = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const [propio, estabs] = await Promise.all([
          apiFetch(`/api/citas/medicos/email/${user.email}`, token).catch(() => null),
          apiFetch('/api/establecimientos', token).catch(() => []),
        ]);
        setEstablecimientos(estabs || []);
        if (propio) setMedicoSeleccionado(propio);
      } catch {
        setError('Error al cargar tu ficha de médico.');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [user]);

  useEffect(() => {
    if (!medicoSeleccionado) return;
    const cargar = async () => {
      setLoadingPacientes(true);
      try {
        const token = await auth.currentUser.getIdToken();
        const [c, p] = await Promise.all([
          apiFetch(`/api/citas/medico/${medicoSeleccionado.id}`, token).catch(() => []),
          apiFetch(`/api/listas/especialidad/${medicoSeleccionado.especialidad}`, token).catch(() => []),
        ]);
        setCitas(c);
        setPacientesLista(p);

        const todosIds = [...new Set([
          ...p.map(item => item.pacienteId),
          ...c.map(item => item.pacienteId)
        ])];

        const datosPacientes = await Promise.all(
          todosIds.map(id => apiFetch(`/api/listas/pacientes/${id}`, token).catch(() => null))
        );

        const mapa = {};
        todosIds.forEach((id, index) => {
          if (datosPacientes[index]) mapa[id] = datosPacientes[index];
        });
        setPacientesMap(mapa);

      } catch {
        setError('Error al cargar pacientes.');
      } finally {
        setLoadingPacientes(false);
      }
    };
    cargar();
  }, [medicoSeleccionado]);

  const guardarPerfilMedico = async () => {
    if (!formPerfil.rut.trim() || !formPerfil.nombre.trim() || !formPerfil.especialidad || !formPerfil.establecimientoId) {
      setErrorPerfil('Completa todos los campos.');
      return;
    }
    setGuardandoPerfil(true);
    setErrorPerfil(null);
    try {
      const token = await auth.currentUser.getIdToken();
      const nuevoMedico = await apiFetch('/api/citas/medicos', token, 'POST', {
        rut: formPerfil.rut.trim(),
        nombre: formPerfil.nombre.trim(),
        especialidad: formPerfil.especialidad,
        establecimientoId: parseInt(formPerfil.establecimientoId),
        email: user.email,
      });
      setMedicoSeleccionado(nuevoMedico);
    } catch {
      setErrorPerfil('No fue posible guardar tu ficha. Verifica los datos e intenta de nuevo.');
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const editarPaciente = (cita) => {
    const pac = pacientesMap[cita.pacienteId] || {
      id: cita.pacienteId,
      nombre: 'Paciente',
      apellido: `#${cita.pacienteId}`,
      rut: '—',
      email: '',
      telefono: '',
      fechaNacimiento: '—'
    };

    const listaItem = pacientesLista.find(p => p.id === cita.listaEsperaId)
      || pacientesLista.find(p => p.pacienteId === cita.pacienteId)
      || { id: null, prioridad: '—', estado: 'ESPERA', diagnostico: '' };

    setCitaActual(cita);
    setPacienteCompleto(pac);
    setPacienteEditando(listaItem);
    setFormEdicion({
      email: pac.email || '',
      telefono: pac.telefono || '',
      diagnostico: listaItem.diagnostico || '',
      estado: listaItem.estado || 'ESPERA',
      estadoCita: cita.estado || 'PROGRAMADA'
    });
  };

  const guardarCambios = async () => {
    setGuardando(true);
    setMensajeAccion(null);
    try {
      const token = await auth.currentUser.getIdToken();

      await apiFetch(`/api/listas/pacientes/${pacienteCompleto.id}`, token, 'PUT', {
        ...pacienteCompleto,
        email: formEdicion.email,
        telefono: formEdicion.telefono,
      });

      if (pacienteEditando.id) {
        await apiFetch(
          `/api/listas/${pacienteEditando.id}/estado?estado=${formEdicion.estado}&diagnostico=${encodeURIComponent(formEdicion.diagnostico)}`,
          token, 'PUT', null
        );
      }

      if (citaActual?.id) {
        await apiFetch(`/api/citas/${citaActual.id}`, token, 'PUT', {
          cita: {
            ...citaActual,
            estado: formEdicion.estadoCita
          },
          medicoId: citaActual.medico?.id
        });
      }

      setMensajeAccion({ tipo: 'exito', texto: 'Datos actualizados correctamente.' });
      setPacienteEditando(null);
      setPacienteCompleto(null);
      setCitaActual(null);

      const token2 = await auth.currentUser.getIdToken();
      const [nuevasCitas, nuevosP] = await Promise.all([
        apiFetch(`/api/citas/medico/${medicoSeleccionado.id}`, token2).catch(() => []),
        apiFetch(`/api/listas/especialidad/${medicoSeleccionado.especialidad}`, token2).catch(() => []),
      ]);
      setCitas(nuevasCitas);
      setPacientesLista(nuevosP);

      const todosIds = [...new Set([
        ...nuevosP.map(item => item.pacienteId),
        ...nuevasCitas.map(item => item.pacienteId)
      ])];
      const datosPacientes = await Promise.all(
        todosIds.map(id => apiFetch(`/api/listas/pacientes/${id}`, token2).catch(() => null))
      );
      const mapa = {};
      todosIds.forEach((id, index) => {
        if (datosPacientes[index]) mapa[id] = datosPacientes[index];
      });
      setPacientesMap(mapa);

    } catch {
      setMensajeAccion({ tipo: 'error', texto: 'Error al guardar cambios.' });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <MedicoView
      medicoSeleccionado={medicoSeleccionado}
      establecimientos={establecimientos}
      especialidades={ESPECIALIDADES}
      formPerfil={formPerfil}
      guardandoPerfil={guardandoPerfil}
      errorPerfil={errorPerfil}
      citas={citas}
      pacientesLista={pacientesLista}
      pacientesMap={pacientesMap}
      loading={loading}
      loadingPacientes={loadingPacientes}
      error={error}
      mensajeAccion={mensajeAccion}
      pacienteEditando={pacienteEditando}
      pacienteCompleto={pacienteCompleto}
      formEdicion={formEdicion}
      guardando={guardando}
      onFormPerfilChange={(field, value) => setFormPerfil({ ...formPerfil, [field]: value })}
      onGuardarPerfil={guardarPerfilMedico}
      onEditarPaciente={editarPaciente}
      onCancelarEdicion={() => { setPacienteEditando(null); setPacienteCompleto(null); setCitaActual(null); }}
      onFormEdicionChange={(field, value) => setFormEdicion({ ...formEdicion, [field]: value })}
      onGuardarCambios={guardarCambios}
    />
  );
}