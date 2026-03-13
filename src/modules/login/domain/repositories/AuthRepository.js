/**
 * Interfaz del repositorio de autenticación
 * Define el contrato que debe implementar la infraestructura
 */
export class AuthRepository {
  /**
   * Valida el ID institucional del usuario
   * @param {string} idInstitucional - ID institucional del usuario
   * @returns {Promise<User>}
   */
  async validateInstitutionalId(idInstitucional) {
    throw new Error('Method not implemented');
  }

  /**
   * Obtiene la información completa del usuario
   * @param {string} idInstitucional - ID institucional del usuario
   * @returns {Promise<User>}
   */
  async getUserByInstitutionalId(idInstitucional) {
    throw new Error('Method not implemented');
  }
}
