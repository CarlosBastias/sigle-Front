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
  const [metricas, setMetricas] = useState(null);
  const [establecimientos, setEstablecimientos] = useState([]);
  const [listas, setListas] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rutBusqueda, setRutBusqueda] = useState('');
  const [pacienteBuscado, setPacienteBuscado] = useState(null);
  const [buscando, setBuscando] = useState(false);

  // Estado formulario agregar paciente
  const [mostrarFormPaciente, setMostrarFormPaciente] = useState(false);
  const [mensajePaciente, setMensajePaciente] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [formPaciente, setFormPaciente] = useState({
    nombre: '', apellido: '', rut: '', email: '', telefono: '',
    fechaNacimiento: '', establecimientoId: '',
    especialidad: '', diagnostico: '', perteneceGes: false
  });

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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [user?.token]);

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

  const handleRutChange = (e) => {
    const soloValido = e.target.value.replace(/[^0-9kK-]/g, '');
    setRutBusqueda(soloValido);
  };

  const registrarPaciente = async () => {
    if (!formPaciente.nombre || !formPaciente.rut || !formPaciente.especialidad || !formPaciente.diagnostico) return;
    setGuardando(true);
    setMensajePaciente(null);
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
      setMensajePaciente({ tipo: 'exito', texto: 'Paciente registrado en lista de espera correctamente.' });
      setFormPaciente({ nombre: '', apellido: '', rut: '', email: '', telefono: '', fechaNacimiento: '', establecimientoId: '', especialidad: '', diagnostico: '', perteneceGes: false });
      setMostrarFormPaciente(false);
      const nuevasListas = await apiFetch('/api/listas', token);
      setListas(nuevasListas);
    } catch {
      setMensajePaciente({ tipo: 'error', texto: 'Error al registrar el paciente.' });
    } finally {
      setGuardando(false);
    }
  };

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
      onBuscarPaciente={buscarPaciente}
      onRutChange={handleRutChange}
      onRegistrarPaciente={registrarPaciente}
      onToggleForm={() => { setMostrarFormPaciente(!mostrarFormPaciente); setMensajePaciente(null); }}
      onFormChange={(field, value) => setFormPaciente({...formPaciente, [field]: value})}
    />
  );
}
