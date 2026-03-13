import 'package:parchemos_prod/v2/parchemos/login/domain/entities/auth_result.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/entities/auth_user.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/entities/user_role.dart';

abstract class AuthRepository {
  // login
  Future<AuthResult> signInWithEmail({
    required String email,
    required String password,
  });
  Future<AuthResult> signInWithGoogle();
  Future<AuthResult> signInWithApple();

  // register
  Future<AuthResult> signUpWithEmail({
    required String name,
    required String email,
    required String password,
    UserRole? role,
    bool acceptTerms = false,
  });

  // logout
  Future<void> signOut();

  // current user
  Future<AuthUser?> getCurrentUser();
  Stream<AuthUser?> get authStateChanges;
  bool get isAuthenticated;

  // reset password
  Future<AuthResult> resetPassword({required String email});

  // OTP verification
  /// Verifica el código OTP enviado al correo del usuario
  Future<AuthResult> verifyOTP({
    required String email,
    required String token,
    required String type,
  });

  /// Reenvía el código OTP al correo del usuario
  Future<AuthResult> resendOTP({required String email});

  // roles (solo para Delivery en la app móvil)
  /// Agrega un rol al usuario actual
  /// Usado principalmente para activar rol Delivery desde la app
  Future<void> addRoleToUser(String userId, UserRole role);

  /// Crea el registro en la tabla delivery_person cuando se activa el rol Delivery
  Future<void> createDeliveryPersonRecord(String userId);
}
