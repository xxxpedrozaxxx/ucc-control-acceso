-- ============================================================
-- SISTEMA DE CONTROL DE ACCESO UCC
-- Script 12: Admin inicial por defecto
--
-- Crea el superadmin para el primer ingreso al sistema.
-- Credenciales: ID 000000 / contrasena 12345678
--
-- IMPORTANTE: Cambia la contrasena despues del primer login
--             desde el panel de administracion.
-- ============================================================

INSERT INTO admins (id_institucional, nombre_completo, contrasena_hash, nivel)
VALUES (
    '000000',
    'Super Administrador',
    '$2b$12$sxsAUUFz/RMLPhMMJG50R.ODQJ3fmu.Pj3.ZlxTZjKZckn1cSHVBK',
    'superadmin'
)
ON CONFLICT (id_institucional) DO NOTHING;
