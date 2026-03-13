import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import 'package:parchemos_prod/v2/parchemos/login/application/controllers/delivery_activation_controller.dart';
import 'package:parchemos_prod/v2/parchemos/login/application/providers/auth_state_provider.dart';
import 'package:parchemos_prod/v2/parchemos/login/presentation/widgets/auth_header.dart';

/// Pantalla para que un usuario registrado active el rol de Delivery
/// sin necesidad de volver a registrarse
class ActivateDeliveryScreen extends ConsumerWidget {
  const ActivateDeliveryScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final deliveryState = ref.watch(deliveryActivationControllerProvider);
    final authStateAsync = ref.watch(authStateProvider);

    // Escuchar cambios de estado
    ref.listen(deliveryActivationControllerProvider, (previous, next) {
      if (next.status == DeliveryActivationStatus.error &&
          next.errorMessage != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.errorMessage!),
            backgroundColor: Colors.red,
          ),
        );
      }

      if (next.status == DeliveryActivationStatus.success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('¡Rol de Delivery activado exitosamente!'),
            backgroundColor: Colors.green,
          ),
        );
        // TODO: Navegar a la pantalla principal o perfil
        // Navigator.pop(context);
      }
    });

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Center(
            child: Container(
              constraints: const BoxConstraints(maxWidth: 400),
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 40),

                  // Header con logo y título
                  const AuthHeader(
                    title: 'Conviértete en\nRepartidor',
                    subtitle:
                        'Completa la información y sube los documentos requeridos',
                  ),

                  const SizedBox(height: 40),

                  // Información requerida
                  _buildInfoCard(),

                  const SizedBox(height: 32),

                  // Campo de Cédula
                  _DocumentUploadField(
                    label: 'Cédula de Ciudadanía',
                    icon: Icons.badge_outlined,
                    filePath: deliveryState.ccPath,
                    onFileSelected: (path) {
                      ref
                          .read(deliveryActivationControllerProvider.notifier)
                          .setCCPath(path);
                    },
                  ),

                  const SizedBox(height: 20),

                  // Campo de Licencia
                  _DocumentUploadField(
                    label: 'Licencia de Conducción',
                    icon: Icons.credit_card,
                    filePath: deliveryState.licensePath,
                    onFileSelected: (path) {
                      ref
                          .read(deliveryActivationControllerProvider.notifier)
                          .setLicensePath(path);
                    },
                  ),

                  const SizedBox(height: 20),

                  // Campo de Vehículo
                  _DocumentUploadField(
                    label: 'Foto del Vehículo',
                    icon: Icons.directions_car,
                    filePath: deliveryState.vehiclePath,
                    onFileSelected: (path) {
                      ref
                          .read(deliveryActivationControllerProvider.notifier)
                          .setVehiclePath(path);
                    },
                  ),

                  const SizedBox(height: 40),

                  // Botón de activar
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed:
                          deliveryState.status ==
                                  DeliveryActivationStatus.loading ||
                              !deliveryState.isValid
                          ? null
                          : () {
                              // Obtener userId del AsyncValue
                              authStateAsync.whenData((authUser) {
                                final userId = authUser?.id;
                                if (userId == null) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text(
                                        'Error: Usuario no autenticado',
                                      ),
                                      backgroundColor: Colors.red,
                                    ),
                                  );
                                  return;
                                }

                                ref
                                    .read(
                                      deliveryActivationControllerProvider
                                          .notifier,
                                    )
                                    .activateDeliveryRole(userId);
                              });
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFF6B35),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        disabledBackgroundColor: Colors.grey[300],
                      ),
                      child:
                          deliveryState.status ==
                              DeliveryActivationStatus.loading
                          ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                strokeWidth: 2.5,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  Colors.white,
                                ),
                              ),
                            )
                          : const Text(
                              'Activar Rol de Repartidor',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Botón de cancelar
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: OutlinedButton(
                      onPressed: () {
                        Navigator.pop(context);
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFFFF6B35),
                        side: const BorderSide(
                          color: Color(0xFFFF6B35),
                          width: 1.5,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'Cancelar',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInfoCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF5F0),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFFF6B35).withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.info_outline,
                color: const Color(0xFFFF6B35),
                size: 24,
              ),
              const SizedBox(width: 12),
              const Text(
                'Documentos Requeridos',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF2D3748),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            '• Cédula de Ciudadanía (foto legible)\n'
            '• Licencia de Conducción vigente\n'
            '• Foto del vehículo (moto, carro, bicicleta)\n'
            '• Los documentos serán revisados por nuestro equipo',
            style: TextStyle(
              fontSize: 14,
              color: Color(0xFF4A5568),
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }
}

/// Widget reutilizable para subir documentos
class _DocumentUploadField extends StatelessWidget {
  final String label;
  final IconData icon;
  final String? filePath;
  final Function(String?) onFileSelected;

  const _DocumentUploadField({
    Key? key,
    required this.label,
    required this.icon,
    required this.filePath,
    required this.onFileSelected,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Color(0xFF2D3748),
          ),
        ),
        const SizedBox(height: 8),
        InkWell(
          onTap: () async {
            final result = await FilePicker.platform.pickFiles(
              type: FileType.image,
              allowMultiple: false,
            );

            if (result != null && result.files.isNotEmpty) {
              onFileSelected(result.files.first.path);
            }
          },
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: filePath != null
                  ? const Color(0xFFEFF6FF)
                  : Colors.grey[50],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: filePath != null
                    ? const Color(0xFF3B82F6)
                    : Colors.grey[300]!,
                width: 1.5,
              ),
            ),
            child: Row(
              children: [
                Icon(
                  icon,
                  color: filePath != null
                      ? const Color(0xFF3B82F6)
                      : Colors.grey[600],
                  size: 28,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        filePath != null
                            ? 'Documento cargado'
                            : 'Seleccionar documento',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: filePath != null
                              ? const Color(0xFF3B82F6)
                              : Colors.grey[700],
                        ),
                      ),
                      if (filePath != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          filePath!.split('/').last,
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey[600],
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ],
                  ),
                ),
                Icon(
                  filePath != null ? Icons.check_circle : Icons.upload_file,
                  color: filePath != null
                      ? const Color(0xFF10B981)
                      : Colors.grey[400],
                  size: 24,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
