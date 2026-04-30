import React from 'react';

/**
 * Fila de información reutilizable
 */
const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    <span className="text-ucc-cyan-dark mt-0.5 text-lg flex-shrink-0">{icon}</span>
    <div>
      <p className="text-xs text-ucc-cyan-dark font-medium mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 font-semibold">{value}</p>
    </div>
  </div>
);

/**
 * Configuración visual por cada tipo de rol
 */
const rolConfig = {
  Estudiante: {
    icon: '',
    label: 'Información Académica',
    color: 'text-ucc-green',
    fields: (info) => [
      { icon: '', label: 'Programa', value: info.programa ?? info.programa_academico },
    ],
  },
  Empleado: {
    icon: '',
    label: 'Información Laboral',
    color: 'text-ucc-cyan-dark',
    fields: (info) => [
      {  label: 'Dependencia', value: info.dependencia },
      {  label: 'Cargo',        value: info.cargo },
    ],
  },
  Contratista: {
    icon: '',
    label: 'Información de Contrato',
    color: 'text-orange-700',
    fields: (info) => [
      { icon: '', label: 'Empresa', value: info.empresa ?? info.empresa_proveedora },
    ],
  },
};

/**
 * Tarjeta de información por rol (Estudiante / Empleado / Contratista)
 * Reutilizable: recibe el tipo de rol y la información correspondiente
 */
export const RoleInfoCard = ({ rol, info }) => {
  const config = rolConfig[rol];
  if (!config || !info) return null;

  return (
    <div className="rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
      {/* Encabezado */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <span>{config.icon}</span>
        <h2 className={`text-sm font-bold uppercase tracking-wide ${config.color}`}>
          {config.label}
        </h2>
      </div>

      {/* Campos */}
      <div className="px-4">
        {config.fields(info).map((field) => (
          <InfoRow
            key={field.label}
            icon={field.icon}
            label={field.label}
            value={field.value}
          />
        ))}
      </div>
    </div>
  );
};
