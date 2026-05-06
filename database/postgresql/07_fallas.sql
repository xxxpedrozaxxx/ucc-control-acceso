-- ============================================================
-- SISTEMA DE CONTROL DE ACCESO UCC  (PostgreSQL standalone)
-- Script 07: Tabla fallas + trigger de bloqueo automatico
--
-- IDENTICO a la version Supabase: logica pura PostgreSQL.
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

COMMENT ON TABLE  fallas IS 'Registro de incidentes por ausencia de TIP';
COMMENT ON COLUMN fallas.id_institucional IS 'FK -> usuarios.id_institucional';
COMMENT ON COLUMN fallas.fecha_hora       IS 'Fecha y hora del incidente';
COMMENT ON COLUMN fallas.motivo           IS 'olvido = olvido la TIP | perdida = TIP perdida';

CREATE INDEX idx_fallas_id_inst    ON fallas (id_institucional);
CREATE INDEX idx_fallas_fecha_hora ON fallas (fecha_hora DESC);

-- ============================================================
-- FUNCION: recalcular total_fallas y bloquear si llega a 4
-- ============================================================
CREATE OR REPLACE FUNCTION fn_actualizar_fallas()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_inst VARCHAR(20);
    v_total   INT;
BEGIN
    v_id_inst := CASE WHEN TG_OP = 'DELETE' THEN OLD.id_institucional
                                             ELSE NEW.id_institucional END;

    SELECT COUNT(*) INTO v_total
    FROM fallas WHERE id_institucional = v_id_inst;

    UPDATE usuarios
    SET total_fallas = v_total,
        acceso       = CASE WHEN v_total >= 4 THEN 'bloqueado' ELSE acceso END
    WHERE id_institucional = v_id_inst;

    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_fallas_insert ON fallas;
CREATE TRIGGER trg_fallas_insert
    AFTER INSERT ON fallas FOR EACH ROW
    EXECUTE FUNCTION fn_actualizar_fallas();

DROP TRIGGER IF EXISTS trg_fallas_delete ON fallas;
CREATE TRIGGER trg_fallas_delete
    AFTER DELETE ON fallas FOR EACH ROW
    EXECUTE FUNCTION fn_actualizar_fallas();