-- ============================================================
-- MIGRACIÓN: Niveles de administrador
-- Ejecutar en Supabase SQL Editor si la tabla admins ya existe.
--
-- Agrega el campo `nivel` para distinguir entre:
--   'superadmin' → acceso total + gestión de administradores
--   'admin'      → acceso al panel sin poder crear/borrar admins
--
-- Los superadmins son permanentes: no se borran al cambiar de
-- semestre y no se pueden eliminar desde el panel de la app.
-- ============================================================

-- 1. Agregar columna nivel
ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS nivel TEXT NOT NULL DEFAULT 'admin'
  CHECK (nivel IN ('superadmin', 'admin'));

COMMENT ON COLUMN admins.nivel IS
  'superadmin = acceso total + gestión de admins | admin = acceso normal al panel';

-- 2. Cambiar FK a RESTRICT para evitar borrado accidental
--    de admins al hacer limpieza de semestre manual.
--    (La app ya los excluye, pero esto añade una capa extra de seguridad)
ALTER TABLE admins
  DROP CONSTRAINT IF EXISTS admins_id_institucional_fkey;

ALTER TABLE admins
  ADD CONSTRAINT admins_id_institucional_fkey
  FOREIGN KEY (id_institucional)
  REFERENCES usuarios(id_institucional)
  ON DELETE RESTRICT;

-- 3. Agregar columna ultimo_ingreso (si no existe)
ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS ultimo_ingreso TIMESTAMPTZ;

COMMENT ON COLUMN admins.ultimo_ingreso IS 'Timestamp del último login exitoso en el panel';

-- 4. Si ya tienes un admin creado, promoverlo a superadmin manualmente:
-- UPDATE admins SET nivel = 'superadmin' WHERE id_institucional = 'TU_ID';

