import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Ruta protegida: solo permite acceso si viene con un usuario
 * en el state de navegación (lo pone el login tras autenticarse).
 * Si alguien escribe la URL directamente, lo manda al login.
 */
export const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const user = location.state?.user;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
