import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:parchemos_prod/v2/parchemos/login/application/providers/auth_repository_provider.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/entities/auth_result.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/use_cases/reset_password_use_case.dart';

class ResetPasswordState {
  final bool isLoading;
  final String? successMessage;
  final String? errorMessage;

  ResetPasswordState({
    required this.isLoading,
    this.successMessage,
    this.errorMessage,
  });

  factory ResetPasswordState.initial() => ResetPasswordState(isLoading: false);
  factory ResetPasswordState.loading() => ResetPasswordState(isLoading: true);
  factory ResetPasswordState.success(String message) =>
      ResetPasswordState(isLoading: false, successMessage: message);
  factory ResetPasswordState.error(String message) =>
      ResetPasswordState(isLoading: false, errorMessage: message);
}

class ResetPasswordController extends StateNotifier<ResetPasswordState> {
  final ResetPasswordUseCase resetPasswordUseCase;

  ResetPasswordController(this.resetPasswordUseCase)
      : super(ResetPasswordState.initial());

  Future<void> resetPassword(String email) async {
    print('📧 Iniciando reset password para: $email');
    state = ResetPasswordState.loading();

    final result = await resetPasswordUseCase.call(email: email);

    print('📧 Resultado reset password: ${result.status}');
    print('📧 Mensaje: ${result.message}');

    if (result.status == AuthStatus.success) {
      state = ResetPasswordState.success(
        result.message ?? 'Se ha enviado un correo para restablecer tu contraseña',
      );
    } else {
      state = ResetPasswordState.error(
        result.message ?? 'Error al enviar el correo',
      );
    }
  }
}

final resetPasswordControllerProvider =
    StateNotifierProvider<ResetPasswordController, ResetPasswordState>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  final resetPasswordUseCase = ResetPasswordUseCase(repository);
  return ResetPasswordController(resetPasswordUseCase);
});
