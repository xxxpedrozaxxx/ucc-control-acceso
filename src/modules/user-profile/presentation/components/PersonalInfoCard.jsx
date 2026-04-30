import React from 'react';

/**
 * Fila de información reutilizable dentro de una tarjeta
 */
const InfoRow = ({ icon, label, value, valueClassName = '' }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    <span className="text-ucc-cyan-dark mt-0.5 text-lg flex-shrink-0">{icon}</span>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-ucc-cyan-dark font-medium mb-0.5">{label}</p>
      <p className={`text-sm text-gray-800 font-semibold break-words ${valueClassName}`}>
        {value}
      </p>
    </div>
  </div>
);

/**
 * Tarjeta de Información Personal
 */
export const PersonalInfoCard = ({ user }) => {
  return (
    <div className="rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
      {/* Encabezado de la tarjeta */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <span className="text-ucc-cyan-dark"></span>
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          Información Personal
        </h2>
      </div>

      <div className="px-4">
        <InfoRow  label="ID Institucional"     value={user.id_institucional} />
        <InfoRow  label="Cédula de Ciudadanía" value={user.documento_identidad} />
      </div>
    </div>
  );
};
