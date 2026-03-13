-- ============================================================
-- SISTEMA DE CONTROL DE ACCESO UCC
-- Script para Supabase (PostgreSQL)
-- Tabla: info_contratista
-- ============================================================

-- ============================================================
-- DECISIÓN DE DISEÑO
--
-- Solo se almacena la empresa — suficiente para que el guardia
-- sepa a qué empresa pertenece el contratista.
-- Datos del contrato (número, objeto, fechas, valor) no son
-- necesarios para el control de acceso y son información sensible.
--
-- Esta tabla se actualiza desde Gestión de Contratos. El trigger
-- en 06_triggers_roles.sql asigna/revoca el rol Contratista
-- automáticamente.
-- ============================================================

DROP TABLE IF EXISTS info_contratista CASCADE;

CREATE TABLE info_contratista (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_institucional VARCHAR(20)  NOT NULL UNIQUE
                     REFERENCES usuarios(id_institucional) ON DELETE CASCADE,
    empresa          VARCHAR(200) NOT NULL
);

COMMENT ON TABLE  info_contratista                  IS 'Empresa del usuario con rol Contratista';
COMMENT ON COLUMN info_contratista.id_institucional IS 'FK → usuarios.id_institucional';
COMMENT ON COLUMN info_contratista.empresa          IS 'Razón social de la empresa contratista';

CREATE INDEX idx_info_con_id_inst ON info_contratista (id_institucional);
