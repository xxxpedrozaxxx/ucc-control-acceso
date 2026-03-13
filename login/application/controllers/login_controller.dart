import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:parchemos_prod/v2/parchemos/login/application/providers/auth_repository_provider.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/entities/auth_result.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/entities/auth_user.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/use_cases/sign_in_with_email_use_case.dart';

class LoginState {
  final bool isLoading;
  final AuthUser? user;
  final String? errorMessage;

  LoginState({required this.isLoading, this.user, this.errorMessage});

  // Estado inicial (nada cargando, sin errores)
  factory LoginState.initial() => LoginState(isLoading: false);

  // Estado cargando (botón deshabilitado, spinner visible)
  factory LoginState.loading() => LoginState(isLoading: true);

  // Estado exitoso (usuario autenticado)
  factory LoginState.success(AuthUser user) =>
      LoginState(isLoading: false, user: user);

  // Estado de error (mostrar mensaje)
  factory LoginState.error(String message) =>
      LoginState(isLoading: false, errorMessage: message);
}

// 🎮 Controlador del formulario de login
class LoginController extends StateNotifier<LoginState> {
  final SignInWithEmailUseCase signInUseCase;

  LoginController(this.signInUseCase) : super(LoginState.initial());

  Future<void> signInWithEmail(String email, String password) async {
    state = LoginState.loading();

    final result = await signInUseCase.call(email: email, password: password);

    if (result.status == AuthStatus.success) {
      if (result.user != null) {
        state = LoginState.success(result.user!);
      } else {
        state = LoginState.error('No se pudo obtener el usuario');
      }
    } else {
      state = LoginState.error(result.message ?? 'Error desconocido');
    }
  }
}

// Provider del controller (para usarlo en la UI)
final loginControllerProvider =
    StateNotifierProvider<LoginController, LoginState>((ref) {
      final repository = ref.watch(authRepositoryProvider);
      final signInUseCase = SignInWithEmailUseCase(repository);
      return LoginController(signInUseCase);
    });
