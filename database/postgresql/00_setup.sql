-- ============================================================
-- SISTEMA DE CONTROL DE ACCESO UCC
-- Script 00: Setup inicial de PostgreSQL
--
-- INSTRUCCIONES:
--   1. Conéctate como superusuario (postgres) a tu servidor.
--   2. Ejecuta este script completo.
--   3. Continúa con los scripts 01 al 11 conectado a la BD
--      recién creada con el usuario "ucc_app".
--
-- CONEXIÓN PARA LA APP (.env):
--   DB_HOST=localhost
--   DB_PORT=5432
--   DB_NAME=ucc_control
--   DB_USER=ucc_app
--   DB_PASSWORD=<la_contrasena_que_elijas>
-- ============================================================

-- Crear base de datos
CREATE DATABASE ucc_control
  WITH ENCODING = 'UTF8'
       LC_COLLATE = 'es_CO.UTF-8'
       LC_CTYPE   = 'es_CO.UTF-8'
       TEMPLATE   = template0;

-- Comentario
COMMENT ON DATABASE ucc_control IS 'Sistema de Control de Acceso UCC';

-- ── Crear usuario de la aplicación ──────────────────────────
-- Reemplaza 'CambiaEstoAhora123' por una contraseña segura.
CREATE USER ucc_app WITH
  PASSWORD 'CambiaEstoAhora123'
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  LOGIN;

COMMENT ON ROLE ucc_app IS 'Usuario de la aplicación UCC Control de Acceso. Solo tiene permisos en el schema public de ucc_control.';

-- ── Conectar a la BD antes de continuar ─────────────────────
-- En psql: \c ucc_control
-- En pgAdmin: abre una nueva conexión a ucc_control.
--
-- Desde aquí en adelante ejecuta los scripts 01 al 11
-- conectado como postgres (superusuario) a ucc_control.
-- Los permisos para ucc_app se otorgan en 08_permisos.sql.