import 'dart:convert';

import 'package:parchemos_prod/v2/parchemos/login/domain/entities/auth_result.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/entities/auth_user.dart'
    as domain;
import 'package:parchemos_prod/v2/parchemos/login/domain/entities/user_role.dart';
import 'package:parchemos_prod/v2/parchemos/login/domain/ports/auth_repository.dart';
import 'package:parchemos_prod/v2/parchemos/login/infra/auth_user_impl.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseAuthAdapter implements AuthRepository {
  final SupabaseClient _supabaseClient = Supabase.instance.client;

  String _normalizeAuthMessage(String? raw) {
    if (raw == null) return 'Error inesperado en el servicio de autenticación';
    try {
      final decoded = json.decode(raw);
      if (decoded is Map) {
        if (decoded['message'] is String) return decoded['message'] as String;
        if (decoded['error'] is String) return decoded['error'] as String;
        if (decoded['msg'] is String) return decoded['msg'] as String;
      }
      return raw;
    } catch (_) {
      return raw;
    }
  }

  @override
  Stream<domain.AuthUser?> get authStateChanges {
    return _supabaseClient.auth.onAuthStateChange.map((event) {
      final user = event.session?.user;
      if (user == null) return null;
      return AuthUserImpl.fromUser(user);
    });
  }

  @override
  Future<domain.AuthUser?> getCurrentUser() async {
    final user = _supabaseClient.auth.currentUser;
    if (user == null) return null;
    return AuthUserImpl.fromUser(user);
  }

  @override
  bool get isAuthenticated => _supabaseClient.auth.currentUser != null;

  @override
  Future<AuthResult> resetPassword({required String email}) async {
    try {
      await _supabaseClient.auth.resetPasswordForEmail(
        email,
        redirectTo: 'http://localhost:5173/update-password',
      );
      return AuthResult(
        status: AuthStatus.success,
        message: 'Se ha enviado un correo para restablecer tu contraseña',
      );
    } on AuthException catch (e) {
      return AuthResult(
        status: AuthStatus.error,
        message: _normalizeAuthMessage(e.message),
      );
    } catch (e) {
      return AuthResult(
        status: AuthStatus.error,
        message: 'Error inesperado: ${e.toString()}',
      );
    }
  }

  @override
  Future<AuthResult> signInWithApple() async {
    try {
      await _supabaseClient.auth.signInWithOAuth(OAuthProvider.apple);

      // signInWithOAuth solo abre el navegador, no retorna el user directamente
      // Necesitas esperar el evento en authStateChanges
      return AuthResult(
        status: AuthStatus.success,
        message: 'Autenticación iniciada con Apple',
      );
    } on AuthException catch (e) {
      return AuthResult(
        status: AuthStatus.error,
        message: _normalizeAuthMessage(e.message),
      );
    } catch (e) {
      return AuthResult(
        status: AuthStatus.error,
        message: 'Error inesperado: ${e.toString()}',
      );
    }
  }

  @override
  Future<AuthResult> signInWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _supabaseClient.auth.signInWithPassword(
        email: email,
        password: password,
      );

      if (response.user == null) {
        return AuthResult(
          status: AuthStatus.error,
          message: 'No se pudo obtener el usuario',
        );
      }

      // Por ahora, crear AuthUser directamente sin buscar en user_data
      // Cuando esté lista la tabla user_data, descomentar la línea de abajo
      // final profile = await findUserProfile(response.user!.id);

      final authUser = AuthUserImpl.fromUser(response.user!);

      return AuthResult(status: AuthStatus.success, user: authUser);
    } on AuthException catch (e) {
      return AuthResult(
        status: AuthStatus.error,
        message: _normalizeAuthMessage(e.message),
      );
    } catch (e) {
      return AuthResult(
        status: AuthStatus.error,
        message: 'Error inesperado: ${e.toString()}',
      );
    }
  }

  @override
  Future<AuthResult> signInWithGoogle() async {
    try {
      // Configuración OAuth para Google con parámetros adicionales
      await _supabaseClient.auth.signInWithOAuth(
        OAuthProvider.google,
        redirectTo: null, // Usa el redirect URL por defecto de Supabase
        authScreenLaunchMode: LaunchMode.platformDefault,
        queryParams: {
          // Forzar a Google a mostrar el selector de cuentas
          'prompt': 'select_account',
          // Solicitar acceso al email y perfil
          'access_type': 'offline',
        },
      );

      // signInWithOAuth solo abre el navegador, no retorna el user directamente
      // Necesitas esperar el evento en authStateChanges
      return AuthResult(
        status: AuthStatus.success,
        message: 'Autenticación iniciada con Google',
      );
    } on AuthException catch (e) {
      return AuthResult(
        status: AuthStatus.error,
        message: _normalizeAuthMessage(e.message),
      );
    } catch (e) {
      return AuthResult(
        status: AuthStatus.error,
        message: 'Error inesperado: ${e.toString()}',
      );
    }
  }

  @override
  Future<void> signOut() {
    return _supabaseClient.auth.signOut();
  }

  @override
  Future<AuthResult> signUpWithEmail({
    required String name,
    required String email,
    required String password,
    UserRole? role,
    bool acceptTerms = false,
  }) async {
    try {
      // Determinar app_role según el rol seleccionado
      final String appRole;
      if (role == UserRole.delivery) {
        appRole = 'business'; // Repartidor = negocio
      } else {
        appRole = 'customer'; // Por defecto
      }

      final response = await _supabaseClient.auth.signUp(
        email: email,
        password: password,
        data: {
          'name': name,
          'roles': [
            role?.name ?? 'customer',
          ], // Mantener roles para compatibilidad
          'app_role': appRole, // Nuevo campo requerido por backend
          'accept_terms': acceptTerms, // Flag de términos aceptados
        },
      );

      if (response.user == null) {
        return AuthResult(
          status: AuthStatus.error,
          message: 'No se pudo crear el usuario',
        );
      }

      // Por ahora, crear AuthUser directamente sin buscar en user_data
      // Cuando esté lista la tabla user_data, descomentar la línea de abajo
      // final profile = await findUserProfile(response.user!.id);

      final authUser = AuthUserImpl.fromUser(response.user!);

      return AuthResult(
        status: AuthStatus.success,
        user: authUser,
        message: 'Usuario creado exitosamente',
      );
    } on AuthException catch (e) {
      return AuthResult(
        status: AuthStatus.error,
        message: _normalizeAuthMessage(e.message),
      );
    } catch (e) {
      return AuthResult(
        status: AuthStatus.error,
        message: 'Error inesperado: ${e.toString()}',
      );
    }
  }

  @override
  Future<AuthResult> verifyOTP({
    required String email,
    required String token,
    required String type,
  }) async {
    try {
      final response = await _supabaseClient.auth.verifyOTP(
        email: email,
        token: token,
        type: OtpType.values.firstWhere(
          (e) => e.name == type,
          orElse: () => OtpType.signup,
        ),
      );

      if (response.user == null) {
        return AuthResult(
          status: AuthStatus.error,
          message: 'No se pudo verificar el código',
        );
      }

      final authUser = AuthUserImpl.fromUser(response.user!);

      return AuthResult(
        status: AuthStatus.success,
        user: authUser,
        message: 'Correo verificado exitosamente',
      );
    } on AuthException catch (e) {
      return AuthResult(
        status: AuthStatus.error,
        message: _normalizeAuthMessage(e.message),
      );
    } catch (e) {
      return AuthResult(
        status: AuthStatus.error,
        message: 'Error inesperado: ${e.toString()}',
      );
    }
  }

  @override
  Future<AuthResult> resendOTP({required String email}) async {
    try {
      await _supabaseClient.auth.resend(
        type: OtpType.signup,
        email: email,
      );

      return AuthResult(
        status: AuthStatus.success,
        message: 'Código reenviado exitosamente',
      );
    } on AuthException catch (e) {
      return AuthResult(
        status: AuthStatus.error,
        message: _normalizeAuthMessage(e.message),
      );
    } catch (e) {
      return AuthResult(
        status: AuthStatus.error,
        message: 'Error inesperado: ${e.toString()}',
      );
    }
  }

  @override
  Future<void> addRoleToUser(String userId, UserRole role) async {
    try {
      // Obtener el usuario actual de Supabase
      final user = _supabaseClient.auth.currentUser;
      if (user == null || user.id != userId) {
        throw Exception('Usuario no autenticado o ID no coincide');
      }

      // Obtener los roles actuales desde user_metadata
      final currentMetadata = user.userMetadata ?? {};
      final currentRoles =
          (currentMetadata['roles'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          ['customer']; // Por defecto, customer

      // Si el rol ya existe, no hacer nada
      final roleString = role.name;
      if (currentRoles.contains(roleString)) {
        return;
      }

      // Agregar el nuevo rol
      final updatedRoles = [...currentRoles, roleString];

      // Actualizar los user_metadata en Supabase
      await _supabaseClient.auth.updateUser(
        UserAttributes(data: {...currentMetadata, 'roles': updatedRoles}),
      );
    } on AuthException catch (e) {
      throw Exception('Error al agregar rol: ${e.message}');
    } catch (e) {
      throw Exception('Error inesperado al agregar rol: $e');
    }
  }

  @override
  Future<void> createDeliveryPersonRecord(String userId) async {
    try {
      // Verificar si ya existe el registro
      final existing = await _supabaseClient
          .from('delivery_person')
          .select('id')
          .eq('id', userId)
          .maybeSingle();

      // Si ya existe, no hacer nada
      if (existing != null) {
        return;
      }

      // Crear el registro en delivery_person
      await _supabaseClient.from('delivery_person').insert({
        'id': userId,
        'status': 'available',
        'is_online': true,
        'rating': 0.0,
        'total_deliveries': 0,
      });
    } on PostgrestException catch (e) {
      throw Exception('Error al crear registro de delivery: ${e.message}');
    } catch (e) {
      throw Exception('Error inesperado al crear registro de delivery: $e');
    }
  }
}
