import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:parchemos_prod/v2/parchemos/theme/presentation/theme_consumer.dart';

class AuthHeader extends ThemeConsumerWidget {
  final String title;
  final String subtitle;

  const AuthHeader({Key? key, required this.title, required this.subtitle})
    : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = this.theme(ref);
    return Column(
      children: [
        // Logo o título principal
        Text(
          title,
          style: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.bold,
            color: theme.primary,
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(height: 8),

        // Subtitle
        Text(
          subtitle,
          style: TextStyle(
            fontSize: 16,
            color: Colors.grey[600],
            fontWeight: FontWeight.w400,
          ),
        ),
      ],
    );
  }
}
