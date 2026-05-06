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

export default function PortalPaciente({ user }) {
  const [listas, setListas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado formulario solicitar cita
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
          fechaHora: fechaHora
        },
        medicoId: parseInt(medicoId)
      });
      setMensajeCita({ tipo: 'exito', texto: 'Cita agendada correctamente.' });
      setMostrarFormCita(false);
      // Recargar citas
      const token2 = await auth.currentUser.getIdToken();
      const nuevasCitas = await apiFetch(`/api/citas/paciente/${paciente.id}`, token2).catch(() => []);
      setCitas(nuevasCitas);
    } catch (err) {
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
    } catch (err) {
      alert('Error al cancelar la cita.');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '3rem', color: 'var(--color-primary)' }}>✚</div>
      <p style={{ color: 'var(--text-gray)', fontWeight: 600 }}>Cargando tu portal...</p>
    </div>
  );

  return (
    <div className="animate-entrance">
      <div className="container" style={{ paddingTop: '3rem' }}>

        <div className="hero-header" style={{ marginBottom: '2.5rem' }}>
          <h1 className="hero-title">Mi Portal de Salud</h1>
          <p className="hero-subtitle">Seguimiento de tus derivaciones, citas y notificaciones de la Red Asistencial.</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--status-high-bg)', color: 'var(--status-high-text)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        {mensajeCita && (
          <div style={{ backgroundColor: mensajeCita.tipo === 'exito' ? 'var(--status-low-bg)' : 'var(--status-high-bg)', color: mensajeCita.tipo === 'exito' ? 'var(--status-low-text)' : 'var(--status-high-text)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontWeight: 600 }}>
            {mensajeCita.texto}
          </div>
        )}

        {notificaciones.length > 0 && (
          <div className="premium-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--status-high-text)' }}>
            <div className="card-header">
              <h3 style={{ margin: 0 }}>🔔 Notificaciones</h3>
              <span className="status-badge badge-alta">{notificaciones.length}</span>
            </div>
            {notificaciones.map(n => (
              <div key={n.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                {n.mensaje || n.descripcion || JSON.stringify(n)}
              </div>
            ))}
          </div>
        )}

        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-dark)', fontSize: '1.5rem' }}>Mis Derivaciones Activas</h2>
        {listas.length === 0
          ? <div className="premium-card" style={{ color: 'var(--text-gray)', textAlign: 'center', padding: '2rem' }}>No tienes derivaciones activas.</div>
          : (
            <div className="grid-modular" style={{ marginBottom: '3rem' }}>
              {listas.map(item => (
                <div key={item.id} className="premium-card">
                  <div className="card-header">
                    <div>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{item.especialidad}</h3>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 600 }}>DOC. #{item.id}</span>
                    </div>
                    <span className={`status-badge badge-${item.prioridad?.toLowerCase()}`}>{item.prioridad}</span>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ marginBottom: '0.8rem' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 700 }}>Motivo Clínico</span>
                      <span style={{ color: 'var(--text-dark)' }}>{item.diagnostico}</span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 700 }}>Estado</span>
                      <span style={{ color: 'var(--text-dark)' }}>{item.estado}</span>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.6rem' }}
                    onClick={() => { setListaSeleccionada(item); setMostrarFormCita(true); setMensajeCita(null); }}
                  >
                    Solicitar Cita
                  </button>
                </div>
              ))}
            </div>
          )
        }

        {/* Formulario solicitar cita */}
        {mostrarFormCita && listaSeleccionada && (
          <div className="premium-card" style={{ marginBottom: '3rem', borderLeft: '4px solid var(--color-primary)' }}>
            <div className="card-header">
              <h3 style={{ margin: 0 }}>Solicitar Cita — {listaSeleccionada.especialidad}</h3>
              <button className="btn btn-outline" onClick={() => setMostrarFormCita(false)}>Cancelar</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px', marginTop: '1rem' }}>
              <div>
                <label className="input-label">Médico</label>
                <select className="input-control" value={medicoId} onChange={e => setMedicoId(e.target.value)}>
                  <option value="">Selecciona un médico</option>
                  {medicos.filter(m => m.especialidad === listaSeleccionada.especialidad).map(m => (
                    <option key={m.id} value={m.id}>{m.nombre} — {m.especialidad}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Fecha y Hora</label>
                <input
                  type="datetime-local"
                  className="input-control"
                  value={fechaHora}
                  onChange={e => setFechaHora(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={solicitarCita}
                disabled={agendando || !medicoId || !fechaHora}
              >
                {agendando ? 'Agendando...' : 'Confirmar Cita'}
              </button>
            </div>
          </div>
        )}

        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-dark)', fontSize: '1.5rem' }}>Mis Citas</h2>
        {citas.length === 0
          ? <div className="premium-card" style={{ color: 'var(--text-gray)', textAlign: 'center', padding: '2rem' }}>No tienes citas agendadas.</div>
          : (
            <div className="grid-modular">
              {citas.map(c => (
                <div key={c.id} className="premium-card">
                  <div className="card-header">
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Cita #{c.id}</h3>
                    <span className={`status-badge badge-${c.estado?.toLowerCase()}`}>{c.estado}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-gray)', marginTop: '0.5rem', marginBottom: '1rem' }}>
                    {c.fechaHora && <div><strong>Fecha:</strong> {new Date(c.fechaHora).toLocaleString('es-CL')}</div>}
                    {c.medico && <div style={{ marginTop: '0.3rem' }}><strong>Médico:</strong> {c.medico.nombre} — {c.medico.especialidad}</div>}
                  </div>
                  {c.estado === 'PROGRAMADA' && (
                    <button
                      className="btn btn-outline"
                      style={{ width: '100%', padding: '0.6rem', color: 'var(--status-high-text)', borderColor: 'var(--status-high-text)' }}
                      onClick={() => cancelarCita(c.id)}
                    >
                      Cancelar Cita
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        }

      </div>
    </div>
  );
}