import React from 'react';

export default function DashboardView({
  metricas, establecimientos, listas, medicos, loading, error,
  rutBusqueda, pacienteBuscado, buscando, mostrarFormPaciente,
  mensajePaciente, guardando, formPaciente, editandoPaciente, formEdicion, estadosEditando,
  onBuscarPaciente, onRutChange, onRegistrarPaciente, onToggleForm, onFormChange,
  onEditarClick, onCancelarEdicion, onFormEdicionChange, onActualizarPaciente, onEliminarPaciente,
  onEstadoLocalChange, onGuardarEstado
}) {
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
      <div className="container" style={{ paddingTop: '3rem' }}>

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

        {/* Formulario registrar paciente */}
        {mostrarFormPaciente && (
          <div className="premium-card" style={{ marginBottom: '3rem', borderLeft: '4px solid var(--color-primary)' }}>
            <div className="card-header">
              <h3 style={{ margin: 0 }}>Registrar Paciente en Lista de Espera</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label className="input-label">Nombre</label>
                <input type="text" className="input-control" value={formPaciente.nombre} onChange={e => onFormChange('nombre', e.target.value)} />
              </div>
              <div>
                <label className="input-label">Apellido</label>
                <input type="text" className="input-control" value={formPaciente.apellido} onChange={e => onFormChange('apellido', e.target.value)} />
              </div>
              <div>
                <label className="input-label">RUT</label>
                <input type="text" className="input-control" placeholder="12345678-9" value={formPaciente.rut} onChange={e => onFormChange('rut', e.target.value)} />
              </div>
              <div>
                <label className="input-label">Email</label>
                <input type="email" className="input-control" value={formPaciente.email} onChange={e => onFormChange('email', e.target.value)} />
              </div>
              <div>
                <label className="input-label">Teléfono</label>
                <input type="text" className="input-control" value={formPaciente.telefono} onChange={e => onFormChange('telefono', e.target.value)} />
              </div>
              <div>
                <label className="input-label">Fecha de Nacimiento</label>
                <input type="date" className="input-control" value={formPaciente.fechaNacimiento} onChange={e => onFormChange('fechaNacimiento', e.target.value)} />
              </div>
              <div>
                <label className="input-label">Establecimiento</label>
                <select className="input-control" value={formPaciente.establecimientoId} onChange={e => onFormChange('establecimientoId', e.target.value)}>
                  <option value="">Selecciona un establecimiento</option>
                  {establecimientos.map(e => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Especialidad</label>
                <input type="text" className="input-control" placeholder="Ej. Cardiología" value={formPaciente.especialidad} onChange={e => onFormChange('especialidad', e.target.value)} />
              </div>
              <div>
                <label className="input-label">Diagnóstico</label>
                <input type="text" className="input-control" value={formPaciente.diagnostico} onChange={e => onFormChange('diagnostico', e.target.value)} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                <input type="checkbox" id="ges" checked={formPaciente.perteneceGes} onChange={e => onFormChange('perteneceGes', e.target.checked)} />
                <label htmlFor="ges" className="input-label" style={{ margin: 0 }}>Pertenece a GES</label>
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ marginTop: '1.5rem', minWidth: '200px' }}
              onClick={onRegistrarPaciente}
              disabled={guardando}
            >
              {guardando ? 'Registrando...' : 'Registrar en Lista de Espera'}
            </button>
          </div>
        )}

        {/* Métricas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="metric-box">
            <div className="metric-title">Listas de Espera Activas</div>
            <div className="metric-number">{metricas?.totalListasEspera ?? listas.length}</div>
          </div>
          <div className="metric-box" style={{ borderLeftColor: 'var(--status-low-text)' }}>
            <div className="metric-title">Médicos Registrados</div>
            <div className="metric-number">{metricas?.totalMedicos ?? medicos.length}</div>
          </div>
          <div className="metric-box" style={{ borderLeftColor: 'var(--status-high-text)' }}>
            <div className="metric-title">Establecimientos Activos</div>
            <div className="metric-number">{metricas?.totalEstablecimientos ?? establecimientos.length}</div>
          </div>
        </div>

        {/* Buscador de paciente */}
        <div className="premium-card" style={{ marginBottom: '3rem' }}>
          <div className="card-header">
            <h3 style={{ margin: 0 }}>Triaje y Gestión de Paciente</h3>
            <span className="status-badge badge-baja">Buscador Activo</span>
          </div>
          <div style={{ maxWidth: '800px' }}>
            <p style={{ color: 'var(--text-gray)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Ingrese el RUT del paciente para localizar su ficha en las listas de espera.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                className="input-control"
                placeholder="Ej. 18234567-8"
                style={{ flex: 1 }}
                value={rutBusqueda}
                onChange={onRutChange}
                onKeyDown={e => {
                  const permitidas = /^[0-9kK\-]$/;
                  const esTeclaControl = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Enter'].includes(e.key);
                  if (!permitidas.test(e.key) && !esTeclaControl) {
                    e.preventDefault();
                  }
                  if (e.key === 'Enter') onBuscarPaciente();
                }}
              />
              <button className="btn btn-primary" style={{ minWidth: '150px' }} onClick={onBuscarPaciente} disabled={buscando}>
                {buscando ? 'Buscando...' : 'Buscar Ficha'}
              </button>
            </div>

            {pacienteBuscado && !pacienteBuscado.error && (
              <div className="premium-card" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
                {!editandoPaciente ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)' }}>{pacienteBuscado.nombre} {pacienteBuscado.apellido}</h4>
                        <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>RUT: {pacienteBuscado.rut}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline" onClick={onEditarClick}>Editar Datos</button>
                        <button className="btn btn-outline" style={{ borderColor: 'var(--status-high-text)', color: 'var(--status-high-text)' }} onClick={onEliminarPaciente}>Eliminar</button>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
                      <div><strong>Email:</strong> {pacienteBuscado.email || 'No registrado'}</div>
                      <div><strong>Teléfono:</strong> {pacienteBuscado.telefono || 'No registrado'}</div>
                      <div><strong>Nacimiento:</strong> {pacienteBuscado.fechaNacimiento || 'No registrado'}</div>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ margin: 0 }}>Editando Datos de Paciente</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label className="input-label">Nombre</label>
                        <input type="text" className="input-control" value={formEdicion.nombre} onChange={e => onFormEdicionChange('nombre', e.target.value)} />
                      </div>
                      <div>
                        <label className="input-label">Apellido</label>
                        <input type="text" className="input-control" value={formEdicion.apellido} onChange={e => onFormEdicionChange('apellido', e.target.value)} />
                      </div>
                      <div>
                        <label className="input-label">Email</label>
                        <input type="email" className="input-control" value={formEdicion.email} onChange={e => onFormEdicionChange('email', e.target.value)} />
                      </div>
                      <div>
                        <label className="input-label">Teléfono</label>
                        <input type="text" className="input-control" value={formEdicion.telefono} onChange={e => onFormEdicionChange('telefono', e.target.value)} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button className="btn btn-primary" onClick={onActualizarPaciente} disabled={guardando}>Guardar Cambios</button>
                      <button className="btn btn-outline" onClick={onCancelarEdicion}>Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {pacienteBuscado && pacienteBuscado.error && (
              <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '8px', background: 'var(--status-high-bg)', color: 'var(--status-high-text)', fontWeight: 600 }}>
                {pacienteBuscado.error}
              </div>
            )}
          </div>
        </div>

        {/* Listas de espera */}
        <div className="premium-card" style={{ marginBottom: '3rem' }}>
          <div className="card-header">
            <h3 style={{ margin: 0 }}>Listas de Espera</h3>
            <span className="status-badge badge-media">{listas.length} registros</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  {['ID', 'Paciente', 'Especialidad', 'Diagnóstico', 'Prioridad', 'Estado', 'GES'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listas.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>#{l.id}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{l.paciente?.nombre} {l.paciente?.apellido}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>{l.paciente?.rut}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>{l.especialidad}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-gray)' }}>{l.diagnostico}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`status-badge badge-${l.prioridad?.toLowerCase()}`}>{l.prioridad}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <select 
                          className="input-control" 
                          style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', width: 'auto' }}
                          value={estadosEditando[l.id] || l.estado}
                          onChange={(e) => onEstadoLocalChange(l.id, e.target.value)}
                        >
                          <option value="EN ESPERA">EN ESPERA</option>
                          <option value="ASISTIDO">ASISTIDO</option>
                          <option value="CANCELADO">CANCELADO</option>
                          <option value="REPROGRAMADO">REPROGRAMADO</option>
                        </select>
                        {estadosEditando[l.id] && estadosEditando[l.id] !== l.estado && (
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                            onClick={() => onGuardarEstado(l.id)}
                          >
                            Guardar
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>{l.perteneceGes ? '✅' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Establecimientos */}
        <div className="premium-card">
          <div className="card-header">
            <h3 style={{ margin: 0 }}>Establecimientos de la Red</h3>
            <span className="status-badge badge-baja">{establecimientos.length} activos</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {establecimientos.map(e => (
              <div key={e.id} style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-subtle)' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.3rem' }}>{e.nombre}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{e.region}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>{e.tipo}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}