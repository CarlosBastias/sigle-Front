import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { auth } from '../../firebase';
import OfertaCupoView from './OfertaCupoView';

const API = import.meta.env.VITE_API_BASE_URL;

async function apiFetch(path, token, method = 'GET', body = null) {
  const options = { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${API}${path}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const err = new Error(data.error || `Error ${res.status}`); err.status = res.status; throw err; }
  return data;
}

export default function OfertaCupoContainer({ user }) {
  const { ofertaId } = useParams();
  const [oferta, setOferta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const cargarOferta = async () => {
    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      setOferta(await apiFetch(`/api/citas/oferta/${ofertaId}`, token));
    } catch {
      setResultado({ tipo: 'error', texto: 'No se pudo cargar esta oferta. Puede que ya no exista.' });
    } finally { setLoading(false); }
  };

  useEffect(() => { cargarOferta(); }, [ofertaId]);

  const confirmar = async () => {
    setProcesando(true);
    try {
      const token = await auth.currentUser.getIdToken();
      await apiFetch(`/api/citas/oferta/${ofertaId}/confirmar`, token, 'POST');
      setResultado({ tipo: 'confirmada', texto: 'Tu cita fue confirmada. Te esperamos.' });
    } catch (err) {
      const texto = err.status === 409
        ? 'Este cupo ya no está disponible (expiró o ya lo respondiste antes).'
        : 'No se pudo confirmar el cupo. Intenta nuevamente.';
      setResultado({ tipo: 'error', texto });
    } finally { setProcesando(false); }
  };

  const rechazar = async () => {
    if (!window.confirm('¿Seguro que no puedes asistir? El cupo se ofrecerá a otro paciente.')) return;
    setProcesando(true);
    try {
      const token = await auth.currentUser.getIdToken();
      await apiFetch(`/api/citas/oferta/${ofertaId}/rechazar`, token, 'POST');
      setResultado({ tipo: 'rechazada', texto: 'Gracias por avisarnos. El cupo se ofrecerá a otro paciente.' });
    } catch {
      setResultado({ tipo: 'error', texto: 'No se pudo rechazar el cupo. Intenta nuevamente.' });
    } finally { setProcesando(false); }
  };

  return (
    <OfertaCupoView oferta={oferta} loading={loading} procesando={procesando}
      resultado={resultado} onConfirmar={confirmar} onRechazar={rechazar} />
  );
}