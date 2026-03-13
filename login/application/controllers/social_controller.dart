import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:parchemos_prod/v2/parchemos/login/application/providers/auth_repository_provider.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/entities/auth_result.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/use_cases/sign_in_with_apple_use_case.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/use_cases/sign_in_with_google_use_case.dart';

// Estado para autenticación social
class SocialAuthState {
  final bool isLoading;
  final String? errorMessage;

  SocialAuthState({required this.isLoading, this.errorMessage});

  //Estado inicial
  factory SocialAuthState.initial() => SocialAuthState(isLoading: false);

  // Estado cargando
  factory SocialAuthState.loading() => SocialAuthState(isLoading: true);

  // Estado exitoso (OAuth abre navegador, el user llega por authStateChanges)
  factory SocialAuthState.success() => SocialAuthState(isLoading: false);

  // Estado de error
  factory SocialAuthState.error(String message) =>
      SocialAuthState(isLoading: false, errorMessage: message);
}

// 🎮 Controlador para autenticación social (Google y Apple)
class SocialAuthController extends StateNotifier<SocialAuthState> {
  final SignInWithGoogleUseCase signInWithGoogleUseCase;
  final SignInWithAppleUseCase signInWithAppleUseCase;

  SocialAuthController({
    required this.signInWithGoogleUseCase,
    required this.signInWithAppleUseCase,
  }) : super(SocialAuthState.initial());

  // Método para iniciar sesión con Google
  Future<void> signInWithGoogle() async {
    state = SocialAuthState.loading();

    final result = await signInWithGoogleUseCase.call();

    if (result.status == AuthStatus.success) {
      state = SocialAuthState.success();
    } else {
      state = SocialAuthState.error(
        result.message ?? 'Error al iniciar sesión con Google',
      );
    }
  }

  // Método para iniciar sesión con Apple
  Future<void> signInWithApple() async {
    state = SocialAuthState.loading();

    final result = await signInWithAppleUseCase.call();

    if (result.status == AuthStatus.success) {
      state = SocialAuthState.success();
    } else {
      state = SocialAuthState.error(
        result.message ?? 'Error al iniciar sesión con Apple',
      );
    }
  }
}

// Provider del controller
final socialAuthControllerProvider =
    StateNotifierProvider<SocialAuthController, SocialAuthState>((ref) {
      final repository = ref.watch(authRepositoryProvider);
      final googleUseCase = SignInWithGoogleUseCase(repository);
      final appleUseCase = SignInWithAppleUseCase(repository);

      return SocialAuthController(
        signInWithGoogleUseCase: googleUseCase,
        signInWithAppleUseCase: appleUseCase,
      );
    });
