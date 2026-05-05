import React from 'react';

export default function Navbar({ user, onLogout }) {
  const handleLogout = () => {
    // If we're using real Firebase Auth session
    if (user && user.uid) { 
      // Import signOut & auth from firebase internally or handle at App level
      // We'll safely delegate back to App to keep components pure here
      onLogout('firebase'); 
    } else { 
      onLogout('mock'); 
    }
  };

  return (
    <header className="top-nav">
      <div className="brand-logo">
        <span className="brand-icon">✚</span> 
        SIGLE <span style={{color: 'var(--text-dark)', marginLeft: '6px', fontWeight: '500'}}>RedNorte</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2'}}>
          <span style={{ fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.95rem' }}>{user?.name}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary-dark)', fontWeight: '600', textTransform: 'uppercase' }}>
            {user?.role}
          </span>
        </div>
        <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1.2rem' }}>
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}
