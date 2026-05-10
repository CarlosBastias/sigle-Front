import React from 'react';
import { ESPECIALIDADES, TODOS_HORARIOS } from './PortalPacienteContainer';

export default function PortalPacienteView({
  listas, citas, notificaciones, loading, error, mensajeCita,
  medicos, mostrarFormNuevo, especialidadNueva, diagnosticoNuevo,
  medicoIdNuevo, fechaNueva, horaNueva, horasOcupadasNuevo,
  agendandoNuevo, cancelando, pacienteExiste,
  rutNuevo, fechaNacimientoNuevo,
  onToggleFormNuevo, onEspecialidadChange, onDiagnosticoChange,
  onMedicoNuevoChange, onFechaNuevaChange, onHoraNuevaChange,
  onNuevaSolicitud, onCancelarCita, onRutNuevoChange, onFechaNacimientoNuevoChange
}) {
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '3rem', color: 'var(--color-primary)' }}>✚</div>
      <p style={{ color: 'var(--text-gray)', fontWeight: 600 }}>Cargando tu portal...</p>
    </div>
  );

  return (
    <div className="animate-entrance">
      <div className="container" style={{ paddingTop: '3rem' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--text-dark)', marginBottom: '0.2rem' }}>Mi Portal de Salud</h1>
            <p style={{ color: 'var(--text-gray)' }}>Seguimiento de tus derivaciones, citas y notificaciones de la Red Asistencial.</p>
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

        {/* Formulario nueva solicitud */}
        {mostrarFormNuevo && (
          <div className="premium-card" style={{ marginBottom: '3rem', borderLeft: '4px solid var(--color-primary)' }}>
            <div className="card-header">
              <h3 style={{ margin: 0 }}>Nueva Solicitud de Cita</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px', marginTop: '1rem' }}>

              {/* Campos solo para paciente nuevo */}
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

        {notificaciones.length > 0 && (
          <div className="premium-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--status-high-text)' }}>
            <div className="card-header">
              <h3 style={{ margin: 0 }}> Notificaciones</h3>
              <span className="status-badge badge-alta">{notificaciones.length}</span>
            </div>
            {notificaciones.map(n => (
              <div key={n.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                {n.mensaje || n.descripcion || JSON.stringify(n)}
              </div>
            ))}
          </div>
        )}

        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-dark)', fontSize: '1.5rem' }}>Mis Derivaciones Activas</h2>
        {listas.length === 0
          ? <div className="premium-card" style={{ color: 'var(--text-gray)', textAlign: 'center', padding: '2rem' }}>No tienes derivaciones activas.</div>
          : (
            <div className="grid-modular" style={{ marginBottom: '3rem' }}>
              {listas.map(item => (
                <div key={item.id} className="premium-card">
                  <div className="card-header">
                    <div>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{item.especialidad}</h3>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 600 }}>DOC. #{item.id}</span>
                    </div>
                    <span className={`status-badge badge-${item.prioridad?.toLowerCase()}`}>{item.prioridad}</span>
                  </div>
                  <div>
                    <div style={{ marginBottom: '0.8rem' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 700 }}>Motivo Clínico</span>
                      <span style={{ color: 'var(--text-dark)' }}>{item.diagnostico}</span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 700 }}>Estado</span>
                      <span style={{ color: 'var(--text-dark)' }}>{item.estado}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        }

        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-dark)', fontSize: '1.5rem' }}>Mis Citas</h2>
        {citas.length === 0
          ? <div className="premium-card" style={{ color: 'var(--text-gray)', textAlign: 'center', padding: '2rem' }}>No tienes citas agendadas.</div>
          : (
            <div className="grid-modular">
              {citas.map(c => (
                <div key={c.id} className="premium-card">
                  <div className="card-header">
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Cita #{c.id}</h3>
                    <span className={`status-badge badge-${c.estado?.toLowerCase()}`}>{c.estado}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-gray)', marginTop: '0.5rem', marginBottom: '1rem' }}>
                    {c.fechaHora && <div><strong>Fecha:</strong> {new Date(c.fechaHora).toLocaleString('es-CL')}</div>}
                    {c.medico && <div style={{ marginTop: '0.3rem' }}><strong>Médico:</strong> {c.medico.nombre} — {c.medico.especialidad}</div>}
                  </div>
                  {c.estado === 'PROGRAMADA' && (
                    <button className="btn btn-outline" style={{ width: '100%', padding: '0.6rem', color: 'var(--status-high-text)', borderColor: 'var(--status-high-text)' }} onClick={() => onCancelarCita(c.id)} disabled={cancelando}>
                      Cancelar Cita
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        }

      </div>
    </div>
  );
}