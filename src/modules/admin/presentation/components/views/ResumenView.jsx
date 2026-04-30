import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  BarChart as HBarChart,
} from 'recharts';
import { StatCard } from '../StatCard';

const VERDE  = 'var(--ucc-green)';
const ROJO   = '#EF4444';

// Icono de actualizar reutilizable
const IconRefresh = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

/**
 * Vista principal del dashboard: estadísticas, gráficas y distribución.
 */
export const ResumenView = ({ stats, fallas7d, porPrograma, usuarios, loading, onRefrescar }) => {
  const donutData = stats
    ? [
        { name: 'Activos',    value: stats.activos    },
        { name: 'Bloqueados', value: stats.bloqueados },
      ]
    : [];

  const totalDonut   = stats ? stats.activos + stats.bloqueados : 0;
  const tasaBloqueo  = totalDonut > 0
    ? Math.round((stats.bloqueados / totalDonut) * 100)
    : 0;

  // Top 5 usuarios con más reportes TIP
  const topFallas = [...(usuarios ?? [])]
    .filter(u => u.total_fallas > 0)
    .sort((a, b) => b.total_fallas - a.total_fallas)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* ── Tarjetas fila 1 ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          titulo="Estudiantes"
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
          titulo="Reportes TIP hoy"
          valor={stats?.reportesHoy}
          icono={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>}
          colorIcono="text-yellow-500"
          bgIcono="bg-yellow-50"
        />
      </div>

      {/* ── Tarjetas fila 2 ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          titulo="Empleados"
          valor={stats?.totalEmpleados}
          icono={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" /></svg>}
          colorIcono="text-purple-600"
          bgIcono="bg-purple-50"
        />
        <StatCard
          titulo="Contratistas"
          valor={stats?.totalContratistas}
          icono={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" /></svg>}
          colorIcono="text-orange-500"
          bgIcono="bg-orange-50"
        />
        <StatCard
          titulo="Fallas totales"
          valor={stats?.totalFallas}
          icono={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Z" /></svg>}
          colorIcono="text-red-400"
          bgIcono="bg-red-50"
        />
        <StatCard
          titulo="Tasa de bloqueo"
          valor={loading ? null : `${tasaBloqueo}%`}
          icono={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>}
          colorIcono={tasaBloqueo > 20 ? 'text-red-500' : 'text-gray-500'}
          bgIcono={tasaBloqueo > 20 ? 'bg-red-50' : 'bg-gray-50'}
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

        {/* Barras: Reportes TIP últimos 7 días */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="font-semibold text-gray-800 mb-0.5">Reportes TIP — Últimos 7 días</p>
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
      {/* ── Top 5 reportes TIP ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <p className="font-semibold text-gray-800 mb-0.5">Top reportes TIP</p>
        <p className="text-xs text-gray-400 mb-4">Usuarios con más fallas acumuladas este semestre</p>
        {loading ? (
          <div className="h-24 flex items-center justify-center text-gray-400 text-sm">Cargando...</div>
        ) : topFallas.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">Sin fallas registradas aún.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">#</th>
                <th className="pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nombre</th>
                <th className="pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                <th className="pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Fallas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topFallas.map((u, i) => (
                <tr key={u.id_institucional} className="hover:bg-gray-50/50">
                  <td className="py-2.5 text-gray-300 font-mono text-xs w-6">{i + 1}</td>
                  <td className="py-2.5 font-medium text-gray-700">{u.nombre_completo}</td>
                  <td className="py-2.5 text-gray-400 font-mono text-xs">{u.id_institucional}</td>
                  <td className="py-2.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      u.acceso === 'bloqueado'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-green-100 text-ucc-green'
                    }`}>
                      {u.acceso}
                    </span>
                  </td>
                  <td className="py-2.5 text-right">
                    <span className={`font-bold text-sm ${u.total_fallas >= 4 ? 'text-red-500' : u.total_fallas >= 2 ? 'text-yellow-500' : 'text-gray-600'}`}>
                      {u.total_fallas}
                    </span>
                    <span className="text-gray-300 text-xs"> / 4</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
