export class User {
  constructor({
    id,
    idInstitucional,
    documentoIdentidad,
    nombreCompleto,
    acceso,
    totalFallas,
    roles = []
  }) {
    this.id = id;
    this.idInstitucional = idInstitucional;
    this.documentoIdentidad = documentoIdentidad;
    this.nombreCompleto = nombreCompleto;
    this.acceso = acceso;
    this.totalFallas = totalFallas;
    this.roles = roles;
  }

  isBlocked() {
    return this.acceso === 'bloqueado';
  }

  isAtRisk() {
    return this.totalFallas >= 3;
  }

  getRemainingAttempts() {
    return Math.max(0, 4 - this.totalFallas);
  }
}
