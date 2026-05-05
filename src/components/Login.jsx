import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; 

export default function Login({ onMockLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Si la API key está vacía/mockeada
    if (auth.app.options.apiKey.includes('TuConfiguracionAqui')) {
      if (email.includes('admin')) {
        onMockLogin({ role: 'ADMIN', name: 'Dr. Administrador V.', email: email });
      } else {
        onMockLogin({ role: 'PACIENTE', name: 'Carlos Bastías M.', email: email });
      }
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Credenciales incorrectas. Verifique por favor.");
      console.error(err);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-panel animate-entrance">
        <div style={{ width: '100%', maxWidth: '420px' }}>
          
          <div style={{ marginBottom: '3rem' }}>
            <div className="brand-logo" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
              <span className="brand-icon">✚</span> SIGLE  
            </div>
            <h2 style={{ color: 'var(--text-dark)' }}>Ingreso a Plataforma</h2>
            <p className="text-muted" style={{ fontSize: '0.95rem' }}>Ecosistema de Salud RedNorte</p>
          </div>

          {error && (
            <div style={{ backgroundColor: 'var(--status-high-bg)', color: 'var(--status-high-text)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Identificador (Correo/RUT)</label>
              <input 
                type="email" 
                className="input-control"
                placeholder="usuario@ejemplo.cl (usa 'admin' para entrar como médico)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="input-label" style={{ marginBottom: 0 }}>Contraseña Segura</label>
                <a href="#" style={{ fontSize: '0.8rem', color: 'var(--color-secondary-dark)', fontWeight: '600' }}>¿Olvidaste tu clave?</a>
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
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
              Acceder a mi Portal
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
