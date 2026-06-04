import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import MedicoView from './MedicoView';

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
  const [medicos, setMedicos] = useState([]);
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);
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

  useEffect(() => {
    const cargar = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const med = await apiFetch('/api/citas/medicos', token).catch(() => []);
        setMedicos(med);
      } catch {
        setError('Error al cargar médicos.');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

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

  const seleccionarMedico = (medico) => {
    setMedicoSeleccionado(medico);
    setCitas([]);
    setPacientesLista([]);
    setPacientesMap({});
    setPacienteEditando(null);
    setPacienteCompleto(null);
    setCitaActual(null);
    setMensajeAccion(null);
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

    console.log('cita:', cita);
    console.log('listaItem encontrado:', listaItem);
    console.log('pacientesLista:', pacientesLista);

    setCitaActual(cita);
    setPacienteCompleto(pac);
    setPacienteEditando(listaItem);
    setFormEdicion({
      email: pac.email || '',
      telefono: pac.telefono || '',
      diagnostico: listaItem.diagnostico || '',
      estado: listaItem.estado || 'ESPERA'
    });
  };

  const guardarCambios = async () => {
    setGuardando(true);
    setMensajeAccion(null);
    try {
      const token = await auth.currentUser.getIdToken();

      console.log('pacienteCompleto:', pacienteCompleto);
      console.log('pacienteEditando:', pacienteEditando);
      console.log('formEdicion:', formEdicion);

      // Actualizar email y teléfono del paciente
      await apiFetch(`/api/listas/pacientes/${pacienteCompleto.id}`, token, 'PUT', {
        ...pacienteCompleto,
        email: formEdicion.email,
        telefono: formEdicion.telefono,
      });

      // Actualizar estado de la lista de espera
      if (pacienteEditando.id) {
        console.log('Actualizando estado lista:', pacienteEditando.id, formEdicion.estado);
        await apiFetch(`/api/listas/${pacienteEditando.id}/estado?estado=${formEdicion.estado}`, token, 'PUT', null);
      } else {
        console.log('pacienteEditando.id es null — no se actualiza estado');
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

    } catch (err) {
      console.error('Error en guardarCambios:', err);
      setMensajeAccion({ tipo: 'error', texto: 'Error al guardar cambios.' });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <MedicoView
      medicos={medicos}
      medicoSeleccionado={medicoSeleccionado}
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
      onSeleccionarMedico={seleccionarMedico}
      onEditarPaciente={editarPaciente}
      onCancelarEdicion={() => { setPacienteEditando(null); setPacienteCompleto(null); setCitaActual(null); }}
      onFormEdicionChange={(field, value) => setFormEdicion({ ...formEdicion, [field]: value })}
      onGuardarCambios={guardarCambios}
    />
  );
}