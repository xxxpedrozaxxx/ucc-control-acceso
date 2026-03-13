-- ============================================================
-- SISTEMA DE CONTROL DE ACCESO UCC
-- Script para Supabase (PostgreSQL)
-- Tabla: fallas + trigger de bloqueo automático
-- ============================================================

-- ============================================================
-- TABLA: fallas
-- Cada fila = un incidente registrado por el propio usuario
-- cuando no porta su TIC (Tarjeta de Identificación Cooperativista).
--
-- El trigger fn_actualizar_fallas() se encarga de:
--   1. Recalcular total_fallas en la tabla usuarios
--   2. Bloquear automáticamente al usuario si llega a 4 fallas
-- ============================================================

DROP TABLE IF EXISTS fallas CASCADE;

CREATE TABLE fallas (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_institucional VARCHAR(20)  NOT NULL
                     REFERENCES usuarios(id_institucional) ON DELETE CASCADE,
    fecha_hora       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    motivo           VARCHAR(10)  NOT NULL
                     CHECK (motivo IN ('olvido', 'perdida'))
);

COMMENT ON TABLE  fallas                   IS 'Registro de incidentes por ausencia de TIC';
COMMENT ON COLUMN fallas.id_institucional  IS 'FK → usuarios.id_institucional';
COMMENT ON COLUMN fallas.fecha_hora        IS 'Fecha y hora del incidente (zona horaria incluida)';
COMMENT ON COLUMN fallas.motivo            IS 'olvido = olvidó la TIC | perdida = TIC perdida';

CREATE INDEX idx_fallas_id_inst    ON fallas (id_institucional);
CREATE INDEX idx_fallas_fecha_hora ON fallas (fecha_hora DESC);


-- ============================================================
-- FUNCIÓN: recalcular total_fallas y bloquear si llega a 4
-- Se dispara después de cada INSERT o DELETE en fallas.
-- ============================================================
CREATE OR REPLACE FUNCTION fn_actualizar_fallas()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_inst   VARCHAR(20);
    v_total     INT;
BEGIN
    -- Tomar el id_institucional del registro afectado
    v_id_inst := CASE WHEN TG_OP = 'DELETE' THEN OLD.id_institucional
                                             ELSE NEW.id_institucional END;

    -- Contar las fallas actuales del usuario
    SELECT COUNT(*) INTO v_total
    FROM fallas
    WHERE id_institucional = v_id_inst;

    -- Actualizar contador y bloquear automáticamente si llega a 4
    UPDATE usuarios
    SET total_fallas = v_total,
        acceso       = CASE WHEN v_total >= 4 THEN 'bloqueado' ELSE acceso END
    WHERE id_institucional = v_id_inst;

    RETURN NULL;
END;
$$;

COMMENT ON FUNCTION fn_actualizar_fallas() IS
    'Recalcula total_fallas en usuarios y bloquea el acceso al llegar a 4 fallas.';

-- Trigger después de INSERT
DROP TRIGGER IF EXISTS trg_fallas_insert ON fallas;
CREATE TRIGGER trg_fallas_insert
    AFTER INSERT ON fallas
    FOR EACH ROW
    EXECUTE FUNCTION fn_actualizar_fallas();

-- Trigger después de DELETE (por si se corrige una falla)
DROP TRIGGER IF EXISTS trg_fallas_delete ON fallas;
CREATE TRIGGER trg_fallas_delete
    AFTER DELETE ON fallas
    FOR EACH ROW
    EXECUTE FUNCTION fn_actualizar_fallas();


-- ============================================================
-- RLS: permitir lectura y escritura desde la app
-- ============================================================
ALTER TABLE fallas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lectura propia fallas" ON fallas
    FOR SELECT USING (true);

CREATE POLICY "insertar falla" ON fallas
    FOR INSERT WITH CHECK (true);
