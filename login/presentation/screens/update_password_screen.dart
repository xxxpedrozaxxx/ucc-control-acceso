import 'dart:async';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// Provider para indicar que estamos en modo recovery
final isInRecoveryModeProvider = StateProvider<bool>((ref) => false);

class UpdatePasswordScreen extends ConsumerStatefulWidget {
  const UpdatePasswordScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<UpdatePasswordScreen> createState() => _UpdatePasswordScreenState();
}

class _UpdatePasswordScreenState extends ConsumerState<UpdatePasswordScreen> {
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscureNewPassword = true;
  bool _obscureConfirmPassword = true;
  bool _isLoading = false;
  bool _sessionEstablished = false;
  StreamSubscription<AuthState>? _authSubscription;

  @override
  void initState() {
    super.initState();
    // Activar el modo recovery después de que el frame se construya
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(isInRecoveryModeProvider.notifier).state = true;
      print('🛡️ Modo recuperación activado');
    });
    _checkSession();
  }

  Future<void> _checkSession() async {
    try {
      print('🔐 Verificando sesión de Supabase...');
      print('🔍 Platform: ${kIsWeb ? "Web" : "Mobile/Desktop"}');
      
      // Escuchar eventos de auth
      bool sessionEstablished = false;
      
      print('⏳ Configurando listener de auth...');
      _authSubscription = Supabase.instance.client.auth.onAuthStateChange.listen((data) {
        print('🎧 Auth event recibido: ${data.event}');
        print('🎧 Session != null: ${data.session != null}');
        
        if (data.session != null && !sessionEstablished) {
          print('✅ Sesión establecida por evento: ${data.event}');
          print('✅ Usuario: ${data.session?.user.email}');
          sessionEstablished = true;
          if (mounted) {
            setState(() {
              _sessionEstablished = true;
            });
          }
        }
      });
      
      // Verificar si Supabase ya procesó la sesión inmediatamente
      print('⏳ Verificando sesión actual...');
      await Future.delayed(const Duration(milliseconds: 500));
      
      final immediateSession = Supabase.instance.client.auth.currentSession;
      if (immediateSession != null && !sessionEstablished) {
        print('✅ Sesión encontrada inmediatamente!');
        print('✅ Usuario: ${immediateSession.user.email}');
        sessionEstablished = true;
        if (mounted) {
          setState(() {
            _sessionEstablished = true;
          });
        }
        _authSubscription?.cancel();
        return;
      }
      
      // Supabase Flutter SDK maneja automáticamente:
      // - En web: parsea automáticamente los parámetros de URL (hash fragments, query params)
      // - En móvil: maneja deep links y tokens de auth
      // - Almacena la sesión en flutter_secure_storage (móvil) o localStorage (web)
      // Solo necesitamos esperar a que procese y emita el evento de auth
      
      print('⏳ Esperando procesamiento automático de Supabase...');
      print('💡 Supabase SDK maneja automáticamente los enlaces de recuperación');
      
      // Esperar hasta 15 segundos para que Supabase procese el enlace
      for (int i = 0; i < 15 && !sessionEstablished; i++) {
        await Future.delayed(const Duration(seconds: 1));
        
        // Verificar periódicamente si ya hay sesión
        final currentSession = Supabase.instance.client.auth.currentSession;
        if (currentSession != null && !sessionEstablished) {
          print('✅ Sesión establecida (verificación periódica)');
          print('✅ Usuario: ${currentSession.user.email}');
          sessionEstablished = true;
          if (mounted) {
            setState(() {
              _sessionEstablished = true;
            });
          }
          _authSubscription?.cancel();
          return;
        }
      }
      
      // Si después de 15 segundos no hay sesión
      if (!sessionEstablished && mounted) {
        print('❌ No se pudo establecer la sesión');
        _authSubscription?.cancel();
        _showMessage(
          'El enlace ha expirado o es inválido. Por favor, solicita uno nuevo.',
          isError: true,
        );
      }
    } catch (e) {
      print('❌ Error verificando sesión: $e');
      if (mounted) {
        _showMessage('Error al verificar la sesión: $e', isError: true);
      }
    }
  }

  @override
  void dispose() {
    // Desactivar el modo recovery al salir
    ref.read(isInRecoveryModeProvider.notifier).state = false;
    _authSubscription?.cancel();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _updatePassword() async {
    if (!_sessionEstablished) {
      _showMessage('Esperando establecer la sesión...', isError: true);
      return;
    }

    final newPassword = _newPasswordController.text.trim();
    final confirmPassword = _confirmPasswordController.text.trim();

    // Validaciones
    if (newPassword.isEmpty || confirmPassword.isEmpty) {
      _showMessage('Por favor completa todos los campos', isError: true);
      return;
    }

    if (newPassword.length < 6) {
      _showMessage('La contraseña debe tener al menos 6 caracteres', isError: true);
      return;
    }

    if (newPassword != confirmPassword) {
      _showMessage('Las contraseñas no coinciden', isError: true);
      return;
    }

    setState(() => _isLoading = true);

    try {
      print('🔐 Actualizando contraseña...');
      
      await Supabase.instance.client.auth.updateUser(
        UserAttributes(password: newPassword),
      );

      print('✅ Contraseña actualizada exitosamente');

      if (mounted) {
        // Mostrar diálogo de éxito
        await showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.check_circle_outline,
                    size: 50,
                    color: Colors.green,
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  '¡Contraseña actualizada!',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                Text(
                  'Tu contraseña ha sido cambiada exitosamente. Por favor inicia sesión nuevamente.',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
            actions: [
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFF6B35),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text('Entendido'),
                ),
              ),
            ],
          ),
        );
        
        // Cerrar sesión después del diálogo
        print('🚪 Cerrando sesión...');
        await Supabase.instance.client.auth.signOut();
        
        // Esperar un momento
        await Future.delayed(const Duration(milliseconds: 500));
        
        if (mounted) {
          // Navegar al login
          Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
        }
      }
    } catch (e) {
      print('❌ Error actualizando contraseña: $e');
      if (mounted) {
        _showMessage('Error al actualizar la contraseña: $e', isError: true);
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showMessage(String message, {required bool isError}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red : Colors.green,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Nueva contraseña',
          style: TextStyle(color: Colors.black),
        ),
      ),
      body: SafeArea(
        child: _sessionEstablished
            ? _buildPasswordForm()
            : _buildLoadingView(),
      ),
    );
  }

  Widget _buildLoadingView() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(
            color: Color(0xFFFF6B35),
          ),
          SizedBox(height: 16),
          Text(
            'Estableciendo sesión...',
            style: TextStyle(fontSize: 16, color: Colors.grey),
          ),
        ],
      ),
    );
  }

  Widget _buildPasswordForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
              const SizedBox(height: 24),
              
              // Icono
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: const Color(0xFFFF6B35).withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.lock_outline,
                  size: 40,
                  color: Color(0xFFFF6B35),
                ),
              ),
              
              const SizedBox(height: 24),
              
              // Título
              const Text(
                'Establece tu nueva contraseña',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
                textAlign: TextAlign.center,
              ),
              
              const SizedBox(height: 12),
              
              // Descripción
              Text(
                'Ingresa una contraseña segura que puedas recordar fácilmente.',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
              
              const SizedBox(height: 32),
              
              // Nueva Contraseña
              const Text(
                'Nueva contraseña',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _newPasswordController,
                obscureText: _obscureNewPassword,
                decoration: InputDecoration(
                  hintText: 'Mínimo 6 caracteres',
                  hintStyle: TextStyle(color: Colors.grey[400]),
                  filled: true,
                  fillColor: Colors.grey[50],
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: Colors.grey[300]!),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: Colors.grey[300]!),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(
                      color: Color(0xFFFF6B35),
                      width: 2,
                    ),
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 14,
                  ),
                  prefixIcon: const Icon(Icons.lock_outline),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscureNewPassword ? Icons.visibility_off : Icons.visibility,
                      color: Colors.grey[600],
                    ),
                    onPressed: () {
                      setState(() {
                        _obscureNewPassword = !_obscureNewPassword;
                      });
                    },
                  ),
                ),
                textInputAction: TextInputAction.next,
              ),
              
              const SizedBox(height: 16),
              
              // Confirmar Contraseña
              const Text(
                'Confirmar contraseña',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _confirmPasswordController,
                obscureText: _obscureConfirmPassword,
                decoration: InputDecoration(
                  hintText: 'Repite tu contraseña',
                  hintStyle: TextStyle(color: Colors.grey[400]),
                  filled: true,
                  fillColor: Colors.grey[50],
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: Colors.grey[300]!),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: Colors.grey[300]!),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(
                      color: Color(0xFFFF6B35),
                      width: 2,
                    ),
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 14,
                  ),
                  prefixIcon: const Icon(Icons.lock_outline),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscureConfirmPassword ? Icons.visibility_off : Icons.visibility,
                      color: Colors.grey[600],
                    ),
                    onPressed: () {
                      setState(() {
                        _obscureConfirmPassword = !_obscureConfirmPassword;
                      });
                    },
                  ),
                ),
                textInputAction: TextInputAction.done,
                onSubmitted: (_) => _updatePassword(),
              ),
              
              const SizedBox(height: 32),
              
              // Botón de actualizar
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _updatePassword,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFF6B35),
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: Colors.grey[300],
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    elevation: 0,
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Text(
                          'Actualizar contraseña',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                ),
              ),
            ],
          ),
    );
  }
}
