import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/entities/auth_user.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/ports/auth_repository.dart';
import 'package:parchemos_prod/v2/parchemos/login/infra/supabase_auth_adapter.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return SupabaseAuthAdapter();
});

/// Provider que escucha cambios en el estado de autenticación
final authStateProvider = StreamProvider<AuthUser?>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return repository.authStateChanges;
});
