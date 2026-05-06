-- ============================================================
-- SISTEMA DE CONTROL DE ACCESO UCC
-- Script 11: Setup inicial
-- Ejecutar DESPUES de correr los scripts 01 al 10.
--
-- Este script:
--   1. Inserta el primer semestre activo
--   2. Explica como crear el primer superadmin
--   3. Incluye queries de verificacion final
-- ============================================================


-- ============================================================
-- PASO 1: Semestre activo inicial
-- Ajusta nombre, fecha_inicio y fecha_fin segun tu calendario.
-- ============================================================
INSERT INTO semestres (nombre, fecha_inicio, fecha_fin)
VALUES ('2026-1', '2026-01-19', '2026-06-14');


-- ============================================================
-- PASO 2: Primer superadmin
--
-- Desde una terminal con Node.js instalado, genera el hash:
--
--   node -e "const b=require('bcryptjs'); b.hash('TuContrasena123',12,(_,h)=>console.log(h))"
--
-- (Si bcryptjs no esta instalado: npm install bcryptjs)
--
-- Luego ejecuta este INSERT en el SQL Editor de Supabase,
-- reemplazando los valores por los reales:
--
--   INSERT INTO admins (id_institucional, nombre_completo, contrasena_hash, nivel)
--   VALUES (
--     '100001',
--     'Nombre Apellido',
--     '$2a$12$REEMPLAZA_CON_EL_HASH_GENERADO',
--     'superadmin'
--   );
--
-- IMPORTANTE:
--   - El superadmin NO se borra al iniciar un nuevo semestre.
--   - El superadmin NO se puede eliminar desde el panel de la app.
--   - Guarda las credenciales en un lugar seguro.
-- ============================================================


-- ============================================================
-- PASO 3: Verificacion final
-- Descomenta y ejecuta cada query para confirmar el estado.
-- ============================================================

-- Tablas creadas:
/*
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
*/

-- Semestre activo:
/*
SELECT nombre, fecha_inicio, fecha_fin, activo
FROM semestres
WHERE activo = true;
*/

-- Superadmin creado:
/*
SELECT id_institucional, nombre_completo, nivel, creado_en
FROM admins
ORDER BY nivel DESC, creado_en ASC;
*/

-- Roles del catalogo:
/*
SELECT * FROM roles ORDER BY id;
*/