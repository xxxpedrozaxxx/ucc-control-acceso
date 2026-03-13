import React from 'react';

/**
 * Tarjeta de estadística individual para el dashboard
 */
export const StatCard = ({ titulo, valor, icono, colorIcono = 'text-green-600', bgIcono = 'bg-green-50' }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
    <div className={`w-12 h-12 rounded-full ${bgIcono} flex items-center justify-center flex-shrink-0`}>
      <span className={`text-2xl ${colorIcono}`}>{icono}</span>
    </div>
    <div>
      <p className="text-3xl font-bold text-gray-800 leading-none">{valor ?? '—'}</p>
      <p className="text-sm text-gray-500 mt-1">{titulo}</p>
    </div>
  </div>
);
