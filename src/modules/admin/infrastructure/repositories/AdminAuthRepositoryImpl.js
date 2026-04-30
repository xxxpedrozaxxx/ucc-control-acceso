import bcrypt from 'bcryptjs';
import { supabase } from '../../../../shared/lib/supabaseClient';

const SESSION_KEY = 'ucc_admin_session';

export class AdminAuthRepositoryImpl {

  /**
   * Intenta autenticar un admin con id_institucional + contraseña.
   * Retorna el objeto usuario si las credenciales son válidas.
   */
  async login(idInstitucional, contrasena) {
    // 1. Buscar el hash almacenado y nivel
    const { data: adminRow, error } = await supabase
      .from('admins')
      .select('contrasena_hash, nivel')
      .eq('id_institucional', idInstitucional)
      .single();

    if (error || !adminRow) {
      throw new Error('Credenciales inválidas.');
    }

    // 2. Verificar contraseña contra el hash
    const valida = await bcrypt.compare(contrasena, adminRow.contrasena_hash);
    if (!valida) {
      throw new Error('Credenciales inválidas.');
    }

    // 3. Obtener datos básicos del usuario
    const { data: usuario, error: errUser } = await supabase
      .from('usuarios')
      .select('id_institucional, nombre_completo, acceso')
      .eq('id_institucional', idInstitucional)
      .single();

    if (errUser || !usuario) {
      throw new Error('Usuario no encontrado.');
    }

    if (usuario.acceso === 'bloqueado') {
      throw new Error('Esta cuenta está bloqueada. Contacta soporte.');
    }

    // 4. Persistir sesión en sessionStorage (dura hasta cerrar la pestaña)
    const sesion = {
      id_institucional: usuario.id_institucional,
      nombre_completo:  usuario.nombre_completo,
      nivel:            adminRow.nivel,      // 'superadmin' | 'admin'
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sesion));

    // Registrar último ingreso (silencioso — no bloquea el login si falla)
    supabase.from('admins')
      .update({ ultimo_ingreso: new Date().toISOString() })
      .eq('id_institucional', idInstitucional)
      .then(() => {});

    return sesion;
  }

  /**
   * Cierra la sesión admin.
   */
  logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  /**
   * Retorna la sesión activa o null.
   */
  getSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
