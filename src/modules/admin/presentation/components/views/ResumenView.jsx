import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  BarChart as HBarChart,
} from 'recharts';
import { StatCard } from '../StatCard';

const VERDE  = '#1B6B3A';
const ROJO   = '#EF4444';

/**
 * Vista principal del dashboard: estadísticas, gráficas y distribución.
 */
export const ResumenView = ({ stats, fallas7d, porPrograma, loading }) => {
  const donutData = stats
    ? [
        { name: 'Activos',    value: stats.activos    },
        { name: 'Bloqueados', value: stats.bloqueados },
      ]
    : [];

  const totalDonut = stats ? stats.activos + stats.bloqueados : 0;

  return (
    <div className="space-y-6">
      {/* ── Tarjetas de estadísticas ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          titulo="Total Estudiantes"
          valor={stats?.totalEstudiantes}
          icono={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>}
          colorIcono="text-green-600"
          bgIcono="bg-green-50"
        />
        <StatCard
          titulo="Activos"
          valor={stats?.activos}
          icono={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>}
          colorIcono="text-green-600"
          bgIcono="bg-green-50"
        />
        <StatCard
          titulo="Bloqueados"
          valor={stats?.bloqueados}
          icono={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" /></svg>}
          colorIcono="text-red-500"
          bgIcono="bg-red-50"
        />
        <StatCard
          titulo="Reportes TIC hoy"
          valor={stats?.reportesHoy}
          icono={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>}
          colorIcono="text-yellow-500"
          bgIcono="bg-yellow-50"
        />
      </div>

      {/* ── Gráficas fila 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Donut: Estado de carnets */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="font-semibold text-gray-800 mb-0.5">Estado de carnets</p>
          <p className="text-xs text-gray-400 mb-4">Activos vs. Bloqueados</p>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Cargando...</div>
          ) : (
            <div className="relative">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label={false}
                  >
                    <Cell fill={VERDE} />
                    <Cell fill={ROJO}  />
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                  <Legend
                    formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Etiqueta central */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ paddingBottom: 28 }}>
                <span className="text-2xl font-bold text-gray-800 leading-none">{totalDonut}</span>
                <span className="text-xs text-gray-400 mt-1">usuarios</span>
              </div>
            </div>
          )}
        </div>

        {/* Barras: Reportes TIC últimos 7 días */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="font-semibold text-gray-800 mb-0.5">Reportes TIC — Últimos 7 días</p>
          <p className="text-xs text-gray-400 mb-4">Olvidos y pérdidas por día</p>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Cargando...</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={fallas7d} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="dia" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-gray-600 capitalize">{value}</span>
                  )}
                />
                <Bar dataKey="olvido"  name="Olvido"  fill={VERDE} radius={[3, 3, 0, 0]} stackId="a" />
                <Bar dataKey="perdida" name="Pérdida" fill={ROJO}  radius={[3, 3, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Barras horizontales: Estudiantes por programa ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <p className="font-semibold text-gray-800 mb-0.5">Estudiantes por programa</p>
        <p className="text-xs text-gray-400 mb-4">Distribución actual en el sistema</p>
        {loading ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Cargando...</div>
        ) : porPrograma.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">Sin datos de programas registrados.</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(80, porPrograma.length * 40)}>
            <HBarChart
              layout="vertical"
              data={porPrograma}
              margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="programa" width={120} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="total" name="Estudiantes" fill={VERDE} radius={[0, 3, 3, 0]} />
            </HBarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
