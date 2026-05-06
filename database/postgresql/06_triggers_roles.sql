-- ============================================================
-- SISTEMA DE CONTROL DE ACCESO UCC  (PostgreSQL standalone)
-- Script 06: Triggers de sincronizacion automatica de roles
--
-- IDENTICO a la version Supabase: triggers y funciones son
-- PostgreSQL puro, sin dependencias de Supabase.
-- ============================================================

-- ============================================================
-- FUNCION GENERICA: asignar rol al insertar
-- ============================================================
CREATE OR REPLACE FUNCTION fn_asignar_rol()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_rol_id     BIGINT;
    v_nombre_rol TEXT := TG_ARGV[0];
BEGIN
    SELECT id INTO v_rol_id FROM roles WHERE nombre_rol = v_nombre_rol;

    IF v_rol_id IS NULL THEN
        RAISE EXCEPTION 'Rol "%" no encontrado en el catalogo de roles.', v_nombre_rol;
    END IF;

    INSERT INTO usuario_roles (id_institucional, rol_id)
    VALUES (NEW.id_institucional, v_rol_id)
    ON CONFLICT ON CONSTRAINT uq_usuario_rol DO NOTHING;

    RETURN NEW;
END;
$$;

-- ============================================================
-- FUNCION GENERICA: revocar rol al eliminar
-- ============================================================
CREATE OR REPLACE FUNCTION fn_revocar_rol()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_rol_id     BIGINT;
    v_nombre_rol TEXT := TG_ARGV[0];
BEGIN
    SELECT id INTO v_rol_id FROM roles WHERE nombre_rol = v_nombre_rol;

    IF v_rol_id IS NULL THEN
        RAISE EXCEPTION 'Rol "%" no encontrado en el catalogo de roles.', v_nombre_rol;
    END IF;

    DELETE FROM usuario_roles
    WHERE id_institucional = OLD.id_institucional AND rol_id = v_rol_id;

    RETURN OLD;
END;
$$;

-- ── Triggers info_estudiante ─────────────────────────────────
DROP TRIGGER IF EXISTS trg_asignar_rol_estudiante ON info_estudiante;
CREATE TRIGGER trg_asignar_rol_estudiante
    AFTER INSERT ON info_estudiante FOR EACH ROW
    EXECUTE FUNCTION fn_asignar_rol('Estudiante');

DROP TRIGGER IF EXISTS trg_revocar_rol_estudiante ON info_estudiante;
CREATE TRIGGER trg_revocar_rol_estudiante
    AFTER DELETE ON info_estudiante FOR EACH ROW
    EXECUTE FUNCTION fn_revocar_rol('Estudiante');

-- ── Triggers info_empleado ───────────────────────────────────
DROP TRIGGER IF EXISTS trg_asignar_rol_empleado ON info_empleado;
CREATE TRIGGER trg_asignar_rol_empleado
    AFTER INSERT ON info_empleado FOR EACH ROW
    EXECUTE FUNCTION fn_asignar_rol('Empleado');

DROP TRIGGER IF EXISTS trg_revocar_rol_empleado ON info_empleado;
CREATE TRIGGER trg_revocar_rol_empleado
    AFTER DELETE ON info_empleado FOR EACH ROW
    EXECUTE FUNCTION fn_revocar_rol('Empleado');

-- ── Triggers info_contratista ────────────────────────────────
DROP TRIGGER IF EXISTS trg_asignar_rol_contratista ON info_contratista;
CREATE TRIGGER trg_asignar_rol_contratista
    AFTER INSERT ON info_contratista FOR EACH ROW
    EXECUTE FUNCTION fn_asignar_rol('Contratista');

DROP TRIGGER IF EXISTS trg_revocar_rol_contratista ON info_contratista;
CREATE TRIGGER trg_revocar_rol_contratista
    AFTER DELETE ON info_contratista FOR EACH ROW
    EXECUTE FUNCTION fn_revocar_rol('Contratista');