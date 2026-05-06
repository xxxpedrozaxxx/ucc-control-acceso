import { useState, useEffect, useCallback } from 'react';
import { AdminRepositoryImpl } from '../../infrastructure/repositories/AdminRepositoryImpl';

const repo = new AdminRepositoryImpl();

/**
 * Hook para que el superadmin gestione los perfiles de administrador.
 * Solo debe usarse en vistas protegidas por nivel === 'superadmin'.
 */
export const useAdminManager = () => {
  const [admins,   setAdmins]   = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await repo.getAdmins();
      setAdmins(data);
    } catch (err) {
      setError(err.message ?? 'Error al cargar administradores');
    } finally {
      setCargando(false);
    }
  }, []);

  const crearAdmin = async (id_institucional, nombre_completo, nivel, contrasena) => {
    await repo.crearAdmin(id_institucional, nombre_completo, nivel, contrasena);
    await cargar();
  };

  const eliminarAdmin = async (id_institucional) => {
    await repo.eliminarAdmin(id_institucional);
    await cargar();
  };

  const cambiarContrasenaAdmin = async (id_institucional, nuevaContrasena) => {
    await repo.cambiarContrasenaAdmin(id_institucional, nuevaContrasena);
  };

  useEffect(() => { cargar(); }, [cargar]);

  return { admins, cargando, error, crearAdmin, eliminarAdmin, cambiarContrasenaAdmin, refrescar: cargar };
};
