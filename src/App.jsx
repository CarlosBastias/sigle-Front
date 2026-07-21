import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import './styles/global.css';
import './styles/layout.css';
import './styles/components.css';

import LoginContainer from './components/Login/LoginContainer';
import NavbarView from './components/Navbar/NavbarView';
import PortalPacienteContainer from './pages/PortalPaciente/PortalPacienteContainer';
import DashboardContainer from './pages/Dashboard/DashboardContainer';
import MedicoContainer from './pages/Medico/MedicoContainer';
import OfertaCupoContainer from './pages/OfertaCupo/OfertaCupoContainer';
import NotFoundView from './pages/NotFound/NotFoundView';
import { tomarDatosRegistroPendiente } from './utils/pendingRegistration';

const API = import.meta.env.VITE_API_BASE_URL;

// Mapea el rol que maneja el CoreService al rol que usa el front para
// decidir qué portal mostrar. ADMINISTRATIVO y DIRECCION ven el portal
// de administración; MEDICO ve el portal médico; el resto, portal paciente.
const mapRolBackendARol = (rolBackend) => {
  if (rolBackend === 'ADMINISTRATIVO' || rolBackend === 'DIRECCION') return 'ADMIN';
  if (rolBackend === 'MEDICO') return 'MEDICO';
  return 'PACIENTE';
};

// Obtiene el usuario desde el CoreService (lo crea la primera vez). El rol
// se decide siempre en el backend (dominio @rednorte-medico.com => MEDICO),
// nunca confiando en datos que vengan solo del navegador.
async function sincronizarUsuarioConBackend(firebaseUser, token) {
  const pendientes = tomarDatosRegistroPendiente();

  const res = await fetch(`${API}/api/auth/usuario`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      nombre: pendientes?.nombre || firebaseUser.email.split('@')[0],
      apellido: pendientes?.apellido || ''
    })
  });

  if (!res.ok) throw new Error(`Error ${res.status} al sincronizar usuario`);
  return res.json();
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [marcarLeidas, setMarcarLeidas] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const usuario = await sincronizarUsuarioConBackend(firebaseUser, token);

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: mapRolBackendARol(usuario.rol),
            name: `${usuario.nombre} ${usuario.apellido}`.trim() || firebaseUser.email,
            token
          });
          setAuthError(null);
        } catch (e) {
          console.error('[Auth] No fue posible sincronizar el usuario con el servidor:', e);
          setAuthError('No fue posible validar tu cuenta. Intenta nuevamente.');
          setUser(null);
          signOut(auth);
        }
      } else {
        setUser(null);
        setNotificaciones([]);
        setMarcarLeidas(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column' }}>
        <div style={{ fontSize: '3rem', color: 'var(--color-primary)', animation: 'fadeInUp 1s ease infinite alternate' }}>✚</div>
        <div style={{ marginTop: '1rem', color: 'var(--text-gray)', fontWeight: '600', letterSpacing: '0.05em' }}>Autenticando Plataforma SEGURA...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <BrowserRouter>
        {authError && (
          <div style={{
            position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)',
            backgroundColor: 'var(--status-high-bg)', color: 'var(--status-high-text)',
            padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '500', zIndex: 2000
          }}>
            {authError}
          </div>
        )}
        <Routes>
          <Route path="*" element={<LoginContainer />} />
        </Routes>
      </BrowserRouter>
    );
  }

  const getHomeByRole = () => {
    if (user.role === 'ADMIN') return <DashboardContainer user={user} />;
    if (user.role === 'MEDICO') return <MedicoContainer user={user} />;
    return (
      <PortalPacienteContainer
        user={user}
        onNotificaciones={setNotificaciones}
        onMarcarLeidas={(fn) => setMarcarLeidas(() => fn)}
      />
    );
  };

  return (
    <BrowserRouter>
      <NavbarView
        user={user}
        onLogout={() => { signOut(auth); setUser(null); }}
        notificaciones={notificaciones}
        onLimpiarNotificaciones={marcarLeidas || (() => setNotificaciones([]))}
      />
      <main>
        <Routes>
          <Route path="/" element={getHomeByRole()} />
          <Route path="/dashboard" element={user.role === 'ADMIN' ? <DashboardContainer user={user} /> : <Navigate to="/" />} />
          <Route path="/medico" element={user.role === 'MEDICO' ? <MedicoContainer user={user} /> : <Navigate to="/" />} />
          <Route path="/ofertas/:ofertaId" element={<OfertaCupoContainer user={user} />} />
          <Route path="/paciente" element={user.role === 'PACIENTE' ? (
            <PortalPacienteContainer
              user={user}
              onNotificaciones={setNotificaciones}
              onMarcarLeidas={(fn) => setMarcarLeidas(() => fn)}
            />
          ) : <Navigate to="/" />} />
          <Route path="*" element={<NotFoundView onVolver={() => window.location.href = '/'} />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}