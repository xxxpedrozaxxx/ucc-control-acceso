-- ============================================================
-- SISTEMA DE CONTROL DE ACCESO UCC
-- Script para Supabase (PostgreSQL)
-- Tabla: info_estudiante
-- ============================================================

-- ============================================================
-- DECISIÓN DE DISEÑO
--
-- Solo se almacena el programa académico — suficiente para
-- mostrar al guardia qué estudia la persona.
-- El resto de info académica (semestre, jornada, etc.) no es
-- necesaria para el control de acceso y representa un riesgo
-- innecesario de exposición de datos.
--
-- Esta tabla se recarga al inicio de cada semestre con un CSV
-- del sistema académico. El trigger en 06_triggers_roles.sql
-- asigna/revoca el rol Estudiante automáticamente.
-- ============================================================

DROP TABLE IF EXISTS info_estudiante CASCADE;

CREATE TABLE info_estudiante (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_institucional VARCHAR(20)  NOT NULL UNIQUE
                     REFERENCES usuarios(id_institucional) ON DELETE CASCADE,
    programa         VARCHAR(150) NOT NULL
);

COMMENT ON TABLE  info_estudiante                  IS 'Programa académico del usuario con rol Estudiante';
COMMENT ON COLUMN info_estudiante.id_institucional IS 'FK → usuarios.id_institucional';
COMMENT ON COLUMN info_estudiante.programa         IS 'Nombre del programa académico';

CREATE INDEX idx_info_est_id_inst ON info_estudiante (id_institucional);
