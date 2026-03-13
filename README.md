# Sistema de Control de Acceso - Universidad Cooperativa de Colombia (UCC)

## 📋 Descripción del Proyecto

Sistema web (PWA) para gestionar el ingreso contingente de usuarios que **NO portan su carnet físico** en las entradas de la Universidad Cooperativa de Colombia.

### Características Principales

- 🔑 Login simple con **ID institucional** único
- 👥 Soporte para múltiples roles por usuario (Estudiante, Empleado, Contratista)
- 🚫 Sistema automático de bloqueos por acumulación de fallas o pérdida/robo
- 📊 Panel administrativo exclusivo para empleados autorizados
- 📈 Exportación de reportes mensuales a Excel
- 📥 Carga masiva de datos por semestre mediante CSV
- 🎨 Interfaz institucional con colores corporativos UCC (azul y naranja)

### ⚠️ Importante
Esta aplicación **SOLO** se usa cuando el usuario **NO trae el carnet físico**. No registra ingresos normales.

---

## 🗄️ Diseño de la Base de Datos

### Diagrama ER (Entity-Relationship)

```dbml
// --- Tablas Maestras ---

Table Usuarios {
  id integer [primary key, note: 'ID interno del sistema']
  id_institucional varchar [unique, note: 'ID que asigna la UCC (Ej: 80XXXX)']
  documento_identidad varchar [unique, note: 'Cédula de Ciudadanía']
  nombre_completo varchar
  correo_institucional varchar [unique]
  estado_general enum('activo', 'bloqueado') [default: 'activo']
  total_fallas integer [default: 0]
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table Roles {
  id integer [primary key]
  nombre_rol varchar [note: 'Estudiante, Empleado, Contratista']
  descripcion text
  created_at timestamp [default: 'now()']
}

// Relación de muchos a muchos: Un usuario puede ser Estudiante y Empleado a la vez
Table Usuario_Roles {
  usuario_id integer
  rol_id integer
  fecha_asignacion timestamp [default: 'now()']
  activo boolean [default: true]
  primary key (usuario_id, rol_id)
}

// --- Tablas de Información Específica por Rol ---

Table Info_Estudiantes {
  usuario_id integer [primary key]
  programa_academico varchar
  facultad varchar
  campus_sede varchar
  semestre integer
  estado_academico enum('activo', 'inactivo', 'graduado') [default: 'activo']
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table Info_Empleados {
  usuario_id integer [primary key]
  dependencia varchar
  cargo varchar
  tipo_contrato enum('indefinido', 'fijo', 'prestacion_servicios')
  fecha_ingreso date
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table Info_Contratistas {
  usuario_id integer [primary key]
  empresa_proveedora varchar
  nit_proveedor varchar
  area_asignada varchar
  fecha_inicio_contrato date
  fecha_fin_contrato date
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

// --- Gestión de Incidencias ---

Table Registro_Fallas {
  id integer [primary key]
  usuario_id integer
  fecha_hora timestamp [default: 'now()']
  motivo enum('olvido', 'perdida', 'robo')
  observacion text
  sede_registro varchar
  vigilante_registro varchar [note: 'Quien registró el ingreso']
}

Table Historial_Bloqueos {
  id integer [primary key]
  usuario_id integer
  fecha_bloqueo timestamp [default: 'now()']
  motivo_bloqueo enum('limite_fallas', 'perdida_carnet', 'robo_carnet', 'administrativo')
  observacion_bloqueo text
  fecha_desbloqueo timestamp [null]
  desbloqueado_por integer [null, note: 'ID del admin que desbloqueó']
  observacion_desbloqueo text [null]
  estado enum('activo', 'resuelto') [default: 'activo']
}

Table Administradores {
  id integer [primary key]
  usuario_id integer [unique]
  nivel_acceso enum('director', 'supervisor', 'vigilancia')
  permisos json [note: 'Permisos específicos del admin']
  created_at timestamp [default: 'now()']
}

Table Auditoria {
  id integer [primary key]
  accion varchar [note: 'Tipo de acción realizada']
  tabla_afectada varchar
  registro_id integer
  usuario_id integer [note: 'Quien realizó la acción']
  admin_id integer [null, note: 'Si fue un admin']
  datos_anteriores json
  datos_nuevos json
  ip_address varchar
  fecha_hora timestamp [default: 'now()']
}

// --- Relaciones ---
Ref: Usuario_Roles.usuario_id > Usuarios.id [delete: cascade]
Ref: Usuario_Roles.rol_id > Roles.id
Ref: Info_Estudiantes.usuario_id - Usuarios.id [delete: cascade]
Ref: Info_Empleados.usuario_id - Usuarios.id [delete: cascade]
Ref: Info_Contratistas.usuario_id - Usuarios.id [delete: cascade]
Ref: Registro_Fallas.usuario_id > Usuarios.id
Ref: Historial_Bloqueos.usuario_id > Usuarios.id
Ref: Historial_Bloqueos.desbloqueado_por > Administradores.id
Ref: Administradores.usuario_id - Usuarios.id
Ref: Auditoria.usuario_id > Usuarios.id
Ref: Auditoria.admin_id > Administradores.id
```

---

## 📊 Estructura de Tablas

### 1. **Usuarios** (Tabla Principal)
Almacena la información básica de todos los usuarios del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INTEGER | Identificador interno único |
| `id_institucional` | VARCHAR | ID asignado por la UCC (Ej: 80XXXX) |
| `documento_identidad` | VARCHAR | Cédula de ciudadanía |
| `nombre_completo` | VARCHAR | Nombre completo del usuario |
| `correo_institucional` | VARCHAR | Email institucional @ucc.edu.co |
| `estado_general` | ENUM | 'activo' o 'bloqueado' |
| `total_fallas` | INTEGER | Contador acumulado de fallas |
| `created_at` | TIMESTAMP | Fecha de registro |
| `updated_at` | TIMESTAMP | Última actualización |

### 2. **Roles**
Define los tipos de roles disponibles en el sistema.

| Campo | Tipo | Valores |
|-------|------|---------|
| `id` | INTEGER | 1: Estudiante, 2: Empleado, 3: Contratista |
| `nombre_rol` | VARCHAR | Nombre descriptivo del rol |
| `descripcion` | TEXT | Descripción del rol |

### 3. **Usuario_Roles** (Tabla Puente)
Implementa la relación muchos a muchos entre usuarios y roles.

**Ejemplo de Multivincularidad:**
```
Usuario ID: 80123456
- Rol 1 (Estudiante) ✓
- Rol 2 (Empleado) ✓
- Rol 3 (Contratista) ✗
```

### 4. **Info_Estudiantes**
Información específica para usuarios con rol de estudiante.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `programa_academico` | VARCHAR | Ingeniería de Sistemas, Derecho, etc. |
| `facultad` | VARCHAR | Facultad a la que pertenece |
| `campus_sede` | VARCHAR | Bogotá, Medellín, Cali, etc. |
| `semestre` | INTEGER | Semestre actual cursando |
| `estado_academico` | ENUM | activo, inactivo, graduado |

### 5. **Info_Empleados**
Información específica para usuarios con rol de empleado.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `dependencia` | VARCHAR | Tesorería, Admisiones, etc. |
| `cargo` | VARCHAR | Coordinador, Asistente, etc. |
| `tipo_contrato` | ENUM | Tipo de vinculación laboral |
| `fecha_ingreso` | DATE | Fecha de inicio laboral |

### 6. **Info_Contratistas**
Información específica para usuarios con rol de contratista.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `empresa_proveedora` | VARCHAR | Nombre de la empresa contratista |
| `nit_proveedor` | VARCHAR | NIT de la empresa |
| `area_asignada` | VARCHAR | Área donde presta servicios |
| `fecha_inicio_contrato` | DATE | Inicio del contrato |
| `fecha_fin_contrato` | DATE | Fin del contrato |

### 7. **Registro_Fallas**
Historial de todas las incidencias reportadas.

| Campo | Tipo | Opciones |
|-------|------|----------|
| `motivo` | ENUM | 'olvido', 'perdida', 'robo' |
| `fecha_hora` | TIMESTAMP | Momento del registro |
| `sede_registro` | VARCHAR | Sede donde se registró |
| `vigilante_registro` | VARCHAR | Persona que registró |

### 8. **Historial_Bloqueos**
Registro de bloqueos y desbloqueos de usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `motivo_bloqueo` | ENUM | Razón del bloqueo |
| `fecha_bloqueo` | TIMESTAMP | Cuándo se bloqueó |
| `fecha_desbloqueo` | TIMESTAMP | Cuándo se desbloqueó (nullable) |
| `desbloqueado_por` | INTEGER | ID del administrador |
| `estado` | ENUM | 'activo' o 'resuelto' |

### 9. **Administradores**
Usuarios con permisos administrativos.

| Campo | Tipo | Niveles |
|-------|------|---------|
| `nivel_acceso` | ENUM | director, supervisor, vigilancia |
| `permisos` | JSON | Permisos detallados |

### 10. **Auditoria**
Registro de todas las acciones importantes del sistema.

---

## 🔄 Reglas de Negocio

### 1. **Sistema de Fallas (Olvido)**

```
OLVIDO (permite 3 veces, a la 4ta se bloquea):
├─ 1ra vez: +1 falla → ✅ INGRESO PERMITIDO (1/4)
├─ 2da vez: +1 falla → ✅ INGRESO PERMITIDO (2/4)
├─ 3ra vez: +1 falla → ⚠️ INGRESO PERMITIDO (3/4) - RIESGO
└─ 4ta vez: +1 falla → 🚫 BLOQUEADO AUTOMÁTICAMENTE

PÉRDIDA o ROBO:
└─ 🚫 BLOQUEO INMEDIATO (sin incrementar contador)
```

### 2. **Estados del Usuario**

| Estado | Descripción | Puede Ingresar | Acción Requerida |
|--------|-------------|----------------|------------------|
| `activo` | Usuario sin restricciones | ✅ SÍ | Ninguna |
| `bloqueado` | Restricción activa | ❌ NO | Ir a Dirección |

### 3. **Proceso de Desbloqueo**

**Todos los bloqueos** (olvido, pérdida, robo) pueden ser desbloqueados por administradores.

**Efectos del desbloqueo:**
- Usuario vuelve a estado `activo`
- Contador de fallas se resetea a `0`
- Se registra en auditoría quién y cuándo desbloqueó

### 4. **Administradores**

Los administradores son **empleados normales** con permisos especiales (nivel: director o supervisor).

### 5. **Gestión Semestral**

**Al finalizar cada semestre:**
1. Exportar todos los datos a Excel
2. Limpiar base de datos (eliminar todos los registros excepto admins)
3. Cargar CSV con datos del nuevo semestre
4. Contador de fallas inicia en 0 para todos

---

## 🎯 Flujos de Usuario

### Flujo 1: Usuario Normal (Primera vez sin carnet)

```
1. Pantalla de Login
   ├─ Input: ID Institucional (Ej: 80123456)
   └─ Botón: "INGRESAR"
   ↓
2. Validación del ID
   ├─ Si no existe: "ID no encontrado"
   └─ Si existe: Continuar
   ↓
3. Pantalla de Información del Usuario
   ├─ Mostrar: Nombre completo, roles (Estudiante/Empleado/Contratista)
   ├─ Mostrar: Datos específicos por rol
   └─ Mostrar: Fallas acumuladas actuales
   ↓
4. Selector de Motivo
   ├─ [🤦‍♂️] Olvido
   ├─ [😰] Pérdida
   └─ [🚨] Robo
   ↓
5. Procesamiento según motivo seleccionado
```

### Flujo 2: Selección "OLVIDO"

```
Usuario selecciona: OLVIDO
   ↓
Sistema incrementa: total_fallas + 1
   ↓
Evalúa contador:
├─ Si fallas < 4:
│  └─ ✅ "Ingreso Permitido"
│     └─ Mostrar advertencia: "Fallas: X/4"
│
└─ Si fallas = 4:
   └─ 🚫 "USUARIO BLOQUEADO"
      ├─ Estado → bloqueado
      ├─ Crear registro en historial_bloqueos
      └─ Mensaje: "Diríjase a la Dirección"
```

### Flujo 3: Selección "PÉRDIDA" o "ROBO"

```
Usuario selecciona: PÉRDIDA o ROBO
   ↓
Sistema ejecuta BLOQUEO INMEDIATO:
├─ Estado → bloqueado
├─ NO incrementa contador de fallas
├─ Registra en historial_bloqueos
└─ RAcceso
Solo **empleados** con permisos especiales (registrados en tabla `administradores`).

### Dashboard Principal

**Métricas en Tiempo Real:**
- 🔴 Usuarios bloqueados actuales
- 🟡 Usuarios con 3 fallas (RIESGO - próximos a bloquear)
- 🟠 Usuarios con 2 fallas
- 🔵 Usuarios con 1 falla
- ⚫ Usuarios sin fallas
- 📊 Total de ingresos contingentes hoy/semana/mes

### Funcionalidades

#### 1. Búsqueda de Usuario
```
Input: ID Institucional o Documento
Output:
  ├─ Información personal completa
  ├─ Todos los roles activos (Estudiante/Empleado/Contratista)
  ├─ Datos específicos por rol (programa, facultad, dependencia, etc.)
  ├─ Estado actual: activo o bloqueado
  ├─ Contador de fallas: X/4
  ├─ Historial de fallas (tabla con fechas, motivos)
  └─ Bloqueos activos (si los tiene)
```

#### 2. Gestión de Bloqueos
```
Botón: "DESBLOQUEAR USUARIO"
├─ Campo obligatorio: Observación/Justificación
├─ Confirmar acción
├─ Sistema ejecuta:
│  ├─ Estado → activo
│  ├─ total_fallas → 0 (resetea contador)
│  ├─ Registra en historial: quién, cuándo, por qué
│  └─ Auditoría completa de la acción
└─ Mensaje: "Usuario desbloqueado correctamente"
```

#### 3. Reportes Mensuales (Exportar a Excel)

**Tipos de Reportes:**

📊 **Reporte General de Usuarios**
- Listado completo: ID, nombre, roles, programa, facultad, fallas, estado

🚫 **Reporte de Bloqueados**
- Filtro por mes
- Usuarios bloqueados: motivo, fecha, días bloqueado

📈 **Reporte de Fallas por Mes**
- Enero: X olvidos, Y pérdidas, Z robos
- Febrero: ...

📋 **Reporte por Facultad** (solo estudiantes)
- Facultad de Ingeniería: X estudiantes, Y con fallas, Z bloqueados
- Facultad de Derecho: ...

**Formato:** Excel (.xlsx) directo para descarga

#### 4. Carga Masiva de Datos (CSV)

```
Botón: "CARGAR BASE DE DATOS DESDE CSV"
├─ Upload archivo .csv
├─ Sistema valida formato
├─ Muestra preview de datos a cargar
├─ Confirmar carga
└─ Proceso:
   ├─ Leer CSV línea por línea
   ├─ Crear usuarios
   ├─ Asignar roles
   └─ Insertar información específica

⚠️ IMPORTANTE: Ejecutar al inicio de cada semestre
```

**Flujo recomendado cada semestre:**
1. Exportar todos los datos del semestre actual (Excel)
2. Limpiar base de datos (procedimiento de limpieza)
3. Cargar CSV con datos del nuevo semestre

## 👨‍💼 Panel Administrativo

### Dashboard Principal

**Métricas en Tiempo Real:**
- 🔴 Usuarios bloqueados actuales
- 🟡 Usuarios con 3 fallas (en riesgo)
- 🟠 Usuarios con 2 fallas
- 🔵 Usuarios con 1 falla
- 📊 Total de ingresos contingentes hoy/semana/mes

### Funcionalidades del Director

#### 1. Búsqueda de Usuario
```
Input: ID Institucional o Documento
Output:
  - Información completa del usuario
  - Todos los roles activos
  - Historial de fallas (tabla completa)
  - Estado actual de bloqueos
```

#### 2. Gestión de Bloqueos
```
Botón: "Desbloquear Usuario"
├─ Requiere: Observación obligatoria
├─ Registra: Admin que desbloqueó + fecha/hora
├─ Reinicia: total_fallas = 0
└─ Audita: Registro completo en tabla Auditoria
```

#### 3. Reportes Exportables

**Tipos de Reportes:**
- 📄 **Reporte de Fallas**: Usuarios por número de fallas
- 🚫 **Reporte de Bloqueos**: Histórico de bloqueos y desbloqueos
- 📈 **Reporte de Ingresos**: Estadísticas por sede/fecha/rol
- 👥 **Reporte de Usuarios**: Listado completo con todos los roles

**Formatos Disponibles:**
- Excel (.xlsx)
- PDF
- CSV

---

## 🎨 Guía de Diseño UI/UX

### Colores Corporativos UCC

```css
/* Paleta de Colores Oficial */
--ucc-azul-primary: #003DA5;      /* Azul institucional */
--ucc-azul-dark: #002870;         /* Azul oscuro */
--ucc-azul-light: #4A7BBA;        /* Azul claro */
--ucc-naranja-primary: #FF6B35;   /* Naranja institucional */
--ucc-naranja-light: #FF8C5F;     /* Naranja claro */
--ucc-naranja-dark: #E55A2B;      /* Naranja oscuro */

/* Colores de Estado */
--color-success: #22C55E;          /* Verde para éxito */
--color-warning: #F59E0B;          /* Amarillo para advertencias */
--color-danger: #EF4444;           /* Rojo para errores/bloqueos */
--color-info: #3B82F6;             /* Azul info */

/* Grises */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-800: #1F2937;
--gray-900: #111827;
```

### Componentes Principales

#### 1. Tarjeta de Usuario Multirol

```
┌──────────────────────────────────────────┐
│  🎓 Juan Pérez Gómez                     │
│  ID: 80123456 | CC: 1234567890          │
├──────────────────────────────────────────┤
│  📚 ESTUDIANTE                           │
│  • Ingeniería de Sistemas                │
│  • Facultad de Ingeniería                │
│  • Sede Bogotá - Semestre 8              │
├──────────────────────────────────────────┤
│  💼 EMPLEADO                              │
│  • Coordinador de Tesorería              │
│  • Dependencia: Área Financiera          │
├──────────────────────────────────────────┤
│  �️ Base de Datos

**Motor:** MySQL / MariaDB

### Estructura Creada

La carpeta [database/](database/) contiene:

1. **`01_create_tables.sql`** - Creación completa de tablas, índices y vistas
2. **`02_initial_data.sql`** - Roles, configuración y usuarios de prueba
3. **`03_queries_reportes.sql`** - Queries para dashboard y reportes Excel
4. **`04_stored_procedures.sql`** - Procedimientos almacenados principales:
   - `sp_registrar_ingreso_sin_carnet()`
   - `sp_desbloquear_usuario()`
   - `sp_obtener_usuario_completo()`
   - `sp_preparar_nuevo_semestre()`
5. **`ejemplo_carga_semestral.csv`** - Formato para carga masiva
6. **`README_DATABASE.md`** - Documentación completa de la BD

### Instalación Rápida

```bash
# Crear base de datos
mysql -u root -p < database/01_create_tables.sql

# Cargar datos iniciales
mysql -u root -p ucc_control_acceso < database/02_initial_data.sql
```

Ver [database/README_DATABASE.md](database/README_DATABASE.md) para más detalles.

---

## 🚀 Stack Tecnológico Recomendado

### Frontend (Web App)
- **Framework**: React / Vue.js / Angular / Next.js
- **UI Library**: Material-UI / Ant Design / Tailwind CSS + Shadcn/ui
- **State Management**: Context API / Redux / Zustand
- **Forms**: React Hook Form / Formik
- **Export Excel**: SheetJS (xlsx)

### Backend (API REST)
- **Framework**: Node.js (Express/Fastify) / Django / Laravel / .NET
- **Base de Datos**: MySQL 8.0+
- **ORM**: Prisma / Sequelize / TypeORM / Entity Framework
- **Validación**: Zod / Joi / Class-validator
- **Excel Generation**: ExcelJS / SheetJS

### Opcional PWA
- **Service Workers**: Workbox
- **Offline**: IndexedDB para cache local
- **Manifest**: Web App Manifest

### DevOps
- **Hosting**: AWS / Azure / Google Cloud / DigitalOcean
- **CI/CD**: GitHub Actions / GitLab CI
- **Monitoring**: Sentry / New Relic
```

#### 3. Pantalla de Resultado

**Caso: Ingreso Permitido**
```
┌──────────────────────────────────────────┐
│            ✅ INGRESO PERMITIDO          │
├──────────────────────────────────────────┤
│  Fallas acumuladas: 3/4                  │
│                                          │
│  ⚠️ ADVERTENCIA:                        │
│  Tienes 3 fallas registradas.            │
│  U✅ Fase 1: Base de Datos (COMPLETADA)
- [x] Diseño completo del esquema
- [x] Scripts SQL de creación
- [x] Procedimientos almacenados
- [x] Queries de reportes
- [x] Datos de prueba

### Fase 2: Backend (API REST)
- [ ] Configurar proyecto backend (Node.js/Django/Laravel/.NET)
- [ ] Conectar a base de datos MySQL
- [ ] Crear endpoints REST:
  - `POST /api/auth/login` - Validar ID institucional
  - `GET /api/usuarios/:id` - Obtener info usuario
  - `POST /api/registro-falla` - Registrar ingreso sin carnet
  - `POST /api/admin/desbloquear` - Desbloquear usuario
  - `GET /api/admin/dashboard` - Estadísticas
  - `GET /api/admin/reportes/:tipo` - Exportar Excel
  - `POST /api/admin/carga-csv` - Cargar datos masivos
- [ ] Implementar autenticación JWT para admins
- [ ] Validaciones de negocio
- [ ] Generación de archivos Excel

### Fase 3: Frontend
- [ ] Configurar proyecto (React/Vue/Next.js)
- [ ] Pantallas principales:
  - Login (input ID institucional)
  - Vista de usuario con roles
  - Selector de motivo (Olvido/Pérdida/Robo)
  - Resultados (Permitido/Bloqueado)
  - Panel administrativo
  - Dashboard con estadísticas
  - Búsqueda de usuarios
  - Exportación de reportes
- [ ] Implementar colores corporativos UCC
- [ ] Responsive design
- [ ] Manejo de errores

### Fase 4: Funcionalidades Admin
- [ ] Búsqueda de usuarios
- [ ] Visualización de historial
- [ ] Desbloquear usuarios
- [ ] Exportar reportes a Excel
- [ ] Carga masiva CSV
- [ ] Limpieza semestral

### Fase 5: Testing y Despliegue
- [ ] Tests unitarios backend
- [ ] Tests de integración
- [ ] Tests de interfaz
- [ ] Documentación API (Swagger/OpenAPI)
- [ ] Configurar servidor
- [ ] Despliegue en producción
- [ ] Configurar backups automáticos
- [ ] Monitoreo y logsas           │
│                                          │
│  [CERRAR]                                │
└──────────────────────────────────────────┘
```

---

## 🔐 Consideraciones de Seguridad

### 1. Autenticación y Autorización
- ✅ Códigos QR únicos por usuario con expiración
- ✅ Tokens JWT para sesiones administrativas
- ✅ Permisos basados en roles (RBAC)
- ✅ Logs de auditoría para todas las acciones críticas

### 2. Protección de Datos
- ✅ Encriptación de datos sensibles en reposo
- ✅ HTTPS obligatorio para todas las comunicaciones
- ✅ Sanitización de inputs para prevenir SQL injection
- ✅ Rate limiting en endpoints de autenticación

### 3. Auditoría
- ✅ Registro completo de acciones administrativas
- ✅ Trazabilidad de desbloqueos
- ✅ Logs de intentos de acceso fallidos
- ✅ Historial inmutable de cambios de estado

---

## 🚀 Stack Tecnológico Recomendado

### Frontend (PWA)
- **Framework**: Flutter Web / React + PWA
- **UI Library**: Material Design / Shadcn/ui
- **QR Scanner**: `qr_code_scanner` / `html5-qrcode`
- **State Management**: Riverpod / Redux Toolkit
- **Offline Support**: Service Workers + IndexedDB

### Backend
- **Framework**: Node.js (Express/Fastify) / Django / Laravel
- **Base de Datos**: PostgreSQL / MySQL
- **ORM**: Prisma / Sequelize / TypeORM
- **Autenticación**: JWT + Refresh Tokens
- **Validación**: Zod / Joi

### DevOps
- **Hosting**: Vercel / AWS / Google Cloud
- **CDN**: Cloudflare
- **Monitoring**: Sentry / LogRocket
- **Analytics**: Google Analytics / Mixpanel

---

## 📝 Próximos Pasos

### Fase 1: Configuración Inicial
- [ ] Configurar base de datos PostgreSQL
- [ ] Crear esquemas y migraciones
- [ ] Configurar proyecto Flutter/React
- [ ] Implementar sistema de autenticación

### Fase 2: Desarrollo Core
- [ ] Implementar escaneo QR
- [ ] Crear flujos de validación
- [ ] Desarrollar lógica de fallas y bloqueos
- [ ] Implementar panel administrativo

### Fase 3: UI/UX
- [ ] Diseñar componentes con colores UCC
- [ ] Implementar tarjetas multirol
- [ ] Optimizar para móviles
- [ ] Agregar animaciones y transiciones

### Fase 4: Testing y Despliegue
- [ ] Tests unitarios e integración
- [ ] Tests de seguridad
- [ ] Configurar PWA (Service Workers, Manifest)
- [ ] Despliegue en producción

---

## 📞 Contacto y Soporte

**Universidad Cooperativa de Colombia**
- 🌐 Web: www.ucc.edu.co
- 📧 Email: soporte@ucc.edu.co
- 📱 Teléfono: +57 (1) XXX XXXX

---

## 📄 Licencia

Este proyecto es de uso interno exclusivo de la Universidad Cooperativa de Colombia.

© 2026 Universidad Cooperativa de Colombia. Todos los derechos reservados.
