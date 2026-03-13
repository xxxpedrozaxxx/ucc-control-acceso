import React, { useState } from 'react';

/**
 * Opción seleccionable dentro del modal
 */
const ReportOption = ({ id, selected, onSelect, icon, title, description, borderColor, selectedBg }) => (
  <button
    type="button"
    onClick={() => onSelect(id)}
    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
      selected
        ? `${borderColor} ${selectedBg}`
        : 'border-gray-200 bg-white hover:border-gray-300'
    }`}
  >
    <div className="flex items-start gap-3">
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div className="flex-1">
        <p className={`font-bold text-sm mb-1 ${selected ? '' : 'text-gray-800'}`}>
          {title}
        </p>
        <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
      </div>
      {/* Indicador de selección */}
      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 ${
        selected ? `${borderColor} bg-current` : 'border-gray-300'
      }`}>
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
      </div>
    </div>
  </button>
);

/**
 * Modal para reportar TIC
 * Opciones: Reportar como perdida | Reportar por olvido
 */
export const ReportTICModal = ({ isOpen, onClose, onConfirm, nombreUsuario }) => {
  const [selected, setSelected] = useState(null);

  const handleConfirm = () => {
    if (!selected) return;
    onConfirm(selected);
    setSelected(null);
  };

  const handleClose = () => {
    setSelected(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 flex items-end justify-center"
        onClick={handleClose}
      >
        {/* Modal — clic en el modal no cierra */}
        <div
          className="bg-white w-full max-w-md rounded-t-3xl z-50 p-6 pb-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cabecera del modal */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Reportar TIC</h3>
                <p className="text-xs text-gray-500">{nombreUsuario}, seleccioná el motivo del reporte</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
            >
              ✕
            </button>
          </div>

          {/* Separador */}
          <div className="h-px bg-gray-100 my-4" />

          {/* Opciones */}
          <div className="space-y-3 mb-6">
            <ReportOption
              id="perdida"
              selected={selected === 'perdida'}
              onSelect={setSelected}
              icon="⚠️"
              title="Perdí mi TIC"
              description="Mi TIC se extravió. Esto queda registrado como falla. Al acumular 4 fallas el acceso se bloquea."
              borderColor="border-red-500"
              selectedBg="bg-red-50"
            />
            <ReportOption
              id="olvido"
              selected={selected === 'olvido'}
              onSelect={setSelected}
              icon="📋"
              title="Olvidé mi TIC"
              description="Olvidé mi TIC hoy. Esto queda registrado como falla. Al acumular 4 fallas el acceso se bloquea."
              borderColor="border-blue-500"
              selectedBg="bg-blue-50"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selected}
              className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-sm transition-colors"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
