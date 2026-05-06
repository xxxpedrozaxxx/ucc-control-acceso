-- ============================================================
-- SISTEMA DE CONTROL DE ACCESO UCC  (PostgreSQL standalone)
-- Script 03: Tabla info_estudiante
-- ============================================================

DROP TABLE IF EXISTS info_estudiante CASCADE;

CREATE TABLE info_estudiante (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_institucional VARCHAR(20)  NOT NULL UNIQUE
                     REFERENCES usuarios(id_institucional) ON DELETE CASCADE,
    programa         VARCHAR(150) NOT NULL
);

COMMENT ON TABLE  info_estudiante IS 'Programa academico del usuario con rol Estudiante';
COMMENT ON COLUMN info_estudiante.id_institucional IS 'FK -> usuarios.id_institucional';
COMMENT ON COLUMN info_estudiante.programa         IS 'Nombre del programa academico';

CREATE INDEX idx_info_est_id_inst ON info_estudiante (id_institucional);