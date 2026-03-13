# Configuración de Recuperación de Contraseña

## 🔧 CONFIGURACIÓN CRÍTICA EN SUPABASE

### 1. URLs de Redirect (Authentication → URL Configuration)

Agrega estas URLs en **Redirect URLs**:

```
http://localhost:5173/update-password
http://localhost:5173/auth/callback
http://127.0.0.1:5173/auth/callback
```

### 2. Email Templates (Authentication → Email Templates)

**IMPORTANTE**: Debes editar el template "Reset Password" en Supabase:

1. Ve a: **Authentication** → **Email Templates** → **Reset Password**

2. Cambia la URL del botón de:
   ```
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery
   ```
   
   A:
   ```
   {{ .SiteURL }}?token_hash={{ .TokenHash }}&type=recovery#access_token={{ .Token }}&refresh_token={{ .RefreshToken }}&type=recovery
   ```

   O mejor aún (formato más simple):
   ```
   {{ .SiteURL }}#access_token={{ .Token }}&refresh_token={{ .RefreshToken }}&type=recovery
   ```

3. **Guarda** el template

### 3. Site URL (Authentication → URL Configuration)

Asegúrate de que **Site URL** sea:
```
http://localhost:5173
```

## ¿Por qué este cambio?

El problema del PKCE (Proof Key for Code Exchange) es que:
- El `code_verifier` se guarda en localStorage cuando solicitas el reset
- Cuando abres el enlace en una nueva ventana/tab, ese verifier se pierde
- Por eso obtienes el error: "Code verifier could not be found in local storage"

La solución es usar **tokens de acceso directo** en lugar del flujo PKCE para recuperación de contraseña.

## Flujo de recuperación de contraseña

1. **Usuario solicita recuperar contraseña** (`forgot_password_screen.dart`)
   - Ingresa su email
   - El sistema envía un correo con un enlace de recuperación
   - URL del enlace: `http://localhost:5173/update-password?code=XXXXX&type=recovery`

2. **Usuario hace clic en el enlace del correo**
   - La app carga la pantalla `update_password_screen.dart`
   - Se extrae el parámetro `code` de la URL
   - Se intercambia el `code` por una sesión usando `exchangeCodeForSession()`
   - Una vez establecida la sesión, el usuario puede cambiar su contraseña

3. **Usuario actualiza su contraseña**
   - Ingresa la nueva contraseña dos veces
   - Se llama a `auth.updateUser()` para cambiar la contraseña
   - Se redirige al login

## Problemas comunes

### Error: "El enlace ha expirado o es inválido"

**Causas:**
- La URL de redirect no está configurada en Supabase
- El formato de la URL no coincide exactamente
- El token `code` ha expirado (duran 1 hora por defecto)
- El token ya fue usado

**Soluciones:**
- Verificar que todas las URLs estén en Supabase
- Solicitar un nuevo enlace de recuperación
- Verificar que el formato de URL sea: `http://localhost:5173/update-password`

### Error: "verifier could not be found in local storage"

**Causas:**
- El navegador bloqueó las cookies/localStorage
- Las cookies de terceros están deshabilitadas
- El navegador está en modo incógnito

**Soluciones:**
- Usar el navegador en modo normal (no incógnito)
- Habilitar cookies y localStorage
- Verificar la configuración de privacidad del navegador

## Testing

Para probar el flujo completo:

1. Ejecuta la app: `flutter run -t lib/main_v2.dart -d chrome --web-port=5173`
2. Ve a la pantalla de login
3. Haz clic en "¿Olvidaste tu contraseña?"
4. Ingresa un email válido registrado
5. Revisa el correo (puede tardar unos minutos)
6. Haz clic en el enlace del correo
7. Ingresa la nueva contraseña
8. Verifica que puedas hacer login con la nueva contraseña

## Notas importantes

- Los enlaces de recuperación expiran en 1 hora
- Cada enlace solo puede usarse una vez
- Si el proceso falla, solicita un nuevo enlace
- La contraseña debe tener al menos 6 caracteres
- Asegúrate de estar usando el puerto 5173 en desarrollo

## Logs útiles

La pantalla `update_password_screen.dart` tiene logs detallados:

```
🔐 Verificando sesión de Supabase...
🔍 URL completa: ...
🔑 Recovery code encontrado: true/false
⏳ Intercambiando recovery code por sesión...
✅ Sesión establecida exitosamente
```

Revisa la consola de DevTools para ver estos logs y diagnosticar problemas.
