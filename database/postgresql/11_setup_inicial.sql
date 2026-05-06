-- ============================================================
-- SISTEMA DE CONTROL DE ACCESO UCC  (PostgreSQL standalone)
-- Script 11: Setup inicial (datos de arranque)
--
-- Ejecutar DESPUES de correr los scripts 00 al 10.
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
-- Genera el hash de contrasena con Node.js:
--
--   node -e "const b=require('bcryptjs'); b.hash('TuContrasena123',12,(_,h)=>console.log(h))"
--
-- (Si bcryptjs no esta instalado: npm install bcryptjs)
--
-- Luego ejecuta este INSERT reemplazando los valores:
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
--   El superadmin NO se borra al iniciar un nuevo semestre.
--   El superadmin NO se puede eliminar desde el panel de la app.
-- ============================================================


-- ============================================================
-- PASO 3: Variables de entorno para la app
--
-- Crea un archivo .env en la raiz del proyecto con:
--
--   VITE_PG_HOST=localhost
--   VITE_PG_PORT=5432
--   VITE_PG_DATABASE=ucc_control
--   VITE_PG_USER=ucc_app
--   VITE_PG_PASSWORD=CambiaEstoAhora123
--
-- NOTA: La app usa @supabase/supabase-js en su version actual.
-- Para PostgreSQL standalone necesitas reemplazar el cliente por
-- "postgres" (https://github.com/porsager/postgres) o "pg" (node-postgres)
-- y adaptar el modulo src/lib/supabaseClient.js.
-- ============================================================


-- ============================================================
-- VERIFICACION FINAL
-- ============================================================
/*
-- Tablas creadas:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;

-- Semestre activo:
SELECT nombre, fecha_inicio, fecha_fin FROM semestres WHERE activo = true;

-- Superadmin:
SELECT id_institucional, nombre_completo, nivel, creado_en FROM admins;

-- Permisos de ucc_app:
SELECT table_name, privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'ucc_app' ORDER BY table_name;
*/