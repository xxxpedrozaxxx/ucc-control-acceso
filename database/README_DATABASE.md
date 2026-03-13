# 🗄️ Base de Datos - Sistema Control de Acceso UCC

## 📁 Archivos de la Base de Datos

### Scripts SQL

1. **`01_create_tables.sql`** - Creación completa de la base de datos
   - Todas las tablas
   - Índices optimizados
   - Vistas útiles
   - Relaciones (foreign keys)

2. **`02_initial_data.sql`** - Datos iniciales
   - Roles del sistema (Estudiante, Empleado, Contratista)
   - Configuración del sistema
   - Usuario administrador de prueba
   - Usuarios de ejemplo para testing

3. **`03_queries_reportes.sql`** - Queries para reportes
   - Dashboard principal
   - Reportes mensuales
   - Búsquedas de usuarios
   - Queries para exportar a Excel

4. **`04_stored_procedures.sql`** - Procedimientos almacenados
   - Registrar ingreso sin carnet
   - Desbloquear usuario
   - Obtener usuario completo
   - Preparar nuevo semestre

### Archivos de Datos

5. **`ejemplo_carga_semestral.csv`** - Ejemplo de CSV para carga masiva

---

## 🚀 Instalación

### Paso 1: Crear la Base de Datos

```bash
# MySQL
mysql -u root -p < 01_create_tables.sql

# O si prefieres usar un cliente como MySQL Workbench:
# Abre el archivo y ejecuta todo el script
```

### Paso 2: Cargar Datos Iniciales

```bash
mysql -u root -p ucc_control_acceso < 02_initial_data.sql
```

### Paso 3: Verificar Instalación

```sql
USE ucc_control_acceso;
SHOW TABLES;

-- Debería mostrar:
-- - usuarios
-- - roles
-- - usuario_roles
-- - info_estudiantes
-- - info_empleados
-- - info_contratistas
-- - registro_fallas
-- - historial_bloqueos
-- - administradores
-- - auditoria
-- - configuracion_sistema
```

---

## 📊 Estructura de la Base de Datos

### Tablas Principales

#### 1. **usuarios**
Tabla central que almacena TODOS los usuarios.

```sql
SELECT * FROM usuarios LIMIT 5;
```

#### 2. **roles**
Catálogo de roles: Estudiante, Empleado, Contratista.

```sql
SELECT * FROM roles;
```

#### 3. **usuario_roles**
Tabla puente para multivincularidad (un usuario puede tener múltiples roles).

```sql
-- Ver usuarios con múltiples roles
SELECT 
    u.nombre_completo,
    GROUP_CONCAT(r.nombre_rol) AS roles
FROM usuarios u
JOIN usuario_roles ur ON u.id = ur.usuario_id
JOIN roles r ON ur.rol_id = r.id
GROUP BY u.id
HAVING COUNT(r.id) > 1;
```

---

## 🔧 Procedimientos Almacenados

### 1. Registrar Ingreso Sin Carnet

```sql
CALL sp_registrar_ingreso_sin_carnet(
    '80123456',           -- ID institucional
    'olvido',             -- Motivo: olvido, perdida, robo
    'Bogotá',             -- Sede
    'Sin observaciones'   -- Observación
);
```

**Lógica:**
- Si es `olvido`: suma +1 al contador. Al llegar a 4 → bloquea automáticamente
- Si es `perdida` o `robo`: bloquea inmediatamente

### 2. Desbloquear Usuario

```sql
CALL sp_desbloquear_usuario(
    '80456789',                                    -- ID institucional
    1,                                             -- ID del admin
    'Usuario presentó justificación válida'       -- Observación
);
```

**Efectos:**
- Cambia estado a `activo`
- Resetea contador de fallas a 0
- Registra en auditoría quién y cuándo desbloqueó

### 3. Obtener Usuario Completo

```sql
CALL sp_obtener_usuario_completo('80123456');
```

Retorna múltiples resultados:
- Información básica
- Roles activos
- Info de estudiante/empleado/contratista
- Últimas 10 fallas
- Bloqueos activos

### 4. Preparar Nuevo Semestre

```sql
CALL sp_preparar_nuevo_semestre(
    1,           -- ID del admin
    '2026-2'     -- Código del nuevo semestre
);
```

⚠️ **CUIDADO**: Este procedimiento **BORRA TODO** excepto:
- Los administradores (usuarios con ID ADMIN*)
- La tabla de auditoría (para mantener trazabilidad)

**Flujo recomendado:**
1. Exportar todos los datos a Excel (ver reportes)
2. Ejecutar este procedimiento
3. Cargar CSV del nuevo semestre

---

## 📈 Queries de Reportes

### Dashboard Principal

```sql
-- Usuarios por categoría de fallas
SELECT * FROM v_estadisticas_fallas;

-- Usuarios bloqueados actualmente
SELECT * FROM v_bloqueos_activos;

-- Usuarios en riesgo (3 fallas)
SELECT * FROM usuarios 
WHERE total_fallas = 3 AND estado_general = 'activo';
```

### Reportes Mensuales

```sql
-- Fallas por mes
SELECT 
    DATE_FORMAT(fecha_hora, '%Y-%m') AS mes,
    motivo,
    COUNT(*) AS total
FROM registro_fallas
GROUP BY mes, motivo
ORDER BY mes DESC;
```

### Exportar a Excel

Para exportar, usa los queries del archivo `03_queries_reportes.sql`:
- Query #10: Todos los usuarios
- Query #11: Usuarios bloqueados
- Query #12: Registro de fallas
- Query #13: Estadísticas por facultad

Puedes exportar desde MySQL Workbench o phpMyAdmin directamente a Excel/CSV.

---

## 📥 Carga Masiva desde CSV

### Formato del CSV

El archivo `ejemplo_carga_semestral.csv` tiene este formato:

```
id_institucional,documento_identidad,nombre_completo,correo_institucional,rol,programa_academico,facultad,semestre,dependencia,cargo,empresa_proveedora,nit_proveedor,area_asignada,sede
```

### Columnas Importantes

- **rol**: Puede ser múltiple separado por `|` (Ej: `Estudiante|Empleado`)
- **programa_academico, facultad, semestre**: Solo para estudiantes
- **dependencia, cargo**: Solo para empleados
- **empresa_proveedora, nit_proveedor, area_asignada**: Solo para contratistas
- **sede**: Sede principal del usuario

### Script de Carga (Python/Node.js)

Deberás crear un script en tu backend para:

1. Leer el CSV
2. Por cada fila:
   - Insertar en `usuarios`
   - Insertar en `usuario_roles` según el campo `rol`
   - Insertar en `info_estudiantes` si tiene rol Estudiante
   - Insertar en `info_empleados` si tiene rol Empleado
   - Insertar en `info_contratistas` si tiene rol Contratista

**Ejemplo simplificado en pseudocódigo:**

```javascript
for (row of csvData) {
    // 1. Insertar usuario
    const userId = await insertUsuario(row);
    
    // 2. Asignar roles
    const roles = row.rol.split('|');
    for (role of roles) {
        await insertUsuarioRol(userId, role);
        
        // 3. Insertar info específica
        if (role === 'Estudiante') {
            await insertInfoEstudiante(userId, row);
        }
        if (role === 'Empleado') {
            await insertInfoEmpleado(userId, row);
        }
        if (role === 'Contratista') {
            await insertInfoContratista(userId, row);
        }
    }
}
```

---

## 🔐 Usuario Administrador de Prueba

El script `02_initial_data.sql` crea un admin de prueba:

```
ID Institucional: ADMIN001
Documento: 1234567890
Nombre: Director Sistema Control Acceso
Correo: admin.control@ucc.edu.co
Nivel: director
```

---

## 🎯 Flujo Típico de Uso

### Escenario 1: Usuario olvida el carnet (primera vez)

```sql
-- 1. Usuario ingresa ID en la app
CALL sp_obtener_usuario_completo('80123456');

-- 2. Selecciona motivo "olvido"
CALL sp_registrar_ingreso_sin_carnet('80123456', 'olvido', 'Bogotá', NULL);

-- Resultado: "Ingreso permitido. Fallas: 1/4"
```

### Escenario 2: Usuario reporta pérdida

```sql
CALL sp_registrar_ingreso_sin_carnet('80234567', 'perdida', 'Bogotá', 'Perdido en transporte');

-- Resultado: "Usuario bloqueado por perdida de carnet"
-- Estado del usuario cambia a 'bloqueado'
```

### Escenario 3: Admin desbloquea usuario

```sql
-- 1. Admin busca al usuario
CALL sp_obtener_usuario_completo('80234567');

-- 2. Admin desbloquea
CALL sp_desbloquear_usuario('80234567', 1, 'Presentó carnet nuevo');

-- Usuario vuelve a estado 'activo' con fallas = 0
```

### Escenario 4: Fin de semestre

```sql
-- 1. Exportar reportes
-- Ver archivo 03_queries_reportes.sql (queries #10-14)

-- 2. Limpiar base de datos
CALL sp_preparar_nuevo_semestre(1, '2026-2');

-- 3. Cargar CSV del nuevo semestre
-- (mediante script en tu aplicación)
```

---

## 🛠️ Mantenimiento

### Revisar Bloqueos Pendientes

```sql
SELECT 
    u.id_institucional,
    u.nombre_completo,
    hb.motivo_bloqueo,
    DATEDIFF(NOW(), hb.fecha_bloqueo) AS dias_bloqueado
FROM historial_bloqueos hb
JOIN usuarios u ON hb.usuario_id = u.id
WHERE hb.estado = 'activo'
ORDER BY dias_bloqueado DESC;
```

### Auditar Acciones Administrativas

```sql
SELECT 
    a.fecha_hora,
    admin.nombre_completo AS admin,
    a.accion,
    a.observaciones
FROM auditoria a
JOIN administradores adm ON a.admin_id = adm.id
JOIN usuarios admin ON adm.usuario_id = admin.id
ORDER BY a.fecha_hora DESC
LIMIT 20;
```

### Resetear Usuario de Prueba

```sql
UPDATE usuarios 
SET estado_general = 'activo', total_fallas = 0
WHERE id_institucional = '80123456';

DELETE FROM registro_fallas WHERE usuario_id = (
    SELECT id FROM usuarios WHERE id_institucional = '80123456'
);
```

---

## 📞 Notas Importantes

1. **Backups**: Configurar backups automáticos diarios
2. **Índices**: La base de datos tiene índices optimizados para las consultas frecuentes
3. **Cascadas**: Las eliminaciones en `usuarios` eliminan automáticamente registros relacionados
4. **Auditoría**: Todas las acciones administrativas se registran automáticamente
5. **Vistas**: Usa las vistas (`v_*`) para consultas frecuentes, son más rápidas

---

## 🔄 Próximos Pasos

1. ✅ Base de datos creada
2. ⏭️ Crear API REST con los procedimientos
3. ⏭️ Implementar frontend para ingresar ID
4. ⏭️ Crear panel administrativo
5. ⏭️ Implementar exportación a Excel
6. ⏭️ Crear script de carga masiva CSV

---

¿Necesitas ayuda con algún query específico o con la implementación del backend? 🚀
