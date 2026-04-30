import { useState } from 'react';
import { AdminAuthRepositoryImpl } from '../../infrastructure/repositories/AdminAuthRepositoryImpl';

const repo = new AdminAuthRepositoryImpl();

export const useAdminAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const login = async (idInstitucional, contrasena) => {
    setLoading(true);
    setError(null);
    try {
      const sesion = await repo.login(idInstitucional, contrasena);
      return { success: true, sesion };
    } catch (err) {
      setError(err.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => repo.logout();

  const getSession = () => repo.getSession();

  return { login, logout, getSession, loading, error };
};
