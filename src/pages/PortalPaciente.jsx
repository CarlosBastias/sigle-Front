import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';

const API = 'https://sigle-api-gateway.onrender.com';

async function apiFetch(path, token) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export default function PortalPaciente({ user }) {
  const [listas, setListas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const [l, c, n] = await Promise.all([
          apiFetch(`/api/listas/paciente/${user.email}`, token).catch(() => []),
          apiFetch(`/api/citas/paciente/${user.email}`, token).catch(() => []),
          apiFetch(`/api/pacientes/notificaciones/paciente/${user.email}`, token).catch(() => []),
        ]);
        setListas(l);
        setCitas(c);
        setNotificaciones(n);
      } catch (err) {
        setError('Error al cargar datos del paciente.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [user]);

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

        {/* Notificaciones */}
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

        {/* Listas de espera */}
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
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ marginBottom: '0.8rem' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 700 }}>Motivo Clínico</span>
                      <span style={{ color: 'var(--text-dark)' }}>{item.diagnostico}</span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 700 }}>Estado</span>
                      <span style={{ color: 'var(--text-dark)' }}>{item.estado}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        }

        {/* Citas */}
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
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-gray)', marginTop: '0.5rem' }}>
                    {c.fechaHora && <div><strong>Fecha:</strong> {new Date(c.fechaHora).toLocaleString('es-CL')}</div>}
                    {c.medico && <div style={{ marginTop: '0.3rem' }}><strong>Médico:</strong> {c.medico.nombre} {c.medico.apellido}</div>}
                  </div>
                </div>
              ))}
            </div>
          )
        }

      </div>
    </div>
  );
}