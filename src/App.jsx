import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage }       from './modules/login/presentation/pages/LoginPage';
import { UserProfilePage } from './modules/user-profile/presentation/pages/UserProfilePage';
import { AdminPage }       from './modules/admin/presentation/pages/AdminPage';
import { AdminLoginPage }  from './modules/admin/presentation/pages/AdminLoginPage';
import { ProtectedRoute, AdminProtectedRoute } from './shared/components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Portal usuarios */}
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/user-profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Panel admin */}
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminPage />
            </AdminProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
