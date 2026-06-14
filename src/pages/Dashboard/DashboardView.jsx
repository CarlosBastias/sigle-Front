import React, { useState } from 'react';

function InputError({ error }) {
  if (!error) return null;
  return <span style={{ color: 'var(--status-high-text)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{error}</span>;
}

export default function DashboardView({
  metricas, establecimientos, listas, medicos, loading, error,
  rutBusqueda, pacienteBuscado, buscando, mostrarFormPaciente,
  mensajePaciente, guardando, formPaciente, editandoPaciente, formEdicion, estadosEditando,
  erroresForm, erroresEdicion, paginaActual, totalPaginas, totalElementos,
  onBuscarPaciente, onRutChange, onRegistrarPaciente, onToggleForm, onFormChange,
  onEditarClick, onCancelarEdicion, onFormEdicionChange, onActualizarPaciente,
  onEstadoLocalChange, onGuardarEstado, onCambiarPagina
}) {
  const [mostrarListas, setMostrarListas] = useState(true);
  const [mostrarEstablecimientos, setMostrarEstablecimientos] = useState(false);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '3rem', color: 'var(--color-primary)' }}>✚</div>
      <p style={{ color: 'var(--text-gray)', fontWeight: 600 }}>Cargando datos operativos...</p>
    </div>
  );

  if (error) return (
    <div className="container" style={{ paddingTop: '3rem' }}>
      <div style={{ backgroundColor: 'var(--status-high-bg)', color: 'var(--status-high-text)', padding: '1.5rem', borderRadius: '8px', fontWeight: 600 }}>
        {error}
      </div>
    </div>
  );

  return (
    <div className="animate-entrance">
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--text-dark)', marginBottom: '0.2rem' }}>Centro Operativo Provincial</h1>
            <p style={{ color: 'var(--text-gray)' }}>Visión global y cuadro de mando integral de la red asistencial.</p>
          </div>
          <button className="btn btn-primary" onClick={onToggleForm}>
            {mostrarFormPaciente ? 'Cancelar' : '+ Registrar Paciente'}
          </button>
        </div>

        {mensajePaciente && (
          <div style={{ backgroundColor: mensajePaciente.tipo === 'exito' ? 'var(--status-low-bg)' : 'var(--status-high-bg)', color: mensajePaciente.tipo === 'exito' ? 'var(--status-low-text)' : 'var(--status-high-text)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontWeight: 600 }}>
            {mensajePaciente.texto}
          </div>
        )}

        {/* FORMULARIO REGISTRAR */}
        {mostrarFormPaciente && (
          <div className="premium-card" style={{ marginBottom: '3rem', borderLeft: '4px solid var(--color-primary)' }}>
            <div className="card-header">
              <h3 style={{ margin: 0 }}>Registrar Paciente en Lista de Espera</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label className="input-label">Nombre *</label>
                <input type="text" className="input-control" value={formPaciente.nombre} onChange={e => onFormChange('nombre', e.target.value)} style={{ borderColor: erroresForm.nombre ? 'var(--status-high-text)' : '' }} />
                <InputError error={erroresForm.nombre} />
              </div>
              <div>
                <label className="input-label">Apellido *</label>
                <input type="text" className="input-control" value={formPaciente.apellido} onChange={e => onFormChange('apellido', e.target.value)} style={{ borderColor: erroresForm.apellido ? 'var(--status-high-text)' : '' }} />
                <InputError error={erroresForm.apellido} />
              </div>
              <div>
                <label className="input-label">RUT *</label>
                <input type="text" className="input-control" placeholder="12345678-9" value={formPaciente.rut} onChange={e => onFormChange('rut', e.target.value)} style={{ borderColor: erroresForm.rut ? 'var(--status-high-text)' : '' }} />
                <InputError error={erroresForm.rut} />
              </div>
              <div>
                <label className="input-label">Email</label>
                <input type="email" className="input-control" value={formPaciente.email} onChange={e => onFormChange('email', e.target.value)} style={{ borderColor: erroresForm.email ? 'var(--status-high-text)' : '' }} />
                <InputError error={erroresForm.email} />
              </div>
              <div>
                <label className="input-label">Teléfono</label>
                <input type="text" className="input-control" value={formPaciente.telefono} onChange={e => onFormChange('telefono', e.target.value)} style={{ borderColor: erroresForm.telefono ? 'var(--status-high-text)' : '' }} />
                <InputError error={erroresForm.telefono} />
              </div>
              <div>
                <label className="input-label">Fecha de Nacimiento</label>
                <input type="date" className="input-control" value={formPaciente.fechaNacimiento} onChange={e => onFormChange('fechaNacimiento', e.target.value)} />
              </div>
              <div>
                <label className="input-label">Establecimiento</label>
                <select className="input-control" value={formPaciente.establecimientoId} onChange={e => onFormChange('establecimientoId', e.target.value)}>
                  <option value="">Selecciona un establecimiento</option>
                  {establecimientos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Especialidad *</label>
                <input type="text" className="input-control" placeholder="Ej. Cardiología" value={formPaciente.especialidad} onChange={e => onFormChange('especialidad', e.target.value)} style={{ borderColor: erroresForm.especialidad ? 'var(--status-high-text)' : '' }} />
                <InputError error={erroresForm.especialidad} />
              </div>
              <div>
                <label className="input-label">Diagnóstico *</label>
                <input type="text" className="input-control" value={formPaciente.diagnostico} onChange={e => onFormChange('diagnostico', e.target.value)} style={{ borderColor: erroresForm.diagnostico ? 'var(--status-high-text)' : '' }} />
                <InputError error={erroresForm.diagnostico} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                <input type="checkbox" id="ges" checked={formPaciente.perteneceGes} onChange={e => onFormChange('perteneceGes', e.target.checked)} />
                <label htmlFor="ges" className="input-label" style={{ margin: 0 }}>Pertenece a GES</label>
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: '1.5rem', minWidth: '200px' }} onClick={onRegistrarPaciente} disabled={guardando}>
              {guardando ? 'Registrando...' : 'Registrar en Lista de Espera'}
            </button>
          </div>
        )}

        {/* MÉTRICAS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="metric-box">
            <div className="metric-title">Listas de Espera</div>
            <div className="metric-number">{metricas?.totalListasEspera ?? totalElementos}</div>
          </div>
          <div className="metric-box" style={{ borderLeftColor: 'var(--status-low-text)' }}>
            <div className="metric-title">Médicos en Red</div>
            <div className="metric-number">{medicos.length}</div>
          </div>
          <div className="metric-box" style={{ borderLeftColor: 'var(--status-high-text)' }}>
            <div className="metric-title">Establecimientos</div>
            <div className="metric-number">{establecimientos.length}</div>
          </div>
        </div>

        {/* GESTIÓN DE FICHA */}
        <div className="premium-card" style={{ marginBottom: '3rem' }}>
          <div className="card-header"><h3>Gestión de Ficha Clínica</h3></div>
          <div style={{ maxWidth: '800px', marginTop: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <input type="text" className="input-control" placeholder="RUT del paciente..." value={rutBusqueda} onChange={onRutChange} onKeyDown={e => e.key === 'Enter' && onBuscarPaciente()} />
              <button className="btn btn-primary" style={{ minWidth: '150px' }} onClick={onBuscarPaciente} disabled={buscando}>Buscar</button>
            </div>
            {pacienteBuscado && !pacienteBuscado.error && (
              <div className="premium-card" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', marginTop: '1.5rem' }}>
                {!editandoPaciente ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{pacienteBuscado.nombre} {pacienteBuscado.apellido}</h4>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginTop: '0.4rem', display: 'flex', gap: '1.5rem' }}>
                        <span>{pacienteBuscado.rut}</span>
                        <span>{pacienteBuscado.email}</span>
                        <span>{pacienteBuscado.telefono || 'Sin registro'}</span>
                      </div>
                    </div>
                    <button className="btn btn-outline" onClick={onEditarClick}>Editar Ficha</button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}><h4 style={{ margin: 0 }}>Actualizar Datos de Paciente</h4></div>
                    <div>
                      <label className="input-label">Nombre *</label>
                      <input type="text" className="input-control" value={formEdicion.nombre} onChange={e => onFormEdicionChange('nombre', e.target.value)} style={{ borderColor: erroresEdicion.nombre ? 'var(--status-high-text)' : '' }} />
                      <InputError error={erroresEdicion.nombre} />
                    </div>
                    <div>
                      <label className="input-label">Apellido *</label>
                      <input type="text" className="input-control" value={formEdicion.apellido} onChange={e => onFormEdicionChange('apellido', e.target.value)} style={{ borderColor: erroresEdicion.apellido ? 'var(--status-high-text)' : '' }} />
                      <InputError error={erroresEdicion.apellido} />
                    </div>
                    <div>
                      <label className="input-label">Email</label>
                      <input type="email" className="input-control" value={formEdicion.email} onChange={e => onFormEdicionChange('email', e.target.value)} style={{ borderColor: erroresEdicion.email ? 'var(--status-high-text)' : '' }} />
                      <InputError error={erroresEdicion.email} />
                    </div>
                    <div>
                      <label className="input-label">Teléfono</label>
                      <input type="text" className="input-control" value={formEdicion.telefono} onChange={e => onFormEdicionChange('telefono', e.target.value)} style={{ borderColor: erroresEdicion.telefono ? 'var(--status-high-text)' : '' }} />
                      <InputError error={erroresEdicion.telefono} />
                    </div>
                    <div>
                      <label className="input-label">F. Nacimiento</label>
                      <input type="date" className="input-control" value={formEdicion.fechaNacimiento} onChange={e => onFormEdicionChange('fechaNacimiento', e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', gridColumn: '1 / -1', marginTop: '1rem' }}>
                      <button className="btn btn-primary" onClick={onActualizarPaciente}>Guardar Cambios</button>
                      <button className="btn btn-outline" onClick={onCancelarEdicion}>Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {pacienteBuscado?.error && (
              <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '8px', background: 'var(--status-high-bg)', color: 'var(--status-high-text)' }}>
                {pacienteBuscado.error}
              </div>
            )}
          </div>
        </div>

        {/* LISTAS DE ESPERA */}
        <div className="premium-card" style={{ marginBottom: '3rem' }}>
          <div className="card-header" style={{ cursor: 'pointer' }} onClick={() => setMostrarListas(!mostrarListas)}>
            <h3 style={{ margin: 0 }}>Monitor de Listas de Espera</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="status-badge badge-media">{totalElementos} registros</span>
              <span style={{ fontSize: '1.2rem', color: 'var(--text-gray)' }}>{mostrarListas ? '▲' : '▼'}</span>
            </div>
          </div>
          {mostrarListas && (
            <>
              <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                      {['ID', 'Especialidad', 'Diagnóstico', 'Prioridad', 'Estado', 'Acción', 'GES'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {listas.map(l => (
                      <tr key={l.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>#{l.id}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>{l.especialidad}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-gray)' }}>{l.diagnostico}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span className={`status-badge badge-${l.prioridad?.toLowerCase()}`}>{l.prioridad}</span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <select className="input-control" style={{ width: 'auto', padding: '0.2rem' }} value={estadosEditando[l.id] || l.estado} onChange={(e) => onEstadoLocalChange(l.id, e.target.value)}>
                            <option value="ESPERA">ESPERA</option>
                            <option value="AGENDADO">AGENDADO</option>
                            <option value="ATENDIDO">ATENDIDO</option>
                            <option value="CANCELADO">CANCELADO</option>
                          </select>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {estadosEditando[l.id] && estadosEditando[l.id] !== l.estado && (
                            <button className="btn btn-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} onClick={() => onGuardarEstado(l.id)}>Guardar</button>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>{l.perteneceGes ? '✅' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINACIÓN */}
              {totalPaginas > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '0 0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                    Página {paginaActual + 1} de {totalPaginas} — {totalElementos} registros
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                      onClick={() => onCambiarPagina(paginaActual - 1)}
                      disabled={paginaActual === 0}
                    >
                      Anterior
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                      onClick={() => onCambiarPagina(paginaActual + 1)}
                      disabled={paginaActual >= totalPaginas - 1}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ESTABLECIMIENTOS */}
        <div className="premium-card">
          <div className="card-header" style={{ cursor: 'pointer' }} onClick={() => setMostrarEstablecimientos(!mostrarEstablecimientos)}>
            <h3 style={{ margin: 0 }}>Establecimientos de la Red</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="status-badge badge-baja">{establecimientos.length} activos</span>
              <span style={{ fontSize: '1.2rem', color: 'var(--text-gray)' }}>{mostrarEstablecimientos ? '▲' : '▼'}</span>
            </div>
          </div>
          {mostrarEstablecimientos && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              {establecimientos.map(e => (
                <div key={e.id} style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-subtle)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem' }}>{e.nombre}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{e.region}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>{e.tipo}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}