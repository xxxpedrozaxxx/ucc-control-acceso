import { supabase } from '../../../../shared/lib/supabaseClient';

export class UserProfileRepositoryImpl {

  async getProfileData(idInstitucional) {
    // 1. Roles del usuario
    const { data: rolesData, error: rolesError } = await supabase
      .from('usuario_roles')
      .select('roles(nombre_rol)')
      .eq('id_institucional', idInstitucional);

    if (rolesError) {
      console.error('Error al obtener roles:', rolesError.message);
      return { roles: [], infoEstudiante: null, infoEmpleado: null, infoContratista: null, fallas: [] };
    }

    const roles = rolesData.map((r) => r.roles.nombre_rol);

    // 2. Info por rol + historial de fallas en paralelo
    const [estudianteRes, empleadoRes, contratistaRes, fallasRes] = await Promise.all([
      roles.includes('Estudiante')
        ? supabase.from('info_estudiante').select('programa').eq('id_institucional', idInstitucional).single()
        : Promise.resolve({ data: null }),

      roles.includes('Empleado')
        ? supabase.from('info_empleado').select('cargo, dependencia').eq('id_institucional', idInstitucional).single()
        : Promise.resolve({ data: null }),

      roles.includes('Contratista')
        ? supabase.from('info_contratista').select('empresa').eq('id_institucional', idInstitucional).single()
        : Promise.resolve({ data: null }),

      supabase
        .from('fallas')
        .select('id, fecha_hora, motivo')
        .eq('id_institucional', idInstitucional)
        .order('fecha_hora', { ascending: false }),
    ]);

    return {
      roles,
      infoEstudiante:  estudianteRes.data  ?? null,
      infoEmpleado:    empleadoRes.data    ?? null,
      infoContratista: contratistaRes.data ?? null,
      fallas:          fallasRes.data      ?? [],
    };
  }

  async registrarFalla(idInstitucional, motivo) {
    // Verificar que el usuario no esté bloqueado ni haya alcanzado el límite
    const { data: usuario, error: errUser } = await supabase
      .from('usuarios')
      .select('acceso, total_fallas')
      .eq('id_institucional', idInstitucional)
      .single();

    if (errUser) throw new Error(errUser.message);
    if (usuario.acceso === 'bloqueado') throw new Error('El usuario está bloqueado y no puede registrar más fallas.');
    if (usuario.total_fallas >= 4)      throw new Error('El usuario ya alcanzó el límite de 4 fallas.');

    const { error } = await supabase
      .from('fallas')
      .insert({ id_institucional: idInstitucional, motivo });

    if (error) throw new Error(error.message);
  }
}
