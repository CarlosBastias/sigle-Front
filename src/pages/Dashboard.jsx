import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';

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

export default function Dashboard({ user }) {
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
      // Recargar listas
      const nuevasListas = await apiFetch('/api/listas', token);
      setListas(nuevasListas);
    } catch (err) {
      setMensajePaciente({ tipo: 'error', texto: 'Error al registrar el paciente.' });
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '3rem', color: 'var(--color-primary)' }}>✚</div>
      <p style={{ color: 'var(--text-gray)', fontWeight: 600 }}>Cargando datos operativos...</p>
    </div>
  );

  if (error) return (
    <div className="container" style={{ paddingTop: '3rem' }}>
      <div style={{ backgroundColor: 'var(--status-high-bg)', color: 'var(--status-high-text)', padding: '1.5rem', borderRadius: '8px', fontWeight: 600 }}>
        {error}
      </div>
    </div>
  );

  return (
    <div className="animate-entrance">
      <div className="container" style={{ paddingTop: '3rem' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--text-dark)', marginBottom: '0.2rem' }}>Centro Operativo Provincial</h1>
            <p style={{ color: 'var(--text-gray)' }}>Visión global y cuadro de mando integral de la red asistencial.</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setMostrarFormPaciente(!mostrarFormPaciente); setMensajePaciente(null); }}>
            {mostrarFormPaciente ? 'Cancelar' : '+ Registrar Paciente'}
          </button>
        </div>

        {mensajePaciente && (
          <div style={{ backgroundColor: mensajePaciente.tipo === 'exito' ? 'var(--status-low-bg)' : 'var(--status-high-bg)', color: mensajePaciente.tipo === 'exito' ? 'var(--status-low-text)' : 'var(--status-high-text)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontWeight: 600 }}>
            {mensajePaciente.texto}
          </div>
        )}

        {/* Formulario registrar paciente */}
        {mostrarFormPaciente && (
          <div className="premium-card" style={{ marginBottom: '3rem', borderLeft: '4px solid var(--color-primary)' }}>
            <div className="card-header">
              <h3 style={{ margin: 0 }}>Registrar Paciente en Lista de Espera</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label className="input-label">Nombre</label>
                <input type="text" className="input-control" value={formPaciente.nombre} onChange={e => setFormPaciente({...formPaciente, nombre: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Apellido</label>
                <input type="text" className="input-control" value={formPaciente.apellido} onChange={e => setFormPaciente({...formPaciente, apellido: e.target.value})} />
              </div>
              <div>
                <label className="input-label">RUT</label>
                <input type="text" className="input-control" placeholder="12345678-9" value={formPaciente.rut} onChange={e => setFormPaciente({...formPaciente, rut: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Email</label>
                <input type="email" className="input-control" value={formPaciente.email} onChange={e => setFormPaciente({...formPaciente, email: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Teléfono</label>
                <input type="text" className="input-control" value={formPaciente.telefono} onChange={e => setFormPaciente({...formPaciente, telefono: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Fecha de Nacimiento</label>
                <input type="date" className="input-control" value={formPaciente.fechaNacimiento} onChange={e => setFormPaciente({...formPaciente, fechaNacimiento: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Establecimiento</label>
                <select className="input-control" value={formPaciente.establecimientoId} onChange={e => setFormPaciente({...formPaciente, establecimientoId: e.target.value})}>
                  <option value="">Selecciona un establecimiento</option>
                  {establecimientos.map(e => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Especialidad</label>
                <input type="text" className="input-control" placeholder="Ej. Cardiología" value={formPaciente.especialidad} onChange={e => setFormPaciente({...formPaciente, especialidad: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Diagnóstico</label>
                <input type="text" className="input-control" value={formPaciente.diagnostico} onChange={e => setFormPaciente({...formPaciente, diagnostico: e.target.value})} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                <input type="checkbox" id="ges" checked={formPaciente.perteneceGes} onChange={e => setFormPaciente({...formPaciente, perteneceGes: e.target.checked})} />
                <label htmlFor="ges" className="input-label" style={{ margin: 0 }}>Pertenece a GES</label>
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ marginTop: '1.5rem', minWidth: '200px' }}
              onClick={registrarPaciente}
              disabled={guardando}
            >
              {guardando ? 'Registrando...' : 'Registrar en Lista de Espera'}
            </button>
          </div>
        )}

        {/* Métricas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="metric-box">
            <div className="metric-title">Listas de Espera Activas</div>
            <div className="metric-number">{metricas?.totalListasEspera ?? listas.length}</div>
          </div>
          <div className="metric-box" style={{ borderLeftColor: 'var(--status-low-text)' }}>
            <div className="metric-title">Médicos Registrados</div>
            <div className="metric-number">{metricas?.totalMedicos ?? medicos.length}</div>
          </div>
          <div className="metric-box" style={{ borderLeftColor: 'var(--status-high-text)' }}>
            <div className="metric-title">Establecimientos Activos</div>
            <div className="metric-number">{metricas?.totalEstablecimientos ?? establecimientos.length}</div>
          </div>
        </div>

        {/* Buscador de paciente */}
        <div className="premium-card" style={{ marginBottom: '3rem' }}>
          <div className="card-header">
            <h3 style={{ margin: 0 }}>Triaje y Gestión de Paciente</h3>
            <span className="status-badge badge-baja">Buscador Activo</span>
          </div>
          <div style={{ maxWidth: '600px' }}>
            <p style={{ color: 'var(--text-gray)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Ingrese el RUT del paciente para localizar su ficha en las listas de espera.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input
                type="text"
                className="input-control"
                placeholder="Ej. 18234567-8"
                style={{ flex: 1 }}
                value={rutBusqueda}
                onChange={handleRutChange}
                onKeyDown={e => e.key === 'Enter' && buscarPaciente()}
              />
              <button className="btn btn-primary" style={{ minWidth: '150px' }} onClick={buscarPaciente} disabled={buscando}>
                {buscando ? 'Buscando...' : 'Buscar Ficha'}
              </button>
            </div>
            {pacienteBuscado && (
              <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '8px', background: pacienteBuscado.error ? 'var(--status-high-bg)' : 'var(--status-low-bg)', color: pacienteBuscado.error ? 'var(--status-high-text)' : 'var(--text-dark)' }}>
                {pacienteBuscado.error
                  ? pacienteBuscado.error
                  : `${pacienteBuscado.nombre} ${pacienteBuscado.apellido} — RUT: ${pacienteBuscado.rut}`
                }
              </div>
            )}
          </div>
        </div>

        {/* Listas de espera */}
        <div className="premium-card" style={{ marginBottom: '3rem' }}>
          <div className="card-header">
            <h3 style={{ margin: 0 }}>Listas de Espera</h3>
            <span className="status-badge badge-media">{listas.length} registros</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  {['ID', 'Especialidad', 'Diagnóstico', 'Prioridad', 'Estado', 'GES'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listas.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>#{l.id}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{l.especialidad}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-gray)' }}>{l.diagnostico}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`status-badge badge-${l.prioridad?.toLowerCase()}`}>{l.prioridad}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>{l.estado}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{l.perteneceGes ? '✅' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Establecimientos */}
        <div className="premium-card">
          <div className="card-header">
            <h3 style={{ margin: 0 }}>Establecimientos de la Red</h3>
            <span className="status-badge badge-baja">{establecimientos.length} activos</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {establecimientos.map(e => (
              <div key={e.id} style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-subtle)' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem' }}>{e.nombre}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{e.region}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>{e.tipo}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}