# 🔐 Módulo de Login - Clean Architecture

## 📦 Estructura Completada

```
lib/v2/parchemos/login/
├── domain/                     ✅ COMPLETADO
│   ├── entities/
│   │   ├── auth_user.dart         → Interfaz de usuario autenticado
│   │   ├── auth_result.dart       → Wrapper de resultados de auth
│   │   └── user_profile.dart      → Perfil completo del usuario
│   ├── ports/
│   │   └── auth_repository.dart   → Interface de autenticación
│   └── use_cases/
│       ├── sign_in_with_email_use_case.dart   → Login con email/password
│       ├── sign_up_with_email_use_case.dart   → Registro con email/password
│       ├── sign_in_with_google_use_case.dart  → Login con Google
│       └── sign_in_with_apple_use_case.dart   → Login con Apple
│
├── infra/                      ✅ COMPLETADO
│   ├── auth_user_impl.dart           → Implementación de AuthUser
│   └── supabase_auth_adapter.dart    → Adapter para Supabase
│
├── application/                ✅ COMPLETADO
│   ├── providers/
│   │   ├── auth_repository_provider.dart → Inyección del repository
│   │   └── auth_state_provider.dart      → Stream reactivo de auth
│   └── controllers/
│       ├── login_controller.dart         → Controller de login
│       ├── sign_up_controller.dart       → Controller de registro
│       └── social_controller.dart        → Controller de auth social
│
└── presentation/               ⏳ PENDIENTE
    ├── screens/
    │   ├── login_screen.dart       → Pantalla de inicio de sesión
    │   └── sign_up_screen.dart     → Pantalla de registro
    └── widgets/
        ├── login_form.dart         → Formulario de login
        ├── sign_up_form.dart       → Formulario de registro
        ├── social_login_buttons.dart → Botones Google/Apple
        └── auth_header.dart        → Header reutilizable
```

---

## 🎯 Presentation Layer - Guía de Implementación

### 📋 Use Cases Disponibles

#### **Login (Email/Password)**
```dart
// Use Case: SignInWithEmailUseCase
// Validaciones:
- Email no vacío
- Email con formato válido
- Password no vacío
- Password >= 6 caracteres
```

#### **Registro (Email/Password)**
```dart
// Use Case: SignUpWithEmailUseCase
// Validaciones:
- Nombre no vacío (>= 2 caracteres)
- Email no vacío y válido
- Password >= 6 caracteres
- Passwords coincidentes
```

#### **Login Social (Google/Apple)**
```dart
// Use Cases: SignInWithGoogleUseCase, SignInWithAppleUseCase
// Sin validaciones (solo clic en botón)
```

---

## 🎮 Controllers Disponibles

### **1️⃣ LoginController**
```dart
// Provider: loginControllerProvider
// Estado: LoginState (isLoading, user, errorMessage)

// Uso en UI:
final loginState = ref.watch(loginControllerProvider);

// Llamar método:
ref.read(loginControllerProvider.notifier).signInWithEmail(email, password);
```

### **2️⃣ SignUpController**
```dart
// Provider: signUpControllerProvider
// Estado: SignUpState (isLoading, user, errorMessage)

// Uso en UI:
final signUpState = ref.watch(signUpControllerProvider);

// Llamar método:
ref.read(signUpControllerProvider.notifier).signUpWithEmail(
  name: name,
  email: email,
  password: password,
  confirmPassword: confirmPassword,
);
```

### **3️⃣ SocialAuthController**
```dart
// Provider: socialAuthControllerProvider
// Estado: SocialAuthState (isLoading, errorMessage)

// Uso en UI:
final socialState = ref.watch(socialAuthControllerProvider);

// Llamar métodos:
ref.read(socialAuthControllerProvider.notifier).signInWithGoogle();
ref.read(socialAuthControllerProvider.notifier).signInWithApple();
```

---

## 📱 Guía para Crear Pantallas

### **SignUpScreen (Registro)**

**Ubicación:** `lib/v2/parchemos/login/presentation/screens/sign_up_screen.dart`

**Estructura sugerida:**
```dart
class SignUpScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final signUpState = ref.watch(signUpControllerProvider);
    
    return Scaffold(
      appBar: AppBar(title: Text('Crear Cuenta')),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: BoxConstraints(maxWidth: 400),
              child: Column(
                children: [
                  // Logo o header
                  AuthHeader(title: 'Únete a Parchemos'),
                  SizedBox(height: 32),
                  
                  // Formulario de registro
                  SignUpForm(),
                  SizedBox(height: 16),
                  
                  // O separador
                  Row(
                    children: [
                      Expanded(child: Divider()),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16),
                        child: Text('O continúa con'),
                      ),
                      Expanded(child: Divider()),
                    ],
                  ),
                  SizedBox(height: 16),
                  
                  // Botones sociales
                  SocialLoginButtons(),
                  SizedBox(height: 24),
                  
                  // Link a login
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: Text('¿Ya tienes cuenta? Inicia sesión'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
```

---

### **SignUpForm Widget**

**Ubicación:** `lib/v2/parchemos/login/presentation/widgets/sign_up_form.dart`

**Campos necesarios:**
```dart
class SignUpForm extends ConsumerStatefulWidget {
  @override
  ConsumerState<SignUpForm> createState() => _SignUpFormState();
}

class _SignUpFormState extends ConsumerState<SignUpForm> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  
  @override
  Widget build(BuildContext context) {
    final signUpState = ref.watch(signUpControllerProvider);
    
    // Escuchar cambios de estado
    ref.listen(signUpControllerProvider, (previous, next) {
      if (next.errorMessage != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(next.errorMessage!)),
        );
      }
      
      if (next.user != null) {
        // Navegar a home o pantalla de bienvenida
        Navigator.pushReplacementNamed(context, '/home');
      }
    });
    
    return Column(
      children: [
        // Campo de Nombre
        TextField(
          controller: _nameController,
          decoration: InputDecoration(
            labelText: 'Nombre completo',
            prefixIcon: Icon(Icons.person),
            border: OutlineInputBorder(),
          ),
          textInputAction: TextInputAction.next,
        ),
        SizedBox(height: 16),
        
        // Campo de Email
        TextField(
          controller: _emailController,
          decoration: InputDecoration(
            labelText: 'Correo electrónico',
            prefixIcon: Icon(Icons.email),
            border: OutlineInputBorder(),
          ),
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.next,
        ),
        SizedBox(height: 16),
        
        // Campo de Password
        TextField(
          controller: _passwordController,
          decoration: InputDecoration(
            labelText: 'Contraseña',
            prefixIcon: Icon(Icons.lock),
            suffixIcon: IconButton(
              icon: Icon(_obscurePassword ? Icons.visibility : Icons.visibility_off),
              onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
            ),
            border: OutlineInputBorder(),
          ),
          obscureText: _obscurePassword,
          textInputAction: TextInputAction.next,
        ),
        SizedBox(height: 16),
        
        // Campo de Confirmar Password
        TextField(
          controller: _confirmPasswordController,
          decoration: InputDecoration(
            labelText: 'Confirmar contraseña',
            prefixIcon: Icon(Icons.lock_outline),
            suffixIcon: IconButton(
              icon: Icon(_obscureConfirmPassword ? Icons.visibility : Icons.visibility_off),
              onPressed: () => setState(() => _obscureConfirmPassword = !_obscureConfirmPassword),
            ),
            border: OutlineInputBorder(),
          ),
          obscureText: _obscureConfirmPassword,
          textInputAction: TextInputAction.done,
        ),
        SizedBox(height: 24),
        
        // Botón de Registro
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: signUpState.isLoading ? null : () {
              ref.read(signUpControllerProvider.notifier).signUpWithEmail(
                name: _nameController.text,
                email: _emailController.text,
                password: _passwordController.text,
                confirmPassword: _confirmPasswordController.text,
              );
            },
            child: signUpState.isLoading
              ? CircularProgressIndicator(color: Colors.white)
              : Text('Crear Cuenta', style: TextStyle(fontSize: 16)),
          ),
        ),
      ],
    );
  }
  
  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }
}
```

---

## 🎨 Widgets Reutilizables

### **SocialLoginButtons**

Ya mencionado anteriormente, pero actualizado para usar `SocialAuthController`:

```dart
class SocialLoginButtons extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final socialState = ref.watch(socialAuthControllerProvider);
    
    return Column(
      children: [
        // Botón de Google
        SizedBox(
          width: double.infinity,
          height: 50,
          child: OutlinedButton.icon(
            onPressed: socialState.isLoading ? null : () {
              ref.read(socialAuthControllerProvider.notifier).signInWithGoogle();
            },
            icon: Icon(Icons.g_mobiledata, size: 28), // O usa un asset
            label: Text('Continuar con Google'),
          ),
        ),
        SizedBox(height: 12),
        
        // Botón de Apple
        SizedBox(
          width: double.infinity,
          height: 50,
          child: OutlinedButton.icon(
            onPressed: socialState.isLoading ? null : () {
              ref.read(socialAuthControllerProvider.notifier).signInWithApple();
            },
            icon: Icon(Icons.apple, size: 28),
            label: Text('Continuar con Apple'),
          ),
        ),
      ],
    );
  }
}
```

---

## ✅ Checklist de Implementación

### **Pantalla de Registro (SignUp)**
- [ ] Crear `sign_up_screen.dart`
- [ ] Crear `sign_up_form.dart` con 4 campos
- [ ] Validación visual de campos
- [ ] Botón de "Crear Cuenta" con loading
- [ ] Integración con `signUpControllerProvider`
- [ ] Mostrar errores con SnackBar
- [ ] Navegación al home después de registro exitoso
- [ ] Link para ir a login si ya tiene cuenta
- [ ] Botones de Google y Apple (reutilizar widget)
- [ ] Diseño responsive (max width 400)

### **Pantalla de Login (Login)**
- [ ] Crear `login_screen.dart`
- [ ] Crear `login_form.dart` con email/password
- [ ] Integración con `loginControllerProvider`
- [ ] Link para ir a registro
- [ ] Link "¿Olvidaste tu contraseña?"

---

## 🚀 Para Empezar

1. **Crear estructura de carpetas:**
   ```bash
   mkdir -p lib/v2/parchemos/login/presentation/screens
   mkdir -p lib/v2/parchemos/login/presentation/widgets
   ```

2. **Verificar imports disponibles:**
   ```dart
   import 'package:flutter_riverpod/flutter_riverpod.dart';
   import 'package:parchemos_prod/v2/parchemos/login/application/controllers/sign_up_controller.dart';
   import 'package:parchemos_prod/v2/parchemos/login/application/controllers/social_controller.dart';
   ```

3. **Empezar por `sign_up_screen.dart`**

---

## 📞 Dudas Frecuentes

**Q: ¿Cómo manejo la navegación después del registro?**
```dart
ref.listen(signUpControllerProvider, (previous, next) {
  if (next.user != null) {
    Navigator.pushReplacementNamed(context, '/home');
  }
});
```

**Q: ¿Cómo muestro errores?**
```dart
if (next.errorMessage != null) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(next.errorMessage!)),
  );
}
```

**Q: ¿Cómo deshabilito el botón mientras carga?**
```dart
onPressed: state.isLoading ? null : () { ... }
```

---

¡Éxito creando las pantallas! 🎨
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final loginState = ref.watch(loginControllerProvider);
    
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: 400),
            child: Padding(
              padding: EdgeInsets.all(24),
              child: Column(
                children: [
                  LoginHeader(),
                  SocialLoginButtons(),
                  LoginForm(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
```

---

### 2️⃣ Crear LoginForm

**Ubicación:** `lib/v2/parchemos/login/presentation/widgets/login_form.dart`

**Requisitos:**
- TextFields para email y password
- Validación visual (mostrar errores)
- Botón "Iniciar Sesión" que:
  - Se deshabilita cuando `isLoading == true`
  - Muestra CircularProgressIndicator cuando carga
  - Llama a `ref.read(loginControllerProvider.notifier).signInWithEmail()`

**Ejemplo:**
```dart
ElevatedButton(
  onPressed: loginState.isLoading ? null : () {
    ref.read(loginControllerProvider.notifier).signInWithEmail(
      emailController.text,
      passwordController.text,
    );
  },
  child: loginState.isLoading
    ? CircularProgressIndicator()
    : Text('Iniciar Sesión'),
)
```

---

### 3️⃣ Crear SocialLoginButtons

**Ubicación:** `lib/v2/parchemos/login/presentation/widgets/social_login_buttons.dart`

**Requisitos:**
- Botón de Google (usa el repository directamente)
- Botón de Apple (usa el repository directamente)

**Ejemplo:**
```dart
ElevatedButton.icon(
  onPressed: () {
    final repository = ref.read(authRepositoryProvider);
    repository.signInWithGoogle();
  },
  icon: Icon(Icons.g_mobiledata), // O usa un asset
  label: Text('Continuar con Google'),
)
```

---

## 📚 Providers Disponibles

### Para usar en la UI:

```dart
// 1. Escuchar estado del login
final loginState = ref.watch(loginControllerProvider);

// 2. Llamar métodos del controller
ref.read(loginControllerProvider.notifier).signInWithEmail(email, password);

// 3. Escuchar cambios de autenticación (opcional)
final authState = ref.watch(authStateProvider);

// 4. Acceder al repository directamente (para Google/Apple)
final repository = ref.read(authRepositoryProvider);
```

---

## 🎨 Diseño Sugerido

1. **Header:** Logo + Título "Bienvenido a Parchemos"
2. **Botones sociales:** Google y Apple (horizontal)
3. **Divider:** "O continúa con email"
4. **Formulario:** Email + Password + Botón
5. **Footer:** Link "¿No tienes cuenta? Regístrate"

---

## 🔍 Manejo de Estados

El `LoginState` tiene estos campos:

```dart
loginState.isLoading       // true cuando está cargando
loginState.user            // AuthUser si login exitoso
loginState.errorMessage    // String si hubo error
```

**Ejemplo de uso:**
```dart
if (loginState.errorMessage != null) {
  // Mostrar SnackBar con el error
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(loginState.errorMessage!)),
  );
}

if (loginState.user != null) {
  // Navegar a HomeScreen
  Navigator.pushReplacement(...);
}
```

---

## ✅ Checklist de Implementación

- [ ] Crear `login_screen.dart`
- [ ] Crear `login_form.dart` con TextFields
- [ ] Crear `social_login_buttons.dart`
- [ ] Crear `login_header.dart` (logo + título)
- [ ] Manejar estados (loading, error, success)
- [ ] Navegación al HomeScreen después de login exitoso
- [ ] Diseño responsive (max width 400)
- [ ] Validación visual de campos
- [ ] Mensajes de error amigables

---

## 🚀 Para Probar

1. Bajar la rama:
   ```bash
   git pull origin feature/login
   ```

2. Verificar que no hay errores:
   ```bash
   flutter pub get
   flutter analyze lib/v2/parchemos/login/
   ```

3. Crear los widgets de UI en `presentation/`

4. Probar el flujo completo de login

---

## 📞 Dudas

Si tienes dudas sobre cómo usar los providers o el estado, revisa:
- `login_controller.dart` → Ver qué métodos están disponibles
- `auth_repository.dart` → Ver qué operaciones puedes hacer
- `auth_user.dart` → Ver qué datos tiene el usuario

¡Éxito con la UI! 🎨
