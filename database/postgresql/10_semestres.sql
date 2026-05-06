-- ============================================================
-- SISTEMA DE CONTROL DE ACCESO UCC  (PostgreSQL standalone)
-- Script 10: Tabla semestres
-- ============================================================

CREATE TABLE IF NOT EXISTS semestres (
  id           BIGSERIAL PRIMARY KEY,
  nombre       TEXT        NOT NULL,
  fecha_inicio DATE        NOT NULL,
  fecha_fin    DATE        NOT NULL,
  activo       BOOLEAN     NOT NULL DEFAULT true,
  creado_en    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT semestres_fechas_validas CHECK (fecha_fin > fecha_inicio)
);

-- Solo puede existir UN semestre activo simultaneamente
CREATE UNIQUE INDEX IF NOT EXISTS semestres_activo_unico
  ON semestres (activo)
  WHERE activo = true;

COMMENT ON TABLE semestres IS 'Semestres academicos. Solo uno puede estar activo a la vez.';