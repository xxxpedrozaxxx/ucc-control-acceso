/// Roles disponibles en la aplicación móvil de Parchemos
enum UserRole {
  /// Usuario regular (todos al registrarse)
  customer('customer', 'Usuario'),

  /// Domiciliario (puede activarse desde la app)
  delivery('delivery', 'Domiciliario'),

  /// Creador de eventos (asignado manualmente por el equipo)
  creator('creator', 'Creador');

  const UserRole(this.value, this.displayName);

  /// Valor usado en la base de datos
  final String value;

  /// Nombre para mostrar en la UI
  final String displayName;

  /// Convertir string de BD a enum
  static UserRole fromString(String value) {
    return UserRole.values.firstWhere(
      (role) => role.value == value,
      orElse: () => UserRole.customer, // Default
    );
  }

  /// Convertir lista de strings a lista de roles
  static List<UserRole> fromStringList(List<String> values) {
    return values.map((v) => fromString(v)).toList();
  }

  @override
  String toString() => value;
}
