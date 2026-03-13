import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:parchemos_prod/v2/parchemos/login/application/providers/auth_repository_provider.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/usecases/activate_delivery_role_usecase.dart';

/// Provider del caso de uso para activar el rol Delivery
final activateDeliveryRoleUseCaseProvider =
    Provider<ActivateDeliveryRoleUseCase>((ref) {
      final authRepository = ref.watch(authRepositoryProvider);
      return ActivateDeliveryRoleUseCase(authRepository);
    });
