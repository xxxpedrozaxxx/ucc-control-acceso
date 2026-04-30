import React from 'react';

/**
 * Cabecera de la ficha técnica
 * Muestra avatar (foto o iniciales), nombre, estado y rol principal
 */
export const ProfileHeader = ({ user }) => {
  const { nombre_completo, acceso, roles, info_estudiante, foto_url } = user;

  // Genera iniciales a partir del nombre
  const getInitials = (name) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const isActive = acceso === 'activo';

  // Subtítulo debajo del nombre: muestra programa si es estudiante, roles si no
  const getSubtitle = () => {
    if (roles.includes('Estudiante') && info_estudiante) {
      // 'programa' = campo real de Supabase | 'programa_academico' = campo del mock
      return info_estudiante.programa ?? info_estudiante.programa_academico;
    }
    return roles.join(' · ');
  };

  return (
    <div className="bg-white/15 backdrop-blur-sm pt-12 pb-8 px-6 flex flex-col items-center text-white relative">
      {/* Avatar */}
      <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden mb-4 bg-ucc-cyan-dark flex items-center justify-center">
        {foto_url ? (
          <img src={foto_url} alt={nombre_completo} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl font-bold text-white">{getInitials(nombre_completo)}</span>
        )}
      </div>

      {/* Nombre */}
      <h1 className="text-xl font-bold text-center leading-tight mb-2">
        {nombre_completo}
      </h1>

      {/* Badge de estado */}
      <span
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold mb-2 ${
          isActive
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-200' : 'bg-red-200'}`} />
        {isActive ? 'Activo' : 'Bloqueado'}
      </span>

      {/* Indicador de fallas */}
      {user.total_fallas > 0 && (
        <div className={`mt-3 px-4 py-1.5 rounded-full text-xs font-semibold ${
          user.total_fallas >= 3
            ? 'bg-orange-500 text-white'
            : 'bg-ucc-green text-white/80'
        }`}>
          {user.total_fallas}/4 fallas registradas
        </div>
      )}
    </div>
  );
};
