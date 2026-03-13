import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage }       from './modules/login/presentation/pages/LoginPage';
import { UserProfilePage } from './modules/user-profile/presentation/pages/UserProfilePage';
import { AdminPage }       from './modules/admin/presentation/pages/AdminPage';
import { ProtectedRoute }  from './shared/components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Ruta protegida: redirige al login si no hay usuario autenticado */}
        <Route
          path="/user-profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Panel de administración (acceso temporal por ruta directa) */}
        <Route path="/admin" element={<AdminPage />} />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
