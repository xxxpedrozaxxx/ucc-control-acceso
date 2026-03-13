import 'package:parchemos_prod/v2/parchemos/login/domain/entities/auth_user.dart';

enum AuthStatus { success, error, cancelled }

class AuthResult {
  final AuthStatus status;
  final String? message;
  final AuthUser? user; // ← Solo AuthUser, eliminamos UserProfile

  AuthResult({required this.status, this.message, this.user});

  bool get isSuccess => status == AuthStatus.success;
  bool get isError => status == AuthStatus.error;
  bool get isCancelled => status == AuthStatus.cancelled;

  AuthResult.success(AuthUser user)
    : status = AuthStatus.success,
      user = user,
      message = null;

  AuthResult.error(String errorMessage)
    : status = AuthStatus.error,
      message = errorMessage,
      user = null;

  AuthResult.cancelled()
    : status = AuthStatus.cancelled,
      message = null,
      user = null;
}
