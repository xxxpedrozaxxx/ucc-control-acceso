import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { User } from '../../domain/entities/User';
import { supabase } from '../../../../shared/lib/supabaseClient';

/**
 * Implementación REAL del repositorio usando Supabase.
 * Reemplaza a AuthRepositoryMock cuando la BD está lista.
 */
export class AuthRepositoryImpl extends AuthRepository {

  async validateInstitutionalId(idInstitucional) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id_institucional', idInstitucional)
      .single();

    // PGRST116 = no rows found (usuario no existe)
    if (error || !data) return null;

    return new User({
      id:                 data.id,
      idInstitucional:    data.id_institucional,
      documentoIdentidad: data.documento_identidad,
      nombreCompleto:     data.nombre_completo,
      acceso:             data.acceso,
      totalFallas:        data.total_fallas,
    });
  }

  async getUserByInstitutionalId(idInstitucional) {
    return this.validateInstitutionalId(idInstitucional);
  }
}
