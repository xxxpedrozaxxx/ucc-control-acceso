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

      // Hoja 2: Fallas por día
      if (reporte.fallasPorDia?.length) {
        const wsFallas = XLSX.utils.json_to_sheet(
          reporte.fallasPorDia.map(f => ({ Día: f.dia, 'Total fallas': f.total }))
        );
        wsFallas['!cols'] = [{ wch: 15 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, wsFallas, 'Fallas por día');
      }

      // Hoja 3: Estudiantes por programa
      if (reporte.porPrograma?.length) {
        const wsPrograma = XLSX.utils.json_to_sheet(
          reporte.porPrograma.map(p => ({ Programa: p.programa, Estudiantes: p.total }))
        );
        wsPrograma['!cols'] = [{ wch: 40 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, wsPrograma, 'Por programa');
      }

      // Hoja 4: Empleados por dependencia
      if (reporte.porDependencia?.length) {
        const wsDep = XLSX.utils.json_to_sheet(
          reporte.porDependencia.map(d => ({ Dependencia: d.dependencia, Empleados: d.total }))
        );
        wsDep['!cols'] = [{ wch: 35 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, wsDep, 'Por dependencia');
      }

      // Hoja 5: Fallas por programa académico
      if (reporte.fallasPorPrograma?.length) {
        const wsFP = XLSX.utils.json_to_sheet(
          reporte.fallasPorPrograma.map(r => ({
            'Programa académico': r.programa,
            'Fallas en el período': r.fallas_total,
          }))
        );
        wsFP['!cols'] = [{ wch: 40 }, { wch: 22 }];
        XLSX.utils.book_append_sheet(wb, wsFP, 'Fallas por programa');
      }

      // Hoja 6: Fallas por dependencia (empleados)
      if (reporte.fallasPorDependencia?.length) {
        const wsFD = XLSX.utils.json_to_sheet(
          reporte.fallasPorDependencia.map(r => ({
            Dependencia: r.dependencia,
            'Fallas en el período': r.fallas_total,
          }))
        );
        wsFD['!cols'] = [{ wch: 35 }, { wch: 22 }];
        XLSX.utils.book_append_sheet(wb, wsFD, 'Fallas por dependencia');
      }

      // Hoja 7: Fallas por empresa contratista
      if (reporte.fallasPorEmpresa?.length) {
        const wsFE = XLSX.utils.json_to_sheet(
          reporte.fallasPorEmpresa.map(r => ({
            Empresa: r.empresa,
            'Fallas en el período': r.fallas_total,
          }))
        );
        wsFE['!cols'] = [{ wch: 35 }, { wch: 22 }];
        XLSX.utils.book_append_sheet(wb, wsFE, 'Fallas por empresa');
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
          icono="🎓"
          color={{ bg: 'bg-blue-50', text: 'text-blue-600' }}
        />
        <ResumenCard
          titulo="Empleados"
          valor={reporte?.totalEmpleados}
          subtitulo="Personal administrativo"
          icono="💼"
          color={{ bg: 'bg-purple-50', text: 'text-purple-600' }}
        />
        <ResumenCard
          titulo="Contratistas"
          valor={reporte?.totalContratistas}
          subtitulo="Vinculados actualmente"
          icono="🏢"
          color={{ bg: 'bg-orange-50', text: 'text-orange-500' }}
        />
        <ResumenCard
          titulo="Fallas en el período"
          valor={reporte?.fallasPeriodo}
          subtitulo="Reportes sin carnet"
          icono="⚠️"
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
