-- ============================================================
-- SISTEMA DE CONTROL DE ACCESO UCC
-- Script 09: Tabla admins
-- Credenciales para el panel de administracion.
--
-- DISENO INTENCIONAL: admins NO tiene FK -> usuarios.
--   -> Los admins son permanentes; no se borran al cambiar semestre.
--   -> Un admin puede no estar en la tabla usuarios regulares.
--   -> La app gestiona admins de forma completamente independiente.
-- ============================================================

DROP TABLE IF EXISTS admins CASCADE;

CREATE TABLE admins (
    id_institucional  VARCHAR(20) NOT NULL,
    nombre_completo   TEXT        NOT NULL,
    contrasena_hash   TEXT        NOT NULL,
    nivel             TEXT        NOT NULL DEFAULT 'admin'
                      CHECK (nivel IN ('superadmin', 'admin')),
    creado_en         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ultimo_ingreso    TIMESTAMPTZ,
    CONSTRAINT pk_admins PRIMARY KEY (id_institucional)
);

COMMENT ON TABLE  admins                  IS 'Credenciales del panel de administracion. Sin FK a usuarios: permanentes entre semestres.';
COMMENT ON COLUMN admins.id_institucional IS 'ID institucional del administrador (clave primaria, sin FK)';
COMMENT ON COLUMN admins.nombre_completo  IS 'Nombre completo del administrador';
COMMENT ON COLUMN admins.contrasena_hash  IS 'Hash bcrypt (cost 12) de la contrasena';
COMMENT ON COLUMN admins.nivel            IS 'superadmin = acceso total + gestion de admins | admin = acceso normal al panel';
COMMENT ON COLUMN admins.ultimo_ingreso   IS 'Timestamp del ultimo login exitoso en el panel';

-- -- Row Level Security ------------------------------------------
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins: lectura publica"
  ON admins FOR SELECT USING (true);

CREATE POLICY "admins: insertar"
  ON admins FOR INSERT WITH CHECK (true);

CREATE POLICY "admins: actualizar"
  ON admins FOR UPDATE USING (true);

CREATE POLICY "admins: eliminar"
  ON admins FOR DELETE USING (true);