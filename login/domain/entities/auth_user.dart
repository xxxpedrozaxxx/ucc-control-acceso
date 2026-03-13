import 'package:parchemos_prod/v2/parchemos/login/domain/entities/user_role.dart';

/// Interfaz que representa un usuario autenticado
/// Solo contiene datos básicos de autenticación
abstract class AuthUser {
  String get id;
  String? get email;
  String? get phone;
  bool get emailVerified;

  /// Lista de roles del usuario (puede tener múltiples)
  List<UserRole> get roles;
}

/// Extensión con helpers para verificar roles
extension AuthUserRoleExtensions on AuthUser {
  /// Verifica si tiene un rol específico
  bool hasRole(UserRole role) => roles.contains(role);

  /// Verifica si puede hacer entregas
  bool get isDelivery => hasRole(UserRole.delivery);

  /// Verifica si es creador
  bool get isCreator => hasRole(UserRole.creator);
}
