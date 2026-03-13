import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:parchemos_prod/v2/parchemos/login/application/providers/auth_repository_provider.dart';
import 'package:parchemos_prod/v2/parchemos/login/presentation/widgets/auth_header.dart';
import 'package:parchemos_prod/v2/parchemos/login/presentation/widgets/login_form.dart';
import 'package:parchemos_prod/v2/parchemos/login/presentation/widgets/social_login_buttons.dart';
import 'package:parchemos_prod/v2/parchemos/theme/application/theme_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
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
        title: Text('Iniciar Sesión', style: theme.titleMedium),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Padding(
                padding: EdgeInsets.fromLTRB(
                  24,
                  24,
                  24,
                  MediaQuery.of(context).viewInsets.bottom + 24,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const AuthHeader(
                      title: 'Parchemos',
                      subtitle: 'Bienvenido de vuelta',
                    ),
                    const SizedBox(height: 24),

                    // Social login buttons
                    const SocialLoginButtons(),
                    const SizedBox(height: 24),

                    // Divider
                    Row(
                      children: [
                        Expanded(child: Divider(color: theme.secondaryText)),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Text(
                            'O continúa con email',
                            style: theme.bodyMedium,
                          ),
                        ),
                        Expanded(child: Divider(color: theme.secondaryText)),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Formulario de login
                    const LoginForm(),

                    const SizedBox(height: 16),

                    Center(
                      child: TextButton(
                        onPressed: () =>
                            Navigator.pushNamed(context, '/signup'),
                        child: RichText(
                          text: TextSpan(
                            text: '¿No tienes cuenta? ',
                            style: theme.bodyMedium,
                            children: [
                              TextSpan(
                                text: 'Crear cuenta',
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
