import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import DashboardView from './DashboardView';

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
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export default function DashboardContainer({ user }) {
  // --- 1. ESTADOS (HOOKS) SIEMPRE ARRIBA ---
  const [metricas, setMetricas] = useState(null);
  const [establecimientos, setEstablecimientos] = useState([]);
  const [listas, setListas] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rutBusqueda, setRutBusqueda] = useState('');
  const [pacienteBuscado, setPacienteBuscado] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [mostrarFormPaciente, setMostrarFormPaciente] = useState(false);
  const [mensajePaciente, setMensajePaciente] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [editandoPaciente, setEditandoPaciente] = useState(false);
  const [formEdicion, setFormEdicion] = useState(null);
  const [estadosEditando, setEstadosEditando] = useState({});
  const [formPaciente, setFormPaciente] = useState({
    nombre: '', apellido: '', rut: '', email: '', telefono: '',
    fechaNacimiento: '', establecimientoId: '',
    especialidad: '', diagnostico: '', perteneceGes: false
  });

  // --- 2. EFECTOS ---
  useEffect(() => {
    if (!user?.token) return;
    const cargar = async () => {
      try {
        const [m, e, l, med] = await Promise.all([
          apiFetch('/api/dashboard/metricas', user.token),
          apiFetch('/api/establecimientos', user.token),
          apiFetch('/api/listas', user.token),
          apiFetch('/api/citas/medicos', user.token),
        ]);
        setMetricas(m);
        setEstablecimientos(e);
        setListas(l);
        setMedicos(med);
      } catch (err) {
        setError('Error al cargar datos. Verifica que los servicios estén activos.');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [user?.token]);

  // --- 3. FUNCIONES DE LÓGICA ---
  const buscarPaciente = async () => {
    if (!rutBusqueda.trim()) return;
    setBuscando(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const p = await apiFetch(`/api/listas/pacientes/rut/${rutBusqueda.trim()}`, token);
      setPacienteBuscado(p);
    } catch {
      setPacienteBuscado({ error: 'Paciente no encontrado.' });
    } finally {
      setBuscando(false);
    }
  };

  const handleRutChange = (e) => {
    setRutBusqueda(e.target.value.replace(/[^0-9kK-]/g, ''));
  };

  const registrarPaciente = async () => {
    if (!formPaciente.nombre || !formPaciente.rut) return;
    setGuardando(true);
    try {
      const token = await auth.currentUser.getIdToken();
      await apiFetch('/api/listas/registrar', token, 'POST', {
        paciente: { ...formPaciente, establecimientoId: parseInt(formPaciente.establecimientoId) },
        especialidad: formPaciente.especialidad,
        diagnostico: formPaciente.diagnostico,
        perteneceGes: formPaciente.perteneceGes
      });
      setMensajePaciente({ tipo: 'exito', texto: 'Registrado correctamente.' });
      setMostrarFormPaciente(false);
      const nuevasListas = await apiFetch('/api/listas', token);
      setListas(nuevasListas);
    } catch {
      setMensajePaciente({ tipo: 'error', texto: 'Error al registrar.' });
    } finally {
      setGuardando(false);
    }
  };

  const eliminarPaciente = async (id) => {
    if (!window.confirm('¿Eliminar paciente?')) return;
    setGuardando(true);
    try {
      const token = await auth.currentUser.getIdToken();
      await apiFetch(`/api/listas/pacientes/${id}`, token, 'DELETE');
      setPacienteBuscado(null);
      const nuevasListas = await apiFetch('/api/listas', token);
      setListas(nuevasListas);
    } catch {
      setMensajePaciente({ tipo: 'error', texto: 'Error al eliminar.' });
    } finally {
      setGuardando(false);
    }
  };

  const actualizarPaciente = async () => {
    setGuardando(true);
    try {
      const token = await auth.currentUser.getIdToken();
      await apiFetch(`/api/listas/pacientes/${formEdicion.id}`, token, 'PUT', formEdicion);
      setPacienteBuscado(formEdicion);
      setEditandoPaciente(false);
    } catch {
      setMensajePaciente({ tipo: 'error', texto: 'Error al actualizar.' });
    } finally {
      setGuardando(false);
    }
  }; // <--- AQUÍ FALTABA ESTA LLAVE

  const actualizarEstadoLista = async (id) => {
    const nuevoEstado = estadosEditando[id];
    if (!nuevoEstado) return;
    setGuardando(true);
    try {
      const token = await auth.currentUser.getIdToken();
      await apiFetch(`/api/listas/${id}/estado`, token, 'PUT', { estado: nuevoEstado });
      const nuevosEstados = { ...estadosEditando };
      delete nuevosEstados[id];
      setEstadosEditando(nuevosEstados);
      const nuevasListas = await apiFetch('/api/listas', token);
      setListas(nuevasListas);
    } catch {
      setMensajePaciente({ tipo: 'error', texto: 'Error al actualizar estado.' });
    } finally {
      setGuardando(false);
    }
  };

  // --- 4. RENDER ---
  return (
    <DashboardView
      metricas={metricas}
      establecimientos={establecimientos}
      listas={listas}
      medicos={medicos}
      loading={loading}
      error={error}
      rutBusqueda={rutBusqueda}
      pacienteBuscado={pacienteBuscado}
      buscando={buscando}
      mostrarFormPaciente={mostrarFormPaciente}
      mensajePaciente={mensajePaciente}
      guardando={guardando}
      formPaciente={formPaciente}
      editandoPaciente={editandoPaciente}
      formEdicion={formEdicion}
      estadosEditando={estadosEditando}
      onBuscarPaciente={buscarPaciente}
      onRutChange={handleRutChange}
      onRegistrarPaciente={registrarPaciente}
      onToggleForm={() => { setMostrarFormPaciente(!mostrarFormPaciente); setMensajePaciente(null); }}
      onFormChange={(field, value) => setFormPaciente({...formPaciente, [field]: value})}
      onEditarClick={() => { setFormEdicion(pacienteBuscado); setEditandoPaciente(true); }}
      onCancelarEdicion={() => setEditandoPaciente(false)}
      onFormEdicionChange={(field, value) => setFormEdicion({...formEdicion, [field]: value})}
      onActualizarPaciente={actualizarPaciente}
      onEliminarPaciente={() => eliminarPaciente(pacienteBuscado.id)}
      onEstadoLocalChange={(id, valor) => setEstadosEditando({...estadosEditando, [id]: valor})}
      onGuardarEstado={actualizarEstadoLista}
    />
  );
}
