// ...existing code...
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:parchemos_prod/v2/parchemos/login/application/providers/auth_repository_provider.dart';
import 'package:parchemos_prod/v2/parchemos/login/presentation/widgets/auth_header.dart';
import 'package:parchemos_prod/v2/parchemos/login/presentation/widgets/sign_up_form.dart';
import 'package:parchemos_prod/v2/parchemos/login/presentation/widgets/social_login_buttons.dart';
import 'package:parchemos_prod/v2/parchemos/theme/application/theme_provider.dart';

class SignUpScreen extends ConsumerStatefulWidget {
  const SignUpScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends ConsumerState<SignUpScreen> {
  @override
  Widget build(BuildContext context) {
    final theme = ref.watch(themeProvider);

    // Escuchar cambios de autenticación (para OAuth)
    ref.listen(authStateProvider, (previous, next) {
      // Si el usuario se autentica con OAuth (Google/Apple), navegar según rol
      if (next.value != null && previous?.value == null) {
        Future.delayed(const Duration(milliseconds: 500), () {
          if (mounted) {
            final user = next.value;
            final isDelivery = user?.roles.any((role) => role.value == 'delivery') ?? false;
            
            if (isDelivery) {
              Navigator.pushReplacementNamed(context, '/delivery-home');
            } else {
              Navigator.pushReplacementNamed(context, '/home');
            }
          }
        });
      }
    });

    return Scaffold(
      backgroundColor: theme.secondaryBackground,
      appBar: AppBar(
        backgroundColor: theme.secondaryBackground,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: theme.primaryText),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Crear Cuenta', style: theme.titleMedium),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Padding(
                // Ajusta el padding inferior según el teclado para evitar que el contenido quede oculto
                padding: EdgeInsets.fromLTRB(
                  24,
                  24,
                  24,
                  MediaQuery.of(context).viewInsets.bottom + 24,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Header con logo y subtitle
                    const AuthHeader(
                      title: 'Parchemos',
                      subtitle: 'Únete a la comunidad',
                    ),
                    const SizedBox(height: 32),

                    // Botones de autenticación social
                    const SocialLoginButtons(),
                    const SizedBox(height: 24),

                    // Separador "O regístrate con email"
                    Row(
                      children: [
                        Expanded(child: Divider(color: theme.secondaryText)),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Text(
                            'O regístrate con email',
                            style: theme.bodyMedium,
                          ),
                        ),
                        Expanded(child: Divider(color: theme.secondaryText)),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Formulario de registro
                    const SignUpForm(),
                    const SizedBox(height: 24),

                    // Link para ir a login
                    Center(
                      child: TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: RichText(
                          text: TextSpan(
                            text: '¿Ya tienes cuenta? ',
                            style: theme.bodyMedium,
                            children: [
                              TextSpan(
                                text: 'Iniciar sesión',
                                style: theme.labelMedium.copyWith(
                                  color: theme.primary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ...existing code...
