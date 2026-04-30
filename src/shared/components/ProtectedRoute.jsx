import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AdminAuthRepositoryImpl } from '../../modules/admin/infrastructure/repositories/AdminAuthRepositoryImpl';

const adminRepo = new AdminAuthRepositoryImpl();

/**
 * Ruta protegida para usuarios normales:
 * solo permite acceso si viene con un usuario en el state de navegación.
 */
export const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const user = location.state?.user;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * Ruta protegida para el panel admin:
 * verifica que haya una sesión admin activa en sessionStorage.
 */
export const AdminProtectedRoute = ({ children }) => {
  const sesion = adminRepo.getSession();

  if (!sesion) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};
