import React from 'react';

const ARTICULOS = [
  {
    titulo: 'Artículo 1° — Adopción de la TIP',
    texto: 'Adoptar la Tarjeta de Identificación Personal, TIP, como medio de identificación de los integrantes de la comunidad universitaria.',
  },
  {
    titulo: 'Artículo 5° — Uso obligatorio',
    texto: 'Los integrantes de la comunidad universitaria deben presentar obligatoriamente la tarjeta de identificación para el acceso a las instalaciones y solicitud de servicios de la institución.',
  },
  {
    titulo: 'Artículo 5° — Parágrafo 1°',
    texto: 'Todos los trabajadores y contratistas deberán portar obligatoriamente la tarjeta de identificación durante la jornada laboral y al interior de las instalaciones en las sedes.',
  },
  {
    titulo: 'Artículo 5° — Parágrafo 2°',
    texto: 'El uso inadecuado de la tarjeta de identificación personal y hacerse sustituir por terceras personas constituirá falta disciplinaria de conformidad con los estatutos y reglamentos vigentes.',
  },
  {
    titulo: 'Artículo 5° — Parágrafo 3°',
    texto: 'Todas las acciones realizadas con la tarjeta de identificación personal se entienden realizadas por su portador. En caso de pérdida, deterioro o hurto, el usuario deberá informar oportunamente para su bloqueo y reexpedición.',
  },
  {
    titulo: 'Artículo 2° — Propiedad',
    texto: 'La TIP es propiedad de la institución y acredita al portador como miembro de la comunidad. No podrá cederse por ningún motivo a terceros para el goce de los derechos que la vinculación le otorga.',
  },
];

/**
 * Pantalla de bloqueo unificada.
 * Props:
 *   nombre      — nombre del usuario (opcional)
 *   onAction    — función al pulsar el botón principal
 *   actionLabel — texto del botón principal (default "Salir")
 */
export const PantallaBloqueo = ({ nombre, onAction, actionLabel = 'Salir' }) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950 select-none overflow-hidden">
    {/* Fondo de rayas rojas */}
    <div className="absolute inset-0 opacity-10">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute h-full w-20 bg-red-600"
          style={{ left: `${i * 14}%`, transform: 'skewX(-20deg)' }}
        />
      ))}
    </div>

    <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-sm">
      {/* Icono */}
      <div className="w-20 h-20 rounded-full bg-red-600/20 border-4 border-red-600 flex items-center justify-center mb-4 animate-pulse">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-red-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      </div>

      <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-1">Acceso suspendido</p>
      <h1 className="text-3xl font-black text-white uppercase leading-tight mb-1">Acceso bloqueado</h1>

      {nombre && (
        <p className="text-gray-300 text-sm font-semibold mb-0.5">{nombre}</p>
      )}

      <p className="text-gray-500 text-xs mb-4">
        Has acumulado demasiadas fallas de carnet.{' '}
        Acércate al <span className="text-gray-300 font-semibold">CAD</span> o a tu facultad para regularizar tu situación.
      </p>

      {/* Artículos reglamentarios — scrolleable */}
      <div className="w-full bg-gray-900 border border-gray-700 rounded-xl mb-3 max-h-44 overflow-y-auto text-left px-4 py-3 space-y-3">
        <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">
          Resolución Rectoral N° 258 — 24 ago. 2012
        </p>
        {ARTICULOS.map((art, i) => (
          <div key={i}>
            <p className="text-gray-300 text-xs font-semibold">{art.titulo}</p>
            <p className="text-gray-500 text-xs leading-relaxed mt-0.5">{art.texto}</p>
          </div>
        ))}
      </div>

      <a
        href="/docs/Resolucion_258_de_2012.pdf"
        download
        className="text-xs text-gray-500 hover:text-gray-300 underline underline-offset-2 mb-4 transition-colors inline-flex items-center gap-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
          <path d="M8.75 2.75a.75.75 0 0 0-1.5 0v5.69L5.03 6.22a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0-1.06-1.06L8.75 8.44V2.75Z" />
          <path d="M3.5 9.75a.75.75 0 0 0-1.5 0v1.5A2.75 2.75 0 0 0 4.75 14h6.5A2.75 2.75 0 0 0 14 11.25v-1.5a.75.75 0 0 0-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-1.5Z" />
        </svg>
        Descargar resolución completa (PDF)
      </a>

      <button
        onClick={onAction}
        className="w-full py-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black text-base rounded-2xl shadow-2xl transition-colors uppercase tracking-wide"
      >
        {actionLabel}
      </button>
    </div>
  </div>
);
