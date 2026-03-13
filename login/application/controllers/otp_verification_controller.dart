import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:parchemos_prod/v2/parchemos/login/application/providers/auth_repository_provider.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/entities/auth_result.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/entities/auth_user.dart';

// 📦 Estado del proceso de verificación OTP
class OtpVerificationState {
  final bool isLoading;
  final bool isVerified;
  final bool resendSuccess;
  final AuthUser? user;
  final String? errorMessage;

  OtpVerificationState({
    required this.isLoading,
    this.isVerified = false,
    this.resendSuccess = false,
    this.user,
    this.errorMessage,
  });

  // Estado inicial
  factory OtpVerificationState.initial() => OtpVerificationState(
        isLoading: false,
      );

  // Estado cargando
  factory OtpVerificationState.loading() => OtpVerificationState(
        isLoading: true,
      );

  // Estado verificado exitosamente
  factory OtpVerificationState.verified(AuthUser user) => OtpVerificationState(
        isLoading: false,
        isVerified: true,
        user: user,
      );

  // Estado de reenvío exitoso
  factory OtpVerificationState.resent() => OtpVerificationState(
        isLoading: false,
        resendSuccess: true,
      );

  // Estado de error
  factory OtpVerificationState.error(String message) => OtpVerificationState(
        isLoading: false,
        errorMessage: message,
      );
}

// 🎮 Controlador de verificación OTP
class OtpVerificationController extends StateNotifier<OtpVerificationState> {
  final Ref ref;

  OtpVerificationController(this.ref) : super(OtpVerificationState.initial());

  /// Verifica el código OTP
  Future<void> verifyOTP({
    required String email,
    required String token,
    required String type,
  }) async {
    state = OtpVerificationState.loading();

    try {
      final repository = ref.read(authRepositoryProvider);
      final result = await repository.verifyOTP(
        email: email,
        token: token,
        type: type,
      );

      if (result.status == AuthStatus.success && result.user != null) {
        state = OtpVerificationState.verified(result.user!);
      } else {
        state = OtpVerificationState.error(
          result.message ?? 'Código inválido o expirado',
        );
      }
    } catch (e) {
      state = OtpVerificationState.error(
        'Error al verificar el código: ${e.toString()}',
      );
    }
  }

  /// Reenvía el código OTP
  Future<void> resendOTP({required String email}) async {
    state = OtpVerificationState.loading();

    try {
      final repository = ref.read(authRepositoryProvider);
      final result = await repository.resendOTP(email: email);

      if (result.status == AuthStatus.success) {
        state = OtpVerificationState.resent();
      } else {
        state = OtpVerificationState.error(
          result.message ?? 'Error al reenviar el código',
        );
      }
    } catch (e) {
      state = OtpVerificationState.error(
        'Error al reenviar el código: ${e.toString()}',
      );
    }
  }
}

// 📍 Provider del controlador
final otpVerificationControllerProvider =
    StateNotifierProvider<OtpVerificationController, OtpVerificationState>(
  (ref) => OtpVerificationController(ref),
);
