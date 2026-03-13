import { useState } from 'react';
import { AdminRepositoryImpl } from '../../infrastructure/repositories/AdminRepositoryImpl';

const repo = new AdminRepositoryImpl();

/**
 * Hook para iniciar un nuevo semestre.
 * Limpia todos los datos del semestre anterior y registra el nuevo período.
 *
 * Retorna:
 *   cargando   {boolean}
 *   error      {string|null}
 *   iniciar    {(nombre, fechaInicio, fechaFin) => Promise<void>}
 */
export const useNuevoSemestre = () => {
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState(null);

  const iniciar = async (nombre, fechaInicio, fechaFin) => {
    setCargando(true);
    setError(null);
    try {
      await repo.iniciarNuevoSemestre(nombre, fechaInicio, fechaFin);
    } catch (err) {
      setError(err.message ?? 'Error al iniciar el semestre');
      throw err; // re-lanza para que el caller pueda reaccionar si lo necesita
    } finally {
      setCargando(false);
    }
  };

  return { cargando, error, iniciar };
};
