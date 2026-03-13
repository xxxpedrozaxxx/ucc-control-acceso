import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar }         from '../components/AdminSidebar';
import { ResumenView }          from '../components/views/ResumenView';
import { UsuariosView }         from '../components/views/EstudiantesView';
import { CargarCSVView }        from '../components/views/CargarCSVView';
import { ReportesView }         from '../components/views/ReportesView';
import { useAdminDashboard }   from '../../application/hooks/useAdminDashboard';
import { useReporte }          from '../../application/hooks/useReporte';

const TITULOS = {
  resumen:  { titulo: 'Resumen',   subtitulo: 'Universidad Cooperativa de Colombia — Control de Acceso' },
  usuarios: { titulo: 'Usuarios',  subtitulo: 'Listado y estado de todos los usuarios registrados en el sistema' },
  csv:      { titulo: 'Semestre',  subtitulo: 'Inicia un nuevo semestre y carga los CSV de forma guiada' },
  informes: { titulo: 'Informes',  subtitulo: 'Reportes diarios, semanales, mensuales y semestrales de acceso' },
};

export const AdminPage = () => {
  const navigate = useNavigate();
  const [vista, setVista]           = useState('resumen');
  const [periodoInforme, setPeriodo] = useState('semanal');
  const [offsetInforme,  setOffset] = useState(0);

  const {
    stats, fallas7d, porPrograma, usuarios,
    loading, error, refrescar, toggleAcceso, ultimaActualizacion,
  } = useAdminDashboard();

  const {
    reporte, loading: loadingReporte,
  } = useReporte(periodoInforme, offsetInforme);

  const estadoSistema = loading
    ? 'Cargando...'
    : stats
      ? `Activo — ${stats.activos} estudiante${stats.activos !== 1 ? 's' : ''} habilitado${stats.activos !== 1 ? 's' : ''}`
      : 'Sin conexión';

  const handleCerrarSesion = () => {
    navigate('/login');
  };

  const { titulo, subtitulo } = TITULOS[vista] ?? TITULOS.resumen;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        vistaActual={vista}
        onCambiarVista={setVista}
        estadoSistema={estadoSistema}
        onCerrarSesion={handleCerrarSesion}
      />

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{titulo}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{subtitulo}</p>
          </div>
          <div className="flex items-center gap-3">
            {ultimaActualizacion && (
              <span className="text-xs text-gray-400">
                Actualizado: {ultimaActualizacion.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
            {error && (
              <span className="text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                ⚠️ {error}
              </span>
            )}
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Ver portal →
            </button>
          </div>
        </header>

        {/* Body scrollable */}
        <div className="flex-1 overflow-y-auto p-8">
          {vista === 'resumen' && (
            <ResumenView
              stats={stats}
              fallas7d={fallas7d}
              porPrograma={porPrograma}
              loading={loading}
            />
          )}
          {vista === 'usuarios' && (
            <UsuariosView
              usuarios={usuarios}
              loading={loading}              onToggleAcceso={toggleAcceso}            />
          )}
          {vista === 'csv' && (
            <CargarCSVView />
          )}
          {vista === 'informes' && (
            <ReportesView
              reporte={reporte}
              loading={loadingReporte}
              periodo={periodoInforme}
              offset={offsetInforme}
              onCambiarPeriodo={(p, o = 0) => { setPeriodo(p); setOffset(o); }}
            />
          )}
        </div>
      </main>
    </div>
  );
};
