/**
 * Datos estáticos para la ficha técnica
 * Reemplazar por llamadas reales a Supabase cuando el backend esté listo
 */
export const mockUserProfile = {
  id_institucional:    '1234567',
  documento_identidad: '1.006.789.234',
  nombre_completo:     'Carlos Andrés Pérez Gómez',
  acceso:              'activo',
  total_fallas:        2,
  foto_url:            null,

  // Roles activos del usuario (puede tener 1, 2 o 3)
  roles: ['Estudiante'],

  // Info estudiante: solo el programa
  info_estudiante: {
    programa_academico: 'Ingeniería de Sistemas',
  },

  // Info empleado: solo cargo y dependencia
  info_empleado: {
    cargo:       'Coordinador de Tesorería',
    dependencia: 'Área Financiera',
  },

  // Info contratista: solo la empresa
  info_contratista: {
    empresa_proveedora: 'Servicios TI SAS',
  },

  // Historial de fallas
  historial_fallas: [
    { id: 1, fecha: '14 Feb 2026', motivo: 'Olvido',  sede: 'Bogotá - Entrada Principal', vigilante: 'Luis Martínez' },
    { id: 2, fecha: '03 Feb 2026', motivo: 'Olvido',  sede: 'Bogotá - Bloque C',           vigilante: 'Ana Torres'    },
    { id: 3, fecha: '21 Nov 2025', motivo: 'Pérdida', sede: 'Bogotá - Entrada Principal', vigilante: 'Luis Martínez' },
    { id: 4, fecha: '05 Oct 2025', motivo: 'Olvido',  sede: 'Bogotá - Bloque A',           vigilante: 'Pedro Gómez'   },
  ],
};
