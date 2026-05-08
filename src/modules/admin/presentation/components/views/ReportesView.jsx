import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import * as XLSX from 'xlsx';

// Paleta de colores estilo Gantt
const GANTT_COLORS = [
  '#3AAFA9', '#F4A261', '#E76F51', '#2A9D8F', '#E9C46A',
  '#264653', '#6A4C93', '#1982C4', '#FF595E', '#6BCB77',
  '#4CC9F0', '#F77F00', '#06D6A0', '#EF476F', '#118AB2',
];

// ─── Helpers de fecha ─────────────────────────────────────────────────────

/**
 * Dado un tipo de período y un offset (0 = actual, 1 = anterior, etc.),
 * devuelve { desde, hasta } como objetos Date y una etiqueta legible.
 */
function calcularPeriodo(tipo, offset = 0) {
  const ahora  = new Date();

  if (tipo === 'diario') {
    const dia = new Date(ahora);
    dia.setDate(ahora.getDate() - offset);
    const inicio = new Date(dia); inicio.setHours(0, 0, 0, 0);
    const hasta  = offset === 0 ? new Date(ahora) : new Date(dia.setHours(23, 59, 59, 999));
    return {
      desde:    inicio,
      hasta,
      etiqueta: inicio.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    };
  }
  if (tipo === 'semanal') {
    const diaSem = ahora.getDay();
    const lunes  = new Date(ahora);
    lunes.setDate(ahora.getDate() - ((diaSem + 6) % 7) - offset * 7);
    lunes.setHours(0, 0, 0, 0);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    domingo.setHours(23, 59, 59, 999);
    const hasta = offset === 0 ? new Date(ahora) : domingo;
    return {
      desde:    lunes,
      hasta,
      etiqueta: `${lunes.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} — ${domingo.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}`,
    };
  }
  if (tipo === 'mensual') {
    const inicio = new Date(ahora.getFullYear(), ahora.getMonth() - offset, 1);
    inicio.setHours(0, 0, 0, 0);
    const finMes = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 0, 23, 59, 59, 999);
    const hasta  = offset === 0 ? new Date(ahora) : finMes;
    return {
      desde:    inicio,
      hasta,
      etiqueta: inicio.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }),
    };
  }
  // semestral — label estimado (el real viene de la BD)
  const mes = ahora.getMonth();
  const esPrimerSemestre = mes < 6;
  const inicio = new Date(ahora.getFullYear(), esPrimerSemestre ? 0 : 6, 1, 0, 0, 0, 0);
  return {
    desde:    inicio,
    hasta:    ahora,
    etiqueta: `${esPrimerSemestre ? '1er' : '2do'} semestre ${ahora.getFullYear()}`,
  };
}

// ─── Subcomponentes menores ────────────────────────────────────────────────

const ResumenCard = ({ titulo, valor, subtitulo, color, icono }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color.bg}`}>
      <span className={`text-lg ${color.text}`}>{icono}</span>
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800 leading-none">{valor ?? '—'}</p>
      <p className="text-sm font-medium text-gray-600 mt-1">{titulo}</p>
      {subtitulo && <p className="text-xs text-gray-400 mt-0.5">{subtitulo}</p>}
    </div>
  </div>
);

// Componente de barras horizontales estilo Gantt
const GanttChart = ({ titulo, subtitulo, filas, colKey, colLabel, loading, colorOffset = 0 }) => {
  const max = filas?.length ? Math.max(...filas.map(f => f.total)) : 1;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50">
        <p className="font-semibold text-gray-800 text-sm">{titulo}</p>
        {subtitulo && <p className="text-xs text-gray-400 mt-0.5">{subtitulo}</p>}
      </div>
      {loading ? (
        <div className="p-8 text-center text-gray-400 text-sm">Cargando...</div>
      ) : !filas?.length ? (
        <div className="p-8 text-center text-gray-400 text-sm">Sin datos para este período</div>
      ) : (
        <div className="px-5 py-4 space-y-2.5">
          {filas.map((f, i) => {
            const color = GANTT_COLORS[(i + colorOffset) % GANTT_COLORS.length];
            const pct   = max > 0 ? (f.total / max) * 100 : 0;
            return (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="text-xs text-gray-600 text-right flex-shrink-0 truncate"
                  style={{ width: 140 }}
                  title={f[colKey] || 'Sin asignar'}
                >
                  {f[colKey] || <span className="italic text-gray-300">Sin asignar</span>}
                </div>
                <div className="flex-1 bg-gray-100 rounded h-6 overflow-hidden">
                  <div
                    className="h-full rounded flex items-center justify-end pr-2 transition-all duration-500"
                    style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: color }}
                  >
                    {pct > 20 && (
                      <span className="text-white text-xs font-semibold">{f.total}</span>
                    )}
                  </div>
                </div>
                {pct <= 20 && (
                  <span className="text-xs font-semibold text-gray-600 w-6 text-left flex-shrink-0">{f.total}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Vista principal ───────────────────────────────────────────────────────

const PERIODOS = [
  { id: 'diario',     label: 'Diario'     },
  { id: 'semanal',    label: 'Semanal'    },
  { id: 'mensual',    label: 'Mensual'    },
  { id: 'semestral',  label: 'Semestral'  },
];

/**
 * Props:
 * - reporte: { totalEstudiantes, totalEmpleados, totalContratistas,
 *              fallasPeriodo, fallasPorDia, porPrograma, porDependencia }
 * - loading: boolean
 * - periodo: string (diario|semanal|mensual|semestral)
 * - onCambiarPeriodo: (periodo) => void
 */
export const ReportesView = ({ reporte, loading, periodo = 'semanal', offset = 0, onCambiarPeriodo, onRefrescar }) => {
  const { etiqueta: etiquetaLocal } = useMemo(() => calcularPeriodo(periodo, offset), [periodo, offset]);
  const etiqueta = reporte?.rangoEtiqueta ?? etiquetaLocal;
  const [exportando, setExportando] = useState(false);

  const totalUsers = (reporte?.totalEstudiantes ?? 0)
    + (reporte?.totalEmpleados ?? 0)
    + (reporte?.totalContratistas ?? 0);

  const exportarExcel = () => {
    if (!reporte) return;
    setExportando(true);

    try {
      const wb = XLSX.utils.book_new();

      // Hoja 0: Guía de contenido
      const wsGuia = XLSX.utils.aoa_to_sheet([
        ['GUÍA DE CONTENIDO — Informe de Control de Acceso UCC'],
        ['Período:', etiqueta],
        [],
        ['Hoja', 'Qué contiene', 'Nota importante'],
        ['Resumen', 'Totales generales: personas registradas y fallas del período.', ''],
        ['Fallas por día', 'Cuántas fallas hubo cada día del período.', ''],
        ['Fallas por día Detalle', 'Una fila por cada falla: quién fue, su ID y si es estudiante/empleado/contratista.', ''],
        ['Por programa', 'Cuántos estudiantes hay registrados en cada programa académico.', 'Incluye TODOS los estudiantes del semestre, no solo los que fallaron.'],
        ['Por programa Detalle', 'Lista completa de estudiantes registrados este semestre con su programa.', 'Incluye TODOS los estudiantes del semestre, no solo los que fallaron.'],
        ['Por dependencia', 'Cuántos empleados hay registrados en cada dependencia.', 'Incluye TODOS los empleados del semestre, no solo los que fallaron.'],
        ['Por dependencia Detalle', 'Lista completa de empleados registrados este semestre con su dependencia.', 'Incluye TODOS los empleados del semestre, no solo los que fallaron.'],
        ['Por empresa', 'Cuántos contratistas hay registrados en cada empresa.', 'Incluye TODOS los contratistas del semestre, no solo los que fallaron.'],
        ['Por empresa Detalle', 'Lista completa de contratistas registrados este semestre con su empresa.', 'Incluye TODOS los contratistas del semestre, no solo los que fallaron.'],
        ['Fallas por programa', 'Qué programas académicos acumularon más fallas en el período.', 'Solo aparecen programas donde hubo al menos una falla.'],
        ['Fallas por prog. Detalle', 'Estudiantes que fallaron: cuántas veces y en qué programa.', 'Solo aparecen estudiantes que tuvieron al menos una falla.'],
        ['Fallas por dependencia', 'Qué dependencias acumularon más fallas en el período.', 'Solo aparecen dependencias donde hubo al menos una falla.'],
        ['Fallas por dep. Detalle', 'Empleados que fallaron: cuántas veces y en qué dependencia.', 'Solo aparecen empleados que tuvieron al menos una falla.'],
        ['Fallas por empresa', 'Qué empresas contratistas acumularon más fallas en el período.', 'Solo aparecen empresas donde hubo al menos una falla.'],
        ['Fallas por emp. Detalle', 'Contratistas que fallaron: cuántas veces y en qué empresa.', 'Solo aparecen contratistas que tuvieron al menos una falla.'],
        ['Personas con fallas', 'Lista consolidada de TODAS las personas que tuvieron al menos una falla en el período.', 'Incluye estudiantes, empleados y contratistas juntos.'],
      ]);
      wsGuia['!cols'] = [{ wch: 28 }, { wch: 65 }, { wch: 60 }];
      XLSX.utils.book_append_sheet(wb, wsGuia, 'Guía');

      // Hoja 1: Resumen general
      const wsResumen = XLSX.utils.aoa_to_sheet([
        ['Informe de Control de Acceso UCC'],
        ['Período:', etiqueta],
        ['Generado:', new Date().toLocaleString('es-CO')],
        [],
        ['── Personas registradas ──'],
        ['Total estudiantes', 'Total empleados', 'Total contratistas', 'Total personas'],
        [reporte.totalEstudiantes ?? 0, reporte.totalEmpleados ?? 0, reporte.totalContratistas ?? 0, totalUsers],
        [],
        ['── Fallas en el período ──'],
        ['Total fallas', 'Fallas de estudiantes', 'Fallas de empleados', 'Fallas de contratistas'],
        [reporte.fallasPeriodo ?? 0, reporte.fallasEstudiantes ?? 0, reporte.fallasEmpleados ?? 0, reporte.fallasContratistas ?? 0],
        [],
      ]);
      wsResumen['!cols'] = [{ wch: 30 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

      // Hoja 2: Fallas por día — resumen
      if (reporte.fallasPorDia?.length) {
        const wsFallas = XLSX.utils.json_to_sheet(
          reporte.fallasPorDia.map(f => ({ Día: f.dia, 'Total fallas': f.total }))
        );
        wsFallas['!cols'] = [{ wch: 15 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, wsFallas, 'Fallas por día');
      }
      // Hoja 3: Fallas por día — detalle con nombres
      if (reporte.fallasPorDiaDetalle?.length) {
        const wsFDet = XLSX.utils.json_to_sheet(
          reporte.fallasPorDiaDetalle.map(f => ({
            Día:               f.dia,
            'Nombre completo': f.nombre,
            'ID Institucional': f.id_institucional,
            Tipo:              f.tipo,
          }))
        );
        wsFDet['!cols'] = [{ wch: 12 }, { wch: 35 }, { wch: 18 }, { wch: 14 }];
        XLSX.utils.book_append_sheet(wb, wsFDet, 'Fallas por día Detalle');
      }

      // Hoja 4: Por programa — resumen
      if (reporte.porPrograma?.length) {
        const wsProg = XLSX.utils.json_to_sheet(
          reporte.porPrograma.map(p => ({ Programa: p.programa, 'Total estudiantes': p.total }))
        );
        wsProg['!cols'] = [{ wch: 40 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, wsProg, 'Por programa');
      }
      // Hoja 5: Por programa — detalle con nombres
      if (reporte.estudiantesPorPrograma?.length) {
        const wsProgDet = XLSX.utils.json_to_sheet(
          reporte.estudiantesPorPrograma.map(p => ({
            Programa:          p.programa,
            'Nombre completo': p.nombre,
            'ID Institucional': p.id_institucional,
          }))
        );
        wsProgDet['!cols'] = [{ wch: 40 }, { wch: 35 }, { wch: 18 }];
        XLSX.utils.book_append_sheet(wb, wsProgDet, 'Por programa Detalle');
      }

      // Hoja 6: Por dependencia — resumen
      if (reporte.porDependencia?.length) {
        const wsDepRes = XLSX.utils.json_to_sheet(
          reporte.porDependencia.map(d => ({ Dependencia: d.dependencia, 'Total empleados': d.total }))
        );
        wsDepRes['!cols'] = [{ wch: 35 }, { wch: 18 }];
        XLSX.utils.book_append_sheet(wb, wsDepRes, 'Por dependencia');
      }
      // Hoja 7: Por dependencia — detalle con nombres
      if (reporte.empleadosPorDependencia?.length) {
        const wsDepDet = XLSX.utils.json_to_sheet(
          reporte.empleadosPorDependencia.map(d => ({
            Dependencia:       d.dependencia,
            'Nombre completo': d.nombre,
            'ID Institucional': d.id_institucional,
          }))
        );
        wsDepDet['!cols'] = [{ wch: 35 }, { wch: 35 }, { wch: 18 }];
        XLSX.utils.book_append_sheet(wb, wsDepDet, 'Por dependencia Detalle');
      }

      // Hoja 8: Por empresa — resumen
      if (reporte.porEmpresa?.length) {
        const wsEmpRes = XLSX.utils.json_to_sheet(
          reporte.porEmpresa.map(c => ({ Empresa: c.empresa, 'Total contratistas': c.total }))
        );
        wsEmpRes['!cols'] = [{ wch: 35 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, wsEmpRes, 'Por empresa');
      }
      // Hoja 9: Por empresa — detalle con nombres
      if (reporte.contratistasPorEmpresa?.length) {
        const wsEmpDet = XLSX.utils.json_to_sheet(
          reporte.contratistasPorEmpresa.map(c => ({
            Empresa:           c.empresa,
            'Nombre completo': c.nombre,
            'ID Institucional': c.id_institucional,
          }))
        );
        wsEmpDet['!cols'] = [{ wch: 35 }, { wch: 35 }, { wch: 18 }];
        XLSX.utils.book_append_sheet(wb, wsEmpDet, 'Por empresa Detalle');
      }

      // Hoja 10: Fallas por programa — resumen
      if (reporte.fallasPorPrograma?.length) {
        const wsFPRes = XLSX.utils.json_to_sheet(
          reporte.fallasPorPrograma.map(r => ({
            'Programa académico':    r.programa,
            'Fallas en el período':  r.fallas_total,
          }))
        );
        wsFPRes['!cols'] = [{ wch: 40 }, { wch: 22 }];
        XLSX.utils.book_append_sheet(wb, wsFPRes, 'Fallas por programa');
      }
      // Hoja 11: Fallas por programa — detalle con nombres
      if (reporte.personasConFallas?.some(p => p.tipo === 'Estudiante')) {
        const wsFPDet = XLSX.utils.json_to_sheet(
          reporte.personasConFallas
            .filter(p => p.tipo === 'Estudiante')
            .map(p => ({
              'Programa académico':    p.grupo,
              'Nombre completo':       p.nombre,
              'ID Institucional':      p.id_institucional,
              'Fallas en el período':  p.fallas,
            }))
        );
        wsFPDet['!cols'] = [{ wch: 40 }, { wch: 35 }, { wch: 18 }, { wch: 22 }];
        XLSX.utils.book_append_sheet(wb, wsFPDet, 'Fallas por prog. Detalle');
      }

      // Hoja 12: Fallas por dependencia — resumen
      if (reporte.fallasPorDependencia?.length) {
        const wsFDRes = XLSX.utils.json_to_sheet(
          reporte.fallasPorDependencia.map(r => ({
            Dependencia:             r.dependencia,
            'Fallas en el período':  r.fallas_total,
          }))
        );
        wsFDRes['!cols'] = [{ wch: 35 }, { wch: 22 }];
        XLSX.utils.book_append_sheet(wb, wsFDRes, 'Fallas por dependencia');
      }
      // Hoja 13: Fallas por dependencia — detalle con nombres
      if (reporte.personasConFallas?.some(p => p.tipo === 'Empleado')) {
        const wsFDDet = XLSX.utils.json_to_sheet(
          reporte.personasConFallas
            .filter(p => p.tipo === 'Empleado')
            .map(p => ({
              Dependencia:             p.grupo,
              'Nombre completo':       p.nombre,
              'ID Institucional':      p.id_institucional,
              'Fallas en el período':  p.fallas,
            }))
        );
        wsFDDet['!cols'] = [{ wch: 35 }, { wch: 35 }, { wch: 18 }, { wch: 22 }];
        XLSX.utils.book_append_sheet(wb, wsFDDet, 'Fallas por dep. Detalle');
      }

      // Hoja 14: Fallas por empresa — resumen
      if (reporte.fallasPorEmpresa?.length) {
        const wsFERes = XLSX.utils.json_to_sheet(
          reporte.fallasPorEmpresa.map(r => ({
            Empresa:                 r.empresa,
            'Fallas en el período':  r.fallas_total,
          }))
        );
        wsFERes['!cols'] = [{ wch: 35 }, { wch: 22 }];
        XLSX.utils.book_append_sheet(wb, wsFERes, 'Fallas por empresa');
      }
      // Hoja 15: Fallas por empresa — detalle con nombres
      if (reporte.personasConFallas?.some(p => p.tipo === 'Contratista')) {
        const wsFEDet = XLSX.utils.json_to_sheet(
          reporte.personasConFallas
            .filter(p => p.tipo === 'Contratista')
            .map(p => ({
              Empresa:                 p.grupo,
              'Nombre completo':       p.nombre,
              'ID Institucional':      p.id_institucional,
              'Fallas en el período':  p.fallas,
            }))
        );
        wsFEDet['!cols'] = [{ wch: 35 }, { wch: 35 }, { wch: 18 }, { wch: 22 }];
        XLSX.utils.book_append_sheet(wb, wsFEDet, 'Fallas por emp. Detalle');
      }

      // Hoja 16: Lista de personas con fallas (nombres)
      if (reporte.personasConFallas?.length) {
        const wsPersonas = XLSX.utils.json_to_sheet(
          reporte.personasConFallas.map(p => ({
            'Nombre completo':    p.nombre,
            'ID Institucional':   p.id_institucional,
            'Tipo':               p.tipo,
            'Programa / Dependencia / Empresa': p.grupo,
            'Fallas en el período': p.fallas,
          }))
        );
        wsPersonas['!cols'] = [{ wch: 35 }, { wch: 18 }, { wch: 14 }, { wch: 40 }, { wch: 22 }];
        XLSX.utils.book_append_sheet(wb, wsPersonas, 'Personas con fallas');
      }

      // Nombre del archivo con fecha
      const fecha = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `informe_ucc_${periodo}_${fecha}.xlsx`);
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Selector de período ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-50 px-5">
          <div className="flex">
            {PERIODOS.map(p => (
              <button
                key={p.id}
                onClick={() => onCambiarPeriodo?.(p.id, 0)}
                className={`px-5 py-4 text-sm font-medium border-b-2 -mb-px transition-colors
                  ${periodo === p.id
                    ? 'border-ucc-green text-ucc-green'
                    : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {/* Navegacion anterior / siguiente — solo para periodos no-semestral */}
            {periodo !== 'semestral' && (
              <>
                <button
                  onClick={() => onCambiarPeriodo?.(periodo, offset + 1)}
                  disabled={loading}
                  title="Período anterior"
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <span className="text-xs text-gray-400 min-w-[160px] text-center capitalize">
                  {loading ? '...' : etiqueta}
                </span>
                <button
                  onClick={() => onCambiarPeriodo?.(periodo, Math.max(0, offset - 1))}
                  disabled={loading || offset === 0}
                  title="Período siguiente"
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </>
            )}
            {periodo === 'semestral' && (
              <span className="text-xs text-gray-400 capitalize">{loading ? '...' : etiqueta}</span>
            )}
            <button
              onClick={onRefrescar}
              disabled={loading}
              title="Actualizar informe"
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
            <button
              onClick={exportarExcel}
              disabled={!reporte || loading || exportando}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-ucc-green text-ucc-green hover:bg-green-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              {exportando ? 'Exportando...' : 'Descargar Excel'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Tarjetas resumen ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <ResumenCard
          titulo="Estudiantes"
          valor={reporte?.totalEstudiantes}
          subtitulo="Registrados en el sistema"
          icono={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>}
          color={{ bg: 'bg-blue-50', text: 'text-blue-600' }}
        />
        <ResumenCard
          titulo="Empleados"
          valor={reporte?.totalEmpleados}
          subtitulo="Personal administrativo"
          icono={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" /></svg>}
          color={{ bg: 'bg-purple-50', text: 'text-purple-600' }}
        />
        <ResumenCard
          titulo="Contratistas"
          valor={reporte?.totalContratistas}
          subtitulo="Vinculados actualmente"
          icono={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" /></svg>}
          color={{ bg: 'bg-orange-50', text: 'text-orange-500' }}
        />
        <ResumenCard
          titulo="Fallas en el período"
          valor={reporte?.fallasPeriodo}
          subtitulo="Reportes sin carnet"
          icono={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>}
          color={{ bg: 'bg-yellow-50', text: 'text-yellow-500' }}
        />
      </div>

      {/* ── Gráfico fallas por día — estilo Gantt horizontal ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="font-semibold text-gray-800 mb-0.5">Fallas por día</p>
        <p className="text-xs text-gray-400 mb-4">Reportes de carnet olvidado/perdido en el período seleccionado</p>
        {loading ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Cargando...</div>
        ) : !reporte?.fallasPorDia?.length ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Sin fallas en este período</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(reporte.fallasPorDia.length * 42, 120)}>
            <BarChart
              data={reporte.fallasPorDia}
              layout="vertical"
              barSize={24}
              margin={{ top: 0, right: 40, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="dia"
                width={70}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                formatter={(v) => [`${v} falla${v !== 1 ? 's' : ''}`, 'Total']}
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
              />
              <Bar dataKey="total" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 11, fill: '#6b7280' }}>
                {reporte.fallasPorDia.map((_, i) => (
                  <Cell key={i} fill={GANTT_COLORS[i % GANTT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Distribuciones estilo Gantt ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GanttChart
          titulo="Estudiantes por programa"
          subtitulo="Distribución de matriculados activos"
          filas={reporte?.porPrograma}
          colKey="programa"
          colLabel="Programa académico"
          loading={loading}
          colorOffset={0}
        />
        <GanttChart
          titulo="Empleados por dependencia"
          subtitulo="Distribución del personal vinculado"
          filas={reporte?.porDependencia}
          colKey="dependencia"
          colLabel="Dependencia"
          loading={loading}
          colorOffset={5}
        />
      </div>

      {/* ── Pie de página con totales ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between text-sm text-gray-500">
        <span>Total de personas registradas en el sistema: <strong className="text-gray-800">{totalUsers}</strong></span>
        <span className="text-xs text-gray-400">Datos en tiempo real desde Supabase</span>
      </div>

    </div>
  );
};
