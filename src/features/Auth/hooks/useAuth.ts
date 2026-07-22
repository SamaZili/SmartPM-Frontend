import { useState, useCallback } from 'react';
import { authApi, LoginDto, RegisterDto } from '../api/authApi';
import { User } from '../../../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const extractUserFromToken = useCallback((token: string): User | null => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      
      return {
        id: payload.sub || payload.id || 1,
        name: payload.name || 'Utilisateur',
        email: payload.email || '',
        type: payload.type || 'chef_de_projet',
        email_verified_at: payload.email_verified_at || null,
        created_at: payload.created_at || new Date().toISOString(),
        updated_at: payload.updated_at || new Date().toISOString(),
      };
    } catch (err) {
      console.error('Erreur décodage token:', err);
      return null;
    }
  }, []);

  const login = useCallback(async (data: LoginDto) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authApi.login(data);
      if (response.success && response.data) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        
        const extractedUser = extractUserFromToken(token);
        const finalUser = response.data.user || extractedUser;
        
        if (finalUser) {
          localStorage.setItem('user', JSON.stringify(finalUser));
          setUser(finalUser);
        }
        
        return response.data;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur de connexion';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [extractUserFromToken]);

  const register = useCallback(async (data: RegisterDto) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authApi.register(data);
      if (response.success && response.data) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        
        const extractedUser = extractUserFromToken(token);
        const finalUser = response.data.user || extractedUser;
        
        if (finalUser) {
          localStorage.setItem('user', JSON.stringify(finalUser));
          setUser(finalUser);
        }
        
        return response.data;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur d\'inscription';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [extractUserFromToken]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return { user, isLoading, error, login, register, logout };
}