import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:parchemos_prod/v2/parchemos/shared/ui/elegant_notification.dart';
import 'package:parchemos_prod/v2/parchemos/login/application/controllers/sign_up_controller.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/entities/user_role.dart';
import 'package:parchemos_prod/v2/parchemos/login/presentation/screens/otp_verification_screen.dart';
import 'package:parchemos_prod/v2/parchemos/theme/domain/app_theme.dart';
import 'package:parchemos_prod/v2/parchemos/theme/presentation/theme_consumer.dart';

class SignUpForm extends ConsumerStatefulWidget {
  const SignUpForm({Key? key}) : super(key: key);

  @override
  ConsumerState<SignUpForm> createState() => _SignUpFormState();
}

class _SignUpFormState extends ThemeConsumerState<SignUpForm> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _acceptedTerms = false;
  UserRole _selectedRole = UserRole.customer; // Rol seleccionado por defecto

  @override
  Widget build(BuildContext context) {
    final signUpState = ref.watch(signUpControllerProvider);

    // Escuchar cambios de estado
    ref.listen(signUpControllerProvider, (previous, next) {
      if (next.errorMessage != null) {
        ElegantNotification.show(
          context,
          message: next.errorMessage!,
          type: NotificationType.error,
        );
      }

      if (next.user != null) {
        // Registro exitoso - Navegar a pantalla de verificación OTP
        Future.delayed(const Duration(milliseconds: 300), () {
          if (context.mounted) {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (context) => OtpVerificationScreen(
                  email: _emailController.text,
                  userRole: _selectedRole,
                ),
              ),
            );
          }
        });
      }
    });

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Campo de Nombre Completo
        Text('Nombre completo', style: theme.typography.bodyMedium),
        const SizedBox(height: 8),
        TextField(
          controller: _nameController,
          decoration: InputDecoration(
            hintText: 'Tu nombre completo',
            hintStyle: TextStyle(color: Colors.grey[400]),
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
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 14,
            ),
          ),
          textInputAction: TextInputAction.next,
        ),
        const SizedBox(height: 16),

        // Campo de Correo Electrónico
        Text(
          'Correo electrónico',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Colors.grey[800],
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _emailController,
          decoration: InputDecoration(
            hintText: 'tu@email.com',
            hintStyle: TextStyle(color: Colors.grey[400]),
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
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 14,
            ),
          ),
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.next,
        ),
        const SizedBox(height: 16),

        // Campo de Contraseña
        Text(
          'Contraseña',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Colors.grey[800],
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _passwordController,
          decoration: InputDecoration(
            hintText: 'Mínimo 6 caracteres',
            hintStyle: TextStyle(color: Colors.grey[400]),
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
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 14,
            ),
            suffixIcon: IconButton(
              icon: Icon(
                _obscurePassword ? Icons.visibility_off : Icons.visibility,
                color: Colors.grey[600],
              ),
              onPressed: () {
                setState(() {
                  _obscurePassword = !_obscurePassword;
                });
              },
            ),
          ),
          obscureText: _obscurePassword,
          textInputAction: TextInputAction.done,
        ),
        const SizedBox(height: 24),

        // Selector de Rol
        Text('¿Cómo quieres usar Parchemos?', style: theme.bodyMedium),
        const SizedBox(height: 12),
        Row(
          children: [
            // Opción Cliente
            Expanded(
              child: _RoleOptionCard(
                title: 'Cliente',
                icon: Icons.person_outline,
                description: 'Explorar y disfrutar',
                isSelected: _selectedRole == UserRole.customer,
                onTap: () {
                  setState(() {
                    _selectedRole = UserRole.customer;
                  });
                },
                theme: theme,
              ),
            ),
            const SizedBox(width: 12),
            // Opción Repartidor
            Expanded(
              child: _RoleOptionCard(
                title: 'Repartidor',
                icon: Icons.delivery_dining,
                description: 'Hacer entregas',
                isSelected: _selectedRole == UserRole.delivery,
                onTap: () {
                  setState(() {
                    _selectedRole = UserRole.delivery;
                  });
                },
                theme: theme,
              ),
            ),
          ],
        ),

        // Mensaje informativo si eligió Delivery
        if (_selectedRole == UserRole.delivery) ...[
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFFFF5F0),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: theme.primary.withOpacity(0.3)),
            ),
            child: Row(
              children: [
                Icon(Icons.info_outline, color: theme.primary, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Después del registro deberás completar un formulario con documentos',
                    style: theme.bodySmall,
                  ),
                ),
              ],
            ),
          ),
        ],
        const SizedBox(height: 16),

        // Checkbox de Términos y Condiciones
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: 24,
              width: 24,
              child: Checkbox(
                value: _acceptedTerms,
                onChanged: (value) {
                  setState(() {
                    _acceptedTerms = value ?? false;
                  });
                },
                activeColor: theme.primary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: GestureDetector(
                onTap: () {
                  setState(() {
                    _acceptedTerms = !_acceptedTerms;
                  });
                },
                child: RichText(
                  text: TextSpan(
                    text: 'Al registrarte aceptas los ',
                    style: theme.bodySmall,
                    children: [
                      TextSpan(
                        text: 'Términos y Condiciones',
                        style: theme.labelSmall,
                      ),
                      TextSpan(text: ' de Parchemos'),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Botón de Crear Cuenta
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: (signUpState.isLoading || !_acceptedTerms)
                ? null
                : () {
                    // Validar que los campos no estén vacíos
                    if (_nameController.text.isEmpty ||
                        _emailController.text.isEmpty ||
                        _passwordController.text.isEmpty) {
                      ElegantNotification.show(
                        context,
                        message: 'Por favor completa todos los campos',
                        type: NotificationType.warning,
                      );
                      return;
                    }

                    // Llamar al controller
                    ref
                        .read(signUpControllerProvider.notifier)
                        .signUpWithEmail(
                          name: _nameController.text,
                          email: _emailController.text,
                          password: _passwordController.text,
                          confirmPassword: _passwordController.text,
                          role: _selectedRole, // Enviar rol seleccionado
                          acceptTerms:
                              _acceptedTerms, // Enviar flag de términos
                        );
                  },
            style: ElevatedButton.styleFrom(
              backgroundColor: theme.primary,
              disabledBackgroundColor: Colors.grey[300],
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              elevation: 0,
            ),
            child: signUpState.isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2,
                    ),
                  )
                : const Text(
                    'Crear cuenta',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
          ),
        ),
      ],
    );
  }



  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}

/// Widget para mostrar una opción de rol (Cliente o Repartidor)
class _RoleOptionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final String description;
  final bool isSelected;
  final VoidCallback onTap;
  final AppTheme theme;

  const _RoleOptionCard({
    Key? key,
    required this.title,
    required this.icon,
    required this.description,
    required this.isSelected,
    required this.onTap,
    required this.theme,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFFFF5F0) : Colors.grey[50],
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? theme.primary : Colors.grey[300]!,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: isSelected ? theme.primary : Colors.grey[600],
              size: 32,
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: isSelected ? theme.primary : Colors.grey[800],
              ),
            ),
            const SizedBox(height: 4),
            Text(
              description,
              style: TextStyle(fontSize: 11, color: Colors.grey[600]),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
