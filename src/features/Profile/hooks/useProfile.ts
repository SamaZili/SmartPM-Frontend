import { useState, useEffect, useCallback } from 'react';
import { profileApi } from '../api/profileApi';
import { User, UpdateProfileDto } from '../../../types';

export function useProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const getUserFromStorage = useCallback((): User | null => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.error('Erreur lecture user storage:', err);
    }
    return null;
  }, []);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError('');
    
    // Récupérer depuis localStorage
    const storedUser = getUserFromStorage();
    if (storedUser) {
      setUser(storedUser);
    } else {
      // Fallback : décoder le token
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const fallbackUser: User = {
            id: payload.sub || payload.id || 1,
            name: payload.name || 'Utilisateur',
            email: payload.email || '',
            type: payload.type || 'chef_de_projet',
            email_verified_at: null,
            created_at: '',
            updated_at: '',
          };
          setUser(fallbackUser);
          localStorage.setItem('user', JSON.stringify(fallbackUser));
        } catch (err) {
          console.error('Erreur décodage token profil:', err);
        }
      }
    }
    
    // Essayer l'API (silencieux)
    try {
      const response = await profileApi.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (err) {
      // Silencieux - on garde les données locales
    } finally {
      setIsLoading(false);
    }
  }, [getUserFromStorage]);

  const updateProfile = useCallback(async (data: UpdateProfileDto) => {
    try {
      const response = await profileApi.updateProfile(data);
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      }
    } catch (err) {
      // Mise à jour locale silencieuse
      if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
  }, [user]);

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