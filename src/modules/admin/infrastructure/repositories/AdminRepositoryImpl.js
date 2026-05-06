import bcrypt from 'bcryptjs';
import { supabase } from '../../../../shared/lib/supabaseClient';

/**
 * Implementación real del repositorio admin usando Supabase
 */
export class AdminRepositoryImpl {

  // ─── Estadísticas generales ────────────────────────────────────────────────
  async getStats() {
    // Obtener ids de roles
    const { data: rolesData } = await supabase
      .from('roles')
      .select('id, nombre_rol');

    const rolId = (nombre) => rolesData?.find(r => r.nombre_rol === nombre)?.id;

    const [
      { count: totalEstudiantes },
      { count: totalEmpleados },
      { count: totalContratistas },
      { count: activos },
      { count: bloqueados },
      { count: reportesHoy },
      { count: totalFallas },
    ] = await Promise.all([
      // Total estudiantes
      supabase
        .from('usuario_roles')
        .select('*', { count: 'exact', head: true })
        .eq('rol_id', rolId('Estudiante')),

      // Total empleados
      supabase
        .from('usuario_roles')
        .select('*', { count: 'exact', head: true })
        .eq('rol_id', rolId('Empleado')),

      // Total contratistas
      supabase
        .from('usuario_roles')
        .select('*', { count: 'exact', head: true })
        .eq('rol_id', rolId('Contratista')),

      // Activos
      supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('acceso', 'activo'),

      // Bloqueados
      supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('acceso', 'bloqueado'),

      // Reportes TIP hoy
      supabase
        .from('fallas')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_hora', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
        .lte('fecha_hora', new Date(new Date().setHours(23, 59, 59, 999)).toISOString()),

      // Total fallas del semestre
      supabase
        .from('fallas')
        .select('*', { count: 'exact', head: true }),
    ]);

    return {
      totalEstudiantes:  totalEstudiantes  ?? 0,
      totalEmpleados:    totalEmpleados    ?? 0,
      totalContratistas: totalContratistas ?? 0,
      activos:           activos           ?? 0,
      bloqueados:        bloqueados        ?? 0,
      reportesHoy:       reportesHoy       ?? 0,
      totalFallas:       totalFallas       ?? 0,
    };
  }

  // ─── Fallas últimos 7 días agrupadas por día y motivo ─────────────────────
  async getFallasUltimos7Dias() {
    const hace7dias = new Date();
    hace7dias.setDate(hace7dias.getDate() - 6);
    hace7dias.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('fallas')
      .select('fecha_hora, motivo')
      .gte('fecha_hora', hace7dias.toISOString())
      .order('fecha_hora', { ascending: true });

    if (error || !data) return [];

    // Construir mapa día → { olvido, perdida }
    const diasMap = {};
    const diasLabels = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key  = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
      diasMap[key]   = { dia: label, olvido: 0, perdida: 0 };
      diasLabels.push(key);
    }

    data.forEach(({ fecha_hora, motivo }) => {
      const key = new Date(fecha_hora).toISOString().split('T')[0];
      if (diasMap[key]) {
        diasMap[key][motivo] = (diasMap[key][motivo] || 0) + 1;
      }
    });

    return diasLabels.map(k => diasMap[k]);
  }

  // ─── Distribución de estudiantes por programa ─────────────────────────────
  async getEstudiantesPorPrograma() {
    const { data, error } = await supabase
      .from('info_estudiante')
      .select('programa');

    if (error || !data) return [];

    const conteo = {};
    data.forEach(({ programa }) => {
      const key = programa || 'Sin programa';
      conteo[key] = (conteo[key] || 0) + 1;
    });

    return Object.entries(conteo)
      .map(([programa, total]) => ({ programa, total }))
      .sort((a, b) => b.total - a.total);
  }

  // ─── Lista completa de usuarios con roles e info ───────────────────────────
  async getUsuarios() {
    // 1. Todos los usuarios
    const { data: usuarios } = await supabase
      .from('usuarios')
      .select('id_institucional, nombre_completo, acceso, total_fallas')
      .order('nombre_completo');

    if (!usuarios || usuarios.length === 0) return [];

    const ids = usuarios.map(u => u.id_institucional);

    // 2. Roles de cada usuario
    const { data: relaciones } = await supabase
      .from('usuario_roles')
      .select('id_institucional, roles(nombre_rol)')
      .in('id_institucional', ids);

    // 3. Info de todas las tablas en paralelo
    const [{ data: infoEst }, { data: infoEmp }, { data: infoCon }] = await Promise.all([
      supabase.from('info_estudiante').select('id_institucional, programa').in('id_institucional', ids),
      supabase.from('info_empleado').select('id_institucional, cargo, dependencia').in('id_institucional', ids),
      supabase.from('info_contratista').select('id_institucional, empresa').in('id_institucional', ids),
    ]);

    // 4. Construir mapas
    const rolesMap   = {};
    (relaciones || []).forEach(r => {
      const id   = r.id_institucional;
      const name = r.roles?.nombre_rol;
      if (!rolesMap[id]) rolesMap[id] = [];
      if (name) rolesMap[id].push(name);
    });

    const estMap = {}; (infoEst  || []).forEach(e => { estMap[e.id_institucional] = e; });
    const empMap = {}; (infoEmp  || []).forEach(e => { empMap[e.id_institucional] = e; });
    const conMap = {}; (infoCon  || []).forEach(e => { conMap[e.id_institucional] = e; });

    return usuarios.map(u => {
      const roles   = rolesMap[u.id_institucional] ?? [];
      const est     = estMap[u.id_institucional];
      const emp     = empMap[u.id_institucional];
      const con     = conMap[u.id_institucional];

      // Info extra: un dato clave por rol
      const infoItems = [];
      if (est?.programa)    infoItems.push({ tipo: 'programa',    valor: est.programa });
      if (emp?.dependencia) infoItems.push({ tipo: 'dependencia', valor: emp.dependencia });
      if (con?.empresa)     infoItems.push({ tipo: 'empresa',     valor: con.empresa });

      // infoExtra como string plano (para búsqueda)
      const infoExtra = infoItems.map(i => i.valor).join(' · ') || '—';

      return { ...u, roles, infoExtra, infoItems };
    });
  }

  // ─── Bloquear / Desbloquear usuario ──────────────────────────────────────
  async toggleAcceso(id_institucional, nuevoAcceso) {
    const { error } = await supabase
      .from('usuarios')
      .update({ acceso: nuevoAcceso })
      .eq('id_institucional', id_institucional);
    if (error) throw new Error(error.message);

    // Al desbloquear: eliminar todas las fallas para resetear el contador
    // (el trigger fn_actualizar_fallas recalcula total_fallas = 0 automáticamente)
    if (nuevoAcceso === 'activo') {
      const { error: errFallas } = await supabase
        .from('fallas')
        .delete()
        .eq('id_institucional', id_institucional);
      if (errFallas) throw new Error(errFallas.message);
    }
  }

  // ─── Helper privado ────────────────────────────────────────────────────────
  async #upsertRol(registros, nombreRol) {
    const { data: rolDB, error: errRol } = await supabase
      .from('roles')
      .select('id')
      .eq('nombre_rol', nombreRol)
      .single();
    if (errRol) throw new Error(`Rol "${nombreRol}" no encontrado: ${errRol.message}`);

    const relRoles = registros.map(r => ({
      id_institucional: r.id_institucional,
      rol_id:           rolDB.id,
    }));
    const { error } = await supabase
      .from('usuario_roles')
      .upsert(relRoles, { onConflict: 'id_institucional,rol_id' });
    if (error) throw new Error(`Error upsert usuario_roles: ${error.message}`);
  }

  // ─── Cargar CSV — Usuarios (datos base) ──────────────────────────────────
  async cargarUsuarios(registros) {
    const data = registros.map(r => ({
      id_institucional:    r.id_institucional,
      documento_identidad: r.documento_identidad,
      nombre_completo:     r.nombre_completo,
      acceso:              'activo',
      total_fallas:        0,
    }));

    // Antes del upsert, eliminar filas que comparten documento_identidad con el
    // nuevo lote pero tienen un id_institucional diferente (datos obsoletos o
    // admins que aún estén en usuarios si la migración de independencia no corrió).
    const docs = data.map(r => r.documento_identidad).filter(Boolean);
    const ids  = data.map(r => r.id_institucional);
    if (docs.length > 0) {
      const { error: errDel } = await supabase
        .from('usuarios')
        .delete()
        .in('documento_identidad', docs)
        .not('id_institucional', 'in', `(${ids.join(',')})`);
      if (errDel) throw new Error(`Error limpiando conflictos de documento: ${errDel.message}`);
    }

    const { error } = await supabase
      .from('usuarios')
      .upsert(data, { onConflict: 'id_institucional' });
    if (error) throw new Error(`Error upsert usuarios: ${error.message}`);
    return { insertados: registros.length };
  }

  // ─── Cargar CSV — Rol Estudiante (solo id + programa) ────────────────────
  async cargarEstudiantes(registros) {
    const infoData = registros.map(r => ({
      id_institucional: r.id_institucional,
      programa:         r.programa_academico || null,
    }));
    const { error } = await supabase
      .from('info_estudiante')
      .upsert(infoData, { onConflict: 'id_institucional' });
    if (error) throw new Error(`Error info_estudiante: ${error.message}`);

    await this.#upsertRol(registros, 'Estudiante');
    return { insertados: registros.length };
  }

  // ─── Cargar CSV — Rol Empleado (solo id + cargo/dependencia) ─────────────
  async cargarEmpleados(registros) {
    const infoData = registros.map(r => ({
      id_institucional: r.id_institucional,
      cargo:            r.cargo       || null,
      dependencia:      r.dependencia || null,
    }));
    const { error } = await supabase
      .from('info_empleado')
      .upsert(infoData, { onConflict: 'id_institucional' });
    if (error) throw new Error(`Error info_empleado: ${error.message}`);

    await this.#upsertRol(registros, 'Empleado');
    return { insertados: registros.length };
  }

  // ─── Cargar CSV — Rol Contratista (solo id + empresa) ────────────────────
  async cargarContratistas(registros) {
    const infoData = registros.map(r => ({
      id_institucional: r.id_institucional,
      empresa:          r.empresa || null,
    }));
    const { error } = await supabase
      .from('info_contratista')
      .upsert(infoData, { onConflict: 'id_institucional' });
    if (error) throw new Error(`Error info_contratista: ${error.message}`);

    await this.#upsertRol(registros, 'Contratista');
    return { insertados: registros.length };
  }

  // ─── Informe por período ────────────────────────────────────────────────────────
  async getReporte(periodo, offset = 0) {
    // Calcular desde/hasta según el período y el offset (0 = actual, 1 = anterior, etc.)
    const ahora      = new Date();
    let   inicio     = new Date(ahora);
    let   hastaDate  = new Date(ahora);

    if (periodo === 'diario') {
      inicio.setDate(ahora.getDate() - offset);
      inicio.setHours(0, 0, 0, 0);
      if (offset > 0) {
        hastaDate = new Date(inicio);
        hastaDate.setHours(23, 59, 59, 999);
      }
    } else if (periodo === 'semanal') {
      const dia = ahora.getDay();
      inicio.setDate(ahora.getDate() - ((dia + 6) % 7) - offset * 7);
      inicio.setHours(0, 0, 0, 0);
      if (offset > 0) {
        hastaDate = new Date(inicio);
        hastaDate.setDate(inicio.getDate() + 6);
        hastaDate.setHours(23, 59, 59, 999);
      }
    } else if (periodo === 'mensual') {
      inicio = new Date(ahora.getFullYear(), ahora.getMonth() - offset, 1);
      inicio.setHours(0, 0, 0, 0);
      if (offset > 0) {
        hastaDate = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 0, 23, 59, 59, 999);
      }
    } else { // semestral — offset no aplica, siempre semestre activo
      const semestre = await this.getSemestreActivo();
      if (semestre) {
        const [y, m, d]    = semestre.fecha_inicio.split('-').map(Number);
        inicio = new Date(y, m - 1, d, 0, 0, 0, 0);
        const [yf, mf, df] = semestre.fecha_fin.split('-').map(Number);
        const finSem = new Date(yf, mf - 1, df, 23, 59, 59, 999);
        hastaDate = finSem < ahora ? finSem : ahora;
      } else {
        const mes = ahora.getMonth();
        inicio = new Date(ahora.getFullYear(), mes < 6 ? 0 : 6, 1, 0, 0, 0, 0);
      }
    }

    const desde = inicio.toISOString();
    const hasta = hastaDate.toISOString();

    // Ejecutar todas las consultas en paralelo
    const [
      rolesData,
      fallasData,
      programaData,
      dependenciaData,
      contratistasData,
      nombresData,
    ] = await Promise.all([
      // Conteo por rol
      supabase
        .from('usuario_roles')
        .select('roles(nombre_rol)'),

      // Fallas en el período (con id para cruzar con info)
      supabase
        .from('fallas')
        .select('id_institucional, fecha_hora, motivo')
        .gte('fecha_hora', desde)
        .lte('fecha_hora', hasta),

      // Distribución por programa (con id para cruzar fallas)
      supabase
        .from('info_estudiante')
        .select('id_institucional, programa'),

      // Distribución por dependencia (con id para cruzar fallas)
      supabase
        .from('info_empleado')
        .select('id_institucional, dependencia'),

      // Empresas contratistas (con id para cruzar fallas)
      supabase
        .from('info_contratista')
        .select('id_institucional, empresa'),

      // Nombres completos de todos los usuarios
      supabase
        .from('usuarios')
        .select('id_institucional, nombre_completo'),
    ]);

    // — Conteos por rol
    const roles = rolesData.data || [];
    const contarRol = (nombre) =>
      roles.filter(r => r.roles?.nombre_rol === nombre).length;

    // — Fallas en el período
    const fallas = fallasData.data || [];

    // — Fallas agrupadas por día (para el gráfico)
    const fallasPorDiaMap = {};
    fallas.forEach(f => {
      const fecha = new Date(f.fecha_hora);
      const clave = fecha.toLocaleDateString('es-CO', {
        day: '2-digit', month: 'short'
      });
      fallasPorDiaMap[clave] = (fallasPorDiaMap[clave] || 0) + 1;
    });
    const fallasPorDia = Object.entries(fallasPorDiaMap)
      .map(([dia, total]) => ({ dia, total }))
      .sort((a, b) => a.dia.localeCompare(b.dia));

    // — Programas agrupados (total estudiantes)
    const progMap = {};
    (programaData.data || []).forEach(r => {
      const p = r.programa || 'Sin asignar';
      progMap[p] = (progMap[p] || 0) + 1;
    });
    const porPrograma = Object.entries(progMap)
      .map(([programa, total]) => ({ programa, total }))
      .sort((a, b) => b.total - a.total);

    // — Dependencias agrupadas (total empleados)
    const depMap = {};
    (dependenciaData.data || []).forEach(r => {
      const d = r.dependencia || 'Sin asignar';
      depMap[d] = (depMap[d] || 0) + 1;
    });
    const porDependencia = Object.entries(depMap)
      .map(([dependencia, total]) => ({ dependencia, total }))
      .sort((a, b) => b.total - a.total);

    // — Lookup maps para cruzar fallas con info (String() evita mismatch numérico)
    const progById  = {};
    (programaData.data  || []).forEach(r => { progById[String(r.id_institucional)]  = r.programa     || 'Sin asignar'; });
    const depById   = {};
    (dependenciaData.data || []).forEach(r => { depById[String(r.id_institucional)] = r.dependencia  || 'Sin asignar'; });
    const empById   = {};
    (contratistasData.data || []).forEach(r => { empById[String(r.id_institucional)] = r.empresa     || 'Sin asignar'; });

    // — Lookup: id_institucional → nombre_completo
    const nombreById = {};
    (nombresData.data || []).forEach(r => {
      nombreById[String(r.id_institucional)] = r.nombre_completo || '—';
    });

    // — Lista detallada de personas con fallas en el período
    const fallasPorPersona = {};
    fallas.forEach(f => {
      const id = String(f.id_institucional);
      if (!fallasPorPersona[id]) {
        let tipo = 'Desconocido';
        let grupo = '—';
        if (progById[id])       { tipo = 'Estudiante';  grupo = progById[id]; }
        else if (depById[id])   { tipo = 'Empleado';    grupo = depById[id]; }
        else if (empById[id])   { tipo = 'Contratista'; grupo = empById[id]; }
        fallasPorPersona[id] = {
          id_institucional: f.id_institucional,
          nombre:           nombreById[id] || '—',
          tipo,
          grupo,
          fallas:           0,
        };
      }
      fallasPorPersona[id].fallas += 1;
    });
    const personasConFallas = Object.values(fallasPorPersona)
      .sort((a, b) => b.fallas - a.fallas || a.nombre.localeCompare(b.nombre));

    // — Debug: registrar estado de datos en consola para diagnóstico
    if (process.env.NODE_ENV !== 'production') {
      console.group('[getReporte] diagnóstico cruce fallas ↔ info');
      console.log('fallas en período:', fallas.length);
      console.log('ids fallas (primeros 5):', fallas.slice(0, 5).map(f => f.id_institucional));
      console.log('keys progById (primeros 5):', Object.keys(progById).slice(0, 5));
      console.log('keys depById  (primeros 5):', Object.keys(depById).slice(0, 5));
      console.log('keys empById  (primeros 5):', Object.keys(empById).slice(0, 5));
      if (fallasData.error)       console.error('fallasData error:', fallasData.error);
      if (programaData.error)     console.error('programaData error:', programaData.error);
      if (dependenciaData.error)  console.error('dependenciaData error:', dependenciaData.error);
      if (contratistasData.error) console.error('contratistasData error:', contratistasData.error);
      console.groupEnd();
    }

    // — Fallas por programa (solo estudiantes que fallaron)
    const fallaProgMap = {};
    fallas.forEach(f => {
      const id = String(f.id_institucional);
      if (progById[id]) {
        const prog = progById[id];
        fallaProgMap[prog] = (fallaProgMap[prog] || 0) + 1;
      }
    });
    const fallasPorPrograma = Object.entries(fallaProgMap)
      .map(([programa, fallas_total]) => ({ programa, fallas_total }))
      .sort((a, b) => b.fallas_total - a.fallas_total);

    // — Fallas por dependencia (solo empleados que fallaron)
    const fallaDepMap = {};
    fallas.forEach(f => {
      const id = String(f.id_institucional);
      if (depById[id]) {
        const dep = depById[id];
        fallaDepMap[dep] = (fallaDepMap[dep] || 0) + 1;
      }
    });
    const fallasPorDependencia = Object.entries(fallaDepMap)
      .map(([dependencia, fallas_total]) => ({ dependencia, fallas_total }))
      .sort((a, b) => b.fallas_total - a.fallas_total);

    // — Fallas por empresa contratista
    const fallaEmpMap = {};
    fallas.forEach(f => {
      const id = String(f.id_institucional);
      if (empById[id]) {
        const emp = empById[id];
        fallaEmpMap[emp] = (fallaEmpMap[emp] || 0) + 1;
      }
    });
    const fallasPorEmpresa = Object.entries(fallaEmpMap)
      .map(([empresa, fallas_total]) => ({ empresa, fallas_total }))
      .sort((a, b) => b.fallas_total - a.fallas_total);

    // — Totales de fallas agrupados por tipo de rol
    const fallasEstudiantes  = Object.values(fallaProgMap).reduce((a, b) => a + b, 0);
    const fallasEmpleados    = Object.values(fallaDepMap).reduce((a, b) => a + b, 0);
    const fallasContratistas = Object.values(fallaEmpMap).reduce((a, b) => a + b, 0);

    // — Listas detalladas con nombre por persona (para hojas Excel)
    const estudiantesPorPrograma = (programaData.data || [])
      .map(r => ({
        programa:         r.programa || 'Sin asignar',
        nombre:           nombreById[String(r.id_institucional)] || '—',
        id_institucional: r.id_institucional,
      }))
      .sort((a, b) => a.programa.localeCompare(b.programa) || a.nombre.localeCompare(b.nombre));

    const empleadosPorDependencia = (dependenciaData.data || [])
      .map(r => ({
        dependencia:      r.dependencia || 'Sin asignar',
        nombre:           nombreById[String(r.id_institucional)] || '—',
        id_institucional: r.id_institucional,
      }))
      .sort((a, b) => a.dependencia.localeCompare(b.dependencia) || a.nombre.localeCompare(b.nombre));

    const contratistasPorEmpresa = (contratistasData.data || [])
      .map(r => ({
        empresa:          r.empresa || 'Sin asignar',
        nombre:           nombreById[String(r.id_institucional)] || '—',
        id_institucional: r.id_institucional,
      }))
      .sort((a, b) => a.empresa.localeCompare(b.empresa) || a.nombre.localeCompare(b.nombre));

    // — Conteo de contratistas por empresa (resumen)
    const empCountMap = {};
    (contratistasData.data || []).forEach(r => {
      const e = r.empresa || 'Sin asignar';
      empCountMap[e] = (empCountMap[e] || 0) + 1;
    });
    const porEmpresa = Object.entries(empCountMap)
      .map(([empresa, total]) => ({ empresa, total }))
      .sort((a, b) => b.total - a.total);

    // — Detalle de fallas por día (una fila por falla individual)
    const fallasPorDiaDetalle = fallas
      .map(f => {
        const id    = String(f.id_institucional);
        const fecha = new Date(f.fecha_hora);
        const dia   = fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
        let tipo = 'Desconocido';
        if (progById[id])      tipo = 'Estudiante';
        else if (depById[id])  tipo = 'Empleado';
        else if (empById[id])  tipo = 'Contratista';
        return { dia, nombre: nombreById[id] || '—', id_institucional: f.id_institucional, tipo };
      })
      .sort((a, b) => a.dia.localeCompare(b.dia) || a.nombre.localeCompare(b.nombre));

    return {
      totalEstudiantes:  contarRol('Estudiante'),
      totalEmpleados:    contarRol('Empleado'),
      totalContratistas: contarRol('Contratista'),
      fallasPeriodo:     fallas.length,
      fallasEstudiantes,
      fallasEmpleados,
      fallasContratistas,
      fallasPorDia,
      fallasPorDiaDetalle,
      porPrograma,
      porDependencia,
      porEmpresa,
      fallasPorPrograma,
      fallasPorDependencia,
      fallasPorEmpresa,
      personasConFallas,
      estudiantesPorPrograma,
      empleadosPorDependencia,
      contratistasPorEmpresa,
      rangoEtiqueta: [
        inicio.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
        ' — ',
        hastaDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
      ].join(''),
    };
  }

  // ─── Semestre activo ───────────────────────────────────────────────────────
  async getSemestreActivo() {
    const { data } = await supabase
      .from('semestres')
      .select('id, nombre, fecha_inicio, fecha_fin')
      .eq('activo', true)
      .maybeSingle();
    return data ?? null;
  }

  // ─── Iniciar nuevo semestre ────────────────────────────────────────────────
  /**
   * 1. Desactiva el semestre anterior.
   * 2. Inserta el nuevo semestre como activo.
   * 3. Elimina todos los datos del semestre anterior en orden correcto de FK,
   *    EXCEPTO los usuarios que son administradores (son permanentes).
   */
  async iniciarNuevoSemestre(nombre, fechaInicio, fechaFin) {
    // Paso 1: desactivar semestre anterior
    await supabase
      .from('semestres')
      .update({ activo: false })
      .eq('activo', true);

    // Paso 2: insertar nuevo semestre
    const { data: nuevoSem, error: errSem } = await supabase
      .from('semestres')
      .insert({ nombre, fecha_inicio: fechaInicio, fecha_fin: fechaFin, activo: true })
      .select()
      .single();
    if (errSem) throw new Error(`Error al crear semestre: ${errSem.message}`);

    // Paso 3: limpiar datos del semestre anterior.
    // Los admins solo existen en la tabla 'admins' (separada), NUNCA en usuarios,
    // info_estudiante, info_empleado, info_contratista ni usuario_roles.
    // → Se eliminan TODOS los registros de cada tabla sin filtro de exclusión.
    const borrarTodo = (tabla) =>
      supabase.from(tabla).delete().not('id_institucional', 'is', null);

    const [r1, r2, r3, r4, r5, r6] = await Promise.all([
      supabase.from('fallas').delete().not('id', 'is', null),
      borrarTodo('info_estudiante'),
      borrarTodo('info_empleado'),
      borrarTodo('info_contratista'),
      borrarTodo('usuario_roles'),
      borrarTodo('usuarios'),
    ]);

    const errLimpieza = r1.error || r2.error || r3.error || r4.error || r5.error || r6.error;
    if (errLimpieza) throw new Error(`Error limpiando datos del semestre: ${errLimpieza.message}`);

    return nuevoSem;
  }

  // ─── Listar administradores ────────────────────────────────────────────────
  async getAdmins() {
    const { data, error } = await supabase
      .from('admins')
      .select('id_institucional, nombre_completo, nivel, creado_en, ultimo_ingreso')
      .order('nivel',     { ascending: false })  // superadmin primero
      .order('creado_en', { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []).map(a => ({
      id_institucional: a.id_institucional,
      nombre_completo:  a.nombre_completo ?? '—',
      nivel:            a.nivel,
      creado_en:        a.creado_en,
      ultimo_ingreso:   a.ultimo_ingreso,
    }));
  }

  // ─── Crear administrador ───────────────────────────────────────────────────
  /**
   * Crea un admin independiente de la tabla usuarios.
   * Solo el superadmin puede llamar esto.
   */
  async crearAdmin(id_institucional, nombre_completo, nivel, contrasena) {
    const hash = await bcrypt.hash(contrasena, 12);
    const { error } = await supabase
      .from('admins')
      .insert({ id_institucional, nombre_completo, contrasena_hash: hash, nivel });
    if (error) {
      if (error.code === '23505') throw new Error('Este ID ya tiene perfil de administrador.');
      throw new Error(error.message);
    }
  }

  // ─── Cambiar contraseña de un administrador ────────────────────────────────
  /**
   * Solo el superadmin puede cambiar la contraseña de cualquier admin.
   */
  async cambiarContrasenaAdmin(id_institucional, nuevaContrasena) {
    const hash = await bcrypt.hash(nuevaContrasena, 12);
    const { error } = await supabase
      .from('admins')
      .update({ contrasena_hash: hash })
      .eq('id_institucional', id_institucional);
    if (error) throw new Error(error.message);
  }

  // ─── Eliminar administrador ────────────────────────────────────────────────
  /**
   * Los superadmins no se pueden eliminar desde el panel.
   */
  async eliminarAdmin(id_institucional) {
    const { data: adminRow, error: errCheck } = await supabase
      .from('admins')
      .select('nivel')
      .eq('id_institucional', id_institucional)
      .single();
    if (errCheck || !adminRow) throw new Error('Administrador no encontrado.');
    if (adminRow.nivel === 'superadmin') {
      throw new Error('Los superadmin no pueden eliminarse desde el panel.');
    }

    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id_institucional', id_institucional);
    if (error) throw new Error(error.message);
  }
}
