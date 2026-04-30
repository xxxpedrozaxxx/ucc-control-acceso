-- ============================================================
-- SISTEMA DE CONTROL DE ACCESO UCC
-- Migración: independizar la tabla admins de la tabla usuarios
-- ============================================================
--
-- PROBLEMA:
--   La tabla admins tenía FK → usuarios.id_institucional ON DELETE RESTRICT.
--   Esto significa que:
--   1. Para crear un admin, el ID debía existir en usuarios.
--   2. Al reemplazar usuarios al inicio de un nuevo semestre,
--      los admins bloqueaban la operación (RESTRICT).
--
-- SOLUCIÓN:
--   • Eliminar la FK constraint.
--   • Agregar columna nombre_completo directamente en admins.
--   • El superadmin se gestiona directamente desde la BD.
--   • Los admins normales se crean desde el panel (sin depender de usuarios).
-- ============================================================

-- ─── Paso 1: Eliminar la FK constraint ────────────────────────────────────
ALTER TABLE admins
  DROP CONSTRAINT IF EXISTS admins_id_institucional_fkey;

-- ─── Paso 2: Agregar nombre_completo ──────────────────────────────────────
ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS nombre_completo TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN admins.nombre_completo IS 'Nombre completo del administrador (independiente de la tabla usuarios)';

-- ─── Paso 3: Actualizar datos existentes ──────────────────────────────────
-- Si ya tienes admins registrados, copia el nombre desde usuarios:
UPDATE admins a
SET nombre_completo = u.nombre_completo
FROM usuarios u
WHERE a.id_institucional = u.id_institucional
  AND a.nombre_completo = '';

-- ─── Paso 4: Eliminar el DEFAULT vacío (el campo es obligatorio) ──────────
ALTER TABLE admins
  ALTER COLUMN nombre_completo DROP DEFAULT;

-- ─── Verificación ─────────────────────────────────────────────────────────
/*
SELECT id_institucional, nombre_completo, nivel, creado_en, ultimo_ingreso
FROM admins
ORDER BY nivel DESC, creado_en ASC;
*/
