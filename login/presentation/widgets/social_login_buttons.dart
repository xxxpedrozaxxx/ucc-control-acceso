import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:parchemos_prod/v2/parchemos/login/application/controllers/social_controller.dart';

class SocialLoginButtons extends ConsumerWidget {
  const SocialLoginButtons({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final socialState = ref.watch(socialAuthControllerProvider);

    // Escuchar errores
    ref.listen(socialAuthControllerProvider, (previous, next) {
      if (next.errorMessage != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.errorMessage!),
            backgroundColor: Colors.red,
          ),
        );
      }
    });

    return Column(
      children: [
        // Botón de Google
        SizedBox(
          width: double.infinity,
          height: 50,
          child: OutlinedButton(
            onPressed: socialState.isLoading
                ? null
                : () {
                    ref
                        .read(socialAuthControllerProvider.notifier)
                        .signInWithGoogle();
                  },
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Colors.grey, width: 1),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              backgroundColor: Colors.white,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Icono de Google (puedes usar un asset o package)
                Icon(
                  Icons.g_mobiledata,
                  size: 28,
                  color: socialState.isLoading ? Colors.grey : Colors.black,
                ),
                const SizedBox(width: 12),
                Text(
                  'Registrarse con Google',
                  style: TextStyle(
                    color: socialState.isLoading ? Colors.grey : Colors.black,
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),

        // Botón de Apple
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: socialState.isLoading
                ? null
                : () {
                    ref
                        .read(socialAuthControllerProvider.notifier)
                        .signInWithApple();
                  },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.black,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              elevation: 0,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.apple, size: 28, color: Colors.white),
                const SizedBox(width: 12),
                Text(
                  'Registrarse con Apple',
                  style: TextStyle(
                    color: socialState.isLoading ? Colors.grey : Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
