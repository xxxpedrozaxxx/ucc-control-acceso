import React, { useState } from 'react';
import { useAdminManager } from '../../../application/hooks/useAdminManager';

// ─── Badge de nivel ────────────────────────────────────────────────────────
const NivelBadge = ({ nivel }) =>
  nivel === 'superadmin' ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
      ★ Superadmin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
      Admin
    </span>
  );

// ─── Modal: Crear admin ────────────────────────────────────────────────────
const ModalCrearAdmin = ({ onConfirmar, onCancelar }) => {
  const [id,         setId]         = useState('');
  const [nombre,     setNombre]     = useState('');
  const [nivel,      setNivel]      = useState('admin');
  const [contrasena, setContrasena] = useState('');
  const [confirmar,  setConfirmar]  = useState('');
  const [error,      setError]      = useState('');
  const [cargando,   setCargando]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!id.trim())            return setError('El ID institucional es obligatorio.');
    if (!nombre.trim())        return setError('El nombre completo es obligatorio.');
    if (contrasena.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');
    if (contrasena !== confirmar) return setError('Las contraseñas no coinciden.');

    setCargando(true);
    try {
      await onConfirmar(id.trim(), nombre.trim(), nivel, contrasena);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Nuevo administrador</h3>
        <p className="text-sm text-gray-500 mb-5">
          El administrador es independiente del sistema de usuarios.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ID institucional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID institucional
            </label>
            <input
              type="text"
              value={id}
              onChange={e => setId(e.target.value)}
              placeholder="Ej: 100002"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ucc-green/30 focus:border-ucc-green"
            />
          </div>

          {/* Nombre completo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: María López"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ucc-green/30 focus:border-ucc-green"
            />
          </div>

          {/* Nivel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nivel de acceso
            </label>
            <select
              value={nivel}
              onChange={e => setNivel(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ucc-green/30 focus:border-ucc-green"
            >
              <option value="admin">Admin — acceso normal al panel</option>
              <option value="superadmin">Superadmin — acceso total + gestión de admins</option>
            </select>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={contrasena}
              onChange={e => setContrasena(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ucc-green/30 focus:border-ucc-green"
            />
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              value={confirmar}
              onChange={e => setConfirmar(e.target.value)}
              placeholder="Repite la contraseña"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ucc-green/30 focus:border-ucc-green"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onCancelar}
              disabled={cargando}
              className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="flex-1 bg-ucc-green text-white rounded-lg py-2.5 text-sm font-medium hover:bg-ucc-green-dark transition-colors disabled:opacity-60"
            >
              {cargando ? 'Creando...' : 'Crear administrador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Modal: Cambiar contraseña ────────────────────────────────────────────
const ModalCambiarContrasena = ({ admin, onConfirmar, onCancelar }) => {
  const [nueva,    setNueva]    = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error,    setError]    = useState('');
  const [cargando, setCargando] = useState(false);
  const [ok,       setOk]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (nueva.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');
    if (nueva !== confirmar) return setError('Las contraseñas no coinciden.');
    setCargando(true);
    try {
      await onConfirmar(admin.id_institucional, nueva);
      setOk(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        {ok ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-base font-bold text-gray-800 mb-1">Contraseña actualizada</p>
            <p className="text-sm text-gray-500 mb-5">
              La contraseña de <span className="font-semibold">{admin.nombre_completo}</span> fue cambiada.
            </p>
            <button onClick={onCancelar} className="w-full bg-ucc-green text-white rounded-lg py-2.5 text-sm font-medium hover:bg-ucc-green-dark transition-colors">
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-ucc-green/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-ucc-green" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800">Cambiar contraseña</h3>
                <p className="text-xs text-gray-500">{admin.nombre_completo} · {admin.id_institucional}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
                <input
                  type="password"
                  value={nueva}
                  onChange={e => setNueva(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoFocus
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ucc-green/30 focus:border-ucc-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                <input
                  type="password"
                  value={confirmar}
                  onChange={e => setConfirmar(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ucc-green/30 focus:border-ucc-green"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onCancelar} disabled={cargando}
                  className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={cargando}
                  className="flex-1 bg-ucc-green text-white rounded-lg py-2.5 text-sm font-medium hover:bg-ucc-green-dark transition-colors disabled:opacity-60">
                  {cargando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Modal: Confirmar eliminación ──────────────────────────────────────────
const ModalEliminar = ({ admin, onConfirmar, onCancelar }) => {
  const [cargando, setCargando] = useState(false);

  const handleConfirmar = async () => {
    setCargando(true);
    try { await onConfirmar(admin.id_institucional); }
    finally { setCargando(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-800 mb-1">Eliminar administrador</h3>
        <p className="text-sm text-gray-500 mb-5">
          ¿Eliminar el acceso de{' '}
          <span className="font-semibold text-gray-700">{admin.nombre_completo}</span>
          {' '}al panel?
          <br />
          <span className="text-xs">Esta acción no elimina al usuario del sistema.</span>
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancelar}
            disabled={cargando}
            className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={cargando}
            className="flex-1 bg-red-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {cargando ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Vista principal ───────────────────────────────────────────────────────
export const AdminManagerView = ({ sesionActual }) => {
  const { admins, cargando, error, crearAdmin, eliminarAdmin, cambiarContrasenaAdmin, refrescar } = useAdminManager();
  const [modalCrear,      setModalCrear]      = useState(false);
  const [adminAElim,      setAdminAElim]      = useState(null);
  const [adminACambiarPass, setAdminACambiarPass] = useState(null);
  const [feedback,        setFeedback]        = useState(null); // { tipo: 'ok'|'error', msg }

  const mostrarFeedback = (tipo, msg) => {
    setFeedback({ tipo, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleCrear = async (id, nombre, nivel, contrasena) => {
    await crearAdmin(id, nombre, nivel, contrasena);
    setModalCrear(false);
    mostrarFeedback('ok', 'Administrador creado correctamente.');
  };

  const handleEliminar = async (id_institucional) => {
    await eliminarAdmin(id_institucional);
    setAdminAElim(null);
    mostrarFeedback('ok', 'Acceso de administrador eliminado.');
  };

  const handleCambiarContrasena = async (id_institucional, nuevaContrasena) => {
    await cambiarContrasenaAdmin(id_institucional, nuevaContrasena);
  };

  return (
    <>
      {/* Modales */}
      {modalCrear && (
        <ModalCrearAdmin
          onConfirmar={handleCrear}
          onCancelar={() => setModalCrear(false)}
        />
      )}
      {adminACambiarPass && (
        <ModalCambiarContrasena
          admin={adminACambiarPass}
          onConfirmar={handleCambiarContrasena}
          onCancelar={() => setAdminACambiarPass(null)}
        />
      )}
      {adminAElim && (
        <ModalEliminar
          admin={adminAElim}
          onConfirmar={handleEliminar}
          onCancelar={() => setAdminAElim(null)}
        />
      )}

      <div className="space-y-5">
        {/* Aviso de contexto */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 flex gap-3">
          <span className="text-amber-500 text-lg flex-shrink-0">★</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Módulo exclusivo para Superadmin</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Los <strong>superadmin</strong> son permanentes y no pueden eliminarse desde aquí.
              Los <strong>admin</strong> tienen acceso normal al panel pero no pueden gestionar estos perfiles.
              Al iniciar un nuevo semestre, todos los administradores se conservan.
            </p>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`rounded-xl px-5 py-3 text-sm font-medium border ${
            feedback.tipo === 'ok'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {feedback.msg}
          </div>
        )}

        {/* Cabecera + botón */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              {cargando ? 'Cargando...' : `${admins.length} administrador${admins.length !== 1 ? 'es' : ''} registrado${admins.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refrescar}
              disabled={cargando}
              title="Actualizar lista"
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
            <button
              onClick={() => setModalCrear(true)}
              className="flex items-center gap-2 bg-ucc-green text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-ucc-green-dark transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nuevo administrador
            </button>
          </div>
        </div>

        {/* Error de carga */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-3.5 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {cargando ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
              Cargando administradores...
            </div>
          ) : admins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
              <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <p className="text-sm">Sin administradores registrados</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left border-b border-gray-100">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nivel</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Creado</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Último ingreso</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {admins.map(admin => {
                  const esMiCuenta  = admin.id_institucional === sesionActual?.id_institucional;
                  const esSuperAdmin = admin.nivel === 'superadmin';
                  return (
                    <tr key={admin.id_institucional} className={`hover:bg-gray-50/50 transition-colors ${esMiCuenta ? 'bg-amber-50/30' : ''}`}>
                      <td className="px-5 py-3.5 font-medium text-gray-800">
                        {admin.nombre_completo}
                        {esMiCuenta && (
                          <span className="ml-2 text-xs text-amber-600 font-normal">(tú)</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">
                        {admin.id_institucional}
                      </td>
                      <td className="px-5 py-3.5">
                        <NivelBadge nivel={admin.nivel} />
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs">
                        {new Date(admin.creado_en).toLocaleDateString('es-CO', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs">
                        {admin.ultimo_ingreso
                          ? new Date(admin.ultimo_ingreso).toLocaleString('es-CO', {
                              day: '2-digit', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })
                          : <span className="text-gray-300">Nunca</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setAdminACambiarPass(admin)}
                            className="p-1.5 text-ucc-cyan-dark hover:text-ucc-cyan hover:bg-cyan-50 rounded-lg transition-colors"
                            title="Cambiar contraseña"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                          </button>
                          {!esSuperAdmin && (
                            <button
                              onClick={() => setAdminAElim(admin)}
                              className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};
