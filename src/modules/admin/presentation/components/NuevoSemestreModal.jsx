import React, { useState } from 'react';

/**
 * Modal de dos pasos para iniciar un nuevo semestre:
 *  1. Formulario: nombre del semestre + fecha inicio + fecha fin
 *  2. Confirmación: resumen + advertencia de borrado de datos
 *
 * Props:
 *   visible    {boolean}
 *   onCerrar   {() => void}
 *   onConfirmar{(nombre, fechaInicio, fechaFin) => void}
 *   cargando   {boolean}
 */
export const NuevoSemestreModal = ({ visible, onCerrar, onConfirmar, cargando, error }) => {
  const [paso,        setPaso]        = useState('datos');
  const [nombre,      setNombre]      = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin,    setFechaFin]    = useState('');

  if (!visible) return null;

  const fechasValidas = fechaInicio && fechaFin && fechaFin > fechaInicio;

  const handleCerrar = () => {
    setPaso('datos');
    setNombre('');
    setFechaInicio('');
    setFechaFin('');
    onCerrar();
  };

  const formatearFecha = (iso) =>
    new Date(iso + 'T12:00:00').toLocaleDateString('es-CO', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

        {/* ── Encabezado ── */}
        <div className="bg-[#1B4332] px-6 py-5">
          <h2 className="text-white font-bold text-lg">Iniciar nuevo semestre</h2>
          <p className="text-green-200 text-xs mt-1">
            {paso === 'datos'
              ? 'Define el período académico'
              : 'Confirma la acción — no se puede deshacer'}
          </p>
        </div>

        {/* ── Paso 1: Formulario ── */}
        {paso === 'datos' && (
          <div className="px-6 py-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Nombre del semestre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="ej. 2026-1"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={e => setFechaInicio(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Fecha de fin
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={e => setFechaFin(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                />
              </div>
            </div>

            {fechaInicio && fechaFin && !fechasValidas && (
              <p className="text-xs text-red-500">
                La fecha de fin debe ser posterior a la de inicio.
              </p>
            )}
          </div>
        )}

        {/* ── Paso 2: Confirmación ── */}
        {paso === 'confirmar' && (
          <div className="px-6 py-6 space-y-4">
            {/* Advertencia */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-800 mb-2">
                ⚠️ Esta acción eliminará permanentemente:
              </p>
              <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                <li>Todos los usuarios registrados</li>
                <li>Roles asignados (estudiantes, empleados, contratistas)</li>
                <li>Todas las fallas registradas</li>
              </ul>
              <p className="text-xs text-amber-700 mt-2 font-medium">
                Deberás cargar los CSV nuevamente para el nuevo semestre.
              </p>
            </div>

            {/* Error de Supabase */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-xs text-red-700 font-medium">Error al procesar:</p>
                <p className="text-xs text-red-600 mt-0.5">{error}</p>
              </div>
            )}

            {/* Resumen del nuevo semestre */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Semestre</span>
                <span className="font-bold text-gray-800">{nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Inicio</span>
                <span className="text-gray-700">{formatearFecha(fechaInicio)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Fin</span>
                <span className="text-gray-700">{formatearFecha(fechaFin)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer / Botones ── */}
        <div className="px-6 pb-6 flex gap-3 justify-end">
          {paso === 'datos' ? (
            <>
              <button
                onClick={handleCerrar}
                className="text-sm text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setPaso('confirmar')}
                disabled={!nombre.trim() || !fechasValidas}
                className="text-sm bg-[#1B4332] text-white px-5 py-2 rounded-lg hover:bg-[#1B6B3A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continuar →
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setPaso('datos')}
                disabled={cargando}
                className="text-sm text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                ← Atrás
              </button>
              <button
                onClick={() => onConfirmar(nombre.trim(), fechaInicio, fechaFin)}
                disabled={cargando}
                className="text-sm bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {cargando ? 'Procesando...' : 'Confirmar y limpiar datos'}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
