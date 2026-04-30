import { useState, useEffect } from 'react';
import { AdminRepositoryImpl } from '../../infrastructure/repositories/AdminRepositoryImpl';

const repo = new AdminRepositoryImpl();

/**
 * Hook para los informes por período (diario/semanal/mensual/semestral).
 * Se recarga automáticamente cada vez que cambia el período.
 */
export const useReporte = (periodo = 'semanal', offset = 0, refreshKey = 0) => {
  const [reporte,  setReporte]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    repo.getReporte(periodo, offset)
      .then(data => { if (!cancelled) setReporte(data); })
      .catch(err  => { if (!cancelled) setError(err.message); })
      .finally(()  => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [periodo, offset, refreshKey]);

  return { reporte, loading, error };
};
