import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:parchemos_prod/v2/parchemos/login/application/controllers/otp_verification_controller.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/entities/user_role.dart';
import 'package:parchemos_prod/v2/parchemos/shared/ui/elegant_notification.dart';
import 'package:parchemos_prod/v2/parchemos/theme/presentation/theme_consumer.dart';

class OtpVerificationScreen extends ConsumerStatefulWidget {
  final String email;
  final UserRole userRole;

  const OtpVerificationScreen({
    Key? key,
    required this.email,
    required this.userRole,
  }) : super(key: key);

  @override
  ConsumerState<OtpVerificationScreen> createState() =>
      _OtpVerificationScreenState();
}

class _OtpVerificationScreenState
    extends ThemeConsumerState<OtpVerificationScreen> {
  final List<TextEditingController> _controllers = List.generate(
    6,
    (_) => TextEditingController(),
  );
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());

  @override
  void initState() {
    super.initState();
    // Auto-focus en el primer campo
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusNodes[0].requestFocus();
    });
  }

  @override
  Widget build(BuildContext context) {
    final otpState = ref.watch(otpVerificationControllerProvider);

    // Escuchar cambios de estado
    ref.listen(otpVerificationControllerProvider, (previous, next) {
      if (next.errorMessage != null) {
        ElegantNotification.show(
          context,
          message: next.errorMessage!,
          type: NotificationType.error,
        );
      }

      if (next.isVerified) {
        // Verificación exitosa
        ElegantNotification.show(
          context,
          message: '¡Correo verificado exitosamente!',
          type: NotificationType.success,
        );

        Future.delayed(const Duration(milliseconds: 500), () {
          if (!mounted) return;

          // Después de verificar el email, ir al onboarding según el rol
          if (widget.userRole == UserRole.delivery) {
            // Repartidor: ir a formulario de onboarding de delivery
            Navigator.pushReplacementNamed(context, '/delivery-onboarding');
          } else {
            // Cliente: ir a formulario de onboarding de usuario
            Navigator.pushReplacementNamed(context, '/user-onboarding');
          }
        });
      }

      if (next.resendSuccess) {
        ElegantNotification.show(
          context,
          message: 'Código reenviado exitosamente',
          type: NotificationType.info,
        );
      }
    });

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black87),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 20),

              // Icono
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: theme.primary.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.email_outlined,
                  size: 60,
                  color: theme.primary,
                ),
              ),
              const SizedBox(height: 32),

              // Título
              Text(
                'Verificación de correo',
                style: theme.typography.headlineMedium.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),

              // Descripción
              Text(
                'Ingresa el código de 6 dígitos que enviamos a',
                style: theme.typography.bodyMedium.copyWith(
                  color: Colors.grey[600],
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 4),
              Text(
                widget.email,
                style: theme.typography.bodyMedium.copyWith(
                  fontWeight: FontWeight.w600,
                  color: Colors.black87,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),

              // Campos OTP
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: List.generate(6, (index) {
                  return _buildOtpField(index);
                }),
              ),
              const SizedBox(height: 32),

              // Botón de verificar
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: otpState.isLoading ? null : _verifyOtp,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: theme.primary,
                    disabledBackgroundColor: Colors.grey[300],
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    elevation: 0,
                  ),
                  child: otpState.isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Text(
                          'Verificar código',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 24),

              // Reenviar código
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    '¿No recibiste el código? ',
                    style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                  ),
                  TextButton(
                    onPressed: otpState.isLoading ? null : _resendOtp,
                    style: TextButton.styleFrom(
                      padding: EdgeInsets.zero,
                      minimumSize: const Size(0, 0),
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: Text(
                      'Reenviar',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: theme.primary,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOtpField(int index) {
    return SizedBox(
      width: 48,
      height: 56,
      child: TextField(
        controller: _controllers[index],
        focusNode: _focusNodes[index],
        textAlign: TextAlign.center,
        keyboardType: TextInputType.number,
        maxLength: 1,
        style: const TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.w600,
          color: Colors.black87,
        ),
        decoration: InputDecoration(
          counterText: '',
          filled: true,
          fillColor: Colors.grey[50],
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide(color: Colors.grey[300]!),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide(color: Colors.grey[300]!),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide(color: theme.primary, width: 2),
          ),
          contentPadding: const EdgeInsets.symmetric(vertical: 12),
        ),
        inputFormatters: [FilteringTextInputFormatter.digitsOnly],
        onChanged: (value) {
          if (value.isNotEmpty) {
            // Mover al siguiente campo
            if (index < 5) {
              _focusNodes[index + 1].requestFocus();
            } else {
              // Si es el último campo, quitar el foco
              _focusNodes[index].unfocus();
              // Verificar automáticamente si están todos llenos
              if (_isOtpComplete()) {
                _verifyOtp();
              }
            }
          }
        },
        onTap: () {
          // Seleccionar todo el texto al hacer tap
          _controllers[index].selection = TextSelection(
            baseOffset: 0,
            extentOffset: _controllers[index].text.length,
          );
        },
      ),
    );
  }

  bool _isOtpComplete() {
    return _controllers.every((controller) => controller.text.isNotEmpty);
  }

  String _getOtpCode() {
    return _controllers.map((c) => c.text).join();
  }

  void _verifyOtp() {
    if (!_isOtpComplete()) {
      ElegantNotification.show(
        context,
        message: 'Por favor ingresa el código completo',
        type: NotificationType.warning,
      );
      return;
    }

    final code = _getOtpCode();
    ref
        .read(otpVerificationControllerProvider.notifier)
        .verifyOTP(email: widget.email, token: code, type: 'signup');
  }

  void _resendOtp() {
    // Limpiar campos
    for (var controller in _controllers) {
      controller.clear();
    }
    _focusNodes[0].requestFocus();

    ref
        .read(otpVerificationControllerProvider.notifier)
        .resendOTP(email: widget.email);
  }

  @override
  void dispose() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }
}
