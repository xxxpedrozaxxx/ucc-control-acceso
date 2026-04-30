import React from 'react';

const MotivoBadge = ({ motivo }) => {
  const styles = {
    olvido:  'bg-yellow-100 text-yellow-800',
    perdida: 'bg-red-100 text-red-700',
  };
  const label = motivo === 'perdida' ? 'P\u00e9rdida' : 'Olvido';
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[motivo] || 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  );
};

const formatFecha = (isoString) => {
  const d = new Date(isoString);
  return d.toLocaleString('es-CO', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
};

export const FallasHistory = ({ fallas = [], totalFallas }) => {
  // Si no tiene fallas, no mostrar la tarjeta
  if (totalFallas === 0 || fallas.length === 0) return null;

  return (
    <div className="rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
      {/* Encabezado */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span></span>
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Historial de Fallas
          </h2>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          totalFallas >= 3
            ? 'bg-orange-100 text-orange-700'
            : 'bg-blue-100 text-blue-700'
        }`}>
          {totalFallas} / 4
        </span>
      </div>

      {/* Lista scrolleable */}
      <div className="overflow-y-auto max-h-52 divide-y divide-gray-50">
        {fallas.map((falla) => (
          <div key={falla.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-xs text-gray-500">{formatFecha(falla.fecha_hora)}</p>
            </div>
            <MotivoBadge motivo={falla.motivo} />
          </div>
        ))}
      </div>
    </div>
  );
};
