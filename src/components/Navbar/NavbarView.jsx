import React, { useState } from 'react';

export default function NavbarView({ user, onLogout, notificaciones = [], onLimpiarNotificaciones }) {
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);

  return (
    <header className="top-nav" style={{ position: 'relative' }}>
      <div className="brand-logo">
        <span className="brand-icon">✚</span>
        SIGLE <span style={{ color: 'var(--text-dark)', marginLeft: '6px', fontWeight: '500' }}>RedNorte</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

        {/* CAMPANA DE NOTIFICACIONES — solo para pacientes */}
        {user?.role === 'PACIENTE' && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', position: 'relative', padding: '0.2rem' }}
            >
              🔔
              {notificaciones.length > 0 && (
                <span style={{
                  position: 'absolute', top: '-4px', right: '-4px',
                  backgroundColor: 'var(--status-high-text)', color: 'white',
                  borderRadius: '50%', width: '18px', height: '18px',
                  fontSize: '0.65rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {notificaciones.length > 9 ? '9+' : notificaciones.length}
                </span>
              )}
            </button>

            {/* DROPDOWN NOTIFICACIONES */}
            {mostrarNotificaciones && (
              <div style={{
                position: 'absolute', top: '2.5rem', right: 0,
                width: '340px', maxHeight: '400px', overflowY: 'auto',
                backgroundColor: 'white', borderRadius: '10px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                border: '1px solid var(--border-color)', zIndex: 1000
              }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.95rem' }}>
                    Notificaciones {notificaciones.length > 0 && `(${notificaciones.length})`}
                  </span>
                  {notificaciones.length > 0 && (
                    <button
                      onClick={() => { onLimpiarNotificaciones(); setMostrarNotificaciones(false); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}
                    >
                      Limpiar todo
                    </button>
                  )}
                </div>

                {notificaciones.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-gray)', fontSize: '0.9rem' }}>
                    No tienes notificaciones
                  </div>
                ) : (
                  notificaciones.map(n => (
                    <div key={n.id} style={{
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid var(--border-color)',
                      fontSize: '0.85rem', color: 'var(--text-dark)',
                      lineHeight: '1.4'
                    }}>
                      <div style={{ marginBottom: '0.2rem' }}>
                        {n.mensaje || n.descripcion}
                      </div>
                      {n.enviadoEn && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                          {new Date(n.enviadoEn).toLocaleString('es-CL')}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
          <span style={{ fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.95rem' }}>
            {user?.name}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary-dark)', fontWeight: '600', textTransform: 'uppercase' }}>
            {user?.role}
          </span>
        </div>
        <button onClick={onLogout} className="btn btn-outline" style={{ padding: '0.5rem 1.2rem' }}>
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}