import 'package:parchemos_prod/v2/parchemos/login/domain/entities/auth_result.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/ports/auth_repository.dart';

class SignInWithAppleUseCase {
  final AuthRepository repository;

  SignInWithAppleUseCase(this.repository);

  Future<AuthResult> call() {
    return repository.signInWithApple();
  }
}
