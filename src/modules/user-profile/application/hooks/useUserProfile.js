import { useState, useEffect, useCallback } from 'react';
import { UserProfileRepositoryImpl } from '../../infrastructure/repositories/UserProfileRepositoryImpl';

const repository = new UserProfileRepositoryImpl();

export const useUserProfile = (idInstitucional) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [refreshKey, setRefreshKey]   = useState(0);

  useEffect(() => {
    if (!idInstitucional) { setLoading(false); return; }

    let cancelled = false;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await repository.getProfileData(idInstitucional);
        if (!cancelled) setProfileData(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, [idInstitucional, refreshKey]);

  // Registra una falla y refresca los datos automáticamente
  const reportarFalla = useCallback(async (motivo) => {
    await repository.registrarFalla(idInstitucional, motivo);
    setRefreshKey((k) => k + 1);
  }, [idInstitucional]);

  return { profileData, loading, error, reportarFalla };
};
