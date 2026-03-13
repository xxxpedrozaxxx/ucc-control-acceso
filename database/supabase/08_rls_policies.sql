-- ============================================================
-- 08_rls_policies.sql
-- Políticas de Row Level Security (RLS) para todas las tablas
-- Sistema de Control de Acceso UCC
--
-- IMPORTANTE: Ejecutar este archivo completo en el SQL Editor
-- de Supabase cada vez que se cree el proyecto desde cero.
--
-- Contexto: La app usa la clave pública (anon key) desde el
-- frontend. Sin estas políticas, Supabase bloquea todas las
-- operaciones aunque RLS esté activo.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- TABLA: usuarios
-- Operaciones necesarias:
--   SELECT  → leer usuarios (panel admin, login)
--   INSERT  → cargar CSV masivo de usuarios nuevos
--   UPDATE  → bloquear/desbloquear acceso, actualizar fallas
-- ────────────────────────────────────────────────────────────

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios: lectura publica"
  ON usuarios FOR SELECT
  USING (true);

CREATE POLICY "usuarios: insertar"
  ON usuarios FOR INSERT
  WITH CHECK (true);

CREATE POLICY "usuarios: actualizar"
  ON usuarios FOR UPDATE
  USING (true);

CREATE POLICY "usuarios: eliminar"
  ON usuarios FOR DELETE
  USING (true);

-- ────────────────────────────────────────────────────────────
-- TABLA: roles
-- Operaciones necesarias:
--   SELECT  → obtener lista de roles al cargar CSV y en vistas
-- No necesita INSERT/UPDATE desde el frontend (se carga manualmente)
-- ────────────────────────────────────────────────────────────

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roles: lectura publica"
  ON roles FOR SELECT
  USING (true);


-- ────────────────────────────────────────────────────────────
-- TABLA: usuario_roles
-- Operaciones necesarias:
--   SELECT  → mostrar roles de cada usuario en la vista admin
--   INSERT  → asignar rol al cargar CSV de estudiantes/empleados/contratistas
-- ────────────────────────────────────────────────────────────

ALTER TABLE usuario_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuario_roles: lectura publica"
  ON usuario_roles FOR SELECT
  USING (true);

CREATE POLICY "usuario_roles: insertar"
  ON usuario_roles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "usuario_roles: eliminar"
  ON usuario_roles FOR DELETE
  USING (true);

-- ────────────────────────────────────────────────────────────
-- TABLA: info_estudiante
-- Operaciones necesarias:
--   SELECT  → mostrar programa académico en panel admin
--   INSERT  → cargar CSV de estudiantes
--   UPDATE  → actualizar programa si el estudiante ya existe (upsert)
-- ────────────────────────────────────────────────────────────

ALTER TABLE info_estudiante ENABLE ROW LEVEL SECURITY;

CREATE POLICY "info_estudiante: lectura publica"
  ON info_estudiante FOR SELECT
  USING (true);

CREATE POLICY "info_estudiante: insertar"
  ON info_estudiante FOR INSERT
  WITH CHECK (true);

CREATE POLICY "info_estudiante: actualizar"
  ON info_estudiante FOR UPDATE
  USING (true);

CREATE POLICY "info_estudiante: eliminar"
  ON info_estudiante FOR DELETE
  USING (true);

-- ────────────────────────────────────────────────────────────
-- TABLA: info_empleado
-- Operaciones necesarias:
--   SELECT  → mostrar cargo/dependencia en panel admin
--   INSERT  → cargar CSV de empleados
--   UPDATE  → actualizar cargo si el empleado ya existe (upsert)
-- ────────────────────────────────────────────────────────────

ALTER TABLE info_empleado ENABLE ROW LEVEL SECURITY;

CREATE POLICY "info_empleado: lectura publica"
  ON info_empleado FOR SELECT
  USING (true);

CREATE POLICY "info_empleado: insertar"
  ON info_empleado FOR INSERT
  WITH CHECK (true);

CREATE POLICY "info_empleado: actualizar"
  ON info_empleado FOR UPDATE
  USING (true);

CREATE POLICY "info_empleado: eliminar"
  ON info_empleado FOR DELETE
  USING (true);

-- ────────────────────────────────────────────────────────────
-- TABLA: info_contratista
-- Operaciones necesarias:
--   SELECT  → mostrar empresa en panel admin
--   INSERT  → cargar CSV de contratistas
--   UPDATE  → actualizar empresa si el contratista ya existe (upsert)
-- ────────────────────────────────────────────────────────────

ALTER TABLE info_contratista ENABLE ROW LEVEL SECURITY;

CREATE POLICY "info_contratista: lectura publica"
  ON info_contratista FOR SELECT
  USING (true);

CREATE POLICY "info_contratista: insertar"
  ON info_contratista FOR INSERT
  WITH CHECK (true);

CREATE POLICY "info_contratista: actualizar"
  ON info_contratista FOR UPDATE
  USING (true);

CREATE POLICY "info_contratista: eliminar"
  ON info_contratista FOR DELETE
  USING (true);

-- ────────────────────────────────────────────────────────────
-- TABLA: fallas
-- (Ya definidas en 07_fallas.sql — incluidas aquí como referencia)
-- Operaciones necesarias:
--   SELECT  → leer historial de fallas en resumen y por usuario
--   INSERT  → registrar nueva falla al detectar acceso no autorizado
-- ────────────────────────────────────────────────────────────

-- ALTER TABLE fallas ENABLE ROW LEVEL SECURITY;         -- ya en 07_fallas.sql
-- CREATE POLICY "lectura propia fallas" ...              -- ya en 07_fallas.sql
-- CREATE POLICY "insertar falla" ...                     -- ya en 07_fallas.sql

-- Política DELETE para fallas (necesaria para limpiar al iniciar semestre)
CREATE POLICY "fallas: eliminar"
  ON fallas FOR DELETE
  USING (true);


-- ============================================================
-- RESUMEN DE ESTADO ESPERADO
-- ============================================================
-- Tabla            | RLS | SELECT | INSERT | UPDATE | DELETE
-- -----------------|-----|--------|--------|--------|-------
-- usuarios         |  ✓  |   ✓    |   ✓    |   ✓    |   ✓
-- roles            |  ✓  |   ✓    |   —    |   —    |   —
-- usuario_roles    |  ✓  |   ✓    |   ✓    |   —    |   ✓
-- info_estudiante  |  ✓  |   ✓    |   ✓    |   ✓    |   ✓
-- info_empleado    |  ✓  |   ✓    |   ✓    |   ✓    |   ✓
-- info_contratista |  ✓  |   ✓    |   ✓    |   ✓    |   ✓
-- fallas           |  ✓  |   ✓    |   ✓    |   —    |   ✓
-- ============================================================
