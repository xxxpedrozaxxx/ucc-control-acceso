import React, { useState } from 'react';
import { useLogin } from '../../application/hooks/useLogin';
import { useNavigate } from 'react-router-dom';

/**
 * Componente del formulario de login
 */
export const LoginForm = () => {
  const [idInstitucional, setIdInstitucional] = useState('');
  const { loading, error, validateId, clearError } = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const result = await validateId(idInstitucional);

    if (result.success) {
      // Redirigir a la ficha técnica del usuario
      navigate('/user-profile', { state: { user: result.user } });
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Solo permitir números
    if (/^\d*$/.test(value)) {
      setIdInstitucional(value);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mensaje instructivo */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Ingrese su ID Institucional
          </h2>
          <p className="text-sm text-gray-600">
            Este sistema es solo para usuarios que NO portan su carnet físico
          </p>
        </div>

        {/* Campo de entrada */}
        <div>
          <label 
            htmlFor="idInstitucional" 
            className="block text-sm font-medium text-gray-700 mb-2 text-center"
          >
            ID Institucional
          </label>
          <input
            id="idInstitucional"
            type="text"
            inputMode="numeric"
            pattern="\d*"
            value={idInstitucional}
            onChange={handleInputChange}
            placeholder="Ej: 80123456"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-colors text-lg text-center"
            disabled={loading}
            required
          />
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Botón de ingreso */}
        <button
          type="submit"
          disabled={loading || !idInstitucional}
          className="w-full bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-blue-950 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Validando...
            </span>
          ) : (
            'INGRESAR'
          )}
        </button>

        {/* Información adicional */}
        <div className="text-center text-xs text-gray-500 mt-4">
          <p>⚠️ Solo para ingresos contingentes sin carnet</p>
        </div>
      </form>
    </div>
  );
};
