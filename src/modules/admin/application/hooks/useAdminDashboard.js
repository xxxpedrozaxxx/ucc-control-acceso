import { useState, useEffect, useCallback } from 'react';
import { AdminRepositoryImpl } from '../../infrastructure/repositories/AdminRepositoryImpl';

const repo = new AdminRepositoryImpl();

const INTERVALO_REFRESCO = 30_000; // 30 segundos

/**
 * Hook principal del dashboard admin.
 * Carga todas las estadísticas y datos necesarios para las vistas.
 * Auto-refresca datos en silencio cada 30 s sin afectar la vista activa.
 */
export const useAdminDashboard = () => {
  const [stats,        setStats]        = useState(null);
  const [fallas7d,     setFallas7d]     = useState([]);
  const [porPrograma,  setPorPrograma]  = useState([]);
  const [usuarios,     setUsuarios]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [refreshKey,   setRefreshKey]   = useState(0);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  // Carga completa (con spinner) — solo en el primer montaje o refrescar() manual
  useEffect(() => {
    let cancelled = false;

    const cargar = async () => {
      setLoading(true);
      setError(null);
      try {
        const [s, f, p, u] = await Promise.all([
          repo.getStats(),
          repo.getFallasUltimos7Dias(),
          repo.getEstudiantesPorPrograma(),
          repo.getUsuarios(),
        ]);
        if (!cancelled) {
          setStats(s);
          setFallas7d(f);
          setPorPrograma(p);
          setUsuarios(u);
          setUltimaActualizacion(new Date());
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    cargar();
    return () => { cancelled = true; };
  }, [refreshKey]);

  // Refresco silencioso cada 30 s — no muestra spinner, no resetea la vista
  const refrescoSilencioso = useCallback(async () => {
    try {
      const [s, u] = await Promise.all([
        repo.getStats(),
        repo.getUsuarios(),
      ]);
      setStats(s);
      setUsuarios(u);
      setUltimaActualizacion(new Date());
    } catch {
      // silencioso — no muestra error para no interrumpir al usuario
    }
  }, []);

  useEffect(() => {
    const intervalo = setInterval(refrescoSilencioso, INTERVALO_REFRESCO);
    return () => clearInterval(intervalo);
  }, [refrescoSilencioso]);

  const refrescar = () => setRefreshKey(k => k + 1);

  const toggleAcceso = async (id_institucional, nuevoAcceso) => {
    await repo.toggleAcceso(id_institucional, nuevoAcceso);
    setUsuarios(prev =>
      prev.map(u =>
        u.id_institucional === id_institucional
          ? { ...u, acceso: nuevoAcceso, total_fallas: nuevoAcceso === 'activo' ? 0 : u.total_fallas }
          : u
      )
    );
    repo.getStats().then(s => setStats(s)).catch(() => {});
  };

  return { stats, fallas7d, porPrograma, usuarios, loading, error, refrescar, toggleAcceso, ultimaActualizacion };
};
