# 🔐 Solución de Problemas: Google Sign-In

## ❓ Problema: "No aparecen todas mis cuentas de Google"

### 🎯 Causa Principal

El problema NO es tu código. Chrome en modo debug de Flutter usa un **perfil aislado** sin acceso a las sesiones de Google de tu navegador principal.

---

## ✅ Soluciones

### **Solución 1: Probar en navegador con sesión (Recomendado)**

Ejecuta la app usando el perfil principal de Chrome:

```bash
# Windows
flutter run -t lib/main_v2.dart -d chrome --web-browser-flag="--user-data-dir=%LOCALAPPDATA%\Google\Chrome\User Data"

# macOS/Linux
flutter run -t lib/main_v2.dart -d chrome --web-browser-flag="--user-data-dir=$HOME/.config/google-chrome"
```

### **Solución 2: Usar otro navegador**

```bash
flutter run -t lib/main_v2.dart -d edge      # Microsoft Edge
flutter run -t lib/main_v2.dart -d windows   # App de escritorio
```

### **Solución 3: Iniciar sesión manualmente en el navegador de pruebas**

1. Abre el navegador que usa Flutter (aparece en los logs)
2. Ve a https://accounts.google.com
3. Inicia sesión con todas las cuentas que quieras probar
4. Vuelve a probar el login en tu app

---

## 🔧 Verificación en Supabase

### 1. Configuración de Google OAuth

Ve a **Supabase Dashboard** → **Authentication** → **Providers** → **Google**

Verifica:
- ✅ Google está **habilitado**
- ✅ **Client ID** configurado
- ✅ **Client Secret** configurado
- ✅ **Authorized redirect URIs** correctas

### 2. Redirect URLs correctas

Deben incluir:
```
http://localhost:3000/auth/v1/callback
https://TU_PROYECTO.supabase.co/auth/v1/callback
```

### 3. Google Cloud Console

Ve a https://console.cloud.google.com → APIs & Services → Credentials

Verifica en tu **OAuth 2.0 Client ID**:
- ✅ **Authorized JavaScript origins:**
  - `http://localhost`
  - `http://localhost:3000`
  - `https://TU_PROYECTO.supabase.co`

- ✅ **Authorized redirect URIs:**
  - `http://localhost:3000/auth/v1/callback`
  - `https://TU_PROYECTO.supabase.co/auth/v1/callback`

---

## 🧪 Código Mejorado

Ya actualicé el código con mejoras:

```dart
await _supabaseClient.auth.signInWithOAuth(
  OAuthProvider.google,
  queryParams: {
    'prompt': 'select_account',  // ← Fuerza mostrar selector de cuentas
    'access_type': 'offline',
  },
);
```

### Parámetros OAuth explicados:

- **`prompt: 'select_account'`**: Fuerza a Google a mostrar el selector de cuentas, incluso si ya hay una sesión activa
- **`access_type: 'offline'`**: Permite obtener refresh tokens para mantener la sesión

---

## 🐛 Debug: Ver qué pasa

Agrega logs para debugging:

```dart
// En supabase_auth_adapter.dart
@override
Future<AuthResult> signInWithGoogle() async {
  try {
    print('🔵 Iniciando OAuth con Google...');
    
    await _supabaseClient.auth.signInWithOAuth(
      OAuthProvider.google,
      queryParams: {
        'prompt': 'select_account',
        'access_type': 'offline',
      },
    );

    print('✅ OAuth iniciado correctamente');
    return AuthResult(
      status: AuthStatus.success,
      message: 'Autenticación iniciada con Google',
    );
  } on AuthException catch (e) {
    print('❌ AuthException: ${e.message}');
    return AuthResult(
      status: AuthStatus.error, 
      message: _normalizeAuthMessage(e.message)
    );
  } catch (e) {
    print('❌ Error inesperado: $e');
    return AuthResult(
      status: AuthStatus.error,
      message: 'Error inesperado: ${e.toString()}',
    );
  }
}
```

---

## 📱 Mejor Práctica: Probar en Plataformas Nativas

Para una mejor experiencia de usuario en producción:

### Android/iOS
```bash
flutter run -t lib/main_v2.dart -d <device_id>
```

En móvil, Google Sign-In usa la API nativa y muestra TODAS las cuentas del dispositivo automáticamente.

### Windows/macOS
```bash
flutter run -t lib/main_v2.dart -d windows  # o macos
```

Las apps de escritorio también tienen mejor integración con el sistema operativo.

---

## ✅ Checklist Final

Antes de considerar que hay un problema real:

- [ ] He probado en el navegador principal (no el de debug)
- [ ] He verificado la configuración en Supabase
- [ ] He verificado la configuración en Google Cloud Console
- [ ] Las redirect URIs están correctamente configuradas
- [ ] He probado en al menos 2 navegadores diferentes
- [ ] He probado en una plataforma nativa (Android/iOS/Windows)

Si después de esto sigue sin funcionar, el problema está en la configuración de OAuth, no en el código.

---

## 🆘 ¿Aún no funciona?

1. **Revisa los logs de Supabase:**
   - Dashboard → Logs → Auth Logs
   - Busca errores de redirect o CORS

2. **Revisa la consola del navegador:**
   - F12 → Console
   - Busca errores de CORS o redirect

3. **Verifica que la app esté usando HTTPS en producción:**
   - Google OAuth requiere HTTPS (excepto localhost)

4. **Reinicia los servicios:**
   ```bash
   flutter clean
   flutter pub get
   flutter run
   ```
