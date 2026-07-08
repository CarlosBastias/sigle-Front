import React, { useState } from 'react';

export default function MedicoView({
  medicoSeleccionado, establecimientos, especialidades,
  formPerfil, guardandoPerfil, errorPerfil,
  citas, pacientesLista, pacientesMap,
  loading, loadingPacientes, error, mensajeAccion,
  pacienteEditando, pacienteCompleto, formEdicion, guardando,
  onFormPerfilChange, onGuardarPerfil,
  onEditarPaciente, onCancelarEdicion,
  onFormEdicionChange, onGuardarCambios
}) {
  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split('T')[0]);

  const citasFiltradas = citas.filter(c => {
    if (!c.fechaHora) return false;
    return c.fechaHora.startsWith(fechaFiltro);
  });

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '3rem', color: 'var(--color-primary)' }}>✚</div>
      <p style={{ color: 'var(--text-gray)', fontWeight: 600 }}>Cargando...</p>
    </div>
  );

  return (
    <div className="animate-entrance">
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>

        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-dark)', marginBottom: '0.2rem' }}>Portal Médico</h1>
          <p style={{ color: 'var(--text-gray)' }}>Gestión de pacientes y citas de la Red Asistencial.</p>
        </div>

        {error && <div style={{ backgroundColor: 'var(--status-high-bg)', color: 'var(--status-high-text)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontWeight: 600 }}>{error}</div>}

        {mensajeAccion && (
          <div style={{ backgroundColor: mensajeAccion.tipo === 'exito' ? 'var(--status-low-bg)' : 'var(--status-high-bg)', color: mensajeAccion.tipo === 'exito' ? 'var(--status-low-text)' : 'var(--status-high-text)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontWeight: 600 }}>
            {mensajeAccion.texto}
          </div>
        )}

        {/* PRIMERA VEZ: completar ficha profesional */}
        {!medicoSeleccionado && (
          <div className="premium-card" style={{ marginBottom: '3rem' }}>
            <div className="card-header">
              <h3 style={{ margin: 0 }}>Completa tu ficha profesional</h3>
            </div>
            <p style={{ color: 'var(--text-gray)', marginTop: '0.5rem' }}>
              Es tu primera vez ingresando al portal médico. Completa tus datos para quedar
              disponible y que los pacientes puedan agendar hora contigo.
            </p>

            {errorPerfil && (
              <div style={{ backgroundColor: 'var(--status-high-bg)', color: 'var(--status-high-text)', padding: '0.75rem 1rem', borderRadius: '8px', margin: '1rem 0', fontWeight: 600 }}>
                {errorPerfil}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', maxWidth: '600px' }}>
              <div>
                <label className="input-label">Nombre completo</label>
                <input
                  type="text" className="input-control"
                  placeholder="Dr. Juan Pérez"
                  value={formPerfil.nombre}
                  onChange={e => onFormPerfilChange('nombre', e.target.value)}
                />
              </div>
              <div>
                <label className="input-label">RUT</label>
                <input
                  type="text" className="input-control"
                  placeholder="12.345.678-9"
                  value={formPerfil.rut}
                  onChange={e => onFormPerfilChange('rut', e.target.value)}
                />
              </div>
              <div>
                <label className="input-label">Especialidad</label>
                <select
                  className="input-control"
                  value={formPerfil.especialidad}
                  onChange={e => onFormPerfilChange('especialidad', e.target.value)}
                >
                  <option value="">Selecciona tu especialidad</option>
                  {especialidades.map(esp => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Establecimiento</label>
                <select
                  className="input-control"
                  value={formPerfil.establecimientoId}
                  onChange={e => onFormPerfilChange('establecimientoId', e.target.value)}
                >
                  <option value="">Selecciona tu establecimiento</option>
                  {establecimientos.map(e => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ marginTop: '1.5rem' }}
              onClick={onGuardarPerfil}
              disabled={guardandoPerfil}
            >
              {guardandoPerfil ? 'Guardando...' : 'Guardar y continuar'}
            </button>
          </div>
        )}

        {medicoSeleccionado && (
          <>
            <div className="premium-card" style={{ marginBottom: '3rem', borderLeft: '4px solid var(--color-primary)' }}>
              <h2 style={{ margin: 0, color: 'var(--text-dark)' }}>{medicoSeleccionado.nombre}</h2>
              <p style={{ margin: '0.3rem 0 0', color: 'var(--color-primary)', fontWeight: 600 }}>{medicoSeleccionado.especialidad}</p>
            </div>

            {loadingPacientes ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-gray)' }}>Cargando pacientes...</div>
            ) : (
              <div className="premium-card">
                <div className="card-header">
                  <h3 style={{ margin: 0 }}>Citas del día</h3>
                  <span className="status-badge badge-media">{citasFiltradas.length} citas</span>
                </div>
                <div style={{ marginTop: '1rem', marginBottom: '1.5rem', maxWidth: '250px' }}>
                  <label className="input-label">Seleccionar fecha</label>
                  <input type="date" className="input-control" value={fechaFiltro} onChange={e => setFechaFiltro(e.target.value)} />
                </div>
                {citasFiltradas.length === 0
                  ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-gray)' }}>No hay citas para esta fecha.</div>
                  : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                            {['ID', 'Paciente', 'Especialidad', 'Hora', 'Estado', 'Acción'].map(h => (
                              <th key={h} style={{ padding: '0.75rem 1rem' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {citasFiltradas.map(c => {
                            const pac = pacientesMap[c.pacienteId];
                            return (
                              <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>#{c.id}</td>
                                <td style={{ padding: '0.75rem 1rem' }}>
                                  {pac ? `${pac.nombre} ${pac.apellido}` : `Paciente #${c.pacienteId}`}
                                  {pac && <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{pac.rut}</div>}
                                </td>
                                <td style={{ padding: '0.75rem 1rem' }}>{c.especialidad}</td>
                                <td style={{ padding: '0.75rem 1rem' }}>
                                  {c.fechaHora ? new Date(c.fechaHora).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '—'}
                                </td>
                                <td style={{ padding: '0.75rem 1rem' }}>
                                  <span className={`status-badge badge-${c.estado?.toLowerCase()}`}>{c.estado}</span>
                                </td>
                                <td style={{ padding: '0.75rem 1rem' }}>
                                  <button
                                    className="btn btn-primary"
                                    style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                                    onClick={() => onEditarPaciente(c)}
                                  >
                                    Ver Ficha
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )
                }
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL FICHA PACIENTE */}
      {pacienteEditando && pacienteCompleto && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}
          onClick={onCancelarEdicion}
        >
          <div
            style={{
              backgroundColor: 'white', borderRadius: '12px',
              width: '100%', maxWidth: '600px', maxHeight: '90vh',
              overflowY: 'auto', padding: '2rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: 0, color: 'var(--text-dark)' }}>{pacienteCompleto.nombre} {pacienteCompleto.apellido}</h2>
                <p style={{ margin: '0.3rem 0 0', color: 'var(--text-gray)', fontSize: '0.9rem' }}>RUT: {pacienteCompleto.rut}</p>
              </div>
              <button onClick={onCancelarEdicion} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-gray)' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px', background: 'var(--bg-subtle)' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 700 }}>Fecha Nacimiento</span>
                <span style={{ color: 'var(--text-dark)' }}>{pacienteCompleto.fechaNacimiento || '—'}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 700 }}>Prioridad</span>
                <span className={`status-badge badge-${pacienteEditando.prioridad?.toLowerCase()}`}>{pacienteEditando.prioridad}</span>
              </div>
            </div>

            <h4 style={{ margin: '0 0 1rem', color: 'var(--text-dark)' }}>Datos editables</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="input-label">Email</label>
                <input type="email" className="input-control" value={formEdicion.email} onChange={e => onFormEdicionChange('email', e.target.value)} />
              </div>
              <div>
                <label className="input-label">Teléfono</label>
                <input type="text" className="input-control" value={formEdicion.telefono} onChange={e => onFormEdicionChange('telefono', e.target.value)} />
              </div>
              <div>
                <label className="input-label">Estado Derivación</label>
                <select className="input-control" value={formEdicion.estado} onChange={e => onFormEdicionChange('estado', e.target.value)}>
                  <option value="ESPERA">ESPERA</option>
                  <option value="AGENDADO">AGENDADO</option>
                  <option value="ATENDIDO">ATENDIDO</option>
                  <option value="CANCELADO">CANCELADO</option>
                </select>
              </div>
              <div>
                <label className="input-label">Estado Cita</label>
                <select className="input-control" value={formEdicion.estadoCita} onChange={e => onFormEdicionChange('estadoCita', e.target.value)}>
                  <option value="PROGRAMADA">PROGRAMADA</option>
                  <option value="COMPLETADA">COMPLETADA</option>
                  <option value="CANCELADA">CANCELADA</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="input-label">Diagnóstico / Indicaciones del Médico</label>
              <textarea
                className="input-control"
                rows={5}
                style={{ resize: 'vertical', minHeight: '120px' }}
                value={formEdicion.diagnostico}
                onChange={e => onFormEdicionChange('diagnostico', e.target.value)}
                placeholder="Ej: Paciente presenta dolores fuertes, se recomienda tomar paracetamol cada 8 horas..."
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={onCancelarEdicion}>Cancelar</button>
              <button className="btn btn-primary" onClick={onGuardarCambios} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}