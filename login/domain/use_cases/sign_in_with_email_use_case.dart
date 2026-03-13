import 'package:parchemos_prod/v2/parchemos/login/domain/entities/auth_result.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/ports/auth_repository.dart';

class SignInWithEmailUseCase {
  // Implementation of the use case
  final AuthRepository _repository;

  SignInWithEmailUseCase(this._repository);

  Future<AuthResult> call({
    required String email,
    required String password,
  }) async {
    // Validar que el email no este vacio
    if (email.isEmpty) {
      return AuthResult(
        status: AuthStatus.error,
        message: 'El email no puede estar vacío',
      );
    }

    if (password.isEmpty) {
      return AuthResult(
        status: AuthStatus.error,
        message: 'La contraseña no puede estar vacía',
      );
    }

    // Validar que el email tenga un formato correcto
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(email)) {
      return AuthResult(status: AuthStatus.error, message: 'Email invalido.');
    }

    // Validar que la contraseña tenga al menos 6 caracteres
    if (password.length < 6) {
      return AuthResult(
        status: AuthStatus.error,
        message: 'La contraseña debe tener al menos 6 caracteres.',
      );
    }

    // Llamar al repositorio para iniciar sesión
    return await _repository.signInWithEmail(email: email, password: password);
  }
}
