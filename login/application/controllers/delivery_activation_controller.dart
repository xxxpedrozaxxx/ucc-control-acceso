import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:parchemos_prod/v2/parchemos/login/application/providers/activate_delivery_role_usecase_provider.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/usecases/activate_delivery_role_usecase.dart';

/// Estados posibles del proceso de activación de Delivery
enum DeliveryActivationStatus { initial, loading, success, error }

/// Estado del formulario de activación de Delivery
class DeliveryActivationState {
  final DeliveryActivationStatus status;
  final String? errorMessage;
  final String? ccPath; // Path del documento de CC
  final String? licensePath; // Path de la licencia
  final String? vehiclePath; // Path de la foto del vehículo

  DeliveryActivationState({
    this.status = DeliveryActivationStatus.initial,
    this.errorMessage,
    this.ccPath,
    this.licensePath,
    this.vehiclePath,
  });

  DeliveryActivationState copyWith({
    DeliveryActivationStatus? status,
    String? errorMessage,
    String? ccPath,
    String? licensePath,
    String? vehiclePath,
  }) {
    return DeliveryActivationState(
      status: status ?? this.status,
      errorMessage: errorMessage ?? this.errorMessage,
      ccPath: ccPath ?? this.ccPath,
      licensePath: licensePath ?? this.licensePath,
      vehiclePath: vehiclePath ?? this.vehiclePath,
    );
  }

  /// Valida si los documentos están completos
  bool get isValid =>
      ccPath != null && licensePath != null && vehiclePath != null;
}

/// Controlador del formulario de activación de Delivery
class DeliveryActivationController
    extends StateNotifier<DeliveryActivationState> {
  final ActivateDeliveryRoleUseCase _activateDeliveryRoleUseCase;

  DeliveryActivationController(this._activateDeliveryRoleUseCase)
    : super(DeliveryActivationState());

  /// Actualiza el path del documento de CC
  void setCCPath(String? path) {
    state = state.copyWith(
      ccPath: path,
      errorMessage: null, // Limpiar error al actualizar
    );
  }

  /// Actualiza el path de la licencia de conducción
  void setLicensePath(String? path) {
    state = state.copyWith(
      licensePath: path,
      errorMessage: null, // Limpiar error al actualizar
    );
  }

  /// Actualiza el path de la foto del vehículo
  void setVehiclePath(String? path) {
    state = state.copyWith(
      vehiclePath: path,
      errorMessage: null, // Limpiar error al actualizar
    );
  }

  /// Activa el rol de Delivery para el usuario
  Future<void> activateDeliveryRole(String userId) async {
    // Validar que los documentos estén completos
    if (!state.isValid) {
      state = state.copyWith(
        status: DeliveryActivationStatus.error,
        errorMessage: 'Debes proporcionar todos los documentos requeridos',
      );
      return;
    }

    // Iniciar carga
    state = state.copyWith(
      status: DeliveryActivationStatus.loading,
      errorMessage: null,
    );

    try {
      // Llamar al caso de uso
      await _activateDeliveryRoleUseCase(
        userId: userId,
        documents: {
          'cc': state.ccPath!,
          'license': state.licensePath!,
          'vehicle': state.vehiclePath!,
        },
      );

      // Éxito
      state = state.copyWith(status: DeliveryActivationStatus.success);
    } on DeliveryActivationException catch (e) {
      // Error de validación del caso de uso
      state = state.copyWith(
        status: DeliveryActivationStatus.error,
        errorMessage: e.message,
      );
    } catch (e) {
      // Error inesperado
      state = state.copyWith(
        status: DeliveryActivationStatus.error,
        errorMessage: 'Error inesperado: ${e.toString()}',
      );
    }
  }

  /// Resetea el estado del formulario
  void reset() {
    state = DeliveryActivationState();
  }
}

/// Provider del controlador de activación de Delivery
final deliveryActivationControllerProvider =
    StateNotifierProvider<
      DeliveryActivationController,
      DeliveryActivationState
    >((ref) {
      final useCase = ref.watch(activateDeliveryRoleUseCaseProvider);
      return DeliveryActivationController(useCase);
    });
