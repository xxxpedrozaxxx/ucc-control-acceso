-- ============================================================
-- SISTEMA DE CONTROL DE ACCESO UCC  (PostgreSQL standalone)
-- Script 05: Tabla info_contratista
-- ============================================================

DROP TABLE IF EXISTS info_contratista CASCADE;

CREATE TABLE info_contratista (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_institucional VARCHAR(20)  NOT NULL UNIQUE
                     REFERENCES usuarios(id_institucional) ON DELETE CASCADE,
    empresa          VARCHAR(200) NOT NULL
);

COMMENT ON TABLE  info_contratista IS 'Empresa del usuario con rol Contratista';
COMMENT ON COLUMN info_contratista.id_institucional IS 'FK -> usuarios.id_institucional';
COMMENT ON COLUMN info_contratista.empresa          IS 'Razon social de la empresa contratista';

CREATE INDEX idx_info_con_id_inst ON info_contratista (id_institucional);