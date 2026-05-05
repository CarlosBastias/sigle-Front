import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';

// Importación de Estilos Modulares
import './styles/global.css';
import './styles/layout.css';
import './styles/components.css';

// Importación de Componentes
import Login from './components/Login';
import Navbar from './components/Navbar';
import PortalPaciente from './pages/PortalPaciente';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const isFirebaseAdmin = firebaseUser.email.includes("admin");
        const token = await firebaseUser.getIdToken();
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: isFirebaseAdmin ? 'ADMIN' : 'PACIENTE',
          name: isFirebaseAdmin ? 'MD. Administrador' : firebaseUser.email,
          token: token
        });
      } else {
        setUser(null);
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
    return <Login onMockLogin={setUser} />;
  }

  return (
    <>
      <Navbar user={user} onLogout={() => { signOut(auth); setUser(null); }} />
      <main>
        {user.role === 'ADMIN' ? <Dashboard user={user} /> : <PortalPaciente user={user} />}
      </main>
    </>
  );
}