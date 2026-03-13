import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:parchemos_prod/v2/parchemos/login/application/providers/auth_repository_provider.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/entities/auth_user.dart'
    as domain;

final authStateProvider = StreamProvider<domain.AuthUser?>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return repository.authStateChanges;
});
