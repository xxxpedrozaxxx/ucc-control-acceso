/**
 * Caso de uso: Validar ID Institucional
 * Valida que el ID institucional existe en el sistema
 */
export class ValidateInstitutionalIdUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  /**
   * Ejecuta el caso de uso
   * @param {string} idInstitucional - ID institucional a validar
   * @returns {Promise<{success: boolean, user?: User, error?: string}>}
   */
  async execute(idInstitucional) {
    try {
      // Validar formato del ID
      if (!idInstitucional || idInstitucional.trim() === '') {
        return {
          success: false,
          error: 'El ID institucional es requerido'
        };
      }

      // Validar que sea numérico
      if (!/^\d+$/.test(idInstitucional)) {
        return {
          success: false,
          error: 'El ID institucional debe contener solo números'
        };
      }

      // Buscar usuario en el repositorio
      const user = await this.authRepository.validateInstitutionalId(idInstitucional);

      if (!user) {
        return {
          success: false,
          error: 'ID institucional no encontrado'
        };
      }

      // Verificar si el usuario está bloqueado
      if (user.isBlocked()) {
        return {
          success: false,
          error: 'Tu acceso está bloqueado. Comunícate con la administración.'
        };
      }

      return {
        success: true,
        user
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al validar el ID institucional'
      };
    }
  }
}
