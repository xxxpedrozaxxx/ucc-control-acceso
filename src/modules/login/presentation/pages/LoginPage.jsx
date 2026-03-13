import React from 'react';
import { LoginForm } from '../components/LoginForm';
import logoUCC from '../../../../assets/logo_ucc_2018(CURVAS)-01.jpg';

/**
 * Página principal de Login
 */
export const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex flex-col items-center justify-center p-4">
      {/* Contenedor principal */}
      <div className="w-full max-w-md">
        {/* Logo UCC */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <img 
              src={logoUCC} 
              alt="Universidad Cooperativa de Colombia" 
              className="h-24 w-auto object-contain"
              onError={(e) => {
                // Fallback si no existe la imagen
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div class="text-center"><h1 class="text-3xl font-bold text-blue-900">UCC</h1><p class="text-sm text-gray-600">Universidad Cooperativa</p></div>';
              }}
            />
          </div>
        </div>

        {/* Tarjeta del formulario */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Formulario de login */}
          <LoginForm />
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>© 2026 Universidad Cooperativa de Colombia</p>
          <p className="text-xs mt-1">Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  );
};
