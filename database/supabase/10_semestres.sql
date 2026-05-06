-- ============================================================
-- SISTEMA DE CONTROL DE ACCESO UCC
-- Script 10: Tabla semestres
-- Gestiona el semestre academico activo.
-- Usada por los reportes como fuente de verdad del periodo.
-- ============================================================

CREATE TABLE IF NOT EXISTS semestres (
  id           BIGSERIAL PRIMARY KEY,
  nombre       TEXT        NOT NULL,          -- ej. '2026-1', '2026-2'
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

-- -- Row Level Security ------------------------------------------
ALTER TABLE semestres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "semestres: lectura publica"
  ON semestres FOR SELECT USING (true);

CREATE POLICY "semestres: insertar"
  ON semestres FOR INSERT WITH CHECK (true);

CREATE POLICY "semestres: actualizar"
  ON semestres FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "semestres: eliminar"
  ON semestres FOR DELETE USING (true);