import foto from '../../assets/404.png';

export default function NotFoundView({ onVolver }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '80vh', textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <img src={foto} alt="404" style={{
        width: '600px', height: '350px', objectFit: 'cover',
        borderRadius: '16px', marginBottom: '1.5rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
      }} />
      <h1 style={{ fontSize: '5rem', margin: '0', color: 'var(--color-primary)' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>Equivocao papito</h2>
      <p style={{ color: '#666' }}>Esta página no existe en el sistema SIGLE.</p>
      <button onClick={onVolver} style={{
        marginTop: '1.5rem', padding: '10px 28px',
        background: 'var(--color-primary)', color: 'white',
        border: 'none', borderRadius: '8px',
        fontSize: '1rem', cursor: 'pointer'
      }}>
        Volver al inicio
      </button>
    </div>
  );
}