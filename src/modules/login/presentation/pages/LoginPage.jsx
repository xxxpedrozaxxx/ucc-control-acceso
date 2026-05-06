import React from 'react';
import { LoginForm } from '../components/LoginForm';
import logoUCC from '../../../../assets/logo_ucc_2018(CURVAS)-01.jpg';

/**
 * Página principal de Login
 */
export const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-ucc-cyan flex flex-col items-center justify-center p-4">
      {/* Contenedor principal */}
      <div className="w-full max-w-md">
        {/* Logo UCC */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl shadow-xl px-8 py-5">
            <img 
              src={logoUCC} 
              alt="Universidad Cooperativa de Colombia" 
              className="h-16 w-auto object-contain"
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
        <div className="text-center mt-6 text-sm bg-white/90 rounded-xl px-4 py-3">
          <p className="text-gray-800">© 2026 Universidad Cooperativa de Colombia</p>
          <p className="text-xs mt-1 text-gray-600">Todos los derechos reservados</p>
          <a
            href="/docs/Resolucion_258_de_2012.pdf"
            download
            className="text-xs text-gray-700 hover:text-black underline underline-offset-2 mt-2 inline-flex items-center gap-1 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
              <path d="M8.75 2.75a.75.75 0 0 0-1.5 0v5.69L5.03 6.22a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0-1.06-1.06L8.75 8.44V2.75Z" />
              <path d="M3.5 9.75a.75.75 0 0 0-1.5 0v1.5A2.75 2.75 0 0 0 4.75 14h6.5A2.75 2.75 0 0 0 14 11.25v-1.5a.75.75 0 0 0-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-1.5Z" />
            </svg>
            Reglamento TIP — Resolución Rectoral N° 258 de 2012
          </a>
        </div>
      </div>
    </div>
  );
};
