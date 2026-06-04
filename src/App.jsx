import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';

import './styles/global.css';
import './styles/layout.css';
import './styles/components.css';

import LoginContainer from './components/Login/LoginContainer';
import NavbarView from './components/Navbar/NavbarView';
import PortalPacienteContainer from './pages/PortalPaciente/PortalPacienteContainer';
import DashboardContainer from './pages/Dashboard/DashboardContainer';
import MedicoContainer from './pages/Medico/MedicoContainer';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificaciones, setNotificaciones] = useState([]);
  const [marcarLeidas, setMarcarLeidas] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const isAdmin = firebaseUser.email.includes("admin");
        const isMedico = firebaseUser.email.includes("medico");
        const token = await firebaseUser.getIdToken();
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: isAdmin ? 'ADMIN' : isMedico ? 'MEDICO' : 'PACIENTE',
          name: isAdmin ? 'MD. Administrador' : firebaseUser.email,
          token: token
        });
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
    return <LoginContainer />;
  }

  return (
    <>
      <NavbarView
        user={user}
        onLogout={() => { signOut(auth); setUser(null); }}
        notificaciones={notificaciones}
        onLimpiarNotificaciones={marcarLeidas || (() => setNotificaciones([]))}
      />
      <main>
        {user.role === 'ADMIN'
          ? <DashboardContainer user={user} />
          : user.role === 'MEDICO'
          ? <MedicoContainer user={user} />
          : <PortalPacienteContainer
              user={user}
              onNotificaciones={setNotificaciones}
              onMarcarLeidas={(fn) => setMarcarLeidas(() => fn)}
            />
        }
      </main>
    </>
  );
}