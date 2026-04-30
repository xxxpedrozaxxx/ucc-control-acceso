import React, { useState, useEffect } from 'react';

/**
 * Modal de confirmación para bloquear o desbloquear un usuario.
 * Props:
 *   usuario     – objeto { id_institucional, nombre_completo, acceso }
 *   onConfirmar – fn(id_institucional, nuevoAcceso, motivo?)
 *   onCerrar    – fn()
 */
export const AccesoModal = ({ usuario, onConfirmar, onCerrar }) => {
  const [cargando, setCargando] = useState(false);

  // Bloquear scroll del body mientras el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!usuario) return null;

  const esBloqueando = usuario.acceso === 'activo';
  const nuevoAcceso  = esBloqueando ? 'bloqueado' : 'activo';

  const color = esBloqueando
    ? { bg: 'bg-red-600',   ring: 'ring-red-100',   btn: 'bg-red-600 hover:bg-red-700',   iconBg: 'bg-red-100'  }
    : { bg: 'bg-ucc-green', ring: 'ring-green-100',  btn: 'bg-ucc-green hover:bg-ucc-green-dark', iconBg: 'bg-green-100' };

  const handleConfirmar = async () => {
    setCargando(true);
    try {
      await onConfirmar(usuario.id_institucional, nuevoAcceso);
    } catch (err) {
      console.error('toggleAcceso error:', err);
    } finally {
      setCargando(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fadeIn">

        {/* Header */}
        <div className={`${color.bg} px-6 pt-6 pb-5`}>
          <div className={`w-12 h-12 rounded-xl ${color.iconBg} flex items-center justify-center mb-4`}>
            {esBloqueando ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#DC2626" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#15803D" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            )}
          </div>
          <h2 className="text-white font-bold text-lg leading-tight">
            {esBloqueando ? 'Bloquear usuario' : 'Desbloquear usuario'}
          </h2>
          <p className="text-white/75 text-sm mt-1">
            {usuario.nombre_completo} · ID {usuario.id_institucional}
          </p>
        </div>

        {/* Cuerpo */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-gray-600 text-sm">
            {esBloqueando
              ? 'Esto impedirá que el usuario acceda mediante su ID en el portal. Podés agregar un motivo opcional.'
              : 'Se habilitará nuevamente el acceso del usuario mediante ID en el portal.'}
          </p>

          {/* Acciones */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onCerrar}
              disabled={cargando}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmar}
              disabled={cargando}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60 ${color.btn}`}
            >
              {cargando
                ? 'Procesando...'
                : esBloqueando ? 'Confirmar bloqueo' : 'Confirmar desbloqueo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
