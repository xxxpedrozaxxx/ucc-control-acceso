import { useState } from 'react';
import { ValidateInstitutionalIdUseCase } from '../../domain/usecases/ValidateInstitutionalIdUseCase';
import { AuthRepositoryImpl } from '../../infrastructure/repositories/AuthRepositoryImpl';

/**
 * Hook personalizado para manejar la lógica de login
 * Usa AuthRepositoryImpl → Supabase (real)
 * Para volver al mock: reemplazar por AuthRepositoryMock
 */
export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const authRepository = new AuthRepositoryImpl();
  const validateIdUseCase = new ValidateInstitutionalIdUseCase(authRepository);

  /**
   * Valida el ID institucional ingresado
   */
  const validateId = async (idInstitucional) => {
    setLoading(true);
    setError(null);

    try {
      const result = await validateIdUseCase.execute(idInstitucional);

      if (result.success) {
        setUser(result.user);
        return { success: true, user: result.user };
      } else {
        setError(result.error);
        return { success: false, blocked: result.blocked ?? false, error: result.error };
      }
    } catch (err) {
      const errorMessage = 'Error inesperado al validar el ID';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Limpia el estado de error
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Resetea el estado completo
   */
  const reset = () => {
    setLoading(false);
    setError(null);
    setUser(null);
  };

  return {
    loading,
    error,
    user,
    validateId,
    clearError,
    reset
  };
};
