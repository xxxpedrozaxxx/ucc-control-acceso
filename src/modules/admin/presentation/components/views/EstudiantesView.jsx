import React, { useState } from 'react';
import { AccesoModal } from '../AccesoModal';

const BADGE_ESTADO = {
  activo:    'bg-green-100 text-green-700',
  bloqueado: 'bg-red-100 text-red-600',
};

const BADGE_ROL = {
  estudiante:  'bg-blue-100 text-blue-700',
  empleado:    'bg-purple-100 text-purple-700',
  contratista: 'bg-orange-100 text-orange-700',
};

/**
 * Vista de listado completo de usuarios con buscador y filtros.
 */
export const UsuariosView = ({ usuarios, loading, onToggleAcceso }) => {
  const [busqueda,      setBusqueda]      = useState('');
  const [filtroAcceso,  setFiltroAcceso]  = useState('todos');
  const [modalUsuario,  setModalUsuario]  = useState(null); // usuario seleccionado para modal

  const handleConfirmar = async (id, nuevoAcceso) => {
    try {
      await onToggleAcceso(id, nuevoAcceso);
    } finally {
      setModalUsuario(null);
    }
  };

  const filtrados = usuarios.filter(u => {
    const coincideBusqueda =
      u.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.id_institucional?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.infoExtra?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.roles?.some(r => r.toLowerCase().includes(busqueda.toLowerCase()));

    const coincideAcceso =
      filtroAcceso === 'todos' || u.acceso === filtroAcceso;

    return coincideBusqueda && coincideAcceso;
  });

  return (
    <div className="space-y-4">
      {/* Modal bloqueo/desbloqueo */}
      {modalUsuario && (
        <AccesoModal
          usuario={modalUsuario}
          onConfirmar={handleConfirmar}
          onCerrar={() => setModalUsuario(null)}
        />
      )}
      {/* Barra de búsqueda + filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-gray-400 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, ID, rol o información..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-400"
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
          )}
        </div>

        {/* Filtro de estado */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl px-2 py-1.5 shadow-sm">
          {['todos', 'activo', 'bloqueado'].map(op => (
            <button
              key={op}
              onClick={() => setFiltroAcceso(op)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${
                filtroAcceso === op
                  ? 'bg-green-700 text-white'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {op === 'todos' ? 'Todos' : op === 'activo' ? 'Activos' : 'Bloqueados'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="font-semibold text-gray-800">Lista de usuarios</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {loading ? 'Cargando...' : `${filtrados.length} usuario${filtrados.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Cargando usuarios...</div>
        ) : filtrados.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            {busqueda || filtroAcceso !== 'todos' ? 'No hay resultados para tu búsqueda.' : 'No hay usuarios registrados.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-medium">ID </th>
                  <th className="px-5 py-3 text-left font-medium">Nombre completo</th>
                  <th className="px-5 py-3 text-left font-medium">Rol(es)</th>
                  <th className="px-5 py-3 text-left font-medium">Info</th>
                  <th className="px-5 py-3 text-center font-medium">Fallas</th>
                  <th className="px-5 py-3 text-center font-medium">Estado</th>
                  <th className="px-5 py-3 text-center font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrados.map(u => (
                  <tr key={u.id_institucional} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-gray-600 text-xs">{u.id_institucional}</td>
                    <td className="px-5 py-3.5 text-gray-800 font-medium whitespace-nowrap">{u.nombre_completo}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.length > 0
                          ? u.roles.map(r => (
                              <span
                                key={r}
                                className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${BADGE_ROL[r.toLowerCase()] ?? 'bg-gray-100 text-gray-500'}`}
                              >
                                {r}
                              </span>
                            ))
                          : <span className="text-gray-300 text-xs">Sin rol</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {u.infoItems?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {u.infoItems.map((item, i) => (
                            <span
                              key={i}
                              title={item.valor}
                              className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium max-w-[160px] truncate ${
                                item.tipo === 'programa'    ? 'bg-blue-50 text-blue-700' :
                                item.tipo === 'dependencia' ? 'bg-purple-50 text-purple-700' :
                                item.tipo === 'empresa'     ? 'bg-orange-50 text-orange-700' :
                                'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {item.valor}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`font-semibold ${u.total_fallas >= 3 ? 'text-red-500' : 'text-gray-700'}`}>
                        {u.total_fallas}
                      </span>
                      <span className="text-gray-300 text-xs"> / 4</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${BADGE_ESTADO[u.acceso] ?? 'bg-gray-100 text-gray-500'}`}>
                        {u.acceso === 'activo' ? 'Activo' : 'Bloqueado'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {u.acceso === 'activo' ? (
                        <button
                          onClick={() => setModalUsuario(u)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                          </svg>
                          Bloquear
                        </button>
                      ) : (
                        <button
                          onClick={() => setModalUsuario(u)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-200 text-green-700 text-xs font-medium hover:bg-green-50 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                          </svg>
                          Desbloquear
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
