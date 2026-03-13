# Sistema de Roles - Implementación Simplificada

## 📋 Resumen

Implementación mínima del sistema de roles para la app móvil de Parchemos. Solo maneja 3 roles en la aplicación móvil, siguiendo Clean Architecture.

## 🎯 Roles Implementados

### En la App Móvil (3 roles):

1. **Customer (Cliente)** 
   - Asignado automáticamente al registrarse
   - Rol por defecto para todos los usuarios
   
2. **Delivery (Repartidor)**
   - **Durante el registro**: Usuario puede elegir rol Delivery
   - Si elige Delivery → Se registra como Customer + Notificación para completar documentos
   - **Después del registro**: Cliente puede convertirse en Delivery
   - Requiere documentos: CC, Licencia de conducción y Foto del vehículo
   - Formulario único para ambos flujos (durante/después del registro)
   
3. **Creator (Creador)**
   - Asignado manualmente por el equipo
   - No gestionado desde la app móvil

### Roles en Dashboard (fuera del alcance):
- **Seller** - Manejo en dashboard web
- **Admin** - Manejo en dashboard web

## 🔄 Flujos de Activación de Delivery

### Flujo 1: Durante el Registro (Nuevo)

```
Usuario abre pantalla de Registro
    ↓
Usuario elige "Repartidor" en selector de rol
    ↓
Usuario completa formulario (nombre, email, password)
    ↓
Usuario acepta términos y crea cuenta
    ↓
Cuenta creada con rol "customer" por defecto
    ↓
Diálogo aparece: "Un paso más"
    ↓
Opciones:
  → "Más tarde": Navega a home como Customer
  → "Completar ahora": Navega a ActivateDeliveryScreen
    ↓
Usuario sube documentos (CC + Licencia + Vehículo)
    ↓
Usuario presiona "Activar Rol de Repartidor"
    ↓
Sistema valida y actualiza rol a Delivery
```

### Flujo 2: Después del Registro (Original)

```
Usuario ya registrado como Customer
    ↓
Usuario navega a opción "Convertirme en Repartidor"
    ↓
ActivateDeliveryScreen se abre
    ↓
Usuario sube documentos (CC + Licencia + Vehículo)
    ↓
Usuario presiona "Activar"
    ↓
Sistema valida y actualiza rol a Delivery
```

## 🏗️ Arquitectura

```
lib/v2/parchemos/login/
├── domain/
│   ├── entities/
│   │   ├── user_role.dart           # Enum con 3 roles
│   │   ├── auth_user.dart           # Interface con propiedad roles
│   │   └── ...
│   ├── ports/
│   │   └── auth_repository.dart     # Puerto con método addRoleToUser
│   └── usecases/
│       └── activate_delivery_role_usecase.dart  # Lógica para activar Delivery
│
├── infra/
│   ├── auth_user_impl.dart          # Extrae roles desde Supabase user_metadata
│   └── supabase_auth_adapter.dart   # Implementa addRoleToUser
│
├── application/
│   ├── providers/
│   │   └── activate_delivery_role_usecase_provider.dart
│   └── controllers/
│       └── delivery_activation_controller.dart  # StateNotifier para el formulario
│
└── presentation/
    └── screens/
        └── activate_delivery_screen.dart        # UI del formulario
```

## 📦 Archivos Creados/Modificados

### ✅ Creados (5 archivos nuevos)

1. **domain/entities/user_role.dart** - Enum de roles
2. **domain/usecases/activate_delivery_role_usecase.dart** - Caso de uso
3. **application/controllers/delivery_activation_controller.dart** - Controlador
4. **application/providers/activate_delivery_role_usecase_provider.dart** - Provider
5. **presentation/screens/activate_delivery_screen.dart** - UI del formulario

### 🔧 Modificados (4 archivos)

1. **domain/entities/auth_user.dart** - Agregada propiedad `roles` y extensiones
2. **domain/ports/auth_repository.dart** - Agregado método `addRoleToUser`
3. **infra/supabase_auth_adapter.dart** - Implementado `addRoleToUser`
4. **presentation/widgets/sign_up_form.dart** - Agregado selector de rol y diálogo

## 🗄️ Modelo de Datos

### Supabase - user_metadata

Los roles se guardan en `auth.users.user_metadata`:

```json
{
  "name": "Juan Pérez",
  "roles": ["customer", "delivery"]
}
```

### Cómo funciona

1. **Al registrarse**: Usuario obtiene rol `customer` automáticamente
2. **Activar Delivery**: Usuario completa formulario → roles: `["customer", "delivery"]`
3. **Creator**: Equipo asigna manualmente → roles: `["customer", "creator"]`

## 🚀 Uso

### 1. Registro con Selector de Rol

El formulario de registro ahora incluye:

```dart
// En sign_up_form.dart
Row(
  children: [
    // Opción Cliente
    _RoleOptionCard(title: 'Cliente', icon: Icons.person_outline),
    // Opción Repartidor
    _RoleOptionCard(title: 'Repartidor', icon: Icons.delivery_dining),
  ],
)
```

Si el usuario elige **Repartidor**:
- Se registra con rol `customer` (por defecto)
- Aparece un diálogo informativo post-registro
- Puede completar documentos ahora o después

### 2. Verificar rol del usuario

```dart
final authUser = await authRepository.getCurrentUser();

// Usando extensiones
if (authUser?.authUser.isDelivery ?? false) {
  // Mostrar funcionalidad de delivery
}

if (authUser?.authUser.hasRole(UserRole.creator) ?? false) {
  // Mostrar funcionalidad de creator
}

// Obteniendo lista completa
final roles = authUser?.authUser.roles ?? [];
```

### 2. Activar rol de Delivery (después del registro)

```dart
// En el código (por ejemplo, desde perfil del usuario)
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => const ActivateDeliveryScreen(),
  ),
);
```

El usuario:
1. Abre el formulario
2. Selecciona imagen de CC
3. Selecciona imagen de Licencia
4. Selecciona imagen del Vehículo
5. Presiona "Activar Rol de Repartidor"

## 🎨 UI del Formulario de Registro

### Nuevo Selector de Rol

- **Tarjetas visuales** para Cliente y Repartidor
- **Bordes y colores** indican selección (naranja #FF6B35)
- **Mensaje informativo** si elige Repartidor:
  - "Después del registro deberás completar un formulario con documentos"

### Diálogo Post-Registro (si eligió Delivery)

Título: **"Un paso más"**

Contenido:
- Lista de documentos requeridos (CC, Licencia, Vehículo)
- Info: "Por ahora serás Cliente. Una vez validados tus documentos..."

Acciones:
- **"Más tarde"** → Navega a home como Customer
- **"Completar ahora"** → Abre `ActivateDeliveryScreen`

## 🎨 UI del Formulario de Activación

La pantalla `ActivateDeliveryScreen` incluye:

- Header con logo y título "Conviértete en Repartidor"
- Card informativa con documentos requeridos
- Campo para subir CC (usa `file_picker`)
- Campo para subir Licencia (usa `file_picker`)
- **Campo para subir Foto del Vehículo** (usa `file_picker`)
- Botón principal naranja (#FF6B35) para activar
- Botón secundario para cancelar
- Feedback visual: loading, success, error

## 🧪 Validaciones

### En el UseCase:
- ✅ Valida que `cc` o `id` esté presente
- ✅ Valida que `license` esté presente
- ✅ **Valida que `vehicle` esté presente**
- ❌ Lanza `DeliveryActivationException` si falta alguno

### En el Controller:
- ✅ Valida que **los 3 documentos** estén completos antes de llamar al UseCase
- ✅ Maneja estados: initial, loading, success, error
- ✅ Muestra mensajes de error con SnackBar

### En el Formulario de Registro:
- ✅ Valida que nombre, email y password no estén vacíos
- ✅ Valida que términos estén aceptados
- ✅ Muestra diálogo solo si eligió Delivery

## 📝 TODO Futuro

- [ ] Subir documentos a Supabase Storage
- [ ] Crear tabla `delivery_applications` para revisión manual
- [ ] Notificar al equipo cuando usuario solicita Delivery
- [ ] Dashboard admin para aprobar/rechazar solicitudes Delivery
- [ ] Validación de documentos con OCR/IA
- [ ] Sistema de notificaciones push

## 🔐 Seguridad

- Los roles se guardan en `user_metadata` (solo el usuario autenticado puede leer sus propios datos)
- El método `addRoleToUser` verifica que el `userId` coincida con el usuario autenticado
- Para Creator: debe ser asignado manualmente por el equipo (no desde la app)

## 🎓 Aprendizaje

Este módulo demuestra:
- ✅ Clean Architecture aplicada (Domain → Infra → Application → Presentation)
- ✅ Uso de Riverpod para estado y dependencias
- ✅ Casos de uso con validaciones personalizadas
- ✅ Extensiones en Dart para agregar funcionalidad a interfaces
- ✅ Manejo de estados con StateNotifier
- ✅ Integración con Supabase user_metadata
- ✅ UI responsive con max-width 400px
- ✅ File picker para selección de documentos
- ✅ **Diálogos informativos con AlertDialog**
- ✅ **Selector de opciones con tarjetas visuales**
- ✅ **UX fluida: registro → notificación → formulario**

## 🆕 Mejoras Implementadas (v2.0)

### Cambios principales:
1. **Selector de rol en registro** - Usuario declara intención desde el inicio
2. **Diálogo post-registro** - Notifica necesidad de completar documentos
3. **Campo de vehículo agregado** - Ahora se requiere foto del vehículo (moto, carro, bici)
4. **Flujo más natural** - "Completar ahora" o "Más tarde"
5. **Formulario único reutilizable** - Mismo formulario para ambos flujos

### Ventajas:
- ✅ Mejor experiencia de usuario (declara intención temprano)
- ✅ Usuario sabe qué esperar antes de registrarse
- ✅ Opción de postergar si no tiene documentos listos
- ✅ Reduce fricción en onboarding
- ✅ Cliente puede convertirse en Delivery cuando quiera

---

**Fecha de Implementación**: 16 de Octubre, 2025  
**Versión**: 2.0.0 - Con selector de rol en registro  
**Estado**: ✅ Completo y sin errores de compilación
