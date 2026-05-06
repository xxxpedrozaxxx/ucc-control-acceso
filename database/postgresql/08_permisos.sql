-- ============================================================
-- SISTEMA DE CONTROL DE ACCESO UCC  (PostgreSQL standalone)
-- Script 08: Permisos del usuario ucc_app
--
-- DIFERENCIA CLAVE vs Supabase:
--   Supabase usa Row Level Security (RLS) con politicas publicas
--   porque el cliente web se conecta con la clave anonima JWT.
--
--   En PostgreSQL standalone la app se conecta directamente
--   con el usuario ucc_app (definido en 00_setup.sql).
--   Los permisos se controlan con GRANT/REVOKE sobre ese usuario.
--   No se necesita RLS.
--
-- EJECUTAR CONECTADO A: ucc_control (como superusuario postgres)
-- ============================================================

-- Acceso al schema public
GRANT USAGE ON SCHEMA public TO ucc_app;

-- ── Permisos tabla por tabla ─────────────────────────────────

-- usuarios: leer, insertar, actualizar (no borrar desde la app)
GRANT SELECT, INSERT, UPDATE ON TABLE usuarios TO ucc_app;

-- roles: solo lectura (catalogo fijo)
GRANT SELECT ON TABLE roles TO ucc_app;

-- usuario_roles: leer, insertar, borrar (triggers la modifican)
GRANT SELECT, INSERT, DELETE ON TABLE usuario_roles TO ucc_app;

-- info_*: lectura, carga masiva CSV, actualizacion, limpieza semestral
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE info_estudiante  TO ucc_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE info_empleado    TO ucc_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE info_contratista TO ucc_app;

-- fallas: leer y registrar nuevas fallas
GRANT SELECT, INSERT, DELETE ON TABLE fallas TO ucc_app;

-- admins: lectura (para verificar login) e insercion/actualizacion desde el panel
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE admins TO ucc_app;

-- semestres: lectura y gestion completa desde el panel admin
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE semestres TO ucc_app;

-- ── Permisos sobre secuencias (para BIGINT GENERATED ALWAYS) ─
-- Necesario para que INSERT pueda usar las secuencias de las PK
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ucc_app;

-- Para secuencias creadas en el futuro (opcional pero recomendado)
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO ucc_app;

-- ============================================================
-- VERIFICACION
-- ============================================================
/*
-- Ver los permisos otorgados a ucc_app:
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'ucc_app'
ORDER BY table_name, privilege_type;
*/