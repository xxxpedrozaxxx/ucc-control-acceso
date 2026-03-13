-- ============================================================
-- SISTEMA DE CONTROL DE ACCESO UCC
-- Script para Supabase (PostgreSQL)
-- Tablas: roles + usuario_roles
-- ============================================================

-- ============================================================
-- DECISIÓN DE DISEÑO: ¿Por qué usuario_roles usa id_institucional?
--
-- Un usuario puede tener VARIOS roles (ej: Estudiante y Empleado a la vez).
-- Por eso necesitamos una tabla separada — no se puede meter en usuarios.
--
-- usuario_roles referencia id_institucional (VARCHAR UNIQUE) en vez del
-- id interno (BIGINT) porque:
--   → id_institucional es estable: no cambia entre semestres
--   → id interno (BIGINT) cambia cada vez que se limpia la BD
--   → Con id_institucional los DOS csv se cargan de forma independiente:
--
--   📄 carga_usuarios.csv          📄 carga_roles.csv
--   id_institucional | nombre...   id_institucional | rol
--   80100001         | Juan...     80100001         | Estudiante
--   80100002         | María...    80100001         | Empleado
--                                  80100002         | Contratista
--
--   → Los dos se suben directamente a Supabase sin pasos intermedios.
-- ============================================================

-- ============================================================
-- TABLA: roles
-- Catálogo fijo: Estudiante, Empleado, Contratista
-- Este catálogo NO se borra entre semestres.
-- ============================================================
DROP TABLE IF EXISTS usuario_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

CREATE TABLE roles (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

COMMENT ON TABLE  roles             IS 'Catálogo de roles disponibles en el sistema';
COMMENT ON COLUMN roles.id          IS 'Identificador interno del rol';
COMMENT ON COLUMN roles.nombre_rol  IS 'Estudiante | Empleado | Contratista';
COMMENT ON COLUMN roles.descripcion IS 'Descripción del rol';

-- Datos fijos del catálogo (no cambian entre semestres)
INSERT INTO roles (nombre_rol, descripcion) VALUES
    ('Estudiante',   'Usuario matriculado en un programa académico'),
    ('Empleado',     'Trabajador vinculado directamente a la UCC'),
    ('Contratista',  'Proveedor externo con contrato activo');

-- ============================================================
-- TABLA: usuario_roles  (tabla intermedia)
-- FK → id_institucional (no el id interno) para simplificar
-- la carga masiva desde CSV sin pasos intermedios.
-- ============================================================
CREATE TABLE usuario_roles (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_institucional VARCHAR(20) NOT NULL REFERENCES usuarios(id_institucional) ON DELETE CASCADE,
    rol_id           BIGINT      NOT NULL REFERENCES roles(id),

    CONSTRAINT uq_usuario_rol UNIQUE (id_institucional, rol_id)
);

COMMENT ON TABLE  usuario_roles                    IS 'Relación muchos-a-muchos entre usuarios y roles';
COMMENT ON COLUMN usuario_roles.id_institucional   IS 'FK → usuarios.id_institucional | Estable entre semestres, permite carga CSV directa';
COMMENT ON COLUMN usuario_roles.rol_id             IS 'FK → roles.id';

-- Índices
CREATE INDEX idx_usuario_roles_institucional ON usuario_roles (id_institucional);
CREATE INDEX idx_usuario_roles_rol           ON usuario_roles (rol_id);
