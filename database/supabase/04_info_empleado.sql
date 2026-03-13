-- ============================================================
-- SISTEMA DE CONTROL DE ACCESO UCC
-- Script para Supabase (PostgreSQL)
-- Tabla: info_empleado
-- ============================================================

-- ============================================================
-- DECISIÓN DE DISEÑO
--
-- Solo se almacena el cargo y la dependencia — suficiente para
-- que el guardia sepa en qué área trabaja la persona.
-- Datos contractuales (tipo, fecha, salario) no son necesarios
-- para el control de acceso.
--
-- Esta tabla se actualiza desde RRHH cuando hay novedades de
-- vinculación o desvinculación. El trigger en 06_triggers_roles.sql
-- asigna/revoca el rol Empleado automáticamente.
-- ============================================================

DROP TABLE IF EXISTS info_empleado CASCADE;

CREATE TABLE info_empleado (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_institucional VARCHAR(20)  NOT NULL UNIQUE
                     REFERENCES usuarios(id_institucional) ON DELETE CASCADE,
    cargo            VARCHAR(150) NOT NULL,
    dependencia      VARCHAR(150) NOT NULL
);

COMMENT ON TABLE  info_empleado                  IS 'Información laboral mínima del usuario con rol Empleado';
COMMENT ON COLUMN info_empleado.id_institucional IS 'FK → usuarios.id_institucional';
COMMENT ON COLUMN info_empleado.cargo            IS 'Cargo del empleado en la UCC';
COMMENT ON COLUMN info_empleado.dependencia      IS 'Área o dependencia donde trabaja';

CREATE INDEX idx_info_emp_id_inst ON info_empleado (id_institucional);
