-- ============================================================
-- SISTEMA DE CONTROL DE ACCESO UCC
-- Script para Supabase (PostgreSQL)
-- Tabla: usuarios
-- ============================================================

-- Tipo ENUM para controlar si el usuario puede ingresar o no
DROP TYPE IF EXISTS estado_de_acceso CASCADE;
CREATE TYPE estado_de_acceso AS ENUM ('activo', 'bloqueado');

-- ============================================================
-- TABLA: usuarios
-- Solo contiene los datos mínimos necesarios para identificar
-- al usuario y controlar su acceso. No se almacenan datos de
-- contacto ni información académica/laboral aquí.
-- ============================================================
CREATE TABLE usuarios (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_institucional    VARCHAR(20)       NOT NULL UNIQUE,
    documento_identidad VARCHAR(20)       NOT NULL UNIQUE,
    nombre_completo     VARCHAR(150)      NOT NULL,
    acceso              estado_de_acceso  NOT NULL DEFAULT 'activo',
    total_fallas        INT               NOT NULL DEFAULT 0
);

-- Comentarios de columnas
COMMENT ON TABLE  usuarios                     IS 'Tabla principal de usuarios del sistema UCC';
COMMENT ON COLUMN usuarios.id                  IS 'Identificador interno único';
COMMENT ON COLUMN usuarios.id_institucional    IS 'ID asignado por la UCC';
COMMENT ON COLUMN usuarios.documento_identidad IS 'Cédula de ciudadanía';
COMMENT ON COLUMN usuarios.nombre_completo     IS 'Nombre completo del usuario';
COMMENT ON COLUMN usuarios.acceso             IS 'activo = puede ingresar | bloqueado = acceso denegado';
COMMENT ON COLUMN usuarios.total_fallas        IS 'Contador acumulado de olvidos (máx 4 antes de bloqueo)';

-- Índices para búsquedas frecuentes
CREATE INDEX idx_usuarios_id_institucional ON usuarios (id_institucional);
CREATE INDEX idx_usuarios_documento        ON usuarios (documento_identidad);
CREATE INDEX idx_usuarios_acceso           ON usuarios (acceso);
