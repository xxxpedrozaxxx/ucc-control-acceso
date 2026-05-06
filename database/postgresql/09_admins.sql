-- ============================================================
-- SISTEMA DE CONTROL DE ACCESO UCC  (PostgreSQL standalone)
-- Script 09: Tabla admins
--
-- Sin FK a usuarios: los admins son permanentes entre semestres.
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

COMMENT ON TABLE  admins IS 'Credenciales del panel. Sin FK a usuarios: permanentes entre semestres.';
COMMENT ON COLUMN admins.id_institucional IS 'ID institucional (clave primaria, sin FK)';
COMMENT ON COLUMN admins.nombre_completo  IS 'Nombre completo del administrador';
COMMENT ON COLUMN admins.contrasena_hash  IS 'Hash bcrypt (cost 12) de la contrasena';
COMMENT ON COLUMN admins.nivel            IS 'superadmin = acceso total | admin = acceso normal';
COMMENT ON COLUMN admins.ultimo_ingreso   IS 'Ultimo login exitoso';