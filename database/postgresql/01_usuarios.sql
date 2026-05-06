-- ============================================================
-- SISTEMA DE CONTROL DE ACCESO UCC  (PostgreSQL standalone)
-- Script 01: Tabla usuarios
-- ============================================================

DROP TYPE IF EXISTS estado_de_acceso CASCADE;
CREATE TYPE estado_de_acceso AS ENUM ('activo', 'bloqueado');

CREATE TABLE usuarios (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_institucional    VARCHAR(20)       NOT NULL UNIQUE,
    documento_identidad VARCHAR(20)       NOT NULL UNIQUE,
    nombre_completo     VARCHAR(150)      NOT NULL,
    acceso              estado_de_acceso  NOT NULL DEFAULT 'activo',
    total_fallas        INT               NOT NULL DEFAULT 0
);

COMMENT ON TABLE  usuarios                     IS 'Tabla principal de usuarios del sistema UCC';
COMMENT ON COLUMN usuarios.id                  IS 'Identificador interno unico';
COMMENT ON COLUMN usuarios.id_institucional    IS 'ID asignado por la UCC';
COMMENT ON COLUMN usuarios.documento_identidad IS 'Cedula de ciudadania';
COMMENT ON COLUMN usuarios.nombre_completo     IS 'Nombre completo del usuario';
COMMENT ON COLUMN usuarios.acceso              IS 'activo = puede ingresar | bloqueado = acceso denegado';
COMMENT ON COLUMN usuarios.total_fallas        IS 'Contador acumulado de olvidos (max 4 antes de bloqueo)';

CREATE INDEX idx_usuarios_id_institucional ON usuarios (id_institucional);
CREATE INDEX idx_usuarios_documento        ON usuarios (documento_identidad);
CREATE INDEX idx_usuarios_acceso           ON usuarios (acceso);