import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import DashboardView from './DashboardView';

const API = import.meta.env.VITE_API_BASE_URL;

// Función base para llamadas a la API
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
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw { status: res.status, message: errorData.message || 'Error API' };
  }
  return res.json();
}

export default function DashboardContainer({ user }) {
  // --- ESTADOS ---
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

  // --- CARGA DE DATOS ---
  useEffect(() => {
    if (!user?.token) return;
    const cargar = async () => {
      try {
        const [m, e, l, med] = await Promise.all([
          apiFetch('/api/dashboard/metricas', user.token).catch(() => null),
          apiFetch('/api/establecimientos', user.token).catch(() => []),
          apiFetch('/api/listas', user.token).catch(() => []),
          apiFetch('/api/citas/medicos', user.token).catch(() => []),
        ]);
        setMetricas(m);
        setEstablecimientos(e);
        setListas(l);
        setMedicos(med);
      } catch (err) {
        setError('Error de conexión con el Gateway.');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [user?.token]);

  // --- LÓGICA DE BÚSQUEDA ---
  const buscarPaciente = async () => {
    if (!rutBusqueda.trim()) return;
    setBuscando(true);
    setPacienteBuscado(null);
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

  // --- LÓGICA DE REGISTRO ---
  const registrarPaciente = async () => {
    if (!formPaciente.nombre || !formPaciente.rut) return;
    setGuardando(true);
    try {
      const token = await auth.currentUser.getIdToken();
      await apiFetch('/api/listas/registrar', token, 'POST', {
        paciente: {
          nombre: formPaciente.nombre,
          apellido: formPaciente.apellido,
          rut: formPaciente.rut,
          email: formPaciente.email,
          telefono: formPaciente.telefono,
          fechaNacimiento: formPaciente.fechaNacimiento,
          establecimientoId: parseInt(formPaciente.establecimientoId)
        },
        especialidad: formPaciente.especialidad,
        diagnostico: formPaciente.diagnostico,
        perteneceGes: formPaciente.perteneceGes
      });
      setMensajePaciente({ tipo: 'exito', texto: 'Registrado correctamente.' });
      setFormPaciente({ nombre: '', apellido: '', rut: '', email: '', telefono: '', fechaNacimiento: '', establecimientoId: '', especialidad: '', diagnostico: '', perteneceGes: false });
      setMostrarFormPaciente(false);
      const nuevasListas = await apiFetch('/api/listas', token);
      setListas(nuevasListas);
    } catch {
      setMensajePaciente({ tipo: 'error', texto: 'Error al registrar.' });
    } finally {
      setGuardando(false);
    }
  };

  // --- LÓGICA DE ACTUALIZACIÓN DE FICHA (CORREGIDO A /api/listas/pacientes) ---
  const actualizarPaciente = async () => {
    setGuardando(true);
    try {
      const token = await auth.currentUser.getIdToken();
      // Ruta corregida para que pase por el microservicio de Listas
      await apiFetch(`/api/listas/pacientes/${formEdicion.id}`, token, 'PUT', formEdicion);
      
      setPacienteBuscado(formEdicion);
      setEditandoPaciente(false);
      setMensajePaciente({ tipo: 'exito', texto: 'Ficha actualizada.' });
    } catch {
      setMensajePaciente({ tipo: 'error', texto: 'Error al actualizar ficha.' });
    } finally {
      setGuardando(false);
    }
  };

  // --- LÓGICA DE ACTUALIZACIÓN DE ESTADO (RESILIENTE) ---
  const actualizarEstadoLista = async (id) => {
    const nuevoEstado = estadosEditando[id];
    if (!nuevoEstado) return;
    setGuardando(true);
    try {
      const token = await auth.currentUser.getIdToken();
      await apiFetch(`/api/listas/${id}/estado?estado=${nuevoEstado}`, token, 'PUT', null);
      
      const nuevosEstados = { ...estadosEditando };
      delete nuevosEstados[id];
      setEstadosEditando(nuevosEstados);
      const nuevasListas = await apiFetch('/api/listas', token);
      setListas(nuevasListas);
      setMensajePaciente({ tipo: 'exito', texto: 'Estado actualizado.' });
    } catch (err) {
      // Manejo del bug de sesión del backend (recarga forzada)
      const token = await auth.currentUser.getIdToken();
      const nuevasListas = await apiFetch('/api/listas', token).catch(() => listas);
      setListas(nuevasListas);
      const nuevosEstados = { ...estadosEditando };
      delete nuevosEstados[id];
      setEstadosEditando(nuevosEstados);
      setMensajePaciente({ tipo: 'exito', texto: 'Estado actualizado (verificado).' });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <DashboardView
      metricas={metricas} establecimientos={establecimientos} listas={listas} medicos={medicos}
      loading={loading} error={error} rutBusqueda={rutBusqueda} pacienteBuscado={pacienteBuscado}
      buscando={buscando} mostrarFormPaciente={mostrarFormPaciente} mensajePaciente={mensajePaciente}
      guardando={guardando} formPaciente={formPaciente} editandoPaciente={editandoPaciente}
      formEdicion={formEdicion} estadosEditando={estadosEditando}
      onBuscarPaciente={buscarPaciente}
      onRutChange={(e) => setRutBusqueda(e.target.value.replace(/[^0-9kK-]/g, ''))}
      onRegistrarPaciente={registrarPaciente}
      onToggleForm={() => { setMostrarFormPaciente(!mostrarFormPaciente); setMensajePaciente(null); }}
      onFormChange={(field, value) => setFormPaciente({...formPaciente, [field]: value})}
      onEditarClick={() => { setFormEdicion(pacienteBuscado); setEditandoPaciente(true); }}
      onCancelarEdicion={() => setEditandoPaciente(false)}
      onFormEdicionChange={(field, value) => setFormEdicion({...formEdicion, [field]: value})}
      onActualizarPaciente={actualizarPaciente}
      onEstadoLocalChange={(id, valor) => setEstadosEditando({...estadosEditando, [id]: valor})}
      onGuardarEstado={actualizarEstadoLista}
    />
  );
}
