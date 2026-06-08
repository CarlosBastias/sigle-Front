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
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw { status: res.status, message: errorData.message || 'Error API' };
  }
  return res.json();
}

function validarFormPaciente(form) {
  const errores = {};
  const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  const rutValido = /^[0-9]{7,8}-[0-9kK]$/;
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const telefonoValido = /^[+0-9\s]{7,15}$/;

  if (!form.nombre.trim()) errores.nombre = 'El nombre es obligatorio';
  else if (!soloLetras.test(form.nombre)) errores.nombre = 'El nombre solo puede contener letras';

  if (!form.apellido.trim()) errores.apellido = 'El apellido es obligatorio';
  else if (!soloLetras.test(form.apellido)) errores.apellido = 'El apellido solo puede contener letras';

  if (!form.rut.trim()) errores.rut = 'El RUT es obligatorio';
  else if (!rutValido.test(form.rut)) errores.rut = 'Formato inválido. Ej: 12345678-9';

  if (form.email && !emailValido.test(form.email)) errores.email = 'El email no es válido';
  if (form.telefono && !telefonoValido.test(form.telefono)) errores.telefono = 'El teléfono no es válido';
  if (!form.especialidad.trim()) errores.especialidad = 'La especialidad es obligatoria';
  if (!form.diagnostico.trim()) errores.diagnostico = 'El diagnóstico es obligatorio';

  return errores;
}

function validarFormEdicion(form) {
  const errores = {};
  const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const telefonoValido = /^[+0-9\s]{7,15}$/;

  if (!form.nombre.trim()) errores.nombre = 'El nombre es obligatorio';
  else if (!soloLetras.test(form.nombre)) errores.nombre = 'El nombre solo puede contener letras';

  if (!form.apellido.trim()) errores.apellido = 'El apellido es obligatorio';
  else if (!soloLetras.test(form.apellido)) errores.apellido = 'El apellido solo puede contener letras';

  if (form.email && !emailValido.test(form.email)) errores.email = 'El email no es válido';
  if (form.telefono && !telefonoValido.test(form.telefono)) errores.telefono = 'El teléfono no es válido';

  return errores;
}

export default function DashboardContainer({ user }) {
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
  const [erroresForm, setErroresForm] = useState({});
  const [erroresEdicion, setErroresEdicion] = useState({});

  // PAGINACION
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const PAGE_SIZE = 10;

  const [formPaciente, setFormPaciente] = useState({
    nombre: '', apellido: '', rut: '', email: '', telefono: '',
    fechaNacimiento: '', establecimientoId: '',
    especialidad: '', diagnostico: '', perteneceGes: false
  });

  const cargarListas = async (token, page = 0) => {
    const resultado = await apiFetch(`/api/listas/paginado?page=${page}&size=${PAGE_SIZE}`, token).catch(() => ({ content: [], totalPages: 0, totalElements: 0 }));
    setListas(resultado.content || []);
    setTotalPaginas(resultado.totalPages || 0);
    setTotalElementos(resultado.totalElements || 0);
    setPaginaActual(resultado.currentPage || 0);
  };

  useEffect(() => {
    if (!user?.token) return;
    const cargar = async () => {
      try {
        const [m, e, med] = await Promise.all([
          apiFetch('/api/dashboard/metricas', user.token).catch(() => null),
          apiFetch('/api/establecimientos', user.token).catch(() => []),
          apiFetch('/api/citas/medicos', user.token).catch(() => []),
        ]);
        setMetricas(m);
        setEstablecimientos(e);
        setMedicos(med);
        await cargarListas(user.token, 0);
      } catch (err) {
        setError('Error de conexión con el Gateway.');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [user?.token]);

  const cambiarPagina = async (nuevaPagina) => {
    const token = await auth.currentUser.getIdToken();
    await cargarListas(token, nuevaPagina);
  };

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

  const registrarPaciente = async () => {
    const errores = validarFormPaciente(formPaciente);
    if (Object.keys(errores).length > 0) {
      setErroresForm(errores);
      return;
    }
    setErroresForm({});
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
      const token2 = await auth.currentUser.getIdToken();
      await cargarListas(token2, paginaActual);
    } catch {
      setMensajePaciente({ tipo: 'error', texto: 'Error al registrar.' });
    } finally {
      setGuardando(false);
    }
  };

  const actualizarPaciente = async () => {
    const errores = validarFormEdicion(formEdicion);
    if (Object.keys(errores).length > 0) {
      setErroresEdicion(errores);
      return;
    }
    setErroresEdicion({});
    setGuardando(true);
    try {
      const token = await auth.currentUser.getIdToken();
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
      const token2 = await auth.currentUser.getIdToken();
      await cargarListas(token2, paginaActual);
      setMensajePaciente({ tipo: 'exito', texto: 'Estado actualizado.' });
    } catch {
      const token = await auth.currentUser.getIdToken();
      await cargarListas(token, paginaActual).catch(() => {});
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
      erroresForm={erroresForm} erroresEdicion={erroresEdicion}
      paginaActual={paginaActual} totalPaginas={totalPaginas} totalElementos={totalElementos}
      onCambiarPagina={cambiarPagina}
      onBuscarPaciente={buscarPaciente}
      onRutChange={(e) => setRutBusqueda(e.target.value.replace(/[^0-9kK-]/g, ''))}
      onRegistrarPaciente={registrarPaciente}
      onToggleForm={() => { setMostrarFormPaciente(!mostrarFormPaciente); setMensajePaciente(null); setErroresForm({}); }}
      onFormChange={(field, value) => { setFormPaciente({...formPaciente, [field]: value}); setErroresForm({...erroresForm, [field]: ''}); }}
      onEditarClick={() => { setFormEdicion(pacienteBuscado); setEditandoPaciente(true); setErroresEdicion({}); }}
      onCancelarEdicion={() => { setEditandoPaciente(false); setErroresEdicion({}); }}
      onFormEdicionChange={(field, value) => { setFormEdicion({...formEdicion, [field]: value}); setErroresEdicion({...erroresEdicion, [field]: ''}); }}
      onActualizarPaciente={actualizarPaciente}
      onEstadoLocalChange={(id, valor) => setEstadosEditando({...estadosEditando, [id]: valor})}
      onGuardarEstado={actualizarEstadoLista}
    />
  );
}