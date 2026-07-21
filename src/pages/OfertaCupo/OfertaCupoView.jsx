import React from 'react';

function formatearFecha(fechaHora) {
  if (!fechaHora) return '';
  return new Date(fechaHora).toLocaleString('es-CL', { dateStyle: 'full', timeStyle: 'short' });
}

export default function OfertaCupoView({ oferta, loading, procesando, resultado, onConfirmar, onRechazar }) {
  return (
    <div className="container" style={{ maxWidth: '560px', paddingTop: '2rem' }}>
      <div className="premium-card animate-entrance">
        <div className="card-header"><h2 style={{ margin: 0 }}>Cupo médico disponible</h2></div>

        {loading && <p style={{ color: 'var(--text-gray)' }}>Cargando información del cupo...</p>}

        {!loading && resultado && (
          <div style={{
            padding: '1rem', borderRadius: '8px', marginTop: '1rem',
            background: resultado.tipo === 'error' ? 'var(--status-high-bg)' : 'var(--status-low-bg)',
            color: resultado.tipo === 'error' ? 'var(--status-high-text)' : 'var(--status-low-text)',
          }}>{resultado.texto}</div>
        )}

        {!loading && !resultado && oferta && (
          <>
            <p style={{ color: 'var(--text-dark)' }}>
              Se liberó un cupo de <strong>{oferta.especialidad}</strong> para el{' '}
              <strong>{formatearFecha(oferta.fechaHora)}</strong>.
            </p>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>
              Tienes hasta el {formatearFecha(oferta.fechaExpiracion)} para responder.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-primary" disabled={procesando} onClick={onConfirmar}>
                {procesando ? 'Procesando...' : 'Confirmar cita'}
              </button>
              <button className="btn btn-outline" disabled={procesando} onClick={onRechazar}>
                No puedo asistir
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}