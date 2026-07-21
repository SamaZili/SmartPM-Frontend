import { useState, useCallback } from 'react';
import { authApi, LoginDto, RegisterDto } from '../api/authApi';
import { User } from '../../../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const login = useCallback(async (data: LoginDto) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authApi.login(data);
      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return response.data;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur de connexion';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterDto) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authApi.register(data);
      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return response.data;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur d\'inscription';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  return { user, isLoading, error, login, register, logout };
}