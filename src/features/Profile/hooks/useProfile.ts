import { useState, useEffect, useCallback } from 'react';
import { profileApi, UpdateProfileDto } from '../api/profileApi';
import { User } from '../../../types';

export function useProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await profileApi.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Impossible de charger le profil.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileDto) => {
    try {
      const response = await profileApi.updateProfile(data);
      if (response.success && response.data) {
        setUser(response.data);
        return response.data;
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erreur lors de la mise à jour.');
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { 
    user, 
    isLoading, 
    error, 
    fetchProfile, 
    updateProfile 
  };
}