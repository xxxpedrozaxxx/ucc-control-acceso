-- ============================================================
-- SISTEMA DE CONTROL DE ACCESO UCC
-- Script para Supabase (PostgreSQL)
-- Triggers: sincronización automática de usuario_roles
-- ============================================================

-- ============================================================
-- CÓMO FUNCIONA ESTE MECANISMO
--
-- Cuando se carga un archivo CSV a info_estudiante, info_empleado
-- o info_contratista, estos triggers se disparan automáticamente:
--
--   INSERT en info_estudiante  → asigna rol 'Estudiante'  en usuario_roles
--   INSERT en info_empleado    → asigna rol 'Empleado'    en usuario_roles
--   INSERT en info_contratista → asigna rol 'Contratista' en usuario_roles
--
--   DELETE en info_estudiante  → revoca rol 'Estudiante'  en usuario_roles
--   DELETE en info_empleado    → revoca rol 'Empleado'    en usuario_roles
--   DELETE en info_contratista → revoca rol 'Contratista' en usuario_roles
--
-- RESULTADO:
--   El área de Registro carga su CSV → rol asignado automáticamente.
--   RRHH carga su CSV → rol asignado automáticamente.
--   Contratos carga su CSV → rol asignado automáticamente.
--   Nadie tiene que tocar usuario_roles a mano.
--
-- CASOS MULTI-ROL (ej: 80100003 es Estudiante Y Empleado):
--   Se insertan un registro en info_estudiante Y uno en info_empleado.
--   Los triggers crean dos filas en usuario_roles para ese usuario.
--   La constraint UNIQUE (id_institucional, rol_id) evita duplicados.
-- ============================================================


-- ============================================================
-- FUNCIÓN GENÉRICA: asignar rol al insertar
-- Recibe el nombre del rol como argumento del trigger.
-- ============================================================
CREATE OR REPLACE FUNCTION fn_asignar_rol()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_rol_id BIGINT;
    v_nombre_rol TEXT := TG_ARGV[0];  -- Nombre del rol pasado como argumento
BEGIN
    -- Buscar el id del rol en el catálogo
    SELECT id INTO v_rol_id
    FROM roles
    WHERE nombre_rol = v_nombre_rol;

    IF v_rol_id IS NULL THEN
        RAISE EXCEPTION 'Rol "%" no encontrado en el catálogo de roles.', v_nombre_rol;
    END IF;

    -- Insertar en usuario_roles. ON CONFLICT DO NOTHING evita el error
    -- si el usuario ya tenía ese rol previamente asignado.
    INSERT INTO usuario_roles (id_institucional, rol_id)
    VALUES (NEW.id_institucional, v_rol_id)
    ON CONFLICT ON CONSTRAINT uq_usuario_rol DO NOTHING;

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION fn_asignar_rol() IS
    'Asigna automáticamente un rol en usuario_roles cuando se inserta en info_estudiante, info_empleado o info_contratista.';


-- ============================================================
-- FUNCIÓN GENÉRICA: revocar rol al eliminar
-- ============================================================
CREATE OR REPLACE FUNCTION fn_revocar_rol()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_rol_id BIGINT;
    v_nombre_rol TEXT := TG_ARGV[0];
BEGIN
    SELECT id INTO v_rol_id
    FROM roles
    WHERE nombre_rol = v_nombre_rol;

    IF v_rol_id IS NULL THEN
        RAISE EXCEPTION 'Rol "%" no encontrado en el catálogo de roles.', v_nombre_rol;
    END IF;

    DELETE FROM usuario_roles
    WHERE id_institucional = OLD.id_institucional
      AND rol_id = v_rol_id;

    RETURN OLD;
END;
$$;

COMMENT ON FUNCTION fn_revocar_rol() IS
    'Revoca automáticamente un rol en usuario_roles cuando se elimina en info_estudiante, info_empleado o info_contratista.';


-- ============================================================
-- TRIGGERS - info_estudiante
-- ============================================================
DROP TRIGGER IF EXISTS trg_asignar_rol_estudiante ON info_estudiante;
CREATE TRIGGER trg_asignar_rol_estudiante
    AFTER INSERT ON info_estudiante
    FOR EACH ROW
    EXECUTE FUNCTION fn_asignar_rol('Estudiante');

DROP TRIGGER IF EXISTS trg_revocar_rol_estudiante ON info_estudiante;
CREATE TRIGGER trg_revocar_rol_estudiante
    AFTER DELETE ON info_estudiante
    FOR EACH ROW
    EXECUTE FUNCTION fn_revocar_rol('Estudiante');


-- ============================================================
-- TRIGGERS - info_empleado
-- ============================================================
DROP TRIGGER IF EXISTS trg_asignar_rol_empleado ON info_empleado;
CREATE TRIGGER trg_asignar_rol_empleado
    AFTER INSERT ON info_empleado
    FOR EACH ROW
    EXECUTE FUNCTION fn_asignar_rol('Empleado');

DROP TRIGGER IF EXISTS trg_revocar_rol_empleado ON info_empleado;
CREATE TRIGGER trg_revocar_rol_empleado
    AFTER DELETE ON info_empleado
    FOR EACH ROW
    EXECUTE FUNCTION fn_revocar_rol('Empleado');


-- ============================================================
-- TRIGGERS - info_contratista
-- ============================================================
DROP TRIGGER IF EXISTS trg_asignar_rol_contratista ON info_contratista;
CREATE TRIGGER trg_asignar_rol_contratista
    AFTER INSERT ON info_contratista
    FOR EACH ROW
    EXECUTE FUNCTION fn_asignar_rol('Contratista');

DROP TRIGGER IF EXISTS trg_revocar_rol_contratista ON info_contratista;
CREATE TRIGGER trg_revocar_rol_contratista
    AFTER DELETE ON info_contratista
    FOR EACH ROW
    EXECUTE FUNCTION fn_revocar_rol('Contratista');


-- ============================================================
-- PROCEDIMIENTO DE CARGA SEMESTRAL (IMPORTANTE)
--
-- ⚠️  NO uses TRUNCATE para reemplazar los datos del semestre.
--     TRUNCATE no dispara triggers de fila en PostgreSQL, lo que
--     significa que los roles NUNCA se revocarían automáticamente.
--
-- ✅  Usa DELETE FROM + INSERT o el procedimiento de abajo.
--     DELETE FROM sí dispara el trigger fila por fila.
--
-- Ejemplo para recargar info_estudiante al inicio de semestre:
--
--   DELETE FROM info_estudiante;          ← revoca todos los roles Estudiante
--   INSERT INTO info_estudiante (...)     ← re-asigna solo los matriculados
--   VALUES (...), (...), (...);           ← (o COPY desde CSV)
--
-- Caso práctico:
--   Semestre 2026-1: Juan (semestre 10) está en info_estudiante → tiene rol Estudiante
--   Semestre 2026-2: Juan no se matriculó → NO viene en el nuevo CSV
--                    DELETE FROM borra su fila → trigger revoca rol Estudiante
--                    Juan pierde el acceso como estudiante ✅
--
-- CASO MULTI-ROL:
--   Si Juan también es empleado, su fila en info_empleado NO se toca.
--   Solo pierde el rol Estudiante; conserva el rol Empleado. ✅
-- ============================================================

-- ============================================================
-- VERIFICACIÓN: ejecuta esta query después de cargar los datos
-- para confirmar que los roles quedaron bien asignados.
-- ============================================================
/*
SELECT
    u.id_institucional,
    u.nombre_completo,
    STRING_AGG(r.nombre_rol, ', ' ORDER BY r.nombre_rol) AS roles
FROM usuarios u
LEFT JOIN usuario_roles ur ON ur.id_institucional = u.id_institucional
LEFT JOIN roles          r  ON r.id = ur.rol_id
GROUP BY u.id_institucional, u.nombre_completo
ORDER BY u.id_institucional;
*/

-- ============================================================
-- RESULTADO ESPERADO con los datos de prueba:
--
-- id_institucional | nombre_completo                     | roles
-- -----------------+-------------------------------------+---------------------------
-- 80100001         | Juan Diego Pérez Gómez              | Estudiante
-- 80100002         | María Fernanda Rodríguez López      | Estudiante
-- 80100003         | Carlos Andrés Martínez Ruiz         | Empleado, Estudiante
-- 80100004         | Valentina Torres Herrera            | Contratista, Estudiante
-- 80100005         | Andrés Felipe Sánchez Castro        | Empleado
-- 80100006         | Laura Milena Vargas Díaz            | Contratista, Empleado
-- 80100007         | Santiago Gómez Moreno               | Estudiante
-- 80100008         | Daniela Ospina Ramírez              | Contratista, Empleado
-- ============================================================
