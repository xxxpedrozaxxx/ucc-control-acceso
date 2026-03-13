import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:parchemos_prod/v2/parchemos/login/application/providers/auth_repository_provider.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/entities/auth_result.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/entities/auth_user.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/entities/user_role.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/use_cases/sign_up_with_email_use_case.dart';

// 📦 Estado del formulario de registro
class SignUpState {
  final bool isLoading;
  final AuthUser? user;
  final String? errorMessage;

  SignUpState({required this.isLoading, this.user, this.errorMessage});

  //Estado inicial (pantalla recién abierta)
  factory SignUpState.initial() => SignUpState(isLoading: false);

  //Estado cargando (botón deshabilitado, mostrar spinner)
  factory SignUpState.loading() => SignUpState(isLoading: true);

  // Estado exitoso (registro completado)
  factory SignUpState.success(AuthUser user) =>
      SignUpState(isLoading: false, user: user);

  // Estado de error (mostrar mensaje)
  factory SignUpState.error(String message) =>
      SignUpState(isLoading: false, errorMessage: message);
}

// Controlador del formulario de registro
class SignUpController extends StateNotifier<SignUpState> {
  final SignUpWithEmailUseCase signUpUseCase;

  // Constructor: inicializa con estado inicial
  SignUpController(this.signUpUseCase) : super(SignUpState.initial());

  // Método principal: registrar usuario
  Future<void> signUpWithEmail({
    required String name,
    required String email,
    required String password,
    required String confirmPassword,
    UserRole? role,
    bool acceptTerms = false,
  }) async {
    // Cambiar estado a "loading" (mostrar spinner en UI)
    state = SignUpState.loading();

    // Llamar al use case (con todas las validaciones)
    final result = await signUpUseCase.call(
      name: name,
      email: email,
      password: password,
      confirmPassword: confirmPassword,
      role: role,
      acceptTerms: acceptTerms,
    );

    // Actualizar estado según el resultado
    if (result.status == AuthStatus.success) {
      // ✅ Registro exitoso
      if (result.user != null) {
        state = SignUpState.success(result.user!);
      } else {
        state = SignUpState.error('No se pudo obtener el usuario');
      }
    } else {
      // ❌ Error en el registro
      state = SignUpState.error(result.message ?? 'Error desconocido');
    }
  }
}

// Provider del controller (para usarlo en la UI)
final signUpControllerProvider =
    StateNotifierProvider<SignUpController, SignUpState>((ref) {
      final repository = ref.watch(authRepositoryProvider);
      final signUpUseCase = SignUpWithEmailUseCase(repository);
      return SignUpController(signUpUseCase);
    });
