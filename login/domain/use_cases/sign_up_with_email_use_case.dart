import 'package:parchemos_prod/v2/parchemos/login/domain/entities/auth_result.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/entities/user_role.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/ports/auth_repository.dart';

class SignUpWithEmailUseCase {
  final AuthRepository repository;

  SignUpWithEmailUseCase(this.repository);

  Future<AuthResult> call({
    required String name,
    required String email,
    required String password,
    required String confirmPassword,
    UserRole? role,
    bool acceptTerms = false,
  }) async {
    // Validar campos vacíos
    if (name.isEmpty ||
        email.isEmpty ||
        password.isEmpty ||
        confirmPassword.isEmpty) {
      return AuthResult(
        status: AuthStatus.error,
        message: 'Todos los campos son obligatorios',
      );
    }

    // Validar longitud del nombre
    if (name.trim().length < 2) {
      return AuthResult(
        status: AuthStatus.error,
        message: 'El nombre debe tener al menos 2 caracteres',
      );
    }

    // Validar formato de email
    if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(email)) {
      return AuthResult(
        status: AuthStatus.error,
        message: 'El correo electrónico no es válido',
      );
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return AuthResult(
        status: AuthStatus.error,
        message: 'La contraseña debe tener al menos 6 caracteres',
      );
    }

    // Validar que las contraseñas coincidan
    if (password != confirmPassword) {
      return AuthResult(
        status: AuthStatus.error,
        message: 'Las contraseñas no coinciden',
      );
    }

    // Llamar al repositorio para registrar al usuario
    return await repository.signUpWithEmail(
      name: name.trim(),
      email: email.trim(),
      password: password,
      role: role,
      acceptTerms: acceptTerms,
    );
  }
}
