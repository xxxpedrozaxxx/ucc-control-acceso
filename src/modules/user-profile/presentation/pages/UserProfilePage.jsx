import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { mockUserProfile }  from '../../infrastructure/datasources/userProfileMock';
import { useUserProfile }   from '../../application/hooks/useUserProfile';
import { ProfileHeader }    from '../components/ProfileHeader';
import { PersonalInfoCard } from '../components/PersonalInfoCard';
import { RoleInfoCard }     from '../components/RoleInfoCard';
import { FallasHistory }    from '../components/FallasHistory';
import { ReportTIPModal }   from '../components/ReportTIPModal';
import { PantallaBloqueo }  from '../../../../shared/components/PantallaBloqueo';

const MAX_FALLAS = 4;

export const UserProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [modalOpen, setModalOpen]     = useState(false);
  const [reportResult, setReportResult] = useState(null);

  // Datos personales que vienen del login
  const userFromLogin = location.state?.user;

  // Datos de roles e info por rol traidos desde Supabase
  const { profileData, loading, reportarFalla } = useUserProfile(userFromLogin?.idInstitucional);

  // total_fallas real = longitud del historial de Supabase (se actualiza tras cada reporte)
  const totalFallasReal = profileData?.fallas?.length ?? userFromLogin?.totalFallas ?? 0;

  // Datos personales: reales si vienen del login, mock como fallback
  const user = {
    ...mockUserProfile,
    id:                  userFromLogin?.id,
    idInstitucional:     userFromLogin?.idInstitucional    ?? mockUserProfile.id_institucional,
    id_institucional:    userFromLogin?.idInstitucional    ?? mockUserProfile.id_institucional,
    documento_identidad: userFromLogin?.documentoIdentidad ?? mockUserProfile.documento_identidad,
    nombre_completo:     userFromLogin?.nombreCompleto     ?? mockUserProfile.nombre_completo,
    acceso:              userFromLogin?.acceso             ?? mockUserProfile.acceso,
    total_fallas:        totalFallasReal,
    // Roles e info: reales desde Supabase. Vacío mientras carga para evitar flash del mock.
    roles:            profileData?.roles           ?? [],
    info_estudiante:  profileData?.infoEstudiante  ?? null,
    info_empleado:    profileData?.infoEmpleado    ?? null,
    info_contratista: profileData?.infoContratista ?? null,
  };

  const handleConfirmReport = async (motivo) => {
    setModalOpen(false);
    try {
      await reportarFalla(motivo);
      setReportResult(motivo);
    } catch {
      setReportResult('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-ucc-cyan flex justify-center">
      {/* Overlay de sanción — aparece cuando llega a MAX_FALLAS */}
      {totalFallasReal >= MAX_FALLAS && (
        <PantallaBloqueo
          nombre={user.nombre_completo}
          onAction={() => navigate('/login')}
          actionLabel="Salir"
        />
      )}

      <div className="w-full max-w-md flex flex-col relative">

        {/* ── Cabecera con botón volver ── */}
        <div className="relative">
          <button
            onClick={() => navigate('/login')}
            className="absolute top-4 left-4 z-10 flex items-center gap-1.5 text-white text-sm font-medium"
          >
            ← Volver
          </button>
          <p className="absolute top-4 right-4 z-10 text-white text-sm font-semibold">
            Control de Acceso
          </p>
          <ProfileHeader user={user} />
        </div>

        {/* ── Contenido scrolleable ── */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">

          {/* Tarjeta de información personal */}
          <PersonalInfoCard user={user} />

          {/* Tarjetas por cada rol activo */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center text-sm text-gray-400">
              Cargando roles...
            </div>
          ) : (
            user.roles.map((rol) => {
              const infoMap = {
                Estudiante:  user.info_estudiante,
                Empleado:    user.info_empleado,
                Contratista: user.info_contratista,
              };
              return (
                <RoleInfoCard key={rol} rol={rol} info={infoMap[rol]} />
              );
            })
          )}

          {/* Historial de fallas — solo se muestra si tiene al menos 1 */}
          <FallasHistory
            fallas={profileData?.fallas ?? []}
            totalFallas={totalFallasReal}
          />

          {/* Aviso Sin Carnet */}
          <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-4 flex gap-3">
            <span className="text-yellow-500 text-xl flex-shrink-0"></span>
            <p className="text-sm text-yellow-800 leading-relaxed">
              <span className="font-bold">Sin carnet —</span>{' '}
               Reporta el estado de la Tarjeta de 
              Identificación personal (TIP).
            </p>
          </div>

          {/* Resultado del reporte (feedback visual) */}
          {reportResult && reportResult !== 'error' && (
            <div className="rounded-2xl p-4 text-center font-semibold text-sm bg-green-50 border border-green-300 text-ucc-green">
              ✅ Falla registrada correctamente.
            </div>
          )}
          {reportResult === 'error' && (
            <div className="rounded-2xl p-4 text-center font-semibold text-sm bg-red-50 border border-red-300 text-red-700">
              Error al registrar el reporte. Inténtalo de nuevo.
            </div>
          )}

          {/* Espaciado para que el botón fijo no tape contenido */}
          <div className="h-20" />
        </div>

        {/* ── Botón Reportar TIP fijo abajo ── */}
        <div className="sticky bottom-0 bg-gradient-to-t from-ucc-cyan/60 to-transparent pt-4 pb-6 px-4">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full py-4 bg-red-600 hover:bg-red-700 active:bg-red-700 text-white font-bold text-base rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-2"
          >
             Reportar TIP
          </button>
        </div>

      </div>

      {/* ── Modal ── */}
      <ReportTIPModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmReport}
        nombreUsuario={user.nombre_completo}
      />
    </div>
  );
};
