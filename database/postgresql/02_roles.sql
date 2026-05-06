-- ============================================================
-- SISTEMA DE CONTROL DE ACCESO UCC  (PostgreSQL standalone)
-- Script 02: Tablas roles + usuario_roles
-- ============================================================

DROP TABLE IF EXISTS usuario_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

CREATE TABLE roles (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

COMMENT ON TABLE  roles             IS 'Catalogo de roles disponibles en el sistema';
COMMENT ON COLUMN roles.nombre_rol  IS 'Estudiante | Empleado | Contratista';

INSERT INTO roles (nombre_rol, descripcion) VALUES
    ('Estudiante',  'Usuario matriculado en un programa academico'),
    ('Empleado',    'Trabajador vinculado directamente a la UCC'),
    ('Contratista', 'Proveedor externo con contrato activo');

CREATE TABLE usuario_roles (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_institucional VARCHAR(20) NOT NULL REFERENCES usuarios(id_institucional) ON DELETE CASCADE,
    rol_id           BIGINT      NOT NULL REFERENCES roles(id),
    CONSTRAINT uq_usuario_rol UNIQUE (id_institucional, rol_id)
);

COMMENT ON TABLE  usuario_roles IS 'Relacion muchos-a-muchos entre usuarios y roles';

CREATE INDEX idx_usuario_roles_institucional ON usuario_roles (id_institucional);
CREATE INDEX idx_usuario_roles_rol           ON usuario_roles (rol_id);