/**
 * Interfaz del repositorio admin
 * Define el contrato que debe implementar la infraestructura
 */
export class AdminRepository {
  async getStats()                              { throw new Error('Not implemented'); }
  async getFallasUltimos7Dias()                 { throw new Error('Not implemented'); }
  async getEstudiantesPorPrograma()             { throw new Error('Not implemented'); }
  async getUsuarios()                           { throw new Error('Not implemented'); }
  async toggleAcceso(id, nuevoAcceso)           { throw new Error('Not implemented'); }
  async cargarUsuarios(registros)               { throw new Error('Not implemented'); }
  async cargarEstudiantes(registros)            { throw new Error('Not implemented'); }
  async cargarEmpleados(registros)              { throw new Error('Not implemented'); }
  async cargarContratistas(registros)           { throw new Error('Not implemented'); }
  async getReporte(periodo)                     { throw new Error('Not implemented'); }
}
