import React from 'react';

function InputError({ error }) {
  if (!error) return null;
  return <span style={{ color: 'var(--status-high-text)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{error}</span>;
}

export default function LoginView({
  modo, email, password, confirmPassword, nombre, apellido,
  error, loading, erroresForm,
  onSubmit, onCambiarModo,
  onEmailChange, onPasswordChange, onConfirmPasswordChange,
  onNombreChange, onApellidoChange
}) {
  return (
    <div className="auth-wrapper">
      <div className="auth-panel animate-entrance">
        <div style={{ width: '100%', maxWidth: '420px' }}>

          <div style={{ marginBottom: '2.5rem' }}>
            <div className="brand-logo" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
              <span className="brand-icon">✚</span> SIGLE
            </div>
            <h2 style={{ color: 'var(--text-dark)' }}>
              {modo === 'login' ? 'Ingreso a Plataforma' : 'Crear Cuenta'}
            </h2>
            <p className="text-muted" style={{ fontSize: '0.95rem' }}>
              Ecosistema de Salud RedNorte
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', marginBottom: '2rem' }}>
            {['login', 'registro'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onCambiarModo(m)}
                style={{
                  flex: 1, padding: '0.75rem', border: 'none',
                  background: 'transparent', cursor: 'pointer',
                  fontWeight: '700', fontSize: '0.9rem',
                  color: modo === m ? 'var(--color-primary)' : 'var(--text-gray)',
                  borderBottom: modo === m ? '2px solid var(--color-primary)' : '2px solid transparent',
                  marginBottom: '-2px', transition: 'all 0.2s ease'
                }}
              >
                {m === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          {error && (
            <div style={{
              backgroundColor: 'var(--status-high-bg)', color: 'var(--status-high-text)',
              padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem',
              fontSize: '0.9rem', fontWeight: '500'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={onSubmit}>
            {modo === 'registro' && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Nombre</label>
                  <input
                    type="text" className="input-control"
                    placeholder="Juan"
                    value={nombre} onChange={onNombreChange}
                    style={{ borderColor: erroresForm?.nombre ? 'var(--status-high-text)' : '' }}
                  />
                  <InputError error={erroresForm?.nombre} />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Apellido</label>
                  <input
                    type="text" className="input-control"
                    placeholder="Pérez"
                    value={apellido} onChange={onApellidoChange}
                    style={{ borderColor: erroresForm?.apellido ? 'var(--status-high-text)' : '' }}
                  />
                  <InputError error={erroresForm?.apellido} />
                </div>
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Correo Electrónico</label>
              <input
                type="email" className="input-control"
                placeholder="usuario@ejemplo.cl"
                value={email} onChange={onEmailChange}
                style={{ borderColor: erroresForm?.email ? 'var(--status-high-text)' : '' }}
              />
              <InputError error={erroresForm?.email} />
            </div>

            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="input-label" style={{ marginBottom: 0 }}>Contraseña</label>
                {modo === 'login' && (
                  <a href="#" style={{ fontSize: '0.8rem', color: 'var(--color-secondary-dark)', fontWeight: '600' }}>
                    ¿Olvidaste tu clave?
                  </a>
                )}
              </div>
              <input
                type="password" className="input-control"
                style={{ marginTop: '0.5rem', borderColor: erroresForm?.password ? 'var(--status-high-text)' : '' }}
                placeholder="••••••••"
                value={password} onChange={onPasswordChange}
              />
              <InputError error={erroresForm?.password} />
            </div>

            {modo === 'registro' && (
              <div className="input-group">
                <label className="input-label">Confirmar Contraseña</label>
                <input
                  type="password" className="input-control"
                  placeholder="••••••••"
                  value={confirmPassword} onChange={onConfirmPasswordChange}
                  style={{ borderColor: erroresForm?.confirmPassword ? 'var(--status-high-text)' : '' }}
                />
                <InputError error={erroresForm?.confirmPassword} />
              </div>
            )}

            <button
              type="submit" className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Procesando...' : modo === 'login' ? 'Acceder a mi Portal' : 'Crear mi Cuenta'}
            </button>
          </form>
        </div>
      </div>

      <div className="auth-banner animate-entrance" style={{ animationDelay: '0.2s' }}>
        <div className="auth-banner-overlay"></div>
        <div className="auth-banner-content">
          <h1 style={{ fontSize: '3.5rem', color: 'white', marginBottom: '1.5rem', maxWidth: '600px', lineHeight: '1.1' }}>
            Gestión Inteligente para una Atención Oportuna.
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)', maxWidth: '500px' }}>
            Accede al estado de interconsultas, métricas operativas y gestión de pabellones integrada.
          </p>
        </div>
      </div>
    </div>
  );
}