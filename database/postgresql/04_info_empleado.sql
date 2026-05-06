-- ============================================================
-- SISTEMA DE CONTROL DE ACCESO UCC  (PostgreSQL standalone)
-- Script 04: Tabla info_empleado
-- ============================================================

DROP TABLE IF EXISTS info_empleado CASCADE;

CREATE TABLE info_empleado (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_institucional VARCHAR(20)  NOT NULL UNIQUE
                     REFERENCES usuarios(id_institucional) ON DELETE CASCADE,
    cargo            VARCHAR(150) NOT NULL,
    dependencia      VARCHAR(150) NOT NULL
);

COMMENT ON TABLE  info_empleado IS 'Informacion laboral minima del usuario con rol Empleado';
COMMENT ON COLUMN info_empleado.id_institucional IS 'FK -> usuarios.id_institucional';
COMMENT ON COLUMN info_empleado.cargo            IS 'Cargo del empleado en la UCC';
COMMENT ON COLUMN info_empleado.dependencia      IS 'Area o dependencia donde trabaja';

CREATE INDEX idx_info_emp_id_inst ON info_empleado (id_institucional);