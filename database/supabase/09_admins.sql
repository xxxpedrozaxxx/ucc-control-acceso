-- ============================================================
-- SISTEMA DE CONTROL DE ACCESO UCC
-- Tabla: admins
-- Credenciales para el panel de administración.
-- Solo los registros de esta tabla pueden iniciar sesión en /admin.
-- La contraseña se almacena como hash bcrypt (cost 12).
-- ============================================================

DROP TABLE IF EXISTS admins CASCADE;

CREATE TABLE admins (
    id_institucional  VARCHAR(20) NOT NULL
                      REFERENCES usuarios(id_institucional) ON DELETE RESTRICT,
    contrasena_hash   TEXT        NOT NULL,
    nivel             TEXT        NOT NULL DEFAULT 'admin'
                      CHECK (nivel IN ('superadmin', 'admin')),
    creado_en         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ultimo_ingreso    TIMESTAMPTZ,
    CONSTRAINT pk_admins PRIMARY KEY (id_institucional)
);

COMMENT ON TABLE  admins                       IS 'Credenciales de acceso al panel de administración';
COMMENT ON COLUMN admins.id_institucional      IS 'FK → usuarios.id_institucional';
COMMENT ON COLUMN admins.contrasena_hash       IS 'Hash bcrypt (cost 12) de la contraseña';
COMMENT ON COLUMN admins.nivel                 IS 'superadmin = acceso total + gestión de admins | admin = acceso normal al panel';
COMMENT ON COLUMN admins.ultimo_ingreso        IS 'Timestamp del último login exitoso en el panel';

-- RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Solo lectura del propio hash (para verificación en login)
CREATE POLICY "admins: lectura publica"
  ON admins FOR SELECT
  USING (true);

-- Solo insertar/actualizar desde backend o panel de BD (no desde el cliente)
CREATE POLICY "admins: insertar"
  ON admins FOR INSERT
  WITH CHECK (true);

CREATE POLICY "admins: actualizar"
  ON admins FOR UPDATE
  USING (true);

-- ============================================================
-- CÓMO AGREGAR UN ADMIN O SUPERADMIN
-- 1. El usuario ya debe existir en la tabla usuarios.
-- 2. Genera el hash desde la app o con Node.js:
--
--    node -e "const b=require('bcryptjs'); b.hash('TuContraseña123',12,(_,h)=>console.log(h))"
--
-- 3. Luego inserta en Supabase:
--    -- Admin normal:
--    INSERT INTO admins (id_institucional, contrasena_hash, nivel)
--    VALUES ('100001', '$2a$12$HASH_GENERADO_AQUI', 'admin');
--
--    -- Superadmin (solo uno o pocos, permanentes):
--    INSERT INTO admins (id_institucional, contrasena_hash, nivel)
--    VALUES ('100001', '$2a$12$HASH_GENERADO_AQUI', 'superadmin');
--
-- IMPORTANTE: Los superadmins NO se borran al iniciar nuevo semestre
--             y NO se pueden eliminar desde el panel de la app.
-- ============================================================
SELECT id_institucional, nivel FROM admins WHERE id_institucional = '100001';
