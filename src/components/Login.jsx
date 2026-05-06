import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login() {
  const [modo, setModo] = useState('login'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (modo === 'registro') {
        if (password !== confirmPassword) {
          setError('Las contraseñas no coinciden.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres.');
          setLoading(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado. Inicia sesión.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Credenciales incorrectas. Verifique por favor.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El correo electrónico no es válido.');
      } else {
        setError('Ocurrió un error. Intente nuevamente.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo);
    setError(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

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

          <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', marginBottom: '2rem' }}>
            <button
              type="button"
              onClick={() => cambiarModo('login')}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '0.9rem',
                color: modo === 'login' ? 'var(--color-primary)' : 'var(--text-gray)',
                borderBottom: modo === 'login' ? '2px solid var(--color-primary)' : '2px solid transparent',
                marginBottom: '-2px',
                transition: 'all 0.2s ease'
              }}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => cambiarModo('registro')}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '0.9rem',
                color: modo === 'registro' ? 'var(--color-primary)' : 'var(--text-gray)',
                borderBottom: modo === 'registro' ? '2px solid var(--color-primary)' : '2px solid transparent',
                marginBottom: '-2px',
                transition: 'all 0.2s ease'
              }}
            >
              Registrarse
            </button>
          </div>

          {error && (
            <div style={{ backgroundColor: 'var(--status-high-bg)', color: 'var(--status-high-text)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Correo Electrónico</label>
              <input
                type="email"
                className="input-control"
                placeholder="usuario@ejemplo.cl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
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
                type="password"
                className="input-control"
                style={{ marginTop: '0.5rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {modo === 'registro' && (
              <div className="input-group">
                <label className="input-label">Confirmar Contraseña</label>
                <input
                  type="password"
                  className="input-control"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}
              disabled={loading}
            >
              {loading
                ? 'Procesando...'
                : modo === 'login' ? 'Acceder a mi Portal' : 'Crear mi Cuenta'}
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
