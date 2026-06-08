import React, { useState } from 'react';
import { ESPECIALIDADES, TODOS_HORARIOS } from './PortalPacienteContainer';

export default function PortalPacienteView({
  listas, citas, loading, error, mensajeCita,
  medicos, mostrarFormNuevo, especialidadNueva, diagnosticoNuevo,
  medicoIdNuevo, fechaNueva, horaNueva, horasOcupadasNuevo,
  agendandoNuevo, cancelando, pacienteExiste,
  rutNuevo, fechaNacimientoNuevo,
  onToggleFormNuevo, onEspecialidadChange, onDiagnosticoChange,
  onMedicoNuevoChange, onFechaNuevaChange, onHoraNuevaChange,
  onNuevaSolicitud, onCancelarCita, onRutNuevoChange, onFechaNacimientoNuevoChange
}) {
  const [mostrarDerivaciones, setMostrarDerivaciones] = useState(true);
  const [mostrarCitas, setMostrarCitas] = useState(true);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [mostrarHistorialCitas, setMostrarHistorialCitas] = useState(false);
  const [ocultadas, setOcultadas] = useState([]);
  const [citaDetalle, setCitaDetalle] = useState(null);

  const prioridadColor = (prioridad) => {
    if (prioridad === 'ALTA') return 'var(--status-high-text)';
    if (prioridad === 'MEDIA') return '#f59e0b';
    return 'var(--status-low-text)';
  };

  const ocultarItem = (id) => setOcultadas([...ocultadas, id]);

  const derivacionesActivas = listas.filter(l => !['CANCELADO', 'ATENDIDO'].includes(l.estado) && !ocultadas.includes(l.id));
  const derivacionesHistorial = listas.filter(l => ['CANCELADO', 'ATENDIDO'].includes(l.estado) && !ocultadas.includes(l.id));
  const citasActivas = citas.filter(c => c.estado === 'PROGRAMADA');
  const citasHistorial = citas.filter(c => c.estado !== 'PROGRAMADA' && !ocultadas.includes(c.id));

  const getDerivacion = (cita) => listas.find(l => l.id === cita.listaEsperaId || l.pacienteId === cita.pacienteId);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '3rem', color: 'var(--color-primary)' }}>✚</div>
      <p style={{ color: 'var(--text-gray)', fontWeight: 600 }}>Cargando tu portal...</p>
    </div>
  );

  return (
    <div className="animate-entrance">
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--text-dark)', marginBottom: '0.2rem' }}>Mi Portal de Salud</h1>
            <p style={{ color: 'var(--text-gray)' }}>Seguimiento de tus derivaciones y citas en la Red Asistencial.</p>
          </div>
          <button className="btn btn-primary" onClick={onToggleFormNuevo}>
            {mostrarFormNuevo ? 'Cancelar' : '+ Nueva Solicitud de Cita'}
          </button>
        </div>

        {error && <div style={{ backgroundColor: 'var(--status-high-bg)', color: 'var(--status-high-text)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontWeight: 600 }}>{error}</div>}

        {mensajeCita && (
          <div style={{ backgroundColor: mensajeCita.tipo === 'exito' ? 'var(--status-low-bg)' : 'var(--status-high-bg)', color: mensajeCita.tipo === 'exito' ? 'var(--status-low-text)' : 'var(--status-high-text)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontWeight: 600 }}>
            {mensajeCita.texto}
          </div>
        )}

        {/* FORMULARIO */}
        {mostrarFormNuevo && (
          <div className="premium-card" style={{ marginBottom: '3rem', borderLeft: '4px solid var(--color-primary)' }}>
            <div className="card-header">
              <h3 style={{ margin: 0 }}>Nueva Solicitud de Cita</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px', marginTop: '1rem' }}>
              {!pacienteExiste && (
                <>
                  <div>
                    <label className="input-label">RUT</label>
                    <input type="text" className="input-control" placeholder="12345678-9" value={rutNuevo} onChange={e => onRutNuevoChange(e.target.value)} />
                  </div>
                  <div>
                    <label className="input-label">Fecha de Nacimiento</label>
                    <input type="date" className="input-control" value={fechaNacimientoNuevo} onChange={e => onFechaNacimientoNuevoChange(e.target.value)} />
                  </div>
                </>
              )}
              <div>
                <label className="input-label">Especialidad</label>
                <select className="input-control" value={especialidadNueva} onChange={e => onEspecialidadChange(e.target.value)}>
                  <option value="">Selecciona una especialidad</option>
                  {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Motivo de consulta</label>
                <input type="text" className="input-control" placeholder="Describe tu motivo" value={diagnosticoNuevo} onChange={e => onDiagnosticoChange(e.target.value)} />
              </div>
              {especialidadNueva && (
                <div>
                  <label className="input-label">Médico</label>
                  <select className="input-control" value={medicoIdNuevo} onChange={e => onMedicoNuevoChange(e.target.value)}>
                    <option value="">Selecciona un médico</option>
                    {medicos.filter(m => m.especialidad === especialidadNueva).map(m => (
                      <option key={m.id} value={m.id}>{m.nombre} — {m.especialidad}</option>
                    ))}
                  </select>
                </div>
              )}
              {medicoIdNuevo && (
                <div>
                  <label className="input-label">Fecha</label>
                  <input type="date" className="input-control" value={fechaNueva} min={new Date().toISOString().split('T')[0]} onChange={e => onFechaNuevaChange(e.target.value)} />
                </div>
              )}
              {medicoIdNuevo && fechaNueva && (
                <div>
                  <label className="input-label">Hora Disponible</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {TODOS_HORARIOS.map(hora => {
                      const ocupada = horasOcupadasNuevo.some(h => h.startsWith(hora));
                      return (
                        <button key={hora} onClick={() => !ocupada && onHoraNuevaChange(hora)}
                          style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid', borderColor: ocupada ? 'var(--border-color)' : horaNueva === hora ? 'var(--color-primary)' : 'var(--border-color)', backgroundColor: ocupada ? 'var(--bg-subtle)' : horaNueva === hora ? 'var(--color-primary)' : 'white', color: ocupada ? 'var(--text-light)' : horaNueva === hora ? 'white' : 'var(--text-dark)', cursor: ocupada ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 600, textDecoration: ocupada ? 'line-through' : 'none' }}>
                          {hora}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <button className="btn btn-primary" onClick={onNuevaSolicitud} disabled={agendandoNuevo || !especialidadNueva || !diagnosticoNuevo || !medicoIdNuevo || !fechaNueva || !horaNueva || (!pacienteExiste && (!rutNuevo || !fechaNacimientoNuevo))}>
                {agendandoNuevo ? 'Enviando...' : 'Confirmar Solicitud'}
              </button>
            </div>
          </div>
        )}

        {/* DERIVACIONES ACTIVAS */}
        <div className="premium-card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header" style={{ cursor: 'pointer' }} onClick={() => setMostrarDerivaciones(!mostrarDerivaciones)}>
            <h3 style={{ margin: 0 }}>Mis Derivaciones</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="status-badge badge-media">{derivacionesActivas.length}</span>
              <span style={{ fontSize: '1.2rem', color: 'var(--text-gray)' }}>{mostrarDerivaciones ? '▲' : '▼'}</span>
            </div>
          </div>
          {mostrarDerivaciones && (
            <div style={{ marginTop: '1rem' }}>
              {derivacionesActivas.length === 0
                ? <div style={{ color: 'var(--text-gray)', textAlign: 'center', padding: '1.5rem' }}>No tienes derivaciones activas.</div>
                : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {derivacionesActivas.map(item => (
                      <div key={item.id} style={{
                        display: 'flex', alignItems: 'center', gap: '1.25rem',
                        padding: '1rem 1.25rem', borderRadius: '8px',
                        background: 'var(--bg-subtle)',
                        borderLeft: `3px solid ${prioridadColor(item.prioridad)}`
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.95rem' }}>{item.especialidad}</span>
                            <span className={`status-badge badge-${item.prioridad?.toLowerCase()}`}>{item.prioridad}</span>
                          </div>
                          {item.diagnostico && (
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-gray)', lineHeight: '1.4' }}>{item.diagnostico}</p>
                          )}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 600, minWidth: '70px', textAlign: 'right' }}>{item.estado}</span>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          )}
        </div>

        {/* HISTORIAL DERIVACIONES */}
        {derivacionesHistorial.length > 0 && (
          <div className="premium-card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header" style={{ cursor: 'pointer' }} onClick={() => setMostrarHistorial(!mostrarHistorial)}>
              <h3 style={{ margin: 0 }}>Historial de Derivaciones</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="status-badge badge-baja">{derivacionesHistorial.length}</span>
                <span style={{ fontSize: '1.2rem', color: 'var(--text-gray)' }}>{mostrarHistorial ? '▲' : '▼'}</span>
              </div>
            </div>
            {mostrarHistorial && (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {derivacionesHistorial.map(item => (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: '1.25rem',
                    padding: '1rem 1.25rem', borderRadius: '8px',
                    background: 'var(--bg-subtle)', opacity: 0.75
                  }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.95rem' }}>{item.especialidad}</span>
                      {item.diagnostico && <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-gray)' }}>{item.diagnostico}</p>}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 600 }}>{item.estado}</span>
                    {item.estado === 'CANCELADO' && (
                      <button
                        onClick={() => ocultarItem(item.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', fontSize: '0.85rem', padding: '0.2rem 0.4rem' }}
                        title="Eliminar de vista"
                      >✕</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CITAS ACTIVAS */}
        <div className="premium-card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header" style={{ cursor: 'pointer' }} onClick={() => setMostrarCitas(!mostrarCitas)}>
            <h3 style={{ margin: 0 }}>Mis Citas</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="status-badge badge-media">{citasActivas.length}</span>
              <span style={{ fontSize: '1.2rem', color: 'var(--text-gray)' }}>{mostrarCitas ? '▲' : '▼'}</span>
            </div>
          </div>
          {mostrarCitas && (
            <div style={{ marginTop: '1rem' }}>
              {citasActivas.length === 0
                ? <div style={{ color: 'var(--text-gray)', textAlign: 'center', padding: '1.5rem' }}>No tienes citas programadas.</div>
                : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {citasActivas.map(c => (
                      <div key={c.id}
                        onClick={() => setCitaDetalle(c)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '1.25rem',
                          padding: '1rem 1.25rem', borderRadius: '8px',
                          background: 'var(--bg-subtle)',
                          borderLeft: '3px solid var(--color-primary)',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#eef6fd'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                            {c.medico ? `${c.medico.nombre}` : 'Médico no asignado'}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                            {c.medico?.especialidad} — {c.fechaHora ? new Date(c.fechaHora).toLocaleString('es-CL') : '—'}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 600 }}>Ver detalle →</span>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          )}
        </div>

        {/* HISTORIAL CITAS */}
        {citasHistorial.length > 0 && (
          <div className="premium-card">
            <div className="card-header" style={{ cursor: 'pointer' }} onClick={() => setMostrarHistorialCitas(!mostrarHistorialCitas)}>
              <h3 style={{ margin: 0 }}>Historial de Citas</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="status-badge badge-baja">{citasHistorial.length}</span>
                <span style={{ fontSize: '1.2rem', color: 'var(--text-gray)' }}>{mostrarHistorialCitas ? '▲' : '▼'}</span>
              </div>
            </div>
            {mostrarHistorialCitas && (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {citasHistorial.map(c => (
                  <div key={c.id}
                    onClick={() => setCitaDetalle(c)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1.25rem',
                      padding: '1rem 1.25rem', borderRadius: '8px',
                      background: 'var(--bg-subtle)', opacity: 0.75, cursor: 'pointer'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                        {c.medico ? c.medico.nombre : 'Médico no asignado'}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                        {c.medico?.especialidad} — {c.fechaHora ? new Date(c.fechaHora).toLocaleString('es-CL') : '—'}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 600 }}>{c.estado}</span>
                    {c.estado === 'CANCELADA' && (
                      <button
                        onClick={e => { e.stopPropagation(); ocultarItem(c.id); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', fontSize: '0.85rem', padding: '0.2rem 0.4rem' }}
                        title="Eliminar de vista"
                      >✕</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL DETALLE CITA */}
      {citaDetalle && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }} onClick={() => setCitaDetalle(null)}>
          <div style={{
            backgroundColor: 'white', borderRadius: '12px',
            width: '100%', maxWidth: '480px',
            padding: '2rem', boxShadow: '0 16px 48px rgba(0,0,0,0.2)'
          }} onClick={e => e.stopPropagation()}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: 'var(--text-dark)', fontSize: '1.2rem' }}>Detalle de Cita</h2>
              <button onClick={() => setCitaDetalle(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem', color: 'var(--text-gray)' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', background: 'var(--bg-subtle)' }}>
                <span style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 700, marginBottom: '0.25rem' }}>Médico</span>
                <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{citaDetalle.medico?.nombre || '—'}</span>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-gray)' }}>{citaDetalle.medico?.especialidad || '—'}</span>
              </div>

              <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', background: 'var(--bg-subtle)' }}>
                <span style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 700, marginBottom: '0.25rem' }}>Fecha y Hora</span>
                <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                  {citaDetalle.fechaHora ? new Date(citaDetalle.fechaHora).toLocaleString('es-CL') : '—'}
                </span>
              </div>

              <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', background: 'var(--bg-subtle)' }}>
                <span style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 700, marginBottom: '0.25rem' }}>Estado</span>
                <span className={`status-badge badge-${citaDetalle.estado?.toLowerCase()}`}>{citaDetalle.estado}</span>
              </div>

              {(() => {
                const derivacion = getDerivacion(citaDetalle);
                return derivacion?.diagnostico ? (
                  <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', background: 'var(--bg-subtle)', borderLeft: '3px solid var(--color-primary)' }}>
                    <span style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 700, marginBottom: '0.25rem' }}>Observaciones del Médico</span>
                    <span style={{ color: 'var(--text-dark)', fontSize: '0.9rem', lineHeight: '1.5' }}>{derivacion.diagnostico}</span>
                  </div>
                ) : null;
              })()}
            </div>

            {citaDetalle.estado === 'PROGRAMADA' && (
              <button
                className="btn btn-outline"
                style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem', color: 'var(--status-high-text)', borderColor: 'var(--status-high-text)' }}
                onClick={() => { onCancelarCita(citaDetalle.id); setCitaDetalle(null); }}
                disabled={cancelando}
              >
                Cancelar Cita
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}