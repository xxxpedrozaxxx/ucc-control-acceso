import 'package:parchemos_prod/v2/parchemos/login/domain/entities/user_role.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/ports/auth_repository.dart';

/// Caso de uso para que un usuario registrado active el rol de Delivery
/// sin necesidad de volver a registrarse.
///
/// Requisitos:
/// - El usuario debe estar autenticado
/// - Debe proporcionar documentos: CC y licencia de conducción
class ActivateDeliveryRoleUseCase {
  final AuthRepository _authRepository;

  ActivateDeliveryRoleUseCase(this._authRepository);

  /// Activa el rol Delivery para el usuario actual
  ///
  /// [userId] - ID del usuario autenticado
  /// [documents] - Mapa con los documentos requeridos:
  ///   - 'cc' o 'id': Path/URL de la cédula de ciudadanía
  ///   - 'license': Path/URL de la licencia de conducción
  ///   - 'vehicle': Path/URL de la foto del vehículo
  ///
  /// Throws [DeliveryActivationException] si hay algún problema
  Future<void> call({
    required String userId,
    required Map<String, String> documents,
  }) async {
    // Validar que se proporcionen los documentos requeridos
    _validateDocuments(documents);

    // TODO: Aquí podrías agregar lógica adicional como:
    // - Subir los documentos a Supabase Storage
    // - Crear un registro en una tabla 'delivery_applications' para revisión
    // - Enviar notificación al equipo de administración

    // Agregar el rol Delivery al usuario
    await _authRepository.addRoleToUser(userId, UserRole.delivery);

    // Crear el registro en la tabla delivery_person
    await _authRepository.createDeliveryPersonRecord(userId);
  }

  /// Valida que los documentos requeridos estén presentes
  void _validateDocuments(Map<String, String> documents) {
    // Validar CC/ID
    final cc = documents['cc'] ?? documents['id'];
    if (cc == null || cc.isEmpty) {
      throw DeliveryActivationException(
        'Debes proporcionar tu cédula de ciudadanía',
      );
    }

    // Validar licencia de conducción
    final license = documents['license'];
    if (license == null || license.isEmpty) {
      throw DeliveryActivationException(
        'Debes proporcionar tu licencia de conducción',
      );
    }

    // Validar foto del vehículo
    final vehicle = documents['vehicle'];
    if (vehicle == null || vehicle.isEmpty) {
      throw DeliveryActivationException(
        'Debes proporcionar una foto de tu vehículo',
      );
    }
  }
}

/// Excepción personalizada para errores en la activación del rol Delivery
class DeliveryActivationException implements Exception {
  final String message;

  DeliveryActivationException(this.message);

  @override
  String toString() => message;
}
