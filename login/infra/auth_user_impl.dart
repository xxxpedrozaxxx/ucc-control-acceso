import 'package:gotrue/src/types/user.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/entities/auth_user.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/entities/user_role.dart';

class AuthUserImpl extends User implements AuthUser {
  AuthUserImpl({
    required super.id,
    required super.appMetadata,
    required super.userMetadata,
    required super.aud,
    required super.createdAt,
    super.confirmationSentAt,
    super.recoverySentAt,
    super.emailChangeSentAt,
    super.newEmail,
    super.invitedAt,
    super.actionLink,
    super.email,
    super.phone,
    super.emailConfirmedAt,
    super.phoneConfirmedAt,
    super.lastSignInAt,
    super.role,
    super.updatedAt,
    super.identities,
    super.factors,
    super.isAnonymous,
    List<String>? userRoles,
  }) : _userRoles = userRoles ?? [];

  final List<String> _userRoles;

  @override
  bool get emailVerified => super.emailConfirmedAt != null;

  @override
  List<UserRole> get roles {
    if (_userRoles.isEmpty) {
      return [UserRole.customer]; // Rol por defecto
    }
    return UserRole.fromStringList(_userRoles);
  }

  static AuthUserImpl? fromUser(User user) {
    // Extraer roles del user_metadata
    final rolesFromMetadata = user.userMetadata?['roles'] as List<dynamic>?;
    final userRoles = rolesFromMetadata?.cast<String>() ?? [];

    return AuthUserImpl(
      id: user.id,
      appMetadata: user.appMetadata,
      userMetadata: user.userMetadata,
      aud: user.aud,
      confirmationSentAt: user.confirmationSentAt,
      recoverySentAt: user.recoverySentAt,
      emailChangeSentAt: user.emailChangeSentAt,
      newEmail: user.newEmail,
      invitedAt: user.invitedAt,
      actionLink: user.actionLink,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      emailConfirmedAt: user.emailConfirmedAt,
      phoneConfirmedAt: user.phoneConfirmedAt,
      lastSignInAt: user.lastSignInAt,
      role: user.role,
      updatedAt: user.updatedAt,
      identities: user.identities,
      factors: user.factors,
      isAnonymous: user.isAnonymous,
      userRoles: userRoles, // ← Pasar roles extraídos
    );
  }
}
